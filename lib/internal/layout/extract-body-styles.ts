import { parseHTML } from "linkedom";
import { html } from "../../helpers";
import { STYLE_ID_ATTR, STYLE_ID_SELECTOR } from "../encapsulate-styles";

/**
 * Extract route-scoped style tags from body content and return deduped tags.
 *
 * @param content
 */
export function extractBodyStyles(content: string): {
  content: string;
  styles: string[];
} {
  const { document } = parseHTML(
    html`<!doctype html>
      <html>
        <head></head>
        <body>
          <div id="__minifw_style_extract_root__">${content}</div>
        </body>
      </html>`,
  );
  const root = document.querySelector("#__minifw_style_extract_root__");

  if (!root) {
    return { content, styles: [] };
  }

  const styleNodes = root.querySelectorAll(STYLE_ID_SELECTOR);

  const seen = new Set<string>();
  const styles: string[] = [];

  for (const styleNode of styleNodes) {
    const styleId = styleNode.getAttribute(STYLE_ID_ATTR);
    if (!styleId) {
      styleNode.remove();
      continue;
    }

    if (!seen.has(styleId)) {
      seen.add(styleId);
      styles.push(styleNode.outerHTML);
    }

    styleNode.remove();
  }

  return {
    content: root.innerHTML,
    styles,
  };
}
