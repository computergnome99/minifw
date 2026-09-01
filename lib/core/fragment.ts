import type { MaybePromise } from "bun";
import type { MiniPartial } from "./partial";
import type { MiniPage } from "./page";

/**
 * Represents a fragment that can be rendered to a string. Fragments do not have
 * server context and cannot be served. To serve a fragment, wrap it in
 * {@link MiniPartial} or {@link MiniPage}.
 */
export type MiniFragment<Properties extends object | undefined = undefined> = (
  ...arguments_: Properties extends object ? [Properties] : []
) => MaybePromise<string>;

/**
 * Create a new {@link MiniFragment} instance.
 *
 * @example
 *   const example = fragment(() => "Hello World!");
 *
 * @example
 *   const example = fragment(() => html`<h1>Hello World!</h1>`);
 *
 * @example
 *   const example = fragment<{ name: string }>(
 *     ({ name }) => `Hello ${name}!`,
 *   );
 *
 * @param render The render function for the fragment.
 * @returns A new {@link MiniFragment} instance.
 */
export function fragment(render: () => MaybePromise<string>): MiniFragment;
export function fragment<Properties extends object>(
  render: (properties: Properties) => MaybePromise<string>,
): MiniFragment<Properties>;
export function fragment<Properties extends object>(
  render:
    | ((properties: Properties) => MaybePromise<string>)
    | (() => MaybePromise<string>),
): MiniFragment<Properties> {
  return render as MiniFragment<Properties>;
}
