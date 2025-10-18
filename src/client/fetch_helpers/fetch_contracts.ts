import { RPCRequest, } from "@xelis/sdk/rpc/types";
import { XelisNode } from "../app/xelis_node";
import { RPCMethod as DaemonRPCMethod, GetContractBalanceParams, GetContractBalanceResult, GetContractModuleParams, GetContractModuleResult, Transaction, TransactionResponse } from "@xelis/sdk/daemon/types";
import { XELIS_ASSET } from "@xelis/sdk/config";

export interface ContractInfo {
    transaction: TransactionResponse;
    module: GetContractModuleResult;
    balance?: GetContractBalanceResult;
}

export const fetch_contracts = async (contracts: string[]) => {
    const node = XelisNode.instance();

    if (contracts.length > 6) {
        throw "limit of 6 contracts";
    }

    const requests = [] as RPCRequest[];

    contracts.forEach((contract) => {
        requests.push({
            method: DaemonRPCMethod.GetTransaction,
            params: { hash: contract }
        });

        requests.push({
            method: DaemonRPCMethod.GetContractModule,
            params: { contract } as GetContractModuleParams
        });

        requests.push({
            method: DaemonRPCMethod.GetContractBalance,
            params: { contract, asset: XELIS_ASSET } as GetContractBalanceParams
        })
    });

    const res = await node.rpc.batchRequest(requests);

    const contracts_info = [] as ContractInfo[];
    let contract_index = 0;
    res.forEach((result, i) => {
        const data_index = i % 3;
        switch (data_index) {
            // GetTransaction
            case 0:
                if (result instanceof Error) {
                    throw result;
                }

                contracts_info[contract_index] = {
                    transaction: result
                } as ContractInfo;

                break;
            // GetContractModule
            case 1:
                if (result instanceof Error) {
                    throw result;
                }

                contracts_info[contract_index].module = result as GetContractModuleResult;

                break;
            // GetContractBalance (XEL)
            case 2:
                if (result instanceof Error) {
                    // API returns an error if the contract does not have a balance
                    contracts_info[contract_index].balance = undefined;
                } else {
                    contracts_info[contract_index].balance = result as GetContractBalanceResult;
                }

                contract_index++;
                break;
            default:
                throw "should not hit";
        }
    });

    return contracts_info;
}
