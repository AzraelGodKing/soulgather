# Soulgather

Original idle/incremental game. Harvest souls from a void well for the GodKing. Not a Swarm Simulator clone.

## Play

Live: https://azraelgodking.github.io/soulgather/
Open `index.html` in a browser (`file://` is fine). Or `python3 -m http.server` in this folder. Vanilla HTML/CSS/JS, no build, no npm. Pushes to main redeploy Pages.

Hotkeys: Space/Enter draw, 1/2/3 buy mode, T Tithe, N Night's Tithe, V Thin the Veil, C Cut the Cinders, B Lay the Bone, W Keep the Wake, P Begin the Procession (not while typing in Memory; do not steal if another button is focused). Ember vow no-ops N and W.

Save is local (`soulgather-v0`). Footer Memory export/import. Reset wipes everything including Favor.

## Loop (short)

Click the well → Shades → Lanterns (half-step) → Bound Spirits → Fetters (half-step) → Vessels → Censers (side) → Pyres (ash half-step) / Thrones → Chalices (late ash sink at 5 Thrones). Ash feeds Marks, Night's Tithe, The Wake, Thin the Veil, and Chalices. Choir of Ash this-run (lantern spend; Edict of the Choir starts it). Hymn after Tribute (`45 + 15 * hymnEdictLevel` seconds, ×1.25). Wake after Tribute if Edict of the Wake (`wakeSecs` when level >= 1). Rites (Siphon / Levy / Rite of Cinders), Tithe, Autobind Shades / Autobind Spirits / Autobind Vessels / Autobind Lanterns / Autobind Fetters / Autobind Censers / Autobind Thrones / Autobind Pyres / Autobind Chalices this-run. Tribute for Favor. Reliquary + Aspects + Vows after first Tribute. The Crown after 2 tributes or 3 Favor earned. Names of the Bound from peak Shades. Remembrance after 3 tributes or 5 Favor earned. Ossuary in Remembrance / The Crown (late Remembrance sink). The Procession in Remembrance / The Crown (this-run Remembrance burst, 45s ×1.2).

## Design notes (v3.5)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v3.5 extras.**

**The Procession (Remembrance / The Crown).** Late this-run Remembrance burst so Remembrance has a spend besides Ossuary / Deeper Night / Ashen Tide. Visible when the Remembrance panel is visible (same gate as Ossuary / Deeper Night — 3 tributes or 5 Favor earned). Compact crown-row after Ossuary. Cost: 1 Remembrance (`PROCESSION_COST = 1`). ×1. Cannot pay while already active (`processionLeft > 0`). Duration: `PROCESSION_SECS = 45`. `processionMult(on) = on ? 1.2 : 1`, folded into `currentMult` / `rateMult` as an extra factor so it blesses the same rates as other prodMult factors (souls/s, producers, clicks). Flavor: *They walk the emptied hall.* Button: **Begin the Procession**. Remaining time on the button while walking. Persist `processionLeft` this-run; wipe Tribute and Reset. Chronicle first: "The procession began." Offline catchup ticks the timer.

**Hotkey P.** P pays Begin the Procession if Remembrance is unlocked, not already walking, and remembrance >= 1. Same T/N/V/C/B/W rules: ignore Memory textarea; do not steal a focused non-gather button.

**Gift: first Procession.** Once when first paid: +5 souls (`Num.add`). Flag `giftFirstProcession` persist Tribute, wipe Reset. Toast: "Five souls for the first procession." Chronicle: "The first procession. The well returned five souls." If Chronicle already has procession or remaining `processionLeft` > 0 on old save, seed flag without grant (like first veil / first wake).

## Design notes (v3.4)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v3.4 extras.**

**Gift: two vows remembered.** Once when `vowsKnownCount` >= 2: +10 souls (`Num.add`). Flag `giftTwoVows` persist Tribute, wipe Reset. Same pattern as other gifts (check flag, set, grant, save). Toast: "Ten souls for two vows." Chronicle: "Two vows remembered. The well returned ten souls." If Chronicle already has this gift, seed without grant. If missing flag and count already >= 2, grant once then save. In `tryMilestoneGifts` / `checkUnlock`, check two-vows BEFORE all-four so a jump to 4 in one swear can pay two (if not already) then all-four.

**Per-vow Chronicle (already from v3.3).** Per-vow Chronicle keys already exist from v3.3 — do not duplicate them; seed from them. Swearing a vow still marks the generic first-any line (`vow`: "A vow was sworn."). It also marks a specific key so later emptyings can tell which vow it was: stillness → "A stillness vow was sworn." (`vowStillness`); poverty → "A poverty vow was sworn." (`vowPoverty`); hunger → "A hunger vow was sworn." (`vowHunger`); ember keeps the existing ember line (`vowEmber`: "An ember vow was sworn."). On load, seed `vowsKnown.<id>` from those specific Chronicle keys (and existing ember lines `vowEmber` / `giftFirstEmberVow`, plus this-run `vow`). Do not grant gifts from seeding.

## Design notes (v3.3)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v3.3 extras.**

**Vows remembered (cross-emptying collection).** Swearing different Vows across runs is a late goal, not only the next producer. When a vow is sworn (stillness / poverty / hunger / ember), persist a flag for that id (`state.vowsKnown = { stillness, poverty, hunger, ember }` booleans). Persist through Tribute; wipe Footer Reset. Helper `vowsKnownCount(known)` returns 0–4. Quiet Chronicle stats line when count >= 1: `Vows remembered: n / 4` (same style as Names bound, `is-hidden` until count >= 1). Does not steal Aspect-swear or Tribute-ready next-goal. Old saves: seed from Chronicle vow lines if those exist (`vowStillness` / `vowPoverty` / `vowHunger` / `vowEmber` / `giftFirstEmberVow`, plus this-run `vow`) without granting the all-four gift yet.

**Gift: all four vows remembered.** Once when `vowsKnownCount` >= 4: +25 souls (`Num.add`). Flag `giftAllVows` persist Tribute, wipe Reset. Same pattern as other gifts (check flag, set, grant, save). Toast: "Twenty-five souls for four vows." Chronicle: "Four vows remembered. The well returned twenty-five souls." If Chronicle already has this gift, seed without grant. If missing flag and count already 4, grant once then save.

## Design notes (v3.2)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v3.2 extras.**

**Vow of Ember.** Fourth optional this-run vow, same template as Stillness / Poverty / Hunger. Unlock after first Tribute (`favorEarned >= 1`). Flavor: *The fire waits.* Button: **Swear Ember**. Effect: cannot pay Night's Tithe and cannot Keep the Wake (buttons disabled; hotkeys N and W no-op). Marks, Cinders, Veil, and Chalices still allowed. Extra Favor on Tribute: +1 (`vowExtraFavor("ember") = 1`, same as Stillness). Persist `vow` this-run (`""|"stillness"|"poverty"|"hunger"|"ember"`). Wipe on Tribute after applying extra Favor (must swear again). Reset wipes. Chronicle first ember vow: "An ember vow was sworn." Next-goal may hint "A vow may be sworn." after an Aspect is sworn; never steals Aspect-swear or Tribute-ready.

**Gift: first Ember vow.** Once when ember vow is first sworn: +8 ash (`Num.add`). Flag `giftFirstEmberVow` persist Tribute, wipe Reset. Same pattern as other gifts (check flag, set, grant, save). Toast: "Eight ash for the ember vow." Chronicle: "The ember vow. The well returned eight ash." If Chronicle already has ember vow (`vowEmber` / `giftFirstEmberVow`), seed the flag without granting.

## Design notes (v3.1)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v3.1 extras.**

**Edict of the Wake (Reliquary).** Persist through Tribute; spend Favor on hand. Cost `8 × 2^n` Favor. Flavor: *The fire is remembered.* Button: **Speak the Wake**. Helper `wakeSecs(level) = 40 + 15 * max(0, floor(level))` (`wakeSecs(0)=40`, `wakeSecs(1)=55`, `wakeSecs(2)=70`). Tribute meta: if `wakeEdictLevel >= 1`, `wakeLeft = wakeSecs(wakeEdictLevel)` and unlock the Wake row if wakeLeft > 0. Helper `wakeEdictStartsWake(level)` true when level >= 1 — Tribute does **not** start a free wake at level 0 (`wakeSecs(0)=40` would wrongly start one). Does **not** change a wake already ticking if you buy the edict mid-run (next Tribute only). Wipe on Footer Reset. ×1 only. Chronicle first wake edict: "The wake was spoken." Paid Keep the Wake is still 40s (`WAKE_SECS`).

**Gift: 16 tributes laid.** Once when `tributesLaid >= 16`: +50 souls (`Num.add`). Flag `giftSixteenTributes` persist Tribute, wipe Reset. Same pattern as `giftTwelveTributes` / `giftEightTributes` / `giftFiveTributes` (check flag, set, grant, save). Toast: "Fifty souls for sixteen emptyings." Chronicle: "Sixteen emptyings. The well returned fifty souls." Old saves with `tributesLaid >= 16` seed the flag without granting.

## Design notes (v3.0)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v3.0 extras.**

