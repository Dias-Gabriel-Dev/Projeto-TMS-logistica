import { prisma } from '../prisma.js';
import { z } from 'zod';
import { driverSchema } from '../schemas/driver.schema.js';
import { AppError } from '../utils/AppError.js';

type CreateDriverInput = z.infer<typeof driverSchema>;

const createDriver = async (data: CreateDriverInput) => {
  const existingDriver = await prisma.courier.findUnique({
    where: { licenseNumber: data.licenseNumber },
  });

  if (existingDriver) {
    throw new AppError('CNH já cadastrada no sistema', 409);
  }

  const newDriver = await prisma.courier.create({
    data: {
      name: data.name,
      document: data.document,
      licenseNumber: data.licenseNumber,
      vehicleType: data.vehicleType,
    },
  });
  return newDriver;
};

const updateDriver = async (id: string, data: CreateDriverInput) => {
  const existingDriver = await prisma.courier.findUnique({
    where: { id },
  });

  if (!existingDriver) {
    throw new AppError('Motorista não encontrado', 404);
  }

  const updatedDriver = await prisma.courier.update({
    where: { id },
    data,
  });
  return updatedDriver;
};

const deleteDriver = async (id: string) => {
  const existingDriver = await prisma.courier.findUnique({
    where: { id },
  });

  if (!existingDriver) {
    throw new AppError('Motorista não encontrado', 404);
  }

  const deletedDriver = await prisma.courier.delete({
    where: { id },
  });
  return deletedDriver;
};

const getAllDrivers = async () => {
  const drivers = await prisma.courier.findMany();
  return drivers;
};

const getDriverById = async (id: string) => {
  const driver = await prisma.courier.findUnique({
    where: { id },
  });
  return driver;
};

export { createDriver, updateDriver, deleteDriver, getAllDrivers, getDriverById };
