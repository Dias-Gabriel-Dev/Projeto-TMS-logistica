import { z } from 'zod';

const routeSchema = z.object({
  id: z.string(),
  origin: z.string(),
  destination: z.string(),
  estimatedDistance: z.number().nonnegative(),
});

export { routeSchema };
