import express from 'express';
import cors from 'cors';
import expertRoutes from './routes/expertRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { getClientOrigins } from './config/clientOrigins.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors({
    origin: getClientOrigins()
  }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'expert-booking-api' });
  });

  app.use('/api/experts', expertRoutes);
  app.use('/api/bookings', bookingRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
