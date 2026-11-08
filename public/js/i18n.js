import { $$ } from './utils.js';
const DICT = {
  en: {
    app_name:'Weather Parade', tagline:'Will It Rain On My Parade?', hero_title:'Will It Rain On Your Parade?',
    hero_sub:'Discover historical weather patterns. Plan outdoor events with confidence.',
    nav_home:'Home', nav_historical:'Historical Analysis', nav_nasa:'NASA Explorer', nav_forecast:'Forecast', nav_about:'About',
    search_location:'Search location', search_placeholder:'City, country, or place...', search_btn:'Search', use_map:'Or click the map to select coordinates',
    dashboard:'Dashboard', location:'Location', coordinates:'Coordinates', selected_date:'Selected date', period:'Historical period',
    historical_status:'Historical analysis', forecast_status:'Forecast', loading:'Loading…', ready:'Ready', insufficient:'Insufficient data',
    historical_title:'Historical Weather Analysis', month:'Month', day:'Day of month', years:'Past years', temp_threshold:'Heat threshold (°C)', cold_threshold:'Cold threshold (°C)', rain_threshold:'Rain threshold (mm)', wind_threshold:'Wind threshold (km/h)', run_analysis:'Run historical analysis',
    rain_risk:'Rain Risk', heat_risk:'Extreme Heat Risk', cold_risk:'Cold Risk', wind_risk:'Strong Wind Risk', comfort:'Outdoor Comfort',
    low:'Low', moderate:'Moderate', high:'High', very_high:'Very High', insufficient_data:'Insufficient Data',
    samples:'Samples', source:'Source', threshold:'Threshold', method:'Calculated from valid historical observations for the selected month/day window.',
    score_note:'Planning indicator based on documented thresholds — not an official meteorological index.',
    forecast_title:'Short-Term Weather Forecast', forecast_note:'Weather forecast (short-term), not historical probability.',
    nasa_title:'NASA Explorer', nasa_note:'NASA GIBS imagery shows satellite observations for a selected date/layer, not live weather conditions.',
    layer_osm:'OpenStreetMap', layer_nasa:'NASA Satellite (MODIS True Color)', nasa_date:'Imagery date', map_layer:'Map layer',
    event_title:'Event Planning', event_name:'Event name', duration:'Duration (hours)', preferred_temp_min:'Preferred min temp (°C)', preferred_temp_max:'Preferred max temp (°C)',
    max_rain:'Max acceptable rain (mm)', max_wind:'Max acceptable wind (km/h)', plan_event:'Evaluate event suitability',
    compare_title:'Location Comparison', add_compare:'Add current location to comparison', clear_compare:'Clear comparison',
    export_csv:'Export CSV', export_json:'Export JSON', export_report:'Print / Save PDF report', share_link:'Copy share link',
    about_title:'About & Methodology', footer_sources:'Data sources: Open-Meteo (forecast/archive), OpenStreetMap/Nominatim, NASA GIBS/Worldview/Giovanni/Earthdata links.',
    disclaimer:'Historical probabilities are computed from available observations/reanalysis for the selected location and period. They are not guarantees and not a substitute for official forecasts or warnings.',
    error_location:'Could not find that location. Try a more specific search.', error_network:'Network error. Please check your connection and try again.', error_rate:'Too many requests to the geocoding service. Please wait and retry.',
    no_data_period:'Insufficient historical data for this location/period. Try a different date, a broader period, or another location.',
    copied:'Share link copied.', export_ready:'Export ready.'
  },
  ar: {
    app_name:'موكب الطقس', tagline:'هل ستمطر على موكبي؟', hero_title:'هل ستمطر على موكبك؟',
    hero_sub:'اكتشف أنماط الطقس التاريخية وخطّط للفعاليات الخارجية بثقة.',
    nav_home:'الرئيسية', nav_historical:'التحليل التاريخي', nav_nasa:'مستكشف ناسا', nav_forecast:'التوقعات', nav_about:'حول',
    search_location:'البحث عن موقع', search_placeholder:'مدينة أو دولة أو مكان...', search_btn:'بحث', use_map:'أو انقر على الخريطة لاختيار الإحداثيات',
    dashboard:'لوحة المعلومات', location:'الموقع', coordinates:'الإحداثيات', selected_date:'التاريخ المحدد', period:'الفترة التاريخية',
    historical_status:'التحليل التاريخي', forecast_status:'التوقعات', loading:'جارٍ التحميل…', ready:'جاهز', insufficient:'بيانات غير كافية',
    historical_title:'تحليل الطقس التاريخي', month:'الشهر', day:'يوم من الشهر', years:'عدد السنوات الماضية', temp_threshold:'عتبة الحرارة (°م)', cold_threshold:'عتبة البرودة (°م)', rain_threshold:'عتبة الأمطار (مم)', wind_threshold:'عتبة الرياح (كم/س)', run_analysis:'تشغيل التحليل التاريخي',
    rain_risk:'خطر الأمطار', heat_risk:'خطر الحرارة العالية', cold_risk:'خطر البرودة', wind_risk:'خطر الرياح القوية', comfort:'ملاءمة الأجواء الخارجية',
    low:'منخفض', moderate:'متوسط', high:'مرتفع', very_high:'مرتفع جدًا', insufficient_data:'بيانات غير كافية',
    samples:'عدد العينات', source:'المصدر', threshold:'العتبة', method:'محسوبة من المشاهدات التاريخية الصالحة للفترة/اليوم المحدد.',
    score_note:'مؤشر تخطيطي يعتمد على عتبات موثقة — وليس مؤشرًا أرصاديًا رسميًا.',
    forecast_title:'توقعات الطقس قصيرة المدى', forecast_note:'توقعات طقس قصيرة المدى وليست احتمالية تاريخية.',
    nasa_title:'مستكشف ناسا', nasa_note:'صور NASA GIBS تعرض مشاهدات فضائية لتاريخ/طبقة محددة وليست حالة طقس مباشرة.',
    layer_osm:'خريطة OpenStreetMap', layer_nasa:'صور ناسا (MODIS True Color)', nasa_date:'تاريخ الصورة', map_layer:'طبقة الخريطة',
    event_title:'تخطيط الفعالية', event_name:'اسم الفعالية', duration:'المدة (ساعات)', preferred_temp_min:'أدنى حرارة مفضلة (°م)', preferred_temp_max:'أعلى حرارة مفضلة (°م)',
    max_rain:'أقصى أمطار مقبولة (مم)', max_wind:'أقصى رياح مقبولة (كم/س)', plan_event:'تقييم ملاءمة الفعالية',
    compare_title:'مقارنة المواقع', add_compare:'إضافة الموقع الحالي للمقارنة', clear_compare:'مسح المقارنة',
    export_csv:'تصدير CSV', export_json:'تصدير JSON', export_report:'طباعة / حفظ تقرير PDF', share_link:'نسخ رابط المشاركة',
    about_title:'حول المنهجية', footer_sources:'مصادر البيانات: Open-Meteo (توقعات/أرشيف)، OpenStreetMap/Nominatim، وروابط NASA GIBS/Worldview/Giovanni/Earthdata.',
    disclaimer:'الاحتمالات التاريخية محسوبة من المشاهدات/إعادة التحليل المتاحة للموقع والفترة المحددين. وهي ليست ضمانًا ولا بديلًا عن التوقعات أو التحذيرات الرسمية.',
    error_location:'تعذر العثور على الموقع. جرّب بحثًا أكثر تحديدًا.', error_network:'خطأ في الشبكة. تحقق من الاتصال وحاول مرة أخرى.', error_rate:'طلبات كثيرة لخدمة تحديد المواقع. انتظر قليلًا ثم أعد المحاولة.',
    no_data_period:'لا توجد بيانات تاريخية كافية لهذا الموقع/الفترة. جرّب تاريخًا أو فترة أو موقعًا مختلفًا.',
    copied:'تم نسخ رابط المشاركة.', export_ready:'التصدير جاهز.'
  }
};
let lang = localStorage.getItem('wp_lang') || 'en';
export function t(key){ return (DICT[lang]&&DICT[lang][key]) || DICT.en[key] || key; }
export function getLang(){ return lang; }
export function setLang(next){
  lang = next === 'ar' ? 'ar' : 'en';
  localStorage.setItem('wp_lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  applyTranslations();
}
export function applyTranslations(root=document){
  $$('[data-i18n]', root).forEach(el=>{ const k=el.getAttribute('data-i18n'); if(k) el.textContent = t(k); });
  $$('[data-i18n-placeholder]', root).forEach(el=>{ const k=el.getAttribute('data-i18n-placeholder'); if(k) el.setAttribute('placeholder', t(k)); });
  $$('[data-i18n-aria]', root).forEach(el=>{ const k=el.getAttribute('data-i18n-aria'); if(k) el.setAttribute('aria-label', t(k)); });
}
export function initI18n(){ setLang(lang); }
