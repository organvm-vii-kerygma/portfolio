import type p5 from 'p5';
import { getTextColor, PALETTE } from './palette';

interface Stage {
	label: string;
	x: number;
	y: number;
	w: number;
	h: number;
}

interface FlowParticle {
	x: number;
	y: number;
	stage: number;
	progress: number;
	speed: number;
	alive: boolean;
}

export default function flowDiagramSketch(p: p5, container: HTMLElement) {
	let stages: Stage[] = [];
	let particles: FlowParticle[] = [];
	let hoveredStage = -1;
	let spawnTimer = 0;
	const isMobile = () => container.clientWidth < 768;

	function parseData() {
		const stageData = container.dataset.stages;
		const labels = stageData
			? stageData.split(',').map((s) => s.trim())
			: ['Input', 'Process', 'Validate', 'Output'];

		const stageW = isMobile() ? 60 : 90;
		const stageH = isMobile() ? 28 : 36;
		const totalWidth = labels.length * stageW + (labels.length - 1) * (isMobile() ? 20 : 40);
		const startX = (p.width - totalWidth) / 2;
		const centerY = p.height / 2;

		stages = labels.map((label, i) => ({
			label,
			x: startX + i * (stageW + (isMobile() ? 20 : 40)),
			y: centerY - stageH / 2,
			w: stageW,
			h: stageH,
		}));
	}

	p.setup = () => {
		p.createCanvas(container.clientWidth, container.clientHeight);
		p.frameRate(30);
		parseData();
		if (document.documentElement.dataset.ambientMotion === 'paused' && stages.length > 1) {
			particles.push({
				x: stages[0].x + stages[0].w,
				y: stages[0].y + stages[0].h / 2,
				stage: 0,
				progress: 0.35,
				speed: 0,
				alive: true,
			});
		}
	};

	p.draw = () => {
		p.clear();
		if (stages.length === 0) return;

		// Detect hover
		hoveredStage = -1;
		for (let i = 0; i < stages.length; i++) {
			const s = stages[i];
			if (p.mouseX > s.x && p.mouseX < s.x + s.w && p.mouseY > s.y && p.mouseY < s.y + s.h) {
				hoveredStage = i;
				break;
			}
		}

		// Draw connectors
		for (let i = 0; i < stages.length - 1; i++) {
			const a = stages[i];
			const b = stages[i + 1];
			const x1 = a.x + a.w;
			const x2 = b.x;
			const cy = a.y + a.h / 2;
			const isNear = hoveredStage === i || hoveredStage === i + 1;

			p.stroke(...PALETTE.border, isNear ? 120 : 50);
			p.strokeWeight(1);
			p.line(x1, cy, x2, cy);

			// Arrow
			p.fill(...PALETTE.border, isNear ? 120 : 50);
			p.noStroke();
			p.triangle(x2, cy, x2 - 6, cy - 3, x2 - 6, cy + 3);
		}

		// Draw stages
		stages.forEach((stage, i) => {
			const isHovered = hoveredStage === i;

			p.fill(...PALETTE.card);
			p.stroke(...(isHovered ? PALETTE.accent : PALETTE.border), isHovered ? 180 : 60);
			p.strokeWeight(isHovered ? 1.5 : 1);
			p.rect(stage.x, stage.y, stage.w, stage.h, 4);

			// Label
			p.noStroke();
			p.fill(...getTextColor(), isHovered ? 240 : 160);
			p.textFont('JetBrains Mono, monospace');
			p.textSize(isMobile() ? 8 : 10);
			p.textAlign(p.CENTER, p.CENTER);
			p.text(stage.label, stage.x + stage.w / 2, stage.y + stage.h / 2);

			// Stage number
			p.fill(...PALETTE.accent, isHovered ? 180 : 60);
			p.textSize(isMobile() ? 7 : 8);
			p.text(`${i + 1}`, stage.x + stage.w / 2, stage.y - 10);
		});

		// Spawn particles
		spawnTimer++;
		if (spawnTimer > (isMobile() ? 30 : 18) && stages.length > 1) {
			spawnTimer = 0;
			particles.push({
				x: stages[0].x - 10,
				y: stages[0].y + stages[0].h / 2,
				stage: 0,
				progress: 0,
				speed: 0.01 + Math.random() * 0.01,
				alive: true,
			});
		}

		// Update and draw particles
		particles = particles.filter((pt) => pt.alive);
		if (particles.length > 40) particles = particles.slice(-40);

		particles.forEach((pt) => {
			pt.progress += pt.speed;

			if (pt.progress >= 1 && pt.stage < stages.length - 1) {
				pt.stage++;
				pt.progress = 0;
			} else if (pt.progress >= 1 && pt.stage === stages.length - 1) {
				pt.alive = false;
				return;
			}

			// Interpolate position
			const from = stages[pt.stage];
			const to = stages[Math.min(pt.stage + 1, stages.length - 1)];
			const fx = from.x + from.w;
			const tx = to.x;
			const cy = from.y + from.h / 2;

			if (pt.stage < stages.length - 1) {
				pt.x = p.lerp(fx, tx, pt.progress);
			} else {
				pt.x = from.x + from.w + pt.progress * 30;
			}
			pt.y = cy + Math.sin(p.frameCount * 0.1 + pt.x * 0.05) * 2;

			p.noStroke();
			p.fill(...PALETTE.accent, 140);
			p.circle(pt.x, pt.y, 4);
		});
	};

	p.windowResized = () => {
		p.resizeCanvas(container.clientWidth, container.clientHeight);
		parseData();
		particles = [];
	};
}
