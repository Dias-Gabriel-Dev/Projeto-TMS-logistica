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

let driverRoutes: any;
let errorHandler: any;
try {
  const routesModule = await import('../../src/routes/driver.routes.js');
  driverRoutes = routesModule.driverRoutes;
  const errorModule = await import('../../src/middlewares/errorHandler.js');
  errorHandler = errorModule.errorHandler;
} catch (e) {}

describe('Driver Controller Integration Tests', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    if (driverRoutes) app.use('/drivers', driverRoutes);
    if (errorHandler) app.use(errorHandler);
  });

  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('POST /drivers', () => {
    it('deve retornar 201 e criar o motorista com payload válido', async () => {
      prismaMock.courier.findUnique.mockResolvedValue(null);
      prismaMock.courier.create.mockResolvedValue({
        id: '123',
        name: 'Mario',
        document: '12345678901',
        licenseNumber: '99999999999',
        status: 'AVAILABLE',
        vehicleType: 'MOTO',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await request(app)
        .post('/drivers')
        .send({
          name: 'Mario',
          document: '12345678901',
          licenseNumber: '99999999999',
          vehicleType: 'MOTO'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', '123');
      expect(response.body.name).toBe('Mario');
    });

    it('deve retornar 400 se faltar campos (Erro de Validação Zod)', async () => {
      const response = await request(app)
        .post('/drivers')
        .send({
          name: 'Mario' 
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Erro de Validação (Zod)');
    });

    it('deve retornar 409 se a CNH já estiver cadastrada', async () => {
      prismaMock.courier.findUnique.mockResolvedValue({
        id: '123',
        name: 'Luigi',
        document: '12345678901',
        licenseNumber: '99999999999',
        status: 'AVAILABLE',
        vehicleType: 'MOTO',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await request(app)
        .post('/drivers')
        .send({
          name: 'Mario Novo',
          document: '12345678901',
          licenseNumber: '99999999999',
          vehicleType: 'MOTO'
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('CNH já cadastrada no sistema');
    });
  });

  describe('GET /drivers', () => {
    it('deve retornar 200 e uma lista de motoristas', async () => {
      prismaMock.courier.findMany.mockResolvedValue([
        {
          id: '123',
          name: 'Mario',
          document: '12345678901',
          licenseNumber: '99999999999',
          status: 'AVAILABLE',
          vehicleType: 'MOTO',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      const response = await request(app).get('/drivers');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      if (response.body.length > 0) {
        expect(response.body[0].name).toBe('Mario');
      }
    });
  });
});
