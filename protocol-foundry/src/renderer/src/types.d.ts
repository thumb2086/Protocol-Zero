/// <reference types="vite/client" />

interface FoundryAPI {
    readFile: (path: string) => Promise<{ success: boolean; data?: string; error?: string }>;
    writeFile: (path: string, data: string) => Promise<{ success: boolean; error?: string }>;
    listFiles: (dir: string) => Promise<{ success: boolean; files?: string[]; error?: string }>;
    ensureDir: (dir: string) => Promise<{ success: boolean; error?: string }>;
    getPath: (type: 'foundry' | 'blueprints' | 'profiles', ...parts: string[]) => Promise<{ success: boolean; path?: string; error?: string }>;
}

declare global {
    interface Window {
        foundry: FoundryAPI;
    }
}

declare module "*.json" {
    const value: any;
    export default value;
}

export { };
