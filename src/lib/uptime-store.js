import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import yaml from 'js-yaml';

const TIMEOUT_MS = 5_000;
const POLL_MS    = 30_000;

let cache   = {};
let started = false;

function loadServices() {
  const configDir = process.env.CONFIG_DIR ?? resolve('./config');
  try {
    const raw = yaml.load(readFileSync(join(configDir, 'services.yaml'), 'utf-8'));
    return (raw.sections ?? []).flatMap((s) => s.services ?? []);
  } catch {
    return [];
  }
}

async function pingUrl(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    await fetch(url, { method: 'HEAD', signal: ctrl.signal, redirect: 'follow' });
    return 'up';
  } catch {
    return 'down';
  } finally {
    clearTimeout(t);
  }
}

async function poll() {
  const services = loadServices();
  for (const svc of services) {
    if (!(svc.id in cache)) cache[svc.id] = 'down';
  }
  const results = await Promise.all(
    services.map(async (svc) => [svc.id, await pingUrl(svc.url)])
  );
  cache = Object.fromEntries(results);
}

export function getUptimeCache() {
  return cache;
}

export function ensurePolling() {
  if (started) return;
  started = true;
  poll();
  setInterval(poll, POLL_MS);
}
