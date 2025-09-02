import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
    envDir: "./env",
    plugins: [cloudflare()],
    build: {
        // generate .vite/manifest.json in outDir
        manifest: true,
        rollupOptions: {
            // overwrite default .html entry
            input: '/src/client/index.ts',
        },
    },
});