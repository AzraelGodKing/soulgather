(function (global) {
  "use strict";

  // View layer (AZR-194): render, card reveals, toasts, the screen-reader announcer, chronicle and stats.
  // Reads state through host.getState() and never writes it; one-time reveal flags go through host.claimFlag().
  var N = global.SoulgatherNum;
  var C = global.SoulgatherConfig;
  var E = global.SoulgatherEconomy;
  var S = global.SoulgatherState;

  var ANNOUNCE_THROTTLE_MS = C.ANNOUNCE_THROTTLE_MS;
  var ASHEN_TIDE_MAX = C.ASHEN_TIDE_MAX;
  var ASPECT_NAMES = C.ASPECT_NAMES;
  var BEACON_ASH_PER_SEC = C.BEACON_ASH_PER_SEC;
  var BEACON_COST_BASE = C.BEACON_COST_BASE;
  var BEACON_COST_MULT = C.BEACON_COST_MULT;
  var BINDING_TOLL_COST_BONUS = C.BINDING_TOLL_COST_BONUS;
  var BINDING_TOLL_MAX = C.BINDING_TOLL_MAX;
  var BOUND_NAMES = C.BOUND_NAMES;
  var CENSER_ASH_PER_SEC = C.CENSER_ASH_PER_SEC;
  var CHOIR_LANTERN_COST = C.CHOIR_LANTERN_COST;
  var CHOIR_MAX = C.CHOIR_MAX;
  var CHRONICLE_LINES = C.CHRONICLE_LINES;
  var COST_BASE = C.COST_BASE;
  var DEEPER_TOLL_MAX = C.DEEPER_TOLL_MAX;
  var FETTER_COST_BASE = C.FETTER_COST_BASE;
  var FETTER_COST_MULT = C.FETTER_COST_MULT;
  var HEARTH_ASH_PER_SEC = C.HEARTH_ASH_PER_SEC;
  var HEARTH_COST_BASE = C.HEARTH_COST_BASE;
  var HEARTH_COST_MULT = C.HEARTH_COST_MULT;
  var HOLLOW_PENALTY = C.HOLLOW_PENALTY;
  var hymnMult = C.hymnMult;
  var KNELL_COST = C.KNELL_COST;
  var LANTERN_COST_BASE = C.LANTERN_COST_BASE;
  var LANTERN_COST_MULT = C.LANTERN_COST_MULT;
  var LONGER_HYMN_MAX = C.LONGER_HYMN_MAX;
  var LONGER_KNELL_MAX = C.LONGER_KNELL_MAX;
  var LONGER_PROCESSION_MAX = C.LONGER_PROCESSION_MAX;
  var LONGER_TITHE_MAX = C.LONGER_TITHE_MAX;
  var LONGER_VEIL_MAX = C.LONGER_VEIL_MAX;
  var LONGER_WAKE_MAX = C.LONGER_WAKE_MAX;
  var NIGHT_TITHE_MIN = C.NIGHT_TITHE_MIN;
  var nightMult = C.nightMult;
  var normalizeAspect = C.normalizeAspect;
  var normalizeVow = C.normalizeVow;
  var OBELISK_ASH_PER_SEC = C.OBELISK_ASH_PER_SEC;
  var OBELISK_COST_BASE = C.OBELISK_COST_BASE;
  var OBELISK_COST_MULT = C.OBELISK_COST_MULT;
  var OSSUARY_MAX = C.OSSUARY_MAX;
  var PROCESSION_COST = C.PROCESSION_COST;
  var PYRE_ASH_PER_SEC = C.PYRE_ASH_PER_SEC;
  var PYRE_COST_BASE = C.PYRE_COST_BASE;
  var PYRE_COST_MULT = C.PYRE_COST_MULT;
  var SPIRE_ASH_PER_SEC = C.SPIRE_ASH_PER_SEC;
  var SPIRE_COST_BASE = C.SPIRE_COST_BASE;
  var SPIRE_COST_MULT = C.SPIRE_COST_MULT;
  var TOAST_FAST_MS = C.TOAST_FAST_MS;
  var TOAST_MS = C.TOAST_MS;
  var TOAST_QUEUE_MAX = C.TOAST_QUEUE_MAX;
  var toastOverflowCount = C.toastOverflowCount;
  var toastOverflowLabel = C.toastOverflowLabel;
  var TOLL_COST = C.TOLL_COST;
  var URN_ASH_PER_SEC = C.URN_ASH_PER_SEC;
  var URN_COST_BASE = C.URN_COST_BASE;
  var URN_COST_MULT = C.URN_COST_MULT;
  var VEIL_MIN = C.VEIL_MIN;
  var VOW_HUD_STRINGS = C.VOW_HUD_STRINGS;
  var VOW_NAMES = C.VOW_NAMES;
  var vowExtraFavor = C.vowExtraFavor;
  var vowsKnownCount = C.vowsKnownCount;
  var WAKE_COST = C.WAKE_COST;
  var wakeMult = C.wakeMult;
  var WELL_DRAWS_COST = C.WELL_DRAWS_COST;
  var ashenCost = E.ashenCost;
  var ashenTideCost = E.ashenTideCost;
  var ashFromShadeFrac = E.ashFromShadeFrac;
  var beaconEdictCost = E.beaconEdictCost;
  var beaconEdictStartsBeacons = E.beaconEdictStartsBeacons;
  var beaconRiteCost = E.beaconRiteCost;
  var beaconRiteMult = E.beaconRiteMult;
  var bindingTollCost = E.bindingTollCost;
  var bindingTollCostMult = E.bindingTollCostMult;
  var bindingTollRateMult = E.bindingTollRateMult;
  var chainMult = E.chainMult;
  var choirAshRate = E.choirAshRate;
  var choirEdictCost = E.choirEdictCost;
  var cinderCost = E.cinderCost;
  var cinderEdictCost = E.cinderEdictCost;
  var cinderMult = E.cinderMult;
  var crownCost = E.crownCost;
  var cupEdictCost = E.cupEdictCost;
  var cupStartsChalices = E.cupStartsChalices;
  var cutEdictCost = E.cutEdictCost;
  var deeperNightCost = E.deeperNightCost;
  var deeperTollCost = E.deeperTollCost;
  var depthCost = E.depthCost;
  var draughtEdictCost = E.draughtEdictCost;
  var echoCost = E.echoCost;
  var edictCost = E.edictCost;
  var emberMult = E.emberMult;
  var embersEdictCost = E.embersEdictCost;
  var embersStartsPyres = E.embersStartsPyres;
  var favorGain = E.favorGain;
  var fetterMult = E.fetterMult;
  var gleamEdictCost = E.gleamEdictCost;
  var hearthEdictCost = E.hearthEdictCost;
  var hearthEdictStartsHearths = E.hearthEdictStartsHearths;
  var hearthRiteCost = E.hearthRiteCost;
  var hearthRiteMult = E.hearthRiteMult;
  var hymnBonusSecs = E.hymnBonusSecs;
  var hymnEdictCost = E.hymnEdictCost;
  var hymnSecs = E.hymnSecs;
  var kindleCost = E.kindleCost;
  var knellEdictCost = E.knellEdictCost;
  var knellEdictStartsKnell = E.knellEdictStartsKnell;
  var knellSecs = E.knellSecs;
  var lanternMult = E.lanternMult;
  var levyCost = E.levyCost;
  var levyMult = E.levyMult;
  var longerHymnCost = E.longerHymnCost;
  var longerKnellCost = E.longerKnellCost;
  var longerProcessionCost = E.longerProcessionCost;
  var longerTitheCost = E.longerTitheCost;
  var longerVeilCost = E.longerVeilCost;
  var longerWakeCost = E.longerWakeCost;
  var longMemCost = E.longMemCost;
  var markCost = E.markCost;
  var memoryCost = E.memoryCost;
  var nextGoal = E.nextGoal;
  var nightEdictCost = E.nightEdictCost;
  var nightEdictSecs = E.nightEdictSecs;
  var nightEdictStartsNight = E.nightEdictStartsNight;
  var nightSecs = E.nightSecs;
  var nightTitheCost = E.nightTitheCost;
  var obeliskEdictCost = E.obeliskEdictCost;
  var obeliskEdictStartsObelisks = E.obeliskEdictStartsObelisks;
  var ossuaryCost = E.ossuaryCost;
  var paidKnellSecs = E.paidKnellSecs;
  var paidProcessionSecs = E.paidProcessionSecs;
  var paidTitheSecs = E.paidTitheSecs;
  var paidTollSecs = E.paidTollSecs;
  var paidVeilSecs = E.paidVeilSecs;
  var paidWakeSecs = E.paidWakeSecs;
  var processionEdictCost = E.processionEdictCost;
  var processionEdictStartsProcession = E.processionEdictStartsProcession;
  var processionSecs = E.processionSecs;
  var prodMult = E.prodMult;
  var quietCourtCost = E.quietCourtCost;
  var quietCourtStartsUrnAutobind = E.quietCourtStartsUrnAutobind;
  var remembranceFavorCost = E.remembranceFavorCost;
  var riseEdictCost = E.riseEdictCost;
  var seatCost = E.seatCost;
  var siphonCost = E.siphonCost;
  var siphonMult = E.siphonMult;
  var smokeEdictCost = E.smokeEdictCost;
  var spireEdictCost = E.spireEdictCost;
  var spireEdictStartsSpires = E.spireEdictStartsSpires;
  var spireRiteCost = E.spireRiteCost;
  var spireRiteMult = E.spireRiteMult;
  var tendingEdictCost = E.tendingEdictCost;
  var tollEdictCost = E.tollEdictCost;
  var tollEdictStartsToll = E.tollEdictStartsToll;
  var tollSecs = E.tollSecs;
  var urnEdictCost = E.urnEdictCost;
  var urnEdictStartsUrns = E.urnEdictStartsUrns;
  var urnRiteCost = E.urnRiteCost;
  var urnRiteMult = E.urnRiteMult;
  var veilCost = E.veilCost;
  var veilEdictCost = E.veilEdictCost;
  var veilEdictStartsVeil = E.veilEdictStartsVeil;
  var veilSecs = E.veilSecs;
  var wakeEdictCost = E.wakeEdictCost;
  var wakeEdictStartsWake = E.wakeEdictStartsWake;
  var wakeSecs = E.wakeSecs;

  function create(host) {
    var bindingTollRowOpen = host.bindingTollRowOpen;
    var chalicePlan = host.chalicePlan;
    var clickPower = host.clickPower;
    var crownUnlocked = host.crownUnlocked;
    var currentProducerCostMult = host.currentProducerCostMult;
    var currentTitheCost = host.currentTitheCost;
    var hymnActive = host.hymnActive;
    var isTypingTarget = host.isTypingTarget;
    var knellActive = host.knellActive;
    var nightActive = host.nightActive;
    var processionActive = host.processionActive;
    var purchasePlan = host.purchasePlan;
    var rateMult = host.rateMult;
    var reduceMotionActive = host.reduceMotionActive;
    var remembranceUnlocked = host.remembranceUnlocked;
    var shadeSoulsPerSec = host.shadeSoulsPerSec;
    var shadesPerSec = host.shadesPerSec;
    var soulsPerSec = host.soulsPerSec;
    var spiritsPerSec = host.spiritsPerSec;
    var titheActive = host.titheActive;
    var tollActive = host.tollActive;
    var veilActive = host.veilActive;
    var wakeActive = host.wakeActive;
    var wellPurchasePlan = host.wellPurchasePlan;

    var setTextWriteCount = 0;
    var _announceLastMs = 0;
    var _announceQueue = [];
    var _announceTimer = null;
    var toastTimer = 0;
    var toastQueue = [];
    var toastActive = false;
    var toastHold = false;
    var toastEscapeArmed = false;
    var giftToastBatch = null;
    var _favorReadyAnnounced = false;
    var els = {};

    function setText(el, str) {
      if (!el) return false;
      str = str == null ? "" : String(str);
      if (el.textContent === str) return false;
      el.textContent = str;
      setTextWriteCount += 1;
      return true;
    }

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
      if (withToast && host.claimFlag("toastShown")) {
        showToast("The well answers. A will can be bound.");
        announce("Unlocked: Bound Spirits.");
      }
    }

    function revealVessels(withToast) {
      revealCard(els.vesselCard);
      if (withToast && host.claimFlag("vesselToastShown")) {
        showToast("A vessel waits. A will can be housed.");
        announce("Unlocked: Vessels.");
      }
    }

    function revealThrones(withToast) {
      revealCard(els.throneCard);
      if (withToast && host.claimFlag("throneToastShown")) {
        showToast("A throne may be raised.");
        announce("Unlocked: Thrones.");
      }
    }

    function revealLanterns(withToast) {
      revealCard(els.lanternCard);
    }

    function revealCensers(withToast) {
      revealCard(els.censerCard);
      if (withToast && host.claimFlag("censerToastShown")) {
        showToast("They burn what the well discards.");
        announce("Unlocked: Censers.");
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
        currentProducerCostMult(),
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
          currentProducerCostMult(),
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
        var censerPlan = purchasePlan(state.censers, state.vessels, COST_BASE, currentProducerCostMult());
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
      var state = host.getState();
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
      var state = host.getState();
      if (!els.soulsCount) return;
      var F = SoulgatherFormat;
      setText(els.soulsCount, F.formatNumber(state.souls));
      setText(els.soulsRate, F.formatRate(soulsPerSec()));
    }

    function holdToasts() {
      toastHold = true;
    }

    function releaseToasts(away) {
      if (away) {
        toastQueue.unshift(away);
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
    }

    function isToastActive() {
      return toastActive;
    }

    function resetFavorReady() {
      _favorReadyAnnounced = false;
    }

    function resetAnnouncer() {
      _announceLastMs = 0;
      _announceQueue = [];
      if (_announceTimer) {
        clearTimeout(_announceTimer);
        _announceTimer = null;
      }
    }

    return {
      setText: setText,
      announce: announce,
      _pushAnnounce: _pushAnnounce,
      _drainAnnounce: _drainAnnounce,
      fmt: fmt,
      formatBlessing: formatBlessing,
      formatMult: formatMult,
      formatTimes: formatTimes,
      pad2: pad2,
      formatElapsed: formatElapsed,
      bindLabel: bindLabel,
      pulseGather: pulseGather,
      spawnRipple: spawnRipple,
      revealCard: revealCard,
      hideCard: hideCard,
      revealWell: revealWell,
      revealSpirits: revealSpirits,
      revealVessels: revealVessels,
      revealThrones: revealThrones,
      revealLanterns: revealLanterns,
      revealCensers: revealCensers,
      revealPyres: revealPyres,
      revealUrns: revealUrns,
      revealHearths: revealHearths,
      revealBeacons: revealBeacons,
      revealSpires: revealSpires,
      revealObelisks: revealObelisks,
      revealChalices: revealChalices,
      revealFetters: revealFetters,
      revealUnlockedCards: revealUnlockedCards,
      hideUnlockCards: hideUnlockCards,
      hideTribute: hideTribute,
      hideRites: hideRites,
      hideMarks: hideMarks,
      hideAspects: hideAspects,
      hideVows: hideVows,
      hideCrown: hideCrown,
      hideNames: hideNames,
      renderChronicle: renderChronicle,
      renderStats: renderStats,
      capEnqueueToast: capEnqueueToast,
      pushToastQueued: pushToastQueued,
      formatGiftBatchSummary: formatGiftBatchSummary,
      beginGiftToastBatch: beginGiftToastBatch,
      flushGiftToasts: flushGiftToasts,
      showToast: showToast,
      toastBulk: toastBulk,
      presentToast: presentToast,
      hideToast: hideToast,
      dismissToastNext: dismissToastNext,
      dismissToastEscape: dismissToastEscape,
      render: render,
      renderNames: renderNames,
      hotSoulsUpdate: hotSoulsUpdate,
      els: els,
      toastQueue: toastQueue,
      holdToasts: holdToasts,
      releaseToasts: releaseToasts,
      isToastActive: isToastActive,
      resetFavorReady: resetFavorReady,
      resetAnnouncer: resetAnnouncer,
      getSetTextWriteCount: function () { return setTextWriteCount; },
      getAnnounceQueue: function () { return _announceQueue; },
      getAnnounceLastMs: function () { return _announceLastMs; }
    };
  }

  global.SoulgatherUI = { create: create };
})(typeof window !== "undefined" ? window : globalThis);
