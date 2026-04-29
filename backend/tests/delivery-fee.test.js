const { getFeeForDistance } = require('../src/services/delivery-fee.service');

describe('Delivery Fee Calculation', () => {
  test('0-3 km should be ₹15', () => {
    expect(getFeeForDistance(0)).toBe(15);
    expect(getFeeForDistance(1)).toBe(15);
    expect(getFeeForDistance(3)).toBe(15);
  });

  test('3-7 km should be ₹25', () => {
    expect(getFeeForDistance(3.1)).toBe(25);
    expect(getFeeForDistance(5)).toBe(25);
    expect(getFeeForDistance(7)).toBe(25);
  });

  test('7-15 km should be ₹35', () => {
    expect(getFeeForDistance(7.1)).toBe(35);
    expect(getFeeForDistance(10)).toBe(35);
    expect(getFeeForDistance(15)).toBe(35);
  });

  test('15-25 km should be ₹50', () => {
    expect(getFeeForDistance(15.1)).toBe(50);
    expect(getFeeForDistance(20)).toBe(50);
    expect(getFeeForDistance(25)).toBe(50);
  });

  test('>25 km should be ₹50 + ₹2 per km beyond 25', () => {
    expect(getFeeForDistance(26)).toBe(52);
    expect(getFeeForDistance(30)).toBe(60);
    expect(getFeeForDistance(50)).toBe(100);
  });
});

describe('Order Total Calculation', () => {
  test('should calculate correct subtotal, fees, and total', () => {
    const quantity = 5;
    const pricePerKg = 40;
    const platformFeePercent = 5;

    const subtotal = quantity * pricePerKg;
    const platformFee = subtotal * platformFeePercent / 100;
    const deliveryFee = getFeeForDistance(10); // 35 for 7-15km
    const total = subtotal + platformFee + deliveryFee;

    expect(subtotal).toBe(200);
    expect(platformFee).toBe(10);
    expect(deliveryFee).toBe(35);
    expect(total).toBe(245);
  });
});
