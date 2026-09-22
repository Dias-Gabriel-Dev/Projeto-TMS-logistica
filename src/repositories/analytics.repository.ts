import { prisma, Status } from '../prisma.js';

export const getCouriersCountByStatus = async () => {
  return prisma.courier.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
  });
};

export const getDeliveriesCountsByStatus = async () => {
  return prisma.delivery.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
  });
};

export const getTotalFreightRevenue = async () => {
  return prisma.delivery.aggregate({
    _sum: {
      freightCost: true,
    },
  });
};

export const getDeliveriesWithRoutes = async () => {
  return prisma.delivery.findMany({
    where: {
      status: Status.DELIVERED,
    },
    include: {
      route: true,
    },
  });
};

export const getCourierRanking = async () => {
  return prisma.delivery.groupBy({
    by: ['courierId'],
    where: {
      status: Status.DELIVERED,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 5,
  });
};
