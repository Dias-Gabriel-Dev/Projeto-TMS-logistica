import { prisma } from '../prisma.js';
import { z } from 'zod';
import { vehicleSchema } from '../schemas/vehicle.schema.js';
import { Status } from '../prisma.js';
import { AppError } from '../utils/AppError.js';

type createVehicleInput = z.infer<typeof vehicleSchema>;

const createVehicle = async (data: createVehicleInput) => {
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { plate: data.plate },
  });

  if (existingVehicle) {
    throw new AppError('Placa já cadastrada no sistema', 409);
  }

  const existingDriver = await prisma.driver.findUnique({
    where: { id: data.driverId },
  });

  if (!existingDriver) {
    throw new AppError('Motorista não encontrado', 404);
  }

  const newVehicle = await prisma.vehicle.create({
    data: {
      plate: data.plate,
      model: data.model,
      vehicleType: data.vehicleType,
      capacityWeight: data.capacityWeight,
      driverId: data.driverId,
    },
  });

  return newVehicle;
};

const updateVehicle = async (id: string, data: createVehicleInput) => {
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { id },
  });

  if (!existingVehicle) {
    throw new AppError('Veículo não encontrado', 404);
  }

  const updatedVehicle = await prisma.vehicle.update({
    where: { id },
    data,
  });

  return updatedVehicle;
};

const deleteVehicle = async (id: string) => {
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { id },
  });

  if (!existingVehicle) {
    throw new AppError('Veículo não encontrado', 404);
  }

  const deletedVehicle = await prisma.vehicle.delete({
    where: { id },
  });

  return deletedVehicle;
};

const getAllVehicles = async () => {
  const vehicles = await prisma.vehicle.findMany();
  return vehicles;
};

const getVehicleById = async (id: string) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });
  return vehicle;
};

const updateVehicleStatus = async (vehicleId: string, newStatus: Status) => {
  const existingVehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });

  if (!existingVehicle) {
    throw new AppError('Veiculo não encontrado', 404);
  }

  const driver = existingVehicle.driverId;

  const [updatedVehicle] = await prisma.$transaction([
    prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: newStatus },
    }),

    prisma.driver.update({
      where: { id: driver },
      data: { status: newStatus },
    }),
  ]);

  return updatedVehicle;
};

export {
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicleStatus,
};
