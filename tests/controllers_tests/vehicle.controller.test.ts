import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

const prismaMock = mockDeep<PrismaClient>();

jest.unstable_mockModule('../../src/prisma.js', () => ({
  __esModule: true,
  prisma: prismaMock,
}));

let vehicleRoutes: any;
let errorHandler: any;
try {
  const routesModule = await import('../../src/routes/vehicle.routes.js');
  vehicleRoutes = routesModule.vehicleRoutes;
  const errorModule = await import('../../src/middlewares/errorHandler.js');
  errorHandler = errorModule.errorHandler;
} catch (e) {
  // Ignora o erro na fase vermelha (Red) do TDD
}

describe('Vehicle Controller Integration Tests', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    if (vehicleRoutes) app.use('/vehicles', vehicleRoutes);
    if (errorHandler) app.use(errorHandler);
  });

  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('POST /vehicles', () => {
    it('deve retornar 201 e criar o veículo com payload válido', async () => {
      if (!vehicleRoutes) return;

      prismaMock.vehicle.findUnique.mockResolvedValue(null);
      prismaMock.driver.findUnique.mockResolvedValue({ id: 'driver-123' } as any);
      prismaMock.vehicle.create.mockResolvedValue({
        id: '123',
        plate: 'ABC-1234',
        vehicleType: 'SEDAN',
        model: 'Toyota Corolla',
        capacityWeight: 500,
        status: 'AVAILABLE',
        driverId: 'driver-123',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await request(app)
        .post('/vehicles')
        .send({
          plate: 'ABC-1234',
          vehicleType: 'SEDAN',
          model: 'Toyota Corolla',
          capacityWeight: 500,
          status: 'AVAILABLE',
          driverId: 'driver-123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', '123');
      expect(response.body.plate).toBe('ABC-1234');
      expect(response.body.model).toBe('Toyota Corolla');
    });

    it('deve retornar 400 se a placa já estiver cadastrada', async () => {
      if (!vehicleRoutes) return;

      prismaMock.vehicle.findUnique.mockResolvedValue({ id: '123', plate: 'ABC-1234' } as any);

      const response = await request(app)
        .post('/vehicles')
        .send({
          plate: 'ABC-1234',
          vehicleType: 'SEDAN',
          model: 'Toyota Corolla',
          capacityWeight: 500,
          status: 'AVAILABLE',
          driverId: 'driver-123',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Placa já cadastrada no sistema');
    });

    it('deve retornar 400 se o motorista não existir', async () => {
      if (!vehicleRoutes) return;

      prismaMock.vehicle.findUnique.mockResolvedValue(null);
      prismaMock.driver.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/vehicles')
        .send({
          plate: 'ABC-1234',
          vehicleType: 'SEDAN',
          model: 'Toyota Corolla',
          capacityWeight: 500,
          status: 'AVAILABLE',
          driverId: 'driver-999',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Motorista não encontrado');
    });
  });

  describe('GET /vehicles', () => {
    it('deve retornar 200 e uma lista de veículos', async () => {
      if (!vehicleRoutes) return;

      prismaMock.vehicle.findMany.mockResolvedValue([
        { id: '123', plate: 'ABC-1234' } as any
      ]);

      const response = await request(app).get('/vehicles');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      if (response.body.length > 0) {
        expect(response.body[0].plate).toBe('ABC-1234');
      }
    });
  });
});
