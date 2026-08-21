/** @typedef {{ origin: string, basePath: string, identity: { name: string, role: string, headline: string }, contact: { email: string }, profiles: { linkedin: string, github: string }, repositories: { portfolio: string, laurea: string, limen: string } }} SiteConfig */

/** @type {SiteConfig} */
export const siteConfig = Object.freeze({
	origin: 'https://organvm-vii-kerygma.github.io',
	basePath: '/portfolio/',
	identity: Object.freeze({
		name: 'Anthony James Padavano',
		role: 'Production-systems architect',
		headline: 'I build production systems that solve expensive problems.',
	}),
	contact: Object.freeze({ email: 'padavano.anthony@gmail.com' }),
	profiles: Object.freeze({
		linkedin: 'https://www.linkedin.com/in/anthony-james-padavano-98a40a186/',
		github: 'https://github.com/4444J99',
	}),
	repositories: Object.freeze({
		portfolio: 'https://github.com/organvm-vii-kerygma/portfolio',
		laurea: 'https://github.com/organvm/laurea',
		limen: 'https://github.com/organvm/limen',
	}),
});

export const canonicalBase = new URL(siteConfig.basePath, siteConfig.origin).href;

export function siteUrl(path = '') {
	return new URL(path.replace(/^\//, ''), canonicalBase).href;
}
