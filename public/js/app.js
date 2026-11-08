import { $, $$, debounce, setParams } from './utils.js';
import { initI18n, setLang, getLang, t, applyTranslations } from './i18n.js';
import { searchLocations, reverseLocation, getForecast } from './api.js';
import { analyzeHistorical } from './historical.js';
import { initMap, setLocation, setLayer, setNasaDate, invalidate } from './map.js';
import { renderTempChart, renderRainChart, renderRiskChart, renderSeasonalChart, renderForecastChart } from './charts.js';
import { showError, clearError, showNotice, clearNotice, renderDashboard, renderHistorical, renderForecast, renderNasaExplorer, renderEventResult, renderComparison } from './ui.js';
import { exportHistoricalCsv, exportJson, printReport, copyShareLink, readShareParams } from './export.js';

const state = {
  location: null, date: new Date().toISOString().slice(0,10),
  thresholds: { month: new Date().getMonth()+1, day: new Date().getDate(), years: 10, heat:32, cold:5, rain:1, wind:35 },
  historical: null, forecast: null, comparisons: []
};

function syncInputs(){
  $('#month').value = state.thresholds.month;
  $('#day').value = state.thresholds.day || '';
  $('#years').value = state.thresholds.years;
  $('#heat-th').value = state.thresholds.heat;
  $('#cold-th').value = state.thresholds.cold;
  $('#rain-th').value = state.thresholds.rain;
  $('#wind-th').value = state.thresholds.wind;
  $('#date-input').value = state.date;
  $('#nasa-date').value = state.date;
  $('#event-date').value = state.date;
}
function readThresholdInputs(){
  state.thresholds.month = Number($('#month').value);
  state.thresholds.day = Number($('#day').value||0);
  state.thresholds.years = Number($('#years').value||10);
  state.thresholds.heat = Number($('#heat-th').value);
  state.thresholds.cold = Number($('#cold-th').value);
  state.thresholds.rain = Number($('#rain-th').value);
  state.thresholds.wind = Number($('#wind-th').value);
  state.date = $('#date-input').value || state.date;
}

async function selectLocation(loc, {pan=true, analyze=false}={}){
  if(!loc || !Number.isFinite(loc.lat)) return;
  state.location = loc;
  $('#location-search').value = loc.display_name || loc.name || '';
  renderDashboard(state.location, state.date, state.historical?.ok?t('ready'):t('insufficient'), state.forecast?t('ready'):'—');
  renderNasaExplorer(state.location, state.date);
  if(pan) setLocation(loc.lat, loc.lon, 8);
  setParams({lat:loc.lat.toFixed(5), lon:loc.lon.toFixed(5), date:state.date});
  if(analyze) await runAnalysis();
}

async function runForecast(){
  if(!state.location) return;
  try{
    renderDashboard(state.location,state.date,state.historical?.ok?t('ready'):'—',t('loading'));
    state.forecast = await getForecast(state.location.lat, state.location.lon);
    renderForecast(state.forecast);
    renderForecastChart('forecastChart', state.forecast.hourly);
    renderDashboard(state.location,state.date,state.historical?.ok?t('ready'):t('insufficient'),t('ready'));
  }catch(e){ showError(`${t('error_network')} (${e.message})`); renderDashboard(state.location,state.date,'—',t('insufficient')); }
}

async function runAnalysis(){
  if(!state.location){ showError('Select a location first (search or click the map).'); return; }
  clearError(); readThresholdInputs();
  renderDashboard(state.location,state.date,t('loading'), state.forecast?t('ready'):'—');
  $('#risk-cards').innerHTML = `<div class="loading">${t('loading')}</div>`;
  try{
    state.historical = await analyzeHistorical(state.location.lat, state.location.lon, state.thresholds);
    renderHistorical(state.historical);
    if(state.historical.ok){
      renderTempChart('tempChart', state.historical.rows, state.historical.thresholds);
      renderRainChart('rainChart', state.historical.rows, state.historical.thresholds);
      renderRiskChart('riskChart', state.historical.metrics);
      renderSeasonalChart('seasonChart', state.historical.monthly);
      showNotice(`Historical analysis complete: ${state.historical.source.sampleCount} valid observations from ${state.historical.source.dataset}.`);
    } else if(state.historical.insufficient){ showNotice(t('no_data_period'),'info'); }
    renderDashboard(state.location,state.date,state.historical.ok?t('ready'):t('insufficient'), state.forecast?t('ready'):'—');
    renderNasaExplorer(state.location, state.date);
  }catch(e){ showError(e.message||String(e)); renderDashboard(state.location,state.date,t('insufficient'), state.forecast?t('ready'):'—'); }
}

