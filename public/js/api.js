import { fetchJson } from './utils.js';
const cache = new Map();
const TTL = 10 * 60 * 1000;
function ck(url){ return url; }
function getC(url){ const e=cache.get(ck(url)); if(e && Date.now()-e.t < TTL) return e.v; cache.delete(ck(url)); return null; }
function setC(url,v){ if(cache.size>60) cache.delete(cache.keys().next().value); cache.set(ck(url),{t:Date.now(),v}); }

export async function searchLocations(query, limit=5){
  const q=String(query||'').trim();
  if(q.length<2) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=${encodeURIComponent(limit)}&q=${encodeURIComponent(q)}`;
  const cached=getC(url); if(cached) return cached;
  const data = await fetchJson(url,{timeout:10000});
  const out = (Array.isArray(data)?data:[]).map(x=>({
    display_name: x.display_name,
    lat: Number(x.lat), lon: Number(x.lon),
    type: x.type, importance: x.importance,
    country: x.address?.country || '',
    name: x.address?.city || x.address?.town || x.address?.village || x.address?.state || x.name || x.display_name?.split(',')[0] || 'Location'
  })).filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon));
  setC(url,out); return out;
}

export async function reverseLocation(lat, lon){
  const url=`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
  const cached=getC(url); if(cached) return cached;
  try{
    const x=await fetchJson(url,{timeout:10000});
    const out={ display_name:x.display_name||`${lat}, ${lon}`, lat:Number(x.lat??lat), lon:Number(x.lon??lon),
      country:x.address?.country||'', name:x.address?.city||x.address?.town||x.address?.village||x.address?.state||x.name||'Selected location' };
    setC(url,out); return out;
  }catch{ return {display_name:`${lat.toFixed(4)}, ${lon.toFixed(4)}`,lat,lon,country:'',name:`${lat.toFixed(4)}, ${lon.toFixed(4)}`}; }
}

export async function getForecast(lat, lon){
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,precipitation_probability,precipitation,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=7`;
  const cached=getC(url); if(cached) return cached;
  const data=await fetchJson(url,{timeout:15000});
  if(!data || (!data.hourly && !data.daily)) throw new Error('Invalid forecast response');
  setC(url,data); return data;
}

export async function getHistorical(lat, lon, startDate, endDate){
  // Open-Meteo Archive API (historical/reanalysis). Browser CORS supported.
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,wind_speed_10m_max&timezone=auto`;
  const cached=getC(url); if(cached) return cached;
  const data=await fetchJson(url,{timeout:25000});
  if(!data?.daily?.time) throw new Error('Invalid historical response');
  setC(url,data); return data;
}