**The Wake (this-run Ash burst).** Unlock when Pyres are unlocked (3 Censers / pyres card visible) or Ash >= 40 this run. Hidden until then. Compact rite row next to Night's Tithe. Cost: 30 Ash (`WAKE_COST = 30`, Num). ×1. Cannot pay while already active (`wakeLeft > 0`). Duration: `WAKE_SECS = 40`. `wakeMult(on) = on ? 2 : 1`. Folded into both censer ash and pyre ash inside `ashPerSec()` (same place nightMult/hymnMult wrap). Stacks with Night and Hymn (multiplicative). Flavor: *The fire does not sleep.* Button: **Keep the Wake**. HUD line while active (`Wake ×2 — Xs`). Persist `wakeLeft` this-run; wipe Tribute and Reset. Chronicle first: "The wake was kept." Poverty: follow Night's Tithe (not blocked). Offline catchup ticks the timer.

**Hotkey W.** W pays Keep the Wake if unlocked, not already burning, and Ash >= 30. Same T/N/V/C/B rules: ignore Memory textarea; do not steal a focused non-gather button.

**Gift: first Wake.** Once when Wake is first paid (`wakeLeft` set): +8 ash (`Num.add`). Flag `giftFirstWake` persist Tribute, wipe Reset. Toast: "Eight ash for the first wake." Chronicle: "The first wake. The well returned eight ash." If Chronicle already has wake or remaining `wakeLeft` > 0 on old save, seed flag without grant (like first veil).

## Design notes (v2.9)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v2.9 extras.**

**Hotkey B.** B pays Ossuary (Lay the Bone) if Remembrance is unlocked, `ossuaryLevel < OSSUARY_MAX` (8), and remembrance >= `OSSUARY_COST` (1). Same T/N/V/C rules: ignore Memory textarea; do not steal a focused non-gather button. Calls the existing buy handler.

**Gift: full ossuary (8 bones).** Once when `ossuaryLevel >= 8`: +20 souls (`Num.add`). Flag `giftFullOssuary` persist Tribute, wipe Reset. Toast: "Twenty souls for eight bones." Chronicle: "Eight bones. The well returned twenty souls." If Chronicle already has the gift, seed flag without grant. If missing flag and `ossuaryLevel` already >= 8, grant once then save.

**Gift: 100 well draws this emptying.** Once when `clicksThisRun >= 100`: +15 souls (`Num.add`). Flag `giftHundredDraws` persist Tribute, wipe Reset. Toast: "Fifteen souls for a hundred draws." Chronicle: "A hundred draws. The well returned fifteen souls." Vow of Stillness blocks draws so this gift is a mid-run click goal. `clicksThisRun` already exists (veil unlock). Old saves: if `clicksThisRun` already >= 100 and flag missing, grant once then save unless Chronicle has the gift. Wipes on Tribute with `clicksThisRun` (this-run counter), so the gift flag persist means it only pays once ever — first emptying that hits 100 clicks.

## Design notes (v2.8)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v2.8 extras.**

**The Ossuary (Remembrance / The Crown).** Late Remembrance sink so late-run has another persist spend besides Deeper Night and Ashen Tide. Visible when the Remembrance panel is visible (same gate as Deeper Night / Ashen Tide — 3 tributes or 5 Favor earned, plus Remembrance unlocked). Row after Ashen Tide. Cost: 1 Remembrance per level (`OSSUARY_COST = 1`). ×1 only. Cap `OSSUARY_MAX = 8`. `ossuaryLevel` persist through Tribute; wipe Reset. `ossuaryMult(n) = 1 + 0.05 * n`, folded into `prodMult` as an extra multiplicative factor (with prestige/thrones/edict/crown/names/chalices). Flavor: *Bones keep the count.* Button: **Lay the Bone**. Effect: +5% production each. Chronicle first ossuary: "A bone was laid." Save/load Number.

**Gift: first Ossuary.** Once when `ossuaryLevel >= 1`: +10 souls (`Num.add`). Flag `giftFirstOssuary` persist Tribute, wipe Reset. Toast: "Ten souls for the first bone." Chronicle: "The first bone. The well returned ten souls." If Chronicle already has first ossuary or `ossuaryLevel` already >= 1 on old save, seed flag without grant (like first veil).

## Design notes (v2.7)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v2.7 extras.**

**Quiet Court also starts Autobind Chalices.** If `quietCourtLevel >= 1` on Tribute meta, also set `autobindChalices = true` (in addition to shade, lantern, fetter, and pyre autobind). Helper `quietCourtStartsChaliceAutobind(level)` true when level >= 1. If chalices < 3 this emptying, the toggle is on but the row stays hidden until 3 — that's OK; once 3 chalices, it is already on.

**Edict of Draught (Reliquary).** Persist through Tribute; spend Favor on hand. Cost `10 × 2^n` Favor. Flavor: *The draught is remembered.* Button: **Speak the Draught**. Tribute meta: if `draughtEdictLevel >= 1`, set `autobindChalices = true` (row still waits for 3 chalices this emptying). Does **not** buy chalices itself. Helper `draughtStartsChaliceAutobind(level)` true when level >= 1. Does not apply until Tribute. Wipe on Footer Reset. ×1 only. Chronicle first draught edict: "The draught was spoken."

**Gift: 3 chalices.** Once when chalices >= 3: +10 ash (`Num.add`). Flag `giftThreeChalices` persist Tribute, wipe Reset. Same pattern as `giftFullCup` / `giftPeakPyres` (check flag, set, grant, save). Toast: "Ten ash for three chalices." Chronicle: "Three chalices. The well returned ten ash." Missing flag grants once if already >= 3 on load then save, unless Chronicle already has the gift (seed without grant).

## Design notes (v2.6)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v2.6 extras.**

**Autobind Chalices (QoL).** Unlock at 3 Chalices this run (`UNLOCK_AUTOBIND_CHALICES = 3`). Quiet toggle in Rites. Flavor: *The cup fills itself.* When on, each live tick buys exactly 1 Chalice if affordable and below cap 12 (always ×1, ignores buy-mode; cost is Ash via existing `chaliceCost`). Persist `autobindChalices` this-run; wipe on Tribute. Offline catchup does not autobind. Autobind Chalices spends Ash; Marks / Night's Tithe / Thin the Veil / Rite of Cinders also spend Ash — no extra hold-back; documented risk only.

**Gift: 12 tributes laid.** Once when `tributesLaid >= 12`: +40 souls (`Num.add`). Flag `giftTwelveTributes` persist Tribute, wipe Reset. Same pattern as `giftEightTributes` / `giftFiveTributes` (check flag, set, grant, save). Toast: "Forty souls for twelve emptyings." Chronicle: "Twelve emptyings. The well returned forty souls." Old saves with `tributesLaid >= 12` seed the flag without granting.

**Gift: full cup (12 chalices).** Once when chalices >= 12 (the cap): +25 souls (`Num.add`). Flag `giftFullCup` persist Tribute, wipe Reset. Same pattern as other gifts (check flag, set, grant, save). Toast: "Twenty-five souls for a full cup." Chronicle: "The cup was full. The well returned twenty-five souls." If old save already has 12 chalices (edict or bought), grant once on load if flag missing then save (peak-censer style), UNLESS Chronicle already has the gift (seed without grant).

## Design notes (v2.5)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v2.5 extras.**

**Chalices (late ash sink).** Unlock at 5 Thrones this run (`UNLOCK_CHALICES = 5`). Hidden until then. Card in the producer row after Thrones. Spend Ash, cost `floor(20 × 1.5^n)` via `N.cost`. Buy 1 / 10 / Max using existing buyMode + bulkCost. Cap at 12 (`CHALICE_MAX = 12`). Each Chalice: `chaliceMult(n) = 1 + 0.08 * n`, folded into `prodMult` as an extra multiplicative factor `(1 + 0.08 * chalices)`. Flavor: *He drinks from the emptied well.* Button: **Raise a Chalice**. Effect: +8% production each. Persist this-run; wipe Tribute then apply edict. Reset wipes. First chalice Chronicle: "A chalice was raised." Poverty: follow Marks/Censers (do not block). Next-goal may hint after Thrones if still unbought (does not steal Aspect-swear or Tribute-ready).

**Edict of the Cup (Reliquary).** Persist through Tribute; spend Favor on hand. Cost `9 × 2^n` Favor. Flavor: *The cup waits.* Button: **Speak the Cup**. Tribute meta: `chalices = min(12, cupEdictLevel)` and unlock if > 0. Helper `cupStartsChalices(level)` returns `min(12, max(0, floor(level)))`. Does not apply until Tribute. Wipe on Footer Reset. ×1 only. Chronicle first cup edict: "The cup was spoken."

**Gift: first Chalice.** Once when `chalices >= 1`: +15 souls (`Num.add`). Flag `giftFirstChalice` persist Tribute, wipe Reset. Same pattern as other gifts (check flag, set, grant, save). Toast: "Fifteen souls for the first chalice." Chronicle: "The first chalice. The well returned fifteen souls." If Chronicle already has first chalice OR remaining chalices from edict, seed flag without grant. If missing flag and chalices>=1 and no chronicle, grant once then save.

## Design notes (v2.4)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v2.4 extras.**

**Quiet Court also starts Autobind Pyres.** If `quietCourtLevel >= 1` on Tribute meta, also set `autobindPyres = true` (in addition to shade, lantern, and fetter autobind). Helper `quietCourtStartsPyreAutobind(level)` true when level >= 1. If pyres < 4 this emptying, the toggle is on but the row stays hidden until 4 — that's OK; once 4 pyres, it is already on.

