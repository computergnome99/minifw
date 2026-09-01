import { page } from "../../lib/core";
import { error, html } from "../../lib/helpers";
import {
  loadDocumentationData,
  type DocumentationData,
  type DocumentationDeclaration,
  type DocumentationSignature,
} from "../data";
import { highlightCode, markdown } from "../markdown";
import { treeview } from "../partials/treeview";

const documentationData = await loadDocumentationData();
const referenceModules = documentationData.modules;
const referenceModulesById = new Map(
  referenceModules.map((referenceModule) => [
    referenceModule.id,
    referenceModule,
  ]),
);
const referenceGroups = [
  ...new Set(
    referenceModules.map(
      (referenceModule) => referenceModule.id.split("/", 1)[0] ?? "",
    ),
  ),
].filter(Boolean);

const referenceDefaultPath = referenceModules[0]?.id;
if (!referenceDefaultPath) {
  throw new TypeError("The documentation manifest must contain a module.");
}

export { referenceDefaultPath };

export const referenceTree = treeview({
  ariaLabel: "API reference sections",
  nodes: [],
  groups: referenceGroups.map((id) => ({
    id: `reference-${id}`,
    label: titleCase(id),
    nodes: referenceModules
      .filter((referenceModule) => referenceModule.id.startsWith(`${id}/`))
      .map((referenceModule) => ({
        label: referenceModule.name,
        href: `/reference/${referenceModule.id}`,
      })),
  })),
});

/** Render a generated Typedoc module as an API reference page. */
export function renderReference(
  data: DocumentationData,
  referenceModule: DocumentationData["modules"][number],
): string {
  return html`
    <div class="content reference">
      <h1>${escapeHtml(data.package.name)} API Reference</h1>
      <p>Version ${escapeHtml(data.package.version)}</p>
      ${renderModule(referenceModule)}
    </div>
  `;
}

function renderModule(module: DocumentationData["modules"][number]): string {
  return html`
    <section aria-labelledby="reference-${escapeHtml(module.id)}">
      <h2 id="reference-${escapeHtml(module.id)}">
        <code>${escapeHtml(module.id)}</code>
      </h2>
      ${renderMarkdown(module.summary)}
      ${module.exports
        .map((declaration) => renderDeclaration(declaration, 3))
        .join("")}
    </section>
  `;
}

function renderDeclaration(
  declaration: DocumentationDeclaration,
  headingLevel: 3 | 4,
): string {
  const heading = headingLevel === 3 ? "h3" : "h4";
  const members = declaration.members
    .map((member) => renderDeclaration(member, 4))
    .join("");

  return html`
    <article class="reference-declaration">
      <${heading}>
        <code>${escapeHtml(declaration.kind)} ${escapeHtml(declaration.name)}</code>
      </${heading}>
      ${renderDeclarationSignature(declaration)}
      ${renderMarkdown(declaration.summary)}
      ${
        declaration.deprecated
          ? `<section><strong>Deprecated:</strong>${renderMarkdown(declaration.deprecated)}</section>`
          : ""
      }
      ${
        declaration.type && declaration.type !== "void"
          ? renderTypescript(declaration.type)
          : ""
      }
      ${declaration.signatures.map((signature) => renderSignature(declaration.name, signature)).join("")}
      ${renderMarkdown(declaration.remarks)}
      ${declaration.examples.map((example) => renderExample(example)).join("")}
      ${members}
    </article>
  `;
}

function renderSignature(
  name: string,
  signature: DocumentationSignature,
): string {
  const signatureText = renderSignatureText(name, signature);

  return html`
    <section class="reference-signature">
      ${renderTypescript(signatureText)} ${renderMarkdown(signature.summary)}
      ${signature.parameters.some(({ summary }) => summary)
        ? `<dl>${signature.parameters
            .filter(({ summary }) => summary)
            .map(
              ({ name: parameterName, summary }) =>
                `<dt><code>${escapeHtml(parameterName)}</code></dt><dd>${renderMarkdown(summary)}</dd>`,
            )
            .join("")}</dl>`
        : ""}
      ${signature.returns.summary
        ? `<section><strong>Returns:</strong>${renderMarkdown(signature.returns.summary)}</section>`
        : ""}
    </section>
  `;
}

