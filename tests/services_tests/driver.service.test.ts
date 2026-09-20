import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '../../../generated/prisma/client.js';

// 1. Cria o mock
const prismaMock = mockDeep<PrismaClient>();

// 2. Intercepta a importação do Prisma antes do Service carregar
jest.unstable_mockModule('../../src/prisma.js', () => ({
  __esModule: true,
  prisma: prismaMock,
}));

// 3. Importa o Service dinamicamente APÓS o mock ter sido injetado
const { createDriver } = await import('../../src/services/driver.service.js');

describe('DriverService (Regras de Negócio)', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  it('should throw an error if licenseNumber already exists', async () => {
    // Configura o Mock do banco para fingir que achou um motorista
    prismaMock.driver.findUnique.mockResolvedValue({
      id: '123',
      name: 'Mario',
      document: '12345678901',
      licenseNumber: '99999999999',
      status: 'AVAILABLE',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const newDriverData = {
      name: 'Luigi',
      document: '10987654321',
      licenseNumber: '99999999999',
      status: 'AVAILABLE' as const,
      disponivel: true
    };

    // O Service deve jogar um erro de negócio
    await expect(createDriver(newDriverData)).rejects.toThrow('CNH já cadastrada no sistema');
  });

  it('should create a driver successfully if licenseNumber is unique', async () => {
    // Banco diz que a CNH está livre (null)
    prismaMock.driver.findUnique.mockResolvedValue(null);

    // Simula a criação bem sucedida no banco
    prismaMock.driver.create.mockResolvedValue({
      id: 'abc-123',
      name: 'Luigi',
      document: '10987654321',
      licenseNumber: '88888888888',
      status: 'AVAILABLE',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const newDriverData = {
      name: 'Luigi',
      document: '10987654321',
      licenseNumber: '88888888888',
      status: 'AVAILABLE' as const,
      disponivel: true
    };

    const result = await createDriver(newDriverData);

    expect(result).toHaveProperty('id', 'abc-123');
    expect(result.name).toBe('Luigi');
    
    // O mock verifica se a função create do Prisma foi realmente chamada pela sua aplicação
    expect(prismaMock.driver.create).toHaveBeenCalledTimes(1);
  });
});
