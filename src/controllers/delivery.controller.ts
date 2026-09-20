import { Request, Response } from 'express';
import * as deliveryService from '../services/delivery.service.js';
import { Status } from '../prisma.js';

export const createDelivery = async (req: Request, res: Response) => {
  const delivery = await deliveryService.createDelivery(req.body);
  res.status(201).json(delivery);
};

export const getAllDeliveries = async (req: Request, res: Response) => {
  const deliveries = await deliveryService.getAllDeliveries();
  res.status(200).json(deliveries);
};

export const getDeliveryById = async (req: Request, res: Response) => {
  const delivery = await deliveryService.getDeliveryById(req.params.id as string);
  res.status(200).json(delivery);
};

export const updateDeliveryStatus = async (req: Request, res: Response) => {
  const delivery = await deliveryService.updateDeliveryStatus(
    req.params.id as string,
    req.body.status as Status,
  );
  res.status(200).json(delivery);
};

export const finishDelivery = async (req: Request, res: Response) => {
  const delivery = await deliveryService.finishDelivery(req.params.id as string);
  res.status(200).json(delivery);
};
