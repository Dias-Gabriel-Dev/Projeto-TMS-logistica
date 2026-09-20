import { Request, Response } from 'express';
import * as routeService from '../services/route.service.js';

export const createRoute = async (req: Request, res: Response) => {
  const route = await routeService.createRoute(req.body);
  res.status(201).json(route);
};

export const getAllRoutes = async (req: Request, res: Response) => {
  const routes = await routeService.getAllRoutes();
  res.status(200).json(routes);
};

export const getRouteById = async (req: Request, res: Response) => {
  const route = await routeService.getRouteById(req.params.id as string);
  res.status(200).json(route);
};

export const deleteRoute = async (req: Request, res: Response) => {
  const route = await routeService.deleteRoute(req.params.id as string);
  res.status(200).json(route);
};

export const updateRoute = async (req: Request, res: Response) => {
  const route = await routeService.updateRoute(req.params.id as string, req.body);
  res.status(200).json(route);
};
