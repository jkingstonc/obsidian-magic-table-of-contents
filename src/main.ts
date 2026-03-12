import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import {
  DEFAULT_SETTINGS,
  MagicTableOfContentsSettings,
  MagicTableOfContentsSettingTab,
} from "./settings";

export default class MagicTableOfContentsPlugin extends Plugin {
  settings: MagicTableOfContentsSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "generate-toc",
      name: "Generate table of contents",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.generateToc(editor);
      },
    });

    this.addCommand({
      id: "update-toc",
      name: "Update existing table of contents",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.updateToc(editor);
      },
    });

    this.addSettingTab(new MagicTableOfContentsSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as Partial<MagicTableOfContentsSettings>,
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  generateToc(editor: Editor) {
    // Generate a table of contents at the current cursor position
    const cursor = editor.getCursor();
    this.generateTocAtPosition(editor, cursor);
  }

  updateToc(editor: Editor) {
    // Update the existing table of contents
    // The current table will be located with regex, then removed, and then re-generated
    const content = editor.getValue();
    const lines = content.split("\n");

    const tocEntryRegex = /^\s*(?:- \[.*\]\(#.*\)|- \[\[#.*\]\])$/;

    // Find first contiguous block of TOC-style link entries
    let firstEntry = -1;
    let lastEntry = -1;

    // find the very first & last table of contents entry in the page
    // iterate through every line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      if (tocEntryRegex.test(line)) {
        // if this is the first entry we've seen, then set it
        if (firstEntry === -1) {
          firstEntry = i;
        }
        // set the last entry to this
        lastEntry = i;
      } else if (firstEntry !== -1) {
        break;
      }
    }

    if (firstEntry === -1) {
      new Notice("No existing table of contents found.");
      return;
    }

    // Expand range to include a preceding heading and a trailing ---
    let tocStart = firstEntry;
    let tocEnd = lastEntry;

    const tocTitleRegex = /^#{1,6}\s+/;
    if (firstEntry > 0 && tocTitleRegex.test(lines[firstEntry - 1]!)) {
      tocStart = firstEntry - 1;
    }

    const endSeperatorRegex = /^---$/;
    if (
      tocEnd + 1 < lines.length &&
      endSeperatorRegex.test(lines[tocEnd + 1]!)
    ) {
      tocEnd = tocEnd + 1;
    }

    // Delete the old TOC (including its trailing newline)
    const from = { line: tocStart, ch: 0 };
    const to =
      tocEnd + 1 < lines.length
        ? { line: tocEnd + 1, ch: 0 }
        : { line: tocEnd, ch: lines[tocEnd]!.length };
    editor.replaceRange("", from, to);

    // Re-insert table of contents at the same position
    this.generateTocAtPosition(editor, from);
  }

  private generateTocAtPosition(
    editor: Editor,
    position: { line: number; ch: number },
  ) {
    const content = editor.getValue();
    const lines = content.split("\n");

    const headingRegex = /^(#{1,6})\s+(.*)/;
    const toc: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i]!.match(headingRegex);
      if (match && match[1] && match[2]) {
        const level = match[1].length;
        const title = match[2];
        const indent = "  ".repeat(level - 1);

        if (this.settings.linkStyle === "wikilink") {
          toc.push(`${indent}- [[#${title}]]`);
        } else if(this.settings.linkStyle === "markdown") {
          const anchor = title
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .replace(/\s+/g, "-");
          toc.push(`${indent}- [${title}](#${anchor})`);
        }else{
          new Notice("Invalid link style.");
          return;
        }
      }
    }

    if (toc.length === 0) {
      new Notice("No headings found.");
      return;
    }

    const titleText = this.settings.tocTitle.trim();

    if (titleText) {
      editor.replaceRange(`# ${titleText}\n${toc.join("\n")}\n---\n`, position);
    } else {
      editor.replaceRange(`${toc.join("\n")}\n---\n`, position);
    }

    new Notice("Table of contents generated!");
  }
}
