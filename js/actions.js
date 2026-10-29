(function (global) {
  "use strict";

  // Player actions (AZR-194): buy, rite, burst, autobind, aspect and vow handlers. Edicts, the Crown
  // and Tribute live in prestige.js; create() merges them into the object it returns.
  // Handlers mutate the object from host.getState() and request every page effect (toasts, announcements,
  // confirms, render, save) through host hooks; nothing in this file touches the DOM.
  var N = global.SoulgatherNum;
  var C = global.SoulgatherConfig;
  var E = global.SoulgatherEconomy;

  var BEACON_COST_BASE = C.BEACON_COST_BASE;
  var BEACON_COST_MULT = C.BEACON_COST_MULT;
  var BINDING_TOLL_MAX = C.BINDING_TOLL_MAX;
  var CHALICE_MAX = C.CHALICE_MAX;
  var CHOIR_LANTERN_COST = C.CHOIR_LANTERN_COST;
  var CHOIR_MAX = C.CHOIR_MAX;
  var COST_BASE = C.COST_BASE;
  var FETTER_COST_BASE = C.FETTER_COST_BASE;
  var FETTER_COST_MULT = C.FETTER_COST_MULT;
  var HEARTH_COST_BASE = C.HEARTH_COST_BASE;
  var HEARTH_COST_MULT = C.HEARTH_COST_MULT;
  var KNELL_COST = C.KNELL_COST;
  var LANTERN_COST_BASE = C.LANTERN_COST_BASE;
  var LANTERN_COST_MULT = C.LANTERN_COST_MULT;
  var NIGHT_TITHE_MIN = C.NIGHT_TITHE_MIN;
  var OBELISK_COST_BASE = C.OBELISK_COST_BASE;
  var OBELISK_COST_MULT = C.OBELISK_COST_MULT;
  var PROCESSION_COST = C.PROCESSION_COST;
  var PYRE_COST_BASE = C.PYRE_COST_BASE;
  var PYRE_COST_MULT = C.PYRE_COST_MULT;
  var SPIRE_COST_BASE = C.SPIRE_COST_BASE;
  var SPIRE_COST_MULT = C.SPIRE_COST_MULT;
  var TOLL_COST = C.TOLL_COST;
  var UNLOCK_WELL_DRAWS_SHADES = C.UNLOCK_WELL_DRAWS_SHADES;
  var URN_COST_BASE = C.URN_COST_BASE;
  var URN_COST_MULT = C.URN_COST_MULT;
  var VEIL_MIN = C.VEIL_MIN;
  var WAKE_COST = C.WAKE_COST;
  var WELL_DRAWS_COST = C.WELL_DRAWS_COST;
  var emptyVowsKnown = C.emptyVowsKnown;
  var normalizeAspect = C.normalizeAspect;
  var normalizeVow = C.normalizeVow;
  var beaconRiteCost = E.beaconRiteCost;
  var bindingTollCost = E.bindingTollCost;
  var bindingTollCostMult = E.bindingTollCostMult;
  var cinderCost = E.cinderCost;
  var hearthRiteCost = E.hearthRiteCost;
  var levyCost = E.levyCost;
  var markCost = E.markCost;
  var nightTitheCost = E.nightTitheCost;
  var nightTitheSecs = E.nightTitheSecs;
  var paidKnellSecs = E.paidKnellSecs;
  var paidProcessionSecs = E.paidProcessionSecs;
  var paidTitheSecs = E.paidTitheSecs;
  var paidTollSecs = E.paidTollSecs;
  var paidVeilSecs = E.paidVeilSecs;
  var paidWakeSecs = E.paidWakeSecs;
  var siphonCost = E.siphonCost;
  var spireRiteCost = E.spireRiteCost;
  var urnRiteCost = E.urnRiteCost;
  var veilCost = E.veilCost;

  var VOW_CONFIRM = {
    stillness: "Swear Stillness?\n\nThe well will not answer a draw this emptying. This cannot be undone until Tribute.",
    poverty: "Swear Poverty?\n\nThrones will not autobind this emptying. This cannot be undone until Tribute.",
    hunger: "Swear Hunger?\n\nThe Tithe costs twice this emptying. This cannot be undone until Tribute.",
    ember: "Swear Ember?\n\nNight\u2019s Tithe and the Wake will not answer this emptying. This cannot be undone until Tribute."
  };

  function create(host) {
    var announce = host.announce;
    var bindingTollRowOpen = host.bindingTollRowOpen;
    var chalicePlan = host.chalicePlan;
    var checkUnlock = host.checkUnlock;
    var currentProducerCostMult = host.currentProducerCostMult;
    var currentTitheCost = host.currentTitheCost;
    var knellActive = host.knellActive;
    var markChronicle = host.markChronicle;
    var markDirty = host.markDirty;
    var markSaveDirty = host.markSaveDirty;
    var nightActive = host.nightActive;
    var noteHollowManualSpend = host.noteHollowManualSpend;
    var processionActive = host.processionActive;
    var purchasePlan = host.purchasePlan;
    var remembranceUnlocked = host.remembranceUnlocked;
    var showToast = host.showToast;
    var syncChronicle = host.syncChronicle;
    var titheActive = host.titheActive;
    var toastBulk = host.toastBulk;
    var tollActive = host.tollActive;
    var veilActive = host.veilActive;
    var wakeActive = host.wakeActive;
    var wellPurchasePlan = host.wellPurchasePlan;
    var P = global.SoulgatherPrestige.create(host);

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
      state.nightLeft = nightTitheSecs(state.deeperNightLevel);
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

    return Object.assign({
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
      beginProcession: beginProcession,
      soundKnell: soundKnell,
      raiseChoir: raiseChoir,
      swearAspect: swearAspect,
      swearVow: swearVow
    }, P);
  }

  global.SoulgatherActions = {
    create: create
  };
})(typeof window !== "undefined" ? window : globalThis);
