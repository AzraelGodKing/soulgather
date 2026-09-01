Soulgather v0.5 prototype. Open index.html to play.

Visual direction is locked: GodKing / void — near-black oxblood, gold, crimson, bone/cream serif. Do not restyle the well sigil or masthead.

Loop: click the well. Shades (base 10 souls, x1.15, 1 soul/s). Bound Spirits at 10 shades or 100 lifetime souls (0.1 shade/s). Well Depth after 1 shade (+1 click; floor(25x1.5^d) souls). Vessels at 5 spirits or 50 lifetime shades (0.1 spirit/s). Thrones at 1 vessel or 50 lifetime spirits this run (cost in vessels; +10% production each, or +15% under Dominion). Buy 1 / 10 / Max on producers (not Well Depth, not Rites, not Aspects). Tick: souls from shades, shades from spirits, spirits from vessels.

Aspects of the GodKing (v0.5). Hidden until first Tribute (favorEarned >= 1), same moment Reliquary appears. First run has no Aspects. After each emptying — including immediately after laying Tribute — swear one Aspect for that run. Gathering and buying still work if you delay; the panel waits, and next-goal reads “Swear an Aspect. The GodKing waits.” One will per emptying. Next Tribute clears the Aspect so you swear again. Footer Reset clears Aspect and favorEarned; the panel hides.
- Harvest: shade soul output ×1.5 (multiplies with Siphon and prodMult). Flavor: The well is a mouth.
- Binding: spirit shade output ×1.5 (stacks with Levy). Flavor: Every will a chain.
- Dominion: Thrones bless +15% each instead of +10% (the throne term inside prodMult). Flavor: A seat for every harvest.

Rites (this-run). Hidden until the first Shade this run. Forgotten on Tribute and on Footer Reset. ×1 buy only.
- Rite of Siphon: each level doubles Shade soul output (×2^level). Cost floor(50×3^level) Souls.
- Rite of Levy: each level doubles Bound Spirit shade output (×2^level). Hidden until Bound Spirits. Cost floor(15×3^level) Shades.
- The Well Draws: one-shot this run. +1 harvest/sec at current clickPower (idle click; no pulse/ripple). Cost 50 Souls. Unlocks at 3 Shades this run.

Reliquary after first Tribute. Favor on hand is spent on edicts; favorEarned never falls except Reset. GodKing's Edict +25% production/level (cost 1x2^n Favor). Deeper Memory +1 starting Shade/level on Tribute (cost 2x2^n Favor).

Multiplier: prodMult = (1 + 0.5 * favorEarned) * (1 + throneWeight * thrones) * (1 + 0.25 * edictLevel), throneWeight 0.15 if Dominion else 0.10.
clickPower = (1 + wellDepth) * prodMult.
souls/s from shades = shades * 1 * prodMult * 2^siphonLevel * harvestMult (+ clickPower if wellDraws). harvestMult is 1.5 if Harvest else 1.
shades/s from spirits = spirits * 0.1 * prodMult * 2^levyLevel * bindingMult. bindingMult is 1.5 if Binding else 1.
Vessels 0.1 spirit/s * prodMult. Click still uses prodMult, so Dominion slightly blesses clicks through Thrones. Thrones do not produce.

First Favor at 25000 lifetime souls (floor(sqrt(lifetime/25000))). Tribute keeps Favor, favorEarned, edicts, memory, buyMode, Chronicle; clears the run (including Rites and the sworn Aspect). Footer Reset wipes Favor, Reliquary, Aspects, Chronicle, and Rites too.

v0.3 session layer: a quiet next-goal line under the soul rate / Blessing (unlock/tribute only; rites do not steal it). After first Tribute, an unsworn Aspect takes the line until you swear. Away-harvest toast on load after real offline production (8h cap, skip fresh saves and tiny tab-switches); hotkeys Space/Enter draw from the well (unless another button is focused), 1/2/3 set buy 1/10/Max; collapsible Chronicle of first-time milestones (persists through Tribute), including first rite cut, the well beginning to draw, and first Aspect sworn.

Save key soulgather-v0. Old saves: missing favorEarned copies favor; missing aspect is none. New fields default 0/false/"1"/empty Chronicle. Autosave 5s. 8h offline cap. Footer Memory (collapsed, near Reset) exports or imports that JSON.

Verify: node test-economy.mjs (expect exit 0).

Files: index.html, css/style.css, js/format.js, js/game.js, test-economy.mjs.
