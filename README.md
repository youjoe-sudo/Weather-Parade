# Weather Parade — Will It Rain On My Parade?

A vanilla HTML/CSS/JavaScript weather analytics dashboard for outdoor event planning. It combines **Open-Meteo historical/reanalysis data** (for historical probabilities), **Open-Meteo short-term forecast** (separately labeled), **OpenStreetMap/Nominatim** (geocoding + base map), and **NASA Earth observation resources** (GIBS satellite imagery layer + research links to Worldview, Giovanni, GES DISC, and Earthdata Search).

> **Scientific focus:** historical weather probability from valid past observations for a selected location and date window — **not** deterministic long-range forecasting.

## Features

- **Location search & map:** Nominatim search with debounced suggestions, map click/marker drag selection, synchronized coordinates.
- **Interactive map layers:** OpenStreetMap base tiles and NASA GIBS `MODIS_Terra_CorrectedReflectance_TrueColor` imagery (EPSG:3857/GoogleMapsCompatible). Imagery date is selectable; availability varies by date/zoom and is not live weather.
- **Historical weather analysis (real data):** Open-Meteo Archive API daily values (`temperature_2m_max/min/mean`, `precipitation_sum`, `wind_speed_10m_max`) over a configurable past-year period. Computes probabilities from **valid observations** for the selected month and day window (±2 days, or full month when day = 0), with explicit thresholds, sample counts, coverage, dataset/provider metadata, and method.
- **Risk dashboard:** Rain, extreme heat, cold, strong-wind probabilities; outdoor comfort planning indicator (documented rule-based score, not an official meteorological index). Missing/insufficient data is shown as “Insufficient Data”.
- **Charts (Chart.js):** historical temperature (mean/max/min), precipitation distribution/frequency coloring, risk distribution, seasonal monthly comfort.
- **Short-term forecast (separate):** Open-Meteo Forecast API current conditions, ~48h hourly chart, 7-day daily table. Clearly labeled as forecast, not historical probability.
- **NASA Explorer:** genuine browser integrations = GIBS imagery on map + location/date-aware links to NASA Worldview, Giovanni, GES DISC, and Earthdata Search. The app documents that direct authenticated dataset queries/downloads may require NASA Earthdata login or server-side workflows.
- **Event planning:** event name/date/duration/preferences; evaluates suitability from computed historical analysis and (when in range) short-term forecast. Explanations are based on actual computed values.
- **Location comparison:** add analyzed locations and compare rain/heat/wind probabilities, comfort score, sample counts, and dataset labels. Uses equivalent selected window/thresholds at analysis time (differences disclosed).
- **Export & sharing:** CSV export (computed metrics + sampled observations, capped), JSON export (metadata/results), print-friendly report via browser print/save-as-PDF, and shareable URL parameters (lat/lon/date/thresholds). No secrets in URLs.
- **Bilingual UI:** English and Arabic with dynamic `data-i18n` translation, RTL/LTR direction switching, and Arabic-capable fonts.
- **UX/quality:** loading/ready/error/insufficient states, debounced search, API timeout handling, reduced-motion support, keyboard-focus styles, responsive layouts.

## Technology stack

- **Core:** HTML5, CSS3, Vanilla JavaScript (ES modules), Fetch API, LocalStorage (language preference).
- **Libraries (CDN):** Leaflet 1.9.4, Chart.js 4.4.4.
- **Maps:** OpenStreetMap tiles, NASA GIBS WMTS.
- **APIs/data:** Open-Meteo Forecast API, Open-Meteo Archive API, Nominatim (OpenStreetMap). NASA Worldview/Giovanni/GES DISC/Earthdata linked as research resources.
- **Optional local server:** Node.js + Express (included) to serve static files; the frontend can also run from any static HTTP server.

## Project structure

```text
Weather-Parade-main/
├── public/
│   ├── index.html            # Main application (loads ES modules)
│   ├── about.html            # About/data-honesty page
│   ├── script.js             # Compatibility notice (legacy prototype logic removed from active path)
│   ├── script.legacy.js      # Preserved legacy prototype (contains old Math.random demo behavior)
│   ├── style.legacy.css      # Preserved legacy styles
│   ├── css/
│   │   ├── style.css         # Design system + layout
│   │   ├── responsive.css    # Responsive + RTL adjustments
│   │   └── animations.css    # Motion / reduced-motion
│   └── js/
│       ├── app.js            # App state, wiring, workflow
│       ├── api.js            # Nominatim + Open-Meteo forecast/archive with caching/timeouts
│       ├── historical.js     # Historical window filtering, probabilities, comfort, monthly stats
│       ├── map.js            # Leaflet map + OSM/NASA GIBS layers
│       ├── charts.js         # Chart.js visualizations
│       ├── ui.js             # Rendering, states, event/comparison UI
│       ├── export.js         # CSV/JSON/print/share
│       ├── i18n.js           # EN/AR translations + RTL
│       └── utils.js          # Helpers
├── server.js                 # Express static/API helper server
├── package.json
└── README.md
```

## How to run locally

