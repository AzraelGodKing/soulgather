(function (global) {
  "use strict";

  // View layer (AZR-194): render, card reveals, toasts, the screen-reader announcer, chronicle and stats.
  // Reads state through host.getState() and never writes it; one-time reveal flags go through host.claimFlag().
  var N = global.SoulgatherNum;
  var C = global.SoulgatherConfig;
  var E = global.SoulgatherEconomy;
  var S = global.SoulgatherState;

  var ANNOUNCE_THROTTLE_MS = C.ANNOUNCE_THROTTLE_MS;
  var BEACON_ASH_PER_SEC = C.BEACON_ASH_PER_SEC;
  var BEACON_COST_BASE = C.BEACON_COST_BASE;
  var BEACON_COST_MULT = C.BEACON_COST_MULT;
  var BOUND_NAMES = C.BOUND_NAMES;
  var CENSER_ASH_PER_SEC = C.CENSER_ASH_PER_SEC;
  var CHRONICLE_LINES = C.CHRONICLE_LINES;
  var COST_BASE = C.COST_BASE;
  var FETTER_COST_BASE = C.FETTER_COST_BASE;
  var FETTER_COST_MULT = C.FETTER_COST_MULT;
  var HEARTH_ASH_PER_SEC = C.HEARTH_ASH_PER_SEC;
  var HEARTH_COST_BASE = C.HEARTH_COST_BASE;
  var HEARTH_COST_MULT = C.HEARTH_COST_MULT;
  var HOLLOW_PENALTY = C.HOLLOW_PENALTY;
  var hymnMult = C.hymnMult;
  var LANTERN_COST_BASE = C.LANTERN_COST_BASE;
  var LANTERN_COST_MULT = C.LANTERN_COST_MULT;
  var nightMult = C.nightMult;
  var normalizeAspect = C.normalizeAspect;
  var normalizeVow = C.normalizeVow;
  var OBELISK_ASH_PER_SEC = C.OBELISK_ASH_PER_SEC;
  var OBELISK_COST_BASE = C.OBELISK_COST_BASE;
  var OBELISK_COST_MULT = C.OBELISK_COST_MULT;
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
  var URN_ASH_PER_SEC = C.URN_ASH_PER_SEC;
  var URN_COST_BASE = C.URN_COST_BASE;
  var URN_COST_MULT = C.URN_COST_MULT;
  var VOW_HUD_STRINGS = C.VOW_HUD_STRINGS;
  var vowExtraFavor = C.vowExtraFavor;
  var vowsKnownCount = C.vowsKnownCount;
  var wakeMult = C.wakeMult;
  var beaconRiteMult = E.beaconRiteMult;
  var bindingTollCostMult = E.bindingTollCostMult;
  var cinderMult = E.cinderMult;
  var cupStartsChalices = E.cupStartsChalices;
  var favorGain = E.favorGain;
  var fetterMult = E.fetterMult;
  var hearthRiteMult = E.hearthRiteMult;
  var lanternMult = E.lanternMult;
  var nextGoal = E.nextGoal;
  var prodMult = E.prodMult;
  var spireRiteMult = E.spireRiteMult;
  var urnRiteMult = E.urnRiteMult;

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
    var toastHintSeen = false;
    var toastReturnFocus = null;
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
      if (toastActive) syncToastChrome();
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
      if (!els.toast || !els.toastMsg) return;
      toastActive = true;
      window.clearTimeout(toastTimer);
      els.toast.classList.remove("is-visible");
      void els.toast.offsetWidth;
      els.toastMsg.textContent = message;
      syncToastChrome();
      toastHintSeen = true;
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
        syncToastChrome();
        releaseToastFocus();
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
      syncToastChrome();
      releaseToastFocus();
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
      if (toastEscapeArmed) announce("Press Escape again to clear all notifications.");
    }

    function toastHintText() {
      if (toastEscapeArmed) return "Esc again clears all";
      if (toastQueue.length) return "Esc for next · twice clears all";
      if (!toastHintSeen) return "Click or Esc to dismiss";
      return "";
    }

    function syncToastChrome() {
      if (!els.toast) return;
      els.toast.classList.toggle("is-armed", toastEscapeArmed);
      if (!els.toastHint) return;
      var hint = toastHintText();
      els.toastHint.textContent = hint;
      els.toastHint.classList.toggle("is-hidden", !hint);
    }

    /** Keyboard focus on the dismiss button must not fall to <body> when the toast goes away. */
    function releaseToastFocus() {
      if (!els.toast || !els.toast.contains(document.activeElement)) return;
      var back = toastReturnFocus;
      toastReturnFocus = null;
      if (!back || !back.focus || back.disabled || !document.body.contains(back)) back = els.gatherBtn;
      if (back) back.focus();
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

      Pn.renderRites();
      Pn.renderMarks();
      Pn.renderAspects();
      Pn.renderVows();

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

      Pn.renderReliquary();
      Pn.renderCrown();

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

    var Pn = global.SoulgatherPanels.create({
      getState: host.getState,
      bindingTollRowOpen: bindingTollRowOpen,
      crownUnlocked: crownUnlocked,
      currentTitheCost: currentTitheCost,
      els: els,
      formatTimes: formatTimes,
      knellActive: knellActive,
      nightActive: nightActive,
      processionActive: processionActive,
      remembranceUnlocked: remembranceUnlocked,
      setText: setText,
      titheActive: titheActive,
      tollActive: tollActive,
      veilActive: veilActive,
      wakeActive: wakeActive
    });

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
      toastHintText: toastHintText,
      setToastReturnFocus: function (el) { toastReturnFocus = el; },
      getToastState: function () {
        return { active: toastActive, queue: toastQueue.slice(), armed: toastEscapeArmed, hintSeen: toastHintSeen };
      },
      resetToast: function () {
        toastQueue.length = 0; toastActive = false; toastHold = false;
        toastEscapeArmed = false; toastHintSeen = false; toastReturnFocus = null;
      },
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
