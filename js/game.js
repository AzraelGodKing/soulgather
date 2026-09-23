(function () {
  "use strict";

  var N = globalThis.SoulgatherNum;
  var C = globalThis.SoulgatherConfig;
  var E = globalThis.SoulgatherEconomy;

  var GAME_VERSION = C.GAME_VERSION;
  var SAVE_KEY = C.SAVE_KEY;
  var SAVE_BAK1_KEY = C.SAVE_BAK1_KEY;
  var SAVE_BAK2_KEY = C.SAVE_BAK2_KEY;
  var BAK1_MS = C.BAK1_MS;
  var BAK2_MS = C.BAK2_MS;
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
  var UNLOCK_PYRES = C.UNLOCK_PYRES;
  var URN_ASH_PER_SEC = C.URN_ASH_PER_SEC;
  var URN_COST_BASE = C.URN_COST_BASE;
  var URN_COST_MULT = C.URN_COST_MULT;
  var UNLOCK_URNS = C.UNLOCK_URNS;
  var HEARTH_ASH_PER_SEC = C.HEARTH_ASH_PER_SEC;
  var HEARTH_COST_BASE = C.HEARTH_COST_BASE;
  var HEARTH_COST_MULT = C.HEARTH_COST_MULT;
  var UNLOCK_HEARTHS = C.UNLOCK_HEARTHS;
  var BEACON_ASH_PER_SEC = C.BEACON_ASH_PER_SEC;
  var BEACON_COST_BASE = C.BEACON_COST_BASE;
  var BEACON_COST_MULT = C.BEACON_COST_MULT;
  var UNLOCK_BEACONS = C.UNLOCK_BEACONS;
  var SPIRE_ASH_PER_SEC = C.SPIRE_ASH_PER_SEC;
  var SPIRE_COST_BASE = C.SPIRE_COST_BASE;
  var SPIRE_COST_MULT = C.SPIRE_COST_MULT;
  var UNLOCK_SPIRES = C.UNLOCK_SPIRES;
  var OBELISK_ASH_PER_SEC = C.OBELISK_ASH_PER_SEC;
  var OBELISK_COST_BASE = C.OBELISK_COST_BASE;
  var OBELISK_COST_MULT = C.OBELISK_COST_MULT;
  var UNLOCK_OBELISKS = C.UNLOCK_OBELISKS;
  var UNLOCK_CHALICES = C.UNLOCK_CHALICES;
  var CHALICE_MAX = C.CHALICE_MAX;
  var CHALICE_COST_BASE = C.CHALICE_COST_BASE;
  var CHALICE_COST_MULT = C.CHALICE_COST_MULT;
  var ASH_FROM_SHADE_FRAC = C.ASH_FROM_SHADE_FRAC;
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
  var WELL_DRAWS_COST = C.WELL_DRAWS_COST;
  var BULK_CAP = C.BULK_CAP;
  var RENDER_HZ = C.RENDER_HZ;
  var RENDER_MS = C.RENDER_MS;
  var AUTOSAVE_MS = C.AUTOSAVE_MS;
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
  var AWAY_MIN_DT = C.AWAY_MIN_DT;
  var AWAY_SUMMARY_DT = C.AWAY_SUMMARY_DT;
  var TITHE_MIN = C.TITHE_MIN;
  var TITHE_FRAC = C.TITHE_FRAC;
  var TITHE_SECS = C.TITHE_SECS;
  var FETTER_COST_BASE = C.FETTER_COST_BASE;
  var FETTER_COST_MULT = C.FETTER_COST_MULT;
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
  var BINDING_TOLL_COST_BASE = C.BINDING_TOLL_COST_BASE;
  var BINDING_TOLL_COST_MULT = C.BINDING_TOLL_COST_MULT;
  var BINDING_TOLL_MAX = C.BINDING_TOLL_MAX;
  var BINDING_TOLL_RATE = C.BINDING_TOLL_RATE;
  var BINDING_TOLL_COST_BONUS = C.BINDING_TOLL_COST_BONUS;
  var UNLOCK_NIGHT_LANTERNS = C.UNLOCK_NIGHT_LANTERNS;
  var UNLOCK_VEIL_CLICKS = C.UNLOCK_VEIL_CLICKS;
  var UNLOCK_TOLL_CLICKS = C.UNLOCK_TOLL_CLICKS;
  var TOLL_COST = C.TOLL_COST;
  var TOLL_SECS = C.TOLL_SECS;
  var VEIL_MIN = C.VEIL_MIN;
  var VEIL_FRAC = C.VEIL_FRAC;
  var VEIL_SECS = C.VEIL_SECS;
  var WAKE_COST = C.WAKE_COST;
  var WAKE_SECS = C.WAKE_SECS;
  var UNLOCK_WAKE_ASH = C.UNLOCK_WAKE_ASH;
  var NIGHT_TITHE_MIN = C.NIGHT_TITHE_MIN;
  var NIGHT_TITHE_FRAC = C.NIGHT_TITHE_FRAC;
  var NIGHT_TITHE_SECS = C.NIGHT_TITHE_SECS;
  var REMEMBRANCE_FAVOR_COST = C.REMEMBRANCE_FAVOR_COST;
  var FAVOR_SOULS_BASE = C.FAVOR_SOULS_BASE;
  var ASHEN_TIDE_MAX = C.ASHEN_TIDE_MAX;
  var OSSUARY_COST = C.OSSUARY_COST;
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
  var CHOIR_MAX = C.CHOIR_MAX;
  var CHOIR_LANTERN_COST = C.CHOIR_LANTERN_COST;
  var UNLOCK_CHOIR_LANTERNS = C.UNLOCK_CHOIR_LANTERNS;
  var UNLOCK_CHOIR_ASH = C.UNLOCK_CHOIR_ASH;
  var HYMN_SECS = C.HYMN_SECS;
  var HYMN_MULT = C.HYMN_MULT;
  var NAME_THRESHOLDS = C.NAME_THRESHOLDS;
  var BOUND_NAMES = C.BOUND_NAMES;

  var num = E.num;
  var nVal = E.nVal;

  var setTextWriteCount = 0;

  function setText(el, str) {
    if (!el) return false;
    str = str == null ? "" : String(str);
    if (el.textContent === str) return false;
    el.textContent = str;
    setTextWriteCount += 1;
    return true;
  }

  var _dirty = true;
  var _lastRenderTime = 0;

  function markDirty() { _dirty = true; }

  var saveDirty = false;
  function markSaveDirty() { saveDirty = true; }
  function flushSave() { if (!saveDirty) return; saveDirty = false; save(); }
  function markRenderDirty() { markDirty(); }

  var addOwned = E.addOwned;

  /* ─── Accessibility announcer (throttled, polite) ──────────────────── */
  var ANNOUNCE_THROTTLE_MS = C.ANNOUNCE_THROTTLE_MS;
  var _announceLastMs = 0;
  var _announceQueue = [];
  var _announceTimer = null;

  function announce(msg) {
    if (!msg) return;
    var now = Date.now();
    var wait = ANNOUNCE_THROTTLE_MS - (now - _announceLastMs);
    if (wait <= 0) {
      _pushAnnounce(msg);
    } else {
      _announceQueue.push(msg);
      if (!_announceTimer) {
        _announceTimer = window.setTimeout(_drainAnnounce, wait);
      }
    }
  }

  function _pushAnnounce(msg) {
    _announceLastMs = Date.now();
    var el = typeof document !== "undefined" && document.getElementById("a11y-announcer");
    if (!el) return;
    el.textContent = "";
    void el.offsetWidth;
    el.textContent = msg;
  }

  function _drainAnnounce() {
    _announceTimer = null;
    if (!_announceQueue.length) return;
    var next = _announceQueue.shift();
    _pushAnnounce(next);
    if (_announceQueue.length) {
      _announceTimer = window.setTimeout(_drainAnnounce, ANNOUNCE_THROTTLE_MS);
    }
  }

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

  var producerCost = E.producerCost;

  function shadeCost(owned) {
    return E.shadeCost(owned, state.bindingTollLevel);
  }

  function spiritCost(owned) {
    return E.spiritCost(owned, state.bindingTollLevel);
  }

  var vesselCost = E.vesselCost;

  var throneCost = E.throneCost;

  var lanternCost = E.lanternCost;

  var fetterCost = E.fetterCost;

  var censerCost = E.censerCost;

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
  var _geoSum = E._geoSum;
  var wellBulkCost = E.wellBulkCost;
  var wellMaxAffordable = E.wellMaxAffordable;

  function wellPurchasePlan(owned, currency) {
    return E.wellPurchasePlan(owned, currency, state.buyMode);
  }

  var bulkCostLoop = E.bulkCostLoop;
  var maxAffordableLoop = E.maxAffordableLoop;
  var bulkCost = E.bulkCost;
  var maxAffordable = E.maxAffordable;

  var favorGain = E.favorGain;

  var soulsForFavor = E.soulsForFavor;

  var nextFavorThreshold = E.nextFavorThreshold;

  var favorOrdinal = C.favorOrdinal;

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

  var ASPECT_IDS = C.ASPECT_IDS;
  var ASPECT_NAMES = C.ASPECT_NAMES;

  var normalizeAspect = C.normalizeAspect;

  var VOW_IDS = C.VOW_IDS;
  var VOW_NAMES = C.VOW_NAMES;

  var VOW_HUD_STRINGS = C.VOW_HUD_STRINGS;

  var normalizeVow = C.normalizeVow;

  var vowExtraFavor = C.vowExtraFavor;

  var emptyVowsKnown = C.emptyVowsKnown;

  var vowsKnownCount = C.vowsKnownCount;

  var normalizeVowsKnown = C.normalizeVowsKnown;

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

  var normalizeBuyMode = C.normalizeBuyMode;

  var CHRONICLE_ORDER = C.CHRONICLE_ORDER;

  var CHRONICLE_LINES = C.CHRONICLE_LINES;

  var formatGoalNum = E.formatGoalNum;
  var nextGoal = E.nextGoal;

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

  var FIELDS_KEYS = Object.keys(FIELDS);

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

  function resetToScope(target) {
    var fresh = freshState();
    for (var i = 0; i < FIELDS_KEYS.length; i++) {
      var k = FIELDS_KEYS[i];
      if (FIELDS[k].scope === target) {
        state[k] = fresh[k];
      }
    }
  }

  var state = freshState();
  var lastFrame = 0;
  var hiddenHeartbeatId = 0;
  var hiddenHeartbeatAt = 0;
  var toastTimer = 0;
  var toastQueue = [];
  var toastActive = false;
  var toastHold = false;
  var toastEscapeArmed = false;
  var giftToastBatch = null;
  var _favorReadyAnnounced = false;
  var pendingAwayToast = null;
  var loadFailed = false;
  var loadFailedRaw = null;
  var els = {};

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
    return E.purchasePlan(owned, currency, base, mult, extraMult, state.buyMode);
  }

  function buyWell() {
    if (!state.unlockedWell) return;
    var plan = wellPurchasePlan(state.wellDepth, state.souls);
    if (!plan.can || plan.k < 1) return;
    var hollowBefore = state.souls;
    state.souls = N.sub(state.souls, plan.cost);
    noteHollowManualSpend("souls", plan.cost, hollowBefore);
    state.wellDepth += plan.k;
    toastBulk(plan.k, "Deepened " + plan.k + " levels");
    syncChronicle();
    markSaveDirty();
    markDirty();
  }

  function buyShade() {
    var plan = purchasePlan(
      state.shades,
      state.souls,
      COST_BASE,
      COST_MULT,
      bindingTollCostMult(state.bindingTollLevel)
    );
    if (!plan.can || plan.k < 1) return;
    var hollowBefore = state.souls;
    state.souls = N.sub(state.souls, plan.cost);
    noteHollowManualSpend("souls", plan.cost, hollowBefore);
    state.shades = N.add(state.shades, plan.k);
    state.lifetimeShades = N.add(state.lifetimeShades, plan.k);
    toastBulk(plan.k, "Bound " + plan.k + " Shades");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buySpirit() {
    if (!state.unlockedSpirits) return;
    var plan = purchasePlan(
      state.spirits,
      state.shades,
      COST_BASE,
      COST_MULT,
      bindingTollCostMult(state.bindingTollLevel)
    );
    if (!plan.can || plan.k < 1) return;
    var hollowBefore = state.shades;
    state.shades = N.sub(state.shades, plan.cost);
    noteHollowManualSpend("shades", plan.cost, hollowBefore);
    state.spirits = N.add(state.spirits, plan.k);
    state.lifetimeSpirits = N.add(state.lifetimeSpirits, plan.k);
    toastBulk(plan.k, "Bound " + plan.k + " Spirits");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyVessel() {
    if (!state.unlockedVessels) return;
    var plan = purchasePlan(state.vessels, state.spirits);
    if (!plan.can || plan.k < 1) return;
    var hollowBefore = state.spirits;
    state.spirits = N.sub(state.spirits, plan.cost);
    noteHollowManualSpend("spirits", plan.cost, hollowBefore);
    state.vessels = N.add(state.vessels, plan.k);
    toastBulk(plan.k, "Bound " + plan.k + " Vessels");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyThrone() {
    if (!state.unlockedThrones) return;
    if (normalizeVow(state.vow) === "poverty") return;
    var plan = purchasePlan(state.thrones, state.vessels);
    if (!plan.can || plan.k < 1) return;
    var hollowBefore = state.vessels;
    state.vessels = N.sub(state.vessels, plan.cost);
    noteHollowManualSpend("vessels", plan.cost, hollowBefore);
    state.thrones += plan.k;
    toastBulk(plan.k, "Raised " + plan.k + " Thrones");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyLantern() {
    if (!state.unlockedLanterns) return;
    var plan = purchasePlan(state.lanterns, state.souls, LANTERN_COST_BASE, LANTERN_COST_MULT);
    if (!plan.can || plan.k < 1) return;
    var hollowBefore = state.souls;
    state.souls = N.sub(state.souls, plan.cost);
    noteHollowManualSpend("souls", plan.cost, hollowBefore);
    state.lanterns = N.add(state.lanterns, plan.k);
    toastBulk(plan.k, "Kindled " + plan.k + " Lanterns");
    if (!state.lanternToastShown) {
      state.lanternToastShown = true;
      showToast("A lantern kindles.");
    }
    markChronicle("lantern");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyFetter() {
    if (!state.unlockedFetters) return;
    var plan = purchasePlan(state.fetters, state.shades, FETTER_COST_BASE, FETTER_COST_MULT);
    if (!plan.can || plan.k < 1) return;
    var hollowBefore = state.shades;
    state.shades = N.sub(state.shades, plan.cost);
    noteHollowManualSpend("shades", plan.cost, hollowBefore);
    state.fetters = N.add(state.fetters, plan.k);
    toastBulk(plan.k, "Bound " + plan.k + " Fetters");
    markChronicle("fetter");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyCenser() {
    if (!state.unlockedCensers) return;
    var plan = purchasePlan(state.censers, state.vessels, COST_BASE, COST_MULT);
    if (!plan.can || plan.k < 1) return;
    var hollowBefore = state.vessels;
    state.vessels = N.sub(state.vessels, plan.cost);
    noteHollowManualSpend("vessels", plan.cost, hollowBefore);
    state.censers = N.add(state.censers, plan.k);
    toastBulk(plan.k, "Raised " + plan.k + " Censers");
    markChronicle("censer");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyPyre() {
    if (!state.unlockedPyres) return;
    var plan = purchasePlan(state.pyres, state.censers, PYRE_COST_BASE, PYRE_COST_MULT);
    if (!plan.can || plan.k < 1) return;
    var hollowBefore = state.censers;
    state.censers = N.sub(state.censers, plan.cost);
    noteHollowManualSpend("censers", plan.cost, hollowBefore);
    state.pyres = N.add(state.pyres, plan.k);
    toastBulk(plan.k, "Raised " + plan.k + " Pyres");
    markChronicle("pyre");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyUrn() {
    if (!state.unlockedUrns) return;
    var plan = purchasePlan(state.urns, state.pyres, URN_COST_BASE, URN_COST_MULT);
    if (!plan.can || plan.k < 1) return;
    var hollowBefore = state.pyres;
    state.pyres = N.sub(state.pyres, plan.cost);
    noteHollowManualSpend("pyres", plan.cost, hollowBefore);
    state.urns = N.add(state.urns, plan.k);
    toastBulk(plan.k, "Raised " + plan.k + " Urns");
    markChronicle("urn");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyHearth() {
    if (!state.unlockedHearths) return;
    var plan = purchasePlan(state.hearths, state.urns, HEARTH_COST_BASE, HEARTH_COST_MULT);
    if (!plan.can || plan.k < 1) return;
    var hollowBefore = state.urns;
    state.urns = N.sub(state.urns, plan.cost);
    noteHollowManualSpend("urns", plan.cost, hollowBefore);
    state.hearths = N.add(state.hearths, plan.k);
    toastBulk(plan.k, "Kindled " + plan.k + " Hearths");
    markChronicle("hearth");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyBeacon() {
    if (!state.unlockedBeacons) return;
    var plan = purchasePlan(state.beacons, state.hearths, BEACON_COST_BASE, BEACON_COST_MULT);
    if (!plan.can || plan.k < 1) return;
    var hollowBefore = state.hearths;
    state.hearths = N.sub(state.hearths, plan.cost);
    noteHollowManualSpend("hearths", plan.cost, hollowBefore);
    state.beacons = N.add(state.beacons, plan.k);
    toastBulk(plan.k, "Raised " + plan.k + " Beacons");
    markChronicle("beacon");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buySpire() {
    if (!state.unlockedSpires) return;
    var plan = purchasePlan(state.spires, state.beacons, SPIRE_COST_BASE, SPIRE_COST_MULT);
    if (!plan.can || plan.k < 1) return;
    var hollowBefore = state.beacons;
    state.beacons = N.sub(state.beacons, plan.cost);
    noteHollowManualSpend("beacons", plan.cost, hollowBefore);
    state.spires = N.add(state.spires, plan.k);
    toastBulk(plan.k, "Raised " + plan.k + " Spires");
    markChronicle("spire");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyObelisk() {
    if (!state.unlockedObelisks) return;
    var plan = purchasePlan(state.obelisks, state.spires, OBELISK_COST_BASE, OBELISK_COST_MULT);
    if (!plan.can || plan.k < 1) return;
    var hollowBefore = state.spires;
    state.spires = N.sub(state.spires, plan.cost);
    noteHollowManualSpend("spires", plan.cost, hollowBefore);
    state.obelisks = N.add(state.obelisks, plan.k);
    toastBulk(plan.k, "Raised " + plan.k + " Obelisks");
    markChronicle("obelisk");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function chalicePlan() {
    return E.chalicePlan(state.chalices, state.ash, state.buyMode);
  }

  function buyChalice() {
    if (!state.unlockedChalices) return;
    var plan = chalicePlan();
    if (!plan.can || plan.k < 1) return;
    var hollowBefore = state.ash;
    state.ash = N.sub(state.ash, plan.cost);
    noteHollowManualSpend("ash", plan.cost, hollowBefore);
    state.chalices = plan.owned + plan.k;
    if (state.chalices > CHALICE_MAX) state.chalices = CHALICE_MAX;
    toastBulk(plan.k, "Raised " + plan.k + " Chalices");
    markChronicle("chalice");
    checkUnlock();
    markSaveDirty();
    markDirty();
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
    var hollowBefore = state.ash;
    state.ash = N.sub(state.ash, cost);
    noteHollowManualSpend("ash", cost, hollowBefore);
    state[levelKey] += 1;
    markChronicle("mark");
    markSaveDirty();
    markDirty();
  }

  function buyEdict() {
    var cost = edictCost(state.edictLevel);
    if (state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.edictLevel += 1;
    markSaveDirty();
    markDirty();
  }

  function buyMemory() {
    var cost = memoryCost(state.memoryLevel);
    if (state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.memoryLevel += 1;
    markSaveDirty();
    markDirty();
  }

  function buyEcho() {
    if ((Number(state.echoLevel) || 0) >= 1) return;
    var cost = echoCost(state.echoLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.echoLevel = 1;
    markChronicle("echo");
    markSaveDirty();
    markDirty();
  }

  function buySeat() {
    var cost = seatCost(state.seatLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.seatLevel += 1;
    markChronicle("seat");
    markSaveDirty();
    markDirty();
  }

  function buyKindle() {
    var cost = kindleCost(state.kindleLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.kindleLevel += 1;
    markSaveDirty();
    markDirty();
  }

  function buyAshen() {
    var cost = ashenCost(state.ashenLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.ashenLevel += 1;
    markSaveDirty();
    markDirty();
  }

  function buyDepth() {
    var cost = depthCost(state.depthLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.depthLevel += 1;
    markSaveDirty();
    markDirty();
  }

  function buyChoirEdict() {
    var cost = choirEdictCost(state.choirEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.choirEdictLevel += 1;
    markChronicle("choirEdict");
    markSaveDirty();
    markDirty();
  }

  function buyHymnEdict() {
    var cost = hymnEdictCost(state.hymnEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.hymnEdictLevel += 1;
    markChronicle("hymnEdict");
    markSaveDirty();
    markDirty();
  }

  function buySmokeEdict() {
    var cost = smokeEdictCost(state.smokeEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.smokeEdictLevel += 1;
    markChronicle("smokeEdict");
    markSaveDirty();
    markDirty();
  }

  function buyEmbersEdict() {
    var cost = embersEdictCost(state.embersEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.embersEdictLevel += 1;
    markChronicle("embersEdict");
    markSaveDirty();
    markDirty();
  }

  function buyUrnEdict() {
    var cost = urnEdictCost(state.urnEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.urnEdictLevel += 1;
    markChronicle("urnEdict");
    markSaveDirty();
    markDirty();
  }

  function buyHearthEdict() {
    var cost = hearthEdictCost(state.hearthEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.hearthEdictLevel += 1;
    markChronicle("hearthEdict");
    markSaveDirty();
    markDirty();
  }

  function buyBeaconEdict() {
    var cost = beaconEdictCost(state.beaconEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.beaconEdictLevel += 1;
    markChronicle("beaconEdict");
    markSaveDirty();
    markDirty();
  }

  function buySpireEdict() {
    var cost = spireEdictCost(state.spireEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.spireEdictLevel += 1;
    markChronicle("spireEdict");
    markSaveDirty();
    markDirty();
  }

  function buyObeliskEdict() {
    var cost = obeliskEdictCost(state.obeliskEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.obeliskEdictLevel += 1;
    markChronicle("obeliskEdict");
    markSaveDirty();
    markDirty();
  }

  function buyCinderEdict() {
    var cost = cinderEdictCost(state.cinderEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.cinderEdictLevel += 1;
    markChronicle("cinderEdict");
    markSaveDirty();
    markDirty();
  }

  function buyCutEdict() {
    var cost = cutEdictCost(state.cutEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.cutEdictLevel += 1;
    markChronicle("cutEdict");
    markSaveDirty();
    markDirty();
  }

  function buyTendingEdict() {
    var cost = tendingEdictCost(state.tendingEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.tendingEdictLevel += 1;
    markChronicle("tendingEdict");
    markSaveDirty();
    markDirty();
  }

  function buyGleamEdict() {
    var cost = gleamEdictCost(state.gleamEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.gleamEdictLevel += 1;
    markChronicle("gleamEdict");
    markSaveDirty();
    markDirty();
  }

  function buyRiseEdict() {
    var cost = riseEdictCost(state.riseEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.riseEdictLevel += 1;
    markChronicle("riseEdict");
    markSaveDirty();
    markDirty();
  }

  function buyCupEdict() {
    var cost = cupEdictCost(state.cupEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.cupEdictLevel += 1;
    markChronicle("cupEdict");
    markSaveDirty();
    markDirty();
  }

  function buyDraughtEdict() {
    var cost = draughtEdictCost(state.draughtEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.draughtEdictLevel += 1;
    markChronicle("draughtEdict");
    markSaveDirty();
    markDirty();
  }

  function buyWakeEdict() {
    var cost = wakeEdictCost(state.wakeEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.wakeEdictLevel += 1;
    markChronicle("wakeEdict");
    markSaveDirty();
    markDirty();
  }

  function buyProcessionEdict() {
    var cost = processionEdictCost(state.processionEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.processionEdictLevel += 1;
    markChronicle("processionEdict");
    markSaveDirty();
    markDirty();
  }

  function buyTollEdict() {
    var cost = tollEdictCost(state.tollEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.tollEdictLevel += 1;
    markChronicle("tollEdict");
    markSaveDirty();
    markDirty();
  }

  function buyVeilEdict() {
    var cost = veilEdictCost(state.veilEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.veilEdictLevel += 1;
    markChronicle("veilEdict");
    markSaveDirty();
    markDirty();
  }

  function buyKnellEdict() {
    var cost = knellEdictCost(state.knellEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.knellEdictLevel += 1;
    markChronicle("knellEdict");
    markSaveDirty();
    markDirty();
  }

  function buyNightEdict() {
    var cost = nightEdictCost(state.nightEdictLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.nightEdictLevel += 1;
    markChronicle("nightEdict");
    markSaveDirty();
    markDirty();
  }

  function buySiphon() {
    var cost = siphonCost(state.siphonLevel);
    if (N.cmp(state.souls, cost) < 0) return;
    var hollowBefore = state.souls;
    state.souls = N.sub(state.souls, cost);
    noteHollowManualSpend("souls", cost, hollowBefore);
    state.siphonLevel += 1;
    syncChronicle();
    markSaveDirty();
    markDirty();
  }

  function buyLevy() {
    if (!state.unlockedSpirits) return;
    var cost = levyCost(state.levyLevel);
    if (N.cmp(state.shades, cost) < 0) return;
    var hollowBefore = state.shades;
    state.shades = N.sub(state.shades, cost);
    noteHollowManualSpend("shades", cost, hollowBefore);
    state.levyLevel += 1;
    syncChronicle();
    markSaveDirty();
    markDirty();
  }

  function buyBindingToll() {
    if (!bindingTollRowOpen()) return;
    var level = Math.max(0, Math.floor(Number(state.bindingTollLevel) || 0));
    if (level >= BINDING_TOLL_MAX) return;
    var cost = bindingTollCost(level);
    if (N.cmp(state.ash, cost) < 0) return;
    var hollowBefore = state.ash;
    state.ash = N.sub(state.ash, cost);
    noteHollowManualSpend("ash", cost, hollowBefore);
    state.bindingTollLevel = level + 1;
    state.unlockedBindingToll = true;
    markChronicle("bindingToll");
    syncChronicle();
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyCinders() {
    if (!state.unlockedPyres) return;
    var cost = cinderCost(state.cinderLevel);
    if (N.cmp(state.ash, cost) < 0) return;
    var hollowBefore = state.ash;
    state.ash = N.sub(state.ash, cost);
    noteHollowManualSpend("ash", cost, hollowBefore);
    state.cinderLevel += 1;
    markChronicle("cinders");
    syncChronicle();
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyUrnRite() {
    if (!state.unlockedUrns) return;
    var cost = urnRiteCost(state.urnRiteLevel);
    if (N.cmp(state.ash, cost) < 0) return;
    var hollowBefore = state.ash;
    state.ash = N.sub(state.ash, cost);
    noteHollowManualSpend("ash", cost, hollowBefore);
    state.urnRiteLevel += 1;
    markChronicle("urnRite");
    syncChronicle();
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyHearthRite() {
    if (!state.unlockedHearths) return;
    var cost = hearthRiteCost(state.hearthRiteLevel);
    if (N.cmp(state.ash, cost) < 0) return;
    var hollowBefore = state.ash;
    state.ash = N.sub(state.ash, cost);
    noteHollowManualSpend("ash", cost, hollowBefore);
    state.hearthRiteLevel += 1;
    markChronicle("hearthRite");
    syncChronicle();
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyBeaconRite() {
    if (!state.unlockedBeacons) return;
    var cost = beaconRiteCost(state.beaconRiteLevel);
    if (N.cmp(state.ash, cost) < 0) return;
    var hollowBefore = state.ash;
    state.ash = N.sub(state.ash, cost);
    noteHollowManualSpend("ash", cost, hollowBefore);
    state.beaconRiteLevel += 1;
    markChronicle("beaconRite");
    syncChronicle();
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buySpireRite() {
    if (!state.unlockedSpires) return;
    var cost = spireRiteCost(state.spireRiteLevel);
    if (N.cmp(state.ash, cost) < 0) return;
    var hollowBefore = state.ash;
    state.ash = N.sub(state.ash, cost);
    noteHollowManualSpend("ash", cost, hollowBefore);
    state.spireRiteLevel += 1;
    markChronicle("spireRite");
    syncChronicle();
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyWellDraws() {
    if (state.wellDraws) return;
    if (!state.unlockedWellDraws && N.cmp(state.shades, UNLOCK_WELL_DRAWS_SHADES) < 0) return;
    if (N.cmp(state.souls, WELL_DRAWS_COST) < 0) return;
    var hollowBefore = state.souls;
    state.souls = N.sub(state.souls, WELL_DRAWS_COST);
    noteHollowManualSpend("souls", WELL_DRAWS_COST, hollowBefore);
    state.wellDraws = true;
    state.unlockedWellDraws = true;
    syncChronicle();
    markSaveDirty();
    markDirty();
  }

  function currentTitheCost() {
    return E.currentTitheCost(state.souls, state.vow);
  }

  function payTithe() {
    if (!state.unlockedWell) return;
    if (titheActive()) return;
    var cost = currentTitheCost();
    if (N.cmp(state.souls, cost) < 0) return;
    var hollowBefore = state.souls;
    state.souls = N.sub(state.souls, cost);
    noteHollowManualSpend("souls", cost, hollowBefore);
    state.titheLeft = paidTitheSecs(state.longerTitheLevel);
    state.tithePaid = true;
    if (normalizeVow(state.vow) === "hunger") {
      state.vowHungerPaid = true;
    }
    checkUnlock();
    showToast("The GodKing takes his cut.");
    announce("Tithe active.");
    markSaveDirty();
    markDirty();
  }

  function payNightTithe() {
    if (normalizeVow(state.vow) === "ember") return;
    if (!state.unlockedNightTithe) return;
    if (nightActive()) return;
    if (N.cmp(state.ash, NIGHT_TITHE_MIN) < 0) return;
    var cost = nightTitheCost(state.ash);
    if (N.cmp(state.ash, cost) < 0) return;
    var hollowBefore = state.ash;
    state.ash = N.sub(state.ash, cost);
    noteHollowManualSpend("ash", cost, hollowBefore);
    state.nightLeft = nightSecs(state.deeperNightLevel);
    showToast("The GodKing hungers at midnight.");
    announce("Night's Tithe active.");
    markSaveDirty();
    markDirty();
  }

  function keepWake() {
    if (normalizeVow(state.vow) === "ember") return;
    if (!state.unlockedWake) return;
    if (wakeActive()) return;
    var cost = N.fromNumber(WAKE_COST);
    if (N.cmp(state.ash, cost) < 0) return;
    var hollowBefore = state.ash;
    state.ash = N.sub(state.ash, cost);
    noteHollowManualSpend("ash", cost, hollowBefore);
    state.wakeLeft = paidWakeSecs(state.longerWakeLevel);
    markChronicle("wake");
    if (!state.giftFirstWake) {
      state.giftFirstWake = true;
      state.ash = N.add(state.ash, 8);
      markChronicle("giftFirstWake");
      showToast("Eight ash for the first wake.");
    }
    showToast("The fire does not sleep.");
    announce("Wake active.");
    markSaveDirty();
    markDirty();
  }

  function toggleAutobind() {
    if (!state.unlockedAutobind) return;
    state.autobind = !state.autobind;
    markSaveDirty();
    markDirty();
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
    markSaveDirty();
    markDirty();
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
    markSaveDirty();
    markDirty();
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
    markSaveDirty();
    markDirty();
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
    markSaveDirty();
    markDirty();
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
    markSaveDirty();
    markDirty();
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
    markSaveDirty();
    markDirty();
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
    markSaveDirty();
    markDirty();
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
    markSaveDirty();
    markDirty();
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
    markSaveDirty();
    markDirty();
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

  function toggleAutobindBeacons() {
    if (!state.unlockedAutobindBeacons) return;
    state.autobindBeacons = !state.autobindBeacons;
    markSaveDirty();
    markDirty();
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

  function toggleAutobindSpires() {
    if (!state.unlockedAutobindSpires) return;
    state.autobindSpires = !state.autobindSpires;
    markSaveDirty();
    markDirty();
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

  function toggleAutobindObelisks() {
    if (!state.unlockedAutobindObelisks) return;
    state.autobindObelisks = !state.autobindObelisks;
    markSaveDirty();
    markDirty();
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

  function toggleAutobindChalices() {
    if (!state.unlockedAutobindChalices) return;
    state.autobindChalices = !state.autobindChalices;
    markSaveDirty();
    markDirty();
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
    var hollowBefore = state.souls;
    state.souls = N.sub(state.souls, cost);
    noteHollowManualSpend("souls", cost, hollowBefore);
    state.tollLeft = paidTollSecs(state.deeperTollLevel);
    markChronicle("toll");
    if (!state.giftFirstToll) {
      state.giftFirstToll = true;
      state.souls = N.add(state.souls, 10);
      markChronicle("giftFirstToll");
      showToast("Ten souls for the first toll.");
    }
    showToast("The well answers twice.");
    announce("Toll active.");
    markSaveDirty();
    markDirty();
  }

  function thinVeil() {
    if (!state.unlockedVeil) return;
    if (veilActive()) return;
    if (N.cmp(state.ash, VEIL_MIN) < 0) return;
    var cost = veilCost(state.ash);
    if (N.cmp(state.ash, cost) < 0) return;
    var hollowBefore = state.ash;
    state.ash = N.sub(state.ash, cost);
    noteHollowManualSpend("ash", cost, hollowBefore);
    state.veilLeft = paidVeilSecs(state.longerVeilLevel);
    markChronicle("veil");
    if (!state.giftFirstVeil) {
      state.giftFirstVeil = true;
      state.ash = N.add(state.ash, 10);
      markChronicle("giftFirstVeil");
      showToast("Ten ash for the first veil.");
    }
    showToast("The well's mouth is near.");
    announce("Veil active.");
    markSaveDirty();
    markDirty();
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

  function buyCrownWeight() {
    if (!crownUnlocked()) return;
    var cost = crownCost(state.crownWeight);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.crownWeight += 1;
    if (!state.giftCrown) {
      state.giftCrown = true;
      state.favor += 1;
      markChronicle("giftCrown");
      showToast("The crown was generous.");
    }
    markSaveDirty();
    markDirty();
  }

  function buyLongMemory() {
    if (!crownUnlocked()) return;
    var cost = longMemCost(state.longMemoryLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.longMemoryLevel += 1;
    markSaveDirty();
    markDirty();
  }

  function buyQuietCourt() {
    if (!crownUnlocked()) return;
    var cost = quietCourtCost(state.quietCourtLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.quietCourtLevel += 1;
    markChronicle("quietCourt");
    markSaveDirty();
    markDirty();
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
    var hollowBefore = state.favor;
    state.favor -= cost;
    noteHollowManualSpend("favor", cost, hollowBefore);
    state.remembrance = (Number(state.remembrance) || 0) + 1;
    showToast("The GodKing keeps a remembrance.");
    markSaveDirty();
    markDirty();
  }

  function buyDeeperNight() {
    if (!remembranceUnlocked()) return;
    var cost = deeperNightCost(state.deeperNightLevel);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    var hollowBefore = state.remembrance;
    state.remembrance -= cost;
    noteHollowManualSpend("remembrance", cost, hollowBefore);
    state.deeperNightLevel += 1;
    markSaveDirty();
    markDirty();
  }

  function buyLongerProcession() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.longerProcessionLevel) || 0));
    if (level >= LONGER_PROCESSION_MAX) return;
    var cost = longerProcessionCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    var hollowBefore = state.remembrance;
    state.remembrance -= cost;
    noteHollowManualSpend("remembrance", cost, hollowBefore);
    state.longerProcessionLevel = level + 1;
    markChronicle("longerProcession");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyDeeperToll() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.deeperTollLevel) || 0));
    if (level >= DEEPER_TOLL_MAX) return;
    var cost = deeperTollCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    var hollowBefore = state.remembrance;
    state.remembrance -= cost;
    noteHollowManualSpend("remembrance", cost, hollowBefore);
    state.deeperTollLevel = level + 1;
    markChronicle("deeperToll");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyLongerWake() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.longerWakeLevel) || 0));
    if (level >= LONGER_WAKE_MAX) return;
    var cost = longerWakeCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    var hollowBefore = state.remembrance;
    state.remembrance -= cost;
    noteHollowManualSpend("remembrance", cost, hollowBefore);
    state.longerWakeLevel = level + 1;
    markChronicle("longerWake");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyLongerTithe() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.longerTitheLevel) || 0));
    if (level >= LONGER_TITHE_MAX) return;
    var cost = longerTitheCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    var hollowBefore = state.remembrance;
    state.remembrance -= cost;
    noteHollowManualSpend("remembrance", cost, hollowBefore);
    state.longerTitheLevel = level + 1;
    markChronicle("longerTithe");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyLongerVeil() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.longerVeilLevel) || 0));
    if (level >= LONGER_VEIL_MAX) return;
    var cost = longerVeilCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    var hollowBefore = state.remembrance;
    state.remembrance -= cost;
    noteHollowManualSpend("remembrance", cost, hollowBefore);
    state.longerVeilLevel = level + 1;
    markChronicle("longerVeil");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyLongerHymn() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.longerHymnLevel) || 0));
    if (level >= LONGER_HYMN_MAX) return;
    var cost = longerHymnCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    var hollowBefore = state.remembrance;
    state.remembrance -= cost;
    noteHollowManualSpend("remembrance", cost, hollowBefore);
    state.longerHymnLevel = level + 1;
    markChronicle("longerHymn");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyLongerKnell() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.longerKnellLevel) || 0));
    if (level >= LONGER_KNELL_MAX) return;
    var cost = longerKnellCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    var hollowBefore = state.remembrance;
    state.remembrance -= cost;
    noteHollowManualSpend("remembrance", cost, hollowBefore);
    state.longerKnellLevel = level + 1;
    markChronicle("longerKnell");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function buyAshenTide() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.ashenTideLevel) || 0));
    if (level >= ASHEN_TIDE_MAX) return;
    var cost = ashenTideCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    var hollowBefore = state.remembrance;
    state.remembrance -= cost;
    noteHollowManualSpend("remembrance", cost, hollowBefore);
    state.ashenTideLevel = level + 1;
    markSaveDirty();
    markDirty();
  }

  function buyOssuary() {
    if (!remembranceUnlocked()) return;
    var level = Math.max(0, Math.floor(Number(state.ossuaryLevel) || 0));
    if (level >= OSSUARY_MAX) return;
    var cost = ossuaryCost(level);
    if (!isFinite(cost) || (Number(state.remembrance) || 0) < cost) return;
    var hollowBefore = state.remembrance;
    state.remembrance -= cost;
    noteHollowManualSpend("remembrance", cost, hollowBefore);
    state.ossuaryLevel = level + 1;
    markChronicle("ossuary");
    checkUnlock();
    markSaveDirty();
    markDirty();
  }

  function beginProcession() {
    if (!remembranceUnlocked()) return;
    if (processionActive()) return;
    var cost = PROCESSION_COST;
    if ((Number(state.remembrance) || 0) < cost) return;
    var hollowBefore = state.remembrance;
    state.remembrance -= cost;
    noteHollowManualSpend("remembrance", cost, hollowBefore);
    state.processionLeft = paidProcessionSecs(state.longerProcessionLevel);
    markChronicle("procession");
    if (!state.giftFirstProcession) {
      state.giftFirstProcession = true;
      state.souls = N.add(state.souls, 5);
      markChronicle("giftFirstProcession");
      showToast("Five souls for the first procession.");
    }
    showToast("They walk the emptied hall.");
    announce("Procession active.");
    markSaveDirty();
    markDirty();
  }
  function soundKnell() {
    if (!remembranceUnlocked()) return;
    if (knellActive()) return;
    var cost = KNELL_COST;
    if ((Number(state.remembrance) || 0) < cost) return;
    var hollowBefore = state.remembrance;
    state.remembrance -= cost;
    noteHollowManualSpend("remembrance", cost, hollowBefore);
    state.knellLeft = paidKnellSecs(state.longerKnellLevel);
    markChronicle("knell");
    if (!state.giftFirstKnell) {
      state.giftFirstKnell = true;
      state.souls = N.add(state.souls, 5);
      markChronicle("giftFirstKnell");
      showToast("Five souls for the first knell.");
    }
    showToast("The well answers twice.");
    announce("Knell active.");
    markSaveDirty();
    markDirty();
  }

  function beginKnell() {
    soundKnell();
  }

  function raiseChoir() {
    if (!state.unlockedChoir) return;
    var level = Math.max(0, Math.floor(Number(state.choirLevel) || 0));
    if (level >= CHOIR_MAX) return;
    if (N.cmp(state.lanterns, CHOIR_LANTERN_COST) < 0) return;
    var hollowBefore = state.lanterns;
    state.lanterns = N.sub(state.lanterns, CHOIR_LANTERN_COST);
    noteHollowManualSpend("lanterns", CHOIR_LANTERN_COST, hollowBefore);
    state.unlockedLanterns = true;
    state.choirLevel = level + 1;
    if (markChronicle("choir")) {
      showToast("The choir of ash sings.");
    }
    markSaveDirty();
    markDirty();
  }

  function swearAspect(id) {
    if ((Number(state.favorEarned) || 0) < 1) return;
    if (normalizeAspect(state.aspect)) return;
    var a = normalizeAspect(id);
    if (!a) return;
    state.aspect = a;
    markChronicle("aspect");
    markSaveDirty();
    markDirty();
  }

  var VOW_CONFIRM = {
    stillness: "Swear Stillness?\n\nThe well will not answer a draw this emptying. This cannot be undone until Tribute.",
    poverty: "Swear Poverty?\n\nThrones will not autobind this emptying. This cannot be undone until Tribute.",
    hunger: "Swear Hunger?\n\nThe Tithe costs twice this emptying. This cannot be undone until Tribute.",
    ember: "Swear Ember?\n\nNight\u2019s Tithe and the Wake will not answer this emptying. This cannot be undone until Tribute."
  };

  function swearVow(id) {
    if ((Number(state.favorEarned) || 0) < 1) return;
    if (normalizeVow(state.vow)) return;
    var v = normalizeVow(id);
    if (!v) return;
    if (!window.confirm(VOW_CONFIRM[v] || "Swear this vow?")) return;
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
    markSaveDirty();
    markDirty();
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

  function dumpNum(v) {
    return N.dump(v);
  }

  function serializeState() {
    var out = {};
    for (var i = 0; i < FIELDS_KEYS.length; i++) {
      var k = FIELDS_KEYS[i];
      var f = FIELDS[k];
      var v = state[k];
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
    out.simulatedUntil = Number(state.simulatedUntil) || Number(state.lastTick) || Date.now();
    if ((Number(state.chalices) || 0) >= 1) out.unlockedChalices = true;
    if ((Number(state.bindingTollLevel) || 0) >= 1) out.unlockedBindingToll = true;
    if ((Number(state.choirLevel) || 0) >= 1) out.unlockedChoir = true;
    if ((Number(state.namesBound) || 0) >= 12) out.namesComplete = true;
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

  function coreCurrenciesBroken() {
    return (
      numFieldBroken(state.souls) ||
      numFieldBroken(state.shades) ||
      numFieldBroken(state.ash) ||
      numFieldBroken(state.lifetimeSouls)
    );
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

  function applySaveData(data) {
    for (var i = 0; i < FIELDS_KEYS.length; i++) {
      var k = FIELDS_KEYS[i];
      var f = FIELDS[k];
      var raw = data[k];
      switch (f.kind) {
        case "num":  state[k] = loadNum(raw); break;
        case "count":state[k] = loadCount(raw, f.max); break;
        case "flag": state[k] = !!raw; break;
        case "str":  state[k] = f.load ? f.load(raw) : (raw || ""); break;
        case "list": state[k] = f.load ? f.load(raw) : (raw || []); break;
        case "time": state[k] = loadCount(raw) || Date.now(); break;
        case "obj":  state[k] = f.load ? f.load(raw) : (raw || {}); break;
      }
    }
    state.simulatedUntil = loadCount(data.simulatedUntil) || loadCount(data.lastTick) || Date.now();
    state.peakShades = N.max(loadNum(data.peakShades), loadNum(data.shades));
    state.peakLanterns = N.max(loadNum(data.peakLanterns), loadNum(data.lanterns));
    state.peakFetters = N.max(loadNum(data.peakFetters), loadNum(data.fetters));
    state.peakCensers = N.max(loadNum(data.peakCensers), loadNum(data.censers));
    state.peakPyres = N.max(loadNum(data.peakPyres), loadNum(data.pyres));
    state.peakUrns = N.max(loadNum(data.peakUrns), loadNum(data.urns));
    state.peakHearths = N.max(loadNum(data.peakHearths), loadNum(data.hearths));
    state.peakBeacons = N.max(loadNum(data.peakBeacons), loadNum(data.beacons));
    state.peakSpires = N.max(loadNum(data.peakSpires), loadNum(data.spires));
    state.peakObelisks = N.max(loadNum(data.peakObelisks), loadNum(data.obelisks));
    state.vowHungerPaid = !!data.vowHungerPaid && state.vow === "hunger";
    if (data.favorEarned == null) state.favorEarned = loadCount(data.favor);
    if (data.allTimeSouls == null) state.allTimeSouls = loadNum(data.lifetimeSouls);
    if (N.cmp(state.allTimeSouls, 0) < 0) state.allTimeSouls = N.fromNumber(0);
    var tendingLoaded = data.tendingEdictLevel;
    if (tendingLoaded == null && data.kindlingEdictLevel != null) tendingLoaded = data.kindlingEdictLevel;
    state.tendingEdictLevel = loadCount(tendingLoaded);
    if ((loadCount(data.chalices) || 0) >= 1 || (loadCount(data.thrones) || 0) >= UNLOCK_CHALICES) state.unlockedChalices = true;
    if (N.cmp(state.urns, 1) >= 0 || N.cmp(state.pyres, UNLOCK_URNS) >= 0) state.unlockedUrns = true;
    if (N.cmp(state.hearths, 1) >= 0 || N.cmp(state.urns, UNLOCK_HEARTHS) >= 0) state.unlockedHearths = true;
    if (N.cmp(state.beacons, 1) >= 0 || N.cmp(state.hearths, UNLOCK_BEACONS) >= 0) state.unlockedBeacons = true;
    if (N.cmp(state.spires, 1) >= 0 || N.cmp(state.beacons, UNLOCK_SPIRES) >= 0) state.unlockedSpires = true;
    if (N.cmp(state.obelisks, 1) >= 0 || N.cmp(state.spires, UNLOCK_OBELISKS) >= 0) state.unlockedObelisks = true;
    if ((loadCount(data.nightLeft) || 0) > 0) state.unlockedNightTithe = true;
    if ((loadCount(data.clicksThisRun) || 0) >= UNLOCK_VEIL_CLICKS || (loadCount(data.veilLeft) || 0) > 0) state.unlockedVeil = true;
    if (!!data.unlockedPyres || (loadCount(data.wakeLeft) || 0) > 0) state.unlockedWake = true;
    if ((loadCount(data.clicksThisRun) || 0) >= UNLOCK_TOLL_CLICKS || (loadCount(data.tollLeft) || 0) > 0) state.unlockedToll = true;
    if (state.wakeLeft > 0 || N.cmp(state.ash, UNLOCK_WAKE_ASH) >= 0 || state.unlockedPyres) state.unlockedWake = true;
    if (state.clicksThisRun >= UNLOCK_VEIL_CLICKS || (Number(state.veilLeft) || 0) > 0) state.unlockedVeil = true;
    if (state.clicksThisRun >= UNLOCK_TOLL_CLICKS || (Number(state.tollLeft) || 0) > 0) state.unlockedToll = true;
    if (state.unlockedPyres || N.cmp(state.pyres, 1) >= 0 || N.cmp(state.ash, UNLOCK_WAKE_ASH) >= 0 || state.wakeLeft > 0) state.unlockedWake = true;
    if (state.bindingTollLevel >= 1) state.unlockedBindingToll = true;
    if (state.choirLevel >= 1) state.unlockedChoir = true;
    if (state.namesBound >= 12) state.namesComplete = true;
    if ((loadCount(data.titheLeft) || 0) > 0) state.tithePaid = true;
    if (data.giftFirstTribute == null && data.bonusFirstTribute == null) state.giftFirstTribute = (loadCount(data.tributesLaid) || 0) >= 1;
    if (data.giftFirstTribute == null && data.bonusFirstTribute != null) state.giftFirstTribute = !!data.bonusFirstTribute;
    if (data.giftCrown == null) state.giftCrown = state.crownWeight >= 1;
    if (data.giftFirstName == null) state.giftFirstName = Math.max(0, Math.floor(loadCount(data.namesBound) || 0)) >= 1;
    if (data.giftFiveTributes == null) state.giftFiveTributes = (loadCount(data.tributesLaid) || 0) >= 5;
    if (data.giftEightTributes == null) state.giftEightTributes = (loadCount(data.tributesLaid) || 0) >= 8;
    if (data.giftTwelveTributes == null) state.giftTwelveTributes = (loadCount(data.tributesLaid) || 0) >= 12;
    if (data.giftSixteenTributes == null) state.giftSixteenTributes = (loadCount(data.tributesLaid) || 0) >= 16;
    if (data.giftTwentyTributes == null) state.giftTwentyTributes = (loadCount(data.tributesLaid) || 0) >= 20;
    if (data.giftTwentyFourTributes == null) state.giftTwentyFourTributes = hasChronicle("giftTwentyFourTributes") || (loadCount(data.tributesLaid) || 0) >= 24;
    if (data.giftTwentyEightTributes == null) state.giftTwentyEightTributes = hasChronicle("giftTwentyEightTributes") || (loadCount(data.tributesLaid) || 0) >= 28;
    if (data.giftThirtyTwoTributes == null) state.giftThirtyTwoTributes = hasChronicle("giftThirtyTwoTributes") || (loadCount(data.tributesLaid) || 0) >= 32;
    if (data.giftThirtySixTributes == null) state.giftThirtySixTributes = hasChronicle("giftThirtySixTributes") || (loadCount(data.tributesLaid) || 0) >= 36;
    if (data.giftFortyTributes == null) state.giftFortyTributes = hasChronicle("giftFortyTributes") || (loadCount(data.tributesLaid) || 0) >= 40;
    if (data.giftNamesComplete == null) state.giftNamesComplete = !!data.namesComplete || Math.max(0, Math.floor(loadCount(data.namesBound) || 0)) >= 12;
    if (data.giftFirstVeil == null) state.giftFirstVeil = hasChronicle("veil") || (loadCount(data.veilLeft) || 0) > 0;
    if (data.giftFirstWake == null) state.giftFirstWake = hasChronicle("wake") || hasChronicle("giftFirstWake") || (loadCount(data.wakeLeft) || 0) > 0;
    if (data.giftPeakLanterns == null) state.giftPeakLanterns = false;
    if (data.giftPeakFetters == null) state.giftPeakFetters = false;
    if (data.giftPeakCensers == null) state.giftPeakCensers = false;
    if (data.giftFirstPyre == null) state.giftFirstPyre = hasChronicle("pyre") || hasChronicle("giftFirstPyre") || (embersStartsPyres(data.embersEdictLevel) > 0 && N.cmp(state.pyres, 1) >= 0);
    if (data.giftFirstUrn == null) state.giftFirstUrn = hasChronicle("urn") || hasChronicle("giftFirstUrn") || (urnEdictStartsUrns(data.urnEdictLevel) > 0 && N.cmp(state.urns, 1) >= 0);
    if (data.giftFirstHearth == null) state.giftFirstHearth = hasChronicle("hearth") || hasChronicle("giftFirstHearth") || (hearthEdictStartsHearths(data.hearthEdictLevel) > 0 && N.cmp(state.hearths, 1) >= 0);
    if (data.giftFirstBeacon == null) state.giftFirstBeacon = hasChronicle("beacon") || hasChronicle("giftFirstBeacon") || (beaconEdictStartsBeacons(data.beaconEdictLevel) > 0 && N.cmp(state.beacons, 1) >= 0);
    if (data.giftFirstSpire == null) state.giftFirstSpire = hasChronicle("spire") || hasChronicle("giftFirstSpire") || (spireEdictStartsSpires(data.spireEdictLevel) > 0 && N.cmp(state.spires, 1) >= 0);
    if (data.giftFirstObelisk == null) state.giftFirstObelisk = hasChronicle("obelisk") || hasChronicle("giftFirstObelisk") || (obeliskEdictStartsObelisks(data.obeliskEdictLevel) > 0 && N.cmp(state.obelisks, 1) >= 0);
    if (data.giftPeakPyres == null) state.giftPeakPyres = false;
    if (data.giftPeakUrns == null) state.giftPeakUrns = false;
    if (data.giftPeakHearths == null) state.giftPeakHearths = false;
    if (data.giftPeakBeacons == null) state.giftPeakBeacons = false;
    if (data.giftPeakSpires == null) state.giftPeakSpires = false;
    if (data.giftPeakObelisks == null) state.giftPeakObelisks = false;
    if (data.giftFirstCinders == null) state.giftFirstCinders = hasChronicle("giftFirstCinders") || hasChronicle("cinders") || (loadCount(data.cinderLevel) || 0) > 0;
    if (data.giftFirstUrnRite == null) state.giftFirstUrnRite = hasChronicle("giftFirstUrnRite") || hasChronicle("urnRite") || (loadCount(data.urnRiteLevel) || 0) > 0;
    if (data.giftFirstHearthRite == null) state.giftFirstHearthRite = hasChronicle("giftFirstHearthRite") || hasChronicle("hearthRite") || (loadCount(data.hearthRiteLevel) || 0) > 0;
    if (data.giftFirstBeaconRite == null) state.giftFirstBeaconRite = hasChronicle("giftFirstBeaconRite") || hasChronicle("beaconRite") || (loadCount(data.beaconRiteLevel) || 0) > 0;
    if (data.giftFirstSpireRite == null) state.giftFirstSpireRite = hasChronicle("giftFirstSpireRite") || hasChronicle("spireRite") || (loadCount(data.spireRiteLevel) || 0) > 0;
    if (data.giftFirstChalice == null) state.giftFirstChalice = hasChronicle("giftFirstChalice") || hasChronicle("chalice") || (cupStartsChalices(data.cupEdictLevel) > 0 && (Number(state.chalices) || 0) >= 1);
    if (data.giftFullCup == null) state.giftFullCup = hasChronicle("giftFullCup");
    if (data.giftThreeChalices == null) state.giftThreeChalices = hasChronicle("giftThreeChalices");
    if (data.giftFirstOssuary == null) state.giftFirstOssuary = hasChronicle("giftFirstOssuary") || hasChronicle("ossuary") || (loadCount(data.ossuaryLevel) || 0) >= 1;
    if (data.giftFullOssuary == null) state.giftFullOssuary = hasChronicle("giftFullOssuary");
    if (data.giftHundredDraws == null) state.giftHundredDraws = hasChronicle("giftHundredDraws");
    if (data.giftTwoHundredDraws == null) state.giftTwoHundredDraws = hasChronicle("giftTwoHundredDraws");
    if (data.giftThreeHundredDraws == null) state.giftThreeHundredDraws = hasChronicle("giftThreeHundredDraws");
    if (data.giftFirstEmberVow == null) state.giftFirstEmberVow = hasChronicle("vowEmber") || hasChronicle("giftFirstEmberVow");
    if (data.giftTwoVows == null) state.giftTwoVows = hasChronicle("giftTwoVows");
    if (data.giftThreeVows == null) state.giftThreeVows = hasChronicle("giftThreeVows");
    if (data.giftAllVows == null) state.giftAllVows = hasChronicle("giftAllVows");
    if (data.giftFirstProcession == null) state.giftFirstProcession = hasChronicle("procession") || hasChronicle("giftFirstProcession") || (loadCount(data.processionLeft) || 0) > 0;
    if (data.giftFirstLongerProcession == null) state.giftFirstLongerProcession = hasChronicle("giftFirstLongerProcession") || hasChronicle("longerProcession") || (loadCount(data.longerProcessionLevel) || 0) >= 1;
    if (data.giftFirstDeeperToll == null) state.giftFirstDeeperToll = hasChronicle("giftFirstDeeperToll") || hasChronicle("deeperToll") || (loadCount(data.deeperTollLevel) || 0) >= 1;
    if (data.giftFirstLongerWake == null) state.giftFirstLongerWake = hasChronicle("giftFirstLongerWake") || hasChronicle("longerWake") || (loadCount(data.longerWakeLevel) || 0) >= 1;
    if (data.giftFirstLongerTithe == null) state.giftFirstLongerTithe = hasChronicle("giftFirstLongerTithe") || hasChronicle("longerTithe") || (loadCount(data.longerTitheLevel) || 0) >= 1;
    if (data.giftFirstLongerVeil == null) state.giftFirstLongerVeil = hasChronicle("giftFirstLongerVeil") || hasChronicle("longerVeil") || (loadCount(data.longerVeilLevel) || 0) >= 1;
    if (data.giftFirstLongerHymn == null) state.giftFirstLongerHymn = hasChronicle("giftFirstLongerHymn") || hasChronicle("longerHymn") || (loadCount(data.longerHymnLevel) || 0) >= 1;
    if (data.giftFirstLongerKnell == null) state.giftFirstLongerKnell = hasChronicle("giftFirstLongerKnell") || hasChronicle("longerKnell") || (loadCount(data.longerKnellLevel) || 0) >= 1;
    if (data.giftFirstToll == null) state.giftFirstToll = hasChronicle("toll") || hasChronicle("giftFirstToll") || (loadCount(data.tollLeft) || 0) > 0;
    if (data.giftFirstKnell == null) state.giftFirstKnell = hasChronicle("knell") || hasChronicle("giftFirstKnell") || (loadCount(data.knellLeft) || 0) > 0;
    // bonus* → gift* migration (AZR-179)
    for (var oldKey in BONUS_TO_GIFT) {
      if (Object.prototype.hasOwnProperty.call(BONUS_TO_GIFT, oldKey)) {
        var newKey = BONUS_TO_GIFT[oldKey];
        if (data[oldKey] && !state[newKey]) {
          state[newKey] = true;
        }
      }
    }
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

  function hideUnlockCards() {
    for (var i = 0; i < REVEALABLE.length; i++) {
      hideCard(REVEALABLE[i].el());
    }
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
  function applyEdictStartingStock(s) {
    s = s || state;
    var memoryLevel = Number(s.memoryLevel) || 0;
    if (memoryLevel > 0) {
      s.shades = N.fromNumber(memoryLevel);
      s.unlockedWell = true;
    }
    var seatLevel = Number(s.seatLevel) || 0;
    s.thrones = seatLevel;
    if (seatLevel >= 1) {
      s.unlockedThrones = true;
    }
    var echoLevel = Number(s.echoLevel) || 0;
    if (echoLevel > 1) echoLevel = 1;
    if (echoLevel >= 1) {
      s.wellDraws = true;
      s.unlockedWellDraws = true;
    }
    var kindleLevel = Number(s.kindleLevel) || 0;
    if (kindleLevel > 0) {
      s.lanterns = N.fromNumber(kindleLevel);
      s.unlockedLanterns = true;
      s.lanternToastShown = true;
    }
    var ashenLevel = Number(s.ashenLevel) || 0;
    if (ashenLevel > 0) {
      s.ash = N.fromNumber(10 * ashenLevel);
    }
    var longMem = Number(s.longMemoryLevel) || 0;
    if (longMem > 0) {
      s.fetters = N.fromNumber(longMem);
      s.unlockedFetters = true;
    }
    var depthLevel = Number(s.depthLevel) || 0;
    if (depthLevel > 0) {
      s.wellDepth = depthLevel;
      s.unlockedWell = true;
    }
    var startPyres = embersStartsPyres(s.embersEdictLevel);
    if (startPyres > 0) {
      s.pyres = N.fromNumber(startPyres);
      s.unlockedPyres = true;
    }
    var startUrns = urnEdictStartsUrns(s.urnEdictLevel);
    if (startUrns > 0) {
      s.urns = N.fromNumber(startUrns);
      s.unlockedUrns = true;
    }
    var startHearths = hearthEdictStartsHearths(s.hearthEdictLevel);
    if (startHearths > 0) {
      s.hearths = N.fromNumber(startHearths);
      s.unlockedHearths = true;
    }
    var startBeacons = beaconEdictStartsBeacons(s.beaconEdictLevel);
    if (startBeacons > 0) {
      s.beacons = N.fromNumber(startBeacons);
      s.unlockedBeacons = true;
    }
    var startSpires = spireEdictStartsSpires(s.spireEdictLevel);
    if (startSpires > 0) {
      s.spires = N.fromNumber(startSpires);
      s.unlockedSpires = true;
    }
    var startObelisks = obeliskEdictStartsObelisks(s.obeliskEdictLevel);
    if (startObelisks > 0) {
      s.obelisks = N.fromNumber(startObelisks);
      s.unlockedObelisks = true;
    }
    var startChalices = cupStartsChalices(s.cupEdictLevel);
    if (startChalices > 0) {
      s.chalices = startChalices;
      s.unlockedChalices = true;
    }
    s.choirLevel = Math.min(CHOIR_MAX, Math.max(0, Math.floor(Number(s.choirEdictLevel) || 0)));
    if (s.choirLevel >= 1) {
      s.unlockedChoir = true;
    }
  }

  var TRIBUTE_AUTOBIND_STARTS = [
    {
      predicate: quietCourtStartsLanternAutobind,
      levelKey: "quietCourtLevel",
      autobindKey: "autobindLanterns",
      unlockedKey: "unlockedAutobindLanterns",
      stockField: "lanterns",
      threshold: UNLOCK_AUTOBIND_LANTERNS,
      numberStock: false
    },
    {
      predicate: quietCourtStartsFetterAutobind,
      levelKey: "quietCourtLevel",
      autobindKey: "autobindFetters",
      unlockedKey: "unlockedAutobindFetters",
      stockField: "fetters",
      threshold: UNLOCK_AUTOBIND_FETTERS,
      numberStock: false
    },
    {
      predicate: quietCourtStartsPyreAutobind,
      levelKey: "quietCourtLevel",
      autobindKey: "autobindPyres",
      unlockedKey: "unlockedAutobindPyres",
      stockField: "pyres",
      threshold: UNLOCK_AUTOBIND_PYRES,
      numberStock: false
    },
    {
      predicate: quietCourtStartsChaliceAutobind,
      levelKey: "quietCourtLevel",
      autobindKey: "autobindChalices",
      unlockedKey: "unlockedAutobindChalices",
      stockField: "chalices",
      threshold: UNLOCK_AUTOBIND_CHALICES,
      numberStock: true
    },
    {
      predicate: quietCourtStartsUrnAutobind,
      levelKey: "quietCourtLevel",
      autobindKey: "autobindUrns",
      unlockedKey: "unlockedAutobindUrns",
      stockField: "urns",
      threshold: UNLOCK_AUTOBIND_URNS,
      numberStock: false
    },
    {
      predicate: quietCourtStartsHearthAutobind,
      levelKey: "quietCourtLevel",
      autobindKey: "autobindHearths",
      unlockedKey: "unlockedAutobindHearths",
      stockField: "hearths",
      threshold: UNLOCK_AUTOBIND_HEARTHS,
      numberStock: false
    },
    {
      predicate: quietCourtStartsBeaconAutobind,
      levelKey: "quietCourtLevel",
      autobindKey: "autobindBeacons",
      unlockedKey: "unlockedAutobindBeacons",
      stockField: "beacons",
      threshold: UNLOCK_AUTOBIND_BEACONS,
      numberStock: false
    },
    {
      predicate: quietCourtStartsSpireAutobind,
      levelKey: "quietCourtLevel",
      autobindKey: "autobindSpires",
      unlockedKey: "unlockedAutobindSpires",
      stockField: "spires",
      threshold: UNLOCK_AUTOBIND_SPIRES,
      numberStock: false
    },
    {
      predicate: quietCourtStartsObeliskAutobind,
      levelKey: "quietCourtLevel",
      autobindKey: "autobindObelisks",
      unlockedKey: "unlockedAutobindObelisks",
      stockField: "obelisks",
      threshold: UNLOCK_AUTOBIND_OBELISKS,
      numberStock: false
    },
    {
      predicate: smokeStartsCenserAutobind,
      levelKey: "smokeEdictLevel",
      autobindKey: "autobindCensers",
      unlockedKey: "unlockedAutobindCensers",
      stockField: "censers",
      threshold: UNLOCK_AUTOBIND_CENSERS,
      numberStock: false
    },
    {
      predicate: cinderEdictStartsPyreAutobind,
      levelKey: "cinderEdictLevel",
      autobindKey: "autobindPyres",
      unlockedKey: "unlockedAutobindPyres",
      stockField: "pyres",
      threshold: UNLOCK_AUTOBIND_PYRES,
      numberStock: false
    },
    {
      predicate: cutEdictStartsUrnAutobind,
      levelKey: "cutEdictLevel",
      autobindKey: "autobindUrns",
      unlockedKey: "unlockedAutobindUrns",
      stockField: "urns",
      threshold: UNLOCK_AUTOBIND_URNS,
      numberStock: false
    },
    {
      predicate: tendingEdictStartsHearthAutobind,
      levelKey: "tendingEdictLevel",
      autobindKey: "autobindHearths",
      unlockedKey: "unlockedAutobindHearths",
      stockField: "hearths",
      threshold: UNLOCK_AUTOBIND_HEARTHS,
      numberStock: false
    },
    {
      predicate: gleamEdictStartsBeaconAutobind,
      levelKey: "gleamEdictLevel",
      autobindKey: "autobindBeacons",
      unlockedKey: "unlockedAutobindBeacons",
      stockField: "beacons",
      threshold: UNLOCK_AUTOBIND_BEACONS,
      numberStock: false
    },
    {
      predicate: riseEdictStartsSpireAutobind,
      levelKey: "riseEdictLevel",
      autobindKey: "autobindSpires",
      unlockedKey: "unlockedAutobindSpires",
      stockField: "spires",
      threshold: UNLOCK_AUTOBIND_SPIRES,
      numberStock: false
    },
    {
      predicate: draughtStartsChaliceAutobind,
      levelKey: "draughtEdictLevel",
      autobindKey: "autobindChalices",
      unlockedKey: "unlockedAutobindChalices",
      stockField: "chalices",
      threshold: UNLOCK_AUTOBIND_CHALICES,
      numberStock: true
    }
  ];

  function applyAutobindStarts(s) {
    s = s || state;
    var quietCourt = Number(s.quietCourtLevel) || 0;
    if (quietCourt >= 1) {
      s.autobind = true;
      s.unlockedAutobind = true;
    }
    var i;
    for (i = 0; i < TRIBUTE_AUTOBIND_STARTS.length; i++) {
      var row = TRIBUTE_AUTOBIND_STARTS[i];
      var level = s[row.levelKey];
      if (!row.predicate(level)) continue;
      s[row.autobindKey] = true;
      var stock = s[row.stockField];
      var meets;
      if (row.numberStock) {
        meets = (Number(stock) || 0) >= row.threshold;
      } else {
        meets = N.cmp(stock, row.threshold) >= 0;
      }
      if (meets) {
        s[row.unlockedKey] = true;
      }
    }
  }

  function applyTributeAccountMutations(gain) {
    var firstTributeBonus = 0;
    if (!state.giftFirstTribute) {
      state.giftFirstTribute = true;
      firstTributeBonus = 1;
      markChronicle("giftTribute");
    }
    var vowBonus = vowExtraFavor(state.vow, state.vowHungerPaid);
    var extraFavor = firstTributeBonus + vowBonus;
    state.favor = (Number(state.favor) || 0) + gain + extraFavor;
    state.favorEarned = (Number(state.favorEarned) || 0) + gain + extraFavor;
    if (state.echoLevel > 1) state.echoLevel = 1;
    state.peakShades = N.max(num(state.peakShades), num(state.shades));
    state.peakLanterns = N.max(num(state.peakLanterns), num(state.lanterns));
    state.peakFetters = N.max(num(state.peakFetters), num(state.fetters));
    state.peakCensers = N.max(num(state.peakCensers), num(state.censers));
    state.peakPyres = N.max(num(state.peakPyres), num(state.pyres));
    state.peakUrns = N.max(num(state.peakUrns), num(state.urns));
    state.peakHearths = N.max(num(state.peakHearths), num(state.hearths));
    state.peakBeacons = N.max(num(state.peakBeacons), num(state.beacons));
    state.peakSpires = N.max(num(state.peakSpires), num(state.spires));
    state.peakObelisks = N.max(num(state.peakObelisks), num(state.obelisks));
    state.tributesLaid = (Number(state.tributesLaid) || 0) + 1;
    state.chronicle = (state.chronicle || []).slice();
    state.vowsKnown = normalizeVowsKnown(state.vowsKnown);
    state.namesComplete = !!state.namesComplete || (Math.max(0, Math.min(12, Math.floor(Number(state.namesBound) || 0)))) >= 12;
    return firstTributeBonus;
  }

  function snapshotAccountFields() {
    var snap = {};
    for (var i = 0; i < FIELDS_KEYS.length; i++) {
      var k = FIELDS_KEYS[i];
      if (FIELDS[k].scope !== "account") continue;
      var v = state[k];
      if (v && typeof v === "object" && typeof v.m === "number") {
        snap[k] = N.clone(v);
      } else if (Array.isArray(v)) {
        snap[k] = v.slice();
      } else if (v && typeof v === "object") {
        snap[k] = JSON.parse(JSON.stringify(v));
      } else {
        snap[k] = v;
      }
    }
    return snap;
  }

  function restoreAccountFields(snap) {
    var keys = Object.keys(snap);
    for (var i = 0; i < keys.length; i++) {
      state[keys[i]] = snap[keys[i]];
    }
  }

  function applyTributeTimerPhases() {
    state.nightLeft = nightLeftAfterTribute(state.nightEdictLevel);
    if (state.nightLeft > 0) state.unlockedNightTithe = true;
    state.hymnLeft = hymnLeftAfterTribute(state.hymnEdictLevel, state.longerHymnLevel);
    state.veilLeft = veilLeftAfterTribute(state.veilEdictLevel);
    if (state.veilLeft > 0) state.unlockedVeil = true;
    state.tollLeft = tollLeftAfterTribute(state.tollEdictLevel);
    if (state.tollLeft > 0) state.unlockedToll = true;
    state.wakeLeft = wakeLeftAfterTribute(state.wakeEdictLevel);
    if (state.wakeLeft > 0) state.unlockedWake = true;
    state.processionLeft = processionLeftAfterTribute(state.processionEdictLevel);
    state.knellLeft = knellLeftAfterTribute(state.knellEdictLevel);
  }

  function layTribute() {
    var gain = favorGain(state.lifetimeSouls);
    if (gain < 1) return;
    var ok = window.confirm(
      "Empty the well?\n\nThe GodKing keeps the Favor. Reliquary stays. This gathering is forfeit."
    );
    if (!ok) return;
    markChronicle("tribute");
    // Phase 1: mutate account-scope fields before snapshot
    var firstTributeBonus = applyTributeAccountMutations(gain);
    // Phase 2: snapshot all account-scope fields
    var accountSnap = snapshotAccountFields();
    // Phase 3: full reset
    state = freshState();
    // Phase 4: restore account-scope fields from snapshot
    restoreAccountFields(accountSnap);
    // Phase 5: derived timer phases
    applyTributeTimerPhases();
    // Phase 6 (AZR-171): edict starting stock then autobind starts
    applyEdictStartingStock(state);
    applyAutobindStarts(state);
    markChronicle("hymn");
    hideToast(true);
    hideUnlockCards();
    _favorReadyAnnounced = false;
    checkUnlock();
    revealUnlockedCards(false);
    save();
    render();
    if (firstTributeBonus > 0) {
      showToast("The GodKing's first remembrance is generous.");
    }
    showToast("A hymn follows the emptying.");
    announce("Hymn active.");
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
    if (reduceMotionActive()) return;
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
      announce("Unlocked: Bound Spirits.");
      markSaveDirty();
    }
  }

  function revealVessels(withToast) {
    revealCard(els.vesselCard);
    if (withToast && !state.vesselToastShown) {
      state.vesselToastShown = true;
      showToast("A vessel waits. A will can be housed.");
      announce("Unlocked: Vessels.");
      markSaveDirty();
    }
  }

  function revealThrones(withToast) {
    revealCard(els.throneCard);
    if (withToast && !state.throneToastShown) {
      state.throneToastShown = true;
      showToast("A throne may be raised.");
      announce("Unlocked: Thrones.");
      markSaveDirty();
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
      announce("Unlocked: Censers.");
      markSaveDirty();
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

  function revealBeacons(withToast) {
    revealCard(els.beaconCard);
  }

  function revealSpires(withToast) {
    revealCard(els.spireCard);
  }

  function revealObelisks(withToast) {
    revealCard(els.obeliskCard);
  }

  function revealChalices(withToast) {
    revealCard(els.chaliceCard);
  }

  function revealFetters(withToast) {
    revealCard(els.fetterCard);
  }

  var REVEALABLE = [
    { flag: "unlockedWell", reveal: revealWell, el: function () { return els.wellCard; } },
    { flag: "unlockedLanterns", reveal: revealLanterns, el: function () { return els.lanternCard; } },
    { flag: "unlockedSpirits", reveal: revealSpirits, el: function () { return els.spiritCard; } },
    { flag: "unlockedFetters", reveal: revealFetters, el: function () { return els.fetterCard; } },
    { flag: "unlockedVessels", reveal: revealVessels, el: function () { return els.vesselCard; } },
    { flag: "unlockedThrones", reveal: revealThrones, el: function () { return els.throneCard; } },
    { flag: "unlockedCensers", reveal: revealCensers, el: function () { return els.censerCard; } },
    { flag: "unlockedPyres", reveal: revealPyres, el: function () { return els.pyreCard; } },
    { flag: "unlockedUrns", reveal: revealUrns, el: function () { return els.urnCard; } },
    { flag: "unlockedHearths", reveal: revealHearths, el: function () { return els.hearthCard; } },
    { flag: "unlockedBeacons", reveal: revealBeacons, el: function () { return els.beaconCard; } },
    { flag: "unlockedSpires", reveal: revealSpires, el: function () { return els.spireCard; } },
    { flag: "unlockedObelisks", reveal: revealObelisks, el: function () { return els.obeliskCard; } },
    { flag: "unlockedChalices", reveal: revealChalices, el: function () { return els.chaliceCard; } }
  ];

  function revealUnlockedCards(withToast) {
    for (var i = 0; i < REVEALABLE.length; i++) {
      var entry = REVEALABLE[i];
      if (state[entry.flag]) entry.reveal(withToast);
    }
  }

  function hideTribute() {
    if (els.tributePanel) els.tributePanel.classList.add("is-hidden");
    if (els.tributeFootBtn) els.tributeFootBtn.classList.add("is-hidden");
  }

  function hideRites() {
    if (els.ritesPanel) els.ritesPanel.classList.add("is-hidden");
    if (els.levyRow) els.levyRow.classList.add("is-hidden");
    if (els.bindingTollRow) els.bindingTollRow.classList.add("is-hidden");
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
    if (els.autobindBeaconsRow) els.autobindBeaconsRow.classList.add("is-hidden");
    if (els.autobindSpiresRow) els.autobindSpiresRow.classList.add("is-hidden");
    if (els.autobindObelisksRow) els.autobindObelisksRow.classList.add("is-hidden");
    if (els.autobindChalicesRow) els.autobindChalicesRow.classList.add("is-hidden");
    if (els.cinderRow) els.cinderRow.classList.add("is-hidden");
    if (els.urnRiteRow) els.urnRiteRow.classList.add("is-hidden");
    if (els.hearthRiteRow) els.hearthRiteRow.classList.add("is-hidden");
    if (els.beaconRiteRow) els.beaconRiteRow.classList.add("is-hidden");
    if (els.spireRiteRow) els.spireRiteRow.classList.add("is-hidden");
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

  var toastOverflowLabel = C.toastOverflowLabel;

  var toastOverflowCount = C.toastOverflowCount;

  /** Pure: enqueue onto a queue copy, never exceeding max (overflow summary in last slot). */
  function capEnqueueToast(queue, message, max) {
    var q = queue ? queue.slice() : [];
    var lim = max || TOAST_QUEUE_MAX;
    if (!message) return q;
    if (q.length < lim) {
      q.push(message);
      return q;
    }
    var last = q[q.length - 1];
    var prev = toastOverflowCount(last);
    var dropped = prev > 0 ? prev + 1 : 2;
    q[q.length - 1] = toastOverflowLabel(dropped);
    return q;
  }

  function pushToastQueued(message) {
    if (!message) return;
    var next = capEnqueueToast(toastQueue, message, TOAST_QUEUE_MAX);
    toastQueue.length = 0;
    for (var i = 0; i < next.length; i++) toastQueue.push(next[i]);
  }

  function formatGiftBatchSummary(count, totals) {
    var t = totals || {};
    var parts = [];
    var names = Math.max(0, Math.floor(Number(t.names) || 0));
    var ash = Math.max(0, Math.floor(Number(t.ash) || 0));
    var souls = Math.max(0, Math.floor(Number(t.souls) || 0));
    var shades = Math.max(0, Math.floor(Number(t.shades) || 0));
    var vessels = Math.max(0, Math.floor(Number(t.vessels) || 0));
    var favor = Math.max(0, Math.floor(Number(t.favor) || 0));
    if (names > 0) parts.push("+" + names + (names === 1 ? " name" : " names"));
    if (ash > 0) parts.push("+" + ash + " ash");
    if (souls > 0) parts.push("+" + souls + (souls === 1 ? " soul" : " souls"));
    if (shades > 0) parts.push("+" + shades + (shades === 1 ? " shade" : " shades"));
    if (vessels > 0) parts.push("+" + vessels + (vessels === 1 ? " vessel" : " vessels"));
    if (favor > 0) parts.push("+" + favor + " Favor");
    if (parts.length) return "The well was generous: " + parts.join(", ") + ".";
    var n = Math.max(0, Math.floor(Number(count) || 0));
    return "The well was generous. " + n + " gifts.";
  }

  function beginGiftToastBatch() {
    giftToastBatch = {
      messages: [],
      souls: N.clone(state.souls),
      ash: N.clone(state.ash),
      shades: N.clone(state.shades),
      vessels: N.clone(state.vessels),
      names: Math.max(0, Math.floor(Number(state.namesBound) || 0)),
      favor: Number(state.favor) || 0
    };
  }

  function flushGiftToasts() {
    if (!giftToastBatch) return;
    var batch = giftToastBatch;
    giftToastBatch = null;
    var msgs = batch.messages || [];
    if (!msgs.length) return;
    if (msgs.length === 1) {
      showToast(msgs[0]);
      announce(msgs[0]);
      return;
    }
    var soulsGain = Math.max(0, Math.floor(N.toNumber(N.sub(state.souls, batch.souls)) || 0));
    var ashGain = Math.max(0, Math.floor(N.toNumber(N.sub(state.ash, batch.ash)) || 0));
    var shadesGain = Math.max(0, Math.floor(N.toNumber(N.sub(state.shades, batch.shades)) || 0));
    var vesselsGain = Math.max(0, Math.floor(N.toNumber(N.sub(state.vessels, batch.vessels)) || 0));
    var namesGain = Math.max(
      0,
      Math.floor(Number(state.namesBound) || 0) - (Number(batch.names) || 0)
    );
    var favorGain = Math.max(0, (Number(state.favor) || 0) - (Number(batch.favor) || 0));
    var summary = formatGiftBatchSummary(msgs.length, {
        souls: soulsGain,
        ash: ashGain,
        shades: shadesGain,
        vessels: vesselsGain,
        names: namesGain,
        favor: favorGain
      });
    showToast(summary);
    announce(msgs.length + " gifts received.");
  }

  function showToast(message, groupKey) {
    if (!message) return;
    if (groupKey === "gifts" && giftToastBatch) {
      giftToastBatch.messages.push(message);
      return;
    }
    if (!els.toast || toastHold || toastActive) {
      pushToastQueued(message);
      return;
    }
    presentToast(message);
  }

  function toastBulk(k, message) {
    if (k > 1) showToast(message);
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
    var dwell = toastQueue.length >= 1 ? TOAST_FAST_MS : TOAST_MS;
    toastTimer = window.setTimeout(function () {
      hideToast(false);
    }, dwell);
  }

  function hideToast(immediate) {
    if (!els.toast) return;
    window.clearTimeout(toastTimer);
    els.toast.classList.remove("is-visible");
    if (immediate) {
      toastQueue.length = 0;
      toastActive = false;
      toastEscapeArmed = false;
      els.toast.classList.add("is-hidden");
      return;
    }
    toastActive = false;
    if (toastQueue.length) {
      var next = toastQueue.shift();
      presentToast(next);
      return;
    }
    toastEscapeArmed = false;
    window.setTimeout(function () {
      if (!els.toast.classList.contains("is-visible") && !toastActive) {
        els.toast.classList.add("is-hidden");
      }
    }, 500);
  }

  /** Click / first Escape → next; Escape again while armed → clear queue. */
  function dismissToastNext() {
    if (!toastActive && !toastQueue.length) return;
    hideToast(false);
  }

  function dismissToastEscape() {
    if (!toastActive && !toastQueue.length) {
      toastEscapeArmed = false;
      return;
    }
    if (toastEscapeArmed) {
      hideToast(true);
      return;
    }
    toastEscapeArmed = true;
    hideToast(false);
  }

  function bindLabel(oneText, verb, k, unitOne, unitMany) {
    if (k <= 1) return oneText;
    return verb + " " + k + " " + unitMany;
  }

  function render() {
    var F = SoulgatherFormat;
    if (!els.soulsCount) return;
    setTextWriteCount = 0;

    var mult = rateMult();
    var gain = favorGain(state.lifetimeSouls);

    setText(els.soulsCount, F.formatNumber(state.souls));
    setText(els.soulsRate, F.formatRate(soulsPerSec(mult)));

    if (els.hollowStatus) {
      var hs = Math.max(0, Math.floor(Number(state.hollowStacks) || 0));
      if (hs >= 1) {
        var pct = Math.round(HOLLOW_PENALTY * hs * 100);
        setText(els.hollowStatus, "Hollow \u00d7" + hs + " (\u2212" + pct + "%)");
        els.hollowStatus.classList.remove("is-hidden");
      } else {
        els.hollowStatus.classList.add("is-hidden");
      }
    }

    if (els.gatherBtn) {
      var still = normalizeVow(state.vow) === "stillness";
      els.gatherBtn.disabled = still;
      els.gatherBtn.setAttribute("aria-disabled", still ? "true" : "false");
      els.gatherBtn.setAttribute("aria-label", still ? "The well is still." : "Draw from the Well");
      setText(els.gatherVerb, still ? "The well" : "Draw from");
      setText(els.gatherNoun, still ? "is still." : "the Well");
    }

    if (els.vowStatus) {
      var hudVow = normalizeVow(state.vow);
      if (hudVow && VOW_HUD_STRINGS[hudVow]) {
        setText(els.vowStatus, VOW_HUD_STRINGS[hudVow]);
        els.vowStatus.classList.remove("is-hidden");
      } else {
        setText(els.vowStatus, "");
        els.vowStatus.classList.add("is-hidden");
      }
    }

    if (els.soulsAsh) {
      var showAsh =
        state.unlockedMarks ||
        state.unlockedCensers ||
        state.unlockedPyres ||
        state.unlockedUrns ||
        state.unlockedHearths ||
        state.unlockedBeacons ||
        state.unlockedNightTithe ||
        state.unlockedChoir ||
        state.unlockedVeil ||
        state.unlockedWake ||
        state.unlockedChalices ||
        N.cmp(state.ash, 0) > 0 ||
        N.cmp(state.pyres, 0) > 0 ||
        N.cmp(state.urns, 0) > 0 ||
        N.cmp(state.hearths, 0) > 0 ||
        N.cmp(state.beacons, 0) > 0;
      if (showAsh) {
        setText(els.soulsAsh, "Ash " + F.formatNumber(state.ash));
        els.soulsAsh.classList.remove("is-hidden");
      } else {
        els.soulsAsh.classList.add("is-hidden");
      }
    }

    if (els.soulsFavor) {
      if (mult > 1) {
        setText(els.soulsFavor, "Blessing " + formatMult(mult));
        els.soulsFavor.classList.remove("is-hidden");
      } else {
        els.soulsFavor.classList.add("is-hidden");
      }
    }

    if (els.soulsHymn) {
      if (hymnActive()) {
        var hLeft = Number(state.hymnLeft) || 0;
        setText(els.soulsHymn, "Hymn ×1.25 — " + Math.ceil(hLeft) + "s");
        els.soulsHymn.classList.remove("is-hidden");
      } else {
        els.soulsHymn.classList.add("is-hidden");
      }
    }

    if (els.soulsWake) {
      if (wakeActive()) {
        var wHud = Number(state.wakeLeft) || 0;
        setText(els.soulsWake, "Wake ×2 — " + Math.ceil(wHud) + "s");
        els.soulsWake.classList.remove("is-hidden");
      } else {
        els.soulsWake.classList.add("is-hidden");
      }
    }

    if (els.soulsKnell) {
      if (knellActive()) {
        var kHud = Number(state.knellLeft) || 0;
        setText(els.soulsKnell, "Knell ×2 — " + Math.ceil(kHud) + "s");
        els.soulsKnell.classList.remove("is-hidden");
      } else {
        els.soulsKnell.classList.add("is-hidden");
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

    if (els.buyModeHint) {
      var showBuyHint =
        !state.buyModeHintDismissed &&
        !isTypingTarget(document.activeElement);
      els.buyModeHint.classList.toggle("is-hidden", !showBuyHint);
    }

    if (state.unlockedWell) {
      var wellPlan = wellPurchasePlan(state.wellDepth, state.souls);
      var canWell = wellPlan.can;
      var power = clickPower();
      setText(els.wellOwned, F.formatNumber(state.wellDepth));
      setText(els.wellPower,
        F.formatNumber(power) + (N.cmp(power, 1) === 0 ? " soul / click" : " souls / click"));
      setText(els.wellCost, F.formatNumber(wellPlan.cost) + " Souls");
      els.wellBuy.disabled = !canWell;
      setText(els.wellBuy, bindLabel("Deepen the Well", "Deepen", wellPlan.k, "level", "levels"));
      els.wellCard.classList.toggle("can-buy", canWell);
    }

    var shadePlan = purchasePlan(
      state.shades,
      state.souls,
      COST_BASE,
      COST_MULT,
      bindingTollCostMult(state.bindingTollLevel)
    );
    var canShade = shadePlan.can;
    setText(els.shadeOwned, F.formatNumber(state.shades));
    setText(els.shadeProd,
      F.formatNumber(shadeSoulsPerSec(mult)) + " souls / sec");
    setText(els.shadeCost, F.formatNumber(shadePlan.cost) + " Souls");
    els.shadeBuy.disabled = !canShade;
    setText(els.shadeBuy, bindLabel("Bind a Shade", "Bind", shadePlan.k, "Shade", "Shades"));
    els.shadeCard.classList.toggle("can-buy", canShade);
    els.shadeCard.classList.toggle("is-dormant", N.cmp(state.lifetimeSouls, 1) < 0);

    if (state.unlockedLanterns) {
      var lanternPlan = purchasePlan(state.lanterns, state.souls, LANTERN_COST_BASE, LANTERN_COST_MULT);
      var lMult = lanternMult(state.lanterns);
      var canLantern = lanternPlan.can;
      setText(els.lanternOwned, F.formatNumber(state.lanterns));
      setText(els.lanternProd, "Shade souls \u00d7" + formatTimes(lMult));
      setText(els.lanternCost, F.formatNumber(lanternPlan.cost) + " Souls");
      els.lanternBuy.disabled = !canLantern;
      setText(els.lanternBuy, bindLabel("Kindle a Lantern", "Kindle", lanternPlan.k, "Lantern", "Lanterns"));
      els.lanternCard.classList.toggle("can-buy", canLantern);
    }

    if (state.unlockedSpirits) {
      var spiritPlan = purchasePlan(
        state.spirits,
        state.shades,
        COST_BASE,
        COST_MULT,
        bindingTollCostMult(state.bindingTollLevel)
      );
      setText(els.spiritOwned, F.formatNumber(state.spirits));
      setText(els.spiritProd,
        F.formatNumber(shadesPerSec(mult)) + " shades / sec");
      setText(els.spiritCost, F.formatNumber(spiritPlan.cost) + " Shades");
      els.spiritBuy.disabled = !spiritPlan.can;
      setText(els.spiritBuy, bindLabel("Bind a Spirit", "Bind", spiritPlan.k, "Spirit", "Spirits"));
      els.spiritCard.classList.toggle("can-buy", spiritPlan.can);
    }

    if (state.unlockedFetters) {
      var fetterPlan = purchasePlan(state.fetters, state.shades, FETTER_COST_BASE, FETTER_COST_MULT);
      var fMult = fetterMult(state.fetters);
      var canFetter = fetterPlan.can;
      setText(els.fetterOwned, F.formatNumber(state.fetters));
      setText(els.fetterProd, "Spirit shades \u00d7" + formatTimes(fMult));
      setText(els.fetterCost, F.formatNumber(fetterPlan.cost) + " Shades");
      if (els.fetterBuy) {
        els.fetterBuy.disabled = !canFetter;
        setText(els.fetterBuy, bindLabel("Bind a Fetter", "Bind", fetterPlan.k, "Fetter", "Fetters"));
      }
      if (els.fetterCard) els.fetterCard.classList.toggle("can-buy", canFetter);
    }

    if (state.unlockedVessels) {
      var vesselPlan = purchasePlan(state.vessels, state.spirits);
      setText(els.vesselOwned, F.formatNumber(state.vessels));
      setText(els.vesselProd,
        F.formatNumber(spiritsPerSec(mult)) + " spirits / sec");
      setText(els.vesselCost, F.formatNumber(vesselPlan.cost) + " Spirits");
      els.vesselBuy.disabled = !vesselPlan.can;
      setText(els.vesselBuy, bindLabel("Bind a Vessel", "Bind", vesselPlan.k, "Vessel", "Vessels"));
      els.vesselCard.classList.toggle("can-buy", vesselPlan.can);
    }

    if (state.unlockedCensers) {
      var censerPlan = purchasePlan(state.censers, state.vessels, COST_BASE, COST_MULT);
      var censerRate = N.mul(
        N.mul(
          N.mul(
            N.mul(N.mul(state.censers, CENSER_ASH_PER_SEC), mult),
            nightMult(nightActive())
          ),
          hymnMult(hymnActive())
        ),
        wakeMult(wakeActive())
      );
      var canCenser = censerPlan.can;
      setText(els.censerOwned, F.formatNumber(state.censers));
      setText(els.censerProd, F.formatNumber(censerRate) + " ash / sec");
      setText(els.censerCost, F.formatNumber(censerPlan.cost) + " Vessels");
      els.censerBuy.disabled = !canCenser;
      setText(els.censerBuy, bindLabel("Raise a Censer", "Raise", censerPlan.k, "Censer", "Censers"));
      els.censerCard.classList.toggle("can-buy", canCenser);
    }

    if (state.unlockedPyres) {
      var pyrePlan = purchasePlan(state.pyres, state.censers, PYRE_COST_BASE, PYRE_COST_MULT);
      var pyreRate = N.mul(
        N.mul(
          N.mul(
            N.mul(
              N.mul(N.mul(state.pyres, PYRE_ASH_PER_SEC), mult),
              nightMult(nightActive())
            ),
            hymnMult(hymnActive())
          ),
          cinderMult(state.cinderLevel)
        ),
        wakeMult(wakeActive())
      );
      setText(els.pyreOwned, F.formatNumber(state.pyres));
      setText(els.pyreProd, F.formatNumber(pyreRate) + " ash / sec");
      setText(els.pyreCost, F.formatNumber(pyrePlan.cost) + " Censers");
      if (els.pyreBuy) {
        els.pyreBuy.disabled = !pyrePlan.can;
        setText(els.pyreBuy, bindLabel("Raise a Pyre", "Raise", pyrePlan.k, "Pyre", "Pyres"));
      }
      if (els.pyreCard) els.pyreCard.classList.toggle("can-buy", pyrePlan.can);
    }

    if (state.unlockedUrns) {
      var urnPlan = purchasePlan(state.urns, state.pyres, URN_COST_BASE, URN_COST_MULT);
      var urnRate = N.mul(
        N.mul(
          N.mul(
            N.mul(
              N.mul(N.mul(state.urns, URN_ASH_PER_SEC), mult),
              nightMult(nightActive())
            ),
            hymnMult(hymnActive())
          ),
          urnRiteMult(state.urnRiteLevel)
        ),
        wakeMult(wakeActive())
      );
      setText(els.urnOwned, F.formatNumber(state.urns));
      setText(els.urnProd, F.formatNumber(urnRate) + " ash / sec");
      setText(els.urnCost, F.formatNumber(urnPlan.cost) + " Pyres");
      if (els.urnBuy) {
        els.urnBuy.disabled = !urnPlan.can;
        setText(els.urnBuy, bindLabel("Raise an Urn", "Raise", urnPlan.k, "Urn", "Urns"));
      }
      if (els.urnCard) els.urnCard.classList.toggle("can-buy", urnPlan.can);
    }

    if (state.unlockedHearths) {
      var hearthPlan = purchasePlan(state.hearths, state.urns, HEARTH_COST_BASE, HEARTH_COST_MULT);
      var hearthRate = N.mul(
        N.mul(
          N.mul(
            N.mul(
              N.mul(N.mul(state.hearths, HEARTH_ASH_PER_SEC), mult),
              nightMult(nightActive())
            ),
            hymnMult(hymnActive())
          ),
          hearthRiteMult(state.hearthRiteLevel)
        ),
        wakeMult(wakeActive())
      );
      setText(els.hearthOwned, F.formatNumber(state.hearths));
      setText(els.hearthProd, F.formatNumber(hearthRate) + " ash / sec");
      setText(els.hearthCost, F.formatNumber(hearthPlan.cost) + " Urns");
      if (els.hearthBuy) {
        els.hearthBuy.disabled = !hearthPlan.can;
        setText(els.hearthBuy, bindLabel("Kindle a Hearth", "Kindle", hearthPlan.k, "Hearth", "Hearths"));
      }
      if (els.hearthCard) els.hearthCard.classList.toggle("can-buy", hearthPlan.can);
    }

    if (state.unlockedBeacons) {
      var beaconPlan = purchasePlan(state.beacons, state.hearths, BEACON_COST_BASE, BEACON_COST_MULT);
      var beaconRate = N.mul(
        N.mul(
          N.mul(
            N.mul(
              N.mul(N.mul(state.beacons, BEACON_ASH_PER_SEC), mult),
              nightMult(nightActive())
            ),
            hymnMult(hymnActive())
          ),
          beaconRiteMult(state.beaconRiteLevel)
        ),
        wakeMult(wakeActive())
      );
      setText(els.beaconOwned, F.formatNumber(state.beacons));
      setText(els.beaconProd, F.formatNumber(beaconRate) + " ash / sec");
      setText(els.beaconCost, F.formatNumber(beaconPlan.cost) + " Hearths");
      if (els.beaconBuy) {
        els.beaconBuy.disabled = !beaconPlan.can;
        setText(els.beaconBuy, bindLabel("Raise a Beacon", "Raise", beaconPlan.k, "Beacon", "Beacons"));
      }
      if (els.beaconCard) els.beaconCard.classList.toggle("can-buy", beaconPlan.can);
    }

    if (state.unlockedSpires) {
      var spirePlan = purchasePlan(state.spires, state.beacons, SPIRE_COST_BASE, SPIRE_COST_MULT);
      var spireRate = N.mul(
        N.mul(
          N.mul(
            N.mul(
              N.mul(N.mul(state.spires, SPIRE_ASH_PER_SEC), mult),
              nightMult(nightActive())
            ),
            hymnMult(hymnActive())
          ),
          spireRiteMult(state.spireRiteLevel)
        ),
        wakeMult(wakeActive())
      );
      setText(els.spireOwned, F.formatNumber(state.spires));
      setText(els.spireProd, F.formatNumber(spireRate) + " ash / sec");
      setText(els.spireCost, F.formatNumber(spirePlan.cost) + " Beacons");
      if (els.spireBuy) {
        els.spireBuy.disabled = !spirePlan.can;
        setText(els.spireBuy, bindLabel("Raise a Spire", "Raise", spirePlan.k, "Spire", "Spires"));
      }
      if (els.spireCard) els.spireCard.classList.toggle("can-buy", spirePlan.can);
    }

    if (state.unlockedObelisks) {
      var obeliskPlan = purchasePlan(state.obelisks, state.spires, OBELISK_COST_BASE, OBELISK_COST_MULT);
      var obeliskRate = N.mul(
        N.mul(
          N.mul(
            N.mul(N.mul(state.obelisks, OBELISK_ASH_PER_SEC), mult),
            nightMult(nightActive())
          ),
          hymnMult(hymnActive())
        ),
        wakeMult(wakeActive())
      );
      setText(els.obeliskOwned, F.formatNumber(state.obelisks));
      setText(els.obeliskProd, F.formatNumber(obeliskRate) + " ash / sec");
      setText(els.obeliskCost, F.formatNumber(obeliskPlan.cost) + " Spires");
      if (els.obeliskBuy) {
        els.obeliskBuy.disabled = !obeliskPlan.can;
        setText(els.obeliskBuy, bindLabel("Raise an Obelisk", "Raise", obeliskPlan.k, "Obelisk", "Obelisks"));
      }
      if (els.obeliskCard) els.obeliskCard.classList.toggle("can-buy", obeliskPlan.can);
    }

    if (state.unlockedThrones) {
      var thronePlan = purchasePlan(state.thrones, state.vessels);
      var thronePct = Math.round(
        (normalizeAspect(state.aspect) === "dominion" ? 15 : 10) * state.thrones
      );
      setText(els.throneOwned, F.formatNumber(state.thrones));
      setText(els.throneProd, "+" + thronePct + "% production");
      setText(els.throneCost, F.formatNumber(thronePlan.cost) + " Vessels");
      var throneBlocked = normalizeVow(state.vow) === "poverty";
      els.throneBuy.disabled = !thronePlan.can || throneBlocked;
      setText(els.throneBuy, bindLabel("Raise a Throne", "Raise", thronePlan.k, "Throne", "Thrones"));
      els.throneCard.classList.toggle("can-buy", thronePlan.can && !throneBlocked);
    }

    if (state.unlockedChalices) {
      var cupPlan = chalicePlan();
      var chalicePct = Math.round(8 * (Number(state.chalices) || 0));
      setText(els.chaliceOwned, F.formatNumber(state.chalices));
      setText(els.chaliceProd, "+" + chalicePct + "% production");
      if (els.chaliceCost) {
        setText(els.chaliceCost, cupPlan.capped ? "\u2014" : F.formatNumber(cupPlan.cost) + " Ash");
      }
      if (els.chaliceBuy) {
        els.chaliceBuy.disabled = !cupPlan.can;
        if (cupPlan.capped) {
          setText(els.chaliceBuy, "Raise a Chalice");
        } else {
          setText(els.chaliceBuy, bindLabel("Raise a Chalice", "Raise", cupPlan.k, "Chalice", "Chalices"));
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
      setText(els.siphonEffect, "Siphon \u00d7" + formatTimes(sMult));
      setText(els.siphonCost, F.formatNumber(sCost) + " Souls");
      if (els.siphonBuy) els.siphonBuy.disabled = N.cmp(state.souls, sCost) < 0;

      if (els.levyRow) {
        els.levyRow.classList.toggle("is-hidden", !state.unlockedSpirits);
      }
      if (state.unlockedSpirits) {
        var lCost = levyCost(state.levyLevel);
        var levyM = levyMult(state.levyLevel);
        setText(els.levyEffect, "Levy \u00d7" + formatTimes(levyM));
        setText(els.levyCost, F.formatNumber(lCost) + " Shades");
        if (els.levyBuy) els.levyBuy.disabled = N.cmp(state.shades, lCost) < 0;
      }

      var bindingOpen = bindingTollRowOpen();
      if (els.bindingTollRow) {
        els.bindingTollRow.classList.toggle("is-hidden", !bindingOpen);
      }
      if (bindingOpen) {
        var btLevel = Math.max(0, Math.floor(Number(state.bindingTollLevel) || 0));
        if (btLevel > BINDING_TOLL_MAX) btLevel = BINDING_TOLL_MAX;
        var btRate = bindingTollRateMult(btLevel);
        var btCostBonusPct = Math.round(BINDING_TOLL_COST_BONUS * btLevel * 100);
        var btCost = bindingTollCost(btLevel);
        var btAtCap = btLevel >= BINDING_TOLL_MAX;
        if (els.bindingTollEffect) {
          setText(els.bindingTollEffect,
            "Shade/Spirit \u00d7" +
            formatTimes(btRate) +
            " \u00b7 costs +" +
            btCostBonusPct +
            "% \u00b7 " +
            btLevel +
            "/" +
            BINDING_TOLL_MAX);
        }
        if (els.bindingTollCost) {
          setText(els.bindingTollCost, btAtCap ? "\u2014" : F.formatNumber(btCost) + " Ash");
        }
        if (els.bindingTollBuy) {
          els.bindingTollBuy.disabled = btAtCap || N.cmp(state.ash, btCost) < 0;
        }
      }

      var cinderOpen = !!state.unlockedPyres;
      if (els.cinderRow) {
        els.cinderRow.classList.toggle("is-hidden", !cinderOpen);
      }
      if (cinderOpen) {
        var cCost = cinderCost(state.cinderLevel);
        var cMult = cinderMult(state.cinderLevel);
        setText(els.cinderEffect, "Cinders \u00d7" + formatTimes(cMult));
        setText(els.cinderCost, F.formatNumber(cCost) + " Ash");
        if (els.cinderBuy) els.cinderBuy.disabled = N.cmp(state.ash, cCost) < 0;
      }

      var urnRiteOpen = !!state.unlockedUrns;
      if (els.urnRiteRow) {
        els.urnRiteRow.classList.toggle("is-hidden", !urnRiteOpen);
      }
      if (urnRiteOpen) {
        var uCost = urnRiteCost(state.urnRiteLevel);
        var uMult = urnRiteMult(state.urnRiteLevel);
        setText(els.urnRiteEffect, "Urn \u00d7" + formatTimes(uMult));
        setText(els.urnRiteCost, F.formatNumber(uCost) + " Ash");
        if (els.urnRiteBuy) els.urnRiteBuy.disabled = N.cmp(state.ash, uCost) < 0;
      }

      var hearthRiteOpen = !!state.unlockedHearths;
      if (els.hearthRiteRow) {
        els.hearthRiteRow.classList.toggle("is-hidden", !hearthRiteOpen);
      }
      if (hearthRiteOpen) {
        var hCost = hearthRiteCost(state.hearthRiteLevel);
        var hMult = hearthRiteMult(state.hearthRiteLevel);
        setText(els.hearthRiteEffect, "Hearth \u00d7" + formatTimes(hMult));
        setText(els.hearthRiteCost, F.formatNumber(hCost) + " Ash");
        if (els.hearthRiteBuy) els.hearthRiteBuy.disabled = N.cmp(state.ash, hCost) < 0;
      }

      var beaconRiteOpen = !!state.unlockedBeacons;
      if (els.beaconRiteRow) {
        els.beaconRiteRow.classList.toggle("is-hidden", !beaconRiteOpen);
      }
      if (beaconRiteOpen) {
        var bCost = beaconRiteCost(state.beaconRiteLevel);
        var bMult = beaconRiteMult(state.beaconRiteLevel);
        setText(els.beaconRiteEffect, "Beacon \u00d7" + formatTimes(bMult));
        setText(els.beaconRiteCost, F.formatNumber(bCost) + " Ash");
        if (els.beaconRiteBuy) els.beaconRiteBuy.disabled = N.cmp(state.ash, bCost) < 0;
      }

      var spireRiteOpen = !!state.unlockedSpires;
      if (els.spireRiteRow) {
        els.spireRiteRow.classList.toggle("is-hidden", !spireRiteOpen);
      }
      if (spireRiteOpen) {
        var spRCost = spireRiteCost(state.spireRiteLevel);
        var spRMult = spireRiteMult(state.spireRiteLevel);
        setText(els.spireRiteEffect, "Spire \u00d7" + formatTimes(spRMult));
        setText(els.spireRiteCost, F.formatNumber(spRCost) + " Ash");
        if (els.spireRiteBuy) els.spireRiteBuy.disabled = N.cmp(state.ash, spRCost) < 0;
      }

      var drawsOpen = !!state.unlockedWellDraws || !!state.wellDraws;
      if (els.wellDrawsRow) {
        els.wellDrawsRow.classList.toggle("is-hidden", !drawsOpen);
      }
      if (drawsOpen) {
        if (state.wellDraws) {
          setText(els.wellDrawsEffect, "The well draws");
          setText(els.wellDrawsCost, "\u2014");
          if (els.wellDrawsBuy) {
            els.wellDrawsBuy.disabled = true;
            setText(els.wellDrawsBuy, "The well draws");
          }
        } else {
          setText(els.wellDrawsEffect, "Idle draw");
          if (els.wellDrawsCost) {
            setText(els.wellDrawsCost, F.formatNumber(WELL_DRAWS_COST) + " Souls");
          }
          if (els.wellDrawsBuy) {
            els.wellDrawsBuy.disabled = N.cmp(state.souls, WELL_DRAWS_COST) < 0;
            setText(els.wellDrawsBuy, "Let the Well Draw");
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
          setText(els.titheEffect, titheActive() ? "Burst \u00d72" : "Burst \u00d72 \u00b7 " + paidTitheSecs(state.longerTitheLevel) + "s");
        }
        if (els.titheCost) {
          setText(els.titheCost, F.formatNumber(tCost) + " Souls");
        }
        if (els.titheBuy) {
          if (titheActive()) {
            els.titheBuy.disabled = true;
            setText(els.titheBuy, "The tithe burns \u2014 " + Math.ceil(tLeft) + "s");
          } else {
            els.titheBuy.disabled = N.cmp(state.souls, tCost) < 0;
            setText(els.titheBuy, "Pay the Tithe");
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
          setText(els.nightTitheEffect, nightActive() ? "Burst \u00d73" : "Burst \u00d73 \u00b7 " + nightSecs(state.deeperNightLevel) + "s");
        }
        if (els.nightTitheCost) {
          setText(els.nightTitheCost, F.formatNumber(nCost) + " Ash");
        }
        if (els.nightTitheBuy) {
          var emberNight = normalizeVow(state.vow) === "ember" && !nightActive();
          if (nightActive()) {
            els.nightTitheBuy.disabled = true;
            setText(els.nightTitheBuy, "Night burns \u2014 " + Math.ceil(nLeft) + "s");
          } else if (emberNight) {
            els.nightTitheBuy.disabled = true;
            els.nightTitheBuy.setAttribute("aria-disabled", "true");
            setText(els.nightTitheBuy, "Ember holds the night.");
          } else {
            els.nightTitheBuy.disabled = N.cmp(state.ash, NIGHT_TITHE_MIN) < 0;
            els.nightTitheBuy.removeAttribute("aria-disabled");
            setText(els.nightTitheBuy, "Pay the Night's Tithe");
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
          setText(els.wakeEffect, wakeActive() ? "Burst \u00d72" : "Burst \u00d72 \u00b7 " + paidWakeSecs(state.longerWakeLevel) + "s");
        }
        if (els.wakeCost) {
          setText(els.wakeCost, F.formatNumber(wCost) + " Ash");
        }
        if (els.wakeBuy) {
          var emberWake = normalizeVow(state.vow) === "ember" && !wakeActive();
          if (wakeActive()) {
            els.wakeBuy.disabled = true;
            setText(els.wakeBuy, "The wake burns \u2014 " + Math.ceil(wLeft) + "s");
          } else if (emberWake) {
            els.wakeBuy.disabled = true;
            els.wakeBuy.setAttribute("aria-disabled", "true");
            setText(els.wakeBuy, "Ember holds the wake.");
          } else {
            els.wakeBuy.disabled = N.cmp(state.ash, wCost) < 0;
            els.wakeBuy.removeAttribute("aria-disabled");
            setText(els.wakeBuy, "Keep the Wake");
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
          setText(els.veilEffect, veilActive() ? "Burst \u00d72" : "Burst \u00d72 \u00b7 " + paidVeilSecs(state.longerVeilLevel) + "s");
        }
        if (els.veilCost) {
          setText(els.veilCost, F.formatNumber(vCost) + " Ash");
        }
        if (els.veilBuy) {
          if (veilActive()) {
            els.veilBuy.disabled = true;
            setText(els.veilBuy, "The veil thins \u2014 " + Math.ceil(vLeft) + "s");
          } else {
            els.veilBuy.disabled = N.cmp(state.ash, VEIL_MIN) < 0;
            setText(els.veilBuy, "Thin the Veil");
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
          setText(els.tollEffect, tollActive() ? "Burst \u00d72" : "Burst \u00d72 \u00b7 " + paidTollSecs(state.deeperTollLevel) + "s");
        }
        if (els.tollCost) {
          setText(els.tollCost, F.formatNumber(oCost) + " Souls");
        }
        if (els.tollBuy) {
          if (tollActive()) {
            els.tollBuy.disabled = true;
            setText(els.tollBuy, "The toll sounds \u2014 " + Math.ceil(oLeft) + "s");
          } else {
            els.tollBuy.disabled = N.cmp(state.souls, oCost) < 0;
            setText(els.tollBuy, "Sound the Toll");
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
          setText(els.autobindEffect, state.autobind ? "The well binds" : "Idle bind");
        }
        if (els.autobindBuy) {
          els.autobindBuy.disabled = false;
          setText(els.autobindBuy, "Autobind Shades");
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
          setText(els.autobindSpiritsEffect, state.autobindSpirits ? "The shackled bind" : "Idle bind");
        }
        if (els.autobindSpiritsBuy) {
          els.autobindSpiritsBuy.disabled = false;
          setText(els.autobindSpiritsBuy, "Autobind Spirits");
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
          setText(els.autobindVesselsEffect, state.autobindVessels ? "The hollow fills" : "Idle bind");
        }
        if (els.autobindVesselsBuy) {
          els.autobindVesselsBuy.disabled = false;
          setText(els.autobindVesselsBuy, "Autobind Vessels");
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
          setText(els.autobindLanternsEffect, state.autobindLanterns ? "The lights kindle" : "Idle bind");
        }
        if (els.autobindLanternsBuy) {
          els.autobindLanternsBuy.disabled = false;
          setText(els.autobindLanternsBuy, "Autobind Lanterns");
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
          setText(els.autobindFettersEffect, state.autobindFetters ? "The chain learns" : "Idle bind");
        }
        if (els.autobindFettersBuy) {
          els.autobindFettersBuy.disabled = false;
          setText(els.autobindFettersBuy, "Autobind Fetters");
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
          setText(els.autobindCensersEffect, state.autobindCensers ? "The smoke tends" : "Idle bind");
        }
        if (els.autobindCensersBuy) {
          els.autobindCensersBuy.disabled = false;
          setText(els.autobindCensersBuy, "Autobind Censers");
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
          setText(els.autobindThronesEffect, state.autobindThrones ? "The seat claims" : "Idle bind");
        }
        if (els.autobindThronesBuy) {
          els.autobindThronesBuy.disabled = false;
          setText(els.autobindThronesBuy, "Autobind Thrones");
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
          setText(els.autobindPyresEffect, state.autobindPyres ? "The coals tend" : "Idle bind");
        }
        if (els.autobindPyresBuy) {
          els.autobindPyresBuy.disabled = false;
          setText(els.autobindPyresBuy, "Autobind Pyres");
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
          setText(els.autobindUrnsEffect, state.autobindUrns ? "The vessel fills" : "Idle bind");
        }
        if (els.autobindUrnsBuy) {
          els.autobindUrnsBuy.disabled = false;
          setText(els.autobindUrnsBuy, "Autobind Urns");
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
          setText(els.autobindHearthsEffect, state.autobindHearths ? "The hearth kindles" : "Idle bind");
        }
        if (els.autobindHearthsBuy) {
          els.autobindHearthsBuy.disabled = false;
          setText(els.autobindHearthsBuy, "Autobind Hearths");
          els.autobindHearthsBuy.setAttribute("aria-pressed", state.autobindHearths ? "true" : "false");
        }
      }

      var autoBeaconOpen = !!state.unlockedAutobindBeacons;
      if (els.autobindBeaconsRow) {
        els.autobindBeaconsRow.classList.toggle("is-hidden", !autoBeaconOpen);
        els.autobindBeaconsRow.classList.toggle("is-on", autoBeaconOpen && !!state.autobindBeacons);
      }
      if (autoBeaconOpen) {
        if (els.autobindBeaconsEffect) {
          setText(els.autobindBeaconsEffect, state.autobindBeacons ? "The beacon kindles" : "Idle bind");
        }
        if (els.autobindBeaconsBuy) {
          els.autobindBeaconsBuy.disabled = false;
          setText(els.autobindBeaconsBuy, "Autobind Beacons");
          els.autobindBeaconsBuy.setAttribute("aria-pressed", state.autobindBeacons ? "true" : "false");
        }
      }

      var autoSpireOpen = !!state.unlockedAutobindSpires;
      if (els.autobindSpiresRow) {
        els.autobindSpiresRow.classList.toggle("is-hidden", !autoSpireOpen);
        els.autobindSpiresRow.classList.toggle("is-on", autoSpireOpen && !!state.autobindSpires);
      }
      if (autoSpireOpen) {
        if (els.autobindSpiresEffect) {
          setText(els.autobindSpiresEffect, state.autobindSpires ? "The spire rises" : "Idle bind");
        }
        if (els.autobindSpiresBuy) {
          els.autobindSpiresBuy.disabled = false;
          setText(els.autobindSpiresBuy, "Autobind Spires");
          els.autobindSpiresBuy.setAttribute("aria-pressed", state.autobindSpires ? "true" : "false");
        }
      }

      var autoObeliskOpen = !!state.unlockedAutobindObelisks;
      if (els.autobindObelisksRow) {
        els.autobindObelisksRow.classList.toggle("is-hidden", !autoObeliskOpen);
        els.autobindObelisksRow.classList.toggle("is-on", autoObeliskOpen && !!state.autobindObelisks);
      }
      if (autoObeliskOpen) {
        if (els.autobindObelisksEffect) {
          setText(els.autobindObelisksEffect, state.autobindObelisks ? "The obelisk rises" : "Idle bind");
        }
        if (els.autobindObelisksBuy) {
          els.autobindObelisksBuy.disabled = false;
          setText(els.autobindObelisksBuy, "Autobind Obelisks");
          els.autobindObelisksBuy.setAttribute("aria-pressed", state.autobindObelisks ? "true" : "false");
        }
      }

      var autoChaliceOpen = !!state.unlockedAutobindChalices;
      if (els.autobindChalicesRow) {
        els.autobindChalicesRow.classList.toggle("is-hidden", !autoChaliceOpen);
        els.autobindChalicesRow.classList.toggle("is-on", autoChaliceOpen && !!state.autobindChalices);
      }
      if (autoChaliceOpen) {
        if (els.autobindChalicesEffect) {
          setText(els.autobindChalicesEffect, state.autobindChalices ? "The cup fills" : "Idle bind");
        }
        if (els.autobindChalicesBuy) {
          els.autobindChalicesBuy.disabled = false;
          setText(els.autobindChalicesBuy, "Autobind Chalices");
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
          setText(els.choirEffect, "Ash from shades " + choirPctStr + "%");
        }
        if (choirN >= CHOIR_MAX) {
          setText(els.choirCost, "\u2014");
          if (els.choirBuy) {
            els.choirBuy.disabled = true;
            setText(els.choirBuy, "The choir is full.");
          }
        } else {
          setText(els.choirCost, F.formatNumber(CHOIR_LANTERN_COST) + " Lanterns");
          if (els.choirBuy) {
            els.choirBuy.disabled = N.cmp(state.lanterns, CHOIR_LANTERN_COST) < 0;
            setText(els.choirBuy, "Raise the Choir");
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
      setText(els.markEmberEffect, "Shade souls \u00d7" + formatTimes(eMult));
      setText(els.markEmberCost, F.formatNumber(eCost) + " Ash");
      if (els.markEmberBuy) els.markEmberBuy.disabled = N.cmp(state.ash, eCost) < 0;

      if (els.markChainRow) {
        els.markChainRow.classList.toggle("is-hidden", !state.unlockedSpirits);
      }
      if (state.unlockedSpirits) {
        var chCost = markCost(state.chainLevel);
        var chMult = chainMult(state.chainLevel);
        setText(els.markChainEffect, "Spirit levy \u00d7" + formatTimes(chMult));
        setText(els.markChainCost, F.formatNumber(chCost) + " Ash");
        if (els.markChainBuy) els.markChainBuy.disabled = N.cmp(state.ash, chCost) < 0;
      }

      if (els.markHollowRow) {
        els.markHollowRow.classList.toggle("is-hidden", !state.unlockedVessels);
      }
      if (state.unlockedVessels) {
        var hlCost = markCost(state.hollowLevel);
        var hlMult = emberMult(state.hollowLevel);
        setText(els.markHollowEffect, "Vessel house \u00d7" + formatTimes(hlMult));
        setText(els.markHollowCost, F.formatNumber(hlCost) + " Ash");
        if (els.markHollowBuy) els.markHollowBuy.disabled = N.cmp(state.ash, hlCost) < 0;
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
          setText(els.aspectsSworn, "This emptying: " + (ASPECT_NAMES[sworn] || sworn) + ".");
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
          setText(els.vowsSworn, "This emptying: " + (VOW_NAMES[swornVow] || swornVow) + ".");
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
    if (gain >= 1 && !state.giftFirstTribute) tributeOffer += 1;
    if (gain >= 1) tributeOffer += vowExtraFavor(state.vow, state.vowHungerPaid);
    var tributeReady = gain >= 1;
    if (tributeReady && !_favorReadyAnnounced) {
      _favorReadyAnnounced = true;
      announce("Favor ready. Tribute available.");
    }
    if (els.tributePanel) {
      els.tributePanel.classList.toggle("is-hidden", !tributeReady);
    }
    if (els.tributeFootBtn) {
      els.tributeFootBtn.classList.toggle("is-hidden", !tributeReady);
    }
    if (tributeReady) {
      if (els.tributeFavor) {
        if (state.favor !== state.favorEarned) {
          setText(els.tributeFavor,
            F.formatNumber(state.favor) +
            " (" +
            F.formatNumber(state.favorEarned) +
            " earned)");
        } else {
          setText(els.tributeFavor, F.formatNumber(state.favor));
        }
      }
      setText(els.tributeGain, F.formatNumber(tributeOffer) + " Favor");
      setText(els.tributeMult, formatMult(
        prodMult(state.favorEarned + tributeOffer, state.seatLevel, state.edictLevel, null, state.crownWeight, state.namesComplete, cupStartsChalices(state.cupEdictLevel), state.ossuaryLevel)
      ));
    }

    var reliquaryOpen = state.favorEarned >= 1;
    if (els.reliquaryPanel) {
      els.reliquaryPanel.classList.toggle("is-hidden", !reliquaryOpen);
    }
    if (reliquaryOpen) {
      setText(els.reliquaryFavor, F.formatNumber(state.favor));
      setText(els.reliquaryEarned, F.formatNumber(state.favorEarned));

      var edCost = edictCost(state.edictLevel);
      var ePct = Math.round(25 * state.edictLevel);
      setText(els.edictEffect, "+" + ePct + "% production");
      setText(els.edictCost, F.formatNumber(edCost) + " Favor");
      if (els.edictBuy) {
        els.edictBuy.disabled = state.favor < edCost;
      }

      var mCost = memoryCost(state.memoryLevel);
      var memN = state.memoryLevel;
      if (els.memoryEffect) {
        setText(els.memoryEffect,
          "+" +
          F.formatNumber(memN) +
          (memN === 1 ? " Shade at tribute" : " Shades at tribute"));
      }
      setText(els.memoryCost, F.formatNumber(mCost) + " Favor");
      if (els.memoryBuy) {
        els.memoryBuy.disabled = state.favor < mCost;
      }

      if (state.echoLevel >= 1) {
        setText(els.echoEffect, "The Well Draws at tribute");
        setText(els.echoCost, "\u2014");
        if (els.echoBuy) {
          els.echoBuy.disabled = true;
          setText(els.echoBuy, "The well remembers.");
        }
      } else {
        var xCost = echoCost(state.echoLevel);
        setText(els.echoEffect, "The Well Draws at tribute");
        setText(els.echoCost, F.formatNumber(xCost) + " Favor");
        if (els.echoBuy) {
          els.echoBuy.disabled = !isFinite(xCost) || state.favor < xCost;
          setText(els.echoBuy, "Speak the Echo");
        }
      }

      var stCost = seatCost(state.seatLevel);
      var seatN = state.seatLevel;
      if (els.seatEffect) {
        setText(els.seatEffect,
          "+" +
          F.formatNumber(seatN) +
          (seatN === 1 ? " Throne at tribute" : " Thrones at tribute"));
      }
      setText(els.seatCost, F.formatNumber(stCost) + " Favor");
      if (els.seatBuy) {
        els.seatBuy.disabled = state.favor < stCost;
      }

      var kCost = kindleCost(state.kindleLevel);
      var kindleN = state.kindleLevel;
      if (els.kindleEffect) {
        setText(els.kindleEffect,
          "+" +
          F.formatNumber(kindleN) +
          (kindleN === 1 ? " Lantern at tribute" : " Lanterns at tribute"));
      }
      setText(els.kindleCost, F.formatNumber(kCost) + " Favor");
      if (els.kindleBuy) {
        els.kindleBuy.disabled = state.favor < kCost;
      }

      var aCost = ashenCost(state.ashenLevel);
      var ashenN = 10 * (Number(state.ashenLevel) || 0);
      if (els.ashenEffect) {
        setText(els.ashenEffect,
          "+" +
          F.formatNumber(ashenN) +
          " Ash at tribute");
      }
      setText(els.ashenCost, F.formatNumber(aCost) + " Favor");
      if (els.ashenBuy) {
        els.ashenBuy.disabled = state.favor < aCost;
      }

      var dCost = depthCost(state.depthLevel);
      var depthN = Number(state.depthLevel) || 0;
      if (els.depthEffect) {
        setText(els.depthEffect,
          "+" +
          F.formatNumber(depthN) +
          " Well Depth at tribute");
      }
      setText(els.depthCost, F.formatNumber(dCost) + " Favor");
      if (els.depthBuy) {
        els.depthBuy.disabled = state.favor < dCost;
      }

      var ceCost = choirEdictCost(state.choirEdictLevel);
      var choirEdictN = Math.min(CHOIR_MAX, Math.max(0, Math.floor(Number(state.choirEdictLevel) || 0)));
      if (els.choirEdictEffect) {
        setText(els.choirEdictEffect,
          "+" +
          F.formatNumber(choirEdictN) +
          (choirEdictN === 1 ? " Choir at tribute" : " Choir at tribute"));
      }
      setText(els.choirEdictCost, F.formatNumber(ceCost) + " Favor");
      if (els.choirEdictBuy) {
        els.choirEdictBuy.disabled = !isFinite(ceCost) || state.favor < ceCost;
      }

      var heCost = hymnEdictCost(state.hymnEdictLevel);
      var hymnEdictN = Math.max(0, Math.floor(Number(state.hymnEdictLevel) || 0));
      var hymnDur = hymnSecs(hymnEdictN);
      if (els.hymnEdictEffect) {
        setText(els.hymnEdictEffect, "Hymn " + hymnDur + "s at tribute");
      }
      setText(els.hymnEdictCost, F.formatNumber(heCost) + " Favor");
      if (els.hymnEdictBuy) {
        els.hymnEdictBuy.disabled = !isFinite(heCost) || state.favor < heCost;
      }

      var smCost = smokeEdictCost(state.smokeEdictLevel);
      if (els.smokeEffect) {
        setText(els.smokeEffect, "Autobind Censers at tribute");
      }
      setText(els.smokeCost, F.formatNumber(smCost) + " Favor");
      if (els.smokeBuy) {
        els.smokeBuy.disabled = !isFinite(smCost) || state.favor < smCost;
      }

      var emCost = embersEdictCost(state.embersEdictLevel);
      var embersN = embersStartsPyres(state.embersEdictLevel);
      if (els.embersEffect) {
        setText(els.embersEffect,
          "+" +
          F.formatNumber(embersN) +
          (embersN === 1 ? " Pyre at tribute" : " Pyres at tribute"));
      }
      setText(els.embersCost, F.formatNumber(emCost) + " Favor");
      if (els.embersBuy) {
        els.embersBuy.disabled = !isFinite(emCost) || state.favor < emCost;
      }

      var urnECost = urnEdictCost(state.urnEdictLevel);
      var urnsN = urnEdictStartsUrns(state.urnEdictLevel);
      if (els.urnEdictEffect) {
        setText(els.urnEdictEffect,
          "+" +
          F.formatNumber(urnsN) +
          (urnsN === 1 ? " Urn at tribute" : " Urns at tribute"));
      }
      setText(els.urnEdictCost, F.formatNumber(urnECost) + " Favor");
      if (els.urnEdictBuy) {
        els.urnEdictBuy.disabled = !isFinite(urnECost) || state.favor < urnECost;
      }

      var hearthECost = hearthEdictCost(state.hearthEdictLevel);
      var hearthsN = hearthEdictStartsHearths(state.hearthEdictLevel);
      if (els.hearthEdictEffect) {
        setText(els.hearthEdictEffect,
          "+" +
          F.formatNumber(hearthsN) +
          (hearthsN === 1 ? " Hearth at tribute" : " Hearths at tribute"));
      }
      setText(els.hearthEdictCost, F.formatNumber(hearthECost) + " Favor");
      if (els.hearthEdictBuy) {
        els.hearthEdictBuy.disabled = !isFinite(hearthECost) || state.favor < hearthECost;
      }

      var beaconECost = beaconEdictCost(state.beaconEdictLevel);
      var beaconsN = beaconEdictStartsBeacons(state.beaconEdictLevel);
      if (els.beaconEdictEffect) {
        setText(els.beaconEdictEffect,
          "+" +
          F.formatNumber(beaconsN) +
          (beaconsN === 1 ? " Beacon at tribute" : " Beacons at tribute"));
      }
      setText(els.beaconEdictCost, F.formatNumber(beaconECost) + " Favor");
      if (els.beaconEdictBuy) {
        els.beaconEdictBuy.disabled = !isFinite(beaconECost) || state.favor < beaconECost;
      }

      var spireECost = spireEdictCost(state.spireEdictLevel);
      var spiresN = spireEdictStartsSpires(state.spireEdictLevel);
      if (els.spireEdictEffect) {
        setText(els.spireEdictEffect,
          "+" +
          F.formatNumber(spiresN) +
          (spiresN === 1 ? " Spire at tribute" : " Spires at tribute"));
      }
      setText(els.spireEdictCost, F.formatNumber(spireECost) + " Favor");
      if (els.spireEdictBuy) {
        els.spireEdictBuy.disabled = !isFinite(spireECost) || state.favor < spireECost;
      }

      var obeliskECost = obeliskEdictCost(state.obeliskEdictLevel);
      var obelisksN = obeliskEdictStartsObelisks(state.obeliskEdictLevel);
      if (els.obeliskEdictEffect) {
        setText(els.obeliskEdictEffect,
          "+" +
          F.formatNumber(obelisksN) +
          (obelisksN === 1 ? " Obelisk at tribute" : " Obelisks at tribute"));
      }
      setText(els.obeliskEdictCost, F.formatNumber(obeliskECost) + " Favor");
      if (els.obeliskEdictBuy) {
        els.obeliskEdictBuy.disabled = !isFinite(obeliskECost) || state.favor < obeliskECost;
      }

      var cinECost = cinderEdictCost(state.cinderEdictLevel);
      if (els.cinderEdictEffect) {
        setText(els.cinderEdictEffect, "Autobind Pyres at tribute");
      }
      setText(els.cinderEdictCost, F.formatNumber(cinECost) + " Favor");
      if (els.cinderEdictBuy) {
        els.cinderEdictBuy.disabled = !isFinite(cinECost) || state.favor < cinECost;
      }

      var cutECost = cutEdictCost(state.cutEdictLevel);
      if (els.cutEdictEffect) {
        setText(els.cutEdictEffect, "Autobind Urns at tribute");
      }
      setText(els.cutEdictCost, F.formatNumber(cutECost) + " Favor");
      if (els.cutEdictBuy) {
        els.cutEdictBuy.disabled = !isFinite(cutECost) || state.favor < cutECost;
      }

      var tendingECost = tendingEdictCost(state.tendingEdictLevel);
      if (els.tendingEdictEffect) {
        setText(els.tendingEdictEffect, "Autobind Hearths at tribute");
      }
      setText(els.tendingEdictCost, F.formatNumber(tendingECost) + " Favor");
      if (els.tendingEdictBuy) {
        els.tendingEdictBuy.disabled = !isFinite(tendingECost) || state.favor < tendingECost;
      }

      var gleamECost = gleamEdictCost(state.gleamEdictLevel);
      if (els.gleamEdictEffect) {
        setText(els.gleamEdictEffect, "Autobind Beacons at tribute");
      }
      setText(els.gleamEdictCost, F.formatNumber(gleamECost) + " Favor");
      if (els.gleamEdictBuy) {
        els.gleamEdictBuy.disabled = !isFinite(gleamECost) || state.favor < gleamECost;
      }

      var riseECost = riseEdictCost(state.riseEdictLevel);
      if (els.riseEdictEffect) {
        setText(els.riseEdictEffect, "Autobind Spires at tribute");
      }
      setText(els.riseEdictCost, F.formatNumber(riseECost) + " Favor");
      if (els.riseEdictBuy) {
        els.riseEdictBuy.disabled = !isFinite(riseECost) || state.favor < riseECost;
      }

      var cupECost = cupEdictCost(state.cupEdictLevel);
      var cupN = cupStartsChalices(state.cupEdictLevel);
      if (els.cupEffect) {
        setText(els.cupEffect,
          "+" +
          F.formatNumber(cupN) +
          (cupN === 1 ? " Chalice at tribute" : " Chalices at tribute"));
      }
      setText(els.cupCost, F.formatNumber(cupECost) + " Favor");
      if (els.cupBuy) {
        els.cupBuy.disabled = !isFinite(cupECost) || state.favor < cupECost;
      }

      var drECost = draughtEdictCost(state.draughtEdictLevel);
      if (els.draughtEdictEffect) {
        setText(els.draughtEdictEffect, "Autobind Chalices at tribute");
      }
      setText(els.draughtEdictCost, F.formatNumber(drECost) + " Favor");
      if (els.draughtEdictBuy) {
        els.draughtEdictBuy.disabled = !isFinite(drECost) || state.favor < drECost;
      }

      var weCost = wakeEdictCost(state.wakeEdictLevel);
      var wakeEdictN = Math.max(0, Math.floor(Number(state.wakeEdictLevel) || 0));
      var wakeDur = wakeEdictStartsWake(wakeEdictN) ? wakeSecs(wakeEdictN) : 0;
      if (els.wakeEdictEffect) {
        setText(els.wakeEdictEffect, "Wake " + wakeDur + "s at tribute");
      }
      setText(els.wakeEdictCost, F.formatNumber(weCost) + " Favor");
      if (els.wakeEdictBuy) {
        els.wakeEdictBuy.disabled = !isFinite(weCost) || state.favor < weCost;
      }

      var peCost = processionEdictCost(state.processionEdictLevel);
      var processionEdictN = Math.max(0, Math.floor(Number(state.processionEdictLevel) || 0));
      var processionDur = processionEdictStartsProcession(processionEdictN) ? processionSecs(processionEdictN) : 0;
      if (els.processionEdictEffect) {
        setText(els.processionEdictEffect, "Procession " + processionDur + "s at tribute");
      }
      setText(els.processionEdictCost, F.formatNumber(peCost) + " Favor");
      if (els.processionEdictBuy) {
        els.processionEdictBuy.disabled = !isFinite(peCost) || state.favor < peCost;
      }

      var teCost = tollEdictCost(state.tollEdictLevel);
      var tollEdictN = Math.max(0, Math.floor(Number(state.tollEdictLevel) || 0));
      var tollDur = tollEdictStartsToll(tollEdictN) ? tollSecs(tollEdictN) : 0;
      if (els.tollEdictEffect) {
        setText(els.tollEdictEffect, "Toll " + tollDur + "s at tribute");
      }
      setText(els.tollEdictCost, F.formatNumber(teCost) + " Favor");
      if (els.tollEdictBuy) {
        els.tollEdictBuy.disabled = !isFinite(teCost) || state.favor < teCost;
      }

      var veCost = veilEdictCost(state.veilEdictLevel);
      var veilEdictN = Math.max(0, Math.floor(Number(state.veilEdictLevel) || 0));
      var veilDur = veilEdictStartsVeil(veilEdictN) ? veilSecs(veilEdictN) : 0;
      if (els.veilEdictEffect) {
        setText(els.veilEdictEffect, "Veil " + veilDur + "s at tribute");
      }
      setText(els.veilEdictCost, F.formatNumber(veCost) + " Favor");
      if (els.veilEdictBuy) {
        els.veilEdictBuy.disabled = !isFinite(veCost) || state.favor < veCost;
      }

      var keCost = knellEdictCost(state.knellEdictLevel);
      var knellEdictN = Math.max(0, Math.floor(Number(state.knellEdictLevel) || 0));
      var knellDur = knellEdictStartsKnell(knellEdictN) ? knellSecs(knellEdictN) : 0;
      if (els.knellEdictEffect) {
        setText(els.knellEdictEffect, "Knell " + knellDur + "s at tribute");
      }
      setText(els.knellEdictCost, F.formatNumber(keCost) + " Favor");
      if (els.knellEdictBuy) {
        els.knellEdictBuy.disabled = !isFinite(keCost) || state.favor < keCost;
      }

      var neCost = nightEdictCost(state.nightEdictLevel);
      var nightEdictN = Math.max(0, Math.floor(Number(state.nightEdictLevel) || 0));
      var nightDur = nightEdictStartsNight(nightEdictN) ? nightEdictSecs(nightEdictN) : 0;
      if (els.nightEdictEffect) {
        setText(els.nightEdictEffect, "Night " + nightDur + "s at tribute");
      }
      setText(els.nightEdictCost, F.formatNumber(neCost) + " Favor");
      if (els.nightEdictBuy) {
        els.nightEdictBuy.disabled = !isFinite(neCost) || state.favor < neCost;
      }
    }

    var crownOpen = crownUnlocked();
    if (els.crownPanel) {
      els.crownPanel.classList.toggle("is-hidden", !crownOpen);
    }
    if (crownOpen) {
      setText(els.crownFavor, F.formatNumber(state.favor));

      var cwCost = crownCost(state.crownWeight);
      var cwPct = Math.round(10 * (Number(state.crownWeight) || 0));
      setText(els.crownWeightEffect, "+" + cwPct + "% production");
      setText(els.crownWeightCost, F.formatNumber(cwCost) + " Favor");
      if (els.crownWeightBuy) {
        els.crownWeightBuy.disabled = state.favor < cwCost;
      }

      var lmCost = longMemCost(state.longMemoryLevel);
      var lmN = Number(state.longMemoryLevel) || 0;
      if (els.crownMemoryEffect) {
        setText(els.crownMemoryEffect,
          "+" +
          F.formatNumber(lmN) +
          (lmN === 1 ? " Fetter at tribute" : " Fetters at tribute"));
      }
      setText(els.crownMemoryCost, F.formatNumber(lmCost) + " Favor");
      if (els.crownMemoryBuy) {
        els.crownMemoryBuy.disabled = state.favor < lmCost;
      }

      var qcCost = quietCourtCost(state.quietCourtLevel);
      var qcN = Number(state.quietCourtLevel) || 0;
      if (els.crownCourtEffect) {
        setText(els.crownCourtEffect,
          quietCourtStartsUrnAutobind(qcN)
            ? "Autobind Shades, Lanterns, Fetters, Pyres, Chalices, Urns, Hearths, Beacons, Spires, and Obelisks at tribute"
            : "Autobind Shades, Lanterns, Fetters, Pyres, Chalices, Urns, Hearths, Beacons, Spires, and Obelisks at tribute");
      }
      setText(els.crownCourtCost, F.formatNumber(qcCost) + " Favor");
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
        setText(els.crownRemembranceCount, F.formatNumber(Number(state.remembrance) || 0));
      }
      if (els.remembranceLayRow) els.remembranceLayRow.classList.toggle("is-hidden", !remOpen);
      if (els.deeperNightRow) els.deeperNightRow.classList.toggle("is-hidden", !remOpen);
      if (els.ashenTideRow) els.ashenTideRow.classList.toggle("is-hidden", !remOpen);
      if (els.ossuaryRow) els.ossuaryRow.classList.toggle("is-hidden", !remOpen);
      if (els.processionRow) els.processionRow.classList.toggle("is-hidden", !remOpen);
      if (els.knellRow) els.knellRow.classList.toggle("is-hidden", !remOpen && !((Number(state.knellLeft) || 0) > 0));
      if (els.longerProcessionRow) els.longerProcessionRow.classList.toggle("is-hidden", !remOpen);
      if (els.deeperTollRow) els.deeperTollRow.classList.toggle("is-hidden", !remOpen);
      if (els.longerWakeRow) els.longerWakeRow.classList.toggle("is-hidden", !remOpen);
      if (els.longerTitheRow) els.longerTitheRow.classList.toggle("is-hidden", !remOpen);
      if (els.longerVeilRow) els.longerVeilRow.classList.toggle("is-hidden", !remOpen);
      if (els.longerHymnRow) els.longerHymnRow.classList.toggle("is-hidden", !remOpen);
      if (els.longerKnellRow) els.longerKnellRow.classList.toggle("is-hidden", !remOpen);
      if (remOpen) {
        var rCost = remembranceFavorCost();
        setText(els.remembranceLayCost, F.formatNumber(rCost) + " Favor");
        if (els.remembranceLayBuy) {
          els.remembranceLayBuy.disabled = state.favor < rCost;
        }

        var dnCost = deeperNightCost(state.deeperNightLevel);
        var dnSecs = nightSecs(state.deeperNightLevel);
        if (els.deeperNightEffect) {
          setText(els.deeperNightEffect, "Night's Tithe " + dnSecs + "s");
        }
        setText(els.deeperNightCost, F.formatNumber(dnCost) + " Remembrance");
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
          setText(els.ashenTideEffect, "Ash from shades " + atPctStr + "%");
        }
        if (atLevel >= ASHEN_TIDE_MAX) {
          setText(els.ashenTideCost, "\u2014");
          if (els.ashenTideBuy) {
            els.ashenTideBuy.disabled = true;
            setText(els.ashenTideBuy, "The tide is full.");
          }
        } else {
          setText(els.ashenTideCost, F.formatNumber(atCost) + " Remembrance");
          if (els.ashenTideBuy) {
            els.ashenTideBuy.disabled = !isFinite(atCost) || (Number(state.remembrance) || 0) < atCost;
            setText(els.ashenTideBuy, "Raise the Tide");
          }
        }

        var ossLevel = Math.max(0, Math.min(OSSUARY_MAX, Math.floor(Number(state.ossuaryLevel) || 0)));
        var ossPct = Math.round(5 * ossLevel);
        var ossCost = ossuaryCost(ossLevel);
        if (els.ossuaryEffect) {
          setText(els.ossuaryEffect, "+" + ossPct + "% production");
        }
        if (ossLevel >= OSSUARY_MAX) {
          setText(els.ossuaryCost, "\u2014");
          if (els.ossuaryBuy) {
            els.ossuaryBuy.disabled = true;
            setText(els.ossuaryBuy, "The ossuary is full.");
          }
        } else {
          setText(els.ossuaryCost, F.formatNumber(ossCost) + " Remembrance");
          if (els.ossuaryBuy) {
            els.ossuaryBuy.disabled = !isFinite(ossCost) || (Number(state.remembrance) || 0) < ossCost;
            setText(els.ossuaryBuy, "Lay the Bone");
          }
        }

        var pLeft = Number(state.processionLeft) || 0;
        var pOn = processionActive();
        var paidSecs = paidProcessionSecs(state.longerProcessionLevel);
        if (els.processionRow) els.processionRow.classList.toggle("is-burning", pOn);
        if (els.processionEffect) {
          setText(els.processionEffect, pOn ? "\u00d71.2 production" : "\u00d71.2 production \u00b7 " + paidSecs + "s");
        }
        if (els.processionCost) {
          setText(els.processionCost, F.formatNumber(PROCESSION_COST) + " Remembrance");
        }
        if (els.processionBuy) {
          if (pOn) {
            els.processionBuy.disabled = true;
            setText(els.processionBuy, "They walk \u2014 " + Math.ceil(pLeft) + "s");
          } else {
            els.processionBuy.disabled = (Number(state.remembrance) || 0) < PROCESSION_COST;
            setText(els.processionBuy, "Begin the Procession");
          }
        }

        var kLeft = Number(state.knellLeft) || 0;
        var kOn = knellActive();
        if (els.knellRow) els.knellRow.classList.toggle("is-burning", kOn);
        if (els.knellEffect) {
          setText(els.knellEffect, kOn ? "Burst \u00d72" : "Burst \u00d72 \u00b7 " + paidKnellSecs(state.longerKnellLevel) + "s");
        }
        if (els.knellCost) {
          setText(els.knellCost, F.formatNumber(KNELL_COST) + " Remembrance");
        }
        if (els.knellBuy) {
          if (kOn) {
            els.knellBuy.disabled = true;
            setText(els.knellBuy, "The knell sounds \u2014 " + Math.ceil(kLeft) + "s");
          } else {
            els.knellBuy.disabled = (Number(state.remembrance) || 0) < KNELL_COST;
            setText(els.knellBuy, "Sound the Knell");
          }
        }

        var lpLevel = Math.max(0, Math.min(LONGER_PROCESSION_MAX, Math.floor(Number(state.longerProcessionLevel) || 0)));
        var lpCost = longerProcessionCost(lpLevel);
        var lpSecs = paidProcessionSecs(lpLevel);
        if (els.longerProcessionEffect) {
          setText(els.longerProcessionEffect, "Procession " + lpSecs + "s");
        }
        if (lpLevel >= LONGER_PROCESSION_MAX) {
          setText(els.longerProcessionCost, "\u2014");
          if (els.longerProcessionBuy) {
            els.longerProcessionBuy.disabled = true;
            setText(els.longerProcessionBuy, "The hall is longest.");
          }
        } else {
          setText(els.longerProcessionCost, F.formatNumber(lpCost) + " Remembrance");
          if (els.longerProcessionBuy) {
            els.longerProcessionBuy.disabled = !isFinite(lpCost) || (Number(state.remembrance) || 0) < lpCost;
            setText(els.longerProcessionBuy, "Lengthen the Walk");
          }
        }

        var dtLevel = Math.max(0, Math.min(DEEPER_TOLL_MAX, Math.floor(Number(state.deeperTollLevel) || 0)));
        var dtCost = deeperTollCost(dtLevel);
        var dtSecs = paidTollSecs(dtLevel);
        if (els.deeperTollEffect) {
          setText(els.deeperTollEffect, "Toll " + dtSecs + "s");
        }
        if (dtLevel >= DEEPER_TOLL_MAX) {
          setText(els.deeperTollCost, "\u2014");
          if (els.deeperTollBuy) {
            els.deeperTollBuy.disabled = true;
            setText(els.deeperTollBuy, "The answer lingers longest.");
          }
        } else {
          setText(els.deeperTollCost, F.formatNumber(dtCost) + " Remembrance");
          if (els.deeperTollBuy) {
            els.deeperTollBuy.disabled = !isFinite(dtCost) || (Number(state.remembrance) || 0) < dtCost;
            setText(els.deeperTollBuy, "Lengthen the Toll");
          }
        }

        var lwLevel = Math.max(0, Math.min(LONGER_WAKE_MAX, Math.floor(Number(state.longerWakeLevel) || 0)));
        var lwCost = longerWakeCost(lwLevel);
        var lwSecs = paidWakeSecs(lwLevel);
        if (els.longerWakeEffect) {
          setText(els.longerWakeEffect, "Wake " + lwSecs + "s");
        }
        if (lwLevel >= LONGER_WAKE_MAX) {
          setText(els.longerWakeCost, "\u2014");
          if (els.longerWakeBuy) {
            els.longerWakeBuy.disabled = true;
            setText(els.longerWakeBuy, "The fire lingers longest.");
          }
        } else {
          setText(els.longerWakeCost, F.formatNumber(lwCost) + " Remembrance");
          if (els.longerWakeBuy) {
            els.longerWakeBuy.disabled = !isFinite(lwCost) || (Number(state.remembrance) || 0) < lwCost;
            setText(els.longerWakeBuy, "Lengthen the Wake");
          }
        }

        var ltLevel = Math.max(0, Math.min(LONGER_TITHE_MAX, Math.floor(Number(state.longerTitheLevel) || 0)));
        var ltCost = longerTitheCost(ltLevel);
        var ltSecs = paidTitheSecs(ltLevel);
        if (els.longerTitheEffect) {
          setText(els.longerTitheEffect, "Tithe " + ltSecs + "s");
        }
        if (ltLevel >= LONGER_TITHE_MAX) {
          setText(els.longerTitheCost, "\u2014");
          if (els.longerTitheBuy) {
            els.longerTitheBuy.disabled = true;
            setText(els.longerTitheBuy, "The cut lingers longest.");
          }
        } else {
          setText(els.longerTitheCost, F.formatNumber(ltCost) + " Remembrance");
          if (els.longerTitheBuy) {
            els.longerTitheBuy.disabled = !isFinite(ltCost) || (Number(state.remembrance) || 0) < ltCost;
            setText(els.longerTitheBuy, "Lengthen the Tithe");
          }
        }

        var lvLevel = Math.max(0, Math.min(LONGER_VEIL_MAX, Math.floor(Number(state.longerVeilLevel) || 0)));
        var lvCost = longerVeilCost(lvLevel);
        var lvSecs = paidVeilSecs(lvLevel);
        if (els.longerVeilEffect) {
          setText(els.longerVeilEffect, "Veil " + lvSecs + "s");
        }
        if (lvLevel >= LONGER_VEIL_MAX) {
          setText(els.longerVeilCost, "\u2014");
          if (els.longerVeilBuy) {
            els.longerVeilBuy.disabled = true;
            setText(els.longerVeilBuy, "The mouth stays nearest.");
          }
        } else {
          setText(els.longerVeilCost, F.formatNumber(lvCost) + " Remembrance");
          if (els.longerVeilBuy) {
            els.longerVeilBuy.disabled = !isFinite(lvCost) || (Number(state.remembrance) || 0) < lvCost;
            setText(els.longerVeilBuy, "Lengthen the Veil");
          }
        }

        var lhLevel = Math.max(0, Math.min(LONGER_HYMN_MAX, Math.floor(Number(state.longerHymnLevel) || 0)));
        var lhCost = longerHymnCost(lhLevel);
        var lhBonus = hymnBonusSecs(lhLevel);
        if (els.longerHymnEffect) {
          setText(els.longerHymnEffect, "Hymn +" + lhBonus + "s");
        }
        if (lhLevel >= LONGER_HYMN_MAX) {
          setText(els.longerHymnCost, "\u2014");
          if (els.longerHymnBuy) {
            els.longerHymnBuy.disabled = true;
            setText(els.longerHymnBuy, "The song lingers longest.");
          }
        } else {
          setText(els.longerHymnCost, F.formatNumber(lhCost) + " Remembrance");
          if (els.longerHymnBuy) {
            els.longerHymnBuy.disabled = !isFinite(lhCost) || (Number(state.remembrance) || 0) < lhCost;
            setText(els.longerHymnBuy, "Lengthen the Hymn");
          }
        }

        var lkLevel = Math.max(0, Math.min(LONGER_KNELL_MAX, Math.floor(Number(state.longerKnellLevel) || 0)));
        var lkCost = longerKnellCost(lkLevel);
        var lkSecs = paidKnellSecs(lkLevel);
        if (els.longerKnellEffect) {
          setText(els.longerKnellEffect, "Knell " + lkSecs + "s");
        }
        if (lkLevel >= LONGER_KNELL_MAX) {
          setText(els.longerKnellCost, "\u2014");
          if (els.longerKnellBuy) {
            els.longerKnellBuy.disabled = true;
            setText(els.longerKnellBuy, "The second answer lingers longest.");
          }
        } else {
          setText(els.longerKnellCost, F.formatNumber(lkCost) + " Remembrance");
          if (els.longerKnellBuy) {
            els.longerKnellBuy.disabled = !isFinite(lkCost) || (Number(state.remembrance) || 0) < lkCost;
            setText(els.longerKnellBuy, "Lengthen the Knell");
          }
        }
      }
    }

    renderNames();

    if (els.nextGoal) {
      setText(els.nextGoal, nextGoal(state));
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

  function hotSoulsUpdate() {
    if (!els.soulsCount) return;
    var F = SoulgatherFormat;
    setText(els.soulsCount, F.formatNumber(state.souls));
    setText(els.soulsRate, F.formatRate(soulsPerSec()));
  }

  function tick(now) {
    if (!lastFrame) lastFrame = now;
    var dt = (now - lastFrame) / 1000;
    lastFrame = now;
    applyDt(dt, true);
    hotSoulsUpdate();
    if (_dirty && now - _lastRenderTime >= RENDER_MS) {
      _dirty = false;
      _lastRenderTime = now;
      render();
    }
    window.requestAnimationFrame(tick);
  }


  function hotkeyDefaultGuard(ctx) {
    return !ctx.otherButton;
  }

  /** Table-driven hotkeys (AZR-172). Shared default guard is !otherButton. */
  var HOTKEYS = [
    {
      keys: ["1"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        ctx.ev.preventDefault();
        setBuyMode("1");
      }
    },
    {
      keys: ["2"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        ctx.ev.preventDefault();
        setBuyMode("10");
      }
    },
    {
      keys: ["3"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        ctx.ev.preventDefault();
        setBuyMode("max");
      }
    },
    {
      keys: ["t"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        if (state.unlockedWell && !titheActive() && N.cmp(state.souls, currentTitheCost()) >= 0) {
          ctx.ev.preventDefault();
          payTithe();
        }
      }
    },
    {
      keys: ["n"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        if (normalizeVow(state.vow) === "ember") return;
        if (state.unlockedNightTithe && !nightActive() && N.cmp(state.ash, NIGHT_TITHE_MIN) >= 0) {
          ctx.ev.preventDefault();
          payNightTithe();
        }
      }
    },
    {
      keys: ["w"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        if (normalizeVow(state.vow) === "ember") return;
        if (state.unlockedWake && !wakeActive() && N.cmp(state.ash, N.fromNumber(WAKE_COST)) >= 0) {
          ctx.ev.preventDefault();
          keepWake();
        }
      }
    },
    {
      keys: ["v"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        if (state.unlockedVeil && !veilActive() && N.cmp(state.ash, VEIL_MIN) >= 0) {
          ctx.ev.preventDefault();
          thinVeil();
        }
      }
    },
    {
      keys: ["g"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        if (state.unlockedToll && !tollActive() && N.cmp(state.souls, N.fromNumber(TOLL_COST)) >= 0) {
          ctx.ev.preventDefault();
          soundToll();
        }
      }
    },
    {
      keys: ["c"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        var cHotCost = cinderCost(state.cinderLevel);
        if (state.unlockedPyres && N.cmp(state.ash, cHotCost) >= 0) {
          ctx.ev.preventDefault();
          buyCinders();
        }
      }
    },
    {
      keys: ["u"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        var uHotCost = urnRiteCost(state.urnRiteLevel);
        if (state.unlockedUrns && N.cmp(state.ash, uHotCost) >= 0) {
          ctx.ev.preventDefault();
          buyUrnRite();
        }
      }
    },
    {
      keys: ["h"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        var hHotCost = hearthRiteCost(state.hearthRiteLevel);
        if (state.unlockedHearths && N.cmp(state.ash, hHotCost) >= 0) {
          ctx.ev.preventDefault();
          buyHearthRite();
        }
      }
    },
    {
      keys: ["l"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        var bHotCost = beaconRiteCost(state.beaconRiteLevel);
        if (state.unlockedBeacons && N.cmp(state.ash, bHotCost) >= 0) {
          ctx.ev.preventDefault();
          buyBeaconRite();
        }
      }
    },
    {
      keys: ["s"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        var sHotCost = spireRiteCost(state.spireRiteLevel);
        if (state.unlockedSpires && N.cmp(state.ash, sHotCost) >= 0) {
          ctx.ev.preventDefault();
          buySpireRite();
        }
      }
    },
    {
      keys: ["b"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        if (
          remembranceUnlocked() &&
          (Number(state.ossuaryLevel) || 0) < OSSUARY_MAX &&
          (Number(state.remembrance) || 0) >= OSSUARY_COST
        ) {
          ctx.ev.preventDefault();
          buyOssuary();
        }
      }
    },
    {
      keys: ["p"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        if (
          remembranceUnlocked() &&
          !processionActive() &&
          (Number(state.remembrance) || 0) >= PROCESSION_COST
        ) {
          ctx.ev.preventDefault();
          beginProcession();
        }
      }
    },
    {
      keys: ["k"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        if (
          remembranceUnlocked() &&
          !knellActive() &&
          (Number(state.remembrance) || 0) >= KNELL_COST
        ) {
          ctx.ev.preventDefault();
          soundKnell();
        }
      }
    }
  ];

  /** Pure: return matching HOTKEYS entry when key+guard pass; else null (AZR-172). */
  function resolveHotkey(key, ctx) {
    var k = String(key == null ? "" : key).toLowerCase();
    var i;
    for (i = 0; i < HOTKEYS.length; i++) {
      var hk = HOTKEYS[i];
      if (hk.keys.indexOf(k) < 0) continue;
      var guard = hk.guard || hotkeyDefaultGuard;
      if (!guard(ctx || {})) return null;
      return hk;
    }
    return null;
  }

  function bind() {
    els.soulsCount = document.getElementById("souls-count");
    els.soulsRate = document.getElementById("souls-rate");
    els.hollowStatus = document.getElementById("hollow-status");
    els.vowStatus = document.getElementById("vow-status");
    els.soulsAsh = document.getElementById("souls-ash");
    els.soulsFavor = document.getElementById("souls-favor");
    els.soulsHymn = document.getElementById("souls-hymn");
    els.soulsWake = document.getElementById("souls-wake");
    els.soulsKnell = document.getElementById("souls-knell");
    els.gatherBtn = document.getElementById("gather-btn");
    els.gatherVerb = els.gatherBtn ? els.gatherBtn.querySelector(".verb") : null;
    els.gatherNoun = els.gatherBtn ? els.gatherBtn.querySelector(".noun") : null;
    els.buyMode = document.getElementById("buy-mode");
    els.buyModeHint = document.getElementById("buy-mode-hint");
    els.buyModeHintDismiss = document.getElementById("buy-mode-hint-dismiss");
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
    els.beaconCard = document.getElementById("beacon-card");
    els.beaconOwned = document.getElementById("beacon-owned");
    els.beaconProd = document.getElementById("beacon-prod");
    els.beaconCost = document.getElementById("beacon-cost");
    els.beaconBuy = document.getElementById("beacon-buy");
    els.spireCard = document.getElementById("spire-card");
    els.spireOwned = document.getElementById("spire-owned");
    els.spireProd = document.getElementById("spire-prod");
    els.spireCost = document.getElementById("spire-cost");
    els.spireBuy = document.getElementById("spire-buy");
    els.obeliskCard = document.getElementById("obelisk-card");
    els.obeliskOwned = document.getElementById("obelisk-owned");
    els.obeliskProd = document.getElementById("obelisk-prod");
    els.obeliskCost = document.getElementById("obelisk-cost");
    els.obeliskBuy = document.getElementById("obelisk-buy");
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
    els.beaconEdictEffect = document.getElementById("beacon-edict-effect");
    els.beaconEdictCost = document.getElementById("beacon-edict-cost");
    els.beaconEdictBuy = document.getElementById("beacon-edict-buy");
    els.spireEdictEffect = document.getElementById("spire-edict-effect");
    els.spireEdictCost = document.getElementById("spire-edict-cost");
    els.spireEdictBuy = document.getElementById("spire-edict-buy");
    els.obeliskEdictEffect = document.getElementById("obelisk-edict-effect");
    els.obeliskEdictCost = document.getElementById("obelisk-edict-cost");
    els.obeliskEdictBuy = document.getElementById("obelisk-edict-buy");
    els.cinderEdictEffect = document.getElementById("cinder-edict-effect");
    els.cinderEdictCost = document.getElementById("cinder-edict-cost");
    els.cinderEdictBuy = document.getElementById("cinder-edict-buy");
    els.cutEdictEffect = document.getElementById("cut-edict-effect");
    els.cutEdictCost = document.getElementById("cut-edict-cost");
    els.cutEdictBuy = document.getElementById("cut-edict-buy");
    els.tendingEdictEffect = document.getElementById("tending-edict-effect");
    els.tendingEdictCost = document.getElementById("tending-edict-cost");
    els.tendingEdictBuy = document.getElementById("tending-edict-buy");
    els.gleamEdictEffect = document.getElementById("gleam-edict-effect");
    els.gleamEdictCost = document.getElementById("gleam-edict-cost");
    els.gleamEdictBuy = document.getElementById("gleam-edict-buy");
    els.riseEdictEffect = document.getElementById("rise-edict-effect");
    els.riseEdictCost = document.getElementById("rise-edict-cost");
    els.riseEdictBuy = document.getElementById("rise-edict-buy");
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
    els.knellEdictEffect = document.getElementById("knell-edict-effect");
    els.knellEdictCost = document.getElementById("knell-edict-cost");
    els.knellEdictBuy = document.getElementById("knell-edict-buy");
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
    els.bindingTollRow = document.getElementById("binding-toll-row");
    els.bindingTollEffect = document.getElementById("binding-toll-effect");
    els.bindingTollCost = document.getElementById("binding-toll-cost");
    els.bindingTollBuy = document.getElementById("binding-toll-buy");
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
    els.beaconRiteRow = document.getElementById("beacon-rite-row");
    els.beaconRiteEffect = document.getElementById("beacon-rite-effect");
    els.beaconRiteCost = document.getElementById("beacon-rite-cost");
    els.beaconRiteBuy = document.getElementById("beacon-rite-buy");
    els.spireRiteRow = document.getElementById("spire-rite-row");
    els.spireRiteEffect = document.getElementById("spire-rite-effect");
    els.spireRiteCost = document.getElementById("spire-rite-cost");
    els.spireRiteBuy = document.getElementById("spire-rite-buy");
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
    els.autobindBeaconsRow = document.getElementById("autobind-beacons-row");
    els.autobindBeaconsEffect = document.getElementById("autobind-beacons-effect");
    els.autobindBeaconsBuy = document.getElementById("autobind-beacons-buy");
    els.autobindSpiresRow = document.getElementById("autobind-spires-row");
    els.autobindSpiresEffect = document.getElementById("autobind-spires-effect");
    els.autobindSpiresBuy = document.getElementById("autobind-spires-buy");
    els.autobindObelisksRow = document.getElementById("autobind-obelisks-row");
    els.autobindObelisksEffect = document.getElementById("autobind-obelisks-effect");
    els.autobindObelisksBuy = document.getElementById("autobind-obelisks-buy");
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
    els.knellRow = document.getElementById("knell-row");
    els.knellEffect = document.getElementById("knell-effect");
    els.knellCost = document.getElementById("knell-cost");
    els.knellBuy = document.getElementById("knell-buy");
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
    els.longerKnellRow = document.getElementById("longer-knell-row");
    els.longerKnellEffect = document.getElementById("longer-knell-effect");
    els.longerKnellCost = document.getElementById("longer-knell-cost");
    els.longerKnellBuy = document.getElementById("longer-knell-buy");
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
    if (els.toast) {
      els.toast.addEventListener("click", function () {
        dismissToastNext();
      });
    }
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
    if (els.beaconBuy) els.beaconBuy.addEventListener("click", buyBeacon);
    if (els.spireBuy) els.spireBuy.addEventListener("click", buySpire);
    if (els.obeliskBuy) els.obeliskBuy.addEventListener("click", buyObelisk);
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
    if (els.beaconEdictBuy) els.beaconEdictBuy.addEventListener("click", buyBeaconEdict);
    if (els.spireEdictBuy) els.spireEdictBuy.addEventListener("click", buySpireEdict);
    if (els.obeliskEdictBuy) els.obeliskEdictBuy.addEventListener("click", buyObeliskEdict);
    if (els.cinderEdictBuy) els.cinderEdictBuy.addEventListener("click", buyCinderEdict);
    if (els.cutEdictBuy) els.cutEdictBuy.addEventListener("click", buyCutEdict);
    if (els.tendingEdictBuy) els.tendingEdictBuy.addEventListener("click", buyTendingEdict);
    if (els.gleamEdictBuy) els.gleamEdictBuy.addEventListener("click", buyGleamEdict);
    if (els.riseEdictBuy) els.riseEdictBuy.addEventListener("click", buyRiseEdict);
    if (els.cupBuy) els.cupBuy.addEventListener("click", buyCupEdict);
    if (els.draughtEdictBuy) els.draughtEdictBuy.addEventListener("click", buyDraughtEdict);
    if (els.wakeEdictBuy) els.wakeEdictBuy.addEventListener("click", buyWakeEdict);
    if (els.processionEdictBuy) els.processionEdictBuy.addEventListener("click", buyProcessionEdict);
    if (els.tollEdictBuy) els.tollEdictBuy.addEventListener("click", buyTollEdict);
    if (els.veilEdictBuy) els.veilEdictBuy.addEventListener("click", buyVeilEdict);
    if (els.knellEdictBuy) els.knellEdictBuy.addEventListener("click", buyKnellEdict);
    if (els.nightEdictBuy) els.nightEdictBuy.addEventListener("click", buyNightEdict);
    if (els.siphonBuy) els.siphonBuy.addEventListener("click", buySiphon);
    if (els.levyBuy) els.levyBuy.addEventListener("click", buyLevy);
    if (els.bindingTollBuy) els.bindingTollBuy.addEventListener("click", buyBindingToll);
    if (els.cinderBuy) els.cinderBuy.addEventListener("click", buyCinders);
    if (els.urnRiteBuy) els.urnRiteBuy.addEventListener("click", buyUrnRite);
    if (els.hearthRiteBuy) els.hearthRiteBuy.addEventListener("click", buyHearthRite);
    if (els.beaconRiteBuy) els.beaconRiteBuy.addEventListener("click", buyBeaconRite);
    if (els.spireRiteBuy) els.spireRiteBuy.addEventListener("click", buySpireRite);
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
    if (els.autobindBeaconsBuy) els.autobindBeaconsBuy.addEventListener("click", toggleAutobindBeacons);
    if (els.autobindSpiresBuy) els.autobindSpiresBuy.addEventListener("click", toggleAutobindSpires);
    if (els.autobindObelisksBuy) els.autobindObelisksBuy.addEventListener("click", toggleAutobindObelisks);
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
    if (els.knellBuy) els.knellBuy.addEventListener("click", soundKnell);
    if (els.longerProcessionBuy) els.longerProcessionBuy.addEventListener("click", buyLongerProcession);
    if (els.deeperTollBuy) els.deeperTollBuy.addEventListener("click", buyDeeperToll);
    if (els.longerWakeBuy) els.longerWakeBuy.addEventListener("click", buyLongerWake);
    if (els.longerTitheBuy) els.longerTitheBuy.addEventListener("click", buyLongerTithe);
    if (els.longerVeilBuy) els.longerVeilBuy.addEventListener("click", buyLongerVeil);
    if (els.longerHymnBuy) els.longerHymnBuy.addEventListener("click", buyLongerHymn);
    if (els.longerKnellBuy) els.longerKnellBuy.addEventListener("click", buyLongerKnell);
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

    loadReduceMotion();
    els.reduceMotionToggle = document.getElementById("reduced-motion-toggle");
    if (els.reduceMotionToggle) {
      els.reduceMotionToggle.checked = _reduceMotion;
      els.reduceMotionToggle.addEventListener("change", function () {
        setReduceMotion(els.reduceMotionToggle.checked);
      });
    }

    els.loadFailNotice = document.getElementById("load-fail-notice");
    els.loadFailRaw = document.getElementById("load-fail-raw");
    els.loadFailExport = document.getElementById("load-fail-export");
    els.loadFailRestore = document.getElementById("load-fail-restore");
    els.loadFailFresh = document.getElementById("load-fail-fresh");
    if (els.loadFailExport) els.loadFailExport.addEventListener("click", exportRawFailedMemory);
    if (els.loadFailRestore) els.loadFailRestore.addEventListener("click", restoreLoadBackup);
    if (els.loadFailFresh) els.loadFailFresh.addEventListener("click", startFreshAfterLoadFail);

    if (els.buyMode) {
      els.buyMode.addEventListener("click", function (ev) {
        var t = ev.target;
        if (!t || !t.getAttribute) return;
        var mode = t.getAttribute("data-mode");
        if (mode) setBuyMode(mode);
      });
    }
    if (els.buyModeHintDismiss) {
      els.buyModeHintDismiss.addEventListener("click", function (ev) {
        ev.preventDefault();
        dismissBuyModeHint();
      });
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        // AZR-163 settle first, then AZR-164 heartbeat from now (no double-credit).
        settleToNow();
        markSaveDirty();
        flushSave();
        startHiddenHeartbeat();
      } else {
        clearHiddenHeartbeat();
        var until = Number(state.simulatedUntil) || Date.now();
        var gap = (Date.now() - until) / 1000;
        var soulsBefore = N.clone(state.souls);
        var ashBefore = N.clone(state.ash);
        var shadesBefore = N.clone(state.shades);
        settleToNow();
        lastFrame = 0;
        var soulsGained = N.sub(state.souls, soulsBefore);
        var ashGained = N.sub(state.ash, ashBefore);
        var shadesGained = N.sub(state.shades, shadesBefore);
        var awayMsg = maybeAwayToast(gap, soulsGained, ashGained, shadesGained);
        if (awayMsg) showToast(awayMsg);
      }
    });

    window.addEventListener("pagehide", function () {
      clearHiddenHeartbeat();
      settleToNow();
      markSaveDirty();
      flushSave();
    });

    window.addEventListener("unload", function () {
      clearHiddenHeartbeat();
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      var target = ev.target;
      var active = document.activeElement || target;
      if (isTypingTarget(target) || isTypingTarget(active)) return;

      var keyEarly = String(ev.key || "").toLowerCase();
      if (keyEarly === "escape") {
        if (toastActive || toastQueue.length) {
          ev.preventDefault();
          dismissToastEscape();
        }
        return;
      }

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
      var key = String(ev.key || "").toLowerCase();
      var ctx = {
        ev: ev,
        otherButton: otherButton,
        isGather: isGather,
        buttonEl: buttonEl,
        tag: tag
      };

      var hi;
      for (hi = 0; hi < HOTKEYS.length; hi++) {
        var entry = HOTKEYS[hi];
        if (entry.keys.indexOf(key) < 0) continue;
        var guard = entry.guard || hotkeyDefaultGuard;
        if (!guard(ctx)) return;
        entry.action(ctx);
        return;
      }

      if (key === " " || key === "enter") {
        if (tag === "summary" || tag === "a" || tag === "details") return;
        if (buttonEl && !isGather) return;
        if (isGather && key === "enter") return;
        if (key === " ") ev.preventDefault();
        if ((els.gatherBtn && els.gatherBtn.disabled) || normalizeVow(state.vow) === "stillness") return;
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
    revealUnlockedCards(false);
    render();
    if (pendingAwayToast) {
      toastQueue.unshift(pendingAwayToast);
      pendingAwayToast = null;
      if (toastQueue.length > TOAST_QUEUE_MAX) {
        var awayExtra = toastQueue.length - TOAST_QUEUE_MAX;
        toastQueue.length = TOAST_QUEUE_MAX;
        var awayLast = toastQueue[TOAST_QUEUE_MAX - 1];
        var awayPrev = toastOverflowCount(awayLast);
        toastQueue[TOAST_QUEUE_MAX - 1] = toastOverflowLabel(
          awayPrev > 0 ? awayPrev + awayExtra : awayExtra + 1
        );
      }
    }
    toastHold = false;
    if (!toastActive && toastQueue.length) {
      presentToast(toastQueue.shift());
    }
    window.setInterval(flushSave, AUTOSAVE_MS);
    window.requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

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
  _eco.bulkCost = bulkCost;
  _eco.bulkCostLoop = bulkCostLoop;
  _eco.maxAffordable = maxAffordable;
  _eco.maxAffordableLoop = maxAffordableLoop;
  _eco.wellMaxAffordable = wellMaxAffordable;
  _eco.wellMaxAffordableLoop = wellMaxAffordableLoop;
  _eco.wellBulkCost = wellBulkCost;
  _eco.wellBulkCostLoop = wellBulkCostLoop;
  _eco.setText = setText;
  _eco.setTextWriteCount = function () { return setTextWriteCount; };
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
  _eco.hotkeyDefaultGuard = hotkeyDefaultGuard;
  _eco.HOTKEYS = HOTKEYS;
  _eco.resolveHotkey = resolveHotkey;
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
  _eco._getAnnounceQueue = function () { return _announceQueue; };
  _eco._getAnnounceLastMs = function () { return _announceLastMs; };
  _eco._resetAnnouncer = function () { _announceLastMs = 0; _announceQueue = []; if (_announceTimer) { clearTimeout(_announceTimer); _announceTimer = null; } };
  _eco.spawnRipple = spawnRipple;
})();
