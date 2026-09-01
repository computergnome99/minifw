import { fragment } from "../../lib/core";
import { css, html } from "../../lib/helpers";

type TreeNode = {
  label: string;
  href: string;
};

type TreeGroup = {
  id: string;
  label: string;
  nodes: readonly TreeNode[];
};

export type TreeviewData = {
  nodes: readonly TreeNode[];
  groups: readonly TreeGroup[];
};

/** Documentation-page tree navigation with server-rendered expansion state. */
export const treeview = ({ groups, nodes }: TreeviewData) =>
  fragment(
    () => html`
      <nav
        id="docs-treeview"
        aria-label="Documentation sections"
        data-docs-tree
      >
        <ul>
          ${nodes
            .map(
              ({ href, label }) => html`
                <li>
                  <a href="${href}">${label}</a>
                </li>
              `,
            )
            .join("")}
          ${groups
            .map(({ id, label, nodes: groupNodes }) => {
              return html`
                <li>
                  <details>
                    <summary>${label}</summary>
                    <ul id="docs-tree-${id}">
                      ${groupNodes
                        .map(
                          ({ href, label: nodeLabel }) => html`
                            <li>
                              <a href="${href}">${nodeLabel}</a>
                            </li>
                          `,
                        )
                        .join("")}
                    </ul>
                  </details>
                </li>
              `;
            })
            .join("")}
        </ul>
      </nav>
    `,
  );

export const treeviewStyles = css`
  nav[data-docs-tree] {
    margin-block: 2rem;
    width: 240px;

    & ul {
      list-style: none;
    }

    & a {
      display: block;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      width: 100%;
      color: inherit;
      text-align: start;
      text-decoration: none;
    }

    & summary {
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      width: 100%;
    }

    & details > ul {
      margin-inline-start: 1.5ch;
      border-left: 1px dashed;
    }

    & a:hover,
    & summary:hover {
      background-color: rgb(from var(--brand) r g b / 0.15);
      color: var(--brand);
    }
  }
`;
