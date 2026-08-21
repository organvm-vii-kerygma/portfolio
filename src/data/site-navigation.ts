import { siteConfig } from '../../site.config.mjs';
import { personas } from './personas.json';
import { projectCatalog } from './project-catalog';

export interface SiteNavigationItem {
	label: string;
	href?: string;
	external?: boolean;
	meta?: string;
	children?: SiteNavigationItem[];
	layout?: 'list' | 'grid';
}

export interface SiteNavigationGroup {
	label: string;
	items: SiteNavigationItem[];
}

const internalHref = (base: string, path: string) =>
	`${base.replace(/\/?$/, '/')}${path.replace(/^\//, '')}`;

export function buildSiteNavigation(base: string): SiteNavigationGroup[] {
	const organOrder = [
		'META-ORGANVM',
		'ORGAN-I',
		'ORGAN-II',
		'ORGAN-III',
		'ORGAN-IV',
		'ORGAN-V',
		'ORGAN-VI',
		'ORGAN-VII',
	];
	const projects: SiteNavigationItem[] = [
		{ label: 'All projects', href: internalHref(base, 'projects/'), meta: '24 case studies' },
		...[...projectCatalog]
			.sort(
				(a, b) =>
					organOrder.indexOf(a.organ) - organOrder.indexOf(b.organ) ||
					a.title.localeCompare(b.title),
			)
			.map((project) => ({
				label: project.title,
				href: internalHref(base, project.route),
				meta: project.organ,
			})),
	];

	const resumes: SiteNavigationItem[] = [
		{ label: 'Résumé overview', href: internalHref(base, 'resume/'), meta: 'Choose a role view' },
		...personas.map((persona) => ({
			label: persona.title,
			href: internalHref(base, `resume/${persona.slug}/`),
			meta: 'Role-fit résumé',
		})),
		{
			label: 'Visionary Polymath',
			href: internalHref(base, 'resume/polymath/'),
			meta: 'Complete view',
		},
	];

	return [
		{
			label: 'Work',
			items: [
				{ label: 'Projects', children: projects, layout: 'grid' },
				{ label: 'Résumés', children: resumes },
				{ label: 'Products', href: internalHref(base, 'products/') },
				{ label: 'Dashboard', href: internalHref(base, 'dashboard/') },
				{ label: 'Roadmap', href: internalHref(base, 'roadmap/') },
				{ label: 'Testimonials', href: internalHref(base, 'testimonials/') },
			],
		},
		{
			label: 'Explore',
			items: [
				{
					label: 'Writing',
					children: [
						{ label: 'Essays', href: internalHref(base, 'essays/'), meta: 'Long-form analyses' },
						{ label: 'Logos', href: internalHref(base, 'logos/'), meta: 'Architecture and theory' },
						{
							label: 'Pathos',
							href: internalHref(base, 'pathos/'),
							meta: 'Working-session artifacts',
						},
					],
				},
				{ label: 'Gallery', href: internalHref(base, 'gallery/') },
				{ label: 'Directory', href: internalHref(base, 'directory/') },
				{ label: 'Philosophy', href: internalHref(base, 'philosophy/') },
				{ label: 'Architecture', href: internalHref(base, 'architecture/') },
				{ label: 'Impact', href: internalHref(base, 'impact/') },
				{ label: 'Validation', href: internalHref(base, 'validation/') },
				{ label: 'Omega', href: internalHref(base, 'omega/') },
				{ label: 'GitHub Pages', href: internalHref(base, 'github-pages/') },
			],
		},
		{
			label: 'About',
			items: [
				{ label: 'About', href: internalHref(base, 'about/') },
				{ label: 'Community', href: internalHref(base, 'community/') },
				{ label: 'Consult', href: internalHref(base, 'consult/') },
				{ label: 'Press', href: internalHref(base, 'press/') },
			],
		},
		{
			label: 'Docs',
			items: [
				{
					label: 'Operative Handbook',
					href: `${siteConfig.repositories.portfolio}/blob/main/docs/the-operative-handbook.md`,
					external: true,
				},
				{
					label: 'Evaluation to Growth',
					href: `${siteConfig.repositories.portfolio}/blob/main/docs/evaluation-to-growth-report-v2.md`,
					external: true,
				},
				{
					label: 'Social Launch Kit',
					href: `${siteConfig.repositories.portfolio}/blob/main/docs/social-launch-kit.md`,
					external: true,
				},
			],
		},
		{
			label: 'Connect',
			items: [
				{ label: 'Contact', href: `mailto:${siteConfig.contact.email}` },
				{ label: 'LinkedIn', href: siteConfig.profiles.linkedin, external: true },
				{ label: 'GitHub', href: siteConfig.profiles.github, external: true },
				{
					label: 'Intelligence',
					href: 'https://stakeholder-portal-ten.vercel.app/?prism=portfolio.nav',
					external: true,
				},
			],
		},
	];
}

export function flattenSiteNavigation(groups: SiteNavigationGroup[]): SiteNavigationItem[] {
	return groups.flatMap((group) => group.items.flatMap((item) => [item, ...(item.children ?? [])]));
}
