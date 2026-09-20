import { Router } from 'express';
import {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  finishDelivery,
} from '../controllers/delivery.controller.js';
import { validate } from '../middlewares/validate.js';
import { deliverySchema } from '../schemas/delivery.schema.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const deliveryRoutes = Router();

deliveryRoutes.get('/', roleMiddleware(['ADMIN', 'OPERATOR']), getAllDeliveries);
deliveryRoutes.get('/:id', roleMiddleware(['ADMIN', 'OPERATOR']), getDeliveryById);

deliveryRoutes.post('/', roleMiddleware(['ADMIN']), validate(deliverySchema), createDelivery);

deliveryRoutes.put(
  '/:id',
  roleMiddleware(['ADMIN']),
  validate(deliverySchema),
  updateDeliveryStatus,
);

deliveryRoutes.patch('/:id/finish', roleMiddleware(['ADMIN']), finishDelivery);

export { deliveryRoutes };
