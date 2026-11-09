import { initDeckEarth } from "./earth.js";

/**
 * Weather Parade — presentation engine
 * Vanilla ES module. Slide content stays in index.html; this file only
 * handles state, navigation, accessibility, overlays and chrome.
 */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const deck = {
  slides: [],
  index: 0,
  total: 0,
  ready: false,
};

const els = {
  stage: $("#deck-stage"),
  loader: $("#deck-loader"),
  progress: $("#deck-progress-fill"),
  current: $("#deck-current"),
  total: $("#deck-total"),
  dots: $("#deck-dots"),
  chapterNum: $("#deck-chapter-num"),
  chapterName: $("#deck-chapter-name"),
  hint: $("#deck-hint"),
  overview: $("#deck-overview"),
  overviewGrid: $("#overview-grid"),
  help: $("#deck-help"),
  toast: $("#deck-toast"),
  topbar: $("#deck-topbar"),
  bottom: $("#deck-bottom"),
};

const isRTL = () => document.documentElement.getAttribute("dir") === "rtl";
const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

let toastTimer = 0;
let idleTimer = 0;
let lastFocused = null;

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

function pad(value) {
  return String(value).padStart(2, "0");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function slideTitle(slide) {
  return slide?.dataset.title || slide?.getAttribute("aria-label") || "";
}

function showToast(message, duration = 2600) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.classList.add("is-on");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    els.toast.classList.remove("is-on");
  }, duration);
}

function setChromeIdle() {
  if (!document.body.classList.contains("is-presenting")) {
    document.body.classList.remove("chrome-dim");
    return;
  }
  document.body.classList.add("chrome-dim");
}

function wakeChrome() {
  document.body.classList.remove("chrome-dim");
  window.clearTimeout(idleTimer);
  if (document.body.classList.contains("is-presenting")) {
    idleTimer = window.setTimeout(setChromeIdle, 3600);
  }
}

/* --------------------------------------------------------------------------
   Slide state
   -------------------------------------------------------------------------- */

