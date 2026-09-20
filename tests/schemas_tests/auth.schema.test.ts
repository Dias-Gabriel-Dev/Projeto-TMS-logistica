import { registerSchema, loginSchema } from '../../src/schemas/auth.schema.js';

describe('Auth Validation (Zod)', () => {
  describe('registerSchema', () => {
    it('should validate a correct register payload with default role', () => {
      const validPayload = {
        name: 'Operador Logístico',
        email: 'operador@logistica.com',
        password: 'senhaSegura123',
      };

      const result = registerSchema.parse(validPayload);
      expect(result.name).toBe(validPayload.name);
      expect(result.email).toBe(validPayload.email);
      expect(result.password).toBe(validPayload.password);
    });

    it('should validate a correct register payload with explicit ADMIN role', () => {
      const validPayload = {
        name: 'Admin Logístico',
        email: 'admin@logistica.com',
        password: 'senhaSuperSegura',
        role: 'ADMIN',
      };

      const result = registerSchema.parse(validPayload);
      expect(result.role).toBe('ADMIN');
    });

    it('should reject invalid email format', () => {
      const invalidPayload = {
        name: 'Operador',
        email: 'email-invalido-sem-arroba',
        password: 'senhaSegura123',
      };

      expect(() => registerSchema.parse(invalidPayload)).toThrow();
    });

    it('should reject password with less than 6 characters', () => {
      const invalidPayload = {
        name: 'Operador',
        email: 'operador@logistica.com',
        password: '123',
      };

      expect(() => registerSchema.parse(invalidPayload)).toThrow();
    });

    it('should reject empty name', () => {
      const invalidPayload = {
        name: '',
        email: 'operador@logistica.com',
        password: 'senhaSegura123',
      };

      expect(() => registerSchema.parse(invalidPayload)).toThrow();
    });

    it('should reject invalid role', () => {
      const invalidPayload = {
        name: 'Operador',
        email: 'operador@logistica.com',
        password: 'senhaSegura123',
        role: 'SUPERUSER', // Not in Role enum
      };

      expect(() => registerSchema.parse(invalidPayload)).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should validate a correct login payload', () => {
      const validPayload = {
        email: 'operador@logistica.com',
        password: 'senhaSegura123',
      };

      expect(() => loginSchema.parse(validPayload)).not.toThrow();
    });

    it('should reject login with invalid email format', () => {
      const invalidPayload = {
        email: 'email-errado',
        password: 'senhaSegura123',
      };

      expect(() => loginSchema.parse(invalidPayload)).toThrow();
    });

    it('should reject login with missing password', () => {
      const invalidPayload = {
        email: 'operador@logistica.com',
      };

      expect(() => loginSchema.parse(invalidPayload)).toThrow();
    });
  });
});
