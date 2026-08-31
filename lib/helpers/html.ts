/**
 * Tagged template literal for HTML strings. Returns the raw string without any
 * escaping, providing syntax highlighting support in editors that recognize the
 * `html` tag.
 *
 * @example
 *   const markup = html`<h1>Hello World!</h1>`;
 *
 * @example
 *   const markup = html`<p>Count: ${count}</p>`;
 *
 * @param strings The template string array.
 * @param values Interpolated values.
 * @returns The raw HTML string.
 */
export const html = (
  strings: TemplateStringsArray,
  ...values: unknown[]
): string => String.raw(strings, ...values);
