const root = document.getElementById("options-wall-research-root");
const data = window.OPTIONS_WALL_VANNA_DATA;

const palette = {
  ink: "#111827",
  navy: "#172554",
  slate: "#475569",
  muted: "#94a3b8",
  grid: "rgba(15, 23, 42, 0.10)",
  call: "#1f4e79",
  put: "#8f2f2f",
  neutral: "#475569",
  accent: "#9a6a12",
  pin: "#3f6b57",
  momentum: "#9a6a12",
};

function injectStyles() {
  if (document.getElementById("wall-study-style")) return;
  const style = document.createElement("style");
  style.id = "wall-study-style";
  style.textContent = `
    .study-grid { display: grid; gap: 1.25rem; }
    .study-card {
      background: #fff;
      border: 1px solid rgba(15,23,42,0.10);
      border-radius: 0.45rem;
      box-shadow: 0 12px 32px rgba(15,23,42,0.055);
    }
    .study-card-quiet { background: #f8fafc; border: 1px solid rgba(15,23,42,0.08); border-radius: 0.45rem; }
    .study-chart { display: block; height: 300px; width: 100%; }
    .study-chart-short { height: 250px; }
    .study-chart-frame {
      background: #fbfdff;
      border: 1px solid rgba(15,23,42,0.09);
      border-radius: 0.35rem;
      padding: 0.35rem;
    }
    .study-kicker {
      color: #334155;
      font-size: 0.66rem;
      font-weight: 850;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .study-copy { color: #475569; font-size: 0.92rem; line-height: 1.72; }
    .study-note {
      border-top: 1px solid rgba(15,23,42,0.10);
      color: #475569;
      font-size: 0.82rem;
      line-height: 1.62;
      margin-top: 0.85rem;
      padding-top: 0.85rem;
    }
    .study-note p + p { margin-top: 0.55rem; }
    .study-table { border-collapse: collapse; font-size: 0.78rem; width: 100%; }
    .study-table th {
      border-bottom: 1px solid rgba(15,23,42,0.14);
      color: #64748b;
      font-size: 0.64rem;
      font-weight: 850;
      letter-spacing: 0.10em;
      padding: 0.68rem 0.45rem;
      text-align: left;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .study-table td {
      border-bottom: 1px solid rgba(226,232,240,0.95);
      color: #334155;
      padding: 0.68rem 0.45rem;
      vertical-align: top;
    }
    .study-stat {
      border-left: 3px solid #172554;
      background: #f8fafc;
      padding: 1rem;
    }
    .study-stat-label {
      color: #64748b;
      font-size: 0.64rem;
      font-weight: 850;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    @media (max-width: 640px) {
      .study-chart, .study-chart-short { height: 280px; }
    }
  `;
  document.head.appendChild(style);
}

