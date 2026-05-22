export function timeOfDayGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Good night';
}

export function sparkPaths(history, w, h) {
  if (!history || !history.length) return { line: '', area: '' };
  const min   = Math.min(...history);
  const max   = Math.max(...history);
  const range = Math.max(1, max - min);
  const step  = w / (history.length - 1);
  const pts   = history.map((v, i) => [i * step, h - 6 - ((v - min) / range) * (h - 12)]);
  const line  = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ');
  const area  = `${line} L${w},${h} L0,${h} Z`;
  return { line, area };
}

const SELFHST = 'https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg';

export function resolveIconUrl(svc) {
  const icon = svc.icon;
  if (!icon) return `${SELFHST}/${svc.id}.svg`;
  if (icon.startsWith('http://') || icon.startsWith('https://')) return icon;
  if (icon.startsWith('selfhst:')) return `${SELFHST}/${icon.slice(8)}.svg`;
  return `${SELFHST}/${icon}.svg`;
}

export const METRIC_KEYS = ['cpu', 'ram', 'temp', 'disk'];
