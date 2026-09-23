import rehypeParse from 'rehype-parse';
import { unified } from 'unified';

const parser = unified().use(rehypeParse);

/**
 * Collect actual href/src attributes without executing scripts. HTML-looking
 * JavaScript strings, comments, CSS and escaped examples are not DOM links.
 * Uses the HTML parser already declared in the repository dependencies.
 */
export function collectHtmlLinks(html) {
	const links = [];
	const visit = (node) => {
		if (node.type === 'element') {
			for (const name of ['href', 'src']) {
				const value = node.properties?.[name];
				if (typeof value === 'string') links.push(value);
			}
		}
		for (const child of node.children ?? []) visit(child);
	};
	visit(parser.parse(html));
	return links;
}
