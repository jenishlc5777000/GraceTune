import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const server = createApp().listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}/api/v1`);
});

const shutdown = () => {
  server.close(() => void prisma.$disconnect().then(() => process.exit(0)));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
