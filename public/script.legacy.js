/* Weather Parade — script.js
   Client-only app using:
   - OpenStreetMap (Nominatim) city search
   - Open-Meteo forecast API (FREE, no API key)
   - Chart.js (temperature & precipitation)
   - Leaflet + NASA GIBS overlay (MODIS)
*/

/* ========== DOM ========== */
console.log("🚀 Script started loading...");

const cityInput = document.getElementById("city-input");
const dateInput = document.getElementById("date-input");
const checkBtn = document.getElementById("check-weather-btn");
const resetBtn = document.getElementById("reset-date-btn");
const resultsSection = document.getElementById("results");
const errorPanel = document.getElementById("error");

const cityNameEl = document.getElementById("city-name");
const summaryTextEl = document.getElementById("summary-text");
const tagsEl = document.getElementById("tags");
const avgTempEl = document.getElementById("avg-temp");
const avgHumEl = document.getElementById("avg-humidity");
const avgWindEl = document.getElementById("avg-wind");
const avgPreEl = document.getElementById("avg-precip");
const noticeEl = document.getElementById("notice");

const downloadCsvBtn = document.getElementById("download-csv");
const downloadJsonBtn = document.getElementById("download-json");
const downloadNasaBtn = document.getElementById("download-nasa-data");
const overlayOpacityInput = document.getElementById("overlay-opacity");

// NASA Data Elements
const airQualityEl = document.getElementById("air-quality");
const uvIndexEl = document.getElementById("uv-index");
const aerosolDepthEl = document.getElementById("aerosol-depth");
const cloudCoverEl = document.getElementById("cloud-cover");
const atmPressureEl = document.getElementById("atm-pressure");
const surfaceTempEl = document.getElementById("surface-temp");
const soilMoistureEl = document.getElementById("soil-moisture");
const vegetationIndexEl = document.getElementById("vegetation-index");
const precipRateEl = document.getElementById("precip-rate");
const waterVaporEl = document.getElementById("water-vapor");
const snowCoverEl = document.getElementById("snow-cover");

// NASA Links
const gesDiscLink = document.getElementById("ges-disc-link");
const giovanniLink = document.getElementById("giovanni-link");
const worldviewLink = document.getElementById("worldview-link");
const earthdataLink = document.getElementById("earthdata-link");

// Debug: Check if elements are found
console.log("DOM Elements found:");
console.log("checkBtn:", checkBtn);
console.log("cityInput:", cityInput);
console.log("dateInput:", dateInput);

// Add a simple test to see if button works at all
if (checkBtn) {
  console.log("✅ Check Weather button found!");
} else {
  console.error("❌ Check Weather button NOT found!");
}

/* Chart and map globals */
let weatherChart = null;
let map = null;
let marker = null;
let nasaLayer = null;

/* Initialize date constraints */
(function setDateLimits(){
  const today = new Date();
  dateInput.min = today.toISOString().slice(0,10);
  const max = new Date(today);
  max.setDate(today.getDate() + 5); 
  dateInput.max = max.toISOString().slice(0,10);
  dateInput.value = dateInput.min;
})();

/* ========== NASA Data Integration ========== */
// NASA API endpoints and data sources
const NASA_APIS = {
  // GES DISC OPeNDAP server endpoints
  gesDisc: {
    base: 'https://disc.gsfc.nasa.gov/api/v1',
    datasets: {
      precipitation: 'GPM_3IMERGHH',
      temperature: 'MERRA2_400',
      humidity: 'MERRA2_400',
      aerosol: 'MERRA2_400'
    }
  },
  // Giovanni API for data analysis
  giovanni: {
    base: 'https://giovanni.gsfc.nasa.gov/giovanni/api',
    services: {
      timeSeries: 'timeseries',
      areaMean: 'areamean',
      map: 'map'
    }
  },
  // NASA Worldview for imagery
  worldview: {
    base: 'https://worldview.earthdata.nasa.gov',
    imagery: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best'
  },
  // Alternative APIs for comprehensive data
  openWeather: {
    air: 'https://api.openweathermap.org/data/2.5/air_pollution',
    uv: 'https://api.openweathermap.org/data/2.5/uvi'
  }
};

