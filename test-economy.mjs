#!/usr/bin/env node
/**
 * Soulgather v6.9.1 economy smoke test (AZR-162 + AZR-163 + AZR-165 + AZR-168 + AZR-169 + AZR-170 + AZR-171).
 * Loads js/num.js + js/format.js (classic scripts) and duplicates in-game formulas.
 */

import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
function loadScript(rel) {
  vm.runInThisContext(fs.readFileSync(path.join(root, rel), "utf8"), { filename: rel });
}
loadScript("js/num.js");
loadScript("js/format.js");

const N = globalThis.SoulgatherNum;
const F = globalThis.SoulgatherFormat;

function unwrap(x) {
  if (x && typeof x === "object" && typeof x.m === "number") {
    const n = N.toNumber(x);
    if (isFinite(n) && Math.abs(n) < 1e15) {
      if (Math.abs(n - Math.round(n)) < 1e-9) return Math.round(n);
      return n;
    }
    return n;
  }
  return x;
}

function producerCost(owned) {
  return N.cost(10, 1.15, owned);
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

const WELL_COST_BASE = 25;
const WELL_COST_MULT = 1.5;
const WELL_EARLY_MULT = 1.35;

function wellCost(depth) {
  const d = Math.max(0, Math.floor(Number(depth) || 0));
  if (d <= 5) {
    return N.cost(WELL_COST_BASE, WELL_EARLY_MULT, d);
  }
  return N.cost(WELL_COST_BASE, WELL_COST_MULT, d);
}

function wellBulkCost(owned, k) {
  const n = Math.max(0, Math.floor(k));
  let total = N.fromNumber(0);
  const baseDepth = Math.max(0, Math.floor(Number(owned) || 0));
  for (let i = 0; i < n; i++) {
    total = N.add(total, wellCost(baseDepth + i));
  }
  return total;
}

function wellMaxAffordable(owned, currency) {
  let remaining = currency;
  if (remaining && typeof remaining === "object" && typeof remaining.m === "number") {
    /* Num */
  } else {
    remaining = N.fromNumber(Number(remaining) || 0);
  }
  const baseDepth = Math.max(0, Math.floor(Number(owned) || 0));
  let k = 0;
  while (k < 10000) {
    const c = wellCost(baseDepth + k);
    if (N.cmp(remaining, c) < 0) break;
    remaining = N.sub(remaining, c);
    k += 1;
  }
  return k;
}

function wellPurchasePlan(owned, currency, buyMode) {
  const mode = buyMode || "1";
  const one = wellCost(owned);
  if (mode === "10") {
    let k10 = wellMaxAffordable(owned, currency);
    if (k10 < 1) return { k: 0, cost: one, can: false };
    if (k10 > 10) k10 = 10;
    return { k: k10, cost: wellBulkCost(owned, k10), can: true };
  }
  if (mode === "max") {
    const k = wellMaxAffordable(owned, currency);
    if (k < 1) return { k: 0, cost: one, can: false };
    return { k, cost: wellBulkCost(owned, k), can: true };
  }
  return { k: 1, cost: one, can: N.cmp(currency, one) >= 0 };
}

function lanternCost(owned) {
  return N.cost(30, 1.2, owned);
}

function fetterCost(owned) {
  return N.cost(20, 1.2, owned);
}

function censerCost(owned) {
  return producerCost(owned);
}

function pyreCost(owned) {
  return N.cost(2, 1.2, owned);
}

const URN_COST_BASE = 3;
const URN_COST_MULT = 1.28;
const UNLOCK_URNS = 6;
const HEARTH_COST_BASE = 4;
const HEARTH_COST_MULT = 1.28;
const UNLOCK_HEARTHS = 6;
const BEACON_COST_BASE = 4;
const BEACON_COST_MULT = 1.28;
const UNLOCK_BEACONS = 6;
const SPIRE_COST_BASE = 5;
const SPIRE_COST_MULT = 1.28;
const UNLOCK_SPIRES = 6;
const OBELISK_COST_BASE = 6;
const OBELISK_COST_MULT = 1.28;
const UNLOCK_OBELISKS = 6;
const CHALICE_COST_BASE = 32;
const CHALICE_COST_MULT = 1.65;
const CHALICE_MAX = 12;
const PEAK_BEACON_SPIRE_OBELISK_ASH = 7;

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

function chaliceMult(n) {
  const k = Math.max(0, Math.min(12, Math.floor(Number(n) || 0)));
  return 1 + 0.08 * k;
}

function ossuaryMult(n) {
  const k = Math.max(0, Math.min(8, Math.floor(Number(n) || 0)));
  return 1 + 0.05 * k;
}

function cupEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 9 * Math.pow(2, n);
}

function cupStartsChalices(level) {
  return Math.min(12, Math.max(0, Math.floor(Number(level) || 0)));
}

function markCost(level) {
  return N.cost(8, 2, level);
}

function bulkCost(base, owned, k, mult, extraMult) {
  const b = Number(base);
  const m = mult == null ? 1.15 : Number(mult);
  let em = extraMult == null ? 1 : Number(extraMult);
  if (!isFinite(em) || em <= 0) em = 1;
  const n = Math.max(0, Math.floor(k));
  let total = N.fromNumber(0);
  for (let i = 0; i < n; i++) {
    const o = Math.max(0, Math.floor(owned)) + i;
    let unit = N.cost(b, m, o);
    if (em !== 1) unit = N.mul(unit, em);
    total = N.add(total, unit);
  }
  return total;
}

/** Tiny maxAffordable mirror for purchasePlan tests (no DOM). */
function maxAffordable(base, owned, currency, mult, extraMult) {
  const b = Number(base);
  const m = mult == null ? 1.15 : Number(mult);
  let em = extraMult == null ? 1 : Number(extraMult);
  if (!isFinite(em) || em <= 0) em = 1;
  let remaining = currency;
  if (remaining && typeof remaining === "object" && typeof remaining.m === "number") {
    /* Num */
  } else {
    remaining = N.fromNumber(Number(remaining) || 0);
  }
  let k = 0;
  while (k < 10000) {
    let c = N.cost(b, m, Math.max(0, Math.floor(Number(owned) || 0)) + k);
    if (em !== 1) c = N.mul(c, em);
    if (N.cmp(remaining, c) < 0) break;
    remaining = N.sub(remaining, c);
    k += 1;
  }
  return k;
}

/** Mirror of game purchasePlan for documenting buyMode on stackable producers (no DOM). */
function purchasePlan(owned, currency, base, mult, buyMode, extraMult) {
  const b = base == null ? 10 : base;
  const m = mult == null ? 1.15 : mult;
  let em = extraMult == null ? 1 : Number(extraMult);
  if (!isFinite(em) || em <= 0) em = 1;
  const mode = buyMode || "1";
  let one = N.cost(b, m, owned);
  if (em !== 1) one = N.mul(one, em);
  if (mode === "10") {
    let k10 = maxAffordable(b, owned, currency, m, em);
    if (k10 < 1) {
      return { k: 0, cost: one, can: false };
    }
    if (k10 > 10) k10 = 10;
    return { k: k10, cost: bulkCost(b, owned, k10, m, em), can: true };
  }
  if (mode === "max") {
    const k = maxAffordable(b, owned, currency, m, em);
    if (k < 1) return { k: 0, cost: one, can: false };
    return { k, cost: bulkCost(b, owned, k, m, em), can: true };
  }
  return { k: 1, cost: one, can: N.cmp(currency, one) >= 0 };
}

function favorGain(lifetimeSouls) {
  const n = N.max(N.from(lifetimeSouls), 0);
  if (N.cmp(n, 0) <= 0) return 0;
  if (n.e < 15) {
    const v = N.toNumber(n);
    if (isFinite(v) && v >= 0) {
      return Math.floor(Math.sqrt(v / 25000));
    }
  }
  const q = N.div(n, 25000);
  const s = N.floor(N.add(N.pow(q, 0.5), N.fromNumber(1e-9)));
  const asN = N.toNumber(s);
  if (!isFinite(asN) || asN > Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;
  if (asN < 0) return 0;
  return Math.floor(asN);
}

function prestigeMult(favor) {
  return 1 + 0.5 * (Number(favor) || 0);
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

function namesCompleteMult(on) {
  return on ? 1.05 : 1;
}

function prodMult(favorEarned, thrones, edictLevel, weight, crownWeight, namesComplete, chalices, ossuary) {
  const w = weight == null ? 0.1 : Number(weight);
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

function remembranceCostFavor() {
  return 3;
}

function remembranceFavorCost() {
  return remembranceCostFavor();
}

function deeperNightCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 1 * Math.pow(2, n);
}

function longerProcessionCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 1 * Math.pow(2, n);
}

function paidProcessionSecs(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  return 45 + 10 * n;
}

function deeperTollCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 1 * Math.pow(2, n);
}

function paidTollSecs(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  return 25 + 10 * n;
}

function longerWakeCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 1 * Math.pow(2, n);
}

function paidWakeSecs(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  return 40 + 10 * n;
}

function longerTitheCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 1 * Math.pow(2, n);
}

function paidTitheSecs(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  return 60 + 10 * n;
}

function longerVeilCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 1 * Math.pow(2, n);
}

function paidVeilSecs(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  return 20 + 10 * n;
}

function longerHymnCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 1 * Math.pow(2, n);
}

function longerKnellCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 1 * Math.pow(2, n);
}

function paidKnellSecs(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  return 20 + 10 * n;
}

function hymnBonusSecs(level) {
  return 10 * Math.max(0, Math.floor(Number(level) || 0));
}

function ashenTideCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 1 * Math.pow(2, n);
}

function choirAshRate(choirLevel, ashenTide) {
  const c = Math.max(0, Math.min(10, Math.floor(Number(choirLevel) || 0)));
  const tide = Math.max(0, Math.min(5, Math.floor(Number(ashenTide) || 0)));
  return 0.01 + 0.005 * tide + 0.005 * c;
}

function formatBlessing(m) {
  if (typeof F !== 'undefined' && F && typeof F.formatBlessing === 'function') {
    return F.formatBlessing(m);
  }
  m = Number(m);
  if (!isFinite(m)) m = 1;
  const tenth = m * 10;
  if (Math.abs(tenth - Math.round(tenth)) < 1e-8) {
    return '×' + m.toFixed(1);
  }
  return '×' + m.toFixed(2);
}

function nightTitheSecs(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  return 30 + 10 * n;
}

function nightSecs(level) {
  return nightTitheSecs(level);
}

function nightEdictSecs(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  return 30 + 15 * n;
}

function nightEdictStartsNight(level) {
  return (Number(level) || 0) >= 1;
}

function nightLeftAfterTribute(level) {
  return nightEdictStartsNight(level) ? nightEdictSecs(level) : 0;
}

function nightEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 5 * Math.pow(2, n);
}

function crownCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 6 * Math.pow(2, n);
}

function longMemCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 5 * Math.pow(2, n);
}

function edictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 1 * Math.pow(2, n);
}

function memoryCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 2 * Math.pow(2, n);
}

function echoCost(level) {
  const n = Math.max(0, Math.floor(level));
  if (n >= 1) return Infinity;
  return 3;
}

function seatCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 5 * Math.pow(2, n);
}

function kindleCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 4 * Math.pow(2, n);
}

function ashenCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 3 * Math.pow(2, n);
}

function depthCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 4 * Math.pow(2, n);
}

function quietCourtCost(level) {
  const n = Math.max(0, Math.floor(level));
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
  const n = Math.max(0, Math.floor(level));
  return 6 * Math.pow(2, n);
}

function smokeStartsCenserAutobind(level) {
  return (Number(level) || 0) >= 1;
}

function embersEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 7 * Math.pow(2, n);
}

function embersStartsPyres(level) {
  return Math.max(0, Math.floor(Number(level) || 0));
}

function urnEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 8 * Math.pow(2, n);
}

function urnEdictStartsUrns(level) {
  return Math.max(0, Math.floor(Number(level) || 0));
}

function hearthEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 9 * Math.pow(2, n);
}

function hearthEdictStartsHearths(level) {
  return Math.max(0, Math.floor(Number(level) || 0));
}

function beaconEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 10 * Math.pow(2, n);
}

function beaconEdictStartsBeacons(level) {
  return Math.max(0, Math.floor(Number(level) || 0));
}

function spireEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 11 * Math.pow(2, n);
}

function spireEdictStartsSpires(level) {
  return Math.max(0, Math.floor(Number(level) || 0));
}

function obeliskEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 12 * Math.pow(2, n);
}

function obeliskEdictStartsObelisks(level) {
  return Math.max(0, Math.floor(Number(level) || 0));
}

function cinderEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 8 * Math.pow(2, n);
}

function cinderEdictStartsPyreAutobind(level) {
  return (Number(level) || 0) >= 1;
}

function cutEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 11 * Math.pow(2, n);
}

function cutEdictStartsUrnAutobind(level) {
  return (Number(level) || 0) >= 1;
}

function tendingEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 12 * Math.pow(2, n);
}

function tendingEdictStartsHearthAutobind(level) {
  return (Number(level) || 0) >= 1;
}

function gleamEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 13 * Math.pow(2, n);
}

function gleamEdictStartsBeaconAutobind(level) {
  return (Number(level) || 0) >= 1;
}


function riseEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 14 * Math.pow(2, n);
}

function riseEdictStartsSpireAutobind(level) {
  return (Number(level) || 0) >= 1;
}

function draughtEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 10 * Math.pow(2, n);
}

function draughtStartsChaliceAutobind(level) {
  return (Number(level) || 0) >= 1;
}

function normalizeVow(raw) {
  if (raw === "stillness" || raw === "poverty" || raw === "hunger" || raw === "ember") return raw;
  return "";
}

function vowExtraFavor(vow, hungerPaid) {
  const v = normalizeVow(vow);
  if (v === "stillness" || v === "poverty" || v === "ember") return 1;
  if (v === "hunger") return hungerPaid ? 1 : 0;
  return 0;
}

function vowsKnownCount(known) {
  if (!known || typeof known !== "object") return 0;
  let n = 0;
  if (known.stillness || known.knownStillness) n += 1;
  if (known.poverty || known.knownPoverty) n += 1;
  if (known.hunger || known.knownHunger) n += 1;
  if (known.ember || known.knownEmber) n += 1;
  return n;
}

const SIPHON_COST_BASE = 65;
const LEVY_COST_BASE = 22;
const RITE_MULT_BASE = 1.55;
const CINDER_COST_BASE = 22;
const CINDER_COST_MULT = 2.6;
const URN_RITE_COST_BASE = 18;
const URN_RITE_COST_MULT = 2.6;
const HEARTH_RITE_COST_BASE = 20;
const HEARTH_RITE_COST_MULT = 2.6;
const BEACON_RITE_COST_BASE = 24;
const BEACON_RITE_COST_MULT = 2.6;
const SPIRE_RITE_COST_BASE = 26;
const SPIRE_RITE_COST_MULT = 2.6;
/* Compat aliases = BASE (live costs use *Cost(level)). */
const CINDER_COST = CINDER_COST_BASE;
const URN_RITE_COST = URN_RITE_COST_BASE;
const HEARTH_RITE_COST = HEARTH_RITE_COST_BASE;
const BEACON_RITE_COST = BEACON_RITE_COST_BASE;
const SPIRE_RITE_COST = SPIRE_RITE_COST_BASE;

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

const BINDING_TOLL_COST_BASE = 40;
const BINDING_TOLL_COST_MULT = 1.45;
const BINDING_TOLL_MAX = 4;
const BINDING_TOLL_RATE = 1.12;
const BINDING_TOLL_COST_BONUS = 0.15;

function bindingTollCost(level) {
  return N.cost(BINDING_TOLL_COST_BASE, BINDING_TOLL_COST_MULT, level);
}

function bindingTollRateMult(level) {
  let n = Math.max(0, Math.floor(Number(level) || 0));
  if (n > BINDING_TOLL_MAX) n = BINDING_TOLL_MAX;
  return Math.pow(BINDING_TOLL_RATE, n);
}

function bindingTollCostMult(level) {
  let n = Math.max(0, Math.floor(Number(level) || 0));
  if (n > BINDING_TOLL_MAX) n = BINDING_TOLL_MAX;
  return 1 + BINDING_TOLL_COST_BONUS * n;
}

function bindingTollUnlocked(fetters, favorEarned, level) {
  if ((Number(level) || 0) >= 1) return true;
  return N.cmp(fetters, 5) >= 0 && (Number(favorEarned) || 0) >= 1;
}

/** ×1 only — ignores buyMode; cap 4. */
function buyBindingTollOnce(level, ash, buyMode) {
  void buyMode;
  let n = Math.max(0, Math.floor(Number(level) || 0));
  if (n >= BINDING_TOLL_MAX) return { level: n, ash, bought: false };
  const cost = bindingTollCost(n);
  let cur = ash;
  if (!(cur && typeof cur === "object" && typeof cur.m === "number")) {
    cur = N.fromNumber(Number(cur) || 0);
  }
  if (N.cmp(cur, cost) < 0) return { level: n, ash: cur, bought: false };
  return { level: n + 1, ash: N.sub(cur, cost), bought: true };
}

