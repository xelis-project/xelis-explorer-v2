import { Context } from 'hono';
import pretty from 'pretty';
import { App } from '..';
import { ManifestChunk } from 'vite';

interface MasterProps {
    head: string;
    body: string;
    title?: string;
    description?: string;
    lang: string;
}

export const master = async (c: Context<App>, props: MasterProps) => {
    let { head, body, title, lang, description } = props;

    let client_js_src = "src/client/index.ts";
    let client_css_src = "";

    if (!import.meta.env.DEV) {
        // TODO: maybe create a plugin to overwrite directly in the dist/index.js
        const url = new URL(c.req.url);
        const manifest_link = new URL(`.vite/manifest.json`, url.origin)
        const manifest_res = await c.env.ASSETS.fetch(manifest_link);
        const manifest_data = await manifest_res.json<Record<string, ManifestChunk>>();
        const manifest_chunk = manifest_data[client_js_src];
        if (manifest_chunk) {
            client_js_src = manifest_chunk.file;
            client_css_src = manifest_chunk.css ? manifest_chunk.css[0] : "";
        }
    }

    const html = `
        <!DOCTYPE html>
            <html lang="${lang}">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title ? `${title} - XELIS Explorer` : `XELIS Explorer`}</title>
                <meta name="theme-color" content="#7afad3" />
                ${description ? `<meta name="description" content="${description}">` : ``}
                <link rel="icon" type="image/png" href="/favicon/favicon-48x48.png" sizes="48x48" />
                <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
                <link rel="shortcut icon" href="/favicon/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
                <link rel="manifest" href="/favicon/site.webmanifest" />
                ${client_css_src ? `<link rel="stylesheet" href="/${client_css_src}" />` : ``}
                ${head}
            </head>

            <body>
                <div id="app"></div>
                <script type="module" src="/${client_js_src}"></script>
                ${body}
            </body>
        </html>
    `;

    return pretty(html);
}