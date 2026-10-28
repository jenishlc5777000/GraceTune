import { Router } from 'express';
import { appearanceSchema } from '@gracetunes/shared';
import { requireAuth, requireRole } from '../../middleware/auth';
import { getAppearance, updateAppearance } from './settings.service';

export const settingsRouter = Router();

// Public: every client reads this on startup to pick its theme.
settingsRouter.get('/appearance', async (_req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json(await getAppearance());
});

settingsRouter.put('/appearance', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const next = appearanceSchema.parse(req.body);
  res.json(await updateAppearance(req.auth!.sub, next, req.ip));
});
