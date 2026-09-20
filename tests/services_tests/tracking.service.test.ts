import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '../../../generated/prisma/client.js';

const prismaMock = mockDeep<PrismaClient>();

jest.unstable_mockModule('../../src/prisma.js', () => ({
  __esModule: true,
  prisma: prismaMock,
}));

let trackingService: any;
try {
  trackingService = await import('../../src/services/tracking.service.js');
} catch (e) {
  // Red phase
}

describe('TrackingService (Rastreamento Público)', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('getTrackingByCode', () => {
    it('deve lançar erro se o código de rastreio não for encontrado', async () => {
      prismaMock.delivery.findUnique.mockResolvedValue(null);

      await expect(
        trackingService.getTrackingByCode('LOG-INEXISTENTE')
      ).rejects.toThrow('Código de rastreio não encontrado');
    });

    it('deve retornar dados públicos da entrega com lista cronológica de eventos', async () => {
      const mockDelivery = {
        id: 'delivery-uuid-1',
        trackingCode: 'LOG-AB12CD',
        status: 'IN_TRANSIT' as const,
        routeId: 'route-uuid-1',
        driverId: 'driver-uuid-1',
        vehicleId: 'vehicle-uuid-1',
        createdAt: new Date('2026-09-01T10:00:00Z'),
        updatedAt: new Date('2026-09-01T11:00:00Z'),
        finishedAt: null,
        route: {
          id: 'route-uuid-1',
          origin: 'São Paulo - SP',
          destination: 'Campinas - SP',
          estimatedDistance: 95.5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        events: [
          {
            id: 'event-1',
            deliveryId: 'delivery-uuid-1',
            status: 'PENDING' as const,
            description: 'Entrega registrada no sistema e aguardando despacho',
            createdAt: new Date('2026-09-01T10:00:00Z'),
          },
          {
            id: 'event-2',
            deliveryId: 'delivery-uuid-1',
            status: 'IN_TRANSIT' as const,
            description: 'Em trânsito para o destino',
            createdAt: new Date('2026-09-01T11:00:00Z'),
          },
        ],
      };

      (prismaMock.delivery.findUnique as any).mockResolvedValue(mockDelivery);

      const result = await trackingService.getTrackingByCode('LOG-AB12CD');

      expect(result).toHaveProperty('trackingCode', 'LOG-AB12CD');
      expect(result.status).toBe('IN_TRANSIT');
      expect(result.route.origin).toBe('São Paulo - SP');
      expect(result.events).toHaveLength(2);
      expect(result.events[0].status).toBe('PENDING');
      expect(result.events[1].status).toBe('IN_TRANSIT');

      expect(prismaMock.delivery.findUnique).toHaveBeenCalledWith({
        where: { trackingCode: 'LOG-AB12CD' },
        include: {
          route: true,
          events: { orderBy: { createdAt: 'asc' } },
        },
      });
    });
  });
});
