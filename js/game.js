(function () {
  "use strict";

  var N = globalThis.SoulgatherNum;
  var C = globalThis.SoulgatherConfig;
  // Snapshot: the export block below overwrites same-named keys on the global with state-reading wrappers.
  var E = Object.assign({}, globalThis.SoulgatherEconomy);
  var S = globalThis.SoulgatherState;

  var SAVE_KEY = C.SAVE_KEY;
  var SAVE_BAK1_KEY = C.SAVE_BAK1_KEY;
  var SAVE_BAK2_KEY = C.SAVE_BAK2_KEY;
  var BAK1_MS = C.BAK1_MS;
  var BAK2_MS = C.BAK2_MS;
  var CHALICE_MAX = C.CHALICE_MAX;
  var RENDER_MS = C.RENDER_MS;
  var MAX_DT = C.MAX_DT;
  var AUTOBIND_INTERVAL = C.AUTOBIND_INTERVAL;
  var LIVE_FRAME_MAX = C.LIVE_FRAME_MAX;
  var autobindAcc = 0;
  var sanityAcc = 0;
  var AWAY_SUMMARY_DT = C.AWAY_SUMMARY_DT;
  /* Aliases to BASE for export/compat (live costs use *Cost(level)). */

  var _dirty = true;
  var _lastRenderTime = 0;

  function markDirty() { _dirty = true; }

  var saveDirty = false;
  function markSaveDirty() { saveDirty = true; }
  function flushSave() { if (!saveDirty) return; saveDirty = false; save(); }
  /* ─── Accessibility announcer (throttled, polite) ──────────────────── */

  /* ─── Reduced-motion (in-game setting, independent of OS) ──────────── */
  var REDUCE_MOTION_KEY = C.REDUCE_MOTION_KEY;
  var _reduceMotion = false;

  function reduceMotionActive() {
    if (_reduceMotion) return true;
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  }

  function setReduceMotion(on) {
    _reduceMotion = !!on;
    if (typeof localStorage !== "undefined") {
      try { localStorage.setItem(REDUCE_MOTION_KEY, _reduceMotion ? "1" : ""); } catch (e) { /* ignore */ }
    }
    if (typeof document !== "undefined") {
      document.body.classList.toggle("reduce-motion", _reduceMotion);
    }
  }

  function loadReduceMotion() {
    if (typeof localStorage !== "undefined") {
      try { _reduceMotion = localStorage.getItem(REDUCE_MOTION_KEY) === "1"; } catch (e) { /* ignore */ }
    }
    if (typeof document !== "undefined") {
      document.body.classList.toggle("reduce-motion", _reduceMotion);
    }
  }

  var producerCostMult = E.producerCostMult;

  function currentProducerCostMult() {
    return producerCostMult(state && state.favorEarned);
  }

  function producerCost(owned) {
    return E.producerCost(owned, state.favorEarned);
  }

  function shadeCost(owned) {
    return E.shadeCost(owned, state.bindingTollLevel, state.favorEarned);
  }

  function spiritCost(owned) {
    return E.spiritCost(owned, state.bindingTollLevel, state.favorEarned);
  }

  function vesselCost(owned) {
    return E.vesselCost(owned, state.favorEarned);
  }

  function throneCost(owned) {
    return E.throneCost(owned, state.favorEarned);
  }

  var lanternCost = E.lanternCost;

  var fetterCost = E.fetterCost;

  function censerCost(owned) {
    return E.censerCost(owned, state.favorEarned);
  }

  var pyreCost = E.pyreCost;

  var urnCost = E.urnCost;

  var hearthCost = E.hearthCost;

  var beaconCost = E.beaconCost;

  var spireCost = E.spireCost;

  var obeliskCost = E.obeliskCost;

  var chaliceCost = E.chaliceCost;

  function wellPurchasePlan(owned, currency) {
    return E.wellPurchasePlan(owned, currency, state.buyMode);
  }

  function bulkCostLoop(base, owned, k, mult, extraMult) {
    return E.bulkCostLoop(base, owned, k, mult == null ? currentProducerCostMult() : mult, extraMult);
  }

  function maxAffordableLoop(base, owned, currency, mult, extraMult) {
    return E.maxAffordableLoop(base, owned, currency, mult == null ? currentProducerCostMult() : mult, extraMult);
  }

  function bulkCost(base, owned, k, mult, extraMult) {
    return E.bulkCost(base, owned, k, mult == null ? currentProducerCostMult() : mult, extraMult);
  }

  function maxAffordable(base, owned, currency, mult, extraMult) {
    return E.maxAffordable(base, owned, currency, mult == null ? currentProducerCostMult() : mult, extraMult);
  }

  function bindingTollRowOpen() {
    if ((Number(state.bindingTollLevel) || 0) >= 1) return true;
    if (state.unlockedBindingToll) return true;
    return N.cmp(state.fetters, 5) >= 0 && (Number(state.favorEarned) || 0) >= 1;
  }

  var stacksWantedFromIdle = C.stacksWantedFromIdle;

  function hollowHungerActive(view) {
    var s = view || state;
    return (Number(s.favorEarned) || 0) >= 2 && !!s.unlockedPyres;
  }

  var hollowSpendClears = E.hollowSpendClears;

  function noteHollowManualSpend(kind, spent, stockBefore, target) {
    var s = target || state;
    if (kind && !hollowSpendClears(kind, spent, stockBefore)) return;
    s.hollowStacks = 0;
    s.hollowIdle = 0;
  }

  function tickHollowHunger(dt) {
    // AZR-164: do not accrue Hollow while the tab is hidden (heartbeat may still call live applyDt).
    if (typeof document !== "undefined" && document.hidden) return;
    if (!hollowHungerActive()) return;
    state.hollowIdle = (Number(state.hollowIdle) || 0) + dt;
    var want = stacksWantedFromIdle(state.hollowIdle);
    var cur = Math.max(0, Math.floor(Number(state.hollowStacks) || 0));
    if (want > cur) {
      var first = cur < 1 && want >= 1;
      state.hollowStacks = want;
      if (first && !state.hollowWarned) {
        state.hollowWarned = true;
        showToast("The well grows hollow.");
        announce("Hollow stack gained.");
      }
    }
  }

  var normalizeVow = C.normalizeVow;

  var U = globalThis.SoulgatherUI.create({
    getState: function () { return state; },
    claimFlag: function (name) {
      if (state[name]) return false;
      state[name] = true;
      markSaveDirty();
      return true;
    },
    bindingTollRowOpen: bindingTollRowOpen,
    chalicePlan: chalicePlan,
    clickPower: clickPower,
    crownUnlocked: crownUnlocked,
    currentProducerCostMult: currentProducerCostMult,
    currentTitheCost: currentTitheCost,
    hymnActive: hymnActive,
    isTypingTarget: isTypingTarget,
    knellActive: knellActive,
    nightActive: nightActive,
    processionActive: processionActive,
    purchasePlan: purchasePlan,
    rateMult: rateMult,
    reduceMotionActive: reduceMotionActive,
    remembranceUnlocked: remembranceUnlocked,
    shadeSoulsPerSec: shadeSoulsPerSec,
    shadesPerSec: shadesPerSec,
    soulsPerSec: soulsPerSec,
    spiritsPerSec: spiritsPerSec,
    titheActive: titheActive,
    tollActive: tollActive,
    veilActive: veilActive,
    wakeActive: wakeActive,
    wellPurchasePlan: wellPurchasePlan
  });
  var els = U.els;
  var setText = U.setText;
  var announce = U.announce;
  var fmt = U.fmt;
  var formatBlessing = U.formatBlessing;
  var pulseGather = U.pulseGather;
  var spawnRipple = U.spawnRipple;
  var revealWell = U.revealWell;
  var revealSpirits = U.revealSpirits;
  var revealVessels = U.revealVessels;
  var revealThrones = U.revealThrones;
  var revealLanterns = U.revealLanterns;
  var revealCensers = U.revealCensers;
  var revealPyres = U.revealPyres;
  var revealUrns = U.revealUrns;
  var revealHearths = U.revealHearths;
  var revealBeacons = U.revealBeacons;
  var revealSpires = U.revealSpires;
  var revealObelisks = U.revealObelisks;
  var revealChalices = U.revealChalices;
  var revealFetters = U.revealFetters;
  var revealUnlockedCards = U.revealUnlockedCards;
  var hideUnlockCards = U.hideUnlockCards;
  var capEnqueueToast = U.capEnqueueToast;
  var formatGiftBatchSummary = U.formatGiftBatchSummary;
  var beginGiftToastBatch = U.beginGiftToastBatch;
  var flushGiftToasts = U.flushGiftToasts;
  var showToast = U.showToast;
  var toastBulk = U.toastBulk;
  var hideToast = U.hideToast;
  var render = U.render;

  var Pg = globalThis.SoulgatherProgression.create({
    getState: function () { return state; },
    rememberVow: function () { return A.rememberVow.apply(null, arguments); },
    markSaveDirty: markSaveDirty,
    remembranceUnlocked: remembranceUnlocked,
    beginGiftToastBatch: U.beginGiftToastBatch,
    flushGiftToasts: U.flushGiftToasts,
    revealBeacons: U.revealBeacons,
    revealCensers: U.revealCensers,
    revealChalices: U.revealChalices,
    revealFetters: U.revealFetters,
    revealHearths: U.revealHearths,
    revealLanterns: U.revealLanterns,
    revealObelisks: U.revealObelisks,
    revealPyres: U.revealPyres,
    revealSpires: U.revealSpires,
    revealSpirits: U.revealSpirits,
    revealThrones: U.revealThrones,
    revealUrns: U.revealUrns,
    revealVessels: U.revealVessels,
    revealWell: U.revealWell,
    showToast: U.showToast
  });
  var markChronicle = Pg.markChronicle;
  var syncChronicle = Pg.syncChronicle;
  var checkUnlock = Pg.checkUnlock;
  var rebuildUngrantedCount = Pg.rebuildUngrantedCount;
  var tryMilestoneGifts = Pg.tryMilestoneGifts;

  var A = globalThis.SoulgatherActions.create({
    getState: function () { return state; },
    setState: function (s) { state = s; },
    confirm: function (message) { return window.confirm(message); },
    resetFavorReady: function () { U.resetFavorReady(); },
    announce: announce,
    bindingTollRowOpen: bindingTollRowOpen,
    chalicePlan: chalicePlan,
    checkUnlock: checkUnlock,
    crownUnlocked: crownUnlocked,
    currentProducerCostMult: currentProducerCostMult,
    currentTitheCost: currentTitheCost,
    hideToast: hideToast,
    hideUnlockCards: hideUnlockCards,
    knellActive: knellActive,
    markChronicle: markChronicle,
    markDirty: markDirty,
    markSaveDirty: markSaveDirty,
    nightActive: nightActive,
    noteHollowManualSpend: noteHollowManualSpend,
    processionActive: processionActive,
    purchasePlan: purchasePlan,
    remembranceUnlocked: remembranceUnlocked,
    render: render,
    revealUnlockedCards: revealUnlockedCards,
    save: save,
    showToast: showToast,
    syncChronicle: syncChronicle,
    titheActive: titheActive,
    toastBulk: toastBulk,
    tollActive: tollActive,
    veilActive: veilActive,
    wakeActive: wakeActive,
    wellPurchasePlan: wellPurchasePlan
  });
  var TRIBUTE_AUTOBIND_STARTS = globalThis.SoulgatherActions.TRIBUTE_AUTOBIND_STARTS;
  var rememberVow = A.rememberVow;
  var buyWell = A.buyWell;
  var buyShade = A.buyShade;
  var buySpirit = A.buySpirit;
  var buyVessel = A.buyVessel;
  var buyThrone = A.buyThrone;
  var buyLantern = A.buyLantern;
  var buyFetter = A.buyFetter;
  var buyCenser = A.buyCenser;
  var buyPyre = A.buyPyre;
  var buyUrn = A.buyUrn;
  var buyHearth = A.buyHearth;
  var buyBeacon = A.buyBeacon;
  var buySpire = A.buySpire;
  var buyObelisk = A.buyObelisk;
  var buyChalice = A.buyChalice;
  var buySiphon = A.buySiphon;
  var buyLevy = A.buyLevy;
  var buyBindingToll = A.buyBindingToll;
  var buyWellDraws = A.buyWellDraws;
  var applyEdictStartingStock = A.applyEdictStartingStock;
  var applyAutobindStarts = A.applyAutobindStarts;
  var layTribute = A.layTribute;

  function seedVowsKnown(raw) {
    return S.seedVowsKnown(raw, state);
  }

  var normalizeBuyMode = C.normalizeBuyMode;

  function isTypingTarget(el) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if (el.isContentEditable) return true;
    return false;
  }

  var FIELDS_KEYS = S.FIELDS_KEYS;

  // ── bonus* → gift* migration map (AZR-179) ──

  var freshState = S.freshState;

  function resetToScope(target) {
    S.resetToScope(state, target);
  }

  var state = freshState();
  var lastFrame = 0;
  var hiddenHeartbeatId = 0;
  var hiddenHeartbeatAt = 0;
  var pendingAwayToast = null;
  var loadFailed = false;
  var loadFailedRaw = null;
  var loadFailReturnFocus = null;

  var clamp = E.clamp;

  function currentMult() {
    return E.currentMult(
      state.favorEarned, state.thrones, state.edictLevel,
      state.aspect, state.crownWeight, state.namesComplete,
      state.chalices, state.ossuaryLevel, processionActive()
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

  function knellActive() {
    return (Number(state.knellLeft) || 0) > 0;
  }

  function rateMult() {
    return E.rateMult(
      state.favorEarned, state.thrones, state.edictLevel,
      state.aspect, state.crownWeight, state.namesComplete,
      state.chalices, state.ossuaryLevel, processionActive(),
      titheActive(), state.hollowStacks
    );
  }

  function clickPower() {
    return E.clickPower(
      state.wellDepth, rateMult(), veilActive(), tollActive(),
      knellActive(), state.hollowStacks
    );
  }

  function shadeSoulsPerSec(cachedRm) {
    var rm = cachedRm != null ? cachedRm : rateMult();
    return E.shadeSoulsPerSec(
      state.shades, state.siphonLevel, state.aspect, state.lanterns,
      state.emberLevel, nightActive(), hymnActive(),
      state.bindingTollLevel, rm
    );
  }

  function soulsPerSec(cachedRm) {
    var rm = cachedRm != null ? cachedRm : rateMult();
    return E.soulsPerSec(
      state.shades, state.siphonLevel, state.aspect, state.lanterns,
      state.emberLevel, nightActive(), hymnActive(),
      state.bindingTollLevel, rm,
      state.wellDraws, state.wellDepth, veilActive(), tollActive(),
      knellActive(), state.hollowStacks
    );
  }

  function shadesPerSec(cachedRm) {
    var rm = cachedRm != null ? cachedRm : rateMult();
    return E.shadesPerSec(
      state.spirits, state.levyLevel, state.aspect, state.chainLevel,
      state.fetters, hymnActive(), state.bindingTollLevel, rm
    );
  }

  function spiritsPerSec(cachedRm) {
    var rm = cachedRm != null ? cachedRm : rateMult();
    return E.spiritsPerSec(state.vessels, state.hollowLevel, rm);
  }

  function ashPerSec(cachedRm) {
    var rm = cachedRm != null ? cachedRm : rateMult();
    return E.ashPerSec(
      state.shades, state.siphonLevel, state.aspect, state.lanterns,
      state.emberLevel, nightActive(), hymnActive(),
      state.bindingTollLevel, rm,
      state.ashenTideLevel, state.choirLevel,
      state.censers, state.pyres, state.cinderLevel,
      state.urns, state.urnRiteLevel,
      state.hearths, state.hearthRiteLevel,
      state.beacons, state.beaconRiteLevel,
      state.spires, state.spireRiteLevel,
      state.obelisks, wakeActive()
    );
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

  function runLiveAutobinds() {
    tryAutobind();
    tryAutobindSpirits();
    tryAutobindVessels();
    tryAutobindLanterns();
    tryAutobindFetters();
    tryAutobindCensers();
    tryAutobindThrones();
    tryAutobindPyres();
    tryAutobindUrns();
    tryAutobindHearths();
    tryAutobindBeacons();
    tryAutobindSpires();
    tryAutobindObelisks();
    tryAutobindChalices();
  }

  function applyDt(dt, live) {
    if (dt <= 0 || !isFinite(dt)) return;
    dt = clamp(dt, 0, MAX_DT);
    tripwireSanity();
    if (loadFailed) return;
    markDirty();

    var remaining = dt;
    var titheWas = Number(state.titheLeft) || 0;
    var nightWas = Number(state.nightLeft) || 0;
    var hymnWas = Number(state.hymnLeft) || 0;
    var veilWas = Number(state.veilLeft) || 0;
    var tollWas = Number(state.tollLeft) || 0;
    var wakeWas = Number(state.wakeLeft) || 0;
    var procWas = Number(state.processionLeft) || 0;
    var knellWas = Number(state.knellLeft) || 0;
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
      var knell = Number(state.knellLeft) || 0;
      if (knell < 0) knell = 0;
      var slice = remaining;
      if (tithe > 0 && tithe < slice) slice = tithe;
      if (night > 0 && night < slice) slice = night;
      if (hymn > 0 && hymn < slice) slice = hymn;
      if (veil > 0 && veil < slice) slice = veil;
      if (toll > 0 && toll < slice) slice = toll;
      if (wake > 0 && wake < slice) slice = wake;
      if (procession > 0 && procession < slice) slice = procession;
      if (knell > 0 && knell < slice) slice = knell;
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
      if (knell > 0) {
        state.knellLeft = knell - slice;
        if (state.knellLeft < 0) state.knellLeft = 0;
      }
      remaining -= slice;
    }

    if (live) {
      if (titheWas > 0 && (Number(state.titheLeft) || 0) <= 0) announce("Tithe expired.");
      if (nightWas > 0 && (Number(state.nightLeft) || 0) <= 0) announce("Night's Tithe expired.");
      if (hymnWas > 0 && (Number(state.hymnLeft) || 0) <= 0) announce("Hymn expired.");
      if (wakeWas > 0 && (Number(state.wakeLeft) || 0) <= 0) announce("Wake expired.");
      if (veilWas > 0 && (Number(state.veilLeft) || 0) <= 0) announce("Veil expired.");
      if (tollWas > 0 && (Number(state.tollLeft) || 0) <= 0) announce("Toll expired.");
      if (procWas > 0 && (Number(state.processionLeft) || 0) <= 0) announce("Procession expired.");
      if (knellWas > 0 && (Number(state.knellLeft) || 0) <= 0) announce("Knell expired.");

      // AZR-164: production already used full clamped dt above; Hollow/Autobind use liveSpan only.
      var liveSpan = Math.min(dt, LIVE_FRAME_MAX);
      tickHollowHunger(liveSpan); // also no-ops if document.hidden
      autobindAcc += liveSpan;
      if (autobindAcc >= AUTOBIND_INTERVAL) {
        autobindAcc -= AUTOBIND_INTERVAL;
        if (autobindAcc > AUTOBIND_INTERVAL) autobindAcc = 0; // no multi-pulse same call from lag
        runLiveAutobinds();
      }
    } else {
      // offline catchup: one pulse per applyDt (existing shade/spirit offline behavior)
      tryAutobind();
      tryAutobindSpirits();
    }
    checkUnlock();
    // AZR-163: credit wall clock only for the clamped dt actually simulated
    state.simulatedUntil = (Number(state.simulatedUntil) || Date.now()) + dt * 1000;
    // AZR-168: ~1/s NaN/negative core-currency tripwire (not every frame)
    sanityAcc += dt;
    if (sanityAcc >= 1) {
      sanityAcc = 0;
      tripwireSanity();
    }
  }

  function harvest() {
    if (normalizeVow(state.vow) === "stillness") return;
    state.clicksThisRun = (Number(state.clicksThisRun) || 0) + 1;
    var power = clickPower();
    state.souls = N.add(state.souls, power);
    state.lifetimeSouls = N.add(state.lifetimeSouls, power);
    state.allTimeSouls = N.add(state.allTimeSouls, power);
    pulseGather();
    spawnRipple(power);
    markSaveDirty();
    markDirty();
  }

  function purchasePlan(owned, currency, base, mult, extraMult) {
    if (mult == null) mult = currentProducerCostMult();
    return E.purchasePlan(owned, currency, base, mult, extraMult, state.buyMode);
  }

  function chalicePlan() {
    return E.chalicePlan(state.chalices, state.ash, state.buyMode);
  }

  function currentTitheCost() {
    return E.currentTitheCost(state.souls, state.vow);
  }

  function tryAutobind() {
    if (!state.autobind) return;
    var cost = shadeCost(state.shades);
    if (N.cmp(state.souls, cost) < 0) return;
    state.souls = N.sub(state.souls, cost);
    state.shades = N.add(state.shades, 1);
    state.lifetimeShades = N.add(state.lifetimeShades, 1);
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

  function tryAutobindVessels() {
    if (!state.autobindVessels) return;
    if (!state.unlockedVessels) return;
    var cost = vesselCost(state.vessels);
    if (N.cmp(state.spirits, cost) < 0) return;
    state.spirits = N.sub(state.spirits, cost);
    state.vessels = N.add(state.vessels, 1);
  }

  function tryAutobindLanterns() {
    if (!state.autobindLanterns) return;
    if (!state.unlockedLanterns) return;
    var cost = lanternCost(state.lanterns);
    if (N.cmp(state.souls, cost) < 0) return;
    state.souls = N.sub(state.souls, cost);
    state.lanterns = N.add(state.lanterns, 1);
  }

  function tryAutobindFetters() {
    if (!state.autobindFetters) return;
    if (!state.unlockedFetters) return;
    var cost = fetterCost(state.fetters);
    if (N.cmp(state.shades, cost) < 0) return;
    state.shades = N.sub(state.shades, cost);
    state.fetters = N.add(state.fetters, 1);
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

  function tryAutobindThrones() {
    if (!state.autobindThrones) return;
    if (!state.unlockedThrones) return;
    if (normalizeVow(state.vow) === "poverty") return;
    var cost = throneCost(state.thrones);
    if (N.cmp(state.vessels, cost) < 0) return;
    state.vessels = N.sub(state.vessels, cost);
    state.thrones += 1;
  }

  function tryAutobindPyres() {
    if (!state.autobindPyres) return;
    if (!state.unlockedPyres) return;
    var cost = pyreCost(state.pyres);
    if (N.cmp(state.censers, cost) < 0) return;
    state.censers = N.sub(state.censers, cost);
    state.pyres = N.add(state.pyres, 1);
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

  function tryAutobindHearths() {
    /* No extra hold-back vs saving Urns for a manual hearth. Autobind Hearths does not hold back Hearths for a Beacon. */
    if (!state.autobindHearths) return;
    if (!state.unlockedHearths) return;
    var cost = hearthCost(state.hearths);
    if (N.cmp(state.urns, cost) < 0) return;
    state.urns = N.sub(state.urns, cost);
    state.hearths = N.add(state.hearths, 1);
  }

  function tryAutobindBeacons() {
    /* No extra hold-back vs saving Hearths for a manual beacon. */
    if (!state.autobindBeacons) return;
    if (!state.unlockedBeacons) return;
    var cost = beaconCost(state.beacons);
    if (N.cmp(state.hearths, cost) < 0) return;
    state.hearths = N.sub(state.hearths, cost);
    state.beacons = N.add(state.beacons, 1);
  }

  function tryAutobindSpires() {
    /* No extra hold-back vs saving Beacons for a manual spire. Autobind Spires can spend a beacon Autobind Beacons just bought. */
    if (!state.autobindSpires) return;
    if (!state.unlockedSpires) return;
    var cost = spireCost(state.spires);
    if (N.cmp(state.beacons, cost) < 0) return;
    state.beacons = N.sub(state.beacons, cost);
    state.spires = N.add(state.spires, 1);
  }

  function tryAutobindObelisks() {
    /* No extra hold-back vs saving Spires for a manual obelisk. Autobind Obelisks can spend a spire Autobind Spires just bought. */
    if (!state.autobindObelisks) return;
    if (!state.unlockedObelisks) return;
    var cost = obeliskCost(state.obelisks);
    if (N.cmp(state.spires, cost) < 0) return;
    state.spires = N.sub(state.spires, cost);
    state.obelisks = N.add(state.obelisks, 1);
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

  function crownUnlocked() {
    return (Number(state.tributesLaid) || 0) >= 2 || (Number(state.favorEarned) || 0) >= 3;
  }

  function remembranceUnlocked() {
    return (Number(state.tributesLaid) || 0) >= 3 || (Number(state.favorEarned) || 0) >= 5;
  }

  function dismissBuyModeHint() {
    if (state.buyModeHintDismissed) return;
    state.buyModeHintDismissed = true;
    markSaveDirty();
    markDirty();
  }

  function setBuyMode(mode) {
    mode = normalizeBuyMode(mode);
    if (state.buyMode === mode) return;
    state.buyMode = mode;
    if (!state.buyModeHintDismissed) {
      state.buyModeHintDismissed = true;
    }
    markSaveDirty();
    markDirty();
  }

  function serializeState() {
    return S.serializeState(state);
  }

  function coreCurrenciesBroken() {
    return S.coreCurrenciesBroken(state);
  }

  function tripwireSanity() {
    if (loadFailed) return;
    if (!coreCurrenciesBroken()) return;
    var raw = null;
    try {
      raw = localStorage.getItem(SAVE_KEY);
    } catch (err) {
      raw = null;
    }
    if (raw == null) {
      try {
        raw = JSON.stringify(serializeState());
      } catch (err2) {
        raw = "";
      }
    }
    beginLoadFailure(raw);
  }

  var isSaveShape = S.isSaveShape;

  function applySaveData(data) {
    S.applySaveData(state, data);
    Pg.resetGiftCache();
  }

  function adoptSave(data) {
    state = freshState();
    applySaveData(data);
    hideToast(true);
    hideUnlockCards();
    checkUnlock();
    revealUnlockedCards(false);
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

  function buildAwayToast(soulsGained, ashGained, shadesGained) {
    var awayMsg = "The well gathered while you were away.";
    if (N.isFinite(soulsGained) && N.cmp(soulsGained, 0) > 0) {
      awayMsg += " +" + fmt(soulsGained) + " Souls";
    }
    if (N.isFinite(ashGained) && N.cmp(ashGained, 0) > 0) {
      awayMsg += " +" + fmt(ashGained) + " Ash";
    }
    if (N.isFinite(shadesGained) && N.cmp(shadesGained, 0) > 0) {
      awayMsg += " +" + fmt(shadesGained) + " Shades";
    }
    return awayMsg;
  }

  function maybeAwayToast(offline, soulsGained, ashGained, shadesGained) {
    if (
      offline > AWAY_SUMMARY_DT &&
      (
        (N.isFinite(soulsGained) && N.cmp(soulsGained, 0) > 0) ||
        (N.isFinite(ashGained) && N.cmp(ashGained, 0) > 0) ||
        (N.isFinite(shadesGained) && N.cmp(shadesGained, 0) > 0)
      )
    ) {
      return buildAwayToast(soulsGained, ashGained, shadesGained);
    }
    return null;
  }

  // AZR-164: 1Hz best-effort clock while hidden (browsers may throttle intervals).
  function clearHiddenHeartbeat() {
    if (hiddenHeartbeatId) {
      clearInterval(hiddenHeartbeatId);
      hiddenHeartbeatId = 0;
    }
    hiddenHeartbeatAt = 0;
  }

  function startHiddenHeartbeat() {
    clearHiddenHeartbeat();
    if (typeof document === "undefined" || !document.hidden) return;
    hiddenHeartbeatAt = Date.now();
    hiddenHeartbeatId = setInterval(function () {
      if (typeof document !== "undefined" && !document.hidden) {
        clearHiddenHeartbeat();
        return;
      }
      var now = Date.now();
      var span = (now - (hiddenHeartbeatAt || now)) / 1000;
      hiddenHeartbeatAt = now;
      if (span > 0) applyDt(span, true); // production full span; Hollow/Autobind capped via LIVE_FRAME_MAX; Hollow frozen while hidden
    }, 1000);
  }

  // AZR-163: credit production through wall-now via offline applyDt (no Hollow / live Autobind).
  // Advances simulatedUntil inside applyDt; then syncs to now so MAX_DT excess is not re-credited.
  function settleToNow() {
    var now = Date.now();
    var until = Number(state.simulatedUntil) || now;
    var dt = (now - until) / 1000;
    if (dt > MAX_DT) dt = MAX_DT;
    if (dt > 0) applyDt(dt, false);
    state.simulatedUntil = now;
    return dt;
  }

  function rotateBackups(json) {
    if (loadFailed) return;
    var now = Date.now();
    var bak1At = Number(state.bak1At) || 0;
    var bak2At = Number(state.bak2At) || 0;
    var hasBak1 = false;
    var hasBak2 = false;
    var prevBak1 = null;
    try {
      prevBak1 = localStorage.getItem(SAVE_BAK1_KEY);
      hasBak1 = !!prevBak1;
    } catch (err) {
      /* private / blocked */
    }
    try {
      hasBak2 = !!localStorage.getItem(SAVE_BAK2_KEY);
    } catch (err2) {
      /* private / blocked */
    }
    var needBak1 = !hasBak1 || now - bak1At >= BAK1_MS;
    var needBak2 = !hasBak2 || now - bak2At >= BAK2_MS;
    try {
      if (needBak2) {
        localStorage.setItem(SAVE_BAK2_KEY, prevBak1 || json);
        state.bak2At = now;
      }
      if (needBak1) {
        localStorage.setItem(SAVE_BAK1_KEY, json);
        state.bak1At = now;
      }
    } catch (err3) {
      /* private mode / quota */
    }
  }

  function save() {
    if (loadFailed) return;
    tripwireSanity();
    if (loadFailed) return;
    try {
      var json = JSON.stringify(serializeState());
      localStorage.setItem(SAVE_KEY, json);
      rotateBackups(json);
    } catch (err) {
      /* private mode / quota — game still runs */
    }
  }

  function newestParseableBackup() {
    var bak1 = null;
    var bak2 = null;
    try {
      bak1 = localStorage.getItem(SAVE_BAK1_KEY);
    } catch (err) {
      bak1 = null;
    }
    try {
      bak2 = localStorage.getItem(SAVE_BAK2_KEY);
    } catch (err2) {
      bak2 = null;
    }
    if (bak1) {
      try {
        var d1 = JSON.parse(bak1);
        if (isSaveShape(d1)) return { raw: bak1, data: d1, which: "bak1" };
      } catch (err3) {
        /* unreadable bak1 */
      }
    }
    if (bak2) {
      try {
        var d2 = JSON.parse(bak2);
        if (isSaveShape(d2)) return { raw: bak2, data: d2, which: "bak2" };
      } catch (err4) {
        /* unreadable bak2 */
      }
    }
    return null;
  }

  function showLoadFailNotice() {
    if (!els.loadFailNotice) return;
    if (els.loadFailRaw) {
      els.loadFailRaw.value = loadFailedRaw == null ? "" : String(loadFailedRaw);
    }
    var offer = newestParseableBackup();
    if (els.loadFailRestore) {
      els.loadFailRestore.disabled = !offer;
    }
    var wasOpen = loadFailNoticeOpen();
    els.loadFailNotice.classList.remove("is-hidden");
    els.loadFailNotice.setAttribute("aria-hidden", "false");
    if (wasOpen) return;
    loadFailReturnFocus = document.activeElement;
    setPageInert(true);
    els.loadFailNotice.focus();
  }

  function hideLoadFailNotice() {
    if (!els.loadFailNotice) return;
    var wasOpen = loadFailNoticeOpen();
    els.loadFailNotice.classList.add("is-hidden");
    els.loadFailNotice.setAttribute("aria-hidden", "true");
    if (!wasOpen) return;
    setPageInert(false);
    var back = loadFailReturnFocus;
    loadFailReturnFocus = null;
    if (!back || back === document.body || !back.focus || back.disabled) back = els.gatherBtn;
    if (back) back.focus();
  }

  function loadFailNoticeOpen() {
    return !!(els.loadFailNotice && !els.loadFailNotice.classList.contains("is-hidden"));
  }

  /** Everything behind the alertdialog leaves the tab order and the a11y tree while it is open. */
  function setPageInert(on) {
    var behind = [els.wrap, els.skipLink];
    for (var i = 0; i < behind.length; i++) {
      var el = behind[i];
      if (!el) continue;
      if (on) {
        el.setAttribute("inert", "");
        el.setAttribute("aria-hidden", "true");
      } else {
        el.removeAttribute("inert");
        el.removeAttribute("aria-hidden");
      }
    }
  }

  function loadFailFocusables() {
    if (!els.loadFailNotice) return [];
    var nodes = els.loadFailNotice.querySelectorAll("button, textarea");
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      if (!nodes[i].disabled) out.push(nodes[i]);
    }
    return out;
  }

  /** Tab cycles inside the dialog; Esc only pulls focus back in (never Start Fresh). */
  function handleLoadFailKeydown(ev) {
    var dialog = els.loadFailNotice;
    var active = document.activeElement;
    var inside = !!(active && dialog.contains(active));
    if (ev.key === "Escape" || ev.key === "Esc") {
      ev.preventDefault();
      if (!inside) dialog.focus();
      return;
    }
    if (ev.key !== "Tab") return;
    var items = loadFailFocusables();
    ev.preventDefault();
    if (!items.length) {
      dialog.focus();
      return;
    }
    var idx = items.indexOf(active);
    if (ev.shiftKey) {
      items[idx <= 0 ? items.length - 1 : idx - 1].focus();
    } else {
      items[idx < 0 || idx === items.length - 1 ? 0 : idx + 1].focus();
    }
  }

  function beginLoadFailure(raw) {
    loadFailed = true;
    loadFailedRaw = raw == null ? "" : String(raw);
    state = freshState();
    Pg.resetGiftCache();
    showLoadFailNotice();
  }

  function exportRawFailedMemory() {
    var json = loadFailedRaw == null ? "" : String(loadFailedRaw);
    function fillFallback() {
      if (els.loadFailRaw) {
        els.loadFailRaw.value = json;
        els.loadFailRaw.focus();
        els.loadFailRaw.select();
        try {
          document.execCommand("copy");
        } catch (err2) {
          /* textarea still holds the memory */
        }
      }
      if (els.memoryPanel) els.memoryPanel.open = true;
      if (els.memoryText) {
        els.memoryText.value = json;
      }
      showToast("The well's memory is copied.");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).then(function () {
        if (els.loadFailRaw) els.loadFailRaw.value = json;
        if (els.memoryText) els.memoryText.value = json;
        showToast("The well's memory is copied.");
      }, fillFallback);
    } else {
      fillFallback();
    }
  }

  function restoreLoadBackup() {
    var offer = newestParseableBackup();
    if (!offer) {
      showToast("The memory would not bind.");
      return;
    }
    adoptSave(offer.data);
    loadFailed = false;
    loadFailedRaw = null;
    hideLoadFailNotice();
    state.lastTick = Date.now();
    state.simulatedUntil = Date.now();
    syncChronicle();
    save();
    render();
    showToast("The well's memory is bound.");
  }

  function startFreshAfterLoadFail() {
    var ok = window.confirm(
      "Abandon the well's broken memory? This cannot be undone."
    );
    if (!ok) return;
    loadFailed = false;
    loadFailedRaw = null;
    state = freshState();
    Pg.resetGiftCache();
    hideLoadFailNotice();
    hideToast(true);
    hideUnlockCards();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(serializeState()));
    } catch (err) {
      /* private / quota */
    }
    save();
    render();
  }

  function load() {
    var raw = null;
    try {
      raw = localStorage.getItem(SAVE_KEY);
    } catch (err) {
      raw = null;
    }
    if (!raw) return;
    try {
      var data = JSON.parse(raw);
      if (!isSaveShape(data)) {
        beginLoadFailure(raw);
        return;
      }
      applySaveData(data);

      var offline = (Date.now() - state.simulatedUntil) / 1000;
      var soulsBefore = N.clone(state.souls);
      var ashBefore = N.clone(state.ash);
      var shadesBefore = N.clone(state.shades);
      if (offline > 0.25) {
        applyDt(offline, false);
      }
      var soulsGained = N.sub(state.souls, soulsBefore);
      var ashGained = N.sub(state.ash, ashBefore);
      var shadesGained = N.sub(state.shades, shadesBefore);
      // Sync wall after catchup (burns excess beyond MAX_DT; do not double-apply).
      state.simulatedUntil = Date.now();
      state.lastTick = Date.now();
      syncChronicle();
      // Known-good only: no mid-load save(); one save after successful restore/catchup.
      save();

      var awayMsg = maybeAwayToast(offline, soulsGained, ashGained, shadesGained);
      if (awayMsg) pendingAwayToast = awayMsg;
    } catch (err) {
      beginLoadFailure(raw);
    }
  }

  function exportMemory() {
    var json;
    if (loadFailed) {
      json = loadFailedRaw == null ? "" : String(loadFailedRaw);
    } else {
      save();
      try {
        json = JSON.stringify(serializeState());
      } catch (err) {
        showToast("The memory would not bind.");
        return;
      }
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
    loadFailed = false;
    loadFailedRaw = null;
    hideLoadFailNotice();
    state.lastTick = Date.now();
    state.simulatedUntil = Date.now();
    syncChronicle();
    save();
    render();
    showToast("The well's memory is bound.");
  }

  function resetGame() {
    var ok = window.confirm(
      "Abandon the well?\n\nEvery soul, shade, bound will, Favor, and Reliquary scatter. This cannot be undone."
    );
    if (!ok) return;
    loadFailed = false;
    loadFailedRaw = null;
    hideLoadFailNotice();
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (err) {
      /* ignore */
    }
    state = freshState();
    Pg.resetGiftCache();
    hideToast(true);
    hideUnlockCards();
    render();
  }

  /* AZR-171: Tribute restore phases — edict starting stock, then autobind starts.
   * Ash autobind unlocks (unlockedAutobindUrns etc.) must be evaluated after
   * Edict starting stock is applied so thresholds see post-edict counts.
   */

  function frameDt(now) {
    if (!lastFrame) lastFrame = now;
    var dt = (now - lastFrame) / 1000;
    lastFrame = now;
    return dt;
  }

  function takeRenderDue(now) {
    if (!_dirty || now - _lastRenderTime < RENDER_MS) return false;
    _dirty = false;
    _lastRenderTime = now;
    return true;
  }

  function resetFrameClock() {
    lastFrame = 0;
  }

  function takePendingAwayToast() {
    var away = pendingAwayToast;
    pendingAwayToast = null;
    return away;
  }

  function reduceMotionSetting() {
    return _reduceMotion;
  }

  globalThis.SoulgatherGame = {
    getState: function () { return state; },
    economy: E,
    actions: A,
    ui: U,
    frameDt: frameDt,
    takeRenderDue: takeRenderDue,
    resetFrameClock: resetFrameClock,
    takePendingAwayToast: takePendingAwayToast,
    reduceMotionSetting: reduceMotionSetting,
    applyDt: applyDt,
    checkUnlock: checkUnlock,
    clearHiddenHeartbeat: clearHiddenHeartbeat,
    currentTitheCost: currentTitheCost,
    dismissBuyModeHint: dismissBuyModeHint,
    exportMemory: exportMemory,
    exportRawFailedMemory: exportRawFailedMemory,
    flushSave: flushSave,
    harvest: harvest,
    importMemory: importMemory,
    handleLoadFailKeydown: handleLoadFailKeydown,
    isTypingTarget: isTypingTarget,
    knellActive: knellActive,
    load: load,
    loadFailNoticeOpen: loadFailNoticeOpen,
    loadReduceMotion: loadReduceMotion,
    markSaveDirty: markSaveDirty,
    maybeAwayToast: maybeAwayToast,
    nightActive: nightActive,
    processionActive: processionActive,
    remembranceUnlocked: remembranceUnlocked,
    resetGame: resetGame,
    restoreLoadBackup: restoreLoadBackup,
    setBuyMode: setBuyMode,
    setReduceMotion: setReduceMotion,
    settleToNow: settleToNow,
    startFreshAfterLoadFail: startFreshAfterLoadFail,
    startHiddenHeartbeat: startHiddenHeartbeat,
    titheActive: titheActive,
    tollActive: tollActive,
    veilActive: veilActive,
    wakeActive: wakeActive
  };

  var _eco = globalThis.SoulgatherEconomy;
  // Test exports. Pure economy functions are already on SoulgatherEconomy; config and state
  // constants are copied across so the Node tests can reach everything through one object.
  [
    "GAME_VERSION", "WELL_EARLY_MULT", "WELL_COST_MULT", "WELL_COST_BASE", "FAVOR_SOULS_BASE", "prestigeMult",
    "chaliceMult", "ossuaryMult", "COST_MULT_FLOOR", "COST_MULT_FAVOR_SCALE", "RENDER_HZ", "RENDER_MS",
    "BULK_CAP", "TOAST_MS", "TOAST_FAST_MS", "TOAST_QUEUE_MAX", "toastOverflowLabel", "toastOverflowCount",
    "UNLOCK_AUTOBIND_URNS", "UNLOCK_AUTOBIND_HEARTHS", "UNLOCK_AUTOBIND_BEACONS", "UNLOCK_AUTOBIND_SPIRES",
    "UNLOCK_AUTOBIND_OBELISKS", "namesCompleteMult", "LONGER_PROCESSION_MAX", "DEEPER_TOLL_MAX",
    "LONGER_WAKE_MAX", "LONGER_TITHE_MAX", "LONGER_VEIL_MAX", "LONGER_HYMN_MAX", "LONGER_KNELL_MAX", "hymnMult",
    "vowExtraFavor", "vowsKnownCount", "normalizeVow", "BINDING_TOLL_MAX", "BINDING_TOLL_RATE",
    "BINDING_TOLL_COST_BONUS", "CINDER_COST_BASE", "CINDER_COST_MULT", "URN_RITE_COST_BASE",
    "URN_RITE_COST_MULT", "HEARTH_RITE_COST_BASE", "HEARTH_RITE_COST_MULT", "BEACON_RITE_COST_BASE",
    "BEACON_RITE_COST_MULT", "SPIRE_RITE_COST_BASE", "SPIRE_RITE_COST_MULT", "HEARTH_RITE_COST",
    "BEACON_RITE_COST", "SPIRE_RITE_COST", "RITE_MULT_BASE", "SIPHON_COST_BASE", "LEVY_COST_BASE",
    "CINDER_COST", "URN_RITE_COST", "harvestMult", "bindingMult", "throneWeight", "hollowMult",
    "stacksWantedFromIdle", "HOLLOW_GRACE", "HOLLOW_INTERVAL", "HOLLOW_MAX", "HOLLOW_PENALTY",
    "HOLLOW_SOUL_CLEAR_CAP", "HOLLOW_SOUL_CLEAR_FLOOR", "HOLLOW_ASH_CLEAR_FLOOR", "HOLLOW_SHADE_CLEAR_FLOOR",
    "HOLLOW_CLEAR_FRAC", "MAX_DT", "LIVE_FRAME_MAX", "AWAY_SUMMARY_DT", "normalizeAspect", "titheMult",
    "nightMult", "veilMult", "tollMult", "TOLL_COST", "TOLL_SECS", "wakeMult", "WAKE_COST", "WAKE_SECS",
    "processionMult", "PROCESSION_COST", "PROCESSION_SECS", "knellMult", "KNELL_COST", "KNELL_SECS",
    "BONUS_TO_GIFT", "PEAK_STATS", "SAVE_KEY", "SAVE_BAK1_KEY", "SAVE_BAK2_KEY", "BAK1_MS", "BAK2_MS",
    "COST_BASE", "COST_MULT", "ANNOUNCE_THROTTLE_MS"
  ].forEach(function (k) { _eco[k] = C[k]; });
  [
    "isSaveShape", "isFiniteStock", "loadCount", "loadNum", "freshState", "FIELDS", "FIELDS_KEYS"
  ].forEach(function (k) { _eco[k] = S[k]; });
  _eco.vesselCost = vesselCost;
  _eco.throneCost = throneCost;
  _eco.censerCost = censerCost;
  _eco.producerCost = producerCost;
  _eco.shadeCost = shadeCost;
  _eco.spiritCost = spiritCost;
  _eco.ashPerSec = ashPerSec;
  _eco.currentProducerCostMult = currentProducerCostMult;
  _eco.bulkCost = bulkCost;
  _eco.bulkCostLoop = bulkCostLoop;
  _eco.maxAffordable = maxAffordable;
  _eco.maxAffordableLoop = maxAffordableLoop;
  _eco.setText = setText;
  _eco.setTextWriteCount = U.getSetTextWriteCount;
  _eco.applyEdictStartingStock = applyEdictStartingStock;
  _eco.applyAutobindStarts = applyAutobindStarts;
  _eco.TRIBUTE_AUTOBIND_STARTS = TRIBUTE_AUTOBIND_STARTS;
  _eco.capEnqueueToast = capEnqueueToast;
  _eco.formatGiftBatchSummary = formatGiftBatchSummary;
  _eco.formatBlessing = formatBlessing;
  _eco.hollowHungerActive = hollowHungerActive;
  _eco.noteHollowManualSpend = noteHollowManualSpend;
  _eco.applySaveData = applySaveData;
  _eco.tripwireSanity = tripwireSanity;
  _eco.getState = function () { return state; };
  _eco.__setStateForTest = function (partial) {
    if (partial && typeof partial === "object") {
      var keys = Object.keys(partial);
      for (var i = 0; i < keys.length; i++) state[keys[i]] = partial[keys[i]];
    }
  };
  _eco.applyDt = applyDt;
  _eco.harvest = harvest;
  _eco.tryAutobind = tryAutobind;
  _eco.tryAutobindSpirits = tryAutobindSpirits;
  _eco.tryAutobindVessels = tryAutobindVessels;
  _eco.tryAutobindLanterns = tryAutobindLanterns;
  _eco.tryAutobindFetters = tryAutobindFetters;
  _eco.tryAutobindCensers = tryAutobindCensers;
  _eco.tryAutobindThrones = tryAutobindThrones;
  _eco.tryAutobindPyres = tryAutobindPyres;
  _eco.tryAutobindUrns = tryAutobindUrns;
  _eco.tryAutobindHearths = tryAutobindHearths;
  _eco.tryAutobindBeacons = tryAutobindBeacons;
  _eco.tryAutobindSpires = tryAutobindSpires;
  _eco.tryAutobindObelisks = tryAutobindObelisks;
  _eco.tryAutobindChalices = tryAutobindChalices;
  _eco.buyShade = buyShade;
  _eco.buySpirit = buySpirit;
  _eco.buyVessel = buyVessel;
  _eco.buyThrone = buyThrone;
  _eco.buyWell = buyWell;
  _eco.buyLantern = buyLantern;
  _eco.buyFetter = buyFetter;
  _eco.buyCenser = buyCenser;
  _eco.buyPyre = buyPyre;
  _eco.buyUrn = buyUrn;
  _eco.buyHearth = buyHearth;
  _eco.buyBeacon = buyBeacon;
  _eco.buySpire = buySpire;
  _eco.buyObelisk = buyObelisk;
  _eco.buyChalice = buyChalice;
  _eco.buyWellDraws = buyWellDraws;
  _eco.buySiphon = buySiphon;
  _eco.buyLevy = buyLevy;
  _eco.buyBindingToll = buyBindingToll;
  _eco.serializeState = serializeState;
  _eco.layTribute = layTribute;
  _eco.GIFTS = C.GIFTS;
  _eco.GIFTS_BY_STAT = C.GIFTS_BY_STAT;
  _eco.GIFT_FLAGS = C.GIFT_FLAGS;
  _eco.tryMilestoneGifts = tryMilestoneGifts;
  _eco.checkUnlock = checkUnlock;
  _eco.rebuildUngrantedCount = rebuildUngrantedCount;
  _eco.GIFT_STAT_KEYS = C.GIFT_STAT_KEYS;
  _eco.getGiftCmpCount = Pg.getGiftCmpCount;
  _eco.getGiftMeetsCount = Pg.getGiftMeetsCount;
  _eco.getGiftUngrantedCount = Pg.getGiftUngrantedCount;
  _eco.getBumpPeakShadesCount = Pg.getBumpPeakShadesCount;
  _eco.resetGiftLastSeen = Pg.resetGiftLastSeen;
  _eco.resetToScope = resetToScope;
  _eco.save = save;
  _eco.flushSave = flushSave;
  _eco.markSaveDirty = markSaveDirty;
  _eco.getSaveDirty = function () { return saveDirty; };
  _eco.beginLoadFailure = beginLoadFailure;
  _eco.getLoadFailed = function () { return loadFailed; };
  _eco.setLoadFailed = function (v) { loadFailed = !!v; };
  _eco.getLoadFailedRaw = function () { return loadFailedRaw; };
  _eco.setLoadFailedRaw = function (v) { loadFailedRaw = v == null ? null : String(v); };
  _eco.announce = announce;
  _eco.reduceMotionActive = reduceMotionActive;
  _eco.setReduceMotion = setReduceMotion;
  _eco._getReduceMotion = function () { return _reduceMotion; };
  _eco._getAnnounceQueue = U.getAnnounceQueue;
  _eco._getAnnounceLastMs = U.getAnnounceLastMs;
  _eco._resetAnnouncer = U.resetAnnouncer;
  _eco.spawnRipple = spawnRipple;
  _eco._setEls = function (o) { for (var k in o) els[k] = o[k]; };
  _eco.showToast = U.showToast;
  _eco.dismissToastNext = U.dismissToastNext;
  _eco.dismissToastEscape = U.dismissToastEscape;
  _eco.toastHintText = U.toastHintText;
  _eco._getToastState = U.getToastState;
  _eco._resetToast = U.resetToast;
  _eco.showLoadFailNotice = showLoadFailNotice;
  _eco.hideLoadFailNotice = hideLoadFailNotice;
  _eco.loadFailNoticeOpen = loadFailNoticeOpen;
  _eco.handleLoadFailKeydown = handleLoadFailKeydown;
})();
