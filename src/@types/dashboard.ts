import { Status } from '../prisma.js';

export interface DashBoardMetrics {
  activeDrivers: Record<Status, number>;
  deliveriesByStatus: Record<Status, number>;
  totalMileage: number;
  driverRanking: { driverId: string; completedDeliveries: number }[];
  totalFreightRevenue: number;
}

export interface Dashboard {
  getDashBoardMetrics: () => Promise<DashBoardMetrics>;
}
