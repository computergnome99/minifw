/* eslint-disable unicorn/no-top-level-assignment-in-function */
import { afterAll, beforeAll, expect, test } from "bun:test";
import { captureScreenshot } from "../examples/capture-screenshot";
import { createWebView } from "../examples/create-webview";

let server: ReturnType<typeof Bun.spawn> | undefined;
const port = 3105;
const baseUrl = `http://127.0.0.1:${port}`;

beforeAll(async () => {
  server = Bun.spawn(["bun", "docs/index.ts"], {
    env: { ...process.env, DOCS_PORT: String(port) },
    stderr: "ignore",
    stdout: "ignore",
  });

  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await fetch(`${baseUrl}/docs`);
      return;
    } catch {
      await Bun.sleep(100);
    }
  }

  throw new Error("Documentation server did not start");
});

afterAll(async () => {
  server?.kill();
  await server?.exited;
});

test("serves route-specific sharing metadata", async () => {
  const response = await fetch(`${baseUrl}/docs/core/page`);
  const document = await response.text();

  expect(response.ok).toBe(true);
  expect(document).toContain("<title>MiniFW | page()</title>");
  expect(document).toContain(
    '<meta name="description" content="page() documentation for MiniFW.">',
  );
  expect(document).toContain(
    '<meta property="og:title" content="MiniFW | page()">',
  );
  expect(document).toContain(
    '<meta name="twitter:card" content="summary_large_image">',
  );
  expect(document).toContain(
    "https://minifw.calvinbonner.dev/assets/social.png?title=MiniFW%20%7C%20page()",
  );

  const referenceResponse = await fetch(`${baseUrl}/reference/core/mini`);
  const referenceDocument = await referenceResponse.text();

  expect(referenceResponse.ok).toBe(true);
  expect(referenceDocument).toContain(
    "<title>MiniFW | mini API Reference</title>",
  );
  expect(referenceDocument).toContain(
    'content="mini API reference for MiniFW."',
  );
});

