import type { MiniConfig } from "../../core/config";
import type { MiniContext, MiniHead } from "../../core/shared";
import { html } from "../../helpers";
import { buildBodyAttributes } from "./build-body-attributes";
import { buildHtmxTag } from "./build-htmx-tag";
import { extractBodyStyles } from "./extract-body-styles";

/** Build a complete HTML document string from MiniFW configuration. */
export async function buildDocument(
  arguments_: {
    context: MiniContext;
    page: string;
    head?: MiniHead;
    globalScripts?: string;
    globalStylesCss?: string;
  },
  config: MiniConfig | undefined,
): Promise<string> {
  const { context, globalScripts, globalStylesCss, head, page } = arguments_;
  const extracted = extractBodyStyles(page);
  const extraHead = config?.document?.head
    ? await config.document.head({ context, head })
    : "";

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

  if (config?.runtime !== false) {
    const { runtime } = await import("../../runtime/runtime");
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

  if (config?.htmx !== false) {
    const htmxTag = await buildHtmxTag(
      config?.htmx ?? { type: "cdn", version: "4.0.0" },
    );
    headTags.push(htmxTag);
  }
  if (extraHead) headTags.push(extraHead);

  const htmlAttributes = buildBodyAttributes(config?.document?.htmlAttributes);
  const bodyAttributes = buildBodyAttributes(config?.document?.bodyAttributes);
  const htmxAttributes =
    config?.htmx === false ? "" : ' hx-boost="true" hx-boost:inherited="true"';

  return html`
    <!DOCTYPE html>
    <html${htmlAttributes}>
      <head>
        ${headTags.map((t) => `\t${t}`).join("\n")}
      </head>

      <body${bodyAttributes}${htmxAttributes}>
        ${extracted.content}
      </body>
    </html>
  `;
}
