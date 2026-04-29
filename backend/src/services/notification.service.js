const { getFirebaseAdmin } = require('../config/firebase');
const { Notification } = require('../models');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

const notificationService = {
  /**
   * Send push notification via FCM + fallback to Socket.io
   * Also stores in notifications table
   */
  async sendPush(userId, title, body, data = {}, type = 'general') {
    try {
      // 1. Store in DB
      await Notification.create({
        user_id: userId,
        title,
        body,
        type,
        data,
        sent_at: new Date()
      });

      // 2. Try Socket.io first (real-time)
      try {
        const io = getIO();
        io.to(`user:${userId}`).emit('notification', { title, body, data, type });
        logger.info(`Socket notification sent to user:${userId}`);
      } catch (socketErr) {
        logger.warn('Socket.io notification failed:', socketErr.message);
      }

      // 3. Try FCM (for background/killed app)
      try {
        const admin = getFirebaseAdmin();
        if (admin.apps?.length) {
          // Get user's FCM token
          const { User } = require('../models');
          const user = await User.findByPk(userId);
          if (user && user.fcm_token) {
            await admin.messaging().send({
              token: user.fcm_token,
              notification: { title, body },
              data: { ...data, type }
            });
            logger.info(`FCM notification sent to user ${userId}`);
          }
        }
      } catch (fcmErr) {
        logger.warn('FCM notification failed:', fcmErr.message);
      }
    } catch (err) {
      logger.error('Notification service error:', err.message);
    }
  },

  /**
   * Emit socket event to a specific room
   */
  emitToRoom(room, event, data) {
    try {
      const io = getIO();
      io.to(room).emit(event, data);
    } catch (err) {
      logger.warn(`Socket emit to ${room} failed:`, err.message);
    }
  },

  /**
   * Order-specific notification messages (per PRD Section 16)
   */
  async notifyFarmerNewOrder(farmerId, consumerName, qty, productName, total) {
    await this.sendPush(
      farmerId,
      'नया ऑर्डर! / New Order!',
      `${consumerName} has ordered ${qty}kg of ${productName} — ₹${total}`,
      { type: 'new_order' },
      'order_update'
    );
  },

  async notifyConsumerOrderConfirmed(consumerId, farmName) {
    await this.sendPush(
      consumerId,
      'Order Confirmed ✓',
      `Your order from ${farmName} is confirmed. We'll notify when ready!`,
      { type: 'order_confirmed' },
      'order_update'
    );
  },

  async notifyConsumerOutForDelivery(consumerId, deliveryName, otp) {
    await this.sendPush(
      consumerId,
      'Out for Delivery 🚴',
      `${deliveryName} is on the way! OTP: ${otp}`,
      { type: 'out_for_delivery', otp },
      'order_update'
    );
  },

  async notifyConsumerDelivered(consumerId) {
    await this.sendPush(
      consumerId,
      'Delivered ✓',
      'Your fresh produce has arrived! How was it? Leave a review.',
      { type: 'delivered' },
      'order_update'
    );
  },

  async notifyBasketMemberJoined(memberIds, currentFamilies, currentKg, minKg) {
    const body = `${currentFamilies}/10 families joined. ${currentKg}kg / ${minKg}kg target.`;
    for (const memberId of memberIds) {
      await this.sendPush(memberId, 'Basket Update', body, { type: 'basket_member_joined' }, 'basket_update');
    }
  },

  async notifyBasketLocked(memberIds) {
    for (const memberId of memberIds) {
      await this.sendPush(
        memberId,
        '🎉 Basket Ready!',
        'All families joined! Complete your payment now to confirm your order.',
        { type: 'basket_locked' },
        'basket_update'
      );
    }
  }
};

module.exports = notificationService;
