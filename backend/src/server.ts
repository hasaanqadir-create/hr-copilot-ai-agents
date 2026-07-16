import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[server] HR Copilot API running on http://localhost:${env.port} (${env.nodeEnv})`);
    console.log(`[server] AI provider: ${env.aiProvider}`);
  });
}

main().catch((err) => {
  console.error('[server] fatal startup error:', err);
  process.exit(1);
});
