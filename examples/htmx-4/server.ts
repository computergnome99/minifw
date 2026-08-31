import { layout, mini, page } from "@calvinbonner/minifw/core";
import { html, css } from "@calvinbonner/minifw/helpers";

const loadHtmx = () =>
  Bun.file(
    import.meta.dir + "/../../node_modules/htmx-4/dist/htmx.min.js",
  ).text();

const appLayout = layout(
  ({ page: content }) => `<main id="view">${content}</main>`,
  {
    htmx: { type: "local", loadFn: loadHtmx },
  },
);

mini({
  port: 3104,
  layout: appLayout,
  routes: {
    "/": page(
      () =>
        html`<h1>HTMX 4 navigation</h1>
          <a href="/about" data-about-link>About</a>`,
      () => css`
        .home {
          color: teal;
        }
      `,
    ),
    "/about": page(
      () =>
        html`<h1 class="about">About HTMX 4</h1>
          <a href="/" data-home-link>Home</a>`,
      () => css`
        .about {
          color: rebeccapurple;
        }
      `,
    ),
  },
});
