import { Hono } from "hono";
import { trimTrailingSlash } from "hono/trailing-slash";
import { languageDetector } from "hono/language";
import { get_supported_languages } from "../client/localization/supported_languages";

import handleIndex from './routes/index';

export type ServerApp = { Bindings: CloudflareBindings };

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

handleIndex(app);

export default app;
