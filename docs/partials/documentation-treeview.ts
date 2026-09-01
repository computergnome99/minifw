import { partial } from "../../lib/core";
import { css, html } from "../../lib/helpers";

const nodes = [
  {
    id: "formatting",
    label: "Formatting",
    children: [
      ["Text formatting", "#text-formatting"],
      ["Headings", "#headings"],
      ["Lists", "#lists"],
      ["Quotes and callouts", "#quotes-and-callouts"],
    ],
  },
  {
    id: "content",
    label: "Content",
    children: [
      ["Code", "#code"],
      ["Tables", "#tables"],
      ["Media and HTML", "#media-and-html"],
    ],
  },
] as const;

/** Documentation-page tree navigation with server-rendered expansion state. */
export const documentationTreeview = partial(
  ({ url }) => {
    const expanded = url.searchParams.get("expanded");
    const focus = url.searchParams.get("focus");

    return html`
      <nav
        id="docs-treeview"
        aria-label="Documentation sections"
        data-docs-tree
      >
        <ul role="tree">
          <li role="none">
            <a
              href="#documentation"
              role="treeitem"
              tabindex="${focus ? -1 : 0}"
            >
              Overview
            </a>
          </li>
          ${nodes
            .map(({ children, id, label }) => {
              const isExpanded = expanded === id;
              const isFocused = focus === id;

              return html`
                <li role="none">
                  <button
                    type="button"
                    role="treeitem"
                    aria-controls="docs-tree-${id}"
                    aria-expanded="${isExpanded}"
                    ${isFocused ? 'data-tree-focus="true"' : ""}
                    hx-get="/partial/documentationTreeview?expanded=${isExpanded
                      ? ""
                      : id}&focus=${id}"
                    hx-target="#docs-treeview"
                    hx-swap="outerHTML"
                    tabindex="${isFocused ? 0 : -1}"
                  >
                    ${label}
                  </button>
                  ${isExpanded
                    ? html`<ul id="docs-tree-${id}" role="group">
                        ${children
                          .map(
                            ([childLabel, href]) => html`
                              <li role="none">
                                <a href="${href}" role="treeitem" tabindex="-1">
                                  ${childLabel}
                                </a>
                              </li>
                            `,
                          )
                          .join("")}
                      </ul>`
                    : ""}
                </li>
              `;
            })
            .join("")}
        </ul>
      </nav>
    `;
  },
  () => css`
    nav {
      margin-block: 2rem;
    }

    ul {
      list-style: none;
    }

    [role="treeitem"] {
      display: block;
      padding: 0.25rem 0.5rem;
      width: 100%;
      color: inherit;
      text-align: start;
      text-decoration: none;
    }

    button[role="treeitem"]::before {
      display: inline-block;
      text-rendering: auto;
      -webkit-font-smoothing: antialiased;
      margin-right: 1ch;
      content: "\f0da";
      font: var(--fa-font-regular);
    }

    button[aria-expanded="true"]::before {
      rotate: 90deg;
    }

    [role="group"] {
      margin-inline-start: 1.5ch;
    }

    [role="treeitem"]:hover {
      background-color: rgb(64 160 43 / 0.12);
      color: #15210f;
    }
  `,
);
