(function (global) {
  "use strict";

  // Progression (AZR-194): unlock checks, the Chronicle, milestone gifts, bound names and peak tracking.
  // Game logic, so it writes state (through host.getState()); page effects such as toasts and card
  // reveals come in through the host from ui.js.
  var N = global.SoulgatherNum;
  var C = global.SoulgatherConfig;
  var E = global.SoulgatherEconomy;
  var S = global.SoulgatherState;

  var BOUND_NAMES = C.BOUND_NAMES;
  var CHRONICLE_LINES = C.CHRONICLE_LINES;
  var GIFT_STAT_KEYS = C.GIFT_STAT_KEYS;
  var GIFTS = C.GIFTS;
  var GIFTS_BY_STAT = C.GIFTS_BY_STAT;
  var normalizeAspect = C.normalizeAspect;
  var normalizeVow = C.normalizeVow;
  var PEAK_STATS = C.PEAK_STATS;
  var UNLOCK_AUTOBIND_BEACONS = C.UNLOCK_AUTOBIND_BEACONS;
  var UNLOCK_AUTOBIND_CENSERS = C.UNLOCK_AUTOBIND_CENSERS;
  var UNLOCK_AUTOBIND_CHALICES = C.UNLOCK_AUTOBIND_CHALICES;
  var UNLOCK_AUTOBIND_FETTERS = C.UNLOCK_AUTOBIND_FETTERS;
  var UNLOCK_AUTOBIND_HEARTHS = C.UNLOCK_AUTOBIND_HEARTHS;
  var UNLOCK_AUTOBIND_LANTERNS = C.UNLOCK_AUTOBIND_LANTERNS;
  var UNLOCK_AUTOBIND_OBELISKS = C.UNLOCK_AUTOBIND_OBELISKS;
  var UNLOCK_AUTOBIND_PYRES = C.UNLOCK_AUTOBIND_PYRES;
  var UNLOCK_AUTOBIND_SHADES = C.UNLOCK_AUTOBIND_SHADES;
  var UNLOCK_AUTOBIND_SPIRES = C.UNLOCK_AUTOBIND_SPIRES;
  var UNLOCK_AUTOBIND_SPIRITS = C.UNLOCK_AUTOBIND_SPIRITS;
  var UNLOCK_AUTOBIND_THRONES = C.UNLOCK_AUTOBIND_THRONES;
  var UNLOCK_AUTOBIND_URNS = C.UNLOCK_AUTOBIND_URNS;
  var UNLOCK_AUTOBIND_VESSELS = C.UNLOCK_AUTOBIND_VESSELS;
  var UNLOCK_BEACONS = C.UNLOCK_BEACONS;
  var UNLOCK_CENSERS_LIFETIME_SPIRITS = C.UNLOCK_CENSERS_LIFETIME_SPIRITS;
  var UNLOCK_CENSERS_VESSELS = C.UNLOCK_CENSERS_VESSELS;
  var UNLOCK_CHALICES = C.UNLOCK_CHALICES;
  var UNLOCK_CHOIR_ASH = C.UNLOCK_CHOIR_ASH;
  var UNLOCK_CHOIR_LANTERNS = C.UNLOCK_CHOIR_LANTERNS;
  var UNLOCK_FETTERS = C.UNLOCK_FETTERS;
  var UNLOCK_HEARTHS = C.UNLOCK_HEARTHS;
  var UNLOCK_LANTERNS = C.UNLOCK_LANTERNS;
  var UNLOCK_LIFETIME = C.UNLOCK_LIFETIME;
  var UNLOCK_LIFETIME_SHADES = C.UNLOCK_LIFETIME_SHADES;
  var UNLOCK_LIFETIME_SPIRITS = C.UNLOCK_LIFETIME_SPIRITS;
  var UNLOCK_MARKS_LIFETIME = C.UNLOCK_MARKS_LIFETIME;
  var UNLOCK_NIGHT_LANTERNS = C.UNLOCK_NIGHT_LANTERNS;
  var UNLOCK_OBELISKS = C.UNLOCK_OBELISKS;
  var UNLOCK_PYRES = C.UNLOCK_PYRES;
  var UNLOCK_SHADES = C.UNLOCK_SHADES;
  var UNLOCK_SPIRES = C.UNLOCK_SPIRES;
  var UNLOCK_SPIRITS_FOR_VESSELS = C.UNLOCK_SPIRITS_FOR_VESSELS;
  var UNLOCK_TOLL_CLICKS = C.UNLOCK_TOLL_CLICKS;
  var UNLOCK_URNS = C.UNLOCK_URNS;
  var UNLOCK_VEIL_CLICKS = C.UNLOCK_VEIL_CLICKS;
  var UNLOCK_VESSELS_FOR_THRONES = C.UNLOCK_VESSELS_FOR_THRONES;
  var UNLOCK_WAKE_ASH = C.UNLOCK_WAKE_ASH;
  var UNLOCK_WELL_DRAWS_SHADES = C.UNLOCK_WELL_DRAWS_SHADES;
  var vowsKnownCount = C.vowsKnownCount;
  var namesFromPeak = E.namesFromPeak;
  var num = E.num;

  function create(host) {
    var markSaveDirty = host.markSaveDirty;
    var remembranceUnlocked = host.remembranceUnlocked;
    var beginGiftToastBatch = host.beginGiftToastBatch;
    var flushGiftToasts = host.flushGiftToasts;
    var revealBeacons = host.revealBeacons;
    var revealCensers = host.revealCensers;
    var revealChalices = host.revealChalices;
    var revealFetters = host.revealFetters;
    var revealHearths = host.revealHearths;
    var revealLanterns = host.revealLanterns;
    var revealObelisks = host.revealObelisks;
    var revealPyres = host.revealPyres;
    var revealSpires = host.revealSpires;
    var revealSpirits = host.revealSpirits;
    var revealThrones = host.revealThrones;
    var revealUrns = host.revealUrns;
    var revealVessels = host.revealVessels;
    var revealWell = host.revealWell;
    var showToast = host.showToast;
    var rememberVow = host.rememberVow;

    var _giftUngrantedCount = -1;
    var _giftCmpCount = 0;
    var _giftMeetsCount = 0;
    var _bumpPeakShadesCount = 0;
    var _giftLastSeen = null;

    function hasChronicle(id) {
      var state = host.getState();
      return S.hasChronicle(state, id);
    }

    function chronicleAt() {
      var state = host.getState();
      var tn = N.toNumber(state.lifetimeSouls);
      if (!isFinite(tn) || tn < 0) return 0;
      return tn;
    }

    function markChronicle(id) {
      var state = host.getState();
      if (!state.chronicle) state.chronicle = [];
      if (!CHRONICLE_LINES[id] || hasChronicle(id)) return false;
      state.chronicle.push({ id: id, at: chronicleAt() });
      return true;
    }

    function syncChronicle() {
      var state = host.getState();
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

    function checkUnlock() {
      var state = host.getState();
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

    function rebuildUngrantedCount() {
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
      var current = Math.max(0, Math.floor(Number(state.namesBound) || 0));
      if (current < 12) return true;
      if (!state.namesComplete) return true;
      if (!state.giftNamesComplete) return true;
      return false;
    }

    function tryNamesBound() {
      var state = host.getState();
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

    function resetGiftCache() {
      _giftUngrantedCount = -1;
      _giftLastSeen = null;
    }

    return {
      hasChronicle: hasChronicle,
      chronicleAt: chronicleAt,
      markChronicle: markChronicle,
      syncChronicle: syncChronicle,
      checkUnlock: checkUnlock,
      rebuildUngrantedCount: rebuildUngrantedCount,
      snapshotGiftStats: snapshotGiftStats,
      giftStatValue: giftStatValue,
      giftStatChanged: giftStatChanged,
      giftMeetsThreshold: giftMeetsThreshold,
      grantGift: grantGift,
      tryMilestoneGifts: tryMilestoneGifts,
      tryNamesBoundNeeded: tryNamesBoundNeeded,
      tryNamesBound: tryNamesBound,
      resetGiftCache: resetGiftCache,
      getGiftCmpCount: function () { return _giftCmpCount; },
      getGiftMeetsCount: function () { return _giftMeetsCount; },
      getGiftUngrantedCount: function () { return _giftUngrantedCount; },
      getBumpPeakShadesCount: function () { return _bumpPeakShadesCount; },
      resetGiftLastSeen: function () { _giftLastSeen = null; }
    };
  }

  global.SoulgatherProgression = { create: create };
})(typeof window !== "undefined" ? window : globalThis);
