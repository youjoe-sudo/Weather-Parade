import { $, $$, debounce, esc, setParams } from "./utils.js";
import { initI18n, setLang, getLang, t, applyTranslations } from "./i18n.js";
import { searchLocations, reverseLocation, getForecast } from "./api.js";
import { analyzeHistorical } from "./historical.js";
import { initMap, setLocation, setLayer, setNasaDate, invalidate } from "./map.js";
import {
  renderTempChart,
  renderRainChart,
  renderRiskChart,
  renderSeasonalChart,
  renderForecastChart,
  resetCharts,
} from "./charts.js";
import {
  showError,
  clearError,
  showNotice,
  clearNotice,
  renderDashboard,
  renderHistorical,
  renderForecast,
  renderNasaExplorer,
  renderEventResult,
  renderComparison,
  setAnalysisLoading,
  refreshIcons,
} from "./ui.js";
import {
  exportHistoricalCsv,
  exportJson,
  printReport,
  copyShareLink,
  readShareParams,
} from "./export.js";
import { initEarth } from "./earth.js";

const today = new Date().toISOString().slice(0, 10);

const state = {
  location: null,
  date: today,
  thresholds: {
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    years: 10,
    heat: 32,
    cold: 5,
    rain: 1,
    wind: 35,
  },
  historical: null,
  forecast: null,
  comparisons: [],
  lastEventInput: null,
};

function syncInputs() {
  $("#month").value = state.thresholds.month;
  $("#day").value = state.thresholds.day || "";
  $("#years").value = state.thresholds.years;
  $("#heat-th").value = state.thresholds.heat;
  $("#cold-th").value = state.thresholds.cold;
  $("#rain-th").value = state.thresholds.rain;
  $("#wind-th").value = state.thresholds.wind;
  $("#date-input").value = state.date;
  $("#nasa-date").value = state.date;
  $("#event-date").value = state.date;
}

function readThresholdInputs() {
  state.thresholds.month = Number($("#month").value);
  state.thresholds.day = Number($("#day").value || 0);
  state.thresholds.years = Number($("#years").value || 10);
  state.thresholds.heat = Number($("#heat-th").value);
  state.thresholds.cold = Number($("#cold-th").value);
  state.thresholds.rain = Number($("#rain-th").value);
  state.thresholds.wind = Number($("#wind-th").value);
  state.date = $("#date-input").value || state.date;
}

function updateChartSet() {
  if (!state.historical?.ok) return;
  renderTempChart("tempChart", state.historical.rows, state.historical.thresholds);
  renderRainChart("rainChart", state.historical.rows, state.historical.thresholds);
  renderRiskChart("riskChart", state.historical.metrics);
  renderSeasonalChart("seasonChart", state.historical.monthly);
}

