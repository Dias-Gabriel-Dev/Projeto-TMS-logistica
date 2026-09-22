import { CreateDeliveryTxInput } from '../@types/delivery.js';
import { prisma, Status } from '../prisma.js';
import { AppError } from '../utils/AppError.js';

export const findRouteById = async (id: string) => {
  return prisma.route.findUnique({ where: { id } });
};

export const findCourierById = async (id: string) => {
  return prisma.courier.findUnique({ where: { id } });
};

export const findDeliveryById = async (id: string) => {
  return prisma.delivery.findUnique({ where: { id } });
};

export const findAllDeliveries = async () => {
  return prisma.delivery.findMany();
};

export const updateStatus = async (id: string, status: Status) => {
  return prisma.delivery.update({ where: { id }, data: { status } });
};

export const createWithTransaction = async (data: CreateDeliveryTxInput) => {
  return prisma.$transaction(async (tx) => {
    const courier = await tx.courier.updateMany({
      where: { id: data.courierId, status: Status.AVAILABLE },
      data: { status: Status.IN_TRANSIT },
    });
    if (courier.count === 0) {
      throw new AppError('Motorista indisponível', 409);
    }
    const delivery = await tx.delivery.create({
      data: {
        routeId: data.routeId,
        courierId: data.courierId,
        freightCost: data.freightCost,
        trackingCode: data.trackingCode,
        status: Status.PENDING,
      },
    });
    const event = await tx.deliveryEvent.create({
      data: {
        deliveryId: delivery.id,
        status: Status.PENDING,
        description: 'Entrega registrada no sistema e aguardando o despacho',
      },
    });
    return { delivery, event };
  });
};

export const finishWithTransaction = async (courierId: string, deliveryId: string) => {
  return prisma.$transaction(async (tx) => {
    const courier = await tx.courier.update({
      where: { id: courierId },
      data: { status: Status.AVAILABLE },
    });
    const delivery = await tx.delivery.update({
      where: { id: deliveryId },
      data: { status: Status.DELIVERED, finishedAt: new Date() },
    });
    const event = await tx.deliveryEvent.create({
      data: {
        deliveryId: delivery.id,
        status: Status.DELIVERED,
        description: 'Entrega finalizada com sucesso ao destinatário',
      },
    });
    return { courier, delivery, event };
  });
};
