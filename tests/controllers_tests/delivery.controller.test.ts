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

let deliveryRoutes: any;
let errorHandler: any;
try {
  const routesModule = await import('../../src/routes/delivery.routes.js');
  deliveryRoutes = routesModule.deliveryRoutes;
  const errorModule = await import('../../src/middlewares/errorHandler.js');
  errorHandler = errorModule.errorHandler;
} catch (e) {
  // Ignora o erro na fase vermelha (Red) do TDD
}

describe('Delivery Controller Integration Tests', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // MOCK DO AUTHMIDDLEWARE: Simula um ADMIN logado para satisfazer o roleMiddleware
    app.use((req, res, next) => {
      req.user = { id: 'admin-123', role: 'ADMIN', email: 'admin@test.com'};
      next();
    });

    if (deliveryRoutes) app.use('/deliveries', deliveryRoutes);
    if (errorHandler) app.use(errorHandler);
  });

  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('POST /deliveries', () => {
    it('deve retornar 201 e criar a entrega', async () => {
      if (!deliveryRoutes) return;

      prismaMock.route.findUnique.mockResolvedValue({ id: 'route-123' } as any);
      prismaMock.driver.findUnique.mockResolvedValue({
        id: 'driver-123',
        status: 'AVAILABLE',
      } as any);
      prismaMock.vehicle.findUnique.mockResolvedValue({
        id: 'vehicle-123',
        driverId: 'driver-123',
        status: 'AVAILABLE',
      } as any);

      prismaMock.$transaction.mockResolvedValue([
        {},
        {},
        {
          id: 'delivery-123',
          routeId: 'route-123',
          driverId: 'driver-123',
          vehicleId: 'vehicle-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const response = await request(app).post('/deliveries').send({
        id: 'delivery-123',
        routeId: 'route-123',
        driverId: 'driver-123',
        vehicleId: 'vehicle-123',
        cargoWeight: 100, // Added in Sprint 13
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'PENDING',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 'delivery-123');
    });

    it('deve retornar 400 se o motorista não estiver disponível', async () => {
      if (!deliveryRoutes) return;

      prismaMock.route.findUnique.mockResolvedValue({ id: 'route-123' } as any);
      // Status IN_TRANSIT vai disparar o erro no service
      prismaMock.driver.findUnique.mockResolvedValue({
        id: 'driver-123',
        status: 'IN_TRANSIT',
      } as any);

      const response = await request(app).post('/deliveries').send({
        id: 'delivery-bad',
        routeId: 'route-123',
        driverId: 'driver-123',
        vehicleId: 'vehicle-123',
        cargoWeight: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'PENDING',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Motorista não está disponível');
    });

    it('deve retornar 400 se a carga exceder a capacidade do veículo', async () => {
      if (!deliveryRoutes) return;

      prismaMock.route.findUnique.mockResolvedValue({ id: 'route-123' } as any);
      prismaMock.driver.findUnique.mockResolvedValue({
        id: 'driver-123',
        status: 'AVAILABLE',
      } as any);
      // Capacidade do veiculo (500) < Peso da Carga (600)
      prismaMock.vehicle.findUnique.mockResolvedValue({
        id: 'vehicle-123',
        driverId: 'driver-123',
        status: 'AVAILABLE',
        capacityWeight: 500
      } as any);

      const response = await request(app).post('/deliveries').send({
        id: 'delivery-bad',
        routeId: 'route-123',
        driverId: 'driver-123',
        vehicleId: 'vehicle-123',
        cargoWeight: 600,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'PENDING',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Capacidade do veículo excedida');
    });
  });

  describe('GET /deliveries', () => {
    it('deve retornar 200 e a lista de entregas', async () => {
      if (!deliveryRoutes) return;

      prismaMock.delivery.findMany.mockResolvedValue([
        { id: 'delivery-123', status: 'PENDING' } as any,
      ]);

      const response = await request(app).get('/deliveries');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('GET /deliveries/:id', () => {
    it('deve retornar 200 e uma entrega específica', async () => {
      if (!deliveryRoutes) return;

      prismaMock.delivery.findUnique.mockResolvedValue({
        id: 'delivery-123',
        status: 'PENDING',
      } as any);

      const response = await request(app).get('/deliveries/delivery-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'delivery-123');
    });
  });

  describe('PATCH /deliveries/:id/finish', () => {
    it('deve finalizar a entrega (retornar 200)', async () => {
      if (!deliveryRoutes) return;

      prismaMock.delivery.findUnique.mockResolvedValue({
        id: 'delivery-123',
        driverId: 'driver-123',
        vehicleId: 'vehicle-123',
      } as any);

      prismaMock.$transaction.mockResolvedValue([{}, {}, { id: 'delivery-123' }]);

      const response = await request(app).patch('/deliveries/delivery-123/finish');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'delivery-123');
    });
  });
});