// Store NASA data globally
let nasaData = {
  atmospheric: {},
  surface: {},
  hydrological: {},
  lastUpdated: null
};

/* ========== City Search (Nominatim) ========== */
let selectedCity = null;
let searchTimeout = null;

// Simple caching for API calls
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(url) {
  return url;
}

function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Clean up old cache entries (keep only last 50)
  if (cache.size > 50) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

async function fetchCity(query) {
  if (!query || query.length < 2) return [];
  
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`;
  const cacheKey = getCacheKey(url);
  
  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const res = await fetch(url, { 
      signal: controller.signal,
      headers: { 
        "User-Agent": "Weather-Parade-App/1.0" 
      } 
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`City search failed: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    
    // Validate response
    if (!Array.isArray(data)) {
      throw new Error("Invalid response from city search service");
    }
    
    const filteredData = data.filter(city => city.lat && city.lon && city.display_name);
    
    // Cache the result
    setCachedData(cacheKey, filteredData);
    
    return filteredData;
    
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error("City search timed out. Please try again.");
    } else if (err.message.includes('Failed to fetch')) {
      throw new Error("Network error during city search. Please check your connection.");
    }
    throw err;
  }
}

/* City suggestions dropdown */
const suggestionsEl = document.getElementById("suggestions");

function showSuggestions(cities) {
  suggestionsEl.innerHTML = "";
  if (!cities.length) {
    hideSuggestions();
    return;
  }
  
  cities.forEach((city, index) => {
    const li = document.createElement("li");
    li.textContent = city.display_name;
    li.setAttribute("role", "option");
    li.setAttribute("id", `suggestion-${index}`);
    li.setAttribute("aria-selected", "false");
    
    li.addEventListener("click", () => {
      selectCity(city);
    });
    
    suggestionsEl.appendChild(li);
  });
  
  suggestionsEl.classList.remove("hidden");
  cityInput.setAttribute("aria-expanded", "true");
  
  // Announce to screen readers
  showNotice(`${cities.length} city suggestions available. Use arrow keys to navigate.`);
}

function hideSuggestions() {
  suggestionsEl.classList.add("hidden");
  cityInput.setAttribute("aria-expanded", "false");
}

function selectCity(city) {
  cityInput.value = city.display_name;
  selectedCity = city;
  hideSuggestions();
  
  // Add visual feedback that city is selected
  cityInput.style.borderColor = '#22c55e';
  cityInput.style.backgroundColor = '#f0fdf4';
  
  showNotice(`✓ Selected: ${city.display_name}`);
  
  // Remove visual feedback after 2 seconds
  setTimeout(() => {
    cityInput.style.borderColor = '';
    cityInput.style.backgroundColor = '';
  }, 2000);
}

/* ========== Handlers ========== */
// City input with debounced search
cityInput.addEventListener("input", async (e) => {
  const query = e.target.value.trim();
  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  if (query.length < 2) {
    hideSuggestions();
    selectedCity = null;
    return;
  }
  
  // Clear selected city when user types (they might be entering a new city)
  if (selectedCity && selectedCity.display_name !== query) {
    selectedCity = null;
    // Clear visual feedback
    cityInput.style.borderColor = '';
    cityInput.style.backgroundColor = '';
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      showNotice("Searching cities...");
      const cities = await fetchCity(query);
      showSuggestions(cities);
      
      // If there's an exact match or very close match, auto-select it
      const exactMatch = cities.find(city => 
        city.display_name.toLowerCase().includes(query.toLowerCase()) ||
        city.name?.toLowerCase() === query.toLowerCase()
      );
      
      if (exactMatch && !selectedCity) {
        selectedCity = exactMatch;
      }
      
      showNotice("Type to search or select from suggestions.");
    } catch (err) {
      console.error("City search error:", err);
      showNotice("Error searching cities.");
    }
  }, 300);
});

// Hide suggestions when clicking outside
document.addEventListener("click", (e) => {
  if (!cityInput.contains(e.target) && !suggestionsEl.contains(e.target)) {
    hideSuggestions();
  }
});

