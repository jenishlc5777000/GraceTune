import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { verify } from '@node-rs/argon2';
import { loginSchema } from '@gracetunes/shared';
import { AppError } from '../../lib/errors';
import { signAccessToken } from '../../lib/jwt';
import { prisma } from '../../lib/prisma';

export const authRouter = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });

// Access-token-only login. Phase 2 adds registration, Google sign-in and refresh rotation.
authRouter.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user?.passwordHash ? await verify(user.passwordHash, password) : false;
  if (!user || !ok) throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  if (user.status !== 'ACTIVE') throw new AppError(403, 'ACCOUNT_SUSPENDED', 'This account is suspended');

  const accessToken = await signAccessToken({ sub: user.id, role: user.role });
  res.json({
    accessToken,
    user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
  });
});
