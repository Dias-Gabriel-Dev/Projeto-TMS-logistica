import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '../../../generated/prisma/client.js';

const prismaMock = mockDeep<PrismaClient>();

jest.unstable_mockModule('../../src/prisma.js', () => ({
  __esModule: true,
  prisma: prismaMock,
}));

let trackingRoutes: any;
let errorHandler: any;

try {
  const routesModule = await import('../../src/routes/tracking.routes.js');
  trackingRoutes = routesModule.trackingRoutes;
  const errorModule = await import('../../src/middlewares/errorHandler.js');
  errorHandler = errorModule.errorHandler;
} catch (e) {
  // Red phase
}

describe('Tracking Controller Integration Tests (Público)', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    if (trackingRoutes) app.use('/tracking', trackingRoutes);
    if (errorHandler) app.use(errorHandler);
  });

  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('GET /tracking/:code', () => {
    it('deve retornar 200 e a timeline de eventos para um código existente sem exigir autenticação', async () => {
      const mockDelivery = {
        id: 'delivery-uuid-1',
        trackingCode: 'LOG-XYZ123',
        status: 'IN_TRANSIT',
        routeId: 'route-1',
        driverId: 'driver-1',
        vehicleId: 'vehicle-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        finishedAt: null,
        route: {
          origin: 'Curitiba - PR',
          destination: 'Florianópolis - SC',
        },
        events: [
          {
            id: 'event-1',
            status: 'PENDING',
            description: 'Entrega registrada no sistema',
            createdAt: new Date(),
          },
        ],
      };

      (prismaMock.delivery.findUnique as any).mockResolvedValue(mockDelivery);

      // Requisição feita SEM nenhum token de autorização
      const response = await request(app).get('/tracking/LOG-XYZ123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('trackingCode', 'LOG-XYZ123');
      expect(response.body.events).toBeInstanceOf(Array);
      expect(response.body.events).toHaveLength(1);
    });

    it('deve retornar erro se o código de rastreio não existir', async () => {
      prismaMock.delivery.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/tracking/LOG-NAO-EXISTE');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Código de rastreio não encontrado');
    });
  });
});