**Gift: first Cinders.** Once when `cinderLevel >= 1`: +8 ash (`Num.add`). Flag `giftFirstCinders` persist Tribute, wipe Reset. Same pattern as other gifts (check flag, set, grant, save). Toast: "Eight ash for the first cinders." Chronicle: "The first cinders. The well returned eight ash." If Chronicle already has this gift OR remaining `cinderLevel > 0` on old save, seed flag without grant (like first veil). If chronicle has "The cinders were cut." seed without grant.

## Design notes (v2.3)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v2.3 extras.**

**Hotkey C.** C pays Cut the Cinders if unlocked, not disabled, and Ash >= 15 (same Num check as the button). Same T/N/V rules: ignore Memory textarea; do not steal a focused non-gather button. Do not bind C when typing in import/export.

**Edict of Cinders (Reliquary).** Persist through Tribute; spend Favor on hand. Cost `8 × 2^n` Favor. Flavor: *The doubling is remembered.* Button: **Speak the Cinders**. Tribute meta: if `cinderEdictLevel >= 1`, set `autobindPyres = true` (row still waits for 4 pyres this emptying). Does **not** set this-run `cinderLevel` (Cinders stays this-run). Helper `cinderEdictStartsPyreAutobind(level)` true when level >= 1. Does not apply until Tribute. Wipe on Footer Reset. ×1 only. Chronicle first cinder edict: "The cinders were spoken."

**Gift: peak pyres >= 5.** Once when `peakPyres` (Num.cmp) reaches 5: +10 ash (`Num.add`). Track `peakPyres` persist Tribute (already exists from v2.1 — reuse; do not duplicate). Flag `giftPeakPyres` persist Tribute, wipe Reset. Same flag-then-grant as peak censers (check flag, set, grant, save). Toast: "Ten ash for five pyres." Chronicle: "Five pyres. The well returned ten ash." Missing flag grants once if peak already >= 5, then save.

## Design notes (v2.2)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v2.2 extras.**

**Autobind Pyres (QoL).** Unlock at 4 Pyres this run (`UNLOCK_AUTOBIND_PYRES = 4`). Quiet toggle in Rites. Flavor: *The coals tend themselves.* When on, each live tick buys exactly 1 Pyre if affordable (always ×1, ignores buy-mode; existing pyre cost is Censers). Persist `autobindPyres` this-run; wipe on Tribute. Offline catchup does not autobind. Autobind Pyres spends Censers; Autobind Censers buys Censers — no extra hold-back; documented risk only.

**Rite of Cinders (this-run).** Unlock when Pyres are unlocked (3 Censers / Pyres card visible). Compact row in Rites with Siphon/Levy. Spend 15 Ash (`Num`). ×1 buy only. Each purchase +1 `cinderLevel` (starts 0). Pyre portion of Ash/s is multiplied by `cinderMult = 2^cinderLevel` via Num helper `cinderMult(level)` (`cinderMult(0)=1`, first buy = ×2). Flavor: *The pyre is doubled.* Button: **Cut the Cinders**. Cost line: 15 Ash. Poverty does not block (same as Siphon). Persist `cinderLevel` this-run; wipe Tribute. Chronicle first cinders: "The cinders were cut." Does not persist through Tribute.

**Gift: 8 tributes laid.** Once when `tributesLaid >= 8`: +25 souls (`Num.add`). Flag `giftEightTributes` persist Tribute, wipe Reset. Same pattern as `giftFiveTributes` (check flag, set, grant, save). Toast: "Twenty-five souls for eight emptyings." Chronicle: "Eight emptyings. The well returned twenty-five souls." Old saves with `tributesLaid >= 8` seed the flag without granting.

## Design notes (v2.1)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v2.1 extras.**

**Pyres (ash half-step).** Unlock at 3 Censers this run (`UNLOCK_PYRES = 3`). Hidden until then. Card in the producer row after Censers. Spend Censers, cost `floor(2 × 1.2^n)` via `N.cost`. Buy 1 / 10 / Max using existing buyMode + bulkCost (unlike Censers). Each Pyre produces `0.15` Ash/s × `rateMult` × `nightMult` × `hymnMult`, additive with Censer ash (does not steal censer output). Flavor: *A pyre for what remains.* Button: **Raise a Pyre**. Effect line: ash/sec from pyres. State `pyres` is Num. Persist this-run; wipe Tribute (unless Edict of Embers starts some). Track `peakPyres` persist Tribute. Poverty does not block (same as Censers / Marks). First pyre Chronicle: "A pyre was raised." Reset wipes. Autobind Censers and Autobind Thrones do not reserve Censers a player is saving for a Pyre — no extra hold-back; documented risk only. Autobind Censers spends Vessels to buy more Censers; Autobind Thrones spends Vessels. Neither spends Censers.

**Edict of Embers (Reliquary).** Persist through Tribute; spend Favor on hand. Cost `7 × 2^n` Favor. Flavor: *The coals wait.* Button: **Speak the Embers**. Tribute meta: `pyres = fromNumber(embersEdictLevel)` and unlock the Pyres card if > 0. Helper `embersStartsPyres(level)` returns `max(0, floor(level))`. Does not apply until Tribute. Wipe on Footer Reset. ×1 only. Chronicle first embers edict: "The embers were spoken."

**Gift: first Pyre.** Once when `pyres` (Num.cmp) reaches 1: +5 ash (`Num.add`). Flag `giftFirstPyre` persist Tribute, wipe Reset. Same pattern as other gifts (check flag, set, grant, save). Toast: "Five ash for the first pyre." Chronicle: "The first pyre. The well returned five ash." Old saves that already have pyres or Chronicle pyre seed the flag without granting (like first veil). If Chronicle already has first pyre OR remaining pyres from edict, seed flag without grant; if `peakPyres >= 1` and no flag and no chronicle, grant once then save.

## Design notes (v2.0)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v2.0 extras.**

**Autobind Thrones (QoL).** Unlock at 4 Thrones this run. Quiet toggle in Rites. Flavor: *The seat claims itself.* When on, each live tick buys exactly 1 Throne if affordable (always ×1, ignores buy-mode; cost in Vessels). Persist `autobindThrones` this-run; wipe on Tribute. Offline catchup does not autobind.

**Edict of Smoke (Reliquary).** Persist through Tribute; spend Favor on hand. Cost `6 × 2^n` Favor. Flavor: *The brazier remembers.* Button: **Speak the Smoke**. Tribute meta: if `smokeEdictLevel >= 1`, set `autobindCensers = true` (row still waits for 4 censers this emptying unless they already have 4 from ashen/kindling/etc.). Does not buy censers itself. Helper `smokeStartsCenserAutobind` is true when level >= 1. Does not apply until Tribute. Wipe on Footer Reset. ×1 only. Chronicle first smoke edict: "The smoke was spoken."

**Gift: peak censers >= 5.** Once when `peakCensers` (Num.cmp) reaches 5: +8 ash (`Num.add`). Track `peakCensers` persist Tribute (old saves seed from current censers). Flag `giftPeakCensers` persist Tribute, wipe Reset. Same pattern as `giftPeakFetters` (check flag, set, grant, save) — so load cannot double-fire. Toast: "Eight ash for five censers." Chronicle: "Five censers. The well returned eight ash." Missing flag is false; if peak already >= 5 on first load, grant once then save.

## Design notes (v1.9)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v1.9 extras.**

**Quiet Court also starts Autobind Fetters.** If `quietCourtLevel >= 1` on Tribute meta, also set `autobindFetters = true` (in addition to shade autobind and lantern autobind from v1.8). Helper `quietCourtStartsFetterAutobind` is true when level >= 1. If fetters < 6 this emptying, the toggle is on but the row stays hidden until 6 — that's OK; once 6 fetters, it is already on.

**Autobind Censers (QoL).** Unlock at 4 Censers this run. Quiet toggle in Rites. Flavor: *The smoke tends itself.* When on, each live tick buys exactly 1 Censer if affordable (always ×1, ignores buy-mode; cost in Vessels). Persist `autobindCensers` this-run; wipe on Tribute. Offline catchup does not autobind.

**Gift: peak fetters >= 8.** Once when `peakFetters` (Num.cmp) reaches 8: +15 shades (`Num.add`). Track `peakFetters` persist Tribute (old saves seed from current fetters). Flag `giftPeakFetters` persist Tribute, wipe Reset. Same pattern as `giftPeakLanterns` (check flag, set, grant, save) — so load cannot double-fire. Toast: "Fifteen shades for eight fetters." Chronicle: "Eight fetters. The well returned fifteen shades." Missing flag is false; if peak already >= 8 on first load, grant once then save. If that grant unlocks the Well, follow existing gift / checkUnlock patterns.

## Design notes (v1.8)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v1.8 extras.**

**Quiet Court also starts Autobind Lanterns.** If `quietCourtLevel >= 1` on Tribute meta, also set `autobindLanterns = true` (in addition to shade autobind). Helper `quietCourtStartsLanternAutobind` is true when level >= 1. If lanterns < 8 this emptying, the toggle is on but the row stays hidden until 8 — that's OK; once 8 lanterns, it is already on.

**Autobind Fetters (QoL).** Unlock at 6 Fetters this run. Quiet toggle in Rites. Flavor: *The chain learns itself.* When on, each live tick buys exactly 1 Fetter if affordable (always ×1, ignores buy-mode; cost in Shades). Persist `autobindFetters` this-run; wipe on Tribute. Offline catchup does not autobind.

