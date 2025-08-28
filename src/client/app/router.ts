import { BlockPage } from "../pages/block/block";
import { BlocksPage } from "../pages/blocks/blocks";
import { DashboardPage } from "../pages/dashboard/dashboards";
import { MempoolPage } from "../pages/mempool/mempool";
import { NotFoundPage } from "../pages/not_found/not_found";
import { Page } from "../pages/page";
import { PeersPage } from "../pages/peers/peers";

export const pages = [
    DashboardPage,
    BlockPage,
    BlocksPage,
    MempoolPage,
    PeersPage
];

export const match_route = (url: URL): typeof Page => {
    const page_type = pages.find(page => {
        const pattern = page.get_pattern();
        return pattern.test(url);
    });

    if (page_type) return page_type;
    return NotFoundPage;
}
