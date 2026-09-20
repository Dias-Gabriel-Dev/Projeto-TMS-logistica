import { Request, Response } from 'express';
import * as driverService from '../services/driver.service.js';

export const createDriver = async (req: Request, res: Response) => {
  const driver = await driverService.createDriver(req.body);
  res.status(201).json(driver);
};

export const updateDriver = async (req: Request, res: Response) => {
  const driver = await driverService.updateDriver(req.params.id as string, req.body);
  res.status(201).json(driver);
};

export const deleteDriver = async (req: Request, res: Response) => {
  const driver = await driverService.deleteDriver(req.params.id as string);
  res.status(201).json(driver);
};

export const getAllDrivers = async (req: Request, res: Response) => {
  const drivers = await driverService.getAllDrivers();
  res.status(200).json(drivers);
};

export const getDriverById = async (req: Request, res: Response) => {
  const driver = await driverService.getDriverById(req.params.id as string);
  res.status(200).json(driver);
};