async function selectLocation(
  loc,
  { pan = true, analyze = false, forecast = false, scroll = false } = {},
) {
  if (!loc || !Number.isFinite(Number(loc.lat)) || !Number.isFinite(Number(loc.lon))) {
    return;
  }

  const next = { ...loc, lat: Number(loc.lat), lon: Number(loc.lon) };
  const changed =
    !state.location ||
    state.location.lat !== next.lat ||
    state.location.lon !== next.lon;

  state.location = next;

  const label = next.display_name || next.name || "";
  $("#location-search").value = label;
  const heroInput = $("#hero-location-search");
  if (heroInput) heroInput.value = next.name || label;

  if (changed) {
    state.historical = null;
    state.forecast = null;
    renderHistorical(null);
    renderForecast(null);
    resetCharts();
  }

  renderDashboard(
    state.location,
    state.date,
    state.historical?.ok ? t("ready") : "—",
    state.forecast ? t("ready") : "—",
  );
  renderNasaExplorer(state.location, state.date);

  if (pan) setLocation(next.lat, next.lon, 8);

  setParams({
    lat: next.lat.toFixed(5),
    lon: next.lon.toFixed(5),
    date: state.date,
  });

  if (scroll) {
    document
      .getElementById("historical")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (analyze) await runAnalysis();
  if (forecast) await runForecast();
}

async function runAnalysis() {
  if (!state.location) {
    showError(t("error_select_location"));
    return;
  }

  clearError();
  readThresholdInputs();
  setAnalysisLoading(true);
  renderDashboard(
    state.location,
    state.date,
    t("loading"),
    state.forecast ? t("ready") : "—",
  );

  try {
    state.historical = await analyzeHistorical(
      state.location.lat,
      state.location.lon,
      state.thresholds,
    );
    renderHistorical(state.historical);

    if (state.historical.ok) {
      updateChartSet();
      const message = t("analysis_complete")
        .replace("{count}", state.historical.source.sampleCount)
        .replace("{dataset}", state.historical.source.dataset);
      showNotice(message, "info");
    } else if (state.historical.insufficient) {
      resetCharts();
      showNotice(t("no_data_period"), "info");
    } else {
      resetCharts();
    }

    renderDashboard(
      state.location,
      state.date,
      state.historical.ok ? t("ready") : t("insufficient"),
      state.forecast ? t("ready") : "—",
    );
    renderNasaExplorer(state.location, state.date);
  } catch (error) {
    resetCharts();
    renderHistorical({ ok: false, error: error?.message || String(error) });
    renderDashboard(
      state.location,
      state.date,
      t("insufficient"),
      state.forecast ? t("ready") : "—",
    );
    showError(error?.message || String(error));
  }
}

async function runForecast() {
  if (!state.location) {
    showError(t("error_select_location"));
    return;
  }

  clearError();
  renderDashboard(
    state.location,
    state.date,
    state.historical?.ok ? t("ready") : "—",
    t("loading"),
  );

  try {
    state.forecast = await getForecast(
      state.location.lat,
      state.location.lon,
    );
    renderForecast(state.forecast);
    renderForecastChart("forecastChart", state.forecast.hourly);
    renderDashboard(
      state.location,
      state.date,
      state.historical?.ok ? t("ready") : "—",
      t("ready"),
    );
  } catch (error) {
    state.forecast = null;
    renderForecast(null);
    renderDashboard(
      state.location,
      state.date,
      state.historical?.ok ? t("ready") : "—",
      t("insufficient"),
    );
    showError(`${t("error_network")} (${error?.message || error})`);
  }
}

function wireSearch(inputSelector, listSelector, { scroll = false } = {}) {
  const input = $(inputSelector);
  const list = $(listSelector);
  if (!input || !list) return;

  let active = -1;
  let items = [];

  const hide = () => {
    list.hidden = true;
    list.innerHTML = "";
    input.setAttribute("aria-expanded", "false");
    active = -1;
    items = [];
  };

  const render = (results) => {
    items = Array.isArray(results) ? results : [];
    active = -1;
    list.innerHTML = items
      .map(
        (item, index) =>
          `<li role="option"><button type="button" data-index="${index}" aria-selected="false">${esc(
            item.display_name,
          )}</button></li>`,
      )
      .join("");
    list.hidden = items.length === 0;
    input.setAttribute("aria-expanded", items.length ? "true" : "false");
  };

  const choose = async (index) => {
    const loc = items[index];
    hide();
    if (!loc) return;
    await selectLocation(loc, {
      pan: true,
      analyze: true,
      forecast: true,
      scroll,
    });
  };

  const runSearch = async () => {
    const query = input.value.trim();
    if (query.length < 2) {
      hide();
      return [];
    }
    try {
      const results = await searchLocations(query, 6);
      render(results);
      return results;
    } catch (error) {
      hide();
      if (String(error).includes("429")) showError(t("error_rate"));
      else showError(t("error_location"));
      return [];
    }
  };

  input.addEventListener(
    "input",
    debounce(async () => {
      clearError();
      await runSearch();
    }, 350),
  );

  input.addEventListener("focus", () => {
    if (items.length && list.hidden) {
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
    }
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-index]");
    if (!button) return;
    choose(Number(button.dataset.index));
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hide();
      return;
    }

    if (list.hidden) {
      if (event.key === "Enter" && input.value.trim().length >= 2) {
        event.preventDefault();
        runSearch().then((results) => {
          if (results.length) choose(0);
        });
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      active = Math.min(items.length - 1, active + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      active = Math.max(0, active - 1);
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      choose(active);
      return;
    } else {
      return;
    }

    $$("button", list).forEach((button, index) => {
      button.setAttribute("aria-selected", index === active ? "true" : "false");
      if (index === active) button.scrollIntoView({ block: "nearest" });
    });
  });

  input.form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (active >= 0) {
      choose(active);
      return;
    }
    let results = items;
    if (!results.length) results = await runSearch();
    if (results.length) choose(0);
    else showError(t("error_location"));
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-wrap")) hide();
  });
}

