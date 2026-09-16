import express from "express";

const app = express();

app.get("/products/:name", (request, response) => {
  response
    .type("html")
    .send(`<h1 data-product-name>Product ${request.params["name"]}</h1>`);
});

app.listen(3106);
