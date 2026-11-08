import { getHistorical } from './api.js';
import { avg, round, riskLabel } from './utils.js';

function yearRange(years){
  // Open-Meteo Archive has publication lag and rejects future end dates.
  const safeEnd = new Date();
  safeEnd.setUTCDate(safeEnd.getUTCDate() - 5);
  const endYear = safeEnd.getUTCFullYear();
  const startYear = Math.max(1940, endYear - Math.max(1, Number(years) || 10) + 1);
  const endDate = safeEnd.toISOString().slice(0, 10);
  return { startYear, endYear, startDate:`${startYear}-01-01`, endDate };
}

function matchesWindow(dateStr, month, day){
  // month: 1-12. day 0 means whole month.
  const d = new Date(dateStr+'T00:00:00Z');
  const m = d.getUTCMonth()+1; const dd = d.getUTCDate();
  if(m!==month) return false;
  if(!day) return true;
  // window: selected day +/- 2 days to increase sample size, staying in month context by day-of-month distance
  return Math.abs(dd-day) <= 2;
}

export async function analyzeHistorical(lat, lon, opts){
  const month = Number(opts.month);
  const day = Number(opts.day||0);
  const years = Number(opts.years||10);
  const th = {
    heat: Number(opts.heat??32), cold: Number(opts.cold??5),
    rain: Number(opts.rain??1), wind: Number(opts.wind??35)
  };
  const {startYear,endYear,startDate,endDate} = yearRange(years);
  const source = {
    dataset: 'Open-Meteo Historical Weather API (archive)',
    provider: 'Open-Meteo / historical reanalysis sources exposed by API',
    type: 'Historical weather / reanalysis (API-delivered daily values)',
    period: `${startDate} to ${endDate}`,
    units: { temperature:'°C', precipitation:'mm', wind:'km/h' },
    thresholds: th,
    method: 'Daily observations filtered to selected month and day window (±2 days, or full month), then valid-value statistics/probabilities computed.'
  };
  let raw;
  try { raw = await getHistorical(lat, lon, startDate, endDate); }
  catch(e){ return { ok:false, error:String(e?.message||e), source }; }
  const d = raw.daily||{};
  const times = d.time||[];
  const tmax=d.temperature_2m_max||[], tmin=d.temperature_2m_min||[], tmean=d.temperature_2m_mean||[];
  const psum=d.precipitation_sum||[], wmax=d.wind_speed_10m_max||[];
  const rows=[];
  for(let i=0;i<times.length;i++){
    if(!matchesWindow(times[i], month, day)) continue;
    rows.push({ date:times[i], tmax:tmax[i], tmin:tmin[i], tmean:tmean[i], precip:psum[i], wind:wmax[i] });
  }
  const validTemp = rows.filter(r=>Number.isFinite(r.tmax)||Number.isFinite(r.tmean)||Number.isFinite(r.tmin));
  const validRain = rows.filter(r=>Number.isFinite(r.precip));
  const validWind = rows.filter(r=>Number.isFinite(r.wind));
  const validCold = rows.filter(r=>Number.isFinite(r.tmin));
  const n = Math.max(validTemp.length, validRain.length, validWind.length);
  if(n < 10){
    return { ok:false, insufficient:true, source:{...source, sampleCount:n, coverage: n? (n/(years* (day?5:28))*100):0 }, rowsCount:rows.length };
  }
  const pct = (count,total)=> total>0 ? round((count/total)*100,1) : NaN;
  const rainCount = validRain.filter(r=>r.precip >= th.rain).length;
  const heatCount = validTemp.filter(r=>Number.isFinite(r.tmax) ? r.tmax >= th.heat : (r.tmean>=th.heat)).length;
  const coldCount = validCold.filter(r=>r.tmin <= th.cold).length;
  const windCount = validWind.filter(r=>r.wind >= th.wind).length;
  const metrics = {
    rainRisk: { value:pct(rainCount,validRain.length), label:riskLabel(pct(rainCount,validRain.length)), count:rainCount, total:validRain.length, threshold:`≥ ${th.rain} mm` },
    heatRisk: { value:pct(heatCount,validTemp.length), label:riskLabel(pct(heatCount,validTemp.length)), count:heatCount, total:validTemp.length, threshold:`≥ ${th.heat} °C` },
    coldRisk: { value:pct(coldCount,validCold.length), label:riskLabel(pct(coldCount,validCold.length)), count:coldCount, total:validCold.length, threshold:`≤ ${th.cold} °C` },
    windRisk: { value:pct(windCount,validWind.length), label:riskLabel(pct(windCount,validWind.length)), count:windCount, total:validWind.length, threshold:`≥ ${th.wind} km/h` },
  };
  // Comfort planning indicator (documented): starts at 100, subtracts risk contributions with caps.
  let comfort = 100;
  const sub = (m,w)=> Number.isFinite(m.value) ? Math.min(w, m.value*(w/100)) : 0;
  comfort -= sub(metrics.rainRisk,35) + sub(metrics.heatRisk,25) + sub(metrics.coldRisk,20) + sub(metrics.windRisk,20);
  comfort = round(Math.max(0, Math.min(100, comfort)), 1);
  const temps = rows.map(r=>Number.isFinite(r.tmean)?r.tmean:(Number.isFinite(r.tmax)&&Number.isFinite(r.tmin)?(r.tmax+r.tmin)/2:NaN)).filter(Number.isFinite);
  const summary = {
    avgTemp: round(avg(temps),1), maxTemp: round(Math.max(...validTemp.map(r=>r.tmax).filter(Number.isFinite)),1),
    minTemp: round(Math.min(...validCold.map(r=>r.tmin).filter(Number.isFinite)),1),
    avgPrecip: round(avg(validRain.map(r=>r.precip)),2), avgWind: round(avg(validWind.map(r=>r.wind)),1),
    comfortScore: comfort, comfortLabel: comfort>=70?'low':comfort>=45?'moderate':'high'
  };
  // monthly comfort (all months) using simple sampled approach? To limit payload, compute from same raw daily by month.
  const monthly = Array.from({length:12},(_,mi)=>({month:mi+1, comfort:NaN, samples:0}));
  for(let mi=1; mi<=12; mi++){
    const mrows=[];
    for(let i=0;i<times.length;i++){ const md=new Date(times[i]+'T00:00:00Z'); if(md.getUTCMonth()+1!==mi) continue; mrows.push({tmax:tmax[i],tmin:tmin[i],precip:psum[i],wind:wmax[i]}); }
    const vr=mrows.filter(r=>Number.isFinite(r.precip)), vt=mrows.filter(r=>Number.isFinite(r.tmax)), vc=mrows.filter(r=>Number.isFinite(r.tmin)), vw=mrows.filter(r=>Number.isFinite(r.wind));
    if(vr.length<20||vt.length<20){ monthly[mi-1].samples = mrows.length; continue; }
    const mr={ value:pct(vr.filter(r=>r.precip>=th.rain).length,vr.length)};
    const mh={ value:pct(vt.filter(r=>r.tmax>=th.heat).length,vt.length)};
    const mc={ value:pct(vc.filter(r=>r.tmin<=th.cold).length,vc.length)};
    const mw={ value:pct(vw.filter(r=>r.wind>=th.wind).length,vw.length)};
    let c=100; c-= (Number.isFinite(mr.value)?Math.min(35,mr.value*.35):0)+(Number.isFinite(mh.value)?Math.min(25,mh.value*.25):0)+(Number.isFinite(mc.value)?Math.min(20,mc.value*.20):0)+(Number.isFinite(mw.value)?Math.min(20,mw.value*.20):0);
    monthly[mi-1]={month:mi, comfort:round(Math.max(0,c),1), samples:mrows.length};
  }
  const sampleCount = Math.max(validRain.length, validTemp.length, validWind.length);
  const coverage = round((sampleCount / (years * (day?5:30))) * 100, 1);
  return { ok:true, metrics, summary, rows, monthly, source:{...source, sampleCount, coverage: Math.min(coverage,999), startYear, endYear, month, day, years }, thresholds:th };
}