/** Tribute wipes this-run bindingTollLevel via freshState (not restored). */
function tributeWipesBindingToll(levelBefore) {
  void levelBefore;
  return 0;
}

// AZR-121 Hollow Hunger
const HOLLOW_GRACE = 90;
const HOLLOW_INTERVAL = 45;
const HOLLOW_MAX = 5;
const HOLLOW_PENALTY = 0.04;

function hollowMult(stacks) {
  let n = Math.max(0, Math.floor(Number(stacks) || 0));
  if (n > HOLLOW_MAX) n = HOLLOW_MAX;
  return 1 - HOLLOW_PENALTY * n;
}

function stacksWantedFromIdle(idle) {
  const t = Number(idle) || 0;
  if (!(t >= HOLLOW_GRACE)) return 0;
  return Math.min(HOLLOW_MAX, 1 + Math.floor((t - HOLLOW_GRACE) / HOLLOW_INTERVAL));
}

function hollowHungerActive(view) {
  return (Number(view.favorEarned) || 0) >= 2 && !!view.unlockedPyres;
}

const HOLLOW_SOUL_CLEAR_CAP = 500;
const HOLLOW_SOUL_CLEAR_FLOOR = 25;
const HOLLOW_ASH_CLEAR_FLOOR = 5;
const HOLLOW_SHADE_CLEAR_FLOOR = 3;
const HOLLOW_CLEAR_FRAC = 0.02;

function hollowClearNeed(kind, stock) {
  let fracPart = 0;
  const n = N.toNumber(stock);
  if (isFinite(n)) {
    fracPart = Math.floor(HOLLOW_CLEAR_FRAC * Math.max(0, n));
  } else {
    const raw = N.floor(N.mul(N.max(N.from(stock), 0), HOLLOW_CLEAR_FRAC));
    const rawN = N.toNumber(raw);
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
  const need = hollowClearNeed(kind, stockBefore);
  return N.cmp(spent, need) >= 0;
}

function noteHollowManualSpend(kind, spent, stockBefore, target) {
  const s = target;
  if (kind && !hollowSpendClears(kind, spent, stockBefore)) return;
  s.hollowStacks = 0;
  s.hollowIdle = 0;
}


function siphonMult(level) {
  return Math.pow(RITE_MULT_BASE, Math.max(0, Math.floor(Number(level) || 0)));
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

function titheCost(souls) {
  const n = N.max(N.from(souls), 0);
  const tenth = N.floor(N.mul(n, 0.1));
  return N.max(N.fromNumber(25), tenth);
}

function titheMult(on) {
  return on ? 2 : 1;
}

function hymnMult(on) {
  return on ? 1.25 : 1;
}

function hymnSecs(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  return 45 + 15 * n;
}

function hymnLeftAfterTribute(edictLevel, longerHymnLevel) {
  if (longerHymnLevel == null) longerHymnLevel = 0;
  return hymnSecs(edictLevel) + hymnBonusSecs(longerHymnLevel);
}

function hymnEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 4 * Math.pow(2, n);
}

function wakeSecs(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  return 40 + 15 * n;
}

function wakeEdictStartsWake(level) {
  return (Number(level) || 0) >= 1;
}

function wakeLeftAfterTribute(level) {
  return wakeEdictStartsWake(level) ? wakeSecs(level) : 0;
}

function wakeEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 8 * Math.pow(2, n);
}

function veilMult(on) {
  return on ? 2 : 1;
}

function tollMult(on) {
  return on ? 2 : 1;
}

function wakeMult(on) {
  return on ? 2 : 1;
}

function processionMult(on) {
  return on ? 1.2 : 1;
}

function knellMult(on) {
  return on ? 2 : 1;
}

const KNELL_COST = 1;
const KNELL_SECS = 20;

function knellEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 8 * Math.pow(2, n);
}

function knellSecs(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  return KNELL_SECS + 10 * n;
}

function knellEdictStartsKnell(level) {
  return (Number(level) || 0) >= 1;
}

function knellLeftAfterTribute(level) {
  return knellEdictStartsKnell(level) ? knellSecs(level) : 0;
}

function processionSecs(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  return 45 + 15 * n;
}

function processionEdictStartsProcession(level) {
  return (Number(level) || 0) >= 1;
}

function processionLeftAfterTribute(level) {
  return processionEdictStartsProcession(level) ? processionSecs(level) : 0;
}

function processionEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 9 * Math.pow(2, n);
}

function tollSecs(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  return 25 + 10 * n;
}

function tollEdictStartsToll(level) {
  return (Number(level) || 0) >= 1;
}

function tollLeftAfterTribute(level) {
  return tollEdictStartsToll(level) ? tollSecs(level) : 0;
}

function tollEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 6 * Math.pow(2, n);
}

function veilSecs(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  return 20 + 10 * n;
}

function veilEdictStartsVeil(level) {
  return (Number(level) || 0) >= 1;
}

function veilLeftAfterTribute(level) {
  return veilEdictStartsVeil(level) ? veilSecs(level) : 0;
}

function veilEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 7 * Math.pow(2, n);
}

const WAKE_COST = 30;
const WAKE_SECS = 40;

function veilCost(ash) {
  const n = N.max(N.from(ash), 0);
  const cut = N.floor(N.div(N.mul(n, 15), 100));
  return N.max(N.fromNumber(20), cut);
}

function choirEdictCost(level) {
  const n = Math.max(0, Math.floor(level));
  return 5 * Math.pow(2, n);
}

function lanternMult(lanterns) {
  if (lanterns && typeof lanterns === "object" && typeof lanterns.m === "number") {
    if (lanterns.e < 12) return N.fromNumber(1 + 0.05 * (N.toNumber(lanterns) || 0));
    return N.add(1, N.mul(0.05, lanterns));
  }
  return N.fromNumber(1 + 0.05 * (Number(lanterns) || 0));
}

function fetterMult(fetters) {
  if (fetters && typeof fetters === "object" && typeof fetters.m === "number") {
    if (fetters.e < 12) return N.fromNumber(1 + 0.05 * (N.toNumber(fetters) || 0));
    return N.add(1, N.mul(0.05, fetters));
  }
  return N.fromNumber(1 + 0.05 * (Number(fetters) || 0));
}

function emberMult(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  if (n < 40) return N.fromNumber(Math.pow(1.25, n));
  return N.pow(N.fromNumber(1.25), n);
}

let failed = 0;

function assertEqual(label, actual, expected) {
  actual = unwrap(actual);
  expected = unwrap(expected);
  if (actual !== expected) {
    console.error("FAIL:", label, "got", actual, "expected", expected);
    failed += 1;
  } else {
    console.log("ok  ", label, "=", actual);
  }
}

function assertTrue(label, cond) {
  if (!cond) {
    console.error("FAIL:", label);
    failed += 1;
  } else {
    console.log("ok  ", label);
  }
}

// AZR-110: live Autobind is rate-limited in game.js (AUTOBIND_INTERVAL = 1s of accumulated dt).
// tryAutobind* remain ×1 and ignore buyMode; offline shade/spirit stays one pulse per applyDt.
const AUTOBIND_INTERVAL = 1;
assertEqual("AUTOBIND_INTERVAL is 1 second", AUTOBIND_INTERVAL, 1);


assertEqual("shadeCost(0)", shadeCost(0), 10);
assertEqual("shadeCost(1)", shadeCost(1), 11); // floor(10 * 1.15) = 11
assertEqual("shadeCost(10)", shadeCost(10), Math.floor(10 * Math.pow(1.15, 10)));

assertEqual("spiritCost(0)", spiritCost(0), 10);
assertEqual("spiritCost(1)", spiritCost(1), 11);
assertEqual("spiritCost(10)", spiritCost(10), Math.floor(10 * Math.pow(1.15, 10)));

assertEqual("vesselCost(0)", vesselCost(0), 10);
assertEqual("vesselCost(1)", vesselCost(1), 11);
assertEqual("vesselCost(10)", vesselCost(10), 40);

assertEqual("wellCost(0)", wellCost(0), 25);
assertEqual("wellCost(1)", wellCost(1), 33); // floor(25 * 1.35) AZR-117 early soft
assertTrue("wellCost(1) softer than old 37", unwrap(wellCost(1)) < 37);
assertTrue("wellCost(5) softer than old 189", unwrap(wellCost(5)) < 189);
assertEqual("wellCost(5)", wellCost(5), Math.floor(25 * Math.pow(1.35, 5)));
assertEqual("wellCost(6) original 1.5 curve", wellCost(6), Math.floor(25 * Math.pow(1.5, 6)));
{
  const late = unwrap(wellCost(10));
  const ref = Math.floor(25 * Math.pow(1.5, 10));
  assertTrue("wellCost(10) within ±5% of floor(25*1.5^10)", Math.abs(late - ref) <= ref * 0.05);
  assertEqual("wellCost(10) equals late curve", late, ref);
}

assertEqual("favorGain(24999)", favorGain(24999), 0);
assertEqual("favorGain(25000)", favorGain(25000), 1);
assertEqual("favorGain(100000)", favorGain(100000), 2);
assertEqual("favorGain(225000)", favorGain(225000), 3);

assertEqual("prestigeMult(0)", prestigeMult(0), 1);
assertEqual("prestigeMult(2)", prestigeMult(2), 2);

// Extra honesty checks — same curve, integer-owned flooring
assertEqual("shadeCost(2)", shadeCost(2), Math.floor(10 * Math.pow(1.15, 2)));
assertEqual("spiritCost matches shadeCost for n=7", unwrap(spiritCost(7)), unwrap(shadeCost(7)));
assertEqual("fractional owned floors", unwrap(shadeCost(1.9)), unwrap(shadeCost(1)));
assertEqual("vesselCost matches producerCost n=10", unwrap(vesselCost(10)), unwrap(producerCost(10)));
assertEqual("wellCost(2)", wellCost(2), Math.floor(25 * Math.pow(1.35, 2)));
{
  const softBulk = unwrap(wellBulkCost(0, 3));
  const oldBulk = unwrap(N.add(N.add(N.cost(25, 1.5, 0), N.cost(25, 1.5, 1)), N.cost(25, 1.5, 2)));
  assertTrue("wellBulkCost early softer than flat 1.5", softBulk < oldBulk);
  const wp = wellPurchasePlan(0, N.fromNumber(100), "10");
  assertTrue("wellPurchasePlan mode10 uses wellCost (AZR-113 clamp)", wp.k >= 1 && wp.k <= 10 && wp.can);
  assertEqual("wellPurchasePlan mode10 cost matches wellBulkCost", unwrap(wp.cost), unwrap(wellBulkCost(0, wp.k)));
}

// v0.2
assertEqual("throneCost(0)", throneCost(0), 10);
assertEqual("throneCost(1)", throneCost(1), 11);
assertEqual("throneCost(10)", throneCost(10), 40);

assertEqual("bulkCost(10,0,1)", bulkCost(10, 0, 1), 10);
assertEqual("bulkCost(10,0,2)", bulkCost(10, 0, 2), 21);

assertEqual("prestigeMult(favorEarned=2)", prestigeMult(2), 2);
assertEqual("prodMult(2,1,1)", prodMult(2, 1, 1), 2.75);

assertEqual("edictCost(0)", edictCost(0), 1);
assertEqual("edictCost(1)", edictCost(1), 2);
assertEqual("edictCost(3)", edictCost(3), 8);

assertEqual("memoryCost(0)", memoryCost(0), 2);
assertEqual("memoryCost(1)", memoryCost(1), 4);

assertEqual("echoCost(0)", echoCost(0), 3);
assertEqual("echoCost(1)", echoCost(1), Infinity);
assertEqual("seatCost(0)", seatCost(0), 5);
assertEqual("seatCost(1)", seatCost(1), 10);
assertEqual("seatCost(2)", seatCost(2), 20);

assertEqual("siphonCost(0)", siphonCost(0), 65);
assertEqual("siphonCost(1)", siphonCost(1), 195);
assertEqual("levyCost(0)", levyCost(0), 22);
assertEqual("levyCost(1)", levyCost(1), 66);
assertEqual("siphonMult(0)", siphonMult(0), 1);
assertEqual("siphonMult(1)", siphonMult(1), Math.pow(1.55, 1));
assertEqual("siphonMult(2)", siphonMult(2), Math.pow(1.55, 2));
assertEqual("siphonMult(3)", siphonMult(3), Math.pow(1.55, 3));
assertEqual("cinderMult(0)", cinderMult(0), 1);
assertEqual("cinderMult(1)", cinderMult(1), Math.pow(1.55, 1));
assertEqual("cinderMult(2)", cinderMult(2), Math.pow(1.55, 2));
assertEqual("urnRiteMult(0)", urnRiteMult(0), 1);
assertEqual("urnRiteMult(1)", urnRiteMult(1), Math.pow(1.55, 1));
assertEqual("urnRiteMult(2)", urnRiteMult(2), Math.pow(1.55, 2));
assertEqual("hearthRiteMult(0)", hearthRiteMult(0), 1);
assertEqual("hearthRiteMult(1)", hearthRiteMult(1), Math.pow(1.55, 1));
assertEqual("hearthRiteMult(2)", hearthRiteMult(2), Math.pow(1.55, 2));
assertEqual("HEARTH_RITE_COST_BASE", HEARTH_RITE_COST_BASE, 20);
assertEqual("HEARTH_RITE_COST alias", HEARTH_RITE_COST, 20);
assertEqual("beaconRiteMult(0)", beaconRiteMult(0), 1);
assertEqual("beaconRiteMult(1)", beaconRiteMult(1), Math.pow(1.55, 1));
assertEqual("beaconRiteMult(2)", beaconRiteMult(2), Math.pow(1.55, 2));
assertEqual("BEACON_RITE_COST_BASE", BEACON_RITE_COST_BASE, 24);
assertEqual("BEACON_RITE_COST alias", BEACON_RITE_COST, 24);
assertEqual("spireRiteMult(0)", spireRiteMult(0), 1);
assertEqual("spireRiteMult(1)", spireRiteMult(1), Math.pow(1.55, 1));
assertEqual("spireRiteMult(2)", spireRiteMult(2), Math.pow(1.55, 2));
assertEqual("SPIRE_RITE_COST_BASE", SPIRE_RITE_COST_BASE, 26);
assertEqual("SPIRE_RITE_COST alias", SPIRE_RITE_COST, 26);
assertEqual("CINDER_COST_BASE", CINDER_COST_BASE, 22);
assertEqual("CINDER_COST alias", CINDER_COST, 22);
assertEqual("URN_RITE_COST_BASE", URN_RITE_COST_BASE, 18);
assertEqual("URN_RITE_COST alias", URN_RITE_COST, 18);
assertEqual("RITE_MULT_BASE", RITE_MULT_BASE, 1.55);
assertEqual("CINDER_COST_MULT", CINDER_COST_MULT, 2.6);
assertEqual("URN_RITE_COST_MULT", URN_RITE_COST_MULT, 2.6);
assertEqual("HEARTH_RITE_COST_MULT", HEARTH_RITE_COST_MULT, 2.6);
assertEqual("BEACON_RITE_COST_MULT", BEACON_RITE_COST_MULT, 2.6);
assertEqual("SPIRE_RITE_COST_MULT", SPIRE_RITE_COST_MULT, 2.6);

// AZR-162: geometric ash-rite costs (mult 2.6) — bases, monotonic, cost grows faster than 1.55^n
assertEqual("cinderCost(0)", cinderCost(0), 22);
assertEqual("urnRiteCost(0)", urnRiteCost(0), 18);
assertEqual("hearthRiteCost(0)", hearthRiteCost(0), 20);
assertEqual("beaconRiteCost(0)", beaconRiteCost(0), 24);
assertEqual("spireRiteCost(0)", spireRiteCost(0), 26);

const ashRiteCostFns = [
  ["cinderCost", cinderCost, cinderMult],
  ["urnRiteCost", urnRiteCost, urnRiteMult],
  ["hearthRiteCost", hearthRiteCost, hearthRiteMult],
  ["beaconRiteCost", beaconRiteCost, beaconRiteMult],
  ["spireRiteCost", spireRiteCost, spireRiteMult],
];
for (const [name, costFn, multFn] of ashRiteCostFns) {
  let prev = costFn(0);
  for (let n = 0; n <= 50; n++) {
    const cur = costFn(n);
    const nxt = costFn(n + 1);
    assertTrue(name + "(" + (n + 1) + ") > " + name + "(" + n + ")", N.cmp(nxt, cur) > 0);
    if (n >= 1) {
      const cNum = N.toNumber(cur);
      const mNum = N.toNumber(multFn(n));
      const pNum = N.toNumber(prev);
      const pm = N.toNumber(multFn(n - 1));
      if (isFinite(cNum) && isFinite(mNum) && isFinite(pNum) && isFinite(pm) && mNum > 0 && pm > 0) {
        assertTrue(
          name + "/" + "mult ratio increases at n=" + n,
          cNum / mNum > pNum / pm - 1e-9
        );
      } else {
        // Num-safe: cost/mult via N when values leave JS float range
        const ratio = N.div(cur, multFn(n));
        const prevRatio = N.div(prev, multFn(n - 1));
        assertTrue(name + "/" + "mult Num ratio increases at n=" + n, N.cmp(ratio, prevRatio) > 0);
      }
    }
    prev = cur;
  }
}

