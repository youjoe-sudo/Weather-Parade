import { $, esc, riskLabel, round } from "./utils.js";
import { t } from "./i18n.js";

let noticeTimer;

export function refreshIcons() {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
  }
}

export function showError(message) {
  const el = $("#global-error");
  if (!el) return;
  el.hidden = false;
  el.className = "error-box fade-in";
  el.textContent = message;
}

export function clearError() {
  const el = $("#global-error");
  if (el) {
    el.hidden = true;
    el.textContent = "";
  }
}

export function showNotice(message, type = "notice") {
  const el = $("#global-notice");
  if (!el) return;
  window.clearTimeout(noticeTimer);
  el.hidden = false;
  el.className = `${type === "info" ? "info-box" : "notice"} fade-in`;
  el.textContent = message;
  noticeTimer = window.setTimeout(() => {
    el.hidden = true;
    el.textContent = "";
  }, 7000);
}

export function clearNotice() {
  const el = $("#global-notice");
  if (el) {
    el.hidden = true;
    el.textContent = "";
  }
}

export function setStatus(key, value) {
  const el = $(`#status-${key}`);
  if (el) el.textContent = value;
}

export function setWorkspaceStatus(mode, text) {
  const wrap = $("#workspace-status");
  const label = $("#workspace-status-text");
  if (!wrap || !label) return;
  wrap.classList.remove("is-ready", "is-loading");
  if (mode) wrap.classList.add(`is-${mode}`);
  label.textContent = text;
}

export function renderDashboard(loc, date, histState, fcState) {
  const name = loc ? `${loc.name}${loc.country ? `, ${loc.country}` : ""}` : "—";
  $("#loc-name").textContent = name;
  $("#loc-coords").textContent = loc
    ? `${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}`
    : "—";
  $("#loc-date").textContent = date || "—";
  setStatus("historical", histState || "—");
  setStatus("forecast", fcState || "—");

  if (!loc) {
    setWorkspaceStatus("", t("workspace_status_idle"));
  } else if (histState === t("loading")) {
    setWorkspaceStatus("loading", t("workspace_status_loading"));
  } else {
    setWorkspaceStatus("ready", `${loc.name} · ${t("workspace_status_selected")}`);
  }
}

export function setAnalysisLoading(loading) {
  const rows = document.querySelectorAll(".risk-line");
  rows.forEach((row) => {
    const value = row.querySelector("[data-risk-value]");
    const badge = row.querySelector("[data-risk-label]");
    const bar = row.querySelector("[data-risk-bar]");
    if (loading) {
      row.classList.remove("is-low", "is-moderate", "is-high", "is-very-high");
      if (value) value.textContent = "…";
      if (badge) {
        badge.textContent = t("loading");
        badge.className = "risk-badge risk-badge--empty";
      }
      if (bar) bar.style.width = "0%";
    }
  });
}

function updateRiskRow(name, metric, emptyLabel) {
  const row = document.querySelector(`.risk-line[data-metric="${name}"]`);
  if (!row) return;
  const valueEl = row.querySelector("[data-risk-value]");
  const badgeEl = row.querySelector("[data-risk-label]");
  const barEl = row.querySelector("[data-risk-bar]");
  row.classList.remove("is-low", "is-moderate", "is-high", "is-very-high");

  if (!metric || !Number.isFinite(metric.value)) {
    if (valueEl) valueEl.textContent = "—";
    if (badgeEl) {
      badgeEl.textContent = emptyLabel;
      badgeEl.className = "risk-badge risk-badge--empty";
    }
    if (barEl) barEl.style.width = "0%";
    return;
  }

  const label = metric.label || riskLabel(metric.value);
  row.classList.add(`is-${label.replace("_", "-")}`);
  if (valueEl) valueEl.textContent = `${round(metric.value, 0)}%`;
  if (badgeEl) {
    badgeEl.textContent = t(label);
    badgeEl.className = `risk-badge risk-badge--${label.replace("_", "-")}`;
  }
  if (barEl) barEl.style.width = `${Math.max(0, Math.min(100, metric.value))}%`;
}

