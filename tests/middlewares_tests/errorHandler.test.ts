import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/middlewares/errorHandler.js';
import { AppError } from '../../src/utils/AppError.js';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve formatar AppError corretamente e repassar o status code', () => {
    const error = new AppError('Erro de Negócio', 400);

    errorHandler(error as any, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Erro de Negócio',
    });
  });

  it('deve blindar vazamento de mensagens originais do Prisma e SQL constraints, retornando erro genérico (500)', () => {
    // Simulando um erro nativo que vazaria internals (ex: erro de driver do DB ou prisma)
    const error = new Error('Unique constraint failed on the fields: (`email`)');
    (error as any).code = 'P2002'; // Simulando PrismaError

    // Mockando console.error para não poluir o output do jest
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(error as any, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal server error',
    });

    // Garante que a mensagem vazada NÃO está no payload
    expect(mockResponse.json).not.toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Unique constraint failed'),
    }));

    // Verifica que o erro real foi logado no console (para observabilidade interna)
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});
