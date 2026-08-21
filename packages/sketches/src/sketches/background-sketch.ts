import type p5 from 'p5';

const COLS = 36;
const ROWS = 24;
const NOISE_SCALE = 0.12;
const TIME_SCALE = 0.003;
const HUE_DRIFT = 0.1; // degrees per frame at 24fps — full cycle ≈ 2.5 min

/** Convert HSL (h: 0–360, s/l: 0–1) to RGB (0–255 each) */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;

	let r = 0,
		g = 0,
		b = 0;
	if (h < 60) {
		r = c;
		g = x;
	} else if (h < 120) {
		r = x;
		g = c;
	} else if (h < 180) {
		g = c;
		b = x;
	} else if (h < 240) {
		g = x;
		b = c;
	} else if (h < 300) {
		r = x;
		b = c;
	} else {
		r = c;
		b = x;
	}

	return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

export default function backgroundSketch(p: p5, container: HTMLElement) {
	// Random starting hues — different every refresh
	let currentHue1 = Math.random() * 360;
	let color1 = hslToRgb(currentHue1, 0.8, 0.5);
	let color2 = hslToRgb((currentHue1 + 180) % 360, 0.8, 0.5);

	p.setup = () => {
		p.createCanvas(
			container.offsetWidth || p.windowWidth,
			container.offsetHeight || p.windowHeight,
		);
		p.pixelDensity(1);
		p.noSmooth();
		p.noStroke();
		p.frameRate(24);
		p.noiseSeed(Math.floor(Math.random() * 99999));
	};

	p.draw = () => {
		const cellW = p.width / COLS;
		const cellH = p.height / ROWS;
		const midX = Math.floor(COLS / 2);
		const midY = Math.floor(ROWS / 2);

		for (let y = 0; y < ROWS; y++) {
			for (let x = 0; x < COLS; x++) {
				const n = p.noise(x * NOISE_SCALE, y * NOISE_SCALE, p.frameCount * TIME_SCALE);

				// Blend between the two complementary colors
				const r = color1[0] + (color2[0] - color1[0]) * n;
				const g = color1[1] + (color2[1] - color1[1]) * n;
				const b = color1[2] + (color2[2] - color1[2]) * n;

				// Dim to 65–85% to keep colors rich, never white
				const dim = 0.65 + n * 0.2;

				p.fill(r * dim, g * dim, b * dim);
				p.rect(x * cellW, y * cellH, Math.ceil(cellW), Math.ceil(cellH));

				// Expose center cell color for spectrum-reactive header
				if (x === midX && y === midY) {
					document.documentElement.style.setProperty(
						'--spectrum-current',
						`${Math.round(r * dim)}, ${Math.round(g * dim)}, ${Math.round(b * dim)}`,
					);
				}
			}
		}

		const rootStyle = document.documentElement.style;
		rootStyle.setProperty(
			'--spectrum-primary',
			`${Math.round(color1[0])}, ${Math.round(color1[1])}, ${Math.round(color1[2])}`,
		);
		rootStyle.setProperty(
			'--spectrum-complement',
			`${Math.round(color2[0])}, ${Math.round(color2[1])}, ${Math.round(color2[2])}`,
		);

		// Slowly drift hues each frame
		currentHue1 = (currentHue1 + HUE_DRIFT) % 360;
		color1 = hslToRgb(currentHue1, 0.8, 0.5);
		color2 = hslToRgb((currentHue1 + 180) % 360, 0.8, 0.5);
	};

	p.windowResized = () => {
		p.resizeCanvas(
			container.offsetWidth || p.windowWidth,
			container.offsetHeight || p.windowHeight,
		);
	};
}
