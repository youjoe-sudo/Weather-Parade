import { reverseLocation } from "./api.js";

let map;
let marker;
let osmLayer;
let nasaLayer;
let onPick;

export function initMap({
  lat = 30.0444,
  lon = 31.2357,
  zoom = 4,
  nasaDate,
  onLocationPick,
} = {}) {
  onPick = onLocationPick;

  map = L.map("map", {
    worldCopyJump: true,
    zoomControl: false,
  }).setView([lat, lon], zoom);

  L.control.zoom({ position: "bottomright" }).addTo(map);

  osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  nasaLayer = L.tileLayer(nasaTileUrl(nasaDate), {
    attribution:
      "Imagery: NASA GIBS / MODIS Terra Corrected Reflectance (True Color)",
    maxNativeZoom: 9,
    maxZoom: 19,
    opacity: 0.96,
  });

  const markerIcon = L.divIcon({
    className: "wp-marker",
    html: '<span class="wp-marker__pulse"></span><span class="wp-marker__dot"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  marker = L.marker([lat, lon], {
    draggable: true,
    icon: markerIcon,
    keyboard: true,
    title: "Selected location",
  }).addTo(map);

  marker.on("dragend", async () => {
    const position = marker.getLatLng();
    await pick(position.lat, position.lng);
  });

  map.on("click", async (event) => {
    await pick(event.latlng.lat, event.latlng.lng);
  });

  return map;
}

function nasaTileUrl(date) {
  const d = date || new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${d}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
}

async function pick(lat, lon) {
  if (marker) marker.setLatLng([lat, lon]);
  if (map) map.panTo([lat, lon], { animate: true });
  const loc = await reverseLocation(lat, lon);
  if (onPick) onPick(loc);
}

export function setLocation(lat, lon, zoom = 8) {
  if (!map) return;
  map.setView([lat, lon], zoom);
  if (marker) marker.setLatLng([lat, lon]);
}

export function setLayer(kind, nasaDate) {
  if (!map) return;
  if (kind === "nasa") {
    if (map.hasLayer(osmLayer)) map.removeLayer(osmLayer);
    nasaLayer.setUrl(nasaTileUrl(nasaDate));
    if (!map.hasLayer(nasaLayer)) nasaLayer.addTo(map);
  } else {
    if (map.hasLayer(nasaLayer)) map.removeLayer(nasaLayer);
    if (!map.hasLayer(osmLayer)) osmLayer.addTo(map);
  }
}

export function setNasaDate(date) {
  if (nasaLayer) nasaLayer.setUrl(nasaTileUrl(date));
}

export function invalidate() {
  if (map) setTimeout(() => map.invalidateSize(), 60);
}
