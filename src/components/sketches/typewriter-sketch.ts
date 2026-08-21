import type p5 from 'p5';
import { getTextColor } from './palette';

export default function typewriterSketch(p: p5, container: HTMLElement) {
	const lines = [
		'The system is the medium.',
		'Building in public means building in truth.',
		'Every README is a portfolio piece.',
		'Governance as artistic practice.',
		'Documentation precedes deployment.',
		'Theory feeds art feeds commerce.',
	];

	let currentLine = 0;
	let charIndex = 0;
	let displayLines: { text: string; alpha: number; y: number }[] = [];
	let cursorBlink = 0;
	let typeTimer = 0;
	const isMobile = () => container.clientWidth < 768;

	p.setup = () => {
		p.createCanvas(container.clientWidth, container.clientHeight);
		p.frameRate(30);
		if (document.documentElement.dataset.ambientMotion === 'paused') {
			charIndex = lines[currentLine].length;
		}
	};

	p.draw = () => {
		p.clear();
		const textRGB = getTextColor();
		const lineHeight = isMobile() ? 22 : 28;
		const startY = 30;
		const maxVisibleLines = Math.floor((p.height - 60) / lineHeight);

		// Type next character
		typeTimer++;
		if (typeTimer > 3) {
			typeTimer = 0;
			if (charIndex < lines[currentLine].length) {
				charIndex++;
			} else {
				// Line complete — pause then advance
				typeTimer = -30; // pause frames
				if (typeTimer >= -1) {
					displayLines.push({
						text: lines[currentLine],
						alpha: 180,
						y: 0,
					});
					currentLine = (currentLine + 1) % lines.length;
					charIndex = 0;
				}
			}
		}

		// Check if line just completed
		if (charIndex >= lines[currentLine].length && typeTimer === -29) {
			displayLines.push({
				text: lines[currentLine],
				alpha: 180,
				y: 0,
			});
			currentLine = (currentLine + 1) % lines.length;
			charIndex = 0;
		}

		// Draw completed lines
		displayLines.forEach((line, i) => {
			line.alpha = Math.max(line.alpha - 0.3, 40);
			const y = startY + i * lineHeight;

			if (y > p.height - 40) {
				line.alpha = 0; // off screen
				return;
			}

			p.fill(...textRGB, line.alpha);
			p.noStroke();
			p.textFont('JetBrains Mono, monospace');
			p.textSize(isMobile() ? 11 : 14);
			p.textAlign(p.LEFT, p.TOP);
			p.text(line.text, 20, y);
		});

		// Trim old lines
		displayLines = displayLines.filter((l) => l.alpha > 1);
		if (displayLines.length > maxVisibleLines) {
			displayLines = displayLines.slice(-maxVisibleLines);
		}

		// Draw current typing line
		const typingY = startY + displayLines.length * lineHeight;
		const typingText = lines[currentLine].substring(0, charIndex);

		p.fill(...textRGB, 200);
		p.noStroke();
		p.textFont('JetBrains Mono, monospace');
		p.textSize(isMobile() ? 11 : 14);
		p.textAlign(p.LEFT, p.TOP);
		p.text(typingText, 20, typingY);

		// Blinking cursor
		cursorBlink += 0.08;
		const cursorAlpha = Math.sin(cursorBlink) > 0 ? 200 : 0;
		const textW = p.textWidth(typingText);
		p.fill(...textRGB, cursorAlpha);
		p.rect(22 + textW, typingY, 2, isMobile() ? 14 : 18);
	};

	p.windowResized = () => {
		p.resizeCanvas(container.clientWidth, container.clientHeight);
	};
}
