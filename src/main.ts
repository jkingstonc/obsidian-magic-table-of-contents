import { App, Editor, MarkdownView, Modal, Notice, Plugin } from "obsidian";
import {
  DEFAULT_SETTINGS,
  MagicTableOfContentsSettings as MagicTableOfContentsSettings,
  //   SampleSettingTab,
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

    // // This creates an icon in the left ribbon.
    // this.addRibbonIcon("dice", "Magic Table Of Contents", (evt: MouseEvent) => {
    //   // Called when the user clicks the icon.
    //   new Notice("This is a notice!");
    // });

    // // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
    // const statusBarItemEl = this.addStatusBarItem();
    // statusBarItemEl.setText("Status bar text");

    // // This adds a simple command that can be triggered anywhere
    // this.addCommand({
    //   id: "open-modal-simple",
    //   name: "Open modal (simple)",
    //   callback: () => {
    //     new SampleModal(this.app).open();
    //   },
    // });
    // // This adds an editor command that can perform some operation on the current editor instance
    // this.addCommand({
    //   id: "replace-selected",
    //   name: "Replace selected content",
    //   editorCallback: (editor: Editor, view: MarkdownView) => {
    //     editor.replaceSelection("Sample editor command");
    //   },
    // });
    // // This adds a complex command that can check whether the current state of the app allows execution of the command
    // this.addCommand({
    //   id: "open-modal-complex",
    //   name: "Open modal (complex)",
    //   checkCallback: (checking: boolean) => {
    //     // Conditions to check
    //     const markdownView =
    //       this.app.workspace.getActiveViewOfType(MarkdownView);
    //     if (markdownView) {
    //       // If checking is true, we're simply "checking" if the command can be run.
    //       // If checking is false, then we want to actually perform the operation.
    //       if (!checking) {
    //         new SampleModal(this.app).open();
    //       }

    //       // This command will only show up in Command Palette when the check function returns true
    //       return true;
    //     }
    //     return false;
    //   },
    // });

    // // This adds a settings tab so the user can configure various aspects of the plugin
    // this.addSettingTab(new SampleSettingTab(this.app, this));

    // // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
    // // Using this function will automatically remove the event listener when this plugin is disabled.
    // this.registerDomEvent(document, "click", (evt: MouseEvent) => {
    //   new Notice("Click");
    // });

    // // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    // this.registerInterval(
    //   window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000),
    // );
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
    const content = editor.getValue();
    const lines = content.split("\n");

    let toc: string[] = [];
    const headingRegex = /^(#{1,6})\s+(.*)/;

    for (const line of lines) {
      const match = line.match(headingRegex);

      if (match && match[1] && match[2]) {
        const level = match[1].length;
        const title = match[2];

        const anchor = title
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .replace(/\s+/g, "-");

        const indent = "  ".repeat(level - 1);

        toc.push(`${indent}- [${title}](#${anchor})`);
      }
    }

    if (toc.length === 0) {
      new Notice("No headings found.");
      return;
    }

    const tocBlock = `## Table of Contents
${toc.join("\n")}
---
`;

    // Insert TOC where the cursor currently is
    const cursor = editor.getCursor();
    editor.replaceRange(tocBlock, cursor);

    new Notice("Table of contents generated!");
  }
}

// class SampleModal extends Modal {
//   constructor(app: App) {
//     super(app);
//   }

//   onOpen() {
//     let { contentEl } = this;
//     contentEl.setText("Woah!");
//   }

//   onClose() {
//     const { contentEl } = this;
//     contentEl.empty();
//   }
// }
