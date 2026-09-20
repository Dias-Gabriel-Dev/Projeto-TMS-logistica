import { prisma } from '../prisma.js';
import { z } from 'zod';
import { driverSchema } from '../schemas/driver.schema.js';
import { AppError } from '../utils/AppError.js';

type createDriverInput = z.infer<typeof driverSchema>;

const createDriver = async (data: createDriverInput) => {
  const existingDriver = await prisma.driver.findUnique({
    where: { licenseNumber: data.licenseNumber },
  });

  if (existingDriver) {
    throw new AppError('CNH já cadastrada no sistema', 409);
  }

  const newDriver = await prisma.driver.create({
    data: {
      name: data.name,
      document: data.document,
      licenseNumber: data.licenseNumber,
      status: data.status,
    },
  });
  return newDriver;
};

const updateDriver = async (id: string, data: createDriverInput) => {
  const existingDriver = await prisma.driver.findUnique({
    where: { id },
  });

  if (!existingDriver) {
    throw new AppError('Motorista não encontrado', 404);
  }

  const updatedDriver = await prisma.driver.update({
    where: { id },
    data,
  });
  return updatedDriver;
};

const deleteDriver = async (id: string) => {
  const existingDriver = await prisma.driver.findUnique({
    where: { id },
  });

  if (!existingDriver) {
    throw new AppError('Motorista não encontrado', 404);
  }

  const deletedDriver = await prisma.driver.delete({
    where: { id },
  });
  return deletedDriver;
};

const getAllDrivers = async () => {
  const drivers = await prisma.driver.findMany();
  return drivers;
};

const getDriverById = async (id: string) => {
  const driver = await prisma.driver.findUnique({
    where: { id },
  });
  return driver;
};

export { createDriver, updateDriver, deleteDriver, getAllDrivers, getDriverById };
