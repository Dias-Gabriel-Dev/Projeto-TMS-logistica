import { Router } from 'express';
import {
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAllVehicles,
  getVehicleById,
} from '../controllers/vehicle.controller.js';
import { validate } from '../middlewares/validate.js';
import { vehicleSchema } from '../schemas/vehicle.schema.js';

const vehicleRoutes = Router();

vehicleRoutes.post('/', validate(vehicleSchema), createVehicle);
vehicleRoutes.put('/:id', validate(vehicleSchema), updateVehicle);
vehicleRoutes.delete('/:id', deleteVehicle);
vehicleRoutes.get('/', getAllVehicles);
vehicleRoutes.get('/:id', getVehicleById);

export { vehicleRoutes };
