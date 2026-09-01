(function () {
  "use strict";

  var SAVE_KEY = "soulgather-v0";
  var COST_BASE = 10;
  var COST_MULT = 1.15;
  var WELL_COST_BASE = 25;
  var WELL_COST_MULT = 1.5;
  var SHADE_SOULS_PER_SEC = 1;
  var SPIRIT_SHADES_PER_SEC = 0.1;
  var VESSEL_SPIRITS_PER_SEC = 0.1;
  var UNLOCK_SHADES = 10;
  var UNLOCK_LIFETIME = 100;
  var UNLOCK_SPIRITS_FOR_VESSELS = 5;
  var UNLOCK_LIFETIME_SHADES = 50;
  var UNLOCK_VESSELS_FOR_THRONES = 1;
  var UNLOCK_LIFETIME_SPIRITS = 50;
  var UNLOCK_WELL_DRAWS_SHADES = 3;
  var WELL_DRAWS_COST = 50;
  var BULK_CAP = 10000;
  var AUTOSAVE_MS = 5000;
  var MAX_DT = 8 * 60 * 60;
  var TOAST_MS = 5200;
  var AWAY_MIN_DT = 2;

  function producerCost(owned) {
    var n = Math.max(0, Math.floor(owned));
    return Math.floor(COST_BASE * Math.pow(COST_MULT, n));
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

  function wellCost(depth) {
    var n = Math.max(0, Math.floor(depth));
    return Math.floor(WELL_COST_BASE * Math.pow(WELL_COST_MULT, n));
  }

  function bulkCost(base, owned, k) {
    var b = Number(base);
    if (!isFinite(b) || b <= 0) b = COST_BASE;
    var o = Math.max(0, Math.floor(owned));
    var n = Math.max(0, Math.floor(k));
    if (n > BULK_CAP) n = BULK_CAP;
    var total = 0;
    var i;
    for (i = 0; i < n; i++) {
      total += Math.floor(b * Math.pow(COST_MULT, o + i));
    }
    return total;
  }

  function maxAffordable(base, owned, currency) {
    var b = Number(base);
    if (!isFinite(b) || b <= 0) b = COST_BASE;
    var o = Math.max(0, Math.floor(owned));
    var remaining = Number(currency) || 0;
    var k = 0;
    while (k < BULK_CAP) {
      var c = Math.floor(b * Math.pow(COST_MULT, o + k));
      if (remaining < c) break;
      remaining -= c;
      k += 1;
    }
    return k;
  }

  function favorGain(lifetimeSouls) {
    var n = Number(lifetimeSouls) || 0;
    if (n < 0) n = 0;
    return Math.floor(Math.sqrt(n / 25000));
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

  function edictCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 1 * Math.pow(2, n);
  }

  function memoryCost(level) {
    var n = Math.max(0, Math.floor(level));
    return 2 * Math.pow(2, n);
  }

  function siphonCost(level) {
    var n = Math.max(0, Math.floor(level));
    return Math.floor(50 * Math.pow(3, n));
  }

  function levyCost(level) {
    var n = Math.max(0, Math.floor(level));
    return Math.floor(15 * Math.pow(3, n));
  }

  function siphonMult(level) {
    return Math.pow(2, Math.max(0, Math.floor(Number(level) || 0)));
  }

  function levyMult(level) {
    return Math.pow(2, Math.max(0, Math.floor(Number(level) || 0)));
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

  var CHRONICLE_ORDER = ["soul", "shade", "spirits", "well", "vessels", "throne", "rite", "wellDraw", "tribute", "aspect"];

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
    aspect: "An aspect was sworn."
  };

  function formatGoalNum(n) {
    if (typeof SoulgatherFormat !== "undefined" && SoulgatherFormat.formatNumber) {
      return SoulgatherFormat.formatNumber(n);
    }
    if (n == null || !isFinite(n)) return "0";
    if (Math.abs(n - Math.round(n)) < 0.05) return String(Math.round(n));
    return Number(n).toFixed(1);
  }

  function nextGoal(view, format) {
    view = view || {};
    format = format || formatGoalNum;
    var shades = Number(view.shades) || 0;
    var spirits = Number(view.spirits) || 0;
    var lifetimeSouls = Number(view.lifetimeSouls) || 0;
    var lifetimeShades = Number(view.lifetimeShades) || 0;
    var unlockedSpirits = !!view.unlockedSpirits;
    var unlockedVessels = !!view.unlockedVessels;
    var unlockedThrones = !!view.unlockedThrones;
    var favorEarned = Number(view.favorEarned) || 0;
    var gain = favorGain(lifetimeSouls);
    var sworn = normalizeAspect(view.aspect);

    if (favorEarned >= 1 && !sworn) {
      return "Swear an Aspect. The GodKing waits.";
    }

    if (shades < 1 && lifetimeShades < 1 && !unlockedSpirits) {
      return "Bind a Shade to wake the well.";
    }
    if (!unlockedSpirits) {
      return (
        "The well thickens. Bound Spirits at 10 Shades. " +
        format(shades) +
        " / 10 Shades"
      );
    }
    if (!unlockedVessels) {
      return "Vessels at 5 Bound Spirits. " + format(spirits) + " / 5";
    }
    if (!unlockedThrones) {
      return "A throne at 1 Vessel.";
    }
    if (gain >= 1) {
      return "Lay Tribute. The GodKing will remember.";
    }
    if (favorEarned >= 1) {
      return "The well gathers. Another Tribute at 25000 lifetime Souls this run.";
    }
    return (
      "Tribute when the GodKing will remember. " +
      format(lifetimeSouls) +
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

  function markChronicle(id) {
    if (!state.chronicle) state.chronicle = [];
    if (!CHRONICLE_LINES[id] || hasChronicle(id)) return false;
    state.chronicle.push({ id: id, at: Number(state.lifetimeSouls) || 0 });
    return true;
  }

  function syncChronicle() {
    var added = false;
    if ((Number(state.lifetimeSouls) || 0) > 0 || (Number(state.favorEarned) || 0) >= 1) {
      if (markChronicle("soul")) added = true;
    }
    if (
      (Number(state.shades) || 0) >= 1 ||
      (Number(state.lifetimeShades) || 0) >= 1 ||
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
      souls: 0,
      lifetimeSouls: 0,
      lifetimeShades: 0,
      lifetimeSpirits: 0,
      shades: 0,
      spirits: 0,
      vessels: 0,
      thrones: 0,
      wellDepth: 0,
      unlockedSpirits: false,
      unlockedVessels: false,
      unlockedWell: false,
      unlockedThrones: false,
      toastShown: false,
      vesselToastShown: false,
      throneToastShown: false,
      favor: 0,
      favorEarned: 0,
      edictLevel: 0,
      memoryLevel: 0,
      buyMode: "1",
      siphonLevel: 0,
      levyLevel: 0,
      wellDraws: false,
      unlockedWellDraws: false,
      aspect: "",
      lastTick: Date.now(),
      chronicle: []
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

  function clickPower() {
    return (1 + state.wellDepth) * currentMult();
  }

  function shadeSoulsPerSec() {
    return (
      state.shades *
      SHADE_SOULS_PER_SEC *
      currentMult() *
      siphonMult(state.siphonLevel) *
      harvestMult(normalizeAspect(state.aspect) === "harvest")
    );
  }

  function soulsPerSec() {
    var rate = shadeSoulsPerSec();
    if (state.wellDraws) rate += clickPower();
    return rate;
  }

  function shadesPerSec() {
    return (
      state.spirits *
      SPIRIT_SHADES_PER_SEC *
      currentMult() *
      levyMult(state.levyLevel) *
      bindingMult(normalizeAspect(state.aspect) === "binding")
    );
  }

  function spiritsPerSec() {
    return state.vessels * VESSEL_SPIRITS_PER_SEC * currentMult();
  }

  function applyDt(dt) {
    if (dt <= 0 || !isFinite(dt)) return;
    dt = clamp(dt, 0, MAX_DT);

    var dSouls = shadeSoulsPerSec() * dt;
    if (state.wellDraws) {
      dSouls += clickPower() * dt;
    }
    state.souls += dSouls;
    state.lifetimeSouls += dSouls;

    var dShades = shadesPerSec() * dt;
    state.shades += dShades;
    state.lifetimeShades += dShades;

    var dSpirits = spiritsPerSec() * dt;
    state.spirits += dSpirits;
    state.lifetimeSpirits += dSpirits;

    checkUnlock();
  }

  function checkUnlock() {
    if (!state.unlockedWell && state.shades >= 1) {
      state.unlockedWell = true;
      revealWell();
    }

    if (!state.unlockedSpirits) {
      if (state.shades >= UNLOCK_SHADES || state.lifetimeSouls >= UNLOCK_LIFETIME) {
        state.unlockedSpirits = true;
        revealSpirits(true);
      }
    }

    if (!state.unlockedVessels) {
      if (
        state.spirits >= UNLOCK_SPIRITS_FOR_VESSELS ||
        state.lifetimeShades >= UNLOCK_LIFETIME_SHADES
      ) {
        state.unlockedVessels = true;
        revealVessels(true);
      }
    }

    if (!state.unlockedThrones) {
      if (
        state.vessels >= UNLOCK_VESSELS_FOR_THRONES ||
        state.lifetimeSpirits >= UNLOCK_LIFETIME_SPIRITS
      ) {
        state.unlockedThrones = true;
        revealThrones(true);
      }
    }

    if (!state.unlockedWellDraws && state.shades >= UNLOCK_WELL_DRAWS_SHADES) {
      state.unlockedWellDraws = true;
    }
    syncChronicle();
  }

  function harvest() {
    var power = clickPower();
    state.souls += power;
    state.lifetimeSouls += power;
    checkUnlock();
    save();
    pulseGather();
    spawnRipple(power);
    render();
  }

  function purchasePlan(owned, currency) {
    owned = Math.max(0, Math.floor(Number(owned) || 0));
    var one = producerCost(owned);
    var mode = state.buyMode;
    if (mode === "10") {
      var cost10 = bulkCost(COST_BASE, owned, 10);
      return { k: 10, cost: cost10, can: currency >= cost10 };
    }
    if (mode === "max") {
      var k = maxAffordable(COST_BASE, owned, currency);
      if (k < 1) {
        return { k: 0, cost: one, can: false };
      }
      return { k: k, cost: bulkCost(COST_BASE, owned, k), can: true };
    }
    return { k: 1, cost: one, can: currency >= one };
  }

  function buyWell() {
    if (!state.unlockedWell) return;
    var cost = wellCost(state.wellDepth);
    if (state.souls < cost) return;
    state.souls -= cost;
    state.wellDepth += 1;
    syncChronicle();
    save();
    render();
  }

  function buyShade() {
    var plan = purchasePlan(state.shades, state.souls);
    if (!plan.can || plan.k < 1) return;
    state.souls -= plan.cost;
    state.shades += plan.k;
    state.lifetimeShades += plan.k;
    checkUnlock();
    save();
    render();
  }

  function buySpirit() {
    if (!state.unlockedSpirits) return;
    var plan = purchasePlan(state.spirits, state.shades);
    if (!plan.can || plan.k < 1) return;
    state.shades -= plan.cost;
    state.spirits += plan.k;
    state.lifetimeSpirits += plan.k;
    checkUnlock();
    save();
    render();
  }

  function buyVessel() {
    if (!state.unlockedVessels) return;
    var plan = purchasePlan(state.vessels, state.spirits);
    if (!plan.can || plan.k < 1) return;
    state.spirits -= plan.cost;
    state.vessels += plan.k;
    checkUnlock();
    save();
    render();
  }

  function buyThrone() {
    if (!state.unlockedThrones) return;
    var plan = purchasePlan(state.thrones, state.vessels);
    if (!plan.can || plan.k < 1) return;
    state.vessels -= plan.cost;
    state.thrones += plan.k;
    syncChronicle();
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

  function buySiphon() {
    var cost = siphonCost(state.siphonLevel);
    if (state.souls < cost) return;
    state.souls -= cost;
    state.siphonLevel += 1;
    syncChronicle();
    save();
    render();
  }

  function buyLevy() {
    if (!state.unlockedSpirits) return;
    var cost = levyCost(state.levyLevel);
    if (state.shades < cost) return;
    state.shades -= cost;
    state.levyLevel += 1;
    syncChronicle();
    save();
    render();
  }

  function buyWellDraws() {
    if (state.wellDraws) return;
    if (!state.unlockedWellDraws && state.shades < UNLOCK_WELL_DRAWS_SHADES) return;
    if (state.souls < WELL_DRAWS_COST) return;
    state.souls -= WELL_DRAWS_COST;
    state.wellDraws = true;
    state.unlockedWellDraws = true;
    syncChronicle();
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
    "unlockedSpirits",
    "unlockedVessels",
    "unlockedWell",
    "unlockedThrones",
    "toastShown",
    "vesselToastShown",
    "throneToastShown",
    "favor",
    "favorEarned",
    "edictLevel",
    "memoryLevel",
    "buyMode",
    "siphonLevel",
    "levyLevel",
    "wellDraws",
    "unlockedWellDraws",
    "aspect",
    "lastTick",
    "chronicle"
  ];

  function serializeState() {
    return {
      souls: state.souls,
      lifetimeSouls: state.lifetimeSouls,
      lifetimeShades: state.lifetimeShades,
      lifetimeSpirits: state.lifetimeSpirits,
      shades: state.shades,
      spirits: state.spirits,
      vessels: state.vessels,
      thrones: state.thrones,
      wellDepth: state.wellDepth,
      unlockedSpirits: state.unlockedSpirits,
      unlockedVessels: state.unlockedVessels,
      unlockedWell: state.unlockedWell,
      unlockedThrones: state.unlockedThrones,
      toastShown: state.toastShown,
      vesselToastShown: state.vesselToastShown,
      throneToastShown: state.throneToastShown,
      favor: state.favor,
      favorEarned: state.favorEarned,
      edictLevel: state.edictLevel,
      memoryLevel: state.memoryLevel,
      buyMode: state.buyMode,
      siphonLevel: state.siphonLevel,
      levyLevel: state.levyLevel,
      wellDraws: state.wellDraws,
      unlockedWellDraws: state.unlockedWellDraws,
      aspect: normalizeAspect(state.aspect),
      lastTick: Date.now(),
      chronicle: state.chronicle || []
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
    state.souls = Number(data.souls) || 0;
    state.lifetimeSouls = Number(data.lifetimeSouls) || 0;
    state.lifetimeShades = Number(data.lifetimeShades) || 0;
    state.lifetimeSpirits = Number(data.lifetimeSpirits) || 0;
    state.shades = Number(data.shades) || 0;
    state.spirits = Number(data.spirits) || 0;
    state.vessels = Number(data.vessels) || 0;
    state.thrones = Number(data.thrones) || 0;
    state.wellDepth = Number(data.wellDepth) || 0;
    state.unlockedSpirits = !!data.unlockedSpirits;
    state.unlockedVessels = !!data.unlockedVessels;
    state.unlockedWell = !!data.unlockedWell;
    state.unlockedThrones = !!data.unlockedThrones;
    state.toastShown = !!data.toastShown;
    state.vesselToastShown = !!data.vesselToastShown;
    state.throneToastShown = !!data.throneToastShown;
    state.favor = Number(data.favor) || 0;
    if (data.favorEarned == null) {
      state.favorEarned = Number(data.favor) || 0;
    } else {
      state.favorEarned = Number(data.favorEarned) || 0;
    }
    state.edictLevel = Number(data.edictLevel) || 0;
    state.memoryLevel = Number(data.memoryLevel) || 0;
    state.buyMode = normalizeBuyMode(data.buyMode);
    state.siphonLevel = Number(data.siphonLevel) || 0;
    state.levyLevel = Number(data.levyLevel) || 0;
    state.wellDraws = !!data.wellDraws;
    state.unlockedWellDraws = !!data.unlockedWellDraws;
    state.aspect = normalizeAspect(data.aspect);
    state.lastTick = Number(data.lastTick) || Date.now();
    state.chronicle = normalizeChronicle(data.chronicle);
  }

  function adoptSave(data) {
    state = freshState();
    applySaveData(data);
    hideToast(true);
    hideUnlockCards();
    checkUnlock();
    if (state.unlockedWell) revealWell();
    if (state.unlockedSpirits) revealSpirits(false);
    if (state.unlockedVessels) revealVessels(false);
    if (state.unlockedThrones) revealThrones(false);
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
      var soulsBefore = state.souls;
      var shadesBefore = state.shades;
      if (offline > 0.25) {
        applyDt(offline);
      }
      var soulsGained = state.souls - soulsBefore;
      var shadesGained = state.shades - shadesBefore;
      state.lastTick = Date.now();
      syncChronicle();
      save();

      if (offline > AWAY_MIN_DT && (soulsGained > 0 || shadesGained > 0)) {
        var awayMsg = "The well gathered while you were away.";
        if (soulsGained > 0) {
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
  }

  function hideUnlockCards() {
    hideCard(els.wellCard);
    hideCard(els.spiritCard);
    hideCard(els.vesselCard);
    hideCard(els.throneCard);
    hideTribute();
    hideRites();
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
    var keptBuy = state.buyMode;
    var keptChronicle = (state.chronicle || []).slice();
    state = freshState();
    state.favor = keptFavor;
    state.favorEarned = keptEarned;
    state.edictLevel = keptEdict;
    state.memoryLevel = keptMemory;
    state.buyMode = keptBuy;
    state.chronicle = keptChronicle;
    state.aspect = "";
    if (keptMemory > 0) {
      state.shades = keptMemory;
      state.unlockedWell = true;
    }
    hideToast(true);
    hideUnlockCards();
    checkUnlock();
    if (state.unlockedWell) revealWell();
    if (state.unlockedSpirits) revealSpirits(false);
    if (state.unlockedVessels) revealVessels(false);
    if (state.unlockedThrones) revealThrones(false);
    save();
    render();
  }

  function fmt(n) {
    return SoulgatherFormat.formatNumber(n);
  }

  function formatMult(m) {
    if (!isFinite(m)) m = 1;
    return "\u00d7" + m.toFixed(1);
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

  function hideTribute() {
    if (els.tributePanel) els.tributePanel.classList.add("is-hidden");
    if (els.tributeFootBtn) els.tributeFootBtn.classList.add("is-hidden");
  }

  function hideRites() {
    if (els.ritesPanel) els.ritesPanel.classList.add("is-hidden");
    if (els.levyRow) els.levyRow.classList.add("is-hidden");
    if (els.wellDrawsRow) els.wellDrawsRow.classList.add("is-hidden");
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

  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.remove("is-hidden");
    void els.toast.offsetWidth;
    els.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
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

    var mult = currentMult();
    var gain = favorGain(state.lifetimeSouls);

    els.soulsCount.textContent = F.formatNumber(state.souls);
    els.soulsRate.textContent = F.formatRate(soulsPerSec());

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
      var canWell = state.souls >= wCost;
      var power = clickPower();
      els.wellOwned.textContent = F.formatNumber(state.wellDepth);
      els.wellPower.textContent =
        F.formatNumber(power) + (power === 1 ? " soul / click" : " souls / click");
      els.wellCost.textContent = F.formatNumber(wCost) + " Souls";
      els.wellBuy.disabled = !canWell;
      els.wellCard.classList.toggle("can-buy", canWell);
    }

    var shadePlan = purchasePlan(state.shades, state.souls);
    var canShade = state.souls >= producerCost(state.shades);
    els.shadeOwned.textContent = F.formatNumber(state.shades);
    els.shadeProd.textContent =
      F.formatNumber(shadeSoulsPerSec()) + " souls / sec";
    els.shadeCost.textContent = F.formatNumber(shadePlan.cost) + " Souls";
    els.shadeBuy.disabled = !canShade || !shadePlan.can;
    els.shadeBuy.textContent = bindLabel("Bind a Shade", "Bind", shadePlan.k, "Shade", "Shades");
    els.shadeCard.classList.toggle("can-buy", canShade && shadePlan.can);
    els.shadeCard.classList.toggle("is-dormant", state.lifetimeSouls < 1);

    if (state.unlockedSpirits) {
      if (els.spiritCard.classList.contains("is-hidden")) {
        revealSpirits(false);
      }
      var spiritPlan = purchasePlan(state.spirits, state.shades);
      var canSpiritOne = state.shades >= producerCost(state.spirits);
      els.spiritOwned.textContent = F.formatNumber(state.spirits);
      els.spiritProd.textContent =
        F.formatNumber(shadesPerSec()) + " shades / sec";
      els.spiritCost.textContent = F.formatNumber(spiritPlan.cost) + " Shades";
      els.spiritBuy.disabled = !canSpiritOne || !spiritPlan.can;
      els.spiritBuy.textContent = bindLabel("Bind a Spirit", "Bind", spiritPlan.k, "Spirit", "Spirits");
      els.spiritCard.classList.toggle("can-buy", canSpiritOne && spiritPlan.can);
    }

    if (state.unlockedVessels) {
      if (els.vesselCard.classList.contains("is-hidden")) {
        revealVessels(false);
      }
      var vesselPlan = purchasePlan(state.vessels, state.spirits);
      var canVesselOne = state.spirits >= producerCost(state.vessels);
      els.vesselOwned.textContent = F.formatNumber(state.vessels);
      els.vesselProd.textContent =
        F.formatNumber(spiritsPerSec()) + " spirits / sec";
      els.vesselCost.textContent = F.formatNumber(vesselPlan.cost) + " Spirits";
      els.vesselBuy.disabled = !canVesselOne || !vesselPlan.can;
      els.vesselBuy.textContent = bindLabel("Bind a Vessel", "Bind", vesselPlan.k, "Vessel", "Vessels");
      els.vesselCard.classList.toggle("can-buy", canVesselOne && vesselPlan.can);
    }

    if (state.unlockedThrones) {
      if (els.throneCard.classList.contains("is-hidden")) {
        revealThrones(false);
      }
      var thronePlan = purchasePlan(state.thrones, state.vessels);
      var canThroneOne = state.vessels >= producerCost(state.thrones);
      var thronePct = Math.round(
        (normalizeAspect(state.aspect) === "dominion" ? 15 : 10) * state.thrones
      );
      els.throneOwned.textContent = F.formatNumber(state.thrones);
      els.throneProd.textContent = "+" + thronePct + "% production";
      els.throneCost.textContent = F.formatNumber(thronePlan.cost) + " Vessels";
      els.throneBuy.disabled = !canThroneOne || !thronePlan.can;
      els.throneBuy.textContent = bindLabel("Raise a Throne", "Raise", thronePlan.k, "Throne", "Thrones");
      els.throneCard.classList.toggle("can-buy", canThroneOne && thronePlan.can);
    }

    var ritesOpen = !!state.unlockedWell || state.shades >= 1;
    if (els.ritesPanel) {
      els.ritesPanel.classList.toggle("is-hidden", !ritesOpen);
    }
    if (ritesOpen) {
      var sCost = siphonCost(state.siphonLevel);
      var sMult = siphonMult(state.siphonLevel);
      if (els.siphonEffect) els.siphonEffect.textContent = "Siphon \u00d7" + sMult;
      if (els.siphonCost) els.siphonCost.textContent = F.formatNumber(sCost) + " Souls";
      if (els.siphonBuy) els.siphonBuy.disabled = state.souls < sCost;

      if (els.levyRow) {
        els.levyRow.classList.toggle("is-hidden", !state.unlockedSpirits);
      }
      if (state.unlockedSpirits) {
        var lCost = levyCost(state.levyLevel);
        var lMult = levyMult(state.levyLevel);
        if (els.levyEffect) els.levyEffect.textContent = "Levy \u00d7" + lMult;
        if (els.levyCost) els.levyCost.textContent = F.formatNumber(lCost) + " Shades";
        if (els.levyBuy) els.levyBuy.disabled = state.shades < lCost;
      }

      var drawsOpen = !!state.unlockedWellDraws || !!state.wellDraws;
      if (els.wellDrawsRow) {
        els.wellDrawsRow.classList.toggle("is-hidden", !drawsOpen);
      }
      if (drawsOpen) {
        if (state.wellDraws) {
          if (els.wellDrawsEffect) els.wellDrawsEffect.textContent = "The well draws";
          if (els.wellDrawsCost) els.wellDrawsCost.textContent = "—";
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
            els.wellDrawsBuy.disabled = state.souls < WELL_DRAWS_COST;
            els.wellDrawsBuy.textContent = "Let the Well Draw";
          }
        }
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
          prodMult(state.favorEarned + gain, 0, state.edictLevel)
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

      var eCost = edictCost(state.edictLevel);
      var ePct = Math.round(25 * state.edictLevel);
      if (els.edictEffect) els.edictEffect.textContent = "+" + ePct + "% production";
      if (els.edictCost) els.edictCost.textContent = F.formatNumber(eCost) + " Favor";
      if (els.edictBuy) {
        els.edictBuy.disabled = state.favor < eCost;
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
    }

    if (els.nextGoal) {
      els.nextGoal.textContent = nextGoal(state);
    }
    renderChronicle();
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

    els.gatherBtn.addEventListener("click", harvest);
    els.wellBuy.addEventListener("click", buyWell);
    els.shadeBuy.addEventListener("click", buyShade);
    els.spiritBuy.addEventListener("click", buySpirit);
    els.vesselBuy.addEventListener("click", buyVessel);
    els.throneBuy.addEventListener("click", buyThrone);
    els.tributeBtn.addEventListener("click", layTribute);
    els.tributeFootBtn.addEventListener("click", layTribute);
    els.edictBuy.addEventListener("click", buyEdict);
    els.memoryBuy.addEventListener("click", buyMemory);
    if (els.siphonBuy) els.siphonBuy.addEventListener("click", buySiphon);
    if (els.levyBuy) els.levyBuy.addEventListener("click", buyLevy);
    if (els.wellDrawsBuy) els.wellDrawsBuy.addEventListener("click", buyWellDraws);
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
    checkUnlock();
    if (state.unlockedWell) revealWell();
    if (state.unlockedSpirits) revealSpirits(false);
    if (state.unlockedVessels) revealVessels(false);
    if (state.unlockedThrones) revealThrones(false);
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
    favorGain: favorGain,
    prestigeMult: prestigeMult,
    prodMult: prodMult,
    producerCost: producerCost,
    bulkCost: bulkCost,
    edictCost: edictCost,
    memoryCost: memoryCost,
    siphonCost: siphonCost,
    levyCost: levyCost,
    siphonMult: siphonMult,
    levyMult: levyMult,
    harvestMult: harvestMult,
    bindingMult: bindingMult,
    throneWeight: throneWeight,
    normalizeAspect: normalizeAspect,
    nextGoal: nextGoal
  };
})();
