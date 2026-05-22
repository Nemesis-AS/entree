import React, { useState, useEffect, useRef } from 'react';
import { Metrics }               from './Metrics.jsx';
import { Section, ServicePreview } from './Services.jsx';
import { Search, Sun, Moon } from 'lucide-react';
import { timeOfDayGreeting } from '../lib/utils.js';
import { usePoll } from '../lib/hooks.js';

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const date = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  return <div className="clock">{time}<span className="date">{date}</span></div>;
}

function Topbar({ hostname, user, theme, onToggleTheme, query, onQuery }) {
  const inputRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="topbar">
      <div className="greeting">
        <div className="hi">{timeOfDayGreeting()}, {user}.</div>
        <div className="sub">All systems nominal · {hostname}.local</div>
      </div>
      <Clock />
      <div className="controls">
        <label className="search glass glass-pill">
          <Search size={16} strokeWidth={1.5} />
          <input ref={inputRef}
                 placeholder="Search services"
                 value={query}
                 onChange={(e) => onQuery(e.target.value)} />
          <span className="kbd">⌘K</span>
        </label>
        <button className="icon-btn glass glass-hover"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
          {theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  );
}

function Bookmarks({ items }) {
  return (
    <div className="bookmarks">
      {items.map((b) => (
        <a key={b.id} className="bookmark glass glass-hover glass-pill"
           href={b.url} target="_blank" rel="noopener">
          <span className="dot" style={{ background: b.color, color: b.color }} />
          {b.label}
        </a>
      ))}
    </div>
  );
}

function BackgroundLayer() {
  return <div className="bg-scene" />;
}

export default function App({ config }) {
  const ap = config.appearance ?? {};

  // Theme is the only runtime-togglable setting; everything else is read from config.
  const [theme, setTheme] = useState(ap.theme ?? 'dark');

  const metricStyle  = ap.metricStyle  ?? 'row';
  const cardLayout   = ap.cardLayout   ?? 'medium';
  const glassBlur    = ap.glassBlur    ?? 28;
  const showBookmarks = ap.showBookmarks ?? true;

  const [query, setQuery] = useState('');
  const [hover, setHover] = useState({ svc: null, anchor: null });

  const metricsData = usePoll('/api/metrics');
  const uptimeData  = usePoll('/api/uptime');

  const liveMetrics = metricsData?.metrics ?? config.metrics ?? {};
  const liveSystem  = metricsData?.system  ?? config.system  ?? {};
  const uptime      = uptimeData           ?? config.uptime  ?? {};

  useEffect(() => { document.body.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    document.body.dataset.bg = ap.background ?? 'aurora';
    document.documentElement.style.setProperty('--glass-blur', `${glassBlur}px`);
  }, []);

  const onHover = (svc, anchor) => setHover({ svc, anchor });

  const q = query.trim().toLowerCase();
  const sections = !q
    ? (config.sections ?? [])
    : (config.sections ?? []).map((s) => ({
        ...s,
        services: s.services.filter((svc) =>
          [svc.name, svc.tag, svc.desc].some((f) => f?.toLowerCase().includes(q))
        ),
      })).filter((s) => s.services.length > 0);

  const totalServices = (config.sections ?? []).reduce((a, s) => a + s.services.length, 0);

  return (
    <>
      <BackgroundLayer />

      <div className="page" data-metric-layout={metricStyle === 'side' ? 'side' : 'stack'}>
        <Topbar
          hostname={config.hostname}
          user={config.user}
          theme={theme}
          onToggleTheme={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')}
          query={query}
          onQuery={setQuery}
        />

        <Metrics style={metricStyle} metrics={liveMetrics} system={liveSystem} />

        {showBookmarks && (config.bookmarks?.length ?? 0) > 0 && (
          <Bookmarks items={config.bookmarks} />
        )}

        <div className="sections-stack">
          {sections.length === 0 ? (
            <div className="glass" style={{ padding: 28, textAlign: 'center', color: 'var(--fg-muted)' }}>
              No services match <strong style={{ color: 'var(--fg)' }}>{query}</strong>.
            </div>
          ) : sections.map((s) => (
            <Section key={s.id} section={s} layout={cardLayout} onHover={onHover} uptime={uptime} />
          ))}
        </div>

        <div className="foot">
          {liveSystem?.os} · uptime {liveSystem?.uptime} · {totalServices} services
        </div>
      </div>

      <ServicePreview svc={hover.svc} anchor={hover.anchor} uptime={uptime} />
    </>
  );
}
