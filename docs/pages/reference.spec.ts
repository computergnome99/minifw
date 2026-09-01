import { expect, test } from "bun:test";
import type { DocumentationData } from "../data";
import {
  referenceDefaultPath,
  referenceTree,
  renderReference,
} from "./reference";

test("renders Typedoc modules, declarations, signatures, and members", () => {
  const data: DocumentationData = {
    schemaVersion: 1,
    package: { name: "@scope/example", version: "1.2.3" },
    modules: [
      {
        id: "core/example",
        name: "example",
        summary: "Module summary",
        exports: [
          {
            extends: ["Error"],
            name: "MiniError",
            kind: "class",
            summary: "An error.",
            remarks: "",
            examples: [],
            deprecated: "",
            type: "void",
            signatures: [],
            members: [
              {
                name: "constructor",
                kind: "constructor",
                summary: "",
                remarks: "",
                examples: [],
                deprecated: "",
                type: "void",
                signatures: [
                  {
                    typeParameters: [],
                    summary: "",
                    parameters: [
                      {
                        name: "message",
                        optional: false,
                        rest: false,
                        summary: "",
                        type: "string",
                      },
                    ],
                    returns: { summary: "", type: "MiniError" },
                  },
                ],
                members: [],
              },
            ],
          },
          {
            extends: ["BasePage"],
            name: "MiniPage",
            kind: "interface",
            typeParameters: ["Data"],
            summary: "A page contract.",
            remarks: "",
            examples: [],
            deprecated: "",
            type: "void",
            signatures: [],
            members: [
              {
                name: "head",
                kind: "property",
                optional: true,
                summary: "",
                remarks: "",
                examples: [],
                deprecated: "",
                type: "MiniHead",
                signatures: [],
                members: [],
              },
              {
                name: "render",
                kind: "method",
                summary: "",
                remarks: "",
                examples: [],
                deprecated: "",
                type: "void",
                signatures: [
                  {
                    typeParameters: [],
                    summary: "",
                    parameters: [],
                    returns: { summary: "", type: "Promise<string>" },
                  },
                ],
                members: [],
              },
            ],
          },
          {
            name: "example",
            kind: "function",
            summary:
              "Creates **formatted** `markup`.\n\n```ts\nconst markup = example();\n```",
            remarks: "Additional [detail](https://example.com).",
            examples: ["```ts\nexample({ enabled: true });\n```"],
            deprecated: "Use `replacement` instead",
            type: "void",
            signatures: [
              {
                typeParameters: ["Value"],
                summary: "Creates an example.",
                parameters: [
                  {
                    name: "options",
                    optional: true,
                    rest: false,
                    summary: "Uses `Options`.",
                    type: "Options<Value>",
                  },
                ],
                returns: {
                  summary: "The **result**.",
                  type: "Example<Value>",
                },
              },
            ],
            members: [
              {
                name: "value",
                kind: "property",
                summary: "Current value",
                remarks: "",
                examples: [],
                deprecated: "",
                type: "string",
                signatures: [],
                members: [],
              },
            ],
          },
        ],
      },
    ],
  };

  const output = renderReference(data, data.modules[0]!);

  expect(output).toContain("@scope/example API Reference");
  expect(output).toContain("core/example");
  expect(output).toContain("function example");
  expect(output).toContain('<span class="hljs-keyword">interface</span>');
  expect(output).toContain(
    'MiniPage</span>&lt;<span class="hljs-title class_">Data',
  );
  expect(output).toContain(
    'head</span>?: <span class="hljs-title class_">MiniHead',
  );
  expect(output).toContain('<span class="hljs-keyword">class</span>');
  expect(output).toContain('constructor</span>(<span class="hljs-params">');
  expect(output).toContain('class="language-ts"');
  expect(output).toContain('example&lt;<span class="hljs-title class_">Value');
  expect(output).toContain(
    'options</span>?: <span class="hljs-title class_">Options',
  );
  expect(output).toContain("Deprecated:");
  expect(output).toContain("property value");
  expect(output).toContain(
    "Creates <strong>formatted</strong> <code>markup</code>.",
  );
  expect(output).toContain('class="language-ts"');
  expect(output).toContain('<a href="https://example.com">detail</a>');
  expect(output).toContain("Use <code>replacement</code> instead");
  expect(output).toContain("Uses <code>Options</code>.");
  expect(output).toContain("The <strong>result</strong>.");
});

test("derives grouped reference navigation from the Typedoc manifest", async () => {
  const output = await referenceTree();

  expect(referenceDefaultPath).toStartWith("core/");
  expect(output).toContain('aria-label="API reference sections"');
  expect(output).toContain("<summary>Core</summary>");
  expect(output).toContain("<summary>Helpers</summary>");
  expect(output).toContain('href="/reference/core/mini"');
  expect(output).toContain('href="/reference/helpers/html"');
});
