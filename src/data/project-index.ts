import { projectCatalog } from './project-catalog';

/** Lightweight index derived from the canonical project catalog. */
export interface ProjectEntry {
	slug: string;
	title: string;
	tags: string[];
}

export const projectIndex: ProjectEntry[] = projectCatalog.map(({ slug, title, tags }) => ({
	slug,
	title,
	tags,
}));
