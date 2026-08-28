const bundle = await Bun.build({
  entrypoints: [import.meta.dir + "/styles.ts"],
  minify: true,
  sourcemap: "none",
  target: "browser",
});

/** Bundled client runtime that promotes HTMX-swapped scoped styles to `<head>`. */
export const runtime = (await bundle.outputs[0]?.text()) ?? "";
