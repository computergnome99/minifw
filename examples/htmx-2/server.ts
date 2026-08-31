import { layout, mini, page } from "@calvinbonner/minifw/core";
import { html, css } from "@calvinbonner/minifw/helpers";

const loadHtmx = () =>
  Bun.file(
    import.meta.dir + "/../../node_modules/htmx-2/dist/htmx.min.js",
  ).text();

const appLayout = layout(
  ({ page: content }) => `<main id="view">${content}</main>`,
  {
    htmx: { type: "local", loadFn: loadHtmx },
  },
);

mini({
  port: 3102,
  layout: appLayout,
  routes: {
    "/": page(
      () =>
        html`<h1>HTMX 2 navigation</h1>
          <a href="/about" data-about-link>About</a>`,
      () => css`
        h1 {
          color: teal;
        }
      `,
    ),
    "/about": page(
      () =>
        html`<h1>About MiniFW</h1>
          <a href="/" data-home-link>Home</a>`,
      () => css`
        h1 {
          color: rebeccapurple;
        }
      `,
    ),
  },
});
