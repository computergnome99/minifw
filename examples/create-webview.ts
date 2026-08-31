export const createWebView = (): Bun.WebView => {
  const isCi = Boolean(process.env["CI"]);

  return new Bun.WebView({
    backend: {
      type: "chrome",
      url: false,
      ...(isCi && {
        argv: ["--no-sandbox", "--disable-dev-shm-usage"],
        stderr: "inherit",
      }),
    },
  });
};
