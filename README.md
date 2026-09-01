# Soulgather

Original idle/incremental game. Harvest souls from a void well for the GodKing. Not a Swarm Simulator clone.

## Play

Live: https://azraelgodking.github.io/soulgather/
Open `index.html` in a browser (`file://` is fine). Or `python3 -m http.server` in this folder. Vanilla HTML/CSS/JS, no build, no npm. Pushes to main redeploy Pages.

Hotkeys: Space/Enter draw, 1/2/3 buy mode, T Tithe, N Night's Tithe (not while typing in Memory; do not steal if another button is focused).

Save is local (`soulgather-v0`). Footer Memory export/import. Reset wipes everything including Favor.

## Loop (short)

Click the well → Shades → Lanterns (half-step) → Bound Spirits → Fetters (half-step) → Vessels → Censers (side) / Thrones. Ash feeds Marks and Night's Tithe. Rites, Tithe, Autobind Shades / Autobind Spirits this-run. Tribute for Favor. Reliquary + Aspects after first Tribute. The Crown after 2 tributes or 3 Favor earned.

## Design notes (v1.0)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**v1.0 extras.**

**Milestone gifts (one-time).** Chronicle-like flags per save. Persist through Tribute; wipe on Footer Reset. Check flag before granting; set flag then grant; save — so load cannot double-fire. `Num.add` for the bonus.

- 100 lifetime souls (`lifetimeSouls` or `allTimeSouls`): +50 souls now. Toast: "The well returns fifty souls." Chronicle: "A hundred souls. The well returned a gift."
- 10 Shades owned, all-time peak `peakShades` (Num; persist Tribute): +1 free Shade. Toast: "A shade is given, unbidden." Chronicle: "Ten shades. One more was given."
- First Vessel: +3 Ash. Toast: "Ash from the first vessel." Chronicle: "The first vessel. Ash remains."
- First Tribute already has a Chronicle line; also +1 Favor extra once ever (`bonusFirstTribute`) in addition to the formula gain (Favor on hand and `favorEarned`). Toast: "The GodKing's first remembrance is generous." Chronicle: "First tribute. The GodKing was generous." Old saves with `tributesLaid >= 1` seed the flag without granting.

**Autobind Spirits (QoL).** Unlock at 10 Bound Spirits this run. Second quiet toggle in Rites next to Autobind Shades. Flavor: *The shackled bind their own.* When on, each live tick buys exactly 1 Spirit if affordable (always ×1, ignores buy-mode). Persist `autobindSpirits` this-run; wipe on Tribute. Offline catchup does not autobind (same as shades).

**The Crown (late meta shop).** Not a producer-of-producer. Unlock when `tributesLaid >= 2` OR `favorEarned >= 3`. Panel like Reliquary. Persist through Tribute; spend **Favor on hand**. Flavor: *The GodKing's brow.* Two ×1 upgrades:

- Weight of the Crown — +10% all prodMult, additive among itself (`1 + 0.10 * crownWeight`). Cost `6 × 2^n` Favor. Button: Bear the Weight.
- Long Memory — start each emptying with +1 Fetter per level. Cost `5 × 2^n` Favor. Button: Lengthen Memory. On Tribute meta: `fetters = longMemoryLevel`; unlock Fetters if > 0.

**Hotkeys.** T pays the Tithe if affordable. N pays Night's Tithe if available. Neither fires while typing in Memory. Neither steals if a button that is not Draw from the Well is focused.

## Design notes (v0.9)

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

**Num safety (v0.8).** Foo's late-run freeze was JS Number overflow: Math.pow(1.15, n) on huge owned counts, 50 * Math.pow(3, siphonLevel), then Math.floor(Infinity) leading to NaN comparisons and dead buy buttons. js/num.js is a tiny mantissa+exponent library (value = m x 10^e, 1 <= |m| < 10). Costs use cost(base, mult, owned) = floor(base * mult^owned) in Num space (small n still matches the old Math.floor curve). Souls, shades, spirits, vessels, lifetimeSouls, lifetimeShades, lifetimeSpirits, allTimeSouls, Ash, and growing owned counts (shades/spirits/vessels/lanterns/censers/fetters) are Num. Buy/compare via Num.cmp. Production is rate * dt in Num. Saves store {m,e}; old numeric saves still load. Format keeps K/M/B/T then 1.2e34 past suffixes. No external libs.

**Lanterns (half-step).** Unlock after 3 Shades this run. Card in the producer row. Spend Souls, cost floor(30 x 1.2^n). Each Lantern +5% shade soul output, additive (lanternMult = 1 + 0.05 * lanterns). Stacks with siphon, Harvest, prodMult, ember. Does not produce units and is not a producer-of-producer. Flavor: *A light that teaches the echoes where to drink.* Button: Kindle a Lantern. x1 only. Toast on first kindle: "A lantern kindles." Wipe on Tribute.

