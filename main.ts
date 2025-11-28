import { Plugin} from 'obsidian';
import { ClaudoSettings, DEFAULT_SETTINGS, settings } from './settings';
import { ClaudePromptWin } from './ClaudePromptWin';
import { ClaudoSettingTab } from './ClaudeSettingTab';
import { claude } from './claude';

export default class ClaudoPlugin extends Plugin {
    settings: ClaudoSettings;

    async onload() {
        this.settings = await settings.load(() => this.loadData());
        claude.init(this.settings.apiKey);

        // Register command to open Claude prompt
        this.addCommand({
            id: 'open-claude-prompt',
            name: 'Open Claude Prompt',
            callback: () => {
                new ClaudePromptWin(this.app, this).open();
            }
        });

        // Add settings tab
        this.addSettingTab(new ClaudoSettingTab(this.app, this));
    }

    onunload() {
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

