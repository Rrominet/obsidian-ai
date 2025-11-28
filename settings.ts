export interface ClaudoSettings {
    apiKey: string;
    model: string;
    type: string;
    py_exec: string;
}

export const DEFAULT_SETTINGS: ClaudoSettings = {
    apiKey: '',
    model: 'claude-sonnet-4-5',
    type : "exec",
    py_exec: "/usr/bin/python3",
}

export class settings
{
    static async load(onloaded: () => any)
    {
        return Object.assign({}, DEFAULT_SETTINGS, await onloaded());
    }
}
