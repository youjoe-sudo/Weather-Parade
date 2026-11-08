import { $, $$, esc, riskLabel, round } from './utils.js';
import { t } from './i18n.js';

export function showError(msg){ const el=$('#global-error'); if(!el) return; el.hidden=false; el.className='error-box fade-in'; el.textContent=msg; }
export function clearError(){ const el=$('#global-error'); if(el){ el.hidden=true; el.textContent=''; } }
export function showNotice(msg, type='notice'){ const el=$('#global-notice'); if(!el) return; el.hidden=false; el.className=`${type==='info'?'info-box':'notice'} fade-in`; el.textContent=msg; }
export function clearNotice(){ const el=$('#global-notice'); if(el){ el.hidden=true; el.textContent=''; } }
export function setStatus(key, value){ const el=$(`#status-${key}`); if(el) el.textContent=value; }

export function renderDashboard(loc, date, histState, fcState){
  $('#loc-name').textContent = loc ? `${loc.name}${loc.country?`, ${loc.country}`:''}` : '—';
  $('#loc-coords').textContent = loc ? `${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}` : '—';
  $('#loc-date').textContent = date || '—';
  setStatus('historical', histState||'—'); setStatus('forecast', fcState||'—');
}

function metricCard(title, metric, extra=''){
  if(!metric || !Number.isFinite(metric.value)){
    return `<div class="metric"><h4>${esc(title)}</h4><div class="value">—</div><span class="risk risk-high">${esc(t('insufficient_data'))}</span><div class="small muted">${esc(extra)}</div></div>`;
  }
  const labelKey = metric.label || riskLabel(metric.value);
  const label = t(labelKey) || labelKey;
  return `<div class="metric"><h4>${esc(title)}</h4><div class="value">${metric.value}%</div><span class="risk risk-${esc(labelKey)}">${esc(label)}</span><div class="small muted">${esc(t('threshold'))}: ${esc(metric.threshold||'—')} · ${esc(t('samples'))}: ${metric.count}/${metric.total}</div>${extra?`<div class="small muted">${esc(extra)}</div>`:''}</div>`;
}
export function renderHistorical(result){
  const cards=$('#risk-cards'); const meta=$('#historical-meta'); const details=$('#historical-details');
  if(!cards) return;
  if(!result || result.ok===false){
    cards.innerHTML = ['rain_risk','heat_risk','cold_risk','wind_risk','comfort'].map(k=>`<div class="metric"><h4>${esc(t(k))}</h4><div class="value">—</div><span class="risk risk-high">${esc(t('insufficient_data'))}</span></div>`).join('');
    if(meta) meta.innerHTML = result?.insufficient ? `<div class="info-box">${esc(t('no_data_period'))}</div>` : (result?.error?`<div class="error-box">${esc(result.error)}</div>`:'');
    if(details) details.innerHTML='';
    return;
  }
  const m=result.metrics, s=result.summary, src=result.source;
  cards.innerHTML = [
    metricCard(t('rain_risk'), m.rainRisk),
    metricCard(t('heat_risk'), m.heatRisk),
    metricCard(t('cold_risk'), m.coldRisk),
    metricCard(t('wind_risk'), m.windRisk),
    `<div class="metric"><h4>${esc(t('comfort'))}</h4><div class="value">${s.comfortScore}</div><span class="risk risk-${esc(s.comfortLabel)}">${esc(t(s.comfortLabel))}</span><div class="small muted">${esc(t('score_note'))}</div></div>`
  ].join('');
  if(meta) meta.innerHTML = `<div class="notice small"><strong>${esc(t('source'))}:</strong> ${esc(src.dataset)} (${esc(src.provider)}) · <strong>${esc(t('period'))}:</strong> ${esc(src.period)} · <strong>${esc(t('samples'))}:</strong> ${esc(src.sampleCount)} · Coverage: ${esc(src.coverage)}%.<br><strong>Method:</strong> ${esc(src.method)}</div>`;
  if(details) details.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>
    <tr><td>Average temp (selected window)</td><td>${esc(s.avgTemp)} °C</td></tr>
    <tr><td>Max observed (window)</td><td>${esc(s.maxTemp)} °C</td></tr>
    <tr><td>Min observed (window)</td><td>${esc(s.minTemp)} °C</td></tr>
    <tr><td>Average precipitation sum/day</td><td>${esc(s.avgPrecip)} mm</td></tr>
    <tr><td>Average max wind</td><td>${esc(s.avgWind)} km/h</td></tr>
  </tbody></table></div>`;
}

export function renderForecast(fc){
  const el=$('#forecast-content'); if(!el) return;
  if(!fc){ el.innerHTML=`<div class="info-box">${esc(t('insufficient_data'))}</div>`; return; }
  const c=fc.current||{};
  const daily=fc.daily||{}; const times=daily.time||[];
  const rows=times.slice(0,7).map((d,i)=>`<tr><td>${esc(d)}</td><td>${esc(daily.temperature_2m_min?.[i])}–${esc(daily.temperature_2m_max?.[i])} °C</td><td>${esc(daily.precipitation_sum?.[i])} mm</td><td>${esc(daily.precipitation_probability_max?.[i]??'—')}%</td><td>${esc(daily.wind_speed_10m_max?.[i])} km/h</td></tr>`).join('');
  el.innerHTML = `<div class="notice small">${esc(t('forecast_note'))}</div>
    <div class="cards" style="margin:.5rem 0">
      <div class="metric"><h4>Current temp</h4><div class="value">${esc(c.temperature_2m??'—')} °C</div></div>
      <div class="metric"><h4>Humidity</h4><div class="value">${esc(c.relative_humidity_2m??'—')}%</div></div>
      <div class="metric"><h4>Wind</h4><div class="value">${esc(c.wind_speed_10m??'—')} km/h</div></div>
      <div class="metric"><h4>Precipitation</h4><div class="value">${esc(c.precipitation??'—')} mm</div></div>
    </div>
    <div class="chart-wrap" style="margin:.5rem 0"><canvas id="forecastChart"></canvas></div>
    <div class="table-wrap"><table><thead><tr><th>Date</th><th>Temp min–max</th><th>Precip sum</th><th>Rain prob max</th><th>Max wind</th></tr></thead><tbody>${rows||'<tr><td colspan="5">No daily data</td></tr>'}</tbody></table></div>`;
}

export function renderNasaExplorer(loc, date){
  const el=$('#nasa-links'); if(!el) return;
  if(!loc){ el.innerHTML = `<div class="muted small">Select a location to generate NASA research links.</div>`; return; }
  const lat=loc.lat, lon=loc.lon, d=date||new Date().toISOString().slice(0,10);
  const worldview = `https://worldview.earthdata.nasa.gov/?v=${(lon-5).toFixed(4)},${(lat-5).toFixed(4)},${(lon+5).toFixed(4)},${(lat+5).toFixed(4)}&t=${d}`;
  const earthdata = `https://search.earthdata.nasa.gov/search?m=${lat.toFixed(4)}!${lon.toFixed(4)}!7!1!0!0%2C2`;
  const giovanni = `https://giovanni.gsfc.nasa.gov/giovanni/`;
  const gesdisc = `https://disc.gsfc.nasa.gov/`;
  el.innerHTML = `<div class="notice small">${esc(t('nasa_note'))}</div>
    <div class="row"><a class="btn" target="_blank" rel="noopener" href="${worldview}">NASA Worldview</a>
    <a class="btn" target="_blank" rel="noopener" href="${giovanni}">NASA Giovanni</a>
    <a class="btn" target="_blank" rel="noopener" href="${gesdisc}">GES DISC</a>
    <a class="btn" target="_blank" rel="noopener" href="${earthdata}">Earthdata Search</a></div>
    <div class="small muted" style="margin-top:.5rem">Giovanni/Earthdata/GES DISC may require authentication or advanced workflows for direct dataset downloads. Use these links to explore datasets (e.g., GPM IMERG precipitation, MERRA-2) for ${esc(loc.name||'selected location')}.</div>`;
}

