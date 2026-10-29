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

  function geometricCost(base, level) {
    var n = Math.max(0, Math.floor(level));
    return base * Math.pow(2, n);
  }

  function startsCount(level, max) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (max != null && n > max) n = max;
    return n;
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

  function processionSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return PROCESSION_SECS + 15 * n;
  }

  function processionLeftAfterTribute(level) {
    if (!autobindStartsPredicate(level)) return 0;
    return processionSecs(level);
  }

  function tollSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return TOLL_SECS + 10 * n;
  }

  function tollLeftAfterTribute(level) {
    if (!autobindStartsPredicate(level)) return 0;
    return tollSecs(level);
  }

  function veilSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return VEIL_SECS + 10 * n;
  }

  function veilLeftAfterTribute(level) {
    if (!autobindStartsPredicate(level)) return 0;
    return veilSecs(level);
  }

  function knellSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return KNELL_SECS + 10 * n;
  }

  function knellLeftAfterTribute(level) {
    if (!autobindStartsPredicate(level)) return 0;
    return knellSecs(level);
  }

  function nightEdictSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return NIGHT_TITHE_SECS + 15 * n;
  }

  function nightLeftAfterTribute(level) {
    if (!autobindStartsPredicate(level)) return 0;
    return nightEdictSecs(level);
  }

  /* ── Favor / Remembrance cost tables ─────────────────────────────── */

  /** Upgrades whose cost is base * 2^level, by public function name. */
  var GEOMETRIC_COST_BASE = {
    hymnEdictCost: 4,
    wakeEdictCost: 8,
    processionEdictCost: 9,
    tollEdictCost: 6,
    veilEdictCost: 7,
    knellEdictCost: 8,
    nightEdictCost: 5,
    choirEdictCost: 5,
    edictCost: 1,
    memoryCost: 2,
    seatCost: 5,
    kindleCost: 4,
    ashenCost: 3,
    depthCost: 4,
    quietCourtCost: 8,
    smokeEdictCost: 6,
    embersEdictCost: 7,
    urnEdictCost: 8,
    hearthEdictCost: 9,
    beaconEdictCost: 10,
    spireEdictCost: 11,
    obeliskEdictCost: 12,
    cinderEdictCost: 8,
    cutEdictCost: 11,
    tendingEdictCost: 12,
    gleamEdictCost: 13,
    riseEdictCost: 14,
    cupEdictCost: 9,
    draughtEdictCost: 10,
    deeperNightCost: 1
  };

  /** Remembrance upgrades costing 2^level up to a level cap, then Infinity. */
  var CAPPED_COST_MAX = {
    longerProcessionCost: LONGER_PROCESSION_MAX,
    deeperTollCost: DEEPER_TOLL_MAX,
    longerWakeCost: LONGER_WAKE_MAX,
    longerTitheCost: LONGER_TITHE_MAX,
    longerVeilCost: LONGER_VEIL_MAX,
    longerHymnCost: LONGER_HYMN_MAX,
    longerKnellCost: LONGER_KNELL_MAX,
    ashenTideCost: ASHEN_TIDE_MAX
  };

  var costFns = {};
  Object.keys(GEOMETRIC_COST_BASE).forEach(function (name) {
    var base = GEOMETRIC_COST_BASE[name];
    costFns[name] = function (level) { return geometricCost(base, level); };
  });
  Object.keys(CAPPED_COST_MAX).forEach(function (name) {
    var max = CAPPED_COST_MAX[name];
    costFns[name] = function (level) {
      return Math.max(0, Math.floor(level)) >= max ? Infinity : geometricCost(1, level);
    };
  });

  /* ── Reliquary edict costs ───────────────────────────────────────── */

  function echoCost(level) {
    var n = Math.max(0, Math.floor(level));
    if (n >= 1) return Infinity;
    return 3;
  }

  function embersStartsPyres(level) { return startsCount(level); }
  function urnEdictStartsUrns(level) { return startsCount(level); }
  function hearthEdictStartsHearths(level) { return startsCount(level); }
  function beaconEdictStartsBeacons(level) { return startsCount(level); }
  function spireEdictStartsSpires(level) { return startsCount(level); }
  function obeliskEdictStartsObelisks(level) { return startsCount(level); }
  function cupStartsChalices(level) { return startsCount(level, CHALICE_MAX); }

  function remembranceCostFavor() {
    return REMEMBRANCE_FAVOR_COST;
  }

  function paidProcessionSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > LONGER_PROCESSION_MAX) n = LONGER_PROCESSION_MAX;
    return PROCESSION_SECS + 10 * n;
  }

  function paidTollSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > DEEPER_TOLL_MAX) n = DEEPER_TOLL_MAX;
    return TOLL_SECS + 10 * n;
  }

  function paidWakeSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > LONGER_WAKE_MAX) n = LONGER_WAKE_MAX;
    return WAKE_SECS + 10 * n;
  }

  function paidTitheSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > LONGER_TITHE_MAX) n = LONGER_TITHE_MAX;
    return TITHE_SECS + 10 * n;
  }

  function paidVeilSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > LONGER_VEIL_MAX) n = LONGER_VEIL_MAX;
    return VEIL_SECS + 10 * n;
  }

  function paidKnellSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > LONGER_KNELL_MAX) n = LONGER_KNELL_MAX;
    return KNELL_SECS + 10 * n;
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

  global.SoulgatherEdicts = Object.assign(costFns, {
    titheCost: titheCost,
    nightTitheCost: nightTitheCost,
    veilCost: veilCost,
    hymnSecs: hymnSecs,
    hymnBonusSecs: hymnBonusSecs,
    hymnLeftAfterTribute: hymnLeftAfterTribute,
    wakeSecs: wakeSecs,
    autobindStartsPredicate: autobindStartsPredicate,
    wakeLeftAfterTribute: wakeLeftAfterTribute,
    processionSecs: processionSecs,
    processionLeftAfterTribute: processionLeftAfterTribute,
    tollSecs: tollSecs,
    tollLeftAfterTribute: tollLeftAfterTribute,
    veilSecs: veilSecs,
    veilLeftAfterTribute: veilLeftAfterTribute,
    knellSecs: knellSecs,
    knellLeftAfterTribute: knellLeftAfterTribute,
    nightEdictSecs: nightEdictSecs,
    nightLeftAfterTribute: nightLeftAfterTribute,
    echoCost: echoCost,
    embersStartsPyres: embersStartsPyres,
    urnEdictStartsUrns: urnEdictStartsUrns,
    hearthEdictStartsHearths: hearthEdictStartsHearths,
    beaconEdictStartsBeacons: beaconEdictStartsBeacons,
    spireEdictStartsSpires: spireEdictStartsSpires,
    obeliskEdictStartsObelisks: obeliskEdictStartsObelisks,
    cupStartsChalices: cupStartsChalices,
    remembranceCostFavor: remembranceCostFavor,
    paidProcessionSecs: paidProcessionSecs,
    paidTollSecs: paidTollSecs,
    paidWakeSecs: paidWakeSecs,
    paidTitheSecs: paidTitheSecs,
    paidVeilSecs: paidVeilSecs,
    paidKnellSecs: paidKnellSecs,
    ossuaryCost: ossuaryCost,
    nightTitheSecs: nightTitheSecs,
    ashFromShadeFrac: ashFromShadeFrac,
    choirAshRate: choirAshRate,
    namesFromPeak: namesFromPeak
  });
})(typeof window !== "undefined" ? window : globalThis);
