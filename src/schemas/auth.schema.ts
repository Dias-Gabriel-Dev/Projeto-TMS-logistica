import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().nonempty().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'OPERATOR']).optional().default('OPERATOR'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export { registerSchema, loginSchema };
