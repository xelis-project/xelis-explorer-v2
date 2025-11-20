import {
    ContractLog, ContractLogBurn, ContractLogExitCode, ContractLogGasInjection, ContractLogMint,
    ContractLogNewAsset, ContractLogRefundGas, ContractLogScheduledExecution,
    ContractLogTransfer, ContractLogTransferContract
} from "@xelis/sdk/daemon/types";

interface ContractLogs {
    burn?: ContractLogBurn["value"];
    exit_code?: ContractLogExitCode["value"];
    gas_injection?: ContractLogGasInjection["value"];
    mint?: ContractLogMint["value"];
    new_asset?: ContractLogNewAsset["value"];
    refund_deposits?: {};
    refund_gas?: ContractLogRefundGas["value"];
    scheduled_execution?: ContractLogScheduledExecution["value"];
    transfer?: ContractLogTransfer["value"];
    transfer_contract?: ContractLogTransferContract["value"];
}

export function contract_logs_to_obj(contract_logs: ContractLog[]) {
    const contract_logs_obj = {} as ContractLogs;

    for (let i = 0; i < contract_logs.length; i++) {
        const contract_log = contract_logs[i];

        switch (contract_log.type) {
            case "burn":
                contract_logs_obj.burn = contract_log.value;
                break;
            case "exit_code":
                contract_logs_obj.exit_code = contract_log.value;
                break;
            case "gas_injection":
                contract_logs_obj.gas_injection = contract_log.value;
                break;
            case "mint":
                contract_logs_obj.mint = contract_log.value;
                break;
            case "new_asset":
                contract_logs_obj.new_asset = contract_log.value;
                break;
            case "refund_deposits":
                contract_logs_obj.refund_deposits = {};
                break;
            case "refund_gas":
                contract_logs_obj.refund_gas = contract_log.value;
                break;
            case "scheduled_execution":
                contract_logs_obj.scheduled_execution = contract_log.value;
                break;
            case "transfer":
                contract_logs_obj.transfer = contract_log.value;
                break;
            case "transfer_contract":
                contract_logs_obj.transfer_contract = contract_log.value;
                break;
        }
    }

    return contract_logs_obj;
}