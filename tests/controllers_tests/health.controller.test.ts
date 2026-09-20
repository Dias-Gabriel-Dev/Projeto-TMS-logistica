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

let healthRoutes: any;

try {
  const routesModule = await import('../../src/routes/health.routes.js');
  healthRoutes = routesModule.healthRoutes;
} catch (e) {
  // Fase Red do TDD
}

describe('Health Controller (Probes de Liveness e Readiness)', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    if (healthRoutes) {
      app.use('/health', healthRoutes);
    }
  });

  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('GET /health (Liveness Probe)', () => {
    it('deve retornar status 200 e indicar que o processo está vivo com uptime e timestamp', async () => {
      if (!healthRoutes) {
        throw new Error('healthRoutes não foi exportado em src/routes/health.routes.ts');
      }

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /health/ready (Readiness Probe)', () => {
    it('deve retornar status 200 e status READY quando a conexão com o PostgreSQL for bem-sucedida', async () => {
      if (!healthRoutes) {
        throw new Error('healthRoutes não foi exportado em src/routes/health.routes.ts');
      }

      prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }] as any);

      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'READY',
        database: 'connected',
      });
    });

    it('deve retornar status 503 e status UNAVAILABLE quando o banco de dados falhar ou estiver inacessível', async () => {
      if (!healthRoutes) {
        throw new Error('healthRoutes não foi exportado em src/routes/health.routes.ts');
      }

      prismaMock.$queryRaw.mockRejectedValue(new Error('PostgreSQL connection timeout'));

      const response = await request(app).get('/health/ready');

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('status', 'UNAVAILABLE');
      expect(response.body).toHaveProperty('database', 'disconnected');
      expect(response.body).toHaveProperty('error', 'PostgreSQL connection timeout');
    });
  });
});
