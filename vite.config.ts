import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import checker from "vite-plugin-checker";

// https://vite.dev/config/
export default defineConfig({
    envDir: "./env",
    plugins: [
        cloudflare(),
        checker({
            typescript: true
        })
    ],
    build: {
        // generate .vite/manifest.json in outDir
        manifest: true,
        rollupOptions: {
            // overwrite default .html entry
            input: '/src/client/index.ts',
        },
    },
});