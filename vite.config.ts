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
            output: {
                assetFileNames: (asset_info) => {
                    const original_filename = asset_info.originalFileNames[0];
                    if (original_filename && original_filename.startsWith(`node_modules/flag-icons/`)) {
                        return `flags/[name]-[hash][extname]`
                    }

                    return 'assets/[name]-[hash][extname]';
                },
                manualChunks: {
                    three: ['three', 'camera-controls'],
                    animejs: ['animejs'],
                    d3: ['d3']
                }
            }
        },
    },
});