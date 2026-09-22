import * as deliveryRepo from '../repositories/delivery.repository.js';
import { AppError } from '../utils/AppError.js';
import { CreateDeliveryDTO, CreateDeliveryTxInput } from '../@types/delivery.js';
import { Status } from '../prisma.js';
import { generateTrackingCode } from '../utils/trackingCode.js';
import { calculateFreight } from '../utils/freight.util.js';

const createDelivery = async (data: CreateDeliveryDTO) => {
  const { routeId, courierId } = data;

  const existingRoute = await deliveryRepo.findRouteById(routeId);

  if (!existingRoute) {
    throw new AppError('Rota não encontrada', 404);
  }

  const existingCourier = await deliveryRepo.findCourierById(courierId);

  if (!existingCourier) {
    throw new AppError('Motorista não encontrado', 404);
  }

  const freightCost = calculateFreight(existingRoute.estimatedDistance);

  if (existingCourier.status !== Status.AVAILABLE) {
    throw new AppError('Motorista não está disponível', 404);
  }

  const txInput: CreateDeliveryTxInput = {
    routeId,
    courierId,
    freightCost,
    trackingCode: generateTrackingCode(),
  };

  const newDeliveryInfo = await deliveryRepo.createWithTransaction(txInput);
  return newDeliveryInfo;
};

const getAllDeliveries = async () => {
  const deliveries = await deliveryRepo.findAllDeliveries();
  return deliveries;
};

const getDeliveryById = async (id: string) => {
  const delivery = await deliveryRepo.findDeliveryById(id);
  return delivery;
};

const updateDeliveryStatus = async (id: string, status: string) => {
  const delivery = await deliveryRepo.findDeliveryById(id);

  await deliveryRepo.updateStatus(id, status as Status);
  return delivery;
};

const finishDelivery = async (id: string) => {
  const existingDelivery = await deliveryRepo.findDeliveryById(id);

  if (!existingDelivery) {
    throw new AppError('Entrega não encontrada', 404);
  }

  const finishedDelivery = await deliveryRepo.finishWithTransaction(
    existingDelivery.id,
    existingDelivery.courierId,
  );

  return finishedDelivery;
};

export { createDelivery, getAllDeliveries, getDeliveryById, updateDeliveryStatus, finishDelivery };