**Ash + Marks (side resource / side spend).** Ash accrues at 1% of soul production from shades only (not clicks, not Well Draws). Quiet "Ash N" line under the soul rate, muted gold. Marks panel (like Rites: this-run, wipe on Tribute) unlocks when Ash >= 1 or lifetime souls >= 500. Three independent x1 buys, cost Ash floor(8 x 2^n) each:

- Mark of Ember — shade soul output x1.25 per level (emberMult = 1.25^level).
- Mark of Chain — spirit shade output x1.25 per level. Hidden until Bound Spirits unlocked.
- Mark of Hollow — vessel spirit output x1.25 per level. Hidden until Vessels unlocked.

Flavor: *Ash is what the well will not keep.* Buttons: Press the Mark.

**Censers (late side path).** Unlock at 1 Vessel or 25 lifetime Spirits. Spend Vessels, same producer curve 10 x 1.15^n. Each Censer produces 0.2 Ash/s x prodMult x titheMult (not siphon). Flavor: *They burn what the well discards.* Button: Raise a Censer. x1 only. Not required for Tribute. Gives late-run Ash so Marks stay buyable.

**Fetters (half-step, v0.9).** Unlock at 3 Bound Spirits this run. Card in the producer row between Spirits and Vessels, like Lanterns. Spend Shades, cost `floor(20 × 1.2^n)` via Num.cost. Each Fetter +5% spirit shade output, additive (`fetterMult = 1 + 0.05 * fetters`). Stacks with Levy, Binding, and Mark of Chain. Does not produce units. Flavor: *A chain that teaches the will to pull.* Button: Bind a Fetter. ×1 only. Wipe on Tribute.

**Autobind Shades (QoL, v0.9 / v1.0).** Unlock at 15 Shades this run. Quiet toggle in Rites: Autobind Shades. Flavor: *The well binds without a hand.* When on, each live tick buys exactly 1 Shade if affordable (always ×1, ignores buy-mode, does not dump). Does not autobuy other producers. Persist `autobind` this-run; wipe on Tribute. Never a Max dump. v1.0: live `tick` only — offline `applyDt` catchup does not autobind.

**Night's Tithe (late side spend, v0.9).** Unlock after the first Tithe paid this run, or at 8 Lanterns. Compact row in Rites. Spend Ash: 25% of current Ash, minimum 10 (`max(10, floor(ash * 0.25))`). Cannot pay if Ash < 10. Effect: 30s of `nightMult = 3` on shade souls/s and Ash/s only — not folded into `prodMult` / `rateMult` (clicks, spirit levy, and vessel house stay off that burst). Shade-derived Ash rides the boosted shade souls; Censer Ash is multiplied by `nightMult` separately. No stack with itself; can overlap the soul Tithe. Persist `nightLeft` seconds. While active the button reads "Night burns — Xs". Flavor: *The GodKing's hunger at midnight.* Button: Pay the Night's Tithe. Wipe on Tribute.

