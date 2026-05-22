import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Settings, ExternalLink } from "lucide-react";
import { resolveIconUrl } from '../lib/utils.js';

const STATUS_LABEL = { up: "Online", down: "Offline" };

function ServiceIcon({ svc }) {
  const [failed, setFailed] = useState(false);
  const src = resolveIconUrl(svc);

  return (
    <span className="icon-wrap" style={{ "--svc-color": svc.color }}>
      {failed ? (
        <span className="icon-initial">{svc.name.charAt(0).toUpperCase()}</span>
      ) : (
        <img
          src={src}
          alt={svc.name}
          className="svc-icon-img"
          draggable={false}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

function StatusDot({ status }) {
  return (
    <span
      className="status-dot"
      data-status={status}
      title={STATUS_LABEL[status]}
    />
  );
}
export function ServicePreview({ svc, anchor, uptime }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0, show: false });

  useLayoutEffect(() => {
    if (!svc || !anchor) {
      setPos((p) => ({ ...p, show: false }));
      return;
    }
    const r = anchor.getBoundingClientRect();
    const pw = ref.current ? ref.current.offsetWidth : 260;
    const ph = ref.current ? ref.current.offsetHeight : 180;
    let x = r.right + 12;
    let y = r.top + r.height / 2 - ph / 2;
    if (x + pw > window.innerWidth - 16) x = r.left - pw - 12;
    y = Math.max(16, Math.min(window.innerHeight - ph - 16, y));
    setPos({ x, y, show: true });
  }, [svc, anchor]);

  if (!svc) return null;
  const status = uptime[svc.id] ?? "down";
  return (
    <div
      ref={ref}
      className={`svc-preview glass glass-strong ${pos.show ? "show" : ""}`}
      style={{ left: pos.x, top: pos.y }}
    >
      <h4>
        <StatusDot status={status} />
        {svc.name}
      </h4>
      <div className="sub">
        {STATUS_LABEL[status]} · {svc.tag}
      </div>
      <dl>
        {Object.entries(svc.stats || {}).map(([k, v]) => (
          <React.Fragment key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
}

function ServiceCard({ svc, layout, onHover, uptime }) {
  const ref = useRef(null);
  const status = uptime[svc.id] ?? "down";
  const onEnter = () => onHover(svc, ref.current);
  const onLeave = () => onHover(null, null);

  if (layout === "compact") {
    return (
      <a
        ref={ref}
        className="svc compact glass glass-hover"
        href={svc.url}
        target="_blank"
        rel="noopener"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <StatusDot status={status} />
        <ServiceIcon svc={svc} />
        <span className="name">{svc.name}</span>
      </a>
    );
  }

  if (layout === "large") {
    const entries = Object.entries(svc.stats || {}).slice(0, 2);
    return (
      <div
        ref={ref}
        className="svc large glass glass-hover"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <a className="head" href={svc.url} target="_blank" rel="noopener">
          <ServiceIcon svc={svc} />
          <div className="body">
            <div className="row">
              <span className="name">{svc.name}</span>
              <StatusDot status={status} />
            </div>
            <span className="tag">{svc.tag}</span>
            <div className="desc" style={{ marginTop: 6 }}>
              {svc.desc}
            </div>
          </div>
        </a>
        <div className="footer">
          {entries.map(([k, v]) => (
            <div key={k} className="quick-stat">
              <span>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
          <button className="action" title="Settings">
            <Settings size={16} strokeWidth={1.5} />
          </button>
          <a
            className="action"
            href={svc.url}
            target="_blank"
            rel="noopener"
            title="Open"
          >
            <ExternalLink size={16} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    );
  }

  // medium (default)
  return (
    <a
      ref={ref}
      className="svc medium glass glass-hover"
      href={svc.url}
      target="_blank"
      rel="noopener"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <ServiceIcon svc={svc} />
      <div className="body">
        <div className="row">
          <span className="name">{svc.name}</span>
          <span className="tag">{svc.tag}</span>
        </div>
        <div className="desc">{svc.desc}</div>
      </div>
      <StatusDot status={status} />
    </a>
  );
}

export function Section({ section, layout, onHover, uptime }) {
  return (
    <section className="section" data-screen-label={`section-${section.id}`}>
      <header>
        <h2>{section.label}</h2>
        <span className="hint">{section.hint}</span>
        <span className="count">{section.services.length}</span>
      </header>
      <div className="svc-grid" data-layout={layout}>
        {section.services.map((svc) => (
          <ServiceCard
            key={svc.id}
            svc={svc}
            layout={layout}
            onHover={onHover}
            uptime={uptime}
          />
        ))}
      </div>
    </section>
  );
}
