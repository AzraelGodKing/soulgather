(function (global) {
  "use strict";

  // Player actions (AZR-194): buy, rite, edict, vow and tribute handlers.
  // Handlers mutate the object from host.getState() and request every page effect (toasts, announcements,
  // confirms, render, save) through host hooks; nothing in this file touches the DOM.
  var N = global.SoulgatherNum;
  var C = global.SoulgatherConfig;
  var E = global.SoulgatherEconomy;
  var S = global.SoulgatherState;

  var ASHEN_TIDE_MAX = C.ASHEN_TIDE_MAX;
  var BEACON_COST_BASE = C.BEACON_COST_BASE;
  var BEACON_COST_MULT = C.BEACON_COST_MULT;
  var BINDING_TOLL_MAX = C.BINDING_TOLL_MAX;
  var CHALICE_MAX = C.CHALICE_MAX;
  var CHOIR_LANTERN_COST = C.CHOIR_LANTERN_COST;
  var CHOIR_MAX = C.CHOIR_MAX;
  var COST_BASE = C.COST_BASE;
  var DEEPER_TOLL_MAX = C.DEEPER_TOLL_MAX;
  var FETTER_COST_BASE = C.FETTER_COST_BASE;
  var FETTER_COST_MULT = C.FETTER_COST_MULT;
  var HEARTH_COST_BASE = C.HEARTH_COST_BASE;
  var HEARTH_COST_MULT = C.HEARTH_COST_MULT;
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
  var OBELISK_COST_BASE = C.OBELISK_COST_BASE;
  var OBELISK_COST_MULT = C.OBELISK_COST_MULT;
  var OSSUARY_MAX = C.OSSUARY_MAX;
  var PROCESSION_COST = C.PROCESSION_COST;
  var PYRE_COST_BASE = C.PYRE_COST_BASE;
  var PYRE_COST_MULT = C.PYRE_COST_MULT;
  var SPIRE_COST_BASE = C.SPIRE_COST_BASE;
  var SPIRE_COST_MULT = C.SPIRE_COST_MULT;
  var TOLL_COST = C.TOLL_COST;
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
  var UNLOCK_WELL_DRAWS_SHADES = C.UNLOCK_WELL_DRAWS_SHADES;
  var URN_COST_BASE = C.URN_COST_BASE;
  var URN_COST_MULT = C.URN_COST_MULT;
  var VEIL_MIN = C.VEIL_MIN;
  var WAKE_COST = C.WAKE_COST;
  var WELL_DRAWS_COST = C.WELL_DRAWS_COST;
  var emptyVowsKnown = C.emptyVowsKnown;
  var normalizeAspect = C.normalizeAspect;
  var normalizeVow = C.normalizeVow;
  var normalizeVowsKnown = C.normalizeVowsKnown;
  var vowExtraFavor = C.vowExtraFavor;
  var ashenCost = E.ashenCost;
  var ashenTideCost = E.ashenTideCost;
  var beaconEdictCost = E.beaconEdictCost;
  var beaconEdictStartsBeacons = E.beaconEdictStartsBeacons;
  var beaconRiteCost = E.beaconRiteCost;
  var bindingTollCost = E.bindingTollCost;
  var bindingTollCostMult = E.bindingTollCostMult;
  var choirEdictCost = E.choirEdictCost;
  var cinderCost = E.cinderCost;
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
  var hearthRiteCost = E.hearthRiteCost;
  var hymnEdictCost = E.hymnEdictCost;
  var hymnLeftAfterTribute = E.hymnLeftAfterTribute;
  var kindleCost = E.kindleCost;
  var knellEdictCost = E.knellEdictCost;
  var knellLeftAfterTribute = E.knellLeftAfterTribute;
  var levyCost = E.levyCost;
  var longMemCost = E.longMemCost;
  var longerHymnCost = E.longerHymnCost;
  var longerKnellCost = E.longerKnellCost;
  var longerProcessionCost = E.longerProcessionCost;
  var longerTitheCost = E.longerTitheCost;
  var longerVeilCost = E.longerVeilCost;
  var longerWakeCost = E.longerWakeCost;
  var markCost = E.markCost;
  var memoryCost = E.memoryCost;
  var nightEdictCost = E.nightEdictCost;
  var nightLeftAfterTribute = E.nightLeftAfterTribute;
  var nightSecs = E.nightSecs;
  var nightTitheCost = E.nightTitheCost;
  var num = E.num;
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
  var siphonCost = E.siphonCost;
  var smokeEdictCost = E.smokeEdictCost;
  var smokeStartsCenserAutobind = E.smokeStartsCenserAutobind;
  var spireEdictCost = E.spireEdictCost;
  var spireEdictStartsSpires = E.spireEdictStartsSpires;
  var spireRiteCost = E.spireRiteCost;
  var tendingEdictCost = E.tendingEdictCost;
  var tendingEdictStartsHearthAutobind = E.tendingEdictStartsHearthAutobind;
  var tollEdictCost = E.tollEdictCost;
  var tollLeftAfterTribute = E.tollLeftAfterTribute;
  var urnEdictCost = E.urnEdictCost;
  var urnEdictStartsUrns = E.urnEdictStartsUrns;
  var urnRiteCost = E.urnRiteCost;
  var veilCost = E.veilCost;
  var veilEdictCost = E.veilEdictCost;
  var veilLeftAfterTribute = E.veilLeftAfterTribute;
  var wakeEdictCost = E.wakeEdictCost;
  var wakeLeftAfterTribute = E.wakeLeftAfterTribute;
  var FIELDS = S.FIELDS;
  var FIELDS_KEYS = S.FIELDS_KEYS;
  var freshState = S.freshState;

  var VOW_CONFIRM = {
    stillness: "Swear Stillness?\n\nThe well will not answer a draw this emptying. This cannot be undone until Tribute.",
    poverty: "Swear Poverty?\n\nThrones will not autobind this emptying. This cannot be undone until Tribute.",
    hunger: "Swear Hunger?\n\nThe Tithe costs twice this emptying. This cannot be undone until Tribute.",
    ember: "Swear Ember?\n\nNight\u2019s Tithe and the Wake will not answer this emptying. This cannot be undone until Tribute."
  };

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
    var bindingTollRowOpen = host.bindingTollRowOpen;
    var chalicePlan = host.chalicePlan;
    var checkUnlock = host.checkUnlock;
    var crownUnlocked = host.crownUnlocked;
    var currentProducerCostMult = host.currentProducerCostMult;
    var currentTitheCost = host.currentTitheCost;
    var hideToast = host.hideToast;
    var hideUnlockCards = host.hideUnlockCards;
    var knellActive = host.knellActive;
    var markChronicle = host.markChronicle;
    var markDirty = host.markDirty;
    var markSaveDirty = host.markSaveDirty;
    var nightActive = host.nightActive;
    var noteHollowManualSpend = host.noteHollowManualSpend;
    var processionActive = host.processionActive;
    var purchasePlan = host.purchasePlan;
    var remembranceUnlocked = host.remembranceUnlocked;
    var render = host.render;
    var revealUnlockedCards = host.revealUnlockedCards;
    var save = host.save;
    var showToast = host.showToast;
    var syncChronicle = host.syncChronicle;
    var titheActive = host.titheActive;
    var toastBulk = host.toastBulk;
    var tollActive = host.tollActive;
    var veilActive = host.veilActive;
    var wakeActive = host.wakeActive;
    var wellPurchasePlan = host.wellPurchasePlan;

    function rememberVow(id) {
      var state = host.getState();
      var v = normalizeVow(id);
      if (!v) return;
      if (!state.vowsKnown || typeof state.vowsKnown !== "object") {
        state.vowsKnown = emptyVowsKnown();
      }
      state.vowsKnown[v] = true;
    }

    function buyWell() {
      var state = host.getState();
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
      var state = host.getState();
      var plan = purchasePlan(
        state.shades,
        state.souls,
        COST_BASE,
        currentProducerCostMult(),
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
      var state = host.getState();
      if (!state.unlockedSpirits) return;
      var plan = purchasePlan(
        state.spirits,
        state.shades,
        COST_BASE,
        currentProducerCostMult(),
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
      if (!state.unlockedCensers) return;
      var plan = purchasePlan(state.censers, state.vessels, COST_BASE, currentProducerCostMult());
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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

    function buyChalice() {
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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

    function payTithe() {
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
      if (!state.unlockedAutobind) return;
      state.autobind = !state.autobind;
      markSaveDirty();
      markDirty();
    }

    function toggleAutobindSpirits() {
      var state = host.getState();
      if (!state.unlockedAutobindSpirits) return;
      state.autobindSpirits = !state.autobindSpirits;
      markSaveDirty();
      markDirty();
    }

    function toggleAutobindVessels() {
      var state = host.getState();
      if (!state.unlockedAutobindVessels) return;
      state.autobindVessels = !state.autobindVessels;
      markSaveDirty();
      markDirty();
    }

    function toggleAutobindLanterns() {
      var state = host.getState();
      if (!state.unlockedAutobindLanterns) return;
      state.autobindLanterns = !state.autobindLanterns;
      markSaveDirty();
      markDirty();
    }

    function toggleAutobindFetters() {
      var state = host.getState();
      if (!state.unlockedAutobindFetters) return;
      state.autobindFetters = !state.autobindFetters;
      markSaveDirty();
      markDirty();
    }

    function toggleAutobindCensers() {
      var state = host.getState();
      if (!state.unlockedAutobindCensers) return;
      state.autobindCensers = !state.autobindCensers;
      markSaveDirty();
      markDirty();
    }

    function toggleAutobindThrones() {
      var state = host.getState();
      if (!state.unlockedAutobindThrones) return;
      state.autobindThrones = !state.autobindThrones;
      markSaveDirty();
      markDirty();
    }

    function toggleAutobindPyres() {
      var state = host.getState();
      if (!state.unlockedAutobindPyres) return;
      state.autobindPyres = !state.autobindPyres;
      markSaveDirty();
      markDirty();
    }

    function toggleAutobindUrns() {
      var state = host.getState();
      if (!state.unlockedAutobindUrns) return;
      state.autobindUrns = !state.autobindUrns;
      markSaveDirty();
      markDirty();
    }

    function toggleAutobindHearths() {
      var state = host.getState();
      if (!state.unlockedAutobindHearths) return;
      state.autobindHearths = !state.autobindHearths;
      markSaveDirty();
      markDirty();
    }

    function toggleAutobindBeacons() {
      var state = host.getState();
      if (!state.unlockedAutobindBeacons) return;
      state.autobindBeacons = !state.autobindBeacons;
      markSaveDirty();
      markDirty();
    }

    function toggleAutobindSpires() {
      var state = host.getState();
      if (!state.unlockedAutobindSpires) return;
      state.autobindSpires = !state.autobindSpires;
      markSaveDirty();
      markDirty();
    }

    function toggleAutobindObelisks() {
      var state = host.getState();
      if (!state.unlockedAutobindObelisks) return;
      state.autobindObelisks = !state.autobindObelisks;
      markSaveDirty();
      markDirty();
    }

    function toggleAutobindChalices() {
      var state = host.getState();
      if (!state.unlockedAutobindChalices) return;
      state.autobindChalices = !state.autobindChalices;
      markSaveDirty();
      markDirty();
    }

    function soundToll() {
      var state = host.getState();
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
      var state = host.getState();
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

    function beginProcession() {
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
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
      var state = host.getState();
      if ((Number(state.favorEarned) || 0) < 1) return;
      if (normalizeAspect(state.aspect)) return;
      var a = normalizeAspect(id);
      if (!a) return;
      state.aspect = a;
      markChronicle("aspect");
      markSaveDirty();
      markDirty();
    }

    function swearVow(id) {
      var state = host.getState();
      if ((Number(state.favorEarned) || 0) < 1) return;
      if (normalizeVow(state.vow)) return;
      var v = normalizeVow(id);
      if (!v) return;
      if (!host.confirm(VOW_CONFIRM[v] || "Swear this vow?")) return;
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
      rememberVow: rememberVow,
      buyWell: buyWell,
      buyShade: buyShade,
      buySpirit: buySpirit,
      buyVessel: buyVessel,
      buyThrone: buyThrone,
      buyLantern: buyLantern,
      buyFetter: buyFetter,
      buyCenser: buyCenser,
      buyPyre: buyPyre,
      buyUrn: buyUrn,
      buyHearth: buyHearth,
      buyBeacon: buyBeacon,
      buySpire: buySpire,
      buyObelisk: buyObelisk,
      buyChalice: buyChalice,
      buyMark: buyMark,
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
      buySiphon: buySiphon,
      buyLevy: buyLevy,
      buyBindingToll: buyBindingToll,
      buyCinders: buyCinders,
      buyUrnRite: buyUrnRite,
      buyHearthRite: buyHearthRite,
      buyBeaconRite: buyBeaconRite,
      buySpireRite: buySpireRite,
      buyWellDraws: buyWellDraws,
      payTithe: payTithe,
      payNightTithe: payNightTithe,
      keepWake: keepWake,
      toggleAutobind: toggleAutobind,
      toggleAutobindSpirits: toggleAutobindSpirits,
      toggleAutobindVessels: toggleAutobindVessels,
      toggleAutobindLanterns: toggleAutobindLanterns,
      toggleAutobindFetters: toggleAutobindFetters,
      toggleAutobindCensers: toggleAutobindCensers,
      toggleAutobindThrones: toggleAutobindThrones,
      toggleAutobindPyres: toggleAutobindPyres,
      toggleAutobindUrns: toggleAutobindUrns,
      toggleAutobindHearths: toggleAutobindHearths,
      toggleAutobindBeacons: toggleAutobindBeacons,
      toggleAutobindSpires: toggleAutobindSpires,
      toggleAutobindObelisks: toggleAutobindObelisks,
      toggleAutobindChalices: toggleAutobindChalices,
      soundToll: soundToll,
      thinVeil: thinVeil,
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
      beginProcession: beginProcession,
      soundKnell: soundKnell,
      beginKnell: beginKnell,
      raiseChoir: raiseChoir,
      swearAspect: swearAspect,
      swearVow: swearVow,
      applyEdictStartingStock: applyEdictStartingStock,
      applyAutobindStarts: applyAutobindStarts,
      applyTributeAccountMutations: applyTributeAccountMutations,
      snapshotAccountFields: snapshotAccountFields,
      restoreAccountFields: restoreAccountFields,
      applyTributeTimerPhases: applyTributeTimerPhases,
      layTribute: layTribute
    };
  }

  global.SoulgatherActions = {
    create: create,
    VOW_CONFIRM: VOW_CONFIRM,
    TRIBUTE_AUTOBIND_STARTS: TRIBUTE_AUTOBIND_STARTS
  };
})(typeof window !== "undefined" ? window : globalThis);
