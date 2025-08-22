import { BlockPage } from "../pages/block/block";
import { DashboardPage } from "../pages/dashboard/dashboards";
import { NotFoundPage } from "../pages/not_found/not_found";
import { Page } from "../pages/page";

export const pages = [DashboardPage, BlockPage];

export const match_route = (url: URL): typeof Page => {
    const page_type = pages.find(page => {
        const pattern = page.get_pattern();
        return pattern.test(url);
    });

    if (page_type) return page_type;
    return NotFoundPage;
}
