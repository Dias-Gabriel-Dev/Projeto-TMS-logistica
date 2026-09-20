import { z } from 'zod';

const driverSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  document: z
    .string()
    .min(7, 'O documento deve ter pelo menos 7 caracteres')
    .max(11, 'O documento deve ter no máximo 11 caracteres'),
  licenseNumber: z.string().regex(/^\d{11}$/, 'A CNH deve ter 11 caracteres'),
  status: z.enum(['AVAILABLE', 'IN_TRANSIT', 'DELIVERED']),
});

export { driverSchema };
