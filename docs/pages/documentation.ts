import { page } from "../../lib/core";
import { html } from "../../lib/helpers";
import { markdown } from "../markdown";

export const documentation = page(
  async () =>
    html`<aside
        hx-get="/partial/documentationTreeview"
        hx-swap="outerHTML"
        hx-trigger="load"
      ></aside>
      ${markdown(
        await Bun.file(new URL("documentation.md", import.meta.url)).text(),
      )}`,
  {
    head: {
      title: "MiniFW | Documentation",
      description: "Documentation for MiniFW",
    },
  },
);