export function renderEventResult(input, hist, fc, date){
  const el=$('#event-result'); if(!el) return;
  if(!hist || !hist.ok){ el.innerHTML = `<div class="info-box">Run historical analysis first for the selected location/date.</div>`; return; }
  const m=hist.metrics, th=hist.thresholds;
  const lines=[];
  if(Number.isFinite(m.rainRisk.value)) lines.push(`Rainfall exceeded your selected threshold (≥ ${th.rain} mm) in ${m.rainRisk.value}% of valid historical observations (${m.rainRisk.count}/${m.rainRisk.total}).`);
  if(Number.isFinite(m.heatRisk.value)) lines.push(`High heat (≥ ${th.heat} °C) occurred in ${m.heatRisk.value}% of valid observations.`);
  if(Number.isFinite(m.windRisk.value)) lines.push(`Strong wind (≥ ${th.wind} km/h max) occurred in ${m.windRisk.value}% of valid observations.`);
  lines.push(`Outdoor comfort planning score: ${hist.summary.comfortScore}/100 (${t(hist.summary.comfortLabel)} concern). Source: ${hist.source.dataset}; samples: ${hist.source.sampleCount}; coverage: ${hist.source.coverage}%.`);
  let forecastNote='';
  if(fc?.daily?.time){
    const idx = fc.daily.time.indexOf(date);
    if(idx>=0) forecastNote = `<div class="notice small" style="margin-top:.5rem"><strong>Short-term forecast (separate from historical):</strong> ${date} — temp ${fc.daily.temperature_2m_min[idx]}–${fc.daily.temperature_2m_max[idx]} °C, precip sum ${fc.daily.precipitation_sum[idx]} mm, rain prob max ${fc.daily.precipitation_probability_max?.[idx]??'—'}%, max wind ${fc.daily.wind_speed_10m_max[idx]} km/h.</div>`;
    else forecastNote = `<div class="info-box small" style="margin-top:.5rem">Short-term forecast is available for the next 7 days; selected date ${esc(date)} may be outside that range. Historical suitability above still applies.</div>`;
  }
  el.innerHTML = `<div class="notice"><strong>${esc(input.eventName||'Event')}</strong> — ${esc(input.locationName||'Selected location')} on ${esc(date)}.</div><ul>${lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>${forecastNote}`;
}

export function renderComparison(list){
  const el=$('#compare-content'); if(!el) return;
  if(!list.length){ el.innerHTML=`<div class="muted small">No comparison locations yet.</div>`; return; }
  const rows=list.map(x=>`<tr><td>${esc(x.location.name)}${x.location.country?`, ${esc(x.location.country)}`:''}</td><td>${esc(x.source?.dataset||'—')}</td><td>${fmtM(x.metrics?.rainRisk)}</td><td>${fmtM(x.metrics?.heatRisk)}</td><td>${fmtM(x.metrics?.windRisk)}</td><td>${esc(x.summary?.comfortScore??'—')}</td><td>${esc(x.source?.sampleCount??'—')}</td></tr>`).join('');
  el.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Location</th><th>Dataset</th><th>Rain %</th><th>Heat %</th><th>Wind %</th><th>Comfort</th><th>Samples</th></tr></thead><tbody>${rows}</tbody></table></div><div class="small muted">Comparisons use the same selected month/day window and thresholds at analysis time. If analyses were run with different settings or datasets, results are not directly comparable.</div>`;
}
function fmtM(m){ return m && Number.isFinite(m.value) ? `${m.value}% (${m.count}/${m.total})` : 'Insufficient'; }