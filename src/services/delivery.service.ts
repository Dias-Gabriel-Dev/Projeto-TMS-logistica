import * as deliveryRepo from '../repositories/delivery.repository.js';
import { AppError } from '../utils/AppError.js';
import { CreateDeliveryDTO, CreateDeliveryTxInput } from '../@types/delivery.js';
import { Status } from '../prisma.js';
import { generateTrackingCode } from '../utils/trackingCode.js';
import { calculateFreight } from '../utils/freight.util.js';

const createDelivery = async (data: CreateDeliveryDTO) => {
  const { routeId, driverId, vehicleId, cargoWeight } = data;

  const existingRoute = await deliveryRepo.findRouteById(routeId);

  if (!existingRoute) {
    throw new AppError('Rota não encontrada', 404);
  }

  const existingDriver = await deliveryRepo.findDriverById(driverId);

  if (!existingDriver) {
    throw new AppError('Motorista não encontrado', 404);
  }

  const existingVehicle = await deliveryRepo.findVehicleById(vehicleId);

  const freightCost = calculateFreight(existingRoute.estimatedDistance, data.cargoWeight);

  if (existingDriver.status !== Status.AVAILABLE) {
    throw new AppError('Motorista não está disponível', 404);
  }

  if (!existingVehicle) {
    throw new AppError('Veículo não encontrado', 404);
  }

  if (existingVehicle.status !== Status.AVAILABLE) {
    throw new AppError('Veículo não está disponível', 404);
  }

  if (existingVehicle.driverId !== driverId) {
    throw new AppError('Este veículo não pertence ao motorista selecionado', 400);
  }

  if (cargoWeight > existingVehicle.capacityWeight) {
    throw new AppError('Capacidade do veículo excedida', 400);
  }

  const txInput: CreateDeliveryTxInput = {
    routeId,
    driverId,
    vehicleId,
    cargoWeight,
    freightCost,
    trackingCode: generateTrackingCode(),
  };

  const newDeliveryInfo = await deliveryRepo.createWithTransaction(txInput);
  return newDeliveryInfo;
};

const getAllDeliveries = async () => {
  const deliveries = await deliveryRepo.findAll();
  return deliveries;
};

const getDeliveryById = async (id: string) => {
  const delivery = await deliveryRepo.findById(id);
  return delivery;
};

const updateDeliveryStatus = async (id: string, status: string) => {
  const delivery = await deliveryRepo.findById(id);

  await deliveryRepo.updateStatus(id, status as Status);
  return delivery;
};

const finishDelivery = async (id: string) => {
  const existingDelivery = await deliveryRepo.findById(id);

  if (!existingDelivery) {
    throw new AppError('Entrega não encontrada', 404);
  }

  const finishedDelivery = await deliveryRepo.finishWithTransaction(
    existingDelivery.id,
    existingDelivery.driverId,
    existingDelivery.vehicleId,
  );

  return finishedDelivery;
};

export { createDelivery, getAllDeliveries, getDeliveryById, updateDeliveryStatus, finishDelivery };
