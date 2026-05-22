import os from "node:os";
import si from "systeminformation";

function cpuPercent() {
  return new Promise((resolve) => {
    const t1 = os.cpus().map((c) => ({ ...c.times }));
    setTimeout(() => {
      const t2 = os.cpus();
      let idle = 0,
        total = 0;
      t2.forEach((cpu, i) => {
        const d = Object.fromEntries(
          Object.entries(cpu.times).map(([k, v]) => [k, v - t1[i][k]]),
        );
        idle += d.idle;
        total += Object.values(d).reduce((a, b) => a + b, 0);
      });
      resolve(Math.round((1 - idle / total) * 100));
    }, 150);
  });
}

function ramInfo() {
  const total = os.totalmem();
  const free = os.freemem();
  return {
    pct: Math.round(((total - free) / total) * 100),
    total: Math.round(total / 1_073_741_824),
    used: Math.round((total - free) / 1_073_741_824),
  };
}

function formatUptime(secs) {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
}

function localIp() {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces ?? []) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return "-";
}

export async function GET() {
  const [cpuPct, temp, fsData] = await Promise.all([
    cpuPercent(),
    si.cpuTemperature(),
    si.fsSize(),
  ]);

  const ram = ramInfo();
  const load = os.loadavg()[0].toFixed(2);
  const cpuModel = os
    .cpus()[0]
    ?.model.replace(/\(R\)|\(TM\)|CPU\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const root =
    fsData.find((f) => f.mount === "/" || f.mount === "C:") ?? fsData[0];
  const diskPct = root ? Math.round((root.used / root.size) * 100) : 0;

  const colors = ["#6aa9ff", "#c084fc", "#34d399", "#fb923c"];
  const breakdown = fsData.slice(0, 3).map((f, i) => ({
    label: f.mount,
    gb: Math.round(f.used / 1e9),
    color: colors[i],
  }));

  const metrics = {
    cpu: {
      label: "CPU",
      value: cpuPct,
      unit: "%",
      detail: `${cpuModel} · ${os.cpus().length}c · load ${load}`,
    },
    ram: {
      label: "Memory",
      value: ram.pct,
      unit: "%",
      detail: `${ram.used} / ${ram.total} GB`,
    },
    temp: {
      label: "Temp",
      value: Math.round(temp.main ?? 0),
      unit: "°C",
      detail: temp.main ? `max ${Math.round(temp.max ?? temp.main)}°C` : "n/a",
    },
    disk: {
      label: "Disk",
      value: diskPct,
      unit: "%",
      detail: root
        ? `${Math.round(root.used / 1e9)} / ${Math.round(root.size / 1e9)} GB`
        : "—",
      breakdown,
    },
  };

  const system = {
    os: `${os.type()} ${os.release()}`,
    uptime: formatUptime(os.uptime()),
    ip: localIp(),
    cpu: cpuModel,
  };

  return new Response(JSON.stringify({ metrics, system }), {
    headers: { "Content-Type": "application/json" },
  });
}
