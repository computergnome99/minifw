import { layout, mini, page } from "@calvinbonner/minifw/core";
import { html, css } from "@calvinbonner/minifw/helpers";

const loadHtmx = () =>
  Bun.file(
    import.meta.dir + "/../../node_modules/htmx-2/dist/htmx.min.js",
  ).text();

const appLayout = layout(
  ({ page: content }) =>
    html`<h1>Example MiniFW App</h1>
      <main id="view">${content}</main>`,
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
        html`<h2>HTMX 2 navigation</h2>
          <a href="/about" data-about-link>About</a>`,
      () => css`
        h2 {
          color: teal;
        }
      `,
    ),
    "/about": page(
      () =>
        html`<h2>About MiniFW</h2>
          <a href="/" data-home-link>Home</a>`,
      () => css`
        h2 {
          color: rebeccapurple;
        }
      `,
    ),
  },
});
