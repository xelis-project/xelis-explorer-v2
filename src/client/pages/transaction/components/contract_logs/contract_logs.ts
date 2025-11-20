import { ContractLog } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";
import { localization } from "../../../../localization/localization";
import { CollapseBox } from "../../../../components/collapse_box/collapse_box";
import { contract_logs_to_obj } from "../../../../utils/contract_logs_to_obj";
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

        const contract_logs_obj = contract_logs_to_obj(contract_logs);

        if (contract_logs_obj.exit_code !== undefined) {
            const collapse_box = new CollapseBox();
            collapse_box.title_element.innerHTML = `EXIT CODE`;

            const exit_code = contract_logs_obj.exit_code;
            if (exit_code === 0) {
                collapse_box.content_element.innerHTML = `<span class="xe-log-dot-success"></span>The contract execution was successful. Exit code: 0`;
            } else {
                collapse_box.content_element.innerHTML = `<span class="xe-log-dit-fail"></span>The contract execution failed. Exit code: ${exit_code}`;
            }

            this.container.element.appendChild(collapse_box.element);
        }

        if (contract_logs_obj.burn !== undefined) {
            const collapse_box = new CollapseBox();
            collapse_box.title_element.innerHTML = `BURN`;

            const burn = contract_logs_obj.burn;
            collapse_box.content_element.innerHTML = `
                <table>
                    <tr>
                        <td>AMOUNT</td>
                        <td>${format_asset(burn.asset, burn.amount, true)}</td>
                    <tr>
                    <tr>
                        <td>ASSET</td>
                        <td>${format_hash(burn.asset)}</td>
                    <tr>
                    <tr>
                        <td>CONTRACT</td>
                        <td>${format_hash(burn.contract)}</td>
                    <tr>
                </table>
            `;
            collapse_box.set_collapse(true);
            this.container.element.appendChild(collapse_box.element);
        }

        if (contract_logs_obj.gas_injection !== undefined) {
            const collapse_box = new CollapseBox();
            collapse_box.title_element.innerHTML = `GAS INJECTION`;

            const gas_injection = contract_logs_obj.gas_injection;
            collapse_box.content_element.innerHTML = `
                <table>
                    <tr>
                        <td>AMOUNT</td>
                        <td>${format_xel(gas_injection.amount, true)}</td>
                    <tr>
                    <tr>
                        <td>CONTRACT</td>
                        <td>${format_hash(gas_injection.contract)}</td>
                    <tr>
                </table>
            `;

            collapse_box.content_element.innerHTML = ``;
            collapse_box.set_collapse(true);
            this.container.element.appendChild(collapse_box.element);
        }

        if (contract_logs_obj.mint !== undefined) {
            const collapse_box = new CollapseBox();
            collapse_box.title_element.innerHTML = `MINT`;

            const mint = contract_logs_obj.mint;
            collapse_box.content_element.innerHTML = `
                <table>
                    <tr>
                        <td>AMOUNT</td>
                        <td>${format_asset(mint.asset, mint.amount, true)}</td>
                    <tr>
                    <tr>
                        <td>ASSET</td>
                        <td>${format_hash(mint.asset)}</td>
                    <tr>
                    <tr>
                        <td>CONTRACT</td>
                        <td>${format_hash(mint.contract)}</td>
                    <tr>
                </table>
            `;

            collapse_box.set_collapse(true);
            this.container.element.appendChild(collapse_box.element);
        }

        if (contract_logs_obj.new_asset !== undefined) {
            const collapse_box = new CollapseBox();
            collapse_box.title_element.innerHTML = `NEW ASSET`;

            const new_asset = contract_logs_obj.new_asset;
            collapse_box.content_element.innerHTML = `
                <table>
                    <tr>
                        <td>ASSET</td>
                        <td>${format_hash(new_asset.asset)}</td>
                    <tr>
                    <tr>
                        <td>CONTRACT</td>
                        <td>${format_hash(new_asset.contract)}</td>
                    <tr>
                </table>
            `;

            collapse_box.set_collapse(true);
            this.container.element.appendChild(collapse_box.element);
        }

        if (contract_logs_obj.refund_deposits !== undefined) {
            const collapse_box = new CollapseBox();
            collapse_box.title_element.innerHTML = `REFUND DEPOSITS`;
            collapse_box.content_element.innerHTML = `Refund occurred.`;
            collapse_box.set_collapse(true);
            this.container.element.appendChild(collapse_box.element);
        }

        if (contract_logs_obj.refund_gas !== undefined) {
            const collapse_box = new CollapseBox();
            collapse_box.title_element.innerHTML = `REFUND GAS`;

            const refund_gas = contract_logs_obj.refund_gas;
            collapse_box.content_element.innerHTML = `${format_xel(refund_gas.amount, true)} refunded.`;
            collapse_box.set_collapse(true);
            this.container.element.appendChild(collapse_box.element);
        }

        if (contract_logs_obj.scheduled_execution !== undefined) {
            const collapse_box = new CollapseBox();
            collapse_box.title_element.innerHTML = `SCHEDULED EXECUTION`;

            const scheduled_execution = contract_logs_obj.scheduled_execution;
            collapse_box.content_element.innerHTML = `
                <table>
                    <tr>
                        <td>HASH</td>
                        <td>${format_hash(scheduled_execution.hash)}</td>
                    <tr>
                    <tr>
                        <td>CONTRACT</td>
                        <td>${format_hash(scheduled_execution.contract)}</td>
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

        if (contract_logs_obj.transfer !== undefined) {
            const collapse_box = new CollapseBox();
            collapse_box.title_element.innerHTML = `TRANSFER`;

            const transfer = contract_logs_obj.transfer;
            collapse_box.content_element.innerHTML = `
                <table>
                    <tr>
                        <td>AMOUNT</td>
                        <td>${format_asset(transfer.asset, transfer.amount, true)}</td>
                    <tr>
                    <tr>
                        <td>ASSET</td>
                        <td>${format_hash(transfer.asset)}</td>
                    <tr>
                    <tr>
                        <td>CONTRACT</td>
                        <td>${format_hash(transfer.contract)}</td>
                    <tr>
                    <tr>
                        <td>DESTINATION</td>
                        <td>${transfer.destination}</td>
                    <tr>
                </table>
            `;

            collapse_box.set_collapse(true);
            this.container.element.appendChild(collapse_box.element);
        }

        if (contract_logs_obj.transfer_contract !== undefined) {
            const collapse_box = new CollapseBox();
            collapse_box.title_element.innerHTML = `TRANSFER CONTRACT`;

            const transfer_contract = contract_logs_obj.transfer_contract;
            collapse_box.content_element.innerHTML = `
                <table>
                    <tr>
                        <td>AMOUNT</td>
                        <td>${format_asset(transfer_contract.asset, transfer_contract.amount, true)}</td>
                    <tr>
                    <tr>
                        <td>ASSET</td>
                        <td>${format_hash(transfer_contract.asset)}</td>
                    <tr>
                    <tr>
                        <td>CONTRACT</td>
                        <td>${format_hash(transfer_contract.contract)}</td>
                    <tr>
                    <tr>
                        <td>DESTINATION</td>
                        <td>${transfer_contract.destination}</td>
                    <tr>
                </table>
            `;

            collapse_box.set_collapse(true);
            this.container.element.appendChild(collapse_box.element);
        }
    }
}