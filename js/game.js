(function () {
  "use strict";

  var N = globalThis.SoulgatherNum;

  var SAVE_KEY = "soulgather-v0";
  var COST_BASE = 10;
  var COST_MULT = 1.15;
  var WELL_COST_BASE = 25;
  var WELL_COST_MULT = 1.5;
  var LANTERN_COST_BASE = 30;
  var LANTERN_COST_MULT = 1.2;
  var MARK_COST_BASE = 8;
  var MARK_COST_MULT = 2;
  var SHADE_SOULS_PER_SEC = 1;
  var SPIRIT_SHADES_PER_SEC = 0.1;
  var VESSEL_SPIRITS_PER_SEC = 0.1;
  var CENSER_ASH_PER_SEC = 0.2;
  var ASH_FROM_SHADE_FRAC = 0.01;
  var UNLOCK_SHADES = 10;
  var UNLOCK_LIFETIME = 100;
  var UNLOCK_SPIRITS_FOR_VESSELS = 5;
  var UNLOCK_LIFETIME_SHADES = 50;
  var UNLOCK_VESSELS_FOR_THRONES = 1;
  var UNLOCK_LIFETIME_SPIRITS = 50;
  var UNLOCK_WELL_DRAWS_SHADES = 3;
  var UNLOCK_LANTERNS = 3;
  var UNLOCK_MARKS_LIFETIME = 500;
  var UNLOCK_CENSERS_VESSELS = 1;
  var UNLOCK_CENSERS_LIFETIME_SPIRITS = 25;
  var WELL_DRAWS_COST = 50;
  var BULK_CAP = 10000;
  var AUTOSAVE_MS = 5000;
  var MAX_DT = 8 * 60 * 60;
  var TOAST_MS = 5200;
  var AWAY_MIN_DT = 2;
  var TITHE_MIN = 25;
  var TITHE_FRAC = 0.1;
  var TITHE_SECS = 60;

  function num(v) {
    return N.from(v);
  }

  function nVal(v) {
    if (v && typeof v === "object" && typeof v.m === "number") {
      var n = N.toNumber(v);
      if (!isFinite(n)) return n > 0 ? 1e300 : 0;
      return n;
    }
    return Number(v) || 0;
  }

  function addOwned(owned, i) {
    i = Number(i) || 0;
    if (owned && typeof owned === "object" && typeof owned.m === "number") {
      return N.add(N.floor(N.max(owned, 0)), i);
    }
    return Math.max(0, Math.floor(Number(owned) || 0)) + i;
  }

  function producerCost(owned) {
    return N.cost(COST_BASE, COST_MULT, owned);
  }

  function shadeCost(owned) {
    return producerCost(owned);
  }

  function spiritCost(owned) {
    return producerCost(owned);
  }

  function vesselCost(owned) {
    return producerCost(owned);
  }

  function throneCost(owned) {
    return producerCost(owned);
  }

  function lanternCost(owned) {
    return N.cost(LANTERN_COST_BASE, LANTERN_COST_MULT, owned);
  }

  function censerCost(owned) {
    return producerCost(owned);
  }

  function markCost(level) {
    return N.cost(MARK_COST_BASE, MARK_COST_MULT, level);
  }

  function wellCost(depth) {
    return N.cost(WELL_COST_BASE, WELL_COST_MULT, depth);
  }

  function bulkCost(base, owned, k, mult) {
    var b = Number(base);
    if (!isFinite(b) || b <= 0) b = COST_BASE;
    if (mult == null) mult = COST_MULT;
    var n = Math.max(0, Math.floor(k));
    if (n > BULK_CAP) n = BULK_CAP;
    var total = N.fromNumber(0);
    var i;
    for (i = 0; i < n; i++) {
      total = N.add(total, N.cost(b, mult, addOwned(owned, i)));
    }
    return total;
  }

  function maxAffordable(base, owned, currency, mult) {
    var b = Number(base);
    if (!isFinite(b) || b <= 0) b = COST_BASE;
    if (mult == null) mult = COST_MULT;
    var remaining = num(currency);
    var k = 0;
    while (k < BULK_CAP) {
      var c = N.cost(b, mult, addOwned(owned, k));
      if (N.cmp(remaining, c) < 0) break;
      remaining = N.sub(remaining, c);
      k += 1;
    }
    return k;
  }

  function favorGain(lifetimeSouls) {
    var n = N.max(num(lifetimeSouls), 0);
    if (N.cmp(n, 0) <= 0) return 0;
    if (n.e < 15) {
      var v = N.toNumber(n);
      if (isFinite(v) && v >= 0) {
        return Math.floor(Math.sqrt(v / 25000));
      }
    }
    var q = N.div(n, 25000);
    var s = N.floor(N.add(N.pow(q, 0.5), N.fromNumber(1e-9)));
    var asN = N.toNumber(s);
    if (!isFinite(asN) || asN > Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;
    if (asN < 0) return 0;
    return Math.floor(asN);
  }

  function prestigeMult(favorEarned) {
    return 1 + 0.5 * (Number(favorEarned) || 0);
  }

  function harvestMult(on) {
    return on ? 1.5 : 1;
  }

  function bindingMult(on) {
    return on ? 1.5 : 1;
  }

  function throneWeight(dominion) {
    return dominion ? 0.15 : 0.1;
  }

  function prodMult(favorEarned, thrones, edictLevel, weight) {
    var w = weight == null ? 0.1 : Number(weight);
    if (!isFinite(w)) w = 0.1;
    return (
      prestigeMult(favorEarned) *
      (1 + w * (Number(thrones) || 0)) *
      (1 + 0.25 * (Number(edictLevel) || 0))
    );
  }

  function titheCost(souls) {
    var n = N.max(num(souls), 0);
    var tenth = N.floor(N.mul(n, TITHE_FRAC));
    return N.max(N.fromNumber(TITHE_MIN), tenth);
  }

  function titheMult(on) {
    return on ? 2 : 1;
  }

  function edictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 1 * Math.pow(2, n);
  }

  function memoryCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 2 * Math.pow(2, n);
  }

  function echoCost(level) {
    var n = Math.max(0, Math.floor(level));
    if (n >= 1) return Infinity;
    return 3;
  }

  function seatCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 5 * Math.pow(2, n);
  }

  function siphonCost(level) {
    return N.cost(50, 3, level);
  }

  function levyCost(level) {
    return N.cost(15, 3, level);
  }

  function siphonMult(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n < 40) return N.fromNumber(Math.pow(2, n));
    return N.pow(N.fromNumber(2), n);
  }

  function levyMult(level) {
    return siphonMult(level);
  }

  function lanternMult(lanterns) {
    if (lanterns && typeof lanterns === "object" && typeof lanterns.m === "number") {
      if (lanterns.e < 12) {
        return N.fromNumber(1 + 0.05 * (N.toNumber(lanterns) || 0));
      }
      return N.add(1, N.mul(0.05, lanterns));
    }
    return N.fromNumber(1 + 0.05 * (Number(lanterns) || 0));
  }

  function emberMult(level) {
    var n = Math.max(0, Math.floor(Number(level) || 0));
    if (n < 40) return N.fromNumber(Math.pow(1.25, n));
    return N.pow(N.fromNumber(1.25), n);
  }

  function chainMult(level) {
    return emberMult(level);
  }

  function hollowMult(level) {
    return emberMult(level);
  }

  var ASPECT_IDS = { harvest: "harvest", binding: "binding", dominion: "dominion" };
  var ASPECT_NAMES = {
    harvest: "Harvest",
    binding: "Binding",
    dominion: "Dominion"
  };

  function normalizeAspect(raw) {
    if (raw === "harvest" || raw === "aspectHarvest") return "harvest";
    if (raw === "binding" || raw === "aspectBinding") return "binding";
    if (raw === "dominion" || raw === "aspectDominion") return "dominion";
    return "";
  }

  function normalizeBuyMode(mode) {
    if (mode === "10" || mode === "max" || mode === "1") return mode;
    return "1";
  }

  var CHRONICLE_ORDER = [
    "soul",
    "shade",
    "spirits",
    "well",
    "vessels",
    "throne",
    "rite",
    "wellDraw",
    "tribute",
    "aspect",
    "echo",
    "seat",
    "lantern",
    "ash",
    "mark",
    "censer"
  ];

  var CHRONICLE_LINES = {
    soul: "The first soul was drawn.",
    shade: "The first Shade was bound.",
    spirits: "Bound Spirits answered the well.",
    well: "The well was carved deeper.",
    vessels: "A vessel opened to house a will.",
    throne: "A throne was raised.",
    rite: "The first rite was cut.",
    wellDraw: "The well began to draw.",
    tribute: "Tribute was laid. The GodKing remembers.",
    aspect: "An aspect was sworn.",
    echo: "An echo was spoken.",
    seat: "A seat was raised.",
    lantern: "A lantern was kindled.",
    ash: "Ash gathered at the well's lip.",
    mark: "A mark was pressed.",
    censer: "A censer was raised."
  };

  function formatGoalNum(n) {
    if (typeof SoulgatherFormat !== "undefined" && SoulgatherFormat.formatNumber) {
      return SoulgatherFormat.formatNumber(n);
    }
    if (n && typeof n === "object" && typeof n.m === "number") {
      n = nVal(n);
    }
    if (n == null || !isFinite(n)) return "0";
    if (Math.abs(n - Math.round(n)) < 0.05) return String(Math.round(n));
    return Number(n).toFixed(1);
  }

  function nextGoal(view, format) {
    view = view || {};
    format = format || formatGoalNum;
    var shades = nVal(view.shades);
    var spirits = nVal(view.spirits);
    var lifetimeSouls = nVal(view.lifetimeSouls);
    var lifetimeShades = nVal(view.lifetimeShades);
    var lanterns = nVal(view.lanterns);
    var censers = nVal(view.censers);
    var unlockedSpirits = !!view.unlockedSpirits;
    var unlockedVessels = !!view.unlockedVessels;
    var unlockedThrones = !!view.unlockedThrones;
    var favorEarned = Number(view.favorEarned) || 0;
    var gain = favorGain(view.lifetimeSouls);
    var sworn = normalizeAspect(view.aspect);
    var marksBought =
      (Number(view.emberLevel) || 0) +
      (Number(view.chainLevel) || 0) +
      (Number(view.hollowLevel) || 0);

    if (favorEarned >= 1 && !sworn) {
      return "Swear an Aspect. The GodKing waits.";
    }

    if (shades < 1 && lifetimeShades < 1 && !unlockedSpirits) {
      return "Bind a Shade to wake the well.";
    }
    if (!unlockedSpirits) {
      if (view.unlockedLanterns && lanterns < 1) {
        return "Kindle a Lantern. A light for the echoes.";
      }
      return (
        "The well thickens. Bound Spirits at 10 Shades. " +
        format(view.shades != null ? view.shades : shades) +
        " / 10 Shades"
      );
    }
    if (!unlockedVessels) {
      return "Vessels at 5 Bound Spirits. " + format(view.spirits != null ? view.spirits : spirits) + " / 5";
    }
    if (!unlockedThrones) {
      return "A throne at 1 Vessel.";
    }
    if (gain >= 1) {
      return "Lay Tribute. The GodKing will remember.";
    }
    if (view.unlockedLanterns && lanterns < 1) {
      return "Kindle a Lantern. A light for the echoes.";
    }
    if (view.unlockedMarks && marksBought < 1) {
      return "Press a Mark. Ash is what the well will not keep.";
    }
    if (view.unlockedCensers && censers < 1) {
      return "Raise a Censer. They burn what the well discards.";
    }
    if (favorEarned >= 1) {
      return "The well gathers. Another Tribute at 25000 lifetime Souls this run.";
    }
    return (
      "Tribute when the GodKing will remember. " +
      format(view.lifetimeSouls != null ? view.lifetimeSouls : lifetimeSouls) +
      " / 25000 lifetime Souls."
    );
  }

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
    return added;
  }

  function isTypingTarget(el) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function freshState() {
    return {
      souls: N.fromNumber(0),
      lifetimeSouls: N.fromNumber(0),
      lifetimeShades: N.fromNumber(0),
      lifetimeSpirits: N.fromNumber(0),
      shades: N.fromNumber(0),
      spirits: N.fromNumber(0),
      vessels: N.fromNumber(0),
      thrones: 0,
      wellDepth: 0,
      lanterns: N.fromNumber(0),
      ash: N.fromNumber(0),
      censers: N.fromNumber(0),
      emberLevel: 0,
      chainLevel: 0,
      hollowLevel: 0,
      unlockedSpirits: false,
      unlockedVessels: false,
      unlockedWell: false,
      unlockedThrones: false,
      unlockedLanterns: false,
      unlockedMarks: false,
      unlockedCensers: false,
      toastShown: false,
      vesselToastShown: false,
      throneToastShown: false,
      lanternToastShown: false,
      censerToastShown: false,
      favor: 0,
      favorEarned: 0,
      edictLevel: 0,
      memoryLevel: 0,
      echoLevel: 0,
      seatLevel: 0,
      buyMode: "1",
      siphonLevel: 0,
      levyLevel: 0,
      wellDraws: false,
      unlockedWellDraws: false,
      aspect: "",
      lastTick: Date.now(),
      chronicle: [],
      titheLeft: 0,
      runStartedAt: Date.now(),
      allTimeSouls: N.fromNumber(0),
      tributesLaid: 0
    };
  }

  var state = freshState();
  var lastFrame = 0;
  var toastTimer = 0;
  var pendingAwayToast = null;
  var els = {};

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function currentMult() {
    return prodMult(
      state.favorEarned,
      state.thrones,
      state.edictLevel,
      throneWeight(normalizeAspect(state.aspect) === "dominion")
    );
  }

  function titheActive() {
    return (Number(state.titheLeft) || 0) > 0;
  }

  function rateMult() {
    return currentMult() * titheMult(titheActive());
  }

  function clickPower() {
    return N.mul(1 + (Number(state.wellDepth) || 0), rateMult());
  }

  function shadeSoulsPerSec() {
    return N.mul(
      N.mul(
        N.mul(
          N.mul(
            N.mul(N.mul(state.shades, SHADE_SOULS_PER_SEC), rateMult()),
            siphonMult(state.siphonLevel)
          ),
          harvestMult(normalizeAspect(state.aspect) === "harvest")
        ),
        lanternMult(state.lanterns)
      ),
      emberMult(state.emberLevel)
    );
  }

  function soulsPerSec() {
    var rate = shadeSoulsPerSec();
    if (state.wellDraws) rate = N.add(rate, clickPower());
    return rate;
  }

  function shadesPerSec() {
    return N.mul(
      N.mul(
        N.mul(
          N.mul(N.mul(state.spirits, SPIRIT_SHADES_PER_SEC), rateMult()),
          levyMult(state.levyLevel)
        ),
        bindingMult(normalizeAspect(state.aspect) === "binding")
      ),
      chainMult(state.chainLevel)
    );
  }

  function spiritsPerSec() {
    return N.mul(
      N.mul(N.mul(state.vessels, VESSEL_SPIRITS_PER_SEC), rateMult()),
      hollowMult(state.hollowLevel)
    );
  }

  function ashPerSec() {
    var fromShades = N.mul(shadeSoulsPerSec(), ASH_FROM_SHADE_FRAC);
    var fromCensers = N.mul(N.mul(state.censers, CENSER_ASH_PER_SEC), rateMult());
    return N.add(fromShades, fromCensers);
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

  function applyDt(dt) {
    if (dt <= 0 || !isFinite(dt)) return;
    dt = clamp(dt, 0, MAX_DT);

    var left = Number(state.titheLeft) || 0;
    if (left < 0) left = 0;

    if (left > 0 && dt > left) {
      applyRates(left);
      state.titheLeft = 0;
      applyRates(dt - left);
    } else {
      applyRates(dt);
      if (left > 0) {
        state.titheLeft = left - dt;
        if (state.titheLeft < 0) state.titheLeft = 0;
      }
    }

    checkUnlock();
  }

  function checkUnlock() {
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

    if (
      !state.unlockedMarks &&
      (N.cmp(state.ash, 1) >= 0 || N.cmp(state.lifetimeSouls, UNLOCK_MARKS_LIFETIME) >= 0)
    ) {
      state.unlockedMarks = true;
    }

    if (!state.unlockedWellDraws && N.cmp(state.shades, UNLOCK_WELL_DRAWS_SHADES) >= 0) {
      state.unlockedWellDraws = true;
    }
    syncChronicle();
  }

  function harvest() {
    var power = clickPower();
    state.souls = N.add(state.souls, power);
    state.lifetimeSouls = N.add(state.lifetimeSouls, power);
    state.allTimeSouls = N.add(state.allTimeSouls, power);
    checkUnlock();
    save();
    pulseGather();
    spawnRipple(power);
    render();
  }

  function purchasePlan(owned, currency, base, mult) {
    if (base == null) base = COST_BASE;
    if (mult == null) mult = COST_MULT;
    var one = N.cost(base, mult, owned);
    var mode = state.buyMode;
    if (mode === "10") {
      var cost10 = bulkCost(base, owned, 10, mult);
      return { k: 10, cost: cost10, can: N.cmp(currency, cost10) >= 0 };
    }
    if (mode === "max") {
      var k = maxAffordable(base, owned, currency, mult);
      if (k < 1) {
        return { k: 0, cost: one, can: false };
      }
      return { k: k, cost: bulkCost(base, owned, k, mult), can: true };
    }
    return { k: 1, cost: one, can: N.cmp(currency, one) >= 0 };
  }

  function buyWell() {
    if (!state.unlockedWell) return;
    var cost = wellCost(state.wellDepth);
    if (N.cmp(state.souls, cost) < 0) return;
    state.souls = N.sub(state.souls, cost);
    state.wellDepth += 1;
    syncChronicle();
    save();
    render();
  }

  function buyShade() {
    var plan = purchasePlan(state.shades, state.souls);
    if (!plan.can || plan.k < 1) return;
    state.souls = N.sub(state.souls, plan.cost);
    state.shades = N.add(state.shades, plan.k);
    state.lifetimeShades = N.add(state.lifetimeShades, plan.k);
    checkUnlock();
    save();
    render();
  }

  function buySpirit() {
    if (!state.unlockedSpirits) return;
    var plan = purchasePlan(state.spirits, state.shades);
    if (!plan.can || plan.k < 1) return;
    state.shades = N.sub(state.shades, plan.cost);
    state.spirits = N.add(state.spirits, plan.k);
    state.lifetimeSpirits = N.add(state.lifetimeSpirits, plan.k);
    checkUnlock();
    save();
    render();
  }

  function buyVessel() {
    if (!state.unlockedVessels) return;
    var plan = purchasePlan(state.vessels, state.spirits);
    if (!plan.can || plan.k < 1) return;
    state.spirits = N.sub(state.spirits, plan.cost);
    state.vessels = N.add(state.vessels, plan.k);
    checkUnlock();
    save();
    render();
  }

  function buyThrone() {
    if (!state.unlockedThrones) return;
    var plan = purchasePlan(state.thrones, state.vessels);
    if (!plan.can || plan.k < 1) return;
    state.vessels = N.sub(state.vessels, plan.cost);
    state.thrones += plan.k;
    syncChronicle();
    save();
    render();
  }

  function buyLantern() {
    if (!state.unlockedLanterns) return;
    var cost = lanternCost(state.lanterns);
    if (N.cmp(state.souls, cost) < 0) return;
    state.souls = N.sub(state.souls, cost);
    state.lanterns = N.add(state.lanterns, 1);
    if (!state.lanternToastShown) {
      state.lanternToastShown = true;
      showToast("A lantern kindles.");
    }
    markChronicle("lantern");
    save();
    render();
  }

  function buyCenser() {
    if (!state.unlockedCensers) return;
    var cost = censerCost(state.censers);
    if (N.cmp(state.vessels, cost) < 0) return;
    state.vessels = N.sub(state.vessels, cost);
    state.censers = N.add(state.censers, 1);
    markChronicle("censer");
    save();
    render();
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
    state.ash = N.sub(state.ash, cost);
    state[levelKey] += 1;
    markChronicle("mark");
    save();
    render();
  }

  function buyEdict() {
    var cost = edictCost(state.edictLevel);
    if (state.favor < cost) return;
    state.favor -= cost;
    state.edictLevel += 1;
    save();
    render();
  }

  function buyMemory() {
    var cost = memoryCost(state.memoryLevel);
    if (state.favor < cost) return;
    state.favor -= cost;
    state.memoryLevel += 1;
    save();
    render();
  }

  function buyEcho() {
    if ((Number(state.echoLevel) || 0) >= 1) return;
    var cost = echoCost(state.echoLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.echoLevel = 1;
    markChronicle("echo");
    save();
    render();
  }

  function buySeat() {
    var cost = seatCost(state.seatLevel);
    if (!isFinite(cost) || state.favor < cost) return;
    state.favor -= cost;
    state.seatLevel += 1;
    markChronicle("seat");
    save();
    render();
  }

  function buySiphon() {
    var cost = siphonCost(state.siphonLevel);
    if (N.cmp(state.souls, cost) < 0) return;
    state.souls = N.sub(state.souls, cost);
    state.siphonLevel += 1;
    syncChronicle();
    save();
    render();
  }

  function buyLevy() {
    if (!state.unlockedSpirits) return;
    var cost = levyCost(state.levyLevel);
    if (N.cmp(state.shades, cost) < 0) return;
    state.shades = N.sub(state.shades, cost);
    state.levyLevel += 1;
    syncChronicle();
    save();
    render();
  }

  function buyWellDraws() {
    if (state.wellDraws) return;
    if (!state.unlockedWellDraws && N.cmp(state.shades, UNLOCK_WELL_DRAWS_SHADES) < 0) return;
    if (N.cmp(state.souls, WELL_DRAWS_COST) < 0) return;
    state.souls = N.sub(state.souls, WELL_DRAWS_COST);
    state.wellDraws = true;
    state.unlockedWellDraws = true;
    syncChronicle();
    save();
    render();
  }

  function payTithe() {
    if (!state.unlockedWell) return;
    if (titheActive()) return;
    if (N.cmp(state.souls, TITHE_MIN) < 0) return;
    var cost = titheCost(state.souls);
    if (N.cmp(state.souls, cost) < 0) return;
    state.souls = N.sub(state.souls, cost);
    state.titheLeft = TITHE_SECS;
    showToast("The GodKing takes his cut.");
    save();
    render();
  }

  function swearAspect(id) {
    if ((Number(state.favorEarned) || 0) < 1) return;
    if (normalizeAspect(state.aspect)) return;
    var a = normalizeAspect(id);
    if (!a) return;
    state.aspect = a;
    markChronicle("aspect");
    save();
    render();
  }

  function setBuyMode(mode) {
    mode = normalizeBuyMode(mode);
    if (state.buyMode === mode) return;
    state.buyMode = mode;
    save();
    render();
  }

  var SAVE_FIELDS = [
    "souls",
    "lifetimeSouls",
    "lifetimeShades",
    "lifetimeSpirits",
    "shades",
    "spirits",
    "vessels",
    "thrones",
    "wellDepth",
    "lanterns",
    "ash",
    "censers",
    "emberLevel",
    "chainLevel",
    "hollowLevel",
    "unlockedSpirits",
    "unlockedVessels",
    "unlockedWell",
    "unlockedThrones",
    "unlockedLanterns",
    "unlockedMarks",
    "unlockedCensers",
    "toastShown",
    "vesselToastShown",
    "throneToastShown",
    "lanternToastShown",
    "censerToastShown",
    "favor",
    "favorEarned",
    "edictLevel",
    "memoryLevel",
    "echoLevel",
    "seatLevel",
    "buyMode",
    "siphonLevel",
    "levyLevel",
    "wellDraws",
    "unlockedWellDraws",
    "aspect",
    "lastTick",
    "chronicle",
    "titheLeft",
    "runStartedAt",
    "allTimeSouls",
    "tributesLaid"
  ];

  function dumpNum(v) {
    return N.dump(v);
  }

  function serializeState() {
    return {
      souls: dumpNum(state.souls),
      lifetimeSouls: dumpNum(state.lifetimeSouls),
      lifetimeShades: dumpNum(state.lifetimeShades),
      lifetimeSpirits: dumpNum(state.lifetimeSpirits),
      shades: dumpNum(state.shades),
      spirits: dumpNum(state.spirits),
      vessels: dumpNum(state.vessels),
      thrones: state.thrones,
      wellDepth: state.wellDepth,
      lanterns: dumpNum(state.lanterns),
      ash: dumpNum(state.ash),
      censers: dumpNum(state.censers),
      emberLevel: state.emberLevel,
      chainLevel: state.chainLevel,
      hollowLevel: state.hollowLevel,
      unlockedSpirits: state.unlockedSpirits,
      unlockedVessels: state.unlockedVessels,
      unlockedWell: state.unlockedWell,
      unlockedThrones: state.unlockedThrones,
      unlockedLanterns: state.unlockedLanterns,
      unlockedMarks: state.unlockedMarks,
      unlockedCensers: state.unlockedCensers,
      toastShown: state.toastShown,
      vesselToastShown: state.vesselToastShown,
      throneToastShown: state.throneToastShown,
      lanternToastShown: state.lanternToastShown,
      censerToastShown: state.censerToastShown,
      favor: state.favor,
      favorEarned: state.favorEarned,
      edictLevel: state.edictLevel,
      memoryLevel: state.memoryLevel,
      echoLevel: state.echoLevel,
      seatLevel: state.seatLevel,
      buyMode: state.buyMode,
      siphonLevel: state.siphonLevel,
      levyLevel: state.levyLevel,
      wellDraws: state.wellDraws,
      unlockedWellDraws: state.unlockedWellDraws,
      aspect: normalizeAspect(state.aspect),
      lastTick: Date.now(),
      chronicle: state.chronicle || [],
      titheLeft: Number(state.titheLeft) || 0,
      runStartedAt: Number(state.runStartedAt) || Date.now(),
      allTimeSouls: dumpNum(state.allTimeSouls),
      tributesLaid: Number(state.tributesLaid) || 0
    };
  }

  function isSaveShape(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return false;
    var i;
    for (i = 0; i < SAVE_FIELDS.length; i++) {
      if (Object.prototype.hasOwnProperty.call(data, SAVE_FIELDS[i])) return true;
    }
    return false;
  }

  function applySaveData(data) {
    state.souls = N.load(data.souls);
    state.lifetimeSouls = N.load(data.lifetimeSouls);
    state.lifetimeShades = N.load(data.lifetimeShades);
    state.lifetimeSpirits = N.load(data.lifetimeSpirits);
    state.shades = N.load(data.shades);
    state.spirits = N.load(data.spirits);
    state.vessels = N.load(data.vessels);
    state.thrones = Number(data.thrones) || 0;
    state.wellDepth = Number(data.wellDepth) || 0;
    state.lanterns = N.load(data.lanterns);
    state.ash = N.load(data.ash);
    state.censers = N.load(data.censers);
    state.emberLevel = Number(data.emberLevel) || 0;
    state.chainLevel = Number(data.chainLevel) || 0;
    state.hollowLevel = Number(data.hollowLevel) || 0;
    state.unlockedSpirits = !!data.unlockedSpirits;
    state.unlockedVessels = !!data.unlockedVessels;
    state.unlockedWell = !!data.unlockedWell;
    state.unlockedThrones = !!data.unlockedThrones;
    state.unlockedLanterns = !!data.unlockedLanterns;
    state.unlockedMarks = !!data.unlockedMarks;
    state.unlockedCensers = !!data.unlockedCensers;
    state.toastShown = !!data.toastShown;
    state.vesselToastShown = !!data.vesselToastShown;
    state.throneToastShown = !!data.throneToastShown;
    state.lanternToastShown = !!data.lanternToastShown;
    state.censerToastShown = !!data.censerToastShown;
    state.favor = Number(data.favor) || 0;
    if (data.favorEarned == null) {
      state.favorEarned = Number(data.favor) || 0;
    } else {
      state.favorEarned = Number(data.favorEarned) || 0;
    }
    state.edictLevel = Number(data.edictLevel) || 0;
    state.memoryLevel = Number(data.memoryLevel) || 0;
    state.echoLevel = Number(data.echoLevel) || 0;
    if (state.echoLevel > 1) state.echoLevel = 1;
    state.seatLevel = Number(data.seatLevel) || 0;
    state.buyMode = normalizeBuyMode(data.buyMode);
    state.siphonLevel = Number(data.siphonLevel) || 0;
    state.levyLevel = Number(data.levyLevel) || 0;
    state.wellDraws = !!data.wellDraws;
    state.unlockedWellDraws = !!data.unlockedWellDraws;
    state.aspect = normalizeAspect(data.aspect);
    state.lastTick = Number(data.lastTick) || Date.now();
    state.chronicle = normalizeChronicle(data.chronicle);
    state.titheLeft = Number(data.titheLeft) || 0;
    if (state.titheLeft < 0) state.titheLeft = 0;
    state.runStartedAt = Number(data.runStartedAt) || Date.now();
    if (data.allTimeSouls == null) {
      state.allTimeSouls = N.load(data.lifetimeSouls);
    } else {
      state.allTimeSouls = N.load(data.allTimeSouls);
    }
    if (N.cmp(state.allTimeSouls, 0) < 0) state.allTimeSouls = N.fromNumber(0);
    state.tributesLaid = Math.max(0, Math.floor(Number(data.tributesLaid) || 0));
  }

  function adoptSave(data) {
    state = freshState();
    applySaveData(data);
    hideToast(true);
    hideUnlockCards();
    checkUnlock();
    if (state.unlockedWell) revealWell();
    if (state.unlockedLanterns) revealLanterns(false);
    if (state.unlockedSpirits) revealSpirits(false);
    if (state.unlockedVessels) revealVessels(false);
    if (state.unlockedThrones) revealThrones(false);
    if (state.unlockedCensers) revealCensers(false);
    if (els.chronicleList) {
      els.chronicleList.dataset.sig = "";
    }
    lastFrame = 0;
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(serializeState()));
    } catch (err) {
      /* private mode / quota — game still runs */
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") return;
      applySaveData(data);

      var offline = (Date.now() - state.lastTick) / 1000;
      var soulsBefore = N.clone(state.souls);
      var shadesBefore = N.clone(state.shades);
      if (offline > 0.25) {
        applyDt(offline);
      }
      var soulsGained = N.sub(state.souls, soulsBefore);
      var shadesGained = N.sub(state.shades, shadesBefore);
      state.lastTick = Date.now();
      syncChronicle();
      save();

      if (offline > AWAY_MIN_DT && (N.cmp(soulsGained, 0) > 0 || N.cmp(shadesGained, 0) > 0)) {
        var awayMsg = "The well gathered while you were away.";
        if (N.cmp(soulsGained, 0) > 0) {
          awayMsg += " +" + fmt(soulsGained) + " Souls";
        }
        pendingAwayToast = awayMsg;
      }
    } catch (err) {
      state = freshState();
    }
  }

  function exportMemory() {
    save();
    var json;
    try {
      json = JSON.stringify(serializeState());
    } catch (err) {
      showToast("The memory would not bind.");
      return;
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
    state.lastTick = Date.now();
    syncChronicle();
    save();
    render();
    showToast("The well's memory is bound.");
  }

  function hideUnlockCards() {
    hideCard(els.wellCard);
    hideCard(els.spiritCard);
    hideCard(els.vesselCard);
    hideCard(els.throneCard);
    hideCard(els.lanternCard);
    hideCard(els.censerCard);
    hideTribute();
    hideRites();
    hideMarks();
    hideAspects();
  }

  function resetGame() {
    var ok = window.confirm(
      "Abandon the well?\n\nEvery soul, shade, bound will, Favor, and Reliquary scatter. This cannot be undone."
    );
    if (!ok) return;
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

  function layTribute() {
    var gain = favorGain(state.lifetimeSouls);
    if (gain < 1) return;
    var ok = window.confirm(
      "Empty the well?\n\nThe GodKing keeps the Favor. Reliquary stays. This gathering is forfeit."
    );
    if (!ok) return;
    markChronicle("tribute");
    var keptFavor = (Number(state.favor) || 0) + gain;
    var keptEarned = (Number(state.favorEarned) || 0) + gain;
    var keptEdict = state.edictLevel;
    var keptMemory = state.memoryLevel;
    var keptEcho = Number(state.echoLevel) || 0;
    if (keptEcho > 1) keptEcho = 1;
    var keptSeat = Number(state.seatLevel) || 0;
    var keptBuy = state.buyMode;
    var keptChronicle = (state.chronicle || []).slice();
    var keptAllTime = N.clone(state.allTimeSouls);
    var keptTributes = (Number(state.tributesLaid) || 0) + 1;
    state = freshState();
    state.favor = keptFavor;
    state.favorEarned = keptEarned;
    state.edictLevel = keptEdict;
    state.memoryLevel = keptMemory;
    state.echoLevel = keptEcho;
    state.seatLevel = keptSeat;
    state.buyMode = keptBuy;
    state.chronicle = keptChronicle;
    state.aspect = "";
    state.allTimeSouls = keptAllTime;
    state.tributesLaid = keptTributes;
    state.titheLeft = 0;
    state.runStartedAt = Date.now();
    if (keptMemory > 0) {
      state.shades = N.fromNumber(keptMemory);
      state.unlockedWell = true;
    }
    state.thrones = keptSeat;
    if (keptSeat >= 1) {
      state.unlockedThrones = true;
    }
    if (keptEcho >= 1) {
      state.wellDraws = true;
      state.unlockedWellDraws = true;
    }
    hideToast(true);
    hideUnlockCards();
    checkUnlock();
    if (state.unlockedWell) revealWell();
    if (state.unlockedLanterns) revealLanterns(false);
    if (state.unlockedSpirits) revealSpirits(false);
    if (state.unlockedVessels) revealVessels(false);
    if (state.unlockedThrones) revealThrones(false);
    if (state.unlockedCensers) revealCensers(false);
    save();
    render();
  }


  function fmt(n) {
    return SoulgatherFormat.formatNumber(n);
  }

  function formatMult(m) {
    if (m && typeof m === "object" && typeof m.m === "number") {
      m = N.toNumber(m);
    }
    if (!isFinite(m)) m = 1;
    return "\u00d7" + m.toFixed(1);
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
      save();
    }
  }

  function revealVessels(withToast) {
    revealCard(els.vesselCard);
    if (withToast && !state.vesselToastShown) {
      state.vesselToastShown = true;
      showToast("A vessel waits. A will can be housed.");
      save();
    }
  }

  function revealThrones(withToast) {
    revealCard(els.throneCard);
    if (withToast && !state.throneToastShown) {
      state.throneToastShown = true;
      showToast("A throne may be raised.");
      save();
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
      save();
    }
  }

  function hideTribute() {
    if (els.tributePanel) els.tributePanel.classList.add("is-hidden");
    if (els.tributeFootBtn) els.tributeFootBtn.classList.add("is-hidden");
  }

  function hideRites() {
    if (els.ritesPanel) els.ritesPanel.classList.add("is-hidden");
    if (els.levyRow) els.levyRow.classList.add("is-hidden");
    if (els.wellDrawsRow) els.wellDrawsRow.classList.add("is-hidden");
    if (els.titheRow) els.titheRow.classList.add("is-hidden");
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
  }

  function showToast(message) {
    if (!els.toast) return;
    window.clearTimeout(toastTimer);
    els.toast.classList.remove("is-visible");
    void els.toast.offsetWidth;
    els.toast.textContent = message;
    els.toast.classList.remove("is-hidden");
    void els.toast.offsetWidth;
    els.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(function () {
      hideToast(false);
    }, TOAST_MS);
  }

  function hideToast(immediate) {
    if (!els.toast) return;
    els.toast.classList.remove("is-visible");
    if (immediate) {
      els.toast.classList.add("is-hidden");
      return;
    }
    window.setTimeout(function () {
      if (!els.toast.classList.contains("is-visible")) {
        els.toast.classList.add("is-hidden");
      }
    }, 500);
  }

  function bindLabel(oneText, verb, k, unitOne, unitMany) {
    if (k <= 1) return oneText;
    return verb + " " + k + " " + unitMany;
  }

  function render() {
    var F = SoulgatherFormat;
    if (!els.soulsCount) return;

    var mult = rateMult();
    var gain = favorGain(state.lifetimeSouls);

    els.soulsCount.textContent = F.formatNumber(state.souls);
    els.soulsRate.textContent = F.formatRate(soulsPerSec());

    if (els.soulsAsh) {
      var showAsh =
        state.unlockedMarks ||
        state.unlockedCensers ||
        N.cmp(state.ash, 0) > 0;
      if (showAsh) {
        els.soulsAsh.textContent = "Ash " + F.formatNumber(state.ash);
        els.soulsAsh.classList.remove("is-hidden");
      } else {
        els.soulsAsh.classList.add("is-hidden");
      }
    }

    if (els.soulsFavor) {
      if (mult > 1) {
        els.soulsFavor.textContent = "Blessing " + formatMult(mult);
        els.soulsFavor.classList.remove("is-hidden");
      } else {
        els.soulsFavor.classList.add("is-hidden");
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

    if (state.unlockedWell) {
      if (els.wellCard && els.wellCard.classList.contains("is-hidden")) {
        revealWell();
      }
      var wCost = wellCost(state.wellDepth);
      var canWell = N.cmp(state.souls, wCost) >= 0;
      var power = clickPower();
      els.wellOwned.textContent = F.formatNumber(state.wellDepth);
      els.wellPower.textContent =
        F.formatNumber(power) + (N.cmp(power, 1) === 0 ? " soul / click" : " souls / click");
      els.wellCost.textContent = F.formatNumber(wCost) + " Souls";
      els.wellBuy.disabled = !canWell;
      els.wellCard.classList.toggle("can-buy", canWell);
    }

    var shadePlan = purchasePlan(state.shades, state.souls);
    var canShade = shadePlan.can;
    els.shadeOwned.textContent = F.formatNumber(state.shades);
    els.shadeProd.textContent =
      F.formatNumber(shadeSoulsPerSec()) + " souls / sec";
    els.shadeCost.textContent = F.formatNumber(shadePlan.cost) + " Souls";
    els.shadeBuy.disabled = !canShade;
    els.shadeBuy.textContent = bindLabel("Bind a Shade", "Bind", shadePlan.k, "Shade", "Shades");
    els.shadeCard.classList.toggle("can-buy", canShade);
    els.shadeCard.classList.toggle("is-dormant", N.cmp(state.lifetimeSouls, 1) < 0);

    if (state.unlockedLanterns) {
      if (els.lanternCard && els.lanternCard.classList.contains("is-hidden")) {
        revealLanterns(false);
      }
      var lanternC = lanternCost(state.lanterns);
      var lMult = lanternMult(state.lanterns);
      var canLantern = N.cmp(state.souls, lanternC) >= 0;
      els.lanternOwned.textContent = F.formatNumber(state.lanterns);
      els.lanternProd.textContent = "Shade souls \u00d7" + formatTimes(lMult);
      els.lanternCost.textContent = F.formatNumber(lanternC) + " Souls";
      els.lanternBuy.disabled = !canLantern;
      els.lanternBuy.textContent = "Kindle a Lantern";
      els.lanternCard.classList.toggle("can-buy", canLantern);
    }

    if (state.unlockedSpirits) {
      if (els.spiritCard.classList.contains("is-hidden")) {
        revealSpirits(false);
      }
      var spiritPlan = purchasePlan(state.spirits, state.shades);
      els.spiritOwned.textContent = F.formatNumber(state.spirits);
      els.spiritProd.textContent =
        F.formatNumber(shadesPerSec()) + " shades / sec";
      els.spiritCost.textContent = F.formatNumber(spiritPlan.cost) + " Shades";
      els.spiritBuy.disabled = !spiritPlan.can;
      els.spiritBuy.textContent = bindLabel("Bind a Spirit", "Bind", spiritPlan.k, "Spirit", "Spirits");
      els.spiritCard.classList.toggle("can-buy", spiritPlan.can);
    }

    if (state.unlockedVessels) {
      if (els.vesselCard.classList.contains("is-hidden")) {
        revealVessels(false);
      }
      var vesselPlan = purchasePlan(state.vessels, state.spirits);
      els.vesselOwned.textContent = F.formatNumber(state.vessels);
      els.vesselProd.textContent =
        F.formatNumber(spiritsPerSec()) + " spirits / sec";
      els.vesselCost.textContent = F.formatNumber(vesselPlan.cost) + " Spirits";
      els.vesselBuy.disabled = !vesselPlan.can;
      els.vesselBuy.textContent = bindLabel("Bind a Vessel", "Bind", vesselPlan.k, "Vessel", "Vessels");
      els.vesselCard.classList.toggle("can-buy", vesselPlan.can);
    }

    if (state.unlockedCensers) {
      if (els.censerCard && els.censerCard.classList.contains("is-hidden")) {
        revealCensers(false);
      }
      var censerC = censerCost(state.censers);
      var censerRate = N.mul(N.mul(state.censers, CENSER_ASH_PER_SEC), rateMult());
      var canCenser = N.cmp(state.vessels, censerC) >= 0;
      els.censerOwned.textContent = F.formatNumber(state.censers);
      els.censerProd.textContent = F.formatNumber(censerRate) + " ash / sec";
      els.censerCost.textContent = F.formatNumber(censerC) + " Vessels";
      els.censerBuy.disabled = !canCenser;
      els.censerBuy.textContent = "Raise a Censer";
      els.censerCard.classList.toggle("can-buy", canCenser);
    }

    if (state.unlockedThrones) {
      if (els.throneCard.classList.contains("is-hidden")) {
        revealThrones(false);
      }
      var thronePlan = purchasePlan(state.thrones, state.vessels);
      var thronePct = Math.round(
        (normalizeAspect(state.aspect) === "dominion" ? 15 : 10) * state.thrones
      );
      els.throneOwned.textContent = F.formatNumber(state.thrones);
      els.throneProd.textContent = "+" + thronePct + "% production";
      els.throneCost.textContent = F.formatNumber(thronePlan.cost) + " Vessels";
      els.throneBuy.disabled = !thronePlan.can;
      els.throneBuy.textContent = bindLabel("Raise a Throne", "Raise", thronePlan.k, "Throne", "Thrones");
      els.throneCard.classList.toggle("can-buy", thronePlan.can);
    }

    var ritesOpen = !!state.unlockedWell || N.cmp(state.shades, 1) >= 0 || !!state.wellDraws;
    if (els.ritesPanel) {
      els.ritesPanel.classList.toggle("is-hidden", !ritesOpen);
    }
    if (ritesOpen) {
      var sCost = siphonCost(state.siphonLevel);
      var sMult = siphonMult(state.siphonLevel);
      if (els.siphonEffect) els.siphonEffect.textContent = "Siphon \u00d7" + formatTimes(sMult);
      if (els.siphonCost) els.siphonCost.textContent = F.formatNumber(sCost) + " Souls";
      if (els.siphonBuy) els.siphonBuy.disabled = N.cmp(state.souls, sCost) < 0;

      if (els.levyRow) {
        els.levyRow.classList.toggle("is-hidden", !state.unlockedSpirits);
      }
      if (state.unlockedSpirits) {
        var lCost = levyCost(state.levyLevel);
        var levyM = levyMult(state.levyLevel);
        if (els.levyEffect) els.levyEffect.textContent = "Levy \u00d7" + formatTimes(levyM);
        if (els.levyCost) els.levyCost.textContent = F.formatNumber(lCost) + " Shades";
        if (els.levyBuy) els.levyBuy.disabled = N.cmp(state.shades, lCost) < 0;
      }

      var drawsOpen = !!state.unlockedWellDraws || !!state.wellDraws;
      if (els.wellDrawsRow) {
        els.wellDrawsRow.classList.toggle("is-hidden", !drawsOpen);
      }
      if (drawsOpen) {
        if (state.wellDraws) {
          if (els.wellDrawsEffect) els.wellDrawsEffect.textContent = "The well draws";
          if (els.wellDrawsCost) els.wellDrawsCost.textContent = "\u2014";
          if (els.wellDrawsBuy) {
            els.wellDrawsBuy.disabled = true;
            els.wellDrawsBuy.textContent = "The well draws";
          }
        } else {
          if (els.wellDrawsEffect) els.wellDrawsEffect.textContent = "Idle draw";
          if (els.wellDrawsCost) {
            els.wellDrawsCost.textContent = F.formatNumber(WELL_DRAWS_COST) + " Souls";
          }
          if (els.wellDrawsBuy) {
            els.wellDrawsBuy.disabled = N.cmp(state.souls, WELL_DRAWS_COST) < 0;
            els.wellDrawsBuy.textContent = "Let the Well Draw";
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
        var tCost = titheCost(state.souls);
        if (els.titheEffect) {
          els.titheEffect.textContent = titheActive() ? "Burst \u00d72" : "Burst \u00d72 \u00b7 60s";
        }
        if (els.titheCost) {
          els.titheCost.textContent = F.formatNumber(tCost) + " Souls";
        }
        if (els.titheBuy) {
          if (titheActive()) {
            els.titheBuy.disabled = true;
            els.titheBuy.textContent = "The tithe burns \u2014 " + Math.ceil(tLeft) + "s";
          } else {
            els.titheBuy.disabled = N.cmp(state.souls, TITHE_MIN) < 0;
            els.titheBuy.textContent = "Pay the Tithe";
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
      if (els.markEmberEffect) els.markEmberEffect.textContent = "Shade souls \u00d7" + formatTimes(eMult);
      if (els.markEmberCost) els.markEmberCost.textContent = F.formatNumber(eCost) + " Ash";
      if (els.markEmberBuy) els.markEmberBuy.disabled = N.cmp(state.ash, eCost) < 0;

      if (els.markChainRow) {
        els.markChainRow.classList.toggle("is-hidden", !state.unlockedSpirits);
      }
      if (state.unlockedSpirits) {
        var chCost = markCost(state.chainLevel);
        var chMult = chainMult(state.chainLevel);
        if (els.markChainEffect) els.markChainEffect.textContent = "Spirit levy \u00d7" + formatTimes(chMult);
        if (els.markChainCost) els.markChainCost.textContent = F.formatNumber(chCost) + " Ash";
        if (els.markChainBuy) els.markChainBuy.disabled = N.cmp(state.ash, chCost) < 0;
      }

      if (els.markHollowRow) {
        els.markHollowRow.classList.toggle("is-hidden", !state.unlockedVessels);
      }
      if (state.unlockedVessels) {
        var hCost = markCost(state.hollowLevel);
        var hMult = hollowMult(state.hollowLevel);
        if (els.markHollowEffect) els.markHollowEffect.textContent = "Vessel house \u00d7" + formatTimes(hMult);
        if (els.markHollowCost) els.markHollowCost.textContent = F.formatNumber(hCost) + " Ash";
        if (els.markHollowBuy) els.markHollowBuy.disabled = N.cmp(state.ash, hCost) < 0;
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
          els.aspectsSworn.textContent = "This emptying: " + (ASPECT_NAMES[sworn] || sworn) + ".";
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

    var tributeReady = gain >= 1;
    if (els.tributePanel) {
      els.tributePanel.classList.toggle("is-hidden", !tributeReady);
    }
    if (els.tributeFootBtn) {
      els.tributeFootBtn.classList.toggle("is-hidden", !tributeReady);
    }
    if (tributeReady) {
      if (els.tributeFavor) {
        if (state.favor !== state.favorEarned) {
          els.tributeFavor.textContent =
            F.formatNumber(state.favor) +
            " (" +
            F.formatNumber(state.favorEarned) +
            " earned)";
        } else {
          els.tributeFavor.textContent = F.formatNumber(state.favor);
        }
      }
      if (els.tributeGain) els.tributeGain.textContent = F.formatNumber(gain) + " Favor";
      if (els.tributeMult) {
        els.tributeMult.textContent = formatMult(
          prodMult(state.favorEarned + gain, state.seatLevel, state.edictLevel)
        );
      }
    }

    var reliquaryOpen = state.favorEarned >= 1;
    if (els.reliquaryPanel) {
      els.reliquaryPanel.classList.toggle("is-hidden", !reliquaryOpen);
    }
    if (reliquaryOpen) {
      if (els.reliquaryFavor) els.reliquaryFavor.textContent = F.formatNumber(state.favor);
      if (els.reliquaryEarned) els.reliquaryEarned.textContent = F.formatNumber(state.favorEarned);

      var edCost = edictCost(state.edictLevel);
      var ePct = Math.round(25 * state.edictLevel);
      if (els.edictEffect) els.edictEffect.textContent = "+" + ePct + "% production";
      if (els.edictCost) els.edictCost.textContent = F.formatNumber(edCost) + " Favor";
      if (els.edictBuy) {
        els.edictBuy.disabled = state.favor < edCost;
      }

      var mCost = memoryCost(state.memoryLevel);
      var memN = state.memoryLevel;
      if (els.memoryEffect) {
        els.memoryEffect.textContent =
          "+" +
          F.formatNumber(memN) +
          (memN === 1 ? " Shade at tribute" : " Shades at tribute");
      }
      if (els.memoryCost) els.memoryCost.textContent = F.formatNumber(mCost) + " Favor";
      if (els.memoryBuy) {
        els.memoryBuy.disabled = state.favor < mCost;
      }

      if (state.echoLevel >= 1) {
        if (els.echoEffect) els.echoEffect.textContent = "The Well Draws at tribute";
        if (els.echoCost) els.echoCost.textContent = "\u2014";
        if (els.echoBuy) {
          els.echoBuy.disabled = true;
          els.echoBuy.textContent = "The well remembers.";
        }
      } else {
        var xCost = echoCost(state.echoLevel);
        if (els.echoEffect) els.echoEffect.textContent = "The Well Draws at tribute";
        if (els.echoCost) els.echoCost.textContent = F.formatNumber(xCost) + " Favor";
        if (els.echoBuy) {
          els.echoBuy.disabled = !isFinite(xCost) || state.favor < xCost;
          els.echoBuy.textContent = "Speak the Echo";
        }
      }

      var stCost = seatCost(state.seatLevel);
      var seatN = state.seatLevel;
      if (els.seatEffect) {
        els.seatEffect.textContent =
          "+" +
          F.formatNumber(seatN) +
          (seatN === 1 ? " Throne at tribute" : " Thrones at tribute");
      }
      if (els.seatCost) els.seatCost.textContent = F.formatNumber(stCost) + " Favor";
      if (els.seatBuy) {
        els.seatBuy.disabled = state.favor < stCost;
      }
    }

    if (els.nextGoal) {
      els.nextGoal.textContent = nextGoal(state);
    }
    renderChronicle();
    renderStats();
  }

  function tick(now) {
    if (!lastFrame) lastFrame = now;
    var dt = (now - lastFrame) / 1000;
    lastFrame = now;
    applyDt(dt);
    render();
    window.requestAnimationFrame(tick);
  }

  function bind() {
    els.soulsCount = document.getElementById("souls-count");
    els.soulsRate = document.getElementById("souls-rate");
    els.soulsAsh = document.getElementById("souls-ash");
    els.soulsFavor = document.getElementById("souls-favor");
    els.gatherBtn = document.getElementById("gather-btn");
    els.buyMode = document.getElementById("buy-mode");
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
    els.throneCard = document.getElementById("throne-card");
    els.throneOwned = document.getElementById("throne-owned");
    els.throneProd = document.getElementById("throne-prod");
    els.throneCost = document.getElementById("throne-cost");
    els.throneBuy = document.getElementById("throne-buy");
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
    els.ritesPanel = document.getElementById("rites-panel");
    els.siphonEffect = document.getElementById("siphon-effect");
    els.siphonCost = document.getElementById("siphon-cost");
    els.siphonBuy = document.getElementById("siphon-buy");
    els.levyRow = document.getElementById("levy-row");
    els.levyEffect = document.getElementById("levy-effect");
    els.levyCost = document.getElementById("levy-cost");
    els.levyBuy = document.getElementById("levy-buy");
    els.wellDrawsRow = document.getElementById("well-draws-row");
    els.wellDrawsEffect = document.getElementById("well-draws-effect");
    els.wellDrawsCost = document.getElementById("well-draws-cost");
    els.wellDrawsBuy = document.getElementById("well-draws-buy");
    els.titheRow = document.getElementById("tithe-row");
    els.titheEffect = document.getElementById("tithe-effect");
    els.titheCost = document.getElementById("tithe-cost");
    els.titheBuy = document.getElementById("tithe-buy");
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
    els.toast = document.getElementById("toast");
    els.resetBtn = document.getElementById("reset-btn");
    els.nextGoal = document.getElementById("next-goal");
    els.chronicleList = document.getElementById("chronicle-list");
    els.statEmptying = document.getElementById("stat-emptying");
    els.statAllTime = document.getElementById("stat-alltime");
    els.statTributes = document.getElementById("stat-tributes");

    els.gatherBtn.addEventListener("click", harvest);
    els.wellBuy.addEventListener("click", buyWell);
    els.shadeBuy.addEventListener("click", buyShade);
    if (els.lanternBuy) els.lanternBuy.addEventListener("click", buyLantern);
    els.spiritBuy.addEventListener("click", buySpirit);
    els.vesselBuy.addEventListener("click", buyVessel);
    if (els.censerBuy) els.censerBuy.addEventListener("click", buyCenser);
    els.throneBuy.addEventListener("click", buyThrone);
    els.tributeBtn.addEventListener("click", layTribute);
    els.tributeFootBtn.addEventListener("click", layTribute);
    els.edictBuy.addEventListener("click", buyEdict);
    els.memoryBuy.addEventListener("click", buyMemory);
    if (els.echoBuy) els.echoBuy.addEventListener("click", buyEcho);
    if (els.seatBuy) els.seatBuy.addEventListener("click", buySeat);
    if (els.siphonBuy) els.siphonBuy.addEventListener("click", buySiphon);
    if (els.levyBuy) els.levyBuy.addEventListener("click", buyLevy);
    if (els.wellDrawsBuy) els.wellDrawsBuy.addEventListener("click", buyWellDraws);
    if (els.titheBuy) els.titheBuy.addEventListener("click", payTithe);
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
    els.resetBtn.addEventListener("click", resetGame);
    els.memoryPanel = document.getElementById("memory-panel");
    els.memoryText = document.getElementById("memory-text");
    els.memoryExport = document.getElementById("memory-export");
    els.memoryImport = document.getElementById("memory-import");
    if (els.memoryExport) els.memoryExport.addEventListener("click", exportMemory);
    if (els.memoryImport) els.memoryImport.addEventListener("click", importMemory);

    if (els.buyMode) {
      els.buyMode.addEventListener("click", function (ev) {
        var t = ev.target;
        if (!t || !t.getAttribute) return;
        var mode = t.getAttribute("data-mode");
        if (mode) setBuyMode(mode);
      });
    }

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        lastFrame = 0;
      }
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      var target = ev.target;
      var active = document.activeElement || target;
      if (isTypingTarget(target) || isTypingTarget(active)) return;

      if (ev.key === "1") {
        setBuyMode("1");
        return;
      }
      if (ev.key === "2") {
        setBuyMode("10");
        return;
      }
      if (ev.key === "3") {
        setBuyMode("max");
        return;
      }

      if (ev.key === " " || ev.key === "Enter") {
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
        if (tag === "summary" || tag === "a" || tag === "details") return;
        if (buttonEl && !isGather) return;
        if (isGather && ev.key === "Enter") return;
        if (ev.key === " ") ev.preventDefault();
        harvest();
      }
    });
  }

  function boot() {
    bind();
    load();
    if (!state.runStartedAt) state.runStartedAt = Date.now();
    checkUnlock();
    if (state.unlockedWell) revealWell();
    if (state.unlockedLanterns) revealLanterns(false);
    if (state.unlockedSpirits) revealSpirits(false);
    if (state.unlockedVessels) revealVessels(false);
    if (state.unlockedThrones) revealThrones(false);
    if (state.unlockedCensers) revealCensers(false);
    render();
    if (pendingAwayToast) {
      showToast(pendingAwayToast);
      pendingAwayToast = null;
    }
    window.setInterval(save, AUTOSAVE_MS);
    window.requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  globalThis.SoulgatherEconomy = {
    shadeCost: shadeCost,
    spiritCost: spiritCost,
    vesselCost: vesselCost,
    throneCost: throneCost,
    wellCost: wellCost,
    lanternCost: lanternCost,
    censerCost: censerCost,
    markCost: markCost,
    favorGain: favorGain,
    prestigeMult: prestigeMult,
    prodMult: prodMult,
    producerCost: producerCost,
    bulkCost: bulkCost,
    edictCost: edictCost,
    memoryCost: memoryCost,
    echoCost: echoCost,
    seatCost: seatCost,
    siphonCost: siphonCost,
    levyCost: levyCost,
    siphonMult: siphonMult,
    levyMult: levyMult,
    harvestMult: harvestMult,
    bindingMult: bindingMult,
    throneWeight: throneWeight,
    lanternMult: lanternMult,
    emberMult: emberMult,
    chainMult: chainMult,
    hollowMult: hollowMult,
    normalizeAspect: normalizeAspect,
    nextGoal: nextGoal,
    titheCost: titheCost,
    titheMult: titheMult,
    ashPerSec: ashPerSec
  };
})();
