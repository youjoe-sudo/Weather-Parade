import { $$ } from "./utils.js";

const DICT = {
  en: {
    /* Brand & navigation */
    app_name: "Weather Parade",
    brand_weather: "Weather",
    brand_parade: "Parade",
    tagline: "Will It Rain On My Parade?",
    nav_home: "Home",
    nav_historical: "Historical Analysis",
    nav_nasa: "NASA Explorer",
    nav_forecast: "Forecast",
    nav_about: "About",
    nav_plan: "Event Planning",
    nav_start: "Start planning",
    nav_menu: "Open menu",
    nav_close: "Close menu",

    /* Hero */
    hero_eyebrow: "Historical climate intelligence",
    hero_title_html:
      'Will It <span class="hero__accent">Rain</span> On Your Parade?',
    hero_title: "Will It Rain On Your Parade?",
    hero_sub:
      "Discover historical weather patterns. Plan outdoor events with confidence.",
    hero_disclaimer: "NASA Earth observation resources + Open-Meteo",
    app_focus:
      "Primary focus: historical weather probability — how often conditions occurred in past observations — not a deterministic long-range forecast.",
    search_location: "Search location",
    search_placeholder: "Search a city, country, or place",
    search_btn: "Analyze",
    use_map: "Or click the map to select coordinates",
    hero_try: "Try",
    example1: "Cairo",
    example2: "Alexandria",
    example3: "London",
    example4: "New York",
    hero_cta_primary: "Explore Weather Risks",
    hero_cta_secondary: "Discover How It Works",
    hero_rail_label: "Built on",
    hero_rail_scroll: "Scroll to explore",
    earth_caption_title: "Earth observation context",
    earth_caption_meta: "NASA Blue Marble mosaic",

    /* Difference */
    difference_eyebrow: "Why Weather Parade",
    difference_title_html:
      "A forecast tells you what may happen.<br />History tells you what usually happens.",
    difference_lede:
      "Weather Parade is built for the decision that forecast apps rarely answer: is this location and time of year historically suitable for an outdoor event?",
    diff_forecast_title: "Traditional forecast",
    diff_forecast_desc:
      "A best estimate for the next few days. Useful for immediate decisions, but it cannot tell you what an outdoor event faces six months from now.",
    diff_historical_title: "Historical analysis",
    diff_historical_desc:
      "A probability profile built from valid past observations. It shows how often heat, rain, wind, or cold crossed your thresholds at this place and season.",
    diff_planning_title: "Long-term event planning",
    diff_planning_desc:
      "A decision layer: compare locations, weigh comfort against risk, and choose a date with the odds in view instead of relying on instinct.",
    diff_horizon: "Horizon",
    diff_output: "Output",
    diff_use: "Best for",
    diff_forecast_horizon: "0–14 days",
    diff_forecast_output: "One predicted outcome",
    diff_forecast_use: "Same-week decisions",
    diff_historical_horizon: "Past 2–30 years",
    diff_historical_output: "Observed probabilities",
    diff_historical_use: "Season and venue decisions",
    diff_planning_horizon: "Weeks to months ahead",
    diff_planning_output: "Location and date confidence",
    diff_planning_use: "Outdoor events and venues",
    difference_callout_text:
      "Weather Parade keeps these three layers visibly separate — so a seven-day forecast is never mistaken for a historical probability.",
    difference_callout_link: "See the analysis workspace",

    /* Risks */
    risks_eyebrow: "Weather risk analysis",
    risks_title:
      "Five conditions that decide whether an outdoor plan holds.",
    risks_lede:
      "Each risk is calculated from actual observations for your chosen location, month, and day window. Thresholds are visible and adjustable. Nothing here is simulated.",
    risk_hot_title: "Very Hot",
    risk_hot_desc:
      "Days when the maximum temperature crossed your heat threshold.",
    risk_cold_title: "Very Cold",
    risk_cold_desc:
      "Days when the minimum temperature fell below your cold threshold.",
    risk_windy_title: "Very Windy",
    risk_windy_desc:
      "Days when the maximum wind speed reached your wind threshold.",
    risk_wet_title: "Very Wet",
    risk_wet_desc:
      "Days when daily precipitation met or exceeded your rain threshold.",
    risk_uncomfortable_title: "Very Uncomfortable",
    risk_uncomfortable_desc:
      "The combined planning concern from all measured risks, not a single meteorological variable.",
    risk_aside_eyebrow: "How to read this",
    risk_aside_title: "Probabilities come from observations, not guesses.",
    risk_aside_text:
      "A 24% rain risk means that rain crossed your threshold in 24 of 100 valid historical observations for this window. It is a planning indicator, not a guarantee about a future date.",
    risk_aside_point1: "Valid observation counts are always shown.",
    risk_aside_point2: "Thresholds are visible and adjustable.",
    risk_aside_point3: "Sparse data is labelled, never filled in.",
    risk_aside_point4: "Forecasts stay in a separate section.",
    risk_aside_link: "Run your own analysis",
    risks_footnote:
      "Percentages populate after a historical analysis. The comfort indicator is a documented planning score, not an official meteorological index.",

    /* Workspace */
    workspace_eyebrow: "Analysis workspace",
    workspace_title: "Build a climate profile for your date.",
    workspace_lede:
      "Choose a place, a month, and a day window. Weather Parade compares it against the last decade of valid observations.",
    workspace_status_idle: "No location selected",
    workspace_status_loading: "Updating analysis…",
    workspace_status_selected: "Location selected",
    location: "Location",
    coordinates: "Coordinates",
    selected_date: "Selected date",
    period: "Historical period",
    historical_status: "Historical analysis",
    forecast_status: "Forecast",
    map_click_hint: "Click the map to pick coordinates",
    analysis_params_title: "Analysis parameters",
    analysis_params_lede:
      "Set the window and the thresholds that matter to your event.",
    month: "Month",
    day: "Day of month",
    years: "Past years",
    temp_threshold: "Heat threshold (°C)",
    cold_threshold: "Cold threshold (°C)",
    rain_threshold: "Rain threshold (mm)",
    wind_threshold: "Wind threshold (km/h)",
    run_analysis: "Run historical analysis",
    method_summary: "Method & data source",
    coverage: "Coverage",
    source: "Source",
    samples: "Samples",
    threshold: "Threshold",
    method:
      "Calculated from valid historical observations for the selected month/day window.",
    score_note:
      "Planning indicator based on documented thresholds — not an official meteorological index.",
    map_layer: "Map layer",
    layer_osm: "OpenStreetMap",
    layer_nasa: "NASA Satellite (MODIS True Color)",
    nasa_date: "Imagery date",
    forecast_disclaimer:
      "Map tiles © OpenStreetMap contributors. NASA layer uses GIBS MODIS Terra Corrected Reflectance (True Color) for the selected imagery date when available; imagery availability varies by date/zoom and is not live weather.",
    loading: "Loading…",
    ready: "Ready",
    insufficient: "Insufficient data",
    insufficient_data: "Insufficient Data",
    awaiting_analysis: "Awaiting analysis",
    no_data_period:
      "Insufficient historical data for this location/period. Try a different date, a broader period, or another location.",
    low: "Low",
    moderate: "Moderate",
    high: "High",
    very_high: "Very High",
    concern_low: "Low concern",
    concern_moderate: "Moderate concern",
    concern_high: "High concern",
    detail_metric: "Metric",
    detail_value: "Value",
    detail_avg_temp: "Average temperature (selected window)",
    detail_max_temp: "Maximum observed",
    detail_min_temp: "Minimum observed",
    detail_avg_precip: "Average precipitation sum / day",
    detail_avg_wind: "Average maximum wind",
    analysis_complete:
      "Historical analysis complete: {count} valid observations from {dataset}.",
    error_select_location:
      "Select a location first — search for a city or click the map.",
    error_network: "Network error. Please check your connection and try again.",
    error_rate:
      "Too many requests to the geocoding service. Please wait and retry.",
    run_analysis_first:
      "Run historical analysis for the current location before adding it to the comparison.",
    run_analysis_first_csv:
      "Run historical analysis before exporting CSV.",
    copied: "Share link copied.",
    export_ready: "Export ready.",

    /* Overview */
    overview_eyebrow: "Risk overview",
    overview_title: "Your date, seen through a decade of weather.",
    overview_lede:
      "Once an analysis runs, this view summarizes temperature, precipitation, wind, and seasonal comfort using the same observation set.",
    comfort: "Outdoor Comfort",
    comfort_note:
      "A documented planning score. It is not an official meteorological index.",
    summary_avg_temp: "Average temperature",
    summary_avg_rain: "Average precipitation / day",
    summary_avg_wind: "Average max wind",
    summary_samples: "Valid observations",
    chart_temp_title: "Temperature range",
    chart_temp_desc: "Daily mean, maximum, and minimum temperatures.",
    chart_rain_title: "Precipitation history",
    chart_rain_desc: "Daily totals across the selected window.",
    chart_risk_title: "Risk distribution",
    chart_risk_desc: "How often each threshold was crossed.",
    chart_season_title: "Seasonal comfort",
    chart_season_desc: "Monthly planning indicator across the year.",
    chart_empty: "Run an analysis to plot observations.",

    /* NASA */
    nasa_title: "NASA Explorer",
    nasa_eyebrow: "NASA Explorer",
    nasa_heading: "Earth, observed.",
    nasa_lede:
      "Explore genuine NASA Earth observation resources around your selected coordinates and date. Satellite imagery is observational context — not live weather.",
    nasa_preview_placeholder:
      "Select a location to preview NASA satellite imagery.",
    nasa_preview_label: "Satellite preview",
    nasa_preview_none: "Select a location",
    nasa_preview_caption:
      "Imagery availability varies by date and zoom. It is not a live weather map.",
    nasa_datasets_title: "Datasets worth exploring",
    dataset_modis_desc: "Daily global surface imagery",
    dataset_imerg_desc: "Global precipitation estimates",
    dataset_merra_desc: "Atmospheric reanalysis records",
    nasa_links_note:
      "Links use your selected coordinates and imagery date where the service supports it.",
    nasa_links_no_location:
      "Select a location to generate location-aware NASA research links.",
    nasa_disclosure:
      "GIBS imagery is a genuine browser integration. Other NASA services may require Earthdata authentication or server-side processing for direct dataset downloads; the links open those official workflows.",
    explorer_disclaimer:
      "Genuine NASA integrations in this browser app: NASA GIBS satellite imagery layer on the map and location/date-aware research links to NASA Worldview, Giovanni, GES DISC, and Earthdata Search. Direct authenticated dataset downloads/APIs vary by service and may require NASA Earthdata login or server-side processing; this app documents that honestly.",
    nasa_note:
      "NASA GIBS imagery shows satellite observations for a selected date/layer, not live weather conditions.",

    /* Planning */
    planning_eyebrow: "Event planning",
    planning_title: "Plan with the odds in view.",
    planning_lede:
      "Turn the analysis into a decision. Define what your event can tolerate, then review the historical record before you commit.",
    workflow_step1_title: "Select a location",
    workflow_step1_desc: "Search a city or click the map to set the coordinates.",
    workflow_step2_title: "Choose a date or season",
    workflow_step2_desc:
      "Use a month and day window to compare against past years.",
    workflow_step3_title: "Read the historical risks",
    workflow_step3_desc:
      "Check rain, heat, cold, wind, and the comfort indicator.",
    workflow_step4_title: "Compare and decide",
    workflow_step4_desc:
      "Add alternate locations, compare the same window, and choose with evidence.",
    event_title: "Event Planning",
    event_brief_title: "Event brief",
    event_brief_lede: "Tell Weather Parade what your event can tolerate.",
    event_badge: "Historical + forecast",
    event_name: "Event name",
    event_date: "Event date",
    duration: "Duration (hours)",
    preferred_temp_min: "Preferred min temp (°C)",
    preferred_temp_max: "Preferred max temp (°C)",
    max_rain: "Max acceptable rain (mm)",
    max_wind: "Max acceptable wind (km/h)",
    plan_event: "Evaluate event suitability",
    event_result_empty:
      "Run a historical analysis, then evaluate your event brief to see a data-backed suitability summary.",
    event_need_analysis:
      "Run historical analysis first for the selected location and date.",
    event_default_name: "Event",
    insight_rain:
      "Rainfall crossed your selected threshold in this share of valid historical observations:",
    insight_heat:
      "High heat crossed your selected threshold in this share of valid observations:",
    insight_wind:
      "Strong wind crossed your selected threshold in this share of valid observations:",
    insight_cold:
      "Cold crossed your selected threshold in this share of valid observations:",
    insight_comfort: "Outdoor comfort planning score:",
    forecast_separate: "Short-term forecast (separate from historical):",
    forecast_out_of_range:
      "Short-term forecast covers the next seven days; the selected event date is outside that range. Historical suitability above still applies.",
    compare_title: "Location Comparison",
    compare_lede:
      "Add locations after analyzing them. Every comparison uses the window and thresholds captured at analysis time.",
    add_compare: "Add current location",
    clear_compare: "Clear comparison",
    compare_added: "{name} added to the comparison.",
    compare_empty:
      "No locations added yet. Analyze a location and add it here to compare like-for-like.",
    compare_note:
      "Comparisons use the same selected month/day window and thresholds at analysis time. If analyses were run with different settings or datasets, results are not directly comparable.",

    /* Forecast */
    forecast_eyebrow: "Short-term forecast",
    forecast_heading: "What the next seven days look like.",
    forecast_lede:
      "Forecast data is deliberately separated from historical probability. Use it for the final week, not for long-term planning.",
    forecast_badge: "Forecast — not historical probability",
    forecast_load: "Load forecast",
    forecast_empty:
      "Select a location, then load the short-term forecast. It will never be mixed into historical probabilities.",
    forecast_title: "Short-Term Weather Forecast",
    forecast_note:
      "Weather forecast (short-term), not historical probability.",
    current_temp: "Current temperature",
    current_conditions: "Current conditions",
    humidity: "Humidity",
    relative_humidity: "Relative humidity",
    wind: "Wind",
    wind_speed_10m: "Wind speed",
    precipitation: "Precipitation",
    hourly_forecast: "Hourly forecast",
    daily_outlook: "Seven-day outlook",
    date: "Date",
    temp_range: "Temp min–max",
    rain_probability: "Rain probability",
    max_wind: "Max wind",
    forecast_source:
      "Source: Open-Meteo Forecast API. Short-term forecast, shown separately from historical analysis.",

    /* About */
    about_title: "About & Methodology",
    about_eyebrow: "About & methodology",
    about_heading: "Scientific honesty is part of the interface.",
    about_disclaimer:
      "Historical probabilities are computed from available observations/reanalysis for the selected location and period. They are not guarantees and not a substitute for official forecasts or warnings.",
    about_item1_title: "Historical data source:",
    about_item1_description:
      "Open-Meteo Archive API (daily temperature max/min/mean, precipitation sum, wind max). Provider/type are shown in analysis metadata; values are API-delivered historical weather/reanalysis data, not presented as direct NASA product downloads.",
    about_item2_title: "Forecast data source:",
    about_item2_description:
      "Open-Meteo Forecast API (separately labeled short-term forecast).",
    about_item3_title: "NASA resources used directly:",
    about_item3_description:
      "GIBS WMTS imagery layer (MODIS Terra Corrected Reflectance True Color) on the interactive map; plus research/discovery links to Worldview, Giovanni, GES DISC, and Earthdata Search.",
    method_1_title: "Historical observations",
    method_1_desc:
      "Open-Meteo Archive daily values: temperature max/min/mean, precipitation sum, and maximum wind speed. Probabilities use valid observations only.",
    method_2_title: "Short-term forecast",
    method_2_desc:
      "Open-Meteo Forecast API, clearly labelled and kept separate from historical probability.",
    method_3_title: "NASA resources",
    method_3_desc:
      "GIBS satellite imagery is integrated directly. Worldview, Giovanni, GES DISC, and Earthdata Search are linked as official research workflows.",
    export_eyebrow: "Export & sharing",
    export_title: "Take your analysis with you.",
    export_lede:
      "Download computed metrics and sampled observations, export the full analysis as JSON, print a clean report, or copy a shareable link.",
    export_csv: "Export CSV",
    export_json: "Export JSON",
    export_report: "Print / Save PDF report",
    share_link: "Copy share link",
    export_note:
      "Share links contain location, date, and thresholds only. No personal data is stored.",

    /* Footer */
    footer_desc:
      "Historical climate intelligence for outdoor events. Built to make weather risk legible before the date is locked in.",
    footer_ack_title: "NASA Space Apps Challenge",
    footer_ack_text:
      "An independent project exploring Earth observation data for outdoor event planning. Not an official NASA product.",
    footer_explore: "Explore",
    footer_data: "Data sources",
    footer_project: "Project",
    footer_methodology: "Methodology",
    footer_about_page: "About page",
    footer_readme: "Documentation",
    footer_start: "Start an analysis",
    footer_copyright:
      "© 2026 Weather Parade. Independent NASA Space Apps Challenge project.",
    footer_sources:
      "Data sources: Open-Meteo (forecast/archive), OpenStreetMap/Nominatim, NASA GIBS/Worldview/Giovanni/Earthdata links.",
  },

  ar: {
    /* Brand & navigation */
    app_name: "موكب الطقس",
    brand_weather: "موكب",
    brand_parade: "الطقس",
    tagline: "المطر هيبوّظ خطتك؟",
    nav_home: "الرئيسية",
    nav_historical: "تحليل الطقس عبر السنين",
    nav_nasa: "استكشف ناسا",
    nav_forecast: "توقعات الطقس",
    nav_about: "عن المشروع",
    nav_plan: "خطّط لفعاليتك",
    nav_start: "ابدأ التخطيط",
    nav_menu: "افتح القائمة",
    nav_close: "اقفل القائمة",

    /* Hero */
    hero_eyebrow: "افهم الطقس من سجلات السنين اللي فاتت",
    hero_title_html:
      "المطر <span class=\"hero__accent\">هيبوّظ</span> خطتك؟",
    hero_title: "المطر هيبوّظ خطتك؟",
    hero_sub: "شوف الطقس كان عامل إزاي في نفس الوقت ده خلال السنين اللي فاتت، وخطّط لفعاليتك الخارجية على أساس بيانات حقيقية.",
    hero_disclaimer: "بيانات رصد الأرض من ناسا + Open-Meteo",
    app_focus:
      "تركيزنا الأساسي هو احتمال تكرار ظروف الطقس حسب القراءات التاريخية؛ يعني بنشوف الظروف دي حصلت كام مرة قبل كده، مش بنقدّم توقع مؤكد للطقس بعد شهور.",
    search_location: "دوّر على مكان",
    search_placeholder: "اكتب اسم مدينة أو دولة أو مكان",
    search_btn: "حلّل المكان",
    use_map: "أو اضغط على الخريطة وحدد المكان بنفسك",
    hero_try: "جرّب مثلًا:",
    example1: "القاهرة",
    example2: "الإسكندرية",
    example3: "لندن",
    example4: "نيويورك",
    hero_cta_primary: "استكشف مخاطر الطقس",
    hero_cta_secondary: "اعرف الموقع بيشتغل إزاي",
    hero_rail_label: "بيعتمد على",
    hero_rail_scroll: "انزل واكتشف",
    earth_caption_title: "رصد كوكب الأرض",
    earth_caption_meta: "صورة ناسا Blue Marble",

    /* Difference */
    difference_eyebrow: "إيه اللي بيميز Weather Parade؟",
    difference_title_html:
      "توقعات الطقس بتقولك إيه اللي ممكن يحصل.<br />والبيانات التاريخية بتقولك إيه اللي كان بيحصل غالبًا.",
    difference_lede:
      "في سؤال تطبيقات الطقس العادية مش بتجاوب عليه بسهولة: هل المكان ده والوقت ده من السنة مناسبين فعلًا لفعالية في الهواء الطلق؟ هنا Weather Parade بيساعدك تاخد قرارك.",
    diff_forecast_title: "توقعات الطقس العادية",
    diff_forecast_desc:
      "بتديك أفضل توقع للأيام الجاية، وده مفيد للقرارات القريبة. لكن مش هتعرفك الجو غالبًا بيكون عامل إزاي لو ناوي تعمل فعالية بعد ست شهور.",
    diff_historical_title: "تحليل الطقس التاريخي",
    diff_historical_desc:
      "بنحلل قراءات الطقس القديمة المتاحة ونحسب منها الاحتمالات. هتعرف الحرارة أو المطر أو الرياح أو البرد عدّوا الحدود اللي اخترتها كام مرة في المكان والموسم ده.",
    diff_planning_title: "التخطيط للفعاليات من بدري",
    diff_planning_desc:
      "قارن بين أكتر من مكان، وشوف الراحة مقابل مخاطر الطقس، واختار ميعادك وأنت شايف الأرقام بدل ما تعتمد على التخمين.",
    diff_horizon: "الفترة",
    diff_output: "النتيجة",
    diff_use: "مناسب لـ",
    diff_forecast_horizon: "من 0 لـ 14 يوم",
    diff_forecast_output: "توقع واحد للطقس",
    diff_forecast_use: "قرارات الأيام الجاية",
    diff_historical_horizon: "آخر سنتين لحد 30 سنة",
    diff_historical_output: "احتمالات من بيانات فعلية",
    diff_historical_use: "اختيار الموسم والمكان",
    diff_planning_horizon: "من أسابيع لشهور",
    diff_planning_output: "معلومات تساعدك تختار المكان والميعاد",
    diff_planning_use: "الفعاليات والأماكن المفتوحة",
    difference_callout_text:
      "Weather Parade بيفصل بين التوقعات القريبة والتحليل التاريخي وتخطيط الفعاليات، عشان ما نخلطش توقع السبعة أيام باحتمالات مبنية على سنين فاتت.",
    difference_callout_link: "افتح مساحة التحليل",

    /* Risks */
    risks_eyebrow: "مخاطر الطقس",
    risks_title: "خمس حالات جوية ممكن تفرق مع خطتك.",
    risks_lede:
      "بنحسب كل خطر من قراءات الطقس الفعلية للمكان والشهر وعدد الأيام اللي اخترتهم. تقدر تشوف حدود الحساب وتعدّلها. الأرقام هنا مش بيانات تجريبية.",
    risk_hot_title: "حر شديد",
    risk_hot_desc:
      "الأيام اللي درجة حرارتها العظمى عدّت الحد اللي اخترته للحر.",
    risk_cold_title: "برد شديد",
    risk_cold_desc:
      "الأيام اللي درجة حرارتها الصغرى نزلت أقل من الحد اللي اخترته للبرد.",
    risk_windy_title: "رياح قوية",
    risk_windy_desc:
      "الأيام اللي سرعة الرياح فيها وصلت للحد اللي حددته أو عدّته.",
    risk_wet_title: "أمطار غزيرة",
    risk_wet_desc:
      "الأيام اللي كمية المطر فيها وصلت للحد اللي اخترته أو زادت عنه.",
    risk_uncomfortable_title: "جو غير مريح",
    risk_uncomfortable_desc:
      "تقييم بيجمع تأثير كل مخاطر الطقس اللي بنقيسها على راحتك في الفعالية، مش عنصر طقس واحد لوحده.",
    risk_aside_eyebrow: "تفهم الأرقام إزاي؟",
    risk_aside_title: "الاحتمالات محسوبة من قراءات فعلية، مش تخمين.",
    risk_aside_text:
      "لما نقول إن احتمال المطر 24%، ده معناه إن المطر عدّى الحد اللي اخترته في 24 مرة من كل 100 قراءة تاريخية صالحة للفترة دي. النسبة دي بتساعدك تخطط، لكنها مش ضمان للي هيحصل في يوم جاي.",
    risk_aside_point1: "عدد القراءات اللي اعتمدنا عليها بيظهر دايمًا.",
    risk_aside_point2: "حدود الحساب واضحة وتقدر تعدّلها.",
    risk_aside_point3: "لو البيانات قليلة، بنوضح ده ومبنكمّلهاش من عندنا.",
    risk_aside_point4: "توقعات الأيام الجاية موجودة في قسم لوحدها.",
    risk_aside_link: "ابدأ تحليلك",
    risks_footnote:
      "النسب بتظهر بعد ما تشغّل التحليل التاريخي. ومؤشر الراحة ده تقييم مساعد للتخطيط مبني على قواعد موضحة، مش مقياس أرصاد رسمي.",

    /* Workspace */
    workspace_eyebrow: "مساحة التحليل",
    workspace_title: "اعرف طبيعة الجو في ميعاد فعاليتك.",
    workspace_lede:
      "اختار المكان والشهر ومدة الأيام اللي عايز تقارنها. Weather Parade هيقارنهم بآخر عشر سنين من قراءات الطقس المتاحة.",
    workspace_status_idle: "لسه مختارتش مكان",
    workspace_status_loading: "بنحدّث التحليل…",
    workspace_status_selected: "تم اختيار المكان",
    location: "المكان",
    coordinates: "الإحداثيات",
    selected_date: "التاريخ المختار",
    period: "الفترة التاريخية",
    historical_status: "التحليل التاريخي",
    forecast_status: "توقعات الطقس",
    map_click_hint: "اضغط على الخريطة عشان تختار الإحداثيات",
    analysis_params_title: "إعدادات التحليل",
    analysis_params_lede: "اختار الفترة وحدود الطقس اللي تهمك في فعاليتك.",
    month: "الشهر",
    day: "يوم من الشهر",
    years: "عدد السنين اللي هنراجعها",
    temp_threshold: "حد الحرارة العالية (°م)",
    cold_threshold: "حد البرودة (°م)",
    rain_threshold: "حد كمية المطر (مم)",
    wind_threshold: "حد سرعة الرياح (كم/س)",
    run_analysis: "ابدأ التحليل التاريخي",
    method_summary: "طريقة الحساب ومصدر البيانات",
    coverage: "مدى توفر البيانات",
    source: "المصدر",
    samples: "عدد القراءات",
    threshold: "الحد المحدد",
    method:
      "الحساب بيعتمد على قراءات الطقس التاريخية الصالحة للشهر والأيام اللي اخترتهم.",
    score_note:
      "ده مؤشر بيساعدك تخطط بناءً على حدود واضحة، لكنه مش مقياس أرصاد رسمي.",
    map_layer: "نوع الخريطة",
    layer_osm: "خريطة OpenStreetMap",
    layer_nasa: "صور أقمار ناسا (MODIS True Color)",
    nasa_date: "تاريخ الصورة",
    forecast_disclaimer:
      "حقوق خرائط الأساس محفوظة لمساهمي OpenStreetMap. طبقة ناسا بتستخدم صور GIBS MODIS Terra Corrected Reflectance (True Color) لتاريخ الصورة المختار، لو الصور متاحة. توفر الصور بيختلف حسب التاريخ ومستوى التكبير، وهي صور أقمار صناعية مش حالة الطقس الحالية.",
    loading: "جاري التحميل…",
    ready: "جاهز",
    insufficient: "البيانات مش كفاية",
    insufficient_data: "البيانات مش كفاية",
    awaiting_analysis: "مستنيين التحليل",
    no_data_period:
      "مفيش بيانات تاريخية كفاية للمكان أو الفترة دي. جرّب تاريخ تاني، أو فترة أطول، أو اختار مكان مختلف.",
    low: "منخفض",
    moderate: "متوسط",
    high: "مرتفع",
    very_high: "مرتفع جدًا",
    concern_low: "مخاطر قليلة",
    concern_moderate: "مخاطر متوسطة",
    concern_high: "مخاطر عالية",
    detail_metric: "المؤشر",
    detail_value: "القيمة",
    detail_avg_temp: "متوسط الحرارة في الفترة المختارة",
    detail_max_temp: "أعلى درجة حرارة اتسجلت",
    detail_min_temp: "أقل درجة حرارة اتسجلت",
    detail_avg_precip: "متوسط كمية المطر في اليوم",
    detail_avg_wind: "متوسط أعلى سرعة للرياح",
    analysis_complete:
      "التحليل التاريخي خلص: استخدمنا {count} قراءة صالحة من {dataset}.",
    error_select_location:
      "اختار مكان الأول: دوّر على مدينة أو اضغط على الخريطة.",
    error_network: "في مشكلة في الاتصال بالإنترنت. راجع اتصالك وجرب تاني.",
    error_rate:
      "بعت طلبات كتير لخدمة تحديد الأماكن. استنى شوية وجرب تاني.",
    run_analysis_first:
      "حلّل المكان الحالي الأول قبل ما تضيفه للمقارنة.",
    run_analysis_first_csv: "شغّل التحليل التاريخي الأول قبل ما تصدّر ملف CSV.",
    copied: "تم نسخ رابط المشاركة.",
    export_ready: "الملف جاهز للتصدير.",

    /* Overview */
    overview_eyebrow: "ملخص المخاطر",
    overview_title: "شوف طقس ميعادك من واقع سنين فاتت.",
    overview_lede:
      "بعد ما تشغّل التحليل، هتلاقي هنا ملخص الحرارة والمطر والرياح ومدى مناسبة الجو للأنشطة الخارجية، باستخدام نفس مجموعة القراءات.",
    comfort: "مدى مناسبة الجو للفعالية",
    comfort_note:
      "ده تقييم مساعد للتخطيط مبني على طريقة حساب موضحة، مش مقياس أرصاد رسمي.",
    summary_avg_temp: "متوسط درجة الحرارة",
    summary_avg_rain: "متوسط كمية المطر في اليوم",
    summary_avg_wind: "متوسط أعلى سرعة رياح",
    summary_samples: "عدد القراءات الصالحة",
    chart_temp_title: "درجات الحرارة",
    chart_temp_desc: "متوسط وأعلى وأقل درجة حرارة كل يوم.",
    chart_rain_title: "سجل الأمطار",
    chart_rain_desc: "إجمالي المطر كل يوم خلال الفترة اللي اخترتها.",
    chart_risk_title: "توزيع المخاطر",
    chart_risk_desc: "عدد المرات اللي الطقس فيها عدّى كل حد حددته.",
    chart_season_title: "مناسبة الجو حسب الموسم",
    chart_season_desc: "مؤشر شهري يساعدك تقارن شهور السنة.",
    chart_empty: "شغّل التحليل الأول عشان نعرض القراءات في الرسم البياني.",

    /* NASA */
    nasa_title: "استكشف ناسا",
    nasa_eyebrow: "استكشف ناسا",
    nasa_heading: "الأرض من منظور الأقمار الصناعية.",
    nasa_lede:
      "استكشف مصادر حقيقية من ناسا لرصد الأرض حسب المكان والتاريخ اللي اخترتهم. صور الأقمار الصناعية بتعرض مشاهدات للأرض، لكنها مش خريطة للطقس الحالي.",
    nasa_preview_placeholder:
      "اختار مكان عشان تشوف صور الأقمار الصناعية من ناسا.",
    nasa_preview_label: "معاينة صور الأقمار الصناعية",
    nasa_preview_none: "اختار مكان",
    nasa_preview_caption:
      "توفر الصور بيختلف حسب التاريخ ومستوى التكبير، ومش بتعرض حالة الطقس لحظيًا.",
    nasa_datasets_title: "مصادر بيانات تقدر تستكشفها",
    dataset_modis_desc: "صور يومية لسطح الأرض",
    dataset_imerg_desc: "تقديرات عالمية لكمية الأمطار",
    dataset_merra_desc: "سجلات تحليل حالة الغلاف الجوي",
    nasa_links_note:
      "الروابط بتستخدم إحداثيات المكان وتاريخ الصورة اللي اخترتهم، في الخدمات اللي بتدعم ده.",
    nasa_links_no_location:
      "اختار مكان الأول عشان نجهزلك روابط بحث من ناسا مرتبطة بالموقع.",
    nasa_disclosure:
      "صور GIBS متوصلة بالموقع وبتظهر جوه المتصفح فعلًا. بعض خدمات ناسا التانية ممكن تحتاج تسجيل دخول بحساب Earthdata أو معالجة من السيرفر عشان تنزّل البيانات مباشرة؛ الروابط هنا بتفتحلك صفحات الخدمات الرسمية.",
    explorer_disclaimer:
      "التكاملات المتاحة فعلًا في الموقع: عرض صور الأقمار الصناعية من NASA GIBS على الخريطة، وروابط بحث مرتبطة بالمكان والتاريخ لخدمات NASA Worldview وGiovanni وGES DISC وEarthdata Search. تنزيل مجموعات البيانات أو استخدامها مباشرة من خلال API بيختلف حسب الخدمة، وممكن يحتاج تسجيل دخول NASA Earthdata أو معالجة من السيرفر. بنوضح ده عشان ما نديكش انطباع إن كل الخدمات متوصلة بالكامل.",
    nasa_note:
      "صور NASA GIBS بتعرض صور أقمار صناعية لتاريخ وطبقة محددين، مش حالة الطقس الحالية.",

    /* Planning */
    planning_eyebrow: "تخطيط الفعاليات",
    planning_title: "خطّط وأنت عارف احتمالات الطقس.",
    planning_lede:
      "حوّل نتيجة التحليل لقرار عملي. حدّد الظروف اللي فعاليتك تقدر تستحملها، وراجع بيانات السنين اللي فاتت قبل ما تثبّت الميعاد.",
    workflow_step1_title: "اختار المكان",
    workflow_step1_desc: "دوّر على مدينة أو اضغط على الخريطة عشان تحدد المكان.",
    workflow_step2_title: "اختار التاريخ أو الموسم",
    workflow_step2_desc:
      "حدد الشهر واليوم، وقارنهم بنفس الفترة في السنين اللي فاتت.",
    workflow_step3_title: "راجع مخاطر الطقس",
    workflow_step3_desc:
      "شوف احتمالات المطر والحر والبرد والرياح، ومؤشر مناسبة الجو.",
    workflow_step4_title: "قارن وخد قرارك",
    workflow_step4_desc:
      "ضيف أماكن بديلة، وقارن بينها في نفس الفترة، واختار بناءً على البيانات.",
    event_title: "خطّط لفعاليتك",
    event_brief_title: "تفاصيل الفعالية",
    event_brief_lede: "قول لـ Weather Parade إيه ظروف الجو اللي فعاليتك تقدر تستحملها.",
    event_badge: "بيانات تاريخية + توقعات",
    event_name: "اسم الفعالية",
    event_date: "ميعاد الفعالية",
    duration: "مدة الفعالية (بالساعات)",
    preferred_temp_min: "أقل درجة حرارة مناسبة ليك (°م)",
    preferred_temp_max: "أعلى درجة حرارة مناسبة ليك (°م)",
    max_rain: "أقصى كمية مطر تقدر تقبلها (مم)",
    max_wind: "أقصى سرعة رياح تقدر تقبلها (كم/س)",
    plan_event: "قيّم مناسبة الجو للفعالية",
    event_result_empty:
      "شغّل التحليل التاريخي، وبعدها قيّم تفاصيل فعاليتك عشان تشوف ملخص يوضح مدى مناسبة الجو بناءً على البيانات.",
    event_need_analysis:
      "شغّل التحليل التاريخي الأول للمكان والتاريخ اللي اخترتهم.",
    event_default_name: "فعالية",
    insight_rain:
      "المطر عدّى الحد اللي اخترته في النسبة دي من القراءات التاريخية الصالحة:",
    insight_heat:
      "الحرارة العالية عدّت الحد اللي اخترته في النسبة دي من القراءات الصالحة:",
    insight_wind:
      "الرياح القوية عدّت الحد اللي اخترته في النسبة دي من القراءات الصالحة:",
    insight_cold:
      "البرودة عدّت الحد اللي اخترته في النسبة دي من القراءات الصالحة:",
    insight_comfort: "تقييم مدى مناسبة الجو للأنشطة الخارجية:",
    forecast_separate: "توقعات الأيام الجاية (منفصلة عن التحليل التاريخي):",
    forecast_out_of_range:
      "توقعات الطقس بتغطي السبعة أيام الجايين بس، وميعاد الفعالية اللي اخترته خارج الفترة دي. نتيجة الملاءمة التاريخية اللي فوق لسه مفيدة للتخطيط.",
    compare_title: "قارن بين الأماكن",
    compare_lede:
      "حلّل كل مكان الأول، وبعدها ضيفه للمقارنة. كل نتيجة بتستخدم الفترة وحدود الطقس اللي كانت محددة وقت التحليل.",
    add_compare: "ضيف المكان الحالي",
    clear_compare: "امسح المقارنة",
    compare_added: "اتضاف {name} للمقارنة.",
    compare_empty:
      "لسه مفيش أماكن في المقارنة. حلّل مكان وضيفه هنا عشان تقارنه بأماكن تانية في نفس الظروف.",
    compare_note:
      "المقارنة بتعتمد على نفس الشهر وفترة الأيام وحدود الطقس اللي اتسجلت وقت التحليل. لو حللت الأماكن بإعدادات أو مصادر بيانات مختلفة، النتائج مش هتكون قابلة للمقارنة بشكل مباشر.",

    /* Forecast */
    forecast_eyebrow: "توقعات الأيام الجاية",
    forecast_heading: "الطقس المتوقع خلال السبعة أيام الجايين.",
    forecast_lede:
      "فصلنا التوقعات عن الاحتمالات التاريخية عشان كل واحدة تبقى واضحة. استخدم التوقعات للأسبوع القريب، والتحليل التاريخي للتخطيط من بدري.",
    forecast_badge: "توقعات الطقس — مش احتمالات تاريخية",
    forecast_load: "اعرض التوقعات",
    forecast_empty:
      "اختار مكان، وبعدها حمّل توقعات الطقس للأيام الجاية. التوقعات دي هتفضل منفصلة عن نتائج التحليل التاريخي.",
    forecast_title: "توقعات الطقس قصيرة المدى",
    forecast_note: "دي توقعات للطقس في الأيام الجاية، مش احتمالات محسوبة من بيانات تاريخية.",
    current_temp: "درجة الحرارة دلوقتي",
    current_conditions: "حالة الطقس دلوقتي",
    humidity: "الرطوبة",
    relative_humidity: "الرطوبة النسبية",
    wind: "الرياح",
    wind_speed_10m: "سرعة الرياح",
    precipitation: "كمية الأمطار",
    hourly_forecast: "توقعات كل ساعة",
    daily_outlook: "توقعات السبعة أيام",
    date: "التاريخ",
    temp_range: "أقل وأعلى درجة حرارة",
    rain_probability: "احتمال سقوط المطر",
    max_wind: "أعلى سرعة رياح (كم/س)",
    forecast_source:
      "المصدر: Open-Meteo Forecast API. دي توقعات قصيرة المدى، وبنعرضها بشكل منفصل عن التحليل التاريخي.",

    /* About */
    about_title: "عن المشروع وطريقة الحساب",
    about_eyebrow: "عن المشروع وطريقة الحساب",
    about_heading: "الدقة والوضوح أساس شغلنا.",
    about_disclaimer:
      "الاحتمالات التاريخية بنحسبها من القراءات وبيانات إعادة التحليل المتاحة للمكان والفترة اللي اخترتهم. النتائج مش ضمان للي هيحصل، ومش بديل عن توقعات الطقس أو التحذيرات الرسمية.",
    about_item1_title: "مصدر البيانات التاريخية:",
    about_item1_description:
      "Open-Meteo Archive API. بيوفر بيانات يومية زي أعلى وأقل ومتوسط درجة حرارة، وإجمالي المطر، وأعلى سرعة رياح. بنوضح مصدر ونوع البيانات في تفاصيل التحليل. دي بيانات تاريخية للطقس أو بيانات إعادة تحليل بيوصلها Open-Meteo، ومش بنعرضها على إنها تنزيل مباشر لمنتجات ناسا.",
    about_item2_title: "مصدر توقعات الطقس:",
    about_item2_description:
      "Open-Meteo Forecast API، ودي بنعرضها بشكل منفصل وواضح على إنها توقعات للأيام القريبة.",
    about_item3_title: "مصادر ناسا المستخدمة مباشرة:",
    about_item3_description:
      "طبقة صور GIBS WMTS (MODIS Terra - Corrected Reflectance True Color) على الخريطة التفاعلية، بالإضافة لروابط البحث والاستكشاف لخدمات Worldview وGiovanni وGES DISC وEarthdata Search.",
    method_1_title: "بيانات الطقس التاريخية",
    method_1_desc:
      "بنستخدم القيم اليومية من Open-Meteo Archive: أعلى وأقل ومتوسط حرارة، وإجمالي المطر، وأعلى سرعة رياح. حساب الاحتمالات بيعتمد على القراءات الصالحة بس.",
    method_2_title: "توقعات الطقس القريبة",
    method_2_desc:
      "بنستخدم Open-Meteo Forecast API، وبنوضح إنها توقعات للأيام الجاية ومنفصلة تمامًا عن الاحتمالات التاريخية.",
    method_3_title: "مصادر ناسا",
    method_3_desc:
      "صور GIBS متوصلة بالموقع مباشرة. أما Worldview وGiovanni وGES DISC وEarthdata Search فبنوفّر روابط ليها عشان تفتح خدمات البحث الرسمية.",
    export_eyebrow: "تنزيل ومشاركة النتائج",
    export_title: "خد نتيجة تحليلك معاك.",
    export_lede:
      "نزّل المؤشرات والقراءات اللي اتحسبت في ملف CSV، أو صدّر التحليل كامل بصيغة JSON، أو اطبع تقرير واحفظه PDF، أو انسخ رابط تقدر تشاركه.",
    export_csv: "نزّل CSV",
    export_json: "نزّل JSON",
    export_report: "اطبع / احفظ التقرير PDF",
    share_link: "انسخ رابط المشاركة",
    export_note:
      "رابط المشاركة بيحتوي على المكان والتاريخ وحدود الحساب بس. مش بنخزّن أي بيانات شخصية.",

    /* Footer */
    footer_desc:
      "تحليل تاريخي للطقس يساعدك تخطط للفعاليات الخارجية وتفهم المخاطر قبل ما تثبّت الميعاد.",
    footer_ack_title: "NASA Space Apps Challenge",
    footer_ack_text:
      "مشروع مستقل بيستكشف بيانات رصد الأرض عشان يساعد في تخطيط الفعاليات الخارجية. المشروع مش منتج رسمي تابع لناسا.",
    footer_explore: "استكشف",
    footer_data: "مصادر البيانات",
    footer_project: "المشروع",
    footer_methodology: "طريقة الحساب",
    footer_about_page: "عن المشروع",
    footer_readme: "دليل الاستخدام",
    footer_start: "ابدأ تحليل جديد",
    footer_copyright:
      "© 2026 Weather Parade. مشروع مستقل مشارك في NASA Space Apps Challenge.",
    footer_sources:
      "مصادر البيانات: Open-Meteo (التوقعات والأرشيف التاريخي)، وOpenStreetMap/Nominatim، وروابط NASA GIBS/Worldview/Giovanni/Earthdata.",
  },
};

let lang = localStorage.getItem("wp_lang") || "en";

export function t(key) {
  return (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;
}

export function getLang() {
  return lang;
}

export function setLang(next) {
  lang = next === "ar" ? "ar" : "en";
  localStorage.setItem("wp_lang", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  applyTranslations();
}

export function applyTranslations(root = document) {
  $$("[data-i18n]", root).forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });
  $$("[data-i18n-html]", root).forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (key) el.innerHTML = t(key);
  });
  $$("[data-i18n-placeholder]", root).forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) el.setAttribute("placeholder", t(key));
  });
  $$("[data-i18n-aria]", root).forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (key) el.setAttribute("aria-label", t(key));
  });
}

export function initI18n() {
  setLang(lang);
}
