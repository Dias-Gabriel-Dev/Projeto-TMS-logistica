import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '../../../generated/prisma/client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prismaMock = mockDeep<PrismaClient>();

jest.unstable_mockModule('../../src/prisma.js', () => ({
  __esModule: true,
  prisma: prismaMock,
}));

const { register, login } = await import('../../src/services/auth.service.js');

describe('AuthService (Regras de Negócio e Segurança)', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('register', () => {
    it('should throw an error if email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Operador',
        email: 'existente@logistica.com',
        password: 'hashed_password',
        role: 'OPERATOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = {
        name: 'Novo Operador',
        email: 'existente@logistica.com',
        password: 'senhaSegura123',
        role: 'OPERATOR' as const,
      };

      await expect(register(input)).rejects.toThrow('Email já cadastrado no sistema');
    });

    it('should hash the password, create user and return user data without password field', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      prismaMock.user.create.mockResolvedValue({
        id: 'user-123',
        name: 'Operador João',
        email: 'joao@logistica.com',
        password: '$2a$10$hashedPasswordFake1234567890',
        role: 'OPERATOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = {
        name: 'Operador João',
        email: 'joao@logistica.com',
        password: 'senhaSegura123',
        role: 'OPERATOR' as const,
      };

      const result = await register(input);

      expect(result).toHaveProperty('id', 'user-123');
      expect(result.email).toBe('joao@logistica.com');
      expect(result.name).toBe('Operador João');
      expect(result.role).toBe('OPERATOR');
      // Segurança: a senha nunca deve ser retornada!
      expect((result as any).password).toBeUndefined();

      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('should throw an error if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const input = {
        email: 'inexistente@logistica.com',
        password: 'qualquerSenha123',
      };

      await expect(login(input)).rejects.toThrow('Credenciais inválidas');
    });

    it('should throw an error if password does not match', async () => {
      const hashedPassword = await bcrypt.hash('senhaCorreta123', 10);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        name: 'Operador João',
        email: 'joao@logistica.com',
        password: hashedPassword,
        role: 'OPERATOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = {
        email: 'joao@logistica.com',
        password: 'senhaErrada999',
      };

      await expect(login(input)).rejects.toThrow('Credenciais inválidas');
    });

    it('should return a valid JWT token and user info on valid credentials', async () => {
      process.env.JWT_SECRET = 'test_secret';
      
      const rawPassword = 'senhaCorreta123';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        name: 'Operador João',
        email: 'joao@logistica.com',
        password: hashedPassword,
        role: 'OPERATOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = {
        email: 'joao@logistica.com',
        password: rawPassword,
      };

      const result = await login(input);

      expect(result).toHaveProperty('token');
      expect(typeof result.token).toBe('string');
      expect(result.user).toEqual({
        id: 'user-123',
        name: 'Operador João',
        email: 'joao@logistica.com',
        role: 'OPERATOR',
      });

      // Valida se o token foi assinado corretamente e contém o payload esperado
      const secret = process.env.JWT_SECRET || 'default_jwt_secret';
      const decoded = jwt.verify(result.token, secret) as any;
      expect(decoded.id).toBe('user-123');
      expect(decoded.email).toBe('joao@logistica.com');
      expect(decoded.role).toBe('OPERATOR');
    });

    it('should fail-fast (throw error) if JWT_SECRET environment variable is missing', async () => {
      const originalJwtSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const rawPassword = 'senhaCorreta123';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        name: 'Operador João',
        email: 'joao@logistica.com',
        password: hashedPassword,
        role: 'OPERATOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const input = {
        email: 'joao@logistica.com',
        password: rawPassword,
      };

      // Limpando o módulo da memória para forçar a reimportação e ler o env novo
      jest.resetModules();
      
      try {
        // Tenta fazer o login sem a env variável JWT_SECRET
        await expect(login(input)).rejects.toThrow();
      } finally {
        // Restaura a env original
        if (originalJwtSecret) {
          process.env.JWT_SECRET = originalJwtSecret;
        }
      }
    });
  });
});
