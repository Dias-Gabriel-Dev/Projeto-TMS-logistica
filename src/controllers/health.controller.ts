import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export const getLiveness = async (_: Request, res: Response) => {
  return res
    .status(200)
    .json({ status: 'OK', uptime: process.uptime(), timestamp: new Date().toISOString() });
};

export const getReadiness = async (_: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ status: 'READY', database: 'connected' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return res.status(503).json({
      status: 'UNAVAILABLE',
      database: 'disconnected',
      error: errorMessage,
    });
  }
};
