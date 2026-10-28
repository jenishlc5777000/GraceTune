import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './lib/errors';
import { authRouter } from './modules/auth/auth.routes';
import { settingsRouter } from './modules/settings/settings.routes';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS }));
  app.use(express.json({ limit: '100kb' }));

  const v1 = express.Router();
  v1.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  v1.use('/auth', authRouter);
  v1.use('/settings', settingsRouter);
  app.use('/api/v1', v1);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