**Gift: peak lanterns >= 10.** Once when `peakLanterns` (Num.cmp) reaches 10: +20 souls (`Num.add`). Track `peakLanterns` persist Tribute (old saves seed from current lanterns). Flag `giftPeakLanterns` persist Tribute, wipe Reset. Same pattern as other gifts (check flag, set, grant, save) — so load cannot double-fire. Toast: "Twenty souls for ten lanterns." Chronicle: "Ten lanterns. The well returned twenty souls." Missing flag is false; if peak already >= 10 on first load, grant once then save.

## Design notes (v1.7)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v1.7 extras.**

**Hotkey V.** V pays Thin the Veil if available and affordable. Same rules as T/N: ignore Memory textarea; do not steal if a button that is not Draw from the Well is focused.

**Edict of Hymn (Reliquary).** Persist through Tribute; spend Favor on hand. Cost `4 × 2^n` Favor. Each level: Tribute hymn lasts `45 + 15 * hymnEdictLevel` seconds (`hymnLeft = 45 + 15 * hymnEdictLevel`). Flavor: *The song lingers.* Button: **Speak the Hymn**. Does not apply until Tribute (does not extend a hymn already running). Wipe on Footer Reset. ×1 only. Chronicle first hymn edict.

**Gift: first Veil.** Once when first thinning the veil: +10 Ash (`Num.add`). Flag `giftFirstVeil` persist Tribute, wipe Reset. Same pattern as other gifts (check flag, set, grant, save). Toast: "Ten ash for the first veil." Chronicle: "The first veil. The well returned ten ash." Old saves with Chronicle veil (or remaining `veilLeft`) seed the flag without granting.

## Design notes (v1.6)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v1.6 extras.**

**Autobind Lanterns (QoL).** Unlock at 8 Lanterns this run. Quiet toggle in Rites. Flavor: *The lights kindle themselves.* When on, each live tick buys exactly 1 Lantern if affordable (always ×1, ignores buy-mode). Persist `autobindLanterns` this-run; wipe on Tribute. Offline catchup does not autobind.

**The Veil Thins (clicker side burst).** Unlock after 50 well clicks this run (`clicksThisRun` increments on `harvest` only — not Well Draws). Compact row in Rites. Spend Ash: 20 Ash minimum or 15% of current Ash, whichever is higher (`max(20, floor(ash * 0.15))`). Cannot pay if Ash < 20. Effect: 20s of `veilMult = 2` on **clickPower only** (not shade/spirit/vessel production). Button: **Thin the Veil**. Flavor: *The well's mouth is near.* Persist `veilLeft`. Wipe on Tribute. Can overlap the soul Tithe (both multiply clickPower). No stack with itself. Timed on the same dt tick (`veilLeft` decremented in `applyDt`; persist so a mid-burst refresh continues). Offline catchup consumes remaining `veilLeft`. Chronicle first veil.

**Gift: names complete.** Once when `namesComplete` becomes true: +1 Favor on hand, and +1 Remembrance if Remembrance is already unlocked (else just +1 Favor). Flag `giftNamesComplete` persist Tribute, wipe Reset. Same pattern as other gifts (check flag, set, grant, save). Toast: "The GodKing returns Favor." (or "The GodKing returns Favor and Remembrance." if Remembrance is unlocked). Chronicle: "The names complete. The GodKing returned Favor." Old saves with `namesComplete` (or `namesBound >= 12`) seed the flag without granting.

## Design notes (v1.5)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v1.5 extras.**

**Hymn after Tribute (this-run buff).** After laying Tribute, the new emptying starts with `hymnLeft = 45` seconds of `hymnMult = 1.25` on shade souls/s, spirit shades/s, and Ash/s (not click). Quiet line under Blessing while active: `Hymn ×1.25 — Xs`. Persist `hymnLeft`. Flavor toast on Tribute apply: "A hymn follows the emptying." First-run (never tributes) has no hymn. Wipe on Footer Reset; Tribute reapplies 45s. Timed on the same dt tick as Tithe / Night's Tithe (`hymnLeft` decremented in `applyDt`; persist so a mid-hymn refresh continues). Offline catchup consumes remaining `hymnLeft`. Shade-derived Ash rides the boosted shade souls; Censer Ash is multiplied by `hymnMult` separately. Chronicle first hymn.

**Edict of the Choir (Reliquary).** Persist through Tribute; spend Favor on hand. Cost `5 × 2^n` Favor. Each level: start the emptying with +1 `choirLevel` (cap still 10). Flavor: *They already sang.* Button: **Speak the Choir**. Tribute meta: `choirLevel = min(10, choirEdictLevel)` — if this would skip lantern spend, that is intended (`unlockedChoir` if > 0). Does not apply until Tribute. Wipe on Footer Reset. ×1 only. Chronicle first choir edict.

**Gift: 5 tributes laid.** Once when `tributesLaid` reaches 5: +2 Favor on hand. Flag `giftFiveTributes` persist Tribute, wipe Reset. Same pattern as other gifts (check flag, set, grant, save). Toast: "The GodKing returns two Favor." Chronicle: "Five tributes. The GodKing returned two Favor." Old saves with `tributesLaid >= 5` seed the flag without granting.

## Design notes (v1.4)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v1.4 extras.**

**Blessing HUD.** `formatBlessing(n)` (js/format.js, also exported from game): 1 decimal when that is exact (`×1.5`, `×2.0`); 2 decimals when 1 decimal would round the value (`×1.05` for names complete, not `×1.1`). Blessing line and Tribute blessing use it.

**Choir of Ash (this-run side spend, not a producer-of-producer).** Unlock at 5 Lanterns this run OR Ash ≥ 20. Quiet row in Rites. Spend **5 Lanterns** (must have ≥ 5; subtract 5, keep `unlockedLanterns`). Each press: `choirLevel += 1`, extra +0.5% of shade soul production as additional Ash. Stacks with Ashen Tide: ash from shades = `(0.01 + 0.005 * ashenTideLevel + 0.005 * choirLevel) * shadeSouls/s`. Cap `choirLevel` at 10. Flavor: *They sing what the well discards.* Button: **Raise the Choir**. Wipe on Tribute. Chronicle first choir. Cannot press if lanterns < 5 or choir at cap.

**Gift: first Name unlocked.** When `namesBound` goes 0→1, once: +15 souls. Flag `giftFirstName` persist Tribute, wipe Reset. Same pattern as other gifts (check flag, set, grant, save). Toast: "Fifteen souls for the first name." Chronicle: "The first name. The well returned fifteen souls." Old saves with `namesBound >= 1` seed the flag without granting.

## Design notes (v1.3)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v1.3 extras.**

**Names of the Bound (collection side path).** Not a producer. Track `namesBound` integer 0–12. Persist through Tribute; wipe Footer Reset. Every time `peakShades` (Num.cmp) crosses the next threshold 25, 50, 100, 200, 400, 800, 1600, 3200, 6400, 12800, 25000, 50000, unlock the next Name, toast, and Chronicle a unique epithet. Completing all 12 sets permanent `namesComplete`: `prodMult *= 1.05` (`namesCompleteMult` true→1.05, false→1). Quiet Chronicle subsection lists unlocked names; locked slots show "—". No extra producer.

Epithets: The First Siphon, The Quiet Chain, The Hollow Tithe, The Bound Echo, The Ashen Mouth, The Night Levy, The Well's Hunger, The Seat Unseen, The Kindled Fetter, The Crown's Shadow, The Last Vessel, The Name He Keeps.

**Remembrance (late currency).** Unlock at `tributesLaid >= 3` OR `favorEarned >= 5`. Spend 3 Favor on hand for 1 Remembrance (Crown button: **Lay Remembrance**). Persist Remembrance and its upgrades through Tribute; wipe Reset only. Flavor: *What the GodKing keeps when Favor is spent.* Spend Remembrance ×1:

- **Deeper Night** — Night's Tithe lasts `30 + 10 * deeperNightLevel` seconds. Cost `1 × 2^n` Remembrance (1, 2, 4…). Button: Lengthen Night.
- **Ashen Tide** — Ash from shades is `1% + 0.5%` per level, cap 5 levels (3.5% at 5). Cost `1 × 2^n` Remembrance. Button: Raise the Tide.
- **The Ossuary** (v2.8) — +5% production each (`ossuaryMult(n) = 1 + 0.05 * n`), cap 8. Cost 1 Remembrance per level. Button: Lay the Bone. Persist through Tribute.

## Design notes (v1.2)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v1.2 extras.**

**Vows (optional this-run challenge).** Unlock after first Tribute (`favorEarned >= 1`), same moment as Aspects. Quieter panel near Aspects. A side path, not a producer. One vow per emptying, chosen or skipped. Skip = no vow (buttons remain until they pick or Tribute). Mutually exclusive, like Aspects. Persist `vow` this-run (`""|"stillness"|"poverty"|"hunger"|"ember"`) and `vowHungerPaid` bool. Wipe on Tribute after applying extra Favor. Extra Favor stacks with `bonusFirstTribute`. Next-goal must not steal Aspect-swear; if an Aspect is sworn and `vow === ""`, may hint "A vow may be sworn." (after tribute-ready and later unlock hints).

