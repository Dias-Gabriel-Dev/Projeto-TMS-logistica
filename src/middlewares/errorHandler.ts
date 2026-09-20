import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (error: Error, req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }
  console.error(error);

  if (error instanceof AppError && error.message) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  res.status(500).json({ status: 'error', message: 'Internal server error' });
};