function fmtPct(value, decimals = 1, signed = false) {
  if (!Number.isFinite(value)) return "--";
  const sign = signed && value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(decimals)}%`;
}

function fmtNum(value, decimals = 1) {
  if (!Number.isFinite(value)) return "--";
  return value.toFixed(decimals);
}

function fmtInt(value) {
  if (!Number.isFinite(value)) return "--";
  return Math.round(value).toLocaleString();
}

function pctCi(p, n) {
  if (!Number.isFinite(p) || !n) return [null, null];
  const se = Math.sqrt((p * (1 - p)) / n);
  return [Math.max(0, p - 1.96 * se), Math.min(1, p + 1.96 * se)];
}

function render() {
  if (!root) return;
  injectStyles();

  if (!data || !data.meta) {
    root.innerHTML = `<div class="study-card p-8 text-sm text-red-700">Historical wall-study data could not be loaded.</div>`;
    return;
  }

  const call1 = getStudy("call", "1 DTE");
  const call10 = getStudy("call", "10 DTE");
  const put1 = getStudy("put", "1 DTE");
  const put10 = getStudy("put", "10 DTE");
  const pinCall = data.regimes.find((d) => d.type === "call" && d.name.startsWith("Pin"));
  const momentumCall = data.regimes.find((d) => d.type === "call" && d.name.startsWith("Momentum"));
  const throughCall = data.regimes.find((d) => d.type === "call" && d.name.startsWith("Already"));

  root.innerHTML = `
    <div class="study-grid">
      <section class="study-card p-6 md:p-7">
        <div class="grid lg:grid-cols-[0.95fr_1.05fr] gap-7">
          <div>
            <span class="study-kicker">Research Design</span>
            <h3 class="text-2xl md:text-3xl font-bold mt-2" style="color: var(--primary-blue);">
              The wall hypothesis only survives as a conditional statement.
            </h3>
            <p class="study-copy mt-4">
              We identify, for each monthly expiry observation, the highest-volume same-expiration call wall and put wall within plus or minus four ATR of spot. We observe the wall at 10, 5, and 1 trading days to expiry, then measure whether expiration close finishes beyond the wall and whether the breach exceeds 0.5 ATR.
            </p>
            <p class="study-copy mt-3">
              The test is intentionally framed in ATR units rather than percent return. A 2% move in NVDA and a 2% move in SPY are not equivalent. ATR normalization makes the wall distance and wall failure comparable across underlyings.
            </p>
            <div class="study-card-quiet p-4 mt-5">
              <div class="study-kicker">Event Definition</div>
              <p class="study-copy mt-2">
                Significant breach = expiration close beyond the selected wall by at least 0.5 ATR. The reported statistic is a conditional frequency with binomial confidence intervals, not a price forecast.
              </p>
            </div>
          </div>
          <div class="study-card-quiet p-5">
            <div class="grid sm:grid-cols-2 gap-4">
              ${statBox("Observations", fmtInt(data.summary.observations), "call + put wall events")}
              ${statBox("Universe", `${data.summary.underlyings.length} names`, "index ETFs + mega-cap stocks")}
              ${statBox("Call 1 DTE Sig.", fmtPct(call1.sigBreachRate), `n=${fmtInt(call1.n)}, t=${fmtNum(call1.sigT, 1)}`)}
              ${statBox("Call 10 DTE Sig.", fmtPct(call10.sigBreachRate), `n=${fmtInt(call10.n)}, t=${fmtNum(call10.sigT, 1)}`)}
              ${statBox("Pin Candidate", fmtPct(pinCall.sigBreachRate), `call walls, n=${fmtInt(pinCall.n)}`)}
              ${statBox("Already Through", fmtPct(throughCall.sigBreachRate), `call walls, n=${fmtInt(throughCall.n)}`)}
            </div>
          </div>
        </div>
        <div class="study-note">
          <p><strong>Data limitation:</strong> Polygon historical REST snapshots do not provide historical open-interest snapshots. This study therefore uses historical same-expiration option volume walls, not historical OI walls. Current-chain context is intentionally excluded because it is not evidence for the historical claim.</p>
        </div>
      </section>

      <section class="grid lg:grid-cols-[1fr_0.92fr] gap-5">
        ${chartCard("Exhibit 1", "Time-to-expiry changes wall failure probability", "chart-dte", true, `
          <p>This chart plots significant breach rates with approximate 95% binomial confidence intervals. The call-wall result is the clearest: significant breaches rise from ${fmtPct(call1.sigBreachRate)} at 1 DTE (${ciText(call1)}) to ${fmtPct(call10.sigBreachRate)} at 10 DTE (${ciText(call10)}).</p>
          <p>The interpretation is mechanical, not mystical. With one trading day left, there is less time for price to travel through a wall. With ten trading days left, realized volatility has enough runway to turn the wall into a poor fade candidate.</p>
        `)}
        ${chartCard("Exhibit 2", "ATR distance is the first-order filter", "chart-distance", true, `
          <p>This heatmap averages call and put significant breach rates by DTE and ATR-distance bucket. Darker cells indicate higher failure frequency. “Already through” is not a resistance/support state; it is a continuation state.</p>
          <p>The chart directly rejects a naive wall-fade rule. A wall two ATR away and a wall already crossed contain opposite information, so treating both as “the wall” destroys the signal.</p>
        `)}
      </section>

      <section class="grid lg:grid-cols-2 gap-5">
        ${chartCard("Exhibit 3", "Regime definitions separate fade from momentum", "chart-regime", false, `
          <p>The pin/fade state requires a nearby, dominant wall in lower realized volatility. The momentum-danger state requires a nearby wall, high realized volatility, and high vanna proxy.</p>
          <p>For call walls, significant breach frequency rises from ${fmtPct(pinCall.sigBreachRate)} in the pin/fade state to ${fmtPct(momentumCall.sigBreachRate)} in the momentum-danger state and ${fmtPct(throughCall.sigBreachRate)} once price is already through. This is the core conditional result.</p>
        `)}
        ${chartCard("Exhibit 4", "Vanna alone is not the whole story", "chart-vanna-rv", false, `
          <p>This heatmap conditions on near-wall observations and groups by realized-volatility rank and vanna-proxy rank. The purpose is interaction, not a one-variable sort.</p>
          <p>The practical result is that vanna should not be read without volatility regime. High-vanna, high-volatility states are where wall-fading is most fragile.</p>
        `)}
        ${chartCard("Exhibit 5", "Path behavior into expiration", "chart-path", false, `
          <p>The average path is shown in ATR units relative to the wall. Zero is the wall. Positive means price is beyond the wall in the breach direction.</p>
          <p>Pin/fade candidates remain below the wall on average. Momentum-danger cases move toward or through the wall as expiration approaches.</p>
        `)}
      </section>

      <section class="grid lg:grid-cols-[0.98fr_1.02fr] gap-5">
        ${chartCard("Exhibit 6", "Cross-sectional robustness check", "chart-cross", true, `
          <p>This forest plot shows significant breach rates by underlying and wall type with confidence intervals. It is intentionally not smoothed: single-name options are noisier than index ETFs.</p>
          <p>The evidence is cross-sectional enough to justify the framework, but dispersion is high enough that the study should be used as a state map, not a deterministic signal.</p>
        `)}
        <div class="study-card p-6 overflow-x-auto">
          <span class="study-kicker">Regime Audit</span>
          <h4 class="text-xl font-bold mt-1 mb-4" style="color: var(--primary-blue);">What each state means empirically</h4>
          ${renderRegimeTable()}
          <div class="study-note">
            <p>The “already through” rows are the most important guardrail. Once price is already beyond the wall, treating that wall as support/resistance is conceptually wrong. The observed continuation rates are much higher.</p>
          </div>
        </div>
      </section>
    </div>
  `;

  drawAllCharts();
}

function statBox(label, value, sub) {
  return `
    <div class="study-stat">
      <div class="study-stat-label">${label}</div>
      <div class="text-2xl font-bold mt-2" style="color: #111827;">${value}</div>
      <div class="text-xs text-slate-500 mt-1">${sub}</div>
    </div>
  `;
}

function chartCard(kicker, title, id, tall, note) {
  return `
    <div class="study-card p-5">
      <span class="study-kicker">${kicker}</span>
      <h4 class="text-lg font-bold mt-1 mb-3" style="color: var(--primary-blue);">${title}</h4>
      <div class="study-chart-frame">
        <canvas id="${id}" class="study-chart ${tall ? "" : "study-chart-short"}"></canvas>
      </div>
      <div class="study-note">${note}</div>
    </div>
  `;
}

function ciText(row) {
  const [lo, hi] = pctCi(row.sigBreachRate, row.n);
  return `95% CI ${fmtPct(lo)}-${fmtPct(hi)}`;
}

function getStudy(type, bucket) {
  return data.studies.find((d) => d.type === type && d.bucket === bucket);
}

function renderRegimeTable() {
  const rows = data.regimes.map((row) => {
    const [lo, hi] = pctCi(row.sigBreachRate, row.n);
    return `
      <tr>
        <td class="font-semibold text-slate-800">${row.name}</td>
        <td>${row.type.toUpperCase()}</td>
        <td>${fmtInt(row.n)}</td>
        <td>${fmtPct(row.sigBreachRate)}</td>
        <td>${fmtPct(lo)}-${fmtPct(hi)}</td>
        <td>${fmtNum(row.avgMoveBeyondAtr, 2)} ATR</td>
        <td>${fmtNum(row.sigT, 1)}</td>
      </tr>
    `;
  }).join("");
  return `
    <table class="study-table">
      <thead>
        <tr><th>State</th><th>Type</th><th>N</th><th>Sig. Breach</th><th>95% CI</th><th>Move Beyond</th><th>t</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function setupCanvas(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}

