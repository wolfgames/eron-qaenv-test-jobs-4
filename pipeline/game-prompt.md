# Mystery Munch: A Scooby-Doo Bubble Pop Adventure
**Tagline:** Every bubble holds a secret — pop your way to the truth.
**Genre:** Match-3 Puzzle / Bubble Pop (Bejeweled-style cascade)
**Platform:** Mobile first (portrait, touch), playable on web
**Target Audience:** Casual adults 30+

## Game Overview
Mystery Munch is a match-3 bubble pop puzzle game set in the groovy, ghost-haunted world of Scooby-Doo. Players swap and match glowing mystery bubbles — each one hiding a monster, a clue, or a Scooby Snack — to clear haunted rooms and unravel chapter mysteries. The vibe is warm 70s nostalgia: wood-paneled walls, shag carpet, and that unmistakable hand-drawn aesthetic, all wrapped in a gentle puzzle challenge designed for a coffee-break session. Player matches bubbles on a grid to clear haunted cells → which reveals monster clues hidden beneath → which unlocks the chapter's mystery villain reveal.

**Setting:** A rotating cast of classic Scooby-Doo haunted locations — a creaking mansion, a foggy carnival, an abandoned amusement park, a spooky lighthouse — rendered in a warm, saturated 70s illustrated style. Each chapter is a new case for Mystery Inc.

**Core Loop:** Player swaps adjacent bubbles to form matches of 3+ → which clears haunted cells and triggers chain reactions → which reveals monster clues that unlock the chapter's villain identity.

---

## Table of Contents