- **Vow of Stillness** — cannot click the well this emptying (gather button disabled; Space/Enter do not draw). Idle Well Draws still work. At Tribute, if sworn, extra Favor +1. Flavor: *The hand stays. The well works.* Button: Swear Stillness.
- **Vow of Poverty** — cannot buy Thrones this emptying. At Tribute extra +1 Favor if sworn. Flavor: *No seat until he remembers.* Button: Swear Poverty.
- **Vow of Hunger** — Tithe cost doubled this emptying; if you pay Tithe at least once while sworn (`vowHungerPaid`), extra +1 Favor at Tribute. Flavor: *Give twice. Be remembered.* Button: Swear Hunger.
- **Vow of Ember** (v3.2) — cannot pay Night's Tithe and cannot Keep the Wake this emptying (buttons disabled; hotkeys N and W no-op). Marks, Cinders, Veil, Chalices still allowed. At Tribute extra +1 Favor if sworn (`vowExtraFavor("ember") = 1`). Flavor: *The fire waits.* Button: Swear Ember.

**More milestone gifts (one-time).** Same flag pattern: persist through Tribute; wipe on Footer Reset. Check flag before granting; set flag then grant; save — so load cannot double-fire. `Num.add` for the bonus.

- 10000 lifetime or all-time souls: +500 souls now. Toast: "The well returns five hundred souls." Chronicle: "Ten thousand souls. The well returned a greater gift."
- First Throne: +1 Vessel refund (add 1 vessel) once. Toast: "A vessel is returned." Chronicle: "The first throne. A vessel was returned."
- First Crown Weight purchase: +1 Favor on hand once (`giftCrown`). Toast: "The crown was generous." Chronicle: "The crown was generous."

**Quiet Court (The Crown).** Persist through Tribute; spend Favor on hand. Cost `8 × 2^n` Favor. Each level: start the emptying with Autobind Shades already ON. Tribute meta: if `quietCourtLevel >= 1`, `autobind = true` and unlock the autobind row; also `autobindLanterns = true` (v1.8; row still waits for 8 lanterns this emptying); also `autobindFetters = true` (v1.9; row still waits for 6 fetters this emptying); also `autobindPyres = true` (v2.4; row still waits for 4 pyres this emptying); also `autobindChalices = true` (v2.7; row still waits for 3 chalices this emptying). Flavor: *They bind in his sleep.* Button: Seat the Court.

## Design notes (v1.1)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v1.1 extras.**

**More milestone gifts (one-time).** Same flag rules as v1.0: persist through Tribute; wipe on Footer Reset. Check flag before granting; set flag then grant; save — so load cannot double-fire. `Num.add` for the bonus.

- 1000 lifetime/all-time souls (`lifetimeSouls` or `allTimeSouls`): +200 souls now. Toast: "The well returns two hundred souls." Chronicle: "A thousand souls. The well returned a greater gift."
- First Lantern: +10 souls. Toast: "Ten souls for the first lantern." Chronicle: "The first lantern. The well returned ten souls."
- First Censer: +5 Ash. Toast: "Ash from the first censer." Chronicle: "The first censer. Ash remains in the smoke."
- First Fetter: +2 Shades (and lifetime Shades). Toast: "Two shades for the first fetter." Chronicle: "The first fetter. Two shades were given."

Toasts are queued (array). A new toast waits until the current one hides, so several gifts plus the away-harvest line do not overwrite each other.

**Autobind Vessels (QoL).** Unlock at 3 Vessels this run. Third quiet toggle in Rites. Flavor: *The hollow fills itself.* When on, each live tick buys exactly 1 Vessel if affordable (always ×1, ignores buy-mode). Persist `autobindVessels` this-run; wipe on Tribute. Offline catchup does not autobind.

**Edict of Depth (Reliquary).** Start each emptying with Well Depth equal to the edict level (`wellDepth = depthLevel`; unlocks the Well if > 0). Cost `4 × 2^n` Favor. Flavor: *The well was always deeper.* Button: Speak the Depth. Persist through Tribute; wipe on Footer Reset. ×1 only.

## Design notes (v1.0)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v1.0 extras.**

**Milestone gifts (one-time).** Chronicle-like flags per save. Persist through Tribute; wipe on Footer Reset. Check flag before granting; set flag then grant; save — so load cannot double-fire. `Num.add` for the bonus.

- 100 lifetime souls (`lifetimeSouls` or `allTimeSouls`): +50 souls now. Toast: "The well returns fifty souls." Chronicle: "A hundred souls. The well returned a gift."
- 10 Shades owned, all-time peak `peakShades` (Num; persist Tribute): +1 free Shade. Toast: "A shade is given, unbidden." Chronicle: "Ten shades. One more was given."
- First Vessel: +3 Ash. Toast: "Ash from the first vessel." Chronicle: "The first vessel. Ash remains."
- First Tribute already has a Chronicle line; also +1 Favor extra once ever (`bonusFirstTribute`) in addition to the formula gain (Favor on hand and `favorEarned`). Toast: "The GodKing's first remembrance is generous." Chronicle: "First tribute. The GodKing was generous." Old saves with `tributesLaid >= 1` seed the flag without granting.

**Autobind Spirits (QoL).** Unlock at 10 Bound Spirits this run. Second quiet toggle in Rites next to Autobind Shades. Flavor: *The shackled bind their own.* When on, each live tick buys exactly 1 Spirit if affordable (always ×1, ignores buy-mode). Persist `autobindSpirits` this-run; wipe on Tribute. Offline catchup does not autobind (same as shades).

**The Crown (late meta shop).** Not a producer-of-producer. Unlock when `tributesLaid >= 2` OR `favorEarned >= 3`. Panel like Reliquary. Persist through Tribute; spend **Favor on hand**. Flavor: *The GodKing's brow.* Three ×1 upgrades (Quiet Court in v1.2):

- Weight of the Crown — +10% all prodMult, additive among itself (`1 + 0.10 * crownWeight`). Cost `6 × 2^n` Favor. Button: Bear the Weight.
- Long Memory — start each emptying with +1 Fetter per level. Cost `5 × 2^n` Favor. Button: Lengthen Memory. On Tribute meta: `fetters = longMemoryLevel`; unlock Fetters if > 0.
- Quiet Court (v1.2 / v1.8 / v1.9 / v2.4 / v2.7) — Tribute starts Autobind Shades ON, Autobind Lanterns ON (row still at 8 lanterns), Autobind Fetters ON (row still at 6 fetters), Autobind Pyres ON (row still at 4 pyres), and Autobind Chalices ON (row still at 3 chalices). Cost `8 × 2^n` Favor. Button: Seat the Court.

**Hotkeys.** T pays the Tithe if affordable. N pays Night's Tithe if available. V pays Thin the Veil if available. C pays Cut the Cinders if unlocked and Ash >= 15. B pays Lay the Bone if Remembrance is unlocked, ossuaryLevel < 8, and remembrance >= 1. W pays Keep the Wake if unlocked, not already burning, and Ash >= 30. Vow of Ember makes N and W no-op. None fire while typing in Memory. None steal if a button that is not Draw from the Well is focused.

## Design notes (v0.9)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**Num safety (v0.8).** Foo's late-run freeze was JS Number overflow: Math.pow(1.15, n) on huge owned counts, 50 * Math.pow(3, siphonLevel), then Math.floor(Infinity) leading to NaN comparisons and dead buy buttons. js/num.js is a tiny mantissa+exponent library (value = m x 10^e, 1 <= |m| < 10). Costs use cost(base, mult, owned) = floor(base * mult^owned) in Num space (small n still matches the old Math.floor curve). Souls, shades, spirits, vessels, lifetimeSouls, lifetimeShades, lifetimeSpirits, allTimeSouls, Ash, and growing owned counts (shades/spirits/vessels/lanterns/censers/fetters/pyres) are Num. Buy/compare via Num.cmp. Production is rate * dt in Num. Saves store {m,e}; old numeric saves still load. Format keeps K/M/B/T then 1.2e34 past suffixes. No external libs.

**Lanterns (half-step).** Unlock after 3 Shades this run. Card in the producer row. Spend Souls, cost floor(30 x 1.2^n). Each Lantern +5% shade soul output, additive (lanternMult = 1 + 0.05 * lanterns). Stacks with siphon, Harvest, prodMult, ember. Does not produce units and is not a producer-of-producer. Flavor: *A light that teaches the echoes where to drink.* Button: Kindle a Lantern. x1 only. Toast on first kindle: "A lantern kindles." Wipe on Tribute.

**Ash + Marks (side resource / side spend).** Ash accrues at 1% of soul production from shades only (not clicks, not Well Draws). Quiet "Ash N" line under the soul rate, muted gold. Marks panel (like Rites: this-run, wipe on Tribute) unlocks when Ash >= 1 or lifetime souls >= 500. Three independent x1 buys, cost Ash floor(8 x 2^n) each:

- Mark of Ember — shade soul output x1.25 per level (emberMult = 1.25^level).
- Mark of Chain — spirit shade output x1.25 per level. Hidden until Bound Spirits unlocked.
- Mark of Hollow — vessel spirit output x1.25 per level. Hidden until Vessels unlocked.

Flavor: *Ash is what the well will not keep.* Buttons: Press the Mark.

