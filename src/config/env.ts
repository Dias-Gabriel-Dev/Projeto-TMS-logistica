import { z } from 'zod';
import 'dotenv/config';
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatório'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET é obrigatório'),
  PORT: z.coerce.number().default(3000),
});

const parsedConfig = envSchema.safeParse(process.env);

if (!parsedConfig.success) {
  console.error('Configuração inválida', parsedConfig.error.format());
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
  throw new Error('Configuração inválida');
}

const env = parsedConfig.data;
export { env };

export { envSchema };
