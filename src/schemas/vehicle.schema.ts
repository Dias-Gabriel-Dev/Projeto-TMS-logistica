import { z } from 'zod';

const vehicleSchema = z.object({
  driverId: z.string(),
  plate: z
    .string()
    .regex(
      /^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/i,
      'A placa deve estar no formato ABC-1234 ou ABC1234',
    ),
  model: z.string().min(3),
  vehicleType: z.enum(['SEDAN', 'HATCH', 'FURGAO', 'CARRETA', 'MOTO', 'VAN']),
  capacityWeight: z.number().nonnegative('O peso deve ser maior que 0'),
  status: z.enum(['AVAILABLE', 'IN_TRANSIT', 'DELIVERED']),
});

export { vehicleSchema };
