import { page } from "../../lib/core";
import { css, html } from "../../lib/helpers";
import { markdown } from "../markdown";

export const home = page(
  async () => {
    const body = markdown(
      await Bun.file(new URL("home.md", import.meta.url)).text(),
    );

    return html`
      <div class="content">
        <img src="/assets/logo.svg" alt="MiniFW" height="160" />

        ${body}
      </div>
    `;
  },
  () => css`
    img {
      transition-duration: 0.5s;
      transition-property: translate, opacity;
      margin: 2rem auto 4rem;

      @starting-style {
        translate: 0 -2rem;
        opacity: 0;
      }
    }
  `,
  {
    head: {
      title: "MiniFW | Home",
      description:
        "A simple, server-side framework for building hypermedia apps quickly with HTMX.",
    },
    cache: true,
  },
);
