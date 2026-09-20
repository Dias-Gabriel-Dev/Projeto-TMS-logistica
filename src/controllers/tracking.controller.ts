import { Request, Response } from 'express';
import * as trackingService from '../services/tracking.service.js';

const getTrackingByCode = async (req: Request, res: Response) => {
  if (typeof req.params.code !== 'string') {
    throw new Error('Código de rastreio inválido');
  }
  const delivery = await trackingService.getTrackingByCode(req.params.code);
  res.status(200).json(delivery);
};

export { getTrackingByCode };
