import {Notice} from 'obsidian';
import Anthropic from '@anthropic-ai/sdk';

// Ensure your API key is stored securely, e.g., in environment variables
let client: Anthropic;
let initialized = false;

export class claude
{
    static init(api_keys: string)
    {
        if(initialized)
            return;

        client = new Anthropic({apiKey: api_keys, dangerouslyAllowBrowser: true}); 
        initialized = true;
    }

    static exec_context()
    {
        return `You respond only Python code that will be directly executed (via python -c "your code").
Do not write anything else than the code.
No intro, no conclusion, just Python code, alone.
Don't rewrite the code as is. Your code should be executable.
Often you will need to write in file. Do not just rewrite the code you need to modify as an anwser.
Actually write the code you should modify or create in the correct file using python.
If you add any text that is not your code, the execution will fail and you ll have completly failed your task.
Add <<<PYTHON_CODE>>> before and after your code.
        `
    }

    static async send(prompt: string, context: string, model: string, exec: boolean = true)
    {
        let msg: Anthropic.Messages.Message & { _request_id?: string | null; };
        if (exec)
            context = claude.exec_context() + "\n\n" + context;
        try
        {
            msg = await client.messages.create({
                max_tokens: 16828, 
                system: context,
                messages: [{ role: 'user', content: prompt }],
                model : model,
            });
        }
        catch(e)
        {
            new Notice(`Error: ${e.message}`);
            return "";
        }

        return msg.content[0]["text"];
    }

    static response_to_code(response: string)
    {
        try
        {
            response = response.split("<<<PYTHON_CODE>>>")[1];
            response = response.replace(/```python/g, "");
            response = response.replace(/```/g, "");
        }
        catch(e)
        {
            new Notice(`Error: ${e.message}`);
            return "";
        }
        return response;
    }

    static async exec(code: string, cwd?: string, python_exec="python")
    {
        const fs = require('fs');
        const path = require('path');
        const os = require('os');
        
        // Write code to a temporary file
        const tmpDir = os.tmpdir();
        const tmpFile = path.join(tmpDir, `claudo_exec_obsidian_debug.py`);
        fs.writeFileSync(tmpFile, code);
        
        const { spawn } = require('child_process');
        return new Promise<string>((resolve, reject) => {
            const python = spawn(python_exec, ["-c", code], { cwd: cwd });
            let stdout = '';
            let stderr = '';

            python.stdout.on('data', (data: any) => {
                stdout += data.toString();
            });

            python.stderr.on('data', (data: any) => {
                stderr += data.toString();
            });

            python.on('close', (code: number) => {

                if (code !== 0) {
                    new Notice(`Python execution error: ${stderr}`);
                    console.error('Python execution error:', stderr);
                    reject(new Error(stderr));
                } else {
                    if (stderr) {
                        console.error('Python stderr:', stderr);
                    }
                    resolve(stdout);
                }
            });
        });
    }

    static async send_n_exec(prompt: string, context: string, model: string, cwd: string, python_exec="python") : Promise<string>
    {
        const response = await claude.send(prompt, context, model);
        const code = claude.response_to_code(response);
        return await claude.exec(code, cwd, python_exec);
    }
}
