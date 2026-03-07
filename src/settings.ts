import { App, PluginSettingTab, Setting } from "obsidian";
import MagicTableOfContentsPlugin from "./main";

export interface MagicTableOfContentsSettings {
  tocTitle: string;
}

export const DEFAULT_SETTINGS: MagicTableOfContentsSettings = {
  tocTitle: "Table of Contents",
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
  }
}
