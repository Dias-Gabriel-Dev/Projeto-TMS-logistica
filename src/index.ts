import { env } from './config/env.js';
import { healthRoutes } from './routes/health.routes.js';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { disconnectDatabase } from './prisma.js';
import { driverRoutes } from './routes/driver.routes.js';
import { vehicleRoutes } from './routes/vehicle.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { routeRoutes } from './routes/route.routes.js';
import { deliveryRoutes } from './routes/delivery.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { trackingRoutes } from './routes/tracking.routes.js';
import { generalLimiter } from './middlewares/rateLimiters.js';
import { swaggerSpec, swaggerUi } from './config/swagger.js';
import { analyticsRoutes } from './routes/analytics.routes.js';

const app = express();

// Camada de Segurança e Rede
app.use(helmet());
app.use(cors());
app.use(generalLimiter);
app.set('trust proxy', 1);

// Parser de Corpo
app.use(express.json());

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas públicas
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/tracking', trackingRoutes);

// Rotas seguras
app.use('/drivers', authMiddleware, driverRoutes);
app.use('/vehicles', authMiddleware, vehicleRoutes);
app.use('/routes', authMiddleware, routeRoutes);
app.use('/deliveries', authMiddleware, deliveryRoutes);

// Rota Dashboard
app.use('/analytics', authMiddleware, analyticsRoutes);

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${env.PORT}`);
  console.log(`📚 Swagger disponível em http://localhost:${env.PORT}/api-docs`);
});

const gracefulShutdown = (signal: string) => {
  console.log(`\nSinal ${signal} recebido. Iniciando Graceful Shutdown...`);
  server.close(async () => {
    console.log('Servidor HTTP encerrado.');
    await disconnectDatabase();
    console.log('Conexão com banco de dados encerrada.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Encerramento forçado por timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
