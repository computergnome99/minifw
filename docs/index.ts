import { layout, mini, redirect, type MiniFragment } from "../lib/core";
import { html, isMiniError } from "../lib/helpers";
import { logo } from "./assets/logo";
import { socialCard } from "./assets/social-card";
import { navigation } from "./partials/navigation";
import {
  documentation,
  documentationPaths,
  documentationTree,
} from "./pages/documentation";
import {
  reference,
  referenceDefaultPath,
  referencePaths,
  referenceTree,
} from "./pages/reference";
import { treeviewStyles } from "./partials/treeview";
import { home } from "./pages/home";
import { favicon } from "./assets/favicon";

const pageLayout = layout(
  ({ page }) => html`
    <div
      hx-get="/partial/navigation"
      hx-trigger="load"
      hx-swap="outerHTML"
      style="height: 48px;"
    ></div>
    <main id="app-page">${page}</main>
  `,
  { pageTarget: "#app-page" },
);

const contentLayout = (tree: MiniFragment) =>
  layout(
    async ({ page }) => {
      const treeview = await tree();

      return html`
        ${treeview}

        <div data-docs-mobile-navigation>
          <button type="button" data-docs-navigation-open>
            Browse Sections
          </button>

          <dialog
            id="docs-navigation-popover"
            aria-label="Documentation Navigation"
          >
            <h1>Sections</h1>
            <button type="button" data-docs-navigation-close>
              <span class="fa-regular fa-sharp fa-xmark"></span>
              <span class="sr-only">Close popover</span>
            </button>
            <div>${treeview}</div>
          </dialog>
        </div>

        <section id="docs-page">${page}</section>
      `;
    },
    { pageTarget: "#docs-page" },
  );

const documentationLayout = contentLayout(documentationTree);
const referenceLayout = contentLayout(referenceTree);
const siteUrl = "https://minifw.calvinbonner.dev";
const robots = Bun.file(new URL("robots.txt", import.meta.url));
const llms = Bun.file(new URL("llms.txt", import.meta.url));

const server = mini({
  port: Number(process.env["DOCS_PORT"] ?? 3000),
  layouts: {
    "*": pageLayout,
    "/docs/*": documentationLayout,
    "/reference/*": referenceLayout,
  },
  config: {
    document: {
      htmlAttributes: { lang: "en" },
      head: ({ context, head }) => {
        const title = head?.title ?? "MiniFW";
        const description =
          head?.description ??
          "A simple, server-side framework for building hypermedia apps quickly with HTMX.";
        const pageUrl = `${siteUrl}${context.url.pathname}${context.url.search}`;
        const imageUrl = `${siteUrl}/assets/social.png?title=${encodeURIComponent(title)}`;

        return html`
          <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="MiniFW" />
          <meta property="og:title" content="${escapeAttribute(title)}" />
          <meta
            property="og:description"
            content="${escapeAttribute(description)}"
          />
          <meta property="og:url" content="${pageUrl}" />
          <meta property="og:image" content="${imageUrl}" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content="${escapeAttribute(title)}" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${escapeAttribute(title)}" />
          <meta
            name="twitter:description"
            content="${escapeAttribute(description)}"
          />
          <meta name="twitter:image" content="${imageUrl}" />
          <script
            src="https://kit.fontawesome.com/a80ebe0155.js"
            crossorigin="anonymous"
          ></script>
        `;
      },
    },
    globalStyles: [
      Bun.file(new URL("styles/main.css", import.meta.url)),
      () => treeviewStyles,
    ],
    scripts: Bun.file(new URL("scripts/mobile-navigation.ts", import.meta.url)),
  },
  routes: {
    "/": home,
    "/docs": redirect("/docs/getting-started"),
    "/docs/*": documentation,
    "/reference": redirect(`/reference/${referenceDefaultPath}`),
    "/reference/*": reference,
    "/assets/logo.svg": (request) => logo(request),
    "/assets/favicon.svg": (request) => favicon(request),
    "/assets/social.png": (request) => socialCard(request),
    "/sitemap.xml": () => sitemap(),
    "/robots.txt": () => textFile(robots),
    "/llms.txt": () => textFile(llms),
  },
  partials: {
    navigation,
  },
  error(error) {
    if (isMiniError(error)) {
      console.error("Mini Error:", error.status, error.message);
      return new Response(error.message, {
        status: error.status,
        statusText: error.message,
      });
    }

    console.error("Unhandled error", error);
    return new Response("Internal server error", {
      status: 500,
      statusText: "Internal Server Error",
    });
  },
  fetch: async () => {
    return new Response("Not found", { status: 404, statusText: "Not found" });
  },
});

console.log(`Server running at ${server.url}`);

function escapeAttribute(value: string): string {
  return value.replaceAll(/[&<>"']/g, (character) => {
    return (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        character
      ] ?? character
    );
  });
}

function sitemap(): Response {
  const paths = ["/", ...documentationPaths, ...referencePaths];
  const lastModified = new Date().toISOString().slice(0, 10);
  const urls = paths
    .map(
      (path) => `  <url>
    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`,
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}

function textFile(file: Bun.BunFile): Response {
  return new Response(file, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function escapeXml(value: string): string {
  return value.replaceAll(/[&<>"']/g, (character) => {
    return (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[
        character
      ] ?? character
    );
  });
}
