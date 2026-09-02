(function () {
  "use strict";

  var N = globalThis.SoulgatherNum;

  var SAVE_KEY = "soulgather-v0";
  var COST_BASE = 10;
  var COST_MULT = 1.15;
  var WELL_COST_BASE = 25;
  var WELL_COST_MULT = 1.5;
  var LANTERN_COST_BASE = 30;
  var LANTERN_COST_MULT = 1.2;
  var MARK_COST_BASE = 8;
  var MARK_COST_MULT = 2;
  var SHADE_SOULS_PER_SEC = 1;
  var SPIRIT_SHADES_PER_SEC = 0.1;
  var VESSEL_SPIRITS_PER_SEC = 0.1;
  var CENSER_ASH_PER_SEC = 0.2;
  var PYRE_ASH_PER_SEC = 0.15;
  var PYRE_COST_BASE = 2;
  var PYRE_COST_MULT = 1.2;
  var UNLOCK_PYRES = 3;
  var URN_ASH_PER_SEC = 0.1;
  var URN_COST_BASE = 3;
  var URN_COST_MULT = 1.2;
  var UNLOCK_URNS = 4;
  var HEARTH_ASH_PER_SEC = 0.08;
  var HEARTH_COST_BASE = 4;
  var HEARTH_COST_MULT = 1.2;
  var UNLOCK_HEARTHS = 4;
  var UNLOCK_CHALICES = 5;
  var CHALICE_MAX = 12;
  var CHALICE_COST_BASE = 20;
  var CHALICE_COST_MULT = 1.5;
  var ASH_FROM_SHADE_FRAC = 0.01;
  var UNLOCK_SHADES = 10;
  var UNLOCK_LIFETIME = 100;
  var UNLOCK_SPIRITS_FOR_VESSELS = 5;
  var UNLOCK_LIFETIME_SHADES = 50;
  var UNLOCK_VESSELS_FOR_THRONES = 1;
  var UNLOCK_LIFETIME_SPIRITS = 50;
  var UNLOCK_WELL_DRAWS_SHADES = 3;
  var UNLOCK_LANTERNS = 3;
  var UNLOCK_MARKS_LIFETIME = 500;
  var UNLOCK_CENSERS_VESSELS = 1;
  var UNLOCK_CENSERS_LIFETIME_SPIRITS = 25;
  var WELL_DRAWS_COST = 50;
  var BULK_CAP = 10000;
  var AUTOSAVE_MS = 5000;
  var MAX_DT = 8 * 60 * 60;
  var TOAST_MS = 5200;
  var AWAY_MIN_DT = 2;
  var TITHE_MIN = 25;
  var TITHE_FRAC = 0.1;
  var TITHE_SECS = 60;
  var FETTER_COST_BASE = 20;
  var FETTER_COST_MULT = 1.2;
  var UNLOCK_FETTERS = 3;
  var UNLOCK_AUTOBIND_SHADES = 15;
  var UNLOCK_AUTOBIND_SPIRITS = 10;
  var UNLOCK_AUTOBIND_VESSELS = 3;
  var UNLOCK_AUTOBIND_LANTERNS = 8;
  var UNLOCK_AUTOBIND_FETTERS = 6;
  var UNLOCK_AUTOBIND_CENSERS = 4;
  var UNLOCK_AUTOBIND_THRONES = 4;
  var UNLOCK_AUTOBIND_PYRES = 4;
  var UNLOCK_AUTOBIND_CHALICES = 3;
  var UNLOCK_AUTOBIND_URNS = 3;
  var UNLOCK_AUTOBIND_HEARTHS = 3;
  var CINDER_COST = 15;
  var URN_RITE_COST = 12;
  var HEARTH_RITE_COST = 14;
  var UNLOCK_NIGHT_LANTERNS = 8;
  var UNLOCK_VEIL_CLICKS = 50;
  var UNLOCK_TOLL_CLICKS = 80;
  var TOLL_COST = 40;
  var TOLL_SECS = 25;
  var VEIL_MIN = 20;
  var VEIL_FRAC = 0.15;
  var VEIL_SECS = 20;
  var WAKE_COST = 30;
  var WAKE_SECS = 40;
  var UNLOCK_WAKE_ASH = 40;
  var NIGHT_TITHE_MIN = 10;
  var NIGHT_TITHE_FRAC = 0.25;
  var NIGHT_TITHE_SECS = 30;
  var REMEMBRANCE_FAVOR_COST = 3;
  var ASHEN_TIDE_MAX = 5;
  var OSSUARY_COST = 1;
  var OSSUARY_MAX = 8;
  var PROCESSION_COST = 1;
  var PROCESSION_SECS = 45;
  var LONGER_PROCESSION_MAX = 5;
  var DEEPER_TOLL_MAX = 5;
  var LONGER_WAKE_MAX = 5;
  var LONGER_TITHE_MAX = 5;
  var LONGER_VEIL_MAX = 5;
  var LONGER_HYMN_MAX = 5;
  var CHOIR_MAX = 10;
  var CHOIR_LANTERN_COST = 5;
  var UNLOCK_CHOIR_LANTERNS = 5;
  var UNLOCK_CHOIR_ASH = 20;
  var HYMN_SECS = 45;
  var HYMN_MULT = 1.25;
  var NAME_THRESHOLDS = [25, 50, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 25000, 50000];
  var BOUND_NAMES = [
    "The First Siphon",
    "The Quiet Chain",
    "The Hollow Tithe",
    "The Bound Echo",
    "The Ashen Mouth",
    "The Night Levy",
    "The Well's Hunger",
    "The Seat Unseen",
    "The Kindled Fetter",
    "The Crown's Shadow",
    "The Last Vessel",
    "The Name He Keeps"
  ];

  function num(v) {
    return N.from(v);
  }

  function nVal(v) {
    if (v && typeof v === "object" && typeof v.m === "number") {
      var n = N.toNumber(v);
      if (!isFinite(n)) return n > 0 ? 1e300 : 0;
      return n;
    }
    return Number(v) || 0;
  }

  function addOwned(owned, i) {
    i = Number(i) || 0;
    if (owned && typeof owned === "object" && typeof owned.m === "number") {
      return N.add(N.floor(N.max(owned, 0)), i);
    }
    return Math.max(0, Math.floor(Number(owned) || 0)) + i;
  }

  function producerCost(owned) {
    return N.cost(COST_BASE, COST_MULT, owned);
  }

  function shadeCost(owned) {
    return producerCost(owned);
  }

  function spiritCost(owned) {
    return producerCost(owned);
  }

  function vesselCost(owned) {
    return producerCost(owned);
  }

  function throneCost(owned) {
    return producerCost(owned);
  }

  function lanternCost(owned) {
    return N.cost(LANTERN_COST_BASE, LANTERN_COST_MULT, owned);
  }

  function fetterCost(owned) {
    return N.cost(FETTER_COST_BASE, FETTER_COST_MULT, owned);
  }

  function censerCost(owned) {
    return producerCost(owned);
  }

  function pyreCost(owned) {
    return N.cost(PYRE_COST_BASE, PYRE_COST_MULT, owned);
  }

  function urnCost(owned) {
    return N.cost(URN_COST_BASE, URN_COST_MULT, owned);
  }

  function hearthCost(owned) {
    return N.cost(HEARTH_COST_BASE, HEARTH_COST_MULT, owned);
  }

  function chaliceCost(owned) {
    return N.cost(CHALICE_COST_BASE, CHALICE_COST_MULT, owned);
  }

  function markCost(level) {
    return N.cost(MARK_COST_BASE, MARK_COST_MULT, level);
  }

  function wellCost(depth) {
    return N.cost(WELL_COST_BASE, WELL_COST_MULT, depth);
  }

  function bulkCost(base, owned, k, mult) {
    var b = Number(base);
    if (!isFinite(b) || b <= 0) b = COST_BASE;
    if (mult == null) mult = COST_MULT;
    var n = Math.max(0, Math.floor(k));
    if (n > BULK_CAP) n = BULK_CAP;
    var total = N.fromNumber(0);
    var i;
    for (i = 0; i < n; i++) {
      total = N.add(total, N.cost(b, mult, addOwned(owned, i)));
    }
    return total;
  }

  function maxAffordable(base, owned, currency, mult) {
    var b = Number(base);
    if (!isFinite(b) || b <= 0) b = COST_BASE;
    if (mult == null) mult = COST_MULT;
    var remaining = num(currency);
    var k = 0;
    while (k < BULK_CAP) {
      var c = N.cost(b, mult, addOwned(owned, k));
      if (N.cmp(remaining, c) < 0) break;
      remaining = N.sub(remaining, c);
      k += 1;
    }
    return k;
  }

  function favorGain(lifetimeSouls) {
    var n = N.max(num(lifetimeSouls), 0);
    if (N.cmp(n, 0) <= 0) return 0;
    if (n.e < 15) {
      var v = N.toNumber(n);
      if (isFinite(v) && v >= 0) {
        return Math.floor(Math.sqrt(v / 25000));
      }
    }
    var q = N.div(n, 25000);
    var s = N.floor(N.add(N.pow(q, 0.5), N.fromNumber(1e-9)));
    var asN = N.toNumber(s);
    if (!isFinite(asN) || asN > Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;
    if (asN < 0) return 0;
    return Math.floor(asN);
  }

  function prestigeMult(favorEarned) {
    return 1 + 0.5 * (Number(favorEarned) || 0);
  }

  function harvestMult(on) {
    return on ? 1.5 : 1;
  }

  function bindingMult(on) {
    return on ? 1.5 : 1;
  }

  function throneWeight(dominion) {
    return dominion ? 0.15 : 0.1;
  }

  function chaliceMult(n) {
    var k = Math.max(0, Math.floor(Number(n) || 0));
    if (k > CHALICE_MAX) k = CHALICE_MAX;
    return 1 + 0.08 * k;
  }

  function ossuaryMult(n) {
    var k = Math.max(0, Math.floor(Number(n) || 0));
    if (k > OSSUARY_MAX) k = OSSUARY_MAX;
    return 1 + 0.05 * k;
  }

  function prodMult(favorEarned, thrones, edictLevel, weight, crownWeight, namesComplete, chalices, ossuary) {
    var w = weight == null ? 0.1 : Number(weight);
    if (!isFinite(w)) w = 0.1;
    return (
      prestigeMult(favorEarned) *
      (1 + w * (Number(thrones) || 0)) *
      (1 + 0.25 * (Number(edictLevel) || 0)) *
      (1 + 0.10 * (Number(crownWeight) || 0)) *
      namesCompleteMult(namesComplete) *
      chaliceMult(chalices) *
      ossuaryMult(ossuary)
    );
  }

  function crownCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 6 * Math.pow(2, n);
  }

  function longMemCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 5 * Math.pow(2, n);
  }

  function titheCost(souls) {
    var n = N.max(num(souls), 0);
    var tenth = N.floor(N.mul(n, TITHE_FRAC));
    return N.max(N.fromNumber(TITHE_MIN), tenth);
  }

  function titheMult(on) {
    return on ? 2 : 1;
  }

  function nightTitheCost(ash) {
    var n = N.max(num(ash), 0);
    var quarter = N.floor(N.mul(n, NIGHT_TITHE_FRAC));
    return N.max(N.fromNumber(NIGHT_TITHE_MIN), quarter);
  }

  function nightMult(on) {
    return on ? 3 : 1;
  }

  function veilCost(ash) {
    var n = N.max(num(ash), 0);
    var cut = N.floor(N.div(N.mul(n, 15), 100));
    return N.max(N.fromNumber(VEIL_MIN), cut);
  }

  function veilMult(on) {
    return on ? 2 : 1;
  }

  function tollMult(on) {
    return on ? 2 : 1;
  }

  function hymnMult(on) {
    return on ? HYMN_MULT : 1;
  }

  function wakeMult(on) {
    return on ? 2 : 1;
  }

  function processionMult(on) {
    return on ? 1.2 : 1;
  }

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

  function wakeEdictStartsWake(level) {
    return (Number(level) || 0) >= 1;
  }

  function wakeLeftAfterTribute(level) {
    if (!wakeEdictStartsWake(level)) return 0;
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

  function processionEdictStartsProcession(level) {
    return (Number(level) || 0) >= 1;
  }

  function processionLeftAfterTribute(level) {
    if (!processionEdictStartsProcession(level)) return 0;
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

  function tollEdictStartsToll(level) {
    return (Number(level) || 0) >= 1;
  }

  function tollLeftAfterTribute(level) {
    if (!tollEdictStartsToll(level)) return 0;
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

  function veilEdictStartsVeil(level) {
    return (Number(level) || 0) >= 1;
  }

  function veilLeftAfterTribute(level) {
    if (!veilEdictStartsVeil(level)) return 0;
    return veilSecs(level);
  }

  function veilEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 7 * Math.pow(2, n);
  }

  function nightEdictSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return NIGHT_TITHE_SECS + 15 * n;
  }

  function nightEdictStartsNight(level) {
    return (Number(level) || 0) >= 1;
  }

  function nightLeftAfterTribute(level) {
    if (!nightEdictStartsNight(level)) return 0;
    return nightEdictSecs(level);
  }

  function nightEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 5 * Math.pow(2, n);
  }

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

  function quietCourtStartsLanternAutobind(level) {
    return (Number(level) || 0) >= 1;
  }

  function quietCourtStartsFetterAutobind(level) {
    return (Number(level) || 0) >= 1;
  }

  function quietCourtStartsPyreAutobind(level) {
    return (Number(level) || 0) >= 1;
  }

  function quietCourtStartsChaliceAutobind(level) {
    return (Number(level) || 0) >= 1;
  }

  function quietCourtStartsUrnAutobind(level) {
    return (Number(level) || 0) >= 1;
  }

  function quietCourtStartsHearthAutobind(level) {
    return (Number(level) || 0) >= 1;
  }

  function smokeEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 6 * Math.pow(2, n);
  }

  function smokeStartsCenserAutobind(level) {
    return (Number(level) || 0) >= 1;
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

  function cinderEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 8 * Math.pow(2, n);
  }

  function cinderEdictStartsPyreAutobind(level) {
    return (Number(level) || 0) >= 1;
  }

  function cutEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 11 * Math.pow(2, n);
  }

  function cutEdictStartsUrnAutobind(level) {
    return (Number(level) || 0) >= 1;
  }

  function tendingEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 12 * Math.pow(2, n);
  }

  function tendingEdictStartsHearthAutobind(level) {
    return (Number(level) || 0) >= 1;
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

  function draughtStartsChaliceAutobind(level) {
    return (Number(level) || 0) >= 1;
  }

  function remembranceCostFavor() {
    return REMEMBRANCE_FAVOR_COST;
  }

  function remembranceFavorCost() {
    return remembranceCostFavor();
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

  function nightSecs(level) {
    return nightTitheSecs(level);
  }

  function namesCompleteMult(on) {
    return on ? 1.05 : 1;
  }

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
    var p = num(peak);
    var n = 0;
    var i;
    for (i = 0; i < NAME_THRESHOLDS.length; i++) {
      if (N.cmp(p, NAME_THRESHOLDS[i]) >= 0) n += 1;
      else break;
    }
    return n;
  }

  function siphonCost(level) {
    return N.cost(50, 3, level);
  }

  function levyCost(level) {
    return N.cost(15, 3, level);
  }

  function siphonMult(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n < 40) return N.fromNumber(Math.pow(2, n));
    return N.pow(N.fromNumber(2), n);
  }

  function levyMult(level) {
    return siphonMult(level);
  }

  function cinderMult(level) {
    return siphonMult(level);
  }

  function urnRiteMult(level) {
    return siphonMult(level);
  }

  function hearthRiteMult(level) {
    return siphonMult(level);
  }

  function lanternMult(lanterns) {
    if (lanterns && typeof lanterns === "object" && typeof lanterns.m === "number") {
      if (lanterns.e < 12) {
        return N.fromNumber(1 + 0.05 * (N.toNumber(lanterns) || 0));
      }
      return N.add(1, N.mul(0.05, lanterns));
    }
    return N.fromNumber(1 + 0.05 * (Number(lanterns) || 0));
  }

  function fetterMult(fetters) {
    if (fetters && typeof fetters === "object" && typeof fetters.m === "number") {
      if (fetters.e < 12) {
        return N.fromNumber(1 + 0.05 * (N.toNumber(fetters) || 0));
      }
      return N.add(1, N.mul(0.05, fetters));
    }
    return N.fromNumber(1 + 0.05 * (Number(fetters) || 0));
  }

  function emberMult(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n < 40) return N.fromNumber(Math.pow(1.25, n));
    return N.pow(N.fromNumber(1.25), n);
  }

  function chainMult(level) {
    return emberMult(level);
  }

  function hollowMult(level) {
    return emberMult(level);
  }

  var ASPECT_IDS = { harvest: "harvest", binding: "binding", dominion: "dominion" };
  var ASPECT_NAMES = {
    harvest: "Harvest",
    binding: "Binding",
    dominion: "Dominion"
  };

  function normalizeAspect(raw) {
    if (raw === "harvest" || raw === "aspectHarvest") return "harvest";
    if (raw === "binding" || raw === "aspectBinding") return "binding";
    if (raw === "dominion" || raw === "aspectDominion") return "dominion";
    return "";
  }

  var VOW_IDS = { stillness: "stillness", poverty: "poverty", hunger: "hunger", ember: "ember" };
  var VOW_NAMES = {
    stillness: "Stillness",
    poverty: "Poverty",
    hunger: "Hunger",
    ember: "Ember"
  };

  function normalizeVow(raw) {
    if (raw === "stillness") return "stillness";
    if (raw === "poverty") return "poverty";
    if (raw === "hunger") return "hunger";
    if (raw === "ember") return "ember";
    return "";
  }

  function vowExtraFavor(vow, hungerPaid) {
    var v = normalizeVow(vow);
    if (v === "stillness" || v === "poverty" || v === "ember") return 1;
    if (v === "hunger") return hungerPaid ? 1 : 0;
    return 0;
  }

  function emptyVowsKnown() {
    return { stillness: false, poverty: false, hunger: false, ember: false };
  }

  function vowsKnownCount(known) {
    if (!known || typeof known !== "object") return 0;
    var n = 0;
    if (known.stillness || known.knownStillness) n += 1;
    if (known.poverty || known.knownPoverty) n += 1;
    if (known.hunger || known.knownHunger) n += 1;
    if (known.ember || known.knownEmber) n += 1;
    return n;
  }

  function normalizeVowsKnown(raw) {
    var out = emptyVowsKnown();
    if (!raw || typeof raw !== "object") return out;
    if (raw.stillness || raw.knownStillness) out.stillness = true;
    if (raw.poverty || raw.knownPoverty) out.poverty = true;
    if (raw.hunger || raw.knownHunger) out.hunger = true;
    if (raw.ember || raw.knownEmber) out.ember = true;
    return out;
  }

  function rememberVow(id) {
    var v = normalizeVow(id);
    if (!v) return;
    if (!state.vowsKnown || typeof state.vowsKnown !== "object") {
      state.vowsKnown = emptyVowsKnown();
    }
    state.vowsKnown[v] = true;
  }

  function seedVowsKnown(raw) {
    var known = normalizeVowsKnown(raw);
    if (hasChronicle("vowStillness")) known.stillness = true;
    if (hasChronicle("vowPoverty")) known.poverty = true;
    if (hasChronicle("vowHunger")) known.hunger = true;
    if (hasChronicle("vowEmber") || hasChronicle("giftFirstEmberVow")) known.ember = true;
    var v = normalizeVow(state.vow);
    if (v) known[v] = true;
    return known;
  }

  function normalizeBuyMode(mode) {
    if (mode === "10" || mode === "max" || mode === "1") return mode;
    return "1";
  }

  var CHRONICLE_ORDER = [
    "soul",
    "shade",
    "spirits",
    "well",
    "vessels",
    "throne",
    "rite",
    "cinders",
    "urnRite",
    "hearthRite",
    "wellDraw",
    "tribute",
    "aspect",
    "echo",
    "seat",
    "lantern",
    "ash",
    "mark",
    "censer",
    "pyre",
    "urn",
    "hearth",
    "fetter",
    "giftSouls",
    "giftShades",
    "giftVessel",
    "giftTribute",
    "giftThousand",
    "giftLantern",
    "giftCenser",
    "giftFetter",
    "giftTenThousand",
    "giftThrone",
    "giftCrown",
    "giftFirstName",
    "giftFiveTributes",
    "giftNamesComplete",
    "giftFirstVeil",
    "giftFirstWake",
    "giftPeakLanterns",
    "giftPeakFetters",
    "giftPeakCensers",
    "giftFirstPyre",
    "giftFirstUrn",
    "giftFirstHearth",
    "giftEightTributes",
    "giftPeakPyres",
    "giftPeakUrns",
    "giftPeakHearths",
    "giftFirstCinders",
    "giftFirstUrnRite",
    "giftFirstHearthRite",
    "giftFirstChalice",
    "giftThreeChalices",
    "giftTwelveTributes",
    "giftSixteenTributes",
    "giftTwentyTributes",
    "giftTwentyFourTributes",
    "giftTwentyEightTributes",
    "giftFullCup",
    "giftFirstOssuary",
    "giftFullOssuary",
    "giftHundredDraws",
    "giftTwoHundredDraws",
    "giftThreeHundredDraws",
    "giftFirstEmberVow",
    "giftTwoVows",
    "giftThreeVows",
    "giftAllVows",
    "giftFirstProcession",
    "giftFirstLongerProcession",
    "giftFirstDeeperToll",
    "giftFirstLongerWake",
    "giftFirstLongerTithe",
    "giftFirstLongerVeil",
    "giftFirstLongerHymn",
    "giftFirstToll",
    "choir",
    "veil",
    "toll",
    "wake",
    "procession",
    "longerProcession",
    "deeperToll",
    "longerWake",
    "longerTithe",
    "longerVeil",
    "longerHymn",
    "choirEdict",
    "hymnEdict",
    "smokeEdict",
    "embersEdict",
    "urnEdict",
    "hearthEdict",
    "cinderEdict",
    "cutEdict",
    "tendingEdict",
    "cupEdict",
    "draughtEdict",
    "wakeEdict",
    "processionEdict",
    "tollEdict",
    "veilEdict",
    "nightEdict",
    "chalice",
    "ossuary",
    "hymn",
    "vow",
    "vowStillness",
    "vowPoverty",
    "vowHunger",
    "vowEmber",
    "quietCourt",
    "name1",
    "name2",
    "name3",
    "name4",
    "name5",
    "name6",
    "name7",
    "name8",
    "name9",
    "name10",
    "name11",
    "name12",
    "namesComplete"
  ];

  var CHRONICLE_LINES = {
    soul: "The first soul was drawn.",
    shade: "The first Shade was bound.",
    spirits: "Bound Spirits answered the well.",
    well: "The well was carved deeper.",
    vessels: "A vessel opened to house a will.",
    throne: "A throne was raised.",
    rite: "The first rite was cut.",
    cinders: "The cinders were cut.",
    urnRite: "The urn was cut.",
    hearthRite: "The hearth was cut.",
    wellDraw: "The well began to draw.",
    tribute: "Tribute was laid. The GodKing remembers.",
    aspect: "An aspect was sworn.",
    echo: "An echo was spoken.",
    seat: "A seat was raised.",
    lantern: "A lantern was kindled.",
    ash: "Ash gathered at the well's lip.",
    mark: "A mark was pressed.",
    censer: "A censer was raised.",
    pyre: "A pyre was raised.",
    urn: "An urn was raised.",
    hearth: "A hearth was kindled.",
    fetter: "A fetter was bound.",
    giftSouls: "A hundred souls. The well returned a gift.",
    giftShades: "Ten shades. One more was given.",
    giftVessel: "The first vessel. Ash remains.",
    giftTribute: "First tribute. The GodKing was generous.",
    giftThousand: "A thousand souls. The well returned a greater gift.",
    giftLantern: "The first lantern. The well returned ten souls.",
    giftCenser: "The first censer. Ash remains in the smoke.",
    giftFetter: "The first fetter. Two shades were given.",
    giftTenThousand: "Ten thousand souls. The well returned a greater gift.",
    giftThrone: "The first throne. A vessel was returned.",
    giftCrown: "The crown was generous.",
    giftFirstName: "The first name. The well returned fifteen souls.",
    giftFiveTributes: "Five tributes. The GodKing returned two Favor.",
    giftNamesComplete: "The names complete. The GodKing returned Favor.",
    giftFirstVeil: "The first veil. The well returned ten ash.",
    giftFirstWake: "The first wake. The well returned eight ash.",
    giftPeakLanterns: "Ten lanterns. The well returned twenty souls.",
    giftPeakFetters: "Eight fetters. The well returned fifteen shades.",
    giftPeakCensers: "Five censers. The well returned eight ash.",
    giftFirstPyre: "The first pyre. The well returned five ash.",
    giftFirstUrn: "The first urn. The well returned six ash.",
    giftFirstHearth: "The first hearth. The well returned eight ash.",
    giftEightTributes: "Eight emptyings. The well returned twenty-five souls.",
    giftPeakPyres: "Five pyres. The well returned ten ash.",
    giftPeakUrns: "Five urns. The well returned eight ash.",
    giftPeakHearths: "Five hearths. The well returned ten ash.",
    giftFirstCinders: "The first cinders. The well returned eight ash.",
    giftFirstUrnRite: "The first cut urn. The well returned six ash.",
    giftFirstHearthRite: "The first cut hearth. The well returned eight ash.",
    giftFirstChalice: "The first chalice. The well returned fifteen souls.",
    giftTwelveTributes: "Twelve emptyings. The well returned forty souls.",
    giftSixteenTributes: "Sixteen emptyings. The well returned fifty souls.",
    giftTwentyTributes: "Twenty emptyings. The well returned sixty souls.",
    giftTwentyFourTributes: "Twenty-four emptyings. The well returned seventy souls.",
    giftTwentyEightTributes: "Twenty-eight emptyings. The well returned eighty souls.",
    giftFullCup: "The cup was full. The well returned twenty-five souls.",
    giftThreeChalices: "Three chalices. The well returned ten ash.",
    giftFirstOssuary: "The first bone. The well returned ten souls.",
    giftFullOssuary: "Eight bones. The well returned twenty souls.",
    giftHundredDraws: "A hundred draws. The well returned fifteen souls.",
    giftTwoHundredDraws: "Two hundred draws. The well returned twenty souls.",
    giftThreeHundredDraws: "Three hundred draws. The well returned twenty-five souls.",
    giftFirstEmberVow: "The ember vow. The well returned eight ash.",
    giftTwoVows: "Two vows remembered. The well returned ten souls.",
    giftThreeVows: "Three vows remembered. The well returned fifteen souls.",
    giftAllVows: "Four vows remembered. The well returned twenty-five souls.",
    giftFirstProcession: "The first procession. The well returned five souls.",
    giftFirstLongerProcession: "The first longer walk. The well returned five souls.",
    giftFirstDeeperToll: "The first longer toll. The well returned five souls.",
    giftFirstLongerWake: "The first longer wake. The well returned five souls.",
    giftFirstLongerTithe: "The first longer tithe. The well returned five souls.",
    giftFirstLongerVeil: "The first longer veil. The well returned five souls.",
    giftFirstLongerHymn: "The first longer hymn. The well returned five souls.",
    giftFirstToll: "The first toll. The well returned ten souls.",
    choir: "The choir of ash was raised.",
    veil: "The veil thinned.",
    toll: "The toll was sounded.",
    wake: "The wake was kept.",
    procession: "The procession began.",
    longerProcession: "The walk was lengthened.",
    deeperToll: "The toll was lengthened.",
    longerWake: "The wake was lengthened.",
    longerTithe: "The tithe was lengthened.",
    longerVeil: "The veil was lengthened.",
    longerHymn: "The hymn was lengthened.",
    choirEdict: "The choir was spoken.",
    hymnEdict: "The hymn was spoken.",
    smokeEdict: "The smoke was spoken.",
    embersEdict: "The embers were spoken.",
    urnEdict: "The urn was spoken.",
    hearthEdict: "The hearth was spoken.",
    cinderEdict: "The cinders were spoken.",
    cutEdict: "The cut was spoken.",
    tendingEdict: "The tending was spoken.",
    cupEdict: "The cup was spoken.",
    draughtEdict: "The draught was spoken.",
    wakeEdict: "The wake was spoken.",
    processionEdict: "The procession was spoken.",
    tollEdict: "The toll was spoken.",
    veilEdict: "The veil was spoken.",
    nightEdict: "The night was spoken.",
    chalice: "A chalice was raised.",
    ossuary: "A bone was laid.",
    hymn: "A hymn followed the emptying.",
    vow: "A vow was sworn.",
    vowStillness: "A stillness vow was sworn.",
    vowPoverty: "A poverty vow was sworn.",
    vowHunger: "A hunger vow was sworn.",
    vowEmber: "An ember vow was sworn.",
    quietCourt: "The Quiet Court was seated.",
    name1: "The First Siphon.",
    name2: "The Quiet Chain.",
    name3: "The Hollow Tithe.",
    name4: "The Bound Echo.",
    name5: "The Ashen Mouth.",
    name6: "The Night Levy.",
    name7: "The Well's Hunger.",
    name8: "The Seat Unseen.",
    name9: "The Kindled Fetter.",
    name10: "The Crown's Shadow.",
    name11: "The Last Vessel.",
    name12: "The Name He Keeps.",
    namesComplete: "The names of the bound were spoken."
  };

  function formatGoalNum(n) {
    if (typeof SoulgatherFormat !== "undefined" && SoulgatherFormat.formatNumber) {
      return SoulgatherFormat.formatNumber(n);
    }
    if (n && typeof n === "object" && typeof n.m === "number") {
      n = nVal(n);
    }
    if (n == null || !isFinite(n)) return "0";
    if (Math.abs(n - Math.round(n)) < 0.05) return String(Math.round(n));
    return Number(n).toFixed(1);
  }

  function nextGoal(view, format) {
    view = view || {};
    format = format || formatGoalNum;
    var shades = nVal(view.shades);
    var spirits = nVal(view.spirits);
    var lifetimeSouls = nVal(view.lifetimeSouls);
    var lifetimeShades = nVal(view.lifetimeShades);
    var lanterns = nVal(view.lanterns);
    var censers = nVal(view.censers);
    var pyres = nVal(view.pyres);
    var urns = nVal(view.urns);
    var hearths = nVal(view.hearths);
    var fetters = nVal(view.fetters);
    var chalices = Number(view.chalices) || 0;
    var unlockedSpirits = !!view.unlockedSpirits;
    var unlockedVessels = !!view.unlockedVessels;
    var unlockedThrones = !!view.unlockedThrones;
    var favorEarned = Number(view.favorEarned) || 0;
    var gain = favorGain(view.lifetimeSouls);
    var sworn = normalizeAspect(view.aspect);
    var marksBought =
      (Number(view.emberLevel) || 0) +
      (Number(view.chainLevel) || 0) +
      (Number(view.hollowLevel) || 0);

    if (favorEarned >= 1 && !sworn) {
      return "Swear an Aspect. The GodKing waits.";
    }

    if (shades < 1 && lifetimeShades < 1 && !unlockedSpirits) {
      return "Bind a Shade to wake the well.";
    }
    if (!unlockedSpirits) {
      if (view.unlockedLanterns && lanterns < 1) {
        return "Kindle a Lantern. A light for the echoes.";
      }
      return (
        "The well thickens. Bound Spirits at 10 Shades. " +
        format(view.shades != null ? view.shades : shades) +
        " / 10 Shades"
      );
    }
    if (!unlockedVessels) {
      if (view.unlockedFetters && fetters < 1) {
        return "Bind a Fetter. A chain that teaches the will to pull.";
      }
      return "Vessels at 5 Bound Spirits. " + format(view.spirits != null ? view.spirits : spirits) + " / 5";
    }
    if (!unlockedThrones) {
      return "A throne at 1 Vessel.";
    }
    if (gain >= 1) {
      return "Lay Tribute. The GodKing will remember.";
    }
    if (view.unlockedLanterns && lanterns < 1) {
      return "Kindle a Lantern. A light for the echoes.";
    }
    if (view.unlockedFetters && fetters < 1) {
      return "Bind a Fetter. A chain that teaches the will to pull.";
    }
    if (view.unlockedMarks && marksBought < 1) {
      return "Press a Mark. Ash is what the well will not keep.";
    }
    if (view.unlockedCensers && censers < 1) {
      return "Raise a Censer. They burn what the well discards.";
    }
    if (view.unlockedPyres && pyres < 1) {
      return "Raise a Pyre. A pyre for what remains.";
    }
    if (view.unlockedUrns && urns < 1) {
      return "Raise an Urn. What the fire would not finish.";
    }
    if (view.unlockedHearths && hearths < 1) {
      return "Kindle a Hearth. The last heat.";
    }
    if (view.unlockedChalices && chalices < 1) {
      return "Raise a Chalice. He drinks from the emptied well.";
    }
    if (favorEarned >= 1 && sworn && !normalizeVow(view.vow)) {
      return "A vow may be sworn.";
    }
    if (favorEarned >= 1) {
      return "The well gathers. Another Tribute at 25000 lifetime Souls this run.";
    }
    return (
      "Tribute when the GodKing will remember. " +
      format(view.lifetimeSouls != null ? view.lifetimeSouls : lifetimeSouls) +
      " / 25000 lifetime Souls."
    );
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

  function hasChronicle(id) {
    if (!state.chronicle) return false;
    var i;
    for (i = 0; i < state.chronicle.length; i++) {
      if (state.chronicle[i].id === id) return true;
    }
    return false;
  }

  function chronicleAt() {
    var tn = N.toNumber(state.lifetimeSouls);
    if (!isFinite(tn) || tn < 0) return 0;
    return tn;
  }

  function markChronicle(id) {
    if (!state.chronicle) state.chronicle = [];
    if (!CHRONICLE_LINES[id] || hasChronicle(id)) return false;
    state.chronicle.push({ id: id, at: chronicleAt() });
    return true;
  }

  function syncChronicle() {
    var added = false;
    if (N.cmp(state.lifetimeSouls, 0) > 0 || (Number(state.favorEarned) || 0) >= 1) {
      if (markChronicle("soul")) added = true;
    }
    if (
      N.cmp(state.shades, 1) >= 0 ||
      N.cmp(state.lifetimeShades, 1) >= 0 ||
      (Number(state.wellDepth) || 0) >= 1
    ) {
      if (markChronicle("shade")) added = true;
    }
    if (state.unlockedSpirits) {
      if (markChronicle("spirits")) added = true;
    }
    if ((Number(state.wellDepth) || 0) >= 1) {
      if (markChronicle("well")) added = true;
    }
    if (state.unlockedVessels) {
      if (markChronicle("vessels")) added = true;
    }
    if ((Number(state.thrones) || 0) >= 1) {
      if (markChronicle("throne")) added = true;
    }
    if ((Number(state.favorEarned) || 0) >= 1) {
      if (markChronicle("tribute")) added = true;
    }
    if ((Number(state.siphonLevel) || 0) >= 1 || (Number(state.levyLevel) || 0) >= 1) {
      if (markChronicle("rite")) added = true;
    }
    if ((Number(state.cinderLevel) || 0) >= 1) {
      if (markChronicle("cinders")) added = true;
    }
    if ((Number(state.urnRiteLevel) || 0) >= 1) {
      if (markChronicle("urnRite")) added = true;
    }
    if ((Number(state.hearthRiteLevel) || 0) >= 1) {
      if (markChronicle("hearthRite")) added = true;
    }
    if (state.wellDraws) {
      if (markChronicle("wellDraw")) added = true;
    }
    if (normalizeAspect(state.aspect)) {
      if (markChronicle("aspect")) added = true;
    }
    if ((Number(state.echoLevel) || 0) >= 1) {
      if (markChronicle("echo")) added = true;
    }
    if ((Number(state.seatLevel) || 0) >= 1) {
      if (markChronicle("seat")) added = true;
    }
    if (N.cmp(state.lanterns, 1) >= 0) {
      if (markChronicle("lantern")) added = true;
    }
    if (N.cmp(state.ash, 0) > 0) {
      if (markChronicle("ash")) added = true;
    }
    if (
      (Number(state.emberLevel) || 0) >= 1 ||
      (Number(state.chainLevel) || 0) >= 1 ||
      (Number(state.hollowLevel) || 0) >= 1
    ) {
      if (markChronicle("mark")) added = true;
    }
    if (N.cmp(state.censers, 1) >= 0) {
      if (markChronicle("censer")) added = true;
    }
    if (N.cmp(state.pyres, 1) >= 0) {
      if (markChronicle("pyre")) added = true;
    }
    if (N.cmp(state.urns, 1) >= 0) {
      if (markChronicle("urn")) added = true;
    }
    if (N.cmp(state.hearths, 1) >= 0) {
      if (markChronicle("hearth")) added = true;
    }
    if (N.cmp(state.fetters, 1) >= 0) {
      if (markChronicle("fetter")) added = true;
    }
    if (normalizeVow(state.vow)) {
      if (markChronicle("vow")) added = true;
    }
    if (normalizeVow(state.vow) === "stillness") {
      if (markChronicle("vowStillness")) added = true;
    }
    if (normalizeVow(state.vow) === "poverty") {
      if (markChronicle("vowPoverty")) added = true;
    }
    if (normalizeVow(state.vow) === "hunger") {
      if (markChronicle("vowHunger")) added = true;
    }
    if (normalizeVow(state.vow) === "ember") {
      if (markChronicle("vowEmber")) added = true;
    }
    if ((Number(state.quietCourtLevel) || 0) >= 1) {
      if (markChronicle("quietCourt")) added = true;
    }
    if ((Number(state.choirLevel) || 0) >= 1) {
      if (markChronicle("choir")) added = true;
    }
    if ((Number(state.choirEdictLevel) || 0) >= 1) {
      if (markChronicle("choirEdict")) added = true;
    }
    if ((Number(state.hymnEdictLevel) || 0) >= 1) {
      if (markChronicle("hymnEdict")) added = true;
    }
    if ((Number(state.smokeEdictLevel) || 0) >= 1) {
      if (markChronicle("smokeEdict")) added = true;
    }
    if ((Number(state.embersEdictLevel) || 0) >= 1) {
      if (markChronicle("embersEdict")) added = true;
    }
    if ((Number(state.urnEdictLevel) || 0) >= 1) {
      if (markChronicle("urnEdict")) added = true;
    }
    if ((Number(state.hearthEdictLevel) || 0) >= 1) {
      if (markChronicle("hearthEdict")) added = true;
    }
    if ((Number(state.cinderEdictLevel) || 0) >= 1) {
      if (markChronicle("cinderEdict")) added = true;
    }
    if ((Number(state.cutEdictLevel) || 0) >= 1) {
      if (markChronicle("cutEdict")) added = true;
    }
    if ((Number(state.tendingEdictLevel) || 0) >= 1) {
      if (markChronicle("tendingEdict")) added = true;
    }
    if ((Number(state.cupEdictLevel) || 0) >= 1) {
      if (markChronicle("cupEdict")) added = true;
    }
    if ((Number(state.draughtEdictLevel) || 0) >= 1) {
      if (markChronicle("draughtEdict")) added = true;
    }
    if ((Number(state.wakeEdictLevel) || 0) >= 1) {
      if (markChronicle("wakeEdict")) added = true;
    }
    if ((Number(state.processionEdictLevel) || 0) >= 1) {
      if (markChronicle("processionEdict")) added = true;
    }
    if ((Number(state.tollEdictLevel) || 0) >= 1) {
      if (markChronicle("tollEdict")) added = true;
    }
    if ((Number(state.veilEdictLevel) || 0) >= 1) {
      if (markChronicle("veilEdict")) added = true;
    }
    if ((Number(state.nightEdictLevel) || 0) >= 1) {
      if (markChronicle("nightEdict")) added = true;
    }
    if ((Number(state.chalices) || 0) >= 1) {
      if (markChronicle("chalice")) added = true;
    }
    if ((Number(state.ossuaryLevel) || 0) >= 1) {
      if (markChronicle("ossuary")) added = true;
    }
    if ((Number(state.longerProcessionLevel) || 0) >= 1) {
      if (markChronicle("longerProcession")) added = true;
    }
    if ((Number(state.deeperTollLevel) || 0) >= 1) {
      if (markChronicle("deeperToll")) added = true;
    }
    if ((Number(state.longerWakeLevel) || 0) >= 1) {
      if (markChronicle("longerWake")) added = true;
    }
    if ((Number(state.longerTitheLevel) || 0) >= 1) {
      if (markChronicle("longerTithe")) added = true;
    }
    if ((Number(state.longerVeilLevel) || 0) >= 1) {
      if (markChronicle("longerVeil")) added = true;
    }
    if ((Number(state.longerHymnLevel) || 0) >= 1) {
      if (markChronicle("longerHymn")) added = true;
    }
    if ((Number(state.hymnLeft) || 0) > 0) {
      if (markChronicle("hymn")) added = true;
    }
    if ((Number(state.veilLeft) || 0) > 0) {
      if (markChronicle("veil")) added = true;
    }
    if ((Number(state.tollLeft) || 0) > 0) {
      if (markChronicle("toll")) added = true;
    }
    if ((Number(state.wakeLeft) || 0) > 0) {
      if (markChronicle("wake")) added = true;
    }
    if ((Number(state.processionLeft) || 0) > 0) {
      if (markChronicle("procession")) added = true;
    }
    var namesN = Math.max(0, Math.min(12, Math.floor(Number(state.namesBound) || 0)));
    var ni;
    for (ni = 1; ni <= namesN; ni++) {
      if (markChronicle("name" + ni)) added = true;
    }
    if (namesN >= 12 || state.namesComplete) {
      if (markChronicle("namesComplete")) added = true;
    }
    return added;
  }

  function isTypingTarget(el) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function freshState() {
    return {
      souls: N.fromNumber(0),
      lifetimeSouls: N.fromNumber(0),
      lifetimeShades: N.fromNumber(0),
      lifetimeSpirits: N.fromNumber(0),
      shades: N.fromNumber(0),
      spirits: N.fromNumber(0),
      vessels: N.fromNumber(0),
      thrones: 0,
      chalices: 0,
      wellDepth: 0,
      lanterns: N.fromNumber(0),
      ash: N.fromNumber(0),
      censers: N.fromNumber(0),
      pyres: N.fromNumber(0),
      urns: N.fromNumber(0),
      hearths: N.fromNumber(0),
      fetters: N.fromNumber(0),
      emberLevel: 0,
      chainLevel: 0,
      hollowLevel: 0,
      unlockedSpirits: false,
      unlockedVessels: false,
      unlockedWell: false,
      unlockedThrones: false,
      unlockedChalices: false,
      unlockedLanterns: false,
      unlockedMarks: false,
      unlockedCensers: false,
      unlockedPyres: false,
      unlockedUrns: false,
      unlockedHearths: false,
      unlockedFetters: false,
      unlockedAutobind: false,
      unlockedAutobindSpirits: false,
      unlockedAutobindVessels: false,
      unlockedAutobindLanterns: false,
      unlockedAutobindFetters: false,
      unlockedAutobindCensers: false,
      unlockedAutobindThrones: false,
      unlockedAutobindPyres: false,
      unlockedAutobindChalices: false,
      unlockedAutobindUrns: false,
      unlockedAutobindHearths: false,
      unlockedNightTithe: false,
      unlockedVeil: false,
      unlockedWake: false,
      unlockedToll: false,
      toastShown: false,
      vesselToastShown: false,
      throneToastShown: false,
      lanternToastShown: false,
      censerToastShown: false,
      favor: 0,
      favorEarned: 0,
      edictLevel: 0,
      memoryLevel: 0,
      echoLevel: 0,
      seatLevel: 0,
      kindleLevel: 0,
      ashenLevel: 0,
      depthLevel: 0,
      buyMode: "1",
      siphonLevel: 0,
      levyLevel: 0,
      cinderLevel: 0,
      urnRiteLevel: 0,
      hearthRiteLevel: 0,
      wellDraws: false,
      unlockedWellDraws: false,
      aspect: "",
      lastTick: Date.now(),
      chronicle: [],
      titheLeft: 0,
      nightLeft: 0,
      tithePaid: false,
      autobind: false,
      autobindSpirits: false,
      autobindVessels: false,
      autobindLanterns: false,
      autobindFetters: false,
      autobindCensers: false,
      autobindThrones: false,
      autobindPyres: false,
      autobindChalices: false,
      autobindUrns: false,
      autobindHearths: false,
      clicksThisRun: 0,
      veilLeft: 0,
      tollLeft: 0,
      wakeLeft: 0,
      processionLeft: 0,
      peakShades: N.fromNumber(0),
      peakLanterns: N.fromNumber(0),
      peakFetters: N.fromNumber(0),
      peakCensers: N.fromNumber(0),
      peakPyres: N.fromNumber(0),
      peakUrns: N.fromNumber(0),
      peakHearths: N.fromNumber(0),
      bonusLifetimeSouls: false,
      bonusPeakShades: false,
      bonusFirstVessel: false,
      bonusFirstTribute: false,
      bonusThousandSouls: false,
      bonusFirstLantern: false,
      bonusFirstCenser: false,
      bonusFirstFetter: false,
      bonusTenThousandSouls: false,
      bonusFirstThrone: false,
      giftCrown: false,
      giftFirstName: false,
      giftFiveTributes: false,
      giftNamesComplete: false,
      giftFirstVeil: false,
      giftFirstWake: false,
      giftPeakLanterns: false,
      giftPeakFetters: false,
      giftPeakCensers: false,
      giftFirstPyre: false,
      giftFirstUrn: false,
      giftFirstHearth: false,
      giftEightTributes: false,
      giftPeakPyres: false,
      giftPeakUrns: false,
      giftPeakHearths: false,
      giftFirstCinders: false,
      giftFirstUrnRite: false,
      giftFirstHearthRite: false,
      giftFirstChalice: false,
      giftTwelveTributes: false,
      giftSixteenTributes: false,
      giftTwentyTributes: false,
      giftTwentyFourTributes: false,
      giftTwentyEightTributes: false,
      giftFullCup: false,
      giftThreeChalices: false,
      giftFirstOssuary: false,
      giftFullOssuary: false,
      giftHundredDraws: false,
      giftTwoHundredDraws: false,
      giftThreeHundredDraws: false,
      giftFirstEmberVow: false,
      giftTwoVows: false,
      giftThreeVows: false,
      giftAllVows: false,
      giftFirstProcession: false,
      giftFirstLongerProcession: false,
      giftFirstDeeperToll: false,
      giftFirstLongerWake: false,
      giftFirstLongerTithe: false,
      giftFirstLongerVeil: false,
      giftFirstLongerHymn: false,
      giftFirstToll: false,
      choirLevel: 0,
      unlockedChoir: false,
      choirEdictLevel: 0,
      hymnEdictLevel: 0,
      smokeEdictLevel: 0,
      embersEdictLevel: 0,
      urnEdictLevel: 0,
      hearthEdictLevel: 0,
      cinderEdictLevel: 0,
      cutEdictLevel: 0,
      tendingEdictLevel: 0,
      cupEdictLevel: 0,
      draughtEdictLevel: 0,
      wakeEdictLevel: 0,
      processionEdictLevel: 0,
      tollEdictLevel: 0,
      veilEdictLevel: 0,
      nightEdictLevel: 0,
      hymnLeft: 0,
      crownWeight: 0,
      longMemoryLevel: 0,
      quietCourtLevel: 0,
      namesBound: 0,
      namesComplete: false,
      remembrance: 0,
      deeperNightLevel: 0,
      ashenTideLevel: 0,
      ossuaryLevel: 0,
      longerProcessionLevel: 0,
      deeperTollLevel: 0,
      longerWakeLevel: 0,
      longerTitheLevel: 0,
      longerVeilLevel: 0,
      longerHymnLevel: 0,
      vow: "",
      vowHungerPaid: false,
      vowsKnown: emptyVowsKnown(),
      runStartedAt: Date.now(),
      allTimeSouls: N.fromNumber(0),
      tributesLaid: 0
    };
  }

  var state = freshState();
  var lastFrame = 0;
  var toastTimer = 0;
  var toastQueue = [];
  var toastActive = false;
  var toastHold = false;
  var pendingAwayToast = null;
  var els = {};

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function currentMult() {
    return (
      prodMult(
        state.favorEarned,
        state.thrones,
        state.edictLevel,
        throneWeight(normalizeAspect(state.aspect) === "dominion"),
        state.crownWeight,
        state.namesComplete,
        state.chalices,
        state.ossuaryLevel
      ) * processionMult(processionActive())
    );
  }

  function titheActive() {
    return (Number(state.titheLeft) || 0) > 0;
  }

  function nightActive() {
    return (Number(state.nightLeft) || 0) > 0;
  }

  function hymnActive() {
    return (Number(state.hymnLeft) || 0) > 0;
  }

  function veilActive() {
    return (Number(state.veilLeft) || 0) > 0;
  }

  function tollActive() {
    return (Number(state.tollLeft) || 0) > 0;
  }

  function wakeActive() {
    return (Number(state.wakeLeft) || 0) > 0;
  }

  function processionActive() {
    return (Number(state.processionLeft) || 0) > 0;
  }

  function rateMult() {
    return currentMult() * titheMult(titheActive());
  }

  function clickPower() {
    return N.mul(
      N.mul(
        N.mul(1 + (Number(state.wellDepth) || 0), rateMult()),
        veilMult(veilActive())
      ),
      tollMult(tollActive())
    );
  }

  function shadeSoulsPerSec() {
    var base = N.mul(
      N.mul(
        N.mul(
          N.mul(
            N.mul(
              N.mul(N.mul(state.shades, SHADE_SOULS_PER_SEC), rateMult()),
              siphonMult(state.siphonLevel)
            ),
            harvestMult(normalizeAspect(state.aspect) === "harvest")
          ),
          lanternMult(state.lanterns)
        ),
        emberMult(state.emberLevel)
      ),
      nightMult(nightActive())
    );
    return N.mul(
      base,
      hymnMult(hymnActive())
    );
  }

  function soulsPerSec() {
    var rate = shadeSoulsPerSec();
    if (state.wellDraws) rate = N.add(rate, clickPower());
    return rate;
  }

  function shadesPerSec() {
    var base = N.mul(
      N.mul(
        N.mul(
          N.mul(
            N.mul(N.mul(state.spirits, SPIRIT_SHADES_PER_SEC), rateMult()),
            levyMult(state.levyLevel)
          ),
          bindingMult(normalizeAspect(state.aspect) === "binding")
        ),
        chainMult(state.chainLevel)
      ),
      fetterMult(state.fetters)
    );
    return N.mul(base, hymnMult(hymnActive()));
  }

  function spiritsPerSec() {
    return N.mul(
      N.mul(N.mul(state.vessels, VESSEL_SPIRITS_PER_SEC), rateMult()),
      hollowMult(state.hollowLevel)
    );
  }

  function ashPerSec() {
    var fromShades = N.mul(shadeSoulsPerSec(), ashFromShadeFrac(state.ashenTideLevel, state.choirLevel));
    var fromCensers = N.mul(
      N.mul(
        N.mul(
          N.mul(N.mul(state.censers, CENSER_ASH_PER_SEC), rateMult()),
          nightMult(nightActive())
        ),
        hymnMult(hymnActive())
      ),
      wakeMult(wakeActive())
    );
    var fromPyres = N.mul(
      N.mul(
        N.mul(
          N.mul(
            N.mul(N.mul(state.pyres, PYRE_ASH_PER_SEC), rateMult()),
            nightMult(nightActive())
          ),
          hymnMult(hymnActive())
        ),
        cinderMult(state.cinderLevel)
      ),
      wakeMult(wakeActive())
    );
    var fromUrns = N.mul(
      N.mul(
        N.mul(
          N.mul(
            N.mul(N.mul(state.urns, URN_ASH_PER_SEC), rateMult()),
            nightMult(nightActive())
          ),
          hymnMult(hymnActive())
        ),
        urnRiteMult(state.urnRiteLevel)
      ),
      wakeMult(wakeActive())
    );
    var fromHearths = N.mul(
      N.mul(
        N.mul(
          N.mul(
            N.mul(N.mul(state.hearths, HEARTH_ASH_PER_SEC), rateMult()),
            nightMult(nightActive())
          ),
          hymnMult(hymnActive())
        ),
        hearthRiteMult(state.hearthRiteLevel)
      ),
      wakeMult(wakeActive())
    );
    return N.add(N.add(N.add(N.add(fromShades, fromCensers), fromPyres), fromUrns), fromHearths);
  }

  function applyRates(dt) {
    var hadAsh = N.cmp(state.ash, 0) > 0;
    var dSouls = N.mul(shadeSoulsPerSec(), dt);
    if (state.wellDraws) {
      dSouls = N.add(dSouls, N.mul(clickPower(), dt));
    }
    state.souls = N.add(state.souls, dSouls);
    state.lifetimeSouls = N.add(state.lifetimeSouls, dSouls);
    state.allTimeSouls = N.add(state.allTimeSouls, dSouls);

    var dShades = N.mul(shadesPerSec(), dt);
    state.shades = N.add(state.shades, dShades);
    state.lifetimeShades = N.add(state.lifetimeShades, dShades);

    var dSpirits = N.mul(spiritsPerSec(), dt);
    state.spirits = N.add(state.spirits, dSpirits);
    state.lifetimeSpirits = N.add(state.lifetimeSpirits, dSpirits);

    var dAsh = N.mul(ashPerSec(), dt);
    state.ash = N.add(state.ash, dAsh);
    if (!hadAsh && N.cmp(state.ash, 0) > 0) {
      markChronicle("ash");
    }
  }

  function applyDt(dt, live) {
    if (dt <= 0 || !isFinite(dt)) return;
    dt = clamp(dt, 0, MAX_DT);

    var remaining = dt;
    while (remaining > 0) {
      var tithe = Number(state.titheLeft) || 0;
      if (tithe < 0) tithe = 0;
      var night = Number(state.nightLeft) || 0;
      if (night < 0) night = 0;
      var hymn = Number(state.hymnLeft) || 0;
      if (hymn < 0) hymn = 0;
      var veil = Number(state.veilLeft) || 0;
      if (veil < 0) veil = 0;
      var toll = Number(state.tollLeft) || 0;
      if (toll < 0) toll = 0;
      var wake = Number(state.wakeLeft) || 0;
      if (wake < 0) wake = 0;
      var procession = Number(state.processionLeft) || 0;
      if (procession < 0) procession = 0;
      var slice = remaining;
      if (tithe > 0 && tithe < slice) slice = tithe;
      if (night > 0 && night < slice) slice = night;
      if (hymn > 0 && hymn < slice) slice = hymn;
      if (veil > 0 && veil < slice) slice = veil;
      if (toll > 0 && toll < slice) slice = toll;
      if (wake > 0 && wake < slice) slice = wake;
      if (procession > 0 && procession < slice) slice = procession;
      applyRates(slice);
      if (tithe > 0) {
        state.titheLeft = tithe - slice;
        if (state.titheLeft < 0) state.titheLeft = 0;
      }
      if (night > 0) {
        state.nightLeft = night - slice;
        if (state.nightLeft < 0) state.nightLeft = 0;
      }
      if (hymn > 0) {
        state.hymnLeft = hymn - slice;
        if (state.hymnLeft < 0) state.hymnLeft = 0;
      }
      if (veil > 0) {
        state.veilLeft = veil - slice;
        if (state.veilLeft < 0) state.veilLeft = 0;
      }
      if (toll > 0) {
        state.tollLeft = toll - slice;
        if (state.tollLeft < 0) state.tollLeft = 0;
      }
      if (wake > 0) {
        state.wakeLeft = wake - slice;
        if (state.wakeLeft < 0) state.wakeLeft = 0;
      }
      if (procession > 0) {
        state.processionLeft = procession - slice;
        if (state.processionLeft < 0) state.processionLeft = 0;
      }
      remaining -= slice;
    }

    tryAutobind();
    tryAutobindSpirits();
    if (live) tryAutobindVessels();
    if (live) tryAutobindLanterns();
    if (live) tryAutobindFetters();
    if (live) tryAutobindCensers();
    if (live) tryAutobindThrones();
    if (live) tryAutobindPyres();
    if (live) tryAutobindUrns();
    if (live) tryAutobindHearths();
    if (live) tryAutobindChalices();
    checkUnlock();
  }

  function checkUnlock() {
    tryMilestoneGifts();

    if (!state.unlockedWell && N.cmp(state.shades, 1) >= 0) {
      state.unlockedWell = true;
      revealWell();
    }

    if (!state.unlockedLanterns && N.cmp(state.shades, UNLOCK_LANTERNS) >= 0) {
      state.unlockedLanterns = true;
      revealLanterns(true);
    }

    if (!state.unlockedSpirits) {
      if (N.cmp(state.shades, UNLOCK_SHADES) >= 0 || N.cmp(state.lifetimeSouls, UNLOCK_LIFETIME) >= 0) {
        state.unlockedSpirits = true;
        revealSpirits(true);
      }
    }

    if (!state.unlockedVessels) {
      if (
        N.cmp(state.spirits, UNLOCK_SPIRITS_FOR_VESSELS) >= 0 ||
        N.cmp(state.lifetimeShades, UNLOCK_LIFETIME_SHADES) >= 0
      ) {
        state.unlockedVessels = true;
        revealVessels(true);
      }
    }

    if (!state.unlockedThrones) {
      if (
        N.cmp(state.vessels, UNLOCK_VESSELS_FOR_THRONES) >= 0 ||
        N.cmp(state.lifetimeSpirits, UNLOCK_LIFETIME_SPIRITS) >= 0
      ) {
        state.unlockedThrones = true;
        revealThrones(true);
      }
    }

    if (!state.unlockedCensers) {
      if (
        N.cmp(state.vessels, UNLOCK_CENSERS_VESSELS) >= 0 ||
        N.cmp(state.lifetimeSpirits, UNLOCK_CENSERS_LIFETIME_SPIRITS) >= 0
      ) {
        state.unlockedCensers = true;
        revealCensers(true);
      }
    }

    if (!state.unlockedPyres) {
      if (N.cmp(state.censers, UNLOCK_PYRES) >= 0 || N.cmp(state.pyres, 1) >= 0) {
        state.unlockedPyres = true;
        revealPyres(true);
      }
    }

    if (!state.unlockedUrns) {
      if (N.cmp(state.pyres, UNLOCK_URNS) >= 0 || N.cmp(state.urns, 1) >= 0) {
        state.unlockedUrns = true;
        revealUrns(true);
      }
    }

    if (!state.unlockedHearths) {
      if (N.cmp(state.urns, UNLOCK_HEARTHS) >= 0 || N.cmp(state.hearths, 1) >= 0) {
        state.unlockedHearths = true;
        revealHearths(true);
      }
    }

    if (
      !state.unlockedMarks &&
      (N.cmp(state.ash, 1) >= 0 || N.cmp(state.lifetimeSouls, UNLOCK_MARKS_LIFETIME) >= 0)
    ) {
      state.unlockedMarks = true;
    }

    if (!state.unlockedWellDraws && N.cmp(state.shades, UNLOCK_WELL_DRAWS_SHADES) >= 0) {
      state.unlockedWellDraws = true;
    }

    if (!state.unlockedFetters && N.cmp(state.spirits, UNLOCK_FETTERS) >= 0) {
      state.unlockedFetters = true;
      revealFetters(true);
    }

    if (!state.unlockedAutobind && N.cmp(state.shades, UNLOCK_AUTOBIND_SHADES) >= 0) {
      state.unlockedAutobind = true;
    }

    if (!state.unlockedAutobindSpirits && N.cmp(state.spirits, UNLOCK_AUTOBIND_SPIRITS) >= 0) {
      state.unlockedAutobindSpirits = true;
    }

    if (!state.unlockedAutobindVessels && N.cmp(state.vessels, UNLOCK_AUTOBIND_VESSELS) >= 0) {
      state.unlockedAutobindVessels = true;
    }

    if (!state.unlockedAutobindLanterns && N.cmp(state.lanterns, UNLOCK_AUTOBIND_LANTERNS) >= 0) {
      state.unlockedAutobindLanterns = true;
    }

    if (!state.unlockedAutobindFetters && N.cmp(state.fetters, UNLOCK_AUTOBIND_FETTERS) >= 0) {
      state.unlockedAutobindFetters = true;
    }

    if (!state.unlockedAutobindCensers && N.cmp(state.censers, UNLOCK_AUTOBIND_CENSERS) >= 0) {
      state.unlockedAutobindCensers = true;
    }

    if (!state.unlockedAutobindThrones && (Number(state.thrones) || 0) >= UNLOCK_AUTOBIND_THRONES) {
      state.unlockedAutobindThrones = true;
    }

    if (!state.unlockedChalices) {
      if ((Number(state.thrones) || 0) >= UNLOCK_CHALICES || (Number(state.chalices) || 0) >= 1) {
        state.unlockedChalices = true;
        revealChalices(true);
      }
    }

    if (!state.unlockedAutobindPyres && N.cmp(state.pyres, UNLOCK_AUTOBIND_PYRES) >= 0) {
      state.unlockedAutobindPyres = true;
    }

    if (!state.unlockedAutobindUrns && N.cmp(state.urns, UNLOCK_AUTOBIND_URNS) >= 0) {
      state.unlockedAutobindUrns = true;
    }

    if (!state.unlockedAutobindHearths && N.cmp(state.hearths, UNLOCK_AUTOBIND_HEARTHS) >= 0) {
      state.unlockedAutobindHearths = true;
    }

    if (!state.unlockedAutobindChalices && (Number(state.chalices) || 0) >= UNLOCK_AUTOBIND_CHALICES) {
      state.unlockedAutobindChalices = true;
    }

    if (!state.unlockedVeil && ((Number(state.clicksThisRun) || 0) >= UNLOCK_VEIL_CLICKS || (Number(state.veilLeft) || 0) > 0)) {
      state.unlockedVeil = true;
    }

    if (!state.unlockedToll && ((Number(state.clicksThisRun) || 0) >= UNLOCK_TOLL_CLICKS || (Number(state.tollLeft) || 0) > 0)) {
      state.unlockedToll = true;
    }

    if (!state.unlockedNightTithe) {
      if (state.tithePaid || N.cmp(state.lanterns, UNLOCK_NIGHT_LANTERNS) >= 0 || (Number(state.nightLeft) || 0) > 0) {
        state.unlockedNightTithe = true;
      }
    }

    if (!state.unlockedWake) {
      if (state.unlockedPyres || N.cmp(state.ash, UNLOCK_WAKE_ASH) >= 0 || (Number(state.wakeLeft) || 0) > 0) {
        state.unlockedWake = true;
      }
    }

    if (!state.unlockedChoir) {
      if (
        N.cmp(state.lanterns, UNLOCK_CHOIR_LANTERNS) >= 0 ||
        N.cmp(state.ash, UNLOCK_CHOIR_ASH) >= 0 ||
        (Number(state.choirLevel) || 0) >= 1
      ) {
        state.unlockedChoir = true;
      }
    }
    syncChronicle();
  }

  function harvest() {
    if (normalizeVow(state.vow) === "stillness") return;
    state.clicksThisRun = (Number(state.clicksThisRun) || 0) + 1;
    var power = clickPower();
    state.souls = N.add(state.souls, power);
    state.lifetimeSouls = N.add(state.lifetimeSouls, power);
    state.allTimeSouls = N.add(state.allTimeSouls, power);
    checkUnlock();
    save();
    pulseGather();
    spawnRipple(power);
    render();
  }

  function purchasePlan(owned, currency, base, mult) {
    if (base == null) base = COST_BASE;
    if (mult == null) mult = COST_MULT;
    var one = N.cost(base, mult, owned);
    var mode = state.buyMode;
    if (mode === "10") {
      var cost10 = bulkCost(base, owned, 10, mult);
      return { k: 10, cost: cost10, can: N.cmp(currency, cost10) >= 0 };
    }
    if (mode === "max") {
      var k = maxAffordable(base, owned, currency, mult);
      if (k < 1) {
        return { k: 0, cost: one, can: false };
      }
      return { k: k, cost: bulkCost(base, owned, k, mult), can: true };
    }
    return { k: 1, cost: one, can: N.cmp(currency, one) >= 0 };
  }

  function buyWell() {
    if (!state.unlockedWell) return;
    var cost = wellCost(state.wellDepth);
    if (N.cmp(state.souls, cost) < 0) return;
    state.souls = N.sub(state.souls, cost);
    state.wellDepth += 1;
    syncChronicle();
    save();
    render();
  }

  function buyShade() {
    var plan = purchasePlan(state.shades, state.souls);
    if (!plan.can || plan.k < 1) return;
    state.souls = N.sub(state.souls, plan.cost);
    state.shades = N.add(state.shades, plan.k);
    state.lifetimeShades = N.add(state.lifetimeShades, plan.k);
    checkUnlock();
    save();
    render();
  }

  function buySpirit() {
    if (!state.unlockedSpirits) return;
    var plan = purchasePlan(state.spirits, state.shades);
    if (!plan.can || plan.k < 1) return;
    state.shades = N.sub(state.shades, plan.cost);
    state.spirits = N.add(state.spirits, plan.k);
    state.lifetimeSpirits = N.add(state.lifetimeSpirits, plan.k);
    checkUnlock();
    save();
    render();
  }

  function buyVessel() {
    if (!state.unlockedVessels) return;
    var plan = purchasePlan(state.vessels, state.spirits);
    if (!plan.can || plan.k < 1) return;
    state.spirits = N.sub(state.spirits, plan.cost);
    state.vessels = N.add(state.vessels, plan.k);
    checkUnlock();
    save();
    render();
  }

  function buyThrone() {
    if (!state.unlockedThrones) return;
    if (normalizeVow(state.vow) === "poverty") return;
    var plan = purchasePlan(state.thrones, state.vessels);
    if (!plan.can || plan.k < 1) return;
    state.vessels = N.sub(state.vessels, plan.cost);
    state.thrones += plan.k;
    checkUnlock();
    save();
    render();
  }

  function buyLantern() {
    if (!state.unlockedLanterns) return;
    var cost = lanternCost(state.lanterns);
    if (N.cmp(state.souls, cost) < 0) return;
    state.souls = N.sub(state.souls, cost);
    state.lanterns = N.add(state.lanterns, 1);
    if (!state.lanternToastShown) {
      state.lanternToastShown = true;
      showToast("A lantern kindles.");
    }
    markChronicle("lantern");
    checkUnlock();
    save();
    render();
  }

  function buyFetter() {
    if (!state.unlockedFetters) return;
    var cost = fetterCost(state.fetters);
    if (N.cmp(state.shades, cost) < 0) return;
    state.shades = N.sub(state.shades, cost);
    state.fetters = N.add(state.fetters, 1);
    markChronicle("fetter");
    checkUnlock();
    save();
    render();
  }

  function buyCenser() {
    if (!state.unlockedCensers) return;
    var cost = censerCost(state.censers);
    if (N.cmp(state.vessels, cost) < 0) return;
    state.vessels = N.sub(state.vessels, cost);
    state.censers = N.add(state.censers, 1);
    markChronicle("censer");
    checkUnlock();
    save();
    render();
  }

  function buyPyre() {
    if (!state.unlockedPyres) return;
    var plan = purchasePlan(state.pyres, state.censers, PYRE_COST_BASE, PYRE_COST_MULT);
    if (!plan.can || plan.k < 1) return;
    state.censers = N.sub(state.censers, plan.cost);
    state.pyres = N.add(state.pyres, plan.k);
    markChronicle("pyre");
    checkUnlock();
    save();
    render();
  }

  function buyUrn() {
    if (!state.unlockedUrns) return;
    var plan = purchasePlan(state.urns, state.pyres, URN_COST_BASE, URN_COST_MULT);
    if (!plan.can || plan.k < 1) return;
    state.pyres = N.sub(state.pyres, plan.cost);
    state.urns = N.add(state.urns, plan.k);
    markChronicle("urn");
    checkUnlock();
    save();
    render();
  }

  function buyHearth() {
    if (!state.unlockedHearths) return;
    var plan = purchasePlan(state.hearths, state.urns, HEARTH_COST_BASE, HEARTH_COST_MULT);
    if (!plan.can || plan.k < 1) return;
    state.urns = N.sub(state.urns, plan.cost);
    state.hearths = N.add(state.hearths, plan.k);
    markChronicle("hearth");
    checkUnlock();
    save();
    render();
  }

  function chalicePlan() {
    var owned = Math.max(0, Math.min(CHALICE_MAX, Math.floor(Number(state.chalices) || 0)));
    var room = CHALICE_MAX - owned;
    if (room <= 0) {
      return { k: 0, cost: N.fromNumber(0), can: false, capped: true, owned: owned };
    }
    var plan = purchasePlan(owned, state.ash, CHALICE_COST_BASE, CHALICE_COST_MULT);
    if (plan.k > room) {
      plan.k = room;
      plan.cost = bulkCost(CHALICE_COST_BASE, owned, room, CHALICE_COST_MULT);
      plan.can = N.cmp(state.ash, plan.cost) >= 0;
    }
    plan.capped = false;
    plan.owned = owned;
    return plan;
  }

  function buyChalice() {
    if (!state.unlockedChalices) return;
    var plan = chalicePlan();
    if (!plan.can || plan.k < 1) return;
    state.ash = N.sub(state.ash, plan.cost);
    state.chalices = plan.owned + plan.k;
    if (state.chalices > CHALICE_MAX) state.chalices = CHALICE_MAX;
    markChronicle("chalice");
    checkUnlock();
    save();
    render();
  }

  function buyMark(kind) {
    if (!state.unlockedMarks) return;
    var levelKey;
    if (kind === "ember") levelKey = "emberLevel";
    else if (kind === "chain") {
      if (!state.unlockedSpirits) return;
      levelKey = "chainLevel";
    } else if (kind === "hollow") {
      if (!state.unlockedVessels) return;
      levelKey = "hollowLevel";
    } else return;
    var cost = markCost(state[levelKey]);
    if (N.cmp(state.ash, cost) < 0) return;
    state.ash = N.sub(state.ash, cost);
    state[levelKey] += 1;
    markChronicle("mark");
    save();
    render();
  }

  function buyEdict() {
    var cost = edictCost(state.edictLevel);
    if (state.favor < cost) return;
    state.favor -= cost;
    state.edictLevel += 1;
    save();
    render();
  }

  function buyMemory() {
    var cost = memoryCost(state.memoryLevel);
    if (state.favor < cost) return;
    state.favor -= cost;
    state.memoryLevel += 1;
    save();
    render();
  }

  function buyEcho() {
    if ((Number(state.echoLevel) || 0) >= 1) return;
    var cost = echoCost(state.echoLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.echoLevel = 1;
    markChronicle("echo");
    save();
    render();
  }

  function buySeat() {
    var cost = seatCost(state.seatLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.seatLevel += 1;
    markChronicle("seat");
    save();
    render();
  }

  function buyKindle() {
    var cost = kindleCost(state.kindleLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.kindleLevel += 1;
    save();
    render();
  }

  function buyAshen() {
    var cost = ashenCost(state.ashenLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.ashenLevel += 1;
    save();
    render();
  }

  function buyDepth() {
    var cost = depthCost(state.depthLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.depthLevel += 1;
    save();
    render();
  }

  function buyChoirEdict() {
    var cost = choirEdictCost(state.choirEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.choirEdictLevel += 1;
    markChronicle("choirEdict");
    save();
    render();
  }

  function buyHymnEdict() {
    var cost = hymnEdictCost(state.hymnEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.hymnEdictLevel += 1;
    markChronicle("hymnEdict");
    save();
    render();
  }

  function buySmokeEdict() {
    var cost = smokeEdictCost(state.smokeEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.smokeEdictLevel += 1;
    markChronicle("smokeEdict");
    save();
    render();
  }

  function buyEmbersEdict() {
    var cost = embersEdictCost(state.embersEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.embersEdictLevel += 1;
    markChronicle("embersEdict");
    save();
    render();
  }

  function buyUrnEdict() {
    var cost = urnEdictCost(state.urnEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.urnEdictLevel += 1;
    markChronicle("urnEdict");
    save();
    render();
  }

  function buyHearthEdict() {
    var cost = hearthEdictCost(state.hearthEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.hearthEdictLevel += 1;
    markChronicle("hearthEdict");
    save();
    render();
  }

  function buyCinderEdict() {
    var cost = cinderEdictCost(state.cinderEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.cinderEdictLevel += 1;
    markChronicle("cinderEdict");
    save();
    render();
  }

  function buyCutEdict() {
    var cost = cutEdictCost(state.cutEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.cutEdictLevel += 1;
    markChronicle("cutEdict");
    save();
    render();
  }

  function buyTendingEdict() {
    var cost = tendingEdictCost(state.tendingEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.tendingEdictLevel += 1;
    markChronicle("tendingEdict");
    save();
    render();
  }

  function buyCupEdict() {
    var cost = cupEdictCost(state.cupEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.cupEdictLevel += 1;
    markChronicle("cupEdict");
    save();
    render();
  }

  function buyDraughtEdict() {
    var cost = draughtEdictCost(state.draughtEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.draughtEdictLevel += 1;
    markChronicle("draughtEdict");
    save();
    render();
  }

  function buyWakeEdict() {
    var cost = wakeEdictCost(state.wakeEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.wakeEdictLevel += 1;
    markChronicle("wakeEdict");
    save();
    render();
  }

  function buyProcessionEdict() {
    var cost = processionEdictCost(state.processionEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.processionEdictLevel += 1;
    markChronicle("processionEdict");
    save();
    render();
  }

  function buyTollEdict() {
    var cost = tollEdictCost(state.tollEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.tollEdictLevel += 1;
    markChronicle("tollEdict");
    save();
    render();
  }

  function buyVeilEdict() {
    var cost = veilEdictCost(state.veilEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.veilEdictLevel += 1;
    markChronicle("veilEdict");
    save();
    render();
  }

  function buyNightEdict() {
    var cost = nightEdictCost(state.nightEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.nightEdictLevel += 1;
    markChronicle("nightEdict");
    save();
    render();
  }

  function buySiphon() {
    var cost = siphonCost(state.siphonLevel);
    if (N.cmp(state.souls, cost) < 0) return;
    state.souls = N.sub(state.souls, cost);
    state.siphonLevel += 1;
    syncChronicle();
    save();
    render();
  }

  function buyLevy() {
    if (!state.unlockedSpirits) return;
    var cost = levyCost(state.levyLevel);
    if (N.cmp(state.shades, cost) < 0) return;
    state.shades = N.sub(state.shades, cost);
    state.levyLevel += 1;
    syncChronicle();
    save();
    render();
  }

  function buyCinders() {
    if (!state.unlockedPyres) return;
    var cost = N.fromNumber(CINDER_COST);
    if (N.cmp(state.ash, cost) < 0) return;
    state.ash = N.sub(state.ash, cost);
    state.cinderLevel += 1;
    markChronicle("cinders");
    syncChronicle();
    checkUnlock();
    save();
    render();
  }

  function buyUrnRite() {
    if (!state.unlockedUrns) return;
    var cost = N.fromNumber(URN_RITE_COST);
    if (N.cmp(state.ash, cost) < 0) return;
    state.ash = N.sub(state.ash, cost);
    state.urnRiteLevel += 1;
    markChronicle("urnRite");
    syncChronicle();
    checkUnlock();
    save();
    render();
  }

  function buyHearthRite() {
    if (!state.unlockedHearths) return;
    var cost = N.fromNumber(HEARTH_RITE_COST);
    if (N.cmp(state.ash, cost) < 0) return;
    state.ash = N.sub(state.ash, cost);
    state.hearthRiteLevel += 1;
    markChronicle("hearthRite");
    syncChronicle();
    checkUnlock();
    save();
    render();
  }

  function buyWellDraws() {
    if (state.wellDraws) return;
    if (!state.unlockedWellDraws && N.cmp(state.shades, UNLOCK_WELL_DRAWS_SHADES) < 0) return;
    if (N.cmp(state.souls, WELL_DRAWS_COST) < 0) return;
    state.souls = N.sub(state.souls, WELL_DRAWS_COST);
    state.wellDraws = true;
    state.unlockedWellDraws = true;
    syncChronicle();
    save();
    render();
  }

  function currentTitheCost() {
    var cost = titheCost(state.souls);
    if (normalizeVow(state.vow) === "hunger") {
      cost = N.mul(cost, 2);
    }
    return cost;
  }

  function payTithe() {
    if (!state.unlockedWell) return;
    if (titheActive()) return;
    var cost = currentTitheCost();
    if (N.cmp(state.souls, cost) < 0) return;
    state.souls = N.sub(state.souls, cost);
    state.titheLeft = paidTitheSecs(state.longerTitheLevel);
    state.tithePaid = true;
    if (normalizeVow(state.vow) === "hunger") {
      state.vowHungerPaid = true;
    }
    checkUnlock();
    showToast("The GodKing takes his cut.");
    save();
    render();
  }

  function payNightTithe() {
    if (normalizeVow(state.vow) === "ember") return;
    if (!state.unlockedNightTithe) return;
    if (nightActive()) return;
    if (N.cmp(state.ash, NIGHT_TITHE_MIN) < 0) return;
    var cost = nightTitheCost(state.ash);
    if (N.cmp(state.ash, cost) < 0) return;
    state.ash = N.sub(state.ash, cost);
    state.nightLeft = nightSecs(state.deeperNightLevel);
    showToast("The GodKing hungers at midnight.");
    save();
    render();
  }

  function keepWake() {
    if (normalizeVow(state.vow) === "ember") return;
    if (!state.unlockedWake) return;
    if (wakeActive()) return;
    var cost = N.fromNumber(WAKE_COST);
    if (N.cmp(state.ash, cost) < 0) return;
    state.ash = N.sub(state.ash, cost);
    state.wakeLeft = paidWakeSecs(state.longerWakeLevel);
    markChronicle("wake");
    if (!state.giftFirstWake) {
      state.giftFirstWake = true;
      state.ash = N.add(state.ash, 8);
      markChronicle("giftFirstWake");
      showToast("Eight ash for the first wake.");
    }
    showToast("The fire does not sleep.");
    save();
    render();
  }

  function toggleAutobind() {
    if (!state.unlockedAutobind) return;
    state.autobind = !state.autobind;
    save();
    render();
  }

  function tryAutobind() {
    if (!state.autobind) return;
    var cost = shadeCost(state.shades);
    if (N.cmp(state.souls, cost) < 0) return;
    state.souls = N.sub(state.souls, cost);
    state.shades = N.add(state.shades, 1);
    state.lifetimeShades = N.add(state.lifetimeShades, 1);
  }

  function toggleAutobindSpirits() {
    if (!state.unlockedAutobindSpirits) return;
    state.autobindSpirits = !state.autobindSpirits;
    save();
    render();
  }

  function tryAutobindSpirits() {
    if (!state.autobindSpirits) return;
    if (!state.unlockedSpirits) return;
    var cost = spiritCost(state.spirits);
    if (N.cmp(state.shades, cost) < 0) return;
    state.shades = N.sub(state.shades, cost);
    state.spirits = N.add(state.spirits, 1);
    state.lifetimeSpirits = N.add(state.lifetimeSpirits, 1);
  }

  function toggleAutobindVessels() {
    if (!state.unlockedAutobindVessels) return;
    state.autobindVessels = !state.autobindVessels;
    save();
    render();
  }

  function tryAutobindVessels() {
    if (!state.autobindVessels) return;
    if (!state.unlockedVessels) return;
    var cost = vesselCost(state.vessels);
    if (N.cmp(state.spirits, cost) < 0) return;
    state.spirits = N.sub(state.spirits, cost);
    state.vessels = N.add(state.vessels, 1);
  }

  function toggleAutobindLanterns() {
    if (!state.unlockedAutobindLanterns) return;
    state.autobindLanterns = !state.autobindLanterns;
    save();
    render();
  }

  function tryAutobindLanterns() {
    if (!state.autobindLanterns) return;
    if (!state.unlockedLanterns) return;
    var cost = lanternCost(state.lanterns);
    if (N.cmp(state.souls, cost) < 0) return;
    state.souls = N.sub(state.souls, cost);
    state.lanterns = N.add(state.lanterns, 1);
  }

  function toggleAutobindFetters() {
    if (!state.unlockedAutobindFetters) return;
    state.autobindFetters = !state.autobindFetters;
    save();
    render();
  }

  function tryAutobindFetters() {
    if (!state.autobindFetters) return;
    if (!state.unlockedFetters) return;
    var cost = fetterCost(state.fetters);
    if (N.cmp(state.shades, cost) < 0) return;
    state.shades = N.sub(state.shades, cost);
    state.fetters = N.add(state.fetters, 1);
  }

  function toggleAutobindCensers() {
    if (!state.unlockedAutobindCensers) return;
    state.autobindCensers = !state.autobindCensers;
    save();
    render();
  }

  function tryAutobindCensers() {
    /* No extra hold-back: autobind censers/thrones do not reserve Censers for a Pyre. */
    if (!state.autobindCensers) return;
    if (!state.unlockedCensers) return;
    var cost = censerCost(state.censers);
    if (N.cmp(state.vessels, cost) < 0) return;
    state.vessels = N.sub(state.vessels, cost);
    state.censers = N.add(state.censers, 1);
  }

  function toggleAutobindThrones() {
    if (!state.unlockedAutobindThrones) return;
    state.autobindThrones = !state.autobindThrones;
    save();
    render();
  }

  function tryAutobindThrones() {
    if (!state.autobindThrones) return;
    if (!state.unlockedThrones) return;
    if (normalizeVow(state.vow) === "poverty") return;
    var cost = throneCost(state.thrones);
    if (N.cmp(state.vessels, cost) < 0) return;
    state.vessels = N.sub(state.vessels, cost);
    state.thrones += 1;
  }

  function toggleAutobindPyres() {
    if (!state.unlockedAutobindPyres) return;
    state.autobindPyres = !state.autobindPyres;
    save();
    render();
  }

  function tryAutobindPyres() {
    if (!state.autobindPyres) return;
    if (!state.unlockedPyres) return;
    var cost = pyreCost(state.pyres);
    if (N.cmp(state.censers, cost) < 0) return;
    state.censers = N.sub(state.censers, cost);
    state.pyres = N.add(state.pyres, 1);
  }

  function toggleAutobindUrns() {
    if (!state.unlockedAutobindUrns) return;
    state.autobindUrns = !state.autobindUrns;
    save();
    render();
  }

  function tryAutobindUrns() {
    /* No extra hold-back: autobind urns spend Pyres; autobind pyres buy Pyres. */
    if (!state.autobindUrns) return;
    if (!state.unlockedUrns) return;
    var cost = urnCost(state.urns);
    if (N.cmp(state.pyres, cost) < 0) return;
    state.pyres = N.sub(state.pyres, cost);
    state.urns = N.add(state.urns, 1);
  }

  function toggleAutobindHearths() {
    if (!state.unlockedAutobindHearths) return;
    state.autobindHearths = !state.autobindHearths;
    save();
    render();
  }

  function tryAutobindHearths() {
    /* No extra hold-back vs saving Urns for a manual hearth. */
    if (!state.autobindHearths) return;
    if (!state.unlockedHearths) return;
    var cost = hearthCost(state.hearths);
    if (N.cmp(state.urns, cost) < 0) return;
    state.urns = N.sub(state.urns, cost);
    state.hearths = N.add(state.hearths, 1);
  }

  function toggleAutobindChalices() {
    if (!state.unlockedAutobindChalices) return;
    state.autobindChalices = !state.autobindChalices;
    save();
    render();
  }

  function tryAutobindChalices() {
    if (!state.autobindChalices) return;
    if (!state.unlockedChalices) return;
    var owned = Math.max(0, Math.min(CHALICE_MAX, Math.floor(Number(state.chalices) || 0)));
    if (owned >= CHALICE_MAX) return;
    var cost = chaliceCost(owned);
    if (N.cmp(state.ash, cost) < 0) return;
    state.ash = N.sub(state.ash, cost);
    state.chalices = owned + 1;
    if (state.chalices > CHALICE_MAX) state.chalices = CHALICE_MAX;
  }

  function soundToll() {
    if (!state.unlockedToll) return;
    if (tollActive()) return;
    var cost = N.fromNumber(TOLL_COST);
    if (N.cmp(state.souls, cost) < 0) return;
    state.souls = N.sub(state.souls, cost);
    state.tollLeft = paidTollSecs(state.deeperTollLevel);
    markChronicle("toll");
    if (!state.giftFirstToll) {
      state.giftFirstToll = true;
      state.souls = N.add(state.souls, 10);
      markChronicle("giftFirstToll");
      showToast("Ten souls for the first toll.");
    }
    showToast("The well answers twice.");
    save();
    render();
  }

  function thinVeil() {
    if (!state.unlockedVeil) return;
    if (veilActive()) return;
    if (N.cmp(state.ash, VEIL_MIN) < 0) return;
    var cost = veilCost(state.ash);
    if (N.cmp(state.ash, cost) < 0) return;
    state.ash = N.sub(state.ash, cost);
    state.veilLeft = paidVeilSecs(state.longerVeilLevel);
    markChronicle("veil");
    if (!state.giftFirstVeil) {
      state.giftFirstVeil = true;
      state.ash = N.add(state.ash, 10);
      markChronicle("giftFirstVeil");
      showToast("Ten ash for the first veil.");
    }
    showToast("The well's mouth is near.");
    save();
    render();
  }

  function bumpPeakShades() {
    state.peakShades = N.max(num(state.peakShades), num(state.shades));
  }

  function bumpPeakLanterns() {
    state.peakLanterns = N.max(num(state.peakLanterns), num(state.lanterns));
  }

  function bumpPeakFetters() {
    state.peakFetters = N.max(num(state.peakFetters), num(state.fetters));
  }

  function bumpPeakCensers() {
    state.peakCensers = N.max(num(state.peakCensers), num(state.censers));
  }

  function bumpPeakPyres() {
    state.peakPyres = N.max(num(state.peakPyres), num(state.pyres));
  }

  function bumpPeakUrns() {
    state.peakUrns = N.max(num(state.peakUrns), num(state.urns));
  }

  function bumpPeakHearths() {
    state.peakHearths = N.max(num(state.peakHearths), num(state.hearths));
  }

  function tryMilestoneGifts() {
    var granted = false;
    bumpPeakShades();
    bumpPeakLanterns();
    bumpPeakFetters();
    bumpPeakCensers();
    bumpPeakPyres();
    bumpPeakUrns();
    bumpPeakHearths();

    if (
      !state.bonusLifetimeSouls &&
      (N.cmp(state.lifetimeSouls, 100) >= 0 || N.cmp(state.allTimeSouls, 100) >= 0)
    ) {
      state.bonusLifetimeSouls = true;
      state.souls = N.add(state.souls, 50);
      markChronicle("giftSouls");
      showToast("The well returns fifty souls.");
      granted = true;
    }

    bumpPeakShades();
    if (!state.bonusPeakShades && N.cmp(state.peakShades, 10) >= 0) {
      state.bonusPeakShades = true;
      state.shades = N.add(state.shades, 1);
      state.lifetimeShades = N.add(state.lifetimeShades, 1);
      bumpPeakShades();
      markChronicle("giftShades");
      showToast("A shade is given, unbidden.");
      granted = true;
    }

    if (!state.bonusFirstVessel && N.cmp(state.vessels, 1) >= 0) {
      state.bonusFirstVessel = true;
      state.ash = N.add(state.ash, 3);
      markChronicle("giftVessel");
      showToast("Ash from the first vessel.");
      granted = true;
    }

    if (
      !state.bonusThousandSouls &&
      (N.cmp(state.lifetimeSouls, 1000) >= 0 || N.cmp(state.allTimeSouls, 1000) >= 0)
    ) {
      state.bonusThousandSouls = true;
      state.souls = N.add(state.souls, 200);
      markChronicle("giftThousand");
      showToast("The well returns two hundred souls.");
      granted = true;
    }

    if (!state.bonusFirstLantern && N.cmp(state.lanterns, 1) >= 0) {
      state.bonusFirstLantern = true;
      state.souls = N.add(state.souls, 10);
      markChronicle("giftLantern");
      showToast("Ten souls for the first lantern.");
      granted = true;
    }

    bumpPeakLanterns();
    if (!state.giftPeakLanterns && N.cmp(state.peakLanterns, 10) >= 0) {
      state.giftPeakLanterns = true;
      state.souls = N.add(state.souls, 20);
      markChronicle("giftPeakLanterns");
      showToast("Twenty souls for ten lanterns.");
      granted = true;
    }

    if (!state.bonusFirstCenser && N.cmp(state.censers, 1) >= 0) {
      state.bonusFirstCenser = true;
      state.ash = N.add(state.ash, 5);
      markChronicle("giftCenser");
      showToast("Ash from the first censer.");
      granted = true;
    }

    bumpPeakCensers();
    if (!state.giftPeakCensers && N.cmp(state.peakCensers, 5) >= 0) {
      state.giftPeakCensers = true;
      state.ash = N.add(state.ash, 8);
      markChronicle("giftPeakCensers");
      showToast("Eight ash for five censers.");
      granted = true;
    }

    bumpPeakPyres();
    if (!state.giftFirstPyre) {
      var hasPyreNow = N.cmp(state.pyres, 1) >= 0;
      var hasPyrePeak = N.cmp(state.peakPyres, 1) >= 0;
      var hasPyreChron = hasChronicle("pyre") || hasChronicle("giftFirstPyre");
      if (hasPyreNow || (hasPyrePeak && !hasPyreChron)) {
        state.giftFirstPyre = true;
        state.ash = N.add(state.ash, 5);
        markChronicle("giftFirstPyre");
        showToast("Five ash for the first pyre.");
        granted = true;
      }
    }

    bumpPeakPyres();
    if (!state.giftPeakPyres && N.cmp(state.peakPyres, 5) >= 0) {
      state.giftPeakPyres = true;
      state.ash = N.add(state.ash, 10);
      markChronicle("giftPeakPyres");
      showToast("Ten ash for five pyres.");
      granted = true;
    }

    bumpPeakUrns();
    if (!state.giftFirstUrn) {
      var hasUrnNow = N.cmp(state.urns, 1) >= 0;
      var hasUrnPeak = N.cmp(state.peakUrns, 1) >= 0;
      var hasUrnChron = hasChronicle("urn") || hasChronicle("giftFirstUrn");
      if (hasUrnNow || (hasUrnPeak && !hasUrnChron)) {
        state.giftFirstUrn = true;
        state.ash = N.add(state.ash, 6);
        markChronicle("giftFirstUrn");
        showToast("Six ash for the first urn.");
        granted = true;
      }
    }

    bumpPeakUrns();
    if (!state.giftPeakUrns && N.cmp(state.peakUrns, 5) >= 0) {
      state.giftPeakUrns = true;
      state.ash = N.add(state.ash, 8);
      markChronicle("giftPeakUrns");
      showToast("Eight ash for five urns.");
      granted = true;
    }

    bumpPeakHearths();
    if (!state.giftFirstHearth) {
      var hasHearthNow = N.cmp(state.hearths, 1) >= 0;
      var hasHearthPeak = N.cmp(state.peakHearths, 1) >= 0;
      var hasHearthChron = hasChronicle("hearth") || hasChronicle("giftFirstHearth");
      if (hasHearthNow || (hasHearthPeak && !hasHearthChron)) {
        state.giftFirstHearth = true;
        state.ash = N.add(state.ash, 8);
        markChronicle("giftFirstHearth");
        showToast("Eight ash for the first hearth.");
        granted = true;
      }
    }

    bumpPeakHearths();
    if (!state.giftPeakHearths && N.cmp(state.peakHearths, 5) >= 0) {
      state.giftPeakHearths = true;
      state.ash = N.add(state.ash, 10);
      markChronicle("giftPeakHearths");
      showToast("Ten ash for five hearths.");
      granted = true;
    }

    if (!state.giftFirstCinders && (Number(state.cinderLevel) || 0) >= 1) {
      state.giftFirstCinders = true;
      state.ash = N.add(state.ash, 8);
      markChronicle("giftFirstCinders");
      showToast("Eight ash for the first cinders.");
      granted = true;
    }

    if (!state.giftFirstUrnRite && (Number(state.urnRiteLevel) || 0) >= 1) {
      state.giftFirstUrnRite = true;
      state.ash = N.add(state.ash, 6);
      markChronicle("giftFirstUrnRite");
      showToast("Six ash for the first cut urn.");
      granted = true;
    }

    if (!state.giftFirstHearthRite && (Number(state.hearthRiteLevel) || 0) >= 1) {
      state.giftFirstHearthRite = true;
      state.ash = N.add(state.ash, 8);
      markChronicle("giftFirstHearthRite");
      showToast("Eight ash for the first cut hearth.");
      granted = true;
    }

    if (!state.giftFirstChalice && (Number(state.chalices) || 0) >= 1) {
      state.giftFirstChalice = true;
      state.souls = N.add(state.souls, 15);
      markChronicle("giftFirstChalice");
      showToast("Fifteen souls for the first chalice.");
      granted = true;
    }

    if (!state.giftThreeChalices && (Number(state.chalices) || 0) >= 3) {
      state.giftThreeChalices = true;
      state.ash = N.add(state.ash, 10);
      markChronicle("giftThreeChalices");
      showToast("Ten ash for three chalices.");
      granted = true;
    }

    if (!state.giftFullCup && (Number(state.chalices) || 0) >= CHALICE_MAX) {
      state.giftFullCup = true;
      state.souls = N.add(state.souls, 25);
      markChronicle("giftFullCup");
      showToast("Twenty-five souls for a full cup.");
      granted = true;
    }

    if (!state.giftFirstOssuary && (Number(state.ossuaryLevel) || 0) >= 1) {
      state.giftFirstOssuary = true;
      state.souls = N.add(state.souls, 10);
      markChronicle("giftFirstOssuary");
      showToast("Ten souls for the first bone.");
      granted = true;
    }

    if (!state.giftFirstLongerProcession && (Number(state.longerProcessionLevel) || 0) >= 1) {
      state.giftFirstLongerProcession = true;
      state.souls = N.add(state.souls, 5);
      markChronicle("giftFirstLongerProcession");
      showToast("Five souls for the longer walk.");
      granted = true;
    }

    if (!state.giftFirstDeeperToll && (Number(state.deeperTollLevel) || 0) >= 1) {
      state.giftFirstDeeperToll = true;
      state.souls = N.add(state.souls, 5);
      markChronicle("giftFirstDeeperToll");
      showToast("Five souls for the longer toll.");
      granted = true;
    }

    if (!state.giftFirstLongerWake && (Number(state.longerWakeLevel) || 0) >= 1) {
      state.giftFirstLongerWake = true;
      state.souls = N.add(state.souls, 5);
      markChronicle("giftFirstLongerWake");
      showToast("Five souls for the longer wake.");
      granted = true;
    }

    if (!state.giftFirstLongerTithe && (Number(state.longerTitheLevel) || 0) >= 1) {
      state.giftFirstLongerTithe = true;
      state.souls = N.add(state.souls, 5);
      markChronicle("giftFirstLongerTithe");
      showToast("Five souls for the longer tithe.");
      granted = true;
    }

    if (!state.giftFirstLongerVeil && (Number(state.longerVeilLevel) || 0) >= 1) {
      state.giftFirstLongerVeil = true;
      state.souls = N.add(state.souls, 5);
      markChronicle("giftFirstLongerVeil");
      showToast("Five souls for the longer veil.");
      granted = true;
    }

    if (!state.giftFirstLongerHymn && (Number(state.longerHymnLevel) || 0) >= 1) {
      state.giftFirstLongerHymn = true;
      state.souls = N.add(state.souls, 5);
      markChronicle("giftFirstLongerHymn");
      showToast("Five souls for the longer hymn.");
      granted = true;
    }

    if (!state.giftFullOssuary && (Number(state.ossuaryLevel) || 0) >= OSSUARY_MAX) {
      state.giftFullOssuary = true;
      state.souls = N.add(state.souls, 20);
      markChronicle("giftFullOssuary");
      showToast("Twenty souls for eight bones.");
      granted = true;
    }

    if (!state.giftHundredDraws && (Number(state.clicksThisRun) || 0) >= 100) {
      state.giftHundredDraws = true;
      state.souls = N.add(state.souls, 15);
      markChronicle("giftHundredDraws");
      showToast("Fifteen souls for a hundred draws.");
      granted = true;
    }

    if (!state.giftTwoHundredDraws && (Number(state.clicksThisRun) || 0) >= 200) {
      state.giftTwoHundredDraws = true;
      state.souls = N.add(state.souls, 20);
      markChronicle("giftTwoHundredDraws");
      showToast("Twenty souls for two hundred draws.");
      granted = true;
    }

    if (!state.giftThreeHundredDraws && (Number(state.clicksThisRun) || 0) >= 300) {
      state.giftThreeHundredDraws = true;
      state.souls = N.add(state.souls, 25);
      markChronicle("giftThreeHundredDraws");
      showToast("Twenty-five souls for three hundred draws.");
      granted = true;
    }

    if (!state.giftFirstEmberVow && normalizeVow(state.vow) === "ember") {
      state.giftFirstEmberVow = true;
      state.ash = N.add(state.ash, 8);
      markChronicle("giftFirstEmberVow");
      showToast("Eight ash for the ember vow.");
      granted = true;
    }

    if (normalizeVow(state.vow)) rememberVow(state.vow);

    if (!state.giftTwoVows && vowsKnownCount(state.vowsKnown) >= 2) {
      state.giftTwoVows = true;
      state.souls = N.add(state.souls, 10);
      markChronicle("giftTwoVows");
      showToast("Ten souls for two vows.");
      granted = true;
    }

    if (!state.giftThreeVows && vowsKnownCount(state.vowsKnown) >= 3) {
      state.giftThreeVows = true;
      state.souls = N.add(state.souls, 15);
      markChronicle("giftThreeVows");
      showToast("Fifteen souls for three vows.");
      granted = true;
    }

    if (!state.giftAllVows && vowsKnownCount(state.vowsKnown) >= 4) {
      state.giftAllVows = true;
      state.souls = N.add(state.souls, 25);
      markChronicle("giftAllVows");
      showToast("Twenty-five souls for four vows.");
      granted = true;
    }

    if (!state.bonusFirstFetter && N.cmp(state.fetters, 1) >= 0) {
      state.bonusFirstFetter = true;
      state.shades = N.add(state.shades, 2);
      state.lifetimeShades = N.add(state.lifetimeShades, 2);
      bumpPeakShades();
      markChronicle("giftFetter");
      showToast("Two shades for the first fetter.");
      granted = true;
    }

    bumpPeakFetters();
    if (!state.giftPeakFetters && N.cmp(state.peakFetters, 8) >= 0) {
      state.giftPeakFetters = true;
      state.shades = N.add(state.shades, 15);
      state.lifetimeShades = N.add(state.lifetimeShades, 15);
      bumpPeakShades();
      markChronicle("giftPeakFetters");
      showToast("Fifteen shades for eight fetters.");
      granted = true;
    }

    if (
      !state.bonusTenThousandSouls &&
      (N.cmp(state.lifetimeSouls, 10000) >= 0 || N.cmp(state.allTimeSouls, 10000) >= 0)
    ) {
      state.bonusTenThousandSouls = true;
      state.souls = N.add(state.souls, 500);
      markChronicle("giftTenThousand");
      showToast("The well returns five hundred souls.");
      granted = true;
    }

    if (!state.bonusFirstThrone && (Number(state.thrones) || 0) >= 1) {
      state.bonusFirstThrone = true;
      state.vessels = N.add(state.vessels, 1);
      if (!state.unlockedVessels) {
        state.unlockedVessels = true;
      }
      markChronicle("giftThrone");
      showToast("A vessel is returned.");
      granted = true;
    }

    if (
      !state.giftFiveTributes &&
      (Number(state.tributesLaid) || 0) >= 5
    ) {
      state.giftFiveTributes = true;
      state.favor = (Number(state.favor) || 0) + 2;
      markChronicle("giftFiveTributes");
      showToast("The GodKing returns two Favor.");
      granted = true;
    }

    if (
      !state.giftEightTributes &&
      (Number(state.tributesLaid) || 0) >= 8
    ) {
      state.giftEightTributes = true;
      state.souls = N.add(state.souls, 25);
      markChronicle("giftEightTributes");
      showToast("Twenty-five souls for eight emptyings.");
      granted = true;
    }

    if (
      !state.giftTwelveTributes &&
      (Number(state.tributesLaid) || 0) >= 12
    ) {
      state.giftTwelveTributes = true;
      state.souls = N.add(state.souls, 40);
      markChronicle("giftTwelveTributes");
      showToast("Forty souls for twelve emptyings.");
      granted = true;
    }

    if (
      !state.giftSixteenTributes &&
      (Number(state.tributesLaid) || 0) >= 16
    ) {
      state.giftSixteenTributes = true;
      state.souls = N.add(state.souls, 50);
      markChronicle("giftSixteenTributes");
      showToast("Fifty souls for sixteen emptyings.");
      granted = true;
    }

    if (
      !state.giftTwentyTributes &&
      (Number(state.tributesLaid) || 0) >= 20
    ) {
      state.giftTwentyTributes = true;
      state.souls = N.add(state.souls, 60);
      markChronicle("giftTwentyTributes");
      showToast("Sixty souls for twenty emptyings.");
      granted = true;
    }

    if (
      !state.giftTwentyFourTributes &&
      (Number(state.tributesLaid) || 0) >= 24
    ) {
      state.giftTwentyFourTributes = true;
      state.souls = N.add(state.souls, 70);
      markChronicle("giftTwentyFourTributes");
      showToast("Seventy souls for twenty-four emptyings.");
      granted = true;
    }

    if (
      !state.giftTwentyEightTributes &&
      (Number(state.tributesLaid) || 0) >= 28
    ) {
      state.giftTwentyEightTributes = true;
      state.souls = N.add(state.souls, 80);
      markChronicle("giftTwentyEightTributes");
      showToast("Eighty souls for twenty-eight emptyings.");
      granted = true;
    }

    if (tryNamesBound()) granted = true;

    if (granted) save();
  }

  function tryNamesBound() {
    bumpPeakShades();
    var target = namesFromPeak(state.peakShades);
    var current = Math.max(0, Math.floor(Number(state.namesBound) || 0));
    if (current > 12) current = 12;
    var granted = false;
    while (current < target && current < 12) {
      var epithet = BOUND_NAMES[current];
      current += 1;
      state.namesBound = current;
      markChronicle("name" + current);
      showToast("A name is bound: " + epithet + ".");
      if (current === 1 && !state.giftFirstName) {
        state.giftFirstName = true;
        state.souls = N.add(state.souls, 15);
        markChronicle("giftFirstName");
        showToast("Fifteen souls for the first name.");
      }
      granted = true;
    }
    if (current >= 12) state.namesBound = 12;
    if (state.namesBound >= 12 && !state.namesComplete) {
      state.namesComplete = true;
      markChronicle("namesComplete");
      showToast("The names of the bound are spoken. The harvest deepens.");
      granted = true;
    }
    if (state.namesComplete && !state.giftNamesComplete) {
      state.giftNamesComplete = true;
      state.favor = (Number(state.favor) || 0) + 1;
      var remOn = remembranceUnlocked();
      if (remOn) {
        state.remembrance = (Number(state.remembrance) || 0) + 1;
      }
      markChronicle("giftNamesComplete");
      showToast(
        remOn
          ? "The GodKing returns Favor and Remembrance."
          : "The GodKing returns Favor."
      );
      granted = true;
    }
    return granted;
  }

  function buyCrownWeight() {
    if (!crownUnlocked()) return;
    var cost = crownCost(state.crownWeight);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.crownWeight += 1;
    if (!state.giftCrown) {
      state.giftCrown = true;
      state.favor += 1;
      markChronicle("giftCrown");
      showToast("The crown was generous.");
    }
    save();
    render();
  }

  function buyLongMemory() {
    if (!crownUnlocked()) return;
    var cost = longMemCost(state.longMemoryLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.longMemoryLevel += 1;
    save();
    render();
  }

  function buyQuietCourt() {
    if (!crownUnlocked()) return;
    var cost = quietCourtCost(state.quietCourtLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.quietCourtLevel += 1;
    markChronicle("quietCourt");
    save();
    render();
  }

  function crownUnlocked() {
    return (Number(state.tributesLaid) || 0) >= 2 || (Number(state.favorEarned) || 0) >= 3;
  }

  function remembranceUnlocked() {
    return (Number(state.tributesLaid) || 0) >= 3 || (Number(state.favorEarned) || 0) >= 5;
  }

  function layRemembrance() {
    if (!remembranceUnlocked()) return;
    var cost = remembranceFavorCost();
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.remembrance = (Number(state.remembrance) || 0) + 1;
    showToast("The GodKing keeps a remembrance.");
    save();
    render();
  }

  function buyDeeperNight() {
    if (!remembranceUnlocked()) return;
    var cost = deeperNightCost(state.deeperNightLevel);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    state.remembrance -= cost;
    state.deeperNightLevel += 1;
    save();
    render();
  }

  function buyLongerProcession() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.longerProcessionLevel) || 0));
    if (level >= LONGER_PROCESSION_MAX) return;
    var cost = longerProcessionCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    state.remembrance -= cost;
    state.longerProcessionLevel = level + 1;
    markChronicle("longerProcession");
    checkUnlock();
    save();
    render();
  }

  function buyDeeperToll() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.deeperTollLevel) || 0));
    if (level >= DEEPER_TOLL_MAX) return;
    var cost = deeperTollCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    state.remembrance -= cost;
    state.deeperTollLevel = level + 1;
    markChronicle("deeperToll");
    checkUnlock();
    save();
    render();
  }

  function buyLongerWake() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.longerWakeLevel) || 0));
    if (level >= LONGER_WAKE_MAX) return;
    var cost = longerWakeCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    state.remembrance -= cost;
    state.longerWakeLevel = level + 1;
    markChronicle("longerWake");
    checkUnlock();
    save();
    render();
  }

  function buyLongerTithe() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.longerTitheLevel) || 0));
    if (level >= LONGER_TITHE_MAX) return;
    var cost = longerTitheCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    state.remembrance -= cost;
    state.longerTitheLevel = level + 1;
    markChronicle("longerTithe");
    checkUnlock();
    save();
    render();
  }

  function buyLongerVeil() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.longerVeilLevel) || 0));
    if (level >= LONGER_VEIL_MAX) return;
    var cost = longerVeilCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    state.remembrance -= cost;
    state.longerVeilLevel = level + 1;
    markChronicle("longerVeil");
    checkUnlock();
    save();
    render();
  }

  function buyLongerHymn() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.longerHymnLevel) || 0));
    if (level >= LONGER_HYMN_MAX) return;
    var cost = longerHymnCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    state.remembrance -= cost;
    state.longerHymnLevel = level + 1;
    markChronicle("longerHymn");
    checkUnlock();
    save();
    render();
  }

  function buyAshenTide() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.ashenTideLevel) || 0));
    if (level >= ASHEN_TIDE_MAX) return;
    var cost = ashenTideCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    state.remembrance -= cost;
    state.ashenTideLevel = level + 1;
    save();
    render();
  }

  function buyOssuary() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.ossuaryLevel) || 0));
    if (level >= OSSUARY_MAX) return;
    var cost = ossuaryCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    state.remembrance -= cost;
    state.ossuaryLevel = level + 1;
    markChronicle("ossuary");
    checkUnlock();
    save();
    render();
  }

  function beginProcession() {
    if (!remembranceUnlocked()) return;
    if (processionActive()) return;
    var cost = PROCESSION_COST;
    if ((Number(state.remembrance) || 0) < cost) return;
    state.remembrance -= cost;
    state.processionLeft = paidProcessionSecs(state.longerProcessionLevel);
    markChronicle("procession");
    if (!state.giftFirstProcession) {
      state.giftFirstProcession = true;
      state.souls = N.add(state.souls, 5);
      markChronicle("giftFirstProcession");
      showToast("Five souls for the first procession.");
    }
    showToast("They walk the emptied hall.");
    save();
    render();
  }

  function raiseChoir() {
    if (!state.unlockedChoir) return;
    var level = Math.max(0, Math.floor(Number(state.choirLevel) || 0));
    if (level >= CHOIR_MAX) return;
    if (N.cmp(state.lanterns, CHOIR_LANTERN_COST) < 0) return;
    state.lanterns = N.sub(state.lanterns, CHOIR_LANTERN_COST);
    state.unlockedLanterns = true;
    state.choirLevel = level + 1;
    if (markChronicle("choir")) {
      showToast("The choir of ash sings.");
    }
    save();
    render();
  }

  function swearAspect(id) {
    if ((Number(state.favorEarned) || 0) < 1) return;
    if (normalizeAspect(state.aspect)) return;
    var a = normalizeAspect(id);
    if (!a) return;
    state.aspect = a;
    markChronicle("aspect");
    save();
    render();
  }

  function swearVow(id) {
    if ((Number(state.favorEarned) || 0) < 1) return;
    if (normalizeVow(state.vow)) return;
    var v = normalizeVow(id);
    if (!v) return;
    state.vow = v;
    state.vowHungerPaid = false;
    rememberVow(v);
    markChronicle("vow");
    if (v === "stillness") markChronicle("vowStillness");
    if (v === "poverty") markChronicle("vowPoverty");
    if (v === "hunger") markChronicle("vowHunger");
    if (v === "ember") {
      markChronicle("vowEmber");
      if (!state.giftFirstEmberVow) {
        state.giftFirstEmberVow = true;
        state.ash = N.add(state.ash, 8);
        markChronicle("giftFirstEmberVow");
        showToast("Eight ash for the ember vow.");
      }
    }
    checkUnlock();
    save();
    render();
  }

  function setBuyMode(mode) {
    mode = normalizeBuyMode(mode);
    if (state.buyMode === mode) return;
    state.buyMode = mode;
    save();
    render();
  }

  var SAVE_FIELDS = [
    "souls",
    "lifetimeSouls",
    "lifetimeShades",
    "lifetimeSpirits",
    "shades",
    "spirits",
    "vessels",
    "thrones",
    "chalices",
    "wellDepth",
    "lanterns",
    "ash",
    "censers",
    "pyres",
    "urns",
    "hearths",
    "fetters",
    "emberLevel",
    "chainLevel",
    "hollowLevel",
    "unlockedSpirits",
    "unlockedVessels",
    "unlockedWell",
    "unlockedThrones",
    "unlockedChalices",
    "unlockedLanterns",
    "unlockedMarks",
    "unlockedCensers",
    "unlockedPyres",
    "unlockedUrns",
    "unlockedHearths",
    "unlockedFetters",
    "unlockedAutobind",
    "unlockedAutobindSpirits",
    "unlockedAutobindVessels",
    "unlockedAutobindLanterns",
    "unlockedAutobindFetters",
    "unlockedAutobindCensers",
    "unlockedAutobindThrones",
    "unlockedAutobindPyres",
    "unlockedAutobindChalices",
    "unlockedAutobindUrns",
    "unlockedAutobindHearths",
    "unlockedNightTithe",
    "unlockedVeil",
    "unlockedWake",
    "unlockedToll",
    "toastShown",
    "vesselToastShown",
    "throneToastShown",
    "lanternToastShown",
    "censerToastShown",
    "favor",
    "favorEarned",
    "edictLevel",
    "memoryLevel",
    "echoLevel",
    "seatLevel",
    "kindleLevel",
    "ashenLevel",
    "depthLevel",
    "buyMode",
    "siphonLevel",
    "levyLevel",
    "cinderLevel",
    "urnRiteLevel",
    "hearthRiteLevel",
    "wellDraws",
    "unlockedWellDraws",
    "aspect",
    "lastTick",
    "chronicle",
    "titheLeft",
    "nightLeft",
    "tithePaid",
    "autobind",
    "autobindSpirits",
    "autobindVessels",
    "autobindLanterns",
    "autobindFetters",
    "autobindCensers",
    "autobindThrones",
    "autobindPyres",
    "autobindChalices",
    "autobindUrns",
    "autobindHearths",
    "clicksThisRun",
    "veilLeft",
    "tollLeft",
    "wakeLeft",
    "processionLeft",
    "peakShades",
    "peakLanterns",
    "peakFetters",
    "peakCensers",
    "peakPyres",
    "peakUrns",
    "peakHearths",
    "bonusLifetimeSouls",
    "bonusPeakShades",
    "bonusFirstVessel",
    "bonusFirstTribute",
    "bonusThousandSouls",
    "bonusFirstLantern",
    "bonusFirstCenser",
    "bonusFirstFetter",
    "bonusTenThousandSouls",
    "bonusFirstThrone",
    "giftCrown",
    "giftFirstName",
    "giftFiveTributes",
    "giftNamesComplete",
    "giftFirstVeil",
    "giftFirstWake",
    "giftPeakLanterns",
    "giftPeakFetters",
    "giftPeakCensers",
    "giftFirstPyre",
    "giftFirstUrn",
    "giftFirstHearth",
    "giftEightTributes",
    "giftPeakPyres",
    "giftPeakUrns",
    "giftPeakHearths",
    "giftFirstCinders",
    "giftFirstUrnRite",
    "giftFirstHearthRite",
    "giftFirstChalice",
    "giftThreeChalices",
    "giftTwelveTributes",
    "giftSixteenTributes",
    "giftTwentyTributes",
    "giftTwentyFourTributes",
    "giftTwentyEightTributes",
    "giftFullCup",
    "giftFirstOssuary",
    "giftFullOssuary",
    "giftHundredDraws",
    "giftTwoHundredDraws",
    "giftThreeHundredDraws",
    "giftFirstEmberVow",
    "giftTwoVows",
    "giftThreeVows",
    "giftAllVows",
    "giftFirstProcession",
    "giftFirstLongerProcession",
    "giftFirstDeeperToll",
    "giftFirstLongerWake",
    "giftFirstLongerTithe",
    "giftFirstLongerVeil",
    "giftFirstLongerHymn",
    "giftFirstToll",
    "choirLevel",
    "unlockedChoir",
    "choirEdictLevel",
    "hymnEdictLevel",
    "smokeEdictLevel",
    "embersEdictLevel",
    "urnEdictLevel",
    "hearthEdictLevel",
    "cinderEdictLevel",
    "cutEdictLevel",
    "tendingEdictLevel",
    "cupEdictLevel",
    "draughtEdictLevel",
    "wakeEdictLevel",
    "processionEdictLevel",
    "tollEdictLevel",
    "veilEdictLevel",
    "nightEdictLevel",
    "hymnLeft",
    "crownWeight",
    "longMemoryLevel",
    "quietCourtLevel",
    "namesBound",
    "namesComplete",
    "remembrance",
    "deeperNightLevel",
    "ashenTideLevel",
    "ossuaryLevel",
    "longerProcessionLevel",
    "deeperTollLevel",
    "longerWakeLevel",
    "longerTitheLevel",
    "longerVeilLevel",
    "longerHymnLevel",
    "vow",
    "vowHungerPaid",
    "vowsKnown",
    "runStartedAt",
    "allTimeSouls",
    "tributesLaid"
  ];

  function dumpNum(v) {
    return N.dump(v);
  }

  function serializeState() {
    return {
      souls: dumpNum(state.souls),
      lifetimeSouls: dumpNum(state.lifetimeSouls),
      lifetimeShades: dumpNum(state.lifetimeShades),
      lifetimeSpirits: dumpNum(state.lifetimeSpirits),
      shades: dumpNum(state.shades),
      spirits: dumpNum(state.spirits),
      vessels: dumpNum(state.vessels),
      thrones: state.thrones,
      chalices: Math.max(0, Math.min(CHALICE_MAX, Math.floor(Number(state.chalices) || 0))),
      wellDepth: state.wellDepth,
      lanterns: dumpNum(state.lanterns),
      ash: dumpNum(state.ash),
      censers: dumpNum(state.censers),
      pyres: dumpNum(state.pyres),
      urns: dumpNum(state.urns),
      hearths: dumpNum(state.hearths),
      fetters: dumpNum(state.fetters),
      emberLevel: state.emberLevel,
      chainLevel: state.chainLevel,
      hollowLevel: state.hollowLevel,
      unlockedSpirits: state.unlockedSpirits,
      unlockedVessels: state.unlockedVessels,
      unlockedWell: state.unlockedWell,
      unlockedThrones: state.unlockedThrones,
      unlockedChalices: !!state.unlockedChalices || (Number(state.chalices) || 0) >= 1,
      unlockedLanterns: state.unlockedLanterns,
      unlockedMarks: state.unlockedMarks,
      unlockedCensers: state.unlockedCensers,
      unlockedPyres: !!state.unlockedPyres,
      unlockedUrns: !!state.unlockedUrns,
      unlockedHearths: !!state.unlockedHearths,
      unlockedFetters: !!state.unlockedFetters,
      unlockedAutobind: !!state.unlockedAutobind,
      unlockedAutobindSpirits: !!state.unlockedAutobindSpirits,
      unlockedAutobindVessels: !!state.unlockedAutobindVessels,
      unlockedAutobindLanterns: !!state.unlockedAutobindLanterns,
      unlockedAutobindFetters: !!state.unlockedAutobindFetters,
      unlockedAutobindCensers: !!state.unlockedAutobindCensers,
      unlockedAutobindThrones: !!state.unlockedAutobindThrones,
      unlockedAutobindPyres: !!state.unlockedAutobindPyres,
      unlockedAutobindChalices: !!state.unlockedAutobindChalices,
      unlockedAutobindUrns: !!state.unlockedAutobindUrns,
      unlockedAutobindHearths: !!state.unlockedAutobindHearths,
      unlockedNightTithe: !!state.unlockedNightTithe,
      unlockedVeil: !!state.unlockedVeil,
      unlockedWake: !!state.unlockedWake,
      unlockedToll: !!state.unlockedToll,
      toastShown: state.toastShown,
      vesselToastShown: state.vesselToastShown,
      throneToastShown: state.throneToastShown,
      lanternToastShown: state.lanternToastShown,
      censerToastShown: state.censerToastShown,
      favor: state.favor,
      favorEarned: state.favorEarned,
      edictLevel: state.edictLevel,
      memoryLevel: state.memoryLevel,
      echoLevel: state.echoLevel,
      seatLevel: state.seatLevel,
      kindleLevel: Number(state.kindleLevel) || 0,
      ashenLevel: Number(state.ashenLevel) || 0,
      depthLevel: Number(state.depthLevel) || 0,
      buyMode: state.buyMode,
      siphonLevel: state.siphonLevel,
      levyLevel: state.levyLevel,
      cinderLevel: Number(state.cinderLevel) || 0,
      urnRiteLevel: Number(state.urnRiteLevel) || 0,
      hearthRiteLevel: Number(state.hearthRiteLevel) || 0,
      wellDraws: state.wellDraws,
      unlockedWellDraws: state.unlockedWellDraws,
      aspect: normalizeAspect(state.aspect),
      lastTick: Date.now(),
      chronicle: state.chronicle || [],
      titheLeft: Number(state.titheLeft) || 0,
      nightLeft: Number(state.nightLeft) || 0,
      tithePaid: !!state.tithePaid,
      autobind: !!state.autobind,
      autobindSpirits: !!state.autobindSpirits,
      autobindVessels: !!state.autobindVessels,
      autobindLanterns: !!state.autobindLanterns,
      autobindFetters: !!state.autobindFetters,
      autobindCensers: !!state.autobindCensers,
      autobindThrones: !!state.autobindThrones,
      autobindPyres: !!state.autobindPyres,
      autobindChalices: !!state.autobindChalices,
      autobindUrns: !!state.autobindUrns,
      autobindHearths: !!state.autobindHearths,
      clicksThisRun: Math.max(0, Math.floor(Number(state.clicksThisRun) || 0)),
      veilLeft: Number(state.veilLeft) || 0,
      tollLeft: Number(state.tollLeft) || 0,
      wakeLeft: Number(state.wakeLeft) || 0,
      processionLeft: Number(state.processionLeft) || 0,
      peakShades: dumpNum(state.peakShades),
      peakLanterns: dumpNum(state.peakLanterns),
      peakFetters: dumpNum(state.peakFetters),
      peakCensers: dumpNum(state.peakCensers),
      peakPyres: dumpNum(state.peakPyres),
      peakUrns: dumpNum(state.peakUrns),
      peakHearths: dumpNum(state.peakHearths),
      bonusLifetimeSouls: !!state.bonusLifetimeSouls,
      bonusPeakShades: !!state.bonusPeakShades,
      bonusFirstVessel: !!state.bonusFirstVessel,
      bonusFirstTribute: !!state.bonusFirstTribute,
      bonusThousandSouls: !!state.bonusThousandSouls,
      bonusFirstLantern: !!state.bonusFirstLantern,
      bonusFirstCenser: !!state.bonusFirstCenser,
      bonusFirstFetter: !!state.bonusFirstFetter,
      bonusTenThousandSouls: !!state.bonusTenThousandSouls,
      bonusFirstThrone: !!state.bonusFirstThrone,
      giftCrown: !!state.giftCrown,
      giftFirstName: !!state.giftFirstName,
      giftFiveTributes: !!state.giftFiveTributes,
      giftNamesComplete: !!state.giftNamesComplete,
      giftFirstVeil: !!state.giftFirstVeil,
      giftFirstWake: !!state.giftFirstWake,
      giftPeakLanterns: !!state.giftPeakLanterns,
      giftPeakFetters: !!state.giftPeakFetters,
      giftPeakCensers: !!state.giftPeakCensers,
      giftFirstPyre: !!state.giftFirstPyre,
      giftFirstUrn: !!state.giftFirstUrn,
      giftFirstHearth: !!state.giftFirstHearth,
      giftEightTributes: !!state.giftEightTributes,
      giftPeakPyres: !!state.giftPeakPyres,
      giftPeakUrns: !!state.giftPeakUrns,
      giftPeakHearths: !!state.giftPeakHearths,
      giftFirstCinders: !!state.giftFirstCinders,
      giftFirstUrnRite: !!state.giftFirstUrnRite,
      giftFirstHearthRite: !!state.giftFirstHearthRite,
      giftFirstChalice: !!state.giftFirstChalice,
      giftTwelveTributes: !!state.giftTwelveTributes,
      giftSixteenTributes: !!state.giftSixteenTributes,
      giftTwentyTributes: !!state.giftTwentyTributes,
      giftTwentyFourTributes: !!state.giftTwentyFourTributes,
      giftTwentyEightTributes: !!state.giftTwentyEightTributes,
      giftFullCup: !!state.giftFullCup,
      giftThreeChalices: !!state.giftThreeChalices,
      giftFirstOssuary: !!state.giftFirstOssuary,
      giftFullOssuary: !!state.giftFullOssuary,
      giftHundredDraws: !!state.giftHundredDraws,
      giftTwoHundredDraws: !!state.giftTwoHundredDraws,
      giftThreeHundredDraws: !!state.giftThreeHundredDraws,
      giftFirstEmberVow: !!state.giftFirstEmberVow,
      giftTwoVows: !!state.giftTwoVows,
      giftThreeVows: !!state.giftThreeVows,
      giftAllVows: !!state.giftAllVows,
      giftFirstProcession: !!state.giftFirstProcession,
      giftFirstLongerProcession: !!state.giftFirstLongerProcession,
      giftFirstDeeperToll: !!state.giftFirstDeeperToll,
      giftFirstLongerWake: !!state.giftFirstLongerWake,
      giftFirstLongerTithe: !!state.giftFirstLongerTithe,
      giftFirstLongerVeil: !!state.giftFirstLongerVeil,
      giftFirstLongerHymn: !!state.giftFirstLongerHymn,
      giftFirstToll: !!state.giftFirstToll,
      choirLevel: Math.max(0, Math.min(CHOIR_MAX, Math.floor(Number(state.choirLevel) || 0))),
      unlockedChoir: !!state.unlockedChoir || (Number(state.choirLevel) || 0) >= 1,
      choirEdictLevel: Math.max(0, Math.floor(Number(state.choirEdictLevel) || 0)),
      hymnEdictLevel: Math.max(0, Math.floor(Number(state.hymnEdictLevel) || 0)),
      smokeEdictLevel: Math.max(0, Math.floor(Number(state.smokeEdictLevel) || 0)),
      embersEdictLevel: Math.max(0, Math.floor(Number(state.embersEdictLevel) || 0)),
      urnEdictLevel: Math.max(0, Math.floor(Number(state.urnEdictLevel) || 0)),
      hearthEdictLevel: Math.max(0, Math.floor(Number(state.hearthEdictLevel) || 0)),
      cinderEdictLevel: Math.max(0, Math.floor(Number(state.cinderEdictLevel) || 0)),
      cutEdictLevel: Math.max(0, Math.floor(Number(state.cutEdictLevel) || 0)),
      tendingEdictLevel: Math.max(0, Math.floor(Number(state.tendingEdictLevel) || 0)),
      cupEdictLevel: Math.max(0, Math.floor(Number(state.cupEdictLevel) || 0)),
      draughtEdictLevel: Math.max(0, Math.floor(Number(state.draughtEdictLevel) || 0)),
      wakeEdictLevel: Math.max(0, Math.floor(Number(state.wakeEdictLevel) || 0)),
      processionEdictLevel: Math.max(0, Math.floor(Number(state.processionEdictLevel) || 0)),
      tollEdictLevel: Math.max(0, Math.floor(Number(state.tollEdictLevel) || 0)),
      veilEdictLevel: Math.max(0, Math.floor(Number(state.veilEdictLevel) || 0)),
      nightEdictLevel: Math.max(0, Math.floor(Number(state.nightEdictLevel) || 0)),
      hymnLeft: Number(state.hymnLeft) || 0,
      crownWeight: Number(state.crownWeight) || 0,
      longMemoryLevel: Number(state.longMemoryLevel) || 0,
      quietCourtLevel: Number(state.quietCourtLevel) || 0,
      namesBound: Math.max(0, Math.min(12, Math.floor(Number(state.namesBound) || 0))),
      namesComplete: !!state.namesComplete || (Number(state.namesBound) || 0) >= 12,
      remembrance: Math.max(0, Math.floor(Number(state.remembrance) || 0)),
      deeperNightLevel: Math.max(0, Math.floor(Number(state.deeperNightLevel) || 0)),
      ashenTideLevel: Math.max(0, Math.min(ASHEN_TIDE_MAX, Math.floor(Number(state.ashenTideLevel) || 0))),
      ossuaryLevel: Math.max(0, Math.min(OSSUARY_MAX, Math.floor(Number(state.ossuaryLevel) || 0))),
      longerProcessionLevel: Math.max(0, Math.min(LONGER_PROCESSION_MAX, Math.floor(Number(state.longerProcessionLevel) || 0))),
      deeperTollLevel: Math.max(0, Math.min(DEEPER_TOLL_MAX, Math.floor(Number(state.deeperTollLevel) || 0))),
      longerWakeLevel: Math.max(0, Math.min(LONGER_WAKE_MAX, Math.floor(Number(state.longerWakeLevel) || 0))),
      longerTitheLevel: Math.max(0, Math.min(LONGER_TITHE_MAX, Math.floor(Number(state.longerTitheLevel) || 0))),
      longerVeilLevel: Math.max(0, Math.min(LONGER_VEIL_MAX, Math.floor(Number(state.longerVeilLevel) || 0))),
      longerHymnLevel: Math.max(0, Math.min(LONGER_HYMN_MAX, Math.floor(Number(state.longerHymnLevel) || 0))),
      vow: normalizeVow(state.vow),
      vowHungerPaid: !!state.vowHungerPaid,
      vowsKnown: normalizeVowsKnown(state.vowsKnown),
      runStartedAt: Number(state.runStartedAt) || Date.now(),
      allTimeSouls: dumpNum(state.allTimeSouls),
      tributesLaid: Number(state.tributesLaid) || 0
    };
  }

  function isSaveShape(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return false;
    var i;
    for (i = 0; i < SAVE_FIELDS.length; i++) {
      if (Object.prototype.hasOwnProperty.call(data, SAVE_FIELDS[i])) return true;
    }
    return false;
  }

  function applySaveData(data) {
    state.souls = N.load(data.souls);
    state.lifetimeSouls = N.load(data.lifetimeSouls);
    state.lifetimeShades = N.load(data.lifetimeShades);
    state.lifetimeSpirits = N.load(data.lifetimeSpirits);
    state.shades = N.load(data.shades);
    state.spirits = N.load(data.spirits);
    state.vessels = N.load(data.vessels);
    state.thrones = Number(data.thrones) || 0;
    state.chalices = Math.max(0, Math.min(CHALICE_MAX, Math.floor(Number(data.chalices) || 0)));
    state.wellDepth = Number(data.wellDepth) || 0;
    state.lanterns = N.load(data.lanterns);
    state.ash = N.load(data.ash);
    state.censers = N.load(data.censers);
    state.pyres = N.load(data.pyres);
    state.urns = N.load(data.urns);
    state.hearths = N.load(data.hearths);
    state.fetters = N.load(data.fetters);
    state.emberLevel = Number(data.emberLevel) || 0;
    state.chainLevel = Number(data.chainLevel) || 0;
    state.hollowLevel = Number(data.hollowLevel) || 0;
    state.unlockedSpirits = !!data.unlockedSpirits;
    state.unlockedVessels = !!data.unlockedVessels;
    state.unlockedWell = !!data.unlockedWell;
    state.unlockedThrones = !!data.unlockedThrones;
    state.unlockedChalices = !!data.unlockedChalices || (Number(data.chalices) || 0) >= 1 || (Number(data.thrones) || 0) >= UNLOCK_CHALICES;
    state.unlockedLanterns = !!data.unlockedLanterns;
    state.unlockedMarks = !!data.unlockedMarks;
    state.unlockedCensers = !!data.unlockedCensers;
    state.unlockedPyres = !!data.unlockedPyres;
    state.unlockedUrns = !!data.unlockedUrns || N.cmp(state.urns, 1) >= 0 || N.cmp(state.pyres, UNLOCK_URNS) >= 0;
    state.unlockedHearths = !!data.unlockedHearths || N.cmp(state.hearths, 1) >= 0 || N.cmp(state.urns, UNLOCK_HEARTHS) >= 0;
    state.unlockedFetters = !!data.unlockedFetters;
    state.unlockedAutobind = !!data.unlockedAutobind;
    state.unlockedAutobindSpirits = !!data.unlockedAutobindSpirits;
    state.unlockedAutobindVessels = !!data.unlockedAutobindVessels;
    state.unlockedAutobindLanterns = !!data.unlockedAutobindLanterns;
    state.unlockedAutobindFetters = !!data.unlockedAutobindFetters;
    state.unlockedAutobindCensers = !!data.unlockedAutobindCensers;
    state.unlockedAutobindThrones = !!data.unlockedAutobindThrones;
    state.unlockedAutobindPyres = !!data.unlockedAutobindPyres;
    state.unlockedAutobindChalices = !!data.unlockedAutobindChalices;
    state.unlockedAutobindUrns = !!data.unlockedAutobindUrns;
    state.unlockedAutobindHearths = !!data.unlockedAutobindHearths;
    state.unlockedNightTithe = !!data.unlockedNightTithe || (Number(data.nightLeft) || 0) > 0;
    state.unlockedVeil = !!data.unlockedVeil || (Number(data.clicksThisRun) || 0) >= UNLOCK_VEIL_CLICKS || (Number(data.veilLeft) || 0) > 0;
    state.unlockedWake = !!data.unlockedWake || !!data.unlockedPyres || (Number(data.wakeLeft) || 0) > 0;
    state.unlockedToll = !!data.unlockedToll || (Number(data.clicksThisRun) || 0) >= UNLOCK_TOLL_CLICKS || (Number(data.tollLeft) || 0) > 0;
    state.toastShown = !!data.toastShown;
    state.vesselToastShown = !!data.vesselToastShown;
    state.throneToastShown = !!data.throneToastShown;
    state.lanternToastShown = !!data.lanternToastShown;
    state.censerToastShown = !!data.censerToastShown;
    state.favor = Number(data.favor) || 0;
    if (data.favorEarned == null) {
      state.favorEarned = Number(data.favor) || 0;
    } else {
      state.favorEarned = Number(data.favorEarned) || 0;
    }
    state.edictLevel = Number(data.edictLevel) || 0;
    state.memoryLevel = Number(data.memoryLevel) || 0;
    state.echoLevel = Number(data.echoLevel) || 0;
    if (state.echoLevel > 1) state.echoLevel = 1;
    state.seatLevel = Number(data.seatLevel) || 0;
    state.kindleLevel = Number(data.kindleLevel) || 0;
    state.ashenLevel = Number(data.ashenLevel) || 0;
    state.depthLevel = Math.max(0, Math.floor(Number(data.depthLevel) || 0));
    state.buyMode = normalizeBuyMode(data.buyMode);
    state.siphonLevel = Number(data.siphonLevel) || 0;
    state.levyLevel = Number(data.levyLevel) || 0;
    state.cinderLevel = Number(data.cinderLevel) || 0;
    state.urnRiteLevel = Number(data.urnRiteLevel) || 0;
    state.hearthRiteLevel = Number(data.hearthRiteLevel) || 0;
    state.wellDraws = !!data.wellDraws;
    state.unlockedWellDraws = !!data.unlockedWellDraws;
    state.aspect = normalizeAspect(data.aspect);
    state.lastTick = Number(data.lastTick) || Date.now();
    state.chronicle = normalizeChronicle(data.chronicle);
    state.titheLeft = Number(data.titheLeft) || 0;
    if (state.titheLeft < 0) state.titheLeft = 0;
    state.nightLeft = Number(data.nightLeft) || 0;
    if (state.nightLeft < 0) state.nightLeft = 0;
    state.hymnLeft = Number(data.hymnLeft) || 0;
    if (state.hymnLeft < 0) state.hymnLeft = 0;
    state.veilLeft = Number(data.veilLeft) || 0;
    if (state.veilLeft < 0) state.veilLeft = 0;
    state.tollLeft = Number(data.tollLeft) || 0;
    if (state.tollLeft < 0) state.tollLeft = 0;
    state.wakeLeft = Number(data.wakeLeft) || 0;
    if (state.wakeLeft < 0) state.wakeLeft = 0;
    state.processionLeft = Number(data.processionLeft) || 0;
    if (state.processionLeft < 0) state.processionLeft = 0;
    if (state.wakeLeft > 0 || N.cmp(state.ash, UNLOCK_WAKE_ASH) >= 0 || state.unlockedPyres) {
      state.unlockedWake = true;
    }
    state.tithePaid = !!data.tithePaid || (Number(data.titheLeft) || 0) > 0;
    state.autobind = !!data.autobind;
    state.autobindSpirits = !!data.autobindSpirits;
    state.autobindVessels = !!data.autobindVessels;
    state.autobindLanterns = !!data.autobindLanterns;
    state.autobindFetters = !!data.autobindFetters;
    state.autobindCensers = !!data.autobindCensers;
    state.autobindThrones = !!data.autobindThrones;
    state.autobindPyres = !!data.autobindPyres;
    state.autobindChalices = !!data.autobindChalices;
    state.autobindUrns = !!data.autobindUrns;
    state.autobindHearths = !!data.autobindHearths;
    state.clicksThisRun = Math.max(0, Math.floor(Number(data.clicksThisRun) || 0));
    if (state.clicksThisRun >= UNLOCK_VEIL_CLICKS || (Number(state.veilLeft) || 0) > 0) state.unlockedVeil = true;
    if (state.clicksThisRun >= UNLOCK_TOLL_CLICKS || (Number(state.tollLeft) || 0) > 0) state.unlockedToll = true;
    if (
      state.unlockedPyres ||
      N.cmp(state.pyres, 1) >= 0 ||
      N.cmp(state.ash, UNLOCK_WAKE_ASH) >= 0 ||
      state.wakeLeft > 0
    ) {
      state.unlockedWake = true;
    }
    state.peakShades = N.max(N.load(data.peakShades), N.load(data.shades));
    state.peakLanterns = N.max(N.load(data.peakLanterns), N.load(data.lanterns));
    state.peakFetters = N.max(N.load(data.peakFetters), N.load(data.fetters));
    state.peakCensers = N.max(N.load(data.peakCensers), N.load(data.censers));
    state.peakPyres = N.max(N.load(data.peakPyres), N.load(data.pyres));
    state.peakUrns = N.max(N.load(data.peakUrns), N.load(data.urns));
    state.peakHearths = N.max(N.load(data.peakHearths), N.load(data.hearths));
    state.bonusLifetimeSouls = !!data.bonusLifetimeSouls;
    state.bonusPeakShades = !!data.bonusPeakShades;
    state.bonusFirstVessel = !!data.bonusFirstVessel;
    if (data.bonusFirstTribute == null) {
      state.bonusFirstTribute = (Number(data.tributesLaid) || 0) >= 1;
    } else {
      state.bonusFirstTribute = !!data.bonusFirstTribute;
    }
    state.bonusThousandSouls = !!data.bonusThousandSouls;
    state.bonusFirstLantern = !!data.bonusFirstLantern;
    state.bonusFirstCenser = !!data.bonusFirstCenser;
    state.bonusFirstFetter = !!data.bonusFirstFetter;
    state.bonusTenThousandSouls = !!data.bonusTenThousandSouls;
    state.bonusFirstThrone = !!data.bonusFirstThrone;
    state.crownWeight = Math.max(0, Math.floor(Number(data.crownWeight) || 0));
    if (data.giftCrown == null) {
      state.giftCrown = state.crownWeight >= 1;
    } else {
      state.giftCrown = !!data.giftCrown;
    }
    if (data.giftFirstName == null) {
      state.giftFirstName = Math.max(0, Math.floor(Number(data.namesBound) || 0)) >= 1;
    } else {
      state.giftFirstName = !!data.giftFirstName;
    }
    if (data.giftFiveTributes == null) {
      state.giftFiveTributes = (Number(data.tributesLaid) || 0) >= 5;
    } else {
      state.giftFiveTributes = !!data.giftFiveTributes;
    }
    if (data.giftEightTributes == null) {
      state.giftEightTributes = (Number(data.tributesLaid) || 0) >= 8;
    } else {
      state.giftEightTributes = !!data.giftEightTributes;
    }
    if (data.giftTwelveTributes == null) {
      state.giftTwelveTributes = (Number(data.tributesLaid) || 0) >= 12;
    } else {
      state.giftTwelveTributes = !!data.giftTwelveTributes;
    }
    if (data.giftSixteenTributes == null) {
      state.giftSixteenTributes = (Number(data.tributesLaid) || 0) >= 16;
    } else {
      state.giftSixteenTributes = !!data.giftSixteenTributes;
    }
    if (data.giftTwentyTributes == null) {
      state.giftTwentyTributes = (Number(data.tributesLaid) || 0) >= 20;
    } else {
      state.giftTwentyTributes = !!data.giftTwentyTributes;
    }
    if (data.giftTwentyFourTributes == null) {
      state.giftTwentyFourTributes =
        hasChronicle("giftTwentyFourTributes") ||
        (Number(data.tributesLaid) || 0) >= 24;
    } else {
      state.giftTwentyFourTributes = !!data.giftTwentyFourTributes;
    }
    if (data.giftTwentyEightTributes == null) {
      state.giftTwentyEightTributes =
        hasChronicle("giftTwentyEightTributes") ||
        (Number(data.tributesLaid) || 0) >= 28;
    } else {
      state.giftTwentyEightTributes = !!data.giftTwentyEightTributes;
    }
    if (data.giftNamesComplete == null) {
      state.giftNamesComplete = !!data.namesComplete || Math.max(0, Math.floor(Number(data.namesBound) || 0)) >= 12;
    } else {
      state.giftNamesComplete = !!data.giftNamesComplete;
    }
    if (data.giftFirstVeil == null) {
      state.giftFirstVeil = hasChronicle("veil") || (Number(data.veilLeft) || 0) > 0;
    } else {
      state.giftFirstVeil = !!data.giftFirstVeil;
    }
    if (data.giftFirstWake == null) {
      state.giftFirstWake = hasChronicle("wake") || hasChronicle("giftFirstWake") || (Number(data.wakeLeft) || 0) > 0;
    } else {
      state.giftFirstWake = !!data.giftFirstWake;
    }
    if (data.giftPeakLanterns == null) {
      state.giftPeakLanterns = false;
    } else {
      state.giftPeakLanterns = !!data.giftPeakLanterns;
    }
    if (data.giftPeakFetters == null) {
      state.giftPeakFetters = false;
    } else {
      state.giftPeakFetters = !!data.giftPeakFetters;
    }
    if (data.giftPeakCensers == null) {
      state.giftPeakCensers = false;
    } else {
      state.giftPeakCensers = !!data.giftPeakCensers;
    }
    if (data.giftFirstPyre == null) {
      state.giftFirstPyre =
        hasChronicle("pyre") ||
        hasChronicle("giftFirstPyre") ||
        (embersStartsPyres(data.embersEdictLevel) > 0 && N.cmp(state.pyres, 1) >= 0);
    } else {
      state.giftFirstPyre = !!data.giftFirstPyre;
    }
    if (data.giftFirstUrn == null) {
      state.giftFirstUrn =
        hasChronicle("urn") ||
        hasChronicle("giftFirstUrn") ||
        (urnEdictStartsUrns(data.urnEdictLevel) > 0 && N.cmp(state.urns, 1) >= 0);
    } else {
      state.giftFirstUrn = !!data.giftFirstUrn;
    }
    if (data.giftFirstHearth == null) {
      state.giftFirstHearth =
        hasChronicle("hearth") ||
        hasChronicle("giftFirstHearth") ||
        (hearthEdictStartsHearths(data.hearthEdictLevel) > 0 && N.cmp(state.hearths, 1) >= 0);
    } else {
      state.giftFirstHearth = !!data.giftFirstHearth;
    }
    if (data.giftPeakPyres == null) {
      state.giftPeakPyres = false;
    } else {
      state.giftPeakPyres = !!data.giftPeakPyres;
    }
    if (data.giftPeakUrns == null) {
      state.giftPeakUrns = false;
    } else {
      state.giftPeakUrns = !!data.giftPeakUrns;
    }
    if (data.giftPeakHearths == null) {
      state.giftPeakHearths = false;
    } else {
      state.giftPeakHearths = !!data.giftPeakHearths;
    }
    if (data.giftFirstCinders == null) {
      state.giftFirstCinders =
        hasChronicle("giftFirstCinders") ||
        hasChronicle("cinders") ||
        (Number(data.cinderLevel) || 0) > 0;
    } else {
      state.giftFirstCinders = !!data.giftFirstCinders;
    }
    if (data.giftFirstUrnRite == null) {
      state.giftFirstUrnRite =
        hasChronicle("giftFirstUrnRite") ||
        hasChronicle("urnRite") ||
        (Number(data.urnRiteLevel) || 0) > 0;
    } else {
      state.giftFirstUrnRite = !!data.giftFirstUrnRite;
    }
    if (data.giftFirstHearthRite == null) {
      state.giftFirstHearthRite =
        hasChronicle("giftFirstHearthRite") ||
        hasChronicle("hearthRite") ||
        (Number(data.hearthRiteLevel) || 0) > 0;
    } else {
      state.giftFirstHearthRite = !!data.giftFirstHearthRite;
    }
    if (data.giftFirstChalice == null) {
      state.giftFirstChalice =
        hasChronicle("giftFirstChalice") ||
        hasChronicle("chalice") ||
        (cupStartsChalices(data.cupEdictLevel) > 0 && (Number(state.chalices) || 0) >= 1);
    } else {
      state.giftFirstChalice = !!data.giftFirstChalice;
    }
    if (data.giftFullCup == null) {
      state.giftFullCup = hasChronicle("giftFullCup");
    } else {
      state.giftFullCup = !!data.giftFullCup;
    }
    if (data.giftThreeChalices == null) {
      state.giftThreeChalices = hasChronicle("giftThreeChalices");
    } else {
      state.giftThreeChalices = !!data.giftThreeChalices;
    }
    if (data.giftFirstOssuary == null) {
      state.giftFirstOssuary =
        hasChronicle("giftFirstOssuary") ||
        hasChronicle("ossuary") ||
        (Number(data.ossuaryLevel) || 0) >= 1;
    } else {
      state.giftFirstOssuary = !!data.giftFirstOssuary;
    }
    if (data.giftFullOssuary == null) {
      state.giftFullOssuary = hasChronicle("giftFullOssuary");
    } else {
      state.giftFullOssuary = !!data.giftFullOssuary;
    }
    if (data.giftHundredDraws == null) {
      state.giftHundredDraws = hasChronicle("giftHundredDraws");
    } else {
      state.giftHundredDraws = !!data.giftHundredDraws;
    }
    if (data.giftTwoHundredDraws == null) {
      state.giftTwoHundredDraws = hasChronicle("giftTwoHundredDraws");
    } else {
      state.giftTwoHundredDraws = !!data.giftTwoHundredDraws;
    }
    if (data.giftThreeHundredDraws == null) {
      state.giftThreeHundredDraws = hasChronicle("giftThreeHundredDraws");
    } else {
      state.giftThreeHundredDraws = !!data.giftThreeHundredDraws;
    }
    if (data.giftFirstEmberVow == null) {
      state.giftFirstEmberVow = hasChronicle("vowEmber") || hasChronicle("giftFirstEmberVow");
    } else {
      state.giftFirstEmberVow = !!data.giftFirstEmberVow;
    }
    if (data.giftTwoVows == null) {
      state.giftTwoVows = hasChronicle("giftTwoVows");
    } else {
      state.giftTwoVows = !!data.giftTwoVows;
    }
    if (data.giftThreeVows == null) {
      state.giftThreeVows = hasChronicle("giftThreeVows");
    } else {
      state.giftThreeVows = !!data.giftThreeVows;
    }
    if (data.giftAllVows == null) {
      state.giftAllVows = hasChronicle("giftAllVows");
    } else {
      state.giftAllVows = !!data.giftAllVows;
    }
    if (data.giftFirstProcession == null) {
      state.giftFirstProcession =
        hasChronicle("procession") ||
        hasChronicle("giftFirstProcession") ||
        (Number(data.processionLeft) || 0) > 0;
    } else {
      state.giftFirstProcession = !!data.giftFirstProcession;
    }
    if (data.giftFirstLongerProcession == null) {
      state.giftFirstLongerProcession =
        hasChronicle("giftFirstLongerProcession") ||
        hasChronicle("longerProcession") ||
        (Number(data.longerProcessionLevel) || 0) >= 1;
    } else {
      state.giftFirstLongerProcession = !!data.giftFirstLongerProcession;
    }
    if (data.giftFirstDeeperToll == null) {
      state.giftFirstDeeperToll =
        hasChronicle("giftFirstDeeperToll") ||
        hasChronicle("deeperToll") ||
        (Number(data.deeperTollLevel) || 0) >= 1;
    } else {
      state.giftFirstDeeperToll = !!data.giftFirstDeeperToll;
    }
    if (data.giftFirstLongerWake == null) {
      state.giftFirstLongerWake =
        hasChronicle("giftFirstLongerWake") ||
        hasChronicle("longerWake") ||
        (Number(data.longerWakeLevel) || 0) >= 1;
    } else {
      state.giftFirstLongerWake = !!data.giftFirstLongerWake;
    }
    if (data.giftFirstLongerTithe == null) {
      state.giftFirstLongerTithe =
        hasChronicle("giftFirstLongerTithe") ||
        hasChronicle("longerTithe") ||
        (Number(data.longerTitheLevel) || 0) >= 1;
    } else {
      state.giftFirstLongerTithe = !!data.giftFirstLongerTithe;
    }
    if (data.giftFirstLongerVeil == null) {
      state.giftFirstLongerVeil =
        hasChronicle("giftFirstLongerVeil") ||
        hasChronicle("longerVeil") ||
        (Number(data.longerVeilLevel) || 0) >= 1;
    } else {
      state.giftFirstLongerVeil = !!data.giftFirstLongerVeil;
    }
    if (data.giftFirstLongerHymn == null) {
      state.giftFirstLongerHymn =
        hasChronicle("giftFirstLongerHymn") ||
        hasChronicle("longerHymn") ||
        (Number(data.longerHymnLevel) || 0) >= 1;
    } else {
      state.giftFirstLongerHymn = !!data.giftFirstLongerHymn;
    }
    if (data.giftFirstToll == null) {
      state.giftFirstToll =
        hasChronicle("toll") ||
        hasChronicle("giftFirstToll") ||
        (Number(data.tollLeft) || 0) > 0;
    } else {
      state.giftFirstToll = !!data.giftFirstToll;
    }
    state.choirLevel = Math.max(0, Math.min(CHOIR_MAX, Math.floor(Number(data.choirLevel) || 0)));
    state.unlockedChoir = !!data.unlockedChoir || state.choirLevel >= 1;
    state.choirEdictLevel = Math.max(0, Math.floor(Number(data.choirEdictLevel) || 0));
    state.hymnEdictLevel = Math.max(0, Math.floor(Number(data.hymnEdictLevel) || 0));
    state.smokeEdictLevel = Math.max(0, Math.floor(Number(data.smokeEdictLevel) || 0));
    state.embersEdictLevel = Math.max(0, Math.floor(Number(data.embersEdictLevel) || 0));
    state.urnEdictLevel = Math.max(0, Math.floor(Number(data.urnEdictLevel) || 0));
    state.hearthEdictLevel = Math.max(0, Math.floor(Number(data.hearthEdictLevel) || 0));
    state.cinderEdictLevel = Math.max(0, Math.floor(Number(data.cinderEdictLevel) || 0));
    state.cutEdictLevel = Math.max(0, Math.floor(Number(data.cutEdictLevel) || 0));
    var tendingLoaded = data.tendingEdictLevel;
    if (tendingLoaded == null && data.kindlingEdictLevel != null) {
      tendingLoaded = data.kindlingEdictLevel;
    }
    state.tendingEdictLevel = Math.max(0, Math.floor(Number(tendingLoaded) || 0));
    state.cupEdictLevel = Math.max(0, Math.floor(Number(data.cupEdictLevel) || 0));
    state.draughtEdictLevel = Math.max(0, Math.floor(Number(data.draughtEdictLevel) || 0));
    state.wakeEdictLevel = Math.max(0, Math.floor(Number(data.wakeEdictLevel) || 0));
    state.processionEdictLevel = Math.max(0, Math.floor(Number(data.processionEdictLevel) || 0));
    state.tollEdictLevel = Math.max(0, Math.floor(Number(data.tollEdictLevel) || 0));
    state.veilEdictLevel = Math.max(0, Math.floor(Number(data.veilEdictLevel) || 0));
    state.nightEdictLevel = Math.max(0, Math.floor(Number(data.nightEdictLevel) || 0));
    state.longMemoryLevel = Math.max(0, Math.floor(Number(data.longMemoryLevel) || 0));
    state.quietCourtLevel = Math.max(0, Math.floor(Number(data.quietCourtLevel) || 0));
    state.namesBound = Math.max(0, Math.min(12, Math.floor(Number(data.namesBound) || 0)));
    state.namesComplete = !!data.namesComplete || state.namesBound >= 12;
    state.remembrance = Math.max(0, Math.floor(Number(data.remembrance) || 0));
    state.deeperNightLevel = Math.max(0, Math.floor(Number(data.deeperNightLevel) || 0));
    state.ashenTideLevel = Math.max(0, Math.min(ASHEN_TIDE_MAX, Math.floor(Number(data.ashenTideLevel) || 0)));
    state.ossuaryLevel = Math.max(0, Math.min(OSSUARY_MAX, Math.floor(Number(data.ossuaryLevel) || 0)));
    state.longerProcessionLevel = Math.max(0, Math.min(LONGER_PROCESSION_MAX, Math.floor(Number(data.longerProcessionLevel) || 0)));
    state.deeperTollLevel = Math.max(0, Math.min(DEEPER_TOLL_MAX, Math.floor(Number(data.deeperTollLevel) || 0)));
    state.longerWakeLevel = Math.max(0, Math.min(LONGER_WAKE_MAX, Math.floor(Number(data.longerWakeLevel) || 0)));
    state.longerTitheLevel = Math.max(0, Math.min(LONGER_TITHE_MAX, Math.floor(Number(data.longerTitheLevel) || 0)));
    state.longerVeilLevel = Math.max(0, Math.min(LONGER_VEIL_MAX, Math.floor(Number(data.longerVeilLevel) || 0)));
    state.longerHymnLevel = Math.max(0, Math.min(LONGER_HYMN_MAX, Math.floor(Number(data.longerHymnLevel) || 0)));
    state.vow = normalizeVow(data.vow);
    state.vowHungerPaid = !!data.vowHungerPaid && state.vow === "hunger";
    state.vowsKnown = seedVowsKnown(data.vowsKnown);
    state.runStartedAt = Number(data.runStartedAt) || Date.now();
    if (data.allTimeSouls == null) {
      state.allTimeSouls = N.load(data.lifetimeSouls);
    } else {
      state.allTimeSouls = N.load(data.allTimeSouls);
    }
    if (N.cmp(state.allTimeSouls, 0) < 0) state.allTimeSouls = N.fromNumber(0);
    state.tributesLaid = Math.max(0, Math.floor(Number(data.tributesLaid) || 0));
  }

  function adoptSave(data) {
    state = freshState();
    applySaveData(data);
    hideToast(true);
    hideUnlockCards();
    checkUnlock();
    if (state.unlockedWell) revealWell();
    if (state.unlockedLanterns) revealLanterns(false);
    if (state.unlockedSpirits) revealSpirits(false);
    if (state.unlockedFetters) revealFetters(false);
    if (state.unlockedVessels) revealVessels(false);
    if (state.unlockedThrones) revealThrones(false);
    if (state.unlockedCensers) revealCensers(false);
    if (state.unlockedPyres) revealPyres(false);
    if (state.unlockedUrns) revealUrns(false);
    if (state.unlockedHearths) revealHearths(false);
    if (state.unlockedChalices) revealChalices(false);
    if (els.chronicleList) {
      els.chronicleList.dataset.sig = "";
    }
    if (els.namesBoundList) {
      els.namesBoundList.dataset.sig = "";
    }
    if (els.namesList) {
      els.namesList.dataset.sig = "";
    }
    lastFrame = 0;
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(serializeState()));
    } catch (err) {
      /* private mode / quota — game still runs */
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") return;
      applySaveData(data);

      var offline = (Date.now() - state.lastTick) / 1000;
      var soulsBefore = N.clone(state.souls);
      var shadesBefore = N.clone(state.shades);
      if (offline > 0.25) {
        applyDt(offline);
      }
      var soulsGained = N.sub(state.souls, soulsBefore);
      var shadesGained = N.sub(state.shades, shadesBefore);
      state.lastTick = Date.now();
      syncChronicle();
      save();

      if (offline > AWAY_MIN_DT && (N.cmp(soulsGained, 0) > 0 || N.cmp(shadesGained, 0) > 0)) {
        var awayMsg = "The well gathered while you were away.";
        if (N.cmp(soulsGained, 0) > 0) {
          awayMsg += " +" + fmt(soulsGained) + " Souls";
        }
        pendingAwayToast = awayMsg;
      }
    } catch (err) {
      state = freshState();
    }
  }

  function exportMemory() {
    save();
    var json;
    try {
      json = JSON.stringify(serializeState());
    } catch (err) {
      showToast("The memory would not bind.");
      return;
    }
    function fillFallback() {
      if (els.memoryPanel) els.memoryPanel.open = true;
      if (els.memoryText) {
        els.memoryText.value = json;
        els.memoryText.focus();
        els.memoryText.select();
        try {
          document.execCommand("copy");
        } catch (err2) {
          /* textarea still holds the memory */
        }
      }
      showToast("The well's memory is copied.");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).then(function () {
        if (els.memoryText) els.memoryText.value = json;
        showToast("The well's memory is copied.");
      }, fillFallback);
    } else {
      fillFallback();
    }
  }

  function importMemory() {
    var ok = window.confirm(
      "Importing empties the current well and replaces its memory."
    );
    if (!ok) return;

    var raw = "";
    if (els.memoryText && els.memoryText.value) {
      raw = String(els.memoryText.value).trim();
    }
    if (!raw) {
      var pasted = window.prompt("Paste the well's memory.");
      if (pasted == null) return;
      raw = String(pasted).trim();
    }
    if (!raw) {
      showToast("The memory would not bind.");
      return;
    }

    var data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      showToast("The memory would not bind.");
      return;
    }
    if (!isSaveShape(data)) {
      showToast("The memory would not bind.");
      return;
    }

    adoptSave(data);
    state.lastTick = Date.now();
    syncChronicle();
    save();
    render();
    showToast("The well's memory is bound.");
  }

  function hideUnlockCards() {
    hideCard(els.wellCard);
    hideCard(els.spiritCard);
    hideCard(els.vesselCard);
    hideCard(els.throneCard);
    hideCard(els.lanternCard);
    hideCard(els.censerCard);
    hideCard(els.pyreCard);
    hideCard(els.urnCard);
    hideCard(els.hearthCard);
    hideCard(els.fetterCard);
    hideCard(els.chaliceCard);
    hideTribute();
    hideRites();
    hideMarks();
    hideAspects();
    hideVows();
    hideCrown();
    hideNames();
  }

  function resetGame() {
    var ok = window.confirm(
      "Abandon the well?\n\nEvery soul, shade, bound will, Favor, and Reliquary scatter. This cannot be undone."
    );
    if (!ok) return;
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (err) {
      /* ignore */
    }
    state = freshState();
    hideToast(true);
    hideUnlockCards();
    render();
  }

  function layTribute() {
    var gain = favorGain(state.lifetimeSouls);
    if (gain < 1) return;
    var ok = window.confirm(
      "Empty the well?\n\nThe GodKing keeps the Favor. Reliquary stays. This gathering is forfeit."
    );
    if (!ok) return;
    markChronicle("tribute");
    var firstTributeBonus = 0;
    if (!state.bonusFirstTribute) {
      state.bonusFirstTribute = true;
      firstTributeBonus = 1;
      markChronicle("giftTribute");
    }
    var vowBonus = vowExtraFavor(state.vow, state.vowHungerPaid);
    var extraFavor = firstTributeBonus + vowBonus;
    var keptFavor = (Number(state.favor) || 0) + gain + extraFavor;
    var keptEarned = (Number(state.favorEarned) || 0) + gain + extraFavor;
    var keptEdict = state.edictLevel;
    var keptMemory = state.memoryLevel;
    var keptEcho = Number(state.echoLevel) || 0;
    if (keptEcho > 1) keptEcho = 1;
    var keptSeat = Number(state.seatLevel) || 0;
    var keptKindle = Number(state.kindleLevel) || 0;
    var keptAshen = Number(state.ashenLevel) || 0;
    var keptDepth = Number(state.depthLevel) || 0;
    var keptCrown = Number(state.crownWeight) || 0;
    var keptLongMem = Number(state.longMemoryLevel) || 0;
    var keptBuy = state.buyMode;
    var keptChronicle = (state.chronicle || []).slice();
    var keptAllTime = N.clone(state.allTimeSouls);
    var keptPeakShades = N.max(num(state.peakShades), num(state.shades));
    var keptPeakLanterns = N.max(num(state.peakLanterns), num(state.lanterns));
    var keptPeakFetters = N.max(num(state.peakFetters), num(state.fetters));
    var keptPeakCensers = N.max(num(state.peakCensers), num(state.censers));
    var keptPeakPyres = N.max(num(state.peakPyres), num(state.pyres));
    var keptPeakUrns = N.max(num(state.peakUrns), num(state.urns));
    var keptPeakHearths = N.max(num(state.peakHearths), num(state.hearths));
    var keptBonusLifetimeSouls = !!state.bonusLifetimeSouls;
    var keptBonusPeakShades = !!state.bonusPeakShades;
    var keptBonusFirstVessel = !!state.bonusFirstVessel;
    var keptBonusFirstTribute = true;
    var keptBonusThousandSouls = !!state.bonusThousandSouls;
    var keptBonusFirstLantern = !!state.bonusFirstLantern;
    var keptBonusFirstCenser = !!state.bonusFirstCenser;
    var keptBonusFirstFetter = !!state.bonusFirstFetter;
    var keptBonusTenThousandSouls = !!state.bonusTenThousandSouls;
    var keptBonusFirstThrone = !!state.bonusFirstThrone;
    var keptGiftCrown = !!state.giftCrown;
    var keptGiftFirstName = !!state.giftFirstName;
    var keptGiftFiveTributes = !!state.giftFiveTributes;
    var keptGiftNamesComplete = !!state.giftNamesComplete;
    var keptGiftFirstVeil = !!state.giftFirstVeil;
    var keptGiftFirstWake = !!state.giftFirstWake;
    var keptGiftPeakLanterns = !!state.giftPeakLanterns;
    var keptGiftPeakFetters = !!state.giftPeakFetters;
    var keptGiftPeakCensers = !!state.giftPeakCensers;
    var keptGiftFirstPyre = !!state.giftFirstPyre;
    var keptGiftFirstUrn = !!state.giftFirstUrn;
    var keptGiftFirstHearth = !!state.giftFirstHearth;
    var keptGiftEightTributes = !!state.giftEightTributes;
    var keptGiftPeakPyres = !!state.giftPeakPyres;
    var keptGiftPeakUrns = !!state.giftPeakUrns;
    var keptGiftPeakHearths = !!state.giftPeakHearths;
    var keptGiftFirstCinders = !!state.giftFirstCinders;
    var keptGiftFirstUrnRite = !!state.giftFirstUrnRite;
    var keptGiftFirstHearthRite = !!state.giftFirstHearthRite;
    var keptGiftFirstChalice = !!state.giftFirstChalice;
    var keptGiftTwelveTributes = !!state.giftTwelveTributes;
    var keptGiftSixteenTributes = !!state.giftSixteenTributes;
    var keptGiftTwentyTributes = !!state.giftTwentyTributes;
    var keptGiftTwentyFourTributes = !!state.giftTwentyFourTributes;
    var keptGiftTwentyEightTributes = !!state.giftTwentyEightTributes;
    var keptGiftFullCup = !!state.giftFullCup;
    var keptGiftThreeChalices = !!state.giftThreeChalices;
    var keptGiftFirstOssuary = !!state.giftFirstOssuary;
    var keptGiftFullOssuary = !!state.giftFullOssuary;
    var keptGiftHundredDraws = !!state.giftHundredDraws;
    var keptGiftTwoHundredDraws = !!state.giftTwoHundredDraws;
    var keptGiftThreeHundredDraws = !!state.giftThreeHundredDraws;
    var keptGiftFirstEmberVow = !!state.giftFirstEmberVow;
    var keptGiftTwoVows = !!state.giftTwoVows;
    var keptGiftThreeVows = !!state.giftThreeVows;
    var keptGiftAllVows = !!state.giftAllVows;
    var keptGiftFirstProcession = !!state.giftFirstProcession;
    var keptGiftFirstLongerProcession = !!state.giftFirstLongerProcession;
    var keptGiftFirstDeeperToll = !!state.giftFirstDeeperToll;
    var keptGiftFirstLongerWake = !!state.giftFirstLongerWake;
    var keptGiftFirstLongerTithe = !!state.giftFirstLongerTithe;
    var keptGiftFirstLongerVeil = !!state.giftFirstLongerVeil;
    var keptGiftFirstLongerHymn = !!state.giftFirstLongerHymn;
    var keptGiftFirstToll = !!state.giftFirstToll;
    var keptVowsKnown = normalizeVowsKnown(state.vowsKnown);
    var keptChoirEdict = Math.max(0, Math.floor(Number(state.choirEdictLevel) || 0));
    var keptHymnEdict = Math.max(0, Math.floor(Number(state.hymnEdictLevel) || 0));
    var keptSmokeEdict = Math.max(0, Math.floor(Number(state.smokeEdictLevel) || 0));
    var keptEmbersEdict = Math.max(0, Math.floor(Number(state.embersEdictLevel) || 0));
    var keptUrnEdict = Math.max(0, Math.floor(Number(state.urnEdictLevel) || 0));
    var keptHearthEdict = Math.max(0, Math.floor(Number(state.hearthEdictLevel) || 0));
    var keptCinderEdict = Math.max(0, Math.floor(Number(state.cinderEdictLevel) || 0));
    var keptCutEdict = Math.max(0, Math.floor(Number(state.cutEdictLevel) || 0));
    var keptTendingEdict = Math.max(0, Math.floor(Number(state.tendingEdictLevel) || 0));
    var keptCupEdict = Math.max(0, Math.floor(Number(state.cupEdictLevel) || 0));
    var keptDraughtEdict = Math.max(0, Math.floor(Number(state.draughtEdictLevel) || 0));
    var keptWakeEdict = Math.max(0, Math.floor(Number(state.wakeEdictLevel) || 0));
    var keptProcessionEdict = Math.max(0, Math.floor(Number(state.processionEdictLevel) || 0));
    var keptTollEdict = Math.max(0, Math.floor(Number(state.tollEdictLevel) || 0));
    var keptVeilEdict = Math.max(0, Math.floor(Number(state.veilEdictLevel) || 0));
    var keptNightEdict = Math.max(0, Math.floor(Number(state.nightEdictLevel) || 0));
    var keptQuietCourt = Number(state.quietCourtLevel) || 0;
    var keptNamesBound = Math.max(0, Math.min(12, Math.floor(Number(state.namesBound) || 0)));
    var keptNamesComplete = !!state.namesComplete || keptNamesBound >= 12;
    var keptRemembrance = Math.max(0, Math.floor(Number(state.remembrance) || 0));
    var keptDeeperNight = Math.max(0, Math.floor(Number(state.deeperNightLevel) || 0));
    var keptAshenTide = Math.max(0, Math.min(ASHEN_TIDE_MAX, Math.floor(Number(state.ashenTideLevel) || 0)));
    var keptOssuary = Math.max(0, Math.min(OSSUARY_MAX, Math.floor(Number(state.ossuaryLevel) || 0)));
    var keptLongerProcession = Math.max(0, Math.min(LONGER_PROCESSION_MAX, Math.floor(Number(state.longerProcessionLevel) || 0)));
    var keptDeeperToll = Math.max(0, Math.min(DEEPER_TOLL_MAX, Math.floor(Number(state.deeperTollLevel) || 0)));
    var keptLongerWake = Math.max(0, Math.min(LONGER_WAKE_MAX, Math.floor(Number(state.longerWakeLevel) || 0)));
    var keptLongerTithe = Math.max(0, Math.min(LONGER_TITHE_MAX, Math.floor(Number(state.longerTitheLevel) || 0)));
    var keptLongerVeil = Math.max(0, Math.min(LONGER_VEIL_MAX, Math.floor(Number(state.longerVeilLevel) || 0)));
    var keptLongerHymn = Math.max(0, Math.min(LONGER_HYMN_MAX, Math.floor(Number(state.longerHymnLevel) || 0)));
    var keptTributes = (Number(state.tributesLaid) || 0) + 1;
    state = freshState();
    state.favor = keptFavor;
    state.favorEarned = keptEarned;
    state.edictLevel = keptEdict;
    state.memoryLevel = keptMemory;
    state.echoLevel = keptEcho;
    state.seatLevel = keptSeat;
    state.kindleLevel = keptKindle;
    state.ashenLevel = keptAshen;
    state.depthLevel = keptDepth;
    state.crownWeight = keptCrown;
    state.longMemoryLevel = keptLongMem;
    state.buyMode = keptBuy;
    state.chronicle = keptChronicle;
    state.aspect = "";
    state.allTimeSouls = keptAllTime;
    state.peakShades = keptPeakShades;
    state.peakLanterns = keptPeakLanterns;
    state.peakFetters = keptPeakFetters;
    state.peakCensers = keptPeakCensers;
    state.peakPyres = keptPeakPyres;
    state.peakUrns = keptPeakUrns;
    state.peakHearths = keptPeakHearths;
    state.bonusLifetimeSouls = keptBonusLifetimeSouls;
    state.bonusPeakShades = keptBonusPeakShades;
    state.bonusFirstVessel = keptBonusFirstVessel;
    state.bonusFirstTribute = keptBonusFirstTribute;
    state.bonusThousandSouls = keptBonusThousandSouls;
    state.bonusFirstLantern = keptBonusFirstLantern;
    state.bonusFirstCenser = keptBonusFirstCenser;
    state.bonusFirstFetter = keptBonusFirstFetter;
    state.bonusTenThousandSouls = keptBonusTenThousandSouls;
    state.bonusFirstThrone = keptBonusFirstThrone;
    state.giftCrown = keptGiftCrown;
    state.giftFirstName = keptGiftFirstName;
    state.giftFiveTributes = keptGiftFiveTributes;
    state.giftNamesComplete = keptGiftNamesComplete;
    state.giftFirstVeil = keptGiftFirstVeil;
    state.giftFirstWake = keptGiftFirstWake;
    state.giftPeakLanterns = keptGiftPeakLanterns;
    state.giftPeakFetters = keptGiftPeakFetters;
    state.giftPeakCensers = keptGiftPeakCensers;
    state.giftFirstPyre = keptGiftFirstPyre;
    state.giftFirstUrn = keptGiftFirstUrn;
    state.giftFirstHearth = keptGiftFirstHearth;
    state.giftEightTributes = keptGiftEightTributes;
    state.giftPeakPyres = keptGiftPeakPyres;
    state.giftPeakUrns = keptGiftPeakUrns;
    state.giftPeakHearths = keptGiftPeakHearths;
    state.giftFirstCinders = keptGiftFirstCinders;
    state.giftFirstUrnRite = keptGiftFirstUrnRite;
    state.giftFirstHearthRite = keptGiftFirstHearthRite;
    state.giftFirstChalice = keptGiftFirstChalice;
    state.giftTwelveTributes = keptGiftTwelveTributes;
    state.giftSixteenTributes = keptGiftSixteenTributes;
    state.giftTwentyTributes = keptGiftTwentyTributes;
    state.giftTwentyFourTributes = keptGiftTwentyFourTributes;
    state.giftTwentyEightTributes = keptGiftTwentyEightTributes;
    state.giftFullCup = keptGiftFullCup;
    state.giftThreeChalices = keptGiftThreeChalices;
    state.giftFirstOssuary = keptGiftFirstOssuary;
    state.giftFullOssuary = keptGiftFullOssuary;
    state.giftHundredDraws = keptGiftHundredDraws;
    state.giftTwoHundredDraws = keptGiftTwoHundredDraws;
    state.giftThreeHundredDraws = keptGiftThreeHundredDraws;
    state.giftFirstEmberVow = keptGiftFirstEmberVow;
    state.giftTwoVows = keptGiftTwoVows;
    state.giftThreeVows = keptGiftThreeVows;
    state.giftAllVows = keptGiftAllVows;
    state.giftFirstProcession = keptGiftFirstProcession;
    state.giftFirstLongerProcession = keptGiftFirstLongerProcession;
    state.giftFirstDeeperToll = keptGiftFirstDeeperToll;
    state.giftFirstLongerWake = keptGiftFirstLongerWake;
    state.giftFirstLongerTithe = keptGiftFirstLongerTithe;
    state.giftFirstLongerVeil = keptGiftFirstLongerVeil;
    state.giftFirstLongerHymn = keptGiftFirstLongerHymn;
    state.giftFirstToll = keptGiftFirstToll;
    state.vowsKnown = keptVowsKnown;
    state.choirEdictLevel = keptChoirEdict;
    state.hymnEdictLevel = keptHymnEdict;
    state.smokeEdictLevel = keptSmokeEdict;
    state.embersEdictLevel = keptEmbersEdict;
    state.urnEdictLevel = keptUrnEdict;
    state.hearthEdictLevel = keptHearthEdict;
    state.cinderEdictLevel = keptCinderEdict;
    state.cutEdictLevel = keptCutEdict;
    state.tendingEdictLevel = keptTendingEdict;
    state.cupEdictLevel = keptCupEdict;
    state.draughtEdictLevel = keptDraughtEdict;
    state.wakeEdictLevel = keptWakeEdict;
    state.processionEdictLevel = keptProcessionEdict;
    state.tollEdictLevel = keptTollEdict;
    state.veilEdictLevel = keptVeilEdict;
    state.nightEdictLevel = keptNightEdict;
    state.quietCourtLevel = keptQuietCourt;
    state.namesBound = keptNamesBound;
    state.namesComplete = keptNamesComplete;
    state.remembrance = keptRemembrance;
    state.deeperNightLevel = keptDeeperNight;
    state.ashenTideLevel = keptAshenTide;
    state.ossuaryLevel = keptOssuary;
    state.longerProcessionLevel = keptLongerProcession;
    state.deeperTollLevel = keptDeeperToll;
    state.longerWakeLevel = keptLongerWake;
    state.longerTitheLevel = keptLongerTithe;
    state.longerVeilLevel = keptLongerVeil;
    state.longerHymnLevel = keptLongerHymn;
    state.tributesLaid = keptTributes;
    state.titheLeft = 0;
    state.nightLeft = nightLeftAfterTribute(keptNightEdict);
    if (state.nightLeft > 0) {
      state.unlockedNightTithe = true;
    }
    state.hymnLeft = hymnLeftAfterTribute(keptHymnEdict, keptLongerHymn);
    state.veilLeft = veilLeftAfterTribute(keptVeilEdict);
    if (state.veilLeft > 0) {
      state.unlockedVeil = true;
    }
    state.tollLeft = tollLeftAfterTribute(keptTollEdict);
    if (state.tollLeft > 0) {
      state.unlockedToll = true;
    }
    state.wakeLeft = wakeLeftAfterTribute(keptWakeEdict);
    if (state.wakeLeft > 0) {
      state.unlockedWake = true;
    }
    state.processionLeft = processionLeftAfterTribute(keptProcessionEdict);
    state.tithePaid = false;
    state.autobind = false;
    state.autobindSpirits = false;
    state.autobindVessels = false;
    state.autobindLanterns = false;
    state.autobindFetters = false;
    state.autobindCensers = false;
    state.autobindThrones = false;
    state.autobindPyres = false;
    state.autobindChalices = false;
    state.autobindUrns = false;
    state.autobindHearths = false;
    state.clicksThisRun = 0;
    state.vow = "";
    state.vowHungerPaid = false;
    state.runStartedAt = Date.now();
    if (keptMemory > 0) {
      state.shades = N.fromNumber(keptMemory);
      state.unlockedWell = true;
    }
    state.thrones = keptSeat;
    if (keptSeat >= 1) {
      state.unlockedThrones = true;
    }
    if (keptEcho >= 1) {
      state.wellDraws = true;
      state.unlockedWellDraws = true;
    }
    if (keptKindle > 0) {
      state.lanterns = N.fromNumber(keptKindle);
      state.unlockedLanterns = true;
      state.lanternToastShown = true;
    }
    if (keptAshen > 0) {
      state.ash = N.fromNumber(10 * keptAshen);
    }
    if (keptLongMem > 0) {
      state.fetters = N.fromNumber(keptLongMem);
      state.unlockedFetters = true;
    }
    if (keptDepth > 0) {
      state.wellDepth = keptDepth;
      state.unlockedWell = true;
    }
    if (keptQuietCourt >= 1) {
      state.autobind = true;
      state.unlockedAutobind = true;
    }
    if (quietCourtStartsLanternAutobind(keptQuietCourt)) {
      state.autobindLanterns = true;
      if (N.cmp(state.lanterns, UNLOCK_AUTOBIND_LANTERNS) >= 0) {
        state.unlockedAutobindLanterns = true;
      }
    }
    if (quietCourtStartsFetterAutobind(keptQuietCourt)) {
      state.autobindFetters = true;
      if (N.cmp(state.fetters, UNLOCK_AUTOBIND_FETTERS) >= 0) {
        state.unlockedAutobindFetters = true;
      }
    }
    if (quietCourtStartsPyreAutobind(keptQuietCourt)) {
      state.autobindPyres = true;
      if (N.cmp(state.pyres, UNLOCK_AUTOBIND_PYRES) >= 0) {
        state.unlockedAutobindPyres = true;
      }
    }
    if (quietCourtStartsChaliceAutobind(keptQuietCourt)) {
      state.autobindChalices = true;
      if ((Number(state.chalices) || 0) >= UNLOCK_AUTOBIND_CHALICES) {
        state.unlockedAutobindChalices = true;
      }
    }
    if (quietCourtStartsUrnAutobind(keptQuietCourt)) {
      state.autobindUrns = true;
      if (N.cmp(state.urns, UNLOCK_AUTOBIND_URNS) >= 0) {
        state.unlockedAutobindUrns = true;
      }
    }
    if (quietCourtStartsHearthAutobind(keptQuietCourt)) {
      state.autobindHearths = true;
      if (N.cmp(state.hearths, UNLOCK_AUTOBIND_HEARTHS) >= 0) {
        state.unlockedAutobindHearths = true;
      }
    }
    if (smokeStartsCenserAutobind(keptSmokeEdict)) {
      state.autobindCensers = true;
      if (N.cmp(state.censers, UNLOCK_AUTOBIND_CENSERS) >= 0) {
        state.unlockedAutobindCensers = true;
      }
    }
    var startPyres = embersStartsPyres(keptEmbersEdict);
    if (startPyres > 0) {
      state.pyres = N.fromNumber(startPyres);
      state.unlockedPyres = true;
    }
    var startUrns = urnEdictStartsUrns(keptUrnEdict);
    if (startUrns > 0) {
      state.urns = N.fromNumber(startUrns);
      state.unlockedUrns = true;
    }
    var startHearths = hearthEdictStartsHearths(keptHearthEdict);
    if (startHearths > 0) {
      state.hearths = N.fromNumber(startHearths);
      state.unlockedHearths = true;
    }
    if (quietCourtStartsUrnAutobind(keptQuietCourt)) {
      state.autobindUrns = true;
      if (N.cmp(state.urns, UNLOCK_AUTOBIND_URNS) >= 0) {
        state.unlockedAutobindUrns = true;
      }
    }
    if (quietCourtStartsHearthAutobind(keptQuietCourt)) {
      state.autobindHearths = true;
      if (N.cmp(state.hearths, UNLOCK_AUTOBIND_HEARTHS) >= 0) {
        state.unlockedAutobindHearths = true;
      }
    }
    if (cinderEdictStartsPyreAutobind(keptCinderEdict)) {
      state.autobindPyres = true;
      if (N.cmp(state.pyres, UNLOCK_AUTOBIND_PYRES) >= 0) {
        state.unlockedAutobindPyres = true;
      }
    }
    if (cutEdictStartsUrnAutobind(keptCutEdict)) {
      state.autobindUrns = true;
      if (N.cmp(state.urns, UNLOCK_AUTOBIND_URNS) >= 0) {
        state.unlockedAutobindUrns = true;
      }
    }
    if (tendingEdictStartsHearthAutobind(keptTendingEdict)) {
      state.autobindHearths = true;
      if (N.cmp(state.hearths, UNLOCK_AUTOBIND_HEARTHS) >= 0) {
        state.unlockedAutobindHearths = true;
      }
    }
    var startChalices = cupStartsChalices(keptCupEdict);
    if (startChalices > 0) {
      state.chalices = startChalices;
      state.unlockedChalices = true;
    }
    if (draughtStartsChaliceAutobind(keptDraughtEdict)) {
      state.autobindChalices = true;
      if ((Number(state.chalices) || 0) >= UNLOCK_AUTOBIND_CHALICES) {
        state.unlockedAutobindChalices = true;
      }
    }
    state.choirLevel = Math.min(CHOIR_MAX, keptChoirEdict);
    if (state.choirLevel >= 1) {
      state.unlockedChoir = true;
    }
    markChronicle("hymn");
    hideToast(true);
    hideUnlockCards();
    checkUnlock();
    if (state.unlockedWell) revealWell();
    if (state.unlockedLanterns) revealLanterns(false);
    if (state.unlockedSpirits) revealSpirits(false);
    if (state.unlockedFetters) revealFetters(false);
    if (state.unlockedVessels) revealVessels(false);
    if (state.unlockedThrones) revealThrones(false);
    if (state.unlockedCensers) revealCensers(false);
    if (state.unlockedPyres) revealPyres(false);
    if (state.unlockedUrns) revealUrns(false);
    if (state.unlockedHearths) revealHearths(false);
    if (state.unlockedChalices) revealChalices(false);
    save();
    render();
    if (firstTributeBonus > 0) {
      showToast("The GodKing's first remembrance is generous.");
    }
    showToast("A hymn follows the emptying.");
  }


  function fmt(n) {
    return SoulgatherFormat.formatNumber(n);
  }

  function formatBlessing(m) {
    if (typeof SoulgatherFormat !== "undefined" && SoulgatherFormat.formatBlessing) {
      return SoulgatherFormat.formatBlessing(m);
    }
    if (m && typeof m === "object" && typeof m.m === "number") {
      m = N.toNumber(m);
    }
    if (!isFinite(m)) m = 1;
    var tenth = m * 10;
    if (Math.abs(tenth - Math.round(tenth)) < 1e-8) {
      return "\u00d7" + m.toFixed(1);
    }
    return "\u00d7" + m.toFixed(2);
  }

  function formatMult(m) {
    return formatBlessing(m);
  }

  function formatTimes(n) {
    if (n && typeof n === "object" && typeof n.m === "number") {
      if (n.e < 12) {
        var v = N.toNumber(n);
        if (isFinite(v) && Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
        if (isFinite(v) && v < 1000) {
          if (Math.abs(v - Math.round(v)) < 0.05) return String(Math.round(v));
          return v.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
        }
      }
      return fmt(n);
    }
    if (!isFinite(n)) return fmt(n);
    return String(n);
  }

  function pulseGather() {
    if (!els.gatherBtn) return;
    els.gatherBtn.classList.remove("is-pulse");
    void els.gatherBtn.offsetWidth;
    els.gatherBtn.classList.add("is-pulse");
  }

  function spawnRipple(power) {
    var well = els.gatherBtn;
    if (!well) return;
    var drop = document.createElement("span");
    drop.className = "soul-drop";
    drop.textContent = "+" + fmt(power);
    well.appendChild(drop);
    window.setTimeout(function () {
      if (drop.parentNode) drop.parentNode.removeChild(drop);
    }, 900);
  }

  function revealCard(el) {
    if (!el) return;
    el.classList.remove("is-hidden");
    window.requestAnimationFrame(function () {
      el.classList.add("is-revealed");
    });
  }

  function hideCard(el) {
    if (!el) return;
    el.classList.add("is-hidden");
    el.classList.remove("is-revealed", "can-buy");
  }

  function revealWell() {
    revealCard(els.wellCard);
  }

  function revealSpirits(withToast) {
    revealCard(els.spiritCard);
    if (withToast && !state.toastShown) {
      state.toastShown = true;
      showToast("The well answers. A will can be bound.");
      save();
    }
  }

  function revealVessels(withToast) {
    revealCard(els.vesselCard);
    if (withToast && !state.vesselToastShown) {
      state.vesselToastShown = true;
      showToast("A vessel waits. A will can be housed.");
      save();
    }
  }

  function revealThrones(withToast) {
    revealCard(els.throneCard);
    if (withToast && !state.throneToastShown) {
      state.throneToastShown = true;
      showToast("A throne may be raised.");
      save();
    }
  }

  function revealLanterns(withToast) {
    revealCard(els.lanternCard);
  }

  function revealCensers(withToast) {
    revealCard(els.censerCard);
    if (withToast && !state.censerToastShown) {
      state.censerToastShown = true;
      showToast("They burn what the well discards.");
      save();
    }
  }

  function revealPyres(withToast) {
    revealCard(els.pyreCard);
  }

  function revealUrns(withToast) {
    revealCard(els.urnCard);
  }

  function revealHearths(withToast) {
    revealCard(els.hearthCard);
  }

  function revealChalices(withToast) {
    revealCard(els.chaliceCard);
  }

  function revealFetters(withToast) {
    revealCard(els.fetterCard);
  }

  function hideTribute() {
    if (els.tributePanel) els.tributePanel.classList.add("is-hidden");
    if (els.tributeFootBtn) els.tributeFootBtn.classList.add("is-hidden");
  }

  function hideRites() {
    if (els.ritesPanel) els.ritesPanel.classList.add("is-hidden");
    if (els.levyRow) els.levyRow.classList.add("is-hidden");
    if (els.wellDrawsRow) els.wellDrawsRow.classList.add("is-hidden");
    if (els.titheRow) els.titheRow.classList.add("is-hidden");
    if (els.nightTitheRow) els.nightTitheRow.classList.add("is-hidden");
    if (els.choirRow) els.choirRow.classList.add("is-hidden");
    if (els.autobindRow) els.autobindRow.classList.add("is-hidden");
    if (els.autobindSpiritsRow) els.autobindSpiritsRow.classList.add("is-hidden");
    if (els.autobindVesselsRow) els.autobindVesselsRow.classList.add("is-hidden");
    if (els.autobindLanternsRow) els.autobindLanternsRow.classList.add("is-hidden");
    if (els.autobindFettersRow) els.autobindFettersRow.classList.add("is-hidden");
    if (els.autobindCensersRow) els.autobindCensersRow.classList.add("is-hidden");
    if (els.autobindThronesRow) els.autobindThronesRow.classList.add("is-hidden");
    if (els.autobindPyresRow) els.autobindPyresRow.classList.add("is-hidden");
    if (els.autobindUrnsRow) els.autobindUrnsRow.classList.add("is-hidden");
    if (els.autobindHearthsRow) els.autobindHearthsRow.classList.add("is-hidden");
    if (els.autobindChalicesRow) els.autobindChalicesRow.classList.add("is-hidden");
    if (els.cinderRow) els.cinderRow.classList.add("is-hidden");
    if (els.urnRiteRow) els.urnRiteRow.classList.add("is-hidden");
    if (els.hearthRiteRow) els.hearthRiteRow.classList.add("is-hidden");
    if (els.veilRow) els.veilRow.classList.add("is-hidden");
    if (els.tollRow) els.tollRow.classList.add("is-hidden");
    if (els.wakeRow) els.wakeRow.classList.add("is-hidden");
  }

  function hideMarks() {
    if (els.marksPanel) els.marksPanel.classList.add("is-hidden");
    if (els.markChainRow) els.markChainRow.classList.add("is-hidden");
    if (els.markHollowRow) els.markHollowRow.classList.add("is-hidden");
  }

  function hideAspects() {
    if (els.aspectsPanel) {
      els.aspectsPanel.classList.add("is-hidden");
      els.aspectsPanel.classList.remove("is-waiting", "is-sworn");
    }
  }

  function hideVows() {
    if (els.vowsPanel) {
      els.vowsPanel.classList.add("is-hidden");
      els.vowsPanel.classList.remove("is-sworn");
    }
  }

  function hideCrown() {
    if (els.crownPanel) els.crownPanel.classList.add("is-hidden");
  }

  function hideNames() {
    if (els.namesPanel) els.namesPanel.classList.add("is-hidden");
  }

  function renderChronicle() {
    if (!els.chronicleList) return;
    var n = state.chronicle ? state.chronicle.length : 0;
    var sig = String(n);
    if (n > 0) {
      var ids = [];
      var ci;
      for (ci = 0; ci < n; ci++) {
        ids.push(state.chronicle[ci].id);
      }
      sig = n + ":" + ids.join(",");
    }
    if (els.chronicleList.dataset.sig === sig) return;
    els.chronicleList.dataset.sig = sig;
    els.chronicleList.innerHTML = "";
    if (n === 0) {
      var empty = document.createElement("li");
      empty.className = "is-empty";
      empty.textContent = "The GodKing has not yet remembered.";
      els.chronicleList.appendChild(empty);
      return;
    }
    var i;
    for (i = 0; i < n; i++) {
      var row = state.chronicle[i];
      var li = document.createElement("li");
      li.textContent = CHRONICLE_LINES[row.id] || row.id;
      els.chronicleList.appendChild(li);
    }
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function formatElapsed(ms) {
    var sec = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    if (h > 0) return h + ":" + pad2(m) + ":" + pad2(s);
    return pad2(m) + ":" + pad2(s);
  }

  function renderStats() {
    var start = Number(state.runStartedAt) || Date.now();
    var elapsed = formatElapsed(Date.now() - start);
    if (els.statEmptying) {
      els.statEmptying.textContent = "This emptying: " + elapsed;
    }
    if (els.statAllTime) {
      els.statAllTime.textContent = "All-time souls: " + fmt(state.allTimeSouls);
    }
    if (els.statTributes) {
      els.statTributes.textContent = "Tributes laid: " + fmt(state.tributesLaid);
    }
    if (els.statNames) {
      var bound = Math.max(0, Math.min(12, Math.floor(Number(state.namesBound) || 0)));
      if (bound >= 1) {
        els.statNames.textContent = "Names bound: " + bound + " / 12";
        els.statNames.classList.remove("is-hidden");
      } else {
        els.statNames.classList.add("is-hidden");
      }
    }
    if (els.statVows) {
      var remembered = vowsKnownCount(state.vowsKnown);
      if (remembered >= 1) {
        els.statVows.textContent = "Vows remembered: " + remembered + " / 4";
        els.statVows.classList.remove("is-hidden");
      } else {
        els.statVows.classList.add("is-hidden");
      }
    }
  }

  function showToast(message) {
    if (!message) return;
    if (!els.toast || toastHold || toastActive) {
      toastQueue.push(message);
      return;
    }
    presentToast(message);
  }

  function presentToast(message) {
    if (!els.toast) return;
    toastActive = true;
    window.clearTimeout(toastTimer);
    els.toast.classList.remove("is-visible");
    void els.toast.offsetWidth;
    els.toast.textContent = message;
    els.toast.classList.remove("is-hidden");
    void els.toast.offsetWidth;
    els.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(function () {
      hideToast(false);
    }, TOAST_MS);
  }

  function hideToast(immediate) {
    if (!els.toast) return;
    window.clearTimeout(toastTimer);
    els.toast.classList.remove("is-visible");
    if (immediate) {
      toastQueue.length = 0;
      toastActive = false;
      els.toast.classList.add("is-hidden");
      return;
    }
    toastActive = false;
    if (toastQueue.length) {
      var next = toastQueue.shift();
      presentToast(next);
      return;
    }
    window.setTimeout(function () {
      if (!els.toast.classList.contains("is-visible") && !toastActive) {
        els.toast.classList.add("is-hidden");
      }
    }, 500);
  }

  function bindLabel(oneText, verb, k, unitOne, unitMany) {
    if (k <= 1) return oneText;
    return verb + " " + k + " " + unitMany;
  }


  function renderNames() {
    var n = Math.max(0, Math.min(12, Math.floor(Number(state.namesBound) || 0)));
    var open = n >= 1;
    if (els.namesPanel) els.namesPanel.classList.toggle("is-hidden", !open);
    if (!els.namesList) return;
    if (!open) return;
    var sig = "n" + n + (state.namesComplete ? "c" : "");
    if (els.namesList.dataset.sig === sig) return;
    els.namesList.dataset.sig = sig;
    els.namesList.innerHTML = "";
    var i;
    for (i = 0; i < 12; i++) {
      var li = document.createElement("li");
      if (i < n) {
        li.textContent = BOUND_NAMES[i];
      } else {
        li.textContent = "\u2014";
        li.className = "is-locked";
      }
      els.namesList.appendChild(li);
    }
  }

  function render() {
    var F = SoulgatherFormat;
    if (!els.soulsCount) return;

    var mult = rateMult();
    var gain = favorGain(state.lifetimeSouls);

    els.soulsCount.textContent = F.formatNumber(state.souls);
    els.soulsRate.textContent = F.formatRate(soulsPerSec());

    if (els.gatherBtn) {
      var still = normalizeVow(state.vow) === "stillness";
      els.gatherBtn.disabled = still;
      els.gatherBtn.setAttribute("aria-disabled", still ? "true" : "false");
    }

    if (els.soulsAsh) {
      var showAsh =
        state.unlockedMarks ||
        state.unlockedCensers ||
        state.unlockedPyres ||
        state.unlockedUrns ||
        state.unlockedHearths ||
        state.unlockedNightTithe ||
        state.unlockedChoir ||
        state.unlockedVeil ||
        state.unlockedWake ||
        state.unlockedChalices ||
        N.cmp(state.ash, 0) > 0 ||
        N.cmp(state.pyres, 0) > 0 ||
        N.cmp(state.urns, 0) > 0 ||
        N.cmp(state.hearths, 0) > 0;
      if (showAsh) {
        els.soulsAsh.textContent = "Ash " + F.formatNumber(state.ash);
        els.soulsAsh.classList.remove("is-hidden");
      } else {
        els.soulsAsh.classList.add("is-hidden");
      }
    }

    if (els.soulsFavor) {
      if (mult > 1) {
        els.soulsFavor.textContent = "Blessing " + formatMult(mult);
        els.soulsFavor.classList.remove("is-hidden");
      } else {
        els.soulsFavor.classList.add("is-hidden");
      }
    }

    if (els.soulsHymn) {
      if (hymnActive()) {
        var hLeft = Number(state.hymnLeft) || 0;
        els.soulsHymn.textContent = "Hymn ×1.25 — " + Math.ceil(hLeft) + "s";
        els.soulsHymn.classList.remove("is-hidden");
      } else {
        els.soulsHymn.classList.add("is-hidden");
      }
    }

    if (els.soulsWake) {
      if (wakeActive()) {
        var wHud = Number(state.wakeLeft) || 0;
        els.soulsWake.textContent = "Wake ×2 — " + Math.ceil(wHud) + "s";
        els.soulsWake.classList.remove("is-hidden");
      } else {
        els.soulsWake.classList.add("is-hidden");
      }
    }

    if (els.buyMode) {
      var buttons = els.buyMode.querySelectorAll("[data-mode]");
      var bi;
      for (bi = 0; bi < buttons.length; bi++) {
        var on = buttons[bi].getAttribute("data-mode") === state.buyMode;
        buttons[bi].classList.toggle("is-on", on);
        buttons[bi].setAttribute("aria-pressed", on ? "true" : "false");
      }
    }

    if (state.unlockedWell) {
      if (els.wellCard && els.wellCard.classList.contains("is-hidden")) {
        revealWell();
      }
      var wCost = wellCost(state.wellDepth);
      var canWell = N.cmp(state.souls, wCost) >= 0;
      var power = clickPower();
      els.wellOwned.textContent = F.formatNumber(state.wellDepth);
      els.wellPower.textContent =
        F.formatNumber(power) + (N.cmp(power, 1) === 0 ? " soul / click" : " souls / click");
      els.wellCost.textContent = F.formatNumber(wCost) + " Souls";
      els.wellBuy.disabled = !canWell;
      els.wellCard.classList.toggle("can-buy", canWell);
    }

    var shadePlan = purchasePlan(state.shades, state.souls);
    var canShade = shadePlan.can;
    els.shadeOwned.textContent = F.formatNumber(state.shades);
    els.shadeProd.textContent =
      F.formatNumber(shadeSoulsPerSec()) + " souls / sec";
    els.shadeCost.textContent = F.formatNumber(shadePlan.cost) + " Souls";
    els.shadeBuy.disabled = !canShade;
    els.shadeBuy.textContent = bindLabel("Bind a Shade", "Bind", shadePlan.k, "Shade", "Shades");
    els.shadeCard.classList.toggle("can-buy", canShade);
    els.shadeCard.classList.toggle("is-dormant", N.cmp(state.lifetimeSouls, 1) < 0);

    if (state.unlockedLanterns) {
      if (els.lanternCard && els.lanternCard.classList.contains("is-hidden")) {
        revealLanterns(false);
      }
      var lanternC = lanternCost(state.lanterns);
      var lMult = lanternMult(state.lanterns);
      var canLantern = N.cmp(state.souls, lanternC) >= 0;
      els.lanternOwned.textContent = F.formatNumber(state.lanterns);
      els.lanternProd.textContent = "Shade souls \u00d7" + formatTimes(lMult);
      els.lanternCost.textContent = F.formatNumber(lanternC) + " Souls";
      els.lanternBuy.disabled = !canLantern;
      els.lanternBuy.textContent = "Kindle a Lantern";
      els.lanternCard.classList.toggle("can-buy", canLantern);
    }

    if (state.unlockedSpirits) {
      if (els.spiritCard.classList.contains("is-hidden")) {
        revealSpirits(false);
      }
      var spiritPlan = purchasePlan(state.spirits, state.shades);
      els.spiritOwned.textContent = F.formatNumber(state.spirits);
      els.spiritProd.textContent =
        F.formatNumber(shadesPerSec()) + " shades / sec";
      els.spiritCost.textContent = F.formatNumber(spiritPlan.cost) + " Shades";
      els.spiritBuy.disabled = !spiritPlan.can;
      els.spiritBuy.textContent = bindLabel("Bind a Spirit", "Bind", spiritPlan.k, "Spirit", "Spirits");
      els.spiritCard.classList.toggle("can-buy", spiritPlan.can);
    }

    if (state.unlockedFetters) {
      if (els.fetterCard && els.fetterCard.classList.contains("is-hidden")) {
        revealFetters(false);
      }
      var fetterC = fetterCost(state.fetters);
      var fMult = fetterMult(state.fetters);
      var canFetter = N.cmp(state.shades, fetterC) >= 0;
      if (els.fetterOwned) els.fetterOwned.textContent = F.formatNumber(state.fetters);
      if (els.fetterProd) els.fetterProd.textContent = "Spirit shades \u00d7" + formatTimes(fMult);
      if (els.fetterCost) els.fetterCost.textContent = F.formatNumber(fetterC) + " Shades";
      if (els.fetterBuy) {
        els.fetterBuy.disabled = !canFetter;
        els.fetterBuy.textContent = "Bind a Fetter";
      }
      if (els.fetterCard) els.fetterCard.classList.toggle("can-buy", canFetter);
    }

    if (state.unlockedVessels) {
      if (els.vesselCard.classList.contains("is-hidden")) {
        revealVessels(false);
      }
      var vesselPlan = purchasePlan(state.vessels, state.spirits);
      els.vesselOwned.textContent = F.formatNumber(state.vessels);
      els.vesselProd.textContent =
        F.formatNumber(spiritsPerSec()) + " spirits / sec";
      els.vesselCost.textContent = F.formatNumber(vesselPlan.cost) + " Spirits";
      els.vesselBuy.disabled = !vesselPlan.can;
      els.vesselBuy.textContent = bindLabel("Bind a Vessel", "Bind", vesselPlan.k, "Vessel", "Vessels");
      els.vesselCard.classList.toggle("can-buy", vesselPlan.can);
    }

    if (state.unlockedCensers) {
      if (els.censerCard && els.censerCard.classList.contains("is-hidden")) {
        revealCensers(false);
      }
      var censerC = censerCost(state.censers);
      var censerRate = N.mul(
        N.mul(
          N.mul(
            N.mul(N.mul(state.censers, CENSER_ASH_PER_SEC), rateMult()),
            nightMult(nightActive())
          ),
          hymnMult(hymnActive())
        ),
        wakeMult(wakeActive())
      );
      var canCenser = N.cmp(state.vessels, censerC) >= 0;
      els.censerOwned.textContent = F.formatNumber(state.censers);
      els.censerProd.textContent = F.formatNumber(censerRate) + " ash / sec";
      els.censerCost.textContent = F.formatNumber(censerC) + " Vessels";
      els.censerBuy.disabled = !canCenser;
      els.censerBuy.textContent = "Raise a Censer";
      els.censerCard.classList.toggle("can-buy", canCenser);
    }

    if (state.unlockedPyres) {
      if (els.pyreCard && els.pyreCard.classList.contains("is-hidden")) {
        revealPyres(false);
      }
      var pyrePlan = purchasePlan(state.pyres, state.censers, PYRE_COST_BASE, PYRE_COST_MULT);
      var pyreRate = N.mul(
        N.mul(
          N.mul(
            N.mul(
              N.mul(N.mul(state.pyres, PYRE_ASH_PER_SEC), rateMult()),
              nightMult(nightActive())
            ),
            hymnMult(hymnActive())
          ),
          cinderMult(state.cinderLevel)
        ),
        wakeMult(wakeActive())
      );
      if (els.pyreOwned) els.pyreOwned.textContent = F.formatNumber(state.pyres);
      if (els.pyreProd) els.pyreProd.textContent = F.formatNumber(pyreRate) + " ash / sec";
      if (els.pyreCost) els.pyreCost.textContent = F.formatNumber(pyrePlan.cost) + " Censers";
      if (els.pyreBuy) {
        els.pyreBuy.disabled = !pyrePlan.can;
        els.pyreBuy.textContent = bindLabel("Raise a Pyre", "Raise", pyrePlan.k, "Pyre", "Pyres");
      }
      if (els.pyreCard) els.pyreCard.classList.toggle("can-buy", pyrePlan.can);
    }

    if (state.unlockedUrns) {
      if (els.urnCard && els.urnCard.classList.contains("is-hidden")) {
        revealUrns(false);
      }
      var urnPlan = purchasePlan(state.urns, state.pyres, URN_COST_BASE, URN_COST_MULT);
      var urnRate = N.mul(
        N.mul(
          N.mul(
            N.mul(
              N.mul(N.mul(state.urns, URN_ASH_PER_SEC), rateMult()),
              nightMult(nightActive())
            ),
            hymnMult(hymnActive())
          ),
          urnRiteMult(state.urnRiteLevel)
        ),
        wakeMult(wakeActive())
      );
      if (els.urnOwned) els.urnOwned.textContent = F.formatNumber(state.urns);
      if (els.urnProd) els.urnProd.textContent = F.formatNumber(urnRate) + " ash / sec";
      if (els.urnCost) els.urnCost.textContent = F.formatNumber(urnPlan.cost) + " Pyres";
      if (els.urnBuy) {
        els.urnBuy.disabled = !urnPlan.can;
        els.urnBuy.textContent = bindLabel("Raise an Urn", "Raise", urnPlan.k, "Urn", "Urns");
      }
      if (els.urnCard) els.urnCard.classList.toggle("can-buy", urnPlan.can);
    }

    if (state.unlockedHearths) {
      if (els.hearthCard && els.hearthCard.classList.contains("is-hidden")) {
        revealHearths(false);
      }
      var hearthPlan = purchasePlan(state.hearths, state.urns, HEARTH_COST_BASE, HEARTH_COST_MULT);
      var hearthRate = N.mul(
        N.mul(
          N.mul(
            N.mul(
              N.mul(N.mul(state.hearths, HEARTH_ASH_PER_SEC), rateMult()),
              nightMult(nightActive())
            ),
            hymnMult(hymnActive())
          ),
          hearthRiteMult(state.hearthRiteLevel)
        ),
        wakeMult(wakeActive())
      );
      if (els.hearthOwned) els.hearthOwned.textContent = F.formatNumber(state.hearths);
      if (els.hearthProd) els.hearthProd.textContent = F.formatNumber(hearthRate) + " ash / sec";
      if (els.hearthCost) els.hearthCost.textContent = F.formatNumber(hearthPlan.cost) + " Urns";
      if (els.hearthBuy) {
        els.hearthBuy.disabled = !hearthPlan.can;
        els.hearthBuy.textContent = bindLabel("Kindle a Hearth", "Kindle", hearthPlan.k, "Hearth", "Hearths");
      }
      if (els.hearthCard) els.hearthCard.classList.toggle("can-buy", hearthPlan.can);
    }

    if (state.unlockedThrones) {
      if (els.throneCard.classList.contains("is-hidden")) {
        revealThrones(false);
      }
      var thronePlan = purchasePlan(state.thrones, state.vessels);
      var thronePct = Math.round(
        (normalizeAspect(state.aspect) === "dominion" ? 15 : 10) * state.thrones
      );
      els.throneOwned.textContent = F.formatNumber(state.thrones);
      els.throneProd.textContent = "+" + thronePct + "% production";
      els.throneCost.textContent = F.formatNumber(thronePlan.cost) + " Vessels";
      var throneBlocked = normalizeVow(state.vow) === "poverty";
      els.throneBuy.disabled = !thronePlan.can || throneBlocked;
      els.throneBuy.textContent = bindLabel("Raise a Throne", "Raise", thronePlan.k, "Throne", "Thrones");
      els.throneCard.classList.toggle("can-buy", thronePlan.can && !throneBlocked);
    }

    if (state.unlockedChalices) {
      if (els.chaliceCard && els.chaliceCard.classList.contains("is-hidden")) {
        revealChalices(false);
      }
      var cupPlan = chalicePlan();
      var chalicePct = Math.round(8 * (Number(state.chalices) || 0));
      if (els.chaliceOwned) els.chaliceOwned.textContent = F.formatNumber(state.chalices);
      if (els.chaliceProd) els.chaliceProd.textContent = "+" + chalicePct + "% production";
      if (els.chaliceCost) {
        els.chaliceCost.textContent = cupPlan.capped ? "\u2014" : F.formatNumber(cupPlan.cost) + " Ash";
      }
      if (els.chaliceBuy) {
        els.chaliceBuy.disabled = !cupPlan.can;
        if (cupPlan.capped) {
          els.chaliceBuy.textContent = "Raise a Chalice";
        } else {
          els.chaliceBuy.textContent = bindLabel("Raise a Chalice", "Raise", cupPlan.k, "Chalice", "Chalices");
        }
      }
      if (els.chaliceCard) els.chaliceCard.classList.toggle("can-buy", cupPlan.can);
    }

    var ritesOpen = !!state.unlockedWell || N.cmp(state.shades, 1) >= 0 || !!state.wellDraws || !!state.unlockedChoir || !!state.unlockedVeil || !!state.unlockedToll || !!state.unlockedWake || !!state.unlockedPyres || !!state.unlockedUrns;
    if (els.ritesPanel) {
      els.ritesPanel.classList.toggle("is-hidden", !ritesOpen);
    }
    if (ritesOpen) {
      var sCost = siphonCost(state.siphonLevel);
      var sMult = siphonMult(state.siphonLevel);
      if (els.siphonEffect) els.siphonEffect.textContent = "Siphon \u00d7" + formatTimes(sMult);
      if (els.siphonCost) els.siphonCost.textContent = F.formatNumber(sCost) + " Souls";
      if (els.siphonBuy) els.siphonBuy.disabled = N.cmp(state.souls, sCost) < 0;

      if (els.levyRow) {
        els.levyRow.classList.toggle("is-hidden", !state.unlockedSpirits);
      }
      if (state.unlockedSpirits) {
        var lCost = levyCost(state.levyLevel);
        var levyM = levyMult(state.levyLevel);
        if (els.levyEffect) els.levyEffect.textContent = "Levy \u00d7" + formatTimes(levyM);
        if (els.levyCost) els.levyCost.textContent = F.formatNumber(lCost) + " Shades";
        if (els.levyBuy) els.levyBuy.disabled = N.cmp(state.shades, lCost) < 0;
      }

      var cinderOpen = !!state.unlockedPyres;
      if (els.cinderRow) {
        els.cinderRow.classList.toggle("is-hidden", !cinderOpen);
      }
      if (cinderOpen) {
        var cCost = N.fromNumber(CINDER_COST);
        var cMult = cinderMult(state.cinderLevel);
        if (els.cinderEffect) els.cinderEffect.textContent = "Cinders \u00d7" + formatTimes(cMult);
        if (els.cinderCost) els.cinderCost.textContent = F.formatNumber(cCost) + " Ash";
        if (els.cinderBuy) els.cinderBuy.disabled = N.cmp(state.ash, cCost) < 0;
      }

      var urnRiteOpen = !!state.unlockedUrns;
      if (els.urnRiteRow) {
        els.urnRiteRow.classList.toggle("is-hidden", !urnRiteOpen);
      }
      if (urnRiteOpen) {
        var uCost = N.fromNumber(URN_RITE_COST);
        var uMult = urnRiteMult(state.urnRiteLevel);
        if (els.urnRiteEffect) els.urnRiteEffect.textContent = "Urn \u00d7" + formatTimes(uMult);
        if (els.urnRiteCost) els.urnRiteCost.textContent = F.formatNumber(uCost) + " Ash";
        if (els.urnRiteBuy) els.urnRiteBuy.disabled = N.cmp(state.ash, uCost) < 0;
      }

      var hearthRiteOpen = !!state.unlockedHearths;
      if (els.hearthRiteRow) {
        els.hearthRiteRow.classList.toggle("is-hidden", !hearthRiteOpen);
      }
      if (hearthRiteOpen) {
        var hCost = N.fromNumber(HEARTH_RITE_COST);
        var hMult = hearthRiteMult(state.hearthRiteLevel);
        if (els.hearthRiteEffect) els.hearthRiteEffect.textContent = "Hearth \u00d7" + formatTimes(hMult);
        if (els.hearthRiteCost) els.hearthRiteCost.textContent = F.formatNumber(hCost) + " Ash";
        if (els.hearthRiteBuy) els.hearthRiteBuy.disabled = N.cmp(state.ash, hCost) < 0;
      }

      var drawsOpen = !!state.unlockedWellDraws || !!state.wellDraws;
      if (els.wellDrawsRow) {
        els.wellDrawsRow.classList.toggle("is-hidden", !drawsOpen);
      }
      if (drawsOpen) {
        if (state.wellDraws) {
          if (els.wellDrawsEffect) els.wellDrawsEffect.textContent = "The well draws";
          if (els.wellDrawsCost) els.wellDrawsCost.textContent = "\u2014";
          if (els.wellDrawsBuy) {
            els.wellDrawsBuy.disabled = true;
            els.wellDrawsBuy.textContent = "The well draws";
          }
        } else {
          if (els.wellDrawsEffect) els.wellDrawsEffect.textContent = "Idle draw";
          if (els.wellDrawsCost) {
            els.wellDrawsCost.textContent = F.formatNumber(WELL_DRAWS_COST) + " Souls";
          }
          if (els.wellDrawsBuy) {
            els.wellDrawsBuy.disabled = N.cmp(state.souls, WELL_DRAWS_COST) < 0;
            els.wellDrawsBuy.textContent = "Let the Well Draw";
          }
        }
      }

      var titheOpen = !!state.unlockedWell;
      if (els.titheRow) {
        els.titheRow.classList.toggle("is-hidden", !titheOpen);
        els.titheRow.classList.toggle("is-burning", titheOpen && titheActive());
      }
      if (titheOpen) {
        var tLeft = Number(state.titheLeft) || 0;
        var tCost = currentTitheCost();
        if (els.titheEffect) {
          els.titheEffect.textContent = titheActive() ? "Burst \u00d72" : "Burst \u00d72 \u00b7 " + paidTitheSecs(state.longerTitheLevel) + "s";
        }
        if (els.titheCost) {
          els.titheCost.textContent = F.formatNumber(tCost) + " Souls";
        }
        if (els.titheBuy) {
          if (titheActive()) {
            els.titheBuy.disabled = true;
            els.titheBuy.textContent = "The tithe burns \u2014 " + Math.ceil(tLeft) + "s";
          } else {
            els.titheBuy.disabled = N.cmp(state.souls, tCost) < 0;
            els.titheBuy.textContent = "Pay the Tithe";
          }
        }
      }

      var nightOpen = !!state.unlockedNightTithe;
      if (els.nightTitheRow) {
        els.nightTitheRow.classList.toggle("is-hidden", !nightOpen);
        els.nightTitheRow.classList.toggle("is-burning", nightOpen && nightActive());
      }
      if (nightOpen) {
        var nLeft = Number(state.nightLeft) || 0;
        var nCost = nightTitheCost(state.ash);
        if (els.nightTitheEffect) {
          els.nightTitheEffect.textContent = nightActive() ? "Burst \u00d73" : "Burst \u00d73 \u00b7 " + nightSecs(state.deeperNightLevel) + "s";
        }
        if (els.nightTitheCost) {
          els.nightTitheCost.textContent = F.formatNumber(nCost) + " Ash";
        }
        if (els.nightTitheBuy) {
          if (nightActive()) {
            els.nightTitheBuy.disabled = true;
            els.nightTitheBuy.textContent = "Night burns \u2014 " + Math.ceil(nLeft) + "s";
          } else {
            els.nightTitheBuy.disabled =
              normalizeVow(state.vow) === "ember" || N.cmp(state.ash, NIGHT_TITHE_MIN) < 0;
            els.nightTitheBuy.textContent = "Pay the Night's Tithe";
          }
        }
      }

      var wakeOpen = !!state.unlockedWake;
      if (els.wakeRow) {
        els.wakeRow.classList.toggle("is-hidden", !wakeOpen);
        els.wakeRow.classList.toggle("is-burning", wakeOpen && wakeActive());
      }
      if (wakeOpen) {
        var wLeft = Number(state.wakeLeft) || 0;
        var wCost = N.fromNumber(WAKE_COST);
        if (els.wakeEffect) {
          els.wakeEffect.textContent = wakeActive() ? "Burst \u00d72" : "Burst \u00d72 \u00b7 " + paidWakeSecs(state.longerWakeLevel) + "s";
        }
        if (els.wakeCost) {
          els.wakeCost.textContent = F.formatNumber(wCost) + " Ash";
        }
        if (els.wakeBuy) {
          if (wakeActive()) {
            els.wakeBuy.disabled = true;
            els.wakeBuy.textContent = "The wake burns \u2014 " + Math.ceil(wLeft) + "s";
          } else {
            els.wakeBuy.disabled =
              normalizeVow(state.vow) === "ember" || N.cmp(state.ash, wCost) < 0;
            els.wakeBuy.textContent = "Keep the Wake";
          }
        }
      }

      var veilOpen = !!state.unlockedVeil;
      if (els.veilRow) {
        els.veilRow.classList.toggle("is-hidden", !veilOpen);
        els.veilRow.classList.toggle("is-burning", veilOpen && veilActive());
      }
      if (veilOpen) {
        var vLeft = Number(state.veilLeft) || 0;
        var vCost = veilCost(state.ash);
        if (els.veilEffect) {
          els.veilEffect.textContent = veilActive() ? "Burst \u00d72" : "Burst \u00d72 \u00b7 " + paidVeilSecs(state.longerVeilLevel) + "s";
        }
        if (els.veilCost) {
          els.veilCost.textContent = F.formatNumber(vCost) + " Ash";
        }
        if (els.veilBuy) {
          if (veilActive()) {
            els.veilBuy.disabled = true;
            els.veilBuy.textContent = "The veil thins \u2014 " + Math.ceil(vLeft) + "s";
          } else {
            els.veilBuy.disabled = N.cmp(state.ash, VEIL_MIN) < 0;
            els.veilBuy.textContent = "Thin the Veil";
          }
        }
      }

      var tollOpen = !!state.unlockedToll;
      if (els.tollRow) {
        els.tollRow.classList.toggle("is-hidden", !tollOpen);
        els.tollRow.classList.toggle("is-burning", tollOpen && tollActive());
      }
      if (tollOpen) {
        var oLeft = Number(state.tollLeft) || 0;
        var oCost = N.fromNumber(TOLL_COST);
        if (els.tollEffect) {
          els.tollEffect.textContent = tollActive() ? "Burst \u00d72" : "Burst \u00d72 \u00b7 " + paidTollSecs(state.deeperTollLevel) + "s";
        }
        if (els.tollCost) {
          els.tollCost.textContent = F.formatNumber(oCost) + " Souls";
        }
        if (els.tollBuy) {
          if (tollActive()) {
            els.tollBuy.disabled = true;
            els.tollBuy.textContent = "The toll sounds \u2014 " + Math.ceil(oLeft) + "s";
          } else {
            els.tollBuy.disabled = N.cmp(state.souls, oCost) < 0;
            els.tollBuy.textContent = "Sound the Toll";
          }
        }
      }

      var autoOpen = !!state.unlockedAutobind;
      if (els.autobindRow) {
        els.autobindRow.classList.toggle("is-hidden", !autoOpen);
        els.autobindRow.classList.toggle("is-on", autoOpen && !!state.autobind);
      }
      if (autoOpen) {
        if (els.autobindEffect) {
          els.autobindEffect.textContent = state.autobind ? "The well binds" : "Idle bind";
        }
        if (els.autobindBuy) {
          els.autobindBuy.disabled = false;
          els.autobindBuy.textContent = "Autobind Shades";
          els.autobindBuy.setAttribute("aria-pressed", state.autobind ? "true" : "false");
        }
      }

      var autoSpiritOpen = !!state.unlockedAutobindSpirits;
      if (els.autobindSpiritsRow) {
        els.autobindSpiritsRow.classList.toggle("is-hidden", !autoSpiritOpen);
        els.autobindSpiritsRow.classList.toggle("is-on", autoSpiritOpen && !!state.autobindSpirits);
      }
      if (autoSpiritOpen) {
        if (els.autobindSpiritsEffect) {
          els.autobindSpiritsEffect.textContent = state.autobindSpirits ? "The shackled bind" : "Idle bind";
        }
        if (els.autobindSpiritsBuy) {
          els.autobindSpiritsBuy.disabled = false;
          els.autobindSpiritsBuy.textContent = "Autobind Spirits";
          els.autobindSpiritsBuy.setAttribute("aria-pressed", state.autobindSpirits ? "true" : "false");
        }
      }

      var autoVesselOpen = !!state.unlockedAutobindVessels;
      if (els.autobindVesselsRow) {
        els.autobindVesselsRow.classList.toggle("is-hidden", !autoVesselOpen);
        els.autobindVesselsRow.classList.toggle("is-on", autoVesselOpen && !!state.autobindVessels);
      }
      if (autoVesselOpen) {
        if (els.autobindVesselsEffect) {
          els.autobindVesselsEffect.textContent = state.autobindVessels ? "The hollow fills" : "Idle bind";
        }
        if (els.autobindVesselsBuy) {
          els.autobindVesselsBuy.disabled = false;
          els.autobindVesselsBuy.textContent = "Autobind Vessels";
          els.autobindVesselsBuy.setAttribute("aria-pressed", state.autobindVessels ? "true" : "false");
        }
      }

      var autoLanternOpen = !!state.unlockedAutobindLanterns;
      if (els.autobindLanternsRow) {
        els.autobindLanternsRow.classList.toggle("is-hidden", !autoLanternOpen);
        els.autobindLanternsRow.classList.toggle("is-on", autoLanternOpen && !!state.autobindLanterns);
      }
      if (autoLanternOpen) {
        if (els.autobindLanternsEffect) {
          els.autobindLanternsEffect.textContent = state.autobindLanterns ? "The lights kindle" : "Idle bind";
        }
        if (els.autobindLanternsBuy) {
          els.autobindLanternsBuy.disabled = false;
          els.autobindLanternsBuy.textContent = "Autobind Lanterns";
          els.autobindLanternsBuy.setAttribute("aria-pressed", state.autobindLanterns ? "true" : "false");
        }
      }

      var autoFetterOpen = !!state.unlockedAutobindFetters;
      if (els.autobindFettersRow) {
        els.autobindFettersRow.classList.toggle("is-hidden", !autoFetterOpen);
        els.autobindFettersRow.classList.toggle("is-on", autoFetterOpen && !!state.autobindFetters);
      }
      if (autoFetterOpen) {
        if (els.autobindFettersEffect) {
          els.autobindFettersEffect.textContent = state.autobindFetters ? "The chain learns" : "Idle bind";
        }
        if (els.autobindFettersBuy) {
          els.autobindFettersBuy.disabled = false;
          els.autobindFettersBuy.textContent = "Autobind Fetters";
          els.autobindFettersBuy.setAttribute("aria-pressed", state.autobindFetters ? "true" : "false");
        }
      }

      var autoCenserOpen = !!state.unlockedAutobindCensers;
      if (els.autobindCensersRow) {
        els.autobindCensersRow.classList.toggle("is-hidden", !autoCenserOpen);
        els.autobindCensersRow.classList.toggle("is-on", autoCenserOpen && !!state.autobindCensers);
      }
      if (autoCenserOpen) {
        if (els.autobindCensersEffect) {
          els.autobindCensersEffect.textContent = state.autobindCensers ? "The smoke tends" : "Idle bind";
        }
        if (els.autobindCensersBuy) {
          els.autobindCensersBuy.disabled = false;
          els.autobindCensersBuy.textContent = "Autobind Censers";
          els.autobindCensersBuy.setAttribute("aria-pressed", state.autobindCensers ? "true" : "false");
        }
      }

      var autoThroneOpen = !!state.unlockedAutobindThrones;
      if (els.autobindThronesRow) {
        els.autobindThronesRow.classList.toggle("is-hidden", !autoThroneOpen);
        els.autobindThronesRow.classList.toggle("is-on", autoThroneOpen && !!state.autobindThrones);
      }
      if (autoThroneOpen) {
        if (els.autobindThronesEffect) {
          els.autobindThronesEffect.textContent = state.autobindThrones ? "The seat claims" : "Idle bind";
        }
        if (els.autobindThronesBuy) {
          els.autobindThronesBuy.disabled = false;
          els.autobindThronesBuy.textContent = "Autobind Thrones";
          els.autobindThronesBuy.setAttribute("aria-pressed", state.autobindThrones ? "true" : "false");
        }
      }

      var autoPyreOpen = !!state.unlockedAutobindPyres;
      if (els.autobindPyresRow) {
        els.autobindPyresRow.classList.toggle("is-hidden", !autoPyreOpen);
        els.autobindPyresRow.classList.toggle("is-on", autoPyreOpen && !!state.autobindPyres);
      }
      if (autoPyreOpen) {
        if (els.autobindPyresEffect) {
          els.autobindPyresEffect.textContent = state.autobindPyres ? "The coals tend" : "Idle bind";
        }
        if (els.autobindPyresBuy) {
          els.autobindPyresBuy.disabled = false;
          els.autobindPyresBuy.textContent = "Autobind Pyres";
          els.autobindPyresBuy.setAttribute("aria-pressed", state.autobindPyres ? "true" : "false");
        }
      }

      var autoUrnOpen = !!state.unlockedAutobindUrns;
      if (els.autobindUrnsRow) {
        els.autobindUrnsRow.classList.toggle("is-hidden", !autoUrnOpen);
        els.autobindUrnsRow.classList.toggle("is-on", autoUrnOpen && !!state.autobindUrns);
      }
      if (autoUrnOpen) {
        if (els.autobindUrnsEffect) {
          els.autobindUrnsEffect.textContent = state.autobindUrns ? "The vessel fills" : "Idle bind";
        }
        if (els.autobindUrnsBuy) {
          els.autobindUrnsBuy.disabled = false;
          els.autobindUrnsBuy.textContent = "Autobind Urns";
          els.autobindUrnsBuy.setAttribute("aria-pressed", state.autobindUrns ? "true" : "false");
        }
      }

      var autoHearthOpen = !!state.unlockedAutobindHearths;
      if (els.autobindHearthsRow) {
        els.autobindHearthsRow.classList.toggle("is-hidden", !autoHearthOpen);
        els.autobindHearthsRow.classList.toggle("is-on", autoHearthOpen && !!state.autobindHearths);
      }
      if (autoHearthOpen) {
        if (els.autobindHearthsEffect) {
          els.autobindHearthsEffect.textContent = state.autobindHearths ? "The hearth kindles" : "Idle bind";
        }
        if (els.autobindHearthsBuy) {
          els.autobindHearthsBuy.disabled = false;
          els.autobindHearthsBuy.textContent = "Autobind Hearths";
          els.autobindHearthsBuy.setAttribute("aria-pressed", state.autobindHearths ? "true" : "false");
        }
      }

      var autoChaliceOpen = !!state.unlockedAutobindChalices;
      if (els.autobindChalicesRow) {
        els.autobindChalicesRow.classList.toggle("is-hidden", !autoChaliceOpen);
        els.autobindChalicesRow.classList.toggle("is-on", autoChaliceOpen && !!state.autobindChalices);
      }
      if (autoChaliceOpen) {
        if (els.autobindChalicesEffect) {
          els.autobindChalicesEffect.textContent = state.autobindChalices ? "The cup fills" : "Idle bind";
        }
        if (els.autobindChalicesBuy) {
          els.autobindChalicesBuy.disabled = false;
          els.autobindChalicesBuy.textContent = "Autobind Chalices";
          els.autobindChalicesBuy.setAttribute("aria-pressed", state.autobindChalices ? "true" : "false");
        }
      }

      var choirOpen = !!state.unlockedChoir;
      if (els.choirRow) {
        els.choirRow.classList.toggle("is-hidden", !choirOpen);
      }
      if (choirOpen) {
        var choirN = Math.max(0, Math.min(CHOIR_MAX, Math.floor(Number(state.choirLevel) || 0)));
        var choirFrac = choirAshRate(choirN, state.ashenTideLevel);
        var choirPct = choirFrac * 100;
        var choirPctStr =
          Math.abs(choirPct - Math.round(choirPct)) < 0.05 ? String(Math.round(choirPct)) : choirPct.toFixed(1);
        if (els.choirEffect) {
          els.choirEffect.textContent = "Ash from shades " + choirPctStr + "%";
        }
        if (choirN >= CHOIR_MAX) {
          if (els.choirCost) els.choirCost.textContent = "\u2014";
          if (els.choirBuy) {
            els.choirBuy.disabled = true;
            els.choirBuy.textContent = "The choir is full.";
          }
        } else {
          if (els.choirCost) els.choirCost.textContent = F.formatNumber(CHOIR_LANTERN_COST) + " Lanterns";
          if (els.choirBuy) {
            els.choirBuy.disabled = N.cmp(state.lanterns, CHOIR_LANTERN_COST) < 0;
            els.choirBuy.textContent = "Raise the Choir";
          }
        }
      }
    }

    var marksOpen = !!state.unlockedMarks;
    if (els.marksPanel) {
      els.marksPanel.classList.toggle("is-hidden", !marksOpen);
    }
    if (marksOpen) {
      var eCost = markCost(state.emberLevel);
      var eMult = emberMult(state.emberLevel);
      if (els.markEmberEffect) els.markEmberEffect.textContent = "Shade souls \u00d7" + formatTimes(eMult);
      if (els.markEmberCost) els.markEmberCost.textContent = F.formatNumber(eCost) + " Ash";
      if (els.markEmberBuy) els.markEmberBuy.disabled = N.cmp(state.ash, eCost) < 0;

      if (els.markChainRow) {
        els.markChainRow.classList.toggle("is-hidden", !state.unlockedSpirits);
      }
      if (state.unlockedSpirits) {
        var chCost = markCost(state.chainLevel);
        var chMult = chainMult(state.chainLevel);
        if (els.markChainEffect) els.markChainEffect.textContent = "Spirit levy \u00d7" + formatTimes(chMult);
        if (els.markChainCost) els.markChainCost.textContent = F.formatNumber(chCost) + " Ash";
        if (els.markChainBuy) els.markChainBuy.disabled = N.cmp(state.ash, chCost) < 0;
      }

      if (els.markHollowRow) {
        els.markHollowRow.classList.toggle("is-hidden", !state.unlockedVessels);
      }
      if (state.unlockedVessels) {
        var hCost = markCost(state.hollowLevel);
        var hMult = hollowMult(state.hollowLevel);
        if (els.markHollowEffect) els.markHollowEffect.textContent = "Vessel house \u00d7" + formatTimes(hMult);
        if (els.markHollowCost) els.markHollowCost.textContent = F.formatNumber(hCost) + " Ash";
        if (els.markHollowBuy) els.markHollowBuy.disabled = N.cmp(state.ash, hCost) < 0;
      }
    }

    var aspectsOpen = (Number(state.favorEarned) || 0) >= 1;
    var sworn = normalizeAspect(state.aspect);
    if (els.aspectsPanel) {
      els.aspectsPanel.classList.toggle("is-hidden", !aspectsOpen);
      els.aspectsPanel.classList.toggle("is-waiting", aspectsOpen && !sworn);
      els.aspectsPanel.classList.toggle("is-sworn", aspectsOpen && !!sworn);
    }
    if (aspectsOpen) {
      if (els.aspectsSworn) {
        if (sworn) {
          els.aspectsSworn.textContent = "This emptying: " + (ASPECT_NAMES[sworn] || sworn) + ".";
          els.aspectsSworn.classList.remove("is-hidden");
        } else {
          els.aspectsSworn.classList.add("is-hidden");
        }
      }
      var rows = [
        { id: "harvest", el: els.aspectHarvestRow, btn: els.aspectHarvestBuy },
        { id: "binding", el: els.aspectBindingRow, btn: els.aspectBindingBuy },
        { id: "dominion", el: els.aspectDominionRow, btn: els.aspectDominionBuy }
      ];
      var ri;
      for (ri = 0; ri < rows.length; ri++) {
        var row = rows[ri];
        if (row.el) {
          row.el.classList.toggle("is-sworn", sworn === row.id);
          row.el.classList.toggle("is-dim", !!sworn && sworn !== row.id);
        }
        if (row.btn) {
          if (sworn) {
            row.btn.classList.add("is-hidden");
            row.btn.disabled = true;
          } else {
            row.btn.classList.remove("is-hidden");
            row.btn.disabled = false;
          }
        }
      }
    }

    var vowsOpen = (Number(state.favorEarned) || 0) >= 1;
    var swornVow = normalizeVow(state.vow);
    if (els.vowsPanel) {
      els.vowsPanel.classList.toggle("is-hidden", !vowsOpen);
      els.vowsPanel.classList.toggle("is-sworn", vowsOpen && !!swornVow);
    }
    if (vowsOpen) {
      if (els.vowsSworn) {
        if (swornVow) {
          els.vowsSworn.textContent = "This emptying: " + (VOW_NAMES[swornVow] || swornVow) + ".";
          els.vowsSworn.classList.remove("is-hidden");
        } else {
          els.vowsSworn.classList.add("is-hidden");
        }
      }
      var vowRows = [
        { id: "stillness", el: els.vowStillnessRow, btn: els.vowStillnessBuy },
        { id: "poverty", el: els.vowPovertyRow, btn: els.vowPovertyBuy },
        { id: "hunger", el: els.vowHungerRow, btn: els.vowHungerBuy },
        { id: "ember", el: els.vowEmberRow, btn: els.vowEmberBuy }
      ];
      var vi;
      for (vi = 0; vi < vowRows.length; vi++) {
        var vrow = vowRows[vi];
        if (vrow.el) {
          vrow.el.classList.toggle("is-sworn", swornVow === vrow.id);
          vrow.el.classList.toggle("is-dim", !!swornVow && swornVow !== vrow.id);
        }
        if (vrow.btn) {
          if (swornVow) {
            vrow.btn.classList.add("is-hidden");
            vrow.btn.disabled = true;
          } else {
            vrow.btn.classList.remove("is-hidden");
            vrow.btn.disabled = false;
          }
        }
      }
    }

    var tributeOffer = gain;
    if (gain >= 1 && !state.bonusFirstTribute) tributeOffer += 1;
    if (gain >= 1) tributeOffer += vowExtraFavor(state.vow, state.vowHungerPaid);
    var tributeReady = gain >= 1;
    if (els.tributePanel) {
      els.tributePanel.classList.toggle("is-hidden", !tributeReady);
    }
    if (els.tributeFootBtn) {
      els.tributeFootBtn.classList.toggle("is-hidden", !tributeReady);
    }
    if (tributeReady) {
      if (els.tributeFavor) {
        if (state.favor !== state.favorEarned) {
          els.tributeFavor.textContent =
            F.formatNumber(state.favor) +
            " (" +
            F.formatNumber(state.favorEarned) +
            " earned)";
        } else {
          els.tributeFavor.textContent = F.formatNumber(state.favor);
        }
      }
      if (els.tributeGain) els.tributeGain.textContent = F.formatNumber(tributeOffer) + " Favor";
      if (els.tributeMult) {
        els.tributeMult.textContent = formatMult(
          prodMult(state.favorEarned + tributeOffer, state.seatLevel, state.edictLevel, null, state.crownWeight, state.namesComplete, cupStartsChalices(state.cupEdictLevel), state.ossuaryLevel)
        );
      }
    }

    var reliquaryOpen = state.favorEarned >= 1;
    if (els.reliquaryPanel) {
      els.reliquaryPanel.classList.toggle("is-hidden", !reliquaryOpen);
    }
    if (reliquaryOpen) {
      if (els.reliquaryFavor) els.reliquaryFavor.textContent = F.formatNumber(state.favor);
      if (els.reliquaryEarned) els.reliquaryEarned.textContent = F.formatNumber(state.favorEarned);

      var edCost = edictCost(state.edictLevel);
      var ePct = Math.round(25 * state.edictLevel);
      if (els.edictEffect) els.edictEffect.textContent = "+" + ePct + "% production";
      if (els.edictCost) els.edictCost.textContent = F.formatNumber(edCost) + " Favor";
      if (els.edictBuy) {
        els.edictBuy.disabled = state.favor < edCost;
      }

      var mCost = memoryCost(state.memoryLevel);
      var memN = state.memoryLevel;
      if (els.memoryEffect) {
        els.memoryEffect.textContent =
          "+" +
          F.formatNumber(memN) +
          (memN === 1 ? " Shade at tribute" : " Shades at tribute");
      }
      if (els.memoryCost) els.memoryCost.textContent = F.formatNumber(mCost) + " Favor";
      if (els.memoryBuy) {
        els.memoryBuy.disabled = state.favor < mCost;
      }

      if (state.echoLevel >= 1) {
        if (els.echoEffect) els.echoEffect.textContent = "The Well Draws at tribute";
        if (els.echoCost) els.echoCost.textContent = "\u2014";
        if (els.echoBuy) {
          els.echoBuy.disabled = true;
          els.echoBuy.textContent = "The well remembers.";
        }
      } else {
        var xCost = echoCost(state.echoLevel);
        if (els.echoEffect) els.echoEffect.textContent = "The Well Draws at tribute";
        if (els.echoCost) els.echoCost.textContent = F.formatNumber(xCost) + " Favor";
        if (els.echoBuy) {
          els.echoBuy.disabled = !isFinite(xCost) || state.favor < xCost;
          els.echoBuy.textContent = "Speak the Echo";
        }
      }

      var stCost = seatCost(state.seatLevel);
      var seatN = state.seatLevel;
      if (els.seatEffect) {
        els.seatEffect.textContent =
          "+" +
          F.formatNumber(seatN) +
          (seatN === 1 ? " Throne at tribute" : " Thrones at tribute");
      }
      if (els.seatCost) els.seatCost.textContent = F.formatNumber(stCost) + " Favor";
      if (els.seatBuy) {
        els.seatBuy.disabled = state.favor < stCost;
      }

      var kCost = kindleCost(state.kindleLevel);
      var kindleN = state.kindleLevel;
      if (els.kindleEffect) {
        els.kindleEffect.textContent =
          "+" +
          F.formatNumber(kindleN) +
          (kindleN === 1 ? " Lantern at tribute" : " Lanterns at tribute");
      }
      if (els.kindleCost) els.kindleCost.textContent = F.formatNumber(kCost) + " Favor";
      if (els.kindleBuy) {
        els.kindleBuy.disabled = state.favor < kCost;
      }

      var aCost = ashenCost(state.ashenLevel);
      var ashenN = 10 * (Number(state.ashenLevel) || 0);
      if (els.ashenEffect) {
        els.ashenEffect.textContent =
          "+" +
          F.formatNumber(ashenN) +
          " Ash at tribute";
      }
      if (els.ashenCost) els.ashenCost.textContent = F.formatNumber(aCost) + " Favor";
      if (els.ashenBuy) {
        els.ashenBuy.disabled = state.favor < aCost;
      }

      var dCost = depthCost(state.depthLevel);
      var depthN = Number(state.depthLevel) || 0;
      if (els.depthEffect) {
        els.depthEffect.textContent =
          "+" +
          F.formatNumber(depthN) +
          " Well Depth at tribute";
      }
      if (els.depthCost) els.depthCost.textContent = F.formatNumber(dCost) + " Favor";
      if (els.depthBuy) {
        els.depthBuy.disabled = state.favor < dCost;
      }

      var ceCost = choirEdictCost(state.choirEdictLevel);
      var choirEdictN = Math.min(CHOIR_MAX, Math.max(0, Math.floor(Number(state.choirEdictLevel) || 0)));
      if (els.choirEdictEffect) {
        els.choirEdictEffect.textContent =
          "+" +
          F.formatNumber(choirEdictN) +
          (choirEdictN === 1 ? " Choir at tribute" : " Choir at tribute");
      }
      if (els.choirEdictCost) els.choirEdictCost.textContent = F.formatNumber(ceCost) + " Favor";
      if (els.choirEdictBuy) {
        els.choirEdictBuy.disabled = !isFinite(ceCost) || state.favor < ceCost;
      }

      var heCost = hymnEdictCost(state.hymnEdictLevel);
      var hymnEdictN = Math.max(0, Math.floor(Number(state.hymnEdictLevel) || 0));
      var hymnDur = hymnSecs(hymnEdictN);
      if (els.hymnEdictEffect) {
        els.hymnEdictEffect.textContent = "Hymn " + hymnDur + "s at tribute";
      }
      if (els.hymnEdictCost) els.hymnEdictCost.textContent = F.formatNumber(heCost) + " Favor";
      if (els.hymnEdictBuy) {
        els.hymnEdictBuy.disabled = !isFinite(heCost) || state.favor < heCost;
      }

      var smCost = smokeEdictCost(state.smokeEdictLevel);
      if (els.smokeEffect) {
        els.smokeEffect.textContent = "Autobind Censers at tribute";
      }
      if (els.smokeCost) els.smokeCost.textContent = F.formatNumber(smCost) + " Favor";
      if (els.smokeBuy) {
        els.smokeBuy.disabled = !isFinite(smCost) || state.favor < smCost;
      }

      var emCost = embersEdictCost(state.embersEdictLevel);
      var embersN = embersStartsPyres(state.embersEdictLevel);
      if (els.embersEffect) {
        els.embersEffect.textContent =
          "+" +
          F.formatNumber(embersN) +
          (embersN === 1 ? " Pyre at tribute" : " Pyres at tribute");
      }
      if (els.embersCost) els.embersCost.textContent = F.formatNumber(emCost) + " Favor";
      if (els.embersBuy) {
        els.embersBuy.disabled = !isFinite(emCost) || state.favor < emCost;
      }

      var urnECost = urnEdictCost(state.urnEdictLevel);
      var urnsN = urnEdictStartsUrns(state.urnEdictLevel);
      if (els.urnEdictEffect) {
        els.urnEdictEffect.textContent =
          "+" +
          F.formatNumber(urnsN) +
          (urnsN === 1 ? " Urn at tribute" : " Urns at tribute");
      }
      if (els.urnEdictCost) els.urnEdictCost.textContent = F.formatNumber(urnECost) + " Favor";
      if (els.urnEdictBuy) {
        els.urnEdictBuy.disabled = !isFinite(urnECost) || state.favor < urnECost;
      }

      var hearthECost = hearthEdictCost(state.hearthEdictLevel);
      var hearthsN = hearthEdictStartsHearths(state.hearthEdictLevel);
      if (els.hearthEdictEffect) {
        els.hearthEdictEffect.textContent =
          "+" +
          F.formatNumber(hearthsN) +
          (hearthsN === 1 ? " Hearth at tribute" : " Hearths at tribute");
      }
      if (els.hearthEdictCost) els.hearthEdictCost.textContent = F.formatNumber(hearthECost) + " Favor";
      if (els.hearthEdictBuy) {
        els.hearthEdictBuy.disabled = !isFinite(hearthECost) || state.favor < hearthECost;
      }

      var cinECost = cinderEdictCost(state.cinderEdictLevel);
      if (els.cinderEdictEffect) {
        els.cinderEdictEffect.textContent = "Autobind Pyres at tribute";
      }
      if (els.cinderEdictCost) els.cinderEdictCost.textContent = F.formatNumber(cinECost) + " Favor";
      if (els.cinderEdictBuy) {
        els.cinderEdictBuy.disabled = !isFinite(cinECost) || state.favor < cinECost;
      }

      var cutECost = cutEdictCost(state.cutEdictLevel);
      if (els.cutEdictEffect) {
        els.cutEdictEffect.textContent = "Autobind Urns at tribute";
      }
      if (els.cutEdictCost) els.cutEdictCost.textContent = F.formatNumber(cutECost) + " Favor";
      if (els.cutEdictBuy) {
        els.cutEdictBuy.disabled = !isFinite(cutECost) || state.favor < cutECost;
      }

      var tendingECost = tendingEdictCost(state.tendingEdictLevel);
      if (els.tendingEdictEffect) {
        els.tendingEdictEffect.textContent = "Autobind Hearths at tribute";
      }
      if (els.tendingEdictCost) els.tendingEdictCost.textContent = F.formatNumber(tendingECost) + " Favor";
      if (els.tendingEdictBuy) {
        els.tendingEdictBuy.disabled = !isFinite(tendingECost) || state.favor < tendingECost;
      }

      var cupECost = cupEdictCost(state.cupEdictLevel);
      var cupN = cupStartsChalices(state.cupEdictLevel);
      if (els.cupEffect) {
        els.cupEffect.textContent =
          "+" +
          F.formatNumber(cupN) +
          (cupN === 1 ? " Chalice at tribute" : " Chalices at tribute");
      }
      if (els.cupCost) els.cupCost.textContent = F.formatNumber(cupECost) + " Favor";
      if (els.cupBuy) {
        els.cupBuy.disabled = !isFinite(cupECost) || state.favor < cupECost;
      }

      var drECost = draughtEdictCost(state.draughtEdictLevel);
      if (els.draughtEdictEffect) {
        els.draughtEdictEffect.textContent = "Autobind Chalices at tribute";
      }
      if (els.draughtEdictCost) els.draughtEdictCost.textContent = F.formatNumber(drECost) + " Favor";
      if (els.draughtEdictBuy) {
        els.draughtEdictBuy.disabled = !isFinite(drECost) || state.favor < drECost;
      }

      var weCost = wakeEdictCost(state.wakeEdictLevel);
      var wakeEdictN = Math.max(0, Math.floor(Number(state.wakeEdictLevel) || 0));
      var wakeDur = wakeEdictStartsWake(wakeEdictN) ? wakeSecs(wakeEdictN) : 0;
      if (els.wakeEdictEffect) {
        els.wakeEdictEffect.textContent = "Wake " + wakeDur + "s at tribute";
      }
      if (els.wakeEdictCost) els.wakeEdictCost.textContent = F.formatNumber(weCost) + " Favor";
      if (els.wakeEdictBuy) {
        els.wakeEdictBuy.disabled = !isFinite(weCost) || state.favor < weCost;
      }

      var peCost = processionEdictCost(state.processionEdictLevel);
      var processionEdictN = Math.max(0, Math.floor(Number(state.processionEdictLevel) || 0));
      var processionDur = processionEdictStartsProcession(processionEdictN) ? processionSecs(processionEdictN) : 0;
      if (els.processionEdictEffect) {
        els.processionEdictEffect.textContent = "Procession " + processionDur + "s at tribute";
      }
      if (els.processionEdictCost) els.processionEdictCost.textContent = F.formatNumber(peCost) + " Favor";
      if (els.processionEdictBuy) {
        els.processionEdictBuy.disabled = !isFinite(peCost) || state.favor < peCost;
      }

      var teCost = tollEdictCost(state.tollEdictLevel);
      var tollEdictN = Math.max(0, Math.floor(Number(state.tollEdictLevel) || 0));
      var tollDur = tollEdictStartsToll(tollEdictN) ? tollSecs(tollEdictN) : 0;
      if (els.tollEdictEffect) {
        els.tollEdictEffect.textContent = "Toll " + tollDur + "s at tribute";
      }
      if (els.tollEdictCost) els.tollEdictCost.textContent = F.formatNumber(teCost) + " Favor";
      if (els.tollEdictBuy) {
        els.tollEdictBuy.disabled = !isFinite(teCost) || state.favor < teCost;
      }

      var veCost = veilEdictCost(state.veilEdictLevel);
      var veilEdictN = Math.max(0, Math.floor(Number(state.veilEdictLevel) || 0));
      var veilDur = veilEdictStartsVeil(veilEdictN) ? veilSecs(veilEdictN) : 0;
      if (els.veilEdictEffect) {
        els.veilEdictEffect.textContent = "Veil " + veilDur + "s at tribute";
      }
      if (els.veilEdictCost) els.veilEdictCost.textContent = F.formatNumber(veCost) + " Favor";
      if (els.veilEdictBuy) {
        els.veilEdictBuy.disabled = !isFinite(veCost) || state.favor < veCost;
      }

      var neCost = nightEdictCost(state.nightEdictLevel);
      var nightEdictN = Math.max(0, Math.floor(Number(state.nightEdictLevel) || 0));
      var nightDur = nightEdictStartsNight(nightEdictN) ? nightEdictSecs(nightEdictN) : 0;
      if (els.nightEdictEffect) {
        els.nightEdictEffect.textContent = "Night " + nightDur + "s at tribute";
      }
      if (els.nightEdictCost) els.nightEdictCost.textContent = F.formatNumber(neCost) + " Favor";
      if (els.nightEdictBuy) {
        els.nightEdictBuy.disabled = !isFinite(neCost) || state.favor < neCost;
      }
    }

    var crownOpen = crownUnlocked();
    if (els.crownPanel) {
      els.crownPanel.classList.toggle("is-hidden", !crownOpen);
    }
    if (crownOpen) {
      if (els.crownFavor) els.crownFavor.textContent = F.formatNumber(state.favor);

      var cwCost = crownCost(state.crownWeight);
      var cwPct = Math.round(10 * (Number(state.crownWeight) || 0));
      if (els.crownWeightEffect) els.crownWeightEffect.textContent = "+" + cwPct + "% production";
      if (els.crownWeightCost) els.crownWeightCost.textContent = F.formatNumber(cwCost) + " Favor";
      if (els.crownWeightBuy) {
        els.crownWeightBuy.disabled = state.favor < cwCost;
      }

      var lmCost = longMemCost(state.longMemoryLevel);
      var lmN = Number(state.longMemoryLevel) || 0;
      if (els.crownMemoryEffect) {
        els.crownMemoryEffect.textContent =
          "+" +
          F.formatNumber(lmN) +
          (lmN === 1 ? " Fetter at tribute" : " Fetters at tribute");
      }
      if (els.crownMemoryCost) els.crownMemoryCost.textContent = F.formatNumber(lmCost) + " Favor";
      if (els.crownMemoryBuy) {
        els.crownMemoryBuy.disabled = state.favor < lmCost;
      }

      var qcCost = quietCourtCost(state.quietCourtLevel);
      var qcN = Number(state.quietCourtLevel) || 0;
      if (els.crownCourtEffect) {
        els.crownCourtEffect.textContent =
          quietCourtStartsUrnAutobind(qcN)
            ? "Autobind Shades, Lanterns, Fetters, Pyres, Chalices, Urns, and Hearths at tribute"
            : "Autobind Shades, Lanterns, Fetters, Pyres, Chalices, Urns, and Hearths at tribute";
      }
      if (els.crownCourtCost) els.crownCourtCost.textContent = F.formatNumber(qcCost) + " Favor";
      if (els.crownCourtBuy) {
        els.crownCourtBuy.disabled = state.favor < qcCost;
      }

      var remOpen = remembranceUnlocked();
      if (els.crownRemembrance) {
        if (remOpen) {
          els.crownRemembrance.classList.remove("is-hidden");
        } else {
          els.crownRemembrance.classList.add("is-hidden");
        }
      }
      if (els.crownRemembranceCount) {
        els.crownRemembranceCount.textContent = F.formatNumber(Number(state.remembrance) || 0);
      }
      if (els.remembranceLayRow) els.remembranceLayRow.classList.toggle("is-hidden", !remOpen);
      if (els.deeperNightRow) els.deeperNightRow.classList.toggle("is-hidden", !remOpen);
      if (els.ashenTideRow) els.ashenTideRow.classList.toggle("is-hidden", !remOpen);
      if (els.ossuaryRow) els.ossuaryRow.classList.toggle("is-hidden", !remOpen);
      if (els.processionRow) els.processionRow.classList.toggle("is-hidden", !remOpen);
      if (els.longerProcessionRow) els.longerProcessionRow.classList.toggle("is-hidden", !remOpen);
      if (els.deeperTollRow) els.deeperTollRow.classList.toggle("is-hidden", !remOpen);
      if (els.longerWakeRow) els.longerWakeRow.classList.toggle("is-hidden", !remOpen);
      if (els.longerTitheRow) els.longerTitheRow.classList.toggle("is-hidden", !remOpen);
      if (els.longerVeilRow) els.longerVeilRow.classList.toggle("is-hidden", !remOpen);
      if (els.longerHymnRow) els.longerHymnRow.classList.toggle("is-hidden", !remOpen);
      if (remOpen) {
        var rCost = remembranceFavorCost();
        if (els.remembranceLayCost) els.remembranceLayCost.textContent = F.formatNumber(rCost) + " Favor";
        if (els.remembranceLayBuy) {
          els.remembranceLayBuy.disabled = state.favor < rCost;
        }

        var dnCost = deeperNightCost(state.deeperNightLevel);
        var dnSecs = nightSecs(state.deeperNightLevel);
        if (els.deeperNightEffect) {
          els.deeperNightEffect.textContent = "Night's Tithe " + dnSecs + "s";
        }
        if (els.deeperNightCost) els.deeperNightCost.textContent = F.formatNumber(dnCost) + " Remembrance";
        if (els.deeperNightBuy) {
          els.deeperNightBuy.disabled = !isFinite(dnCost) || (Number(state.remembrance) || 0) < dnCost;
        }

        var atLevel = Math.max(0, Math.floor(Number(state.ashenTideLevel) || 0));
        var atFrac = ashFromShadeFrac(atLevel);
        var atPct = atFrac * 100;
        var atPctStr =
          Math.abs(atPct - Math.round(atPct)) < 0.05 ? String(Math.round(atPct)) : atPct.toFixed(1);
        var atCost = ashenTideCost(atLevel);
        if (els.ashenTideEffect) {
          els.ashenTideEffect.textContent = "Ash from shades " + atPctStr + "%";
        }
        if (atLevel >= ASHEN_TIDE_MAX) {
          if (els.ashenTideCost) els.ashenTideCost.textContent = "\u2014";
          if (els.ashenTideBuy) {
            els.ashenTideBuy.disabled = true;
            els.ashenTideBuy.textContent = "The tide is full.";
          }
        } else {
          if (els.ashenTideCost) els.ashenTideCost.textContent = F.formatNumber(atCost) + " Remembrance";
          if (els.ashenTideBuy) {
            els.ashenTideBuy.disabled = !isFinite(atCost) || (Number(state.remembrance) || 0) < atCost;
            els.ashenTideBuy.textContent = "Raise the Tide";
          }
        }

        var ossLevel = Math.max(0, Math.min(OSSUARY_MAX, Math.floor(Number(state.ossuaryLevel) || 0)));
        var ossPct = Math.round(5 * ossLevel);
        var ossCost = ossuaryCost(ossLevel);
        if (els.ossuaryEffect) {
          els.ossuaryEffect.textContent = "+" + ossPct + "% production";
        }
        if (ossLevel >= OSSUARY_MAX) {
          if (els.ossuaryCost) els.ossuaryCost.textContent = "\u2014";
          if (els.ossuaryBuy) {
            els.ossuaryBuy.disabled = true;
            els.ossuaryBuy.textContent = "The ossuary is full.";
          }
        } else {
          if (els.ossuaryCost) els.ossuaryCost.textContent = F.formatNumber(ossCost) + " Remembrance";
          if (els.ossuaryBuy) {
            els.ossuaryBuy.disabled = !isFinite(ossCost) || (Number(state.remembrance) || 0) < ossCost;
            els.ossuaryBuy.textContent = "Lay the Bone";
          }
        }

        var pLeft = Number(state.processionLeft) || 0;
        var pOn = processionActive();
        var paidSecs = paidProcessionSecs(state.longerProcessionLevel);
        if (els.processionRow) els.processionRow.classList.toggle("is-burning", pOn);
        if (els.processionEffect) {
          els.processionEffect.textContent = pOn ? "\u00d71.2 production" : "\u00d71.2 production \u00b7 " + paidSecs + "s";
        }
        if (els.processionCost) {
          els.processionCost.textContent = F.formatNumber(PROCESSION_COST) + " Remembrance";
        }
        if (els.processionBuy) {
          if (pOn) {
            els.processionBuy.disabled = true;
            els.processionBuy.textContent = "They walk \u2014 " + Math.ceil(pLeft) + "s";
          } else {
            els.processionBuy.disabled = (Number(state.remembrance) || 0) < PROCESSION_COST;
            els.processionBuy.textContent = "Begin the Procession";
          }
        }

        var lpLevel = Math.max(0, Math.min(LONGER_PROCESSION_MAX, Math.floor(Number(state.longerProcessionLevel) || 0)));
        var lpCost = longerProcessionCost(lpLevel);
        var lpSecs = paidProcessionSecs(lpLevel);
        if (els.longerProcessionEffect) {
          els.longerProcessionEffect.textContent = "Procession " + lpSecs + "s";
        }
        if (lpLevel >= LONGER_PROCESSION_MAX) {
          if (els.longerProcessionCost) els.longerProcessionCost.textContent = "\u2014";
          if (els.longerProcessionBuy) {
            els.longerProcessionBuy.disabled = true;
            els.longerProcessionBuy.textContent = "The hall is longest.";
          }
        } else {
          if (els.longerProcessionCost) els.longerProcessionCost.textContent = F.formatNumber(lpCost) + " Remembrance";
          if (els.longerProcessionBuy) {
            els.longerProcessionBuy.disabled = !isFinite(lpCost) || (Number(state.remembrance) || 0) < lpCost;
            els.longerProcessionBuy.textContent = "Lengthen the Walk";
          }
        }

        var dtLevel = Math.max(0, Math.min(DEEPER_TOLL_MAX, Math.floor(Number(state.deeperTollLevel) || 0)));
        var dtCost = deeperTollCost(dtLevel);
        var dtSecs = paidTollSecs(dtLevel);
        if (els.deeperTollEffect) {
          els.deeperTollEffect.textContent = "Toll " + dtSecs + "s";
        }
        if (dtLevel >= DEEPER_TOLL_MAX) {
          if (els.deeperTollCost) els.deeperTollCost.textContent = "\u2014";
          if (els.deeperTollBuy) {
            els.deeperTollBuy.disabled = true;
            els.deeperTollBuy.textContent = "The answer lingers longest.";
          }
        } else {
          if (els.deeperTollCost) els.deeperTollCost.textContent = F.formatNumber(dtCost) + " Remembrance";
          if (els.deeperTollBuy) {
            els.deeperTollBuy.disabled = !isFinite(dtCost) || (Number(state.remembrance) || 0) < dtCost;
            els.deeperTollBuy.textContent = "Lengthen the Toll";
          }
        }

        var lwLevel = Math.max(0, Math.min(LONGER_WAKE_MAX, Math.floor(Number(state.longerWakeLevel) || 0)));
        var lwCost = longerWakeCost(lwLevel);
        var lwSecs = paidWakeSecs(lwLevel);
        if (els.longerWakeEffect) {
          els.longerWakeEffect.textContent = "Wake " + lwSecs + "s";
        }
        if (lwLevel >= LONGER_WAKE_MAX) {
          if (els.longerWakeCost) els.longerWakeCost.textContent = "\u2014";
          if (els.longerWakeBuy) {
            els.longerWakeBuy.disabled = true;
            els.longerWakeBuy.textContent = "The fire lingers longest.";
          }
        } else {
          if (els.longerWakeCost) els.longerWakeCost.textContent = F.formatNumber(lwCost) + " Remembrance";
          if (els.longerWakeBuy) {
            els.longerWakeBuy.disabled = !isFinite(lwCost) || (Number(state.remembrance) || 0) < lwCost;
            els.longerWakeBuy.textContent = "Lengthen the Wake";
          }
        }

        var ltLevel = Math.max(0, Math.min(LONGER_TITHE_MAX, Math.floor(Number(state.longerTitheLevel) || 0)));
        var ltCost = longerTitheCost(ltLevel);
        var ltSecs = paidTitheSecs(ltLevel);
        if (els.longerTitheEffect) {
          els.longerTitheEffect.textContent = "Tithe " + ltSecs + "s";
        }
        if (ltLevel >= LONGER_TITHE_MAX) {
          if (els.longerTitheCost) els.longerTitheCost.textContent = "\u2014";
          if (els.longerTitheBuy) {
            els.longerTitheBuy.disabled = true;
            els.longerTitheBuy.textContent = "The cut lingers longest.";
          }
        } else {
          if (els.longerTitheCost) els.longerTitheCost.textContent = F.formatNumber(ltCost) + " Remembrance";
          if (els.longerTitheBuy) {
            els.longerTitheBuy.disabled = !isFinite(ltCost) || (Number(state.remembrance) || 0) < ltCost;
            els.longerTitheBuy.textContent = "Lengthen the Tithe";
          }
        }

        var lvLevel = Math.max(0, Math.min(LONGER_VEIL_MAX, Math.floor(Number(state.longerVeilLevel) || 0)));
        var lvCost = longerVeilCost(lvLevel);
        var lvSecs = paidVeilSecs(lvLevel);
        if (els.longerVeilEffect) {
          els.longerVeilEffect.textContent = "Veil " + lvSecs + "s";
        }
        if (lvLevel >= LONGER_VEIL_MAX) {
          if (els.longerVeilCost) els.longerVeilCost.textContent = "\u2014";
          if (els.longerVeilBuy) {
            els.longerVeilBuy.disabled = true;
            els.longerVeilBuy.textContent = "The mouth stays nearest.";
          }
        } else {
          if (els.longerVeilCost) els.longerVeilCost.textContent = F.formatNumber(lvCost) + " Remembrance";
          if (els.longerVeilBuy) {
            els.longerVeilBuy.disabled = !isFinite(lvCost) || (Number(state.remembrance) || 0) < lvCost;
            els.longerVeilBuy.textContent = "Lengthen the Veil";
          }
        }

        var lhLevel = Math.max(0, Math.min(LONGER_HYMN_MAX, Math.floor(Number(state.longerHymnLevel) || 0)));
        var lhCost = longerHymnCost(lhLevel);
        var lhBonus = hymnBonusSecs(lhLevel);
        if (els.longerHymnEffect) {
          els.longerHymnEffect.textContent = "Hymn +" + lhBonus + "s";
        }
        if (lhLevel >= LONGER_HYMN_MAX) {
          if (els.longerHymnCost) els.longerHymnCost.textContent = "\u2014";
          if (els.longerHymnBuy) {
            els.longerHymnBuy.disabled = true;
            els.longerHymnBuy.textContent = "The song lingers longest.";
          }
        } else {
          if (els.longerHymnCost) els.longerHymnCost.textContent = F.formatNumber(lhCost) + " Remembrance";
          if (els.longerHymnBuy) {
            els.longerHymnBuy.disabled = !isFinite(lhCost) || (Number(state.remembrance) || 0) < lhCost;
            els.longerHymnBuy.textContent = "Lengthen the Hymn";
          }
        }
      }
    }

    renderNames();

    if (els.nextGoal) {
      els.nextGoal.textContent = nextGoal(state);
    }
    renderChronicle();
    renderStats();
  }

  function renderNames() {
    if (!els.namesPanel || !els.namesList) return;
    var n = Math.max(0, Math.min(12, Math.floor(Number(state.namesBound) || 0)));
    var show = n >= 1 || !!state.namesComplete;
    els.namesPanel.classList.toggle("is-hidden", !show);
    if (!show) return;
    var sig = n + ":" + (state.namesComplete ? "1" : "0");
    if (els.namesList.dataset.sig === sig) return;
    els.namesList.dataset.sig = sig;
    els.namesList.innerHTML = "";
    var i;
    for (i = 0; i < 12; i++) {
      var li = document.createElement("li");
      if (i < n) {
        li.textContent = BOUND_NAMES[i];
      } else {
        li.textContent = "\u2014";
        li.className = "is-locked";
      }
      els.namesList.appendChild(li);
    }
  }

  function tick(now) {
    if (!lastFrame) lastFrame = now;
    var dt = (now - lastFrame) / 1000;
    lastFrame = now;
    applyDt(dt, true);
    render();
    window.requestAnimationFrame(tick);
  }

  function bind() {
    els.soulsCount = document.getElementById("souls-count");
    els.soulsRate = document.getElementById("souls-rate");
    els.soulsAsh = document.getElementById("souls-ash");
    els.soulsFavor = document.getElementById("souls-favor");
    els.soulsHymn = document.getElementById("souls-hymn");
    els.soulsWake = document.getElementById("souls-wake");
    els.gatherBtn = document.getElementById("gather-btn");
    els.buyMode = document.getElementById("buy-mode");
    els.wellCard = document.getElementById("well-card");
    els.wellOwned = document.getElementById("well-owned");
    els.wellPower = document.getElementById("well-power");
    els.wellCost = document.getElementById("well-cost");
    els.wellBuy = document.getElementById("well-buy");
    els.shadeCard = document.getElementById("shade-card");
    els.shadeOwned = document.getElementById("shade-owned");
    els.shadeProd = document.getElementById("shade-prod");
    els.shadeCost = document.getElementById("shade-cost");
    els.shadeBuy = document.getElementById("shade-buy");
    els.lanternCard = document.getElementById("lantern-card");
    els.lanternOwned = document.getElementById("lantern-owned");
    els.lanternProd = document.getElementById("lantern-prod");
    els.lanternCost = document.getElementById("lantern-cost");
    els.lanternBuy = document.getElementById("lantern-buy");
    els.fetterCard = document.getElementById("fetter-card");
    els.fetterOwned = document.getElementById("fetter-owned");
    els.fetterProd = document.getElementById("fetter-prod");
    els.fetterCost = document.getElementById("fetter-cost");
    els.fetterBuy = document.getElementById("fetter-buy");
    els.spiritCard = document.getElementById("spirit-card");
    els.spiritOwned = document.getElementById("spirit-owned");
    els.spiritProd = document.getElementById("spirit-prod");
    els.spiritCost = document.getElementById("spirit-cost");
    els.spiritBuy = document.getElementById("spirit-buy");
    els.vesselCard = document.getElementById("vessel-card");
    els.vesselOwned = document.getElementById("vessel-owned");
    els.vesselProd = document.getElementById("vessel-prod");
    els.vesselCost = document.getElementById("vessel-cost");
    els.vesselBuy = document.getElementById("vessel-buy");
    els.censerCard = document.getElementById("censer-card");
    els.censerOwned = document.getElementById("censer-owned");
    els.censerProd = document.getElementById("censer-prod");
    els.censerCost = document.getElementById("censer-cost");
    els.censerBuy = document.getElementById("censer-buy");
    els.pyreCard = document.getElementById("pyre-card");
    els.pyreOwned = document.getElementById("pyre-owned");
    els.pyreProd = document.getElementById("pyre-prod");
    els.pyreCost = document.getElementById("pyre-cost");
    els.pyreBuy = document.getElementById("pyre-buy");
    els.urnCard = document.getElementById("urn-card");
    els.urnOwned = document.getElementById("urn-owned");
    els.urnProd = document.getElementById("urn-prod");
    els.urnCost = document.getElementById("urn-cost");
    els.urnBuy = document.getElementById("urn-buy");
    els.hearthCard = document.getElementById("hearth-card");
    els.hearthOwned = document.getElementById("hearth-owned");
    els.hearthProd = document.getElementById("hearth-prod");
    els.hearthCost = document.getElementById("hearth-cost");
    els.hearthBuy = document.getElementById("hearth-buy");
    els.throneCard = document.getElementById("throne-card");
    els.throneOwned = document.getElementById("throne-owned");
    els.throneProd = document.getElementById("throne-prod");
    els.throneCost = document.getElementById("throne-cost");
    els.throneBuy = document.getElementById("throne-buy");
    els.chaliceCard = document.getElementById("chalice-card");
    els.chaliceOwned = document.getElementById("chalice-owned");
    els.chaliceProd = document.getElementById("chalice-prod");
    els.chaliceCost = document.getElementById("chalice-cost");
    els.chaliceBuy = document.getElementById("chalice-buy");
    els.tributePanel = document.getElementById("tribute-panel");
    els.tributeFavor = document.getElementById("tribute-favor");
    els.tributeGain = document.getElementById("tribute-gain");
    els.tributeMult = document.getElementById("tribute-mult");
    els.tributeBtn = document.getElementById("tribute-btn");
    els.tributeFootBtn = document.getElementById("tribute-foot-btn");
    els.reliquaryPanel = document.getElementById("reliquary-panel");
    els.reliquaryFavor = document.getElementById("reliquary-favor");
    els.reliquaryEarned = document.getElementById("reliquary-earned");
    els.edictEffect = document.getElementById("edict-effect");
    els.edictCost = document.getElementById("edict-cost");
    els.edictBuy = document.getElementById("edict-buy");
    els.memoryEffect = document.getElementById("memory-effect");
    els.memoryCost = document.getElementById("memory-cost");
    els.memoryBuy = document.getElementById("memory-buy");
    els.echoEffect = document.getElementById("echo-effect");
    els.echoCost = document.getElementById("echo-cost");
    els.echoBuy = document.getElementById("echo-buy");
    els.seatEffect = document.getElementById("seat-effect");
    els.seatCost = document.getElementById("seat-cost");
    els.seatBuy = document.getElementById("seat-buy");
    els.kindleEffect = document.getElementById("kindle-effect");
    els.kindleCost = document.getElementById("kindle-cost");
    els.kindleBuy = document.getElementById("kindle-buy");
    els.ashenEffect = document.getElementById("ashen-effect");
    els.ashenCost = document.getElementById("ashen-cost");
    els.ashenBuy = document.getElementById("ashen-buy");
    els.depthEffect = document.getElementById("depth-effect");
    els.depthCost = document.getElementById("depth-cost");
    els.depthBuy = document.getElementById("depth-buy");
    els.choirEdictEffect = document.getElementById("choir-edict-effect");
    els.choirEdictCost = document.getElementById("choir-edict-cost");
    els.choirEdictBuy = document.getElementById("choir-edict-buy");
    els.hymnEdictEffect = document.getElementById("hymn-edict-effect");
    els.hymnEdictCost = document.getElementById("hymn-edict-cost");
    els.hymnEdictBuy = document.getElementById("hymn-edict-buy");
    els.smokeEffect = document.getElementById("smoke-effect");
    els.smokeCost = document.getElementById("smoke-cost");
    els.smokeBuy = document.getElementById("smoke-buy");
    els.embersEffect = document.getElementById("embers-effect");
    els.embersCost = document.getElementById("embers-cost");
    els.embersBuy = document.getElementById("embers-buy");
    els.urnEdictEffect = document.getElementById("urn-edict-effect");
    els.urnEdictCost = document.getElementById("urn-edict-cost");
    els.urnEdictBuy = document.getElementById("urn-edict-buy");
    els.hearthEdictEffect = document.getElementById("hearth-edict-effect");
    els.hearthEdictCost = document.getElementById("hearth-edict-cost");
    els.hearthEdictBuy = document.getElementById("hearth-edict-buy");
    els.cinderEdictEffect = document.getElementById("cinder-edict-effect");
    els.cinderEdictCost = document.getElementById("cinder-edict-cost");
    els.cinderEdictBuy = document.getElementById("cinder-edict-buy");
    els.cutEdictEffect = document.getElementById("cut-edict-effect");
    els.cutEdictCost = document.getElementById("cut-edict-cost");
    els.cutEdictBuy = document.getElementById("cut-edict-buy");
    els.tendingEdictEffect = document.getElementById("tending-edict-effect");
    els.tendingEdictCost = document.getElementById("tending-edict-cost");
    els.tendingEdictBuy = document.getElementById("tending-edict-buy");
    els.cupEffect = document.getElementById("cup-effect");
    els.cupCost = document.getElementById("cup-cost");
    els.cupBuy = document.getElementById("cup-buy");
    els.draughtEdictEffect = document.getElementById("draught-edict-effect");
    els.draughtEdictCost = document.getElementById("draught-edict-cost");
    els.draughtEdictBuy = document.getElementById("draught-edict-buy");
    els.wakeEdictEffect = document.getElementById("wake-edict-effect");
    els.wakeEdictCost = document.getElementById("wake-edict-cost");
    els.wakeEdictBuy = document.getElementById("wake-edict-buy");
    els.processionEdictEffect = document.getElementById("procession-edict-effect");
    els.processionEdictCost = document.getElementById("procession-edict-cost");
    els.processionEdictBuy = document.getElementById("procession-edict-buy");
    els.tollEdictEffect = document.getElementById("toll-edict-effect");
    els.tollEdictCost = document.getElementById("toll-edict-cost");
    els.tollEdictBuy = document.getElementById("toll-edict-buy");
    els.veilEdictEffect = document.getElementById("veil-edict-effect");
    els.veilEdictCost = document.getElementById("veil-edict-cost");
    els.veilEdictBuy = document.getElementById("veil-edict-buy");
    els.nightEdictEffect = document.getElementById("night-edict-effect");
    els.nightEdictCost = document.getElementById("night-edict-cost");
    els.nightEdictBuy = document.getElementById("night-edict-buy");
    els.ritesPanel = document.getElementById("rites-panel");
    els.siphonEffect = document.getElementById("siphon-effect");
    els.siphonCost = document.getElementById("siphon-cost");
    els.siphonBuy = document.getElementById("siphon-buy");
    els.levyRow = document.getElementById("levy-row");
    els.levyEffect = document.getElementById("levy-effect");
    els.levyCost = document.getElementById("levy-cost");
    els.levyBuy = document.getElementById("levy-buy");
    els.cinderRow = document.getElementById("cinder-row");
    els.cinderEffect = document.getElementById("cinder-effect");
    els.cinderCost = document.getElementById("cinder-cost");
    els.cinderBuy = document.getElementById("cinder-buy");
    els.urnRiteRow = document.getElementById("urn-rite-row");
    els.urnRiteEffect = document.getElementById("urn-rite-effect");
    els.urnRiteCost = document.getElementById("urn-rite-cost");
    els.urnRiteBuy = document.getElementById("urn-rite-buy");
    els.hearthRiteRow = document.getElementById("hearth-rite-row");
    els.hearthRiteEffect = document.getElementById("hearth-rite-effect");
    els.hearthRiteCost = document.getElementById("hearth-rite-cost");
    els.hearthRiteBuy = document.getElementById("hearth-rite-buy");
    els.wellDrawsRow = document.getElementById("well-draws-row");
    els.wellDrawsEffect = document.getElementById("well-draws-effect");
    els.wellDrawsCost = document.getElementById("well-draws-cost");
    els.wellDrawsBuy = document.getElementById("well-draws-buy");
    els.titheRow = document.getElementById("tithe-row");
    els.titheEffect = document.getElementById("tithe-effect");
    els.titheCost = document.getElementById("tithe-cost");
    els.titheBuy = document.getElementById("tithe-buy");
    els.nightTitheRow = document.getElementById("night-tithe-row");
    els.nightTitheEffect = document.getElementById("night-tithe-effect");
    els.nightTitheCost = document.getElementById("night-tithe-cost");
    els.nightTitheBuy = document.getElementById("night-tithe-buy");
    els.wakeRow = document.getElementById("wake-row");
    els.wakeEffect = document.getElementById("wake-effect");
    els.wakeCost = document.getElementById("wake-cost");
    els.wakeBuy = document.getElementById("wake-buy");
    els.choirRow = document.getElementById("choir-row");
    els.choirEffect = document.getElementById("choir-effect");
    els.choirCost = document.getElementById("choir-cost");
    els.choirBuy = document.getElementById("choir-buy");
    els.autobindRow = document.getElementById("autobind-row");
    els.autobindEffect = document.getElementById("autobind-effect");
    els.autobindBuy = document.getElementById("autobind-buy");
    els.autobindSpiritsRow = document.getElementById("autobind-spirits-row");
    els.autobindSpiritsEffect = document.getElementById("autobind-spirits-effect");
    els.autobindSpiritsBuy = document.getElementById("autobind-spirits-buy");
    els.autobindVesselsRow = document.getElementById("autobind-vessels-row");
    els.autobindVesselsEffect = document.getElementById("autobind-vessels-effect");
    els.autobindVesselsBuy = document.getElementById("autobind-vessels-buy");
    els.autobindLanternsRow = document.getElementById("autobind-lanterns-row");
    els.autobindLanternsEffect = document.getElementById("autobind-lanterns-effect");
    els.autobindLanternsBuy = document.getElementById("autobind-lanterns-buy");
    els.autobindFettersRow = document.getElementById("autobind-fetters-row");
    els.autobindFettersEffect = document.getElementById("autobind-fetters-effect");
    els.autobindFettersBuy = document.getElementById("autobind-fetters-buy");
    els.autobindCensersRow = document.getElementById("autobind-censers-row");
    els.autobindCensersEffect = document.getElementById("autobind-censers-effect");
    els.autobindCensersBuy = document.getElementById("autobind-censers-buy");
    els.autobindThronesRow = document.getElementById("autobind-thrones-row");
    els.autobindThronesEffect = document.getElementById("autobind-thrones-effect");
    els.autobindThronesBuy = document.getElementById("autobind-thrones-buy");
    els.autobindPyresRow = document.getElementById("autobind-pyres-row");
    els.autobindPyresEffect = document.getElementById("autobind-pyres-effect");
    els.autobindPyresBuy = document.getElementById("autobind-pyres-buy");
    els.autobindUrnsRow = document.getElementById("autobind-urns-row");
    els.autobindUrnsEffect = document.getElementById("autobind-urns-effect");
    els.autobindUrnsBuy = document.getElementById("autobind-urns-buy");
    els.autobindHearthsRow = document.getElementById("autobind-hearths-row");
    els.autobindHearthsEffect = document.getElementById("autobind-hearths-effect");
    els.autobindHearthsBuy = document.getElementById("autobind-hearths-buy");
    els.autobindChalicesRow = document.getElementById("autobind-chalices-row");
    els.autobindChalicesEffect = document.getElementById("autobind-chalices-effect");
    els.autobindChalicesBuy = document.getElementById("autobind-chalices-buy");
    els.veilRow = document.getElementById("veil-row");
    els.veilEffect = document.getElementById("veil-effect");
    els.veilCost = document.getElementById("veil-cost");
    els.veilBuy = document.getElementById("veil-buy");
    els.tollRow = document.getElementById("toll-row");
    els.tollEffect = document.getElementById("toll-effect");
    els.tollCost = document.getElementById("toll-cost");
    els.tollBuy = document.getElementById("toll-buy");
    els.crownPanel = document.getElementById("crown-panel");
    els.crownFavor = document.getElementById("crown-favor");
    els.crownWeightEffect = document.getElementById("crown-weight-effect");
    els.crownWeightCost = document.getElementById("crown-weight-cost");
    els.crownWeightBuy = document.getElementById("crown-weight-buy");
    els.crownMemoryEffect = document.getElementById("crown-memory-effect");
    els.crownMemoryCost = document.getElementById("crown-memory-cost");
    els.crownMemoryBuy = document.getElementById("crown-memory-buy");
    els.crownCourtEffect = document.getElementById("crown-court-effect");
    els.crownCourtCost = document.getElementById("crown-court-cost");
    els.crownCourtBuy = document.getElementById("crown-court-buy");
    els.crownRemembrance = document.getElementById("crown-remembrance");
    els.crownRemembranceCount = document.getElementById("crown-remembrance-count");
    els.remembranceLayRow = document.getElementById("remembrance-lay-row");
    els.remembranceLayEffect = document.getElementById("remembrance-lay-effect");
    els.remembranceLayCost = document.getElementById("remembrance-lay-cost");
    els.remembranceLayBuy = document.getElementById("remembrance-lay-buy");
    els.deeperNightRow = document.getElementById("deeper-night-row");
    els.deeperNightEffect = document.getElementById("deeper-night-effect");
    els.deeperNightCost = document.getElementById("deeper-night-cost");
    els.deeperNightBuy = document.getElementById("deeper-night-buy");
    els.ashenTideRow = document.getElementById("ashen-tide-row");
    els.ashenTideEffect = document.getElementById("ashen-tide-effect");
    els.ashenTideCost = document.getElementById("ashen-tide-cost");
    els.ashenTideBuy = document.getElementById("ashen-tide-buy");
    els.ossuaryRow = document.getElementById("ossuary-row");
    els.ossuaryEffect = document.getElementById("ossuary-effect");
    els.ossuaryCost = document.getElementById("ossuary-cost");
    els.ossuaryBuy = document.getElementById("ossuary-buy");
    els.processionRow = document.getElementById("procession-row");
    els.processionEffect = document.getElementById("procession-effect");
    els.processionCost = document.getElementById("procession-cost");
    els.processionBuy = document.getElementById("procession-buy");
    els.longerProcessionRow = document.getElementById("longer-procession-row");
    els.longerProcessionEffect = document.getElementById("longer-procession-effect");
    els.longerProcessionCost = document.getElementById("longer-procession-cost");
    els.longerProcessionBuy = document.getElementById("longer-procession-buy");
    els.deeperTollRow = document.getElementById("deeper-toll-row");
    els.deeperTollEffect = document.getElementById("deeper-toll-effect");
    els.deeperTollCost = document.getElementById("deeper-toll-cost");
    els.deeperTollBuy = document.getElementById("deeper-toll-buy");
    els.longerWakeRow = document.getElementById("longer-wake-row");
    els.longerWakeEffect = document.getElementById("longer-wake-effect");
    els.longerWakeCost = document.getElementById("longer-wake-cost");
    els.longerWakeBuy = document.getElementById("longer-wake-buy");
    els.longerTitheRow = document.getElementById("longer-tithe-row");
    els.longerTitheEffect = document.getElementById("longer-tithe-effect");
    els.longerTitheCost = document.getElementById("longer-tithe-cost");
    els.longerTitheBuy = document.getElementById("longer-tithe-buy");
    els.longerVeilRow = document.getElementById("longer-veil-row");
    els.longerVeilEffect = document.getElementById("longer-veil-effect");
    els.longerVeilCost = document.getElementById("longer-veil-cost");
    els.longerVeilBuy = document.getElementById("longer-veil-buy");
    els.longerHymnRow = document.getElementById("longer-hymn-row");
    els.longerHymnEffect = document.getElementById("longer-hymn-effect");
    els.longerHymnCost = document.getElementById("longer-hymn-cost");
    els.longerHymnBuy = document.getElementById("longer-hymn-buy");
    els.namesPanel = document.getElementById("names-bound");
    els.namesList = document.getElementById("names-bound-list");
    els.marksPanel = document.getElementById("marks-panel");
    els.markEmberEffect = document.getElementById("mark-ember-effect");
    els.markEmberCost = document.getElementById("mark-ember-cost");
    els.markEmberBuy = document.getElementById("mark-ember-buy");
    els.markChainRow = document.getElementById("mark-chain-row");
    els.markChainEffect = document.getElementById("mark-chain-effect");
    els.markChainCost = document.getElementById("mark-chain-cost");
    els.markChainBuy = document.getElementById("mark-chain-buy");
    els.markHollowRow = document.getElementById("mark-hollow-row");
    els.markHollowEffect = document.getElementById("mark-hollow-effect");
    els.markHollowCost = document.getElementById("mark-hollow-cost");
    els.markHollowBuy = document.getElementById("mark-hollow-buy");
    els.aspectsPanel = document.getElementById("aspects-panel");
    els.aspectsSworn = document.getElementById("aspects-sworn");
    els.aspectHarvestRow = document.getElementById("aspect-harvest-row");
    els.aspectHarvestBuy = document.getElementById("aspect-harvest-buy");
    els.aspectBindingRow = document.getElementById("aspect-binding-row");
    els.aspectBindingBuy = document.getElementById("aspect-binding-buy");
    els.aspectDominionRow = document.getElementById("aspect-dominion-row");
    els.aspectDominionBuy = document.getElementById("aspect-dominion-buy");
    els.vowsPanel = document.getElementById("vows-panel");
    els.vowsSworn = document.getElementById("vows-sworn");
    els.vowStillnessRow = document.getElementById("vow-stillness-row");
    els.vowStillnessBuy = document.getElementById("vow-stillness-buy");
    els.vowPovertyRow = document.getElementById("vow-poverty-row");
    els.vowPovertyBuy = document.getElementById("vow-poverty-buy");
    els.vowHungerRow = document.getElementById("vow-hunger-row");
    els.vowHungerBuy = document.getElementById("vow-hunger-buy");
    els.vowEmberRow = document.getElementById("vow-ember-row");
    els.vowEmberBuy = document.getElementById("vow-ember-buy");
    els.toast = document.getElementById("toast");
    els.resetBtn = document.getElementById("reset-btn");
    els.nextGoal = document.getElementById("next-goal");
    els.chronicleList = document.getElementById("chronicle-list");
    els.statEmptying = document.getElementById("stat-emptying");
    els.statAllTime = document.getElementById("stat-alltime");
    els.statTributes = document.getElementById("stat-tributes");
    els.statNames = document.getElementById("stat-names");
    els.statVows = document.getElementById("stat-vows");

    els.gatherBtn.addEventListener("click", harvest);
    els.wellBuy.addEventListener("click", buyWell);
    els.shadeBuy.addEventListener("click", buyShade);
    if (els.lanternBuy) els.lanternBuy.addEventListener("click", buyLantern);
    if (els.fetterBuy) els.fetterBuy.addEventListener("click", buyFetter);
    els.spiritBuy.addEventListener("click", buySpirit);
    els.vesselBuy.addEventListener("click", buyVessel);
    if (els.censerBuy) els.censerBuy.addEventListener("click", buyCenser);
    if (els.pyreBuy) els.pyreBuy.addEventListener("click", buyPyre);
    if (els.urnBuy) els.urnBuy.addEventListener("click", buyUrn);
    if (els.hearthBuy) els.hearthBuy.addEventListener("click", buyHearth);
    els.throneBuy.addEventListener("click", buyThrone);
    if (els.chaliceBuy) els.chaliceBuy.addEventListener("click", buyChalice);
    els.tributeBtn.addEventListener("click", layTribute);
    els.tributeFootBtn.addEventListener("click", layTribute);
    els.edictBuy.addEventListener("click", buyEdict);
    els.memoryBuy.addEventListener("click", buyMemory);
    if (els.echoBuy) els.echoBuy.addEventListener("click", buyEcho);
    if (els.seatBuy) els.seatBuy.addEventListener("click", buySeat);
    if (els.kindleBuy) els.kindleBuy.addEventListener("click", buyKindle);
    if (els.ashenBuy) els.ashenBuy.addEventListener("click", buyAshen);
    if (els.depthBuy) els.depthBuy.addEventListener("click", buyDepth);
    if (els.choirEdictBuy) els.choirEdictBuy.addEventListener("click", buyChoirEdict);
    if (els.hymnEdictBuy) els.hymnEdictBuy.addEventListener("click", buyHymnEdict);
    if (els.smokeBuy) els.smokeBuy.addEventListener("click", buySmokeEdict);
    if (els.embersBuy) els.embersBuy.addEventListener("click", buyEmbersEdict);
    if (els.urnEdictBuy) els.urnEdictBuy.addEventListener("click", buyUrnEdict);
    if (els.hearthEdictBuy) els.hearthEdictBuy.addEventListener("click", buyHearthEdict);
    if (els.cinderEdictBuy) els.cinderEdictBuy.addEventListener("click", buyCinderEdict);
    if (els.cutEdictBuy) els.cutEdictBuy.addEventListener("click", buyCutEdict);
    if (els.tendingEdictBuy) els.tendingEdictBuy.addEventListener("click", buyTendingEdict);
    if (els.cupBuy) els.cupBuy.addEventListener("click", buyCupEdict);
    if (els.draughtEdictBuy) els.draughtEdictBuy.addEventListener("click", buyDraughtEdict);
    if (els.wakeEdictBuy) els.wakeEdictBuy.addEventListener("click", buyWakeEdict);
    if (els.processionEdictBuy) els.processionEdictBuy.addEventListener("click", buyProcessionEdict);
    if (els.tollEdictBuy) els.tollEdictBuy.addEventListener("click", buyTollEdict);
    if (els.veilEdictBuy) els.veilEdictBuy.addEventListener("click", buyVeilEdict);
    if (els.nightEdictBuy) els.nightEdictBuy.addEventListener("click", buyNightEdict);
    if (els.siphonBuy) els.siphonBuy.addEventListener("click", buySiphon);
    if (els.levyBuy) els.levyBuy.addEventListener("click", buyLevy);
    if (els.cinderBuy) els.cinderBuy.addEventListener("click", buyCinders);
    if (els.urnRiteBuy) els.urnRiteBuy.addEventListener("click", buyUrnRite);
    if (els.hearthRiteBuy) els.hearthRiteBuy.addEventListener("click", buyHearthRite);
    if (els.wellDrawsBuy) els.wellDrawsBuy.addEventListener("click", buyWellDraws);
    if (els.titheBuy) els.titheBuy.addEventListener("click", payTithe);
    if (els.nightTitheBuy) els.nightTitheBuy.addEventListener("click", payNightTithe);
    if (els.wakeBuy) els.wakeBuy.addEventListener("click", keepWake);
    if (els.choirBuy) els.choirBuy.addEventListener("click", raiseChoir);
    if (els.autobindBuy) els.autobindBuy.addEventListener("click", toggleAutobind);
    if (els.autobindSpiritsBuy) els.autobindSpiritsBuy.addEventListener("click", toggleAutobindSpirits);
    if (els.autobindVesselsBuy) els.autobindVesselsBuy.addEventListener("click", toggleAutobindVessels);
    if (els.autobindLanternsBuy) els.autobindLanternsBuy.addEventListener("click", toggleAutobindLanterns);
    if (els.autobindFettersBuy) els.autobindFettersBuy.addEventListener("click", toggleAutobindFetters);
    if (els.autobindCensersBuy) els.autobindCensersBuy.addEventListener("click", toggleAutobindCensers);
    if (els.autobindThronesBuy) els.autobindThronesBuy.addEventListener("click", toggleAutobindThrones);
    if (els.autobindPyresBuy) els.autobindPyresBuy.addEventListener("click", toggleAutobindPyres);
    if (els.autobindUrnsBuy) els.autobindUrnsBuy.addEventListener("click", toggleAutobindUrns);
    if (els.autobindHearthsBuy) els.autobindHearthsBuy.addEventListener("click", toggleAutobindHearths);
    if (els.autobindChalicesBuy) els.autobindChalicesBuy.addEventListener("click", toggleAutobindChalices);
    if (els.veilBuy) els.veilBuy.addEventListener("click", thinVeil);
    if (els.tollBuy) els.tollBuy.addEventListener("click", soundToll);
    if (els.crownWeightBuy) els.crownWeightBuy.addEventListener("click", buyCrownWeight);
    if (els.crownMemoryBuy) els.crownMemoryBuy.addEventListener("click", buyLongMemory);
    if (els.crownCourtBuy) els.crownCourtBuy.addEventListener("click", buyQuietCourt);
    if (els.remembranceLayBuy) els.remembranceLayBuy.addEventListener("click", layRemembrance);
    if (els.deeperNightBuy) els.deeperNightBuy.addEventListener("click", buyDeeperNight);
    if (els.ashenTideBuy) els.ashenTideBuy.addEventListener("click", buyAshenTide);
    if (els.ossuaryBuy) els.ossuaryBuy.addEventListener("click", buyOssuary);
    if (els.processionBuy) els.processionBuy.addEventListener("click", beginProcession);
    if (els.longerProcessionBuy) els.longerProcessionBuy.addEventListener("click", buyLongerProcession);
    if (els.deeperTollBuy) els.deeperTollBuy.addEventListener("click", buyDeeperToll);
    if (els.longerWakeBuy) els.longerWakeBuy.addEventListener("click", buyLongerWake);
    if (els.longerTitheBuy) els.longerTitheBuy.addEventListener("click", buyLongerTithe);
    if (els.longerVeilBuy) els.longerVeilBuy.addEventListener("click", buyLongerVeil);
    if (els.longerHymnBuy) els.longerHymnBuy.addEventListener("click", buyLongerHymn);
    if (els.markEmberBuy) {
      els.markEmberBuy.addEventListener("click", function () {
        buyMark("ember");
      });
    }
    if (els.markChainBuy) {
      els.markChainBuy.addEventListener("click", function () {
        buyMark("chain");
      });
    }
    if (els.markHollowBuy) {
      els.markHollowBuy.addEventListener("click", function () {
        buyMark("hollow");
      });
    }
    if (els.aspectHarvestBuy) {
      els.aspectHarvestBuy.addEventListener("click", function () {
        swearAspect("harvest");
      });
    }
    if (els.aspectBindingBuy) {
      els.aspectBindingBuy.addEventListener("click", function () {
        swearAspect("binding");
      });
    }
    if (els.aspectDominionBuy) {
      els.aspectDominionBuy.addEventListener("click", function () {
        swearAspect("dominion");
      });
    }
    if (els.vowStillnessBuy) {
      els.vowStillnessBuy.addEventListener("click", function () {
        swearVow("stillness");
      });
    }
    if (els.vowPovertyBuy) {
      els.vowPovertyBuy.addEventListener("click", function () {
        swearVow("poverty");
      });
    }
    if (els.vowHungerBuy) {
      els.vowHungerBuy.addEventListener("click", function () {
        swearVow("hunger");
      });
    }
    if (els.vowEmberBuy) {
      els.vowEmberBuy.addEventListener("click", function () {
        swearVow("ember");
      });
    }
    els.resetBtn.addEventListener("click", resetGame);
    els.memoryPanel = document.getElementById("memory-panel");
    els.memoryText = document.getElementById("memory-text");
    els.memoryExport = document.getElementById("memory-export");
    els.memoryImport = document.getElementById("memory-import");
    if (els.memoryExport) els.memoryExport.addEventListener("click", exportMemory);
    if (els.memoryImport) els.memoryImport.addEventListener("click", importMemory);

    if (els.buyMode) {
      els.buyMode.addEventListener("click", function (ev) {
        var t = ev.target;
        if (!t || !t.getAttribute) return;
        var mode = t.getAttribute("data-mode");
        if (mode) setBuyMode(mode);
      });
    }

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        lastFrame = 0;
      }
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      var target = ev.target;
      var active = document.activeElement || target;
      if (isTypingTarget(target) || isTypingTarget(active)) return;

      var actionEl = active || target;
      var tag = actionEl && actionEl.tagName ? actionEl.tagName.toLowerCase() : "";
      var buttonEl = null;
      if (tag === "button") {
        buttonEl = actionEl;
      } else if (actionEl && actionEl.closest) {
        buttonEl = actionEl.closest("button");
      }
      var isGather =
        actionEl === els.gatherBtn ||
        target === els.gatherBtn ||
        buttonEl === els.gatherBtn;
      var otherButton = !!(buttonEl && !isGather);

      if (ev.key === "1") {
        setBuyMode("1");
        return;
      }
      if (ev.key === "2") {
        setBuyMode("10");
        return;
      }
      if (ev.key === "3") {
        setBuyMode("max");
        return;
      }

      if ((ev.key === "t" || ev.key === "T") && !otherButton) {
        if (state.unlockedWell && !titheActive() && N.cmp(state.souls, currentTitheCost()) >= 0) {
          ev.preventDefault();
          payTithe();
        }
        return;
      }
      if ((ev.key === "n" || ev.key === "N") && !otherButton) {
        if (normalizeVow(state.vow) === "ember") return;
        if (state.unlockedNightTithe && !nightActive() && N.cmp(state.ash, NIGHT_TITHE_MIN) >= 0) {
          ev.preventDefault();
          payNightTithe();
        }
        return;
      }
      if ((ev.key === "w" || ev.key === "W") && !otherButton) {
        if (normalizeVow(state.vow) === "ember") return;
        if (state.unlockedWake && !wakeActive() && N.cmp(state.ash, N.fromNumber(WAKE_COST)) >= 0) {
          ev.preventDefault();
          keepWake();
        }
        return;
      }
      if ((ev.key === "v" || ev.key === "V") && !otherButton) {
        if (state.unlockedVeil && !veilActive() && N.cmp(state.ash, VEIL_MIN) >= 0) {
          ev.preventDefault();
          thinVeil();
        }
        return;
      }
      if ((ev.key === "g" || ev.key === "G") && !otherButton) {
        if (state.unlockedToll && !tollActive() && N.cmp(state.souls, N.fromNumber(TOLL_COST)) >= 0) {
          ev.preventDefault();
          soundToll();
        }
        return;
      }
      if ((ev.key === "c" || ev.key === "C") && !otherButton) {
        var cinderCost = N.fromNumber(CINDER_COST);
        if (state.unlockedPyres && N.cmp(state.ash, cinderCost) >= 0) {
          ev.preventDefault();
          buyCinders();
        }
        return;
      }
      if ((ev.key === "u" || ev.key === "U") && !otherButton) {
        var urnRiteCost = N.fromNumber(URN_RITE_COST);
        if (state.unlockedUrns && N.cmp(state.ash, urnRiteCost) >= 0) {
          ev.preventDefault();
          buyUrnRite();
        }
        return;
      }
      if ((ev.key === "h" || ev.key === "H") && !otherButton) {
        var hearthRiteCost = N.fromNumber(HEARTH_RITE_COST);
        if (state.unlockedHearths && N.cmp(state.ash, hearthRiteCost) >= 0) {
          ev.preventDefault();
          buyHearthRite();
        }
        return;
      }
      if ((ev.key === "b" || ev.key === "B") && !otherButton) {
        if (
          remembranceUnlocked() &&
          (Number(state.ossuaryLevel) || 0) < OSSUARY_MAX &&
          (Number(state.remembrance) || 0) >= OSSUARY_COST
        ) {
          ev.preventDefault();
          buyOssuary();
        }
        return;
      }
      if ((ev.key === "p" || ev.key === "P") && !otherButton) {
        if (
          remembranceUnlocked() &&
          !processionActive() &&
          (Number(state.remembrance) || 0) >= PROCESSION_COST
        ) {
          ev.preventDefault();
          beginProcession();
        }
        return;
      }

      if (ev.key === " " || ev.key === "Enter") {
        if (tag === "summary" || tag === "a" || tag === "details") return;
        if (buttonEl && !isGather) return;
        if (isGather && ev.key === "Enter") return;
        if (ev.key === " ") ev.preventDefault();
        if (normalizeVow(state.vow) === "stillness") return;
        harvest();
      }
    });
  }

  function boot() {
    bind();
    toastHold = true;
    load();
    if (!state.runStartedAt) state.runStartedAt = Date.now();
    checkUnlock();
    if (state.unlockedWell) revealWell();
    if (state.unlockedLanterns) revealLanterns(false);
    if (state.unlockedSpirits) revealSpirits(false);
    if (state.unlockedFetters) revealFetters(false);
    if (state.unlockedVessels) revealVessels(false);
    if (state.unlockedThrones) revealThrones(false);
    if (state.unlockedCensers) revealCensers(false);
    if (state.unlockedPyres) revealPyres(false);
    if (state.unlockedUrns) revealUrns(false);
    if (state.unlockedHearths) revealHearths(false);
    if (state.unlockedChalices) revealChalices(false);
    render();
    if (pendingAwayToast) {
      toastQueue.unshift(pendingAwayToast);
      pendingAwayToast = null;
    }
    toastHold = false;
    if (!toastActive && toastQueue.length) {
      presentToast(toastQueue.shift());
    }
    window.setInterval(save, AUTOSAVE_MS);
    window.requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  globalThis.SoulgatherEconomy = {
    shadeCost: shadeCost,
    spiritCost: spiritCost,
    vesselCost: vesselCost,
    throneCost: throneCost,
    wellCost: wellCost,
    lanternCost: lanternCost,
    fetterCost: fetterCost,
    censerCost: censerCost,
    pyreCost: pyreCost,
    urnCost: urnCost,
    hearthCost: hearthCost,
    chaliceCost: chaliceCost,
    markCost: markCost,
    favorGain: favorGain,
    prestigeMult: prestigeMult,
    prodMult: prodMult,
    chaliceMult: chaliceMult,
    ossuaryMult: ossuaryMult,
    producerCost: producerCost,
    bulkCost: bulkCost,
    edictCost: edictCost,
    memoryCost: memoryCost,
    echoCost: echoCost,
    seatCost: seatCost,
    kindleCost: kindleCost,
    ashenCost: ashenCost,
    depthCost: depthCost,
    crownCost: crownCost,
    longMemCost: longMemCost,
    quietCourtCost: quietCourtCost,
    quietCourtStartsLanternAutobind: quietCourtStartsLanternAutobind,
    quietCourtStartsFetterAutobind: quietCourtStartsFetterAutobind,
    quietCourtStartsPyreAutobind: quietCourtStartsPyreAutobind,
    quietCourtStartsChaliceAutobind: quietCourtStartsChaliceAutobind,
    quietCourtStartsUrnAutobind: quietCourtStartsUrnAutobind,
    quietCourtStartsHearthAutobind: quietCourtStartsHearthAutobind,
    smokeEdictCost: smokeEdictCost,
    smokeStartsCenserAutobind: smokeStartsCenserAutobind,
    embersEdictCost: embersEdictCost,
    embersStartsPyres: embersStartsPyres,
    urnEdictCost: urnEdictCost,
    urnEdictStartsUrns: urnEdictStartsUrns,
    hearthEdictCost: hearthEdictCost,
    hearthEdictStartsHearths: hearthEdictStartsHearths,
    cinderEdictCost: cinderEdictCost,
    cinderEdictStartsPyreAutobind: cinderEdictStartsPyreAutobind,
    cutEdictCost: cutEdictCost,
    cutEdictStartsUrnAutobind: cutEdictStartsUrnAutobind,
    tendingEdictCost: tendingEdictCost,
    tendingEdictStartsHearthAutobind: tendingEdictStartsHearthAutobind,
    cupEdictCost: cupEdictCost,
    cupStartsChalices: cupStartsChalices,
    draughtEdictCost: draughtEdictCost,
    draughtStartsChaliceAutobind: draughtStartsChaliceAutobind,
    namesCompleteMult: namesCompleteMult,
    remembranceCostFavor: remembranceCostFavor,
    remembranceFavorCost: remembranceFavorCost,
    deeperNightCost: deeperNightCost,
    longerProcessionCost: longerProcessionCost,
    paidProcessionSecs: paidProcessionSecs,
    LONGER_PROCESSION_MAX: LONGER_PROCESSION_MAX,
    deeperTollCost: deeperTollCost,
    paidTollSecs: paidTollSecs,
    DEEPER_TOLL_MAX: DEEPER_TOLL_MAX,
    longerWakeCost: longerWakeCost,
    paidWakeSecs: paidWakeSecs,
    LONGER_WAKE_MAX: LONGER_WAKE_MAX,
    longerTitheCost: longerTitheCost,
    paidTitheSecs: paidTitheSecs,
    LONGER_TITHE_MAX: LONGER_TITHE_MAX,
    longerVeilCost: longerVeilCost,
    paidVeilSecs: paidVeilSecs,
    LONGER_VEIL_MAX: LONGER_VEIL_MAX,
    longerHymnCost: longerHymnCost,
    hymnBonusSecs: hymnBonusSecs,
    LONGER_HYMN_MAX: LONGER_HYMN_MAX,
    ashenTideCost: ashenTideCost,
    ossuaryCost: ossuaryCost,
    choirAshRate: choirAshRate,
    choirEdictCost: choirEdictCost,
    hymnEdictCost: hymnEdictCost,
    hymnMult: hymnMult,
    hymnSecs: hymnSecs,
    hymnLeftAfterTribute: hymnLeftAfterTribute,
    wakeEdictCost: wakeEdictCost,
    wakeSecs: wakeSecs,
    wakeEdictStartsWake: wakeEdictStartsWake,
    wakeLeftAfterTribute: wakeLeftAfterTribute,
    processionEdictCost: processionEdictCost,
    processionSecs: processionSecs,
    processionEdictStartsProcession: processionEdictStartsProcession,
    processionLeftAfterTribute: processionLeftAfterTribute,
    tollEdictCost: tollEdictCost,
    tollSecs: tollSecs,
    tollEdictStartsToll: tollEdictStartsToll,
    tollLeftAfterTribute: tollLeftAfterTribute,
    veilEdictCost: veilEdictCost,
    veilSecs: veilSecs,
    veilEdictStartsVeil: veilEdictStartsVeil,
    veilLeftAfterTribute: veilLeftAfterTribute,
    nightEdictCost: nightEdictCost,
    nightEdictSecs: nightEdictSecs,
    nightEdictStartsNight: nightEdictStartsNight,
    nightLeftAfterTribute: nightLeftAfterTribute,
    formatBlessing: formatBlessing,
    nightTitheSecs: nightTitheSecs,
    nightSecs: nightSecs,
    ashFromShadeFrac: ashFromShadeFrac,
    vowExtraFavor: vowExtraFavor,
    vowsKnownCount: vowsKnownCount,
    normalizeVow: normalizeVow,
    siphonCost: siphonCost,
    levyCost: levyCost,
    siphonMult: siphonMult,
    levyMult: levyMult,
    cinderMult: cinderMult,
    urnRiteMult: urnRiteMult,
    hearthRiteMult: hearthRiteMult,
    HEARTH_RITE_COST: HEARTH_RITE_COST,
    harvestMult: harvestMult,
    bindingMult: bindingMult,
    throneWeight: throneWeight,
    lanternMult: lanternMult,
    fetterMult: fetterMult,
    emberMult: emberMult,
    chainMult: chainMult,
    hollowMult: hollowMult,
    normalizeAspect: normalizeAspect,
    nextGoal: nextGoal,
    titheCost: titheCost,
    titheMult: titheMult,
    nightTitheCost: nightTitheCost,
    nightMult: nightMult,
    veilCost: veilCost,
    veilMult: veilMult,
    tollMult: tollMult,
    TOLL_COST: TOLL_COST,
    TOLL_SECS: TOLL_SECS,
    wakeMult: wakeMult,
    WAKE_COST: WAKE_COST,
    WAKE_SECS: WAKE_SECS,
    processionMult: processionMult,
    PROCESSION_COST: PROCESSION_COST,
    PROCESSION_SECS: PROCESSION_SECS,
    ashPerSec: ashPerSec
  };
})();