function scale(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  return (value) => r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}

function extent(values, pad = 0.08) {
  const clean = values.filter(Number.isFinite);
  let min = Math.min(...clean);
  let max = Math.max(...clean);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const span = max - min;
  return [min - span * pad, max + span * pad];
}

function clear(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fbfdff";
  ctx.fillRect(0, 0, width, height);
}

function grid(ctx, width, height, margin, yTicks = 4) {
  ctx.save();
  ctx.strokeStyle = palette.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= yTicks; i += 1) {
    const y = margin.top + (height - margin.top - margin.bottom) * i / yTicks;
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(width - margin.right, y);
    ctx.stroke();
  }
  ctx.restore();
}

function axisLabel(ctx, text, x, y, align = "left") {
  ctx.save();
  ctx.fillStyle = palette.slate;
  ctx.font = "11px Inter, sans-serif";
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function yPctAxis(ctx, margin, height, yScale, ticks) {
  ctx.save();
  ctx.fillStyle = palette.slate;
  ctx.font = "10px Inter, sans-serif";
  ctx.textAlign = "right";
  ticks.forEach((tick) => {
    ctx.fillText(fmtPct(tick, 0), margin.left - 8, yScale(tick) + 3);
  });
  ctx.restore();
}

function xPctAxis(ctx, margin, width, height, xScale, ticks) {
  ctx.save();
  ctx.fillStyle = palette.slate;
  ctx.font = "10px Inter, sans-serif";
  ctx.textAlign = "center";
  ticks.forEach((tick) => {
    ctx.fillText(fmtPct(tick, 0), xScale(tick), height - 12);
  });
  ctx.restore();
}

function drawAllCharts() {
  drawDte();
  drawDistance();
  drawRegime();
  drawVannaRv();
  drawPath();
  drawCross();
}

function drawDte() {
  const setup = setupCanvas("chart-dte");
  if (!setup) return;
  const { ctx, width, height } = setup;
  const margin = { top: 28, right: 22, bottom: 42, left: 46 };
  clear(ctx, width, height);
  grid(ctx, width, height, margin);
  const rows = [1, 5, 10].flatMap((dte) => [
    { dte, type: "call", ...getStudy("call", `${dte} DTE`) },
    { dte, type: "put", ...getStudy("put", `${dte} DTE`) },
  ]);
  const y = scale([0, 0.45], [height - margin.bottom, margin.top]);
  const x = scale([0.5, 10.5], [margin.left, width - margin.right]);
  ctx.strokeStyle = palette.grid;
  ctx.beginPath();
  ctx.moveTo(margin.left, y(0.2));
  ctx.lineTo(width - margin.right, y(0.2));
  ctx.stroke();
  yPctAxis(ctx, margin, height, y, [0, 0.15, 0.30, 0.45]);
  rows.forEach((row) => {
    const [lo, hi] = pctCi(row.sigBreachRate, row.n);
    const xx = x(row.dte) + (row.type === "call" ? -10 : 10);
    ctx.strokeStyle = row.type === "call" ? palette.call : palette.put;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xx, y(lo));
    ctx.lineTo(xx, y(hi));
    ctx.stroke();
    ctx.fillStyle = row.type === "call" ? palette.call : palette.put;
    ctx.beginPath();
    ctx.arc(xx, y(row.sigBreachRate), 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText(fmtPct(row.sigBreachRate, 0), xx + 7, y(row.sigBreachRate) + 4);
  });
  [1, 5, 10].forEach((dte) => axisLabel(ctx, `${dte} DTE`, x(dte), height - 15, "center"));
  axisLabel(ctx, "Significant breach probability, 95% CI", margin.left, 15);
  drawLegend(ctx, [{ label: "Call wall", color: palette.call }, { label: "Put wall", color: palette.put }], width - 210, 18);
}

function drawDistance() {
  const setup = setupCanvas("chart-distance");
  if (!setup) return;
  const { ctx, width, height } = setup;
  const margin = { top: 28, right: 16, bottom: 30, left: 86 };
  clear(ctx, width, height);
  const dtes = [1, 5, 10];
  const buckets = ["Already through", "0-0.5 ATR", "0.5-1 ATR", "1-2 ATR", ">2 ATR"];
  const cellW = (width - margin.left - margin.right) / buckets.length;
  const cellH = (height - margin.top - margin.bottom) / dtes.length;
  dtes.forEach((dte, r) => {
    buckets.forEach((bucket, c) => {
      const vals = ["call", "put"].map((type) => data.distance.find((d) => d.type === type && d.dte === dte && d.distance === bucket)?.sigBreachRate).filter(Number.isFinite);
      const p = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      const intensity = Number.isFinite(p) ? Math.max(0, Math.min(1, (p - 0.03) / 0.45)) : 0;
      ctx.fillStyle = `rgba(31,78,121,${0.08 + intensity * 0.62})`;
      ctx.fillRect(margin.left + c * cellW + 2, margin.top + r * cellH + 2, cellW - 4, cellH - 4);
      ctx.fillStyle = intensity > 0.58 ? "#fff" : palette.ink;
      ctx.font = "bold 14px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(Number.isFinite(p) ? fmtPct(p, 0) : "--", margin.left + c * cellW + cellW / 2, margin.top + r * cellH + cellH / 2 + 5);
    });
    axisLabel(ctx, `${dte} DTE`, margin.left - 10, margin.top + r * cellH + cellH / 2 + 4, "right");
  });
  buckets.forEach((bucket, c) => axisLabel(ctx, bucket.replace("Already ", "Already"), margin.left + c * cellW + cellW / 2, height - 10, "center"));
  axisLabel(ctx, "Avg. call/put significant breach rate", margin.left, 15);
}

function drawRegime() {
  const setup = setupCanvas("chart-regime");
  if (!setup) return;
  const { ctx, width, height } = setup;
  const margin = { top: 24, right: 20, bottom: 34, left: 118 };
  clear(ctx, width, height);
  grid(ctx, width, height, margin);
  const rows = data.regimes.filter((r) => r.type === "call" && (r.name.startsWith("Pin") || r.name.startsWith("Momentum") || r.name.startsWith("Already") || r.name.startsWith("Far")));
  const y = scale([-0.5, rows.length - 0.5], [margin.top, height - margin.bottom]);
  const x = scale([0, 0.72], [margin.left, width - margin.right]);
  rows.forEach((row, i) => {
    const [lo, hi] = pctCi(row.sigBreachRate, row.n);
    const yy = y(i);
    const isMomentum = row.name.startsWith("Momentum") || row.name.startsWith("Already");
    ctx.strokeStyle = isMomentum ? palette.momentum : palette.pin;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x(lo), yy);
    ctx.lineTo(x(hi), yy);
    ctx.stroke();
    ctx.fillStyle = isMomentum ? palette.momentum : palette.pin;
    ctx.beginPath();
    ctx.arc(x(row.sigBreachRate), yy, 5, 0, Math.PI * 2);
    ctx.fill();
    axisLabel(ctx, row.name.split(":")[0], margin.left - 8, yy + 4, "right");
    axisLabel(ctx, `n=${row.n}`, x(row.sigBreachRate) + 8, yy + 4);
  });
  xPctAxis(ctx, margin, width, height, x, [0, 0.25, 0.50]);
  axisLabel(ctx, "Call-wall significant breach probability, 95% CI", margin.left, 15);
}

