import { roleMiddleware } from '../../src/middlewares/roleMiddleware.js';
import { Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';

describe('Role Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('deve chamar next() se o usuário tiver a role permitida', () => {
    mockRequest = {
      user: { id: '123', role: 'ADMIN', email: 'admin@test.com' },
    };

    const middleware = roleMiddleware(['ADMIN', 'OPERATOR']);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('deve retornar 403 se o usuário não tiver a role permitida', () => {
    mockRequest = {
      user: { id: '123', role: 'DRIVER', email: 'driver@test.com' },
    };

    const middleware = roleMiddleware(['ADMIN', 'OPERATOR']);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Acesso negado. Usuário sem permissão!' });
  });

  it('deve retornar 403 se req.user não existir', () => {
    mockRequest = {}; // Sem req.user injetado pelo authMiddleware

    const middleware = roleMiddleware(['ADMIN']);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Usuário não autenticado!' });
  });
});
