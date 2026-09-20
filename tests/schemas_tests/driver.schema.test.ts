import { driverSchema } from '../../src/schemas/driver.schema.js';

describe('Driver Validation (Zod)', () => {
  it('should validate a correct driver payload', () => {
    const validDriver = {
      name: 'João da Silva',
      document: '12345678901',
      licenseNumber: '12345678901',
      status: 'AVAILABLE',
    };

    expect(() => driverSchema.parse(validDriver)).not.toThrow();
  });

  it('should reject a licenseNumber with more than 11 digits', () => {
    const invalidDriver = {
      name: 'João',
      document: '12345678901',
      licenseNumber: '123456789012', // 12 digits
      status: 'AVAILABLE',
    };

    expect(() => driverSchema.parse(invalidDriver)).toThrow();
  });

  it('should reject a licenseNumber with non-numeric characters', () => {
    const invalidDriver = {
      name: 'João',
      document: '12345678901',
      licenseNumber: '123456789AA', // Has letters
      status: 'AVAILABLE',
    };

    expect(() => driverSchema.parse(invalidDriver)).toThrow();
  });

  it('should reject invalid status', () => {
    const invalidDriver = {
      name: 'João',
      document: '12345678901',
      licenseNumber: '12345678901',
      status: 'FLYING', // Not in enum
    };

    expect(() => driverSchema.parse(invalidDriver)).toThrow();
  });
});
