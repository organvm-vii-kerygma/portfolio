export type LiteraryEvent = {
	id: string;
	eventType: 'literature' | 'film';
	title: string;
	start: string;
	end?: string;
	format: 'in-person' | 'hybrid' | 'online';
	venue: string;
	neighborhood: string;
	city: string;
	address?: string;
	price: 'free' | 'paid' | 'mixed';
	priceLabel: string;
	availability: 'open' | 'limited' | 'sold-out' | 'livestream-only';
	registrationUrl: string;
	tags: string[];
	whyItMatters: string;
	communityUse: string;
	sourceName: string;
	sourceUrl: string;
	verifiedAt: string;
	featured?: boolean;
};

export const literaryEvents: LiteraryEvent[] = [
	{
		id: 'three-colors-blue-leonard-2026',
		eventType: 'film',
		title: 'East Williamsburg Cinema Club: Three Colors: Blue',
		start: '2026-09-17T17:30:00-04:00',
		end: '2026-09-17T19:30:00-04:00',
		format: 'in-person',
		venue: 'Brooklyn Public Library — Leonard Library',
		neighborhood: 'East Williamsburg',
		city: 'Brooklyn',
		address: '81 Devoe Street, Brooklyn, NY 11211',
		price: 'free',
		priceLabel: 'Free; first come, first served',
		availability: 'open',
		registrationUrl:
			'https://www.bklynlibrary.org/calendar/east-williamsburg-cinema-leonard-auditorium-20260917-0530pm',
		tags: ['film', 'international cinema', 'psychological drama', 'discussion'],
		whyItMatters:
			'Krzysztof Kieślowski’s formally precise study of grief, freedom, music, and visual meaning is followed by a community film discussion.',
		communityUse:
			'A zero-cost entry point for filmmakers, writers, visual artists, students, and neighbors interested in close reading across image, sound, and narrative.',
		sourceName: 'Brooklyn Public Library',
		sourceUrl:
			'https://www.bklynlibrary.org/calendar/east-williamsburg-cinema-leonard-auditorium-20260917-0530pm',
		verifiedAt: '2026-09-17',
		featured: true,
	},
	{
		id: 'new-directions-90',
		eventType: 'literature',
		title: 'Celebrating 90 Years of New Directions',
		start: '2026-09-17T19:00:00-04:00',
		format: 'hybrid',
		venue: 'The Center for Fiction',
		neighborhood: 'Downtown Brooklyn',
		city: 'Brooklyn',
		address: '15 Lafayette Avenue, Brooklyn, NY',
		price: 'paid',
		priceLabel: 'Livestream available; in-person sold out',
		availability: 'livestream-only',
		registrationUrl: 'https://centerforfiction.org/event/celebrating-90-years-of-new-directions/',
		tags: ['publishing', 'translation', 'poetry', 'avant-garde'],
		whyItMatters:
			'A rare survey of an independent press that changed American modernism, with writers and translators working across poetry, fiction, and criticism.',
		communityUse:
			'Useful for editors, translators, small-press readers, and anyone studying how literary institutions sustain an identity across generations.',
		sourceName: 'The Center for Fiction',
		sourceUrl: 'https://centerforfiction.org/event/celebrating-90-years-of-new-directions/',
		verifiedAt: '2026-09-16',
	},
	{
		id: 'american-reading-crisis',
		eventType: 'literature',
		title: 'The Atlantic Festival: The American Reading Crisis',
		start: '2026-09-19T19:00:00-04:00',
		end: '2026-09-19T20:15:00-04:00',
		format: 'in-person',
		venue: 'Brooklyn Public Library — Central Library',
		neighborhood: 'Prospect Heights',
		city: 'Brooklyn',
		address: '10 Grand Army Plaza, Brooklyn, NY',
		price: 'free',
		priceLabel: 'Free with registration',
		availability: 'open',
		registrationUrl: 'https://www.bklynlibrary.org/',
		tags: ['public culture', 'education', 'fiction', 'attention'],
		whyItMatters:
			'A public conversation about sustained attention, intellectual curiosity, and shared literary culture, followed by novelist Tayari Jones.',
		communityUse:
			'Relevant to teachers, librarians, reading-group organizers, and people designing public-literacy programs.',
		sourceName: 'Brooklyn Public Library',
		sourceUrl: 'https://www.bklynlibrary.org/',
		verifiedAt: '2026-09-16',
		featured: true,
	},
	{
		id: 'spiegelman-no-towers',
		eventType: 'literature',
		title: 'Art Spiegelman Discusses In the Shadow of No Towers',
		start: '2026-09-22T19:00:00-04:00',
		end: '2026-09-22T20:30:00-04:00',
		format: 'in-person',
		venue: 'Brooklyn Public Library — Central Library',
		neighborhood: 'Prospect Heights',
		city: 'Brooklyn',
		address: '10 Grand Army Plaza, Brooklyn, NY',
		price: 'free',
		priceLabel: 'Free with registration',
		availability: 'open',
		registrationUrl: 'https://www.bklynlibrary.org/node/828089/register',
		tags: ['comics', 'visual narrative', 'politics', 'memoir'],
		whyItMatters:
			'A major artist examining how graphic narrative can hold memory, civic trauma, satire, and formal experimentation at once.',
		communityUse:
			'Especially useful for visual storytellers, nonfiction writers, artists working across image and text, and post-9/11 cultural historians.',
		sourceName: 'Brooklyn Public Library',
		sourceUrl: 'https://www.bklynlibrary.org/node/828089/register',
		verifiedAt: '2026-09-16',
		featured: true,
	},
	{
		id: 'day-of-translation-2026',
		eventType: 'literature',
		title: '2026 Day of Translation',
		start: '2026-09-24T13:30:00-04:00',
		end: '2026-09-24T18:15:00-04:00',
		format: 'hybrid',
		venue: 'The Center for Fiction',
		neighborhood: 'Downtown Brooklyn',
		city: 'Brooklyn',
		address: '15 Lafayette Avenue, Brooklyn, NY',
		price: 'free',
		priceLabel: 'Free; registration required',
		availability: 'open',
		registrationUrl: 'https://centerforfiction.org/event/2026-day-of-translation/',
		tags: ['translation', 'international literature', 'craft', 'language'],
		whyItMatters:
			'An afternoon devoted to language, cultural transmission, and the practical and philosophical work of literary translation.',
		communityUse:
			'A concentrated resource for translators, multilingual writers, teachers, editors, and readers seeking literature beyond the Anglosphere.',
		sourceName: 'The Center for Fiction',
		sourceUrl: 'https://centerforfiction.org/event/2026-day-of-translation/',
		verifiedAt: '2026-09-16',
		featured: true,
	},
	{
		id: 'wave-books-spotlight',
		eventType: 'literature',
		title: 'Indie Press Spotlight: New Poetry from Wave Books',
		start: '2026-09-25T19:00:00-04:00',
		format: 'hybrid',
		venue: 'Books Are Magic — Brooklyn Heights',
		neighborhood: 'Brooklyn Heights',
		city: 'Brooklyn',
		price: 'paid',
		priceLabel: '$10–$22; in-person and virtual',
		availability: 'open',
		registrationUrl:
			'https://brooklynbookfestival.org/event/in-store-indie-press-spotlight-new-poetry-from-wave-books-in-person-virtual/',
		tags: ['poetry', 'independent publishing', 'craft'],
		whyItMatters:
			'Joshua Beckman, Dorothea Lasky, and Edwin Torres offer a close view of contemporary poetry and the editorial culture around an independent press.',
		communityUse:
			'A strong gathering for poets, small-press readers, editors, and writers learning how independent literary ecosystems operate.',
		sourceName: 'Brooklyn Book Festival',
		sourceUrl:
			'https://brooklynbookfestival.org/event/in-store-indie-press-spotlight-new-poetry-from-wave-books-in-person-virtual/',
		verifiedAt: '2026-09-16',
	},
	{
		id: 'brooklyn-indie-party-2026',
		eventType: 'literature',
		title: '16th Annual Brooklyn Indie Party',
		start: '2026-09-25T19:30:00-04:00',
		format: 'in-person',
		venue: 'Greenlight Bookstore',
		neighborhood: 'Fort Greene',
		city: 'Brooklyn',
		price: 'free',
		priceLabel: 'Free with registration',
		availability: 'open',
		registrationUrl:
			'https://brooklynbookfestival.org/event/16th-annual-brooklyn-indie-party-in-person/',
		tags: ['networking', 'independent publishing', 'literary magazines'],
		whyItMatters:
			'Independent publishers, literary magazines, authors, and editors gather in one room during Brooklyn Book Festival week.',
		communityUse:
			'The most practical match for writers seeking collaborators, editors, publishing knowledge, or a clearer view of the local literary economy.',
		sourceName: 'Brooklyn Book Festival',
		sourceUrl: 'https://brooklynbookfestival.org/event/16th-annual-brooklyn-indie-party-in-person/',
		verifiedAt: '2026-09-16',
	},
	{
		id: 'between-page-stage',
		eventType: 'literature',
		title: 'Between the Page & Stage: Youth Open Mic and Author Reading',
		start: '2026-09-26T15:00:00-04:00',
		end: '2026-09-26T18:00:00-04:00',
		format: 'in-person',
		venue: 'Staten Island Urban Center',
		neighborhood: 'Tompkinsville',
		city: 'Staten Island',
		address: '208 Bay Street, Staten Island, NY',
		price: 'free',
		priceLabel: 'Free with registration',
		availability: 'open',
		registrationUrl:
			'https://brooklynbookfestival.org/event/between-the-page-stage-staten-island-youth-open-mic-author-reading-in-person/',
		tags: ['open mic', 'youth', 'urban fantasy', 'local'],
		whyItMatters:
			'A Staten Island literary gathering connecting youth performance, an author reading, and local cultural infrastructure.',
		communityUse:
			'The open mic is for ages 12–24; the reading and conversation are useful to educators, mentors, families, and the broader borough writing community.',
		sourceName: 'Brooklyn Book Festival',
		sourceUrl:
			'https://brooklynbookfestival.org/event/between-the-page-stage-staten-island-youth-open-mic-author-reading-in-person/',
		verifiedAt: '2026-09-16',
		featured: true,
	},
	{
		id: 'brooklyn-book-festival-2026',
		eventType: 'literature',
		title: 'Brooklyn Book Festival: Festival Day',
		start: '2026-09-27T10:00:00-04:00',
		end: '2026-09-27T18:00:00-04:00',
		format: 'in-person',
		venue: 'Brooklyn Borough Hall and nearby venues',
		neighborhood: 'Downtown Brooklyn',
		city: 'Brooklyn',
		price: 'free',
		priceLabel: 'Free; individual programs may fill',
		availability: 'open',
		registrationUrl: 'https://brooklynbookfestival.org/event_type/festival-day/',
		tags: ['festival', 'fiction', 'poetry', 'translation', 'publishing'],
		whyItMatters:
			'A full day of writers, publishers, translators, booksellers, and readers, with enough simultaneous programming to support several distinct paths through the festival.',
		communityUse:
			'The broadest free entry point into the region’s literary ecosystem and a practical place to discover presses, journals, authors, and future collaborators.',
		sourceName: 'Brooklyn Book Festival',
		sourceUrl: 'https://brooklynbookfestival.org/event_type/festival-day/',
		verifiedAt: '2026-09-16',
		featured: true,
	},
	{
		id: 'dodge-poetry-festival-2026',
		eventType: 'literature',
		title: 'Dodge Poetry Festival',
		start: '2026-10-15T09:00:00-04:00',
		end: '2026-10-17T23:00:00-04:00',
		format: 'in-person',
		venue: 'NJPAC and downtown Newark venues',
		neighborhood: 'Downtown Newark',
		city: 'Newark',
		price: 'mixed',
		priceLabel: 'Paid passes; selected free programs',
		availability: 'open',
		registrationUrl: 'https://www.njpac.org/series/dodge-poetry-festival/',
		tags: ['poetry', 'performance', 'craft', 'translation', 'festival'],
		whyItMatters:
			'Three days of readings, performances, craft sessions, translation, poetic ancestry, speculative futures, and literary-career conversations.',
		communityUse:
			'A regional anchor for poets at every career stage; useful as both an artistic immersion and a map of contemporary poetry communities.',
		sourceName: 'NJPAC',
		sourceUrl: 'https://www.njpac.org/series/dodge-poetry-festival/',
		verifiedAt: '2026-09-16',
		featured: true,
	},
];

export const literaryGuideUpdatedAt = '2026-09-17';

export const literaryGuideCoverage = [
	'Staten Island',
	'Brooklyn',
	'Manhattan',
	'Jersey City',
	'Newark',
];
