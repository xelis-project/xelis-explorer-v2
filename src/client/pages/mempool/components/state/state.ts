import { Container } from "../../../../components/container/container";
import { MempoolTxTypeBars } from "./tx_type_bars";
import { MempoolTotal } from "./total";

import './state.css';
import { MempoolTxSizeTreeMap } from "./tx_size_map";
import { Block, GetMempoolResult, Transaction } from "@xelis/sdk/daemon/types";

export class MempoolState {
    container: Container;

    mempool_total: MempoolTotal;
    mempool_tx_type_bars: MempoolTxTypeBars;
    mempool_tx_size_tree_map: MempoolTxSizeTreeMap;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-mempool-state`);

        const container_1 = document.createElement(`div`);
        container_1.classList.add(`xe-mempool-state-container-1`);
        this.container.element.appendChild(container_1);

        this.mempool_total = new MempoolTotal();
        container_1.appendChild(this.mempool_total.box.element);

        this.mempool_tx_type_bars = new MempoolTxTypeBars();
        container_1.appendChild(this.mempool_tx_type_bars.element);

        const container_2 = document.createElement(`div`);
        this.container.element.appendChild(container_2);

        this.mempool_tx_size_tree_map = new MempoolTxSizeTreeMap();
        container_2.appendChild(this.mempool_tx_size_tree_map.box.element);
    }

    reset() {
        this.mempool_total.set_tx_count(0);
        this.mempool_total.set_timer(Date.now());

        this.mempool_total.set_fees(0);
        this.mempool_total.set_size(0);

        this.mempool_tx_type_bars.set_transfer_count(0, 0);
        this.mempool_tx_type_bars.set_contract_invoke_count(0, 0);
        this.mempool_tx_type_bars.set_multisig_count(0, 0);
        this.mempool_tx_type_bars.set_contract_deploy_count(0, 0);
        this.mempool_tx_type_bars.set_burn_count(0, 0);

        this.mempool_tx_size_tree_map.build_chart();
    }

    set(txs: Transaction[], top_block: Block) {
        let total_fees = 0;
        let total_size = 0;
        let total = 0;
        let burn_count = 0;
        let transfer_count = 0;
        let multisig_count = 0;
        let deploy_count = 0;
        let invoke_count = 0;

        txs.forEach((tx) => {
            total_fees += tx.fee;
            total_size += tx.size;

            if (tx.data.transfers) {
                transfer_count += tx.data.transfers.length;
                total += tx.data.transfers.length;
            }

            if (tx.data.burn) {
                burn_count++;
                total++;
            }

            if (tx.data.multi_sig) {
                multisig_count++;
                total++;
            }

            if (tx.data.deploy_contract) {
                deploy_count++;
                total++;
            }

            if (tx.data.invoke_contract) {
                invoke_count++;
                total++;
            }
        });

        this.mempool_total.set_tx_count(txs.length);
        this.mempool_total.set_timer(top_block.timestamp);

        this.mempool_total.set_fees(total_fees);
        this.mempool_total.set_size(total_size);

        this.mempool_tx_type_bars.set_transfer_count(transfer_count, total);
        this.mempool_tx_type_bars.set_contract_invoke_count(invoke_count, total);
        this.mempool_tx_type_bars.set_multisig_count(multisig_count, total);
        this.mempool_tx_type_bars.set_contract_deploy_count(deploy_count, total);
        this.mempool_tx_type_bars.set_burn_count(burn_count, total);

        this.mempool_tx_size_tree_map.build_chart();
    }
}