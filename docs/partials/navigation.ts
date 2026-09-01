import { partial } from "../../lib/core";
import { css, html } from "../../lib/helpers";

export const navigation = partial(
  () => html`
    <div>
      <nav>
        <a href="/">Home</a>
        <a href="/docs">Docs</a>
      </nav>

      <a href="https://www.github.com/computergnome99/minifw" target="_blank">
        <span class="fa-brands fa-github"></span>
        <span class="sr-only"> GitHub </span>
      </a>
    </div>
  `,
  () => css`
    div {
      display: flex;
      justify-content: space-between;
      gap: 2rem;
      transition-property: opacity;
      margin: 0.5rem auto;
      width: min(calc(100dvw - 2rem), 720px);
      font-size: 1.25rem;

      @starting-style {
        opacity: 0;
      }
    }

    nav {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    a {
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }

      &::after {
        content: none;
      }
    }
  `,
);
