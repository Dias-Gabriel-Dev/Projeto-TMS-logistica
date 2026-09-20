import { CreateDeliveryTxInput } from '../@types/delivery.js';
import { prisma, Status } from '../prisma.js';
import { AppError } from '../utils/AppError.js';

export const findRouteById = async (id: string) => {
  return prisma.route.findUnique({ where: { id } });
};

export const findDriverById = async (id: string) => {
  return prisma.driver.findUnique({ where: { id } });
};

export const findVehicleById = async (id: string) => {
  return prisma.vehicle.findUnique({ where: { id } });
};

export const findById = async (id: string) => {
  return prisma.delivery.findUnique({ where: { id } });
};

export const findAll = async () => {
  return prisma.delivery.findMany();
};

export const updateStatus = async (id: string, status: Status) => {
  return prisma.delivery.update({ where: { id }, data: { status } });
};

export const createWithTransaction = async (data: CreateDeliveryTxInput) => {
  return prisma.$transaction(async (tx) => {
    const driver = await tx.driver.updateMany({
      where: { id: data.driverId, status: Status.AVAILABLE },
      data: { status: Status.IN_TRANSIT },
    });
    if (driver.count === 0) {
      throw new AppError('Motorista indisponível', 409);
    }
    const vehicle = await tx.vehicle.updateMany({
      where: { id: data.vehicleId, status: Status.AVAILABLE },
      data: { status: Status.IN_TRANSIT },
    });
    if (vehicle.count === 0) {
      throw new AppError('Veículo indisponível', 409);
    }
    const delivery = await tx.delivery.create({
      data: {
        routeId: data.routeId,
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        cargoWeight: data.cargoWeight,
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

export const finishWithTransaction = async (
  deliveryId: string,
  driverId: string,
  vehicleId: string,
) => {
  return prisma.$transaction(async (tx) => {
    const driver = await tx.driver.update({
      where: { id: driverId },
      data: { status: Status.AVAILABLE },
    });
    const vehicle = await tx.vehicle.update({
      where: { id: vehicleId },
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
    return { driver, vehicle, delivery, event };
  });
};
