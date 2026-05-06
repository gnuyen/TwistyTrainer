import { GiikerCube } from './core/bluetooth';

// Move subscription types
type MoveSubscriber = {
	callback: (move: string) => void;
	priority: number; // Higher priority = takes precedence
};

let isConnected = $state(false);
let isConnecting = $state(false);
let deviceName = $state<string | null>(null);
let deviceId = $state<string | null>(null);
let deviceMac = $state<string | null>(null);
let batteryLevel = $state<number | null>(null);
let facelet = $state<string | null>(null);
let lastMove = $state<string | null>(null);
let moveCounter = $state(0);
let errorMessage = $state<string | null>(null);

// Gyro state
let gyroEnabled = $state(false);
let gyroTopFaceYellow = $state(false);
// Final display quaternion passed to TwistyPlayer's rAF loop
let gyroQuat = $state<{ x: number; y: number; z: number; w: number } | null>(null);
// Non-reactive ref updated at full gyro rate — read by rAF loop directly (Cubedex pattern)
const gyroQuatRef: { current: { x: number; y: number; z: number; w: number } | null } = { current: null };
let _gyroCalibrated = false;
let _refQw = 1, _refQx = 0, _refQy = 0, _refQz = 0;
// Track last quaternion to fix sign-flips
let _lastQw = 1, _lastQx = 0, _lastQy = 0, _lastQz = 0;
// Debug throttle timestamp (remove once gyro is confirmed working)
let _gyroDebugLastLog = 0;

// HOME_ORIENTATION: precomputed from THREE.Euler(15° , -5°, 0) — same as Cubedex.
// NOTE: We intentionally do NOT apply this. The TwistyPlayer's own camera
// lat/lon already provides the viewing angle. Applying HOME here would add
// an arbitrary tilt offset that misaligns the gyro from the real cube.
// const HOME_W = 0.99050, HOME_X = 0.13040, HOME_Y = -0.04325, HOME_Z = -0.005693;
const macAddressRequest = $state({
	isOpen: false,
	isWrongKey: false,
	deviceMac: null as string | null,
	defaultMac: null as string | null,
	resolve: null as ((mac: string | undefined) => void) | null
});

let history = $state([] as { move: string; counter: number }[]);

// Move subscribers map (id -> { callback, priority })
const moveSubscribers = new Map<string, MoveSubscriber>();