**Censers (late side path).** Unlock at 1 Vessel or 25 lifetime Spirits. Spend Vessels, same producer curve 10 x 1.15^n. Each Censer produces 0.2 Ash/s x prodMult x titheMult (not siphon). Flavor: *They burn what the well discards.* Button: Raise a Censer. x1 only. Not required for Tribute. Gives late-run Ash so Marks stay buyable.

**Fetters (half-step, v0.9).** Unlock at 3 Bound Spirits this run. Card in the producer row between Spirits and Vessels, like Lanterns. Spend Shades, cost `floor(20 × 1.2^n)` via Num.cost. Each Fetter +5% spirit shade output, additive (`fetterMult = 1 + 0.05 * fetters`). Stacks with Levy, Binding, and Mark of Chain. Does not produce units. Flavor: *A chain that teaches the will to pull.* Button: Bind a Fetter. ×1 only. Wipe on Tribute.

**Autobind Shades (QoL, v0.9 / v1.0).** Unlock at 15 Shades this run. Quiet toggle in Rites: Autobind Shades. Flavor: *The well binds without a hand.* When on, each live tick buys exactly 1 Shade if affordable (always ×1, ignores buy-mode, does not dump). Does not autobuy other producers. Persist `autobind` this-run; wipe on Tribute. Never a Max dump. v1.0: live `tick` only — offline `applyDt` catchup does not autobind.

**Night's Tithe (late side spend, v0.9).** Unlock after the first Tithe paid this run, or at 8 Lanterns. Compact row in Rites. Spend Ash: 25% of current Ash, minimum 10 (`max(10, floor(ash * 0.25))`). Cannot pay if Ash < 10. Effect: `30 + 10 * deeperNightLevel` seconds of `nightMult = 3` on shade souls/s and Ash/s only — not folded into `prodMult` / `rateMult` (clicks, spirit levy, and vessel house stay off that burst). Shade-derived Ash rides the boosted shade souls; Censer Ash is multiplied by `nightMult` separately. No stack with itself; can overlap the soul Tithe. Persist `nightLeft` seconds. While active the button reads "Night burns — Xs". Flavor: *The GodKing's hunger at midnight.* Button: Pay the Night's Tithe. Wipe on Tribute.

