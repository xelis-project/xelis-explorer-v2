import { RPCMethod as DaemonRPCMethod, GetBalanceParams, GetNonceParams } from "@xelis/sdk/daemon/types";
import { XelisNode } from "../app/xelis_node";
import { RPCRequest } from "@xelis/sdk/rpc/types";
import { XELIS_ASSET } from "@xelis/sdk/config";

export const fetch_accounts = async (addrs: string[]) => {
    const node = XelisNode.instance();

    if (addrs.length > 6) {
        throw "limit of 6 address";
    }

    const requests = [] as RPCRequest[];

    addrs.forEach((address) => {
        requests.push({
            method: DaemonRPCMethod.GetAccountRegistrationTopoheight,
            params: { address }
        });

        requests.push({
            method: DaemonRPCMethod.GetBalance,
            params: { address, asset: XELIS_ASSET } as GetBalanceParams
        });

        requests.push({
            method: DaemonRPCMethod.GetNonce,
            params: { address } as GetNonceParams
        })
    });

    const res = await node.rpc.batchRequest(requests);

    const accounts = [] as any[];
    let account_index = 0;
    res.forEach((result, i) => {
        if (result instanceof Error) {
            throw result;
        }

        if (!accounts[account_index]) accounts[account_index] = [];
        accounts[account_index][i % 3] = result;
        if (i % 3 === 2) {
            account_index++;
        }
    });

    return accounts;
}