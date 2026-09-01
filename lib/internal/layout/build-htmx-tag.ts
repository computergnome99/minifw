import type { MiniHtmxConfig } from "../../core/config";

/**
 * Build the final HTMX `<script>` tag for the selected loading strategy.
 *
 * @param htmx
 */
export async function buildHtmxTag(
  htmx: MiniHtmxConfig | undefined,
): Promise<string> {
  if (!htmx) {
    return `<script
      src="https://unpkg.com/htmx.org@4.0.0/dist/htmx.min.js"
      crossorigin="anonymous"
    ></script>`;
  }
  if (htmx.type === "cdn") {
    return `<script src="https://unpkg.com/htmx.org@${htmx.version}/dist/htmx.min.js" crossorigin="anonymous"></script>`;
  }
  return `<script>${await htmx.loadFn()}</script>`;
}