test("serves PNG social cards", async () => {
  const response = await fetch(`${baseUrl}/assets/social.png?title=MiniFW`);
  const image = new Uint8Array(await response.arrayBuffer());

  expect(response.headers.get("Content-Type")).toBe("image/png");
  expect(image.length).toBeGreaterThan(0);
  expect([...image.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
});

test("serves crawler discovery files", async () => {
  const sitemap = await fetch(`${baseUrl}/sitemap.xml`);
  const sitemapXml = await sitemap.text();
  const today = new Date().toISOString().slice(0, 10);

  expect(sitemap.headers.get("Content-Type")).toBe(
    "application/xml; charset=utf-8",
  );
  expect(sitemapXml).toContain(
    "<loc>https://minifw.calvinbonner.dev/docs/getting-started</loc>",
  );
  expect(sitemapXml).toContain(
    "<loc>https://minifw.calvinbonner.dev/reference/core/mini</loc>",
  );
  expect(sitemapXml).toContain(`<lastmod>${today}</lastmod>`);
  expect(sitemapXml).toContain("<changefreq>weekly</changefreq>");

  const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
  const robots = await robotsResponse.text();
  const llmsResponse = await fetch(`${baseUrl}/llms.txt`);
  const llms = await llmsResponse.text();

  expect(robots).toContain(
    "Sitemap: https://minifw.calvinbonner.dev/sitemap.xml",
  );
  expect(llms).toContain("# MiniFW");
  expect(llms).toContain(
    "> MiniFW is a Bun-only TypeScript framework for server-rendered hypermedia applications built with HTMX.",
  );
  expect(llms).toContain("## Documentation");
});

test("documentation navigation uses static native disclosures", async () => {
  await using view = createWebView();
  await view.navigate("about:blank");
  await view.cdp("Emulation.setDeviceMetricsOverride", {
    deviceScaleFactor: 1,
    height: 900,
    mobile: false,
    width: 1280,
  });
  await view.navigate(`${baseUrl}/docs`);

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const tree = await view.evaluate(
      "document.querySelector('main > [data-docs-tree]')",
    );
    if (tree) break;
    await Bun.sleep(100);
  }

  expect(
    (await view.evaluate(
      "document.querySelector('main > [data-docs-tree]')?.getAttribute('aria-label')",
    )) as string | undefined,
  ).toBe("Documentation sections");
  expect(
    (await view.evaluate(
      "document.querySelectorAll('main > [data-docs-tree] details > summary').length",
    )) as number,
  ).toBe(3);
  expect(
    (await view.evaluate(
      "getComputedStyle(document.querySelector('main > [data-docs-tree] summary')).display",
    )) as string,
  ).toBe("block");
  await view.evaluate(
    "document.querySelector('main > [data-docs-tree] summary')?.click()",
  );

  expect(
    (await view.evaluate(
      "document.querySelector('main > [data-docs-tree] details')?.hasAttribute('open')",
    )) as boolean | undefined,
  ).toBe(true);

  await view.evaluate(
    "document.querySelector('main > [data-docs-tree]')?.setAttribute('data-instance', 'initial')",
  );
  const settle = view.evaluate(
    "new Promise((resolve) => document.body.addEventListener('htmx:after:settle', () => { if (location.pathname === '/docs/core/page') resolve(null) }))",
  );
  await view.click('main > [data-docs-tree] a[href="/docs/core/page"]');
  await settle;

  expect((await view.evaluate("location.pathname")) as string).toBe(
    "/docs/core/page",
  );
  expect(
    (await view.evaluate(
      "document.querySelector('main > [data-docs-tree]')?.getAttribute('data-instance')",
    )) as string | undefined,
  ).toBe("initial");
  expect(
    (await view.evaluate(
      "document.querySelector('main > [data-docs-tree] details')?.hasAttribute('open')",
    )) as boolean | undefined,
  ).toBe(true);
  expect(
    (await view.evaluate(
      "document.querySelector('#docs-page h1')?.textContent",
    )) as string | undefined,
  ).toBe("page()");
  await captureScreenshot(view, "docs", "nested-layout-navigation");

  expect(
    (await view.evaluate(
      "document.querySelector('main > [data-docs-tree] summary')?.hasAttribute('hx-get')",
    )) as boolean | undefined,
  ).toBe(false);
}, 15_000);

test("navigation keeps the app layout while entering documentation", async () => {
  await using view = createWebView();
  await view.navigate("about:blank");
  await view.cdp("Emulation.setDeviceMetricsOverride", {
    deviceScaleFactor: 1,
    height: 900,
    mobile: false,
    width: 1280,
  });
  await view.navigate(`${baseUrl}/`);

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const hasDocumentationLink = await view.evaluate(
      "Boolean(document.querySelector('a[href=\"/docs/getting-started\"]'))",
    );
    if (hasDocumentationLink) break;
    await Bun.sleep(100);
  }

  await view.evaluate(
    "document.querySelector('main')?.setAttribute('data-instance', 'initial')",
  );
  const settle = view.evaluate(
    "new Promise((resolve) => document.body.addEventListener('htmx:after:settle', () => { if (location.pathname === '/docs/getting-started') resolve(null) }))",
  );
  await view.click('a[href="/docs/getting-started"]');
  await settle;

  expect((await view.evaluate("location.pathname")) as string).toBe(
    "/docs/getting-started",
  );
  expect(
    (await view.evaluate(
      "document.querySelector('main')?.getAttribute('data-instance')",
    )) as string | undefined,
  ).toBe("initial");
  expect(
    (await view.evaluate(
      "Boolean(document.querySelector('main > [data-docs-tree]'))",
    )) as boolean,
  ).toBe(true);
}, 15_000);

