(function (global) {
  "use strict";

  var GAME_VERSION = "6.9.1";
  var SAVE_KEY = "soulgather-v0";
  var SAVE_BAK1_KEY = "soulgather-v0.bak1";
  var SAVE_BAK2_KEY = "soulgather-v0.bak2";
  var BAK1_MS = 60 * 1000;
  var BAK2_MS = 60 * 60 * 1000;
  var COST_BASE = 10;
  var COST_MULT = 1.15;
  var WELL_COST_BASE = 25;
  var WELL_COST_MULT = 1.5;
  var WELL_EARLY_MULT = 1.35;
  var LANTERN_COST_BASE = 30;
  var LANTERN_COST_MULT = 1.2;
  var MARK_COST_BASE = 8;
  var MARK_COST_MULT = 2;
  var SHADE_SOULS_PER_SEC = 1;
  var SPIRIT_SHADES_PER_SEC = 0.1;
  var VESSEL_SPIRITS_PER_SEC = 0.1;
  var CENSER_ASH_PER_SEC = 0.2;
  var PYRE_ASH_PER_SEC = 0.15;
  var PYRE_COST_BASE = 2;
  var PYRE_COST_MULT = 1.2;
  var UNLOCK_PYRES = 3;
  var URN_ASH_PER_SEC = 0.1;
  var URN_COST_BASE = 3;
  var URN_COST_MULT = 1.28;
  var UNLOCK_URNS = 6;
  var HEARTH_ASH_PER_SEC = 0.08;
  var HEARTH_COST_BASE = 4;
  var HEARTH_COST_MULT = 1.28;
  var UNLOCK_HEARTHS = 6;
  var BEACON_ASH_PER_SEC = 0.06;
  var BEACON_COST_BASE = 4;
  var BEACON_COST_MULT = 1.28;
  var UNLOCK_BEACONS = 6;
  var SPIRE_ASH_PER_SEC = 0.045;
  var SPIRE_COST_BASE = 5;
  var SPIRE_COST_MULT = 1.28;
  var UNLOCK_SPIRES = 6;
  var OBELISK_ASH_PER_SEC = 0.03;
  var OBELISK_COST_BASE = 6;
  var OBELISK_COST_MULT = 1.28;
  var UNLOCK_OBELISKS = 6;
  var UNLOCK_CHALICES = 5;
  var CHALICE_MAX = 12;
  var CHALICE_COST_BASE = 32;
  var CHALICE_COST_MULT = 1.65;
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
  var RENDER_HZ = 12;
  var RENDER_MS = 1000 / RENDER_HZ;
  var AUTOSAVE_MS = 5000;
  var MAX_DT = 8 * 60 * 60;
  var AUTOBIND_INTERVAL = 1;
  var LIVE_FRAME_MAX = 1.0;
  var HOLLOW_GRACE = 90;
  var HOLLOW_INTERVAL = 45;
  var HOLLOW_MAX = 5;
  var HOLLOW_PENALTY = 0.04;
  var HOLLOW_SOUL_CLEAR_CAP = 500;
  var HOLLOW_SOUL_CLEAR_FLOOR = 25;
  var HOLLOW_ASH_CLEAR_FLOOR = 5;
  var HOLLOW_SHADE_CLEAR_FLOOR = 3;
  var HOLLOW_CLEAR_FRAC = 0.02;
  var TOAST_MS = 5200;
  var TOAST_FAST_MS = 1800;
  var TOAST_QUEUE_MAX = 5;
  var AWAY_MIN_DT = 2;
  var AWAY_SUMMARY_DT = 60;
  var TITHE_MIN = 25;
  var TITHE_FRAC = 0.1;
  var TITHE_SECS = 60;
  var FETTER_COST_BASE = 20;
  var FETTER_COST_MULT = 1.2;
  var UNLOCK_FETTERS = 3;
  var UNLOCK_AUTOBIND_SHADES = 15;
  var UNLOCK_AUTOBIND_SPIRITS = 10;
  var UNLOCK_AUTOBIND_VESSELS = 3;
  var UNLOCK_AUTOBIND_LANTERNS = 8;
  var UNLOCK_AUTOBIND_FETTERS = 6;
  var UNLOCK_AUTOBIND_CENSERS = 4;
  var UNLOCK_AUTOBIND_THRONES = 4;
  var UNLOCK_AUTOBIND_PYRES = 4;
  var UNLOCK_AUTOBIND_CHALICES = 3;
  var UNLOCK_AUTOBIND_URNS = 3;
  var UNLOCK_AUTOBIND_HEARTHS = 3;
  var UNLOCK_AUTOBIND_BEACONS = 3;
  var UNLOCK_AUTOBIND_SPIRES = 3;
  var UNLOCK_AUTOBIND_OBELISKS = 3;
  var CINDER_COST_BASE = 22;
  var CINDER_COST_MULT = 2.6;
  var URN_RITE_COST_BASE = 18;
  var URN_RITE_COST_MULT = 2.6;
  var HEARTH_RITE_COST_BASE = 20;
  var HEARTH_RITE_COST_MULT = 2.6;
  var BEACON_RITE_COST_BASE = 24;
  var BEACON_RITE_COST_MULT = 2.6;
  var SPIRE_RITE_COST_BASE = 26;
  var SPIRE_RITE_COST_MULT = 2.6;
  var CINDER_COST = CINDER_COST_BASE;
  var URN_RITE_COST = URN_RITE_COST_BASE;
  var HEARTH_RITE_COST = HEARTH_RITE_COST_BASE;
  var BEACON_RITE_COST = BEACON_RITE_COST_BASE;
  var SPIRE_RITE_COST = SPIRE_RITE_COST_BASE;
  var RITE_MULT_BASE = 1.55;
  var SIPHON_COST_BASE = 65;
  var LEVY_COST_BASE = 22;
  var BINDING_TOLL_COST_BASE = 40;
  var BINDING_TOLL_COST_MULT = 1.45;
  var BINDING_TOLL_MAX = 4;
  var BINDING_TOLL_RATE = 1.12;
  var BINDING_TOLL_COST_BONUS = 0.15;
  var UNLOCK_NIGHT_LANTERNS = 8;
  var UNLOCK_VEIL_CLICKS = 50;
  var UNLOCK_TOLL_CLICKS = 80;
  var TOLL_COST = 40;
  var TOLL_SECS = 25;
  var VEIL_MIN = 20;
  var VEIL_FRAC = 0.15;
  var VEIL_SECS = 20;
  var WAKE_COST = 30;
  var WAKE_SECS = 40;
  var UNLOCK_WAKE_ASH = 40;
  var NIGHT_TITHE_MIN = 10;
  var NIGHT_TITHE_FRAC = 0.25;
  var NIGHT_TITHE_SECS = 30;
  var REMEMBRANCE_FAVOR_COST = 3;
  var FAVOR_SOULS_BASE = 25000;
  var ASHEN_TIDE_MAX = 5;
  var OSSUARY_COST = 1;
  var OSSUARY_MAX = 8;
  var PROCESSION_COST = 1;
  var PROCESSION_SECS = 45;
  var KNELL_COST = 1;
  var KNELL_SECS = 20;
  var LONGER_PROCESSION_MAX = 5;
  var DEEPER_TOLL_MAX = 5;
  var LONGER_WAKE_MAX = 5;
  var LONGER_TITHE_MAX = 5;
  var LONGER_VEIL_MAX = 5;
  var LONGER_HYMN_MAX = 5;
  var LONGER_KNELL_MAX = 5;
  var CHOIR_MAX = 10;
  var CHOIR_LANTERN_COST = 5;
  var UNLOCK_CHOIR_LANTERNS = 5;
  var UNLOCK_CHOIR_ASH = 20;
  var HYMN_SECS = 45;
  var HYMN_MULT = 1.25;
  var ANNOUNCE_THROTTLE_MS = 2500;
  var REDUCE_MOTION_KEY = "soulgather-reduce-motion";

  var NAME_THRESHOLDS = [25, 50, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 25e3, 50000];
  var BOUND_NAMES = [
    "The First Siphon",
    "The Quiet Chain",
    "The Hollow Tithe",
    "The Bound Echo",
    "The Ashen Mouth",
    "The Night Levy",
    "The Well's Hunger",
    "The Seat Unseen",
    "The Kindled Fetter",
    "The Crown's Shadow",
    "The Last Vessel",
    "The Name He Keeps"
  ];

  var ASPECT_IDS = { harvest: "harvest", binding: "binding", dominion: "dominion" };
  var ASPECT_NAMES = {
    harvest: "Harvest",
    binding: "Binding",
    dominion: "Dominion"
  };

  var VOW_IDS = { stillness: "stillness", poverty: "poverty", hunger: "hunger", ember: "ember" };
  var VOW_NAMES = {
    stillness: "Stillness",
    poverty: "Poverty",
    hunger: "Hunger",
    ember: "Ember"
  };

  var VOW_HUD_STRINGS = {
    stillness: "Vow: Stillness \u2014 no draws",
    poverty: "Vow: Poverty \u2014 no autobind Thrones",
    hunger: "Vow: Hunger \u2014 tithe \u00d72",
    ember: "Vow: Ember \u2014 no Night\u2019s Tithe, no Wake"
  };

  var CHRONICLE_ORDER = [
    "soul",
    "shade",
    "spirits",
    "well",
    "vessels",
    "throne",
    "rite",
    "cinders",
    "urnRite",
    "hearthRite",
    "beaconRite",
    "spireRite",
    "bindingToll",
    "wellDraw",
    "tribute",
    "aspect",
    "echo",
    "seat",
    "lantern",
    "ash",
    "mark",
    "censer",
    "pyre",
    "urn",
    "hearth",
    "beacon",
    "spire",
    "obelisk",
    "fetter",
    "giftSouls",
    "giftShades",
    "giftVessel",
    "giftTribute",
    "giftThousand",
    "giftLantern",
    "giftCenser",
    "giftFetter",
    "giftTenThousand",
    "giftThrone",
    "giftCrown",
    "giftFirstName",
    "giftFiveTributes",
    "giftNamesComplete",
    "giftFirstVeil",
    "giftFirstWake",
    "giftPeakLanterns",
    "giftPeakFetters",
    "giftPeakCensers",
    "giftFirstPyre",
    "giftFirstUrn",
    "giftFirstHearth",
    "giftFirstBeacon",
    "giftFirstSpire",
    "giftFirstObelisk",
    "giftEightTributes",
    "giftPeakPyres",
    "giftPeakUrns",
    "giftPeakHearths",
    "giftPeakBeacons",
    "giftPeakSpires",
    "giftPeakObelisks",
    "giftFirstCinders",
    "giftFirstUrnRite",
    "giftFirstHearthRite",
    "giftFirstBeaconRite",
    "giftFirstSpireRite",
    "giftFirstChalice",
    "giftThreeChalices",
    "giftTwelveTributes",
    "giftSixteenTributes",
    "giftTwentyTributes",
    "giftTwentyFourTributes",
    "giftTwentyEightTributes",
    "giftThirtyTwoTributes",
    "giftThirtySixTributes",
    "giftFortyTributes",
    "giftFullCup",
    "giftFirstOssuary",
    "giftFullOssuary",
    "giftHundredDraws",
    "giftTwoHundredDraws",
    "giftThreeHundredDraws",
    "giftFirstEmberVow",
    "giftTwoVows",
    "giftThreeVows",
    "giftAllVows",
    "giftFirstProcession",
    "giftFirstLongerProcession",
    "giftFirstDeeperToll",
    "giftFirstLongerWake",
    "giftFirstLongerTithe",
    "giftFirstLongerVeil",
    "giftFirstLongerHymn",
    "giftFirstLongerKnell",
    "giftFirstToll",
    "giftFirstKnell",
    "choir",
    "veil",
    "toll",
    "wake",
    "procession",
    "knell",
    "longerProcession",
    "deeperToll",
    "longerWake",
    "longerTithe",
    "longerVeil",
    "longerHymn",
    "longerKnell",
    "choirEdict",
    "hymnEdict",
    "smokeEdict",
    "embersEdict",
    "urnEdict",
    "hearthEdict",
    "beaconEdict",
    "spireEdict",
    "obeliskEdict",
    "cinderEdict",
    "cutEdict",
    "tendingEdict",
    "gleamEdict",
    "riseEdict",
    "cupEdict",
    "draughtEdict",
    "wakeEdict",
    "processionEdict",
    "tollEdict",
    "veilEdict",
    "knellEdict",
    "nightEdict",
    "chalice",
    "ossuary",
    "hymn",
    "vow",
    "vowStillness",
    "vowPoverty",
    "vowHunger",
    "vowEmber",
    "quietCourt",
    "name1",
    "name2",
    "name3",
    "name4",
    "name5",
    "name6",
    "name7",
    "name8",
    "name9",
    "name10",
    "name11",
    "name12",
    "namesComplete"
  ];

  var CHRONICLE_LINES = {
    soul: "The first soul was drawn.",
    shade: "The first Shade was bound.",
    spirits: "Bound Spirits answered the well.",
    well: "The well was carved deeper.",
    vessels: "A vessel opened to house a will.",
    throne: "A throne was raised.",
    rite: "The first rite was cut.",
    cinders: "The cinders were cut.",
    urnRite: "The urn was cut.",
    hearthRite: "The hearth was cut.",
    beaconRite: "The beacon was cut.",
    spireRite: "The spire was cut.",
    bindingToll: "The binding toll was paid.",
    wellDraw: "The well began to draw.",
    tribute: "Tribute was laid. The GodKing remembers.",
    aspect: "An aspect was sworn.",
    echo: "An echo was spoken.",
    seat: "A seat was raised.",
    lantern: "A lantern was kindled.",
    ash: "Ash gathered at the well's lip.",
    mark: "A mark was pressed.",
    censer: "A censer was raised.",
    pyre: "A pyre was raised.",
    urn: "An urn was raised.",
    hearth: "A hearth was kindled.",
    beacon: "A beacon was raised.",
    spire: "A spire was raised.",
    obelisk: "An obelisk was raised.",
    fetter: "A fetter was bound.",
    giftSouls: "A hundred souls. The well returned a gift.",
    giftShades: "Ten shades. One more was given.",
    giftVessel: "The first vessel. Ash remains.",
    giftTribute: "First tribute. The GodKing was generous.",
    giftThousand: "A thousand souls. The well returned a greater gift.",
    giftLantern: "The first lantern. The well returned ten souls.",
    giftCenser: "The first censer. Ash remains in the smoke.",
    giftFetter: "The first fetter. Two shades were given.",
    giftTenThousand: "Ten thousand souls. The well returned a greater gift.",
    giftThrone: "The first throne. A vessel was returned.",
    giftCrown: "The crown was generous.",
    giftFirstName: "The first name. The well returned fifteen souls.",
    giftFiveTributes: "Five tributes. The GodKing returned two Favor.",
    giftNamesComplete: "The names complete. The GodKing returned Favor.",
    giftFirstVeil: "The first veil. The well returned ten ash.",
    giftFirstWake: "The first wake. The well returned eight ash.",
    giftPeakLanterns: "Ten lanterns. The well returned twenty souls.",
    giftPeakFetters: "Eight fetters. The well returned fifteen shades.",
    giftPeakCensers: "Five censers. The well returned eight ash.",
    giftFirstPyre: "The first pyre. The well returned five ash.",
    giftFirstUrn: "The first urn. The well returned six ash.",
    giftFirstHearth: "The first hearth. The well returned eight ash.",
    giftFirstBeacon: "The first beacon. The well returned eight ash.",
    giftFirstSpire: "The first spire. The well returned eight ash.",
    giftFirstObelisk: "The first obelisk. The well returned eight ash.",
    giftEightTributes: "Eight emptyings. The well returned twenty-five souls.",
    giftPeakPyres: "Five pyres. The well returned ten ash.",
    giftPeakUrns: "Five urns. The well returned eight ash.",
    giftPeakHearths: "Five hearths. The well returned ten ash.",
    giftPeakBeacons: "Five beacons. The well returned seven ash.",
    giftPeakSpires: "Five spires. The well returned seven ash.",
    giftPeakObelisks: "Five obelisks. The well returned seven ash.",
    giftFirstCinders: "The first cinders. The well returned eight ash.",
    giftFirstUrnRite: "The first cut urn. The well returned six ash.",
    giftFirstHearthRite: "The first cut hearth. The well returned eight ash.",
    giftFirstBeaconRite: "The first cut beacon. The well returned ten ash.",
    giftFirstSpireRite: "The first cut spire. The well returned ten ash.",
    giftFirstChalice: "The first chalice. The well returned fifteen souls.",
    giftTwelveTributes: "Twelve emptyings. The well returned forty souls.",
    giftSixteenTributes: "Sixteen emptyings. The well returned fifty souls.",
    giftTwentyTributes: "Twenty emptyings. The well returned sixty souls.",
    giftTwentyFourTributes: "Twenty-four emptyings. The well returned seventy souls.",
    giftTwentyEightTributes: "Twenty-eight emptyings. The well returned eighty souls.",
    giftThirtyTwoTributes: "Thirty-two emptyings. The well returned ninety souls.",
    giftThirtySixTributes: "Thirty-six emptyings. The well returned a hundred souls.",
    giftFortyTributes: "Forty emptyings. The well returned a hundred and ten souls.",
    giftFullCup: "The cup was full. The well returned twenty-five souls.",
    giftThreeChalices: "Three chalices. The well returned ten ash.",
    giftFirstOssuary: "The first bone. The well returned ten souls.",
    giftFullOssuary: "Eight bones. The well returned twenty souls.",
    giftHundredDraws: "A hundred draws. The well returned fifteen souls.",
    giftTwoHundredDraws: "Two hundred draws. The well returned twenty souls.",
    giftThreeHundredDraws: "Three hundred draws. The well returned twenty-five souls.",
    giftFirstEmberVow: "The ember vow. The well returned eight ash.",
    giftTwoVows: "Two vows remembered. The well returned ten souls.",
    giftThreeVows: "Three vows remembered. The well returned fifteen souls.",
    giftAllVows: "Four vows remembered. The well returned twenty-five souls.",
    giftFirstProcession: "The first procession. The well returned five souls.",
    giftFirstLongerProcession: "The first longer walk. The well returned five souls.",
    giftFirstDeeperToll: "The first longer toll. The well returned five souls.",
    giftFirstLongerWake: "The first longer wake. The well returned five souls.",
    giftFirstLongerTithe: "The first longer tithe. The well returned five souls.",
    giftFirstLongerVeil: "The first longer veil. The well returned five souls.",
    giftFirstLongerHymn: "The first longer hymn. The well returned five souls.",
    giftFirstLongerKnell: "The first longer knell. The well returned five souls.",
    giftFirstToll: "The first toll. The well returned ten souls.",
    giftFirstKnell: "The first knell. The well returned five souls.",
    choir: "The choir of ash was raised.",
    veil: "The veil thinned.",
    toll: "The toll was sounded.",
    wake: "The wake was kept.",
    procession: "The procession began.",
    knell: "The knell was sounded.",
    longerProcession: "The walk was lengthened.",
    deeperToll: "The toll was lengthened.",
    longerWake: "The wake was lengthened.",
    longerTithe: "The tithe was lengthened.",
    longerVeil: "The veil was lengthened.",
    longerHymn: "The hymn was lengthened.",
    longerKnell: "The knell was lengthened.",
    choirEdict: "The choir was spoken.",
    hymnEdict: "The hymn was spoken.",
    smokeEdict: "The smoke was spoken.",
    embersEdict: "The embers were spoken.",
    urnEdict: "The urn was spoken.",
    hearthEdict: "The hearth was spoken.",
    beaconEdict: "The beacon was spoken.",
    spireEdict: "The spire was spoken.",
    obeliskEdict: "The obelisk was spoken.",
    cinderEdict: "The cinders were spoken.",
    cutEdict: "The cut was spoken.",
    tendingEdict: "The tending was spoken.",
    gleamEdict: "The gleam was spoken.",
    riseEdict: "The rise was spoken.",
    cupEdict: "The cup was spoken.",
    draughtEdict: "The draught was spoken.",
    wakeEdict: "The wake was spoken.",
    processionEdict: "The procession was spoken.",
    tollEdict: "The toll was spoken.",
    veilEdict: "The veil was spoken.",
    knellEdict: "The knell was spoken.",
    nightEdict: "The night was spoken.",
    chalice: "A chalice was raised.",
    ossuary: "A bone was laid.",
    hymn: "A hymn followed the emptying.",
    vow: "A vow was sworn.",
    vowStillness: "A stillness vow was sworn.",
    vowPoverty: "A poverty vow was sworn.",
    vowHunger: "A hunger vow was sworn.",
    vowEmber: "An ember vow was sworn.",
    quietCourt: "The Quiet Court was seated.",
    name1: "The First Siphon.",
    name2: "The Quiet Chain.",
    name3: "The Hollow Tithe.",
    name4: "The Bound Echo.",
    name5: "The Ashen Mouth.",
    name6: "The Night Levy.",
    name7: "The Well's Hunger.",
    name8: "The Seat Unseen.",
    name9: "The Kindled Fetter.",
    name10: "The Crown's Shadow.",
    name11: "The Last Vessel.",
    name12: "The Name He Keeps.",
    namesComplete: "The names of the bound were spoken."
  };

  var BONUS_TO_GIFT = {
    bonusLifetimeSouls:  "giftLifetimeSouls",
    bonusPeakShades:     "giftPeakShades",
    bonusFirstVessel:    "giftFirstVessel",
    bonusFirstTribute:   "giftFirstTribute",
    bonusThousandSouls:  "giftThousandSouls",
    bonusFirstLantern:   "giftFirstLantern",
    bonusFirstCenser:    "giftFirstCenser",
    bonusFirstFetter:    "giftFirstFetter",
    bonusTenThousandSouls:"giftTenThousandSouls",
    bonusFirstThrone:    "giftFirstThrone"
  };

  var PEAK_STATS = {
    peakShades:   "shades",
    peakLanterns: "lanterns",
    peakFetters:  "fetters",
    peakCensers:  "censers",
    peakPyres:    "pyres",
    peakUrns:     "urns",
    peakHearths:  "hearths",
    peakBeacons:  "beacons",
    peakSpires:   "spires",
    peakObelisks: "obelisks"
  };

  /* ── Normalizer / lookup functions ─────────────────────────────────── */

  function normalizeAspect(raw) {
    if (raw === "harvest" || raw === "aspectHarvest") return "harvest";
    if (raw === "binding" || raw === "aspectBinding") return "binding";
    if (raw === "dominion" || raw === "aspectDominion") return "dominion";
    return "";
  }

  function normalizeVow(raw) {
    if (raw === "stillness") return "stillness";
    if (raw === "poverty") return "poverty";
    if (raw === "hunger") return "hunger";
    if (raw === "ember") return "ember";
    return "";
  }

  function normalizeBuyMode(mode) {
    if (mode === "10" || mode === "max" || mode === "1") return mode;
    return "1";
  }

  function emptyVowsKnown() {
    return { stillness: false, poverty: false, hunger: false, ember: false };
  }

  function vowsKnownCount(known) {
    if (!known || typeof known !== "object") return 0;
    var n = 0;
    if (known.stillness || known.knownStillness) n += 1;
    if (known.poverty || known.knownPoverty) n += 1;
    if (known.hunger || known.knownHunger) n += 1;
    if (known.ember || known.knownEmber) n += 1;
    return n;
  }

  function normalizeVowsKnown(raw) {
    var out = emptyVowsKnown();
    if (!raw || typeof raw !== "object") return out;
    if (raw.stillness || raw.knownStillness) out.stillness = true;
    if (raw.poverty || raw.knownPoverty) out.poverty = true;
    if (raw.hunger || raw.knownHunger) out.hunger = true;
    if (raw.ember || raw.knownEmber) out.ember = true;
    return out;
  }

  function vowExtraFavor(vow, hungerPaid) {
    var v = normalizeVow(vow);
    if (v === "stillness" || v === "poverty" || v === "ember") return 1;
    if (v === "hunger") return hungerPaid ? 1 : 0;
    return 0;
  }

  function favorOrdinal(n) {
    var k = Math.max(0, Math.floor(Number(n) || 0));
    var mod100 = k % 100;
    if (mod100 >= 11 && mod100 <= 13) return k + "th";
    switch (k % 10) {
      case 1:
        return k + "st";
      case 2:
        return k + "nd";
      case 3:
        return k + "rd";
      default:
        return k + "th";
    }
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

  function chaliceMult(n) {
    var k = Math.max(0, Math.floor(Number(n) || 0));
    if (k > CHALICE_MAX) k = CHALICE_MAX;
    return 1 + 0.08 * k;
  }

  function ossuaryMult(n) {
    var k = Math.max(0, Math.floor(Number(n) || 0));
    if (k > OSSUARY_MAX) k = OSSUARY_MAX;
    return 1 + 0.05 * k;
  }

  function namesCompleteMult(on) {
    return on ? 1.05 : 1;
  }

  function titheMult(on) {
    return on ? 2 : 1;
  }

  function nightMult(on) {
    return on ? 3 : 1;
  }

  function veilMult(on) {
    return on ? 2 : 1;
  }

  function tollMult(on) {
    return on ? 2 : 1;
  }

  function hymnMult(on) {
    return on ? HYMN_MULT : 1;
  }

  function wakeMult(on) {
    return on ? 2 : 1;
  }

  function processionMult(on) {
    return on ? 1.2 : 1;
  }

  function knellMult(on) {
    return on ? 2 : 1;
  }

  function hollowMult(stacks) {
    var n = Math.max(0, Math.floor(Number(stacks) || 0));
    if (n > HOLLOW_MAX) n = HOLLOW_MAX;
    return 1 - HOLLOW_PENALTY * n;
  }

  function stacksWantedFromIdle(idle) {
    var t = Number(idle) || 0;
    if (!(t >= HOLLOW_GRACE)) return 0;
    return Math.min(HOLLOW_MAX, 1 + Math.floor((t - HOLLOW_GRACE) / HOLLOW_INTERVAL));
  }

  function toastOverflowLabel(n) {
    return "\u2026and " + n + " more.";
  }

  function toastOverflowCount(message) {
    var m = /^\u2026and (\d+) more\.$/.exec(String(message || ""));
    return m ? parseInt(m[1], 10) : 0;
  }

  global.SoulgatherConfig = {
    GAME_VERSION: GAME_VERSION,
    SAVE_KEY: SAVE_KEY,
    SAVE_BAK1_KEY: SAVE_BAK1_KEY,
    SAVE_BAK2_KEY: SAVE_BAK2_KEY,
    BAK1_MS: BAK1_MS,
    BAK2_MS: BAK2_MS,
    COST_BASE: COST_BASE,
    COST_MULT: COST_MULT,
    WELL_COST_BASE: WELL_COST_BASE,
    WELL_COST_MULT: WELL_COST_MULT,
    WELL_EARLY_MULT: WELL_EARLY_MULT,
    LANTERN_COST_BASE: LANTERN_COST_BASE,
    LANTERN_COST_MULT: LANTERN_COST_MULT,
    MARK_COST_BASE: MARK_COST_BASE,
    MARK_COST_MULT: MARK_COST_MULT,
    SHADE_SOULS_PER_SEC: SHADE_SOULS_PER_SEC,
    SPIRIT_SHADES_PER_SEC: SPIRIT_SHADES_PER_SEC,
    VESSEL_SPIRITS_PER_SEC: VESSEL_SPIRITS_PER_SEC,
    CENSER_ASH_PER_SEC: CENSER_ASH_PER_SEC,
    PYRE_ASH_PER_SEC: PYRE_ASH_PER_SEC,
    PYRE_COST_BASE: PYRE_COST_BASE,
    PYRE_COST_MULT: PYRE_COST_MULT,
    UNLOCK_PYRES: UNLOCK_PYRES,
    URN_ASH_PER_SEC: URN_ASH_PER_SEC,
    URN_COST_BASE: URN_COST_BASE,
    URN_COST_MULT: URN_COST_MULT,
    UNLOCK_URNS: UNLOCK_URNS,
    HEARTH_ASH_PER_SEC: HEARTH_ASH_PER_SEC,
    HEARTH_COST_BASE: HEARTH_COST_BASE,
    HEARTH_COST_MULT: HEARTH_COST_MULT,
    UNLOCK_HEARTHS: UNLOCK_HEARTHS,
    BEACON_ASH_PER_SEC: BEACON_ASH_PER_SEC,
    BEACON_COST_BASE: BEACON_COST_BASE,
    BEACON_COST_MULT: BEACON_COST_MULT,
    UNLOCK_BEACONS: UNLOCK_BEACONS,
    SPIRE_ASH_PER_SEC: SPIRE_ASH_PER_SEC,
    SPIRE_COST_BASE: SPIRE_COST_BASE,
    SPIRE_COST_MULT: SPIRE_COST_MULT,
    UNLOCK_SPIRES: UNLOCK_SPIRES,
    OBELISK_ASH_PER_SEC: OBELISK_ASH_PER_SEC,
    OBELISK_COST_BASE: OBELISK_COST_BASE,
    OBELISK_COST_MULT: OBELISK_COST_MULT,
    UNLOCK_OBELISKS: UNLOCK_OBELISKS,
    UNLOCK_CHALICES: UNLOCK_CHALICES,
    CHALICE_MAX: CHALICE_MAX,
    CHALICE_COST_BASE: CHALICE_COST_BASE,
    CHALICE_COST_MULT: CHALICE_COST_MULT,
    ASH_FROM_SHADE_FRAC: ASH_FROM_SHADE_FRAC,
    UNLOCK_SHADES: UNLOCK_SHADES,
    UNLOCK_LIFETIME: UNLOCK_LIFETIME,
    UNLOCK_SPIRITS_FOR_VESSELS: UNLOCK_SPIRITS_FOR_VESSELS,
    UNLOCK_LIFETIME_SHADES: UNLOCK_LIFETIME_SHADES,
    UNLOCK_VESSELS_FOR_THRONES: UNLOCK_VESSELS_FOR_THRONES,
    UNLOCK_LIFETIME_SPIRITS: UNLOCK_LIFETIME_SPIRITS,
    UNLOCK_WELL_DRAWS_SHADES: UNLOCK_WELL_DRAWS_SHADES,
    UNLOCK_LANTERNS: UNLOCK_LANTERNS,
    UNLOCK_MARKS_LIFETIME: UNLOCK_MARKS_LIFETIME,
    UNLOCK_CENSERS_VESSELS: UNLOCK_CENSERS_VESSELS,
    UNLOCK_CENSERS_LIFETIME_SPIRITS: UNLOCK_CENSERS_LIFETIME_SPIRITS,
    WELL_DRAWS_COST: WELL_DRAWS_COST,
    BULK_CAP: BULK_CAP,
    RENDER_HZ: RENDER_HZ,
    RENDER_MS: RENDER_MS,
    AUTOSAVE_MS: AUTOSAVE_MS,
    MAX_DT: MAX_DT,
    AUTOBIND_INTERVAL: AUTOBIND_INTERVAL,
    LIVE_FRAME_MAX: LIVE_FRAME_MAX,
    HOLLOW_GRACE: HOLLOW_GRACE,
    HOLLOW_INTERVAL: HOLLOW_INTERVAL,
    HOLLOW_MAX: HOLLOW_MAX,
    HOLLOW_PENALTY: HOLLOW_PENALTY,
    HOLLOW_SOUL_CLEAR_CAP: HOLLOW_SOUL_CLEAR_CAP,
    HOLLOW_SOUL_CLEAR_FLOOR: HOLLOW_SOUL_CLEAR_FLOOR,
    HOLLOW_ASH_CLEAR_FLOOR: HOLLOW_ASH_CLEAR_FLOOR,
    HOLLOW_SHADE_CLEAR_FLOOR: HOLLOW_SHADE_CLEAR_FLOOR,
    HOLLOW_CLEAR_FRAC: HOLLOW_CLEAR_FRAC,
    TOAST_MS: TOAST_MS,
    TOAST_FAST_MS: TOAST_FAST_MS,
    TOAST_QUEUE_MAX: TOAST_QUEUE_MAX,
    AWAY_MIN_DT: AWAY_MIN_DT,
    AWAY_SUMMARY_DT: AWAY_SUMMARY_DT,
    TITHE_MIN: TITHE_MIN,
    TITHE_FRAC: TITHE_FRAC,
    TITHE_SECS: TITHE_SECS,
    FETTER_COST_BASE: FETTER_COST_BASE,
    FETTER_COST_MULT: FETTER_COST_MULT,
    UNLOCK_FETTERS: UNLOCK_FETTERS,
    UNLOCK_AUTOBIND_SHADES: UNLOCK_AUTOBIND_SHADES,
    UNLOCK_AUTOBIND_SPIRITS: UNLOCK_AUTOBIND_SPIRITS,
    UNLOCK_AUTOBIND_VESSELS: UNLOCK_AUTOBIND_VESSELS,
    UNLOCK_AUTOBIND_LANTERNS: UNLOCK_AUTOBIND_LANTERNS,
    UNLOCK_AUTOBIND_FETTERS: UNLOCK_AUTOBIND_FETTERS,
    UNLOCK_AUTOBIND_CENSERS: UNLOCK_AUTOBIND_CENSERS,
    UNLOCK_AUTOBIND_THRONES: UNLOCK_AUTOBIND_THRONES,
    UNLOCK_AUTOBIND_PYRES: UNLOCK_AUTOBIND_PYRES,
    UNLOCK_AUTOBIND_CHALICES: UNLOCK_AUTOBIND_CHALICES,
    UNLOCK_AUTOBIND_URNS: UNLOCK_AUTOBIND_URNS,
    UNLOCK_AUTOBIND_HEARTHS: UNLOCK_AUTOBIND_HEARTHS,
    UNLOCK_AUTOBIND_BEACONS: UNLOCK_AUTOBIND_BEACONS,
    UNLOCK_AUTOBIND_SPIRES: UNLOCK_AUTOBIND_SPIRES,
    UNLOCK_AUTOBIND_OBELISKS: UNLOCK_AUTOBIND_OBELISKS,
    CINDER_COST_BASE: CINDER_COST_BASE,
    CINDER_COST_MULT: CINDER_COST_MULT,
    URN_RITE_COST_BASE: URN_RITE_COST_BASE,
    URN_RITE_COST_MULT: URN_RITE_COST_MULT,
    HEARTH_RITE_COST_BASE: HEARTH_RITE_COST_BASE,
    HEARTH_RITE_COST_MULT: HEARTH_RITE_COST_MULT,
    BEACON_RITE_COST_BASE: BEACON_RITE_COST_BASE,
    BEACON_RITE_COST_MULT: BEACON_RITE_COST_MULT,
    SPIRE_RITE_COST_BASE: SPIRE_RITE_COST_BASE,
    SPIRE_RITE_COST_MULT: SPIRE_RITE_COST_MULT,
    CINDER_COST: CINDER_COST,
    URN_RITE_COST: URN_RITE_COST,
    HEARTH_RITE_COST: HEARTH_RITE_COST,
    BEACON_RITE_COST: BEACON_RITE_COST,
    SPIRE_RITE_COST: SPIRE_RITE_COST,
    RITE_MULT_BASE: RITE_MULT_BASE,
    SIPHON_COST_BASE: SIPHON_COST_BASE,
    LEVY_COST_BASE: LEVY_COST_BASE,
    BINDING_TOLL_COST_BASE: BINDING_TOLL_COST_BASE,
    BINDING_TOLL_COST_MULT: BINDING_TOLL_COST_MULT,
    BINDING_TOLL_MAX: BINDING_TOLL_MAX,
    BINDING_TOLL_RATE: BINDING_TOLL_RATE,
    BINDING_TOLL_COST_BONUS: BINDING_TOLL_COST_BONUS,
    UNLOCK_NIGHT_LANTERNS: UNLOCK_NIGHT_LANTERNS,
    UNLOCK_VEIL_CLICKS: UNLOCK_VEIL_CLICKS,
    UNLOCK_TOLL_CLICKS: UNLOCK_TOLL_CLICKS,
    TOLL_COST: TOLL_COST,
    TOLL_SECS: TOLL_SECS,
    VEIL_MIN: VEIL_MIN,
    VEIL_FRAC: VEIL_FRAC,
    VEIL_SECS: VEIL_SECS,
    WAKE_COST: WAKE_COST,
    WAKE_SECS: WAKE_SECS,
    UNLOCK_WAKE_ASH: UNLOCK_WAKE_ASH,
    NIGHT_TITHE_MIN: NIGHT_TITHE_MIN,
    NIGHT_TITHE_FRAC: NIGHT_TITHE_FRAC,
    NIGHT_TITHE_SECS: NIGHT_TITHE_SECS,
    REMEMBRANCE_FAVOR_COST: REMEMBRANCE_FAVOR_COST,
    FAVOR_SOULS_BASE: FAVOR_SOULS_BASE,
    ASHEN_TIDE_MAX: ASHEN_TIDE_MAX,
    OSSUARY_COST: OSSUARY_COST,
    OSSUARY_MAX: OSSUARY_MAX,
    PROCESSION_COST: PROCESSION_COST,
    PROCESSION_SECS: PROCESSION_SECS,
    KNELL_COST: KNELL_COST,
    KNELL_SECS: KNELL_SECS,
    LONGER_PROCESSION_MAX: LONGER_PROCESSION_MAX,
    DEEPER_TOLL_MAX: DEEPER_TOLL_MAX,
    LONGER_WAKE_MAX: LONGER_WAKE_MAX,
    LONGER_TITHE_MAX: LONGER_TITHE_MAX,
    LONGER_VEIL_MAX: LONGER_VEIL_MAX,
    LONGER_HYMN_MAX: LONGER_HYMN_MAX,
    LONGER_KNELL_MAX: LONGER_KNELL_MAX,
    CHOIR_MAX: CHOIR_MAX,
    CHOIR_LANTERN_COST: CHOIR_LANTERN_COST,
    UNLOCK_CHOIR_LANTERNS: UNLOCK_CHOIR_LANTERNS,
    UNLOCK_CHOIR_ASH: UNLOCK_CHOIR_ASH,
    HYMN_SECS: HYMN_SECS,
    HYMN_MULT: HYMN_MULT,
    ANNOUNCE_THROTTLE_MS: ANNOUNCE_THROTTLE_MS,
    REDUCE_MOTION_KEY: REDUCE_MOTION_KEY,
    NAME_THRESHOLDS: NAME_THRESHOLDS,
    BOUND_NAMES: BOUND_NAMES,
    ASPECT_IDS: ASPECT_IDS,
    ASPECT_NAMES: ASPECT_NAMES,
    VOW_IDS: VOW_IDS,
    VOW_NAMES: VOW_NAMES,
    VOW_HUD_STRINGS: VOW_HUD_STRINGS,
    CHRONICLE_ORDER: CHRONICLE_ORDER,
    CHRONICLE_LINES: CHRONICLE_LINES,
    BONUS_TO_GIFT: BONUS_TO_GIFT,
    PEAK_STATS: PEAK_STATS,
    normalizeAspect: normalizeAspect,
    normalizeVow: normalizeVow,
    normalizeBuyMode: normalizeBuyMode,
    emptyVowsKnown: emptyVowsKnown,
    vowsKnownCount: vowsKnownCount,
    normalizeVowsKnown: normalizeVowsKnown,
    vowExtraFavor: vowExtraFavor,
    favorOrdinal: favorOrdinal,
    prestigeMult: prestigeMult,
    harvestMult: harvestMult,
    bindingMult: bindingMult,
    throneWeight: throneWeight,
    chaliceMult: chaliceMult,
    ossuaryMult: ossuaryMult,
    namesCompleteMult: namesCompleteMult,
    titheMult: titheMult,
    nightMult: nightMult,
    veilMult: veilMult,
    tollMult: tollMult,
    hymnMult: hymnMult,
    wakeMult: wakeMult,
    processionMult: processionMult,
    knellMult: knellMult,
    hollowMult: hollowMult,
    stacksWantedFromIdle: stacksWantedFromIdle,
    toastOverflowLabel: toastOverflowLabel,
    toastOverflowCount: toastOverflowCount
  };
})(typeof window !== "undefined" ? window : globalThis);
