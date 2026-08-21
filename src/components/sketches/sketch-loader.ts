import type p5 from 'p5';

type SketchFn = (p: p5, container: HTMLElement) => void;
type SketchModule = { default: SketchFn };
type SketchModuleLoader = () => Promise<SketchModule>;

declare global {
	interface IdleDeadline {
		readonly didTimeout: boolean;
		timeRemaining(): number;
	}
	interface Window {
		requestIdleCallback(
			callback: (deadline: IdleDeadline) => void,
			options?: { timeout: number },
		): number;
		cancelIdleCallback(handle: number): void;
		__ambientMotionFallback?: { preference: 'system' | 'running' | 'paused' };
	}
}

const sketchModules = {
	// Existing (10)
	hero: () => import('./hero-sketch'),
	'organ-system': () => import('./organ-system-sketch'),
	'recursive-tree': () => import('./recursive-tree-sketch'),
	counterpoint: () => import('./counterpoint-sketch'),
	pipeline: () => import('./pipeline-sketch'),
	'token-stream': () => import('./token-stream-sketch'),
	'network-graph': () => import('./network-graph-sketch'),
	'flow-diagram': () => import('./flow-diagram-sketch'),
	'data-bars': () => import('./data-bars-sketch'),
	'particle-field': () => import('./particle-field-sketch'),
	// New (19)
	terrain: () => import('./terrain-sketch'),
	conductor: () => import('./conductor-sketch'),
	octagon: () => import('./octagon-sketch'),
	waveform: () => import('./waveform-sketch'),
	swarm: () => import('./swarm-sketch'),
	deliberation: () => import('./deliberation-sketch'),
	blocks: () => import('./blocks-sketch'),
	constellation: () => import('./constellation-sketch'),
	scatter: () => import('./scatter-sketch'),
	spiral: () => import('./spiral-sketch'),
	orbits: () => import('./orbits-sketch'),
	atoms: () => import('./atoms-sketch'),
	kaleidoscope: () => import('./kaleidoscope-sketch'),
	lenses: () => import('./lenses-sketch'),
	routing: () => import('./routing-sketch'),
	hierarchy: () => import('./hierarchy-sketch'),
	typewriter: () => import('./typewriter-sketch'),
	ticker: () => import('./ticker-sketch'),
	weave: () => import('./weave-sketch'),
	// Background (always-on)
	background: () => import('./background-sketch'),
} satisfies Record<string, SketchModuleLoader>;

export type SketchId = keyof typeof sketchModules;

const sketchModuleIds = new Set(Object.keys(sketchModules) as SketchId[]);

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
type AmbientMotionPreference = 'system' | 'running' | 'paused';
type AmbientMotionState = 'running' | 'paused';

function readAmbientPreference(): AmbientMotionPreference {
	let preference = window.__ambientMotionFallback?.preference;
	try {
		const value = window.localStorage.getItem('ambient-motion');
		if (value === 'system' || value === 'running' || value === 'paused') {
			preference = value;
			const fallback = window.__ambientMotionFallback ?? { preference: value };
			fallback.preference = value;
			window.__ambientMotionFallback = fallback;
		}
	} catch {}
	if (preference === 'system' || preference === 'running' || preference === 'paused') {
		return preference;
	}
	const applied = document.documentElement.dataset.ambientMotionPreference;
	return applied === 'running' || applied === 'paused' ? applied : 'system';
}

function resolveAmbientState(preference = readAmbientPreference()): AmbientMotionState {
	return preference === 'system' ? (motionQuery.matches ? 'paused' : 'running') : preference;
}

let ambientMotionState = resolveAmbientState();

function applyAmbientState(state: AmbientMotionState): void {
	ambientMotionState = state;
	for (const inst of instances.values()) {
		if (state === 'paused') inst.noLoop();
		else inst.loop();
	}
}

motionQuery.addEventListener('change', (event: MediaQueryListEvent): void => {
	if (readAmbientPreference() === 'system') applyAmbientState(event.matches ? 'paused' : 'running');
});

window.addEventListener('ambient-motion-change', (event): void => {
	const state = (event as CustomEvent<{ state?: AmbientMotionState }>).detail?.state;
	if (state === 'running' || state === 'paused') applyAmbientState(state);
});

// Defer background sketch boot on the heaviest interactive routes.
const BACKGROUND_DEFER_ROUTES: ReadonlySet<string> = new Set([
	`${import.meta.env.BASE_URL}architecture`,
	`${import.meta.env.BASE_URL}gallery`,
]);

// Track p5 instances for teardown (Map replaces former Set for VT readiness)
const instances = new Map<HTMLElement, p5>();
const initializing = new Set<HTMLElement>();
let lifecycleGeneration = 0;
let sketchObserver: IntersectionObserver | null = null;

