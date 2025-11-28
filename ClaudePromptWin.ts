import { App, Modal, Notice } from 'obsidian';
import { claude } from './claude';
import type ClaudoPlugin from './main';

export class ClaudePromptWin extends Modal
{
    plugin: ClaudoPlugin;
    promptTextArea: HTMLTextAreaElement;
    confirmButton : HTMLButtonElement;
    cancelButton : HTMLButtonElement;
    type: HTMLSelectElement;

    constructor(app: App, plugin: ClaudoPlugin)
    {
        super(app);
        this.plugin = plugin;
    }

    onOpen()
    {
        const { contentEl } = this;
        contentEl.empty();
        
        contentEl.createEl('h2', { text: 'Claude Prompt' });

        this.type = contentEl.createEl("select", {"cls": "dropdown"});

        const option1 = this.type.createEl("option")
        option1.value = "exec"
        option1.text = "Do something"
        this.type.options.add(option1);

        const option2 = this.type.createEl("option")
        option2.value = "text"
        option2.text = "Respond"
        this.type.options.add(option2);

        this.type.value = this.plugin.settings.type;

        this.type.addEventListener("change", () => {
            this.plugin.settings.type = this.type.value;
            this.plugin.saveSettings();
        });

        // Create textarea for prompt
        const textAreaContainer = contentEl.createDiv({ cls: 'claudo-prompt-container' });
        this.promptTextArea = textAreaContainer.createEl('textarea', {
            cls: 'claudo-prompt-textarea',
            attr: {
                placeholder: 'Enter your prompt here...',
                rows: '20'
            }
        });

        // Add event listener for Enter key (Ctrl+Enter to submit)
        this.promptTextArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.submit();
            }
        });

        // Create button container
        const buttonContainer = contentEl.createDiv({ cls: 'claudo-button-container' });
        
        // Confirm button
        this.confirmButton = buttonContainer.createEl('button', {
            text: 'Send to Claudo',
            cls: 'mod-cta'
        });
        this.confirmButton.addEventListener('click', () => {
            this.submit();
        });

        // Cancel button
        this.cancelButton = buttonContainer.createEl('button', {
            text: 'Cancel'
        });
        this.cancelButton.addEventListener('click', () => {
            this.close();
        });

        // Add some styling
        const style = contentEl.createEl('style');
        style.textContent = `
            .claudo-prompt-container {
                margin: 20px 0;
            }
            .claudo-prompt-textarea {
                width: 100%;
                min-height: 200px;
                padding: 10px;
                font-family: inherit;
                font-size: 14px;
                border: 1px solid var(--background-modifier-border);
                border-radius: 4px;
                resize: vertical;
            }
            .claudo-button-container {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
        `;
    }

    async obsidianContext()
    {
        const activeFile = this.app.workspace.getActiveFile();
        
        if (!activeFile) {
            return null;
        }

        return {
            activeFilePath: activeFile.path,
            vaultPath: this.app.vault.adapter.getBasePath(),
            activeFileContent: await this.app.vault.read(activeFile),
        };
    }

    async submit()
    {
        const prompt = this.promptTextArea.value.trim();
        
        if (!prompt) {
            new Notice('Please enter a prompt');
            return;
        }

        if (!this.plugin.settings.apiKey) {
            new Notice('Please configure your API key in settings');
            return;
        }

        // Get current file content as context
        const contextInfo = await this.obsidianContext();
        if (!contextInfo)
        {
            new Notice('No active file found');
            return;
        }

        let context = '';
        
        if (contextInfo) {
            context = `Absolute Root Path : ${contextInfo.vaultPath}
Active File Path (relative to Root): ${contextInfo.activeFilePath}

Active File Content:
${contextInfo.activeFileContent}`;
        }

        new Notice ("Sending prompt to Claudo...");
        this.confirmButton.setText("...");

        if (this.type.value == "exec")
        {
            const response = await claude.send_n_exec(prompt, context, this.plugin.settings.model, contextInfo.vaultPath);
            new Notice(response);
        }
        else 
        {
            const response = await claude.send(prompt, context, this.plugin.settings.model, false);
            try
            {
                await this.app.vault.create("Claudo Response.md", response);
            }
            catch(e)
            {
                await this.app.vault.modify(this.app.vault.getAbstractFileByPath("Claudo Response.md"), response);
            }

            new Notice("Claudo responded to you in the file : Claud Response");
        }

        this.confirmButton.setText("Send to Claudo");
        this.close();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

export default ClaudePromptWin;