function drawVannaRv() {
  const setup = setupCanvas("chart-vanna-rv");
  if (!setup) return;
  const { ctx, width, height } = setup;
  const margin = { top: 26, right: 16, bottom: 30, left: 70 };
  clear(ctx, width, height);
  const near = data.scatter.filter((d) => d.distanceAtr >= 0 && d.distanceAtr <= 1.2);
  const rvBuckets = [
    ["Low RV", (d) => d.rvRank <= 0.33],
    ["Mid RV", (d) => d.rvRank > 0.33 && d.rvRank < 0.67],
    ["High RV", (d) => d.rvRank >= 0.67],
  ];
  const vBuckets = [
    ["Low vanna", (d) => d.vannaProxyPct <= 0.33],
    ["Mid vanna", (d) => d.vannaProxyPct > 0.33 && d.vannaProxyPct < 0.67],
    ["High vanna", (d) => d.vannaProxyPct >= 0.67],
  ];
  const cellW = (width - margin.left - margin.right) / vBuckets.length;
  const cellH = (height - margin.top - margin.bottom) / rvBuckets.length;
  rvBuckets.forEach(([rvLabel, rvFn], r) => {
    vBuckets.forEach(([vLabel, vFn], c) => {
      const sub = near.filter((d) => rvFn(d) && vFn(d));
      const p = sub.length ? sub.filter((d) => d.significantBreach).length / sub.length : null;
      const intensity = Number.isFinite(p) ? Math.max(0, Math.min(1, p / 0.42)) : 0;
      ctx.fillStyle = `rgba(154,106,18,${0.08 + intensity * 0.65})`;
      ctx.fillRect(margin.left + c * cellW + 2, margin.top + r * cellH + 2, cellW - 4, cellH - 4);
      ctx.fillStyle = intensity > 0.55 ? "#fff" : palette.ink;
      ctx.font = "bold 15px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(Number.isFinite(p) ? fmtPct(p, 0) : "--", margin.left + c * cellW + cellW / 2, margin.top + r * cellH + cellH / 2 + 1);
      ctx.font = "10px Inter, sans-serif";
      ctx.fillText(`n=${sub.length}`, margin.left + c * cellW + cellW / 2, margin.top + r * cellH + cellH / 2 + 17);
    });
    axisLabel(ctx, rvLabel, margin.left - 8, margin.top + r * cellH + cellH / 2 + 4, "right");
  });
  vBuckets.forEach(([label], c) => axisLabel(ctx, label, margin.left + c * cellW + cellW / 2, height - 9, "center"));
}

