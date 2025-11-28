export interface ClaudoSettings {
    apiKey: string;
    model: string;
    type: string;
}

export const DEFAULT_SETTINGS: ClaudoSettings = {
    apiKey: '',
    model: 'claude-sonnet-4-5',
    type : "exec",
}

export class settings
{
    static async load(onloaded: () => any)
    {
        return Object.assign({}, DEFAULT_SETTINGS, await onloaded());
    }
}
