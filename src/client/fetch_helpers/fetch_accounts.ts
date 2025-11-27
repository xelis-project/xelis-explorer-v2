import { RPCMethod as DaemonRPCMethod, GetBalanceParams, GetBalanceResult, GetNonceParams, GetNonceResult } from "@xelis/sdk/daemon/types";
import { XelisNode } from "../app/xelis_node";
import { RPCRequest } from "@xelis/sdk/rpc/types";
import { XELIS_ASSET } from "@xelis/sdk/config";

interface AccountInfo {
    addr: string;
    registration_topo: number;
    balance: GetBalanceResult;
    nonce: GetNonceResult;
}

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

    const accounts = [] as AccountInfo[];
    let account_index = 0;
    res.forEach((result, i) => {
        if (result instanceof Error) {
            throw result;
        }

        const data_index = i % 3;
        switch(data_index) {
            case 0:
                accounts[account_index] = {
                    addr: addrs[account_index],
                    registration_topo: result
                } as AccountInfo;
                break;
            case 1:
                accounts[account_index].balance = result as GetBalanceResult;
                break;
            case 2:
                accounts[account_index].nonce = result as GetNonceResult;
                account_index++;
                break;
            default:
                throw "should not hit";
        }
    });

    return accounts;
}