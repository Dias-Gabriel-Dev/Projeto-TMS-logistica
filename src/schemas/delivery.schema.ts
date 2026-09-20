import { z } from 'zod';

const deliverySchema = z.object({
  id: z.string().optional(),
  driverId: z.string(),
  vehicleId: z.string(),
  routeId: z.string(),
  cargoWeight: z.number().positive(),
  freightCost: z.number().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  finishedAt: z.coerce.date().nullish(),
  status: z.string().optional(),
});

export { deliverySchema };
