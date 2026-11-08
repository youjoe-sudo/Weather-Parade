import { csvEscape, downloadBlob, setParams, getParams } from './utils.js';

export function exportHistoricalCsv(state){
  const h=state.historical; if(!h?.ok) return false;
  const loc=state.location; const src=h.source; const rows=[];
  const base={location:loc?.display_name||'', lat:loc?.lat, lon:loc?.lon, period:src.period, dataset:src.dataset, threshold_heat:src.thresholds.heat, threshold_rain:src.thresholds.rain, threshold_wind:src.thresholds.wind, sample_count:src.sampleCount, method:src.method};
  // computed metrics
  [['rain_risk_percent',h.metrics.rainRisk.value,'%'],['heat_risk_percent',h.metrics.heatRisk.value,'%'],['cold_risk_percent',h.metrics.coldRisk.value,'%'],['wind_risk_percent',h.metrics.windRisk.value,'%'],['comfort_score',h.summary.comfortScore,'score']].forEach(([variable,value,unit])=>{
    rows.push({...base,date:src.month&&src.day?`${src.endYear}-${String(src.month).padStart(2,'0')}-${String(src.day).padStart(2,'0')}`:`month ${src.month}`,variable,value,unit});
  });
  // sample observations used (capped for file size)
  (h.rows||[]).slice(0,500).forEach(r=>{
    rows.push({...base,date:r.date,variable:'temperature_2m_max',value:r.tmax,unit:'°C'});
    rows.push({...base,date:r.date,variable:'temperature_2m_min',value:r.tmin,unit:'°C'});
    rows.push({...base,date:r.date,variable:'precipitation_sum',value:r.precip,unit:'mm'});
    rows.push({...base,date:r.date,variable:'wind_speed_10m_max',value:r.wind,unit:'km/h'});
  });
  const headers=Object.keys(rows[0]||base);
  const csv=[headers.join(','), ...rows.map(r=>headers.map(hd=>csvEscape(r[hd])).join(','))].join('\n');
  downloadBlob(`weather-parade-historical-${(loc?.name||'location').replace(/[^a-z0-9]+/gi,'-').toLowerCase()}.csv`, csv, 'text/csv;charset=utf-8');
  return true;
}
export function exportJson(state){
  const payload = {
    exported_at: new Date().toISOString(),
    application: 'Weather Parade',
    disclaimer: 'Historical probabilities are derived from available Open-Meteo archive observations/reanalysis for the selected period/window and thresholds. Forecast is short-term and separate.',
    state: {
      location: state.location, date: state.date, thresholds: state.thresholds,
      historical: state.historical ? { ok:state.historical.ok, metrics:state.historical.metrics, summary:state.historical.summary, source:state.historical.source, thresholds:state.historical.thresholds } : null,
      forecast: state.forecast ? { source:'Open-Meteo Forecast API', current:state.forecast.current, daily:state.forecast.daily } : null,
      comparisons: state.comparisons||[]
    }
  };
  downloadBlob(`weather-parade-analysis.json`, JSON.stringify(payload,null,2), 'application/json;charset=utf-8');
  return true;
}
export function printReport(){ window.print(); }
export async function copyShareLink(state){
  setParams({ lat: state.location?.lat, lon: state.location?.lon, date: state.date, month: state.thresholds?.month, day: state.thresholds?.day, years: state.thresholds?.years, heat: state.thresholds?.heat, cold: state.thresholds?.cold, rain: state.thresholds?.rain, wind: state.thresholds?.wind }, true);
  await navigator.clipboard?.writeText(location.href);
  return location.href;
}
export function readShareParams(){ return Object.fromEntries(getParams().entries()); }