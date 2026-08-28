/** Bundle and minify a script entrypoint using Bun.build. */
export async function buildScriptEntrypoint(
  entrypoint: string,
): Promise<string> {
  const bundleResult = await Bun.build({
    entrypoints: [entrypoint],
    minify: true,
    sourcemap: "none",
    target: "browser",
  });

  if (!bundleResult.success) {
    const firstError = bundleResult.logs[0];
    const detail = firstError?.message ?? "Failed to bundle scripts";
    throw new Error(detail);
  }

  const jsOutput = bundleResult.outputs.find((output) =>
    output.path.endsWith(".js"),
  );

  if (!jsOutput) {
    throw new Error("Failed to bundle scripts: no JavaScript output generated");
  }

  return await jsOutput.text();
}