**The Game**
1. [Game Overview](#game-overview)
2. [At a Glance](#at-a-glance)

**How It Plays**
3. [Core Mechanics](#core-mechanics)
4. [Level Generation](#level-generation)

**How It Flows**
5. [Game Flow](#game-flow)

---

## At a Glance

| | |
|---|---|
| **Grid** | 8×8 |
| **Input** | Swap (drag adjacent bubble) |
| **Bubble Colors** | 5 (Amber, Teal, Violet, Coral, Lime) |
| **Special Bubbles** | Scooby Snack (5-in-a-row), Mystery Machine (L/T-shape), Ghost Buster (2×2 square) |
| **Levels / Chapter** | 15 |
| **Session Target** | 2–5 min per level |
| **Move Range** | 12–40 moves |
| **Chapters at Launch** | 5 |
| **Blockers** | Ghost Slime (Ch. 1), Phantom Web (Ch. 2), Haunted Crate (Ch. 3), Monster Lock (Ch. 4) |
| **Failure** | Yes — out of moves |
| **Continue System** | Watch ad or spend Snack Coins for +5 moves |
| **Star Rating** | 1–3 stars, cosmetic only (no progression gate) |
| **Companion** | Scooby-Doo — cozy, clumsy, enthusiastic food-lover |
| **Content Cadence** | 1 chapter every 2 weeks |

---

## Core Mechanics

### Primary Input
**Input type:** Swap — player drags one bubble to an adjacent bubble (up, down, left, right — no diagonal).
**Acts on:** Any two adjacent bubbles on the 8×8 grid.
**Produces:** If the swap creates a match of 3 or more same-color bubbles in a row or column, those bubbles pop and the cells above fall down (gravity fill). If no match is created, the swap snaps back with an invalid-action animation (see [Feedback & Juice](#feedback--juice)).

### Play Surface
- **Dimensions:** 8 columns × 8 rows. Portrait layout. The grid occupies the center 85% of screen width and approximately 60% of screen height, leaving room for the HUD strip at top (~15% height) and the move counter + action bar at bottom (~12% height).
- **Scaling:** Grid scales proportionally to viewport width. On a 375pt-wide phone, each cell is approximately 40×40pt visual, with an effective 44×44pt tap/drag target (extended by 2pt padding on all sides).
- **Bounds:** Bubbles cannot be swapped outside the grid boundary. IF a player drags toward a boundary edge THEN the swap is rejected with a gentle snap-back animation.
- **Cell types:**
  - **Normal cell** — holds one bubble, participates in matches and gravity.
  - **Haunted cell** — visually overlaid with a ghost-fog tint; requires one adjacent match to clear the haunt (reveal the cell beneath). Haunted cells can still hold and participate in bubble matches.
  - **Blocked cell** — holds a blocker piece (Ghost Slime, Phantom Web, etc.); no bubble occupies it until the blocker is cleared.
  - **Empty cell** — edge-shape levels may have permanently empty cells that form the level silhouette (e.g., a haunted house outline).

### Game Entities

#### Bubbles (5 colors)
| Name | Visual | Behavior |
|---|---|---|
| Amber Bubble | Warm golden-orange glowing sphere, hand-drawn outline, slight wobble idle | Standard match piece. Participates in all match rules. |
| Teal Bubble | Deep seafoam-green glowing sphere | Same as Amber. |
| Violet Bubble | Rich grape-purple glowing sphere | Same as Amber. |
| Coral Bubble | Warm pink-red glowing sphere | Same as Amber. |
| Lime Bubble | Bright yellow-green glowing sphere | Same as Amber. |

**Edge case — color minimum:** IF at any point the board has fewer than 3 of any color remaining AND that color is still needed for an objective THEN the refill algorithm seeds additional bubbles of that color in the next cascade fill.

**Edge case — deadlock:** IF no valid swap exists on the board THEN the board automatically reshuffles with a "Ruh-roh!" shake animation (300ms) and a new valid arrangement is generated. The player's move count is not decremented.

#### Special Bubbles
Special bubbles are created when a player makes a match of 5 or more, or a specific shape match. They are not generated randomly — they only appear as the result of a qualifying player-initiated match.

| Special | Created by | Effect when activated | Visual |
|---|---|---|---|
| **Scooby Snack** | 5 in a straight line | Clears all bubbles of one random color from the board | Large biscuit-brown bubble with Scooby Snack logo; gold sparkle idle |
| **Mystery Machine** | L-shape or T-shape match (5 bubbles) | Clears all bubbles in a full row AND full column (cross pattern) | Teal-and-orange van icon bubble; engine-rumble idle |
| **Ghost Buster** | 2×2 square match (4 bubbles of same color) | Clears a 3×3 area centered on the bubble | Purple ghost silhouette bubble with "GB" badge; wriggling idle |

**Special activation:** Tapping a special bubble activates it immediately (consumes one move). Swapping a special bubble into a match of 3+ same-color bubbles activates it AND completes the match (both effects trigger).

**Special + Special chain:** IF two specials are swapped together THEN a combined mega-effect fires: Scooby Snack + Mystery Machine = clears entire board of two colors; Mystery Machine + Ghost Buster = clears 3 full rows + 3 full columns; Ghost Buster + Ghost Buster = clears a 5×5 area. Chain animations play sequentially, 200ms between each.

#### Blockers

| Blocker | Visual | HP | Clear Condition | Introduced |
|---|---|---|---|---|
| **Ghost Slime** | Green translucent ooze covering a cell | 1 hit | Any adjacent match clears it | Chapter 1 |
| **Phantom Web** | Gray cobweb stretched across a cell | 2 hits | Two adjacent matches (or one special hit) | Chapter 2 |
| **Haunted Crate** | Wooden crate with painted ghost face | 3 hits | Three adjacent matches or one special hit | Chapter 3 |
| **Monster Lock** | Iron lock with glowing red eyes | Cannot be hit directly | Player must collect the matching Key Bubble (spawns once per level in a random normal cell) then swap it adjacent to the lock | Chapter 4 |

Each blocker hit plays a damage animation (150ms crack/ooze) and decrements the HP counter. At 0 HP the blocker dissolves (250ms) revealing the cell beneath (normal cell or a clue tile).

#### Clue Tiles
Clue Tiles are special cell overlays (not bubbles) that appear beneath haunted cells and certain cleared blockers. When a clue tile is revealed (the cell above it is cleared), it "rises" into the HUD clue tray with a 400ms float animation. Clue tiles do not block gameplay. Collecting all clue tiles in a chapter's levels unlocks the villain reveal cutscene.

| Clue Type | Visual |
|---|---|
| Footprint | Muddy shoe print in sepia |
| Mask Fragment | Torn corner of a villain mask |
| Note Scrap | Crinkled paper with a few blurred words |
| Snack Wrapper | Empty Scooby Snack bag with a clue printed on it |

### Movement & Physics Rules

- IF a match of 3+ same-color bubbles is formed THEN those bubbles are removed simultaneously (200ms pop animation).
- IF cells above removed bubbles are occupied THEN those bubbles fall downward one cell at a time (gravity, 80ms per cell, ease-out).
- IF cells fall and create a new match of 3+ THEN a cascade match fires automatically (no player input, no move cost).
- IF the top row has empty cells after gravity THEN new bubbles are spawned at the top of each empty column and fall into place (80ms per cell).
- IF a swap produces no match THEN the bubbles snap back to their original positions (150ms ease-in-out), no move is consumed.
- IF a special bubble is in the cascade path THEN it does NOT auto-activate — it falls like a normal bubble and only activates on direct player tap or swap-into-match.
- IF the board reshuffles (deadlock) THEN all bubbles lift off the grid (200ms), shuffle positions (300ms), and land back (200ms). Move count is unchanged.

> For invalid action feedback (visual, audio, duration), see [Feedback & Juice](#feedback--juice).

---

## Level Generation

### Method
**Hybrid** — Levels 1–30 (tutorial + Chapters 1–2 early levels) are hand-crafted to guarantee gentle onboarding and precisely calibrated difficulty moments. Levels 31+ are procedurally generated using the algorithm below, with hand-crafted override slots available for chapter finale levels (levels 15, 30, 45, 60, 75 of each chapter cycle).

### Generation Algorithm

**Step 1: Parameter Sampling**
- Inputs: `levelNumber`, `chapterIndex`, `difficultyTier` (derived from level position within chapter)
- Outputs: `colorCount` (3–5), `blockerCount`, `hauntedCellCount`, `moveLimit`, `targetScore`, `specialBubbleEnabled`, `gridShape`
- Constraints: `colorCount` must be ≥ 3 at all times. `moveLimit` must allow at least 1.3× the optimal solution path. `hauntedCellCount + blockerCount` must not exceed 40% of total cells.

**Step 2: Grid Shape Selection**
- Inputs: `chapterIndex`, `gridShape` parameter, `levelNumber`
- Outputs: A bitmask defining which cells are active (vs. permanently empty)
- Constraints: The active cell region must be contiguous (flood-fill check). Minimum 48 active cells on an 8×8 grid. Edge shapes (haunted house, cartoon ghost) are unlocked starting Chapter 2.
- Shapes available: Full 8×8 (Ch. 1), Diagonal-cut corners (Ch. 2), T-shape (Ch. 3), Ghost silhouette (Ch. 4–5)

**Step 3: Blocker Placement**
- Inputs: `blockerCount`, `blockerTypes` (gated by chapterIndex), active cell bitmask
- Outputs: Blocker positions on grid
- Constraints: No blocker in the bottom 2 rows (preserve swap access). No two Monster Locks placed in the same column unless `levelNumber >= 50`. Blockers must not form a wall that entirely separates the grid into two disconnected regions.

**Step 4: Bubble Fill**
- Inputs: Active cells (minus blocker cells), `colorCount`, seeded RNG
- Outputs: Initial bubble color assignment for every non-blocked cell
- Constraints: No starting match of 3+ (reroll if detected). No color occupies more than 35% of cells. Each color must appear in at least 3 cells.

**Step 5: Haunted Cell Overlay**
- Inputs: `hauntedCellCount`, filled grid
- Outputs: Set of cells marked as haunted
- Constraints: Haunted cells must be spread across at least 3 different rows. No haunted cell adjacent to a Monster Lock (avoid compound difficulty spikes).

**Step 6: Clue Tile Placement**
- Inputs: Active cells, chapter clue count (always 4 per chapter, distributed across levels)
- Outputs: 1–2 clue tile positions hidden beneath haunted or blocker cells
- Constraints: Clue tiles must be reachable within the generated move limit.

**Step 7: Solvability Check**
- Inputs: Complete level state
- Process: Run a greedy solver (not optimal, but representative of casual play) for up to 500 iterations.
- Rejection conditions:
  - Solver cannot complete the level within the move limit after 3 independent solve attempts
  - Level requires a specific special bubble to be created AND used in a single narrow path (too prescriptive)
  - Any clue tile is blocked behind 2+ Monster Locks (exceeds casual accessibility)
- On rejection: Increment RNG seed offset by 1 and repeat from Step 4. Maximum 10 retries.
- If 10 retries exhausted: fall back to the chapter's baseline template (see Hand-Crafted Levels).

### Seeding & Reproducibility
- Seed formula: `seed = (levelNumber * 31337) XOR (chapterIndex * 9973)`
- Same seed always produces identical level layout, bubble fill, and blocker positions.
- If a level was rejected and seed was offset, the final accepted seed offset is stored in the level manifest so the same level is always reproduced.

### Solvability Validation

| Rejection Condition | Action |
|---|---|
| Greedy solver fails 3× within move limit | Retry with seed+1 offset (max 10 retries) |
| Level requires one specific special creation path | Increase `moveLimit` by 20% and re-validate |
| Clue tile inaccessible within move limit | Relocate clue tile to shallower cell and re-validate |
| Grid has disconnected regions | Regenerate grid shape from Step 2 |
| Color count drops below 3 during solve | Increase `colorCount` by 1 and rerun fill |
| All 10 retries exhausted | Use chapter baseline template for this level |

**Last-resort guarantee:** Every chapter has a pre-authored baseline template (a valid, tested 8×8 full grid with 4 colors, 0 special bubbles, 0 Monster Locks, 25 moves) that is guaranteed solvable. This template is used whenever generation retries are exhausted. The player never sees a broken level.

### Hand-Crafted Levels

| Level Range | Owner | Data Location | Notes |
|---|---|---|---|
| Tutorial T1–T2 | Game Designer | `src/game/mysterymunch/data/tutorial/` | Frozen — no procedural override |
| Levels 1–30 | Game Designer | `src/game/mysterymunch/data/handcrafted/` | First 2 full chapters, careful difficulty ramp |
| Chapter finale levels (15, 30, 45, 60, 75) | Game Designer | `src/game/mysterymunch/data/finales/` | Boss-level challenge; reviewed by QA |

---

## Game Flow

### Master Flow Diagram

```
[App Open]
    ↓ (assets load)
[Loading Screen] `lifecycle_phase: BOOT`
    ↓ (load complete)
[Title Screen] `lifecycle_phase: TITLE`
    ↓ (first launch: tap "Solve the Mystery")
[First-Time Intro Cutscene] `lifecycle_phase: TITLE`
    ↓ (cutscene complete / skip)
[Tutorial Level 1] `lifecycle_phase: PLAY`
    ↓ (level won)
[Tutorial Level 2] `lifecycle_phase: PLAY`
    ↓ (level won)
[Chapter 1 Start Interstitial] `lifecycle_phase: PROGRESSION`
    ↓ (tap "Let's Go!")
[Gameplay Screen — Level] `lifecycle_phase: PLAY`
    ↓ (win condition met)                       ↓ (out of moves)
[Level Complete Screen]                      [Loss Screen]
`lifecycle_phase: OUTCOME`                   `lifecycle_phase: OUTCOME`
    ↓ (tap Next)                                 ↓ (Watch Ad / Spend Coins / Quit)
[Next Level — Gameplay Screen]               [+5 Moves continuation OR back to Gameplay Screen]
    ↓ (all 15 levels in chapter complete)
[Chapter Complete / Villain Reveal Screen] `lifecycle_phase: OUTCOME`
    ↓ (tap "Next Mystery")
[Chapter N+1 Start Interstitial] `lifecycle_phase: PROGRESSION`
    ↓
[Repeat...]
```

### Screen Breakdown

#### Loading Screen
- **Purpose:** Load assets, initialize game engine.
- **lifecycle_phase:** BOOT
- **What the player sees:** Full-screen illustrated background of Mystery Inc. running (70s style). Animated "Mystery Munch" logo pops in. Scooby paw-print progress indicator at bottom.
- **What the player does:** Nothing — passive wait.
- **Expected duration:** 2–4 seconds on typical mobile connection.
- **What happens next:** Auto-transitions to Title Screen when load is complete.

#### Title Screen
- **Purpose:** Entry point, brand moment, new/returning player fork.
- **lifecycle_phase:** TITLE
- **What the player sees:** Animated title card. "Solve the Mystery" button (large, centered, 56×56pt minimum). Returning players also see "Continue" (their last chapter). Settings gear (top-right, 44×44pt). Scooby peeks in from the side.
- **What the player does:** Tap "Solve the Mystery" (new game) or "Continue" (returning).
- **What happens next:** First launch → First-Time Intro Cutscene. Returning → Chapter Start Interstitial for their current chapter.

#### First-Time Intro Cutscene
- **Purpose:** Establish setting, introduce Scooby companion, and hint at the mystery mechanic.
- **lifecycle_phase:** TITLE
- **What the player sees:** 4-panel illustrated sequence (tap to advance). Panel 1: Mystery Machine arrives at a haunted mansion. Panel 2: Scooby points at glowing bubbles. Panel 3: A villain shadow lurks behind bubbles. Panel 4: Scooby's face fills screen — "Scooby-Dooby-Doo! Let's solve it!"
- **What the player does:** Tap to advance each panel. "Skip" button (top-right, 44×44pt) available throughout.
- **What happens next:** Tutorial Level 1.

#### Tutorial Level 1
- **Purpose:** Teach the core swap-and-match gesture. No text instructions — show via animated ghost-finger pointer.
- **lifecycle_phase:** PLAY
- **What the player sees:** A simplified 5×5 grid with 3 colors only. Large animated ghost-finger pointer demonstrates a swap. Progress bar and level counter are hidden. Scooby's portrait at top with a single speech bubble.
- **What the player does:** Follow the ghost-finger hint to make the first match.
- **What happens next:** Win sequence → Tutorial Level 2.

#### Tutorial Level 2
- **Purpose:** Teach the Ghost Slime blocker and the concept of adjacent-match clearing.
- **lifecycle_phase:** PLAY
- **What the player sees:** A 6×6 grid with 2 Ghost Slime blockers. Ghost-finger hint points at a cell adjacent to a slime. Progress bar and level counter still hidden.
- **What the player does:** Make a match adjacent to a Ghost Slime to clear it.
- **What happens next:** Win sequence → Chapter 1 Start Interstitial.

#### Chapter Start Interstitial
- **Purpose:** Establish the chapter's mystery premise. Brief narrative hook.
- **lifecycle_phase:** PROGRESSION
- **What the player sees:** Illustrated chapter title card ("Chapter 1: The Haunted Mansion"). Scooby and the gang illustrated in the foreground. Three to four words of mystery teaser ("Something's hiding in the walls..."). "Let's Go!" button.
- **What the player does:** Read the premise, tap "Let's Go!"
- **What happens next:** First gameplay level of the chapter.

#### Gameplay Screen
- **Purpose:** Core puzzle experience.
- **lifecycle_phase:** PLAY
- **What the player sees:**
  - Top HUD: Chapter icon (small, left), Move counter (center, large numerals), Star targets (right — 3 ghost icons that fill gold at score thresholds), Clue Tray (shows collected clues as thumbnails, top-right corner strip)
  - Center: 8×8 bubble grid
  - Bottom: Pause button (44×44pt, bottom-left). No other persistent bottom UI.
  - Scooby portrait (bottom-right corner, small — reacts to events with expression changes and dialogue bubbles that auto-dismiss after 2.5 seconds)
- **What the player does:** Swap adjacent bubbles to make matches. Tap specials to activate.
- **What happens next:** Win condition met → Level Complete Screen. Move count reaches 0 → Loss Screen.

#### Level Complete Screen
- **Purpose:** Celebrate win, show stars earned, preview next level.
- **lifecycle_phase:** OUTCOME
- **What the player sees:** Full-screen overlay. Stars earned (1–3) animate in with "pop" effect. Score displayed. Any clue tiles collected this level appear with a reveal animation. Scooby celebration (happy expression). "Next Level" button (large, centered). "Replay" button (smaller, beneath).
- **What the player does:** Tap "Next Level" or optionally "Replay."
- **What happens next:** Next level Gameplay Screen.

#### Loss Screen
- **Purpose:** Gentle recovery — never punishing.
- **lifecycle_phase:** OUTCOME
- **What the player sees:** Soft-focus overlay (does NOT cover the board fully — player can still see the board state). Scooby with worried expression. Copy: "Almost there, pal!" (never "GAME OVER"). Three options: "Keep Going" (Watch Ad → +5 moves), "Use Snack Coins" (spend 30 coins → +5 moves), "Try Next Time" (exit to level map). Move counter shows +5 in ghost text.
- **What the player does:** Chooses one of three options.
- **What happens next:** "Keep Going" or "Use Coins" → resumes gameplay with 5 extra moves. "Try Next Time" → returns to Chapter map / level select.

#### Chapter Complete / Villain Reveal Screen
- **Purpose:** Narrative payoff — reveal the chapter's mystery villain. Major emotional beat.
- **lifecycle_phase:** OUTCOME
- **What the player sees:** Animated "unmask" sequence — a shadowy figure's mask is pulled off (Scooby-Doo style) to reveal the villain. Villain name + one-sentence motive. All clues collected shown together. Scooby's "I knew it!" expression. "Next Mystery" button.
- **What the player does:** Enjoy the reveal, tap "Next Mystery."
- **What happens next:** Chapter N+1 Start Interstitial.

### Board States

| State | Description | Input Allowed? | Visual Indicator |
|---|---|---|---|
| **Idle** | No animation playing, awaiting player input | Yes | Bubbles do gentle idle wobble |
| **Animating** | Match pop, gravity fall, cascade in progress | No | Bubbles in motion; input blocked |
| **Special Active** | Special bubble effect playing out | No | Board dims 20%, special VFX full-screen |
| **Won** | Win condition just met | No | Win fanfare plays over board |
| **Lost** | Move count reached 0 | No | Loss overlay fades in |
| **Paused** | Player tapped pause | No (gameplay) | Full-screen pause menu overlay |
| **Reshuffling** | Deadlock detected, board reshuffling | No | Shake + lift animation |

### Win Condition
IF `(all_haunted_cells_cleared == true AND all_required_clue_tiles_collected == true)` OR `(target_score_reached == true AND all_required_clue_tiles_collected == true)` THEN level is won.

*(Primary win condition: clear all haunted cells and collect all clue tiles. Score thresholds determine 1–3 star rating but do not gate progression.)*

### Lose Condition
IF `moves_remaining == 0 AND win_condition_not_met == true` THEN loss state is triggered.

### Win Sequence (ordered)
1. Last match or special that meets win condition resolves (pop + gravity animation, ~600ms total)
2. Board freezes (Idle → Won transition)
3. Win jingle plays (0.8 seconds)
4. Stars earned animate into view one by one (300ms each, bouncy ease)
5. Score counter increments to final value (400ms)
6. Any clue tiles collected this level float up into the clue tray with label reveals (300ms per tile)
7. Scooby happy expression + "Zoinks! We did it!" dialogue bubble appears (auto-dismiss 2.5s)
8. "Next Level" button slides up from bottom (200ms)
9. (If this was level 15 of a chapter) chapter complete fanfare plays before transitioning to Villain Reveal

### Loss Sequence (ordered)
1. Player makes final move that does not trigger win condition
2. Move counter animates to 0 (100ms shake)
3. Board dims to 60% opacity (200ms fade)
4. Scooby worried expression appears with "Ruh-roh..." dialogue
5. Loss overlay fades in over the dimmed board (250ms)
6. "Almost there, pal!" copy resolves into view (150ms)
7. Three option buttons slide in from bottom (staggered, 100ms apart)
8. Continue/ad prompt is non-aggressive — no countdown timer, no flashing

