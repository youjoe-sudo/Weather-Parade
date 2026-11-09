const charts = {};

const palette = {
  navy: "#0B1F44",
  blue: "#0EA5E9",
  blueDeep: "#0284C7",
  sky: "#7DD3FC",
  sun: "#FBBF24",
  success: "#34D399",
  danger: "#FB7185",
  muted: "#5B6B82",
  line: "rgba(11, 31, 68, 0.08)",
};

const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

if (window.Chart) {
  Chart.defaults.font.family =
    '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif';
  Chart.defaults.font.size = 11;
  Chart.defaults.color = palette.muted;
  Chart.defaults.borderColor = palette.line;
  Chart.defaults.animation.duration = reducedMotion() ? 0 : 650;
  Chart.defaults.animation.easing = "easeOutQuart";
}

function destroy(id) {
  if (charts[id]) {
    charts[id].destroy();
    delete charts[id];
  }
}

function setEmpty(id, empty) {
  const el = document.querySelector(`[data-chart-empty="${id}"]`);
  if (!el) return;
  el.hidden = !empty;
}

function baseOptions({ yTitle = "", legend = true } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: legend,
        position: "bottom",
        align: "start",
        labels: {
          color: palette.muted,
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 7,
          boxHeight: 7,
          padding: 16,
          font: { size: 10.5, weight: 500 },
        },
      },
      tooltip: {
        backgroundColor: "#FFFFFF",
        titleColor: palette.navy,
        bodyColor: palette.muted,
        borderColor: "rgba(11, 31, 68, 0.12)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 5,
        boxPadding: 4,
        titleFont: { family: '"Poppins", sans-serif', size: 11, weight: 600 },
        bodyFont: { size: 11 },
        displayColors: true,
        boxWidth: 7,
        boxHeight: 7,
      },
    },
    scales: {
      x: {
        ticks: {
          color: palette.muted,
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
          font: { size: 10 },
        },
        grid: { display: false },
        border: { color: "rgba(11, 31, 68, 0.1)" },
      },
      y: {
        beginAtZero: false,
        title: yTitle
          ? {
              display: true,
              text: yTitle,
              color: palette.muted,
              font: { size: 10, weight: 500 },
            }
          : undefined,
        ticks: {
          color: palette.muted,
          maxTicksLimit: 5,
          font: { size: 10 },
        },
        grid: { color: palette.line, drawTicks: false },
        border: { display: false },
      },
    },
  };
}

