const admin = require('firebase-admin');
const logger = require('../utils/logger');

let firebaseApp;

function initFirebase() {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && process.env.NODE_ENV !== 'development') {
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      logger.info('Firebase Admin initialized');
    } else {
      logger.warn('Firebase Admin not initialized — no service account configured (OK for dev)');
    }
  } catch (err) {
    logger.warn('Firebase Admin init failed:', err.message);
  }
}

function getFirebaseAdmin() {
  return admin;
}

module.exports = { initFirebase, getFirebaseAdmin };
