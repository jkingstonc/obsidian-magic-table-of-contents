import { App, PluginSettingTab, Setting } from "obsidian";
import MagicTableOfContentsPlugin from "./main";

export type LinkStyle = "markdown" | "wikilink";
const DEFAULT_TITLE = "Table of Contents";

export interface MagicTableOfContentsSettings {
  tocTitle: string;
  linkStyle: LinkStyle;
}

export const DEFAULT_SETTINGS: MagicTableOfContentsSettings = {
  tocTitle: DEFAULT_TITLE,
  linkStyle: "markdown",
};

export class MagicTableOfContentsSettingTab extends PluginSettingTab {
  plugin: MagicTableOfContentsPlugin;

  constructor(app: App, plugin: MagicTableOfContentsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Title")
      .setDesc(
        "The heading displayed above the table of contents. Leave blank for no title.",
      )
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_TITLE)
          .setValue(this.plugin.settings.tocTitle)
          .onChange(async (value) => {
            this.plugin.settings.tocTitle = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Link style")
      .setDesc(
        // eslint-disable-next-line obsidianmd/ui/sentence-case
        "Markdown uses [title](#anchor) links. Wikilink uses [[#Heading]] links (Obsidian native style).",
      )
      .addDropdown((dropdown) =>
        dropdown
          .addOption("markdown", "Markdown")
          .addOption("wikilink", "Wikilink")
          .setValue(this.plugin.settings.linkStyle)
          .onChange(async (value) => {
            this.plugin.settings.linkStyle = value as LinkStyle;
            await this.plugin.saveSettings();
          }),
      );
  }
}