test("documentation navigation opens and closes a modal dialog on mobile", async () => {
  await using view = createWebView();
  await view.navigate("about:blank");
  await view.cdp("Emulation.setDeviceMetricsOverride", {
    deviceScaleFactor: 1,
    height: 844,
    mobile: true,
    width: 390,
  });
  await view.navigate(`${baseUrl}/docs`);

  expect(
    (await view.evaluate(
      "getComputedStyle(document.querySelector('[data-docs-mobile-navigation] > button')).display !== 'none'",
    )) as boolean,
  ).toBe(true);
  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-mobile-navigation] dialog')?.open",
    )) as boolean | undefined,
  ).toBe(false);
  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-mobile-navigation] dialog')?.matches(':modal')",
    )) as boolean | undefined,
  ).toBe(false);

  await view.evaluate(
    "document.querySelector('[data-docs-mobile-navigation] [data-docs-navigation-open]')?.click()",
  );

  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-mobile-navigation] dialog')?.open",
    )) as boolean | undefined,
  ).toBe(true);
  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-mobile-navigation] dialog')?.matches(':modal')",
    )) as boolean | undefined,
  ).toBe(true);
  expect(
    (await view.evaluate(
      "(() => { const rect = document.querySelector('[data-docs-mobile-navigation] dialog')?.getBoundingClientRect(); return rect && rect.left >= 16 && innerWidth - rect.right >= 16 && rect.top >= 16 && innerHeight - rect.bottom >= 16; })()",
    )) as boolean,
  ).toBe(true);
  await captureScreenshot(view, "docs", "mobile-navigation-expanded");
  await view.evaluate(
    "document.querySelector('[data-docs-mobile-navigation] dialog details summary')?.click()",
  );
  const settle = view.evaluate(
    "new Promise((resolve) => document.body.addEventListener('htmx:after:settle', () => { if (location.pathname === '/docs/core/page') resolve(null) }))",
  );
  await view.click(
    '[data-docs-mobile-navigation] dialog a[href="/docs/core/page"]',
  );
  await settle;
  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-mobile-navigation] dialog')?.open",
    )) as boolean | undefined,
  ).toBe(false);
  await view.cdp("Emulation.clearDeviceMetricsOverride");
}, 15_000);

test("reference renders the generated Typedoc manifest in the docs layout", async () => {
  await using view = createWebView();
  await view.navigate("about:blank");
  await view.cdp("Emulation.setDeviceMetricsOverride", {
    deviceScaleFactor: 1,
    height: 900,
    mobile: false,
    width: 1280,
  });
  await view.navigate(`${baseUrl}/reference`);

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const reference = await view.evaluate(
      "document.querySelector('#docs-page .reference')",
    );
    if (reference) break;
    await Bun.sleep(100);
  }

  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-tree]')?.getAttribute('aria-label')",
    )) as string | undefined,
  ).toBe("API reference sections");
  expect((await view.evaluate("location.pathname")) as string).toStartWith(
    "/reference/core/",
  );
  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-tree] a[href=\"/reference/core/mini\"]')?.textContent",
    )) as string | undefined,
  ).toBe("mini");
  expect(
    (await view.evaluate(
      "document.querySelector('#docs-page .reference h1')?.textContent",
    )) as string | undefined,
  ).toBe("@calvinbonner/minifw API Reference");
  expect(
    (await view.evaluate(
      "document.querySelectorAll('#docs-page .reference .reference-declaration').length",
    )) as number,
  ).toBeGreaterThan(0);
  await view.evaluate(
    "document.querySelector('[data-docs-tree] summary')?.click()",
  );
  await view.evaluate(
    "document.querySelector('[data-docs-tree]')?.setAttribute('data-instance', 'initial')",
  );
  const settle = view.evaluate(
    "new Promise((resolve) => document.body.addEventListener('htmx:after:settle', () => { if (location.pathname === '/reference/core/mini') resolve(null) }))",
  );
  await view.click('[data-docs-tree] a[href="/reference/core/mini"]');
  await settle;

  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-tree]')?.getAttribute('data-instance')",
    )) as string | undefined,
  ).toBe("initial");
  expect(
    (await view.evaluate(
      "document.querySelector('[data-docs-tree] details')?.hasAttribute('open')",
    )) as boolean | undefined,
  ).toBe(true);
  expect(
    (await view.evaluate(
      "document.querySelector('#docs-page .reference h2 code')?.textContent",
    )) as string | undefined,
  ).toBe("core/mini");
  expect(
    (await view.evaluate(
      "[...document.querySelectorAll('#docs-page .reference-declaration > pre > code')].some((element) => element.textContent?.startsWith('interface MiniOptions'))",
    )) as boolean,
  ).toBe(true);
  await captureScreenshot(view, "docs", "api-reference");
}, 15_000);
