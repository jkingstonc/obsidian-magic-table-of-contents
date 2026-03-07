export class Plugin {
  app: any = {};
  addCommand() {}
  addSettingTab() {}
  loadData() {
    return Promise.resolve({});
  }
  saveData() {
    return Promise.resolve();
  }
  registerEvent() {}
  registerDomEvent() {}
  registerInterval() {}
}

export class Notice {
  constructor(public message: string) {}
}

export class PluginSettingTab {
  containerEl: any = { empty() {} };
  constructor(
    public app: any,
    public plugin: any,
  ) {}
}

export class Setting {
  constructor(_el: any) {}
  setName() {
    return this;
  }
  setDesc() {
    return this;
  }
  addText() {
    return this;
  }
}

export class Editor {}
export class MarkdownView {}
