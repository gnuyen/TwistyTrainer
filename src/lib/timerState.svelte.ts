import { loadFromLocalStorage, saveToLocalStorage } from './utils/localStorage';
import type { TimerSolve, CfopStep } from './types/timer';
import { randomScrambleForEvent } from 'cubing/scramble';
import { sessionState } from '$lib/sessionState.svelte';

const TIMER_SOLVES_STORAGE_KEY = 'timerSolves';

const TIMER_SETTINGS_KEY = 'timerSettings';
interface TimerSettings {
    cfopAutoDetect: boolean;
}

const defaultSettings: TimerSettings = { cfopAutoDetect: true };

function loadSettings(): TimerSettings {
    try {
        const raw = localStorage.getItem(TIMER_SETTINGS_KEY);
        if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return { ...defaultSettings };
}

function saveSettings(s: TimerSettings) {
    try {
        localStorage.setItem(TIMER_SETTINGS_KEY, JSON.stringify(s));
    } catch { /* ignore */ }
}

// Load persisted solves
const persisted = loadFromLocalStorage<TimerSolve[]>(TIMER_SOLVES_STORAGE_KEY);
const initialSolves: TimerSolve[] = Array.isArray(persisted) ? persisted : [];

/**
 * CFOP step detection uses move counts and checkpoints.
 *
 * Heuristic (simplified csTimer-style):
 * - Moves 0–N: we look for when the cross edges are solved → "cross" checkpoint
 * - After cross: when all 4 F2L slots are solved → "F2L" checkpoint
 * - After F2L: when LL edges + corners are oriented → "OLL" checkpoint
 * - After OLL: when cube is fully solved → "PLL" checkpoint
 *
 * Since the TwistyPlayer streams face moves live, the TimerView
 * calls `timerState.onFaceMove()` for each move, and when the cube
 * reaches a solved state it calls `onCubeSolved()`. We can approximate
 * CFOP phase by using the cube's solve-checking already built into
 * [`checkSolvedState.ts`](src/lib/utils/checkSolvedState.ts).
 *
 * However, for the free-play timer we don't have the training-mode
 * slot/cross markers. We use a simpler heuristic: the `cubing`
 * library can tell us which pieces are solved at any point, but
 * exposing that requires hooking into the KPuzzle pattern. For now
 * we use move-count thresholds as a lightweight approximation.
 */
function detectCfopStep(moveCount: number, totalMoves: number): CfopStep {
    if (totalMoves <= 4) return 'cross';
    if (totalMoves <= 8) return 'cross'; // cross typically ≤ 8 moves
    // After cross, remaining moves are F2L/OLL/PLL
    // Without piece-level tracking we label everything post-cross as 'F2L'
    // The TwistyPlayer's cube-solve callback handles the actual detection
    return 'F2L';
}

class TimerStateManager {
    #solves: TimerSolve[] = $state(initialSolves);
    #currentScramble: string = $state('');
    #isTimerRunning: boolean = $state(false);
    #startTime: number = $state(0);
    #elapsedCentiseconds: number = $state(0);
    #animationFrameId: number | null = null;
    #scrambleLoaded: boolean = $state(false);
    #scrambleLoading: boolean = $state(false);

    /** Number of face moves detected since scramble was loaded. */
    #moveCount: number = $state(0);

    /** Scramble history for navigation (max ~50 recent). */
    #scrambleHistory: string[] = $state([]);
    #scrambleHistoryIndex: number = $state(-1);

    /** Last detected CFOP step (updated by TimerView via kpuzzle). */
    #currentStep: CfopStep = $state('unknown');

    // Settings
    #settings: TimerSettings = $state(loadSettings());

    get solves() {
        return this.#solves;
    }
    get currentScramble() {
        return this.#currentScramble;
    }
    get isTimerRunning() {
        return this.#isTimerRunning;
    }
    get elapsedCentiseconds() {
        return this.#elapsedCentiseconds;
    }
    get scrambleLoaded() {
        return this.#scrambleLoaded;
    }
    get scrambleLoading() {
        return this.#scrambleLoading;
    }
    get moveCount() {
        return this.#moveCount;
    }
    get scrambleHistory() {
        return this.#scrambleHistory;
    }
    get scrambleHistoryIndex() {
        return this.#scrambleHistoryIndex;
    }
    /** Whether we can navigate to an older scramble. */
    get canGoBack() {
        return this.#scrambleHistoryIndex < this.#scrambleHistory.length - 1;
    }
    /** Whether we can navigate to a newer scramble. */
    get canGoForward() {
        return this.#scrambleHistoryIndex > 0;
    }
    get currentStep() {
        return this.#currentStep;
    }
    get cfopAutoDetect() {
        return this.#settings.cfopAutoDetect;
    }

    toggleCfopAutoDetect() {
        this.#settings = { ...this.#settings, cfopAutoDetect: !this.#settings.cfopAutoDetect };
        saveSettings(this.#settings);
    }

    /** Called by TimerView when KPuzzle indicates a CFOP phase change. */
    setCurrentStep(step: CfopStep) {
        this.#currentStep = step;
    }

    /** Generate a random 3x3 WCA scramble. */
    async loadNewScramble(): Promise<string> {
        this.#scrambleLoading = true;
        try {
            const scramble = (await randomScrambleForEvent('333')).toString();
            this.#scrambleLoaded = true;
            this.#currentScramble = scramble;
            this.#moveCount = 0;
            this.#currentStep = 'unknown';

            // Add to history
            this.#scrambleHistory = [scramble, ...this.#scrambleHistory].slice(0, 50);
            this.#scrambleHistoryIndex = 0;

            return scramble;
        } catch (e) {
            console.error('[TimerState] Failed to generate scramble:', e);
            this.#scrambleLoaded = false;
            return '';
        } finally {
            this.#scrambleLoading = false;
        }
    }

    /** Navigate to an older scramble in the history. */
    goToPreviousScramble() {
        if (this.#scrambleHistoryIndex < this.#scrambleHistory.length - 1) {
            this.#scrambleHistoryIndex++;
            this.#currentScramble = this.#scrambleHistory[this.#scrambleHistoryIndex];
            this.#moveCount = 0;
            this.#currentStep = 'unknown';
        }
    }

    /** Navigate to a newer scramble in the history. */
    goToNextScramble() {
        if (this.#scrambleHistoryIndex > 0) {
            this.#scrambleHistoryIndex--;
            this.#currentScramble = this.#scrambleHistory[this.#scrambleHistoryIndex];
            this.#moveCount = 0;
            this.#currentStep = 'unknown';
        }
    }

    /**
     * Called by the TimerView when a face move is detected from the bluetooth cube.
     * If the timer is not running, this starts it.
     */
    onFaceMove() {
        this.#moveCount++;

        if (!this.#isTimerRunning) {
            this.startTimer();
        }
    }

    /** Start the stopwatch. */
    startTimer() {
        if (this.#isTimerRunning) return;
        this.#isTimerRunning = true;
        this.#startTime = Date.now() - this.#elapsedCentiseconds * 10;
        this.#animationFrameId = requestAnimationFrame(this.#updateTimer);
    }

    /** Stop the stopwatch and record the solve. */
    stopTimer() {
        if (!this.#isTimerRunning) return;
        this.#isTimerRunning = false;
        if (this.#animationFrameId !== null) {
            cancelAnimationFrame(this.#animationFrameId);
            this.#animationFrameId = null;
        }

        const time = this.#elapsedCentiseconds;
        const scramble = this.#currentScramble;
        const step = this.#settings.cfopAutoDetect ? this.#currentStep : undefined;
        const sessionId = sessionState.activeSessionId ?? undefined;

        const solve: TimerSolve = {
            id: crypto.randomUUID(),
            time,
            scramble,
            timestamp: Date.now(),
            penalty: '',
            cfopStep: step,
            sessionId
        };

        this.#solves = [...this.#solves, solve];
        this.#persist();
    }

    /** Reset the current timer without recording. */
    resetTimer() {
        this.#isTimerRunning = false;
        this.#elapsedCentiseconds = 0;
        if (this.#animationFrameId !== null) {
            cancelAnimationFrame(this.#animationFrameId);
            this.#animationFrameId = null;
        }
        this.#moveCount = 0;
        this.#currentStep = 'unknown';
    }

    /** Adjust penalty on a solve. */
    setPenalty(id: string, penalty: '' | '+2' | 'DNF') {
        this.#solves = this.#solves.map((s) => (s.id === id ? { ...s, penalty } : s));
        this.#persist();
    }

    /** Remove a single solve. */
    removeSolve(id: string) {
        this.#solves = this.#solves.filter((s) => s.id !== id);
        this.#persist();
    }

    /** Clear all solves. */
    clearAllSolves() {
        this.#solves = [];
        this.#persist();
    }

    // --- Private ---

    #updateTimer = () => {
        const elapsedMs = Date.now() - this.#startTime;
        this.#elapsedCentiseconds = Math.floor(elapsedMs / 10);
        this.#animationFrameId = requestAnimationFrame(this.#updateTimer);
    };

    #persist() {
        saveToLocalStorage(TIMER_SOLVES_STORAGE_KEY, this.#solves);
    }
}

export const timerState = new TimerStateManager();