function wireSearch(){
  const input=$('#location-search'), list=$('#suggestions');
  let active=-1, items=[];
  const hide=()=>{ list.hidden=true; list.innerHTML=''; active=-1; items=[]; };
  const render=(res)=>{
    items=res||[]; active=-1; list.innerHTML = items.map((x,i)=>`<li><button type="button" data-i="${i}">${x.display_name}</button></li>`).join('');
    list.hidden = items.length===0;
  };
  input.addEventListener('input', debounce(async ()=>{
    clearError();
    const q=input.value.trim(); if(q.length<2){ hide(); return; }
    try{ render(await searchLocations(q,6)); }
    catch(e){ hide(); if(String(e).includes('429')) showError(t('error_rate')); }
  }, 350));
  list.addEventListener('click', async (e)=>{ const b=e.target.closest('button[data-i]'); if(!b) return; const loc=items[Number(b.dataset.i)]; hide(); if(loc) await selectLocation(loc,{pan:true,analyze:true}); await runForecast(); });
  input.addEventListener('keydown', (e)=>{
    if(list.hidden) return;
    if(e.key==='ArrowDown'){ e.preventDefault(); active=Math.min(items.length-1,active+1); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); active=Math.max(0,active-1); }
    else if(e.key==='Escape'){ hide(); return; }
    else if(e.key==='Enter' && active>=0){ e.preventDefault(); list.querySelector(`button[data-i="${active}"]`)?.click(); return; }
    else return;
    $$('button', list).forEach((b,i)=>b.setAttribute('aria-selected', i===active?'true':'false'));
  });
  document.addEventListener('click', (e)=>{ if(!e.target.closest('.search-wrap')) hide(); });
}

function wireEvents(){
  $('#lang-select').value = getLang();
  $('#lang-select').addEventListener('change', (e)=>{ setLang(e.target.value); renderNasaExplorer(state.location,state.date); if(state.historical) renderHistorical(state.historical); if(state.forecast) renderForecast(state.forecast); });
  $('#run-analysis').addEventListener('click', runAnalysis);
  $('#run-forecast').addEventListener('click', runForecast);
  $('#date-input').addEventListener('change', (e)=>{ state.date=e.target.value; $('#nasa-date').value=state.date; $('#event-date').value=state.date; renderNasaExplorer(state.location,state.date); renderDashboard(state.location,state.date,'—',state.forecast?t('ready'):'—'); });
  $('#month').addEventListener('change', ()=>{ state.thresholds.month=Number($('#month').value); });
  $('#map-layer').addEventListener('change', (e)=> setLayer(e.target.value, $('#nasa-date').value));
  $('#nasa-date').addEventListener('change', (e)=>{ setNasaDate(e.target.value); if($('#map-layer').value==='nasa') setLayer('nasa', e.target.value); });
  $('#export-csv').addEventListener('click', ()=>{ if(!exportHistoricalCsv(state)) showError('Run historical analysis before exporting CSV.'); else showNotice(t('export_ready')); });
  $('#export-json').addEventListener('click', ()=>{ exportJson(state); showNotice(t('export_ready')); });
  $('#export-report').addEventListener('click', printReport);
  $('#share-link').addEventListener('click', async ()=>{ if(!state.location){ showError('Select a location first.'); return; } readThresholdInputs(); await copyShareLink(state); showNotice(t('copied')); });
  $('#plan-event').addEventListener('click', ()=>{
    readThresholdInputs();
    renderEventResult({ eventName:$('#event-name').value, locationName:state.location?.display_name }, state.historical, state.forecast, $('#event-date').value||state.date);
  });
  $('#add-compare').addEventListener('click', ()=>{
    if(!state.historical?.ok || !state.location){ showError('Run historical analysis for the current location before adding to comparison.'); return; }
    state.comparisons.push({ location: state.location, metrics: state.historical.metrics, summary: state.historical.summary, source: state.historical.source, thresholds: state.historical.thresholds });
    renderComparison(state.comparisons);
  });
  $('#clear-compare').addEventListener('click', ()=>{ state.comparisons=[]; renderComparison(state.comparisons); });
  // quick links
  $$('.quick-loc').forEach(b=>b.addEventListener('click', async ()=>{
    const loc={name:b.dataset.name, display_name:b.dataset.name, lat:Number(b.dataset.lat), lon:Number(b.dataset.lon), country:''};
    await selectLocation(loc,{pan:true,analyze:true}); await runForecast();
  }));
  window.addEventListener('resize', debounce(invalidate, 150));
}

async function applyShareParams(){
  const p=readShareParams();
  if(p.date) state.date=p.date;
  ['month','day','years','heat','cold','rain','wind'].forEach(k=>{ if(p[k]!=null && p[k]!=='') state.thresholds[k]=Number(p[k]); });
  syncInputs();
  if(Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon))){
    const lat=Number(p.lat), lon=Number(p.lon);
    const loc = await reverseLocation(lat,lon);
    await selectLocation(loc,{pan:true,analyze:false});
    await Promise.allSettled([runForecast(), runAnalysis()]);
  } else {
    renderDashboard(null, state.date, '—', '—');
    renderNasaExplorer(null, state.date);
  }
}

async function main(){
  initI18n();
  syncInputs();
  initMap({ lat:30.0444, lon:31.2357, zoom:3, nasaDate: state.date, onLocationPick: async (loc)=>{ await selectLocation(loc,{pan:false,analyze:true}); await runForecast(); } });
  renderComparison([]);
  wireSearch(); wireEvents();
  await applyShareParams();
  clearNotice();
}
main().catch(e=>showError(e.message||String(e)));