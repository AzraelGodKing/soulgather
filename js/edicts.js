(function (global) {
  "use strict";

  // Timed-burst durations and the Favor/Remembrance spend table (AZR-194): tithe and burst costs,
  // Reliquary edict costs and their tribute starts, Crown, Remembrance and Choir. Pure like economy.js;
  // economy.js merges these into SoulgatherEconomy, so callers keep using that namespace.
  var N = global.SoulgatherNum;
  var C = global.SoulgatherConfig;

  var CHALICE_MAX = C.CHALICE_MAX;
  var ASH_FROM_SHADE_FRAC = C.ASH_FROM_SHADE_FRAC;
  var TITHE_MIN = C.TITHE_MIN;
  var TITHE_FRAC = C.TITHE_FRAC;
  var TITHE_SECS = C.TITHE_SECS;
  var NIGHT_TITHE_MIN = C.NIGHT_TITHE_MIN;
  var NIGHT_TITHE_FRAC = C.NIGHT_TITHE_FRAC;
  var NIGHT_TITHE_SECS = C.NIGHT_TITHE_SECS;
  var VEIL_MIN = C.VEIL_MIN;
  var VEIL_FRAC = C.VEIL_FRAC;
  var REMEMBRANCE_FAVOR_COST = C.REMEMBRANCE_FAVOR_COST;
  var ASHEN_TIDE_MAX = C.ASHEN_TIDE_MAX;
  var OSSUARY_COST = C.OSSUARY_COST;
  var OSSUARY_MAX = C.OSSUARY_MAX;
  var PROCESSION_SECS = C.PROCESSION_SECS;
  var KNELL_SECS = C.KNELL_SECS;
  var TOLL_SECS = C.TOLL_SECS;
  var VEIL_SECS = C.VEIL_SECS;
  var WAKE_SECS = C.WAKE_SECS;
  var HYMN_SECS = C.HYMN_SECS;
  var LONGER_PROCESSION_MAX = C.LONGER_PROCESSION_MAX;
  var DEEPER_TOLL_MAX = C.DEEPER_TOLL_MAX;
  var LONGER_WAKE_MAX = C.LONGER_WAKE_MAX;
  var LONGER_TITHE_MAX = C.LONGER_TITHE_MAX;
  var LONGER_VEIL_MAX = C.LONGER_VEIL_MAX;
  var LONGER_HYMN_MAX = C.LONGER_HYMN_MAX;
  var LONGER_KNELL_MAX = C.LONGER_KNELL_MAX;
  var CHOIR_MAX = C.CHOIR_MAX;
  var NAME_THRESHOLDS = C.NAME_THRESHOLDS;

  function titheCost(souls) {
    var n = N.max(N.from(souls), 0);
    var tenth = N.floor(N.mul(n, TITHE_FRAC));
    return N.max(N.fromNumber(TITHE_MIN), tenth);
  }

  function nightTitheCost(ash) {
    var n = N.max(N.from(ash), 0);
    var quarter = N.floor(N.mul(n, NIGHT_TITHE_FRAC));
    return N.max(N.fromNumber(NIGHT_TITHE_MIN), quarter);
  }

  function veilCost(ash) {
    var n = N.max(N.from(ash), 0);
    var cut = N.floor(N.div(N.mul(n, VEIL_FRAC * 100), 100));
    return N.max(N.fromNumber(VEIL_MIN), cut);
  }

  /* ── Buff timers ─────────────────────────────────────────────────── */

  function hymnSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return HYMN_SECS + 15 * n;
  }

  function hymnBonusSecs(level) {
    return 10 * Math.max(0, Math.floor(Number(level) || 0));
  }

  function hymnLeftAfterTribute(edictLevel, longerHymnLevel) {
    if (longerHymnLevel == null) longerHymnLevel = 0;
    return hymnSecs(edictLevel) + hymnBonusSecs(longerHymnLevel);
  }

  function hymnEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 4 * Math.pow(2, n);
  }

  function wakeSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return WAKE_SECS + 15 * n;
  }

  function autobindStartsPredicate(level) {
    return (Number(level) || 0) >= 1;
  }

  function wakeLeftAfterTribute(level) {
    if (!autobindStartsPredicate(level)) return 0;
    return wakeSecs(level);
  }

  function wakeEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 8 * Math.pow(2, n);
  }

  function processionSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return PROCESSION_SECS + 15 * n;
  }

  function processionLeftAfterTribute(level) {
    if (!autobindStartsPredicate(level)) return 0;
    return processionSecs(level);
  }

  function processionEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 9 * Math.pow(2, n);
  }

  function tollSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return TOLL_SECS + 10 * n;
  }

  function tollLeftAfterTribute(level) {
    if (!autobindStartsPredicate(level)) return 0;
    return tollSecs(level);
  }

  function tollEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 6 * Math.pow(2, n);
  }

  function veilSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return VEIL_SECS + 10 * n;
  }

  function veilLeftAfterTribute(level) {
    if (!autobindStartsPredicate(level)) return 0;
    return veilSecs(level);
  }

  function veilEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 7 * Math.pow(2, n);
  }

  function knellSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return KNELL_SECS + 10 * n;
  }

  function knellLeftAfterTribute(level) {
    if (!autobindStartsPredicate(level)) return 0;
    return knellSecs(level);
  }

  function knellEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 8 * Math.pow(2, n);
  }

  function nightEdictSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return NIGHT_TITHE_SECS + 15 * n;
  }

  function nightLeftAfterTribute(level) {
    if (!autobindStartsPredicate(level)) return 0;
    return nightEdictSecs(level);
  }

  function nightEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 5 * Math.pow(2, n);
  }

  /* ── Reliquary edict costs ───────────────────────────────────────── */

  function choirEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 5 * Math.pow(2, n);
  }

  function edictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 1 * Math.pow(2, n);
  }

  function memoryCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 2 * Math.pow(2, n);
  }

  function echoCost(level) {
    var n = Math.max(0, Math.floor(level));
    if (n >= 1) return Infinity;
    return 3;
  }

  function seatCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 5 * Math.pow(2, n);
  }

  function kindleCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 4 * Math.pow(2, n);
  }

  function ashenCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 3 * Math.pow(2, n);
  }

  function depthCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 4 * Math.pow(2, n);
  }

  function quietCourtCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 8 * Math.pow(2, n);
  }

  function smokeEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 6 * Math.pow(2, n);
  }

  function embersEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 7 * Math.pow(2, n);
  }

  function embersStartsPyres(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return n;
  }

  function urnEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 8 * Math.pow(2, n);
  }

  function urnEdictStartsUrns(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return n;
  }

  function hearthEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 9 * Math.pow(2, n);
  }

  function hearthEdictStartsHearths(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return n;
  }

  function beaconEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 10 * Math.pow(2, n);
  }

  function beaconEdictStartsBeacons(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return n;
  }

  function spireEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 11 * Math.pow(2, n);
  }

  function spireEdictStartsSpires(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return n;
  }

  function obeliskEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 12 * Math.pow(2, n);
  }

  function obeliskEdictStartsObelisks(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return n;
  }

  function cinderEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 8 * Math.pow(2, n);
  }

  function cutEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 11 * Math.pow(2, n);
  }

  function tendingEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 12 * Math.pow(2, n);
  }

  function gleamEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 13 * Math.pow(2, n);
  }

  function riseEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 14 * Math.pow(2, n);
  }

  function cupEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 9 * Math.pow(2, n);
  }

  function cupStartsChalices(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > CHALICE_MAX) n = CHALICE_MAX;
    return n;
  }

  function draughtEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 10 * Math.pow(2, n);
  }

  function remembranceCostFavor() {
    return REMEMBRANCE_FAVOR_COST;
  }

  function deeperNightCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 1 * Math.pow(2, n);
  }

  function longerProcessionCost(level) {
    var n = Math.max(0, Math.floor(level));
    if (n >= LONGER_PROCESSION_MAX) return Infinity;
    return 1 * Math.pow(2, n);
  }

  function paidProcessionSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > LONGER_PROCESSION_MAX) n = LONGER_PROCESSION_MAX;
    return PROCESSION_SECS + 10 * n;
  }

  function deeperTollCost(level) {
    var n = Math.max(0, Math.floor(level));
    if (n >= DEEPER_TOLL_MAX) return Infinity;
    return 1 * Math.pow(2, n);
  }

  function paidTollSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > DEEPER_TOLL_MAX) n = DEEPER_TOLL_MAX;
    return TOLL_SECS + 10 * n;
  }

  function longerWakeCost(level) {
    var n = Math.max(0, Math.floor(level));
    if (n >= LONGER_WAKE_MAX) return Infinity;
    return 1 * Math.pow(2, n);
  }

  function paidWakeSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > LONGER_WAKE_MAX) n = LONGER_WAKE_MAX;
    return WAKE_SECS + 10 * n;
  }

  function longerTitheCost(level) {
    var n = Math.max(0, Math.floor(level));
    if (n >= LONGER_TITHE_MAX) return Infinity;
    return 1 * Math.pow(2, n);
  }

  function paidTitheSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > LONGER_TITHE_MAX) n = LONGER_TITHE_MAX;
    return TITHE_SECS + 10 * n;
  }

  function longerVeilCost(level) {
    var n = Math.max(0, Math.floor(level));
    if (n >= LONGER_VEIL_MAX) return Infinity;
    return 1 * Math.pow(2, n);
  }

  function paidVeilSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > LONGER_VEIL_MAX) n = LONGER_VEIL_MAX;
    return VEIL_SECS + 10 * n;
  }

  function longerHymnCost(level) {
    var n = Math.max(0, Math.floor(level));
    if (n >= LONGER_HYMN_MAX) return Infinity;
    return 1 * Math.pow(2, n);
  }

  function longerKnellCost(level) {
    var n = Math.max(0, Math.floor(level));
    if (n >= LONGER_KNELL_MAX) return Infinity;
    return 1 * Math.pow(2, n);
  }

  function paidKnellSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > LONGER_KNELL_MAX) n = LONGER_KNELL_MAX;
    return KNELL_SECS + 10 * n;
  }

  function ashenTideCost(level) {
    var n = Math.max(0, Math.floor(level));
    if (n >= ASHEN_TIDE_MAX) return Infinity;
    return 1 * Math.pow(2, n);
  }

  function ossuaryCost(level) {
    var n = Math.max(0, Math.floor(level));
    if (n >= OSSUARY_MAX) return Infinity;
    return OSSUARY_COST;
  }

  function nightTitheSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return NIGHT_TITHE_SECS + 10 * n;
  }

  /* ── Ash / choir / names ─────────────────────────────────────────── */

  function ashFromShadeFrac(level, choirLevel) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > ASHEN_TIDE_MAX) n = ASHEN_TIDE_MAX;
    var c = Math.max(0, Math.floor(Number(choirLevel) || 0));
    if (c > CHOIR_MAX) c = CHOIR_MAX;
    return ASH_FROM_SHADE_FRAC + 0.005 * n + 0.005 * c;
  }

  function choirAshRate(choirLevel, ashenTide) {
    return ashFromShadeFrac(ashenTide, choirLevel);
  }

  function namesFromPeak(peak) {
    var p = N.from(peak);
    var n = 0;
    var i;
    for (i = 0; i < NAME_THRESHOLDS.length; i++) {
      if (N.cmp(p, NAME_THRESHOLDS[i]) >= 0) n += 1;
      else break;
    }
    return n;
  }

  global.SoulgatherEdicts = {
    titheCost: titheCost,
    nightTitheCost: nightTitheCost,
    veilCost: veilCost,
    hymnSecs: hymnSecs,
    hymnBonusSecs: hymnBonusSecs,
    hymnLeftAfterTribute: hymnLeftAfterTribute,
    hymnEdictCost: hymnEdictCost,
    wakeSecs: wakeSecs,
    autobindStartsPredicate: autobindStartsPredicate,
    wakeLeftAfterTribute: wakeLeftAfterTribute,
    wakeEdictCost: wakeEdictCost,
    processionSecs: processionSecs,
    processionLeftAfterTribute: processionLeftAfterTribute,
    processionEdictCost: processionEdictCost,
    tollSecs: tollSecs,
    tollLeftAfterTribute: tollLeftAfterTribute,
    tollEdictCost: tollEdictCost,
    veilSecs: veilSecs,
    veilLeftAfterTribute: veilLeftAfterTribute,
    veilEdictCost: veilEdictCost,
    knellSecs: knellSecs,
    knellLeftAfterTribute: knellLeftAfterTribute,
    knellEdictCost: knellEdictCost,
    nightEdictSecs: nightEdictSecs,
    nightLeftAfterTribute: nightLeftAfterTribute,
    nightEdictCost: nightEdictCost,
    choirEdictCost: choirEdictCost,
    edictCost: edictCost,
    memoryCost: memoryCost,
    echoCost: echoCost,
    seatCost: seatCost,
    kindleCost: kindleCost,
    ashenCost: ashenCost,
    depthCost: depthCost,
    quietCourtCost: quietCourtCost,
    smokeEdictCost: smokeEdictCost,
    embersEdictCost: embersEdictCost,
    embersStartsPyres: embersStartsPyres,
    urnEdictCost: urnEdictCost,
    urnEdictStartsUrns: urnEdictStartsUrns,
    hearthEdictCost: hearthEdictCost,
    hearthEdictStartsHearths: hearthEdictStartsHearths,
    beaconEdictCost: beaconEdictCost,
    beaconEdictStartsBeacons: beaconEdictStartsBeacons,
    spireEdictCost: spireEdictCost,
    spireEdictStartsSpires: spireEdictStartsSpires,
    obeliskEdictCost: obeliskEdictCost,
    obeliskEdictStartsObelisks: obeliskEdictStartsObelisks,
    cinderEdictCost: cinderEdictCost,
    cutEdictCost: cutEdictCost,
    tendingEdictCost: tendingEdictCost,
    gleamEdictCost: gleamEdictCost,
    riseEdictCost: riseEdictCost,
    cupEdictCost: cupEdictCost,
    cupStartsChalices: cupStartsChalices,
    draughtEdictCost: draughtEdictCost,
    remembranceCostFavor: remembranceCostFavor,
    deeperNightCost: deeperNightCost,
    longerProcessionCost: longerProcessionCost,
    paidProcessionSecs: paidProcessionSecs,
    deeperTollCost: deeperTollCost,
    paidTollSecs: paidTollSecs,
    longerWakeCost: longerWakeCost,
    paidWakeSecs: paidWakeSecs,
    longerTitheCost: longerTitheCost,
    paidTitheSecs: paidTitheSecs,
    longerVeilCost: longerVeilCost,
    paidVeilSecs: paidVeilSecs,
    longerHymnCost: longerHymnCost,
    longerKnellCost: longerKnellCost,
    paidKnellSecs: paidKnellSecs,
    ashenTideCost: ashenTideCost,
    ossuaryCost: ossuaryCost,
    nightTitheSecs: nightTitheSecs,
    ashFromShadeFrac: ashFromShadeFrac,
    choirAshRate: choirAshRate,
    namesFromPeak: namesFromPeak
  };
})(typeof window !== "undefined" ? window : globalThis);
