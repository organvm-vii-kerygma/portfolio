import { siteConfig } from '../../site.config.mjs';

/**
 * Schema.org Person structured data for the site owner.
 * Consumed by SchemaOrg.astro to generate JSON-LD on every page.
 */
export const schemaPerson = {
	'@type': 'Person' as const,
	name: siteConfig.identity.name,
	jobTitle: siteConfig.identity.role,
	address: {
		'@type': 'PostalAddress' as const,
		addressLocality: 'New York City',
		addressRegion: 'NY',
		addressCountry: 'US',
	},
	sameAs: [
		siteConfig.profiles.linkedin,
		siteConfig.profiles.github,
		'https://github.com/meta-organvm',
		'https://github.com/organvm-i-theoria',
		'https://github.com/organvm-ii-poiesis',
		'https://github.com/organvm-iii-ergon',
		'https://github.com/organvm-iv-taxis',
		'https://github.com/organvm-v-logos',
		'https://github.com/organvm-vi-koinonia',
		'https://github.com/organvm-vii-kerygma',
	],
	alumniOf: [
		{
			'@type': 'CollegeOrUniversity' as const,
			name: 'Florida Atlantic University',
			url: 'https://www.fau.edu',
		},
		{
			'@type': 'CollegeOrUniversity' as const,
			name: 'CUNY College of Staten Island',
			url: 'https://www.csi.cuny.edu',
		},
	],
	knowsAbout: [
		'Python',
		'TypeScript',
		'JavaScript',
		'Go',
		'Rust',
		'systems architecture',
		'generative art',
		'multi-agent AI systems',
		'LLM orchestration',
		'governance design',
		'digital marketing',
		'creative technology',
		'audio synthesis',
		'interactive installations',
	],
	hasCredential: [
		{
			'@type': 'EducationalOccupationalCredential' as const,
			credentialCategory: 'professional certification',
			name: 'Full-Stack Developer',
			recognizedBy: { '@type': 'Organization' as const, name: 'Meta' },
		},
		{
			'@type': 'EducationalOccupationalCredential' as const,
			credentialCategory: 'professional certification',
			name: 'UX Design',
			recognizedBy: { '@type': 'Organization' as const, name: 'Google' },
		},
		{
			'@type': 'EducationalOccupationalCredential' as const,
			credentialCategory: 'professional certification',
			name: 'Digital Marketing & E-commerce',
			recognizedBy: { '@type': 'Organization' as const, name: 'Google' },
		},
		{
			'@type': 'EducationalOccupationalCredential' as const,
			credentialCategory: 'professional certification',
			name: 'Project Management',
			recognizedBy: { '@type': 'Organization' as const, name: 'Google' },
		},
	],
	memberOf: {
		'@type': 'Organization' as const,
		name: 'meta-organvm',
		url: 'https://github.com/meta-organvm',
	},
};
