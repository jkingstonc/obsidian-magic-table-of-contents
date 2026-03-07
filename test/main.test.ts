import { describe, it, expect, beforeEach } from "vitest";
import MagicTableOfContentsPlugin from "../src/main";

/**
 * Creates a mock Editor backed by a simple string document.
 * Tracks replaceRange calls and simulates getValue/getCursor.
 */
function createMockEditor(content: string, cursorLine = 0, cursorCh = 0) {
  let doc = content;

  const editor = {
    getValue: () => doc,
    getCursor: () => ({ line: cursorLine, ch: cursorCh }),
    replaceRange: (
      text: string,
      from: { line: number; ch: number },
      to?: { line: number; ch: number },
    ) => {
      const lines = doc.split("\n");
      const actualTo = to ?? from;

      const beforeLines = lines.slice(0, from.line);
      const fromLineText = lines[from.line] ?? "";
      const toLineText = lines[actualTo.line] ?? "";
      const afterLines = lines.slice(actualTo.line + 1);

      const prefix = fromLineText.slice(0, from.ch);
      const suffix = toLineText.slice(actualTo.ch);

      doc = [...beforeLines, prefix + text + suffix, ...afterLines].join("\n");
    },
  };

  return {
    editor: editor as any,
    getDoc: () => doc,
  };
}

function createPlugin(tocTitle = "Table of Contents") {
  const plugin = Object.create(MagicTableOfContentsPlugin.prototype);
  plugin.settings = { tocTitle };
  return plugin as MagicTableOfContentsPlugin;
}

describe("generateToc", () => {
  let plugin: MagicTableOfContentsPlugin;

  beforeEach(() => {
    plugin = createPlugin();
  });

  it("generates a TOC from headings and inserts at cursor", () => {
    const { editor, getDoc } = createMockEditor(
      "# Introduction\n\nSome text\n\n## Getting started\n\n### Installation",
      1,
      0,
    );

    plugin.generateToc(editor);

    const doc = getDoc();
    expect(doc).toContain("# Table of Contents");
    expect(doc).toContain("- [Introduction](#introduction)");
    expect(doc).toContain("  - [Getting started](#getting-started)");
    expect(doc).toContain("    - [Installation](#installation)");
    expect(doc).toContain("---");
  });

  it("generates a TOC with no title when tocTitle is blank", () => {
    plugin = createPlugin("");
    const { editor, getDoc } = createMockEditor("# Hello\n\n## World", 0, 0);

    plugin.generateToc(editor);

    const doc = getDoc();
    expect(doc).not.toContain("# Table of Contents");
    expect(doc).toContain("- [Hello](#hello)");
    expect(doc).toContain("  - [World](#world)");
  });

  it("generates a TOC with a custom title", () => {
    plugin = createPlugin("Contents");
    const { editor, getDoc } = createMockEditor("# Foo\n## Bar", 0, 0);

    plugin.generateToc(editor);

    const doc = getDoc();
    expect(doc).toContain("# Contents");
    expect(doc).toContain("- [Foo](#foo)");
  });

  it("shows notice when no headings found", () => {
    const { editor, getDoc } = createMockEditor(
      "Just some text\nNo headings here",
    );

    const originalDoc = getDoc();
    plugin.generateToc(editor);

    // Document should be unchanged
    expect(getDoc()).toBe(originalDoc);
  });

  it("handles special characters in headings", () => {
    const { editor, getDoc } = createMockEditor("# Hello, World! (2024)");

    plugin.generateToc(editor);

    const doc = getDoc();
    expect(doc).toContain("- [Hello, World! (2024)](#hello-world-2024)");
  });

  it("handles all heading levels", () => {
    const { editor, getDoc } = createMockEditor(
      "# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6",
    );

    plugin.generateToc(editor);

    const doc = getDoc();
    expect(doc).toContain("- [H1](#h1)");
    expect(doc).toContain("  - [H2](#h2)");
    expect(doc).toContain("    - [H3](#h3)");
    expect(doc).toContain("      - [H4](#h4)");
    expect(doc).toContain("        - [H5](#h5)");
    expect(doc).toContain("          - [H6](#h6)");
  });
});

describe("updateToc", () => {
  let plugin: MagicTableOfContentsPlugin;

  beforeEach(() => {
    plugin = createPlugin();
  });

  it("replaces an existing TOC in place", () => {
    const existingDoc = [
      "# Table of Contents",
      "- [Old heading](#old-heading)",
      "---",
      "# New heading",
      "",
      "Some content",
    ].join("\n");

    const { editor, getDoc } = createMockEditor(existingDoc);

    plugin.updateToc(editor);

    const doc = getDoc();
    expect(doc).not.toContain("Old heading");
    expect(doc).toContain("- [New heading](#new-heading)");
    expect(doc).toContain("# Table of Contents");
  });

  it("updates a TOC that has no title heading", () => {
    plugin = createPlugin("");
    const existingDoc = ["- [Old](#old)", "---", "# Actual heading"].join("\n");

    const { editor, getDoc } = createMockEditor(existingDoc);

    plugin.updateToc(editor);

    const doc = getDoc();
    expect(doc).not.toContain("Old");
    expect(doc).toContain("- [Actual heading](#actual-heading)");
  });

  it("preserves content before and after the TOC", () => {
    const existingDoc = [
      "Some intro text",
      "# Table of Contents",
      "- [Old](#old)",
      "---",
      "# Real heading",
      "Paragraph here",
    ].join("\n");

    const { editor, getDoc } = createMockEditor(existingDoc);

    plugin.updateToc(editor);

    const doc = getDoc();
    expect(doc).toContain("Some intro text");
    expect(doc).toContain("Paragraph here");
    expect(doc).toContain("- [Real heading](#real-heading)");
    expect(doc).not.toContain("Old");
  });

  it("shows notice when no existing TOC is found", () => {
    const { editor, getDoc } = createMockEditor(
      "# Just a heading\n\nSome text",
    );

    const originalDoc = getDoc();
    plugin.updateToc(editor);

    // No TOC entries to find, so document stays the same
    expect(getDoc()).toBe(originalDoc);
  });

  it("handles TOC with nested entries", () => {
    const existingDoc = [
      "# Table of Contents",
      "- [Old h1](#old-h1)",
      "  - [Old h2](#old-h2)",
      "---",
      "# New h1",
      "## New h2",
      "### New h3",
    ].join("\n");

    const { editor, getDoc } = createMockEditor(existingDoc);

    plugin.updateToc(editor);

    const doc = getDoc();
    expect(doc).toContain("- [New h1](#new-h1)");
    expect(doc).toContain("  - [New h2](#new-h2)");
    expect(doc).toContain("    - [New h3](#new-h3)");
    expect(doc).not.toContain("Old h1");
  });
});
