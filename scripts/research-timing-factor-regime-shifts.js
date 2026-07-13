(function () {
  const data = window.TIMING_FACTOR_REGIME_DATA;

  const palette = {
    ink: "#111827",
    navy: "#172554",
    blue: "#2563eb",
    blueDark: "#1f4e79",
    gold: "#b88919",
    goldLight: "#d4af37",
    slate: "#475569",
    muted: "#94a3b8",
    grid: "rgba(15, 23, 42, 0.11)",
    paper: "#fbfdff",
    softBlue: "#dbeafe",
  };

  const factorColors = {
    market: "#111827",
    value: "#2563eb",
    size: "#d4af37",
    momentum: "#0f766e",
    quality: "#16a34a",
    low_volatility: "#7c3aed",
    growth: "#c2410c",
  };

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

  function clear(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = palette.paper;
    ctx.fillRect(0, 0, width, height);
  }

  function scale(domain, range) {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    return (value) => r0 + ((value - d0) / (d1 - d0 || 1)) * (r1 - r0);
  }

  function extent(values, padding = 0.08) {
    const clean = values.filter(Number.isFinite);
    let min = Math.min(...clean);
    let max = Math.max(...clean);
    if (min === max) {
      min -= 1;
      max += 1;
    }
    const span = max - min;
    return [min - span * padding, max + span * padding];
  }

  function text(ctx, value, x, y, options = {}) {
    ctx.save();
    ctx.fillStyle = options.color || palette.slate;
    ctx.font = options.font || "11px Inter, sans-serif";
    ctx.textAlign = options.align || "left";
    ctx.textBaseline = options.baseline || "alphabetic";
    ctx.fillText(value, x, y);
    ctx.restore();
  }

  function grid(ctx, bounds, yTicks = 4, xTicks = 0) {
    const { left, right, top, bottom } = bounds;
    ctx.save();
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= yTicks; i += 1) {
      const y = top + ((bottom - top) * i) / yTicks;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }
    for (let i = 0; i <= xTicks; i += 1) {
      if (!xTicks) break;
      const x = left + ((right - left) * i) / xTicks;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawLine(ctx, values, xScale, yScale, color, width = 2, dash = []) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    values.forEach((value, index) => {
      if (!Number.isFinite(value)) return;
      const x = xScale(index);
      const y = yScale(value);
      if (index === 0 || !Number.isFinite(values[index - 1])) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function drawLegend(ctx, items, x, y, columns = items.length) {
    const columnWidth = 112;
    items.forEach((item, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const xx = x + column * columnWidth;
      const yy = y + row * 19;
      ctx.save();
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(xx, yy);
      ctx.lineTo(xx + 18, yy);
      ctx.stroke();
      ctx.restore();
      text(ctx, item.label, xx + 25, yy + 4, { font: "10px Inter, sans-serif" });
    });
  }

  function drawFactorPerformance() {
    const setup = setupCanvas("chart-factor-performance");
    if (!setup) return;
    const { ctx, width, height } = setup;
    clear(ctx, width, height);
    const bounds = { left: 58, right: width - 18, top: 62, bottom: height - 34 };
    grid(ctx, bounds, 4, 6);
    const labels = data.factorPerformance.labels;
    const series = data.factorPerformance.series;
    const allValues = Object.values(series).flat().filter((value) => value > 0);
    const logValues = allValues.map(Math.log10);
    const logExtent = extent(logValues, 0.03);
    const x = scale([0, labels.length - 1], [bounds.left, bounds.right]);
    const y = scale(logExtent, [bounds.bottom, bounds.top]);

    Object.entries(series).forEach(([name, values]) => {
      drawLine(
        ctx,
        values.map((value) => (value > 0 ? Math.log10(value) : null)),
        x,
        y,
        factorColors[name] || palette.slate,
        name === "momentum" || name === "market" ? 2.2 : 1.6
      );
    });

    [0.1, 1, 10, 100].forEach((tick) => {
      const logTick = Math.log10(tick);
      if (logTick < logExtent[0] || logTick > logExtent[1]) return;
      text(ctx, tick >= 1 ? `$${tick}` : "$0.1", bounds.left - 9, y(logTick) + 3, {
        align: "right",
        font: "10px Inter, sans-serif",
      });
    });
    [1970, 1980, 1990, 2000, 2010, 2020].forEach((year) => {
      const index = labels.findIndex((label) => label.startsWith(String(year)));
      if (index >= 0) text(ctx, String(year), x(index), height - 12, { align: "center" });
    });
    drawLegend(
      ctx,
      Object.keys(series).map((name) => ({ label: name.replace("_", " "), color: factorColors[name] })),
      bounds.left,
      20,
      4
    );
    text(ctx, "Growth of $1 · log scale", bounds.left, height - 12, {
      color: palette.navy,
      font: "600 10px Inter, sans-serif",
    });
  }

  function drawHorizontalBars(id, key, valueFormatter, maxValue) {
    const setup = setupCanvas(id);
    if (!setup) return;
    const { ctx, width, height } = setup;
    clear(ctx, width, height);
    const rows = [...data.drivers].sort((a, b) => b[key] - a[key]);
    const bounds = { left: 154, right: width - 55, top: 20, bottom: height - 30 };
    const rowHeight = (bounds.bottom - bounds.top) / rows.length;
    const x = scale([0, maxValue], [bounds.left, bounds.right]);
    grid(ctx, bounds, 0, 5);
    rows.forEach((row, index) => {
      const value = row[key];
      const y = bounds.top + index * rowHeight + rowHeight * 0.18;
      const h = rowHeight * 0.62;
      ctx.fillStyle = row.feature === "factor_mom_disp" ? palette.navy : "#cbd5e1";
      ctx.fillRect(bounds.left, y, Math.max(1, x(value) - bounds.left), h);
      text(ctx, row.feature, bounds.left - 9, y + h / 2 + 3, {
        align: "right",
        color: row.feature === "factor_mom_disp" ? palette.navy : palette.slate,
        font: `${row.feature === "factor_mom_disp" ? "700" : "500"} 11px Inter, sans-serif`,
      });
      text(ctx, valueFormatter(value, row), x(value) + 8, y + h / 2 + 3, {
        color: row.feature === "factor_mom_disp" ? palette.navy : palette.slate,
        font: `${row.feature === "factor_mom_disp" ? "700" : "500"} 10px Inter, sans-serif`,
      });
    });
  }

  function drawDriverRanking() {
    drawHorizontalBars(
      "chart-driver-ranking",
      "composite_score",
      (value, row) => `${value.toFixed(2)} · ${row.best_lead_months}mo lead`,
      1.22
    );
  }

  function drawStability() {
    drawHorizontalBars(
      "chart-stability",
      "stability_topk_freq",
      (value) => `${Math.round(value * 100)}%`,
      1.04
    );
  }

  function drawDispersionHistory() {
    const setup = setupCanvas("chart-dispersion-history");
    if (!setup) return;
    const { ctx, width, height } = setup;
    clear(ctx, width, height);
    const labels = data.dispersion.labels;
    const values = data.dispersion.values;
    const bounds = { left: 55, right: width - 18, top: 24, bottom: height - 32 };
    const x = scale([0, labels.length - 1], [bounds.left, bounds.right]);
    const yExtent = [0, 0.4];
    const y = scale(yExtent, [bounds.bottom, bounds.top]);
    grid(ctx, bounds, 4, 6);

    data.dispersion.events.forEach((date) => {
      const index = labels.indexOf(date);
      if (index < 0) return;
      ctx.save();
      ctx.strokeStyle = "rgba(71, 85, 105, 0.26)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x(index), bounds.top);
      ctx.lineTo(x(index), bounds.bottom);
      ctx.stroke();
      ctx.restore();
    });

    ctx.save();
    ctx.fillStyle = "rgba(37, 99, 235, 0.08)";
    ctx.beginPath();
    values.forEach((value, index) => {
      if (index === 0) ctx.moveTo(x(index), y(value));
      else ctx.lineTo(x(index), y(value));
    });
    ctx.lineTo(x(values.length - 1), bounds.bottom);
    ctx.lineTo(x(0), bounds.bottom);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawLine(ctx, values, x, y, palette.blueDark, 2);

    [0, 0.1, 0.2, 0.3, 0.4].forEach((tick) => {
      text(ctx, tick.toFixed(1), bounds.left - 8, y(tick) + 3, { align: "right" });
    });
    [1970, 1980, 1990, 2000, 2010, 2020].forEach((year) => {
      const index = labels.findIndex((label) => label.startsWith(String(year)));
      if (index >= 0) text(ctx, String(year), x(index), height - 11, { align: "center" });
    });
    data.dispersion.peaks.forEach((peak) => {
      const index = labels.indexOf(peak.date);
      if (index < 0) return;
      text(ctx, peak.label, x(index), Math.max(14, y(values[index]) - 12), {
        align: "center",
        color: palette.navy,
        font: "600 10px Inter, sans-serif",
      });
    });
  }

  function drawEventStudy() {
    const setup = setupCanvas("chart-event-study");
    if (!setup) return;
    const { ctx, width, height } = setup;
    clear(ctx, width, height);
    const study = data.eventStudy;
    const bounds = { left: 52, right: width - 18, top: 24, bottom: height - 36 };
    const allValues = study.paths.flat();
    const yExtent = extent(allValues, 0.06);
    const x = scale([0, study.offsets.length - 1], [bounds.left, bounds.right]);
    const y = scale(yExtent, [bounds.bottom, bounds.top]);
    grid(ctx, bounds, 5, 12);
    study.paths.forEach((path) => drawLine(ctx, path, x, y, "rgba(148, 163, 184, 0.24)", 0.8));
    drawLine(ctx, study.mean, x, y, palette.navy, 3);
    drawLine(ctx, study.median, x, y, palette.blue, 2, [7, 5]);
    const peakIndex = study.offsets.indexOf(-5);
    ctx.save();
    ctx.strokeStyle = palette.gold;
    ctx.setLineDash([3, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x(peakIndex), bounds.top);
    ctx.lineTo(x(peakIndex), bounds.bottom);
    ctx.stroke();
    ctx.restore();
    study.offsets.forEach((offset, index) => {
      text(ctx, offset === 0 ? "t0" : `t${offset}`, x(index), height - 12, { align: "center" });
    });
    drawLegend(ctx, [
      { label: "Mean z-score", color: palette.navy },
      { label: "Median z-score", color: palette.blue },
    ], bounds.left + 4, 16, 2);
    text(ctx, `Peak ${study.mean[peakIndex].toFixed(2)} at t−5`, x(peakIndex), y(study.mean[peakIndex]) - 12, {
      align: "center",
      color: palette.gold,
      font: "700 11px Inter, sans-serif",
    });
  }

  function drawCaseStudies() {
    const setup = setupCanvas("chart-case-studies");
    if (!setup) return;
    const { ctx, width, height } = setup;
    clear(ctx, width, height);
    const columns = 3;
    const rows = 2;
    const gapX = 22;
    const gapY = 40;
    const outer = { left: 38, right: 14, top: 36, bottom: 28 };
    const cellWidth = (width - outer.left - outer.right - gapX * (columns - 1)) / columns;
    const cellHeight = (height - outer.top - outer.bottom - gapY) / rows;
    const offsets = data.eventStudy.offsets;
    const y = scale([-1.5, 4.2], [cellHeight - 20, 6]);

    data.caseStudies.forEach((study, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const originX = outer.left + column * (cellWidth + gapX);
      const originY = outer.top + row * (cellHeight + gapY);
      const x = scale([0, offsets.length - 1], [originX, originX + cellWidth]);
      const yLocal = (value) => originY + y(value);

      ctx.save();
      ctx.strokeStyle = palette.grid;
      ctx.lineWidth = 1;
      [-1, 0, 1, 2, 3, 4].forEach((tick) => {
        ctx.beginPath();
        ctx.moveTo(originX, yLocal(tick));
        ctx.lineTo(originX + cellWidth, yLocal(tick));
        ctx.stroke();
      });
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = palette.gold;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x(offsets.indexOf(-5)), originY + 4);
      ctx.lineTo(x(offsets.indexOf(-5)), originY + cellHeight - 20);
      ctx.stroke();
      ctx.restore();
      drawLine(ctx, study.values, x, yLocal, palette.navy, 2.2);
      study.values.forEach((value, point) => {
        ctx.beginPath();
        ctx.arc(x(point), yLocal(value), 2.4, 0, Math.PI * 2);
        ctx.fillStyle = palette.navy;
        ctx.fill();
      });
      text(ctx, `${study.date} · ${study.gained} ← ${study.lost}`, originX + cellWidth / 2, originY - 17, {
        align: "center",
        color: palette.navy,
        font: "700 10px Inter, sans-serif",
      });
      text(ctx, `${Math.round(study.swing)}% leadership swing`, originX + cellWidth / 2, originY - 4, {
        align: "center",
        font: "10px Inter, sans-serif",
      });
      [-12, -9, -6, -3, 0].forEach((offset) => {
        text(ctx, offset === 0 ? "t0" : String(offset), x(offsets.indexOf(offset)), originY + cellHeight - 4, {
          align: "center",
          font: "9px Inter, sans-serif",
        });
      });
    });
  }

  function drawQuintiles() {
    const setup = setupCanvas("chart-quintile-lift");
    if (!setup) return;
    const { ctx, width, height } = setup;
    clear(ctx, width, height);
    const q = data.quintiles;
    const bounds = { left: 52, right: width - 16, top: 24, bottom: height - 40 };
    const xStep = (bounds.right - bounds.left) / q.labels.length;
    const y = scale([0, 0.66], [bounds.bottom, bounds.top]);
    grid(ctx, bounds, 4, 0);
    const barWidth = xStep * 0.62;
    q.rates.forEach((rate, index) => {
      const x = bounds.left + index * xStep + (xStep - barWidth) / 2;
      ctx.fillStyle = index === 4 ? palette.navy : index === 3 ? palette.softBlue : "#cbd5e1";
      ctx.fillRect(x, y(rate), barWidth, bounds.bottom - y(rate));
      text(ctx, `${Math.round(rate * 100)}%`, x + barWidth / 2, y(rate) - 17, {
        align: "center",
        color: palette.navy,
        font: "700 12px Inter, sans-serif",
      });
      text(ctx, `${(rate / q.baseRate).toFixed(2)}×`, x + barWidth / 2, y(rate) - 5, {
        align: "center",
        font: "10px Inter, sans-serif",
      });
      text(ctx, index === 0 ? "Q1 · low" : index === 4 ? "Q5 · high" : q.labels[index], x + barWidth / 2, height - 15, {
        align: "center",
      });
    });
    ctx.save();
    ctx.strokeStyle = palette.blue;
    ctx.setLineDash([7, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bounds.left, y(q.baseRate));
    ctx.lineTo(bounds.right, y(q.baseRate));
    ctx.stroke();
    ctx.restore();
    text(ctx, `Base rate ${Math.round(q.baseRate * 100)}%`, bounds.right - 4, y(q.baseRate) - 7, {
      align: "right",
      color: palette.blue,
      font: "600 10px Inter, sans-serif",
    });
  }

  function heatColor(value) {
    const alpha = 0.08 + Math.abs(value) * 0.82;
    return value >= 0 ? `rgba(37, 99, 235, ${alpha})` : `rgba(212, 175, 55, ${alpha})`;
  }

  function drawCorrelations() {
    const setup = setupCanvas("chart-correlations");
    if (!setup) return;
    const { ctx, width, height } = setup;
    clear(ctx, width, height);
    const labels = data.correlations.labels;
    const matrix = data.correlations.matrix;
    const left = 160;
    const top = 18;
    const size = Math.min(width - left - 18, height - top - 72);
    const cell = size / labels.length;
    matrix.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        ctx.fillStyle = heatColor(value);
        ctx.fillRect(left + columnIndex * cell, top + rowIndex * cell, cell - 2, cell - 2);
        text(ctx, value.toFixed(2), left + columnIndex * cell + cell / 2, top + rowIndex * cell + cell / 2 + 4, {
          align: "center",
          color: Math.abs(value) > 0.62 ? "#ffffff" : palette.ink,
          font: `${rowIndex === columnIndex ? "700" : "600"} 13px Inter, sans-serif`,
        });
      });
      text(ctx, labels[rowIndex], left - 10, top + rowIndex * cell + cell / 2 + 4, {
        align: "right",
        font: "10px Inter, sans-serif",
      });
    });
    labels.forEach((label, index) => {
      ctx.save();
      ctx.translate(left + index * cell + cell / 2, top + size + 12);
      ctx.rotate(-Math.PI / 5);
      text(ctx, label, 0, 0, { font: "10px Inter, sans-serif" });
      ctx.restore();
    });
  }

  function drawRegimes() {
    const setup = setupCanvas("chart-volatility-regimes");
    if (!setup) return;
    const { ctx, width, height } = setup;
    clear(ctx, width, height);
    const bounds = { left: 54, right: width - 16, top: 24, bottom: height - 55 };
    const y = scale([0, 3.5], [bounds.bottom, bounds.top]);
    grid(ctx, bounds, 5, 0);
    const step = (bounds.right - bounds.left) / 2;
    const barWidth = step * 0.52;
    data.regimes.forEach((regime, index) => {
      const x = bounds.left + index * step + (step - barWidth) / 2;
      ctx.fillStyle = index === 0 ? palette.navy : "#cbd5e1";
      ctx.fillRect(x, y(regime.lift), barWidth, bounds.bottom - y(regime.lift));
      text(ctx, `${regime.lift.toFixed(2)}×`, x + barWidth / 2, y(regime.lift) - 21, {
        align: "center",
        color: palette.navy,
        font: "700 13px Inter, sans-serif",
      });
      text(ctx, `AP ${regime.ap.toFixed(2)}`, x + barWidth / 2, y(regime.lift) - 7, {
        align: "center",
        font: "600 10px Inter, sans-serif",
      });
      text(ctx, regime.label, x + barWidth / 2, height - 28, { align: "center" });
      text(ctx, regime.sub, x + barWidth / 2, height - 13, { align: "center", font: "10px Inter, sans-serif" });
    });
    ctx.save();
    ctx.strokeStyle = palette.blue;
    ctx.setLineDash([7, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bounds.left, y(1));
    ctx.lineTo(bounds.right, y(1));
    ctx.stroke();
    ctx.restore();
    text(ctx, "No-skill baseline · 1×", bounds.right - 3, y(1) - 7, {
      align: "right",
      color: palette.blue,
      font: "600 10px Inter, sans-serif",
    });
  }

  function drawAllCharts() {
    if (!data) return;
    drawFactorPerformance();
    drawDriverRanking();
    drawStability();
    drawDispersionHistory();
    drawEventStudy();
    drawCaseStudies();
    drawQuintiles();
    drawCorrelations();
    drawRegimes();
  }

  if (!data) {
    document.querySelectorAll(".factor-chart").forEach((canvas) => {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#991b1b";
      ctx.font = "14px Inter, sans-serif";
      ctx.fillText("Research data could not be loaded.", 16, 28);
    });
    return;
  }

  drawAllCharts();
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => window.requestAnimationFrame(drawAllCharts));
  }
  let resizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => window.requestAnimationFrame(drawAllCharts), 120);
  });
})();
