import type { MiniHead } from "../../core/shared";

/**
 * Render a minimal head fragment for HTMX responses.
 *
 * @param head
 */
export function renderHtmxHead(head?: MiniHead): string {
  const tags: string[] = [];

  if (head?.title) {
    tags.push(`<title>${head.title}</title>`);
  }
  if (head?.description) {
    tags.push(`<meta name="description" content="${head.description}">`);
  }
  if (head?.canonical) {
    tags.push(`<link rel="canonical" href="${head.canonical}">`);
  }
  if (head?.robots) {
    tags.push(`<meta name="robots" content="${head.robots}">`);
  }

  return tags.join("\n");
}
