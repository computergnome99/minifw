import {
  fragment,
  layout,
  mini,
  page,
  partial,
} from "@calvinbonner/minifw/core";
import { css, html } from "@calvinbonner/minifw/helpers";

const loadHtmx = () =>
  Bun.file(
    import.meta.dir + "/../../node_modules/htmx-1/dist/htmx.min.js",
  ).text();

const count = fragment(
  ({ count }: { count: number }) => html`
    <section id="counter">
      <p data-count>Count: ${count}</p>
      <button
        hx-get="/partial/counter?count=${count}"
        hx-target="#counter"
        hx-swap="outerHTML"
      >
        Increment
      </button>
    </section>
  `,
);

const counter = partial(
  ({ url }) => {
    const number = Number(url.searchParams.get("count") ?? "0") + 1;

    return count({ count: number });
  },
  { allowNonHtmx: true },
);

const styledPartial = partial(
  () => html`<section id="styled-partial">Styled partial</section>`,
  () => css`
    section {
      color: teal;
    }
  `,
);

mini({
  port: 3101,
  layout: layout(
    ({ page: content }) =>
      html`<h1>Example MiniFW App</h1>
        <main id="view">${content}</main>`,
    {
      htmx: { type: "local", loadFn: loadHtmx },
    },
  ),
  routes: {
    "/": page(async (context) => {
      const initialCounter = await counter.render(context);
      return html`<h2>HTMX 1 partials</h2>
        ${initialCounter}
        <section id="styled-partial">
          <button
            hx-get="/partial/styledPartial"
            hx-target="#styled-partial"
            hx-swap="outerHTML"
            data-styled-partial-button
          >
            Load styled partial
          </button>
        </section>
        <a href="/products/widget-42" data-product-link>Product</a>`;
    }),
    "/products/:id": page(
      ({ params }) =>
        html`<h2 data-product-id>Product ${params["id"]}</h2>
          <a href="/" data-home-link>Home</a>`,
    ),
  },
  partials: { counter, styledPartial },
});
