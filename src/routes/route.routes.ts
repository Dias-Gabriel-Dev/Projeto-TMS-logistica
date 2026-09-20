import { Router } from 'express';
import {
  createRoute,
  deleteRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
} from '../controllers/route.controller.js';
import { validate } from '../middlewares/validate.js';
import { routeSchema } from '../schemas/route.schema.js';

const routeRoutes = Router();

routeRoutes.post('/', validate(routeSchema), createRoute);
routeRoutes.get('/', getAllRoutes);
routeRoutes.get('/:id', getRouteById);
routeRoutes.put('/:id', validate(routeSchema), updateRoute);
routeRoutes.delete('/:id', deleteRoute);

export { routeRoutes };
