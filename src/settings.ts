import { App, PluginSettingTab, Setting } from "obsidian";
import MagicTableOfContentsPlugin from "./main";

export type LinkStyle = "markdown" | "wikilink";

export interface MagicTableOfContentsSettings {
  tocTitle: string;
  linkStyle: LinkStyle;
}

export const DEFAULT_SETTINGS: MagicTableOfContentsSettings = {
  tocTitle: "Table of Contents",
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
          .setPlaceholder("Table Of Contents")
          .setValue(this.plugin.settings.tocTitle)
          .onChange(async (value) => {
            this.plugin.settings.tocTitle = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Link style")
      .setDesc(
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
