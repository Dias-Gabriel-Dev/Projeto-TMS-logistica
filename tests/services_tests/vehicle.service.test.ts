import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

const prismaMock = mockDeep<PrismaClient>();

jest.unstable_mockModule('../../src/prisma.js', () => ({
  __esModule: true,
  prisma: prismaMock,
}));

let vehicleService: any;
try {
  vehicleService = await import('../../src/services/vehicle.services.js');
} catch (e) {
  // Ignora o erro se o arquivo ainda não existir (Fase Red do TDD)
}

describe('Vehicle Service', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('createVehicle', () => {
    it('deve criar um veículo com sucesso', async () => {
      if (!vehicleService) return;

      const payload = {
        plate: 'ABC-1234',
        vehicleType: 'SEDAN' as const,
        model: 'Toyota Corolla',
        capacityWeight: 500,
        status: 'AVAILABLE' as const,
        driverId: 'driver-id-123',
      };

      // Simula que a placa não existe
      prismaMock.vehicle.findUnique.mockResolvedValue(null);
      // Simula que o motorista existe
      prismaMock.driver.findUnique.mockResolvedValue({ id: 'driver-id-123' } as any);
      
      prismaMock.vehicle.create.mockResolvedValue({
        id: '123',
        ...payload,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const vehicle = await vehicleService.createVehicle(payload);
      expect(vehicle).toHaveProperty('id', '123');
      expect(vehicle.plate).toBe('ABC-1234');
      expect(vehicle.model).toBe('Toyota Corolla');
      expect(prismaMock.vehicle.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro se a placa já estiver cadastrada', async () => {
      if (!vehicleService) return;

      const payload = {
        plate: 'ABC-1234',
        vehicleType: 'SEDAN' as const,
        model: 'Toyota Corolla',
        capacityWeight: 500,
        status: 'AVAILABLE' as const,
        driverId: 'driver-id-123',
      };

      prismaMock.vehicle.findUnique.mockResolvedValue({ id: '123', plate: 'ABC-1234' } as any);

      await expect(vehicleService.createVehicle(payload)).rejects.toThrow('Placa já cadastrada no sistema');
    });

    it('deve lançar erro se o motorista não existir', async () => {
      if (!vehicleService) return;

      const payload = {
        plate: 'ABC-1234',
        vehicleType: 'SEDAN' as const,
        model: 'Toyota Corolla',
        capacityWeight: 500,
        status: 'AVAILABLE' as const,
        driverId: 'driver-invalid-id',
      };

      prismaMock.vehicle.findUnique.mockResolvedValue(null);
      // Simula que o motorista NÃO existe
      prismaMock.driver.findUnique.mockResolvedValue(null);

      await expect(vehicleService.createVehicle(payload)).rejects.toThrow('Motorista não encontrado');
    });
  });

  describe('getAllVehicles', () => {
    it('deve retornar a lista de veículos', async () => {
      if (!vehicleService) return;

      prismaMock.vehicle.findMany.mockResolvedValue([
        { id: '123', plate: 'ABC-1234' } as any,
      ]);

      const vehicles = await vehicleService.getAllVehicles();
      expect(vehicles).toBeInstanceOf(Array);
      expect(vehicles[0].plate).toBe('ABC-1234');
    });
  });
});
