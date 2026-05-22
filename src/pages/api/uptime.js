import { getUptimeCache, ensurePolling } from '../../lib/uptime-store.js';

ensurePolling();

export async function GET() {
  return new Response(JSON.stringify(getUptimeCache()), {
    headers: { 'Content-Type': 'application/json' },
  });
}
