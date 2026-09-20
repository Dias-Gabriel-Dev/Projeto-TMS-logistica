import { Router } from 'express';
import { getTrackingByCode } from '../controllers/tracking.controller.js';

const trackingRoutes = Router();

trackingRoutes.get('/:code', getTrackingByCode);

export { trackingRoutes };
