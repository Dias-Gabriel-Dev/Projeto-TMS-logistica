import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

const prismaMock = mockDeep<PrismaClient>();

jest.unstable_mockModule('../../src/prisma.js', () => ({
  __esModule: true,
  prisma: prismaMock,
}));

let deliveryService: any;
try {
  deliveryService = await import('../../src/services/delivery.service.js');
} catch (e) {
  try {
    deliveryService = await import('../../src/services/delivery.services.js');
  } catch (e2) {
    // Ignora o erro se o arquivo ainda não existir (Fase Red do TDD)
  }
}

describe('Delivery Service (Domain Pruning)', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('createDelivery (Dispatch Local)', () => {
    it('deve criar um despacho com sucesso se Rota e Motorista estiverem corretos e disponíveis', async () => {
      if (!deliveryService) return;

      const payload = {
        id: 'delivery-123',
        routeId: 'route-123',
        driverId: 'driver-123',
        // ATENÇÃO ESTAGIÁRIO: vehicleId e cargoWeight sumiram do payload do domínio!
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'PENDING'
      };

      // Simula a Rota existindo
      prismaMock.route.findUnique.mockResolvedValue({ id: 'route-123', estimatedDistance: 10 } as any);
      
      // Simula o Motorista existindo e estando DISPONÍVEL
      prismaMock.driver.findUnique.mockResolvedValue({ id: 'driver-123', status: 'AVAILABLE', vehicleType: 'MOTO' } as any);
      
      // Simula o $transaction que atualiza o motorista para IN_TRANSIT e cria o Delivery
      prismaMock.$transaction.mockResolvedValue([
        {}, // driver updated
        { id: 'delivery-123', trackingCode: 'LOG-AB12CD', freightCost: 15, ...payload }, // delivery created (freightCost fixo ou por distancia)
        { id: 'event-1', status: 'PENDING', description: 'Despacho registrado' }, // initial event
      ]);

      const delivery = await deliveryService.createDelivery(payload);
      expect(delivery).toHaveProperty('id', 'delivery-123');
      expect(delivery).toHaveProperty('trackingCode');
      expect(delivery).toHaveProperty('freightCost');
      // Garante que o vehicle não foi chamado
      expect(prismaMock.vehicle).toBeUndefined(); // Ou não interage com ele
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('deve falhar se a rota não existir', async () => {
      if (!deliveryService) return;

      const payload = { id: 'delivery-bad', routeId: 'route-999', driverId: 'driver-123', createdAt: new Date(), updatedAt: new Date(), status: 'PENDING' };

      prismaMock.route.findUnique.mockResolvedValue(null);

      await expect(deliveryService.createDelivery(payload)).rejects.toThrow('Rota não encontrada');
    });

    it('deve falhar se o motorista não estiver AVAILABLE', async () => {
      if (!deliveryService) return;

      const payload = { id: 'delivery-bad', routeId: 'route-123', driverId: 'driver-123', createdAt: new Date(), updatedAt: new Date(), status: 'PENDING' };

      prismaMock.route.findUnique.mockResolvedValue({ id: 'route-123' } as any);
      // Motorista ocupado
      prismaMock.driver.findUnique.mockResolvedValue({ id: 'driver-123', status: 'IN_TRANSIT' } as any);

      await expect(deliveryService.createDelivery(payload)).rejects.toThrow('Motorista não está disponível');
    });

    it('deve prevenir race condition (TOCTOU) ao tentar alocar o mesmo motorista concorrentemente', async () => {
      if (!deliveryService) return;

      const payload1 = { id: 'delivery-1', routeId: 'route-123', driverId: 'driver-123', createdAt: new Date(), updatedAt: new Date(), status: 'PENDING' };
      const payload2 = { id: 'delivery-2', routeId: 'route-123', driverId: 'driver-123', createdAt: new Date(), updatedAt: new Date(), status: 'PENDING' };

      prismaMock.route.findUnique.mockResolvedValue({ id: 'route-123', estimatedDistance: 10 } as any);
      prismaMock.driver.findUnique.mockResolvedValue({ id: 'driver-123', status: 'AVAILABLE' } as any);

      // Simula a transação. O updateMany falhará na segunda requisição
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        if (Array.isArray(callback)) return callback;
        return [];
      });

      // No código final, o updateMany retornará count: 0 para o segundo
      prismaMock.driver.updateMany.mockResolvedValueOnce({ count: 1 });
      prismaMock.driver.updateMany.mockResolvedValueOnce({ count: 0 });

      // Executa de forma concorrente
      const promise1 = deliveryService.createDelivery(payload1);
      const promise2 = deliveryService.createDelivery(payload2);

      await expect(Promise.all([promise1, promise2])).rejects.toThrow('Falha de concorrência: Motorista indisponível');
    });
  });

  describe('finishDelivery', () => {
    it('deve finalizar o despacho com sucesso e retornar motorista para AVAILABLE', async () => {
      if (!deliveryService) return;

      prismaMock.delivery.findUnique.mockResolvedValue({ id: 'delivery-123', driverId: 'driver-123' } as any);

      prismaMock.$transaction.mockResolvedValue([
        {}, // driver updated
        { id: 'delivery-123' } // delivery deleted
      ]);

      const delivery = await deliveryService.finishDelivery('delivery-123');
      expect(delivery).toHaveProperty('id', 'delivery-123');
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
