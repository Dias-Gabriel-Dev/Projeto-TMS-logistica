import { Router } from 'express';
import * as analyticsController from '../controllers/analitycs.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const analyticsRoutes = Router();

analyticsRoutes.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware(['ADMIN', 'OPERATOR']),
  analyticsController.getDashboardMetrics,
);

export { analyticsRoutes };