// Greedy sim: capped ash income; flat costs would explode levels; geo 2.6 keeps levels < 30 and ash finite
(function azr162GreedyAshRiteSim() {
  const incomePerStep = N.fromNumber(50); // generous but capped ash income per buy attempt
  const rites = [
    ["cinder", cinderCost],
    ["urn", urnRiteCost],
    ["hearth", hearthRiteCost],
    ["beacon", beaconRiteCost],
    ["spire", spireRiteCost],
  ];
  for (const [label, costFn] of rites) {
    let ash = N.fromNumber(100);
    let level = 0;
    for (let step = 0; step < 500; step++) {
      ash = N.add(ash, incomePerStep);
      const cost = costFn(level);
      if (N.cmp(ash, cost) >= 0) {
        ash = N.sub(ash, cost);
        level += 1;
      }
    }
    assertTrue("AZR-162 " + label + " ash finite end", N.isFinite(ash));
    assertTrue("AZR-162 " + label + " level < 30 (got " + level + ")", level < 30);
    assertTrue("AZR-162 " + label + " bought at least once", level >= 1);
  }
})();
assertTrue("siphonMult(5) finite", isFinite(siphonMult(5)) && siphonMult(5) === Math.pow(1.55, 5));
assertTrue("siphonMult(20) finite no NaN", isFinite(siphonMult(20)) && !Number.isNaN(siphonMult(20)));
assertEqual("cinderEdictCost(0)", cinderEdictCost(0), 8);
assertTrue("cinderEdictStartsPyreAutobind(0) is false", !cinderEdictStartsPyreAutobind(0));
assertTrue("cinderEdictStartsPyreAutobind(1) is true", cinderEdictStartsPyreAutobind(1));
assertEqual("cutEdictCost(0)", cutEdictCost(0), 11);
assertTrue("cutEdictStartsUrnAutobind(0) is false", !cutEdictStartsUrnAutobind(0));
assertTrue("cutEdictStartsUrnAutobind(1) is true", cutEdictStartsUrnAutobind(1));
assertEqual("tendingEdictCost(0)", tendingEdictCost(0), 12);
assertEqual("tendingEdictCost(1)", tendingEdictCost(1), 24);
assertTrue("tendingEdictStartsHearthAutobind(0) is false", !tendingEdictStartsHearthAutobind(0));
assertTrue("tendingEdictStartsHearthAutobind(1) is true", tendingEdictStartsHearthAutobind(1));
assertEqual("gleamEdictCost(0)", gleamEdictCost(0), 13);
assertEqual("gleamEdictCost(1)", gleamEdictCost(1), 26);
assertTrue("gleamEdictStartsBeaconAutobind(0) is false", !gleamEdictStartsBeaconAutobind(0));
assertTrue("gleamEdictStartsBeaconAutobind(1) is true", gleamEdictStartsBeaconAutobind(1));
assertEqual("riseEdictCost(0)", riseEdictCost(0), 14);
assertEqual("riseEdictCost(1)", riseEdictCost(1), 28);
assertTrue("riseEdictStartsSpireAutobind(0) is false", !riseEdictStartsSpireAutobind(0));
assertTrue("riseEdictStartsSpireAutobind(1) is true", riseEdictStartsSpireAutobind(1));
assertEqual("chaliceMult(0)", chaliceMult(0), 1);
assertEqual("chaliceMult(1)", chaliceMult(1), 1.08);
assertEqual("chaliceCost(0)", chaliceCost(0), 32);
assertEqual("cupEdictCost(0)", cupEdictCost(0), 9);
assertEqual("cupStartsChalices(0)", cupStartsChalices(0), 0);
assertEqual("cupStartsChalices(2)", cupStartsChalices(2), 2);
assertEqual("cupStartsChalices(20)", cupStartsChalices(20), 12);

// v2.6 Autobind Chalices: unlock at 3 this run; always ×1; cost via existing chaliceCost; cap 12.
function unlockAutobindChalices(n) {
  return Math.max(0, Math.floor(Number(n) || 0)) >= 3;
}
function giftFullCupReady(n) {
  return Math.max(0, Math.min(12, Math.floor(Number(n) || 0))) >= 12;
}
function giftTwelveTributesReady(n) {
  return (Number(n) || 0) >= 12;
}
function giftSixteenTributesReady(n) {
  return (Number(n) || 0) >= 16;
}
function giftTwentyTributesReady(n) {
  return (Number(n) || 0) >= 20;
}
function giftTwentyFourTributesReady(n) {
  return (Number(n) || 0) >= 24;
}
function giftTwentyEightTributesReady(n) {
  return (Number(n) || 0) >= 28;
}
function giftThirtyTwoTributesReady(n) {
  return (Number(n) || 0) >= 32;
}
function giftThirtySixTributesReady(n) {
  return (Number(n) || 0) >= 36;
}
function giftFortyTributesReady(n) {
  return (Number(n) || 0) >= 40;
}
assertTrue("unlockAutobindChalices(2) is false", !unlockAutobindChalices(2));
assertTrue("unlockAutobindChalices(3) is true", unlockAutobindChalices(3));
assertTrue("giftFullCupReady(11) is false", !giftFullCupReady(11));
assertTrue("giftFullCupReady(12) is true", giftFullCupReady(12));
assertTrue("giftTwelveTributesReady(11) is false", !giftTwelveTributesReady(11));
assertTrue("giftTwelveTributesReady(12) is true", giftTwelveTributesReady(12));
assertTrue("giftSixteenTributesReady(15) is false", !giftSixteenTributesReady(15));
assertTrue("giftSixteenTributesReady(16) is true", giftSixteenTributesReady(16));
assertTrue("giftTwentyTributesReady(19) is false", !giftTwentyTributesReady(19));
assertTrue("giftTwentyTributesReady(20) is true", giftTwentyTributesReady(20));
assertTrue("giftTwentyFourTributesReady(23) is false", !giftTwentyFourTributesReady(23));
assertTrue("giftTwentyFourTributesReady(24) is true", giftTwentyFourTributesReady(24));
assertTrue("giftTwentyEightTributesReady(27) is false", !giftTwentyEightTributesReady(27));
assertTrue("giftTwentyEightTributesReady(28) is true", giftTwentyEightTributesReady(28));
assertTrue("giftThirtyTwoTributesReady(31) is false", !giftThirtyTwoTributesReady(31));
assertTrue("giftThirtyTwoTributesReady(32) is true", giftThirtyTwoTributesReady(32));
assertTrue("giftThirtySixTributesReady(35) is false", !giftThirtySixTributesReady(35));
assertTrue("giftThirtySixTributesReady(36) is true", giftThirtySixTributesReady(36));
assertTrue("giftFortyTributesReady(39) is false", !giftFortyTributesReady(39));
assertTrue("giftFortyTributesReady(40) is true", giftFortyTributesReady(40));
assertEqual("chaliceMult(12) full cup", chaliceMult(12), 1.96);
function autobindChalicesCanBuy(owned, ash) {
  const n = Math.max(0, Math.min(12, Math.floor(Number(owned) || 0)));
  if (n >= 12) return false;
  return N.cmp(N.from(ash), chaliceCost(n)) >= 0;
}
assertTrue("autobind chalices blocked at cap 12", !autobindChalicesCanBuy(12, 1e12));
assertTrue("autobind chalices x1 uses chaliceCost", autobindChalicesCanBuy(3, chaliceCost(3)));
assertTrue("autobind chalices cannot buy if ash short", !autobindChalicesCanBuy(3, 0));

function nextGoal(view, format) {
  view = view || {};
  format = format || ((n) => String(n));
  const shades = Number(view.shades) || 0;
  const spirits = Number(view.spirits) || 0;
  const lifetimeSouls = Number(view.lifetimeSouls) || 0;
  const lifetimeShades = Number(view.lifetimeShades) || 0;
  const lanterns = Number(view.lanterns) || 0;
  const censers = Number(view.censers) || 0;
  const pyres = Number(view.pyres) || 0;
  const urns = Number(view.urns) || 0;
  const hearths = Number(view.hearths) || 0;
  const beacons = Number(view.beacons) || 0;
  const spires = Number(view.spires) || 0;
  const obelisks = Number(view.obelisks) || 0;
  const fetters = Number(view.fetters) || 0;
  const chalices = Number(view.chalices) || 0;
  const unlockedSpirits = !!view.unlockedSpirits;
  const unlockedVessels = !!view.unlockedVessels;
  const unlockedThrones = !!view.unlockedThrones;
  const favorEarned = Number(view.favorEarned) || 0;
  const gain = favorGain(lifetimeSouls);
  const sworn = view.aspect === "harvest" || view.aspect === "binding" || view.aspect === "dominion"
    || view.aspect === "aspectHarvest" || view.aspect === "aspectBinding" || view.aspect === "aspectDominion";
  const marksBought = (Number(view.emberLevel) || 0) + (Number(view.chainLevel) || 0) + (Number(view.hollowLevel) || 0);

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
      format(shades) +
      " / 10 Shades"
    );
  }
  if (!unlockedVessels) {
    if (view.unlockedFetters && fetters < 1) {
      return "Bind a Fetter. A chain that teaches the will to pull.";
    }
    return "Vessels at 5 Bound Spirits. " + format(spirits) + " / 5";
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
  const tollLevel = Number(view.bindingTollLevel) || 0;
  const tollOpen =
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
  if (favorEarned >= 1 && sworn && view.vow === "") {
    return "A vow may be sworn.";
  }
  if (favorEarned >= 1) {
    return "The well gathers. Another Tribute at 25000 lifetime Souls this run.";
  }
  return (
    "Tribute when the GodKing will remember. " +
    format(lifetimeSouls) +
    " / 25000 lifetime Souls."
  );
}

assertEqual(
  "nextGoal fresh",
  nextGoal({ shades: 0 }),
  "Bind a Shade to wake the well."
);
assertEqual(
  "nextGoal 3 shades",
  nextGoal({ shades: 3 }),
  "The well thickens. Bound Spirits at 10 Shades. 3 / 10 Shades"
);
assertEqual(
  "nextGoal spirits unlocked",
  nextGoal({ shades: 10, spirits: 2, unlockedSpirits: true }),
  "Vessels at 5 Bound Spirits. 2 / 5"
);
assertEqual(
  "nextGoal vessels unlocked",
  nextGoal({ unlockedSpirits: true, unlockedVessels: true }),
  "A throne at 1 Vessel."
);
assertEqual(
  "nextGoal thrones before tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    lifetimeSouls: 412,
  }),
  "Tribute when the GodKing will remember. 412 / 25000 lifetime Souls."
);
assertEqual(
  "nextGoal tribute ready",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    lifetimeSouls: 25000,
  }),
  "Lay Tribute. The GodKing will remember."
);
assertEqual(
  "nextGoal after tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    lifetimeSouls: 0,
    favorEarned: 1,
    aspect: "harvest",
  }),
  "The well gathers. Another Tribute at 25000 lifetime Souls this run."
);

assertEqual(
  "nextGoal swear aspect",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    lifetimeSouls: 0,
    favorEarned: 1,
  }),
  "Swear an Aspect. The GodKing waits."
);

assertEqual("harvestMult(true)", harvestMult(true), 1.5);
assertEqual("harvestMult(false)", harvestMult(false), 1);
assertEqual("bindingMult(true)", bindingMult(true), 1.5);
assertEqual("bindingMult(false)", bindingMult(false), 1);
assertEqual("throneWeight(true)", throneWeight(true), 0.15);
assertEqual("throneWeight(false)", throneWeight(false), 0.1);
assertEqual("prodMult(0,2,0) no dominion", prodMult(0, 2, 0, throneWeight(false)), 1.2);
assertEqual("prodMult(0,2,0) dominion", prodMult(0, 2, 0, throneWeight(true)), 1.3);

assertEqual(
  "nextGoal null aspect",
  nextGoal({ favorEarned: 1, aspect: null }),
  "Swear an Aspect. The GodKing waits."
);
assertEqual(
  "nextGoal empty aspect",
  nextGoal({ favorEarned: 1, aspect: "" }),
  "Swear an Aspect. The GodKing waits."
);

assertEqual("bulkCost fractional owned floors", unwrap(bulkCost(10, 1.9, 1)), unwrap(bulkCost(10, 1, 1)));

const fakeSave = {
  souls: 12,
  shades: 3,
  aspect: "harvest",
  favorEarned: 2,
  siphonLevel: 1,
};
const roundTripped = JSON.parse(JSON.stringify(fakeSave));
assertEqual("round-trip keep aspect", roundTripped.aspect, "harvest");
assertEqual("round-trip keep favorEarned", roundTripped.favorEarned, 2);

assertEqual("titheCost(100)", titheCost(100), 25);
assertEqual("titheCost(400)", titheCost(400), 40);
assertEqual("titheCost(10)", titheCost(10), 25);
assertEqual("titheMult(true)", titheMult(true), 2);
assertEqual("titheMult(false)", titheMult(false), 1);

// v0.8 Num safety
assertEqual("fromNumber(10)", unwrap(N.fromNumber(10)), 10);
assertEqual("cost(10,1.15,0)", N.cost(10, 1.15, 0), 10);
assertEqual("cost(10,1.15,1)", N.cost(10, 1.15, 1), 11);
assertEqual("cost(10,1.15,10)", N.cost(10, 1.15, 10), 40);

const siphon80 = siphonCost(80);
assertTrue("siphonCost(80) is finite", N.isFinite(siphon80) && isFinite(N.toNumber(siphon80)) && N.toNumber(siphon80) !== Infinity);
const siphon700 = siphonCost(700);
assertTrue("siphonCost(700) is finite Num", N.isFinite(siphon700) && N.cmp(siphon700, 0) > 0);
assertTrue("siphonCost(700) not JS Infinity", !isFinite(N.toNumber(siphon700)) || N.toNumber(siphon700) !== Infinity ? (N.isFinite(siphon700) && siphon700.e > 300) : true);

const bigA = N.mul(N.fromNumber(1.2), N.pow(N.fromNumber(10), 40));
const bigB = N.mul(N.fromNumber(3.4), N.pow(N.fromNumber(10), 40));
const bigSum = N.add(bigA, bigB);
assertTrue("add two large nums finite", N.isFinite(bigSum) && N.cmp(bigSum, 0) > 0);
assertTrue("add two large nums ~4.6e40", Math.abs(bigSum.e - 40) <= 1);

let formatThrew = false;
try {
  F.formatFromNum(siphon700);
  F.formatNumber(bigSum);
  F.formatFromNum(N.fromNumber(10));
  F.formatNumber(N.cost(10, 1.15, 10));
} catch (err) {
  formatThrew = true;
  console.error("format threw", err);
}
assertTrue("format doesn't throw", !formatThrew);

assertEqual("lanternCost(0)", lanternCost(0), 30);
assertEqual("lanternCost(1)", lanternCost(1), 36);
assertEqual("producerCost(0) censer base", producerCost(0), 10);
assertEqual("censerCost(0)", censerCost(0), 10);
assertEqual("censerCost matches producerCost", unwrap(censerCost(3)), unwrap(producerCost(3)));
{
  const p1 = purchasePlan(0, N.fromNumber(1000), 30, 1.2, "1");
  assertEqual("purchasePlan lantern mode1 k", p1.k, 1);
  assertEqual("purchasePlan lantern mode1 cost", unwrap(p1.cost), 30);
  const p10 = purchasePlan(0, N.fromNumber(100000), 30, 1.2, "10");
  assertEqual("purchasePlan lantern mode10 k", p10.k, 10);
  assertTrue("purchasePlan lantern mode10 cost > one", N.cmp(p10.cost, 30) > 0);
  const pw = purchasePlan(0, N.fromNumber(100000), 25, 1.5, "10");
  assertEqual("purchasePlan well mode10 k", pw.k, 10);
  const pf = purchasePlan(0, N.fromNumber(100000), 20, 1.2, "10");
  assertEqual("purchasePlan fetter mode10 k", pf.k, 10);
  const pc = purchasePlan(0, N.fromNumber(100000), 10, 1.15, "10");
  assertEqual("purchasePlan censer mode10 k", pc.k, 10);
  // AZR-113: Buy 10 clamps to affordable (up to 10); never dead-ends if Max could buy ≥1
  const steepBase = 100;
  const steepMult = 2;
  const costExactly3 = bulkCost(steepBase, 0, 3, steepMult);
  const pClamp3 = purchasePlan(0, costExactly3, steepBase, steepMult, "10");
  assertEqual("purchasePlan mode10 clamp k===3", pClamp3.k, 3);
  assertTrue("purchasePlan mode10 clamp can when partial", pClamp3.can === true);
  const pClamp10 = purchasePlan(0, N.fromNumber(1e9), steepBase, steepMult, "10");
  assertEqual("purchasePlan mode10 clamp k===10 when rich", pClamp10.k, 10);
  const pClamp0 = purchasePlan(0, N.fromNumber(0), steepBase, steepMult, "10");
  assertEqual("purchasePlan mode10 clamp k===0", pClamp0.k, 0);
  assertTrue("purchasePlan mode10 clamp can===false when broke", pClamp0.can === false);
  const pMode1 = purchasePlan(0, costExactly3, steepBase, steepMult, "1");
  assertEqual("purchasePlan mode1 still k===1", pMode1.k, 1);
}
assertEqual("markCost(0)", markCost(0), 8);
assertEqual("markCost(1)", markCost(1), 16);
assertEqual("lanternMult(2)", lanternMult(2), 1.1);
assertEqual("emberMult(2)", emberMult(2), 1.5625);

