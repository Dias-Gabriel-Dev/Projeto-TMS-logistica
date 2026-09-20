import { prisma } from '../prisma.js';
import { z } from 'zod';
import { routeSchema } from '../schemas/route.schema.js';
import { AppError } from '../utils/AppError.js';

type createRouteInput = z.infer<typeof routeSchema>;

const createRoute = async (data: createRouteInput) => {
  const newRoute = await prisma.route.create({
    data: {
      origin: data.origin,
      destination: data.destination,
      estimatedDistance: data.estimatedDistance,
    },
  });
  return newRoute;
};

const updateRoute = async (id: string, data: createRouteInput) => {
  const existingRoute = await prisma.route.findUnique({
    where: { id },
  });

  if (!existingRoute) {
    throw new AppError('Rota não encontrada', 404);
  }

  const updatedRoute = await prisma.route.update({
    where: { id },
    data: {
      origin: data.origin,
      destination: data.destination,
      estimatedDistance: data.estimatedDistance,
    },
  });
  return updatedRoute;
};

const deleteRoute = async (id: string) => {
  const existingRoute = await prisma.route.findUnique({
    where: { id },
  });

  if (!existingRoute) {
    throw new AppError('Rota não encontrada', 404);
  }

  const deletedRoute = await prisma.route.delete({
    where: { id },
  });
  return deletedRoute;
};

const getAllRoutes = async () => {
  const routes = await prisma.route.findMany();
  return routes;
};

const getRouteById = async (id: string) => {
  const route = await prisma.route.findUnique({
    where: { id },
  });
  if (!route) {
    throw new AppError('Rota não encontrada', 404);
  }
  return route;
};

export { createRoute, updateRoute, deleteRoute, getAllRoutes, getRouteById };
