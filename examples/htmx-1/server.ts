import { layout, mini, page, partial } from "minifw/core";
import { html } from "minifw/helpers";

const loadHtmx = () =>
  Bun.file(
    import.meta.dir + "/../../node_modules/htmx-1/dist/htmx.min.js",
  ).text();

const counter = partial(
  ({ url }) => {
    const count = Number(url.searchParams.get("count") ?? "0") + 1;

    return html`<section id="counter">
      <p data-count>Count: ${count}</p>
      <button
        hx-get="/partial/counter?count=${count}"
        hx-target="#counter"
        hx-swap="outerHTML"
      >
        Increment
      </button>
    </section>`;
  },
  { allowNonHtmx: true },
);

mini({
  port: 3101,
  layout: layout(({ page: content }) => `<main>${content}</main>`, {
    htmx: { type: "local", loadFn: loadHtmx },
  }),
  routes: {
    "/": page(async (context) => {
      const initialCounter = await counter.render(context);
      return `<h1>HTMX 1 partials</h1>${initialCounter}`;
    }),
  },
  partials: { counter },
});
