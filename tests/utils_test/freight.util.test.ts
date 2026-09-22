import { calculateFreight } from '../../src/utils/freight.util.js';

describe('Freight Utility - calculateFreight', () => {
  it('should correctly calculate the freight cost with standard values', () => {
    // estimatedDistance = 100
    // 5.00 + (100 * 2.50) = 5 + 250 = 255
    const result = calculateFreight(100);
    expect(result).toBe(255);
  });

  it('should calculate base cost for zero distance', () => {
    // 5.00 + (0 * 2.50) = 5
    const result = calculateFreight(0);
    expect(result).toBe(5);
  });
});
