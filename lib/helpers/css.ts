/**
 * Tagged template literal for CSS strings. Returns the raw string without any
 * escaping, providing syntax highlighting support in editors that recognize the
 * `css` tag.
 *
 * @example
 *   const styles = css`
 *     h1 {
 *       color: red;
 *     }
 *   `;
 *
 * @example
 *   const styles = css`
 *     p {
 *       margin: ${margin}px;
 *     }
 *   `;
 *
 * @param strings The template string array.
 * @param values Interpolated values.
 * @returns The raw CSS string.
 */
export const css = (strings: TemplateStringsArray, ...values: unknown[]) =>
  String.raw(strings, ...values);