> Use a local HTTP server. Opening `index.html` directly via `file://` can break ES module loading and some browser behaviors.

### Option A — Node/Express (included)
```bash
npm install
npm start
# open http://localhost:5000
```

### Option B — VS Code Live Server
1. Open the project folder in VS Code.
2. Start Live Server on `public/index.html` (or configure root appropriately).
3. Use the generated local URL.

### Option C — any static server
Serve the `public/` directory over HTTP (Python `http.server`, `npx serve public`, etc.).

## Data sources & integrations

| Source | Used for | Type | Notes |
|---|---|---|---|
| Open-Meteo Forecast API (`api.open-meteo.com/v1/forecast`) | Current/hourly/daily short-term forecast | Real API | Labeled as short-term forecast. |
| Open-Meteo Archive API (`archive-api.open-meteo.com/v1/archive`) | Historical daily max/min/mean temp, precipitation sum, wind max | Real API, historical/reanalysis values delivered by API | Used for probability calculations; not claimed as direct NASA download. |
| OpenStreetMap Nominatim | Location search/reverse geocoding | Real API | Debounced/cached; respect usage policies. |
| OpenStreetMap tiles | Base map | Real tiles | Attribution required/shown. |
| NASA GIBS WMTS | MODIS Terra Corrected Reflectance True Color imagery | Real NASA imagery service | Mapped in Leaflet using EPSG:3857 compatible tiles. Date/layer availability can vary. |
| NASA Worldview / Giovanni / GES DISC / Earthdata Search | Dataset exploration/discovery | Research links | Some workflows require authentication or server-side processing. |

## Historical probability methodology

For a selected location, month, day, and year range:
1. Fetch daily archive data for the year range from Open-Meteo Archive.
2. Filter to the selected month. If a day is selected, include observations within **±2 days** (day-of-month window) to improve sample size; if day = 0, use the full month.
3. Keep only **valid numeric observations** per metric.
4. Compute probability as: `count of qualifying observations / total valid observations × 100`.
5. Display thresholds, counts/totals, sample count, coverage estimate, period, dataset/provider, and method.

Default/configurable thresholds: heat ≥ 32°C (max temp), cold ≤ 5°C (min temp), rain ≥ 1 mm (daily precip sum), wind ≥ 35 km/h (daily max wind). The comfort score is a transparent planning indicator derived from risk contributions; it is **not** an official meteorological index.

## Limitations / honest constraints

- **Historical archive ≠ direct NASA product fetch in-browser:** direct GES DISC/Giovanni/Earthdata dataset downloads often require Earthdata authentication, specialized APIs, or server-side preprocessing. This implementation uses Open-Meteo Archive for practical browser-based historical probabilities and provides NASA research/discovery links.
- **GIBS imagery:** not every layer/date/zoom is available; imagery is observational context, not live weather.
- **Forecast horizon:** short-term (Open-Meteo forecast window). Do not interpret as a guarantee.
- **Statistics:** probabilities depend on available data quality/coverage and selected thresholds/window; sparse locations/periods may show “Insufficient Data”.
- **Legacy prototype:** `public/script.legacy.js` contains the old demo code that used `Math.random()` for fake NASA-style values. It is preserved for reference but is **not** used by the active app; the active UI does not display fabricated scientific observations.

## Browser compatibility

Modern browsers with ES module, Fetch, Clipboard (for share copy fallback may vary), and CSS Grid/Flexbox support (recent Chrome/Edge/Firefox/Safari). Best run over `http://localhost`.

## Deployment

Deploy the `public/` folder as static assets (and optionally run `server.js` on Node). Ensure HTTPS in production for geolocation/clipboard-related features where applicable. Review third-party API usage policies (Nominatim, Open-Meteo, NASA GIBS).

## Attribution

- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors; geocoding via Nominatim.
- Weather/forecast and archive data via [Open-Meteo](https://open-meteo.com/).
- Satellite imagery via [NASA GIBS](https://gibs.earthdata.nasa.gov/). NASA resources linked: [Worldview](https://worldview.earthdata.nasa.gov/), [Giovanni](https://giovanni.gsfc.nasa.gov/), [GES DISC](https://disc.gsfc.nasa.gov/), [Earthdata Search](https://search.earthdata.nasa.gov/).

## Main functionality test checklist

1. Start server / static host and open the app.
2. Search “Cairo” (or use quick location), select suggestion — map and dashboard update.
3. Click/drag on map — coordinates update and analysis can run.
4. Run historical analysis — risk cards show percentages or “Insufficient Data”, with sample counts/source/thresholds; charts render when data exists.
5. Switch map layer to NASA Satellite and change imagery date — GIBS layer loads or browser shows tile availability limits.
6. Load forecast — hourly chart + 7-day table appear, labeled short-term.
7. Evaluate event — uses computed historical results and, if selected date is in forecast range, shows separate forecast note.
8. Add to comparison — table shows current location metrics; clear comparison resets.
9. Export CSV/JSON and print report; copy share link and reopen URL with params.
10. Switch language to Arabic — RTL and translated labels apply.
11. Resize to mobile width — layout remains usable without horizontal overflow.