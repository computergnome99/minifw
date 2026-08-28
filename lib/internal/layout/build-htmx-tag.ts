import type { MiniHtmxConfig } from "../../core/layout";

/** Build the final HTMX `<script>` tag for the selected loading strategy. */
export async function buildHtmxTag(
  htmx: MiniHtmxConfig | undefined,
): Promise<string> {
  if (!htmx)
    return `<script
      src="https://unpkg.com/htmx.org@latest/dist/htmx.min.js"
      crossorigin="anonymous"
    ></script>`;
  if (htmx.type === "cdn") {
    return `<script src="https://unpkg.com/htmx.org@${htmx.version}/dist/htmx.min.js" crossorigin="anonymous"></script>`;
  }
  return `<script>${await htmx.loadFn()}</script>`;
}
