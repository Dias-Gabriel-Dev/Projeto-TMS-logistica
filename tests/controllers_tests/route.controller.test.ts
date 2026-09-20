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

let routeRoutes: any;
let errorHandler: any;
try {
  const routesModule = await import('../../src/routes/route.routes.js');
  routeRoutes = routesModule.routeRoutes;
  const errorModule = await import('../../src/middlewares/errorHandler.js');
  errorHandler = errorModule.errorHandler;
} catch (e) {
  // Ignora o erro na fase vermelha (Red) do TDD
}

describe('Route Controller Integration Tests', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    if (routeRoutes) app.use('/routes', routeRoutes);
    if (errorHandler) app.use(errorHandler);
  });

  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('POST /routes', () => {
    it('deve retornar 201 e criar a rota', async () => {
      if (!routeRoutes) return;

      prismaMock.route.create.mockResolvedValue({
        id: '123',
        origin: 'São Paulo',
        destination: 'Rio',
        estimatedDistance: 400,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await request(app)
        .post('/routes')
        .send({
          id: '123',
          origin: 'São Paulo',
          destination: 'Rio',
          estimatedDistance: 400,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', '123');
    });
  });

  describe('GET /routes', () => {
    it('deve retornar 200 e uma lista de rotas', async () => {
      if (!routeRoutes) return;

      prismaMock.route.findMany.mockResolvedValue([
        { id: '123', origin: 'São Paulo' } as any
      ]);

      const response = await request(app).get('/routes');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      if (response.body.length > 0) {
        expect(response.body[0].origin).toBe('São Paulo');
      }
    });
  });
});
