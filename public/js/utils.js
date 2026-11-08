export const $ = (sel, root=document) => root.querySelector(sel);
export const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
export function esc(s=''){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export function clamp(n,min,max){ return Math.min(max,Math.max(min,n)); }
export function round(n,d=1){ const p=10**d; return Math.round((Number(n)||0)*p)/p; }
export function avg(arr){ const v=arr.filter(x=>Number.isFinite(x)); return v.length? v.reduce((a,b)=>a+b,0)/v.length : NaN; }
export function fmtDate(d){ return d instanceof Date ? d.toISOString().slice(0,10) : String(d||'').slice(0,10); }
export function addDays(date, days){ const d=new Date(date); d.setDate(d.getDate()+days); return d; }
export function debounce(fn, wait=350){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),wait); }; }
export function safeText(el, text){ if(el) el.textContent = text ?? ''; }
export function setHidden(el, hidden){ if(!el) return; el.hidden = !!hidden; el.classList.toggle('hidden', !!hidden); }
export function getParams(){ return new URLSearchParams(location.search); }
export function setParams(obj, replace=true){
  const p=new URLSearchParams(location.search);
  Object.entries(obj).forEach(([k,v])=>{ if(v===undefined||v===null||v==='') p.delete(k); else p.set(k,String(v)); });
  const url = `${location.pathname}?${p.toString()}`;
  replace ? history.replaceState(null,'',url) : history.pushState(null,'',url);
}
export async function fetchJson(url, {timeout=15000, signal}={}){
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(), timeout);
  try{
    const res=await fetch(url,{signal: signal||ctrl.signal, headers:{'Accept':'application/json'}});
    if(!res.ok){ const text=await res.text().catch(()=> ''); throw new Error(`HTTP ${res.status}${text?`: ${text.slice(0,120)}`:''}`); }
    return await res.json();
  } finally { clearTimeout(timer); }
}
export function riskLabel(pct){
  if(!Number.isFinite(pct)) return 'insufficient';
  if(pct < 20) return 'low';
  if(pct < 40) return 'moderate';
  if(pct < 60) return 'high';
  return 'very_high';
}
export function csvEscape(v){
  const s = v==null?'' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
}
export function downloadBlob(filename, content, type){
  const blob = content instanceof Blob ? content : new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
