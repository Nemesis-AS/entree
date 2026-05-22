import React, { useMemo } from 'react';
import { sparkPaths, METRIC_KEYS } from '../lib/utils.js';

function MetricDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#6aa9ff" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id="spark-grad-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6aa9ff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#6aa9ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#6aa9ff" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Sparkline({ history }) {
  const w = 220, h = 36;
  const { line, area } = useMemo(() => sparkPaths(history, w, h), [history]);
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%' }}>
      <path className="area" d={area} />
      <path className="line" d={line} />
    </svg>
  );
}

function MiniRing({ value }) {
  const size = 44, stroke = 4, r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg className="ring ring-svg" viewBox={`0 0 ${size} ${size}`}>
      <circle className="track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
      <circle className="value" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
              strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
    </svg>
  );
}

function DiskBreakdown({ breakdown }) {
  if (!breakdown) return null;
  const total = breakdown.reduce((a, b) => a + b.gb, 0);
  return (
    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
        {breakdown.map((b) => (
          <div key={b.label} style={{ width: `${(b.gb / total) * 100}%`, background: b.color }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', fontSize: 10.5, color: 'var(--fg-faint)', letterSpacing: 0.02 }}>
        {breakdown.slice(0, 3).map((b) => (
          <span key={b.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: b.color }} />
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function MetricsRow({ metrics }) {
  const list = METRIC_KEYS;
  return (
    <div className="metrics" data-style="row">
      <MetricDefs />
      {list.map((k) => {
        const m = metrics[k];
        if (!m) return null;
        const pct = k === 'temp' ? Math.min(100, (m.value / 90) * 100) : m.value;
        return (
          <div key={k} className="metric-stat glass">
            <MiniRing value={pct} />
            <div className="body">
              <div className="label">{m.label}</div>
              <div className="value">{m.value}<span className="unit">{m.unit}</span></div>
              <div className="detail">{m.detail}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricsFloating({ metrics }) {
  const list = METRIC_KEYS;
  return (
    <div className="metrics" data-style="floating">
      <MetricDefs />
      {list.map((k) => {
        const m = metrics[k];
        if (!m) return null;
        return (
          <div key={k} className="metric-card glass">
            <header>
              <span className="label">{m.label}</span>
              <span className="pulse" />
            </header>
            <div className="value">{m.value}<span className="unit">{m.unit}</span></div>
            <div className="detail">{m.detail}</div>
            {k === 'disk' ? (
              <DiskBreakdown breakdown={m.breakdown} />
            ) : (
              <Sparkline history={m.history} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function MetricsSide({ metrics, system }) {
  const list = METRIC_KEYS;
  return (
    <div className="metrics glass" data-style="side">
      <MetricDefs />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--fg-muted)', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 2 }}>
        System
      </div>
      {list.map((k) => {
        const m = metrics[k];
        if (!m) return null;
        const pct = k === 'temp' ? Math.min(100, (m.value / 90) * 100) : m.value;
        return (
          <div key={k} className="metric-row">
            <div className="bar-wrap">
              <div className="bar-head">
                <span className="label">{m.label}</span>
                <span className="value">{m.value}{m.unit}</span>
              </div>
              <div className="bar"><div className="fill" style={{ width: `${pct}%` }} /></div>
              <div className="detail">{m.detail}</div>
            </div>
          </div>
        );
      })}
      {system && (
        <div className="system-foot">
          {system.cpu && <div><strong>cpu </strong>{system.cpu}</div>}
          <div><strong>os </strong>{system.os}</div>
          <div><strong>up </strong>{system.uptime}</div>
          <div><strong>ip </strong>{system.ip}</div>
        </div>
      )}
    </div>
  );
}

function Skel({ w = '100%', h = 10, r = 4, style: s }) {
  return <span className="skel" style={{ width: w, height: h, borderRadius: r, ...s }} />;
}

function MetricsRowSkeleton() {
  return (
    <div className="metrics" data-style="row">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="metric-stat glass">
          <Skel w={44} h={44} r="50%" s={{ flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Skel w="38%" h={9} />
            <Skel w="52%" h={22} r={5} />
            <Skel w="75%" h={9} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricsFloatingSkeleton() {
  return (
    <div className="metrics" data-style="floating">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="metric-card glass">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Skel w="38%" h={10} />
            <Skel w={8} h={8} r="50%" />
          </div>
          <Skel w="50%" h={38} r={6} />
          <Skel w="68%" h={10} />
          <Skel w="100%" h={36} r={5} s={{ marginTop: 'auto' }} />
        </div>
      ))}
    </div>
  );
}

function MetricsSideSkeleton() {
  return (
    <div className="metrics glass" data-style="side">
      <Skel w="28%" h={12} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="metric-row">
          <div className="bar-wrap" style={{ flex: 1 }}>
            <div className="bar-head">
              <Skel w="32%" h={9} />
              <Skel w="18%" h={9} />
            </div>
            <Skel w="100%" h={5} r={99} s={{ marginTop: 5 }} />
            <Skel w="55%" h={9} s={{ marginTop: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Metrics({ style, metrics, system }) {
  const hasData = metrics && Object.keys(metrics).length > 0;

  if (!hasData) {
    if (style === 'row')  return <MetricsRowSkeleton />;
    if (style === 'side') return <MetricsSideSkeleton />;
    return <MetricsFloatingSkeleton />;
  }

  if (style === 'row')  return <MetricsRow metrics={metrics} />;
  if (style === 'side') return <MetricsSide metrics={metrics} system={system} />;
  return <MetricsFloating metrics={metrics} />;
}
