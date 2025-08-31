interface AddrInfo {
    ip: string;
    port: string;
    type: "ipv4" | "ipv6";
}

export const parse_addr = (addr: string) => {
    // ipv4
    const ipv4_matches = /^([0-9.]+):(\d+)$/.exec(addr);
    if (ipv4_matches) {
        return { ip: ipv4_matches[1], port: ipv4_matches[2], type: `ipv4` } as AddrInfo;
    }

    // ipv6
    const ipv6_matches = /^\[([0-9a-f:]+)\]:(\d+)$/i.exec(addr);
    if (ipv6_matches) {
        return { ip: ipv6_matches[1], port: ipv6_matches[2], type: `ipv6` } as AddrInfo;
    }

    throw new Error("Invalid address");
}