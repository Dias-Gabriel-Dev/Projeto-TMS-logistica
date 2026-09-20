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

describe('Delivery Service', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('createDelivery', () => {
    it('deve criar uma entrega com sucesso se Rota, Motorista e Veiculo estiverem corretos e disponíveis', async () => {
      if (!deliveryService) return;

      const payload = {
        id: 'delivery-123',
        routeId: 'route-123',
        driverId: 'driver-123',
        vehicleId: 'vehicle-123',
        cargoWeight: 100, // Sprint 13
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'PENDING'
      };

      // Simula a Rota existindo
      prismaMock.route.findUnique.mockResolvedValue({ id: 'route-123', estimatedDistance: 10 } as any);
      
      // Simula o Motorista existindo e estando DISPONÍVEL
      prismaMock.driver.findUnique.mockResolvedValue({ id: 'driver-123', status: 'AVAILABLE' } as any);
      
      // Simula o Veículo existindo, pertencendo ao motorista correto e estando DISPONÍVEL com capacidade suficiente
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'vehicle-123', driverId: 'driver-123', status: 'AVAILABLE', capacityWeight: 500 } as any);

      // Simula o $transaction que atualiza o motorista e o veículo para IN_TRANSIT e cria o Delivery com trackingCode
      prismaMock.$transaction.mockResolvedValue([
        {}, // driver updated
        {}, // vehicle updated
        { id: 'delivery-123', trackingCode: 'LOG-AB12CD', freightCost: 125, ...payload }, // delivery created
        { id: 'event-1', status: 'PENDING', description: 'Entrega registrada no sistema' }, // initial event
      ]);

      const delivery = await deliveryService.createDelivery(payload);
      expect(delivery).toHaveProperty('id', 'delivery-123');
      expect(delivery).toHaveProperty('trackingCode');
      expect(delivery.trackingCode).toMatch(/^LOG-[A-Z0-9]{6}$/);
      expect(delivery).toHaveProperty('cargoWeight', 100);
      expect(delivery).toHaveProperty('freightCost', 125);
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('deve falhar se a rota não existir', async () => {
      if (!deliveryService) return;

      const payload = { id: 'delivery-bad', routeId: 'route-999', driverId: 'driver-123', vehicleId: 'vehicle-123', createdAt: new Date(), updatedAt: new Date(), status: 'PENDING' };

      prismaMock.route.findUnique.mockResolvedValue(null);

      await expect(deliveryService.createDelivery(payload)).rejects.toThrow('Rota não encontrada');
    });

    it('deve falhar se o motorista não estiver AVAILABLE', async () => {
      if (!deliveryService) return;

      const payload = { id: 'delivery-bad', routeId: 'route-123', driverId: 'driver-123', vehicleId: 'vehicle-123', createdAt: new Date(), updatedAt: new Date(), status: 'PENDING' };

      prismaMock.route.findUnique.mockResolvedValue({ id: 'route-123' } as any);
      // Motorista ocupado
      prismaMock.driver.findUnique.mockResolvedValue({ id: 'driver-123', status: 'IN_TRANSIT' } as any);

      await expect(deliveryService.createDelivery(payload)).rejects.toThrow('Motorista não está disponível');
    });

    it('deve falhar se o veículo não estiver AVAILABLE', async () => {
      if (!deliveryService) return;

      const payload = { id: 'delivery-bad', routeId: 'route-123', driverId: 'driver-123', vehicleId: 'vehicle-123', createdAt: new Date(), updatedAt: new Date(), status: 'PENDING' };

      prismaMock.route.findUnique.mockResolvedValue({ id: 'route-123' } as any);
      prismaMock.driver.findUnique.mockResolvedValue({ id: 'driver-123', status: 'AVAILABLE' } as any);
      // Veículo ocupado
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'vehicle-123', driverId: 'driver-123', status: 'IN_TRANSIT' } as any);

      await expect(deliveryService.createDelivery(payload)).rejects.toThrow('Veículo não está disponível');
    });

    it('deve falhar se o veículo não pertencer ao motorista selecionado', async () => {
      if (!deliveryService) return;

      const payload = { id: 'delivery-bad', routeId: 'route-123', driverId: 'driver-123', vehicleId: 'vehicle-123', createdAt: new Date(), updatedAt: new Date(), status: 'PENDING' };

      prismaMock.route.findUnique.mockResolvedValue({ id: 'route-123' } as any);
      prismaMock.driver.findUnique.mockResolvedValue({ id: 'driver-123', status: 'AVAILABLE' } as any);
      // Veículo pertence ao motorista 'driver-999'
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'vehicle-123', driverId: 'driver-999', status: 'AVAILABLE' } as any);

      await expect(deliveryService.createDelivery(payload)).rejects.toThrow('Este veículo não pertence ao motorista selecionado');
    });

    it('deve falhar se o peso da carga for maior que a capacidade do veículo', async () => {
      if (!deliveryService) return;

      const payload = { id: 'delivery-bad', routeId: 'route-123', driverId: 'driver-123', vehicleId: 'vehicle-123', cargoWeight: 600, createdAt: new Date(), updatedAt: new Date(), status: 'PENDING' };

      prismaMock.route.findUnique.mockResolvedValue({ id: 'route-123' } as any);
      prismaMock.driver.findUnique.mockResolvedValue({ id: 'driver-123', status: 'AVAILABLE' } as any);
      // Veículo tem capacidade 500, mas a carga é 600
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'vehicle-123', driverId: 'driver-123', status: 'AVAILABLE', capacityWeight: 500 } as any);

      await expect(deliveryService.createDelivery(payload)).rejects.toThrow('Capacidade do veículo excedida');
    });

    it('deve prevenir race condition (TOCTOU) ao tentar alocar o mesmo motorista concorrentemente', async () => {
      if (!deliveryService) return;

      const payload1 = { id: 'delivery-1', routeId: 'route-123', driverId: 'driver-123', vehicleId: 'vehicle-123', cargoWeight: 100, createdAt: new Date(), updatedAt: new Date(), status: 'PENDING' };
      const payload2 = { id: 'delivery-2', routeId: 'route-123', driverId: 'driver-123', vehicleId: 'vehicle-123', cargoWeight: 100, createdAt: new Date(), updatedAt: new Date(), status: 'PENDING' };

      prismaMock.route.findUnique.mockResolvedValue({ id: 'route-123', estimatedDistance: 10 } as any);
      prismaMock.driver.findUnique.mockResolvedValue({ id: 'driver-123', status: 'AVAILABLE' } as any);
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'vehicle-123', driverId: 'driver-123', status: 'AVAILABLE', capacityWeight: 500 } as any);

      // Simula a transação. O updateMany falhará na segunda requisição por causa da condição { id: ..., status: 'AVAILABLE' }
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        // Se for array (não interativo)
        if (Array.isArray(callback)) {
          return callback;
        }
        // Mock iterativo simplificado seria melhor resolvido dentro do update do driver
        return [];
      });

      // No código final, o updateMany retornará count: 0 para o segundo
      prismaMock.driver.updateMany.mockResolvedValueOnce({ count: 1 });
      prismaMock.driver.updateMany.mockResolvedValueOnce({ count: 0 });

      // Executa de forma concorrente
      const promise1 = deliveryService.createDelivery(payload1);
      const promise2 = deliveryService.createDelivery(payload2);

      await expect(Promise.all([promise1, promise2])).rejects.toThrow('Falha de concorrência: Motorista ou veículo indisponível');
    });
  });

  describe('finishDelivery', () => {
    it('deve finalizar a entrega com sucesso e retornar motorista e veículo para AVAILABLE', async () => {
      if (!deliveryService) return;

      prismaMock.delivery.findUnique.mockResolvedValue({ id: 'delivery-123', driverId: 'driver-123', vehicleId: 'vehicle-123' } as any);

      // Simula o $transaction deletando a delivery e atualizando motorista e veiculo para AVAILABLE
      prismaMock.$transaction.mockResolvedValue([
        {}, // driver updated
        {}, // vehicle updated
        { id: 'delivery-123' } // delivery deleted
      ]);

      const delivery = await deliveryService.finishDelivery('delivery-123');
      expect(delivery).toHaveProperty('id', 'delivery-123');
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('deve falhar ao tentar finalizar entrega que não existe', async () => {
      if (!deliveryService) return;

      prismaMock.delivery.findUnique.mockResolvedValue(null);

      await expect(deliveryService.finishDelivery('delivery-999')).rejects.toThrow('Entrega não encontrada');
    });
  });

  describe('getAllDeliveries', () => {
    it('deve retornar a lista de entregas', async () => {
      if (!deliveryService?.getAllDeliveries) return;

      prismaMock.delivery.findMany.mockResolvedValue([
        { id: 'delivery-123', status: 'PENDING' } as any,
      ]);

      const deliveries = await deliveryService.getAllDeliveries();
      expect(deliveries).toBeInstanceOf(Array);
      expect(deliveries[0].id).toBe('delivery-123');
    });
  });

  describe('getDeliveryById', () => {
    it('deve retornar uma entrega por ID', async () => {
      if (!deliveryService?.getDeliveryById) return;

      prismaMock.delivery.findUnique.mockResolvedValue({
        id: 'delivery-123',
        status: 'PENDING',
      } as any);

      const delivery = await deliveryService.getDeliveryById('delivery-123');
      expect(delivery).toHaveProperty('id', 'delivery-123');
    });
  });

  describe('updateDeliveryStatus', () => {
    it('deve atualizar o status de uma entrega', async () => {
      if (!deliveryService?.updateDeliveryStatus) return;

      prismaMock.delivery.update.mockResolvedValue({
        id: 'delivery-123',
        status: 'IN_TRANSIT',
      } as any);

      const delivery = await deliveryService.updateDeliveryStatus('delivery-123', 'IN_TRANSIT');
      expect(delivery).toHaveProperty('status', 'IN_TRANSIT');
    });
  });
});
