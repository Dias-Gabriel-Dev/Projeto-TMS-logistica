import { calculateFreight } from '../../src/utils/freight.util';

describe('Freight Utility - calculateFreight', () => {
  it('should correctly calculate the freight cost with standard values', () => {
    // estimatedDistance = 100, cargoWeight = 10
    // 50.00 + (100 * 2.50) + (10 * 0.50) = 50 + 250 + 5 = 305
    const result = calculateFreight(100, 10);
    expect(result).toBe(305);
  });

  it('should calculate base cost for zero distance and zero weight', () => {
    // 50.00 + (0 * 2.50) + (0 * 0.50) = 50
    const result = calculateFreight(0, 0);
    expect(result).toBe(50);
  });

  it('should calculate only with weight (no distance)', () => {
    // 50.00 + (0 * 2.50) + (20 * 0.50) = 50 + 0 + 10 = 60
    const result = calculateFreight(0, 20);
    expect(result).toBe(60);
  });

  it('should calculate only with distance (no weight)', () => {
    // 50.00 + (10 * 2.50) + (0 * 0.50) = 50 + 25 + 0 = 75
    const result = calculateFreight(10, 0);
    expect(result).toBe(75);
  });
});
