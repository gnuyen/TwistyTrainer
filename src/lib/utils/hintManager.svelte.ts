import type { HintAlgorithm } from '$lib/types/globalState';

export interface HintState {
	counter: number;
	showAlgViewer: boolean;
	showHintButton: boolean;
}

export class HintManager {
	private state = $state<HintState>({
		counter: -1,
		showAlgViewer: false,
		showHintButton: false
	});

	get counter() {
		return this.state.counter;
	}

	get showAlgViewer() {
		return this.state.showAlgViewer;
	}

	get showHintButton() {
		return this.state.showHintButton;
	}

	reset() {
		this.state.counter = -1;
		this.state.showAlgViewer = false;
		this.state.showHintButton = false;
	}

	initialize(
		hintMode: HintAlgorithm,
		twistyAlgViewerLoaded: boolean,
		algViewerContainer?: HTMLElement
	) {
		const algViewerElement = algViewerContainer?.querySelector('twisty-alg-viewer');
		const algMoveElements = algViewerElement?.querySelectorAll('.twisty-alg-move');

		if (twistyAlgViewerLoaded && algMoveElements) {
			if (hintMode === 'always') {
				// "Show all time" - make all moves visible
				algMoveElements.forEach((element: Element) => {
					(element as HTMLElement).style.visibility = 'visible';
				});
				this.state.showAlgViewer = true;
				this.state.showHintButton = false;
			} else {
				// "step" or "allAtOnce" - hide all moves initially and show placeholder
				algMoveElements.forEach((element: Element) => {
					(element as HTMLElement).style.visibility = 'hidden';
				});
				this.state.showAlgViewer = false;
				this.state.showHintButton = true;
			}
		} else {
			// TwistyAlgViewer not loaded, use HintButton for display
			this.state.showAlgViewer = false;
			this.state.showHintButton = true;
		}
	}

	revealHint(
		hintMode: HintAlgorithm,
		alg: string,
		twistyAlgViewerLoaded: boolean,
		algViewerContainer?: HTMLElement
	): void {
		const algViewerElement = algViewerContainer?.querySelector('twisty-alg-viewer');
		const algMoveElements = algViewerElement?.querySelectorAll('.twisty-alg-move');

		// First click - initialize counter to 0 (no moves revealed yet)
		if (this.state.counter === -1) {
			this.state.counter = 0;
		}

		// Do nothing if mode is "always" (already visible)
		if (hintMode === 'always') return;

		// Get algorithm and convert to list
		const algList = alg.split(' ').filter((move) => move.trim() !== '');

		if (twistyAlgViewerLoaded && algMoveElements) {
			// Show the AlgViewer and hide the HintButton
			this.state.showAlgViewer = true;
			this.state.showHintButton = false;

			if (hintMode === 'step') {
				// "Reveal step-by-step"
				// Hide all moves if counter is 0
				if (this.state.counter === 0) {
					algMoveElements.forEach((element: Element) => {
						(element as HTMLElement).style.visibility = 'hidden';
					});
					// Reveal first move immediately on first click
					if (algMoveElements[0]) {
						(algMoveElements[0] as HTMLElement).style.visibility = 'visible';
					}
					this.state.counter = 1;
				} else {
					// Show one additional move per click
					const maxViewerMoves = algMoveElements.length;
					if (this.state.counter < maxViewerMoves && algMoveElements[this.state.counter]) {
						(algMoveElements[this.state.counter] as HTMLElement).style.visibility = 'visible';
						this.state.counter++;
					}
				}
			} else if (hintMode === 'allAtOnce') {
				// "Reveal all at once"
				algMoveElements.forEach((element: Element) => {
					(element as HTMLElement).style.visibility = 'visible';
				});
				this.state.counter++;
			}
		} else {
			// TwistyAlgViewer not loaded, continue to use HintButton
			// The HintButton component will handle the display internally
			this.state.showAlgViewer = false;
			this.state.showHintButton = true;
			this.state.counter++;
		}
	}

	getDisplayedAlgorithm(hintMode: HintAlgorithm, alg: string): string {
		if (hintMode === 'always') {
			return alg;
		} else if (this.state.counter <= 0) {
			return '';
		} else if (hintMode === 'allAtOnce') {
			return alg;
		} else if (hintMode === 'step') {
			const algList = alg.split(' ').filter((move) => move.trim() !== '');
			// counter tracks the number of moves revealed (1-based for step mode)
			return algList.slice(0, this.state.counter).join(' ');
		}
		return '';
	}

	shouldShowPlaceholder(hintMode: HintAlgorithm): boolean {
		return this.state.counter === -1 && hintMode !== 'always';
	}
}

export function createHintManager(): HintManager {
	return new HintManager();
}
