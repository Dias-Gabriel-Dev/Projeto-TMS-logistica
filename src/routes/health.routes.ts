import { Router } from 'express';
import { getLiveness, getReadiness } from '../controllers/health.controller.js';

const healthRoutes = Router();

healthRoutes.get('/', getLiveness);
healthRoutes.get('/ready', getReadiness);

export { healthRoutes };
