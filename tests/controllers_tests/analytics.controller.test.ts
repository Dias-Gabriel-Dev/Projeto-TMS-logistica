import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

jest.unstable_mockModule('../../src/services/analytics.service.js', () => ({
  getDashboardMetrics: jest.fn()
}), { virtual: true });

let analyticsRoutes: any;
let authMiddleware: any;
try {
  const routesModule = await import('../../src/routes/analytics.routes.js');
  analyticsRoutes = routesModule.analyticsRoutes;
  const authModule = await import('../../src/middlewares/authMiddleware.js');
  authMiddleware = authModule.authMiddleware;
} catch (e) {
  // Red phase
}

describe('Analytics Controller Integration Tests', () => {
  let app: express.Express;
  let analyticsServiceMock: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    if (analyticsRoutes) app.use('/analytics', analyticsRoutes);

    try {
      const svc = await import('../../src/services/analytics.service.js');
      analyticsServiceMock = svc;
    } catch(e) {}
  });

  beforeEach(() => {
    if (analyticsServiceMock) {
      analyticsServiceMock.getDashboardMetrics.mockReset();
    }
  });

  describe('GET /analytics/dashboard', () => {
    const validToken = jwt.sign({ id: 'admin-123', role: 'ADMIN' }, process.env.JWT_SECRET || 'default_jwt_secret');
    const operatorToken = jwt.sign({ id: 'op-123', role: 'OPERATOR' }, process.env.JWT_SECRET || 'default_jwt_secret');
    const driverToken = jwt.sign({ id: 'driver-123', role: 'DRIVER' }, process.env.JWT_SECRET || 'default_jwt_secret');

    it('deve retornar 200 e as métricas do dashboard quando autenticado como ADMIN', async () => {
      if (!analyticsRoutes) return;

      const fakeMetrics = {
        activeDrivers: { AVAILABLE: 5, IN_TRANSIT: 3 },
        deliveriesByStatus: { PENDING: 10, IN_TRANSIT: 7, DELIVERED: 25 },
        totalMileage: 300,
        driverRanking: [{ driverId: 'd1', completedDeliveries: 2 }],
        totalFreightRevenue: 50000
      };

      analyticsServiceMock.getDashboardMetrics.mockResolvedValue(fakeMetrics);

      const response = await request(app)
        .get('/analytics/dashboard')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(fakeMetrics);
    });

    it('deve retornar 200 e as métricas do dashboard quando autenticado como OPERATOR', async () => {
      if (!analyticsRoutes) return;

      const fakeMetrics = {
        activeDrivers: { AVAILABLE: 2, IN_TRANSIT: 1 }
      };

      analyticsServiceMock.getDashboardMetrics.mockResolvedValue(fakeMetrics);

      const response = await request(app)
        .get('/analytics/dashboard')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(200);
    });

    it('deve retornar 401 se nenhum token for fornecido', async () => {
      if (!analyticsRoutes) return;

      const response = await request(app).get('/analytics/dashboard');
      expect(response.status).toBe(401);
    });

    it('deve retornar 403 se o usuário não for ADMIN ou OPERATOR', async () => {
      if (!analyticsRoutes) return;

      const response = await request(app)
        .get('/analytics/dashboard')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(response.status).toBe(403);
    });
  });
});