function applySlideState(index, { instant = false, updateHash = true } = {}) {
  if (!deck.total) return;

  const target = clamp(index, 0, deck.total - 1);
  const slide = deck.slides[target];

  if (instant) {
    els.stage?.classList.add("is-instant");
  }

  deck.slides.forEach((item, i) => {
    const active = i === target;
    item.classList.toggle("is-active", active);
    item.classList.toggle("is-before", i < target);
    item.classList.toggle("is-after", i > target);
    item.setAttribute("aria-hidden", active ? "false" : "true");

    if (active) {
      item.removeAttribute("inert");
      item.inert = false;
    } else {
      item.setAttribute("inert", "");
      item.inert = true;
    }
  });

  deck.index = target;

  document.body.dataset.theme = slide?.dataset.theme || "light";

  if (els.current) els.current.textContent = pad(target + 1);
  if (els.total) els.total.textContent = pad(deck.total);
  if (els.progress) {
    els.progress.style.width = `${((target + 1) / deck.total) * 100}%`;
  }

  if (els.chapterNum) els.chapterNum.textContent = pad(target + 1);
  if (els.chapterName) els.chapterName.textContent = slide?.dataset.chapter || "";

  if (els.dots) {
    [...els.dots.children].forEach((dot, i) => {
      if (i === target) {
        dot.setAttribute("aria-current", "true");
        dot.tabIndex = 0;
      } else {
        dot.removeAttribute("aria-current");
        dot.tabIndex = -1;
      }
    });
  }

  if (els.overviewGrid) {
    [...els.overviewGrid.children].forEach((item, i) => {
      item.classList.toggle("is-current", i === target);
      if (i === target) item.setAttribute("aria-current", "true");
      else item.removeAttribute("aria-current");
    });
  }

  document.title = `${slideTitle(slide)} — Weather Parade`;

  if (updateHash) {
    const hash = `#slide-${target + 1}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }

  if (instant) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        els.stage?.classList.remove("is-instant");
      });
    });
  }

  if (!prefersReducedMotion()) wakeChrome();
}

function next() {
  if (deck.index >= deck.total - 1) {
    showToast("هذه آخر شريحة — استخدم Home للعودة إلى البداية");
    return;
  }
  applySlideState(deck.index + 1);
}

function previous() {
  if (deck.index <= 0) {
    showToast("هذه أول شريحة — استخدم ← للانتقال إلى التالي");
    return;
  }
  applySlideState(deck.index - 1);
}

function goTo(index) {
  applySlideState(index);
}

function restart() {
  closeOverlays();
  applySlideState(0);
  showToast("تمت العودة إلى بداية العرض");
}

/* --------------------------------------------------------------------------
   Dots + overview
   -------------------------------------------------------------------------- */

function buildDots() {
  if (!els.dots) return;
  const fragment = document.createDocumentFragment();

  deck.slides.forEach((slide, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `الشريحة ${i + 1}: ${slideTitle(slide)}`);
    button.title = `${pad(i + 1)} · ${slideTitle(slide)}`;
    button.addEventListener("click", () => goTo(i));
    fragment.appendChild(button);
  });

  els.dots.replaceChildren(fragment);
}

function buildOverview() {
  if (!els.overviewGrid) return;
  const fragment = document.createDocumentFragment();

  deck.slides.forEach((slide, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "overview-item";

    const num = document.createElement("span");
    num.className = "overview-item__num";
    num.textContent = pad(i + 1);

    const title = document.createElement("span");
    title.className = "overview-item__title";
    title.textContent = slideTitle(slide);

    const chapter = document.createElement("span");
    chapter.className = "overview-item__chapter";
    chapter.textContent = slide.dataset.chapter || "";

    button.append(num, title, chapter);
    button.addEventListener("click", () => {
      closeOverlays();
      goTo(i);
    });
    fragment.appendChild(button);
  });

  els.overviewGrid.replaceChildren(fragment);
}

/* --------------------------------------------------------------------------
   Overlays
   -------------------------------------------------------------------------- */

function isOverlayOpen() {
  return Boolean(
    (els.help && !els.help.hidden) || (els.overview && !els.overview.hidden),
  );
}

function openOverview() {
  if (!els.overview) return;
  closeHelp(false);
  lastFocused = document.activeElement;
  els.overview.hidden = false;
  document.body.classList.add("overview-open");
  $("[data-action='overview-close']", els.overview)?.focus();
}

function closeOverview(restoreFocus = true) {
  if (!els.overview || els.overview.hidden) return;
  els.overview.hidden = true;
  document.body.classList.remove("overview-open");
  if (restoreFocus && lastFocused instanceof HTMLElement) lastFocused.focus();
}

function openHelp() {
  if (!els.help) return;
  closeOverview(false);
  lastFocused = document.activeElement;
  els.help.hidden = false;
  document.body.classList.add("help-open");
  $(".deck-modal__close", els.help)?.focus();
}

function closeHelp(restoreFocus = true) {
  if (!els.help || els.help.hidden) return;
  els.help.hidden = true;
  document.body.classList.remove("help-open");
  if (restoreFocus && lastFocused instanceof HTMLElement) lastFocused.focus();
}

function closeOverlays() {
  closeHelp(false);
  closeOverview(false);
}

function togglePresentation() {
  const on = document.body.classList.toggle("is-presenting");
  const button = $("[data-action='present']");
  if (button) button.setAttribute("aria-pressed", String(on));
  showToast(on ? "وضع العرض مفعّل — اضغط P أو Esc للخروج" : "تم الخروج من وضع العرض");
  wakeChrome();
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      showToast("ملء الشاشة — اضغط F أو Esc للخروج");
    } else {
      await document.exitFullscreen();
    }
  } catch {
    showToast("لم يسمح المتصفح بملء الشاشة في هذه البيئة");
  }
}

/* --------------------------------------------------------------------------
   Keyboard
   -------------------------------------------------------------------------- */

function trapOverlayFocus(event) {
  if (event.key !== "Tab") return;
  const container = els.help && !els.help.hidden ? els.help : els.overview;
  if (!container) return;

  const focusable = $$(
    "button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    container,
  ).filter((node) => !node.disabled && node.offsetParent !== null);

  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function onKeydown(event) {
  const target = event.target;
  if (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  ) {
    return;
  }

  if (isOverlayOpen()) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeOverlays();
      return;
    }
    if (event.key === "?" || (event.key === "/" && event.shiftKey)) {
      event.preventDefault();
      closeOverlays();
      openHelp();
      return;
    }
    if (event.key === "o" || event.key === "O") {
      event.preventDefault();
      closeOverlays();
      openOverview();
      return;
    }
    trapOverlayFocus(event);
    if (!["Tab", "Shift"].includes(event.key)) event.preventDefault();
    return;
  }

  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      isRTL() ? next() : previous();
      break;
    case "ArrowRight":
      event.preventDefault();
      isRTL() ? previous() : next();
      break;
    case " ":
    case "Spacebar":
      event.preventDefault();
      event.shiftKey ? previous() : next();
      break;
    case "PageDown":
      event.preventDefault();
      next();
      break;
    case "PageUp":
      event.preventDefault();
      previous();
      break;
    case "Home":
      event.preventDefault();
      applySlideState(0);
      break;
    case "End":
      event.preventDefault();
      applySlideState(deck.total - 1);
      break;
    case "Escape":
      if (document.body.classList.contains("is-presenting")) {
        event.preventDefault();
        togglePresentation();
      }
      break;
    case "o":
    case "O":
      event.preventDefault();
      openOverview();
      break;
    case "f":
    case "F":
      event.preventDefault();
      toggleFullscreen();
      break;
    case "p":
    case "P":
      event.preventDefault();
      togglePresentation();
      break;
    case "?":
      event.preventDefault();
      openHelp();
      break;
    case "/":
      if (event.shiftKey) {
        event.preventDefault();
        openHelp();
      }
      break;
    default:
      break;
  }
}

/* --------------------------------------------------------------------------
   Pointer / touch
   -------------------------------------------------------------------------- */

function bindTouch() {
  let start = null;

  els.stage?.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) return;
      start = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
        time: Date.now(),
      };
    },
    { passive: true },
  );

  els.stage?.addEventListener(
    "touchend",
    (event) => {
      if (!start) return;
      const touch = event.changedTouches[0];
      if (!touch) {
        start = null;
        return;
      }
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const elapsed = Date.now() - start.time;
      start = null;

      if (elapsed > 900) return;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.25) return;

      if (dx < 0) next();
      else previous();
    },
    { passive: true },
  );
}

/* --------------------------------------------------------------------------
   Wiring
   -------------------------------------------------------------------------- */

function bindClicks() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;

    const action = trigger.dataset.action;
    switch (action) {
      case "next":
        next();
        break;
      case "prev":
        previous();
        break;
      case "restart":
        restart();
        break;
      case "overview":
        openOverview();
        break;
      case "overview-close":
        closeOverview();
        break;
      case "help":
        openHelp();
        break;
      case "help-close":
        closeHelp();
        break;
      case "present":
        togglePresentation();
        break;
      case "fullscreen":
        toggleFullscreen();
        break;
      default:
        break;
    }
  });
}

function bindHash() {
  window.addEventListener("hashchange", () => {
    const match = window.location.hash.match(/slide-(\d+)/);
    if (!match) return;
    const target = Number(match[1]) - 1;
    if (Number.isFinite(target)) {
      applySlideState(target, { updateHash: false });
    }
  });
}

function bindChromeWake() {
  ["pointermove", "pointerdown", "keydown", "focusin"].forEach((type) => {
    document.addEventListener(type, wakeChrome, { passive: true });
  });
}

function syncFullscreenState() {
  document.body.classList.toggle("is-fullscreen", Boolean(document.fullscreenElement));
  const button = $("[data-action='fullscreen']");
  if (button) {
    button.setAttribute(
      "aria-label",
      document.fullscreenElement ? "الخروج من ملء الشاشة" : "ملء الشاشة",
    );
  }
}

function hideLoader() {
  if (!els.loader || els.loader.classList.contains("is-done")) return;
  els.loader.classList.add("is-done");
  window.setTimeout(() => els.loader?.remove(), 900);
}

function initEarth() {
  initDeckEarth().catch((error) => {
    console.warn("Deck Earth disabled.", error);
  });
}

function init() {
  deck.slides = $$(".slide", els.stage || document);
  deck.total = deck.slides.length;
  if (!deck.total) {
    hideLoader();
    return;
  }

  if (els.total) els.total.textContent = pad(deck.total);
  if (els.hint) {
    els.hint.textContent = isRTL() ? "← التالي · → السابق" : "→ Next · ← Previous";
  }

  buildDots();
  buildOverview();

  const initialMatch = window.location.hash.match(/slide-(\d+)/);
  const initialIndex = initialMatch ? Number(initialMatch[1]) - 1 : 0;
  applySlideState(initialIndex, { instant: true, updateHash: false });

  bindClicks();
  bindHash();
  bindTouch();
  bindChromeWake();

  document.addEventListener("keydown", onKeydown);
  document.addEventListener("fullscreenchange", syncFullscreenState);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      document.body.classList.remove("chrome-dim");
    }
  });

  window.lucide?.createIcons?.({ attrs: { "stroke-width": 1.7 } });

  deck.ready = true;

  if (document.readyState === "complete") {
    window.setTimeout(hideLoader, 650);
  } else {
    window.addEventListener("load", () => window.setTimeout(hideLoader, 650), {
      once: true,
    });
  }
  window.setTimeout(hideLoader, 5000);

  window.setTimeout(initEarth, 350);
}

init();