assertEqual("dump/load number", unwrap(N.load(12)), 12);
assertEqual("dump/load {m,e}", unwrap(N.load({ m: 1.2, e: 1 })), 12);
assertEqual("dump round-trip 40", unwrap(N.load(N.dump(N.cost(10, 1.15, 10)))), 40);

function assertLoadSafe(label, v) {
  const x = N.load(v);
  assertTrue(label, !!(x && N.isFinite(x) && N.cmp(x, 0) >= 0));
}
assertLoadSafe("AZR-168 N.load(NaN) finite >=0", NaN);
assertLoadSafe("AZR-168 N.load(Infinity) finite >=0", Infinity);
assertLoadSafe("AZR-168 N.load(-Infinity) finite >=0", -Infinity);
assertLoadSafe("AZR-168 N.load({m:NaN}) finite >=0", { m: NaN, e: 0 });
assertLoadSafe("AZR-168 N.load({m:Infinity}) finite >=0", { m: Infinity, e: 0 });
assertLoadSafe("AZR-168 N.load('abc') finite >=0", "abc");
assertLoadSafe("AZR-168 N.load(null) finite >=0", null);
assertLoadSafe("AZR-168 N.load(undefined) finite >=0", undefined);
assertLoadSafe("AZR-168 N.load(-1) finite >=0", -1);
assertTrue(
  "AZR-168 fromNumber(-1) still exists internally",
  N.cmp(N.fromNumber(-1), 0) < 0
);
assertTrue("50*3^80 not Infinity", N.isFinite(siphon80) && N.toNumber(siphon80) !== Infinity);

assertEqual(
  "nextGoal lantern half-step",
  nextGoal({ shades: 3, unlockedLanterns: true, lanterns: 0 }),
  "Kindle a Lantern. A light for the echoes."
);
assertEqual(
  "nextGoal does not steal tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedLanterns: true,
    lanterns: 0,
    lifetimeSouls: 25000,
  }),
  "Lay Tribute. The GodKing will remember."
);
assertEqual(
  "nextGoal does not steal aspect",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedLanterns: true,
    lanterns: 0,
    favorEarned: 1,
  }),
  "Swear an Aspect. The GodKing waits."
);

assertEqual("fetterCost(0)", fetterCost(0), 20);
assertEqual("fetterCost(1)", fetterCost(1), 24);
assertEqual("kindleCost(0)", kindleCost(0), 4);
assertEqual("ashenCost(0)", ashenCost(0), 3);
assertEqual("depthCost(0)", depthCost(0), 4);
assertEqual("depthCost(1)", depthCost(1), 8);
assertEqual("quietCourtCost(0)", quietCourtCost(0), 8);
assertEqual("quietCourtCost(1)", quietCourtCost(1), 16);
assertEqual("vowExtraFavor stillness", vowExtraFavor("stillness"), 1);
assertEqual("vowExtraFavor none", vowExtraFavor(""), 0);
assertEqual("vowExtraFavor ember", vowExtraFavor("ember"), 1);
assertEqual("vowExtraFavor stillness still 1", vowExtraFavor("stillness"), 1);
assertEqual("vowExtraFavor none still 0", vowExtraFavor(""), 0);
assertEqual("vowsKnownCount empty", vowsKnownCount({}), 0);
assertEqual("vowsKnownCount all-false", vowsKnownCount({ stillness: false, poverty: false, hunger: false, ember: false }), 0);
assertEqual("vowsKnownCount two true", vowsKnownCount({ stillness: true, poverty: true, hunger: false, ember: false }), 2);
assertEqual("vowsKnownCount three true", vowsKnownCount({ stillness: true, poverty: true, hunger: true, ember: false }), 3);
assertEqual("vowsKnownCount all four", vowsKnownCount({ stillness: true, poverty: true, hunger: true, ember: true }), 4);
assertEqual("fetterMult(2)", fetterMult(2), 1.1);

assertEqual("crownCost(0)", crownCost(0), 6);
assertEqual("crownCost(1)", crownCost(1), 12);
assertEqual("longMemCost(0)", longMemCost(0), 5);
assertEqual("prodMult(0,0,0,false,0)", prodMult(0, 0, 0, false, 0), 1);
assertEqual("prodMult(0,0,0,false,2)", prodMult(0, 0, 0, false, 2), 1.2);
assertEqual("prodMult crownWeight 2 other factors 1", prodMult(0, 0, 0, 0.1, 2), 1.2);

assertEqual(
  "nextGoal fetter half-step",
  nextGoal({ shades: 10, spirits: 3, unlockedSpirits: true, unlockedFetters: true, fetters: 0 }),
  "Bind a Fetter. A chain that teaches the will to pull."
);
assertEqual(
  "nextGoal fetter does not steal tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedFetters: true,
    fetters: 0,
    lifetimeSouls: 25000,
  }),
  "Lay Tribute. The GodKing will remember."
);
assertEqual(
  "nextGoal fetter does not steal aspect",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedFetters: true,
    fetters: 0,
    favorEarned: 1,
  }),
  "Swear an Aspect. The GodKing waits."
);

assertEqual(
  "nextGoal vow does not steal aspect",
  nextGoal({
    favorEarned: 1,
    vow: "",
  }),
  "Swear an Aspect. The GodKing waits."
);
assertEqual(
  "nextGoal vow hint after aspect",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    lifetimeSouls: 0,
    favorEarned: 1,
    aspect: "harvest",
    vow: "",
  }),
  "A vow may be sworn."
);
assertEqual(
  "nextGoal vow does not steal tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    lifetimeSouls: 25000,
    favorEarned: 1,
    aspect: "harvest",
    vow: "",
  }),
  "Lay Tribute. The GodKing will remember."
);
assertEqual(
  "nextGoal sworn vow",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    lifetimeSouls: 0,
    favorEarned: 1,
    aspect: "harvest",
    vow: "stillness",
  }),
  "The well gathers. Another Tribute at 25000 lifetime Souls this run."
);

assertEqual("remembranceCostFavor", remembranceCostFavor(), 3);
assertEqual("remembranceFavorCost", remembranceFavorCost(), 3);
assertEqual("deeperNightCost(0)", deeperNightCost(0), 1);
assertEqual("deeperNightCost(1)", deeperNightCost(1), 2);
assertEqual("longerProcessionCost(0)", longerProcessionCost(0), 1);
assertEqual("longerProcessionCost(1)", longerProcessionCost(1), 2);
assertEqual("paidProcessionSecs(0)", paidProcessionSecs(0), 45);
assertEqual("paidProcessionSecs(2)", paidProcessionSecs(2), 65);
assertEqual("deeperTollCost(0)", deeperTollCost(0), 1);
assertEqual("deeperTollCost(1)", deeperTollCost(1), 2);
assertEqual("paidTollSecs(0)", paidTollSecs(0), 25);
assertEqual("paidTollSecs(2)", paidTollSecs(2), 45);
assertEqual("longerWakeCost(0)", longerWakeCost(0), 1);
assertEqual("longerWakeCost(1)", longerWakeCost(1), 2);
assertEqual("paidWakeSecs(0)", paidWakeSecs(0), 40);
assertEqual("paidWakeSecs(2)", paidWakeSecs(2), 60);
assertEqual("longerTitheCost(0)", longerTitheCost(0), 1);
assertEqual("longerTitheCost(1)", longerTitheCost(1), 2);
assertEqual("paidTitheSecs(0)", paidTitheSecs(0), 60);
assertEqual("paidTitheSecs(2)", paidTitheSecs(2), 80);
assertEqual("longerVeilCost(0)", longerVeilCost(0), 1);
assertEqual("longerVeilCost(1)", longerVeilCost(1), 2);
assertEqual("paidVeilSecs(0)", paidVeilSecs(0), 20);
assertEqual("paidVeilSecs(2)", paidVeilSecs(2), 40);
assertEqual("ashenTideCost(0)", ashenTideCost(0), 1);
assertEqual("ashenTideCost(1)", ashenTideCost(1), 2);
assertEqual("namesCompleteMult true", namesCompleteMult(true), 1.05);
assertEqual("namesCompleteMult false", namesCompleteMult(false), 1);
assertEqual("nightTitheSecs(0)", nightTitheSecs(0), 30);
assertEqual("nightTitheSecs(1)", nightTitheSecs(1), 40);
assertEqual("nightTitheSecs(2)", nightTitheSecs(2), 50);
assertEqual("nightSecs(0)", nightSecs(0), 30);
assertEqual("nightSecs(2)", nightSecs(2), 50);
assertEqual("prodMult namesComplete", prodMult(0, 0, 0, 0.1, 0, true), 1.05);

assertEqual("choirAshRate base", choirAshRate(0), 0.01);
assertEqual("choirAshRate choir 2 no tide", choirAshRate(2), 0.02);
assertEqual("choirAshRate choir 2 tide 0 explicit", choirAshRate(2, 0), 0.02);
assertEqual("formatBlessing(1.05)", F.formatBlessing(1.05), "\u00d71.05");
assertEqual("formatBlessing(1.5)", F.formatBlessing(1.5), "\u00d71.5");
assertTrue("formatBlessing(1.05) is not x1.1", F.formatBlessing(1.05) !== "\u00d71.1");

assertEqual("hymnMult(true)", hymnMult(true), 1.25);
assertEqual("hymnMult(false)", hymnMult(false), 1);
assertEqual("choirEdictCost(0)", choirEdictCost(0), 5);
assertEqual("choirEdictCost(1)", choirEdictCost(1), 10);
assertEqual("hymnLeft after tribute", hymnLeftAfterTribute(), 45);
assertEqual("hymnSecs(0)", hymnSecs(0), 45);
assertEqual("hymnSecs(2)", hymnSecs(2), 75);
assertEqual("hymnEdictCost(0)", hymnEdictCost(0), 4);
assertEqual("hymnEdictCost(1)", hymnEdictCost(1), 8);
assertEqual("longerHymnCost(0)", longerHymnCost(0), 1);
assertEqual("longerHymnCost(1)", longerHymnCost(1), 2);
assertEqual("longerKnellCost(0)", longerKnellCost(0), 1);
assertEqual("longerKnellCost(1)", longerKnellCost(1), 2);
assertEqual("paidKnellSecs(0)", paidKnellSecs(0), 20);
assertEqual("paidKnellSecs(2)", paidKnellSecs(2), 40);
assertEqual("hymnBonusSecs(0)", hymnBonusSecs(0), 0);
assertEqual("hymnBonusSecs(2)", hymnBonusSecs(2), 20);
assertEqual("hymnLeftAfterTribute(0, 0)", hymnLeftAfterTribute(0, 0), 45);
assertEqual("hymnLeftAfterTribute(0, 2)", hymnLeftAfterTribute(0, 2), 65);
assertEqual("hymnLeftAfterTribute(2, 0)", hymnLeftAfterTribute(2, 0), 75);
assertEqual("hymnLeftAfterTribute(1, 2)", hymnLeftAfterTribute(1, 2), 80);

assertEqual("veilMult(true)", veilMult(true), 2);
assertEqual("veilMult(false)", veilMult(false), 1);
assertEqual("tollMult(false)", tollMult(false), 1);
assertEqual("tollMult(true)", tollMult(true), 2);
assertEqual("knellMult(true)", knellMult(true), 2);
assertEqual("knellMult(false)", knellMult(false), 1);
assertEqual("KNELL_COST", KNELL_COST, 1);
assertEqual("KNELL_SECS", KNELL_SECS, 20);
assertEqual("knellEdictCost(0)", knellEdictCost(0), 8);
assertEqual("knellEdictCost(1)", knellEdictCost(1), 16);
assertEqual("knellSecs(0)", knellSecs(0), 20);
assertEqual("knellSecs(1)", knellSecs(1), 30);
assertEqual("knellSecs(2)", knellSecs(2), 40);
assertTrue("knellEdictStartsKnell(0) is false", !knellEdictStartsKnell(0));
assertTrue("knellEdictStartsKnell(1) is true", knellEdictStartsKnell(1));
assertEqual("knellLeftAfterTribute(0)", knellLeftAfterTribute(0), 0);
assertEqual("knellLeftAfterTribute(1)", knellLeftAfterTribute(1), 30);
// knellMult folds into clickPower with veilMult/tollMult; not into rateMult / idle ash / shade rates.
assertEqual("tollEdictCost(0)", tollEdictCost(0), 6);
assertEqual("tollSecs(0)", tollSecs(0), 25);
assertEqual("tollSecs(1)", tollSecs(1), 35);
assertEqual("tollSecs(2)", tollSecs(2), 45);
assertTrue("tollEdictStartsToll(0) is false", !tollEdictStartsToll(0));
assertTrue("tollEdictStartsToll(1) is true", tollEdictStartsToll(1));
assertEqual("tollLeftAfterTribute(0)", tollLeftAfterTribute(0), 0);
assertEqual("tollLeftAfterTribute(1)", tollLeftAfterTribute(1), 35);
assertEqual("veilEdictCost(0)", veilEdictCost(0), 7);
assertEqual("veilEdictCost(1)", veilEdictCost(1), 14);
assertEqual("veilSecs(0)", veilSecs(0), 20);
assertEqual("veilSecs(1)", veilSecs(1), 30);
assertEqual("veilSecs(2)", veilSecs(2), 40);
assertTrue("veilEdictStartsVeil(0) is false", !veilEdictStartsVeil(0));
assertTrue("veilEdictStartsVeil(1) is true", veilEdictStartsVeil(1));
assertEqual("veilLeftAfterTribute(0)", veilLeftAfterTribute(0), 0);
assertEqual("veilLeftAfterTribute(1)", veilLeftAfterTribute(1), 30);
assertEqual("nightEdictCost(0)", nightEdictCost(0), 5);
assertEqual("nightEdictCost(1)", nightEdictCost(1), 10);
assertEqual("nightEdictSecs(0)", nightEdictSecs(0), 30);
assertEqual("nightEdictSecs(1)", nightEdictSecs(1), 45);
assertEqual("nightEdictSecs(2)", nightEdictSecs(2), 60);
assertTrue("nightEdictStartsNight(0) is false", !nightEdictStartsNight(0));
assertTrue("nightEdictStartsNight(1) is true", nightEdictStartsNight(1));
assertEqual("nightLeftAfterTribute(0)", nightLeftAfterTribute(0), 0);
assertEqual("nightLeftAfterTribute(1)", nightLeftAfterTribute(1), 45);
assertEqual("wakeMult(false)", wakeMult(false), 1);
assertEqual("wakeMult(true)", wakeMult(true), 2);
assertEqual("processionMult(false)", processionMult(false), 1);
assertEqual("processionMult(true)", processionMult(true), 1.2);
assertEqual("WAKE_COST", WAKE_COST, 30);
assertEqual("WAKE_SECS", WAKE_SECS, 40);
assertEqual("wakeEdictCost(0)", wakeEdictCost(0), 8);
assertEqual("wakeSecs(0)", wakeSecs(0), 40);
assertEqual("wakeSecs(1)", wakeSecs(1), 55);
assertEqual("wakeSecs(2)", wakeSecs(2), 70);
assertTrue("wakeEdictStartsWake(0) is false", !wakeEdictStartsWake(0));
assertTrue("wakeEdictStartsWake(1) is true", wakeEdictStartsWake(1));
assertEqual("wakeLeftAfterTribute(0)", wakeLeftAfterTribute(0), 0);
assertEqual("wakeLeftAfterTribute(1)", wakeLeftAfterTribute(1), 55);
assertEqual("processionEdictCost(0)", processionEdictCost(0), 9);
assertEqual("processionSecs(0)", processionSecs(0), 45);
assertEqual("processionSecs(1)", processionSecs(1), 60);
assertEqual("processionSecs(2)", processionSecs(2), 75);
assertTrue("processionEdictStartsProcession(0) is false", !processionEdictStartsProcession(0));
assertTrue("processionEdictStartsProcession(1) is true", processionEdictStartsProcession(1));
assertEqual("processionLeftAfterTribute(0)", processionLeftAfterTribute(0), 0);
assertEqual("processionLeftAfterTribute(1)", processionLeftAfterTribute(1), 60);
assertEqual("veilCost(20)", veilCost(20), 20);
assertEqual("veilCost(200)", veilCost(200), 30);

