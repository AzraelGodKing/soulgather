(function (global) {
  "use strict";

  // Prestige actions (AZR-194): Reliquary edicts, the Crown and Remembrance shop, and Tribute
  // (`layTribute` with its account-snapshot and starting-stock phases). Same host contract as
  // actions.js, which creates this module with its own host and merges the handlers it returns.
  var N = global.SoulgatherNum;
  var C = global.SoulgatherConfig;
  var E = global.SoulgatherEconomy;
  var S = global.SoulgatherState;

  var ASHEN_TIDE_MAX = C.ASHEN_TIDE_MAX;
  var CHOIR_MAX = C.CHOIR_MAX;
  var DEEPER_TOLL_MAX = C.DEEPER_TOLL_MAX;
  var LONGER_HYMN_MAX = C.LONGER_HYMN_MAX;
  var LONGER_KNELL_MAX = C.LONGER_KNELL_MAX;
  var LONGER_PROCESSION_MAX = C.LONGER_PROCESSION_MAX;
  var LONGER_TITHE_MAX = C.LONGER_TITHE_MAX;
  var LONGER_VEIL_MAX = C.LONGER_VEIL_MAX;
  var LONGER_WAKE_MAX = C.LONGER_WAKE_MAX;
  var OSSUARY_MAX = C.OSSUARY_MAX;
  var UNLOCK_AUTOBIND_BEACONS = C.UNLOCK_AUTOBIND_BEACONS;
  var UNLOCK_AUTOBIND_CENSERS = C.UNLOCK_AUTOBIND_CENSERS;
  var UNLOCK_AUTOBIND_CHALICES = C.UNLOCK_AUTOBIND_CHALICES;
  var UNLOCK_AUTOBIND_FETTERS = C.UNLOCK_AUTOBIND_FETTERS;
  var UNLOCK_AUTOBIND_HEARTHS = C.UNLOCK_AUTOBIND_HEARTHS;
  var UNLOCK_AUTOBIND_LANTERNS = C.UNLOCK_AUTOBIND_LANTERNS;
  var UNLOCK_AUTOBIND_OBELISKS = C.UNLOCK_AUTOBIND_OBELISKS;
  var UNLOCK_AUTOBIND_PYRES = C.UNLOCK_AUTOBIND_PYRES;
  var UNLOCK_AUTOBIND_SPIRES = C.UNLOCK_AUTOBIND_SPIRES;
  var UNLOCK_AUTOBIND_URNS = C.UNLOCK_AUTOBIND_URNS;
  var normalizeVowsKnown = C.normalizeVowsKnown;
  var vowExtraFavor = C.vowExtraFavor;
  var ashenCost = E.ashenCost;
  var ashenTideCost = E.ashenTideCost;
  var beaconEdictCost = E.beaconEdictCost;
  var beaconEdictStartsBeacons = E.beaconEdictStartsBeacons;
  var choirEdictCost = E.choirEdictCost;
  var cinderEdictCost = E.cinderEdictCost;
  var cinderEdictStartsPyreAutobind = E.cinderEdictStartsPyreAutobind;
  var crownCost = E.crownCost;
  var cupEdictCost = E.cupEdictCost;
  var cupStartsChalices = E.cupStartsChalices;
  var cutEdictCost = E.cutEdictCost;
  var cutEdictStartsUrnAutobind = E.cutEdictStartsUrnAutobind;
  var deeperNightCost = E.deeperNightCost;
  var deeperTollCost = E.deeperTollCost;
  var depthCost = E.depthCost;
  var draughtEdictCost = E.draughtEdictCost;
  var draughtStartsChaliceAutobind = E.draughtStartsChaliceAutobind;
  var echoCost = E.echoCost;
  var edictCost = E.edictCost;
  var embersEdictCost = E.embersEdictCost;
  var embersStartsPyres = E.embersStartsPyres;
  var favorGain = E.favorGain;
  var gleamEdictCost = E.gleamEdictCost;
  var gleamEdictStartsBeaconAutobind = E.gleamEdictStartsBeaconAutobind;
  var hearthEdictCost = E.hearthEdictCost;
  var hearthEdictStartsHearths = E.hearthEdictStartsHearths;
  var hymnEdictCost = E.hymnEdictCost;
  var hymnLeftAfterTribute = E.hymnLeftAfterTribute;
  var kindleCost = E.kindleCost;
  var knellEdictCost = E.knellEdictCost;
  var knellLeftAfterTribute = E.knellLeftAfterTribute;
  var longMemCost = E.longMemCost;
  var longerHymnCost = E.longerHymnCost;
  var longerKnellCost = E.longerKnellCost;
  var longerProcessionCost = E.longerProcessionCost;
  var longerTitheCost = E.longerTitheCost;
  var longerVeilCost = E.longerVeilCost;
  var longerWakeCost = E.longerWakeCost;
  var memoryCost = E.memoryCost;
  var nightEdictCost = E.nightEdictCost;
  var nightLeftAfterTribute = E.nightLeftAfterTribute;
  var num = E.num;
  var obeliskEdictCost = E.obeliskEdictCost;
  var obeliskEdictStartsObelisks = E.obeliskEdictStartsObelisks;
  var ossuaryCost = E.ossuaryCost;
  var processionEdictCost = E.processionEdictCost;
  var processionLeftAfterTribute = E.processionLeftAfterTribute;
  var quietCourtCost = E.quietCourtCost;
  var quietCourtStartsBeaconAutobind = E.quietCourtStartsBeaconAutobind;
  var quietCourtStartsChaliceAutobind = E.quietCourtStartsChaliceAutobind;
  var quietCourtStartsFetterAutobind = E.quietCourtStartsFetterAutobind;
  var quietCourtStartsHearthAutobind = E.quietCourtStartsHearthAutobind;
  var quietCourtStartsLanternAutobind = E.quietCourtStartsLanternAutobind;
  var quietCourtStartsObeliskAutobind = E.quietCourtStartsObeliskAutobind;
  var quietCourtStartsPyreAutobind = E.quietCourtStartsPyreAutobind;
  var quietCourtStartsSpireAutobind = E.quietCourtStartsSpireAutobind;
  var quietCourtStartsUrnAutobind = E.quietCourtStartsUrnAutobind;
  var remembranceFavorCost = E.remembranceFavorCost;
  var riseEdictCost = E.riseEdictCost;
  var riseEdictStartsSpireAutobind = E.riseEdictStartsSpireAutobind;
  var seatCost = E.seatCost;
  var smokeEdictCost = E.smokeEdictCost;
  var smokeStartsCenserAutobind = E.smokeStartsCenserAutobind;
  var spireEdictCost = E.spireEdictCost;
  var spireEdictStartsSpires = E.spireEdictStartsSpires;
  var tendingEdictCost = E.tendingEdictCost;
  var tendingEdictStartsHearthAutobind = E.tendingEdictStartsHearthAutobind;
  var tollEdictCost = E.tollEdictCost;
  var tollLeftAfterTribute = E.tollLeftAfterTribute;
  var urnEdictCost = E.urnEdictCost;
  var urnEdictStartsUrns = E.urnEdictStartsUrns;
  var veilEdictCost = E.veilEdictCost;
  var veilLeftAfterTribute = E.veilLeftAfterTribute;
  var wakeEdictCost = E.wakeEdictCost;
  var wakeLeftAfterTribute = E.wakeLeftAfterTribute;
  var FIELDS = S.FIELDS;
  var FIELDS_KEYS = S.FIELDS_KEYS;
  var freshState = S.freshState;

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

  function create(host) {
    var announce = host.announce;
    var checkUnlock = host.checkUnlock;
    var crownUnlocked = host.crownUnlocked;
    var hideToast = host.hideToast;
    var hideUnlockCards = host.hideUnlockCards;
    var markChronicle = host.markChronicle;
    var markDirty = host.markDirty;
    var markSaveDirty = host.markSaveDirty;
    var noteHollowManualSpend = host.noteHollowManualSpend;
    var remembranceUnlocked = host.remembranceUnlocked;
    var render = host.render;
    var revealUnlockedCards = host.revealUnlockedCards;
    var save = host.save;
    var showToast = host.showToast;

    function buyFavorUpgrade(levelKey, costFn, chronicleId) {
      var state = host.getState();
      var cost = costFn(state[levelKey]);
      if (!isFinite(cost) || state.favor < cost) return;
      var hollowBefore = state.favor;
      state.favor -= cost;
      noteHollowManualSpend("favor", cost, hollowBefore);
      state[levelKey] += 1;
      if (chronicleId) markChronicle(chronicleId);
      markSaveDirty();
      markDirty();
    }

    function buyEdict() { buyFavorUpgrade("edictLevel", edictCost); }
    function buyMemory() { buyFavorUpgrade("memoryLevel", memoryCost); }
    function buyEcho() {
      if ((Number(host.getState().echoLevel) || 0) >= 1) return;
      buyFavorUpgrade("echoLevel", echoCost, "echo");
    }
    function buySeat() { buyFavorUpgrade("seatLevel", seatCost, "seat"); }
    function buyKindle() { buyFavorUpgrade("kindleLevel", kindleCost); }
    function buyAshen() { buyFavorUpgrade("ashenLevel", ashenCost); }
    function buyDepth() { buyFavorUpgrade("depthLevel", depthCost); }
    function buyChoirEdict() { buyFavorUpgrade("choirEdictLevel", choirEdictCost, "choirEdict"); }
    function buyHymnEdict() { buyFavorUpgrade("hymnEdictLevel", hymnEdictCost, "hymnEdict"); }
    function buySmokeEdict() { buyFavorUpgrade("smokeEdictLevel", smokeEdictCost, "smokeEdict"); }
    function buyEmbersEdict() { buyFavorUpgrade("embersEdictLevel", embersEdictCost, "embersEdict"); }
    function buyUrnEdict() { buyFavorUpgrade("urnEdictLevel", urnEdictCost, "urnEdict"); }
    function buyHearthEdict() { buyFavorUpgrade("hearthEdictLevel", hearthEdictCost, "hearthEdict"); }
    function buyBeaconEdict() { buyFavorUpgrade("beaconEdictLevel", beaconEdictCost, "beaconEdict"); }
    function buySpireEdict() { buyFavorUpgrade("spireEdictLevel", spireEdictCost, "spireEdict"); }
    function buyObeliskEdict() { buyFavorUpgrade("obeliskEdictLevel", obeliskEdictCost, "obeliskEdict"); }
    function buyCinderEdict() { buyFavorUpgrade("cinderEdictLevel", cinderEdictCost, "cinderEdict"); }
    function buyCutEdict() { buyFavorUpgrade("cutEdictLevel", cutEdictCost, "cutEdict"); }
    function buyTendingEdict() { buyFavorUpgrade("tendingEdictLevel", tendingEdictCost, "tendingEdict"); }
    function buyGleamEdict() { buyFavorUpgrade("gleamEdictLevel", gleamEdictCost, "gleamEdict"); }
    function buyRiseEdict() { buyFavorUpgrade("riseEdictLevel", riseEdictCost, "riseEdict"); }
    function buyCupEdict() { buyFavorUpgrade("cupEdictLevel", cupEdictCost, "cupEdict"); }
    function buyDraughtEdict() { buyFavorUpgrade("draughtEdictLevel", draughtEdictCost, "draughtEdict"); }
    function buyWakeEdict() { buyFavorUpgrade("wakeEdictLevel", wakeEdictCost, "wakeEdict"); }
    function buyProcessionEdict() { buyFavorUpgrade("processionEdictLevel", processionEdictCost, "processionEdict"); }
    function buyTollEdict() { buyFavorUpgrade("tollEdictLevel", tollEdictCost, "tollEdict"); }
    function buyVeilEdict() { buyFavorUpgrade("veilEdictLevel", veilEdictCost, "veilEdict"); }
    function buyKnellEdict() { buyFavorUpgrade("knellEdictLevel", knellEdictCost, "knellEdict"); }
    function buyNightEdict() { buyFavorUpgrade("nightEdictLevel", nightEdictCost, "nightEdict"); }

    function buyCrownWeight() {
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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

    function layRemembrance() {
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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

    function applyEdictStartingStock(s) {
      var state = host.getState();
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

    function applyAutobindStarts(s) {
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
      var keys = Object.keys(snap);
      for (var i = 0; i < keys.length; i++) {
        state[keys[i]] = snap[keys[i]];
      }
    }

    function applyTributeTimerPhases() {
      var state = host.getState();
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
      var state = host.getState();
      var gain = favorGain(state.lifetimeSouls);
      if (gain < 1) return;
      var ok = host.confirm(
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
      host.setState(state);
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
      host.resetFavorReady();
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

    return {
      buyEdict: buyEdict,
      buyMemory: buyMemory,
      buyEcho: buyEcho,
      buySeat: buySeat,
      buyKindle: buyKindle,
      buyAshen: buyAshen,
      buyDepth: buyDepth,
      buyChoirEdict: buyChoirEdict,
      buyHymnEdict: buyHymnEdict,
      buySmokeEdict: buySmokeEdict,
      buyEmbersEdict: buyEmbersEdict,
      buyUrnEdict: buyUrnEdict,
      buyHearthEdict: buyHearthEdict,
      buyBeaconEdict: buyBeaconEdict,
      buySpireEdict: buySpireEdict,
      buyObeliskEdict: buyObeliskEdict,
      buyCinderEdict: buyCinderEdict,
      buyCutEdict: buyCutEdict,
      buyTendingEdict: buyTendingEdict,
      buyGleamEdict: buyGleamEdict,
      buyRiseEdict: buyRiseEdict,
      buyCupEdict: buyCupEdict,
      buyDraughtEdict: buyDraughtEdict,
      buyWakeEdict: buyWakeEdict,
      buyProcessionEdict: buyProcessionEdict,
      buyTollEdict: buyTollEdict,
      buyVeilEdict: buyVeilEdict,
      buyKnellEdict: buyKnellEdict,
      buyNightEdict: buyNightEdict,
      buyCrownWeight: buyCrownWeight,
      buyLongMemory: buyLongMemory,
      buyQuietCourt: buyQuietCourt,
      layRemembrance: layRemembrance,
      buyDeeperNight: buyDeeperNight,
      buyLongerProcession: buyLongerProcession,
      buyDeeperToll: buyDeeperToll,
      buyLongerWake: buyLongerWake,
      buyLongerTithe: buyLongerTithe,
      buyLongerVeil: buyLongerVeil,
      buyLongerHymn: buyLongerHymn,
      buyLongerKnell: buyLongerKnell,
      buyAshenTide: buyAshenTide,
      buyOssuary: buyOssuary,
      applyEdictStartingStock: applyEdictStartingStock,
      applyAutobindStarts: applyAutobindStarts,
      applyTributeAccountMutations: applyTributeAccountMutations,
      snapshotAccountFields: snapshotAccountFields,
      restoreAccountFields: restoreAccountFields,
      applyTributeTimerPhases: applyTributeTimerPhases,
      layTribute: layTribute
    };
  }

  global.SoulgatherPrestige = {
    create: create,
    TRIBUTE_AUTOBIND_STARTS: TRIBUTE_AUTOBIND_STARTS
  };
})(typeof window !== "undefined" ? window : globalThis);
