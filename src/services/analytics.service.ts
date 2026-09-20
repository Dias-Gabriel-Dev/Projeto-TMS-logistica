import { DashBoardMetrics } from '../@types/dashboard.js';
import * as analyticsRepo from '../repositories/analytics.repository.js';
import { Status } from '../prisma.js';

export async function getDashboardMetrics(): Promise<DashBoardMetrics> {
  const [activeDrivers, deliveriesByStatus, totalFreightRevenue, totalMileage, driverRanking] =
    await Promise.all([
      // 1. Motoristas ativos por status
      analyticsRepo.getDriversCountByStatus(),

      // 2. Entregas por status (incluindo PENDING)
      analyticsRepo.getDeliveriesCountsByStatus(),

      // 3. Receita total (soma dos custos de frete de entregas concluídas)
      analyticsRepo.getTotalFreightRevenue(),

      // 4. Quilometragem total (soma das distâncias estimadas de entregas concluídas)
      analyticsRepo.getDeliveriesWithRoutes(),

      // 5. Ranking de motoristas (top 10 por entregas concluídas)
      analyticsRepo.getDriverRanking(),
    ]);

  const initialStatusCount = Object.values(Status).reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<Status, number>,
  );

  // Converte os resultados agrupados para o formato de saída desejado
  const activeDriversFormatted = activeDrivers.reduce(
    (acc, driver) => {
      acc[driver.status] = driver._count.id;
      return acc;
    },
    { ...initialStatusCount },
  );

  const deliveriesByStatusFormatted = deliveriesByStatus.reduce(
    (acc, delivery) => {
      acc[delivery.status] = delivery._count.id;
      return acc;
    },
    { ...initialStatusCount },
  );

  const driverRankingFormatted = driverRanking.map((driver) => ({
    driverId: driver.driverId,
    completedDeliveries: driver._count.id,
  }));

  return {
    activeDrivers: activeDriversFormatted,
    deliveriesByStatus: deliveriesByStatusFormatted,
    totalMileage: totalMileage.reduce((acc, delivery) => acc + delivery.route.estimatedDistance, 0),
    totalFreightRevenue: totalFreightRevenue._sum.freightCost || 0,
    driverRanking: driverRankingFormatted,
  };
}
