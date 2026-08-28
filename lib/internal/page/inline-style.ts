import { scopeId, STYLE_ID_ATTR } from "../encapsulate-styles";

/**
 * Append a scoped `<style>` tag to rendered page markup when route + CSS exist.
 *
 * @param markup
 * @param style
 * @param route
 */
export function inlineStyle(
  markup: string,
  style: string | undefined,
  route: string | undefined,
): string {
  if (!route || !style || style.trim().length === 0) return markup;

  return `${markup}\n<style ${STYLE_ID_ATTR}="${scopeId(route)}">${style}</style>`;
}
