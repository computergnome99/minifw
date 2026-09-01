import { layout, mini } from "../lib/core";
import { html } from "../lib/helpers";
import { logo } from "./assets/logo";
import { documentationTreeview } from "./partials/documentation-treeview";
import { navigation } from "./partials/navigation";
import { documentation } from "./pages/documentation";
import { home } from "./pages/home";

const server = mini({
  port: Number(process.env["DOCS_PORT"] ?? 3000),
  layout: layout(
    ({ page }) => html`
      <div
        hx-get="/partial/navigation"
        hx-trigger="load"
        hx-swap="outerHTML"
        style="height: 48px;"
      ></div>
      <main style="scroll-margin-top: 48px">${page}</main>
    `,
    () => html`
      <script
        src="https://kit.fontawesome.com/a80ebe0155.js"
        crossorigin="anonymous"
      ></script>
    `,
  ),
  routes: {
    "/": home,
    "/docs": documentation,
  },
  partials: {
    documentationTreeview,
    navigation,
  },
  globalStyles: Bun.file(new URL("styles/main.css", import.meta.url)),
  scripts: Bun.file(new URL("scripts/treeview.ts", import.meta.url)),
  onError: (error, request) => {
    console.error(`Failed to render ${request.method} ${request.url}`, error);
  },
  fetch: async (request) => {
    const url = new URL(request.url);

    if (url.pathname === "/assets/logo.svg") return logo(request);

    return new Response("Not found", { status: 404, statusText: "Not found" });
  },
});

console.log(`Server running at ${server.url}`);