function rerenderLocalized() {
  renderNasaExplorer(state.location, state.date);
  if (state.historical) renderHistorical(state.historical);
  if (state.forecast) {
    renderForecast(state.forecast);
    renderForecastChart("forecastChart", state.forecast.hourly);
  } else {
    renderForecast(null);
  }
  if (state.historical?.ok) updateChartSet();
  renderComparison(state.comparisons);
  if (state.lastEventInput) {
    renderEventResult(
      state.lastEventInput,
      state.historical,
      state.forecast,
      state.lastEventInput.date,
    );
  }
  renderDashboard(
    state.location,
    state.date,
    state.historical
      ? state.historical.ok
        ? t("ready")
        : t("insufficient")
      : "—",
    state.forecast ? t("ready") : "—",
  );
  refreshIcons();
}

function setupMobileMenu() {
  const toggle = $("#nav-toggle");
  const menu = $("#mobile-menu");
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    toggle.innerHTML = `<i data-lucide="${open ? "x" : "menu"}" aria-hidden="true"></i>`;
    toggle.setAttribute("aria-label", open ? t("nav_close") : t("nav_menu"));
    refreshIcons();
  };

  toggle.addEventListener("click", () => {
    setOpen(menu.hidden);
  });

  $$("a", menu).forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) setOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1040 && !menu.hidden) setOpen(false);
  });
}

