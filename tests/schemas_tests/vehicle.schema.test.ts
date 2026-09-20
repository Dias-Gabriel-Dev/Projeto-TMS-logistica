import { vehicleSchema } from '../../src/schemas/vehicle.schema.js';

describe('Vehicle Validation (Zod)', () => {
  it('should validate a correct vehicle payload with Mercosul plate', () => {
    const validVehicle = {
      driverId: 'qualquer-id',
      plate: 'ABC1D23', // Padrão Mercosul
      model: 'Scania R450',
      vehicleType: 'CARRETA',
      capacityWeight: 35000,
      status: 'AVAILABLE',
    };

    expect(() => vehicleSchema.parse(validVehicle)).not.toThrow();
  });

  it('should validate a correct vehicle payload with Old pattern plate', () => {
    const validVehicle = {
      driverId: 'qualquer-id',
      plate: 'ABC-1234', // Padrão antigo
      model: 'Volvo FH540',
      vehicleType: 'CARRETA',
      capacityWeight: 40000,
      status: 'IN_TRANSIT',
    };

    expect(() => vehicleSchema.parse(validVehicle)).not.toThrow();
  });

  it('should reject completely invalid plates', () => {
    const invalidVehicle = {
      driverId: 'qualquer-id',
      plate: '123ABCD', // Placa errada
      model: 'Scania R450',
      vehicleType: 'CARRETA',
      capacityWeight: 35000,
      status: 'AVAILABLE',
    };

    expect(() => vehicleSchema.parse(invalidVehicle)).toThrow();
  });

  it('should reject negative capacity weight', () => {
    const invalidVehicle = {
      driverId: 'qualquer-id',
      plate: 'ABC1D23',
      model: 'Scania R450',
      vehicleType: 'CARRETA',
      capacityWeight: -500, // Invalido
      status: 'AVAILABLE',
    };

    expect(() => vehicleSchema.parse(invalidVehicle)).toThrow();
  });
});
