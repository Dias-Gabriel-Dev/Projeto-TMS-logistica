import { NextFunction, Request, Response } from 'express';
import * as analitycsServices from '../services/analytics.service.js';

export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await analitycsServices.getDashboardMetrics();
    return res.status(200).json(metrics);
  } catch (error) {
    next(error);
  }
};
