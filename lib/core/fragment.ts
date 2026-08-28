import type { MaybePromise } from "bun";
import type { MiniPartial } from "./partial";
import type { MiniPage } from "./page";

/**
 * Represents a fragment that can be rendered to a string. Fragments are do not
 * have server context and cannot be served. To serve a fragment, wrap it in
 * {@link MiniPartial} or {@link MiniPage}.
 */
export type MiniFragment<Props extends object | undefined = undefined> = (
  props?: Props,
) => MaybePromise<string>;

/**
 * Create a new {@link MiniFragment} instance.
 *
 * @example
 *   const example = fragment(() => "Hello World!");
 *
 * @example
 *   const example = fragment<{ name: string }>(
 *     ({ name }) => `Hello ${name}!`,
 *   );
 *
 * @example
 *   const example = fragment(() => html`<h1>Hello World!</h1>`);
 *
 * @param render The render function for the fragment.
 * @returns A new {@link MiniFragment} instance.
 */
export function fragment<Props extends object | undefined>(
  render: (props?: Props) => MaybePromise<string>,
): MiniFragment<Props> {
  return render;
}
