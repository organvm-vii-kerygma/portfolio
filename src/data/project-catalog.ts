export type OrganKey =
	| 'ORGAN-I'
	| 'ORGAN-II'
	| 'ORGAN-III'
	| 'ORGAN-IV'
	| 'ORGAN-V'
	| 'ORGAN-VI'
	| 'ORGAN-VII'
	| 'META-ORGANVM';

export interface ProjectCatalogEntry {
	slug: string;
	title: string;
	organ: OrganKey;
	tags: string[];
	summary: string;
	route: string;
	audienceRelevance: Array<'client' | 'recruiter'>;
	sourceRepoName?: string;
	publishedAt?: string;
	evidenceReference?: string;
}

const projectCatalogEntries: Array<
	Omit<ProjectCatalogEntry, 'route' | 'audienceRelevance'> &
		Partial<Pick<ProjectCatalogEntry, 'audienceRelevance'>>
> = [
	{
		slug: 'limen',
		title: 'Limen',
		organ: 'META-ORGANVM',
		tags: ['Systems', 'Governance', 'Multi-agent'],
		summary:
			'A governed production system that turns multi-agent work into bounded, verifiable delivery with explicit authority and handoff.',
		sourceRepoName: 'limen',
		evidenceReference: 'https://github.com/organvm/limen',
	},
	{
		slug: 'narratological-lenses',
		title: 'Narratological Algorithmic Lenses',
		organ: 'ORGAN-I',
		tags: ['Theory', 'Narrative'],
		summary: 'Computational narrative analysis and executable literary theory.',
	},
	{
		slug: 'knowledge-base',
		title: 'My Knowledge Base',
		organ: 'ORGAN-I',
		tags: ['Theory', 'Knowledge'],
		summary: 'Durable AI-assisted personal knowledge infrastructure.',
	},
	{
		slug: 'org-architecture',
		title: 'Org Architecture & Community Health',
		organ: 'ORGAN-I',
		tags: ['Systems', 'Community'],
		summary: 'Organization-wide governance, CI/CD, and shared repository standards.',
	},
	{
		slug: 'linguistic-atomization',
		title: 'LingFrame — Linguistic Atomization Framework',
		organ: 'ORGAN-I',
		tags: ['Theory', 'Language'],
		summary: 'Hierarchical text decomposition and rhetorical analysis.',
	},
	{
		slug: 'recursive-engine',
		title: 'Recursive Engine (RE:GE)',
		organ: 'ORGAN-I',
		tags: ['Theory', 'Python', 'DSL'],
		summary: 'Symbolic operating system for recursive myth and narrative structures.',
		sourceRepoName: 'recursive-engine--generative-entity',
	},
	{
		slug: 'metasystem-master',
		title: 'Omni-Dromenon Engine (Metasystem Master)',
		organ: 'ORGAN-II',
		tags: ['Art', 'TypeScript', 'Python', 'Architecture'],
		summary: 'Real-time audience-participatory performance system.',
		sourceRepoName: 'metasystem-master',
	},
	{
		slug: 'ai-council',
		title: 'AI Council Coliseum',
		organ: 'ORGAN-II',
		tags: ['Art', 'AI'],
		summary: 'Multi-agent deliberation and audience-guided governance.',
	},
	{
		slug: 'generative-music',
		title: 'Generative Music System',
		organ: 'ORGAN-II',
		tags: ['Art', 'Audio', 'Performance'],
		summary: 'Symbolic-to-sonic pipeline for live generative composition.',
	},
	{
		slug: 'life-my-midst-in',
		title: 'in-midst-my-life',
		organ: 'ORGAN-III',
		tags: ['Commerce', 'Product'],
		summary: 'Inverted-interview product system for role-specific identity presentation.',
		sourceRepoName: 'life-my--midst--in',
	},
	{
		slug: 'block-warfare',
		title: 'TurfSynth AR (My Block Warfare)',
		organ: 'ORGAN-III',
		tags: ['Commerce', 'Game'],
		summary: 'Location-aware AR gameplay generated from neighborhood topology.',
	},
	{
		slug: 'your-fit-tailored',
		title: 'Your Fit Tailored',
		organ: 'ORGAN-III',
		tags: ['Commerce', 'Product'],
		summary: 'Specification-driven circular apparel subscription product concept.',
	},
	{
		slug: 'the-actual-news',
		title: 'The Actual News',
		organ: 'ORGAN-III',
		tags: ['Commerce', 'Media'],
		summary: 'Claim-verifiable media architecture and publication workflow.',
	},
	{
		slug: 'aetheria-rpg',
		title: 'Aetheria Classroom RPG',
		organ: 'ORGAN-III',
		tags: ['Product', 'Education', 'Game Design'],
		summary: 'Gamified educational platform spanning theory, art, and productization.',
		sourceRepoName: 'classroom-rpg-aetheria',
	},
	{
		slug: 'agentic-titan',
		title: 'Agentic Titan',
		organ: 'ORGAN-IV',
		tags: ['Orchestration', 'AI', 'Python'],
		summary: 'Production-grade multi-agent orchestration with safety and topology controls.',
		sourceRepoName: 'agentic-titan',
	},
	{
		slug: 'orchestration-hub',
		title: 'Orchestration Hub',
		organ: 'ORGAN-IV',
		tags: ['Governance', 'Python', 'Systems'],
		summary: 'Registry-driven coordination layer across multi-org repositories.',
		sourceRepoName: 'orchestration-start-here',
	},
	{
		slug: 'public-process',
		title: 'Public Process',
		organ: 'ORGAN-V',
		tags: ['Essays', 'Transparency'],
		summary: 'Long-form architectural writing and methodology in public.',
		sourceRepoName: 'public-process',
	},
	{
		slug: 'ai-conductor',
		title: 'AI-Conductor Model',
		organ: 'ORGAN-V',
		tags: ['AI', 'Process', 'Methodology'],
		summary: 'Human-AI co-creation operating model and editorial governance.',
	},
	{
		slug: 'community-infrastructure',
		title: 'Community Infrastructure',
		organ: 'ORGAN-VI',
		tags: ['Community', 'Education'],
		summary: 'Structured collaborative programming for reading groups and salons.',
	},
	{
		slug: 'distribution-strategy',
		title: 'Distribution Strategy',
		organ: 'ORGAN-VII',
		tags: ['Marketing', 'Distribution'],
		summary: 'POSSE-first multi-channel distribution and audience strategy.',
	},
	{
		slug: 'public-record-data-scrapper',
		title: 'Public Record Data Scraper',
		organ: 'ORGAN-III',
		tags: ['Commerce', 'Python', 'AWS', 'Terraform'],
		summary: '50-state UCC public records aggregation platform with automated collection agents.',
	},
	{
		slug: 'collective-persona-operations',
		title: 'Collective Persona Operations',
		organ: 'ORGAN-I',
		tags: ['Theory', 'AI', 'Identity'],
		summary: 'Framework for managing multi-agent identity state-shifts and role-playing.',
	},
	{
		slug: 'a-mavs-olevm',
		title: 'A-Mavs-Olevm',
		organ: 'ORGAN-II',
		tags: ['Art', 'Vanilla JS', 'Performance'],
		summary: 'The "Living Pantheon" flagship artistic ecosystem and website.',
	},
	{
		slug: 'eight-organ-system',
		title: 'The Eight-Organ System',
		organ: 'META-ORGANVM',
		tags: ['Systems', 'Governance', 'Architecture'],
		summary: 'Meta-governance architecture spanning eight organs and shared infrastructure.',
	},
];

export const projectCatalog: ProjectCatalogEntry[] = projectCatalogEntries.map((project) => ({
	...project,
	route: `/projects/${project.slug}/`,
	audienceRelevance: project.audienceRelevance ?? ['client', 'recruiter'],
}));

export const projectCatalogBySlug = new Map(
	projectCatalog.map((project) => [project.slug, project]),
);