function renderComfort(score, label) {
  const gauge = $("#comfort-gauge");
  const ring = $("#comfort-ring");
  const scoreEl = $("#comfort-score");
  const labelEl = $("#comfort-label");
  if (!gauge || !ring || !scoreEl || !labelEl) return;

  gauge.classList.remove("is-low", "is-moderate", "is-high");

  if (!Number.isFinite(score)) {
    scoreEl.textContent = "—";
    labelEl.textContent = t("awaiting_analysis");
    ring.style.strokeDashoffset = 100;
    return;
  }

  const rounded = round(score, 0);
  scoreEl.textContent = String(rounded);
  labelEl.textContent =
    label === "low"
      ? t("concern_low")
      : label === "moderate"
        ? t("concern_moderate")
        : t("concern_high");
  gauge.classList.add(`is-${label}`);
  ring.style.strokeDashoffset = 100 - Math.max(0, Math.min(100, rounded));
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

export function renderHistorical(result) {
  const cards = $("#risk-cards");
  const meta = $("#historical-meta");
  const details = $("#historical-details");
  if (!cards) return;

  if (!result || result.ok === false) {
    const emptyLabel = result?.insufficient
      ? t("insufficient_data")
      : result?.error
        ? t("insufficient_data")
        : t("awaiting_analysis");
    ["hot", "cold", "windy", "wet", "uncomfortable"].forEach((name) =>
      updateRiskRow(name, null, emptyLabel),
    );
    renderComfort(NaN, null);
    ["summary-avg-temp", "summary-avg-rain", "summary-avg-wind", "summary-samples"].forEach(
      (id) => setText(id, "—"),
    );
    if (meta) {
      meta.innerHTML = result?.insufficient
        ? `<div class="info-box">${esc(t("no_data_period"))}</div>`
        : result?.error
          ? `<div class="error-box">${esc(result.error)}</div>`
          : "";
    }
    if (details) details.innerHTML = "";
    return;
  }

  const metrics = result.metrics;
  const summary = result.summary;
  const source = result.source;
  const discomfort = round(100 - summary.comfortScore, 1);
  metrics.comfortRisk = discomfort;

  updateRiskRow("hot", metrics.heatRisk, t("insufficient_data"));
  updateRiskRow("cold", metrics.coldRisk, t("insufficient_data"));
  updateRiskRow("windy", metrics.windRisk, t("insufficient_data"));
  updateRiskRow("wet", metrics.rainRisk, t("insufficient_data"));
  updateRiskRow(
    "uncomfortable",
    {
      value: discomfort,
      label: riskLabel(discomfort),
    },
    t("insufficient_data"),
  );

  renderComfort(summary.comfortScore, summary.comfortLabel);

  setText(
    "summary-avg-temp",
    Number.isFinite(summary.avgTemp) ? `${summary.avgTemp} °C` : "—",
  );
  setText(
    "summary-avg-rain",
    Number.isFinite(summary.avgPrecip) ? `${summary.avgPrecip} mm` : "—",
  );
  setText(
    "summary-avg-wind",
    Number.isFinite(summary.avgWind) ? `${summary.avgWind} km/h` : "—",
  );
  setText(
    "summary-samples",
    Number.isFinite(source.sampleCount) ? String(source.sampleCount) : "—",
  );

  if (meta) {
    meta.innerHTML = `<div class="notice"><strong>${esc(t("source"))}:</strong> ${esc(
      source.dataset,
    )} · <strong>${esc(t("period"))}:</strong> ${esc(source.period)} · <strong>${esc(
      t("samples"),
    )}:</strong> ${esc(source.sampleCount)} · <strong>${esc(
      t("coverage"),
    )}:</strong> ${esc(source.coverage)}%</div>`;
  }

  if (details) {
    details.innerHTML = `<div class="table-wrap"><table><thead><tr><th>${esc(
      t("detail_metric"),
    )}</th><th>${esc(t("detail_value"))}</th></tr></thead><tbody>
      <tr><td>${esc(t("detail_avg_temp"))}</td><td>${esc(summary.avgTemp)} °C</td></tr>
      <tr><td>${esc(t("detail_max_temp"))}</td><td>${esc(summary.maxTemp)} °C</td></tr>
      <tr><td>${esc(t("detail_min_temp"))}</td><td>${esc(summary.minTemp)} °C</td></tr>
      <tr><td>${esc(t("detail_avg_precip"))}</td><td>${esc(summary.avgPrecip)} mm</td></tr>
      <tr><td>${esc(t("detail_avg_wind"))}</td><td>${esc(summary.avgWind)} km/h</td></tr>
      <tr><td>${esc(t("method"))}</td><td>${esc(source.method)}</td></tr>
    </tbody></table></div>`;
  }
}

export function renderForecast(forecast) {
  const el = $("#forecast-content");
  if (!el) return;

  if (!forecast) {
    el.innerHTML = `<div class="empty-state">
      <i data-lucide="cloud-sun" aria-hidden="true"></i>
      <p>${esc(t("forecast_empty"))}</p>
    </div>`;
    refreshIcons();
    return;
  }

  const current = forecast.current || {};
  const daily = forecast.daily || {};
  const times = daily.time || [];

  const rows = times
    .slice(0, 7)
    .map(
      (date, index) => `<tr>
        <td>${esc(date)}</td>
        <td>${esc(daily.temperature_2m_min?.[index] ?? "—")}–${esc(
          daily.temperature_2m_max?.[index] ?? "—",
        )} °C</td>
        <td>${esc(daily.precipitation_sum?.[index] ?? "—")} mm</td>
        <td>${esc(daily.precipitation_probability_max?.[index] ?? "—")}%</td>
        <td>${esc(daily.wind_speed_10m_max?.[index] ?? "—")} km/h</td>
      </tr>`,
    )
    .join("");

  el.innerHTML = `
    <div class="forecast-summary">
      <div class="forecast-metric">
        <span class="data-label">${esc(t("current_temp"))}</span>
        <strong>${esc(current.temperature_2m ?? "—")} °C</strong>
        <small>${esc(t("current_conditions"))}</small>
      </div>
      <div class="forecast-metric">
        <span class="data-label">${esc(t("humidity"))}</span>
        <strong>${esc(current.relative_humidity_2m ?? "—")}%</strong>
        <small>${esc(t("relative_humidity"))}</small>
      </div>
      <div class="forecast-metric">
        <span class="data-label">${esc(t("wind"))}</span>
        <strong>${esc(current.wind_speed_10m ?? "—")} km/h</strong>
        <small>${esc(t("wind_speed_10m"))}</small>
      </div>
      <div class="forecast-metric">
        <span class="data-label">${esc(t("precipitation"))}</span>
        <strong>${esc(current.precipitation ?? "—")} mm</strong>
        <small>${esc(t("current_conditions"))}</small>
      </div>
    </div>
    <div class="forecast-body">
      <div class="forecast-chart-card">
        <h3>${esc(t("hourly_forecast"))}</h3>
        <div class="chart-wrap"><canvas id="forecastChart" aria-label="${esc(
          t("hourly_forecast"),
        )}"></canvas></div>
      </div>
      <div class="forecast-days">
        <h3>${esc(t("daily_outlook"))}</h3>
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>${esc(t("date"))}</th>
              <th>${esc(t("temp_range"))}</th>
              <th>${esc(t("precipitation"))}</th>
              <th>${esc(t("rain_probability"))}</th>
              <th>${esc(t("max_wind"))}</th>
            </tr></thead>
            <tbody>${rows || `<tr><td colspan="5">${esc(t("insufficient_data"))}</td></tr>`}</tbody>
          </table>
        </div>
        <p class="forecast-source">${esc(t("forecast_source"))}</p>
      </div>
    </div>`;
  refreshIcons();
}

function nasaPreviewUrl(loc, date) {
  const lat = Math.max(-85, Math.min(85, loc.lat));
  const lon = Math.max(-180, Math.min(180, loc.lon));
  const delta = 3.2;
  const miny = Math.max(-85, lat - delta);
  const maxy = Math.min(85, lat + delta);
  const minx = Math.max(-180, lon - delta);
  const maxx = Math.min(180, lon + delta);
  const params = [
    "SERVICE=WMS",
    "REQUEST=GetMap",
    "VERSION=1.3.0",
    "LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor",
    "STYLES=",
    "FORMAT=image/jpeg",
    "TRANSPARENT=FALSE",
    "HEIGHT=680",
    "WIDTH=1088",
    "CRS=EPSG:4326",
    `BBOX=${miny.toFixed(4)},${minx.toFixed(4)},${maxy.toFixed(4)},${maxx.toFixed(4)}`,
    `TIME=${date}`,
  ];
  return `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?${params.join("&")}`;
}

export function renderNasaPreview(loc, date) {
  const img = $("#nasa-preview-img");
  const fallback = $("#nasa-preview-fallback");
  const place = $("#nasa-preview-place");
  const dateEl = $("#nasa-preview-date");
  if (!img || !fallback) return;

  dateEl.textContent = date || "—";

  if (!loc) {
    place.textContent = t("nasa_preview_none");
    img.removeAttribute("src");
    img.classList.remove("is-ready");
    img.dataset.key = "";
    fallback.hidden = false;
    return;
  }

  place.textContent = `${loc.name}${loc.country ? `, ${loc.country}` : ""}`;
  const key = `${loc.lat.toFixed(3)}|${loc.lon.toFixed(3)}|${date}`;
  if (img.dataset.key === key) return;
  img.dataset.key = key;
  img.classList.remove("is-ready");
  fallback.hidden = false;
  img.onload = () => {
    img.classList.add("is-ready");
    fallback.hidden = true;
  };
  img.onerror = () => {
    img.classList.remove("is-ready");
    fallback.hidden = false;
  };
  img.src = nasaPreviewUrl(loc, date);
}

export function renderNasaExplorer(loc, date) {
  const el = $("#nasa-links");
  if (!el) return;

  const lat = loc?.lat;
  const lon = loc?.lon;
  const d = date || new Date().toISOString().slice(0, 10);
  const hasLocation = Number.isFinite(lat) && Number.isFinite(lon);

  const worldview = hasLocation
    ? `https://worldview.earthdata.nasa.gov/?v=${(lon - 4).toFixed(4)},${(lat - 4).toFixed(
        4,
      )},${(lon + 4).toFixed(4)},${(lat + 4).toFixed(4)}&t=${d}`
    : "https://worldview.earthdata.nasa.gov/";
  const earthdata = hasLocation
    ? `https://search.earthdata.nasa.gov/search?m=${lat.toFixed(4)}!${lon.toFixed(
        4,
      )}!7!1!0!0%2C2`
    : "https://search.earthdata.nasa.gov/";

  el.innerHTML = `<div class="nasa-links__grid">
      <a class="nasa-link" href="${worldview}" target="_blank" rel="noopener">
        <span>NASA Worldview</span><i data-lucide="external-link" aria-hidden="true"></i>
      </a>
      <a class="nasa-link" href="${earthdata}" target="_blank" rel="noopener">
        <span>NASA Earthdata Search</span><i data-lucide="external-link" aria-hidden="true"></i>
      </a>
      <a class="nasa-link" href="https://giovanni.gsfc.nasa.gov/giovanni/" target="_blank" rel="noopener">
        <span>NASA Giovanni</span><i data-lucide="external-link" aria-hidden="true"></i>
      </a>
      <a class="nasa-link" href="https://disc.gsfc.nasa.gov/" target="_blank" rel="noopener">
        <span>NASA GES DISC</span><i data-lucide="external-link" aria-hidden="true"></i>
      </a>
    </div>
    <p class="nasa-links__note">${esc(
      hasLocation ? t("nasa_links_note") : t("nasa_links_no_location"),
    )}</p>`;

  renderNasaPreview(loc, date);
  refreshIcons();
}

export function renderEventResult(input, historical, forecast, date) {
  const el = $("#event-result");
  if (!el) return;

  if (!historical || !historical.ok) {
    el.innerHTML = `<div class="empty-state">
      <i data-lucide="clipboard-list" aria-hidden="true"></i>
      <p>${esc(t("event_need_analysis"))}</p>
    </div>`;
    refreshIcons();
    return;
  }

  const metrics = historical.metrics;
  const thresholds = historical.thresholds;
  const lines = [];

  if (Number.isFinite(metrics.rainRisk.value)) {
    lines.push(
      `${t("insight_rain")} ${metrics.rainRisk.value}% (${metrics.rainRisk.count}/${metrics.rainRisk.total}) · ${t("threshold")}: ≥ ${thresholds.rain} mm`,
    );
  }
  if (Number.isFinite(metrics.heatRisk.value)) {
    lines.push(
      `${t("insight_heat")} ${metrics.heatRisk.value}% (${metrics.heatRisk.count}/${metrics.heatRisk.total}) · ${t("threshold")}: ≥ ${thresholds.heat} °C`,
    );
  }
  if (Number.isFinite(metrics.windRisk.value)) {
    lines.push(
      `${t("insight_wind")} ${metrics.windRisk.value}% (${metrics.windRisk.count}/${metrics.windRisk.total}) · ${t("threshold")}: ≥ ${thresholds.wind} km/h`,
    );
  }
  if (Number.isFinite(metrics.coldRisk.value)) {
    lines.push(
      `${t("insight_cold")} ${metrics.coldRisk.value}% (${metrics.coldRisk.count}/${metrics.coldRisk.total}) · ${t("threshold")}: ≤ ${thresholds.cold} °C`,
    );
  }
  lines.push(
    `${t("insight_comfort")} ${historical.summary.comfortScore}/100 (${t(
      historical.summary.comfortLabel,
    )}). ${t("samples")}: ${historical.source.sampleCount}.`,
  );

  let forecastNote = "";
  if (forecast?.daily?.time) {
    const index = forecast.daily.time.indexOf(date);
    if (index >= 0) {
      forecastNote = `<div class="event-forecast-note"><strong>${esc(
        t("forecast_separate"),
      )}</strong> ${esc(date)} — ${esc(
        forecast.daily.temperature_2m_min?.[index] ?? "—",
      )}–${esc(forecast.daily.temperature_2m_max?.[index] ?? "—")} °C · ${esc(
        forecast.daily.precipitation_sum?.[index] ?? "—",
      )} mm · ${esc(
        forecast.daily.precipitation_probability_max?.[index] ?? "—",
      )}% · ${esc(forecast.daily.wind_speed_10m_max?.[index] ?? "—")} km/h.</div>`;
    } else {
      forecastNote = `<div class="event-forecast-note">${esc(
        t("forecast_out_of_range"),
      )}</div>`;
    }
  }

  el.innerHTML = `<div class="event-summary">
      <div class="event-summary__head">
        <h4>${esc(input.eventName || t("event_default_name"))}</h4>
        <span>${esc(input.locationName || t("location"))} · ${esc(date)}</span>
      </div>
      <ul>${lines.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>
    </div>${forecastNote}`;
}

export function renderComparison(list) {
  const el = $("#compare-content");
  if (!el) return;

  if (!list.length) {
    el.innerHTML = `<div class="empty-state empty-state--inline">
      <i data-lucide="git-compare-arrows" aria-hidden="true"></i>
      <p>${esc(t("compare_empty"))}</p>
    </div>`;
    refreshIcons();
    return;
  }

  const rows = list
    .map(
      (item) => `<tr>
        <td>${esc(item.location.name)}${item.location.country ? `, ${esc(item.location.country)}` : ""}</td>
        <td>${formatMetric(item.metrics?.rainRisk)}</td>
        <td>${formatMetric(item.metrics?.heatRisk)}</td>
        <td>${formatMetric(item.metrics?.windRisk)}</td>
        <td>${esc(item.summary?.comfortScore ?? "—")}</td>
        <td>${esc(item.source?.sampleCount ?? "—")}</td>
      </tr>`,
    )
    .join("");

  el.innerHTML = `<div class="table-wrap"><table>
      <thead><tr>
        <th>${esc(t("location"))}</th>
        <th>${esc(t("rain_risk"))}</th>
        <th>${esc(t("heat_risk"))}</th>
        <th>${esc(t("wind_risk"))}</th>
        <th>${esc(t("comfort"))}</th>
        <th>${esc(t("samples"))}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <p class="compare-note">${esc(t("compare_note"))}</p>`;
}

function formatMetric(metric) {
  return metric && Number.isFinite(metric.value)
    ? `${metric.value}% (${metric.count}/${metric.total})`
    : t("insufficient_data");
}