function renderDeclarationSignature(
  declaration: DocumentationDeclaration,
): string {
  if (
    !["class", "interface", "type-alias"].includes(declaration.kind) ||
    (declaration.members.length === 0 && declaration.type === "void")
  ) {
    return "";
  }

  const typeParameters = renderTypeParameters(declaration.typeParameters ?? []);
  const extendsClause = declaration.extends?.length
    ? ` extends ${declaration.extends.join(", ")}`
    : "";
  const declarationName = `${declaration.kind === "type-alias" ? "type" : declaration.kind} ${declaration.name}${typeParameters}`;

  if (declaration.members.length === 0) {
    return renderTypescript(`${declarationName} = ${declaration.type};`);
  }

  const memberLines = declaration.members.flatMap((member) =>
    renderMemberSignatures(member),
  );
  const open = declaration.kind === "type-alias" ? "= {" : "{";
  const close = declaration.kind === "type-alias" ? "};" : "}";
  const signature = [
    `${declarationName}${extendsClause} ${open}`,
    ...memberLines.map((member) => `  ${member}`),
    close,
  ].join("\n");

  return renderTypescript(signature);
}

function renderMemberSignatures(
  declaration: DocumentationDeclaration,
): string[] {
  if (declaration.kind === "property") {
    const readonly = declaration.readonly ? "readonly " : "";
    const optional = declaration.optional ? "?" : "";
    return [`${readonly}${declaration.name}${optional}: ${declaration.type};`];
  }

  if (declaration.signatures.length > 0) {
    const name =
      declaration.kind === "constructor" ? "constructor" : declaration.name;
    return declaration.signatures.map(
      (signature) => `${renderSignatureText(name, signature)};`,
    );
  }

  return [];
}

function renderSignatureText(
  name: string,
  signature: DocumentationSignature,
): string {
  const parameters = signature.parameters
    .map(({ name: parameterName, optional, rest, type }) => {
      const prefix = rest ? "..." : "";
      const suffix = optional ? "?" : "";
      return `${prefix}${parameterName}${suffix}: ${type}`;
    })
    .join(", ");

  return `${name}${renderTypeParameters(signature.typeParameters)}(${parameters}): ${signature.returns.type}`;
}

function renderTypeParameters(typeParameters: readonly string[]): string {
  return typeParameters.length > 0 ? `<${typeParameters.join(", ")}>` : "";
}

function renderMarkdown(source: string): string {
  return source ? markdown(source) : "";
}

function renderExample(source: string): string {
  return source.trimStart().startsWith("```")
    ? renderMarkdown(source)
    : `<pre><code>${escapeHtml(source)}</code></pre>`;
}

function renderTypescript(source: string): string {
  return `<pre><code class="language-ts">${highlightCode(source, "typescript")}</code></pre>`;
}

function escapeHtml(value: string): string {
  return value.replaceAll(/[&<>'"]/g, (character) => {
    return (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[
        character
      ] ?? character
    );
  });
}

function titleCase(value: string): string {
  return `${value[0]?.toUpperCase()}${value.slice(1)}`;
}

export const reference = page(
  async ({ params, url }) => {
    const requestedPath =
      params["*"] ?? url.pathname.slice("/reference/".length);
    const referenceModule = referenceModulesById.get(requestedPath);

    if (!referenceModule) error(404, "Reference page not found");

    return renderReference(documentationData, referenceModule);
  },
  {
    head: {
      title: "MiniFW | API Reference",
      description: "Generated API reference for MiniFW.",
    },
  },
);