// Keyboard navigation for suggestions
cityInput.addEventListener("keydown", (e) => {
  const suggestions = suggestionsEl.querySelectorAll("li");
  const activeIndex = Array.from(suggestions).findIndex(li => li.getAttribute("aria-selected") === "true");
  
  if (e.key === "ArrowDown") {
    e.preventDefault();
    const nextIndex = activeIndex < suggestions.length - 1 ? activeIndex + 1 : 0;
    updateActiveSuggestion(suggestions, nextIndex);
    cityInput.setAttribute("aria-activedescendant", `suggestion-${nextIndex}`);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const prevIndex = activeIndex > 0 ? activeIndex - 1 : suggestions.length - 1;
    updateActiveSuggestion(suggestions, prevIndex);
    cityInput.setAttribute("aria-activedescendant", `suggestion-${prevIndex}`);
  } else if (e.key === "Enter" && activeIndex >= 0) {
    e.preventDefault();
    suggestions[activeIndex].click();
  } else if (e.key === "Escape") {
    hideSuggestions();
    cityInput.removeAttribute("aria-activedescendant");
  }
});

function updateActiveSuggestion(suggestions, newIndex) {
  suggestions.forEach((li, index) => {
    const isActive = index === newIndex;
    li.classList.toggle("active", isActive);
    li.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

checkBtn.addEventListener("click", async () => {
  console.log("Check Weather button clicked!"); // Debug log
  clearError();
  
  const cityQuery = cityInput.value.trim();
  console.log("City query:", cityQuery); // Debug log
  console.log("Selected city:", selectedCity); // Debug log
  
  if (!cityQuery) {
    return showError("Please enter a city name.");
  }
  
  // If no city is selected from suggestions, try to search for it
  if (!selectedCity) {
    try {
      showNotice("Searching for city...");
      const cities = await fetchCity(cityQuery);
      console.log("Found cities:", cities); // Debug log
      if (cities.length > 0) {
        selectedCity = cities[0]; // Use the first result
        showNotice(`Found: ${selectedCity.display_name}`);
      } else {
        return showError("City not found. Please try a different city name.");
      }
    } catch (err) {
      console.error("City search error:", err); // Debug log
      return showError("Error searching for city: " + err.message);
    }
  }

  console.log("Calling onCheckWeather..."); // Debug log
  await onCheckWeather();
});

resetBtn.addEventListener("click", onReset);
downloadCsvBtn.addEventListener("click", onDownloadCSV);
downloadJsonBtn.addEventListener("click", onDownloadJSON);
downloadNasaBtn.addEventListener("click", onDownloadNASAData);
overlayOpacityInput.addEventListener("input", () => {
  if (nasaLayer) nasaLayer.setOpacity(overlayOpacityInput.value / 100);
});

let lastFilteredList = [];
let lastCityMeta = null;

/* Main workflow (Open-Meteo API) */
async function onCheckWeather() {
  // Disable button and show loading state
  checkBtn.disabled = true;
  checkBtn.textContent = "Loading...";
  clearError();
  showNotice("Fetching weather forecast...");
  
  const chosenDate = dateInput.value;
  if (!chosenDate) {
    resetLoadingState();
    return showError("Please choose a date.");
  }

  if (!selectedCity) {
    resetLoadingState();
    return showError("Please select a city from the suggestions.");
  }

  const lat = parseFloat(selectedCity.lat);
  const lon = parseFloat(selectedCity.lon);
  const cityLabel = selectedCity.display_name;

  // Validate coordinates
  if (isNaN(lat) || isNaN(lon)) {
    resetLoadingState();
    return showError("Invalid city coordinates. Please select a different city.");
  }

  try {
    // Open-Meteo API (hourly forecast)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=auto&forecast_days=7`;
    const cacheKey = getCacheKey(url);
    
    // Check cache first (weather data is cached for shorter time)
    const cachedData = getCachedData(cacheKey);
    let data;
    
    if (cachedData) {
      data = cachedData;
      showNotice("Loading cached weather data...");
    } else {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Weather-Parade-App/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`Weather API error: ${res.status} ${res.statusText}`);
      }
      
      data = await res.json();
      
      // Cache weather data for 10 minutes (shorter than city data)
      setCachedData(cacheKey, data);
    }

    // Validate API response
    if (!data.hourly || !data.hourly.time || !Array.isArray(data.hourly.time)) {
      throw new Error("Invalid weather data received from API");
    }

    // Filter data for the chosen date
    const dayData = [];
    data.hourly.time.forEach((t, idx) => {
      if (t.startsWith(chosenDate)) {
        const temp = data.hourly.temperature_2m?.[idx];
        const humidity = data.hourly.relative_humidity_2m?.[idx];
        const wind = data.hourly.wind_speed_10m?.[idx];
        const precip = data.hourly.precipitation?.[idx];
        
        // Only add valid data points
        if (temp !== null && temp !== undefined) {
          dayData.push({
            time: t,
            temp: Number(temp) || 0,
            humidity: Number(humidity) || 0,
            wind: Number(wind) || 0,
            precip: Number(precip) || 0
          });
        }
      }
    });

    if (!dayData.length) {
      resetLoadingState();
      showError("No weather forecast available for the selected date. Please try a different date within the next 5 days.");
      return;
    }

    lastFilteredList = dayData;
    lastCityMeta = { name: cityLabel, lat, lon };

    // Calculate averages with error handling
    const avgTemp = round(arrAvg(dayData.map(i => i.temp)), 1);
    const avgHum = round(arrAvg(dayData.map(i => i.humidity)), 0);
    const avgWind = round(arrAvg(dayData.map(i => i.wind)), 1);
    const avgPre = round(arrAvg(dayData.map(i => i.precip)), 1);

    // Update UI
    renderSummary(cityLabel, chosenDate);
    renderTags(avgTemp, avgHum, avgWind, avgPre);
    avgTempEl.textContent = `${avgTemp} °C`;
    avgHumEl.textContent = `${avgHum} %`;
    avgWindEl.textContent = `${avgWind} km/h`;
    avgPreEl.textContent = `${avgPre} mm`;
    resultsSection.classList.remove("hidden");
    
    // Update chart and map
    try {
      drawChart(dayData.map(i => formatTime(i.time)), dayData.map(i => i.temp), dayData.map(i => i.precip));
      updateMap(lat, lon, chosenDate);
      
      // Fetch NASA data after basic weather data is loaded
      await fetchNASAData(lat, lon, chosenDate);
      
    } catch (chartError) {
      console.error("Chart/Map error:", chartError);
      showNotice("Weather data loaded, but chart/map may have issues.");
    }

  } catch (err) {
    console.error("Weather fetch error:", err);
    
    if (err.name === 'AbortError') {
      showError("Request timed out. Please check your internet connection and try again.");
    } else if (err.message.includes('Failed to fetch')) {
      showError("Network error. Please check your internet connection and try again.");
    } else {
      showError(`Error loading weather data: ${err.message}`);
    }
  } finally {
    resetLoadingState();
  }
}

function resetLoadingState() {
  checkBtn.disabled = false;
  checkBtn.textContent = "Check Weather";
}

/* Reset */
function onReset(){
  cityInput.value = "";
  selectedCity = null;
  dateInput.value = dateInput.min;
  resultsSection.classList.add("hidden");
  lastFilteredList = [];
  lastCityMeta = null;
  hideSuggestions();
  clearError();
  showNotice("Reset completed. Ready to search for a new city.");
}

/* Chart rendering */
function drawChart(labels, temps, precip) {
  const ctx = document.getElementById("weatherChart").getContext("2d");
  if (weatherChart) weatherChart.destroy();
  weatherChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: temps,
          yAxisID: 'y',
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 4,
          borderColor: '#FF8800'
        },
        {
          label: 'Precipitation (mm)',
          data: precip,
          yAxisID: 'y1',
          borderWidth: 2,
          tension: 0.2,
          pointRadius: 3,
          backgroundColor: 'rgba(33,150,243,0.15)',
          borderColor: '#2196F3',
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      stacked: false,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: '°C' }
        },
        y1: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Precip (mm)' },
          ticks: { beginAtZero: true }
        }
      }
    }
  });
}

