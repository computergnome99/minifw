import { layout, page } from "@calvinbonner/minifw/core";
import { html, isHtmx } from "@calvinbonner/minifw/helpers";

const product = page(
  ({ params }) => html`<h1 data-product-name>Product ${params["name"]}</h1>`,
);

const appLayout = layout(({ page: content }) => html`<main>${content}</main>`, {
  disableRuntime: true,
});

type RoutedRequest = Request & { params?: Record<string, string> };

Bun.serve({
  port: 3105,
  routes: {
    "/products/:name": async (request: RoutedRequest) => {
      const context = {
        request,
        url: new URL(request.url),
        route: "/products/:name",
        params: request.params ?? {},
        isHtmx: isHtmx(request),
      };
      const content = await product.render(context);
      const document = await appLayout.render({ context, page: content });

      return new Response(document, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    },
  },
});