// Concurrency throttle: max 4 simultaneous sketch initializations
const MAX_CONCURRENT = 4;
let activeInits = 0;
const initQueue: HTMLElement[] = [];

function isMobile(): boolean {
	return window.innerWidth < 768;
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null;
let resizeHandler: (() => void) | null = null;
let observedContainers: HTMLElement[] = [];

function normalizePath(pathname: string): string {
	if (pathname === '/') return '/';
	return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function shouldBootBackground(pathname = window.location.pathname): boolean {
	return !BACKGROUND_DEFER_ROUTES.has(normalizePath(pathname));
}

function isSketchId(sketchId: string | undefined): sketchId is SketchId {
	return typeof sketchId === 'string' && sketchModuleIds.has(sketchId as SketchId);
}

function applyResponsiveHeight(container: HTMLElement): void {
	const height = container.dataset.height || '500px';
	const mobileHeight = container.dataset.mobileHeight || '350px';
	container.style.height = isMobile() ? mobileHeight : height;
}

function showFallback(container: HTMLElement, sketchId: string): void {
	const fallback = container.querySelector('.sketch-noscript');
	if (fallback instanceof HTMLElement) {
		fallback.style.display = 'flex';
	} else {
		const el = document.createElement('div');
		el.style.cssText =
			'display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:0.8rem;opacity:0.6;';
		el.textContent = `[${sketchId}]`;
		container.appendChild(el);
	}
}

const PAUSED_REDRAW_EVENTS = [
	'mousePressed',
	'mouseReleased',
	'mouseClicked',
	'doubleClicked',
	'touchStarted',
	'touchMoved',
	'touchEnded',
] as const;

function prepareSketch(p: p5): void {
	for (const eventName of PAUSED_REDRAW_EVENTS) {
		const handler = Reflect.get(p, eventName);
		if (typeof handler !== 'function') continue;
		Reflect.set(p, eventName, (...args: unknown[]): unknown => {
			const result = Reflect.apply(handler, p, args);
			if (ambientMotionState === 'paused') p.redraw();
			return result;
		});
	}

	if (p.draw) {
		const originalDraw = p.draw.bind(p);
		p.draw = (): void => {
			originalDraw();
			if (ambientMotionState === 'paused') p.noLoop();
		};
	}
}

function processQueue(): void {
	while (activeInits < MAX_CONCURRENT && initQueue.length > 0) {
		const next = initQueue.shift();
		if (!next) return;
		doInitSketch(next);
	}
}

function initSketch(container: HTMLElement): void {
	if (instances.has(container) || initializing.has(container)) return;

	if (activeInits >= MAX_CONCURRENT) {
		if (!initQueue.includes(container)) initQueue.push(container);
		return;
	}

	doInitSketch(container);
}

function doInitSketch(container: HTMLElement): void {
	if (instances.has(container) || initializing.has(container)) return;
	activeInits++;

	const sketchId = container.dataset.sketch;

	if (!isSketchId(sketchId)) {
		console.error('[sketch] unknown sketch id:', sketchId);
		showFallback(container, sketchId || 'unknown');
		activeInits--;
		processQueue();
		return;
	}
	initializing.add(container);
	const generation = lifecycleGeneration;

	applyResponsiveHeight(container);

	const loader = sketchModules[sketchId];

	Promise.all([import('p5'), loader()])
		.then(([p5Module, sketchModule]): void => {
			if (generation !== lifecycleGeneration || !container.isConnected) return;
			const P5 = p5Module.default;
			const sketchFn = sketchModule.default;

			try {
				const instance = new P5((p: p5): void => {
					sketchFn(p, container);
					prepareSketch(p);
				}, container);
				instances.set(container, instance);
			} catch (err) {
				console.error('[sketch]', sketchId, 'p5 constructor error:', err);
				showFallback(container, sketchId);
			}
		})
		.catch((err: unknown): void => {
			console.error('[sketch]', sketchId, 'load error:', err);
			showFallback(container, sketchId);
		})
		.finally((): void => {
			initializing.delete(container);
			activeInits--;
			processQueue();
		});
}

function deferInit(container: HTMLElement): void {
	const rect = container.getBoundingClientRect();
	const aboveFold = rect.top < window.innerHeight;

	if (aboveFold && 'requestIdleCallback' in window) {
		window.requestIdleCallback((): void => initSketch(container), { timeout: 2000 });
	} else {
		initSketch(container);
	}
}

function observeSketches(): void {
	observedContainers = Array.from(
		document.querySelectorAll<HTMLElement>('.sketch-container[data-sketch]'),
	);
	const containers = observedContainers;

	if ('IntersectionObserver' in window) {
		sketchObserver = new IntersectionObserver(
			(entries: IntersectionObserverEntry[]): void => {
				for (const entry of entries) {
					if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) continue;
					deferInit(entry.target);
					sketchObserver?.unobserve(entry.target);
				}
			},
			{ rootMargin: '200px' },
		);
		containers.forEach((container) => sketchObserver?.observe(container));
	} else {
		containers.forEach(deferInit);
	}

	if (!resizeHandler) {
		resizeHandler = (): void => {
			if (resizeTimer) clearTimeout(resizeTimer);
			resizeTimer = setTimeout((): void => {
				observedContainers.forEach(applyResponsiveHeight);
			}, 100);
		};
		window.addEventListener('resize', resizeHandler);
	}
}

function initBackground(): void {
	const bg = document.getElementById('bg-canvas');
	if (!bg || instances.has(bg)) return;

	const loader = sketchModules['background'];
	if (!loader) return;

	Promise.all([import('p5'), loader()])
		.then(([p5Module, sketchModule]): void => {
			const P5 = p5Module.default;
			const sketchFn = sketchModule.default;

			try {
				const instance = new P5((p: p5): void => {
					sketchFn(p, bg);
					prepareSketch(p);
				}, bg);
				instances.set(bg, instance);
			} catch (err) {
				console.error('[bg-sketch] p5 constructor error:', err);
			}
		})
		.catch((err: unknown): void => {
			console.error('[bg-sketch] load error:', err);
		});
}

function scheduleBackgroundInit(): void {
	const startInit = (): void => {
		if ('requestIdleCallback' in window) {
			window.requestIdleCallback((): void => initBackground(), { timeout: 3000 });
		} else {
			setTimeout(initBackground, 100);
		}
	};

	if ('PerformanceObserver' in window) {
		const po = new PerformanceObserver((): void => {
			po.disconnect();
			startInit();
		});
		try {
			po.observe({ type: 'largest-contentful-paint', buffered: true });
		} catch {
			startInit();
		}
	} else {
		setTimeout(initBackground, 200);
	}
}

/** Remove all active p5 instances and reset state. */
export function teardown(): void {
	lifecycleGeneration++;
	if (resizeTimer) {
		clearTimeout(resizeTimer);
		resizeTimer = null;
	}
	if (resizeHandler) {
		window.removeEventListener('resize', resizeHandler);
		resizeHandler = null;
	}
	observedContainers = [];
	instances.forEach((instance) => {
		try {
			instance.remove();
		} catch {
			/* already removed */
		}
	});
	instances.clear();
	initializing.clear();
	initQueue.length = 0;
	activeInits = 0;
	if (sketchObserver) {
		sketchObserver.disconnect();
		sketchObserver = null;
	}
}

/** Tear down per-page sketches but preserve the #bg-canvas instance. */
export function teardownPage(): void {
	lifecycleGeneration++;
	if (resizeTimer) {
		clearTimeout(resizeTimer);
		resizeTimer = null;
	}
	if (resizeHandler) {
		window.removeEventListener('resize', resizeHandler);
		resizeHandler = null;
	}
	observedContainers = [];
	const bg = document.getElementById('bg-canvas');
	const bgInstance = bg ? instances.get(bg) : undefined;

	// Remove all non-background instances
	instances.forEach((instance, el) => {
		if (el !== bg) {
			try {
				instance.remove();
			} catch {
				/* already removed */
			}
		}
	});
	instances.clear();
	initializing.clear();

	// Preserve background instance
	if (bg && bgInstance) {
		instances.set(bg, bgInstance);
	}

	initQueue.length = 0;
	activeInits = 0;
	if (sketchObserver) {
		sketchObserver.disconnect();
		sketchObserver = null;
	}
}

/** Re-observe per-page sketch containers after a View Transition swap. */
export function reinitPage(): void {
	if (shouldBootBackground()) {
		scheduleBackgroundInit();
	}
	observeSketches();
}

/** Get the p5 instance for a sketch container. */
export function getSketchInstance(el: HTMLElement): p5 | undefined {
	return instances.get(el);
}

/** Pause (noLoop) a sketch in the given container. */
export function pauseSketch(el: HTMLElement): void {
	const inst = instances.get(el);
	if (inst) {
		inst.noLoop();
		el.setAttribute('data-paused', '');
	}
}

/** Resume (loop) a sketch in the given container. */
export function resumeSketch(el: HTMLElement): void {
	const inst = instances.get(el);
	if (inst) {
		inst.loop();
		el.removeAttribute('data-paused');
	}
}

/** Full init: background + per-page sketches. Called once on first load. */
export function initSketches(): void {
	if (shouldBootBackground()) {
		scheduleBackgroundInit();
	}
	observeSketches();
}
