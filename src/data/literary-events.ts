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
		id: 'cora-lewis-information-age-2026',
		eventType: 'literature',
		title: "Cora Lewis' Information Age with Hannah Kingsley-Ma",
		start: '2026-09-24T18:00:00-04:00',
		end: '2026-09-24T19:15:00-04:00',
		format: 'in-person',
		venue: 'Brooklyn Public Library — Sunset Park Library',
		neighborhood: 'Sunset Park',
		city: 'Brooklyn',
		address: '5108 Fourth Avenue, Brooklyn, NY 11220',
		price: 'free',
		priceLabel: 'Free; registration encouraged but not required',
		availability: 'open',
		registrationUrl:
			'https://www.bklynlibrary.org/calendar/author-talk-cora-lewis-sunset-park-multipurpose-20260924-0600pm',
		tags: ['fiction', 'technology', 'media', 'craft', 'author conversation'],
		whyItMatters:
			'A novella about technology journalism, compressed news cycles, and blurred public-private life becomes a craft conversation between two Brooklyn writers working across fiction, reporting, and audio.',
		communityUse:
			'A free neighborhood program for fiction writers, journalists, media workers, teachers, and readers interested in how contemporary systems reshape voice, attention, and narrative form.',
		sourceName: 'Brooklyn Public Library',
		sourceUrl:
			'https://www.bklynlibrary.org/calendar/author-talk-cora-lewis-sunset-park-multipurpose-20260924-0600pm',
		verifiedAt: '2026-09-18',
		featured: true,
	},
	{
		id: 'bpl-book-prize-shortlist-2026',
		eventType: 'literature',
		title: '2026 Brooklyn Public Library Book Prize Shortlist Readings',
		start: '2026-09-25T19:00:00-04:00',
		end: '2026-09-25T20:30:00-04:00',
		format: 'in-person',
		venue: 'Brooklyn Public Library — Central Library',
		neighborhood: 'Prospect Heights',
		city: 'Brooklyn',
		address: '10 Grand Army Plaza, Brooklyn, NY 11238',
		price: 'free',
		priceLabel: 'Free with registration',
		availability: 'open',
		registrationUrl:
			'https://www.bklynlibrary.org/calendar/2026-brooklyn-public-central-library-dweck-20260925-0700pm',
		tags: ['fiction', 'nonfiction', 'reading', 'publishing', 'Brooklyn Book Festival'],
		whyItMatters:
			'Six shortlisted fiction and nonfiction writers read and discuss work spanning experimental debut novels, memoir, translation, politics, and Brooklyn history with a librarian prize judge.',
		communityUse:
			'A free survey of current literary work for readers, teachers, editors, book clubs, and writers who want to compare how a public-library prize frames artistic merit and civic relevance.',
		sourceName: 'Brooklyn Public Library',
		sourceUrl:
			'https://www.bklynlibrary.org/calendar/2026-brooklyn-public-central-library-dweck-20260925-0700pm',
		verifiedAt: '2026-09-18',
		featured: true,
	},
	{
		id: 'hello-darknuss-greg-tate-2026',
		eventType: 'literature',
		title: 'Hello Darknuss: Reflections on the Intergalactic Greg Tate',
		start: '2026-09-28T19:00:00-04:00',
		end: '2026-09-28T21:00:00-04:00',
		format: 'in-person',
		venue: 'Brooklyn Public Library — Central Library',
		neighborhood: 'Prospect Heights',
		city: 'Brooklyn',
		address: '10 Grand Army Plaza, Brooklyn, NY 11238',
		price: 'free',
		priceLabel: 'Free with registration',
		availability: 'open',
		registrationUrl:
			'https://www.bklynlibrary.org/calendar/hello-darknuss-central-library-dweck-20260928-0700pm',
		tags: ['cultural criticism', 'film', 'music', 'performance', 'media', 'Black arts'],
		whyItMatters:
			'Arthur Jafa, Questlove, dream hampton, Jelani Cobb, and Daphne A. Brooks examine Greg Tate’s criticism and cross-media legacy alongside a Burnt Sugar performance.',
		communityUse:
			'A rare free forum for writers, filmmakers, musicians, critics, scholars, and interdisciplinary artists studying how criticism, archives, performance, and cultural memory reinforce one another.',
		sourceName: 'Brooklyn Public Library',
		sourceUrl:
			'https://www.bklynlibrary.org/calendar/hello-darknuss-central-library-dweck-20260928-0700pm',
		verifiedAt: '2026-09-18',
		featured: true,
	},
	{
		id: 'abbrd-coming-of-age-2026',
		eventType: 'film',
		title: "Abbr'd: A Short Film Showcase",
		start: '2026-09-22T18:00:00-04:00',
		end: '2026-09-22T20:00:00-04:00',
		format: 'in-person',
		venue: 'Brooklyn Public Library — Library for Arts & Culture',
		neighborhood: 'Brooklyn Cultural District',
		city: 'Brooklyn',
		address: '10 Lafayette Avenue, Second Floor, Brooklyn, NY 11217',
		price: 'free',
		priceLabel: 'Free; RSVP requested',
		availability: 'open',
		registrationUrl:
			'https://www.eventbrite.com/e/abbrd-a-short-film-showcase-tickets-1998695788908',
		tags: ['film', 'short films', 'coming of age', 'filmmaker Q&A', 'networking'],
		whyItMatters:
			'A curated short-film program pairs three coming-of-age works with a live filmmaker conversation, making the screening as useful for studying process as finished form.',
		communityUse:
			'A free meeting point for emerging filmmakers, writers, performers, students, and neighbors seeking collaborators, audience feedback, or a view into local production practice.',
		sourceName: 'Brooklyn Public Library',
		sourceUrl:
			'https://www.bklynlibrary.org/calendar/abbrd-short-film-showcase-library-for-arts-culture-20260922-0600pm',
		verifiedAt: '2026-09-17',
		featured: true,
	},
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
		priceLabel: 'Free; no registration listed',
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
		id: 'woman-under-influence-leonard-2026',
		eventType: 'film',
		title: 'East Williamsburg Cinema Club: A Woman Under the Influence',
		start: '2026-09-26T14:00:00-04:00',
		end: '2026-09-26T16:30:00-04:00',
		format: 'in-person',
		venue: 'Brooklyn Public Library — Leonard Library',
		neighborhood: 'East Williamsburg',
		city: 'Brooklyn',
		address: '81 Devoe Street, Brooklyn, NY 11211',
		price: 'free',
		priceLabel: 'Free; no registration listed',
		availability: 'open',
		registrationUrl:
			'https://www.bklynlibrary.org/calendar/east-williamsburg-cinema-leonard-auditorium-20260926-0200pm',
		tags: ['film', 'independent cinema', 'performance', 'psychological drama', 'discussion'],
		whyItMatters:
			'John Cassavetes’s performance-driven domestic drama is a landmark of independent American cinema, followed by a community discussion at Leonard Library.',
		communityUse:
			'A free close-reading space for filmmakers, actors, writers, teachers, and viewers interested in performance, improvisation, domestic realism, and directing actors.',
		sourceName: 'Brooklyn Public Library',
		sourceUrl:
			'https://www.bklynlibrary.org/calendar/east-williamsburg-cinema-leonard-auditorium-20260926-0200pm',
		verifiedAt: '2026-09-23',
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
		priceLabel: 'Free; registration at capacity',
		availability: 'sold-out',
		registrationUrl: 'https://www.bklynlibrary.org/node/839042/register',
		tags: ['public culture', 'education', 'fiction', 'attention'],
		whyItMatters:
			'A public conversation about sustained attention, intellectual curiosity, and shared literary culture, followed by novelist Tayari Jones.',
		communityUse:
			'Relevant to teachers, librarians, reading-group organizers, and people designing public-literacy programs.',
		sourceName: 'Brooklyn Public Library',
		sourceUrl: 'https://www.bklynlibrary.org/node/839042/register',
		verifiedAt: '2026-09-19',
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
		priceLabel: 'Free; registration at capacity',
		availability: 'sold-out',
		registrationUrl: 'https://www.bklynlibrary.org/node/828089/register',
		tags: ['comics', 'visual narrative', 'politics', 'memoir'],
		whyItMatters:
			'A major artist examining how graphic narrative can hold memory, civic trauma, satire, and formal experimentation at once.',
		communityUse:
			'Especially useful for visual storytellers, nonfiction writers, artists working across image and text, and post-9/11 cultural historians.',
		sourceName: 'Brooklyn Public Library',
		sourceUrl: 'https://www.bklynlibrary.org/node/828089/register',
		verifiedAt: '2026-09-19',
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

export const literaryGuideUpdatedAt = '2026-09-23';

export const literaryGuideCoverage = [
	'Staten Island',
	'Brooklyn',
	'Manhattan',
	'Jersey City',
	'Newark',
];
