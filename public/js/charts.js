let charts = {};
function destroy(id){ if(charts[id]){ charts[id].destroy(); delete charts[id]; } }
function baseOpts(title, yTitle){ return {
  responsive:true, maintainAspectRatio:false,
  interaction:{mode:'index',intersect:false},
  plugins:{ legend:{labels:{color:'#94A3B8'}}, title:{display:!!title,text:title,color:'#F1F5F9'} },
  scales:{ x:{ticks:{color:'#94A3B8'},grid:{color:'rgba(148,163,184,.08)'}},
           y:{title:yTitle?{display:true,text:yTitle,color:'#94A3B8'}:undefined,ticks:{color:'#94A3B8'},grid:{color:'rgba(148,163,184,.08)'}} }
}; }
export function renderTempChart(canvasId, rows, th){
  destroy(canvasId);
  const ctx=document.getElementById(canvasId); if(!ctx) return;
  const labels=rows.map(r=>r.date); const temps=rows.map(r=>Number.isFinite(r.tmean)?r.tmean:(Number.isFinite(r.tmax)&&Number.isFinite(r.tmin)?(r.tmax+r.tmin)/2:null));
  const maxes=rows.map(r=>r.tmax); const mins=rows.map(r=>r.tmin);
  charts[canvasId]=new Chart(ctx,{type:'line',data:{labels,datasets:[
    {label:'Mean/approx temp (°C)',data:temps,borderColor:'#38BDF8',backgroundColor:'rgba(56,189,248,.12)',tension:.25,pointRadius:0},
    {label:'Max (°C)',data:maxes,borderColor:'#FB7185',tension:.2,pointRadius:0,borderDash:[4,3]},
    {label:'Min (°C)',data:mins,borderColor:'#818CF8',tension:.2,pointRadius:0,borderDash:[4,3]},
  ]},options:baseOpts('Historical temperature (selected period window)','°C')});
}
export function renderRainChart(canvasId, rows, th){
  destroy(canvasId); const ctx=document.getElementById(canvasId); if(!ctx) return;
  const labels=rows.map(r=>r.date); const vals=rows.map(r=>r.precip);
  charts[canvasId]=new Chart(ctx,{type:'bar',data:{labels,datasets:[{label:`Precipitation (mm)`,data:vals,backgroundColor:vals.map(v=>Number.isFinite(v)&&v>=(th?.rain??1)?'rgba(251,113,133,.65)':'rgba(56,189,248,.45)')} ]},options:baseOpts('Historical precipitation','mm')});
}
export function renderRiskChart(canvasId, metrics){
  destroy(canvasId); const ctx=document.getElementById(canvasId); if(!ctx) return;
  const items=[['Rain',metrics?.rainRisk?.value],['Heat',metrics?.heatRisk?.value],['Cold',metrics?.coldRisk?.value],['Wind',metrics?.windRisk?.value]].filter(i=>Number.isFinite(i[1]));
  charts[canvasId]=new Chart(ctx,{type:'doughnut',data:{labels:items.map(i=>i[0]),datasets:[{data:items.map(i=>i[1]),backgroundColor:['#38BDF8','#FB7185','#818CF8','#FBBF24']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#94A3B8'}},title:{display:true,text:'Risk distribution (%)',color:'#F1F5F9'}}}});
}
export function renderSeasonalChart(canvasId, monthly){
  destroy(canvasId); const ctx=document.getElementById(canvasId); if(!ctx) return;
  const names=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  charts[canvasId]=new Chart(ctx,{type:'bar',data:{labels:names,datasets:[{label:'Comfort planning score (0-100)',data:monthly.map(m=>m.comfort),backgroundColor:'rgba(52,211,153,.45)'}]},options:baseOpts('Seasonal comfort (monthly)','Score')});
}
export function renderForecastChart(canvasId, hourly){
  destroy(canvasId); const ctx=document.getElementById(canvasId); if(!ctx) return;
  const labels=(hourly?.time||[]).slice(0,48).map(t=>t.replace('T',' '));
  const temp=(hourly?.temperature_2m||[]).slice(0,48);
  const precip=(hourly?.precipitation||[]).slice(0,48);
  charts[canvasId]=new Chart(ctx,{data:{labels,datasets:[
    {type:'line',label:'Temperature (°C)',data:temp,borderColor:'#38BDF8',tension:.25,yAxisID:'y',pointRadius:0},
    {type:'bar',label:'Precipitation (mm)',data:precip,backgroundColor:'rgba(129,140,248,.4)',yAxisID:'y1'}
  ]},options:{...baseOpts('Hourly forecast (next ~48h)'),scales:{x:{ticks:{color:'#94A3B8',maxTicksLimit:8},grid:{color:'rgba(148,163,184,.08)'}},y:{position:'left',ticks:{color:'#94A3B8'},grid:{color:'rgba(148,163,184,.08)'}},y1:{position:'right',ticks:{color:'#94A3B8'},grid:{drawOnChartArea:false}}}}});
}
export function destroyAll(){ Object.keys(charts).forEach(destroy); }