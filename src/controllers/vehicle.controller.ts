import { Request, Response } from 'express';
import * as vehicleService from '../services/vehicle.services.js';

export const createVehicle = async (req: Request, res: Response) => {
  const vehicle = await vehicleService.createVehicle(req.body);
  res.status(201).json(vehicle);
};

export const updateVehicle = async (req: Request, res: Response) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id as string, req.body);
  res.status(200).json(vehicle);
};

export const deleteVehicle = async (req: Request, res: Response) => {
  const vehicle = await vehicleService.deleteVehicle(req.params.id as string);
  res.status(200).json(vehicle);
};

export const getAllVehicles = async (req: Request, res: Response) => {
  const vehicles = await vehicleService.getAllVehicles();
  res.status(200).json(vehicles);
};

export const getVehicleById = async (req: Request, res: Response) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id as string);
  res.status(200).json(vehicle);
};