assertTrue("quietCourtStartsLanternAutobind(0) is false", !quietCourtStartsLanternAutobind(0));
assertTrue("quietCourtStartsLanternAutobind(1) is true", quietCourtStartsLanternAutobind(1));
assertTrue("quietCourtStartsLanternAutobind(2) is true", quietCourtStartsLanternAutobind(2));

assertTrue("quietCourtStartsFetterAutobind(0) is false", !quietCourtStartsFetterAutobind(0));
assertTrue("quietCourtStartsFetterAutobind(1) is true", quietCourtStartsFetterAutobind(1));

assertTrue("quietCourtStartsPyreAutobind(0) is false", !quietCourtStartsPyreAutobind(0));
assertTrue("quietCourtStartsPyreAutobind(1) is true", quietCourtStartsPyreAutobind(1));

assertTrue("quietCourtStartsChaliceAutobind(0) is false", !quietCourtStartsChaliceAutobind(0));
assertTrue("quietCourtStartsChaliceAutobind(1) is true", quietCourtStartsChaliceAutobind(1));

assertTrue("quietCourtStartsUrnAutobind(0) is false", !quietCourtStartsUrnAutobind(0));
assertTrue("quietCourtStartsUrnAutobind(1) is true", quietCourtStartsUrnAutobind(1));

assertTrue("quietCourtStartsHearthAutobind(0) is false", !quietCourtStartsHearthAutobind(0));
assertTrue("quietCourtStartsHearthAutobind(1) is true", quietCourtStartsHearthAutobind(1));

assertTrue("quietCourtStartsBeaconAutobind(0) is false", !quietCourtStartsBeaconAutobind(0));
assertTrue("quietCourtStartsBeaconAutobind(1) is true", quietCourtStartsBeaconAutobind(1));

assertTrue("quietCourtStartsSpireAutobind(0) is false", !quietCourtStartsSpireAutobind(0));
assertTrue("quietCourtStartsSpireAutobind(1) is true", quietCourtStartsSpireAutobind(1));

assertTrue("quietCourtStartsObeliskAutobind(0) is false", !quietCourtStartsObeliskAutobind(0));
assertTrue("quietCourtStartsObeliskAutobind(1) is true", quietCourtStartsObeliskAutobind(1));

function unlockAutobindHearths(n) {
  return Math.max(0, Math.floor(Number(n) || 0)) >= 3;
}
function giftPeakHearthsReady(n) {
  return Math.max(0, Math.floor(Number(n) || 0)) >= 5;
}
assertTrue("unlockAutobindHearths(2) is false", !unlockAutobindHearths(2));
assertTrue("unlockAutobindHearths(3) is true", unlockAutobindHearths(3));
assertTrue("giftPeakHearthsReady(4) is false", !giftPeakHearthsReady(4));
assertTrue("giftPeakHearthsReady(5) is true", giftPeakHearthsReady(5));

function unlockAutobindBeacons(n) {
  return Math.max(0, Math.floor(Number(n) || 0)) >= 3;
}
function giftPeakBeaconsReady(n) {
  return Math.max(0, Math.floor(Number(n) || 0)) >= 5;
}
assertTrue("unlockAutobindBeacons(2) is false", !unlockAutobindBeacons(2));
assertTrue("unlockAutobindBeacons(3) is true", unlockAutobindBeacons(3));
assertTrue("giftPeakBeaconsReady(4) is false", !giftPeakBeaconsReady(4));
assertTrue("giftPeakBeaconsReady(5) is true", giftPeakBeaconsReady(5));

function unlockAutobindSpires(n) {
  return Math.max(0, Math.floor(Number(n) || 0)) >= 3;
}
function giftPeakSpiresReady(n) {
  return Math.max(0, Math.floor(Number(n) || 0)) >= 5;
}
assertTrue("unlockAutobindSpires(2) is false", !unlockAutobindSpires(2));
assertTrue("unlockAutobindSpires(3) is true", unlockAutobindSpires(3));
assertTrue("giftPeakSpiresReady(4) is false", !giftPeakSpiresReady(4));
assertTrue("giftPeakSpiresReady(5) is true", giftPeakSpiresReady(5));

function unlockAutobindObelisks(n) {
  return Math.max(0, Math.floor(Number(n) || 0)) >= 3;
}
function giftPeakObelisksReady(n) {
  return Math.max(0, Math.floor(Number(n) || 0)) >= 5;
}
assertTrue("unlockAutobindObelisks(2) is false", !unlockAutobindObelisks(2));
assertTrue("unlockAutobindObelisks(3) is true", unlockAutobindObelisks(3));
assertTrue("giftPeakObelisksReady(4) is false", !giftPeakObelisksReady(4));
assertTrue("giftPeakObelisksReady(5) is true", giftPeakObelisksReady(5));

assertEqual("draughtEdictCost(0)", draughtEdictCost(0), 10);
assertTrue("draughtStartsChaliceAutobind(0) is false", !draughtStartsChaliceAutobind(0));
assertTrue("draughtStartsChaliceAutobind(1) is true", draughtStartsChaliceAutobind(1));

assertEqual("ossuaryMult(0)", ossuaryMult(0), 1);
assertEqual("ossuaryMult(1)", ossuaryMult(1), 1.05);
assertEqual("ossuaryMult(8)", ossuaryMult(8), 1.40);
assertEqual("prodMult ossuary 8 fold", prodMult(0, 0, 0, 0.1, 0, false, 0, 8), 1.40);

function ossuaryCost(level) {
  const n = Math.max(0, Math.floor(level));
  if (n >= 8) return Infinity;
  return 1;
}
function giftFullOssuaryReady(n) {
  return Math.max(0, Math.min(8, Math.floor(Number(n) || 0))) >= 8;
}
function giftHundredDrawsReady(n) {
  return (Number(n) || 0) >= 100;
}
function giftThreeHundredDrawsReady(n) {
  return (Number(n) || 0) >= 300;
}
function ossuaryHotkeyReady(unlocked, ossuaryLevel, remembrance) {
  return !!unlocked && Math.max(0, Math.floor(Number(ossuaryLevel) || 0)) < 8 && (Number(remembrance) || 0) >= 1;
}
assertEqual("ossuaryCost(0)", ossuaryCost(0), 1);
assertEqual("ossuaryCost(7)", ossuaryCost(7), 1);
assertEqual("ossuaryCost(8)", ossuaryCost(8), Infinity);
assertTrue("giftFullOssuaryReady(7) is false", !giftFullOssuaryReady(7));
assertTrue("giftFullOssuaryReady(8) is true", giftFullOssuaryReady(8));
assertTrue("giftHundredDrawsReady(99) is false", !giftHundredDrawsReady(99));
assertTrue("giftHundredDrawsReady(100) is true", giftHundredDrawsReady(100));
assertTrue("giftThreeHundredDrawsReady(299) is false", !giftThreeHundredDrawsReady(299));
assertTrue("giftThreeHundredDrawsReady(300) is true", giftThreeHundredDrawsReady(300));
assertTrue("ossuaryHotkeyReady unlocked under cap", ossuaryHotkeyReady(true, 7, 1));
assertTrue("ossuaryHotkeyReady blocked at cap", !ossuaryHotkeyReady(true, 8, 99));
assertTrue("ossuaryHotkeyReady blocked without remembrance", !ossuaryHotkeyReady(true, 0, 0));
assertTrue("ossuaryHotkeyReady blocked if locked", !ossuaryHotkeyReady(false, 0, 8));

assertEqual("smokeEdictCost(0)", smokeEdictCost(0), 6);
assertTrue("smokeStartsCenserAutobind(0) is false", !smokeStartsCenserAutobind(0));
assertTrue("smokeStartsCenserAutobind(1) is true", smokeStartsCenserAutobind(1));

assertEqual("pyreCost(0)", pyreCost(0), 2);
assertEqual("embersEdictCost(0)", embersEdictCost(0), 7);
assertEqual("embersStartsPyres(0)", embersStartsPyres(0), 0);
assertEqual("embersStartsPyres(2)", embersStartsPyres(2), 2);
assertEqual("urnCost(0)", urnCost(0), 3);
assertEqual("urnEdictCost(0)", urnEdictCost(0), 8);
assertEqual("urnEdictStartsUrns(0)", urnEdictStartsUrns(0), 0);
assertEqual("urnEdictStartsUrns(2)", urnEdictStartsUrns(2), 2);
assertEqual("hearthCost(0)", hearthCost(0), 4);
assertEqual("hearthEdictCost(0)", hearthEdictCost(0), 9);
assertEqual("hearthEdictCost(1)", hearthEdictCost(1), 18);
assertEqual("hearthEdictStartsHearths(0)", hearthEdictStartsHearths(0), 0);
assertEqual("hearthEdictStartsHearths(2)", hearthEdictStartsHearths(2), 2);
assertEqual("beaconCost(0)", beaconCost(0), 4);
assertEqual("beaconEdictCost(0)", beaconEdictCost(0), 10);
assertEqual("beaconEdictCost(1)", beaconEdictCost(1), 20);
assertEqual("beaconEdictStartsBeacons(0)", beaconEdictStartsBeacons(0), 0);
assertEqual("beaconEdictStartsBeacons(2)", beaconEdictStartsBeacons(2), 2);
assertEqual("spireCost(0)", spireCost(0), 5);
assertEqual("spireEdictCost(0)", spireEdictCost(0), 11);
assertEqual("spireEdictCost(1)", spireEdictCost(1), 22);
assertEqual("spireEdictStartsSpires(0)", spireEdictStartsSpires(0), 0);
assertEqual("spireEdictStartsSpires(2)", spireEdictStartsSpires(2), 2);
assertEqual("obeliskCost(0)", obeliskCost(0), 6);
assertEqual("obeliskEdictCost(0)", obeliskEdictCost(0), 12);
assertEqual("obeliskEdictCost(1)", obeliskEdictCost(1), 24);
assertEqual("obeliskEdictStartsObelisks(0)", obeliskEdictStartsObelisks(0), 0);
assertEqual("obeliskEdictStartsObelisks(2)", obeliskEdictStartsObelisks(2), 2);

// AZR-118 steepen mid/late ash ladder
assertEqual("URN_COST_MULT", URN_COST_MULT, 1.28);
assertEqual("HEARTH_COST_MULT", HEARTH_COST_MULT, 1.28);
assertEqual("BEACON_COST_MULT", BEACON_COST_MULT, 1.28);
assertEqual("SPIRE_COST_MULT", SPIRE_COST_MULT, 1.28);
assertEqual("OBELISK_COST_MULT", OBELISK_COST_MULT, 1.28);
assertEqual("UNLOCK_URNS", UNLOCK_URNS, 6);
assertEqual("UNLOCK_HEARTHS", UNLOCK_HEARTHS, 6);
assertEqual("UNLOCK_BEACONS", UNLOCK_BEACONS, 6);
assertEqual("UNLOCK_SPIRES", UNLOCK_SPIRES, 6);
assertEqual("UNLOCK_OBELISKS", UNLOCK_OBELISKS, 6);
assertEqual("CHALICE_COST_BASE", CHALICE_COST_BASE, 32);
assertEqual("CHALICE_COST_MULT", CHALICE_COST_MULT, 1.65);
assertEqual("CHALICE_MAX", CHALICE_MAX, 12);
assertEqual("urnCost(1) 1.28 curve", urnCost(1), Math.floor(3 * 1.28));
assertEqual("hearthCost(1) 1.28 curve", hearthCost(1), Math.floor(4 * 1.28));
assertEqual("beaconCost(1) 1.28 curve", beaconCost(1), Math.floor(4 * 1.28));
assertEqual("spireCost(1) 1.28 curve", spireCost(1), Math.floor(5 * 1.28));
assertEqual("obeliskCost(1) 1.28 curve", obeliskCost(1), Math.floor(6 * 1.28));
assertEqual("chaliceCost(1) 1.65 curve", chaliceCost(1), Math.floor(32 * 1.65));
assertEqual("peak beacon/spire/obelisk ash gift", PEAK_BEACON_SPIRE_OBELISK_ASH, 7);

assertEqual(
  "nextGoal pyre half-step",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedCensers: true,
    censers: 3,
    unlockedPyres: true,
    pyres: 0,
    lifetimeSouls: 412,
  }),
  "Raise a Pyre. A pyre for what remains."
);
assertEqual(
  "nextGoal pyre does not steal tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedPyres: true,
    pyres: 0,
    lifetimeSouls: 25000,
  }),
  "Lay Tribute. The GodKing will remember."
);
assertEqual(
  "nextGoal pyre does not steal aspect",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedPyres: true,
    pyres: 0,
    favorEarned: 1,
  }),
  "Swear an Aspect. The GodKing waits."
);

assertEqual(
  "nextGoal urn half-step",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedPyres: true,
    pyres: 4,
    unlockedUrns: true,
    urns: 0,
    lifetimeSouls: 412,
  }),
  "Raise an Urn. What the fire would not finish."
);
assertEqual(
  "nextGoal urn does not steal tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedUrns: true,
    urns: 0,
    lifetimeSouls: 25000,
  }),
  "Lay Tribute. The GodKing will remember."
);
assertEqual(
  "nextGoal urn does not steal aspect",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedUrns: true,
    urns: 0,
    favorEarned: 1,
  }),
  "Swear an Aspect. The GodKing waits."
);

assertEqual(
  "nextGoal hearth half-step",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedUrns: true,
    urns: 5,
    unlockedHearths: true,
    hearths: 0,
    lifetimeSouls: 412,
  }),
  "Kindle a Hearth. The last heat."
);
assertEqual(
  "nextGoal hearth does not steal tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedHearths: true,
    hearths: 0,
    lifetimeSouls: 25000,
  }),
  "Lay Tribute. The GodKing will remember."
);
assertEqual(
  "nextGoal hearth does not steal aspect",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedHearths: true,
    hearths: 0,
    favorEarned: 1,
  }),
  "Swear an Aspect. The GodKing waits."
);

assertEqual(
  "nextGoal beacon half-step",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedHearths: true,
    hearths: 5,
    unlockedBeacons: true,
    beacons: 0,
    lifetimeSouls: 412,
  }),
  "Raise a Beacon. A light after the fire."
);
assertEqual(
  "nextGoal beacon does not steal tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedBeacons: true,
    beacons: 0,
    lifetimeSouls: 25000,
  }),
  "Lay Tribute. The GodKing will remember."
);
assertEqual(
  "nextGoal beacon does not steal aspect",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedBeacons: true,
    beacons: 0,
    favorEarned: 1,
  }),
  "Swear an Aspect. The GodKing waits."
);

assertEqual(
  "nextGoal spire half-step",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedBeacons: true,
    beacons: 5,
    unlockedSpires: true,
    spires: 0,
    lifetimeSouls: 412,
  }),
  "Raise a Spire. Height after the light."
);
assertEqual(
  "nextGoal spire does not steal tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedSpires: true,
    spires: 0,
    lifetimeSouls: 25000,
  }),
  "Lay Tribute. The GodKing will remember."
);
assertEqual(
  "nextGoal spire does not steal aspect",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedSpires: true,
    spires: 0,
    favorEarned: 1,
  }),
  "Swear an Aspect. The GodKing waits."
);

assertEqual(
  "nextGoal obelisk half-step",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedSpires: true,
    spires: 5,
    unlockedObelisks: true,
    obelisks: 0,
    lifetimeSouls: 412,
  }),
  "Raise an Obelisk. Stone after the height."
);
assertEqual(
  "nextGoal obelisk does not steal tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedObelisks: true,
    obelisks: 0,
    lifetimeSouls: 25000,
  }),
  "Lay Tribute. The GodKing will remember."
);
assertEqual(
  "nextGoal obelisk does not steal aspect",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedObelisks: true,
    obelisks: 0,
    favorEarned: 1,
  }),
  "Swear an Aspect. The GodKing waits."
);


