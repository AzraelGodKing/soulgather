#!/usr/bin/env node
/**
 * Soulgather v6.7 economy smoke test.
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

function bulkCost(base, owned, k, mult) {
  const b = Number(base);
  const m = mult == null ? 1.15 : Number(mult);
  const n = Math.max(0, Math.floor(k));
  let total = N.fromNumber(0);
  for (let i = 0; i < n; i++) {
    const o = Math.max(0, Math.floor(owned)) + i;
    total = N.add(total, N.cost(b, m, o));
  }
  return total;
}

/** Tiny maxAffordable mirror for purchasePlan tests (no DOM). */
function maxAffordable(base, owned, currency, mult) {
  const b = Number(base);
  const m = mult == null ? 1.15 : Number(mult);
  let remaining = currency;
  if (remaining && typeof remaining === "object" && typeof remaining.m === "number") {
    /* Num */
  } else {
    remaining = N.fromNumber(Number(remaining) || 0);
  }
  let k = 0;
  while (k < 10000) {
    const c = N.cost(b, m, Math.max(0, Math.floor(Number(owned) || 0)) + k);
    if (N.cmp(remaining, c) < 0) break;
    remaining = N.sub(remaining, c);
    k += 1;
  }
  return k;
}

/** Mirror of game purchasePlan for documenting buyMode on stackable producers (no DOM). */
function purchasePlan(owned, currency, base, mult, buyMode) {
  const b = base == null ? 10 : base;
  const m = mult == null ? 1.15 : mult;
  const mode = buyMode || "1";
  const one = N.cost(b, m, owned);
  if (mode === "10") {
    let k10 = maxAffordable(b, owned, currency, m);
    if (k10 < 1) {
      return { k: 0, cost: one, can: false };
    }
    if (k10 > 10) k10 = 10;
    return { k: k10, cost: bulkCost(b, owned, k10, m), can: true };
  }
  if (mode === "max") {
    const k = maxAffordable(b, owned, currency, m);
    if (k < 1) return { k: 0, cost: one, can: false };
    return { k, cost: bulkCost(b, owned, k, m), can: true };
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

function siphonCost(level) {
  return N.cost(50, 3, level);
}

function levyCost(level) {
  return N.cost(15, 3, level);
}

function siphonMult(level) {
  return Math.pow(2, Math.max(0, Math.floor(Number(level) || 0)));
}

function cinderMult(level) {
  return Math.pow(2, Math.max(0, Math.floor(Number(level) || 0)));
}

function urnRiteMult(level) {
  return Math.pow(2, Math.max(0, Math.floor(Number(level) || 0)));
}

function hearthRiteMult(level) {
  return Math.pow(2, Math.max(0, Math.floor(Number(level) || 0)));
}

function beaconRiteMult(level) {
  return Math.pow(2, Math.max(0, Math.floor(Number(level) || 0)));
}

function spireRiteMult(level) {
  return Math.pow(2, Math.max(0, Math.floor(Number(level) || 0)));
}

const HEARTH_RITE_COST = 14;
const BEACON_RITE_COST = 16;
const SPIRE_RITE_COST = 18;

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

assertEqual("siphonCost(0)", siphonCost(0), 50);
assertEqual("siphonCost(1)", siphonCost(1), 150);
assertEqual("levyCost(0)", levyCost(0), 15);
assertEqual("levyCost(1)", levyCost(1), 45);
assertEqual("siphonMult(3)", siphonMult(3), 8);
assertEqual("cinderMult(0)", cinderMult(0), 1);
assertEqual("cinderMult(1)", cinderMult(1), 2);
assertEqual("cinderMult(2)", cinderMult(2), 4);
assertEqual("urnRiteMult(0)", urnRiteMult(0), 1);
assertEqual("urnRiteMult(1)", urnRiteMult(1), 2);
assertEqual("urnRiteMult(2)", urnRiteMult(2), 4);
assertEqual("hearthRiteMult(0)", hearthRiteMult(0), 1);
assertEqual("hearthRiteMult(1)", hearthRiteMult(1), 2);
assertEqual("hearthRiteMult(2)", hearthRiteMult(2), 4);
assertEqual("HEARTH_RITE_COST", HEARTH_RITE_COST, 14);
assertEqual("beaconRiteMult(0)", beaconRiteMult(0), 1);
assertEqual("beaconRiteMult(1)", beaconRiteMult(1), 2);
assertEqual("beaconRiteMult(2)", beaconRiteMult(2), 4);
assertEqual("BEACON_RITE_COST", BEACON_RITE_COST, 16);
assertEqual("spireRiteMult(0)", spireRiteMult(0), 1);
assertEqual("spireRiteMult(1)", spireRiteMult(1), 2);
assertEqual("spireRiteMult(2)", spireRiteMult(2), 4);
assertEqual("SPIRE_RITE_COST", SPIRE_RITE_COST, 18);
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

if (failed > 0) {
  console.error(failed + " assertion(s) failed");
  process.exit(1);
}

console.log("all economy assertions passed");
process.exit(0);
