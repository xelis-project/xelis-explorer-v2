import { Hono } from "hono";
import { trimTrailingSlash } from "hono/trailing-slash";
import { languageDetector } from "hono/language";
import { get_supported_languages } from "../client/localization/supported_languages";

import handleIndex from './routes/index';
import { getCookie } from "hono/cookie";

export type ServerApp = { Bindings: CloudflareBindings, Variables: { node_endpoint: string } };

const app = new Hono<ServerApp>();

app.use(
    languageDetector({
        supportedLanguages: get_supported_languages().map(x => x.key),
        fallbackLanguage: 'en',
        cookieOptions: {
            httpOnly: false
        }
    })
);
app.use(trimTrailingSlash());
app.use(async (c, next) => {
    const node_endpoint = getCookie(c, `node`) || import.meta.env.VITE_XELIS_NODE_RPC;
    c.set(`node_endpoint`, node_endpoint);
    await next();
});

handleIndex(app);

export default app;
