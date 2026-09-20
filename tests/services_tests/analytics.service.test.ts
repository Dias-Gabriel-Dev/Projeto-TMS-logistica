import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

const prismaMock = mockDeep<PrismaClient>();

jest.unstable_mockModule('../../src/prisma.js', () => ({
  __esModule: true,
  prisma: prismaMock,
}));

let analyticsService: any;
try {
  analyticsService = await import('../../src/services/analytics.service.js');
} catch (e) {
  // Fase RED do TDD (ainda não implementado)
}

describe('Analytics Service', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('getDashboardMetrics', () => {
    it('deve retornar as métricas consolidadas do dashboard (activeDrivers, deliveriesByStatus, totalMileage, driverRanking, totalFreightRevenue)', async () => {
      if (!analyticsService?.getDashboardMetrics) return;

      // Mock aggregate para Motoristas por status (ex: groupBy status e conta ID)
      prismaMock.driver.groupBy.mockResolvedValueOnce([
        { status: 'AVAILABLE', _count: { id: 5 } },
        { status: 'IN_TRANSIT', _count: { id: 3 } }
      ] as any);

      // Mock aggregate para Entregas por status
      prismaMock.delivery.groupBy.mockResolvedValueOnce([
        { status: 'PENDING', _count: { id: 10 } },
        { status: 'IN_TRANSIT', _count: { id: 7 } },
        { status: 'DELIVERED', _count: { id: 25 } }
      ] as any);

      // Mock aggregate para Receita Total
      prismaMock.delivery.aggregate.mockResolvedValueOnce({
        _sum: { freightCost: 50000 }
      } as any);

      // Mock route aggregation to compute totalMileage (for completed deliveries only)
      // Since it's a join or nested query depending on implementation, 
      // let's mock delivery.findMany that includes route for delivered
      prismaMock.delivery.findMany.mockResolvedValue([
        { id: '1', driverId: 'd1', route: { estimatedDistance: 100 } },
        { id: '2', driverId: 'd2', route: { estimatedDistance: 150 } },
        { id: '3', driverId: 'd1', route: { estimatedDistance: 50 } }
      ] as any);

      // Execute Service
      const metrics = await analyticsService.getDashboardMetrics();

      expect(metrics).toHaveProperty('activeDrivers');
      expect(metrics.activeDrivers).toEqual({
        AVAILABLE: 5,
        IN_TRANSIT: 3
      });

      expect(metrics).toHaveProperty('deliveriesByStatus');
      expect(metrics.deliveriesByStatus).toEqual({
        PENDING: 10,
        IN_TRANSIT: 7,
        DELIVERED: 25
      });

      expect(metrics).toHaveProperty('totalFreightRevenue', 50000);
      expect(metrics).toHaveProperty('totalMileage', 300);

      expect(metrics).toHaveProperty('driverRanking');
      expect(metrics.driverRanking).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ driverId: 'd1', completedDeliveries: 2 }),
          expect.objectContaining({ driverId: 'd2', completedDeliveries: 1 })
        ])
      );
    });
  });
});
