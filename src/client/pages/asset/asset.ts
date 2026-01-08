import { Context } from "hono";
import { Page } from "../page";
import { ServerApp } from "../../../server";
import { XelisNode } from "../../app/xelis_node";
import DaemonRPC from '@xelis/sdk/daemon/rpc';
import { Master } from "../../components/master/master";
import { AssetWithData, RPCMethod as DaemonRPCMethod, GetAssetParams, GetAssetSupplyResult } from "@xelis/sdk/daemon/types";
import { RPCRequest } from "@xelis/sdk/rpc/types";
import { NotFoundPage } from "../not_found/not_found";
import { localization } from "../../localization/localization";
import { reduce_text } from "../../utils/reduce_text";

import './asset.css';

interface AssetPageServerData {
    asset: AssetWithData
    supply: GetAssetSupplyResult
}

export class AssetPage extends Page {
    static pathname = "/asset/:id";

    static get_pattern_id = (href: string) => {
        const pattern_result = this.exec_pattern(href);
        if (pattern_result) {
            const id = pattern_result.pathname.groups.id;
            return id;
        }
    }

    static async load_server_data(daemon: DaemonRPC, asset_hash: string) {
        const server_data = { } as AssetPageServerData;

        {
            const requests = [
                {
                    method: DaemonRPCMethod.GetAsset,
                    params: { asset: asset_hash } as GetAssetParams
                },
                {
                    method: DaemonRPCMethod.GetAssetSupply,
                    params: { asset: asset_hash } as GetAssetParams
                },
            ] as RPCRequest[];


            const res = await daemon.batchRequest(requests);
            res.forEach((result, i) => {
                if (result instanceof Error) {
                    throw result;
                } else {
                    switch (i) {
                        case 0: // GetAsset
                            server_data.asset = (result as AssetWithData);
                            break;
                        case 1: // GetAssetSupply
                            server_data.supply = (result as GetAssetSupplyResult);
                            break;
                    }
                }
            });
        }

        return server_data;
    }

    static async handle_server(c: Context<ServerApp>) {
        let id = AssetPage.get_pattern_id(c.req.url);
        if (!id) {
            this.status = 404;
            return;
        }

        this.server_data = undefined;

        const daemon = new DaemonRPC(c.get(`node_endpoint`));

        const asset_hash = id;
        this.title = localization.get_text(`Asset {}`, [reduce_text(asset_hash)]);
        this.description = localization.get_text(`Asset details of {}`, [asset_hash]);

        try {
            this.server_data = await this.load_server_data(daemon, asset_hash);
        } catch {
            this.status = 404;
        }
    }

    master: Master;
    page_data: {
        server_data?: AssetPageServerData;
    };

    constructor() {
        super();
        this.page_data = {};

        this.master = new Master();
        this.master.content.classList.add(`xe-asset`);
        this.element.appendChild(this.master.element);

        const sub_container_1 = document.createElement(`div`);
        this.master.content.appendChild(sub_container_1);
    }

    async load_asset() {
        const { server_data, consumed } = AssetPage.consume_server_data<AssetPageServerData>();
        const id = AssetPage.get_pattern_id(window.location.href);

        this.page_data = {
            server_data
        };

        try {
            if (!consumed && id) {
                const contract_hash = id;
                this.set_window_title(`Asset ${reduce_text(contract_hash)}`);

                const node = XelisNode.instance();
                this.page_data.server_data = await AssetPage.load_server_data(node.rpc, contract_hash);
            }
        } catch {

        }
    }

    async load(parent: HTMLElement) {
        super.load(parent);

        await this.load_asset();

        const { server_data } = this.page_data;
        if (server_data) {
            this.set_element(this.master.element);
        } else {
            this.set_element(NotFoundPage.instance().element);
        }
    }

    unload() {
        super.unload();
    }
}