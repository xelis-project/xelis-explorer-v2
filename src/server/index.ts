import { Hono } from "hono";
import { trimTrailingSlash } from "hono/trailing-slash";
import { languageDetector } from "hono/language";

import handleIndex from './routes/index';
import { supported_languages } from "../client/app/localization/localization";

export type App = { Bindings: CloudflareBindings };

const app = new Hono<App>();

app.use(
  languageDetector({
    supportedLanguages: supported_languages.map(x => x.key),
    fallbackLanguage: 'en',
    cookieOptions: {
      httpOnly: false
    }
  })
);
app.use(trimTrailingSlash());

handleIndex(app);

export default app;
