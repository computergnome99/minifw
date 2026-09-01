import { layout, mini, redirect } from "../lib/core";
import { html, isMiniError } from "../lib/helpers";
import { logo } from "./assets/logo";
import { navigation } from "./partials/navigation";
import { documentation } from "./pages/documentation";
import { home } from "./pages/home";

const pageLayout = layout(
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
);

const server = mini({
  port: Number(process.env["DOCS_PORT"] ?? 3000),
  layout: pageLayout,
  routes: {
    "/": home,
    "/docs": redirect("/docs/getting-started"),
    "/docs/*": documentation,
    "/assets/logo.svg": (request) => logo(request),
  },
  partials: {
    navigation,
  },
  globalStyles: Bun.file(new URL("styles/main.css", import.meta.url)),
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
