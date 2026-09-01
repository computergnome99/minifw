import { $ } from "bun";
import { mkdtemp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

type TypeDocumentCommentPart = {
  kind: string;
  text?: string;
};

type TypeDocumentComment = {
  summary?: TypeDocumentCommentPart[];
  blockTags?: Array<{
    tag: string;
    content: TypeDocumentCommentPart[];
  }>;
};

type TypeDocumentReflection = {
  name: string;
  kind: number;
  flags?: { isOptional?: boolean; isRest?: boolean };
  comment?: TypeDocumentComment;
  type?: TypeDocumentType;
  typeParameters?: Array<{ name: string }>;
  parameters?: TypeDocumentReflection[];
  signatures?: TypeDocumentReflection[];
  children?: TypeDocumentReflection[];
};

type TypeDocumentType = {
  type: string;
  name?: string;
  value?: boolean | number | string | null;
  elementType?: TypeDocumentType;
  types?: TypeDocumentType[];
  typeArguments?: TypeDocumentType[];
  declaration?: TypeDocumentReflection;
  checkType?: TypeDocumentType;
  extendsType?: TypeDocumentType;
  trueType?: TypeDocumentType;
  falseType?: TypeDocumentType;
  objectType?: TypeDocumentType;
  indexType?: TypeDocumentType;
  queryType?: TypeDocumentType;
  target?: TypeDocumentType;
  operator?: string;
  element?: TypeDocumentType;
  elements?: TypeDocumentType[];
  isOptional?: boolean;
  isRest?: boolean;
  head?: string;
  tail?: Array<{ text: string; type: TypeDocumentType }>;
};

type DocumentationDeclarationKind =
  | "class"
  | "constructor"
  | "enum"
  | "enum-member"
  | "function"
  | "interface"
  | "method"
  | "property"
  | "type-alias"
  | "unknown"
  | "variable";

type DocumentationDeclaration = {
  name: string;
  kind: DocumentationDeclarationKind;
  summary: string;
  remarks: string;
  examples: string[];
  deprecated: string;
  type: string;
  signatures: DocumentationSignature[];
  members: DocumentationDeclaration[];
};

type DocumentationSignature = {
  typeParameters: string[];
  summary: string;
  parameters: Array<{
    name: string;
    optional: boolean;
    rest: boolean;
    summary: string;
    type: string;
  }>;
  returns: {
    summary: string;
    type: string;
  };
};

const reflectionKinds = {
  8: "enum",
  16: "enum-member",
  32: "variable",
  64: "function",
  128: "class",
  256: "interface",
  512: "constructor",
  1024: "property",
  2048: "method",
  2_097_152: "type-alias",
} as const;

const rootDirectory = fileURLToPath(new URL("../", import.meta.url));
const documentationDirectory = `${rootDirectory}/docs`;
const dataPath = `${documentationDirectory}/data.json`;
const temporaryDirectory = await mkdtemp("/tmp/minifw-typedoc-");
const reflectionPath = `${temporaryDirectory}/reflection.json`;

try {
  await $`bunx typedoc --entryPointStrategy expand --entryPoints ./lib/core --entryPoints ./lib/helpers --exclude ${"**/*.spec.ts"} --exclude ${"**/__fixtures__/**"} --disableSources --validation.invalidLink false --validation.notExported false --out ${`${temporaryDirectory}/site`} --json ${reflectionPath}`.cwd(
    rootDirectory,
  );

  const reflection = (await Bun.file(
    reflectionPath,
  ).json()) as TypeDocumentReflection;
  const packageJson = (await Bun.file(
    `${rootDirectory}/package.json`,
  ).json()) as {
    name: string;
    version: string;
  };
  const data = {
    schemaVersion: 1,
    package: {
      name: packageJson.name,
      version: packageJson.version,
    },
    modules: (reflection.children ?? [])
      .filter((module) => /^(core|helpers)\//.test(module.name))
      .map((module) => ({
        id: module.name,
        name: module.name.split("/").at(-1) ?? module.name,
        summary: commentText(module.comment?.summary),
        exports: (module.children ?? []).map((child) => toDeclaration(child)),
      })),
  };

  await Bun.write(dataPath, `${JSON.stringify(data, undefined, 2)}\n`);
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

function toDeclaration(
  reflection: TypeDocumentReflection,
): DocumentationDeclaration {
  const blockTags = reflection.comment?.blockTags ?? [];

  return {
    name: reflection.name,
    kind:
      reflectionKinds[reflection.kind as keyof typeof reflectionKinds] ??
      "unknown",
    summary: commentText(reflection.comment?.summary),
    remarks: commentText(
      blockTags.find((tag) => tag.tag === "@remarks")?.content,
    ),
    examples: blockTags
      .filter((tag) => tag.tag === "@example")
      .map((tag) => commentText(tag.content)),
    deprecated: commentText(
      blockTags.find((tag) => tag.tag === "@deprecated")?.content,
    ),
    type: renderType(reflection.type),
    signatures:
      reflection.signatures?.map((signature) => toSignature(signature)) ?? [],
    members: reflection.children?.map((child) => toDeclaration(child)) ?? [],
  };
}

function toSignature(
  signature: TypeDocumentReflection,
): DocumentationSignature {
  const blockTags = signature.comment?.blockTags ?? [];

  return {
    typeParameters:
      signature.typeParameters?.map((parameter) => parameter.name) ?? [],
    summary: commentText(signature.comment?.summary),
    parameters: (signature.parameters ?? []).map((parameter) => ({
      name: parameter.name,
      optional: parameter.flags?.isOptional ?? false,
      rest: parameter.flags?.isRest ?? false,
      summary: commentText(parameter.comment?.summary),
      type: renderType(parameter.type),
    })),
    returns: {
      summary: commentText(
        blockTags.find((tag) => tag.tag === "@returns")?.content,
      ),
      type: renderType(signature.type),
    },
  };
}

function commentText(parts: TypeDocumentCommentPart[] | undefined): string {
  return (parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

function renderType(type: TypeDocumentType | undefined): string {
  if (!type) return "void";

  switch (type.type) {
    case "array": {
      return `${parenthesizeType(type.elementType)}[]`;
    }
    case "conditional": {
      return `${renderType(type.checkType)} extends ${renderType(type.extendsType)} ? ${renderType(type.trueType)} : ${renderType(type.falseType)}`;
    }
    case "indexedAccess": {
      return `${renderType(type.objectType)}[${renderType(type.indexType)}]`;
    }
    case "intersection": {
      return (type.types ?? []).map((member) => renderType(member)).join(" & ");
    }
    case "intrinsic":
    case "typeParameter": {
      return type.name ?? "unknown";
    }
    case "literal": {
      return type.value === undefined
        ? "undefined"
        : JSON.stringify(type.value);
    }
    case "optional": {
      return `${renderType(type.elementType)}?`;
    }
    case "query": {
      return `typeof ${renderType(type.queryType)}`;
    }
    case "reference": {
      return `${type.name ?? "unknown"}${renderTypeArguments(type.typeArguments)}`;
    }
    case "reflection": {
      return renderReflectionType(type.declaration);
    }
    case "rest": {
      return `...${renderType(type.elementType)}`;
    }
    case "templateLiteral": {
      return `\`${type.head ?? ""}${(type.tail ?? []).map((part) => `\${${renderType(part.type)}}${part.text}`).join("")}\``;
    }
    case "tuple": {
      return `[${(type.elements ?? []).map((element) => renderType(element)).join(", ")}]`;
    }
    case "typeOperator": {
      return `${type.operator ?? ""} ${renderType(type.target)}`.trim();
    }
    case "union": {
      return (type.types ?? []).map((member) => renderType(member)).join(" | ");
    }
    default: {
      return type.name ?? "unknown";
    }
  }
}

function parenthesizeType(type: TypeDocumentType | undefined): string {
  const rendered = renderType(type);
  return type?.type === "union" || type?.type === "intersection"
    ? `(${rendered})`
    : rendered;
}

function renderTypeArguments(
  typeArguments: TypeDocumentType[] | undefined,
): string {
  return typeArguments
    ? `<${typeArguments.map((argument) => renderType(argument)).join(", ")}>`
    : "";
}

function renderReflectionType(
  declaration: TypeDocumentReflection | undefined,
): string {
  if (!declaration?.children?.length) return "object";

  return `{ ${declaration.children
    .map((member) => `${member.name}: ${renderType(member.type)}`)
    .join("; ")} }`;
}
