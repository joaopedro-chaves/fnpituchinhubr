/// <reference types="vite/client" />

export {};

declare global {
    interface Window {
        __recordPerfRender?: (key: string) => void;
    }
}
