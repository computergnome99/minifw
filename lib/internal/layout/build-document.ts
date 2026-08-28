import type { MaybePromise } from "bun";
import type {
  LayoutOptions,
  LayoutRenderArgs as LayoutRenderArguments,
} from "../../core/layout";
import { runtime } from "../../runtime/runtime";
import { html } from "../../helpers";
import { buildBodyAttributes } from "./build-body-attributes";
import { buildHtmxTag } from "./build-htmx-tag";
import { extractBodyStyles } from "./extract-body-styles";

/**
 * Build a complete HTML document string from layout inputs.
 *
 * @param arguments_
 * @param bodyFunction
 * @param headFunction
 * @param options
 */
export async function buildDocument(
  arguments_: LayoutRenderArguments,
  bodyFunction: (arguments__: LayoutRenderArguments) => MaybePromise<string>,
  headFunction:
    | ((arguments__: LayoutRenderArguments) => MaybePromise<string>)
    | undefined,
  options: LayoutOptions | undefined,
): Promise<string> {
  const { head, globalStylesCss, globalScripts } = arguments_;

  const bodyContent = await bodyFunction(arguments_);
  const extraHead = headFunction ? await headFunction(arguments_) : "";
  const extracted = extractBodyStyles(bodyContent);

  const headTags: string[] = [
    '<meta charset="utf-8">',
    `<title>${head?.title ?? ""}</title>`,
  ];

  if (head?.description) {
    headTags.push(`<meta name="description" content="${head.description}">`);
  }
  if (head?.robots) {
    headTags.push(`<meta name="robots" content="${head.robots}">`);
  }
  if (head?.canonical) {
    headTags.push(`<link rel="canonical" href="${head.canonical}">`);
  }

  if (!options?.disableRuntime) {
    headTags.push(`<script>${runtime}</script>`);
  }

  if (globalStylesCss && globalStylesCss.trim().length > 0) {
    headTags.push(`<style>${globalStylesCss}</style>`);
  }

  if (globalScripts && globalScripts.trim().length > 0) {
    headTags.push(`<script>${globalScripts}</script>`);
  }

  if (extracted.styles.length > 0) {
    headTags.push(...extracted.styles);
  }

  const htmxTag = await buildHtmxTag(options?.htmx);
  if (htmxTag) headTags.push(htmxTag);
  if (extraHead) headTags.push(extraHead);

  const bodyAttributes = buildBodyAttributes(options?.bodyArguments);

  return html`
    <!DOCTYPE html>
    <html>
      <head>
        ${headTags.map((t) => `\t${t}`).join("\n")}
      </head>

      <body${bodyAttributes} hx-boost="true">
        ${extracted.content}
      </body>
    </html>
  `;
}
