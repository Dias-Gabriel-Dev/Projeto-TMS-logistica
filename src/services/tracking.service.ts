import { prisma } from '../prisma.js';
import { AppError } from '../utils/AppError.js';

const getTrackingByCode = async (code: string) => {
  const delivery = await prisma.delivery.findUnique({
    where: { trackingCode: code },
    include: {
      events: { orderBy: { createdAt: 'asc' } },
      route: true,
    },
  });

  if (!delivery) {
    throw new AppError('Código de rastreio não encontrado', 404);
  }

  return delivery;
};

export { getTrackingByCode };