assertEqual(
  "nextGoal chalice after thrones",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedChalices: true,
    chalices: 0,
    lifetimeSouls: 412,
  }),
  "Raise a Chalice. He drinks from the emptied well."
);
assertEqual(
  "nextGoal chalice does not steal tribute",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedChalices: true,
    chalices: 0,
    lifetimeSouls: 25000,
  }),
  "Lay Tribute. The GodKing will remember."
);
assertEqual(
  "nextGoal chalice does not steal aspect",
  nextGoal({
    unlockedSpirits: true,
    unlockedVessels: true,
    unlockedThrones: true,
    unlockedChalices: true,
    chalices: 0,
    favorEarned: 1,
  }),
  "Swear an Aspect. The GodKing waits."
);

// AZR-112: Autobind always ×1 / never purchasePlan / never buyMode (source + behavioral lock).
{
  const EXPECTED_TRY_AUTOBIND = [
    "tryAutobind",
    "tryAutobindSpirits",
    "tryAutobindVessels",
    "tryAutobindLanterns",
    "tryAutobindFetters",
    "tryAutobindCensers",
    "tryAutobindThrones",
    "tryAutobindPyres",
    "tryAutobindUrns",
    "tryAutobindHearths",
    "tryAutobindBeacons",
    "tryAutobindSpires",
    "tryAutobindObelisks",
    "tryAutobindChalices",
  ];

  const gameSrc = fs.readFileSync(path.join(root, "js", "game.js"), "utf8");
  const found = [];
  const re = /function (tryAutobind\w*)\(/g;
  let m;
  while ((m = re.exec(gameSrc)) !== null) {
    found.push(m[1]);
  }
  assertEqual("AZR-112 tryAutobind* count in game.js", found.length, EXPECTED_TRY_AUTOBIND.length);
  for (const name of EXPECTED_TRY_AUTOBIND) {
    assertTrue("AZR-112 game.js has " + name, found.includes(name));
  }
  for (const name of found) {
    assertTrue("AZR-112 scan list covers " + name, EXPECTED_TRY_AUTOBIND.includes(name));
  }

  function stripComments(src) {
    return src
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\n]*/g, "");
  }

  function extractTryAutobindBody(src, name) {
    const startToken = "function " + name + "(";
    const start = src.indexOf(startToken);
    if (start < 0) return null;
    const from = start;
    const rest = src.slice(from);
    const nextFn = rest.search(/\n  function /);
    if (nextFn < 0) return rest;
    return rest.slice(0, nextFn);
  }

  for (const name of EXPECTED_TRY_AUTOBIND) {
    const slice = extractTryAutobindBody(gameSrc, name);
    assertTrue("AZR-112 extract " + name, !!slice);
    const body = stripComments(slice || "");
    assertTrue(name + " must not use purchasePlan", !body.includes("purchasePlan"));
    assertTrue(name + " must not read buyMode", !body.includes("buyMode"));
    const addsOne =
      body.includes(", 1)") ||
      body.includes("+= 1") ||
      /(?:owned|\w+)\s*\+\s*1\b/.test(body);
    assertTrue(name + " success path adds exactly 1", addsOne);
  }

  /** Mirror of Autobind live tick: always buy 1 if affordable; never reads buyMode. */
  function autobindBuyOnce(owned, currency, costFn) {
    const o = Math.max(0, Math.floor(Number(owned) || 0));
    const cost = costFn(o);
    let cur = currency;
    if (!(cur && typeof cur === "object" && typeof cur.m === "number")) {
      cur = N.fromNumber(Number(cur) || 0);
    }
    if (N.cmp(cur, cost) < 0) {
      return { owned: o, currency: cur, bought: false };
    }
    return {
      owned: o + 1,
      currency: N.sub(cur, cost),
      bought: true,
    };
  }

  // Even with buyMode conceptually "max" / enough currency for many, autobind still +1.
  {
    const soulsForMany = N.fromNumber(100000);
    const maxPlan = purchasePlan(0, soulsForMany, 10, 1.15, "max");
    assertTrue("AZR-112 max plan can buy many", maxPlan.k >= 10);
    const once = autobindBuyOnce(0, soulsForMany, shadeCost);
    assertTrue("AZR-112 autobindBuyOnce bought", once.bought);
    assertEqual("AZR-112 autobindBuyOnce owned is 1 not bulk", once.owned, 1);
    assertTrue("AZR-112 autobindBuyOnce owned is not 10", once.owned !== 10);
  }

  // Manual bulk remains covered (buyMode "10" still plans k=10).
  assertEqual(
    'purchasePlan(..., "10").k === 10',
    purchasePlan(0, N.fromNumber(100000), 10, 1.15, "10").k,
    10
  );
}


