import { DashBoardMetrics } from '../@types/dashboard.js';
import * as analyticsRepo from '../repositories/analytics.repository.js';
import { Status } from '../prisma.js';

export async function getDashboardMetrics(): Promise<DashBoardMetrics> {
  const [activeCouriers, deliveriesByStatus, totalFreightRevenue, totalMileage, courierRanking] =
    await Promise.all([
      // 1. Motoristas ativos por status
      analyticsRepo.getCouriersCountByStatus(),

      // 2. Entregas por status (incluindo PENDING)
      analyticsRepo.getDeliveriesCountsByStatus(),

      // 3. Receita total (soma dos custos de frete de entregas concluídas)
      analyticsRepo.getTotalFreightRevenue(),

      // 4. Quilometragem total (soma das distâncias estimadas de entregas concluídas)
      analyticsRepo.getDeliveriesWithRoutes(),

      // 5. Ranking de motoristas (top 10 por entregas concluídas)
      analyticsRepo.getCourierRanking(),
    ]);

  const initialStatusCount = Object.values(Status).reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<Status, number>,
  );

  // Converte os resultados agrupados para o formato de saída desejado
  const activeCouriersFormatted = activeCouriers.reduce(
    (acc, courier) => {
      acc[courier.status] = courier._count.id;
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

  const courierRankingFormatted = courierRanking.map((courier) => ({
    courierId: courier.courierId,
    completedDeliveries: courier._count.id,
  }));

  return {
    activeCouriers: activeCouriersFormatted,
    deliveriesByStatus: deliveriesByStatusFormatted,
    totalMileage: totalMileage.reduce((acc, delivery) => acc + delivery.route.estimatedDistance, 0),
    totalFreightRevenue: totalFreightRevenue._sum.freightCost || 0,
    courierRanking: courierRankingFormatted,
  };
}
