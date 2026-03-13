# Obsidian Magic Table Of Contents

Do you need to create a table of contents that is _just_ markdown text and not a weird code block? Look no further!

![Obsidian Magic Table Of Contents Usage](./Magic%20Table%20Of%20Contents.gif)

## Features
- Raw text! No need for code blocks that are dynamically updated. You can share your notes with the table of contents as just plain text!
- Supports different link styles (`markdown` & `wikilink`)
- Create & Update existing table of contents

## Commands

### generate-toc

Generates a new table of contents at the cursor position

### update-toc

Updates the existing table of contents. It is reccomended to use an additional plugin to bind this command to the save command so that it's automatically generated on save.

## Development Guide

- Build the project `npm run build`
- Run tests `npm run test`
- Copy this folder to local Obsidian plugins install at `.obsidian/plugins/obsidian-magic-table-of-contents`

### Making a release

- Update `manifest.json` with new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.
