import { driverSchema } from '../../src/schemas/driver.schema.js';

describe('Driver Validation (Zod)', () => {
  it('should validate a correct driver payload', () => {
    const validDriver = {
      name: 'João da Silva',
      document: '12345678901',
      licenseNumber: '12345678901',
      vehicleType: 'MOTO',
    };

    expect(() => driverSchema.parse(validDriver)).not.toThrow();
  });

  it('should reject a licenseNumber with more than 11 digits', () => {
    const invalidDriver = {
      name: 'João',
      document: '12345678901',
      licenseNumber: '123456789012',
      vehicleType: 'MOTO',
    };

    expect(() => driverSchema.parse(invalidDriver)).toThrow();
  });

  it('should reject a licenseNumber with non-numeric characters', () => {
    const invalidDriver = {
      name: 'João',
      document: '12345678901',
      licenseNumber: '123456789AA',
      vehicleType: 'MOTO',
    };

    expect(() => driverSchema.parse(invalidDriver)).toThrow();
  });

  it('should reject invalid vehicleType', () => {
    const invalidDriver = {
      name: 'João',
      document: '12345678901',
      licenseNumber: '12345678901',
      vehicleType: 'CARRO', // Not in enum
    };

    expect(() => driverSchema.parse(invalidDriver)).toThrow();
  });
});