function drawPath() {
  const setup = setupCanvas("chart-path");
  if (!setup) return;
  const { ctx, width, height } = setup;
  const margin = { top: 24, right: 18, bottom: 32, left: 42 };
  clear(ctx, width, height);
  grid(ctx, width, height, margin);
  const pin = data.paths.filter((d) => d.setup === "Pin/fade candidate");
  const momentum = data.paths.filter((d) => d.setup === "Momentum danger");
  const y = scale(extent([...pin, ...momentum].map((d) => d.value), 0.18), [height - margin.bottom, margin.top]);
  const x = scale([0, 10], [margin.left, width - margin.right]);
  ctx.strokeStyle = "rgba(15,23,42,0.30)";
  ctx.beginPath();
  ctx.moveTo(margin.left, y(0));
  ctx.lineTo(width - margin.right, y(0));
  ctx.stroke();
  axisLabel(ctx, "0", margin.left - 8, y(0) + 3, "right");
  line(ctx, pin, x, y, palette.pin);
  line(ctx, momentum, x, y, palette.momentum);
  axisLabel(ctx, "Progress from observation to expiry", margin.left, height - 8);
  axisLabel(ctx, "ATR beyond wall", margin.left, 15);
  drawLegend(ctx, [{ label: "Pin/fade", color: palette.pin }, { label: "Momentum", color: palette.momentum }], width - 220, 18);
}

