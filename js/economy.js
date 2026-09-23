(function (global) {
  "use strict";

  var N = global.SoulgatherNum;
  var C = global.SoulgatherConfig;

  var COST_BASE = C.COST_BASE;
  var COST_MULT = C.COST_MULT;
  var WELL_COST_BASE = C.WELL_COST_BASE;
  var WELL_COST_MULT = C.WELL_COST_MULT;
  var WELL_EARLY_MULT = C.WELL_EARLY_MULT;
  var LANTERN_COST_BASE = C.LANTERN_COST_BASE;
  var LANTERN_COST_MULT = C.LANTERN_COST_MULT;
  var MARK_COST_BASE = C.MARK_COST_BASE;
  var MARK_COST_MULT = C.MARK_COST_MULT;
  var SHADE_SOULS_PER_SEC = C.SHADE_SOULS_PER_SEC;
  var SPIRIT_SHADES_PER_SEC = C.SPIRIT_SHADES_PER_SEC;
  var VESSEL_SPIRITS_PER_SEC = C.VESSEL_SPIRITS_PER_SEC;
  var CENSER_ASH_PER_SEC = C.CENSER_ASH_PER_SEC;
  var PYRE_ASH_PER_SEC = C.PYRE_ASH_PER_SEC;
  var PYRE_COST_BASE = C.PYRE_COST_BASE;
  var PYRE_COST_MULT = C.PYRE_COST_MULT;
  var URN_ASH_PER_SEC = C.URN_ASH_PER_SEC;
  var URN_COST_BASE = C.URN_COST_BASE;
  var URN_COST_MULT = C.URN_COST_MULT;
  var HEARTH_ASH_PER_SEC = C.HEARTH_ASH_PER_SEC;
  var HEARTH_COST_BASE = C.HEARTH_COST_BASE;
  var HEARTH_COST_MULT = C.HEARTH_COST_MULT;
  var BEACON_ASH_PER_SEC = C.BEACON_ASH_PER_SEC;
  var BEACON_COST_BASE = C.BEACON_COST_BASE;
  var BEACON_COST_MULT = C.BEACON_COST_MULT;
  var SPIRE_ASH_PER_SEC = C.SPIRE_ASH_PER_SEC;
  var SPIRE_COST_BASE = C.SPIRE_COST_BASE;
  var SPIRE_COST_MULT = C.SPIRE_COST_MULT;
  var OBELISK_ASH_PER_SEC = C.OBELISK_ASH_PER_SEC;
  var OBELISK_COST_BASE = C.OBELISK_COST_BASE;
  var OBELISK_COST_MULT = C.OBELISK_COST_MULT;
  var CHALICE_MAX = C.CHALICE_MAX;
  var CHALICE_COST_BASE = C.CHALICE_COST_BASE;
  var CHALICE_COST_MULT = C.CHALICE_COST_MULT;
  var ASH_FROM_SHADE_FRAC = C.ASH_FROM_SHADE_FRAC;
  var FETTER_COST_BASE = C.FETTER_COST_BASE;
  var FETTER_COST_MULT = C.FETTER_COST_MULT;
  var BULK_CAP = C.BULK_CAP;
  var TITHE_MIN = C.TITHE_MIN;
  var TITHE_FRAC = C.TITHE_FRAC;
  var TITHE_SECS = C.TITHE_SECS;
  var NIGHT_TITHE_MIN = C.NIGHT_TITHE_MIN;
  var NIGHT_TITHE_FRAC = C.NIGHT_TITHE_FRAC;
  var NIGHT_TITHE_SECS = C.NIGHT_TITHE_SECS;
  var VEIL_MIN = C.VEIL_MIN;
  var REMEMBRANCE_FAVOR_COST = C.REMEMBRANCE_FAVOR_COST;
  var FAVOR_SOULS_BASE = C.FAVOR_SOULS_BASE;
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
  var SIPHON_COST_BASE = C.SIPHON_COST_BASE;
  var LEVY_COST_BASE = C.LEVY_COST_BASE;
  var CINDER_COST_BASE = C.CINDER_COST_BASE;
  var CINDER_COST_MULT = C.CINDER_COST_MULT;
  var URN_RITE_COST_BASE = C.URN_RITE_COST_BASE;
  var URN_RITE_COST_MULT = C.URN_RITE_COST_MULT;
  var HEARTH_RITE_COST_BASE = C.HEARTH_RITE_COST_BASE;
  var HEARTH_RITE_COST_MULT = C.HEARTH_RITE_COST_MULT;
  var BEACON_RITE_COST_BASE = C.BEACON_RITE_COST_BASE;
  var BEACON_RITE_COST_MULT = C.BEACON_RITE_COST_MULT;
  var SPIRE_RITE_COST_BASE = C.SPIRE_RITE_COST_BASE;
  var SPIRE_RITE_COST_MULT = C.SPIRE_RITE_COST_MULT;
  var RITE_MULT_BASE = C.RITE_MULT_BASE;
  var BINDING_TOLL_COST_BASE = C.BINDING_TOLL_COST_BASE;
  var BINDING_TOLL_COST_MULT = C.BINDING_TOLL_COST_MULT;
  var BINDING_TOLL_MAX = C.BINDING_TOLL_MAX;
  var BINDING_TOLL_RATE = C.BINDING_TOLL_RATE;
  var BINDING_TOLL_COST_BONUS = C.BINDING_TOLL_COST_BONUS;
  var HOLLOW_SOUL_CLEAR_CAP = C.HOLLOW_SOUL_CLEAR_CAP;
  var HOLLOW_SOUL_CLEAR_FLOOR = C.HOLLOW_SOUL_CLEAR_FLOOR;
  var HOLLOW_ASH_CLEAR_FLOOR = C.HOLLOW_ASH_CLEAR_FLOOR;
  var HOLLOW_SHADE_CLEAR_FLOOR = C.HOLLOW_SHADE_CLEAR_FLOOR;
  var HOLLOW_CLEAR_FRAC = C.HOLLOW_CLEAR_FRAC;
  var NAME_THRESHOLDS = C.NAME_THRESHOLDS;

  var prestigeMult = C.prestigeMult;
  var harvestMult = C.harvestMult;
  var bindingMult = C.bindingMult;
  var throneWeight = C.throneWeight;
  var chaliceMult = C.chaliceMult;
  var ossuaryMult = C.ossuaryMult;
  var namesCompleteMult = C.namesCompleteMult;
  var titheMult = C.titheMult;
  var nightMult = C.nightMult;
  var veilMult = C.veilMult;
  var tollMult = C.tollMult;
  var hymnMult = C.hymnMult;
  var wakeMult = C.wakeMult;
  var processionMult = C.processionMult;
  var knellMult = C.knellMult;
  var hollowMult = C.hollowMult;
  var stacksWantedFromIdle = C.stacksWantedFromIdle;
  var favorOrdinal = C.favorOrdinal;
  var normalizeAspect = C.normalizeAspect;
  var normalizeVow = C.normalizeVow;

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

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  /* ── Producer costs ──────────────────────────────────────────────── */

  function producerCost(owned) {
    return N.cost(COST_BASE, COST_MULT, owned);
  }

  function shadeCost(owned, bindingTollLevel) {
    return N.mul(producerCost(owned), bindingTollCostMult(bindingTollLevel));
  }

  function spiritCost(owned, bindingTollLevel) {
    return N.mul(producerCost(owned), bindingTollCostMult(bindingTollLevel));
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

  function beaconCost(owned) {
    return N.cost(BEACON_COST_BASE, BEACON_COST_MULT, owned);
  }

  function spireCost(owned) {
    return N.cost(SPIRE_COST_BASE, SPIRE_COST_MULT, owned);
  }

  function obeliskCost(owned) {
    return N.cost(OBELISK_COST_BASE, OBELISK_COST_MULT, owned);
  }

  function chaliceCost(owned) {
    return N.cost(CHALICE_COST_BASE, CHALICE_COST_MULT, owned);
  }

  function markCost(level) {
    return N.cost(MARK_COST_BASE, MARK_COST_MULT, level);
  }

  function wellCost(depth) {
    var d = Math.max(0, Math.floor(Number(depth) || 0));
    if (d <= 5) {
      return N.cost(WELL_COST_BASE, WELL_EARLY_MULT, d);
    }
    return N.cost(WELL_COST_BASE, WELL_COST_MULT, d);
  }

  /* ── Bulk / max-affordable ───────────────────────────────────────── */

  function wellBulkCostLoop(owned, k) {
    var n = Math.max(0, Math.floor(k));
    if (n > BULK_CAP) n = BULK_CAP;
    var total = N.fromNumber(0);
    var baseDepth = Math.max(0, Math.floor(Number(owned) || 0));
    var i;
    for (i = 0; i < n; i++) {
      total = N.add(total, wellCost(baseDepth + i));
    }
    return total;
  }

  function wellMaxAffordableLoop(owned, currency) {
    var remaining = num(currency);
    var baseDepth = Math.max(0, Math.floor(Number(owned) || 0));
    var k = 0;
    while (k < BULK_CAP) {
      var c = wellCost(baseDepth + k);
      if (N.cmp(remaining, c) < 0) break;
      remaining = N.sub(remaining, c);
      k += 1;
    }
    return k;
  }

  function _geoSum(base, multVal, startIdx, count) {
    if (count <= 0) return N.fromNumber(0);
    var first = N.cost(base, multVal, startIdx);
    if (count === 1) return first;
    var multN = N.fromNumber(multVal);
    var multK = N.pow(multN, count);
    var num1 = N.sub(multK, 1);
    var den1 = N.fromNumber(multVal - 1);
    return N.floor(N.mul(first, N.div(num1, den1)));
  }

  function wellBulkCost(owned, k) {
    var n = Math.max(0, Math.floor(k));
    if (n > BULK_CAP) n = BULK_CAP;
    if (n <= 0) return N.fromNumber(0);
    var d = Math.max(0, Math.floor(Number(owned) || 0));
    if (d >= 6) {
      return _geoSum(WELL_COST_BASE, WELL_COST_MULT, d, n);
    }
    var earlyRemain = Math.max(0, 6 - d);
    if (n <= earlyRemain) {
      return _geoSum(WELL_COST_BASE, WELL_EARLY_MULT, d, n);
    }
    var earlyPart = _geoSum(WELL_COST_BASE, WELL_EARLY_MULT, d, earlyRemain);
    var latePart = _geoSum(WELL_COST_BASE, WELL_COST_MULT, 6, n - earlyRemain);
    return N.add(earlyPart, latePart);
  }

  function _geoMaxAffordable(base, multVal, startIdx, currency, cap) {
    var first = N.cost(base, multVal, startIdx);
    if (N.cmp(currency, first) < 0) return 0;
    var m1 = multVal - 1;
    var curN = N.toNumber(currency);
    var firstN = N.toNumber(first);
    var k;
    if (isFinite(curN) && isFinite(firstN) && firstN > 0 && curN < 1e300) {
      k = Math.floor(Math.log(1 + curN * m1 / firstN) / Math.log(multVal));
    } else {
      var ratio = N.div(N.mul(currency, N.fromNumber(m1)), first);
      var logArg = N.add(ratio, 1);
      var logArgN = N.toNumber(logArg);
      if (!isFinite(logArgN) || logArgN <= 0) {
        k = cap;
      } else {
        var log10Arg = Math.log(logArgN) / Math.LN10 + (logArg.e || 0);
        k = Math.floor(log10Arg / (Math.log(multVal) / Math.LN10));
      }
    }
    if (k < 0) k = 0;
    if (k > cap) k = cap;
    var cost_k = _geoSum(base, multVal, startIdx, k);
    while (k > 0 && N.cmp(cost_k, currency) > 0) {
      k -= 1;
      cost_k = _geoSum(base, multVal, startIdx, k);
    }
    var cost_k1 = _geoSum(base, multVal, startIdx, k + 1);
    while (k < cap && N.cmp(cost_k1, currency) <= 0) {
      k += 1;
      cost_k1 = _geoSum(base, multVal, startIdx, k + 1);
    }
    return k;
  }

  function wellMaxAffordable(owned, currency) {
    var cur = num(currency);
    if (N.cmp(cur, 0) <= 0) return 0;
    var d = Math.max(0, Math.floor(Number(owned) || 0));
    if (d >= 6) {
      return _geoMaxAffordable(WELL_COST_BASE, WELL_COST_MULT, d, cur, BULK_CAP);
    }
    var earlyRemain = 6 - d;
    var earlyK = _geoMaxAffordable(WELL_COST_BASE, WELL_EARLY_MULT, d, cur, earlyRemain);
    if (earlyK < earlyRemain) return earlyK;
    var earlyCost = _geoSum(WELL_COST_BASE, WELL_EARLY_MULT, d, earlyRemain);
    var leftover = N.sub(cur, earlyCost);
    if (N.cmp(leftover, 0) <= 0) return earlyRemain;
    var lateK = _geoMaxAffordable(WELL_COST_BASE, WELL_COST_MULT, 6, leftover, BULK_CAP - earlyRemain);
    return earlyRemain + lateK;
  }

  function wellPurchasePlan(owned, currency, buyMode) {
    var one = wellCost(owned);
    var mode = buyMode;
    if (mode === "10") {
      var k10 = wellMaxAffordable(owned, currency);
      if (k10 < 1) {
        return { k: 0, cost: one, can: false };
      }
      if (k10 > 10) k10 = 10;
      return { k: k10, cost: wellBulkCost(owned, k10), can: true };
    }
    if (mode === "max") {
      var k = wellMaxAffordable(owned, currency);
      if (k < 1) {
        return { k: 0, cost: one, can: false };
      }
      return { k: k, cost: wellBulkCost(owned, k), can: true };
    }
    return { k: 1, cost: one, can: N.cmp(currency, one) >= 0 };
  }

  function bulkCostLoop(base, owned, k, mult, extraMult) {
    var b = Number(base);
    if (!isFinite(b) || b <= 0) b = COST_BASE;
    if (mult == null) mult = COST_MULT;
    var em = extraMult == null ? 1 : Number(extraMult);
    if (!isFinite(em) || em <= 0) em = 1;
    var n = Math.max(0, Math.floor(k));
    if (n > BULK_CAP) n = BULK_CAP;
    var total = N.fromNumber(0);
    var i;
    for (i = 0; i < n; i++) {
      var unit = N.cost(b, mult, addOwned(owned, i));
      if (em !== 1) unit = N.mul(unit, em);
      total = N.add(total, unit);
    }
    return total;
  }

  function maxAffordableLoop(base, owned, currency, mult, extraMult) {
    var b = Number(base);
    if (!isFinite(b) || b <= 0) b = COST_BASE;
    if (mult == null) mult = COST_MULT;
    var em = extraMult == null ? 1 : Number(extraMult);
    if (!isFinite(em) || em <= 0) em = 1;
    var remaining = num(currency);
    var k = 0;
    while (k < BULK_CAP) {
      var c = N.cost(b, mult, addOwned(owned, k));
      if (em !== 1) c = N.mul(c, em);
      if (N.cmp(remaining, c) < 0) break;
      remaining = N.sub(remaining, c);
      k += 1;
    }
    return k;
  }

  function bulkCost(base, owned, k, mult, extraMult) {
    var b = Number(base);
    if (!isFinite(b) || b <= 0) b = COST_BASE;
    if (mult == null) mult = COST_MULT;
    var em = extraMult == null ? 1 : Number(extraMult);
    if (!isFinite(em) || em <= 0) em = 1;
    var n = Math.max(0, Math.floor(k));
    if (n > BULK_CAP) n = BULK_CAP;
    if (n <= 0) return N.fromNumber(0);
    var o = (typeof owned === "object" && typeof owned.m === "number")
      ? N.toNumber(N.floor(N.max(owned, 0)))
      : Math.max(0, Math.floor(Number(owned) || 0));
    var first = N.cost(b, mult, o);
    if (em !== 1) first = N.mul(first, em);
    if (n === 1) return first;
    var multN = N.fromNumber(mult);
    var multK = N.pow(multN, n);
    var num1 = N.sub(multK, 1);
    var den1 = N.fromNumber(mult - 1);
    var total = N.floor(N.mul(first, N.div(num1, den1)));
    return total;
  }

  function maxAffordable(base, owned, currency, mult, extraMult) {
    var b = Number(base);
    if (!isFinite(b) || b <= 0) b = COST_BASE;
    if (mult == null) mult = COST_MULT;
    var em = extraMult == null ? 1 : Number(extraMult);
    if (!isFinite(em) || em <= 0) em = 1;
    var cur = num(currency);
    if (N.cmp(cur, 0) <= 0) return 0;
    var o = (typeof owned === "object" && typeof owned.m === "number")
      ? N.toNumber(N.floor(N.max(owned, 0)))
      : Math.max(0, Math.floor(Number(owned) || 0));
    var first = N.cost(b, mult, o);
    if (em !== 1) first = N.mul(first, em);
    if (N.cmp(cur, first) < 0) return 0;
    var m1 = mult - 1;
    var curN = N.toNumber(cur);
    var firstN = N.toNumber(first);
    var k;
    if (isFinite(curN) && isFinite(firstN) && firstN > 0 && curN < 1e300) {
      k = Math.floor(Math.log(1 + curN * m1 / firstN) / Math.log(mult));
    } else {
      var ratio = N.div(N.mul(cur, N.fromNumber(m1)), first);
      var logArg = N.add(ratio, 1);
      var logArgN = N.toNumber(logArg);
      if (!isFinite(logArgN) || logArgN <= 0) {
        k = BULK_CAP;
      } else {
        var log10Arg = Math.log(logArgN) / Math.LN10 + (logArg.e || 0);
        k = Math.floor(log10Arg / (Math.log(mult) / Math.LN10));
      }
    }
    if (k < 0) k = 0;
    if (k > BULK_CAP) k = BULK_CAP;
    var cost_k = bulkCost(b, owned, k, mult, em);
    while (k > 0 && N.cmp(cost_k, cur) > 0) {
      k -= 1;
      cost_k = bulkCost(b, owned, k, mult, em);
    }
    var cost_k1 = bulkCost(b, owned, k + 1, mult, em);
    while (k < BULK_CAP && N.cmp(cost_k1, cur) <= 0) {
      k += 1;
      cost_k1 = bulkCost(b, owned, k + 1, mult, em);
    }
    return k;
  }

  function purchasePlan(owned, currency, base, mult, extraMult, buyMode) {
    if (base == null) base = COST_BASE;
    if (mult == null) mult = COST_MULT;
    var em = extraMult == null ? 1 : Number(extraMult);
    if (!isFinite(em) || em <= 0) em = 1;
    var one = N.cost(base, mult, owned);
    if (em !== 1) one = N.mul(one, em);
    var mode = buyMode;
    if (mode === "10") {
      var k10 = maxAffordable(base, owned, currency, mult, em);
      if (k10 < 1) {
        return { k: 0, cost: one, can: false };
      }
      if (k10 > 10) k10 = 10;
      return { k: k10, cost: bulkCost(base, owned, k10, mult, em), can: true };
    }
    if (mode === "max") {
      var k = maxAffordable(base, owned, currency, mult, em);
      if (k < 1) {
        return { k: 0, cost: one, can: false };
      }
      return { k: k, cost: bulkCost(base, owned, k, mult, em), can: true };
    }
    return { k: 1, cost: one, can: N.cmp(currency, one) >= 0 };
  }

  /* ── Favor ───────────────────────────────────────────────────────── */

  function favorGain(lifetimeSouls) {
    var n = N.max(num(lifetimeSouls), 0);
    if (N.cmp(n, 0) <= 0) return 0;
    if (n.e < 15) {
      var v = N.toNumber(n);
      if (isFinite(v) && v >= 0) {
        return Math.floor(Math.sqrt(v / FAVOR_SOULS_BASE) + 1e-9);
      }
    }
    var q = N.div(n, FAVOR_SOULS_BASE);
    var s = N.floor(N.add(N.pow(q, 0.5), N.fromNumber(1e-9)));
    var asN = N.toNumber(s);
    if (!isFinite(asN) || asN > Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;
    if (asN < 0) return 0;
    return Math.floor(asN);
  }

  function soulsForFavor(n) {
    var k = Math.max(0, Math.floor(Number(n) || 0));
    if (!isFinite(k) || k <= 0) return N.fromNumber(0);
    if (k <= 100000) {
      return N.mul(N.fromNumber(FAVOR_SOULS_BASE), k * k);
    }
    return N.mul(N.fromNumber(FAVOR_SOULS_BASE), N.mul(N.fromNumber(k), N.fromNumber(k)));
  }

  function nextFavorThreshold(lifetimeSouls) {
    return soulsForFavor(favorGain(lifetimeSouls) + 1);
  }

  /* ── Production multiplier ───────────────────────────────────────── */

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

  /* ── Crown / reliquary costs ─────────────────────────────────────── */

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

  function nightTitheCost(ash) {
    var n = N.max(num(ash), 0);
    var quarter = N.floor(N.mul(n, NIGHT_TITHE_FRAC));
    return N.max(N.fromNumber(NIGHT_TITHE_MIN), quarter);
  }

  function veilCost(ash) {
    var n = N.max(num(ash), 0);
    var cut = N.floor(N.div(N.mul(n, 15), 100));
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

  function knellSecs(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    return KNELL_SECS + 10 * n;
  }

  function knellEdictStartsKnell(level) {
    return (Number(level) || 0) >= 1;
  }

  function knellLeftAfterTribute(level) {
    if (!knellEdictStartsKnell(level)) return 0;
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

  function quietCourtStartsBeaconAutobind(level) {
    return (Number(level) || 0) >= 1;
  }

  function quietCourtStartsSpireAutobind(level) {
    return (Number(level) || 0) >= 1;
  }

  function quietCourtStartsObeliskAutobind(level) {
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

  function gleamEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 13 * Math.pow(2, n);
  }

  function gleamEdictStartsBeaconAutobind(level) {
    return (Number(level) || 0) >= 1;
  }

  function riseEdictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 14 * Math.pow(2, n);
  }

  function riseEdictStartsSpireAutobind(level) {
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

  function nightSecs(level) {
    return nightTitheSecs(level);
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
    var p = num(peak);
    var n = 0;
    var i;
    for (i = 0; i < NAME_THRESHOLDS.length; i++) {
      if (N.cmp(p, NAME_THRESHOLDS[i]) >= 0) n += 1;
      else break;
    }
    return n;
  }

  /* ── Rite costs / mults ──────────────────────────────────────────── */

  function siphonCost(level) {
    return N.cost(SIPHON_COST_BASE, 3, level);
  }

  function levyCost(level) {
    return N.cost(LEVY_COST_BASE, 3, level);
  }

  function cinderCost(level) {
    return N.cost(CINDER_COST_BASE, CINDER_COST_MULT, level);
  }

  function urnRiteCost(level) {
    return N.cost(URN_RITE_COST_BASE, URN_RITE_COST_MULT, level);
  }

  function hearthRiteCost(level) {
    return N.cost(HEARTH_RITE_COST_BASE, HEARTH_RITE_COST_MULT, level);
  }

  function beaconRiteCost(level) {
    return N.cost(BEACON_RITE_COST_BASE, BEACON_RITE_COST_MULT, level);
  }

  function spireRiteCost(level) {
    return N.cost(SPIRE_RITE_COST_BASE, SPIRE_RITE_COST_MULT, level);
  }

  function bindingTollCost(level) {
    return N.cost(BINDING_TOLL_COST_BASE, BINDING_TOLL_COST_MULT, level);
  }

  function bindingTollRateMult(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > BINDING_TOLL_MAX) n = BINDING_TOLL_MAX;
    return Math.pow(BINDING_TOLL_RATE, n);
  }

  function bindingTollCostMult(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n > BINDING_TOLL_MAX) n = BINDING_TOLL_MAX;
    return 1 + BINDING_TOLL_COST_BONUS * n;
  }

  function siphonMult(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n < 40) return N.fromNumber(Math.pow(RITE_MULT_BASE, n));
    return N.pow(N.fromNumber(RITE_MULT_BASE), n);
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

  function beaconRiteMult(level) {
    return siphonMult(level);
  }

  function spireRiteMult(level) {
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

  /* ── Hollow ──────────────────────────────────────────────────────── */

  function hollowClearNeed(kind, stock) {
    var fracPart = 0;
    var n = N.toNumber(stock);
    if (isFinite(n)) {
      fracPart = Math.floor(HOLLOW_CLEAR_FRAC * Math.max(0, n));
    } else {
      var raw = N.floor(N.mul(N.max(N.from(stock), 0), HOLLOW_CLEAR_FRAC));
      var rawN = N.toNumber(raw);
      if (!isFinite(rawN)) {
        fracPart = kind === "souls" ? HOLLOW_SOUL_CLEAR_CAP : 1e15;
      } else {
        fracPart = Math.floor(rawN);
      }
    }
    if (kind === "souls") {
      return Math.min(HOLLOW_SOUL_CLEAR_CAP, Math.max(HOLLOW_SOUL_CLEAR_FLOOR, fracPart));
    }
    if (kind === "ash") {
      return Math.max(HOLLOW_ASH_CLEAR_FLOOR, fracPart);
    }
    if (kind === "shades") {
      return Math.max(HOLLOW_SHADE_CLEAR_FLOOR, fracPart);
    }
    return 0;
  }

  function hollowSpendClears(kind, spent, stockBefore) {
    if (kind !== "souls" && kind !== "ash" && kind !== "shades") return true;
    var need = hollowClearNeed(kind, stockBefore);
    return N.cmp(spent, need) >= 0;
  }

  /* ── Goal text ───────────────────────────────────────────────────── */

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
    var beacons = nVal(view.beacons);
    var spires = nVal(view.spires);
    var obelisks = nVal(view.obelisks);
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
      if (favorEarned >= 1) {
        var nextReady = nextFavorThreshold(view.lifetimeSouls);
        var lifeReady = format(view.lifetimeSouls != null ? view.lifetimeSouls : lifetimeSouls);
        var nextReadyFmt = format(nextReady);
        return (
          "Lay Tribute. " +
          gain +
          " Favor waits. The " +
          favorOrdinal(gain + 1) +
          " at " +
          nextReadyFmt +
          " — " +
          lifeReady +
          " / " +
          nextReadyFmt +
          "."
        );
      }
      return "Lay Tribute. The GodKing will remember.";
    }
    if (view.unlockedLanterns && lanterns < 1) {
      return "Kindle a Lantern. A light for the echoes.";
    }
    if (view.unlockedFetters && fetters < 1) {
      return "Bind a Fetter. A chain that teaches the will to pull.";
    }
    var tollLevel = Number(view.bindingTollLevel) || 0;
    var tollOpen =
      !!view.unlockedBindingToll ||
      tollLevel >= 1 ||
      (fetters >= 5 && favorEarned >= 1);
    if (tollOpen && tollLevel < 1) {
      return "Pay the Binding Toll. The chain bites both ways.";
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
    if (view.unlockedBeacons && beacons < 1) {
      return "Raise a Beacon. A light after the fire.";
    }
    if (view.unlockedSpires && spires < 1) {
      return "Raise a Spire. Height after the light.";
    }
    if (view.unlockedObelisks && obelisks < 1) {
      return "Raise an Obelisk. Stone after the height.";
    }
    if (view.unlockedChalices && chalices < 1) {
      return "Raise a Chalice. He drinks from the emptied well.";
    }
    if (favorEarned >= 1 && sworn && !normalizeVow(view.vow)) {
      return "A vow may be sworn.";
    }
    if (favorEarned >= 1) {
      var nextGather = nextFavorThreshold(view.lifetimeSouls);
      var lifeGather = format(view.lifetimeSouls != null ? view.lifetimeSouls : lifetimeSouls);
      var nextGatherFmt = format(nextGather);
      return (
        "The well gathers. Next Favor at " +
        nextGatherFmt +
        " — " +
        lifeGather +
        " / " +
        nextGatherFmt +
        "."
      );
    }
    var nextFirst = nextFavorThreshold(view.lifetimeSouls);
    return (
      "Tribute when the GodKing will remember. " +
      format(view.lifetimeSouls != null ? view.lifetimeSouls : lifetimeSouls) +
      " / " +
      format(nextFirst) +
      " lifetime Souls."
    );
  }

  /* ── Pure rate functions ─────────────────────────────────────────── */

  function currentTitheCost(souls, vow) {
    var cost = titheCost(souls);
    if (normalizeVow(vow) === "hunger") {
      cost = N.mul(cost, 2);
    }
    return cost;
  }

  function soulsPerSec(shades, siphonLevel, aspect, lanterns, emberLevel,
                       nightActive, hymnActive, bindingTollLevel, rm,
                       wellDraws, wellDepth, veilActive, tollActive, knellActive,
                       hollowStacks) {
    var rate = shadeSoulsPerSec(shades, siphonLevel, aspect, lanterns, emberLevel,
                                nightActive, hymnActive, bindingTollLevel, rm);
    if (wellDraws) rate = N.add(rate, clickPower(wellDepth, rm, veilActive, tollActive, knellActive, hollowStacks));
    return rate;
  }

  function shadeSoulsPerSec(shades, siphonLevel, aspect, lanterns, emberLevel,
                            nightActive, hymnActive, bindingTollLevel, rm) {
    var base = N.mul(
      N.mul(
        N.mul(
          N.mul(
            N.mul(
              N.mul(N.mul(shades, SHADE_SOULS_PER_SEC), rm),
              siphonMult(siphonLevel)
            ),
            harvestMult(normalizeAspect(aspect) === "harvest")
          ),
          lanternMult(lanterns)
        ),
        emberMult(emberLevel)
      ),
      nightMult(nightActive)
    );
    base = N.mul(base, hymnMult(hymnActive));
    return N.mul(base, bindingTollRateMult(bindingTollLevel));
  }

  function shadesPerSec(spirits, levyLevel, aspect, chainLevel, fetters,
                        hymnActive, bindingTollLevel, rm) {
    var base = N.mul(
      N.mul(
        N.mul(
          N.mul(
            N.mul(N.mul(spirits, SPIRIT_SHADES_PER_SEC), rm),
            levyMult(levyLevel)
          ),
          bindingMult(normalizeAspect(aspect) === "binding")
        ),
        chainMult(chainLevel)
      ),
      fetterMult(fetters)
    );
    base = N.mul(base, hymnMult(hymnActive));
    return N.mul(base, bindingTollRateMult(bindingTollLevel));
  }

  function spiritsPerSec(vessels, hollowLevel, rm) {
    return N.mul(
      N.mul(N.mul(vessels, VESSEL_SPIRITS_PER_SEC), rm),
      emberMult(hollowLevel)
    );
  }

  function clickPower(wellDepth, rm, veilActive, tollActive, knellActive, hollowStacks) {
    return N.mul(
      N.mul(
        N.mul(
          N.mul(1 + (Number(wellDepth) || 0), rm),
          veilMult(veilActive)
        ),
        tollMult(tollActive)
      ),
      knellMult(knellActive)
    );
  }

  function rateMult(favorEarned, thrones, edictLevel, aspect, crownWeight,
                    namesComplete, chalices, ossuaryLevel, processionActive,
                    titheActive, hollowStacks) {
    return currentMult(favorEarned, thrones, edictLevel, aspect, crownWeight,
                       namesComplete, chalices, ossuaryLevel, processionActive) *
           titheMult(titheActive) * hollowMult(hollowStacks);
  }

  function currentMult(favorEarned, thrones, edictLevel, aspect, crownWeight,
                       namesComplete, chalices, ossuaryLevel, processionActive) {
    return (
      prodMult(
        favorEarned,
        thrones,
        edictLevel,
        throneWeight(normalizeAspect(aspect) === "dominion"),
        crownWeight,
        namesComplete,
        chalices,
        ossuaryLevel
      ) * processionMult(processionActive)
    );
  }

  function ashPerSec(shades, siphonLevel, aspect, lanterns, emberLevel,
                     nightActive, hymnActive, bindingTollLevel, rm,
                     ashenTideLevel, choirLevel,
                     censers, pyres, cinderLevel, urns, urnRiteLevel,
                     hearths, hearthRiteLevel, beacons, beaconRiteLevel,
                     spires, spireRiteLevel, obelisks, wakeActive) {
    var fromShades = N.mul(
      shadeSoulsPerSec(shades, siphonLevel, aspect, lanterns, emberLevel,
                       nightActive, hymnActive, bindingTollLevel, rm),
      ashFromShadeFrac(ashenTideLevel, choirLevel)
    );
    var fromCensers = N.mul(
      N.mul(
        N.mul(
          N.mul(N.mul(censers, CENSER_ASH_PER_SEC), rm),
          nightMult(nightActive)
        ),
        hymnMult(hymnActive)
      ),
      wakeMult(wakeActive)
    );
    var fromPyres = N.mul(
      N.mul(
        N.mul(
          N.mul(
            N.mul(N.mul(pyres, PYRE_ASH_PER_SEC), rm),
            nightMult(nightActive)
          ),
          hymnMult(hymnActive)
        ),
        cinderMult(cinderLevel)
      ),
      wakeMult(wakeActive)
    );
    var fromUrns = N.mul(
      N.mul(
        N.mul(
          N.mul(
            N.mul(N.mul(urns, URN_ASH_PER_SEC), rm),
            nightMult(nightActive)
          ),
          hymnMult(hymnActive)
        ),
        urnRiteMult(urnRiteLevel)
      ),
      wakeMult(wakeActive)
    );
    var fromHearths = N.mul(
      N.mul(
        N.mul(
          N.mul(
            N.mul(N.mul(hearths, HEARTH_ASH_PER_SEC), rm),
            nightMult(nightActive)
          ),
          hymnMult(hymnActive)
        ),
        hearthRiteMult(hearthRiteLevel)
      ),
      wakeMult(wakeActive)
    );
    var fromBeacons = N.mul(
      N.mul(
        N.mul(
          N.mul(
            N.mul(N.mul(beacons, BEACON_ASH_PER_SEC), rm),
            nightMult(nightActive)
          ),
          hymnMult(hymnActive)
        ),
        beaconRiteMult(beaconRiteLevel)
      ),
      wakeMult(wakeActive)
    );
    var fromSpires = N.mul(
      N.mul(
        N.mul(
          N.mul(
            N.mul(N.mul(spires, SPIRE_ASH_PER_SEC), rm),
            nightMult(nightActive)
          ),
          hymnMult(hymnActive)
        ),
        spireRiteMult(spireRiteLevel)
      ),
      wakeMult(wakeActive)
    );
    var fromObelisks = N.mul(
      N.mul(
        N.mul(
          N.mul(N.mul(obelisks, OBELISK_ASH_PER_SEC), rm),
          nightMult(nightActive)
        ),
        hymnMult(hymnActive)
      ),
      wakeMult(wakeActive)
    );
    return N.add(
      N.add(
        N.add(N.add(N.add(N.add(N.add(fromShades, fromCensers), fromPyres), fromUrns), fromHearths), fromBeacons),
        fromSpires
      ),
      fromObelisks
    );
  }

  function chalicePlan(owned, currency, buyMode) {
    var o = Math.max(0, Math.min(CHALICE_MAX, Math.floor(Number(owned) || 0)));
    var room = CHALICE_MAX - o;
    if (room <= 0) {
      return { k: 0, cost: N.fromNumber(0), can: false, capped: true, owned: o };
    }
    var plan = purchasePlan(o, currency, CHALICE_COST_BASE, CHALICE_COST_MULT, undefined, buyMode);
    if (plan.k > room) {
      plan.k = room;
      plan.cost = bulkCost(CHALICE_COST_BASE, o, room, CHALICE_COST_MULT);
      plan.can = N.cmp(currency, plan.cost) >= 0;
    }
    plan.capped = false;
    plan.owned = o;
    return plan;
  }

  /* ── Export ───────────────────────────────────────────────────────── */

  global.SoulgatherEconomy = {
    num: num,
    nVal: nVal,
    addOwned: addOwned,
    clamp: clamp,
    producerCost: producerCost,
    shadeCost: shadeCost,
    spiritCost: spiritCost,
    vesselCost: vesselCost,
    throneCost: throneCost,
    lanternCost: lanternCost,
    fetterCost: fetterCost,
    censerCost: censerCost,
    pyreCost: pyreCost,
    urnCost: urnCost,
    hearthCost: hearthCost,
    beaconCost: beaconCost,
    spireCost: spireCost,
    obeliskCost: obeliskCost,
    chaliceCost: chaliceCost,
    markCost: markCost,
    wellCost: wellCost,
    wellBulkCostLoop: wellBulkCostLoop,
    wellMaxAffordableLoop: wellMaxAffordableLoop,
    wellBulkCost: wellBulkCost,
    wellMaxAffordable: wellMaxAffordable,
    wellPurchasePlan: wellPurchasePlan,
    bulkCostLoop: bulkCostLoop,
    maxAffordableLoop: maxAffordableLoop,
    bulkCost: bulkCost,
    maxAffordable: maxAffordable,
    purchasePlan: purchasePlan,
    favorGain: favorGain,
    soulsForFavor: soulsForFavor,
    nextFavorThreshold: nextFavorThreshold,
    prodMult: prodMult,
    crownCost: crownCost,
    longMemCost: longMemCost,
    titheCost: titheCost,
    nightTitheCost: nightTitheCost,
    veilCost: veilCost,
    hymnSecs: hymnSecs,
    hymnBonusSecs: hymnBonusSecs,
    hymnLeftAfterTribute: hymnLeftAfterTribute,
    hymnEdictCost: hymnEdictCost,
    wakeSecs: wakeSecs,
    wakeEdictStartsWake: wakeEdictStartsWake,
    wakeLeftAfterTribute: wakeLeftAfterTribute,
    wakeEdictCost: wakeEdictCost,
    processionSecs: processionSecs,
    processionEdictStartsProcession: processionEdictStartsProcession,
    processionLeftAfterTribute: processionLeftAfterTribute,
    processionEdictCost: processionEdictCost,
    tollSecs: tollSecs,
    tollEdictStartsToll: tollEdictStartsToll,
    tollLeftAfterTribute: tollLeftAfterTribute,
    tollEdictCost: tollEdictCost,
    veilSecs: veilSecs,
    veilEdictStartsVeil: veilEdictStartsVeil,
    veilLeftAfterTribute: veilLeftAfterTribute,
    veilEdictCost: veilEdictCost,
    knellSecs: knellSecs,
    knellEdictStartsKnell: knellEdictStartsKnell,
    knellLeftAfterTribute: knellLeftAfterTribute,
    knellEdictCost: knellEdictCost,
    nightEdictSecs: nightEdictSecs,
    nightEdictStartsNight: nightEdictStartsNight,
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
    quietCourtStartsLanternAutobind: quietCourtStartsLanternAutobind,
    quietCourtStartsFetterAutobind: quietCourtStartsFetterAutobind,
    quietCourtStartsPyreAutobind: quietCourtStartsPyreAutobind,
    quietCourtStartsChaliceAutobind: quietCourtStartsChaliceAutobind,
    quietCourtStartsUrnAutobind: quietCourtStartsUrnAutobind,
    quietCourtStartsHearthAutobind: quietCourtStartsHearthAutobind,
    quietCourtStartsBeaconAutobind: quietCourtStartsBeaconAutobind,
    quietCourtStartsSpireAutobind: quietCourtStartsSpireAutobind,
    quietCourtStartsObeliskAutobind: quietCourtStartsObeliskAutobind,
    smokeEdictCost: smokeEdictCost,
    smokeStartsCenserAutobind: smokeStartsCenserAutobind,
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
    cinderEdictStartsPyreAutobind: cinderEdictStartsPyreAutobind,
    cutEdictCost: cutEdictCost,
    cutEdictStartsUrnAutobind: cutEdictStartsUrnAutobind,
    tendingEdictCost: tendingEdictCost,
    tendingEdictStartsHearthAutobind: tendingEdictStartsHearthAutobind,
    gleamEdictCost: gleamEdictCost,
    gleamEdictStartsBeaconAutobind: gleamEdictStartsBeaconAutobind,
    riseEdictCost: riseEdictCost,
    riseEdictStartsSpireAutobind: riseEdictStartsSpireAutobind,
    cupEdictCost: cupEdictCost,
    cupStartsChalices: cupStartsChalices,
    draughtEdictCost: draughtEdictCost,
    draughtStartsChaliceAutobind: draughtStartsChaliceAutobind,
    remembranceCostFavor: remembranceCostFavor,
    remembranceFavorCost: remembranceFavorCost,
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
    nightSecs: nightSecs,
    ashFromShadeFrac: ashFromShadeFrac,
    choirAshRate: choirAshRate,
    namesFromPeak: namesFromPeak,
    siphonCost: siphonCost,
    levyCost: levyCost,
    cinderCost: cinderCost,
    urnRiteCost: urnRiteCost,
    hearthRiteCost: hearthRiteCost,
    beaconRiteCost: beaconRiteCost,
    spireRiteCost: spireRiteCost,
    bindingTollCost: bindingTollCost,
    bindingTollRateMult: bindingTollRateMult,
    bindingTollCostMult: bindingTollCostMult,
    siphonMult: siphonMult,
    levyMult: levyMult,
    cinderMult: cinderMult,
    urnRiteMult: urnRiteMult,
    hearthRiteMult: hearthRiteMult,
    beaconRiteMult: beaconRiteMult,
    spireRiteMult: spireRiteMult,
    lanternMult: lanternMult,
    fetterMult: fetterMult,
    emberMult: emberMult,
    chainMult: chainMult,
    hollowClearNeed: hollowClearNeed,
    hollowSpendClears: hollowSpendClears,
    nextGoal: nextGoal,
    formatGoalNum: formatGoalNum,
    currentTitheCost: currentTitheCost,
    soulsPerSec: soulsPerSec,
    shadeSoulsPerSec: shadeSoulsPerSec,
    shadesPerSec: shadesPerSec,
    spiritsPerSec: spiritsPerSec,
    ashPerSec: ashPerSec,
    clickPower: clickPower,
    rateMult: rateMult,
    currentMult: currentMult,
    chalicePlan: chalicePlan
  };
})(typeof window !== "undefined" ? window : globalThis);
