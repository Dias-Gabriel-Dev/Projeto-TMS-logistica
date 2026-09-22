import { Status } from '../prisma.js';

export interface DashBoardMetrics {
  activeCouriers: Record<Status, number>;
  deliveriesByStatus: Record<Status, number>;
  totalMileage: number;
  courierRanking: { courierId: string; completedDeliveries: number }[];
  totalFreightRevenue: number;
}

export interface Dashboard {
  getDashBoardMetrics: () => Promise<DashBoardMetrics>;
}