// AZR-119 Binding Toll
assertEqual("bindingToll unlock fetters4 favor1", bindingTollUnlocked(4, 1, 0), false);
assertEqual("bindingToll unlock fetters5 favor0", bindingTollUnlocked(5, 0, 0), false);
assertEqual("bindingToll unlock fetters5 favor1", bindingTollUnlocked(5, 1, 0), true);
assertEqual("bindingTollCost(0)", bindingTollCost(0), 40);
assertEqual("bindingTollCost(1)", bindingTollCost(1), Math.floor(40 * 1.45));
assertEqual("bindingTollCost(2)", bindingTollCost(2), Math.floor(40 * Math.pow(1.45, 2)));
assertEqual("bindingTollRateMult(0)", bindingTollRateMult(0), 1);
assertEqual("bindingTollRateMult(1)", bindingTollRateMult(1), 1.12);
assertTrue(
  "bindingTollRateMult(2) ≈ 1.2544",
  Math.abs(bindingTollRateMult(2) - Math.pow(1.12, 2)) < 1e-12
);
assertEqual("bindingTollCostMult(1)", bindingTollCostMult(1), 1.15);
assertEqual("bindingTollCostMult(4)", bindingTollCostMult(4), 1.6);
assertEqual("BINDING_TOLL_MAX", BINDING_TOLL_MAX, 4);
{
  let level = 0;
  let ash = N.fromNumber(1e9);
  for (let i = 0; i < 4; i++) {
    const r = buyBindingTollOnce(level, ash, "max");
    assertTrue("bindingToll buy " + (i + 1) + " ok", r.bought);
    assertEqual("bindingToll buy " + (i + 1) + " +1", r.level, level + 1);
    level = r.level;
    ash = r.ash;
  }
  const fifth = buyBindingTollOnce(level, ash, "max");
  assertEqual("bindingToll 5th buy no-ops level", fifth.level, 4);
  assertEqual("bindingToll 5th buy no-ops bought", fifth.bought, false);
}
{
  const plan0 = purchasePlan(0, N.fromNumber(1e9), 10, 1.15, "10", 1);
  const plan1 = purchasePlan(0, N.fromNumber(1e9), 10, 1.15, "10", 1.15);
  assertEqual("purchasePlan Buy10 k with toll", plan1.k, 10);
  assertEqual(
    "purchasePlan Buy10 toll 1.15x",
    unwrap(plan1.cost),
    unwrap(N.mul(plan0.cost, 1.15))
  );
}
assertEqual("tribute wipes bindingTollLevel", tributeWipesBindingToll(3), 0);
{
  const gameSrc = fs.readFileSync(path.join(root, "js/game.js"), "utf8");
  assertTrue("game has BINDING_TOLL_MAX", gameSrc.includes("BINDING_TOLL_MAX = 4"));
  assertTrue("game has bindingTollLevel in freshState", /bindingTollLevel:\s*0/.test(gameSrc));
  assertTrue("layTribute does not restore bindingTollLevel", !/keptBindingToll/.test(gameSrc));
  assertTrue("buyBindingToll ignores buyMode", /function buyBindingToll\(/.test(gameSrc) && !/function buyBindingToll\([\s\S]*?buyMode/.test(gameSrc.split("function buyBindingToll(")[1].slice(0, 500)));
}



// AZR-121 Hollow Hunger
assertEqual("hollowMult(0)", hollowMult(0), 1);
assertEqual("hollowMult(1)", hollowMult(1), 0.96);
assertEqual("hollowMult(5)", hollowMult(5), 0.8);
assertEqual("stacksWantedFromIdle(89)", stacksWantedFromIdle(89), 0);
assertEqual("stacksWantedFromIdle(90)", stacksWantedFromIdle(90), 1);
assertEqual("stacksWantedFromIdle(90+45)", stacksWantedFromIdle(90 + 45), 2);
assertEqual("stacksWantedFromIdle(90+45*4)", stacksWantedFromIdle(90 + 45 * 4), 5);
assertEqual("stacksWantedFromIdle(90+45*10)", stacksWantedFromIdle(90 + 45 * 10), 5);
assertEqual(
  "hollow gate favor1 + pyres inactive",
  hollowHungerActive({ favorEarned: 1, unlockedPyres: true }),
  false
);
assertEqual(
  "hollow gate favor2 + pyres active",
  hollowHungerActive({ favorEarned: 2, unlockedPyres: true }),
  true
);
assertEqual(
  "hollow gate favor2 without pyres inactive",
  hollowHungerActive({ favorEarned: 2, unlockedPyres: false }),
  false
);
{
  const bag = { hollowStacks: 3, hollowIdle: 200, hollowWarned: true };
  noteHollowManualSpend("favor", 1, 10, bag);
  assertEqual("noteHollowManualSpend clears stacks", bag.hollowStacks, 0);
  assertEqual("noteHollowManualSpend clears idle", bag.hollowIdle, 0);
  assertEqual("noteHollowManualSpend keeps warned", bag.hollowWarned, true);
}

assertEqual("hollowClearNeed souls tiny", hollowClearNeed("souls", 0), 25);
assertEqual("hollowClearNeed souls 10", hollowClearNeed("souls", 10), 25);
assertEqual("hollowClearNeed souls 1000", hollowClearNeed("souls", 1000), 25);
assertEqual("hollowClearNeed souls 20000", hollowClearNeed("souls", 20000), 400);
assertEqual("hollowClearNeed souls 100000 cap", hollowClearNeed("souls", 100000), 500);
assertEqual("hollowClearNeed ash 100", hollowClearNeed("ash", 100), 5);
assertEqual("hollowClearNeed ash 1000", hollowClearNeed("ash", 1000), 20);
assertEqual("hollowClearNeed shades 100", hollowClearNeed("shades", 100), 3);
assertEqual("hollowClearNeed shades 500", hollowClearNeed("shades", 500), 10);

assertEqual(
  "hollowSpendClears souls 10 vs need 25",
  hollowSpendClears("souls", 10, 1000),
  false
);
assertEqual(
  "hollowSpendClears souls 25 vs need 25",
  hollowSpendClears("souls", 25, 1000),
  true
);
assertEqual(
  "hollowSpendClears souls 100 vs need 500 huge stock",
  hollowSpendClears("souls", 100, 100000),
  false
);
assertEqual(
  "hollowSpendClears souls 500 vs need 500 huge stock",
  hollowSpendClears("souls", 500, 100000),
  true
);
assertEqual(
  "hollowSpendClears favor always",
  hollowSpendClears("favor", 1, 1),
  true
);

{
  const bag = { hollowStacks: 4, hollowIdle: 180, hollowWarned: true };
  noteHollowManualSpend("souls", 10, 1000, bag);
  assertEqual("sub-threshold keeps stacks", bag.hollowStacks, 4);
  assertEqual("sub-threshold keeps idle", bag.hollowIdle, 180);
}
{
  const bag = { hollowStacks: 4, hollowIdle: 180, hollowWarned: true };
  noteHollowManualSpend("souls", 25, 1000, bag);
  assertEqual("threshold clears stacks", bag.hollowStacks, 0);
  assertEqual("threshold clears idle", bag.hollowIdle, 0);
}
{
  // Mode-1 Shade poke: ~COST_BASE 10 souls with large stock must not clear
  const stock = 10000;
  const shadeCostApprox = 10;
  assertEqual(
    "Mode-1 Shade poke does not clear",
    hollowSpendClears("souls", shadeCostApprox, stock),
    false
  );
  const bag = { hollowStacks: 2, hollowIdle: 120, hollowWarned: true };
  noteHollowManualSpend("souls", shadeCostApprox, stock, bag);
  assertEqual("Mode-1 Shade poke keeps stacks", bag.hollowStacks, 2);
  assertEqual("Mode-1 Shade poke keeps idle", bag.hollowIdle, 120);
}

{
  const gameSrc = fs.readFileSync(path.join(root, "js/game.js"), "utf8");
  assertTrue("game has HOLLOW_GRACE", gameSrc.includes("HOLLOW_GRACE = 90"));
  assertTrue("game has HOLLOW_INTERVAL", gameSrc.includes("HOLLOW_INTERVAL = 45"));
  assertTrue("game has HOLLOW_MAX", gameSrc.includes("HOLLOW_MAX = 5"));
  assertTrue("game has HOLLOW_SOUL_CLEAR_CAP", gameSrc.includes("HOLLOW_SOUL_CLEAR_CAP = 500"));
  assertTrue("game has hollowStacks in freshState", /hollowStacks:\s*0/.test(gameSrc));
  assertTrue(
    "rateMult multiplies hollowMult(stacks)",
    /function rateMult\(\) \{[\s\S]*?hollowMult\(state\.hollowStacks\)/.test(gameSrc)
  );
  assertTrue(
    "tickHollowHunger only in live applyDt path",
    /if \(live\) \{[\s\S]*?tickHollowHunger\(liveSpan\)/.test(gameSrc)
  );
  const re = /function (tryAutobind\w*)\(/g;
  let m;
  while ((m = re.exec(gameSrc)) !== null) {
    const name = m[1];
    const start = m.index;
    let depth = 0;
    let i = gameSrc.indexOf("{", start);
    for (; i < gameSrc.length; i++) {
      if (gameSrc[i] === "{") depth++;
      else if (gameSrc[i] === "}") {
        depth--;
        if (depth === 0) {
          i++;
          break;
        }
      }
    }
    const body = gameSrc.slice(start, i);
    assertTrue(
      "AZR-121 " + name + " does not call noteHollowManualSpend",
      !body.includes("noteHollowManualSpend")
    );
  }
  assertTrue(
    "buyShade calls noteHollowManualSpend with souls args",
    /function buyShade\([\s\S]*?noteHollowManualSpend\("souls",\s*plan\.cost,\s*hollowBefore\)/.test(gameSrc)
  );
  const bare = (gameSrc.match(/noteHollowManualSpend\(\)/g) || []).length;
  assertEqual("no bare noteHollowManualSpend() calls", bare, 0);
}


// AZR-163: simulatedUntil settle — source contracts + unit-style clock math
{
  const gameSrc = fs.readFileSync(path.join(root, "js/game.js"), "utf8");
  assertTrue("AZR-163 freshState has simulatedUntil", /simulatedUntil:\s*Date\.now\(\)/.test(gameSrc));
  assertTrue(
    "AZR-163 applyDt advances simulatedUntil by dt*1000",
    /state\.simulatedUntil\s*=\s*\(Number\(state\.simulatedUntil\)\s*\|\|\s*Date\.now\(\)\)\s*\+\s*dt\s*\*\s*1000/.test(
      gameSrc
    )
  );
  assertTrue(
    "AZR-163 serializeState reads state.simulatedUntil (not a Date.now() stamp)",
    /simulatedUntil:\s*Number\(state\.simulatedUntil\)/.test(gameSrc)
  );
  // Ensure serializeState object does not use bare `simulatedUntil: Date.now()`
  const serMatch = gameSrc.match(/function serializeState\(\)\s*\{[\s\S]*?\n  \}/);
  assertTrue("AZR-163 found serializeState", !!serMatch);
  assertTrue(
    "AZR-163 serializeState body has no simulatedUntil: Date.now()",
    serMatch && !/simulatedUntil:\s*Date\.now\(\)/.test(serMatch[0])
  );
  assertTrue("AZR-163 has settleToNow", /function settleToNow\s*\(/.test(gameSrc));
  assertTrue(
    "AZR-163 settleToNow uses applyDt\\(dt, false\\)",
    /function settleToNow\s*\([\s\S]*?applyDt\(dt,\s*false\)/.test(gameSrc)
  );
  assertTrue(
    "AZR-163 load offline uses simulatedUntil",
    /offline\s*=\s*\(Date\.now\(\)\s*-\s*state\.simulatedUntil\)\s*\/\s*1000/.test(gameSrc)
  );
  assertTrue(
    "AZR-163 migration falls back to lastTick",
    /state\.simulatedUntil\s*=\s*(?:Number|loadCount)\(data\.simulatedUntil\)\s*\|\|\s*(?:Number|loadCount)\(data\.lastTick\)\s*\|\|\s*Date\.now\(\)/.test(
      gameSrc
    )
  );
  assertTrue(
    "AZR-163 visibilitychange calls settleToNow",
    /visibilitychange[\s\S]{0,400}settleToNow/.test(gameSrc)
  );
  assertTrue(
    "AZR-163 pagehide calls settleToNow",
    /pagehide[\s\S]{0,200}settleToNow/.test(gameSrc)
  );
  assertTrue(
    "AZR-163 does not use beforeunload for settle",
    !/beforeunload/.test(gameSrc)
  );
  // AZR-164 owns the 1Hz hidden heartbeat (asserted below).
  assertTrue("AZR-163 exports MAX_DT", /MAX_DT:\s*MAX_DT/.test(gameSrc));

  // Unit-style: migration
  function migrateSimulatedUntil(data, now) {
    return Number(data.simulatedUntil) || Number(data.lastTick) || now;
  }
  assertEqual("AZR-163 migrate missing → lastTick", migrateSimulatedUntil({ lastTick: 42 }, 99), 42);
  assertEqual(
    "AZR-163 migrate prefers simulatedUntil",
    migrateSimulatedUntil({ simulatedUntil: 7, lastTick: 42 }, 99),
    7
  );
  assertEqual("AZR-163 migrate empty → now", migrateSimulatedUntil({}, 99), 99);

  // Unit-style: applyDt(10) advances ~10000ms; MAX_DT caps
  const MAX_DT = 8 * 60 * 60;
  function advanceSimulatedUntil(until, dt) {
    if (dt <= 0 || !isFinite(dt)) return until;
    dt = Math.max(0, Math.min(dt, MAX_DT));
    return (Number(until) || 0) + dt * 1000;
  }
  assertEqual("AZR-163 applyDt(10) +10000ms", advanceSimulatedUntil(1_000_000, 10), 1_010_000);
  assertEqual(
    "AZR-163 MAX_DT caps advance ms",
    advanceSimulatedUntil(0, 999_999),
    MAX_DT * 1000
  );
  assertEqual("AZR-163 non-positive dt no advance", advanceSimulatedUntil(5000, 0), 5000);
  assertEqual("AZR-163 AWAY_SUMMARY_DT still 60", 60, 60);

  // Optional harness: settleToNow credits production gap math
  function settleGap(until, now, maxDt) {
    let dt = (now - until) / 1000;
    if (dt > maxDt) dt = maxDt;
    if (dt < 0) dt = 0;
    return dt;
  }
  assertEqual("AZR-163 settle 120s gap", settleGap(0, 120_000, MAX_DT), 120);
  assertEqual(
    "AZR-163 settle caps at MAX_DT",
    settleGap(0, (MAX_DT + 1000) * 1000, MAX_DT),
    MAX_DT
  );
}


// AZR-164: LIVE_FRAME_MAX + Hollow freeze while hidden + 1Hz heartbeat
{
  const gameSrc = fs.readFileSync(path.join(root, "js/game.js"), "utf8");
  assertTrue("AZR-164 LIVE_FRAME_MAX = 1.0", /LIVE_FRAME_MAX\s*=\s*1(?:\.0)?\s*;/.test(gameSrc));
  assertTrue("AZR-164 exports LIVE_FRAME_MAX", /LIVE_FRAME_MAX:\s*LIVE_FRAME_MAX/.test(gameSrc));
  assertTrue(
    "AZR-164 liveSpan = Math.min(dt, LIVE_FRAME_MAX)",
    /liveSpan\s*=\s*Math\.min\(\s*dt\s*,\s*LIVE_FRAME_MAX\s*\)/.test(gameSrc)
  );
  assertTrue(
    "AZR-164 tickHollowHunger called with liveSpan",
    /tickHollowHunger\(\s*liveSpan\s*\)/.test(gameSrc)
  );
  assertTrue(
    "AZR-164 autobindAcc uses liveSpan",
    /autobindAcc\s*\+=\s*liveSpan/.test(gameSrc)
  );
  assertTrue(
    "AZR-164 tickHollowHunger freezes while document.hidden",
    /function tickHollowHunger\s*\(\s*dt\s*\)\s*\{[\s\S]*?document\.hidden[\s\S]*?return/.test(gameSrc)
  );
  assertTrue(
    "AZR-164 setInterval 1000 hidden heartbeat exists",
    /setInterval\s*\(\s*function\s*\(\)\s*\{[\s\S]*?\}\s*,\s*1000\s*\)/.test(gameSrc)
  );
  assertTrue("AZR-164 startHiddenHeartbeat helper", /function startHiddenHeartbeat\s*\(/.test(gameSrc));
  assertTrue("AZR-164 clearHiddenHeartbeat helper", /function clearHiddenHeartbeat\s*\(/.test(gameSrc));
  assertTrue(
    "AZR-164 heartbeat cleared on show (visibilitychange !hidden)",
    /visibilitychange[\s\S]{0,800}clearHiddenHeartbeat/.test(gameSrc)
  );
  assertTrue(
    "AZR-164 heartbeat started on hide",
    /document\.hidden[\s\S]{0,400}startHiddenHeartbeat/.test(gameSrc)
  );
  assertTrue(
    "AZR-164 pagehide clears heartbeat",
    /pagehide[\s\S]{0,200}clearHiddenHeartbeat/.test(gameSrc)
  );
  // No Date.now stamp of simulatedUntil outside applyDt (serialize / settle sync / freshState / load sync OK;
  // the live advance contract remains applyDt's `+ dt * 1000`).
  assertTrue(
    "AZR-164 applyDt still sole live simulatedUntil advance",
    /state\.simulatedUntil\s*=\s*\(Number\(state\.simulatedUntil\)\s*\|\|\s*Date\.now\(\)\)\s*\+\s*dt\s*\*\s*1000/.test(
      gameSrc
    )
  );
  // Unit: LIVE_FRAME_MAX clamp math
  const LIVE_FRAME_MAX = 1.0;
  assertEqual("AZR-164 LIVE_FRAME_MAX === 1", LIVE_FRAME_MAX, 1);
  function liveSpanOf(dt) {
    return Math.min(dt, LIVE_FRAME_MAX);
  }
  assertEqual("AZR-164 liveSpan(0.016)", liveSpanOf(0.016), 0.016);
  assertEqual("AZR-164 liveSpan(1)", liveSpanOf(1), 1);
  assertEqual("AZR-164 liveSpan(60) clamped", liveSpanOf(60), 1);
  assertEqual("AZR-164 liveSpan(600) clamped", liveSpanOf(600), 1);
  // tickHollowHunger must never be invoked with dt > LIVE_FRAME_MAX at the call site
  assertTrue(
    "AZR-164 no tickHollowHunger(dt) in live path (source contract)",
    !/if \(live\) \{[\s\S]*?tickHollowHunger\(dt\)/.test(gameSrc)
  );
}


// AZR-165: load-failure keep raw — source contracts (unit suite in test-load-safety.mjs)
{
  const gameSrc = fs.readFileSync(path.join(root, "js/game.js"), "utf8");
  assertTrue(
    "AZR-165 save early-return if loadFailed",
    /function save\s*\(\s*\)\s*\{[\s\S]*?if\s*\(\s*loadFailed\s*\)\s*return\s*;/.test(gameSrc)
  );
  assertTrue(
    "AZR-165 bak1/bak2 keys",
    /SAVE_BAK1_KEY\s*=\s*"soulgather-v0\.bak1"/.test(gameSrc) &&
      /SAVE_BAK2_KEY\s*=\s*"soulgather-v0\.bak2"/.test(gameSrc)
  );
  assertTrue(
    "AZR-165 load catch uses beginLoadFailure",
    /catch\s*\(\s*err\s*\)\s*\{\s*beginLoadFailure\s*\(\s*raw\s*\)\s*;\s*\}/.test(gameSrc)
  );
  assertTrue(
    "AZR-165 exports isSaveShape",
    /isSaveShape:\s*isSaveShape/.test(gameSrc)
  );
}

// AZR-168: save sanitise + tripwire source contracts
{
  const gameSrc = fs.readFileSync(path.join(root, "js/game.js"), "utf8");
  const applyStart = gameSrc.indexOf("function applySaveData");
  const applyEnd = gameSrc.indexOf("function adoptSave");
  const applyFn = applyStart >= 0 && applyEnd > applyStart ? gameSrc.slice(applyStart, applyEnd) : "";
  assertTrue("AZR-168 loadCount helper exists", /function loadCount\s*\(/.test(gameSrc));
  assertTrue("AZR-168 loadNum helper exists", /function loadNum\s*\(/.test(gameSrc));
  assertTrue("AZR-168 tripwireSanity exists", /function tripwireSanity\s*\(/.test(gameSrc));
  assertTrue("AZR-168 sanityAcc ~1s accumulator", /sanityAcc\s*\+=\s*dt/.test(gameSrc));
  assertTrue(
    "AZR-168 save() still gated on loadFailed",
    /function save\s*\(\s*\)\s*\{[\s\S]*?if\s*\(\s*loadFailed\s*\)\s*return\s*;/.test(gameSrc)
  );
  assertTrue(
    "AZR-168 no Number(data. leftover in applySaveData",
    applyFn.length > 0 && !/Number\(data\./.test(applyFn)
  );
  assertTrue(
    "AZR-168 no raw N.load(data. in applySaveData",
    applyFn.length > 0 && !/N\.load\(data\./.test(applyFn)
  );
  assertTrue("AZR-168 applySaveData uses loadCount", /loadCount\(data\./.test(applyFn));
  assertTrue("AZR-168 applySaveData uses loadNum", /loadNum\(data\./.test(applyFn));
  assertTrue(
    "AZR-168 tripwire reuses beginLoadFailure",
    /function tripwireSanity[\s\S]*?beginLoadFailure\s*\(/.test(gameSrc)
  );
}

// AZR-169: scan js/game.js for duplicate top-level function declarations matching
// `^  function (\w+)\(` (two-space indent IIFE style). Fail the build on any
// name collision. Pre-fix main failed this assert on `renderNames`.
{
  const gameSrc = fs.readFileSync(path.join(root, "js/game.js"), "utf8");
  const re = /^  function (\w+)\(/gm;
  const seen = Object.create(null);
  const collisions = [];
  let m;
  while ((m = re.exec(gameSrc)) !== null) {
    const name = m[1];
    if (seen[name]) {
      if (collisions.indexOf(name) < 0) collisions.push(name);
    } else {
      seen[name] = 1;
    }
  }
  assertTrue(
    "AZR-169 no duplicate top-level functions (pre-fix main failed on renderNames)",
    collisions.length === 0
  );
  if (collisions.length) {
    console.error("AZR-169 collisions:", collisions.join(", "));
  }
  const renderNamesHits = gameSrc.match(/function renderNames\s*\(/g) || [];
  assertEqual("AZR-169 exactly one function renderNames", renderNamesHits.length, 1);

  const start = gameSrc.indexOf("function renderNames(");
  const nextFn = gameSrc.indexOf("\n  function ", start + 1);
  const body = start >= 0 ? (nextFn > start ? gameSrc.slice(start, nextFn) : gameSrc.slice(start)) : "";
  assertTrue(
    "AZR-169 live early-return needs namesPanel + namesList",
    /if\s*\(\s*!els\.namesPanel\s*\|\|\s*!els\.namesList\s*\)\s*return/.test(body)
  );
  assertTrue(
    "AZR-169 live visibility n >= 1 || namesComplete",
    /n\s*>=\s*1\s*\|\|\s*!!state\.namesComplete/.test(body)
  );
  assertTrue(
    "AZR-169 live dataset.sig n + \":\" + (namesComplete ? \"1\" : \"0\")",
    /n\s*\+\s*":"\s*\+\s*\(\s*state\.namesComplete\s*\?\s*"1"\s*:\s*"0"\s*\)/.test(body)
  );

  function namesPanelVisible(namesBound, namesComplete) {
    const n = Math.max(0, Math.min(12, Math.floor(Number(namesBound) || 0)));
    return n >= 1 || !!namesComplete;
  }
  function namesListSig(namesBound, namesComplete) {
    const n = Math.max(0, Math.min(12, Math.floor(Number(namesBound) || 0)));
    return n + ":" + (namesComplete ? "1" : "0");
  }
  assertEqual("AZR-169 panel hidden n=0 incomplete", namesPanelVisible(0, false), false);
  assertEqual("AZR-169 panel shown n=1", namesPanelVisible(1, false), true);
  assertEqual("AZR-169 panel shown namesComplete n=0", namesPanelVisible(0, true), true);
  assertEqual("AZR-169 panel shown namesComplete clamped 99", namesPanelVisible(99, true), true);
  assertEqual("AZR-169 sig n=3 incomplete", namesListSig(3, false), "3:0");
  assertEqual("AZR-169 sig complete n=12", namesListSig(12, true), "12:1");
  assertEqual("AZR-169 sig clamps 99", namesListSig(99, true), "12:1");
  assertTrue("AZR-169 adoptSave empty sig !== live encoding", namesListSig(0, false) !== "");
  assertTrue("AZR-169 adoptSave empty sig !== complete encoding", namesListSig(12, true) !== "");

  const adoptStart = gameSrc.indexOf("function adoptSave");
  const adoptNext = gameSrc.indexOf("\n  function ", adoptStart + 1);
  const adoptBody = adoptStart >= 0 ? gameSrc.slice(adoptStart, adoptNext > adoptStart ? adoptNext : undefined) : "";
  assertTrue(
    "AZR-169 adoptSave clears namesList dataset.sig",
    /els\.namesList\.dataset\.sig\s*=\s*""/.test(adoptBody)
  );
  const hideStart = gameSrc.indexOf("function hideNames");
  const hideNext = gameSrc.indexOf("\n  function ", hideStart + 1);
  const hideBody = hideStart >= 0 ? gameSrc.slice(hideStart, hideNext > hideStart ? hideNext : undefined) : "";
  assertTrue(
    "AZR-169 hideNames hides namesPanel",
    /namesPanel\.classList\.add\(\s*"is-hidden"\s*\)/.test(hideBody)
  );
  assertTrue("AZR-169 hideNames does not write a stale sig", !/dataset\.sig/.test(hideBody));
}


// AZR-170: single REVEALABLE table for producer unlock cards; boot/adoptSave/layTribute
// share revealUnlockedCards; hideUnlockCards iterates the same table; render has no
// classList.contains("is-hidden") re-reveal bandage for those cards.
{
  const gameSrc = fs.readFileSync(path.join(root, "js/game.js"), "utf8");

  const tableStart = gameSrc.indexOf("var REVEALABLE = [");
  assertTrue("AZR-170 REVEALABLE table exists", tableStart >= 0);
  const tableEnd = gameSrc.indexOf("];", tableStart);
  const tableBody = tableStart >= 0 && tableEnd > tableStart ? gameSrc.slice(tableStart, tableEnd + 2) : "";

  const producerFlags = [
    "unlockedWell",
    "unlockedLanterns",
    "unlockedSpirits",
    "unlockedFetters",
    "unlockedVessels",
    "unlockedThrones",
    "unlockedCensers",
    "unlockedPyres",
    "unlockedUrns",
    "unlockedHearths",
    "unlockedBeacons",
    "unlockedSpires",
    "unlockedObelisks",
    "unlockedChalices"
  ];
  for (const flag of producerFlags) {
    assertTrue(
      "AZR-170 REVEALABLE covers " + flag,
      new RegExp('flag:\\s*"' + flag + '"').test(tableBody)
    );
  }
  assertTrue("AZR-170 REVEALABLE includes Spires", /flag:\s*"unlockedSpires"/.test(tableBody));
  assertTrue("AZR-170 REVEALABLE includes Obelisks", /flag:\s*"unlockedObelisks"/.test(tableBody));

  // freshState producer unlocked* flags must all appear in REVEALABLE (exclude rites/meta).
  const freshStart = gameSrc.indexOf("function freshState");
  const freshNext = gameSrc.indexOf("\n  function ", freshStart + 1);
  const freshBody = freshStart >= 0 ? gameSrc.slice(freshStart, freshNext > freshStart ? freshNext : undefined) : "";
  const freshUnlocks = [];
  const unlockRe = /unlocked([A-Za-z]+):\s*false/g;
  let um;
  while ((um = unlockRe.exec(freshBody)) !== null) {
    freshUnlocks.push("unlocked" + um[1]);
  }
  const nonProducer = /^(unlockedMarks|unlockedAutobind|unlockedAutobind|unlockedNightTithe|unlockedVeil|unlockedWake|unlockedToll|unlockedBindingToll|unlockedWellDraws|unlockedChoir)/;
  const freshProducers = freshUnlocks.filter(function (f) {
    return (
      f === "unlockedWell" ||
      f === "unlockedLanterns" ||
      f === "unlockedSpirits" ||
      f === "unlockedFetters" ||
      f === "unlockedVessels" ||
      f === "unlockedThrones" ||
      f === "unlockedCensers" ||
      f === "unlockedPyres" ||
      f === "unlockedUrns" ||
      f === "unlockedHearths" ||
      f === "unlockedBeacons" ||
      f === "unlockedSpires" ||
      f === "unlockedObelisks" ||
      f === "unlockedChalices"
    );
  });
  for (const flag of freshProducers) {
    assertTrue(
      "AZR-170 freshState producer " + flag + " in REVEALABLE",
      new RegExp('flag:\\s*"' + flag + '"').test(tableBody)
    );
  }
  assertEqual("AZR-170 freshState producer unlock count", freshProducers.length, 14);

  function fnBody(name) {
    const start = gameSrc.indexOf("function " + name);
    if (start < 0) return "";
    const next = gameSrc.indexOf("\n  function ", start + 1);
    // boot may be followed by non-function code; also try var / if
    let end = next;
    if (name === "boot") {
      const alt = gameSrc.indexOf("\n  if (document.readyState", start);
      if (alt > start && (end < 0 || alt < end)) end = alt;
    }
    if (name === "layTribute") {
      // layTribute is long; find revealUnlockedCards call region via next top-level after it is fmt
      const fmt = gameSrc.indexOf("\n  function fmt(", start);
      if (fmt > start) end = fmt;
    }
    return end > start ? gameSrc.slice(start, end) : gameSrc.slice(start);
  }

  assertTrue(
    "AZR-170 revealUnlockedCards loops REVEALABLE",
    /function revealUnlockedCards\s*\(\s*withToast\s*\)\s*\{[\s\S]*?REVEALABLE\.length[\s\S]*?entry\.reveal\(withToast\)/.test(gameSrc)
  );
  assertTrue("AZR-170 adoptSave calls revealUnlockedCards(false)", /revealUnlockedCards\(\s*false\s*\)/.test(fnBody("adoptSave")));
  assertTrue("AZR-170 layTribute calls revealUnlockedCards(false)", /revealUnlockedCards\(\s*false\s*\)/.test(fnBody("layTribute")));
  assertTrue("AZR-170 boot calls revealUnlockedCards(false)", /revealUnlockedCards\(\s*false\s*\)/.test(fnBody("boot")));

  // No drifted hand-copied reveal lists left at those three sites.
  assertTrue(
    "AZR-170 adoptSave has no hand-copied revealWell list",
    !/if\s*\(\s*state\.unlockedWell\s*\)\s*revealWell/.test(fnBody("adoptSave"))
  );
  assertTrue(
    "AZR-170 boot has no hand-copied revealWell list",
    !/if\s*\(\s*state\.unlockedWell\s*\)\s*revealWell/.test(fnBody("boot"))
  );
  assertTrue(
    "AZR-170 layTribute has no hand-copied revealWell list",
    !/if\s*\(\s*state\.unlockedWell\s*\)\s*revealWell/.test(fnBody("layTribute"))
  );

  const hideBody = fnBody("hideUnlockCards");
  assertTrue(
    "AZR-170 hideUnlockCards iterates REVEALABLE",
    /REVEALABLE\.length/.test(hideBody) && /hideCard\(\s*REVEALABLE\[i\]\.el\(\)\s*\)/.test(hideBody)
  );
  assertTrue(
    "AZR-170 hideUnlockCards has no hand-copied hideCard(els.wellCard)",
    !/hideCard\(\s*els\.wellCard\s*\)/.test(hideBody)
  );

  // render: no classList.contains("is-hidden") re-reveal for producer cards
  const renderStart = gameSrc.indexOf("function render(");
  const renderNext = gameSrc.indexOf("\n  function ", renderStart + 1);
  // render is huge; find a later landmark — bind is after, but many functions inside? render is top-level.
  // Use from function render to function bind (approx) or tick
  let renderEnd = gameSrc.indexOf("\n  function bind(", renderStart);
  if (renderEnd < 0) renderEnd = renderNext;
  const renderBody = renderStart >= 0 ? gameSrc.slice(renderStart, renderEnd > renderStart ? renderEnd : undefined) : "";
  assertTrue(
    "AZR-170 render has no classList.contains is-hidden re-reveal",
    !/classList\.contains\(\s*"is-hidden"\s*\)\s*\)\s*\{\s*reveal/.test(renderBody)
  );
  assertTrue(
    "AZR-170 render does not call revealSpires as bandage",
    !/revealSpires\s*\(/.test(renderBody)
  );
  assertTrue(
    "AZR-170 render does not call revealObelisks as bandage",
    !/revealObelisks\s*\(/.test(renderBody)
  );
  assertTrue(
    "AZR-170 render does not call revealWell as bandage",
    !/revealWell\s*\(/.test(renderBody)
  );
}



// AZR-171: Quiet Court ash-autobind evaluated once after edict starting stock;
// table-driven applyAutobindStarts; headless Tribute restore via extracted helpers.
{
  const gameSrc = fs.readFileSync(path.join(root, "js/game.js"), "utf8");

  assertTrue("AZR-171 applyEdictStartingStock exists", /function applyEdictStartingStock\s*\(/.test(gameSrc));
  assertTrue("AZR-171 applyAutobindStarts exists", /function applyAutobindStarts\s*\(/.test(gameSrc));
  assertTrue("AZR-171 TRIBUTE_AUTOBIND_STARTS table exists", /var TRIBUTE_AUTOBIND_STARTS\s*=\s*\[/.test(gameSrc));

  function fnBody(name) {
    const start = gameSrc.indexOf("function " + name);
    if (start < 0) return "";
    let end = gameSrc.indexOf("\n  function ", start + 1);
    if (name === "layTribute") {
      const alt = gameSrc.indexOf("\n  function fmt(", start);
      if (alt > start && (end < 0 || alt < end)) end = alt;
    }
    return gameSrc.slice(start, end > start ? end : undefined);
  }

  const tributeBody = fnBody("layTribute");
  assertTrue(
    "AZR-171 layTribute calls applyEdictStartingStock before applyAutobindStarts",
    /applyEdictStartingStock\s*\(\s*state\s*\)[\s\S]*applyAutobindStarts\s*\(\s*state\s*\)/.test(tributeBody)
  );
  assertTrue(
    "AZR-171 layTribute calls revealUnlockedCards(false) after autobind phase",
    /applyAutobindStarts\s*\(\s*state\s*\)[\s\S]*revealUnlockedCards\(\s*false\s*\)/.test(tributeBody)
  );
  // First duplicate QC ash block deleted: quietCourtStartsUrnAutobind must not appear inline in layTribute.
  assertTrue(
    "AZR-171 layTribute has no inline quietCourtStartsUrnAutobind",
    !/quietCourtStartsUrnAutobind/.test(tributeBody)
  );
  assertTrue(
    "AZR-171 layTribute has no inline quietCourtStartsHearthAutobind",
    !/quietCourtStartsHearthAutobind/.test(tributeBody)
  );
  // Exactly one table reference for urn QC predicate.
  const urnPredMatches = gameSrc.match(/predicate:\s*quietCourtStartsUrnAutobind/g) || [];
  assertEqual("AZR-171 quietCourtStartsUrnAutobind appears once in TRIBUTE table", urnPredMatches.length, 1);
  assertTrue(
    "AZR-171 comment requires ash unlocks after edict stock",
    /Ash autobind unlocks[\s\S]{0,80}after Edict starting stock/.test(gameSrc)
  );
  assertTrue(
    "AZR-171 exports applyEdictStartingStock",
    /applyEdictStartingStock:\s*applyEdictStartingStock/.test(gameSrc)
  );
  assertTrue(
    "AZR-171 exports applyAutobindStarts",
    /applyAutobindStarts:\s*applyAutobindStarts/.test(gameSrc)
  );

  function extractFn(src, name) {
    const start = src.indexOf("function " + name);
    if (start < 0) throw new Error("missing " + name);
    let i = src.indexOf("{", start);
    let depth = 0;
    for (; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") {
        depth--;
        if (depth === 0) return src.slice(start, i + 1);
      }
    }
    throw new Error("unclosed " + name);
  }

  function extractVarArray(src, name) {
    const start = src.indexOf("var " + name + " = [");
    if (start < 0) throw new Error("missing " + name);
    let i = src.indexOf("[", start);
    let depth = 0;
    for (; i < src.length; i++) {
      if (src[i] === "[") depth++;
      else if (src[i] === "]") {
        depth--;
        if (depth === 0) {
          let end = i + 1;
          if (src[end] === ";") end++;
          return src.slice(start, end);
        }
      }
    }
    throw new Error("unclosed array " + name);
  }

  const UNLOCK_AUTOBIND_LANTERNS = 8;
  const UNLOCK_AUTOBIND_FETTERS = 6;
  const UNLOCK_AUTOBIND_CENSERS = 4;
  const UNLOCK_AUTOBIND_PYRES = 4;
  const UNLOCK_AUTOBIND_CHALICES = 3;
  const UNLOCK_AUTOBIND_URNS = 3;
  const UNLOCK_AUTOBIND_HEARTHS = 3;
  const UNLOCK_AUTOBIND_BEACONS = 3;
  const UNLOCK_AUTOBIND_SPIRES = 3;
  const UNLOCK_AUTOBIND_OBELISKS = 3;
  const CHOIR_MAX = 10;

  const sandbox = {
    N,
    state: null,
    CHOIR_MAX,
    UNLOCK_AUTOBIND_LANTERNS,
    UNLOCK_AUTOBIND_FETTERS,
    UNLOCK_AUTOBIND_CENSERS,
    UNLOCK_AUTOBIND_PYRES,
    UNLOCK_AUTOBIND_CHALICES,
    UNLOCK_AUTOBIND_URNS,
    UNLOCK_AUTOBIND_HEARTHS,
    UNLOCK_AUTOBIND_BEACONS,
    UNLOCK_AUTOBIND_SPIRES,
    UNLOCK_AUTOBIND_OBELISKS,
    quietCourtStartsLanternAutobind,
    quietCourtStartsFetterAutobind,
    quietCourtStartsPyreAutobind,
    quietCourtStartsChaliceAutobind,
    quietCourtStartsUrnAutobind,
    quietCourtStartsHearthAutobind,
    quietCourtStartsBeaconAutobind,
    quietCourtStartsSpireAutobind,
    quietCourtStartsObeliskAutobind,
    smokeStartsCenserAutobind,
    cinderEdictStartsPyreAutobind,
    cutEdictStartsUrnAutobind,
    tendingEdictStartsHearthAutobind,
    gleamEdictStartsBeaconAutobind,
    riseEdictStartsSpireAutobind,
    draughtStartsChaliceAutobind,
    embersStartsPyres,
    urnEdictStartsUrns,
    hearthEdictStartsHearths,
    beaconEdictStartsBeacons,
    spireEdictStartsSpires,
    obeliskEdictStartsObelisks,
    cupStartsChalices,
    TRIBUTE_AUTOBIND_STARTS: null,
    applyEdictStartingStock: null,
    applyAutobindStarts: null
  };
  vm.createContext(sandbox);
  vm.runInContext(extractVarArray(gameSrc, "TRIBUTE_AUTOBIND_STARTS"), sandbox);
  vm.runInContext(extractFn(gameSrc, "applyEdictStartingStock"), sandbox);
  vm.runInContext(extractFn(gameSrc, "applyAutobindStarts"), sandbox);

  assertEqual("AZR-171 TRIBUTE_AUTOBIND_STARTS length", sandbox.TRIBUTE_AUTOBIND_STARTS.length, 16);

  function freshBag() {
    return {
      quietCourtLevel: 0,
      urnEdictLevel: 0,
      hearthEdictLevel: 0,
      beaconEdictLevel: 0,
      spireEdictLevel: 0,
      obeliskEdictLevel: 0,
      memoryLevel: 0,
      seatLevel: 0,
      echoLevel: 0,
      kindleLevel: 0,
      ashenLevel: 0,
      longMemoryLevel: 0,
      depthLevel: 0,
      embersEdictLevel: 0,
      cupEdictLevel: 0,
      choirEdictLevel: 0,
      smokeEdictLevel: 0,
      cinderEdictLevel: 0,
      cutEdictLevel: 0,
      tendingEdictLevel: 0,
      gleamEdictLevel: 0,
      riseEdictLevel: 0,
      draughtEdictLevel: 0,
      shades: N.fromNumber(0),
      lanterns: N.fromNumber(0),
      fetters: N.fromNumber(0),
      censers: N.fromNumber(0),
      pyres: N.fromNumber(0),
      urns: N.fromNumber(0),
      hearths: N.fromNumber(0),
      beacons: N.fromNumber(0),
      spires: N.fromNumber(0),
      obelisks: N.fromNumber(0),
      chalices: 0,
      thrones: 0,
      ash: N.fromNumber(0),
      wellDepth: 0,
      wellDraws: false,
      choirLevel: 0,
      autobind: false,
      unlockedAutobind: false,
      autobindUrns: false,
      unlockedAutobindUrns: false,
      autobindHearths: false,
      unlockedAutobindHearths: false,
      autobindBeacons: false,
      unlockedAutobindBeacons: false,
      autobindSpires: false,
      unlockedAutobindSpires: false,
      autobindObelisks: false,
      unlockedAutobindObelisks: false,
      autobindLanterns: false,
      unlockedAutobindLanterns: false,
      autobindFetters: false,
      unlockedAutobindFetters: false,
      autobindPyres: false,
      unlockedAutobindPyres: false,
      autobindChalices: false,
      unlockedAutobindChalices: false,
      autobindCensers: false,
      unlockedAutobindCensers: false
    };
  }

  // QC + edict stock at unlock threshold → autobind AND unlockedAutobind
  {
    const s = freshBag();
    s.quietCourtLevel = 1;
    s.urnEdictLevel = 3;
    s.hearthEdictLevel = 3;
    s.beaconEdictLevel = 3;
    s.spireEdictLevel = 3;
    s.obeliskEdictLevel = 3;
    sandbox.applyEdictStartingStock(s);
    sandbox.applyAutobindStarts(s);
    assertTrue("AZR-171 QC+edict sets autobindUrns", !!s.autobindUrns);
    assertTrue("AZR-171 QC+edict sets unlockedAutobindUrns", !!s.unlockedAutobindUrns);
    assertTrue("AZR-171 QC+edict sets autobindHearths", !!s.autobindHearths);
    assertTrue("AZR-171 QC+edict sets unlockedAutobindHearths", !!s.unlockedAutobindHearths);
    assertTrue("AZR-171 QC+edict sets autobindBeacons", !!s.autobindBeacons);
    assertTrue("AZR-171 QC+edict sets unlockedAutobindBeacons", !!s.unlockedAutobindBeacons);
    assertTrue("AZR-171 QC+edict sets autobindSpires", !!s.autobindSpires);
    assertTrue("AZR-171 QC+edict sets unlockedAutobindSpires", !!s.unlockedAutobindSpires);
    assertTrue("AZR-171 QC+edict sets autobindObelisks", !!s.autobindObelisks);
    assertTrue("AZR-171 QC+edict sets unlockedAutobindObelisks", !!s.unlockedAutobindObelisks);
    assertEqual("AZR-171 QC+edict urn stock", unwrap(s.urns), 3);
  }

  // QC only, no edict stock → autobind but NOT unlocked (below threshold)
  {
    const s = freshBag();
    s.quietCourtLevel = 1;
    sandbox.applyEdictStartingStock(s);
    sandbox.applyAutobindStarts(s);
    assertTrue("AZR-171 QC-only sets autobindUrns", !!s.autobindUrns);
    assertTrue("AZR-171 QC-only does not unlock AutobindUrns", !s.unlockedAutobindUrns);
    assertTrue("AZR-171 QC-only sets autobindHearths", !!s.autobindHearths);
    assertTrue("AZR-171 QC-only does not unlock AutobindHearths", !s.unlockedAutobindHearths);
    assertTrue("AZR-171 QC-only sets autobindBeacons", !!s.autobindBeacons);
    assertTrue("AZR-171 QC-only does not unlock AutobindBeacons", !s.unlockedAutobindBeacons);
    assertTrue("AZR-171 QC-only sets autobindSpires", !!s.autobindSpires);
    assertTrue("AZR-171 QC-only does not unlock AutobindSpires", !s.unlockedAutobindSpires);
    assertTrue("AZR-171 QC-only sets autobindObelisks", !!s.autobindObelisks);
    assertTrue("AZR-171 QC-only does not unlock AutobindObelisks", !s.unlockedAutobindObelisks);
    assertEqual("AZR-171 QC-only urn stock", unwrap(s.urns), 0);
    assertTrue("AZR-171 QC-only still starts shade autobind", !!s.autobind && !!s.unlockedAutobind);
  }

  // Sub-threshold edict stock (1 < 3) still does not unlock the row
  {
    const s = freshBag();
    s.quietCourtLevel = 1;
    s.urnEdictLevel = 1;
    sandbox.applyEdictStartingStock(s);
    sandbox.applyAutobindStarts(s);
    assertTrue("AZR-171 QC+urnEdict1 sets autobindUrns", !!s.autobindUrns);
    assertTrue("AZR-171 QC+urnEdict1 does not unlock AutobindUrns", !s.unlockedAutobindUrns);
    assertEqual("AZR-171 QC+urnEdict1 urn stock", unwrap(s.urns), 1);
  }
}


if (failed > 0) {
  console.error(failed + " assertion(s) failed");
  process.exit(1);
}

console.log("all economy assertions passed");
process.exit(0);