function setupScrollSpy() {
  const links = $$(".nav-links a");
  const sections = ["home", "historical", "nasa", "forecast", "about"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!links.length || !sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${visible.target.id}`,
        );
      });
    },
    { rootMargin: "-32% 0px -55% 0px", threshold: [0, 0.2, 0.5] },
  );

  sections.forEach((section) => observer.observe(section));
}

function hideBootScreen() {
  const boot = $("#boot-screen");
  if (!boot) return;
  window.setTimeout(() => boot.classList.add("is-hidden"), 620);
  window.setTimeout(() => boot.remove(), 1200);
}

function wireEvents() {
  $("#lang-select").value = getLang();

  $("#lang-select").addEventListener("change", (event) => {
    setLang(event.target.value);
    refreshIcons();
    rerenderLocalized();
  });

  $("#run-analysis").addEventListener("click", runAnalysis);
  $("#run-forecast").addEventListener("click", runForecast);

  $("#date-input").addEventListener("change", (event) => {
    state.date = event.target.value;
    $("#nasa-date").value = state.date;
    $("#event-date").value = state.date;
    renderNasaExplorer(state.location, state.date);
    renderDashboard(
      state.location,
      state.date,
      state.historical?.ok ? t("ready") : "—",
      state.forecast ? t("ready") : "—",
    );
    setParams({ date: state.date });
  });

  $("#month").addEventListener("change", () => {
    state.thresholds.month = Number($("#month").value);
  });

  $("#map-layer").addEventListener("change", (event) => {
    setLayer(event.target.value, $("#nasa-date").value);
  });

  $("#nasa-date").addEventListener("change", (event) => {
    setNasaDate(event.target.value);
    if ($("#map-layer").value === "nasa") setLayer("nasa", event.target.value);
    renderNasaExplorer(state.location, event.target.value);
  });

  $("#export-csv").addEventListener("click", () => {
    if (!exportHistoricalCsv(state)) showError(t("run_analysis_first_csv"));
    else showNotice(t("export_ready"));
  });

  $("#export-json").addEventListener("click", () => {
    exportJson(state);
    showNotice(t("export_ready"));
  });

  $("#export-report").addEventListener("click", printReport);

  $("#share-link").addEventListener("click", async () => {
    if (!state.location) {
      showError(t("error_select_location"));
      return;
    }
    readThresholdInputs();
    await copyShareLink(state);
    showNotice(t("copied"));
  });

  $("#plan-event").addEventListener("click", () => {
    readThresholdInputs();
    const date = $("#event-date").value || state.date;
    state.lastEventInput = {
      eventName: $("#event-name").value,
      locationName: state.location?.display_name || state.location?.name,
      date,
    };
    renderEventResult(
      state.lastEventInput,
      state.historical,
      state.forecast,
      date,
    );
    refreshIcons();
  });

  $("#add-compare").addEventListener("click", () => {
    if (!state.historical?.ok || !state.location) {
      showError(t("run_analysis_first"));
      return;
    }
    state.comparisons.push({
      location: state.location,
      metrics: state.historical.metrics,
      summary: state.historical.summary,
      source: state.historical.source,
      thresholds: state.historical.thresholds,
    });
    renderComparison(state.comparisons);
    showNotice(
      t("compare_added").replace("{name}", state.location.name),
      "info",
    );
  });

  $("#clear-compare").addEventListener("click", () => {
    state.comparisons = [];
    renderComparison(state.comparisons);
  });

  $$(".quick-loc").forEach((button) => {
    button.addEventListener("click", async () => {
      const loc = {
        name: button.dataset.name,
        display_name: button.dataset.name,
        lat: Number(button.dataset.lat),
        lon: Number(button.dataset.lon),
        country: "",
      };
      await selectLocation(loc, {
        pan: true,
        analyze: true,
        forecast: true,
        scroll: true,
      });
    });
  });

  window.addEventListener("resize", debounce(invalidate, 150));
}

async function applyShareParams() {
  const params = readShareParams();
  if (params.date) state.date = params.date;
  ["month", "day", "years", "heat", "cold", "rain", "wind"].forEach((key) => {
    if (params[key] != null && params[key] !== "") {
      state.thresholds[key] = Number(params[key]);
    }
  });
  syncInputs();

  if (
    Number.isFinite(Number(params.lat)) &&
    Number.isFinite(Number(params.lon))
  ) {
    const lat = Number(params.lat);
    const lon = Number(params.lon);
    const loc = await reverseLocation(lat, lon);
    await selectLocation(loc, { pan: true, analyze: false, forecast: false });
    await Promise.allSettled([runAnalysis(), runForecast()]);
  } else {
    renderDashboard(null, state.date, "—", "—");
    renderNasaExplorer(null, state.date);
  }
}

async function main() {
  initI18n();
  syncInputs();

  renderHistorical(null);
  renderForecast(null);
  renderComparison([]);
  renderDashboard(null, state.date, "—", "—");
  renderNasaExplorer(null, state.date);

  if (window.L) {
    initMap({
      lat: 30.0444,
      lon: 31.2357,
      zoom: 3,
      nasaDate: state.date,
      onLocationPick: async (loc) => {
        await selectLocation(loc, {
          pan: false,
          analyze: true,
          forecast: true,
        });
      },
    });
  } else {
    showError("Map library could not be loaded. Check your connection and reload.");
  }

  wireSearch("#location-search", "#suggestions");
  wireSearch("#hero-location-search", "#hero-suggestions", { scroll: true });
  wireEvents();
  setupMobileMenu();
  setupScrollSpy();
  refreshIcons();
  initEarth().catch(() => {});
  hideBootScreen();

  await applyShareParams();
  clearNotice();
}

main().catch((error) => {
  showError(error?.message || String(error));
  hideBootScreen();
});
