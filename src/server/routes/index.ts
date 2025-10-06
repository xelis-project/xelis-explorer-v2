import { Hono } from 'hono';
import { master } from '../templates/master';
import { App } from '..';
import { match_route } from '../../client/app/router';
import { Locale, Localization } from '../../client/app/localization/localization';

export default (app: Hono<App>) => {
    app.get(`*`, async (c) => {
        const lang = c.get(`language`);
        const localization = Localization.instance();
        localization.locale = lang as Locale;

        let head = ``;
        let body = ``;

        const page_type = match_route(new URL(c.req.url));

        await page_type.handle_server(c);

        let title = localization.get_text(page_type.get_title());
        let description = page_type.description;
        let status = page_type.status;

        const window_data = page_type.serialize_server_data(page_type.server_data);
        body += window_data;

        const html = master(c, { lang, title, description, body, head });
        return c.html(html, status);
    });
}
