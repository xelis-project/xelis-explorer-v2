import { RPCRequest, } from "@xelis/sdk/rpc/types";
import { XelisNode } from "../app/xelis_node";
import { Block, RPCMethod as DaemonRPCMethod, GetContractBalanceParams, GetContractBalanceResult, GetContractModuleResult, TransactionResponse } from "@xelis/sdk/daemon/types";

export interface ContractInfo {
    transaction: TransactionResponse;
    module: GetContractModuleResult;
    balance?: GetContractBalanceResult;
    block: Block;
}

export const fetch_contract_balances = async (contract: string, assets: string[]) => {
    const node = XelisNode.instance();

    if (assets.length > 20) {
        throw "limit of 20 contracts";
    }

    const balances = [] as GetContractBalanceResult[];

    {
        const requests = [] as RPCRequest[];

        assets.forEach((asset) => {
            requests.push({
                method: DaemonRPCMethod.GetContractBalance,
                params: {
                    contract,
                    asset
                } as GetContractBalanceParams
            });
        });

        const res = await node.rpc.batchRequest(requests);
        res.forEach((result, i) => {
            if (result instanceof Error) {
                throw result;
            }

            balances[i] = result as GetContractBalanceResult;
        });
    }


    return balances;
}