**Loop.** Click the well. Shades (base 10 souls, ×1.15, 1 soul/s). Bound Spirits at 10 shades or 100 lifetime souls (0.1 shade/s). Well Depth after 1 shade (+1 click; `floor(25×1.5^d)` souls). Vessels at 5 spirits or 50 lifetime shades (0.1 spirit/s). Thrones at 1 vessel or 50 lifetime spirits this run (cost in vessels; +10% production each, or +15% under Dominion). Buy 1 / 10 / Max on main-line producers (not Well Depth, not Lanterns, not Fetters, not Censers, not Rites, not Marks, not Aspects, not the Tithe, not Night's Tithe, not The Crown). Tick: souls from shades, shades from spirits, spirits from vessels, Ash from shade souls and Censers. Lanterns at 3 Shades; Fetters at 3 Bound Spirits; Censers at 1 Vessel or 25 lifetime Spirits.

**The Tithe (v0.7).** This-run burst, not a producer. Hidden until `unlockedWell` (first Shade this run); compact row in Rites. Wipes on Tribute and Footer Reset (active burst ends). Button: Pay the Tithe. Flavor: *A cut for the GodKing. The well runs hotter.* Cost 10% of current souls, minimum 25 (`Math.max(25, Math.floor(souls * 0.1))`). Cannot pay if souls < 25. Effect: 60s of `titheMult = 2` on top of `prodMult` — souls/s, shades/s, vessel spirit/s, and clickPower. While active the button is disabled and reads "The tithe burns — Xs" (whole seconds). No stacking. After the window ends this run, another Tithe is allowed (no long cooldown). Timed on the same dt tick (`titheLeft` decremented in `applyDt`; persist so a mid-burst refresh continues). Offline catchup consumes remaining `titheLeft` against offline dt and does not extend past it. Toast on pay: "The GodKing takes his cut." Rate: `currentMult * titheMult`, `titheMult` 2 if `titheLeft > 0` else 1.

**Run stats (v0.7).** Quiet lines inside Chronicle, same muted type — not a dashboard.

- This emptying: elapsed mm:ss (or h:mm:ss) from `runStartedAt` (set on boot if missing; reset to now on Tribute).
- All-time souls: `allTimeSouls`, increments whenever `lifetimeSouls` would; does not reset on Tribute; Footer Reset wipes it.
- Tributes laid: `tributesLaid`, +1 on successful Tribute; persist; wipe on Reset.

**Aspects of the GodKing (v0.5, unchanged).** Hidden until first Tribute (`favorEarned >= 1`), same moment Reliquary appears. First run has no Aspects. After each emptying — including immediately after laying Tribute — swear one Aspect for that run. Gathering and buying still work if you delay; the panel waits, and next-goal reads "Swear an Aspect. The GodKing waits." One will per emptying. Next Tribute clears the Aspect so you swear again. Footer Reset clears Aspect and `favorEarned`; the panel hides.

- Harvest: shade soul output ×1.5 (multiplies with Siphon and `prodMult`). Flavor: *The well is a mouth.*
- Binding: spirit shade output ×1.5 (stacks with Levy). Flavor: *Every will a chain.*
- Dominion: Thrones bless +15% each instead of +10% (the throne term inside `prodMult`). Flavor: *A seat for every harvest.*

**Rites (this-run).** Hidden until the first Shade this run, or if The Well Draws is already on from Edict of Echoes. Forgotten on Tribute and on Footer Reset. ×1 buy only.

- Rite of Siphon: each level doubles Shade soul output (×2^level). Cost `floor(50×3^level)` Souls.
- Rite of Levy: each level doubles Bound Spirit shade output (×2^level). Hidden until Bound Spirits. Cost `floor(15×3^level)` Shades.
- The Well Draws: one-shot this run. +1 harvest/sec at current clickPower (idle click; no pulse/ripple). Cost 50 Souls. Unlocks at 3 Shades this run.

**Reliquary** after first Tribute (still hidden until `favorEarned >= 1`). Favor on hand is spent on edicts; `favorEarned` never falls except Reset. Unspent Favor. ×1 only. Persist through Tribute; wipe on Footer Reset.

- GodKing's Edict +25% production/level (cost `1×2^n` Favor).
- Deeper Memory +1 starting Shade/level on Tribute (cost `2×2^n` Favor).
- Edict of Echoes: one-shot (level 0 or 1). After Tribute, the new run starts with The Well Draws already on (`wellDraws` true; rite row shows as drawn; no 50-soul charge). Cost 3 Favor once. Flavor: *The well remembers thirst.* Button: Speak the Echo; after bought, disabled "The well remembers." Does not apply until Tribute.
- Edict of Seats: each level starts the emptying with +1 Throne (unlocks Thrones if `thrones > 0`). Cost `5×2^n` Favor (5, 10, 20…). Flavor: *A seat waits empty.* Button: Raise the Seat. On Tribute, `thrones = seatLevel` (not added to leftover thrones).
- Edict of Kindling: each level starts the emptying with +1 Lantern (`lanterns = kindleLevel`; `unlockedLanterns` if > 0). Cost `4×2^n` Favor (4, 8, 16…). Flavor: *A lantern waits in the emptied dark.* Button: Speak the Kindling.
- Edict of Ashen Memory: each level starts the emptying with Ash = `10 * ashenLevel` (Num). Cost `3×2^n` Favor (3, 6, 12…). Flavor: *The well remembers what it would not keep.* Button: Remember the Ash. On Tribute, `ash = fromNumber(10 * ashenLevel)`. Marks unlock via the usual Ash check.

**Multiplier.** `prodMult = (1 + 0.5 * favorEarned) * (1 + throneWeight * thrones) * (1 + 0.25 * edictLevel) * (1 + 0.10 * crownWeight)`, `throneWeight` 0.15 if Dominion else 0.10.

Rates and clicks also take `titheMult` (2 during an active Tithe, else 1): `clickPower = (1 + wellDepth) * prodMult * titheMult`. ClickPower is otherwise unchanged (no lantern/ember).

v0.8 extras:

- `lanternMult = 1 + 0.05 * lanterns`
- `emberMult = 1.25^emberLevel`
- `chainMult = 1.25^chainLevel`
- `hollowMult = 1.25^hollowLevel`

v0.9 extras:

- `fetterMult = 1 + 0.05 * fetters`
- `nightMult = 3` while `nightLeft > 0`, else 1 (shade souls/s and Ash/s only)

shade souls/s = `shades * 1 * prodMult * titheMult * 2^siphon * harvestMult * lanternMult * emberMult * nightMult` (+ `clickPower` if `wellDraws`). `harvestMult` is 1.5 if Harvest else 1.

shades/s from spirits = `spirits * 0.1 * prodMult * titheMult * 2^levyLevel * bindingMult * chainMult * fetterMult`. `bindingMult` is 1.5 if Binding else 1.

Vessels 0.1 spirit/s × `prodMult` × `titheMult` × `hollowMult`. Click still uses `prodMult * titheMult`, so Dominion slightly blesses clicks through Thrones. Thrones do not produce. Night's Tithe does not bless clicks, levy, or vessels.

Ash/s = `0.01 * (shade soul production only)` + `censers * 0.2 * prodMult * titheMult * nightMult`.

**Tribute.** First Favor at 25000 lifetime souls (`floor(sqrt(lifetime/25000))`). Tribute keeps Favor, `favorEarned`, `edictLevel`, `memoryLevel`, `echoLevel`, `seatLevel`, `kindleLevel`, `ashenLevel`, `crownWeight`, `longMemoryLevel`, `peakShades`, milestone gift flags, `buyMode`, Chronicle, `allTimeSouls`, `tributesLaid` (+1). Clears the run (souls, producers, lanterns, fetters, censers, Ash, Marks, `wellDraws`, thrones, unlocks, siphon/levy, sworn Aspect, `titheLeft`, `nightLeft`, `tithePaid`, `autobind`, `autobindSpirits`), then applies meta: `shades = memoryLevel` (`unlockedWell` if shades ≥ 1); `thrones = seatLevel` (`unlockedThrones` if thrones ≥ 1); `wellDraws` if `echoLevel >= 1` (rite already drawn, no soul charge); `lanterns = kindleLevel` (`unlockedLanterns` if > 0); `ash = fromNumber(10 * ashenLevel)`; `fetters = longMemoryLevel` (`unlockedFetters` if > 0); aspect = none (must swear again); `runStartedAt` = now. Footer Reset wipes Favor, Reliquary (including echo, seats, kindling, ashen memory), The Crown, milestone gifts, `peakShades`, Aspects, Chronicle, Rites, Tithe, Night's Tithe, Autobind, Marks, `allTimeSouls`, `tributesLaid`.

**Session layer (v0.3 / v1.0).** A quiet next-goal line under the soul rate / Blessing (unlock/tribute only; rites do not steal it). After first Tribute, an unsworn Aspect takes the line until you swear — Lanterns/Fetters/Marks/Censers never steal Aspect-swear or Tribute-ready. Lanterns enter the cascade as a half-step at 3 Shades; Fetters after Bound Spirits (before Vessels) as a half-step, and may hint later if still unbought. Marks and Censers hint after the main-line throne gate if still unbought. Away-harvest toast on load after real offline production (8h cap, skip fresh saves and tiny tab-switches); hotkeys Space/Enter draw from the well (unless another button is focused), 1/2/3 set buy 1/10/Max, T Tithe, N Night's Tithe; collapsible Chronicle of first-time milestones (persists through Tribute), including first rite cut, the well beginning to draw, first Aspect sworn, "An echo was spoken.", "A seat was raised.", "A lantern was kindled.", "Ash gathered at the well's lip.", "A mark was pressed.", "A censer was raised.", "A fetter was bound.", and the v1.0 milestone gifts.

**Save.** Key `soulgather-v0`. Old saves: missing `favorEarned` copies favor; missing aspect is none; missing `echoLevel`/`seatLevel`/`kindleLevel`/`ashenLevel`/`crownWeight`/`longMemoryLevel` default 0; missing `titheLeft`/`nightLeft` 0; missing `runStartedAt` now; missing `allTimeSouls` seeds from this-run `lifetimeSouls`; missing `tributesLaid` 0; missing lanterns/ash/censers/marks/fetters default 0; missing `autobind`/`autobindSpirits`/`tithePaid` false; missing `peakShades` seeds from current shades; missing gift flags false (except `bonusFirstTribute` seeds true if `tributesLaid >= 1`). Numeric stocks load through Num (Number → {m,e}). New fields default 0/false/"1"/empty Chronicle. Autosave 5s. 8h offline cap. Footer Memory (collapsed, near Reset) exports or imports that JSON. Toast retrigger on import.

Do not restyle the locked masthead or well sigil.

Verify: `node test-economy.mjs` (expect exit 0).

Files: `index.html`, `css/style.css`, `js/num.js`, `js/format.js`, `js/game.js`, `test-economy.mjs`, `sim-firstrun.mjs`.
