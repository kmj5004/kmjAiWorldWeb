// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};

// Vite 환경변수 타입 선언 (프런트엔드에서 사용)
interface ImportMetaEnv {
    readonly VITE_API_BASE?: string;
}
interface ImportMeta {
    readonly env: ImportMetaEnv;
}
