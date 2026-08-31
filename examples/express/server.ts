import express from "express";
import { page } from "@calvinbonner/minifw/core";
import { html, isHtmx } from "@calvinbonner/minifw/helpers";

const product = page(
  ({ params }) => html`<h1 data-product-name>Product ${params["name"]}</h1>`,
);

const app = express();

app.get("/products/:name", async (request_, response, next) => {
  try {
    const request = new Request(
      `http://${request_.headers.host ?? "127.0.0.1:3106"}${request_.originalUrl}`,
      { headers: { "HX-Request": request_.get("HX-Request") ?? "" } },
    );
    const context = {
      request,
      url: new URL(request.url),
      route: "/products/:name",
      params: request_.params,
      isHtmx: isHtmx(request),
    };
    response.type("html").send(await product.render(context));
  } catch (error) {
    next(error);
  }
});

app.listen(3106);
