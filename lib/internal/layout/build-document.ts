import type { MaybePromise } from "bun";
import type { LayoutOptions, LayoutRenderArgs } from "../../core/layout";
import { runtime } from "../../runtime/runtime";
import { html } from "../../helpers";
import { buildBodyAttrs } from "./build-body-attrs";
import { buildHtmxTag } from "./build-htmx-tag";
import { extractBodyStyles } from "./extract-body-styles";

/** Build a complete HTML document string from layout inputs. */
export async function buildDocument(
  args: LayoutRenderArgs,
  bodyFn: (args: LayoutRenderArgs) => MaybePromise<string>,
  headFn: ((args: LayoutRenderArgs) => MaybePromise<string>) | undefined,
  options: LayoutOptions | undefined,
): Promise<string> {
  const { head, globalStylesCss, globalScripts } = args;

  const bodyContent = await bodyFn(args);
  const extraHead = headFn ? await headFn(args) : "";
  const extracted = extractBodyStyles(bodyContent);

  const headTags: string[] = ['<meta charset="utf-8">'];

  headTags.push(`<title>${head?.title ?? ""}</title>`);

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

  const bodyAttrs = buildBodyAttrs(options?.bodyArgs);

  return html`
    <!DOCTYPE html>
    <html>
      <head>
        ${headTags.map((t) => `\t${t}`).join("\n")}
      </head>

      <body${bodyAttrs} hx-boost="true">
        ${extracted.content}
      </body>
    </html>
  `;
}
