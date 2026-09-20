import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../src/middlewares/authMiddleware.js';

describe('authMiddleware', () => {
  const secret = process.env.JWT_SECRET || 'default_jwt_secret';

  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should return 401 if Authorization header is missing', async () => {
    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token de autenticação não fornecido',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid or malformed', async () => {
    req.headers.authorization = 'Bearer token_invalido_123';

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token inválido ou expirado',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and attach user to req if token is valid', async () => {
    const payload = { id: 'user-1', email: 'user@logistica.com', role: 'OPERATOR' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    req.headers.authorization = `Bearer ${token}`;

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('user-1');
    expect(req.user.email).toBe('user@logistica.com');
    expect(req.user.role).toBe('OPERATOR');
  });
});
