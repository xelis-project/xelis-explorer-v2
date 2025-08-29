export interface GeoLocationData {
    ip: string;
    success: boolean;
    type: string;
    continent: string;
    continent_code: string;
    country: string;
    country_code: string;
    region: string;
    region_code: string;
    city: string;
    latitude: number;
    longitude: number;
    is_eu: boolean;
    postal: string;
    calling_code: string;
    capital: string;
    borders: string;
    flag: {
        img: string;
        emoji: string;
        emoji_unicode: string;
    };
    connection: {
        asn: number;
        org: string;
        isp: string;
        domain: string;
    };
    timezone: {
        id: string;
        abbr: string;
        is_dst: boolean;
        offset: number;
        utc: string;
        current_time: string;
    };
}

export const fetch_geo_location = async (ips: string[]) => {
    ips.sort();
    const query = `?ips=${ips.join(`,`)}`;
    const res = await fetch(`https://geoip.xelis.io${query}`);
    return await res.json<Record<string, GeoLocationData>>();
}
