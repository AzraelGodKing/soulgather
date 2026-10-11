(function () {
  "use strict";

  var N = globalThis.SoulgatherNum;
  var C = globalThis.SoulgatherConfig;
  // Snapshot: the export block below overwrites same-named keys on the global with state-reading wrappers.
  var E = Object.assign({}, globalThis.SoulgatherEconomy);
  var S = globalThis.SoulgatherState;

  var GAME_VERSION = C.GAME_VERSION;
  var SAVE_KEY = C.SAVE_KEY;
  var SAVE_BAK1_KEY = C.SAVE_BAK1_KEY;
  var SAVE_BAK2_KEY = C.SAVE_BAK2_KEY;
  var BAK1_MS = C.BAK1_MS;
  var BAK2_MS = C.BAK2_MS;
  var COST_BASE = C.COST_BASE;
  var COST_MULT = C.COST_MULT;
  var COST_MULT_FLOOR = C.COST_MULT_FLOOR;
  var COST_MULT_FAVOR_SCALE = C.COST_MULT_FAVOR_SCALE;
  var WELL_COST_BASE = C.WELL_COST_BASE;
  var WELL_COST_MULT = C.WELL_COST_MULT;
  var WELL_EARLY_MULT = C.WELL_EARLY_MULT;
  var UNLOCK_PYRES = C.UNLOCK_PYRES;
  var UNLOCK_URNS = C.UNLOCK_URNS;
  var UNLOCK_HEARTHS = C.UNLOCK_HEARTHS;
  var UNLOCK_BEACONS = C.UNLOCK_BEACONS;
  var UNLOCK_SPIRES = C.UNLOCK_SPIRES;
  var UNLOCK_OBELISKS = C.UNLOCK_OBELISKS;
  var UNLOCK_CHALICES = C.UNLOCK_CHALICES;
  var CHALICE_MAX = C.CHALICE_MAX;
  var UNLOCK_SHADES = C.UNLOCK_SHADES;
  var UNLOCK_LIFETIME = C.UNLOCK_LIFETIME;
  var UNLOCK_SPIRITS_FOR_VESSELS = C.UNLOCK_SPIRITS_FOR_VESSELS;
  var UNLOCK_LIFETIME_SHADES = C.UNLOCK_LIFETIME_SHADES;
  var UNLOCK_VESSELS_FOR_THRONES = C.UNLOCK_VESSELS_FOR_THRONES;
  var UNLOCK_LIFETIME_SPIRITS = C.UNLOCK_LIFETIME_SPIRITS;
  var UNLOCK_WELL_DRAWS_SHADES = C.UNLOCK_WELL_DRAWS_SHADES;
  var UNLOCK_LANTERNS = C.UNLOCK_LANTERNS;
  var UNLOCK_MARKS_LIFETIME = C.UNLOCK_MARKS_LIFETIME;
  var UNLOCK_CENSERS_VESSELS = C.UNLOCK_CENSERS_VESSELS;
  var UNLOCK_CENSERS_LIFETIME_SPIRITS = C.UNLOCK_CENSERS_LIFETIME_SPIRITS;
  var BULK_CAP = C.BULK_CAP;
  var RENDER_HZ = C.RENDER_HZ;
  var RENDER_MS = C.RENDER_MS;
  var MAX_DT = C.MAX_DT;
  var AUTOBIND_INTERVAL = C.AUTOBIND_INTERVAL;
  var LIVE_FRAME_MAX = C.LIVE_FRAME_MAX;
  var autobindAcc = 0;
  var sanityAcc = 0;
  var HOLLOW_GRACE = C.HOLLOW_GRACE;
  var HOLLOW_INTERVAL = C.HOLLOW_INTERVAL;
  var HOLLOW_MAX = C.HOLLOW_MAX;
  var HOLLOW_PENALTY = C.HOLLOW_PENALTY;
  var HOLLOW_SOUL_CLEAR_CAP = C.HOLLOW_SOUL_CLEAR_CAP;
  var HOLLOW_SOUL_CLEAR_FLOOR = C.HOLLOW_SOUL_CLEAR_FLOOR;
  var HOLLOW_ASH_CLEAR_FLOOR = C.HOLLOW_ASH_CLEAR_FLOOR;
  var HOLLOW_SHADE_CLEAR_FLOOR = C.HOLLOW_SHADE_CLEAR_FLOOR;
  var HOLLOW_CLEAR_FRAC = C.HOLLOW_CLEAR_FRAC;
  var TOAST_MS = C.TOAST_MS;
  var TOAST_FAST_MS = C.TOAST_FAST_MS;
  var TOAST_QUEUE_MAX = C.TOAST_QUEUE_MAX;
  var AWAY_SUMMARY_DT = C.AWAY_SUMMARY_DT;
  var UNLOCK_FETTERS = C.UNLOCK_FETTERS;
  var UNLOCK_AUTOBIND_SHADES = C.UNLOCK_AUTOBIND_SHADES;
  var UNLOCK_AUTOBIND_SPIRITS = C.UNLOCK_AUTOBIND_SPIRITS;
  var UNLOCK_AUTOBIND_VESSELS = C.UNLOCK_AUTOBIND_VESSELS;
  var UNLOCK_AUTOBIND_LANTERNS = C.UNLOCK_AUTOBIND_LANTERNS;
  var UNLOCK_AUTOBIND_FETTERS = C.UNLOCK_AUTOBIND_FETTERS;
  var UNLOCK_AUTOBIND_CENSERS = C.UNLOCK_AUTOBIND_CENSERS;
  var UNLOCK_AUTOBIND_THRONES = C.UNLOCK_AUTOBIND_THRONES;
  var UNLOCK_AUTOBIND_PYRES = C.UNLOCK_AUTOBIND_PYRES;
  var UNLOCK_AUTOBIND_CHALICES = C.UNLOCK_AUTOBIND_CHALICES;
  var UNLOCK_AUTOBIND_URNS = C.UNLOCK_AUTOBIND_URNS;
  var UNLOCK_AUTOBIND_HEARTHS = C.UNLOCK_AUTOBIND_HEARTHS;
  var UNLOCK_AUTOBIND_BEACONS = C.UNLOCK_AUTOBIND_BEACONS;
  var UNLOCK_AUTOBIND_SPIRES = C.UNLOCK_AUTOBIND_SPIRES;
  var UNLOCK_AUTOBIND_OBELISKS = C.UNLOCK_AUTOBIND_OBELISKS;
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
  /* Aliases to BASE for export/compat (live costs use *Cost(level)). */
  var CINDER_COST = C.CINDER_COST;
  var URN_RITE_COST = C.URN_RITE_COST;
  var HEARTH_RITE_COST = C.HEARTH_RITE_COST;
  var BEACON_RITE_COST = C.BEACON_RITE_COST;
  var SPIRE_RITE_COST = C.SPIRE_RITE_COST;
  var RITE_MULT_BASE = C.RITE_MULT_BASE;
  var SIPHON_COST_BASE = C.SIPHON_COST_BASE;
  var LEVY_COST_BASE = C.LEVY_COST_BASE;
  var BINDING_TOLL_MAX = C.BINDING_TOLL_MAX;
  var BINDING_TOLL_RATE = C.BINDING_TOLL_RATE;
  var BINDING_TOLL_COST_BONUS = C.BINDING_TOLL_COST_BONUS;
  var UNLOCK_NIGHT_LANTERNS = C.UNLOCK_NIGHT_LANTERNS;
  var UNLOCK_VEIL_CLICKS = C.UNLOCK_VEIL_CLICKS;
  var UNLOCK_TOLL_CLICKS = C.UNLOCK_TOLL_CLICKS;
  var TOLL_COST = C.TOLL_COST;
  var TOLL_SECS = C.TOLL_SECS;
  var WAKE_COST = C.WAKE_COST;
  var WAKE_SECS = C.WAKE_SECS;
  var UNLOCK_WAKE_ASH = C.UNLOCK_WAKE_ASH;
  var FAVOR_SOULS_BASE = C.FAVOR_SOULS_BASE;
  var OSSUARY_MAX = C.OSSUARY_MAX;
  var PROCESSION_COST = C.PROCESSION_COST;
  var PROCESSION_SECS = C.PROCESSION_SECS;
  var KNELL_COST = C.KNELL_COST;
  var KNELL_SECS = C.KNELL_SECS;
  var LONGER_PROCESSION_MAX = C.LONGER_PROCESSION_MAX;
  var DEEPER_TOLL_MAX = C.DEEPER_TOLL_MAX;
  var LONGER_WAKE_MAX = C.LONGER_WAKE_MAX;
  var LONGER_TITHE_MAX = C.LONGER_TITHE_MAX;
  var LONGER_VEIL_MAX = C.LONGER_VEIL_MAX;
  var LONGER_HYMN_MAX = C.LONGER_HYMN_MAX;
  var LONGER_KNELL_MAX = C.LONGER_KNELL_MAX;
  var UNLOCK_CHOIR_LANTERNS = C.UNLOCK_CHOIR_LANTERNS;
  var UNLOCK_CHOIR_ASH = C.UNLOCK_CHOIR_ASH;
  var BOUND_NAMES = C.BOUND_NAMES;

  var num = E.num;

  var _dirty = true;
  var _lastRenderTime = 0;

  function markDirty() { _dirty = true; }

  var saveDirty = false;
  function markSaveDirty() { saveDirty = true; }
  function flushSave() { if (!saveDirty) return; saveDirty = false; save(); }
  function markRenderDirty() { markDirty(); }

  /* ─── Accessibility announcer (throttled, polite) ──────────────────── */
  var ANNOUNCE_THROTTLE_MS = C.ANNOUNCE_THROTTLE_MS;

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

  var markCost = E.markCost;

  var wellCost = E.wellCost;

  var wellBulkCostLoop = E.wellBulkCostLoop;
  var wellMaxAffordableLoop = E.wellMaxAffordableLoop;
  var wellBulkCost = E.wellBulkCost;
  var wellMaxAffordable = E.wellMaxAffordable;

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

  var favorGain = E.favorGain;

  var soulsForFavor = E.soulsForFavor;

  var nextFavorThreshold = E.nextFavorThreshold;

  var prestigeMult = C.prestigeMult;

  var harvestMult = C.harvestMult;

  var bindingMult = C.bindingMult;

  var throneWeight = C.throneWeight;

  var chaliceMult = C.chaliceMult;

  var ossuaryMult = C.ossuaryMult;

  var prodMult = E.prodMult;

  var crownCost = E.crownCost;

  var longMemCost = E.longMemCost;

  var titheCost = E.titheCost;

  var titheMult = C.titheMult;

  var nightTitheCost = E.nightTitheCost;

  var nightMult = C.nightMult;

  var veilCost = E.veilCost;

  var veilMult = C.veilMult;

  var tollMult = C.tollMult;

  var hymnMult = C.hymnMult;

  var wakeMult = C.wakeMult;

  var processionMult = C.processionMult;

  var knellMult = C.knellMult;

  var hymnSecs = E.hymnSecs;

  var hymnBonusSecs = E.hymnBonusSecs;

  var hymnLeftAfterTribute = E.hymnLeftAfterTribute;

  var hymnEdictCost = E.hymnEdictCost;

  var wakeSecs = E.wakeSecs;

  var wakeEdictStartsWake = E.wakeEdictStartsWake;

  var wakeLeftAfterTribute = E.wakeLeftAfterTribute;

  var wakeEdictCost = E.wakeEdictCost;

  var processionSecs = E.processionSecs;

  var processionEdictStartsProcession = E.processionEdictStartsProcession;

  var processionLeftAfterTribute = E.processionLeftAfterTribute;

  var processionEdictCost = E.processionEdictCost;

  var tollSecs = E.tollSecs;

  var tollEdictStartsToll = E.tollEdictStartsToll;

  var tollLeftAfterTribute = E.tollLeftAfterTribute;

  var tollEdictCost = E.tollEdictCost;

  var veilSecs = E.veilSecs;

  var veilEdictStartsVeil = E.veilEdictStartsVeil;

  var veilLeftAfterTribute = E.veilLeftAfterTribute;

  var veilEdictCost = E.veilEdictCost;

  var knellSecs = E.knellSecs;

  var knellEdictStartsKnell = E.knellEdictStartsKnell;

  var knellLeftAfterTribute = E.knellLeftAfterTribute;

  var knellEdictCost = E.knellEdictCost;

  var nightEdictSecs = E.nightEdictSecs;

  var nightEdictStartsNight = E.nightEdictStartsNight;

  var nightLeftAfterTribute = E.nightLeftAfterTribute;

  var nightEdictCost = E.nightEdictCost;

  var choirEdictCost = E.choirEdictCost;
  var edictCost = E.edictCost;
  var memoryCost = E.memoryCost;
  var echoCost = E.echoCost;
  var seatCost = E.seatCost;
  var kindleCost = E.kindleCost;
  var ashenCost = E.ashenCost;
  var depthCost = E.depthCost;
  var quietCourtCost = E.quietCourtCost;
  var quietCourtStartsLanternAutobind = E.quietCourtStartsLanternAutobind;
  var quietCourtStartsFetterAutobind = E.quietCourtStartsFetterAutobind;
  var quietCourtStartsPyreAutobind = E.quietCourtStartsPyreAutobind;
  var quietCourtStartsChaliceAutobind = E.quietCourtStartsChaliceAutobind;
  var quietCourtStartsUrnAutobind = E.quietCourtStartsUrnAutobind;
  var quietCourtStartsHearthAutobind = E.quietCourtStartsHearthAutobind;
  var quietCourtStartsBeaconAutobind = E.quietCourtStartsBeaconAutobind;
  var quietCourtStartsSpireAutobind = E.quietCourtStartsSpireAutobind;
  var quietCourtStartsObeliskAutobind = E.quietCourtStartsObeliskAutobind;
  var smokeEdictCost = E.smokeEdictCost;
  var smokeStartsCenserAutobind = E.smokeStartsCenserAutobind;
  var embersEdictCost = E.embersEdictCost;
  var embersStartsPyres = E.embersStartsPyres;
  var urnEdictCost = E.urnEdictCost;
  var urnEdictStartsUrns = E.urnEdictStartsUrns;
  var hearthEdictCost = E.hearthEdictCost;
  var hearthEdictStartsHearths = E.hearthEdictStartsHearths;
  var beaconEdictCost = E.beaconEdictCost;
  var beaconEdictStartsBeacons = E.beaconEdictStartsBeacons;
  var spireEdictCost = E.spireEdictCost;
  var spireEdictStartsSpires = E.spireEdictStartsSpires;
  var obeliskEdictCost = E.obeliskEdictCost;
  var obeliskEdictStartsObelisks = E.obeliskEdictStartsObelisks;
  var cinderEdictCost = E.cinderEdictCost;
  var cinderEdictStartsPyreAutobind = E.cinderEdictStartsPyreAutobind;
  var cutEdictCost = E.cutEdictCost;
  var cutEdictStartsUrnAutobind = E.cutEdictStartsUrnAutobind;
  var tendingEdictCost = E.tendingEdictCost;
  var tendingEdictStartsHearthAutobind = E.tendingEdictStartsHearthAutobind;
  var gleamEdictCost = E.gleamEdictCost;
  var gleamEdictStartsBeaconAutobind = E.gleamEdictStartsBeaconAutobind;
  var riseEdictCost = E.riseEdictCost;
  var riseEdictStartsSpireAutobind = E.riseEdictStartsSpireAutobind;
  var cupEdictCost = E.cupEdictCost;
  var cupStartsChalices = E.cupStartsChalices;
  var draughtEdictCost = E.draughtEdictCost;
  var draughtStartsChaliceAutobind = E.draughtStartsChaliceAutobind;

  var remembranceCostFavor = E.remembranceCostFavor;
  var remembranceFavorCost = E.remembranceFavorCost;
  var deeperNightCost = E.deeperNightCost;
  var longerProcessionCost = E.longerProcessionCost;
  var paidProcessionSecs = E.paidProcessionSecs;
  var deeperTollCost = E.deeperTollCost;
  var paidTollSecs = E.paidTollSecs;
  var longerWakeCost = E.longerWakeCost;
  var paidWakeSecs = E.paidWakeSecs;
  var longerTitheCost = E.longerTitheCost;
  var paidTitheSecs = E.paidTitheSecs;
  var longerVeilCost = E.longerVeilCost;
  var paidVeilSecs = E.paidVeilSecs;
  var longerHymnCost = E.longerHymnCost;
  var longerKnellCost = E.longerKnellCost;
  var paidKnellSecs = E.paidKnellSecs;
  var ashenTideCost = E.ashenTideCost;
  var ossuaryCost = E.ossuaryCost;
  var nightTitheSecs = E.nightTitheSecs;
  var nightSecs = E.nightSecs;

  var namesCompleteMult = C.namesCompleteMult;

  var ashFromShadeFrac = E.ashFromShadeFrac;

  var choirAshRate = E.choirAshRate;

  var namesFromPeak = E.namesFromPeak;

  var siphonCost = E.siphonCost;
  var levyCost = E.levyCost;
  var cinderCost = E.cinderCost;
  var urnRiteCost = E.urnRiteCost;
  var hearthRiteCost = E.hearthRiteCost;
  var beaconRiteCost = E.beaconRiteCost;

  var spireRiteCost = E.spireRiteCost;
  var bindingTollCost = E.bindingTollCost;
  var bindingTollRateMult = E.bindingTollRateMult;
  var bindingTollCostMult = E.bindingTollCostMult;

  function bindingTollRowOpen() {
    if ((Number(state.bindingTollLevel) || 0) >= 1) return true;
    if (state.unlockedBindingToll) return true;
    return N.cmp(state.fetters, 5) >= 0 && (Number(state.favorEarned) || 0) >= 1;
  }

  var siphonMult = E.siphonMult;
  var levyMult = E.levyMult;
  var cinderMult = E.cinderMult;
  var urnRiteMult = E.urnRiteMult;
  var hearthRiteMult = E.hearthRiteMult;
  var beaconRiteMult = E.beaconRiteMult;
  var spireRiteMult = E.spireRiteMult;
  var lanternMult = E.lanternMult;
  var fetterMult = E.fetterMult;
  var emberMult = E.emberMult;
  var chainMult = E.chainMult;

  var hollowMult = C.hollowMult;

  var stacksWantedFromIdle = C.stacksWantedFromIdle;

  function hollowHungerActive(view) {
    var s = view || state;
    return (Number(s.favorEarned) || 0) >= 2 && !!s.unlockedPyres;
  }

  var hollowClearNeed = E.hollowClearNeed;

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

  var normalizeAspect = C.normalizeAspect;

  var normalizeVow = C.normalizeVow;

  var vowExtraFavor = C.vowExtraFavor;

  var vowsKnownCount = C.vowsKnownCount;

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

  var CHRONICLE_LINES = C.CHRONICLE_LINES;

  var nextGoal = E.nextGoal;

  function hasChronicle(id) {
    return S.hasChronicle(state, id);
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
    if ((Number(state.beaconRiteLevel) || 0) >= 1) {
      if (markChronicle("beaconRite")) added = true;
    }
    if ((Number(state.spireRiteLevel) || 0) >= 1) {
      if (markChronicle("spireRite")) added = true;
    }
    if ((Number(state.bindingTollLevel) || 0) >= 1) {
      if (markChronicle("bindingToll")) added = true;
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
    if (N.cmp(state.beacons, 1) >= 0) {
      if (markChronicle("beacon")) added = true;
    }
    if (N.cmp(state.spires, 1) >= 0) {
      if (markChronicle("spire")) added = true;
    }
    if (N.cmp(state.obelisks, 1) >= 0) {
      if (markChronicle("obelisk")) added = true;
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
    if ((Number(state.beaconEdictLevel) || 0) >= 1) {
      if (markChronicle("beaconEdict")) added = true;
    }
    if ((Number(state.spireEdictLevel) || 0) >= 1) {
      if (markChronicle("spireEdict")) added = true;
    }
    if ((Number(state.obeliskEdictLevel) || 0) >= 1) {
      if (markChronicle("obeliskEdict")) added = true;
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
    if ((Number(state.gleamEdictLevel) || 0) >= 1) {
      if (markChronicle("gleamEdict")) added = true;
    }
    if ((Number(state.riseEdictLevel) || 0) >= 1) {
      if (markChronicle("riseEdict")) added = true;
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
    if ((Number(state.knellEdictLevel) || 0) >= 1) {
      if (markChronicle("knellEdict")) added = true;
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
    if ((Number(state.longerKnellLevel) || 0) >= 1) {
      if (markChronicle("longerKnell")) added = true;
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
    if ((Number(state.knellLeft) || 0) > 0) {
      if (markChronicle("knell")) added = true;
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

  var FIELDS = S.FIELDS;
  var FIELDS_KEYS = S.FIELDS_KEYS;

  // ── bonus* → gift* migration map (AZR-179) ──
  var BONUS_TO_GIFT = C.BONUS_TO_GIFT;

  // ── GIFTS table (AZR-179) ──────────────────────────────────────────────────
  // { flag, stat, at, give, id, toast }
  // Optional: alt (OR stat), cnt (true = Number cast), chr (fallback chronicle
  // ids for "first building" grants), extra (side-effect fn name).
  var GIFTS = [
    { flag: "giftLifetimeSouls",  stat: "lifetimeSouls", alt: "allTimeSouls", at: 100,   give: { souls: 50 },  id: "giftSouls",       toast: "The well returns fifty souls." },
    { flag: "giftPeakShades",     stat: "peakShades",    at: 10,   give: { shades: 1 },  id: "giftShades",      toast: "A shade is given, unbidden.", extra: "lifetimeShades" },
    { flag: "giftFirstVessel",    stat: "vessels",       at: 1,    give: { ash: 3 },     id: "giftVessel",      toast: "Ash from the first vessel." },
    { flag: "giftThousandSouls",  stat: "lifetimeSouls", alt: "allTimeSouls", at: 1000,  give: { souls: 200 }, id: "giftThousand",    toast: "The well returns two hundred souls." },
    { flag: "giftFirstLantern",   stat: "lanterns",      at: 1,    give: { souls: 10 },  id: "giftLantern",     toast: "Ten souls for the first lantern." },
    { flag: "giftPeakLanterns",   stat: "peakLanterns",  at: 10,   give: { souls: 20 },  id: "giftPeakLanterns",toast: "Twenty souls for ten lanterns." },
    { flag: "giftFirstCenser",    stat: "censers",       at: 1,    give: { ash: 5 },     id: "giftCenser",      toast: "Ash from the first censer." },
    { flag: "giftPeakCensers",    stat: "peakCensers",   at: 5,    give: { ash: 8 },     id: "giftPeakCensers", toast: "Eight ash for five censers." },
    { flag: "giftFirstPyre",      stat: "peakPyres",     at: 1,    give: { ash: 5 },     id: "giftFirstPyre",   toast: "Five ash for the first pyre.",     chr: ["pyre","giftFirstPyre"] },
    { flag: "giftPeakPyres",      stat: "peakPyres",     at: 5,    give: { ash: 10 },    id: "giftPeakPyres",   toast: "Ten ash for five pyres." },
    { flag: "giftFirstUrn",       stat: "peakUrns",      at: 1,    give: { ash: 6 },     id: "giftFirstUrn",    toast: "Six ash for the first urn.",       chr: ["urn","giftFirstUrn"] },
    { flag: "giftPeakUrns",       stat: "peakUrns",      at: 5,    give: { ash: 8 },     id: "giftPeakUrns",    toast: "Eight ash for five urns." },
    { flag: "giftFirstHearth",    stat: "peakHearths",   at: 1,    give: { ash: 8 },     id: "giftFirstHearth", toast: "Eight ash for the first hearth.",   chr: ["hearth","giftFirstHearth"] },
    { flag: "giftFirstBeacon",    stat: "peakBeacons",   at: 1,    give: { ash: 8 },     id: "giftFirstBeacon", toast: "Eight ash for the first beacon.",   chr: ["beacon","giftFirstBeacon"] },
    { flag: "giftFirstSpire",     stat: "peakSpires",    at: 1,    give: { ash: 8 },     id: "giftFirstSpire",  toast: "Eight ash for the first spire.",   chr: ["spire","giftFirstSpire"] },
    { flag: "giftFirstObelisk",   stat: "peakObelisks",  at: 1,    give: { ash: 8 },     id: "giftFirstObelisk",toast: "Eight ash for the first obelisk.", chr: ["obelisk","giftFirstObelisk"] },
    { flag: "giftPeakSpires",     stat: "peakSpires",    at: 5,    give: { ash: 7 },     id: "giftPeakSpires",  toast: "Seven ash for five spires." },
    { flag: "giftPeakObelisks",   stat: "peakObelisks",  at: 5,    give: { ash: 7 },     id: "giftPeakObelisks",toast: "Seven ash for five obelisks." },
    { flag: "giftPeakBeacons",    stat: "peakBeacons",   at: 5,    give: { ash: 7 },     id: "giftPeakBeacons", toast: "Seven ash for five beacons." },
    { flag: "giftPeakHearths",    stat: "peakHearths",   at: 5,    give: { ash: 10 },    id: "giftPeakHearths", toast: "Ten ash for five hearths." },
    { flag: "giftFirstCinders",   stat: "cinderLevel",   at: 1, cnt: true, give: { ash: 8 },  id: "giftFirstCinders",  toast: "Eight ash for the first cinders." },
    { flag: "giftFirstUrnRite",   stat: "urnRiteLevel",  at: 1, cnt: true, give: { ash: 6 },  id: "giftFirstUrnRite",  toast: "Six ash for the first cut urn." },
    { flag: "giftFirstHearthRite",stat: "hearthRiteLevel",at: 1,cnt: true, give: { ash: 8 },  id: "giftFirstHearthRite",toast: "Eight ash for the first cut hearth." },
    { flag: "giftFirstBeaconRite",stat: "beaconRiteLevel",at: 1,cnt: true, give: { ash: 10 }, id: "giftFirstBeaconRite",toast: "Ten ash for the first cut beacon." },
    { flag: "giftFirstSpireRite", stat: "spireRiteLevel", at: 1,cnt: true, give: { ash: 10 }, id: "giftFirstSpireRite", toast: "Ten ash for the first cut spire." },
    { flag: "giftFirstChalice",   stat: "chalices",      at: 1, cnt: true, give: { souls: 15 },id: "giftFirstChalice", toast: "Fifteen souls for the first chalice." },
    { flag: "giftThreeChalices",  stat: "chalices",      at: 3, cnt: true, give: { ash: 10 },  id: "giftThreeChalices",toast: "Ten ash for three chalices." },
    { flag: "giftFullCup",        stat: "chalices",      at: CHALICE_MAX, cnt: true, give: { souls: 25 }, id: "giftFullCup", toast: "Twenty-five souls for a full cup." },
    { flag: "giftFirstOssuary",   stat: "ossuaryLevel",  at: 1, cnt: true, give: { souls: 10 },id: "giftFirstOssuary", toast: "Ten souls for the first bone." },
    { flag: "giftFirstLongerProcession", stat: "longerProcessionLevel", at: 1, cnt: true, give: { souls: 5 }, id: "giftFirstLongerProcession", toast: "Five souls for the longer walk." },
    { flag: "giftFirstDeeperToll",stat: "deeperTollLevel",at: 1, cnt: true, give: { souls: 5 }, id: "giftFirstDeeperToll",toast: "Five souls for the longer toll." },
    { flag: "giftFirstLongerWake",stat: "longerWakeLevel",at: 1, cnt: true, give: { souls: 5 }, id: "giftFirstLongerWake",toast: "Five souls for the longer wake." },
    { flag: "giftFirstLongerTithe",stat:"longerTitheLevel",at:1, cnt: true, give: { souls: 5 }, id: "giftFirstLongerTithe",toast: "Five souls for the longer tithe." },
    { flag: "giftFirstLongerVeil",stat: "longerVeilLevel",at: 1, cnt: true, give: { souls: 5 }, id: "giftFirstLongerVeil",toast: "Five souls for the longer veil." },
    { flag: "giftFirstLongerHymn",stat: "longerHymnLevel",at: 1, cnt: true, give: { souls: 5 }, id: "giftFirstLongerHymn",toast: "Five souls for the longer hymn." },
    { flag: "giftFirstLongerKnell",stat:"longerKnellLevel",at:1, cnt: true, give: { souls: 5 }, id: "giftFirstLongerKnell",toast: "Five souls for the longer knell." },
    { flag: "giftFullOssuary",    stat: "ossuaryLevel",  at: OSSUARY_MAX, cnt: true, give: { souls: 20 }, id: "giftFullOssuary", toast: "Twenty souls for eight bones." },
    { flag: "giftHundredDraws",   stat: "clicksThisRun", at: 100, cnt: true, give: { souls: 15 }, id: "giftHundredDraws",  toast: "Fifteen souls for a hundred draws." },
    { flag: "giftTwoHundredDraws",stat: "clicksThisRun", at: 200, cnt: true, give: { souls: 20 }, id: "giftTwoHundredDraws",toast: "Twenty souls for two hundred draws." },
    { flag: "giftThreeHundredDraws",stat:"clicksThisRun", at: 300, cnt: true, give: { souls: 25 }, id: "giftThreeHundredDraws",toast: "Twenty-five souls for three hundred draws." },
    { flag: "giftFirstEmberVow",  stat: "_vow_ember",    at: 1,    give: { ash: 8 },     id: "giftFirstEmberVow",toast: "Eight ash for the ember vow." },
    { flag: "giftTwoVows",        stat: "_vowsKnown",    at: 2,    give: { souls: 10 },   id: "giftTwoVows",     toast: "Ten souls for two vows." },
    { flag: "giftThreeVows",      stat: "_vowsKnown",    at: 3,    give: { souls: 15 },   id: "giftThreeVows",   toast: "Fifteen souls for three vows." },
    { flag: "giftAllVows",        stat: "_vowsKnown",    at: 4,    give: { souls: 25 },   id: "giftAllVows",     toast: "Twenty-five souls for four vows." },
    { flag: "giftFirstFetter",    stat: "fetters",       at: 1,    give: { shades: 2 },   id: "giftFetter",      toast: "Two shades for the first fetter.", extra: "lifetimeShades" },
    { flag: "giftPeakFetters",    stat: "peakFetters",   at: 8,    give: { shades: 15 },  id: "giftPeakFetters", toast: "Fifteen shades for eight fetters.",extra: "lifetimeShades" },
    { flag: "giftTenThousandSouls",stat: "lifetimeSouls",alt: "allTimeSouls", at: 10000, give: { souls: 500 }, id: "giftTenThousand", toast: "The well returns five hundred souls." },
    { flag: "giftFirstThrone",    stat: "thrones",       at: 1, cnt: true, give: { vessels: 1 }, id: "giftThrone", toast: "A vessel is returned.", extra: "unlockVessels" },
    { flag: "giftFiveTributes",   stat: "tributesLaid",  at: 5, cnt: true, give: { favor: 2 },  id: "giftFiveTributes", toast: "The GodKing returns two Favor." },
    { flag: "giftEightTributes",  stat: "tributesLaid",  at: 8, cnt: true, give: { souls: 25 }, id: "giftEightTributes",toast: "Twenty-five souls for eight emptyings." },
    { flag: "giftTwelveTributes", stat: "tributesLaid",  at: 12,cnt: true, give: { souls: 40 }, id: "giftTwelveTributes",toast: "Forty souls for twelve emptyings." },
    { flag: "giftSixteenTributes",stat: "tributesLaid",  at: 16,cnt: true, give: { souls: 50 }, id: "giftSixteenTributes",toast: "Fifty souls for sixteen emptyings." },
    { flag: "giftTwentyTributes", stat: "tributesLaid",  at: 20,cnt: true, give: { souls: 60 }, id: "giftTwentyTributes",toast: "Sixty souls for twenty emptyings." },
    { flag: "giftTwentyFourTributes",stat:"tributesLaid",at: 24,cnt: true, give: { souls: 70 }, id: "giftTwentyFourTributes",toast: "Seventy souls for twenty-four emptyings." },
    { flag: "giftTwentyEightTributes",stat:"tributesLaid",at:28,cnt: true, give: { souls: 80 }, id: "giftTwentyEightTributes",toast: "Eighty souls for twenty-eight emptyings." },
    { flag: "giftThirtyTwoTributes",stat:"tributesLaid", at: 32,cnt: true, give: { souls: 90 }, id: "giftThirtyTwoTributes",toast: "Ninety souls for thirty-two emptyings." },
    { flag: "giftThirtySixTributes",stat:"tributesLaid", at: 36,cnt: true, give: { souls: 100 },id: "giftThirtySixTributes",toast: "A hundred souls for thirty-six emptyings." },
    { flag: "giftFortyTributes",  stat: "tributesLaid",  at: 40,cnt: true, give: { souls: 110 },id: "giftFortyTributes",toast: "A hundred and ten souls for forty emptyings." }
  ];

  var GIFTS_BY_STAT = {};
  var GIFT_FLAGS = [];
  var GIFT_STAT_KEYS = [];
  (function () {
    var seenStats = {};
    for (var i = 0; i < GIFTS.length; i++) {
      var g = GIFTS[i];
      GIFT_FLAGS.push(g.flag);
      var key = g.stat;
      if (!GIFTS_BY_STAT[key]) GIFTS_BY_STAT[key] = [];
      GIFTS_BY_STAT[key].push(g);
      if (!seenStats[key]) { seenStats[key] = true; GIFT_STAT_KEYS.push(key); }
      if (g.alt) {
        if (!GIFTS_BY_STAT[g.alt]) GIFTS_BY_STAT[g.alt] = [];
        GIFTS_BY_STAT[g.alt].push(g);
        if (!seenStats[g.alt]) { seenStats[g.alt] = true; GIFT_STAT_KEYS.push(g.alt); }
      }
    }
  })();

  var PEAK_STATS = C.PEAK_STATS;

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

    if (!state.unlockedBeacons) {
      if (N.cmp(state.hearths, UNLOCK_BEACONS) >= 0 || N.cmp(state.beacons, 1) >= 0) {
        state.unlockedBeacons = true;
        revealBeacons(true);
      }
    }

    if (!state.unlockedSpires) {
      if (N.cmp(state.beacons, UNLOCK_SPIRES) >= 0 || N.cmp(state.spires, 1) >= 0) {
        state.unlockedSpires = true;
        revealSpires(true);
      }
    }

    if (!state.unlockedObelisks) {
      if (N.cmp(state.spires, UNLOCK_OBELISKS) >= 0 || N.cmp(state.obelisks, 1) >= 0) {
        state.unlockedObelisks = true;
        revealObelisks(true);
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

    if (
      !state.unlockedBindingToll &&
      (N.cmp(state.fetters, 5) >= 0 && (Number(state.favorEarned) || 0) >= 1)
    ) {
      state.unlockedBindingToll = true;
    }
    if ((Number(state.bindingTollLevel) || 0) >= 1) {
      state.unlockedBindingToll = true;
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

    if (!state.unlockedAutobindBeacons && N.cmp(state.beacons, UNLOCK_AUTOBIND_BEACONS) >= 0) {
      state.unlockedAutobindBeacons = true;
    }
    if (!state.unlockedAutobindSpires && N.cmp(state.spires, UNLOCK_AUTOBIND_SPIRES) >= 0) {
      state.unlockedAutobindSpires = true;
    }
    if (!state.unlockedAutobindObelisks && N.cmp(state.obelisks, UNLOCK_AUTOBIND_OBELISKS) >= 0) {
      state.unlockedAutobindObelisks = true;
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

  function bumpPeakBeacons() {
    state.peakBeacons = N.max(num(state.peakBeacons), num(state.beacons));
  }

  function bumpPeakSpires() {
    state.peakSpires = N.max(num(state.peakSpires), num(state.spires));
  }

  function bumpPeakObelisks() {
    state.peakObelisks = N.max(num(state.peakObelisks), num(state.obelisks));
  }

  var _giftUngrantedCount = -1;
  var _giftCmpCount = 0;
  var _giftMeetsCount = 0;
  var _bumpPeakShadesCount = 0;
  var _giftLastSeen = null;

  function rebuildUngrantedCount() {
    var n = 0;
    for (var i = 0; i < GIFTS.length; i++) {
      if (!state[GIFTS[i].flag]) n++;
    }
    _giftUngrantedCount = n;
  }

  function snapshotGiftStats() {
    var snap = {};
    for (var i = 0; i < GIFT_STAT_KEYS.length; i++) {
      var k = GIFT_STAT_KEYS[i];
      snap[k] = giftStatValue(k);
    }
    return snap;
  }

  function giftStatValue(stat) {
    if (stat === "_vow_ember") return normalizeVow(state.vow) === "ember" ? 1 : 0;
    if (stat === "_vowsKnown") return vowsKnownCount(state.vowsKnown);
    return state[stat];
  }

  function giftStatChanged(stat, lastSeen) {
    var cur = giftStatValue(stat);
    var prev = lastSeen[stat];
    if (cur === prev) return false;
    if (cur && typeof cur === "object" && prev && typeof prev === "object") {
      return N.cmp(num(cur), num(prev)) !== 0;
    }
    return true;
  }

  function giftMeetsThreshold(g) {
    _giftMeetsCount++;
    var v = giftStatValue(g.stat);
    var met;
    if (g.cnt) {
      met = (Number(v) || 0) >= g.at;
    } else {
      _giftCmpCount++;
      met = N.cmp(num(v), g.at) >= 0;
    }
    if (!met && g.alt) {
      var v2 = state[g.alt];
      _giftCmpCount++;
      met = N.cmp(num(v2), g.at) >= 0;
    }
    if (met && g.chr) {
      var hasPeak = N.cmp(num(giftStatValue(g.stat)), g.at) >= 0;
      var hasChr = false;
      for (var c = 0; c < g.chr.length; c++) {
        if (hasChronicle(g.chr[c])) { hasChr = true; break; }
      }
      if (!hasPeak && hasChr) met = false;
      if (hasPeak && !hasChr) met = true;
    }
    return met;
  }

  function grantGift(g) {
    state[g.flag] = true;
    var give = g.give;
    if (give.souls)   state.souls   = N.add(state.souls,   give.souls);
    if (give.ash)     state.ash     = N.add(state.ash,     give.ash);
    if (give.shades) {
      state.shades = N.add(state.shades, give.shades);
    }
    if (give.vessels) state.vessels = N.add(state.vessels, give.vessels);
    if (give.favor)   state.favor  = (Number(state.favor) || 0) + give.favor;
    if (g.extra === "lifetimeShades" && give.shades) {
      state.lifetimeShades = N.add(state.lifetimeShades, give.shades);
    }
    if (g.extra === "unlockVessels" && !state.unlockedVessels) {
      state.unlockedVessels = true;
    }
    markChronicle(g.id);
    showToast(g.toast, "gifts");
    _giftUngrantedCount--;
  }

  function tryMilestoneGifts() {
    if (_giftUngrantedCount < 0) rebuildUngrantedCount();
    if (_giftUngrantedCount === 0 && !tryNamesBoundNeeded()) return;

    var granted = false;
    _giftCmpCount = 0;
    _giftMeetsCount = 0;
    _bumpPeakShadesCount = 0;
    beginGiftToastBatch();

    for (var pk in PEAK_STATS) {
      if (Object.prototype.hasOwnProperty.call(PEAK_STATS, pk)) {
        state[pk] = N.max(num(state[pk]), num(state[PEAK_STATS[pk]]));
      }
    }

    if (normalizeVow(state.vow)) rememberVow(state.vow);

    var lastSeen = _giftLastSeen;
    var dirty = null;
    var fullScan = !lastSeen;

    if (!fullScan) {
      dirty = {};
      for (var si = 0; si < GIFT_STAT_KEYS.length; si++) {
        var sk = GIFT_STAT_KEYS[si];
        if (giftStatChanged(sk, lastSeen)) dirty[sk] = true;
      }
    }

    if (fullScan) {
      for (var i = 0; i < GIFTS.length; i++) {
        var g = GIFTS[i];
        if (state[g.flag]) continue;
        if (!giftMeetsThreshold(g)) continue;
        grantGift(g);
        if (g.extra === "lifetimeShades" || g.give.shades) {
          _bumpPeakShadesCount++;
          state.peakShades = N.max(num(state.peakShades), num(state.shades));
        }
        granted = true;
      }
    } else {
      var visited = {};
      for (var dk in dirty) {
        if (!Object.prototype.hasOwnProperty.call(dirty, dk)) continue;
        var bucket = GIFTS_BY_STAT[dk];
        if (!bucket) continue;
        for (var bi = 0; bi < bucket.length; bi++) {
          var gb = bucket[bi];
          if (visited[gb.flag]) continue;
          visited[gb.flag] = true;
          if (state[gb.flag]) continue;
          if (!giftMeetsThreshold(gb)) continue;
          grantGift(gb);
          if (gb.extra === "lifetimeShades" || gb.give.shades) {
            _bumpPeakShadesCount++;
            state.peakShades = N.max(num(state.peakShades), num(state.shades));
          }
          granted = true;
        }
      }
    }

    _giftLastSeen = snapshotGiftStats();

    if (tryNamesBound()) granted = true;

    flushGiftToasts();
    if (granted) markSaveDirty();
  }

  function tryNamesBoundNeeded() {
    var current = Math.max(0, Math.floor(Number(state.namesBound) || 0));
    if (current < 12) return true;
    if (!state.namesComplete) return true;
    if (!state.giftNamesComplete) return true;
    return false;
  }

  function tryNamesBound() {
    var target = namesFromPeak(state.peakShades);
    var current = Math.max(0, Math.floor(Number(state.namesBound) || 0));
    if (current > 12) current = 12;
    var granted = false;
    while (current < target && current < 12) {
      var epithet = BOUND_NAMES[current];
      current += 1;
      state.namesBound = current;
      markChronicle("name" + current);
      showToast("A name is bound: " + epithet + ".", "gifts");
      if (current === 1 && !state.giftFirstName) {
        state.giftFirstName = true;
        state.souls = N.add(state.souls, 15);
        markChronicle("giftFirstName");
        showToast("Fifteen souls for the first name.", "gifts");
      }
      granted = true;
    }
    if (current >= 12) state.namesBound = 12;
    if (state.namesBound >= 12 && !state.namesComplete) {
      state.namesComplete = true;
      markChronicle("namesComplete");
      showToast("The names of the bound are spoken. The harvest deepens.", "gifts");
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
      , "gifts");
      granted = true;
    }
    return granted;
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

  var SAVE_FIELDS = FIELDS_KEYS;

  function serializeState() {
    return S.serializeState(state);
  }

  var loadCount = S.loadCount;
  var loadNum = S.loadNum;

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

  var isFiniteStock = S.isFiniteStock;
  var isSaveShape = S.isSaveShape;

  function applySaveData(data) {
    S.applySaveData(state, data);
    _giftUngrantedCount = -1;
    _giftLastSeen = null;
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
    els.loadFailNotice.classList.remove("is-hidden");
    els.loadFailNotice.setAttribute("aria-hidden", "false");
  }

  function hideLoadFailNotice() {
    if (!els.loadFailNotice) return;
    els.loadFailNotice.classList.add("is-hidden");
    els.loadFailNotice.setAttribute("aria-hidden", "true");
  }

  function beginLoadFailure(raw) {
    loadFailed = true;
    loadFailedRaw = raw == null ? "" : String(raw);
    state = freshState();
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
    hideToast(true);
    hideUnlockCards();
    render();
  }

  /* AZR-171: Tribute restore phases — edict starting stock, then autobind starts.
   * Ash autobind unlocks (unlockedAutobindUrns etc.) must be evaluated after
   * Edict starting stock is applied so thresholds see post-edict counts.
   */

  var toastOverflowLabel = C.toastOverflowLabel;

  var toastOverflowCount = C.toastOverflowCount;

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
    isTypingTarget: isTypingTarget,
    knellActive: knellActive,
    load: load,
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
  _eco.GAME_VERSION = GAME_VERSION;
  _eco.vesselCost = vesselCost;
  _eco.throneCost = throneCost;
  _eco.wellCost = wellCost;
  _eco.WELL_EARLY_MULT = WELL_EARLY_MULT;
  _eco.WELL_COST_MULT = WELL_COST_MULT;
  _eco.WELL_COST_BASE = WELL_COST_BASE;
  _eco.lanternCost = lanternCost;
  _eco.fetterCost = fetterCost;
  _eco.censerCost = censerCost;
  _eco.pyreCost = pyreCost;
  _eco.urnCost = urnCost;
  _eco.hearthCost = hearthCost;
  _eco.beaconCost = beaconCost;
  _eco.spireCost = spireCost;
  _eco.obeliskCost = obeliskCost;
  _eco.chaliceCost = chaliceCost;
  _eco.markCost = markCost;
  _eco.favorGain = favorGain;
  _eco.FAVOR_SOULS_BASE = FAVOR_SOULS_BASE;
  _eco.soulsForFavor = soulsForFavor;
  _eco.nextFavorThreshold = nextFavorThreshold;
  _eco.prestigeMult = prestigeMult;
  _eco.prodMult = prodMult;
  _eco.chaliceMult = chaliceMult;
  _eco.ossuaryMult = ossuaryMult;
  _eco.producerCost = producerCost;
  _eco.shadeCost = shadeCost;
  _eco.spiritCost = spiritCost;
  _eco.ashPerSec = ashPerSec;
  _eco.COST_MULT_FLOOR = COST_MULT_FLOOR;
  _eco.COST_MULT_FAVOR_SCALE = COST_MULT_FAVOR_SCALE;
  _eco.currentProducerCostMult = currentProducerCostMult;
  _eco.bulkCost = bulkCost;
  _eco.bulkCostLoop = bulkCostLoop;
  _eco.maxAffordable = maxAffordable;
  _eco.maxAffordableLoop = maxAffordableLoop;
  _eco.wellMaxAffordable = wellMaxAffordable;
  _eco.wellMaxAffordableLoop = wellMaxAffordableLoop;
  _eco.wellBulkCost = wellBulkCost;
  _eco.wellBulkCostLoop = wellBulkCostLoop;
  _eco.setText = setText;
  _eco.setTextWriteCount = U.getSetTextWriteCount;
  _eco.RENDER_HZ = RENDER_HZ;
  _eco.RENDER_MS = RENDER_MS;
  _eco.BULK_CAP = BULK_CAP;
  _eco.edictCost = edictCost;
  _eco.memoryCost = memoryCost;
  _eco.echoCost = echoCost;
  _eco.seatCost = seatCost;
  _eco.kindleCost = kindleCost;
  _eco.ashenCost = ashenCost;
  _eco.depthCost = depthCost;
  _eco.crownCost = crownCost;
  _eco.longMemCost = longMemCost;
  _eco.quietCourtCost = quietCourtCost;
  _eco.quietCourtStartsLanternAutobind = quietCourtStartsLanternAutobind;
  _eco.quietCourtStartsFetterAutobind = quietCourtStartsFetterAutobind;
  _eco.quietCourtStartsPyreAutobind = quietCourtStartsPyreAutobind;
  _eco.quietCourtStartsChaliceAutobind = quietCourtStartsChaliceAutobind;
  _eco.quietCourtStartsUrnAutobind = quietCourtStartsUrnAutobind;
  _eco.quietCourtStartsHearthAutobind = quietCourtStartsHearthAutobind;
  _eco.quietCourtStartsBeaconAutobind = quietCourtStartsBeaconAutobind;
  _eco.quietCourtStartsSpireAutobind = quietCourtStartsSpireAutobind;
  _eco.quietCourtStartsObeliskAutobind = quietCourtStartsObeliskAutobind;
  _eco.applyEdictStartingStock = applyEdictStartingStock;
  _eco.applyAutobindStarts = applyAutobindStarts;
  _eco.TRIBUTE_AUTOBIND_STARTS = TRIBUTE_AUTOBIND_STARTS;
  _eco.TOAST_MS = TOAST_MS;
  _eco.TOAST_FAST_MS = TOAST_FAST_MS;
  _eco.TOAST_QUEUE_MAX = TOAST_QUEUE_MAX;
  _eco.toastOverflowLabel = toastOverflowLabel;
  _eco.toastOverflowCount = toastOverflowCount;
  _eco.capEnqueueToast = capEnqueueToast;
  _eco.formatGiftBatchSummary = formatGiftBatchSummary;
  _eco.UNLOCK_AUTOBIND_URNS = UNLOCK_AUTOBIND_URNS;
  _eco.UNLOCK_AUTOBIND_HEARTHS = UNLOCK_AUTOBIND_HEARTHS;
  _eco.UNLOCK_AUTOBIND_BEACONS = UNLOCK_AUTOBIND_BEACONS;
  _eco.UNLOCK_AUTOBIND_SPIRES = UNLOCK_AUTOBIND_SPIRES;
  _eco.UNLOCK_AUTOBIND_OBELISKS = UNLOCK_AUTOBIND_OBELISKS;
  _eco.smokeEdictCost = smokeEdictCost;
  _eco.smokeStartsCenserAutobind = smokeStartsCenserAutobind;
  _eco.embersEdictCost = embersEdictCost;
  _eco.embersStartsPyres = embersStartsPyres;
  _eco.urnEdictCost = urnEdictCost;
  _eco.urnEdictStartsUrns = urnEdictStartsUrns;
  _eco.hearthEdictCost = hearthEdictCost;
  _eco.hearthEdictStartsHearths = hearthEdictStartsHearths;
  _eco.beaconEdictCost = beaconEdictCost;
  _eco.beaconEdictStartsBeacons = beaconEdictStartsBeacons;
  _eco.spireEdictCost = spireEdictCost;
  _eco.spireEdictStartsSpires = spireEdictStartsSpires;
  _eco.obeliskEdictCost = obeliskEdictCost;
  _eco.obeliskEdictStartsObelisks = obeliskEdictStartsObelisks;
  _eco.cinderEdictCost = cinderEdictCost;
  _eco.cinderEdictStartsPyreAutobind = cinderEdictStartsPyreAutobind;
  _eco.cutEdictCost = cutEdictCost;
  _eco.cutEdictStartsUrnAutobind = cutEdictStartsUrnAutobind;
  _eco.tendingEdictCost = tendingEdictCost;
  _eco.tendingEdictStartsHearthAutobind = tendingEdictStartsHearthAutobind;
  _eco.gleamEdictCost = gleamEdictCost;
  _eco.gleamEdictStartsBeaconAutobind = gleamEdictStartsBeaconAutobind;
  _eco.riseEdictCost = riseEdictCost;
  _eco.riseEdictStartsSpireAutobind = riseEdictStartsSpireAutobind;
  _eco.cupEdictCost = cupEdictCost;
  _eco.cupStartsChalices = cupStartsChalices;
  _eco.draughtEdictCost = draughtEdictCost;
  _eco.draughtStartsChaliceAutobind = draughtStartsChaliceAutobind;
  _eco.namesCompleteMult = namesCompleteMult;
  _eco.remembranceCostFavor = remembranceCostFavor;
  _eco.remembranceFavorCost = remembranceFavorCost;
  _eco.deeperNightCost = deeperNightCost;
  _eco.longerProcessionCost = longerProcessionCost;
  _eco.paidProcessionSecs = paidProcessionSecs;
  _eco.LONGER_PROCESSION_MAX = LONGER_PROCESSION_MAX;
  _eco.deeperTollCost = deeperTollCost;
  _eco.paidTollSecs = paidTollSecs;
  _eco.DEEPER_TOLL_MAX = DEEPER_TOLL_MAX;
  _eco.longerWakeCost = longerWakeCost;
  _eco.paidWakeSecs = paidWakeSecs;
  _eco.LONGER_WAKE_MAX = LONGER_WAKE_MAX;
  _eco.longerTitheCost = longerTitheCost;
  _eco.paidTitheSecs = paidTitheSecs;
  _eco.LONGER_TITHE_MAX = LONGER_TITHE_MAX;
  _eco.longerVeilCost = longerVeilCost;
  _eco.paidVeilSecs = paidVeilSecs;
  _eco.LONGER_VEIL_MAX = LONGER_VEIL_MAX;
  _eco.longerHymnCost = longerHymnCost;
  _eco.hymnBonusSecs = hymnBonusSecs;
  _eco.LONGER_HYMN_MAX = LONGER_HYMN_MAX;
  _eco.longerKnellCost = longerKnellCost;
  _eco.paidKnellSecs = paidKnellSecs;
  _eco.LONGER_KNELL_MAX = LONGER_KNELL_MAX;
  _eco.ashenTideCost = ashenTideCost;
  _eco.ossuaryCost = ossuaryCost;
  _eco.choirAshRate = choirAshRate;
  _eco.choirEdictCost = choirEdictCost;
  _eco.hymnEdictCost = hymnEdictCost;
  _eco.hymnMult = hymnMult;
  _eco.hymnSecs = hymnSecs;
  _eco.hymnLeftAfterTribute = hymnLeftAfterTribute;
  _eco.wakeEdictCost = wakeEdictCost;
  _eco.wakeSecs = wakeSecs;
  _eco.wakeEdictStartsWake = wakeEdictStartsWake;
  _eco.wakeLeftAfterTribute = wakeLeftAfterTribute;
  _eco.processionEdictCost = processionEdictCost;
  _eco.processionSecs = processionSecs;
  _eco.processionEdictStartsProcession = processionEdictStartsProcession;
  _eco.processionLeftAfterTribute = processionLeftAfterTribute;
  _eco.tollEdictCost = tollEdictCost;
  _eco.tollSecs = tollSecs;
  _eco.tollEdictStartsToll = tollEdictStartsToll;
  _eco.tollLeftAfterTribute = tollLeftAfterTribute;
  _eco.veilEdictCost = veilEdictCost;
  _eco.veilSecs = veilSecs;
  _eco.veilEdictStartsVeil = veilEdictStartsVeil;
  _eco.veilLeftAfterTribute = veilLeftAfterTribute;
  _eco.knellEdictCost = knellEdictCost;
  _eco.knellSecs = knellSecs;
  _eco.knellEdictStartsKnell = knellEdictStartsKnell;
  _eco.knellLeftAfterTribute = knellLeftAfterTribute;
  _eco.nightEdictCost = nightEdictCost;
  _eco.nightEdictSecs = nightEdictSecs;
  _eco.nightEdictStartsNight = nightEdictStartsNight;
  _eco.nightLeftAfterTribute = nightLeftAfterTribute;
  _eco.formatBlessing = formatBlessing;
  _eco.nightTitheSecs = nightTitheSecs;
  _eco.nightSecs = nightSecs;
  _eco.ashFromShadeFrac = ashFromShadeFrac;
  _eco.vowExtraFavor = vowExtraFavor;
  _eco.vowsKnownCount = vowsKnownCount;
  _eco.normalizeVow = normalizeVow;
  _eco.siphonCost = siphonCost;
  _eco.levyCost = levyCost;
  _eco.cinderCost = cinderCost;
  _eco.urnRiteCost = urnRiteCost;
  _eco.hearthRiteCost = hearthRiteCost;
  _eco.beaconRiteCost = beaconRiteCost;
  _eco.spireRiteCost = spireRiteCost;
  _eco.bindingTollCost = bindingTollCost;
  _eco.bindingTollRateMult = bindingTollRateMult;
  _eco.bindingTollCostMult = bindingTollCostMult;
  _eco.BINDING_TOLL_MAX = BINDING_TOLL_MAX;
  _eco.BINDING_TOLL_RATE = BINDING_TOLL_RATE;
  _eco.BINDING_TOLL_COST_BONUS = BINDING_TOLL_COST_BONUS;
  _eco.siphonMult = siphonMult;
  _eco.levyMult = levyMult;
  _eco.cinderMult = cinderMult;
  _eco.urnRiteMult = urnRiteMult;
  _eco.hearthRiteMult = hearthRiteMult;
  _eco.beaconRiteMult = beaconRiteMult;
  _eco.spireRiteMult = spireRiteMult;
  _eco.CINDER_COST_BASE = CINDER_COST_BASE;
  _eco.CINDER_COST_MULT = CINDER_COST_MULT;
  _eco.URN_RITE_COST_BASE = URN_RITE_COST_BASE;
  _eco.URN_RITE_COST_MULT = URN_RITE_COST_MULT;
  _eco.HEARTH_RITE_COST_BASE = HEARTH_RITE_COST_BASE;
  _eco.HEARTH_RITE_COST_MULT = HEARTH_RITE_COST_MULT;
  _eco.BEACON_RITE_COST_BASE = BEACON_RITE_COST_BASE;
  _eco.BEACON_RITE_COST_MULT = BEACON_RITE_COST_MULT;
  _eco.SPIRE_RITE_COST_BASE = SPIRE_RITE_COST_BASE;
  _eco.SPIRE_RITE_COST_MULT = SPIRE_RITE_COST_MULT;
  _eco.HEARTH_RITE_COST = HEARTH_RITE_COST;
  _eco.BEACON_RITE_COST = BEACON_RITE_COST;
  _eco.SPIRE_RITE_COST = SPIRE_RITE_COST;
  _eco.RITE_MULT_BASE = RITE_MULT_BASE;
  _eco.SIPHON_COST_BASE = SIPHON_COST_BASE;
  _eco.LEVY_COST_BASE = LEVY_COST_BASE;
  _eco.CINDER_COST = CINDER_COST;
  _eco.URN_RITE_COST = URN_RITE_COST;
  _eco.harvestMult = harvestMult;
  _eco.bindingMult = bindingMult;
  _eco.throneWeight = throneWeight;
  _eco.lanternMult = lanternMult;
  _eco.fetterMult = fetterMult;
  _eco.emberMult = emberMult;
  _eco.chainMult = chainMult;
  _eco.hollowMult = hollowMult;
  _eco.stacksWantedFromIdle = stacksWantedFromIdle;
  _eco.hollowHungerActive = hollowHungerActive;
  _eco.noteHollowManualSpend = noteHollowManualSpend;
  _eco.hollowClearNeed = hollowClearNeed;
  _eco.hollowSpendClears = hollowSpendClears;
  _eco.HOLLOW_GRACE = HOLLOW_GRACE;
  _eco.HOLLOW_INTERVAL = HOLLOW_INTERVAL;
  _eco.HOLLOW_MAX = HOLLOW_MAX;
  _eco.HOLLOW_PENALTY = HOLLOW_PENALTY;
  _eco.HOLLOW_SOUL_CLEAR_CAP = HOLLOW_SOUL_CLEAR_CAP;
  _eco.HOLLOW_SOUL_CLEAR_FLOOR = HOLLOW_SOUL_CLEAR_FLOOR;
  _eco.HOLLOW_ASH_CLEAR_FLOOR = HOLLOW_ASH_CLEAR_FLOOR;
  _eco.HOLLOW_SHADE_CLEAR_FLOOR = HOLLOW_SHADE_CLEAR_FLOOR;
  _eco.HOLLOW_CLEAR_FRAC = HOLLOW_CLEAR_FRAC;
  _eco.MAX_DT = MAX_DT;
  _eco.LIVE_FRAME_MAX = LIVE_FRAME_MAX;
  _eco.AWAY_SUMMARY_DT = AWAY_SUMMARY_DT;
  _eco.normalizeAspect = normalizeAspect;
  _eco.nextGoal = nextGoal;
  _eco.titheCost = titheCost;
  _eco.titheMult = titheMult;
  _eco.nightTitheCost = nightTitheCost;
  _eco.nightMult = nightMult;
  _eco.veilCost = veilCost;
  _eco.veilMult = veilMult;
  _eco.tollMult = tollMult;
  _eco.TOLL_COST = TOLL_COST;
  _eco.TOLL_SECS = TOLL_SECS;
  _eco.wakeMult = wakeMult;
  _eco.WAKE_COST = WAKE_COST;
  _eco.WAKE_SECS = WAKE_SECS;
  _eco.processionMult = processionMult;
  _eco.PROCESSION_COST = PROCESSION_COST;
  _eco.PROCESSION_SECS = PROCESSION_SECS;
  _eco.knellMult = knellMult;
  _eco.KNELL_COST = KNELL_COST;
  _eco.KNELL_SECS = KNELL_SECS;
  _eco.isSaveShape = isSaveShape;
  _eco.isFiniteStock = isFiniteStock;
  _eco.loadCount = loadCount;
  _eco.loadNum = loadNum;
  _eco.applySaveData = applySaveData;
  _eco.tripwireSanity = tripwireSanity;
  _eco.getState = function () { return state; };
  _eco.__setStateForTest = function (partial) {
    if (partial && typeof partial === "object") {
      var keys = Object.keys(partial);
      for (var i = 0; i < keys.length; i++) state[keys[i]] = partial[keys[i]];
    }
  };
  _eco.freshState = freshState;
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
  _eco.FIELDS = FIELDS;
  _eco.FIELDS_KEYS = FIELDS_KEYS;
  _eco.GIFTS = GIFTS;
  _eco.GIFTS_BY_STAT = GIFTS_BY_STAT;
  _eco.GIFT_FLAGS = GIFT_FLAGS;
  _eco.BONUS_TO_GIFT = BONUS_TO_GIFT;
  _eco.PEAK_STATS = PEAK_STATS;
  _eco.tryMilestoneGifts = tryMilestoneGifts;
  _eco.checkUnlock = checkUnlock;
  _eco.rebuildUngrantedCount = rebuildUngrantedCount;
  _eco.GIFT_STAT_KEYS = GIFT_STAT_KEYS;
  _eco.getGiftCmpCount = function () { return _giftCmpCount; };
  _eco.getGiftMeetsCount = function () { return _giftMeetsCount; };
  _eco.getGiftUngrantedCount = function () { return _giftUngrantedCount; };
  _eco.getBumpPeakShadesCount = function () { return _bumpPeakShadesCount; };
  _eco.resetGiftLastSeen = function () { _giftLastSeen = null; };
  _eco.resetToScope = resetToScope;
  _eco.SAVE_FIELDS = SAVE_FIELDS;
  _eco.SAVE_KEY = SAVE_KEY;
  _eco.SAVE_BAK1_KEY = SAVE_BAK1_KEY;
  _eco.SAVE_BAK2_KEY = SAVE_BAK2_KEY;
  _eco.BAK1_MS = BAK1_MS;
  _eco.BAK2_MS = BAK2_MS;
  _eco.COST_BASE = COST_BASE;
  _eco.COST_MULT = COST_MULT;
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
  _eco.ANNOUNCE_THROTTLE_MS = ANNOUNCE_THROTTLE_MS;
  _eco.reduceMotionActive = reduceMotionActive;
  _eco.setReduceMotion = setReduceMotion;
  _eco._getReduceMotion = function () { return _reduceMotion; };
  _eco._getAnnounceQueue = U.getAnnounceQueue;
  _eco._getAnnounceLastMs = U.getAnnounceLastMs;
  _eco._resetAnnouncer = U.resetAnnouncer;
  _eco.spawnRipple = spawnRipple;
})();
