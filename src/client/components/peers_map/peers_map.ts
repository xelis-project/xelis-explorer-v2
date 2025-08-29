import { Peer } from "@xelis/sdk/daemon/types";
import type * as leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetch_geo_location, GeoLocationData } from "../../utils/fetch_geo_location";
import { parse_addr } from "../../utils/parse_addr";

import './peers_map.css';

export interface PeerLocation {
    peer: Peer;
    geo_location: GeoLocationData;
}

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

    async fetch_peers_locations(peers: Peer[]) {
        const peers_addr = peers.map(peer => {
            const addr = parse_addr(peer.addr);
            if (addr) return { peer, addr };
        }).filter(p => p !== undefined);
        const ips = peers_addr.map(p => p.addr.ip);

        let peers_locations: PeerLocation[] = [];

        const geo_locations = await fetch_geo_location(ips);
        Object.keys(geo_locations).forEach((key) => {
            const peer_addr = peers_addr.find(p => p.addr.ip === key);
            if (!peer_addr) return;

            peers_locations.push({
                peer: peer_addr.peer,
                geo_location: geo_locations[key]
            });
        });

        return peers_locations;
    }

    async set(peers_locations: PeerLocation[]) {
        const leaflet = await import("leaflet");
        peers_locations.forEach((peer_location) => {
            const { peer, geo_location } = peer_location;
            leaflet.circleMarker([geo_location.latitude, geo_location.longitude], {
                radius: 5,
                weight: 0,
                color: '#02FFCF',
                fillColor: '#02FFCF',
                fillOpacity: 1
            }).addTo(this.map)
                .bindPopup(`<div>
                    <div>
                        <div>${peer.version}</div>
                        <div>${geo_location.city}, ${geo_location.country}</div>
                        <div>${geo_location.region}</div>
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