**Loop.** Click the well. Shades (base 10 souls, ×1.15, 1 soul/s). Bound Spirits at 10 shades or 100 lifetime souls (0.1 shade/s). Well Depth after 1 shade (+1 click; `floor(25×1.5^d)` souls). Vessels at 5 spirits or 50 lifetime shades (0.1 spirit/s). Thrones at 1 vessel or 50 lifetime spirits this run (cost in vessels; +10% production each, or +15% under Dominion). Chalices at 5 Thrones this run (late ash sink; cost Ash `floor(20×1.5^n)`; cap 12; +8% production each). Buy 1 / 10 / Max on main-line producers, Pyres, and Chalices (not Well Depth, not Lanterns, not Fetters, not Censers, not Rites, not Marks, not Aspects, not the Tithe, not Night's Tithe, not The Wake, not Thin the Veil, not Choir of Ash, not The Crown, not Vows). Tick: souls from shades, shades from spirits, spirits from vessels, Ash from shade souls, Censers, and Pyres. Lanterns at 3 Shades; Fetters at 3 Bound Spirits; Censers at 1 Vessel or 25 lifetime Spirits; Pyres at 3 Censers (ash half-step); Chalices at 5 Thrones.

**The Tithe (v0.7).** This-run burst, not a producer. Hidden until `unlockedWell` (first Shade this run); compact row in Rites. Wipes on Tribute and Footer Reset (active burst ends). Button: Pay the Tithe. Flavor: *A cut for the GodKing. The well runs hotter.* Cost 10% of current souls, minimum 25 (`Math.max(25, Math.floor(souls * 0.1))`). Cannot pay if souls < 25. Effect: 60s of `titheMult = 2` on top of `prodMult` — souls/s, shades/s, vessel spirit/s, and clickPower. While active the button is disabled and reads "The tithe burns — Xs" (whole seconds). No stacking. After the window ends this run, another Tithe is allowed (no long cooldown). Timed on the same dt tick (`titheLeft` decremented in `applyDt`; persist so a mid-burst refresh continues). Offline catchup consumes remaining `titheLeft` against offline dt and does not extend past it. Toast on pay: "The GodKing takes his cut." Rate: `currentMult * titheMult`, `titheMult` 2 if `titheLeft > 0` else 1.

**Run stats (v0.7).** Quiet lines inside Chronicle, same muted type — not a dashboard.

- This emptying: elapsed mm:ss (or h:mm:ss) from `runStartedAt` (set on boot if missing; reset to now on Tribute).
- All-time souls: `allTimeSouls`, increments whenever `lifetimeSouls` would; does not reset on Tribute; Footer Reset wipes it.
- Tributes laid: `tributesLaid`, +1 on successful Tribute; persist; wipe on Reset.

**Aspects of the GodKing (v0.5, unchanged).** Hidden until first Tribute (`favorEarned >= 1`), same moment Reliquary appears. First run has no Aspects. After each emptying — including immediately after laying Tribute — swear one Aspect for that run. Gathering and buying still work if you delay; the panel waits, and next-goal reads "Swear an Aspect. The GodKing waits." One will per emptying. Next Tribute clears the Aspect so you swear again. Footer Reset clears Aspect and `favorEarned`; the panel hides.

- Harvest: shade soul output ×1.5 (multiplies with Siphon and `prodMult`). Flavor: *The well is a mouth.*
- Binding: spirit shade output ×1.5 (stacks with Levy). Flavor: *Every will a chain.*
- Dominion: Thrones bless +15% each instead of +10% (the throne term inside `prodMult`). Flavor: *A seat for every harvest.*

**Rites (this-run).** Hidden until the first Shade this run, or if The Well Draws is already on from Edict of Echoes. Forgotten on Tribute and on Footer Reset. ×1 buy only. Autobind Lanterns and Thin the Veil live here (v1.6). Autobind Fetters lives here (v1.8). Autobind Censers lives here (v1.9). Autobind Thrones lives here (v2.0). Autobind Pyres lives here (v2.2). Autobind Chalices lives here (v2.6). Rite of Cinders lives here with Siphon/Levy (v2.2).

- Rite of Siphon: each level doubles Shade soul output (×2^level). Cost `floor(50×3^level)` Souls.
- Rite of Levy: each level doubles Bound Spirit shade output (×2^level). Hidden until Bound Spirits. Cost `floor(15×3^level)` Shades.
- Rite of Cinders: each level doubles Pyre ash output (×2^level). Hidden until Pyres unlocked. Cost 15 Ash (`Num`). ×1 only. Poverty does not block. Wipe on Tribute.
- The Well Draws: one-shot this run. +1 harvest/sec at current clickPower (idle click; no pulse/ripple). Cost 50 Souls. Unlocks at 3 Shades this run.

**Reliquary** after first Tribute (still hidden until `favorEarned >= 1`). Favor on hand is spent on edicts; `favorEarned` never falls except Reset. Unspent Favor. ×1 only. Persist through Tribute; wipe on Footer Reset.

- GodKing's Edict +25% production/level (cost `1×2^n` Favor).
- Deeper Memory +1 starting Shade/level on Tribute (cost `2×2^n` Favor).
- Edict of Echoes: one-shot (level 0 or 1). After Tribute, the new run starts with The Well Draws already on (`wellDraws` true; rite row shows as drawn; no 50-soul charge). Cost 3 Favor once. Flavor: *The well remembers thirst.* Button: Speak the Echo; after bought, disabled "The well remembers." Does not apply until Tribute.
- Edict of Seats: each level starts the emptying with +1 Throne (unlocks Thrones if `thrones > 0`). Cost `5×2^n` Favor (5, 10, 20…). Flavor: *A seat waits empty.* Button: Raise the Seat. On Tribute, `thrones = seatLevel` (not added to leftover thrones).
- Edict of Kindling: each level starts the emptying with +1 Lantern (`lanterns = kindleLevel`; `unlockedLanterns` if > 0). Cost `4×2^n` Favor (4, 8, 16…). Flavor: *A lantern waits in the emptied dark.* Button: Speak the Kindling.
- Edict of Ashen Memory: each level starts the emptying with Ash = `10 * ashenLevel` (Num). Cost `3×2^n` Favor (3, 6, 12…). Flavor: *The well remembers what it would not keep.* Button: Remember the Ash. On Tribute, `ash = fromNumber(10 * ashenLevel)`. Marks unlock via the usual Ash check.
- Edict of Depth: each level starts the emptying with Well Depth = `depthLevel` (`unlockedWell` if > 0). Cost `4×2^n` Favor (4, 8, 16…). Flavor: *The well was always deeper.* Button: Speak the Depth. On Tribute, `wellDepth = depthLevel`.
- Edict of the Choir: each level starts the emptying with +1 Choir of Ash (`choirLevel = min(10, choirEdictLevel)`; `unlockedChoir` if > 0). Cost `5×2^n` Favor (5, 10, 20…). Flavor: *They already sang.* Button: Speak the Choir. Skips lantern spend. Does not apply until Tribute.
- Edict of Hymn: each level lengthens the Tribute hymn to `45 + 15 * hymnEdictLevel` seconds. Cost `4×2^n` Favor (4, 8, 16…). Flavor: *The song lingers.* Button: Speak the Hymn. Does not apply until Tribute.
- Edict of Smoke: if `smokeEdictLevel >= 1`, Tribute starts Autobind Censers ON (row still waits for 4 censers this emptying). Cost `6×2^n` Favor (6, 12, 24…). Flavor: *The brazier remembers.* Button: Speak the Smoke. Does not buy censers. Does not apply until Tribute.
- Edict of Embers: each level starts the emptying with +1 Pyre (`pyres = fromNumber(embersEdictLevel)`; `unlockedPyres` if > 0). Cost `7×2^n` Favor (7, 14, 28…). Flavor: *The coals wait.* Button: Speak the Embers. Does not apply until Tribute.
- Edict of Cinders: if `cinderEdictLevel >= 1`, Tribute starts Autobind Pyres ON (row still waits for 4 pyres this emptying). Cost `8×2^n` Favor (8, 16, 32…). Flavor: *The doubling is remembered.* Button: Speak the Cinders. Does not set this-run `cinderLevel`. Does not apply until Tribute.
- Edict of the Cup: each level starts the emptying with +1 Chalice (`chalices = min(12, cupEdictLevel)`; `unlockedChalices` if > 0). Cost `9×2^n` Favor (9, 18, 36…). Flavor: *The cup waits.* Button: Speak the Cup. Does not apply until Tribute.
- Edict of Draught: if `draughtEdictLevel >= 1`, Tribute starts Autobind Chalices ON (row still waits for 3 chalices this emptying). Cost `10×2^n` Favor (10, 20, 40…). Flavor: *The draught is remembered.* Button: Speak the Draught. Does not buy chalices. Does not apply until Tribute.
- Edict of the Wake: if `wakeEdictLevel >= 1`, Tribute starts Wake for `40 + 15 * wakeEdictLevel` seconds (`wakeLeft = wakeSecs(wakeEdictLevel)`; unlock Wake row if > 0). Cost `8×2^n` Favor (8, 16, 32…). Flavor: *The fire is remembered.* Button: Speak the Wake. Level 0 does not start a free wake. Does not apply until Tribute (does not extend a wake already running).

**Multiplier.** `prodMult = (1 + 0.5 * favorEarned) * (1 + throneWeight * thrones) * (1 + 0.25 * edictLevel) * (1 + 0.10 * crownWeight) * namesCompleteMult * (1 + 0.08 * chalices) * (1 + 0.05 * ossuaryLevel)`, `throneWeight` 0.15 if Dominion else 0.10, `namesCompleteMult` 1.05 if all twelve Names are bound else 1, `chalices` 0–12 this run, `ossuaryLevel` 0–8 persist Tribute.

Rates and clicks also take `titheMult` (2 during an active Tithe, else 1) and `veilMult` (2 during an active Veil, else 1): `clickPower = (1 + wellDepth) * prodMult * titheMult * veilMult`. ClickPower is otherwise unchanged (no lantern/ember). Hymn and Night's Tithe do not bless clicks; the Veil does.

v0.8 extras:

- `lanternMult = 1 + 0.05 * lanterns`
- `emberMult = 1.25^emberLevel`
- `chainMult = 1.25^chainLevel`
- `hollowMult = 1.25^hollowLevel`

v0.9 extras:

- `fetterMult = 1 + 0.05 * fetters`
- `nightMult = 3` while `nightLeft > 0`, else 1 (shade souls/s and Ash/s only)
- `hymnMult = 1.25` while `hymnLeft > 0`, else 1 (shade souls/s, spirit shades/s, and Ash/s; not click)
- `veilMult = 2` while `veilLeft > 0`, else 1 (clickPower only)
- `wakeMult = 2` while `wakeLeft > 0`, else 1 (censer and pyre Ash/s only)

shade souls/s = `shades * 1 * prodMult * titheMult * 2^siphon * harvestMult * lanternMult * emberMult * nightMult * hymnMult` (+ `clickPower` if `wellDraws`). `harvestMult` is 1.5 if Harvest else 1. `hymnMult` is 1.25 while `hymnLeft > 0` else 1.

shades/s from spirits = `spirits * 0.1 * prodMult * titheMult * 2^levyLevel * bindingMult * chainMult * fetterMult * hymnMult`. `bindingMult` is 1.5 if Binding else 1.

Vessels 0.1 spirit/s × `prodMult` × `titheMult` × `hollowMult`. Click uses `prodMult * titheMult * veilMult`, so Dominion slightly blesses clicks through Thrones and the Veil doubles clickPower while thin. Thrones do not produce. Night's Tithe does not bless clicks, levy, or vessels.

Ash/s = `(0.01 + 0.005 * ashenTideLevel + 0.005 * choirLevel) * (shade soul production only)` + `censers * 0.2 * prodMult * titheMult * nightMult * hymnMult * wakeMult` + `pyres * 0.15 * prodMult * titheMult * nightMult * hymnMult * wakeMult * cinderMult`. `cinderMult` is `2^cinderLevel` (`cinderMult(0)=1`). `ashenTideLevel` caps at 5. `choirLevel` caps at 10 (this-run). Hymn does not bless clicks. Pyre ash is additive; it does not steal Censer output. Cinders blesses only the pyre portion.

**Tribute.** First Favor at 25000 lifetime souls (`floor(sqrt(lifetime/25000))`). Tribute keeps Favor, `favorEarned`, `edictLevel`, `memoryLevel`, `echoLevel`, `seatLevel`, `kindleLevel`, `ashenLevel`, `depthLevel`, `choirEdictLevel`, `hymnEdictLevel`, `smokeEdictLevel`, `embersEdictLevel`, `cinderEdictLevel`, `cupEdictLevel`, `draughtEdictLevel`, `wakeEdictLevel`, `crownWeight`, `longMemoryLevel`, `quietCourtLevel`, `namesBound`, `namesComplete`, `remembrance`, `deeperNightLevel`, `ashenTideLevel`, `ossuaryLevel`, `peakShades`, `peakLanterns`, `peakFetters`, `peakCensers`, `peakPyres`, milestone gift flags (including `giftCrown`, `giftFirstName`, `giftFiveTributes`, `giftNamesComplete`, `giftFirstVeil`, `giftPeakLanterns`, `giftPeakFetters`, `giftPeakCensers`, `giftFirstPyre`, `giftEightTributes`, `giftPeakPyres`, `giftFirstCinders`, `giftFirstChalice`, `giftTwelveTributes`, `giftSixteenTributes`, `giftFullCup`, `giftThreeChalices`, `giftFirstOssuary`, `giftFullOssuary`, `giftHundredDraws`, `giftFirstWake`, `giftFirstEmberVow`, `giftTwoVows`, `giftAllVows`), `vowsKnown`, `buyMode`, Chronicle, `allTimeSouls`, `tributesLaid` (+1). Clears the run (souls, producers, lanterns, fetters, censers, pyres, chalices, Ash, Marks, `wellDraws`, thrones, unlocks, siphon/levy/cinders, sworn Aspect, sworn Vow, `vowHungerPaid` (remembered `vowsKnown` flags stay), `titheLeft`, `nightLeft`, `hymnLeft`, `veilLeft`, `wakeLeft`, `tithePaid`, `autobind`, `autobindSpirits`, `autobindVessels`, `autobindLanterns`, `autobindFetters`, `autobindCensers`, `autobindThrones`, `autobindPyres`, `autobindChalices`, `cinderLevel`, `clicksThisRun`, `unlockedVeil`, `unlockedWake`, `choirLevel`, `unlockedChoir`), then applies meta: `shades = memoryLevel` (`unlockedWell` if shades ≥ 1); `thrones = seatLevel` (`unlockedThrones` if thrones ≥ 1); `wellDraws` if `echoLevel >= 1` (rite already drawn, no soul charge); `lanterns = kindleLevel` (`unlockedLanterns` if > 0); `ash = fromNumber(10 * ashenLevel)`; `fetters = longMemoryLevel` (`unlockedFetters` if > 0); `wellDepth = depthLevel` (`unlockedWell` if > 0); if `quietCourtLevel >= 1`, `autobind = true` and `unlockedAutobind`, and `autobindLanterns = true` (lantern autobind row still at 8 lanterns this emptying), and `autobindFetters = true` (fetter autobind row still at 6 fetters this emptying), and `autobindPyres = true` (pyre autobind row still at 4 pyres this emptying), and `autobindChalices = true` (chalice autobind row still at 3 chalices this emptying); if `smokeEdictLevel >= 1`, `autobindCensers = true` (censer autobind row still at 4 censers this emptying); if `cinderEdictLevel >= 1`, `autobindPyres = true` (pyre autobind row still at 4 pyres this emptying); `pyres = fromNumber(embersEdictLevel)` (`unlockedPyres` if > 0); if `cinderEdictLevel >= 1`, `autobindPyres = true` (pyre autobind row still at 4 pyres this emptying); `chalices = min(12, cupEdictLevel)` (`unlockedChalices` if > 0); if `draughtEdictLevel >= 1`, `autobindChalices = true` (chalice autobind row still at 3 chalices this emptying); `choirLevel = min(10, choirEdictLevel)` (`unlockedChoir` if > 0); `hymnLeft = 45 + 15 * hymnEdictLevel`; if `wakeEdictLevel >= 1`, `wakeLeft = 40 + 15 * wakeEdictLevel` (`unlockedWake` if > 0); aspect = none (must swear again); vow = none; `runStartedAt` = now. Footer Reset wipes Favor, Reliquary (including echo, seats, kindling, ashen memory, Edict of Depth, Edict of the Choir, Edict of Hymn, Edict of Smoke, Edict of Embers, Edict of Cinders, Edict of the Cup, Edict of Draught, Edict of the Wake), The Crown (including Quiet Court), Remembrance (including Deeper Night, Ashen Tide, and Ossuary), Names of the Bound, Vows remembered, milestone gifts, `peakShades`, `peakLanterns`, `peakFetters`, `peakCensers`, `peakPyres`, Aspects, Vows, Chronicle, Rites, Tithe, Night's Tithe, The Wake, Hymn, The Veil Thins, Choir of Ash, Autobind, Marks, `allTimeSouls`, `tributesLaid`.

**Session layer (v0.3 / v1.0).** A quiet next-goal line under the soul rate / Blessing (unlock/tribute only; rites do not steal it). After first Tribute, an unsworn Aspect takes the line until you swear — Lanterns/Fetters/Marks/Censers/Pyres/Chalices/Vows never steal Aspect-swear or Tribute-ready. If an Aspect is sworn and no vow, may hint "A vow may be sworn." Lanterns enter the cascade as a half-step at 3 Shades; Fetters after Bound Spirits (before Vessels) as a half-step, and may hint later if still unbought. Marks and Censers hint after the main-line throne gate if still unbought. Pyres may hint after Censers if still unbought. Chalices may hint after Thrones if still unbought. Away-harvest toast on load after real offline production (8h cap, skip fresh saves and tiny tab-switches); hotkeys Space/Enter draw from the well (unless another button is focused), 1/2/3 set buy 1/10/Max, T Tithe, N Night's Tithe, W Keep the Wake, V Thin the Veil, C Cut the Cinders, B Lay the Bone; collapsible Chronicle of first-time milestones (persists through Tribute), including first rite cut, the well beginning to draw, first Aspect sworn, first vow sworn, "An echo was spoken.", "A seat was raised.", "A lantern was kindled.", "Ash gathered at the well's lip.", "A mark was pressed.", "A censer was raised.", "A pyre was raised.", "A fetter was bound.", "The Quiet Court was seated.", the twelve Names of the Bound, "The choir of ash was raised.", "The choir was spoken.", "The hymn was spoken.", "The smoke was spoken.", "The embers were spoken.", "The cinders were spoken.", "The cup was spoken.", "The draught was spoken.", "The wake was spoken.", "A chalice was raised.", "A bone was laid.", "Eight bones. The well returned twenty souls.", "A hundred draws. The well returned fifteen souls.", "A hymn followed the emptying.", "The veil thinned.", "The wake was kept.", "The first wake. The well returned eight ash.", "An ember vow was sworn.", "A stillness vow was sworn.", "A poverty vow was sworn.", "A hunger vow was sworn.", "The ember vow. The well returned eight ash.", "Two vows remembered. The well returned ten souls.", "Four vows remembered. The well returned twenty-five souls.", "The cinders were cut.", and the v1.0 / v1.1 / v1.2 / v1.3 / v1.4 / v1.5 / v1.6 / v1.7 / v1.8 / v1.9 / v2.0 / v2.1 / v2.2 / v2.3 / v2.4 / v2.5 / v2.6 / v2.7 / v2.8 / v2.9 / v3.0 / v3.1 / v3.2 / v3.3 / v3.4 milestone gifts. Toasts queue so several gifts (or a gift after away-harvest) are not overwritten.

**Save.** Key `soulgather-v0`. Old saves: missing `favorEarned` copies favor; missing aspect is none; missing `echoLevel`/`seatLevel`/`kindleLevel`/`ashenLevel`/`depthLevel`/`choirEdictLevel`/`hymnEdictLevel`/`smokeEdictLevel`/`embersEdictLevel`/`cinderEdictLevel`/`cupEdictLevel`/`draughtEdictLevel`/`wakeEdictLevel`/`crownWeight`/`longMemoryLevel`/`quietCourtLevel`/`namesBound`/`remembrance`/`deeperNightLevel`/`ashenTideLevel`/`ossuaryLevel`/`choirLevel` default 0; missing `namesComplete` false (true if `namesBound >= 12`); missing `unlockedChoir` false (true if `choirLevel >= 1`); missing `titheLeft`/`nightLeft`/`hymnLeft`/`veilLeft`/`wakeLeft` 0; missing `runStartedAt` now; missing `allTimeSouls` seeds from this-run `lifetimeSouls`; missing `tributesLaid` 0; missing lanterns/ash/censers/pyres/chalices/marks/fetters default 0; missing `autobind`/`autobindSpirits`/`autobindVessels`/`autobindLanterns`/`autobindFetters`/`autobindCensers`/`autobindThrones`/`autobindPyres`/`autobindChalices`/`tithePaid` false; missing `cinderLevel` 0; missing `unlockedPyres` false (true if pyres ≥ 1 or censers ≥ 3); missing `unlockedChalices` false (true if chalices ≥ 1 or thrones ≥ 5); missing `clicksThisRun` 0; missing `unlockedVeil` false (true if `clicksThisRun >= 50`); missing `unlockedWake` false (true if pyres unlocked, ash >= 40, or remaining `wakeLeft` > 0); missing `vow` none; missing `vowHungerPaid` false; missing `peakShades` seeds from current shades; missing `peakLanterns` seeds from current lanterns; missing `peakFetters` seeds from current fetters; missing `peakCensers` seeds from current censers; missing `peakPyres` seeds from current pyres; missing gift flags false (except `bonusFirstTribute` seeds true if `tributesLaid >= 1`; `giftCrown` seeds true if `crownWeight >= 1`; `giftFirstName` seeds true if `namesBound >= 1`; `giftFiveTributes` seeds true if `tributesLaid >= 5`; `giftEightTributes` seeds true if `tributesLaid >= 8`; `giftNamesComplete` seeds true if `namesComplete` or `namesBound >= 12`; `giftFirstVeil` seeds true if Chronicle already has veil or remaining `veilLeft` > 0; `giftFirstWake` seeds true if Chronicle already has wake or remaining `wakeLeft` > 0; `giftFirstEmberVow` seeds true if Chronicle already has ember vow (`vowEmber` / `giftFirstEmberVow`) — seed without grant; `giftPeakLanterns` false — grant once on load if peak already >= 10, then save; `giftPeakFetters` false — grant once on load if peak already >= 8, then save; `giftPeakCensers` false — grant once on load if peak already >= 5, then save; `giftFirstPyre` seeds true if Chronicle already has first pyre or remaining pyres from edict; if peak already >= 1 and no flag and no chronicle, grant once then save; `giftPeakPyres` false — grant once on load if peak already >= 5, then save; `giftFirstCinders` seeds true if Chronicle already has first cinders gift, "The cinders were cut.", or remaining `cinderLevel > 0` — seed without grant like first veil; otherwise grant once when `cinderLevel` reaches 1, then save; `giftFirstChalice` seeds true if Chronicle already has first chalice or remaining chalices from edict — seed without grant; if missing flag and chalices>=1 and no chronicle, grant once then save; `giftTwelveTributes` seeds true if `tributesLaid >= 12`; `giftSixteenTributes` seeds true if `tributesLaid >= 16`; `giftFullCup` seeds true if Chronicle already has the gift — seed without grant; missing flag is false — grant once on load if chalices already >= 12, then save, unless Chronicle already has the gift; `giftThreeChalices` seeds true if Chronicle already has the gift — seed without grant; missing flag is false — grant once on load if chalices already >= 3, then save, unless Chronicle already has the gift; `giftFirstOssuary` seeds true if Chronicle already has first ossuary (`giftFirstOssuary` / `ossuary`) or `ossuaryLevel` already >= 1 on old save — seed without grant like first veil; otherwise grant once when `ossuaryLevel` reaches 1, then save; `giftFullOssuary` seeds true if Chronicle already has the gift — seed without grant; missing flag is false — grant once on load if ossuaryLevel already >= 8, then save, unless Chronicle already has the gift; `giftHundredDraws` seeds true if Chronicle already has the gift — seed without grant; missing flag is false — grant once on load if clicksThisRun already >= 100, then save, unless Chronicle already has the gift; missing `vowsKnown` seeds from Chronicle vow lines if those exist (this-run `vow`, `vowStillness` / `vowPoverty` / `vowHunger` / `vowEmber` / `giftFirstEmberVow`) without granting two-vows or all-four gifts yet; `giftTwoVows` seeds true if Chronicle already has the gift — seed without grant; missing flag is false — grant once on load if `vowsKnownCount` already >= 2, then save, unless Chronicle already has the gift; `giftAllVows` seeds true if Chronicle already has the gift — seed without grant; missing flag is false — grant once on load if `vowsKnownCount` already >= 4, then save, unless Chronicle already has the gift). Numeric stocks load through Num (Number → {m,e}). New fields default 0/false/"1"/empty Chronicle. Autosave 5s. 8h offline cap. Footer Memory (collapsed, near Reset) exports or imports that JSON. Toast retrigger on import.

Do not restyle the locked masthead or well sigil.

Verify: `node test-economy.mjs` (expect exit 0). If node is blocked, `python3` can drive the same asserts.

Files: `index.html`, `css/style.css`, `js/num.js`, `js/format.js`, `js/game.js`, `test-economy.mjs`, `sim-firstrun.mjs`.
