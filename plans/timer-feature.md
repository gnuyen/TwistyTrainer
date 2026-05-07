# Free-Play Timer Feature Plan (csTimer-style)

## Architecture Overview

This feature adds a csTimer-style free-play timer to the TwistyTrainer app.  
The timer generates random scrambles, tracks solves, and displays statistics.

### Navigation Change

Current: Single `ChangeViewButton` toggles `select` ↔ `train`.  
New: The `AppNavbar` gains a **"Timer"** button and a **"Training ▾"** dropdown.

```
┌─────────────────────────────────────────────────┐
│ CFOP Trainer    Timer | Training ▾ | Settings … │
│                         ├─ F2L                  │
│                         ├─ OLL                  │
│                         └─ PLL                  │
└─────────────────────────────────────────────────┘
```

- **Timer** → sets `globalState.view = 'timer'`
- **Training → F2L/OLL/PLL** → sets `view = 'select'` + `selectedStep = step`

### View Layout (TimerView)

```
┌──────────────────────────────────────────────────┐
│ Scramble:  R U R' F2 L D' B …                   │  ← top bar
├──────────────────────────┬───────────────────────┤
│                          │  #    Time     ao5    │
│     3D Cube View         │  1    12.34    —     │
│     (TwistyPlayer)       │  2    10.22    —     │
│                          │  3    11.45    —     │
│                          │  4    13.01    —     │
│                          │  5    09.87  11.67   │
│                          │  …                  │
│                          │                      │
│                          │  ao5:   11.67        │
│                          │  ao12:  12.04        │
│                          │  best:   9.87        │
│                          │  mean:  11.89        │
│                          │  σ:      1.23        │
├──────────────────────────┴───────────────────────┤
│              [00:12.34]    +2  DNF  🗑           │  ← timer + actions
└──────────────────────────────────────────────────┘
```

---

## Files to Create

### 1. `src/lib/types/timer.ts`
New types for timer-specific data.
```ts
export type TimerSolve = {
    id: string;
    time: number;           // centiseconds
    scramble: string;       // the scramble shown
    timestamp: number;
    penalty: '' | '+2' | 'DNF';
    sessionId?: string;     // optional session grouping
};
```

### 2. `src/lib/timerState.svelte.ts`
State management for the free-play timer.
- `currentScramble: string` — current random scramble
- `solves: TimerSolve[]` — list of solves in the current session
- `generateNewScramble()` — picks a random 3x3 scramble
- `addSolve(time, penalty, scramble)`
- `removeSolve(id)`
- `currentSessionStats` — computed ao5, ao12, best, mean, standard deviation

### 3. `src/lib/components/Timer/Timer.svelte`
csTimer-style timer component.
- Press and **hold** → enters ready state (green)
- Release → starts timer
- Press while running → stops timer
- Shows time in `MM:SS.CC` format
- After stop: shows +2 / DNF / trash buttons

### 4. `src/lib/components/Timer/TimesList.svelte`
Right panel showing solve history.
- Scrollable list of recent solves: index, time, ao5 rolling
- Summary stats at bottom: best, ao5, ao12, mean, σ
- Click a solve to delete or toggle +2/DNF

### 5. `src/lib/components/Timer/TimerView.svelte`
Main timer page layout.
- Top: scramble text (monospace, selectable)
- Center: TwistyPlayer (3D cube, setup with the scramble)
- Right: TimesList
- Bottom: timer component

---

## Files to Modify

### 6. `src/lib/types/globalState.ts`
Add `'timer'` to the `View` type:
```ts
export type View = 'select' | 'train' | 'timer';
```

### 7. `src/lib/globalState.svelte.ts`
- Add `'timer'` to the `EphemeralState` view default handling
- No new properties needed — the existing `selectedStep` and `selectedGroup` already control what Training shows

### 8. `src/lib/components/AppNavbar.svelte`
Replace the current single `ChangeViewButton` pattern with:
- **Timer** nav button (icon: `Timer` from lucide-svelte)
- **Training** dropdown button with F2L / OLL / PLL options
- Keep existing buttons (Settings, Help, Feedback, Share, PWA, Auth)

### 9. `src/routes/+page.svelte`
Add conditional rendering for `view === 'timer'`:
```svelte
{#if globalState.view === 'select'}
    <SelectView />
{:else if globalState.view === 'timer'}
    <TimerView />
{:else}
    <TrainView />
{/if}
```
Remove the `ChangeViewButton` from the page (moved into navbar).

### 10. `src/lib/components/ChangeViewButton.svelte`
Can be simplified or removed — its functionality moves into the navbar.

---

## Scramble Generation

Reuse the existing scramble data. For free-play timer, use a random 3x3 state scramble.  
We can use the `cubing` library's random scramble generator:

```ts
import { randomScrambleForEvent } from 'cubing/scramble';
const scramble = await randomScrambleForEvent('333');
```

This generates WCA-style random-state scrambles without needing pre-loaded scramble lists.

---

## Data Flow

```
User presses & holds timer
  → Timer enters "ready" state (green)
User releases
  → Timer starts counting
  → TwistyPlayer shows cube with current scramble
User presses timer (while running)
  → Timer stops
  → Solve recorded with time, scramble, timestamp
  → TimesList updates with new solve
  → New scramble generated for next solve
  → TwistyPlayer updates to show new scramble
```

---

## Implementation Order

1. Add `'timer'` to `View` type and update `globalState.ts`
2. Create `src/lib/types/timer.ts`
3. Create `src/lib/timerState.svelte.ts`
4. Create `TimesList.svelte` (right panel)
5. Create `Timer.svelte` (csTimer-style timer)
6. Create `TimerView.svelte` (full page layout)
7. Update `AppNavbar.svelte`
8. Update `+page.svelte`
9. TypeScript check and verify
