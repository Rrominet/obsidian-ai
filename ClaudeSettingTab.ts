import { App, PluginSettingTab, Setting} from 'obsidian';
import type ClaudoPlugin from './main';

export class ClaudoSettingTab extends PluginSettingTab {
    plugin: ClaudoPlugin;

    constructor(app: App, plugin: ClaudoPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Claudo Settings' });

        // API Key setting
        new Setting(containerEl)
            .setName('API Key')
            .setDesc('Enter your Claude API key')
            .addText(text => text
                .setPlaceholder('sk-ant-...')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));

        // Model setting
        new Setting(containerEl)
            .setName('Model')
            .setDesc('Select the Claude model to use')
            .addDropdown(dropdown => dropdown
                .addOption('claude-opus-4-5', 'Claude 4 Opus')
                .addOption('claude-sonnet-4-5', 'Claude 4 Sonnet')
                .addOption('claude-haiku-4-5', 'Claude 4 Haiku')
                .setValue(this.plugin.settings.model)
                .onChange(async (value) => {
                    this.plugin.settings.model = value;
                    await this.plugin.saveSettings();
                }));
                //
        // API Key setting
        new Setting(containerEl)
            .setName('Python')
            .setDesc('Enter your Python executable path')
            .addText(text => text
                .setPlaceholder('/path/to/your/python/bin')
                .setValue(this.plugin.settings.py_exec)
                .onChange(async (value) => {
                    this.plugin.settings.py_exec = value;
                    await this.plugin.saveSettings();
                }));
    }
}
