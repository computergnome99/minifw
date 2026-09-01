import { describe, expect, test } from "bun:test";
import { documentationTreeview } from "./documentation-treeview";

describe("documentationTreeview", () => {
  test("renders a collapsed, accessible documentation tree", async () => {
    const output = await documentationTreeview.render({
      request: new Request("http://localhost/partial/documentationTreeview", {
        headers: { "HX-Request": "true" },
      }),
      url: new URL("http://localhost/partial/documentationTreeview"),
      route: "/partial/documentationTreeview",
      params: {},
      isHtmx: true,
    });

    expect(output).toContain('aria-label="Documentation sections"');
    expect(output).toContain('role="tree"');
    expect(output).toContain('role="treeitem"');
    expect(output).toContain('aria-expanded="false"');
    expect(output).toContain(
      'hx-get="/partial/documentationTreeview?expanded=formatting&focus=formatting"',
    );
    expect(output).not.toContain('id="docs-tree-formatting" role="group"');
    expect(output).not.toMatch(/<\/li>\s*,\s*<li/);
  });

  test("renders the requested expanded branch and preserves its focus target", async () => {
    const output = await documentationTreeview.render({
      request: new Request(
        "http://localhost/partial/documentationTreeview?expanded=formatting&focus=formatting",
        { headers: { "HX-Request": "true" } },
      ),
      url: new URL(
        "http://localhost/partial/documentationTreeview?expanded=formatting&focus=formatting",
      ),
      route: "/partial/documentationTreeview",
      params: {},
      isHtmx: true,
    });

    expect(output).toContain('aria-expanded="true"');
    expect(output).toContain('data-tree-focus="true"');
    expect(output).toContain('id="docs-tree-formatting" role="group"');
    expect(output).toContain('href="#text-formatting"');
    expect(output).toContain('href="#quotes-and-callouts"');
    expect(output.match(/tabindex="0"/g)).toHaveLength(1);
    expect(output).not.toMatch(/<\/li>\s*,\s*<li/);
  });

  test("preserves the collapsed branch as the focus target", async () => {
    const output = await documentationTreeview.render({
      request: new Request(
        "http://localhost/partial/documentationTreeview?focus=formatting",
        { headers: { "HX-Request": "true" } },
      ),
      url: new URL(
        "http://localhost/partial/documentationTreeview?focus=formatting",
      ),
      route: "/partial/documentationTreeview",
      params: {},
      isHtmx: true,
    });

    expect(output).toContain('aria-expanded="false"');
    expect(output).toContain('data-tree-focus="true"');
    expect(output).toContain('tabindex="0"');
    expect(output.match(/tabindex="0"/g)).toHaveLength(1);
    expect(output).not.toContain('id="docs-tree-formatting" role="group"');
  });
});
