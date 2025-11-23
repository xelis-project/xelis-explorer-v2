import { ContractLog } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { localization } from "../../../../localization/localization";
import { CollapseBox } from "../../../../components/collapse_box/collapse_box";
import { format_hash } from "../../../../utils/format_hash";
import { format_asset } from "../../../../utils/format_asset";
import { format_xel } from "../../../../utils/format_xel";

import './contract_logs.css';

export class TransactionContractLogs {
    container: Container;

    constructor(contract_logs: ContractLog[]) {
        this.container = new Container();
        this.container.element.classList.add(`xe-transaction-contract-outputs`);

        const title_element = document.createElement(`div`);
        title_element.innerHTML = localization.get_text(`CONTRACT LOGS`);
        this.container.element.appendChild(title_element);

        for (let i = 0; i < contract_logs.length; i++) {
            const contract_log = contract_logs[i];

            if (contract_log.type === `exit_code`) {
                const collapse_box = new CollapseBox();
                collapse_box.title_element.innerHTML = `EXIT CODE`;

                const exit_code = contract_log.value;
                if (exit_code === 0) {
                    collapse_box.content_element.innerHTML = `<span class="xe-log-dot-success"></span>The contract execution was successful. Exit code: 0`;
                } else {
                    collapse_box.content_element.innerHTML = `<span class="xe-log-dit-fail"></span>The contract execution failed. Exit code: ${exit_code}`;
                }

                this.container.element.appendChild(collapse_box.element);
            }

            if (contract_log.type === `burn`) {
                const collapse_box = new CollapseBox();
                collapse_box.title_element.innerHTML = `BURN`;

                const burn = contract_log.value;
                collapse_box.content_element.innerHTML = `
                    <table>
                        <tr>
                            <td>AMOUNT</td>
                            <td>${format_asset(burn.asset, burn.amount, true)}</td>
                        <tr>
                        <tr>
                            <td>ASSET</td>
                            <td><a href="/tx/${burn.asset}">${format_hash(burn.asset)}</a></td>
                        <tr>
                        <tr>
                            <td>CONTRACT</td>
                            <td><a href="/tx/${burn.contract}">${format_hash(burn.contract)}</a></td>
                        <tr>
                    </table>
                `;
                collapse_box.set_collapse(true);
                this.container.element.appendChild(collapse_box.element);
            }

            if (contract_log.type === `gas_injection`) {
                const collapse_box = new CollapseBox();
                collapse_box.title_element.innerHTML = `GAS INJECTION`;

                const gas_injection = contract_log.value;
                collapse_box.content_element.innerHTML = `
                    <table>
                        <tr>
                            <td>AMOUNT</td>
                            <td>${format_xel(gas_injection.amount, true)}</td>
                        <tr>
                        <tr>
                            <td>CONTRACT</td>
                            <td><a href="/tx/${gas_injection.contract}">${format_hash(gas_injection.contract)}</a></td>
                        <tr>
                    </table>
                `;

                collapse_box.content_element.innerHTML = ``;
                collapse_box.set_collapse(true);
                this.container.element.appendChild(collapse_box.element);
            }

            if (contract_log.type === `mint`) {
                const collapse_box = new CollapseBox();
                collapse_box.title_element.innerHTML = `MINT`;

                const mint = contract_log.value;
                collapse_box.content_element.innerHTML = `
                    <table>
                        <tr>
                            <td>AMOUNT</td>
                            <td>${format_asset(mint.asset, mint.amount, true)}</td>
                        <tr>
                        <tr>
                            <td>ASSET</td>
                            <td><a href="/tx/${mint.asset}">${format_hash(mint.asset)}</a></td>
                        <tr>
                        <tr>
                            <td>CONTRACT</td>
                            <td><a href="/tx/${mint.asset}">${format_hash(mint.contract)}</a></td>
                        <tr>
                    </table>
                `;

                collapse_box.set_collapse(true);
                this.container.element.appendChild(collapse_box.element);
            }

            if (contract_log.type === `new_asset`) {
                const collapse_box = new CollapseBox();
                collapse_box.title_element.innerHTML = `NEW ASSET`;

                const new_asset = contract_log.value;
                collapse_box.content_element.innerHTML = `
                    <table>
                        <tr>
                            <td>ASSET</td>
                            <td><a href="/tx/${new_asset.asset}">${format_hash(new_asset.asset)}</a></td>
                        <tr>
                        <tr>
                            <td>CONTRACT</td>
                            <td><a href="/tx/${new_asset.contract}">${format_hash(new_asset.contract)}</a></td>
                        <tr>
                    </table>
                `;

                collapse_box.set_collapse(true);
                this.container.element.appendChild(collapse_box.element);
            }

            if (contract_log.type === `refund_deposits`) {
                const collapse_box = new CollapseBox();
                collapse_box.title_element.innerHTML = `REFUND DEPOSITS`;
                collapse_box.content_element.innerHTML = `Refund occurred.`;
                collapse_box.set_collapse(true);
                this.container.element.appendChild(collapse_box.element);
            }

            if (contract_log.type === `refund_gas`) {
                const collapse_box = new CollapseBox();
                collapse_box.title_element.innerHTML = `REFUND GAS`;

                const refund_gas = contract_log.value;
                collapse_box.content_element.innerHTML = `${format_xel(refund_gas.amount, true)} refunded.`;
                collapse_box.set_collapse(true);
                this.container.element.appendChild(collapse_box.element);
            }

            if (contract_log.type === `scheduled_execution`) {
                const collapse_box = new CollapseBox();
                collapse_box.title_element.innerHTML = `SCHEDULED EXECUTION`;

                const scheduled_execution = contract_log.value;
                collapse_box.content_element.innerHTML = `
                    <table>
                        <tr>
                            <td>HASH</td>
                            <td>${format_hash(scheduled_execution.hash)}</td>
                        <tr>
                        <tr>
                            <td>CONTRACT</td>
                            <td><a href="/tx/${scheduled_execution.contract}">${format_hash(scheduled_execution.contract)}</a></td>
                        <tr>
                        <tr>
                            <td>KIND</td>
                            <td>${scheduled_execution.kind}</td>
                        <tr>
                    </table>
                `;

                collapse_box.set_collapse(true);
                this.container.element.appendChild(collapse_box.element);
            }

            if (contract_log.type === `transfer`) {
                const collapse_box = new CollapseBox();
                collapse_box.title_element.innerHTML = `TRANSFER`;

                const transfer = contract_log.value;
                collapse_box.content_element.innerHTML = `
                <table>
                    <tr>
                        <td>AMOUNT</td>
                        <td>${format_asset(transfer.asset, transfer.amount, true)}</td>
                    <tr>
                    <tr>
                        <td>ASSET</td>
                        <td><a href="/tx/${transfer.asset}">${format_hash(transfer.asset)}</a></td>
                    <tr>
                    <tr>
                        <td>CONTRACT</td>
                        <td><a href="/tx/${transfer.contract}">${format_hash(transfer.contract)}</a></td>
                    <tr>
                    <tr>
                        <td>DESTINATION</td>
                        <td><a href="/account/${transfer.destination}">${format_hash(transfer.destination)}</a></td>
                    <tr>
                </table>
            `;

                collapse_box.set_collapse(true);
                this.container.element.appendChild(collapse_box.element);
            }

            if (contract_log.type === `transfer_contract`) {
                const collapse_box = new CollapseBox();
                collapse_box.title_element.innerHTML = `TRANSFER CONTRACT`;

                const transfer_contract = contract_log.value;
                collapse_box.content_element.innerHTML = `
                    <table>
                        <tr>
                            <td>AMOUNT</td>
                            <td>${format_asset(transfer_contract.asset, transfer_contract.amount, true)}</td>
                        <tr>
                        <tr>
                            <td>ASSET</td>
                            <td><a href="/tx/${transfer_contract.asset}">${format_hash(transfer_contract.asset)}</a></td>
                        <tr>
                        <tr>
                            <td>CONTRACT</td>
                            <td><a href="/tx/${transfer_contract.contract}">${format_hash(transfer_contract.contract)}</a></td>
                        <tr>
                        <tr>
                            <td>DESTINATION</td>
                            <td><a href="/tx/${transfer_contract.destination}">${format_hash(transfer_contract.destination)}</a></td>
                        <tr>
                    </table>
                `;

                collapse_box.set_collapse(true);
                this.container.element.appendChild(collapse_box.element);
            }
        }
    }
}