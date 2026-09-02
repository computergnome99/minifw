import { page } from "../../lib/core";
import { error, html } from "../../lib/helpers";
import { parseMarkdown } from "../markdown";
import { treeview } from "../partials/treeview";

type DocumentationPage = {
  group?: string;
  html: string;
  label: string;
  order: number;
  path: string;
};

const groupLabels: Record<string, string> = {
  core: "Core",
  extra: "Extra",
  helpers: "Helpers",
};

const documentationDirectory = `${import.meta.dir}/docs`;
const documentationPages = await loadDocumentationPages();
export const documentationPaths = documentationPages.map(
  ({ path }) => `/docs/${path}`,
);
const documentationByPath = new Map(
  documentationPages.map((documentationPage) => [
    documentationPage.path,
    documentationPage,
  ]),
);
const documentationGroups = [
  ...new Set(documentationPages.flatMap(({ group }) => (group ? [group] : []))),
];

export const documentationTree = treeview({
  nodes: documentationPages
    .filter(({ group }) => !group)
    .map(({ label, path }) => ({ label, href: `/docs/${path}` })),
  groups: documentationGroups.map((id) => {
    const nodes = documentationPages
      .filter(({ group }) => group === id)
      .map(({ label: nodeLabel, path }) => ({
        label: nodeLabel,
        href: `/docs/${path}`,
      }));

    return { id, label: groupLabels[id] ?? id, nodes };
  }),
});

async function loadDocumentationPages(): Promise<DocumentationPage[]> {
  const pages: DocumentationPage[] = [];
  const documentationFiles = new Bun.Glob("**/*.md").scan(
    documentationDirectory,
  );

  for await (const filePath of documentationFiles) {
    const source = await Bun.file(
      `${documentationDirectory}/${filePath}`,
    ).text();
    const { attributes, html: renderedHtml } = parseMarkdown(source);
    const path = filePath.slice(0, -".md".length);
    const [group] = path.split("/", 1);
    const title = attributes["title"];
    const order = attributes["order"];

    if (typeof title !== "string" || typeof order !== "number") {
      throw new TypeError(
        `Documentation file ${filePath} requires string title and numeric order front matter.`,
      );
    }

    pages.push({
      group: path.includes("/") ? group : undefined,
      html: renderedHtml,
      label: title,
      order,
      path,
    });
  }

  return pages.toSorted(
    (firstPage, secondPage) => firstPage.order - secondPage.order,
  );
}

export const documentation = page(
  async ({ params, url }) => {
    const requestedPath = params["*"] ?? url.pathname.slice("/docs/".length);
    const subpage = requestedPath || "getting-started";
    const document = documentationByPath.get(subpage);

    if (!document) error(404, "Documentation page not found");

    return html`<div class="content">${document.html}</div>`;
  },
  {
    head: ({ params, url }) => {
      const requestedPath = params["*"] ?? url.pathname.slice("/docs/".length);
      const subpage = requestedPath || "getting-started";
      const document = documentationByPath.get(subpage);

      return document
        ? {
            title: `MiniFW | ${document.label}`,
            description: `${document.label} documentation for MiniFW.`,
          }
        : undefined;
    },
  },
);