export const bluetoothState = {
	get isConnected() {
		return isConnected;
	},
	get deviceName() {
		return deviceName;
	},
	get deviceId() {
		return deviceId;
	},
	get deviceMac() {
		return deviceMac;
	},
	get batteryLevel() {
		return batteryLevel;
	},
	get facelet() {
		return facelet;
	},
	get history() {
		return history;
	},
	get lastMove() {
		return lastMove;
	},
	get moveCounter() {
		return moveCounter;
	},
	get errorMessage() {
		return errorMessage;
	},
	setConnected(connected: boolean) {
		isConnected = connected;
		if (connected) {
			errorMessage = null;
		} else {
			facelet = null;
			lastMove = null;
			moveCounter = 0;
			history = [];
			// Disable gyro on disconnect
			if (gyroEnabled) {
				gyroEnabled = false;
				_gyroCalibrated = false;
			}
		}
	},
	setDeviceName(name: string | null) {
		deviceName = name;
	},
	setDeviceId(id: string | null) {
		deviceId = id;
	},
	setDeviceMac(mac: string | null) {
		deviceMac = mac;
	},
	setBatteryLevel(level: number | null) {
		batteryLevel = level;
	},
	setErrorMessage(msg: string | null) {
		errorMessage = msg;
	},
	// MAC Address Request Handling
	requestMacAddress(
		isWrongKey: boolean,
		deviceMac: string | null,
		defaultMac: string | null,
		resolve: (mac: string | undefined) => void
	) {
		macAddressRequest.isOpen = true;
		macAddressRequest.isWrongKey = isWrongKey;
		macAddressRequest.deviceMac = deviceMac;
		macAddressRequest.defaultMac = defaultMac;
		macAddressRequest.resolve = resolve;
	},
	submitMacAddress(mac: string) {
		if (macAddressRequest.resolve) {
			macAddressRequest.resolve(mac);
		}
		bluetoothState.resetMacAddressRequest();
	},
	cancelMacAddressRequest() {
		if (macAddressRequest.resolve) {
			macAddressRequest.resolve(undefined);
		}
		bluetoothState.resetMacAddressRequest();
		isConnected = false;
	},
	resetMacAddressRequest() {
		macAddressRequest.isOpen = false;
		macAddressRequest.isWrongKey = false;
		macAddressRequest.deviceMac = null;
		macAddressRequest.defaultMac = null;
		macAddressRequest.resolve = null;
	},
	get macAddressRequest() {
		return macAddressRequest;
	},
	handleCubeCallback(newFacelet: string, prevMoves: string[]) {
		facelet = newFacelet;
		if (prevMoves.length > 0) {
			lastMove = prevMoves[0];
			moveCounter++;
			history.push({ move: lastMove, counter: moveCounter });
			// keep history small
			if (history.length > 50) {
				history.shift();
			}

			// Dispatch move to highest-priority subscriber only
			if (moveSubscribers.size > 0) {
				let highestPriority = -Infinity;
				let activeSubscriber: MoveSubscriber | null = null;

				for (const subscriber of moveSubscribers.values()) {
					if (subscriber.priority > highestPriority) {
						highestPriority = subscriber.priority;
						activeSubscriber = subscriber;
					}
				}

				if (activeSubscriber) {
					activeSubscriber.callback(lastMove);
				}
			}
		}
	},
	getMovesSince(lastCounter: number) {
		return history.filter((h) => h.counter > lastCounter);
	},
	// Connection process state
	get isConnecting() {
		return isConnecting;
	},
	setIsConnecting(connecting: boolean) {
		isConnecting = connecting;
	},
	// Move subscription methods
	subscribeToMoves(id: string, callback: (move: string) => void, priority: number) {
		moveSubscribers.set(id, { callback, priority });
	},
	unsubscribeFromMoves(id: string) {
		moveSubscribers.delete(id);
	},

	// ── Gyro ──────────────────────────────────────────────────────────────────
	get gyroEnabled() {
		return gyroEnabled;
	},
	get gyroQuat() {
		return gyroQuat;
	},
	get gyroTopFaceYellow() {
		return gyroTopFaceYellow;
	},
	toggleGyroTopFace() {
		gyroTopFaceYellow = !gyroTopFaceYellow;
	},
	toggleGyro() {
		gyroEnabled = !gyroEnabled;
		if (gyroEnabled) {
			_gyroCalibrated = false;
			gyroQuat = null;
			gyroQuatRef.current = null;
			_lastQw = 1; _lastQx = 0; _lastQy = 0; _lastQz = 0;
		}
	},
	// Non-reactive ref for rAF loop (Cubedex pattern)
	get gyroQuatRef() {
		return gyroQuatRef;
	},
	/**
	 * Called by the GAN cube driver with raw quaternion data.
	 * Converts to camera longitude/latitude using relative Euler decomposition.
	 * @param qw,qx,qy,qz — unit quaternion from the cube IMU (each in [-1, 1])
	 */
	recalibrateGyro() {
		// User holds cube white-up, green-front, then presses this.
		// Next arriving gyro packet becomes the new reference orientation.
		_gyroCalibrated = false;
		gyroQuat = null;
		gyroQuatRef.current = null;
		// Reset sign-flip tracking so the first post-recalibration packet isn't
		// compared against stale pre-recalibration values.
		_lastQw = 1; _lastQx = 0; _lastQy = 0; _lastQz = 0;
		console.log(`[gyro] recalibration requested — hold ${gyroTopFaceYellow ? 'yellow' : 'white'} up / green front`);
	},
	/**
	 * Called by the GAN driver with already axis-remapped quaternion data.
	 * (Caller maps GAN(x,y,z) → THREE(x,z,-y) before calling here.)
	 *
	 * Matches Cubedex's approach:
	 *   displayQuat = HOME_ORIENTATION * conjugate(ref) * raw
	 *
	 * The TwistyPlayer rAF loop reads gyroQuat and applies it to the Three.js
	 * puzzle object with slerp(0.25) — no lat/lon involved.
	 */
	handleGyroCallback(qw: number, qx: number, qy: number, qz: number) {
		if (!gyroEnabled) return;

		// ── 1. Normalize ────────────────────────────────────────────────────
		const mag = Math.sqrt(qw*qw + qx*qx + qy*qy + qz*qz);
		if (mag < 0.1) return; // drop garbage / all-zero packets
		let nw = qw/mag, nx = qx/mag, ny = qy/mag, nz = qz/mag;

		// ── 2. Fix sign-flip (double-cover) ──────────────────────────────────
		// q and -q represent the same rotation; alternating causes 180° jumps.
		const dot = nw*_lastQw + nx*_lastQx + ny*_lastQy + nz*_lastQz;
		if (dot < 0) { nw = -nw; nx = -nx; ny = -ny; nz = -nz; }
		_lastQw = nw; _lastQx = nx; _lastQy = ny; _lastQz = nz;

		// ── 3. Capture reference on first packet after enable / recalibrate ──
		if (!_gyroCalibrated) {
			_refQw = nw; _refQx = nx; _refQy = ny; _refQz = nz;
			_gyroCalibrated = true;
			console.log('[gyro] calibrated — ref quat:', { nw, nx, ny, nz });
			return;
		}

		// ── 4. display = conjugate(ref) * current ────────────────────────────
		// Body-frame relative rotation (cubedex formula): extracts the rotation
		// from the calibration pose. Works correctly because GAN axes are now
		// remapped to Three.js space before arriving here.
		const rw = _refQw, rx = _refQx, ry = _refQy, rz = _refQz;
		const dw =  rw*nw + rx*nx + ry*ny + rz*nz;
		const dx =  rw*nx - rx*nw - ry*nz + rz*ny;
		const dy =  rw*ny + rx*nz - ry*nw - rz*nx;
		const dz =  rw*nz - rx*ny + ry*nx - rz*nw;

		const next = { x: dx, y: dy, z: dz, w: dw };
		// Update non-reactive ref first (read by rAF loop at full rate)
		gyroQuatRef.current = next;
		// Update reactive state (for UI bindings, throttled implicitly by Svelte batching)
		gyroQuat = next;

		// ── DEBUG (throttled) — remove once gyro is confirmed working ─────────
		const _now = Date.now();
		if (_now - _gyroDebugLastLog > 500) {
			_gyroDebugLastLog = _now;
			console.log('[gyro] raw(w,x,y,z):', qw.toFixed(3), qx.toFixed(3), qy.toFixed(3), qz.toFixed(3),
				'| norm:', nw.toFixed(3), nx.toFixed(3), ny.toFixed(3), nz.toFixed(3),
				'| disp:', dw.toFixed(3), dx.toFixed(3), dy.toFixed(3), dz.toFixed(3));
		}
	},
};

