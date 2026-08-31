import { mkdir } from "node:fs/promises";

/** Write a Bun WebView screenshot to the ignored e2e test-results directory. */
export async function captureScreenshot(
  view: Bun.WebView,
  example: string,
  viewName: string,
): Promise<void> {
  const directory = new URL(`../test-results/${example}/`, import.meta.url);

  await mkdir(directory, { recursive: true });
  await Bun.write(
    new URL(`${viewName}.png`, directory),
    await view.screenshot(),
  );
}
