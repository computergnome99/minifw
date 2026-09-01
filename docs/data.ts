export interface DocumentationData {
  schemaVersion: 1;
  package: {
    name: string;
    version: string;
  };
  modules: DocumentationModule[];
}

export interface DocumentationModule {
  id: string;
  name: string;
  summary: string;
  exports: DocumentationDeclaration[];
}

export interface DocumentationDeclaration {
  name: string;
  kind: DocumentationDeclarationKind;
  summary: string;
  remarks: string;
  examples: string[];
  deprecated: string;
  type: string;
  signatures: DocumentationSignature[];
  members: DocumentationDeclaration[];
}

export type DocumentationDeclarationKind =
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

export interface DocumentationSignature {
  typeParameters: string[];
  summary: string;
  parameters: DocumentationParameter[];
  returns: DocumentationReturn;
}

export interface DocumentationParameter {
  name: string;
  optional: boolean;
  rest: boolean;
  summary: string;
  type: string;
}

export interface DocumentationReturn {
  summary: string;
  type: string;
}

/**
 * Load the generated documentation manifest.
 *
 * @throws {Error} When the manifest is missing or invalid.
 */
export async function loadDocumentationData(): Promise<DocumentationData> {
  try {
    const data: unknown = await Bun.file(
      new URL("data.json", import.meta.url),
    ).json();

    if (!isDocumentationData(data)) {
      throw new TypeError("The documentation manifest has an invalid shape.");
    }

    return data;
  } catch (error) {
    throw new Error(
      'Unable to load documentation data. Run "bun run docs:build" from the repository root and try again.',
      { cause: error },
    );
  }
}

function isDocumentationData(value: unknown): value is DocumentationData {
  if (typeof value !== "object" || value === null) return false;

  const data = value as {
    schemaVersion?: unknown;
    package?: { name?: unknown; version?: unknown };
    modules?: unknown;
  };

  return (
    data.schemaVersion === 1 &&
    typeof data.package?.name === "string" &&
    typeof data.package.version === "string" &&
    Array.isArray(data.modules)
  );
}
