import { Peer } from "@xelis/sdk/daemon/types";
import type * as leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetch_geo_location } from "../../utils/fetch_geo_location";
import { parse_addr } from "../../utils/parse_addr";

import './peers_map.css';

export class PeersMap {
    element: HTMLDivElement;
    map!: leaflet.Map;
    loading_element?: HTMLDivElement;

    constructor() {
        this.element = document.createElement(`div`);
        this.setup_map();
    }

    async setup_map() {
        const leaflet = await import("leaflet");
        this.map = leaflet.map(this.element).setView([20, 0], 2);
        this.map.setMinZoom(2);
        leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(this.map);
    }

    async load(peers: Peer[]) {
        const leaflet = await import("leaflet");
        const peers_addr = peers.map(peer => {
            const addr = parse_addr(peer.addr);
            if (addr) return { peer, addr };
        }).filter(p => p !== undefined);
        const ips = peers_addr.map(p => p.addr.ip);

        const geo_locations = await fetch_geo_location(ips);
        Object.keys(geo_locations).forEach((key) => {
            const peer_addr = peers_addr.find(p => p.addr.ip === key);
            if (!peer_addr) return;

            const location = geo_locations[key];
            leaflet.marker([location.latitude, location.longitude])
                .addTo(this.map)
                .bindPopup(`<div>
                    <div>
                        <div>${peer_addr.peer.version}</div>
                        <div>${location.city}, ${location.country}</div>
                        <div>${location.region}</div>
                    </div>
                </div>`);
        });
    }

    set_loading(loading: boolean) {
        if (loading) {
            this.loading_element = document.createElement(`div`);
            this.loading_element.classList.add(`xe-peers-map-loading`);
            this.loading_element.innerHTML = `
                <div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            `;
            this.element.appendChild(this.loading_element);
        } else {
            if (this.loading_element) this.loading_element.remove();
        }
    }

    add(peer: Peer) {

    }

    remove(peer: Peer) {

    }
}