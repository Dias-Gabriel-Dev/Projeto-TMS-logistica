import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '../../../generated/prisma/client.js';
import bcrypt from 'bcryptjs';

const prismaMock = mockDeep<PrismaClient>();

jest.unstable_mockModule('../../src/prisma.js', () => ({
  __esModule: true,
  prisma: prismaMock,
}));

let authRoutes: any;
let errorHandler: any;

try {
  const routesModule = await import('../../src/routes/auth.routes.js');
  authRoutes = routesModule.authRoutes;
  const errorModule = await import('../../src/middlewares/errorHandler.js');
  errorHandler = errorModule.errorHandler;
} catch (e) {
  // Ignore in Red phase
}

describe('Auth Controller Integration Tests', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    if (authRoutes) app.use('/auth', authRoutes);
    if (errorHandler) app.use(errorHandler);
  });

  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('POST /auth/register', () => {
    it('deve retornar 201 e dados do usuário sem senha em caso de sucesso', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-uuid-1',
        name: 'Operador Teste',
        email: 'operador@logistica.com',
        password: '$2a$10$hashedFakePassword',
        role: 'OPERATOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Operador Teste',
          email: 'operador@logistica.com',
          password: 'senhaSegura123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 'user-uuid-1');
      expect(response.body.email).toBe('operador@logistica.com');
      expect(response.body.name).toBe('Operador Teste');
      expect(response.body.password).toBeUndefined();
    });

    it('deve retornar 400 se faltarem campos obrigatórios ou senha curta', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Operador',
          email: 'email-invalido',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Erro de Validação (Zod)');
    });

    it('deve retornar 400 se o email já estiver cadastrado', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'existing-id',
        name: 'Existente',
        email: 'operador@logistica.com',
        password: 'hash',
        role: 'OPERATOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Novo Operador',
          email: 'operador@logistica.com',
          password: 'senhaSegura123',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Email já cadastrado no sistema');
    });
  });

  describe('POST /auth/login', () => {
    it('deve retornar 200 e o token JWT em caso de credenciais válidas', async () => {
      process.env.JWT_SECRET = 'test_secret';
      
      const rawPassword = 'senhaSegura123';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        name: 'Operador Teste',
        email: 'operador@logistica.com',
        password: hashedPassword,
        role: 'OPERATOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'operador@logistica.com',
          password: rawPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.user).toEqual({
        id: 'user-uuid-1',
        name: 'Operador Teste',
        email: 'operador@logistica.com',
        role: 'OPERATOR',
      });
    });

    it('deve retornar 400 se credenciais forem inválidas', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'inexistente@logistica.com',
          password: 'senhaErrada123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Credenciais inválidas');
    });
  });
});
