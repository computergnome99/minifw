import { describe, expect, test } from "bun:test";
import { treeview } from "./treeview";

const tree = treeview({
  nodes: [{ label: "Overview", href: "#documentation" }],
  groups: [
    {
      id: "formatting",
      label: "Formatting",
      nodes: [
        { label: "Text formatting", href: "#text-formatting" },
        { label: "Headings", href: "#headings" },
        { label: "Lists", href: "#lists" },
        { label: "Quotes and callouts", href: "#quotes-and-callouts" },
      ],
    },
    {
      id: "content",
      label: "Content",
      nodes: [
        { label: "Code", href: "#code" },
        { label: "Tables", href: "#tables" },
        { label: "Media and HTML", href: "#media-and-html" },
      ],
    },
  ],
});

describe("documentationTreeview", () => {
  test("renders a collapsed native disclosure navigation", async () => {
    const output = await tree();

    expect(output).toContain('aria-label="Documentation sections"');
    expect(output).toContain("<details");
    expect(output).toMatch(/<summary[^>]*>\s*Formatting\s*<\/summary>/);
    expect(output).toContain('href="#documentation">Overview</a>');
    expect(output).not.toMatch(/<details[^>]*\sopen(?:\s|>)/);
    expect(output).toContain('id="docs-tree-formatting"');
    expect(output).not.toMatch(/<\/li>\s*,\s*<li/);
  });

  test("does not add custom tree semantics", async () => {
    const output = await tree();

    expect(output).not.toContain('role="tree"');
    expect(output).not.toContain('role="treeitem"');
    expect(output).not.toContain("tabindex=");
    expect(output).not.toContain("data-tree-focus");
    expect(output).not.toContain("hx-get=");
  });
});
