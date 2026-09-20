import { Router } from 'express';
import {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} from '../controllers/driver.controller.js';
import { validate } from '../middlewares/validate.js';
import { driverSchema } from '../schemas/driver.schema.js';

const driverRoutes = Router();

driverRoutes.post('/', validate(driverSchema), createDriver);
driverRoutes.get('/', getAllDrivers);
driverRoutes.put('/:id', validate(driverSchema), updateDriver);
driverRoutes.delete('/:id', deleteDriver);
driverRoutes.get('/:id', getDriverById);

export { driverRoutes };