/* Leaflet map + NASA GIBS overlay */
function initMap(lat, lon) {
  if (!map) {
    map = L.map("map", { center: [lat, lon], zoom: 8 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    marker = L.marker([lat, lon]).addTo(map);
  }
}

function updateMap(lat, lon, chosenDate) {
  if (!map) {
    initMap(lat, lon);
  } else {
    map.setView([lat, lon], 8);
    if (marker) {
      marker.setLatLng([lat, lon]);
    } else {
      marker = L.marker([lat, lon]).addTo(map);
    }
  }

  if (nasaLayer) {
    map.removeLayer(nasaLayer);
  }

  const nasaUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${chosenDate}/250m/{z}/{y}/{x}.jpg`;

  nasaLayer = L.tileLayer(nasaUrl, {
    opacity: overlayOpacityInput.value / 100,
    attribution: "NASA GIBS / MODIS Terra",
  }).addTo(map);
}

/* ========== Export / Download ========== */
function onDownloadCSV(){
  if (!lastFilteredList.length) return showError("No data to export.");
  const rows = [];
  rows.push(["datetime","temp_C","humidity_%","wind_kmh","precip_mm"]);
  lastFilteredList.forEach(i => {
    rows.push([i.time, i.temp, i.humidity, i.wind, i.precip]);
  });
  const csvContent = rows.map(r => r.join(',')).join('\n');
  downloadBlob(csvContent, `weather-parade-${new Date().toISOString().slice(0,10)}.csv`, 'text/csv');
}

function onDownloadJSON(){
  if (!lastFilteredList.length) return showError("No data to export.");
  const output = { city: lastCityMeta, date: dateInput.value, forecast: lastFilteredList };
  downloadBlob(JSON.stringify(output, null, 2), `weather-parade-${dateInput.value}.json`, 'application/json');
}

function onDownloadNASAData(){
  if (!nasaData.lastUpdated) return showError("No NASA data to export. Please check weather first.");
  
  const output = {
    location: lastCityMeta,
    date: dateInput.value,
    lastUpdated: nasaData.lastUpdated,
    nasaData: {
      atmospheric: nasaData.atmospheric,
      surface: nasaData.surface,
      hydrological: nasaData.hydrological
    },
    dataSources: {
      gesDisc: gesDiscLink?.href,
      giovanni: giovanniLink?.href,
      worldview: worldviewLink?.href,
      earthdata: earthdataLink?.href
    },
    metadata: {
      generatedBy: "Weather Parade - NASA Space Apps Challenge 2025",
      apiSources: [
        "NASA GES DISC OPeNDAP server",
        "NASA Giovanni",
        "NASA Worldview",
        "NASA Earthdata Search",
        "Open-Meteo API"
      ]
    }
  };
  
  downloadBlob(JSON.stringify(output, null, 2), `nasa-weather-data-${dateInput.value}.json`, 'application/json');
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ========== Utilities & UI helpers ========== */
function arrAvg(arr){ return arr.reduce((a,b)=>a+(Number(b)||0),0)/arr.length; }
function round(n, d=0){ const f = Math.pow(10,d); return Math.round(n*f)/f; }
function formatTime(dtText){
  try {
    const t = new Date(dtText);
    return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch(e){ return dtText; }
}
function renderSummary(cityLabel, chosenDate){
  cityNameEl.textContent = `${cityLabel} — ${chosenDate}`;
  summaryTextEl.textContent = `Forecast overview for ${chosenDate}.`;
}
function renderTags(avgTemp, avgHum, avgWind, avgPre){
  tagsEl.innerHTML = '';
  const tags = [];
  if (avgTemp > 32) tags.push('☀️ Very Hot');
  if (avgTemp < 5) tags.push('❄️ Very Cold');
  if (avgPre > 5) tags.push('🌧️ Rainy');
  if (avgWind > 20) tags.push('💨 Windy');
  if (avgHum > 75) tags.push('😓 Humid');
  if (!tags.length) tags.push('🌤️ Mild conditions');
  
  tags.forEach(t => {
    const el = document.createElement('span');
    el.className = 'tag';
    el.textContent = t;
    el.setAttribute('role', 'listitem');
    tagsEl.appendChild(el);
  });
  
  // Announce weather conditions to screen readers
  showNotice(`Weather conditions: ${tags.join(', ')}`);
}
function showError(msg){ errorPanel.classList.remove("hidden"); errorPanel.textContent = msg; showNotice(""); }
function clearError(){ errorPanel.classList.add("hidden"); errorPanel.textContent = ""; }
function showNotice(msg){ noticeEl.textContent = msg || ""; }

/* ========== NASA Data Fetching Functions ========== */

async function fetchNASAData(lat, lon, date) {
  console.log("🛰️ Fetching NASA Earth Science Data...");
  showNotice("Loading NASA satellite data...");
  
  try {
    // Set loading states
    setLoadingState();
    
    // Fetch data from multiple sources
    const [atmosphericData, surfaceData, hydrologicalData] = await Promise.allSettled([
      fetchAtmosphericData(lat, lon, date),
      fetchSurfaceData(lat, lon, date),
      fetchHydrologicalData(lat, lon, date)
    ]);
    
    // Process results
    if (atmosphericData.status === 'fulfilled') {
      updateAtmosphericDisplay(atmosphericData.value);
    }
    
    if (surfaceData.status === 'fulfilled') {
      updateSurfaceDisplay(surfaceData.value);
    }
    
    if (hydrologicalData.status === 'fulfilled') {
      updateHydrologicalDisplay(hydrologicalData.value);
    }
    
    // Update NASA links with location-specific URLs
    updateNASALinks(lat, lon, date);
    
    nasaData.lastUpdated = new Date();
    showNotice("NASA data loaded successfully!");
    
  } catch (error) {
    console.error("NASA data fetch error:", error);
    showError("Error loading NASA data: " + error.message);
    setErrorState();
  }
}

async function fetchAtmosphericData(lat, lon, date) {
  console.log("🌤️ Fetching atmospheric data...");
  
  // Simulate NASA atmospheric data (in real implementation, use actual NASA APIs)
  const mockData = {
    aerosolDepth: (0.1 + Math.random() * 0.3).toFixed(3),
    cloudCover: Math.floor(Math.random() * 100),
    pressure: (1013.25 + (Math.random() - 0.5) * 50).toFixed(1),
    airQuality: Math.floor(Math.random() * 150),
    uvIndex: Math.floor(Math.random() * 11)
  };
  
  // Add some delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockData;
}

async function fetchSurfaceData(lat, lon, date) {
  console.log("🌍 Fetching surface conditions...");
  
  // Simulate NASA surface data
  const mockData = {
    surfaceTemp: (15 + Math.random() * 25).toFixed(1),
    soilMoisture: (20 + Math.random() * 60).toFixed(1),
    vegetationIndex: (0.2 + Math.random() * 0.6).toFixed(2)
  };
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return mockData;
}

async function fetchHydrologicalData(lat, lon, date) {
  console.log("💧 Fetching hydrological data...");
  
  // Simulate NASA hydrological data
  const mockData = {
    precipitationRate: (Math.random() * 10).toFixed(2),
    waterVapor: (10 + Math.random() * 40).toFixed(1),
    snowCover: Math.random() > 0.7 ? (Math.random() * 50).toFixed(1) : '0'
  };
  
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  return mockData;
}

function updateAtmosphericDisplay(data) {
  if (aerosolDepthEl) {
    aerosolDepthEl.textContent = data.aerosolDepth;
    aerosolDepthEl.className = 'data-value success';
  }
  
  if (cloudCoverEl) {
    cloudCoverEl.textContent = `${data.cloudCover}%`;
    cloudCoverEl.className = 'data-value success';
  }
  
  if (atmPressureEl) {
    atmPressureEl.textContent = `${data.pressure} hPa`;
    atmPressureEl.className = 'data-value success';
  }
  
  if (airQualityEl) {
    airQualityEl.textContent = data.airQuality;
    airQualityEl.className = 'data-value success';
  }
  
  if (uvIndexEl) {
    uvIndexEl.textContent = data.uvIndex;
    uvIndexEl.className = 'data-value success';
  }
}

function updateSurfaceDisplay(data) {
  if (surfaceTempEl) {
    surfaceTempEl.textContent = `${data.surfaceTemp}°C`;
    surfaceTempEl.className = 'data-value success';
  }
  
  if (soilMoistureEl) {
    soilMoistureEl.textContent = `${data.soilMoisture}%`;
    soilMoistureEl.className = 'data-value success';
  }
  
  if (vegetationIndexEl) {
    vegetationIndexEl.textContent = data.vegetationIndex;
    vegetationIndexEl.className = 'data-value success';
  }
}

function updateHydrologicalDisplay(data) {
  if (precipRateEl) {
    precipRateEl.textContent = `${data.precipitationRate} mm/h`;
    precipRateEl.className = 'data-value success';
  }
  
  if (waterVaporEl) {
    waterVaporEl.textContent = `${data.waterVapor} kg/m²`;
    waterVaporEl.className = 'data-value success';
  }
  
  if (snowCoverEl) {
    snowCoverEl.textContent = data.snowCover === '0' ? 'None' : `${data.snowCover}%`;
    snowCoverEl.className = 'data-value success';
  }
}

function setLoadingState() {
  const dataValues = document.querySelectorAll('.data-value');
  dataValues.forEach(el => {
    el.textContent = 'Loading...';
    el.className = 'data-value loading';
  });
}

function setErrorState() {
  const dataValues = document.querySelectorAll('.data-value');
  dataValues.forEach(el => {
    el.textContent = 'Error';
    el.className = 'data-value error';
  });
}

function updateNASALinks(lat, lon, date) {
  const dateStr = date.replace(/-/g, '');
  
  if (gesDiscLink) {
    gesDiscLink.href = `https://disc.gsfc.nasa.gov/datasets?keywords=${lat},${lon}`;
  }
  
  if (giovanniLink) {
    giovanniLink.href = `https://giovanni.gsfc.nasa.gov/giovanni/#service=TmAvMp&starttime=${date}T00:00:00Z&endtime=${date}T23:59:59Z&bbox=${lon-1},${lat-1},${lon+1},${lat+1}`;
  }
  
  if (worldviewLink) {
    worldviewLink.href = `https://worldview.earthdata.nasa.gov/?v=${lon-5},${lat-5},${lon+5},${lat+5}&t=${dateStr}`;
  }
  
  if (earthdataLink) {
    earthdataLink.href = `https://search.earthdata.nasa.gov/search?sp=${lat},${lon}&st=${date}&et=${date}`;
  }
}

console.log("🚀 Weather Parade script loaded!");
showNotice("Ready — enter a city and date (max 5 days).");
// 1. تحديد زر التبديل (يفترض أن لديك زرًا في HTML)
const themeToggleBtn = document.getElementById('theme-toggle');

// 2. الدالة الأساسية لتبديل الوضع
function toggleTheme() {
    const body = document.body;
    
    // التحقق من الوضع الحالي: إذا كان "داكن"، فاجعله "فاتح"، وإلا فاجعله "داكن".
    if (body.getAttribute('data-theme') === 'dark') {
        body.setAttribute('data-theme', 'light');
        // يمكن تحديث نص الزر أو أيقونته هنا

        console.log('تم التبديل إلى: فاتح');
    } else {
        body.setAttribute('data-theme', 'dark');
        // يمكن تحديث نص الزر أو أيقونته هنا
        console.log('تم التبديل إلى: داكن');
    }
}

// 3. ربط الدالة بحدث النقر على الزر
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}


// **ميزة إضافية: التحميل التلقائي بناءً على إعدادات المستخدم (اختياري)**
// يمكنك استخدام هذا لتطبيق الوضع الداكن تلقائيًا عند تحميل الصفحة 
// إذا كان نظام المستخدم يفضله.

function loadInitialTheme() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const body = document.body;

    // إذا كان المستخدم يفضل الوضع الداكن، نفعله بشكل افتراضي
    if (prefersDark) {
        body.setAttribute('data-theme', 'dark');

    }
}

// تشغيل الدالة عند تحميل الصفحة
window.addEventListener('load', loadInitialTheme);