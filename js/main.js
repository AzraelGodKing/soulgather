(function () {
  "use strict";

  // Entry point (AZR-194): boot, the frame loop, hotkeys and DOM event binding. Loaded last; everything
  // else comes from globalThis.SoulgatherGame, which game.js publishes after wiring state, actions and UI.
  // State is read live through getState() because a reset or import replaces the state object.
  var N = globalThis.SoulgatherNum;
  var C = globalThis.SoulgatherConfig;
  var G = globalThis.SoulgatherGame;
  var E = G.economy;
  var A = G.actions;
  var U = G.ui;
  var getState = G.getState;

  var AUTOSAVE_MS = C.AUTOSAVE_MS;
  var KNELL_COST = C.KNELL_COST;
  var NIGHT_TITHE_MIN = C.NIGHT_TITHE_MIN;
  var normalizeVow = C.normalizeVow;
  var OSSUARY_COST = C.OSSUARY_COST;
  var OSSUARY_MAX = C.OSSUARY_MAX;
  var PROCESSION_COST = C.PROCESSION_COST;
  var TOLL_COST = C.TOLL_COST;
  var VEIL_MIN = C.VEIL_MIN;
  var WAKE_COST = C.WAKE_COST;

  var beaconRiteCost = E.beaconRiteCost;
  var cinderCost = E.cinderCost;
  var hearthRiteCost = E.hearthRiteCost;
  var spireRiteCost = E.spireRiteCost;
  var urnRiteCost = E.urnRiteCost;

  var frameDt = G.frameDt;
  var takeRenderDue = G.takeRenderDue;
  var resetFrameClock = G.resetFrameClock;
  var takePendingAwayToast = G.takePendingAwayToast;
  var reduceMotionSetting = G.reduceMotionSetting;
  var applyDt = G.applyDt;
  var checkUnlock = G.checkUnlock;
  var clearHiddenHeartbeat = G.clearHiddenHeartbeat;
  var currentTitheCost = G.currentTitheCost;
  var dismissBuyModeHint = G.dismissBuyModeHint;
  var exportMemory = G.exportMemory;
  var exportRawFailedMemory = G.exportRawFailedMemory;
  var flushSave = G.flushSave;
  var harvest = G.harvest;
  var importMemory = G.importMemory;
  var isTypingTarget = G.isTypingTarget;
  var knellActive = G.knellActive;
  var load = G.load;
  var loadReduceMotion = G.loadReduceMotion;
  var markSaveDirty = G.markSaveDirty;
  var maybeAwayToast = G.maybeAwayToast;
  var nightActive = G.nightActive;
  var processionActive = G.processionActive;
  var remembranceUnlocked = G.remembranceUnlocked;
  var resetGame = G.resetGame;
  var restoreLoadBackup = G.restoreLoadBackup;
  var setBuyMode = G.setBuyMode;
  var setReduceMotion = G.setReduceMotion;
  var settleToNow = G.settleToNow;
  var startFreshAfterLoadFail = G.startFreshAfterLoadFail;
  var startHiddenHeartbeat = G.startHiddenHeartbeat;
  var titheActive = G.titheActive;
  var tollActive = G.tollActive;
  var veilActive = G.veilActive;
  var wakeActive = G.wakeActive;

  var dismissToastEscape = U.dismissToastEscape;
  var dismissToastNext = U.dismissToastNext;
  var els = U.els;
  var hotSoulsUpdate = U.hotSoulsUpdate;
  var render = U.render;
  var revealUnlockedCards = U.revealUnlockedCards;
  var showToast = U.showToast;
  var toastQueue = U.toastQueue;

  var beginProcession = A.beginProcession;
  var buyAshen = A.buyAshen;
  var buyAshenTide = A.buyAshenTide;
  var buyBeacon = A.buyBeacon;
  var buyBeaconEdict = A.buyBeaconEdict;
  var buyBeaconRite = A.buyBeaconRite;
  var buyBindingToll = A.buyBindingToll;
  var buyCenser = A.buyCenser;
  var buyChalice = A.buyChalice;
  var buyChoirEdict = A.buyChoirEdict;
  var buyCinderEdict = A.buyCinderEdict;
  var buyCinders = A.buyCinders;
  var buyCrownWeight = A.buyCrownWeight;
  var buyCupEdict = A.buyCupEdict;
  var buyCutEdict = A.buyCutEdict;
  var buyDeeperNight = A.buyDeeperNight;
  var buyDeeperToll = A.buyDeeperToll;
  var buyDepth = A.buyDepth;
  var buyDraughtEdict = A.buyDraughtEdict;
  var buyEcho = A.buyEcho;
  var buyEdict = A.buyEdict;
  var buyEmbersEdict = A.buyEmbersEdict;
  var buyFetter = A.buyFetter;
  var buyGleamEdict = A.buyGleamEdict;
  var buyHearth = A.buyHearth;
  var buyHearthEdict = A.buyHearthEdict;
  var buyHearthRite = A.buyHearthRite;
  var buyHymnEdict = A.buyHymnEdict;
  var buyKindle = A.buyKindle;
  var buyKnellEdict = A.buyKnellEdict;
  var buyLantern = A.buyLantern;
  var buyLevy = A.buyLevy;
  var buyLongerHymn = A.buyLongerHymn;
  var buyLongerKnell = A.buyLongerKnell;
  var buyLongerProcession = A.buyLongerProcession;
  var buyLongerTithe = A.buyLongerTithe;
  var buyLongerVeil = A.buyLongerVeil;
  var buyLongerWake = A.buyLongerWake;
  var buyLongMemory = A.buyLongMemory;
  var buyMark = A.buyMark;
  var buyMemory = A.buyMemory;
  var buyNightEdict = A.buyNightEdict;
  var buyObelisk = A.buyObelisk;
  var buyObeliskEdict = A.buyObeliskEdict;
  var buyOssuary = A.buyOssuary;
  var buyProcessionEdict = A.buyProcessionEdict;
  var buyPyre = A.buyPyre;
  var buyQuietCourt = A.buyQuietCourt;
  var buyRiseEdict = A.buyRiseEdict;
  var buySeat = A.buySeat;
  var buyShade = A.buyShade;
  var buySiphon = A.buySiphon;
  var buySmokeEdict = A.buySmokeEdict;
  var buySpire = A.buySpire;
  var buySpireEdict = A.buySpireEdict;
  var buySpireRite = A.buySpireRite;
  var buySpirit = A.buySpirit;
  var buyTendingEdict = A.buyTendingEdict;
  var buyThrone = A.buyThrone;
  var buyTollEdict = A.buyTollEdict;
  var buyUrn = A.buyUrn;
  var buyUrnEdict = A.buyUrnEdict;
  var buyUrnRite = A.buyUrnRite;
  var buyVeilEdict = A.buyVeilEdict;
  var buyVessel = A.buyVessel;
  var buyWakeEdict = A.buyWakeEdict;
  var buyWell = A.buyWell;
  var buyWellDraws = A.buyWellDraws;
  var keepWake = A.keepWake;
  var layRemembrance = A.layRemembrance;
  var layTribute = A.layTribute;
  var payNightTithe = A.payNightTithe;
  var payTithe = A.payTithe;
  var raiseChoir = A.raiseChoir;
  var soundKnell = A.soundKnell;
  var soundToll = A.soundToll;
  var swearAspect = A.swearAspect;
  var swearVow = A.swearVow;
  var thinVeil = A.thinVeil;
  var toggleAutobind = A.toggleAutobind;
  var toggleAutobindBeacons = A.toggleAutobindBeacons;
  var toggleAutobindCensers = A.toggleAutobindCensers;
  var toggleAutobindChalices = A.toggleAutobindChalices;
  var toggleAutobindFetters = A.toggleAutobindFetters;
  var toggleAutobindHearths = A.toggleAutobindHearths;
  var toggleAutobindLanterns = A.toggleAutobindLanterns;
  var toggleAutobindObelisks = A.toggleAutobindObelisks;
  var toggleAutobindPyres = A.toggleAutobindPyres;
  var toggleAutobindSpires = A.toggleAutobindSpires;
  var toggleAutobindSpirits = A.toggleAutobindSpirits;
  var toggleAutobindThrones = A.toggleAutobindThrones;
  var toggleAutobindUrns = A.toggleAutobindUrns;
  var toggleAutobindVessels = A.toggleAutobindVessels;

  function tick(now) {
    applyDt(frameDt(now), true);
    hotSoulsUpdate();
    if (takeRenderDue(now)) render();
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
        if (getState().unlockedWell && !titheActive() && N.cmp(getState().souls, currentTitheCost()) >= 0) {
          ctx.ev.preventDefault();
          payTithe();
        }
      }
    },
    {
      keys: ["n"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        if (normalizeVow(getState().vow) === "ember") return;
        if (getState().unlockedNightTithe && !nightActive() && N.cmp(getState().ash, NIGHT_TITHE_MIN) >= 0) {
          ctx.ev.preventDefault();
          payNightTithe();
        }
      }
    },
    {
      keys: ["w"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        if (normalizeVow(getState().vow) === "ember") return;
        if (getState().unlockedWake && !wakeActive() && N.cmp(getState().ash, N.fromNumber(WAKE_COST)) >= 0) {
          ctx.ev.preventDefault();
          keepWake();
        }
      }
    },
    {
      keys: ["v"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        if (getState().unlockedVeil && !veilActive() && N.cmp(getState().ash, VEIL_MIN) >= 0) {
          ctx.ev.preventDefault();
          thinVeil();
        }
      }
    },
    {
      keys: ["g"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        if (getState().unlockedToll && !tollActive() && N.cmp(getState().souls, N.fromNumber(TOLL_COST)) >= 0) {
          ctx.ev.preventDefault();
          soundToll();
        }
      }
    },
    {
      keys: ["c"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        var cHotCost = cinderCost(getState().cinderLevel);
        if (getState().unlockedPyres && N.cmp(getState().ash, cHotCost) >= 0) {
          ctx.ev.preventDefault();
          buyCinders();
        }
      }
    },
    {
      keys: ["u"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        var uHotCost = urnRiteCost(getState().urnRiteLevel);
        if (getState().unlockedUrns && N.cmp(getState().ash, uHotCost) >= 0) {
          ctx.ev.preventDefault();
          buyUrnRite();
        }
      }
    },
    {
      keys: ["h"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        var hHotCost = hearthRiteCost(getState().hearthRiteLevel);
        if (getState().unlockedHearths && N.cmp(getState().ash, hHotCost) >= 0) {
          ctx.ev.preventDefault();
          buyHearthRite();
        }
      }
    },
    {
      keys: ["l"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        var bHotCost = beaconRiteCost(getState().beaconRiteLevel);
        if (getState().unlockedBeacons && N.cmp(getState().ash, bHotCost) >= 0) {
          ctx.ev.preventDefault();
          buyBeaconRite();
        }
      }
    },
    {
      keys: ["s"],
      guard: hotkeyDefaultGuard,
      action: function (ctx) {
        var sHotCost = spireRiteCost(getState().spireRiteLevel);
        if (getState().unlockedSpires && N.cmp(getState().ash, sHotCost) >= 0) {
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
          (Number(getState().ossuaryLevel) || 0) < OSSUARY_MAX &&
          (Number(getState().remembrance) || 0) >= OSSUARY_COST
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
          (Number(getState().remembrance) || 0) >= PROCESSION_COST
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
          (Number(getState().remembrance) || 0) >= KNELL_COST
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
    els.toastMsg = document.getElementById("toast-msg");
    els.toastHint = document.getElementById("toast-hint");
    els.wrap = document.querySelector(".wrap");
    els.skipLink = document.querySelector(".skip-link");
    if (els.toast) {
      // #toast-dismiss has no own listener: its click bubbles here, so one click = one advance.
      els.toast.addEventListener("click", function () {
        dismissToastNext();
      });
      els.toast.addEventListener("focusin", function (ev) {
        var from = ev.relatedTarget;
        if (from && !els.toast.contains(from)) U.setToastReturnFocus(from);
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
      els.reduceMotionToggle.checked = reduceMotionSetting();
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
        var until = Number(getState().simulatedUntil) || Date.now();
        var gap = (Date.now() - until) / 1000;
        var soulsBefore = N.clone(getState().souls);
        var ashBefore = N.clone(getState().ash);
        var shadesBefore = N.clone(getState().shades);
        settleToNow();
        resetFrameClock();
        var soulsGained = N.sub(getState().souls, soulsBefore);
        var ashGained = N.sub(getState().ash, ashBefore);
        var shadesGained = N.sub(getState().shades, shadesBefore);
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
      if (G.loadFailNoticeOpen()) {
        G.handleLoadFailKeydown(ev);
        return;
      }
      var target = ev.target;
      var active = document.activeElement || target;
      if (isTypingTarget(target) || isTypingTarget(active)) return;

      var keyEarly = String(ev.key || "").toLowerCase();
      if (keyEarly === "escape") {
        if (U.isToastActive() || toastQueue.length) {
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
        if ((els.gatherBtn && els.gatherBtn.disabled) || normalizeVow(getState().vow) === "stillness") return;
        harvest();
      }
    });
  }

  function boot() {
    bind();
    U.holdToasts();
    load();
    if (!getState().runStartedAt) getState().runStartedAt = Date.now();
    checkUnlock();
    revealUnlockedCards(false);
    render();
    U.releaseToasts(takePendingAwayToast());
    window.setInterval(flushSave, AUTOSAVE_MS);
    window.requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  var _eco = globalThis.SoulgatherEconomy;
  _eco.hotkeyDefaultGuard = hotkeyDefaultGuard;
  _eco.HOTKEYS = HOTKEYS;
  _eco.resolveHotkey = resolveHotkey;
})();
