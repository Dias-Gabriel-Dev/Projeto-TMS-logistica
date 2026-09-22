import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '../../../generated/prisma/client.js';

const prismaMock = mockDeep<PrismaClient>();

jest.unstable_mockModule('../../src/prisma.js', () => ({
  __esModule: true,
  prisma: prismaMock,
}));

const { createDriver } = await import('../../src/services/driver.service.js');

describe('DriverService (Regras de Negócio)', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  it('should throw an error if licenseNumber already exists', async () => {
    prismaMock.courier.findUnique.mockResolvedValue({
      id: '123',
      name: 'Mario',
      document: '12345678901',
      licenseNumber: '99999999999',
      status: 'AVAILABLE',
      vehicleType: 'MOTO',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const newDriverData = {
      name: 'Luigi',
      document: '10987654321',
      licenseNumber: '99999999999',
      vehicleType: 'MOTO' as const
    };

    await expect(createDriver(newDriverData)).rejects.toThrow('CNH já cadastrada no sistema');
  });

  it('should create a driver successfully if licenseNumber is unique', async () => {
    prismaMock.courier.findUnique.mockResolvedValue(null);

    prismaMock.courier.create.mockResolvedValue({
      id: 'abc-123',
      name: 'Luigi',
      document: '10987654321',
      licenseNumber: '88888888888',
      status: 'AVAILABLE',
      vehicleType: 'MOTO',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const newDriverData = {
      name: 'Luigi',
      document: '10987654321',
      licenseNumber: '88888888888',
      vehicleType: 'MOTO' as const
    };

    const result = await createDriver(newDriverData);

    expect(result).toHaveProperty('id', 'abc-123');
    expect(result.name).toBe('Luigi');
    expect(prismaMock.courier.create).toHaveBeenCalledTimes(1);
  });
});