function drawCross() {
  const setup = setupCanvas("chart-cross");
  if (!setup) return;
  const { ctx, width, height } = setup;
  const margin = { top: 24, right: 22, bottom: 30, left: 56 };
  clear(ctx, width, height);
  grid(ctx, width, height, margin);
  const symbols = [...new Set(data.cross.map((d) => d.underlying))];
  const y = scale([-0.5, symbols.length - 0.5], [margin.top, height - margin.bottom]);
  const x = scale([0, 0.55], [margin.left, width - margin.right]);
  symbols.forEach((symbol, i) => {
    ["call", "put"].forEach((type, j) => {
      const row = data.cross.find((d) => d.underlying === symbol && d.type === type);
      if (!row) return;
      const [lo, hi] = pctCi(row.sigBreachRate, row.n);
      const yy = y(i) + (j === 0 ? -5 : 5);
      ctx.strokeStyle = type === "call" ? palette.call : palette.put;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x(lo), yy);
      ctx.lineTo(x(hi), yy);
      ctx.stroke();
      ctx.fillStyle = type === "call" ? palette.call : palette.put;
      ctx.beginPath();
      ctx.arc(x(row.sigBreachRate), yy, 3.8, 0, Math.PI * 2);
      ctx.fill();
    });
    axisLabel(ctx, symbol, margin.left - 8, y(i) + 4, "right");
  });
  xPctAxis(ctx, margin, width, height, x, [0, 0.20, 0.40]);
  axisLabel(ctx, "Significant breach probability, 95% CI", margin.left, 15);
  drawLegend(ctx, [{ label: "Call", color: palette.call }, { label: "Put", color: palette.put }], width - 160, 18);
}

function line(ctx, rows, xScale, yScale, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  rows.forEach((row, i) => {
    const x = xScale(row.step);
    const y = yScale(row.value);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  rows.forEach((row) => {
    ctx.beginPath();
    ctx.arc(xScale(row.step), yScale(row.value), 2.4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });
  ctx.restore();
}

function drawLegend(ctx, items, x, y) {
  ctx.save();
  ctx.font = "11px Inter, sans-serif";
  items.forEach((item, i) => {
    const dx = i * 84;
    ctx.fillStyle = item.color;
    ctx.fillRect(x + dx, y - 8, 18, 3);
    ctx.fillStyle = palette.slate;
    ctx.fillText(item.label, x + dx + 24, y - 4);
  });
  ctx.restore();
}

render();
window.addEventListener("resize", () => {
  if (!data || !root) return;
  window.requestAnimationFrame(drawAllCharts);
});