export function renderTempChart(canvasId, rows, _thresholds) {
  destroy(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const labels = rows.map((row) => row.date);
  const mean = rows.map((row) =>
    Number.isFinite(row.tmean)
      ? row.tmean
      : Number.isFinite(row.tmax) && Number.isFinite(row.tmin)
        ? (row.tmax + row.tmin) / 2
        : null,
  );
  const max = rows.map((row) => (Number.isFinite(row.tmax) ? row.tmax : null));
  const min = rows.map((row) => (Number.isFinite(row.tmin) ? row.tmin : null));

  setEmpty(canvasId, labels.length === 0);
  if (!labels.length) return;

  charts[canvasId] = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Daily mean",
          data: mean,
          borderColor: palette.blue,
          backgroundColor: "rgba(14, 165, 233, 0.07)",
          fill: true,
          tension: 0.28,
          pointRadius: 0,
          pointHoverRadius: 3,
          borderWidth: 2,
        },
        {
          label: "Maximum",
          data: max,
          borderColor: palette.danger,
          borderDash: [4, 3],
          fill: false,
          tension: 0.22,
          pointRadius: 0,
          pointHoverRadius: 3,
          borderWidth: 1.4,
        },
        {
          label: "Minimum",
          data: min,
          borderColor: palette.sky,
          borderDash: [4, 3],
          fill: false,
          tension: 0.22,
          pointRadius: 0,
          pointHoverRadius: 3,
          borderWidth: 1.4,
        },
      ],
    },
    options: {
      ...baseOptions({ yTitle: "°C" }),
      plugins: {
        ...baseOptions({ yTitle: "°C" }).plugins,
        tooltip: {
          ...baseOptions({ yTitle: "°C" }).plugins.tooltip,
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${context.parsed.y?.toFixed(1)} °C`,
          },
        },
      },
    },
  });
}

export function renderRainChart(canvasId, rows, thresholds) {
  destroy(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const threshold = Number(thresholds?.rain ?? 1);
  const labels = rows.map((row) => row.date);
  const values = rows.map((row) =>
    Number.isFinite(row.precip) ? row.precip : null,
  );
  const colors = values.map((value) =>
    Number.isFinite(value) && value >= threshold
      ? "rgba(251, 113, 133, 0.78)"
      : "rgba(14, 165, 233, 0.62)",
  );

  setEmpty(canvasId, labels.length === 0);
  if (!labels.length) return;

  const options = baseOptions({ yTitle: "mm", legend: false });
  charts[canvasId] = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Daily precipitation",
          data: values,
          backgroundColor: colors,
          borderRadius: 2,
          maxBarThickness: 12,
        },
      ],
    },
    options: {
      ...options,
      plugins: {
        ...options.plugins,
        tooltip: {
          ...options.plugins.tooltip,
          callbacks: {
            label: (context) => `${context.parsed.y ?? 0} mm`,
          },
        },
      },
    },
  });
}

export function renderRiskChart(canvasId, metrics) {
  destroy(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const items = [
    ["Very Hot", metrics?.heatRisk?.value, palette.danger],
    ["Very Cold", metrics?.coldRisk?.value, palette.sky],
    ["Very Windy", metrics?.windRisk?.value, palette.sun],
    ["Very Wet", metrics?.rainRisk?.value, palette.blue],
    ["Uncomfortable", Number.isFinite(metrics?.comfortRisk) ? metrics.comfortRisk : null, palette.navy],
  ].filter((item) => Number.isFinite(item[1]));

  setEmpty(canvasId, items.length === 0);
  if (!items.length) return;

  const options = baseOptions({ legend: false });
  options.indexAxis = "y";
  options.scales = {
    x: {
      beginAtZero: true,
      max: 100,
      ticks: {
        color: palette.muted,
        callback: (value) => `${value}%`,
        maxTicksLimit: 5,
        font: { size: 10 },
      },
      grid: { color: palette.line, drawTicks: false },
      border: { display: false },
    },
    y: {
      ticks: { color: palette.navy, font: { size: 10.5, weight: 500 } },
      grid: { display: false },
      border: { display: false },
    },
  };

  charts[canvasId] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: items.map((item) => item[0]),
      datasets: [
        {
          data: items.map((item) => item[1]),
          backgroundColor: items.map((item) => item[2]),
          borderRadius: 2,
          maxBarThickness: 16,
        },
      ],
    },
    options: {
      ...options,
      plugins: {
        ...options.plugins,
        tooltip: {
          ...options.plugins.tooltip,
          callbacks: {
            label: (context) => `${context.parsed.x}% of valid observations`,
          },
        },
      },
    },
  });
}

export function renderSeasonalChart(canvasId, monthly) {
  destroy(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const values = monthly.map((item) =>
    Number.isFinite(item.comfort) ? item.comfort : null,
  );
  const colors = values.map((value) => {
    if (!Number.isFinite(value)) return "rgba(199, 211, 226, 0.6)";
    if (value >= 70) return "rgba(52, 211, 153, 0.72)";
    if (value >= 45) return "rgba(251, 191, 36, 0.72)";
    return "rgba(251, 113, 133, 0.7)";
  });

  setEmpty(canvasId, values.every((value) => !Number.isFinite(value)));
  if (values.every((value) => !Number.isFinite(value))) return;

  const options = baseOptions({ yTitle: "Score", legend: false });
  options.scales.y.max = 100;
  options.scales.y.beginAtZero = true;

  charts[canvasId] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: names,
      datasets: [
        {
          label: "Comfort score",
          data: values,
          backgroundColor: colors,
          borderRadius: 2,
          maxBarThickness: 30,
        },
      ],
    },
    options: {
      ...options,
      plugins: {
        ...options.plugins,
        tooltip: {
          ...options.plugins.tooltip,
          callbacks: {
            label: (context) =>
              Number.isFinite(context.parsed.y)
                ? `Comfort score: ${context.parsed.y}/100`
                : "Insufficient data for this month",
          },
        },
      },
    },
  });
}

export function renderForecastChart(canvasId, hourly) {
  destroy(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const times = (hourly?.time || []).slice(0, 48);
  const temp = (hourly?.temperature_2m || []).slice(0, 48);
  const precip = (hourly?.precipitation || []).slice(0, 48);
  const labels = times.map((value) => value.replace("T", " ").slice(5));

  setEmpty(canvasId, labels.length === 0);
  if (!labels.length) return;

  const options = baseOptions({ yTitle: "°C" });
  options.scales.y1 = {
    position: "right",
    beginAtZero: true,
    title: {
      display: true,
      text: "mm",
      color: palette.muted,
      font: { size: 10, weight: 500 },
    },
    ticks: { color: palette.muted, maxTicksLimit: 5, font: { size: 10 } },
    grid: { drawOnChartArea: false },
    border: { display: false },
  };

  charts[canvasId] = new Chart(ctx, {
    data: {
      labels,
      datasets: [
        {
          type: "line",
          label: "Temperature (°C)",
          data: temp,
          borderColor: palette.blue,
          backgroundColor: "rgba(14, 165, 233, 0.06)",
          fill: true,
          tension: 0.28,
          pointRadius: 0,
          pointHoverRadius: 3,
          borderWidth: 2,
          yAxisID: "y",
        },
        {
          type: "bar",
          label: "Precipitation (mm)",
          data: precip,
          backgroundColor: "rgba(125, 211, 252, 0.55)",
          borderRadius: 2,
          maxBarThickness: 8,
          yAxisID: "y1",
        },
      ],
    },
    options,
  });
}

export function resetCharts() {
  Object.keys(charts).forEach(destroy);
  document.querySelectorAll("[data-chart-empty]").forEach((el) => {
    el.hidden = false;
  });
}

export function destroyAll() {
  Object.keys(charts).forEach(destroy);
}
