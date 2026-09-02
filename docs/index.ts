import { layout, mini, redirect, type MiniFragment } from "../lib/core";
import { html, isMiniError } from "../lib/helpers";
import { logo } from "./assets/logo";
import { navigation } from "./partials/navigation";
import { documentation, documentationTree } from "./pages/documentation";
import {
  reference,
  referenceDefaultPath,
  referenceTree,
} from "./pages/reference";
import { treeviewStyles } from "./partials/treeview";
import { home } from "./pages/home";

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
      head: () => html`
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          src="https://kit.fontawesome.com/a80ebe0155.js"
          crossorigin="anonymous"
        ></script>
      `,
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
  },
  partials: {
    navigation,
  },
  error(error) {
    if (isMiniError(error)) {
      console.error("Mini Error:", error.status, error.message);
      return;
    }

    console.log("Unhandled error", error);
  },
  fetch: async () => {
    return new Response("Not found", { status: 404, statusText: "Not found" });
  },
});

console.log(`Server running at ${server.url}`);
