(function (global) {
  "use strict";

  // Persistence layer (AZR-194): FIELDS manifest, fresh state, serialize, load sanitisers and save migrations.
  // Every function takes the state object as an argument; nothing here touches the DOM or localStorage.
  var N = global.SoulgatherNum;
  var C = global.SoulgatherConfig;
  var E = global.SoulgatherEconomy;

  var ASHEN_TIDE_MAX = C.ASHEN_TIDE_MAX;
  var BINDING_TOLL_MAX = C.BINDING_TOLL_MAX;
  var BONUS_TO_GIFT = C.BONUS_TO_GIFT;
  var CHALICE_MAX = C.CHALICE_MAX;
  var CHOIR_MAX = C.CHOIR_MAX;
  var DEEPER_TOLL_MAX = C.DEEPER_TOLL_MAX;
  var HOLLOW_MAX = C.HOLLOW_MAX;
  var LONGER_HYMN_MAX = C.LONGER_HYMN_MAX;
  var LONGER_KNELL_MAX = C.LONGER_KNELL_MAX;
  var LONGER_PROCESSION_MAX = C.LONGER_PROCESSION_MAX;
  var LONGER_TITHE_MAX = C.LONGER_TITHE_MAX;
  var LONGER_VEIL_MAX = C.LONGER_VEIL_MAX;
  var LONGER_WAKE_MAX = C.LONGER_WAKE_MAX;
  var OSSUARY_MAX = C.OSSUARY_MAX;
  var UNLOCK_BEACONS = C.UNLOCK_BEACONS;
  var UNLOCK_CHALICES = C.UNLOCK_CHALICES;
  var UNLOCK_HEARTHS = C.UNLOCK_HEARTHS;
  var UNLOCK_OBELISKS = C.UNLOCK_OBELISKS;
  var UNLOCK_SPIRES = C.UNLOCK_SPIRES;
  var UNLOCK_TOLL_CLICKS = C.UNLOCK_TOLL_CLICKS;
  var UNLOCK_URNS = C.UNLOCK_URNS;
  var UNLOCK_VEIL_CLICKS = C.UNLOCK_VEIL_CLICKS;
  var UNLOCK_WAKE_ASH = C.UNLOCK_WAKE_ASH;
  var PEAK_STATS = C.PEAK_STATS;
  var CHRONICLE_ORDER = C.CHRONICLE_ORDER;
  var CHRONICLE_LINES = C.CHRONICLE_LINES;
  var normalizeBuyMode = C.normalizeBuyMode;
  var normalizeAspect = C.normalizeAspect;
  var normalizeVow = C.normalizeVow;
  var emptyVowsKnown = C.emptyVowsKnown;
  var normalizeVowsKnown = C.normalizeVowsKnown;
  var embersStartsPyres = E.embersStartsPyres;
  var urnEdictStartsUrns = E.urnEdictStartsUrns;
  var hearthEdictStartsHearths = E.hearthEdictStartsHearths;
  var beaconEdictStartsBeacons = E.beaconEdictStartsBeacons;
  var spireEdictStartsSpires = E.spireEdictStartsSpires;
  var obeliskEdictStartsObelisks = E.obeliskEdictStartsObelisks;
  var cupStartsChalices = E.cupStartsChalices;

  function hasChronicle(s, id) {
    if (!s.chronicle) return false;
    var i;
    for (i = 0; i < s.chronicle.length; i++) {
      if (s.chronicle[i].id === id) return true;
    }
    return false;
  }

  function normalizeChronicle(raw) {
    var out = [];
    var seen = {};
    function push(id, at) {
      if (CHRONICLE_LINES[id] == null || seen[id]) return;
      seen[id] = true;
      var n = Number(at);
      if (!isFinite(n) || n < 0) n = 0;
      out.push({ id: id, at: n });
    }
    if (Array.isArray(raw)) {
      var i;
      for (i = 0; i < raw.length; i++) {
        var row = raw[i];
        if (!row || typeof row !== "object") continue;
        push(row.id, row.at);
      }
      return out;
    }
    if (raw && typeof raw === "object") {
      var j;
      for (j = 0; j < CHRONICLE_ORDER.length; j++) {
        var id = CHRONICLE_ORDER[j];
        if (raw[id]) push(id, 0);
      }
    }
    return out;
  }

  function seedVowsKnown(raw, s) {
    var known = normalizeVowsKnown(raw);
    if (hasChronicle(s, "vowStillness")) known.stillness = true;
    if (hasChronicle(s, "vowPoverty")) known.poverty = true;
    if (hasChronicle(s, "vowHunger")) known.hunger = true;
    if (hasChronicle(s, "vowEmber") || hasChronicle(s, "giftFirstEmberVow")) known.ember = true;
    var v = normalizeVow(s.vow);
    if (v) known[v] = true;
    return known;
  }

  // ─── FIELDS: declarative persistence policy (AZR-178) ──────────────────────────
  // kind:  num    = N big-number      count = non-negative integer
  //        flag   = boolean           str   = string (normalizer optional)
  //        list   = array             time  = Date.now() timestamp
  //        obj    = plain object
  // scope: run    = wiped on Tribute/Reset
  //        account = survives Tribute, wiped on Reset
  // max:   optional cap for count fields
  // dflt:  override default (function → called each time, else literal)
  // save:  optional serialize normalizer   load: optional load normalizer
  var FIELDS = {
    // ── Resources (num, run) ──
    souls:            { kind: "num",   scope: "run" },
    lifetimeSouls:    { kind: "num",   scope: "run" },
    lifetimeShades:   { kind: "num",   scope: "run" },
    lifetimeSpirits:  { kind: "num",   scope: "run" },
    shades:           { kind: "num",   scope: "run" },
    spirits:          { kind: "num",   scope: "run" },
    vessels:          { kind: "num",   scope: "run" },
    thrones:          { kind: "count", scope: "run" },
    chalices:         { kind: "count", scope: "run", max: CHALICE_MAX },
    wellDepth:        { kind: "count", scope: "run" },
    lanterns:         { kind: "num",   scope: "run" },
    ash:              { kind: "num",   scope: "run" },
    censers:          { kind: "num",   scope: "run" },
    pyres:            { kind: "num",   scope: "run" },
    urns:             { kind: "num",   scope: "run" },
    hearths:          { kind: "num",   scope: "run" },
    beacons:          { kind: "num",   scope: "run" },
    spires:           { kind: "num",   scope: "run" },
    obelisks:         { kind: "num",   scope: "run" },
    fetters:          { kind: "num",   scope: "run" },
    // ── Upgrade levels (count, run) ──
    emberLevel:       { kind: "count", scope: "run" },
    chainLevel:       { kind: "count", scope: "run" },
    hollowLevel:      { kind: "count", scope: "run" },
    // ── Unlock flags (flag, run) ──
    unlockedSpirits:          { kind: "flag", scope: "run" },
    unlockedVessels:          { kind: "flag", scope: "run" },
    unlockedWell:             { kind: "flag", scope: "run" },
    unlockedThrones:          { kind: "flag", scope: "run" },
    unlockedChalices:         { kind: "flag", scope: "run" },
    unlockedLanterns:         { kind: "flag", scope: "run" },
    unlockedMarks:            { kind: "flag", scope: "run" },
    unlockedCensers:          { kind: "flag", scope: "run" },
    unlockedPyres:            { kind: "flag", scope: "run" },
    unlockedUrns:             { kind: "flag", scope: "run" },
    unlockedHearths:          { kind: "flag", scope: "run" },
    unlockedBeacons:          { kind: "flag", scope: "run" },
    unlockedSpires:           { kind: "flag", scope: "run" },
    unlockedObelisks:         { kind: "flag", scope: "run" },
    unlockedFetters:          { kind: "flag", scope: "run" },
    unlockedAutobind:         { kind: "flag", scope: "run" },
    unlockedAutobindSpirits:  { kind: "flag", scope: "run" },
    unlockedAutobindVessels:  { kind: "flag", scope: "run" },
    unlockedAutobindLanterns: { kind: "flag", scope: "run" },
    unlockedAutobindFetters:  { kind: "flag", scope: "run" },
    unlockedAutobindCensers:  { kind: "flag", scope: "run" },
    unlockedAutobindThrones:  { kind: "flag", scope: "run" },
    unlockedAutobindPyres:    { kind: "flag", scope: "run" },
    unlockedAutobindChalices: { kind: "flag", scope: "run" },
    unlockedAutobindUrns:     { kind: "flag", scope: "run" },
    unlockedAutobindHearths:  { kind: "flag", scope: "run" },
    unlockedAutobindBeacons:  { kind: "flag", scope: "run" },
    unlockedAutobindSpires:   { kind: "flag", scope: "run" },
    unlockedAutobindObelisks: { kind: "flag", scope: "run" },
    unlockedNightTithe:       { kind: "flag", scope: "run" },
    unlockedVeil:             { kind: "flag", scope: "run" },
    unlockedWake:             { kind: "flag", scope: "run" },
    unlockedToll:             { kind: "flag", scope: "run" },
    // ── Toast flags (flag, run) ──
    toastShown:          { kind: "flag", scope: "run" },
    vesselToastShown:    { kind: "flag", scope: "run" },
    throneToastShown:    { kind: "flag", scope: "run" },
    lanternToastShown:   { kind: "flag", scope: "run" },
    censerToastShown:    { kind: "flag", scope: "run" },
    // ── Reliquary (account) ──
    favor:            { kind: "count", scope: "account" },
    favorEarned:      { kind: "count", scope: "account" },
    edictLevel:       { kind: "count", scope: "account" },
    memoryLevel:      { kind: "count", scope: "account" },
    echoLevel:        { kind: "count", scope: "account", max: 1 },
    seatLevel:        { kind: "count", scope: "account" },
    kindleLevel:      { kind: "count", scope: "account" },
    ashenLevel:       { kind: "count", scope: "account" },
    depthLevel:       { kind: "count", scope: "account" },
    // ── UI prefs (account) ──
    buyMode:              { kind: "str",  scope: "account", dflt: "1", load: normalizeBuyMode },
    buyModeHintDismissed: { kind: "flag", scope: "account" },
    // ── Rite levels (count, run) ──
    siphonLevel:      { kind: "count", scope: "run" },
    levyLevel:        { kind: "count", scope: "run" },
    cinderLevel:      { kind: "count", scope: "run" },
    urnRiteLevel:     { kind: "count", scope: "run" },
    hearthRiteLevel:  { kind: "count", scope: "run" },
    beaconRiteLevel:  { kind: "count", scope: "run" },
    spireRiteLevel:   { kind: "count", scope: "run" },
    bindingTollLevel: { kind: "count", scope: "run", max: BINDING_TOLL_MAX },
    unlockedBindingToll: { kind: "flag", scope: "run" },
    // ── Hollow (run) ──
    hollowStacks:  { kind: "count", scope: "run", max: HOLLOW_MAX },
    hollowIdle:    { kind: "count", scope: "run" },
    hollowWarned:  { kind: "flag",  scope: "run" },
    // ── Well draws (run) ──
    wellDraws:         { kind: "flag", scope: "run" },
    unlockedWellDraws: { kind: "flag", scope: "run" },
    // ── Aspect / vow (str, run) ──
    aspect: { kind: "str", scope: "run", save: normalizeAspect, load: normalizeAspect },
    // ── Timestamps (time) ──
    lastTick:      { kind: "time", scope: "run" },
    simulatedUntil:{ kind: "time", scope: "run" },
    // ── Chronicle (list, account) ──
    chronicle: { kind: "list", scope: "account", load: normalizeChronicle },
    // ── Timers (count, run) ──
    titheLeft:      { kind: "count", scope: "run" },
    nightLeft:      { kind: "count", scope: "run" },
    tithePaid:      { kind: "flag",  scope: "run" },
    autobind:           { kind: "flag", scope: "run" },
    autobindSpirits:    { kind: "flag", scope: "run" },
    autobindVessels:    { kind: "flag", scope: "run" },
    autobindLanterns:   { kind: "flag", scope: "run" },
    autobindFetters:    { kind: "flag", scope: "run" },
    autobindCensers:    { kind: "flag", scope: "run" },
    autobindThrones:    { kind: "flag", scope: "run" },
    autobindPyres:      { kind: "flag", scope: "run" },
    autobindChalices:   { kind: "flag", scope: "run" },
    autobindUrns:       { kind: "flag", scope: "run" },
    autobindHearths:    { kind: "flag", scope: "run" },
    autobindBeacons:    { kind: "flag", scope: "run" },
    autobindSpires:     { kind: "flag", scope: "run" },
    autobindObelisks:   { kind: "flag", scope: "run" },
    clicksThisRun:  { kind: "count", scope: "run" },
    veilLeft:       { kind: "count", scope: "run" },
    tollLeft:       { kind: "count", scope: "run" },
    wakeLeft:       { kind: "count", scope: "run" },
    processionLeft: { kind: "count", scope: "run" },
    knellLeft:      { kind: "count", scope: "run" },
    // ── Peaks (num, account) ──
    peakShades:    { kind: "num", scope: "account" },
    peakLanterns:  { kind: "num", scope: "account" },
    peakFetters:   { kind: "num", scope: "account" },
    peakCensers:   { kind: "num", scope: "account" },
    peakPyres:     { kind: "num", scope: "account" },
    peakUrns:      { kind: "num", scope: "account" },
    peakHearths:   { kind: "num", scope: "account" },
    peakBeacons:   { kind: "num", scope: "account" },
    peakSpires:    { kind: "num", scope: "account" },
    peakObelisks:  { kind: "num", scope: "account" },
    // ── Gift flags — renamed from bonus* (flag, account) ──
    giftLifetimeSouls:   { kind: "flag", scope: "account" },
    giftPeakShades:      { kind: "flag", scope: "account" },
    giftFirstVessel:     { kind: "flag", scope: "account" },
    giftFirstTribute:    { kind: "flag", scope: "account" },
    giftThousandSouls:   { kind: "flag", scope: "account" },
    giftFirstLantern:    { kind: "flag", scope: "account" },
    giftFirstCenser:     { kind: "flag", scope: "account" },
    giftFirstFetter:     { kind: "flag", scope: "account" },
    giftTenThousandSouls:{ kind: "flag", scope: "account" },
    giftFirstThrone:     { kind: "flag", scope: "account" },
    // ── Gift flags (flag, account) ──
    giftCrown:              { kind: "flag", scope: "account" },
    giftFirstName:          { kind: "flag", scope: "account" },
    giftFiveTributes:       { kind: "flag", scope: "account" },
    giftNamesComplete:      { kind: "flag", scope: "account" },
    giftFirstVeil:          { kind: "flag", scope: "account" },
    giftFirstWake:          { kind: "flag", scope: "account" },
    giftPeakLanterns:       { kind: "flag", scope: "account" },
    giftPeakFetters:        { kind: "flag", scope: "account" },
    giftPeakCensers:        { kind: "flag", scope: "account" },
    giftFirstPyre:          { kind: "flag", scope: "account" },
    giftFirstUrn:           { kind: "flag", scope: "account" },
    giftFirstHearth:        { kind: "flag", scope: "account" },
    giftFirstBeacon:        { kind: "flag", scope: "account" },
    giftFirstSpire:         { kind: "flag", scope: "account" },
    giftFirstObelisk:       { kind: "flag", scope: "account" },
    giftEightTributes:      { kind: "flag", scope: "account" },
    giftPeakPyres:          { kind: "flag", scope: "account" },
    giftPeakUrns:           { kind: "flag", scope: "account" },
    giftPeakHearths:        { kind: "flag", scope: "account" },
    giftPeakBeacons:        { kind: "flag", scope: "account" },
    giftPeakSpires:         { kind: "flag", scope: "account" },
    giftPeakObelisks:       { kind: "flag", scope: "account" },
    giftFirstCinders:       { kind: "flag", scope: "account" },
    giftFirstUrnRite:       { kind: "flag", scope: "account" },
    giftFirstHearthRite:    { kind: "flag", scope: "account" },
    giftFirstBeaconRite:    { kind: "flag", scope: "account" },
    giftFirstSpireRite:     { kind: "flag", scope: "account" },
    giftFirstChalice:       { kind: "flag", scope: "account" },
    giftTwelveTributes:     { kind: "flag", scope: "account" },
    giftSixteenTributes:    { kind: "flag", scope: "account" },
    giftTwentyTributes:     { kind: "flag", scope: "account" },
    giftTwentyFourTributes: { kind: "flag", scope: "account" },
    giftTwentyEightTributes:{ kind: "flag", scope: "account" },
    giftThirtyTwoTributes:  { kind: "flag", scope: "account" },
    giftThirtySixTributes:  { kind: "flag", scope: "account" },
    giftFortyTributes:      { kind: "flag", scope: "account" },
    giftFullCup:            { kind: "flag", scope: "account" },
    giftThreeChalices:      { kind: "flag", scope: "account" },
    giftFirstOssuary:       { kind: "flag", scope: "account" },
    giftFullOssuary:        { kind: "flag", scope: "account" },
    giftHundredDraws:       { kind: "flag", scope: "account" },
    giftTwoHundredDraws:    { kind: "flag", scope: "account" },
    giftThreeHundredDraws:  { kind: "flag", scope: "account" },
    giftFirstEmberVow:      { kind: "flag", scope: "account" },
    giftTwoVows:            { kind: "flag", scope: "account" },
    giftThreeVows:          { kind: "flag", scope: "account" },
    giftAllVows:            { kind: "flag", scope: "account" },
    giftFirstProcession:        { kind: "flag", scope: "account" },
    giftFirstLongerProcession:  { kind: "flag", scope: "account" },
    giftFirstDeeperToll:        { kind: "flag", scope: "account" },
    giftFirstLongerWake:        { kind: "flag", scope: "account" },
    giftFirstLongerTithe:       { kind: "flag", scope: "account" },
    giftFirstLongerVeil:        { kind: "flag", scope: "account" },
    giftFirstLongerHymn:        { kind: "flag", scope: "account" },
    giftFirstLongerKnell:       { kind: "flag", scope: "account" },
    giftFirstToll:              { kind: "flag", scope: "account" },
    giftFirstKnell:             { kind: "flag", scope: "account" },
    // ── Choir / edict levels (account) ──
    choirLevel:        { kind: "count", scope: "run", max: CHOIR_MAX },
    unlockedChoir:     { kind: "flag",  scope: "run" },
    choirEdictLevel:   { kind: "count", scope: "account" },
    hymnEdictLevel:    { kind: "count", scope: "account" },
    smokeEdictLevel:   { kind: "count", scope: "account" },
    embersEdictLevel:  { kind: "count", scope: "account" },
    urnEdictLevel:     { kind: "count", scope: "account" },
    hearthEdictLevel:  { kind: "count", scope: "account" },
    beaconEdictLevel:  { kind: "count", scope: "account" },
    spireEdictLevel:   { kind: "count", scope: "account" },
    obeliskEdictLevel: { kind: "count", scope: "account" },
    cinderEdictLevel:  { kind: "count", scope: "account" },
    cutEdictLevel:     { kind: "count", scope: "account" },
    tendingEdictLevel: { kind: "count", scope: "account" },
    gleamEdictLevel:   { kind: "count", scope: "account" },
    riseEdictLevel:    { kind: "count", scope: "account" },
    cupEdictLevel:     { kind: "count", scope: "account" },
    draughtEdictLevel: { kind: "count", scope: "account" },
    wakeEdictLevel:    { kind: "count", scope: "account" },
    processionEdictLevel: { kind: "count", scope: "account" },
    tollEdictLevel:    { kind: "count", scope: "account" },
    veilEdictLevel:    { kind: "count", scope: "account" },
    knellEdictLevel:   { kind: "count", scope: "account" },
    nightEdictLevel:   { kind: "count", scope: "account" },
    // ── Hymn timer / misc account ──
    hymnLeft:          { kind: "count", scope: "run" },
    crownWeight:       { kind: "count", scope: "account" },
    longMemoryLevel:   { kind: "count", scope: "account" },
    quietCourtLevel:   { kind: "count", scope: "account" },
    namesBound:        { kind: "count", scope: "account", max: 12 },
    namesComplete:     { kind: "flag",  scope: "account" },
    remembrance:       { kind: "count", scope: "account" },
    deeperNightLevel:  { kind: "count", scope: "account" },
    ashenTideLevel:    { kind: "count", scope: "account", max: ASHEN_TIDE_MAX },
    ossuaryLevel:      { kind: "count", scope: "account", max: OSSUARY_MAX },
    longerProcessionLevel: { kind: "count", scope: "account", max: LONGER_PROCESSION_MAX },
    deeperTollLevel:   { kind: "count", scope: "account", max: DEEPER_TOLL_MAX },
    longerWakeLevel:   { kind: "count", scope: "account", max: LONGER_WAKE_MAX },
    longerTitheLevel:  { kind: "count", scope: "account", max: LONGER_TITHE_MAX },
    longerVeilLevel:   { kind: "count", scope: "account", max: LONGER_VEIL_MAX },
    longerHymnLevel:   { kind: "count", scope: "account", max: LONGER_HYMN_MAX },
    longerKnellLevel:  { kind: "count", scope: "account", max: LONGER_KNELL_MAX },
    // ── Vow / backup (run) ──
    vow:            { kind: "str",  scope: "run", save: normalizeVow, load: normalizeVow },
    vowHungerPaid:  { kind: "flag", scope: "run" },
    vowsKnown:      { kind: "obj",  scope: "account", dflt: emptyVowsKnown, save: normalizeVowsKnown, load: seedVowsKnown },
    bak1At:         { kind: "count", scope: "run" },
    bak2At:         { kind: "count", scope: "run" },
    runStartedAt:   { kind: "time",  scope: "run" },
    // ── All-time / tribute counter (account) ──
    allTimeSouls:   { kind: "num",   scope: "account" },
    tributesLaid:   { kind: "count", scope: "account" }
  };
  function fieldDefault(f) {
    if (f.dflt !== undefined) return typeof f.dflt === "function" ? f.dflt() : f.dflt;
    switch (f.kind) {
      case "num":  return N.fromNumber(0);
      case "count":return 0;
      case "flag": return false;
      case "str":  return "";
      case "list": return [];
      case "time": return Date.now();
      case "obj":  return {};
    }
    return undefined;
  }

  function freshState() {
    var s = {};
    for (var i = 0; i < FIELDS_KEYS.length; i++) {
      s[FIELDS_KEYS[i]] = fieldDefault(FIELDS[FIELDS_KEYS[i]]);
    }
    return s;
  }

  function resetToScope(s, target) {
    var fresh = freshState();
    for (var i = 0; i < FIELDS_KEYS.length; i++) {
      var k = FIELDS_KEYS[i];
      if (FIELDS[k].scope === target) {
        s[k] = fresh[k];
      }
    }
  }

  function dumpNum(v) {
    return N.dump(v);
  }

  function serializeState(s) {
    var out = {};
    for (var i = 0; i < FIELDS_KEYS.length; i++) {
      var k = FIELDS_KEYS[i];
      var f = FIELDS[k];
      var v = s[k];
      switch (f.kind) {
        case "num":  out[k] = dumpNum(v); break;
        case "count":
          var n = Math.max(0, Math.floor(Number(v) || 0));
          if (f.max != null) n = Math.min(f.max, n);
          out[k] = n;
          break;
        case "flag": out[k] = !!v; break;
        case "str":  out[k] = f.save ? f.save(v) : v; break;
        case "list": out[k] = v || []; break;
        case "time": out[k] = Number(v) || Date.now(); break;
        case "obj":  out[k] = f.save ? f.save(v) : v; break;
      }
    }
    out.lastTick = Date.now();
    out.simulatedUntil = Number(s.simulatedUntil) || Number(s.lastTick) || Date.now();
    if ((Number(s.chalices) || 0) >= 1) out.unlockedChalices = true;
    if ((Number(s.bindingTollLevel) || 0) >= 1) out.unlockedBindingToll = true;
    if ((Number(s.choirLevel) || 0) >= 1) out.unlockedChoir = true;
    if ((Number(s.namesBound) || 0) >= 12) out.namesComplete = true;
    return out;
  }

  function loadCount(v, max) {
    var n = Math.floor(Number(v) || 0);
    if (!isFinite(n) || n < 0) n = 0;
    if (max != null) n = Math.min(max, n);
    return n;
  }

  function loadNum(v) {
    var x = N.load(v);
    return N.isFinite(x) && N.cmp(x, 0) >= 0 ? x : N.fromNumber(0);
  }

  function numFieldBroken(v) {
    if (typeof v === "number") return !isFinite(v) || v < 0;
    if (v && typeof v === "object") {
      if (typeof v.m !== "number" || !isFinite(v.m)) return true;
      if (typeof v.e === "number" && !isFinite(v.e)) return true;
      if (v.m < 0) return true;
      return false;
    }
    return true;
  }

  function coreCurrenciesBroken(s) {
    return (
      numFieldBroken(s.souls) ||
      numFieldBroken(s.shades) ||
      numFieldBroken(s.ash) ||
      numFieldBroken(s.lifetimeSouls)
    );
  }

  function isFiniteStock(v) {
    if (typeof v === "number") return isFinite(v);
    if (v && typeof v === "object" && !Array.isArray(v)) {
      if (typeof v.m !== "number" || typeof v.e !== "number") return false;
      if (!isFinite(v.m) || !isFinite(v.e)) return false;
      return N.isFinite(N.load(v));
    }
    return false;
  }

  function isSaveShape(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return false;
    if (!Object.prototype.hasOwnProperty.call(data, "souls")) return false;
    if (!Object.prototype.hasOwnProperty.call(data, "lifetimeSouls")) return false;
    if (!isFiniteStock(data.souls)) return false;
    if (!isFiniteStock(data.lifetimeSouls)) return false;
    if (data.favorEarned != null && data.favorEarned !== undefined) {
      var fe = Number(data.favorEarned);
      if (!isFinite(fe) || fe < 0) return false;
    }
    return true;
  }

  function applySaveData(s, data) {
    for (var i = 0; i < FIELDS_KEYS.length; i++) {
      var k = FIELDS_KEYS[i];
      var f = FIELDS[k];
      var raw = data[k];
      switch (f.kind) {
        case "num":  s[k] = loadNum(raw); break;
        case "count":s[k] = loadCount(raw, f.max); break;
        case "flag": s[k] = !!raw; break;
        case "str":  s[k] = f.load ? f.load(raw, s) : (raw || ""); break;
        case "list": s[k] = f.load ? f.load(raw, s) : (raw || []); break;
        case "time": s[k] = loadCount(raw) || Date.now(); break;
        case "obj":  s[k] = f.load ? f.load(raw, s) : (raw || {}); break;
      }
    }
    s.simulatedUntil = loadCount(data.simulatedUntil) || loadCount(data.lastTick) || Date.now();
    for (var pk in PEAK_STATS) {
      if (Object.prototype.hasOwnProperty.call(PEAK_STATS, pk)) {
        s[pk] = N.max(loadNum(data[pk]), loadNum(data[PEAK_STATS[pk]]));
      }
    }
    s.vowHungerPaid = !!data.vowHungerPaid && s.vow === "hunger";
    if (data.favorEarned == null) s.favorEarned = loadCount(data.favor);
    if (data.allTimeSouls == null) s.allTimeSouls = loadNum(data.lifetimeSouls);
    if (N.cmp(s.allTimeSouls, 0) < 0) s.allTimeSouls = N.fromNumber(0);
    var tendingLoaded = data.tendingEdictLevel;
    if (tendingLoaded == null && data.kindlingEdictLevel != null) tendingLoaded = data.kindlingEdictLevel;
    s.tendingEdictLevel = loadCount(tendingLoaded);
    if ((loadCount(data.chalices) || 0) >= 1 || (loadCount(data.thrones) || 0) >= UNLOCK_CHALICES) s.unlockedChalices = true;
    if (N.cmp(s.urns, 1) >= 0 || N.cmp(s.pyres, UNLOCK_URNS) >= 0) s.unlockedUrns = true;
    if (N.cmp(s.hearths, 1) >= 0 || N.cmp(s.urns, UNLOCK_HEARTHS) >= 0) s.unlockedHearths = true;
    if (N.cmp(s.beacons, 1) >= 0 || N.cmp(s.hearths, UNLOCK_BEACONS) >= 0) s.unlockedBeacons = true;
    if (N.cmp(s.spires, 1) >= 0 || N.cmp(s.beacons, UNLOCK_SPIRES) >= 0) s.unlockedSpires = true;
    if (N.cmp(s.obelisks, 1) >= 0 || N.cmp(s.spires, UNLOCK_OBELISKS) >= 0) s.unlockedObelisks = true;
    if ((loadCount(data.nightLeft) || 0) > 0) s.unlockedNightTithe = true;
    s.unlockedVeil = s.unlockedVeil || s.clicksThisRun >= UNLOCK_VEIL_CLICKS || (Number(s.veilLeft) || 0) > 0;
    s.unlockedWake = s.unlockedWake || !!s.unlockedPyres || s.wakeLeft > 0 || N.cmp(s.ash, UNLOCK_WAKE_ASH) >= 0 || N.cmp(s.pyres, 1) >= 0;
    s.unlockedToll = s.unlockedToll || s.clicksThisRun >= UNLOCK_TOLL_CLICKS || (Number(s.tollLeft) || 0) > 0;
    if (s.bindingTollLevel >= 1) s.unlockedBindingToll = true;
    if (s.choirLevel >= 1) s.unlockedChoir = true;
    if (s.namesBound >= 12) s.namesComplete = true;
    if ((loadCount(data.titheLeft) || 0) > 0) s.tithePaid = true;
    if (data.giftFirstTribute == null && data.bonusFirstTribute == null) s.giftFirstTribute = (loadCount(data.tributesLaid) || 0) >= 1;
    if (data.giftFirstTribute == null && data.bonusFirstTribute != null) s.giftFirstTribute = !!data.bonusFirstTribute;
    if (data.giftCrown == null) s.giftCrown = s.crownWeight >= 1;
    if (data.giftFirstName == null) s.giftFirstName = Math.max(0, Math.floor(loadCount(data.namesBound) || 0)) >= 1;
    if (data.giftFiveTributes == null) s.giftFiveTributes = (loadCount(data.tributesLaid) || 0) >= 5;
    if (data.giftEightTributes == null) s.giftEightTributes = (loadCount(data.tributesLaid) || 0) >= 8;
    if (data.giftTwelveTributes == null) s.giftTwelveTributes = (loadCount(data.tributesLaid) || 0) >= 12;
    if (data.giftSixteenTributes == null) s.giftSixteenTributes = (loadCount(data.tributesLaid) || 0) >= 16;
    if (data.giftTwentyTributes == null) s.giftTwentyTributes = (loadCount(data.tributesLaid) || 0) >= 20;
    if (data.giftTwentyFourTributes == null) s.giftTwentyFourTributes = hasChronicle(s, "giftTwentyFourTributes") || (loadCount(data.tributesLaid) || 0) >= 24;
    if (data.giftTwentyEightTributes == null) s.giftTwentyEightTributes = hasChronicle(s, "giftTwentyEightTributes") || (loadCount(data.tributesLaid) || 0) >= 28;
    if (data.giftThirtyTwoTributes == null) s.giftThirtyTwoTributes = hasChronicle(s, "giftThirtyTwoTributes") || (loadCount(data.tributesLaid) || 0) >= 32;
    if (data.giftThirtySixTributes == null) s.giftThirtySixTributes = hasChronicle(s, "giftThirtySixTributes") || (loadCount(data.tributesLaid) || 0) >= 36;
    if (data.giftFortyTributes == null) s.giftFortyTributes = hasChronicle(s, "giftFortyTributes") || (loadCount(data.tributesLaid) || 0) >= 40;
    if (data.giftNamesComplete == null) s.giftNamesComplete = !!data.namesComplete || Math.max(0, Math.floor(loadCount(data.namesBound) || 0)) >= 12;
    if (data.giftFirstVeil == null) s.giftFirstVeil = hasChronicle(s, "veil") || (loadCount(data.veilLeft) || 0) > 0;
    if (data.giftFirstWake == null) s.giftFirstWake = hasChronicle(s, "wake") || hasChronicle(s, "giftFirstWake") || (loadCount(data.wakeLeft) || 0) > 0;
    if (data.giftPeakLanterns == null) s.giftPeakLanterns = false;
    if (data.giftPeakFetters == null) s.giftPeakFetters = false;
    if (data.giftPeakCensers == null) s.giftPeakCensers = false;
    if (data.giftFirstPyre == null) s.giftFirstPyre = hasChronicle(s, "pyre") || hasChronicle(s, "giftFirstPyre") || (embersStartsPyres(data.embersEdictLevel) > 0 && N.cmp(s.pyres, 1) >= 0);
    if (data.giftFirstUrn == null) s.giftFirstUrn = hasChronicle(s, "urn") || hasChronicle(s, "giftFirstUrn") || (urnEdictStartsUrns(data.urnEdictLevel) > 0 && N.cmp(s.urns, 1) >= 0);
    if (data.giftFirstHearth == null) s.giftFirstHearth = hasChronicle(s, "hearth") || hasChronicle(s, "giftFirstHearth") || (hearthEdictStartsHearths(data.hearthEdictLevel) > 0 && N.cmp(s.hearths, 1) >= 0);
    if (data.giftFirstBeacon == null) s.giftFirstBeacon = hasChronicle(s, "beacon") || hasChronicle(s, "giftFirstBeacon") || (beaconEdictStartsBeacons(data.beaconEdictLevel) > 0 && N.cmp(s.beacons, 1) >= 0);
    if (data.giftFirstSpire == null) s.giftFirstSpire = hasChronicle(s, "spire") || hasChronicle(s, "giftFirstSpire") || (spireEdictStartsSpires(data.spireEdictLevel) > 0 && N.cmp(s.spires, 1) >= 0);
    if (data.giftFirstObelisk == null) s.giftFirstObelisk = hasChronicle(s, "obelisk") || hasChronicle(s, "giftFirstObelisk") || (obeliskEdictStartsObelisks(data.obeliskEdictLevel) > 0 && N.cmp(s.obelisks, 1) >= 0);
    if (data.giftPeakPyres == null) s.giftPeakPyres = false;
    if (data.giftPeakUrns == null) s.giftPeakUrns = false;
    if (data.giftPeakHearths == null) s.giftPeakHearths = false;
    if (data.giftPeakBeacons == null) s.giftPeakBeacons = false;
    if (data.giftPeakSpires == null) s.giftPeakSpires = false;
    if (data.giftPeakObelisks == null) s.giftPeakObelisks = false;
    if (data.giftFirstCinders == null) s.giftFirstCinders = hasChronicle(s, "giftFirstCinders") || hasChronicle(s, "cinders") || (loadCount(data.cinderLevel) || 0) > 0;
    if (data.giftFirstUrnRite == null) s.giftFirstUrnRite = hasChronicle(s, "giftFirstUrnRite") || hasChronicle(s, "urnRite") || (loadCount(data.urnRiteLevel) || 0) > 0;
    if (data.giftFirstHearthRite == null) s.giftFirstHearthRite = hasChronicle(s, "giftFirstHearthRite") || hasChronicle(s, "hearthRite") || (loadCount(data.hearthRiteLevel) || 0) > 0;
    if (data.giftFirstBeaconRite == null) s.giftFirstBeaconRite = hasChronicle(s, "giftFirstBeaconRite") || hasChronicle(s, "beaconRite") || (loadCount(data.beaconRiteLevel) || 0) > 0;
    if (data.giftFirstSpireRite == null) s.giftFirstSpireRite = hasChronicle(s, "giftFirstSpireRite") || hasChronicle(s, "spireRite") || (loadCount(data.spireRiteLevel) || 0) > 0;
    if (data.giftFirstChalice == null) s.giftFirstChalice = hasChronicle(s, "giftFirstChalice") || hasChronicle(s, "chalice") || (cupStartsChalices(data.cupEdictLevel) > 0 && (Number(s.chalices) || 0) >= 1);
    if (data.giftFullCup == null) s.giftFullCup = hasChronicle(s, "giftFullCup");
    if (data.giftThreeChalices == null) s.giftThreeChalices = hasChronicle(s, "giftThreeChalices");
    if (data.giftFirstOssuary == null) s.giftFirstOssuary = hasChronicle(s, "giftFirstOssuary") || hasChronicle(s, "ossuary") || (loadCount(data.ossuaryLevel) || 0) >= 1;
    if (data.giftFullOssuary == null) s.giftFullOssuary = hasChronicle(s, "giftFullOssuary");
    if (data.giftHundredDraws == null) s.giftHundredDraws = hasChronicle(s, "giftHundredDraws");
    if (data.giftTwoHundredDraws == null) s.giftTwoHundredDraws = hasChronicle(s, "giftTwoHundredDraws");
    if (data.giftThreeHundredDraws == null) s.giftThreeHundredDraws = hasChronicle(s, "giftThreeHundredDraws");
    if (data.giftFirstEmberVow == null) s.giftFirstEmberVow = hasChronicle(s, "vowEmber") || hasChronicle(s, "giftFirstEmberVow");
    if (data.giftTwoVows == null) s.giftTwoVows = hasChronicle(s, "giftTwoVows");
    if (data.giftThreeVows == null) s.giftThreeVows = hasChronicle(s, "giftThreeVows");
    if (data.giftAllVows == null) s.giftAllVows = hasChronicle(s, "giftAllVows");
    if (data.giftFirstProcession == null) s.giftFirstProcession = hasChronicle(s, "procession") || hasChronicle(s, "giftFirstProcession") || (loadCount(data.processionLeft) || 0) > 0;
    if (data.giftFirstLongerProcession == null) s.giftFirstLongerProcession = hasChronicle(s, "giftFirstLongerProcession") || hasChronicle(s, "longerProcession") || (loadCount(data.longerProcessionLevel) || 0) >= 1;
    if (data.giftFirstDeeperToll == null) s.giftFirstDeeperToll = hasChronicle(s, "giftFirstDeeperToll") || hasChronicle(s, "deeperToll") || (loadCount(data.deeperTollLevel) || 0) >= 1;
    if (data.giftFirstLongerWake == null) s.giftFirstLongerWake = hasChronicle(s, "giftFirstLongerWake") || hasChronicle(s, "longerWake") || (loadCount(data.longerWakeLevel) || 0) >= 1;
    if (data.giftFirstLongerTithe == null) s.giftFirstLongerTithe = hasChronicle(s, "giftFirstLongerTithe") || hasChronicle(s, "longerTithe") || (loadCount(data.longerTitheLevel) || 0) >= 1;
    if (data.giftFirstLongerVeil == null) s.giftFirstLongerVeil = hasChronicle(s, "giftFirstLongerVeil") || hasChronicle(s, "longerVeil") || (loadCount(data.longerVeilLevel) || 0) >= 1;
    if (data.giftFirstLongerHymn == null) s.giftFirstLongerHymn = hasChronicle(s, "giftFirstLongerHymn") || hasChronicle(s, "longerHymn") || (loadCount(data.longerHymnLevel) || 0) >= 1;
    if (data.giftFirstLongerKnell == null) s.giftFirstLongerKnell = hasChronicle(s, "giftFirstLongerKnell") || hasChronicle(s, "longerKnell") || (loadCount(data.longerKnellLevel) || 0) >= 1;
    if (data.giftFirstToll == null) s.giftFirstToll = hasChronicle(s, "toll") || hasChronicle(s, "giftFirstToll") || (loadCount(data.tollLeft) || 0) > 0;
    if (data.giftFirstKnell == null) s.giftFirstKnell = hasChronicle(s, "knell") || hasChronicle(s, "giftFirstKnell") || (loadCount(data.knellLeft) || 0) > 0;
    // bonus* → gift* migration (AZR-179)
    for (var oldKey in BONUS_TO_GIFT) {
      if (Object.prototype.hasOwnProperty.call(BONUS_TO_GIFT, oldKey)) {
        var newKey = BONUS_TO_GIFT[oldKey];
        if (data[oldKey] && !s[newKey]) {
          s[newKey] = true;
        }
      }
    }
  }

  var FIELDS_KEYS = Object.keys(FIELDS);

  global.SoulgatherState = {
    FIELDS: FIELDS,
    FIELDS_KEYS: FIELDS_KEYS,
    hasChronicle: hasChronicle,
    normalizeChronicle: normalizeChronicle,
    freshState: freshState,
    resetToScope: resetToScope,
    serializeState: serializeState,
    loadCount: loadCount,
    loadNum: loadNum,
    coreCurrenciesBroken: coreCurrenciesBroken,
    isFiniteStock: isFiniteStock,
    isSaveShape: isSaveShape,
    applySaveData: applySaveData
  };
})(typeof window !== "undefined" ? window : globalThis);
