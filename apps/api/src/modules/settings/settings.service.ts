import {
  APPEARANCE_KEY,
  appearanceSchema,
  DEFAULT_APPEARANCE,
  type AppearanceSettings,
} from '@gracetunes/shared';
import { prisma } from '../../lib/prisma';

export async function getAppearance(): Promise<AppearanceSettings> {
  const row = await prisma.appSetting.findUnique({ where: { key: APPEARANCE_KEY } });
  // Fill in fields added after the row was saved; fall back if a stored theme was removed.
  const parsed = appearanceSchema.safeParse({ ...DEFAULT_APPEARANCE, ...(row?.value as object) });
  return parsed.success ? parsed.data : DEFAULT_APPEARANCE;
}

export async function updateAppearance(actorId: string, next: AppearanceSettings, ip?: string) {
  const before = await getAppearance();
  await prisma.$transaction([
    prisma.appSetting.upsert({
      where: { key: APPEARANCE_KEY },
      update: { value: next },
      create: { key: APPEARANCE_KEY, value: next },
    }),
    prisma.auditLog.create({
      data: {
        actorId,
        action: 'settings.appearance.update',
        entityType: 'AppSetting',
        entityId: APPEARANCE_KEY,
        before,
        after: next,
        ip,
      },
    }),
  ]);
  return next;
}
