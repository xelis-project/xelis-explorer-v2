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

interface PeerMarker {
    marker: leaflet.CircleMarker;
    geo_location: GeoLocationData;
    peers: Peer[];
}

export class PeersMap {
    element: HTMLDivElement;
    map!: leaflet.Map;
    loading_element?: HTMLDivElement;
    peer_count_element: HTMLDivElement;

    peer_markers: Record<string, PeerMarker>;

    constructor() {
        this.element = document.createElement(`div`);
        this.peer_markers = {};
        this.setup_map();

        this.peer_count_element = document.createElement(`div`);
        this.peer_count_element.classList.add(`xe-peers-map-peer-count`);
        this.element.appendChild(this.peer_count_element);
    }

    async setup_map() {
        const leaflet = await import("leaflet");
        this.map = leaflet.map(this.element).setView([20, 0], 2);
        this.map.setMinZoom(2);
        leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(this.map);
    }

    set_peer_count(count: number) {
        this.peer_count_element.innerHTML = `${count.toLocaleString()}P`;
    }

    async fetch_peers_locations(peers: Peer[]) {
        const peers_addr = peers.map(peer => {
            const addr = parse_addr(peer.addr);
            return { peer, addr };
        }).filter(p => p !== undefined);

        const ips = peers_addr.map(p => p.addr.ip);
        let peers_locations: PeerLocation[] = [];

        const batch_size = 50;
        for (let i = 0; i < ips.length; i += batch_size) {
            const ips_to_fetch = ips.slice(i, i + batch_size);
            const geo_locations = await fetch_geo_location(ips_to_fetch);
            Object.keys(geo_locations).forEach((key) => {
                const peer_addr = peers_addr.find(p => p.addr.ip === key);
                if (!peer_addr) return;

                peers_locations.push({
                    peer: peer_addr.peer,
                    geo_location: geo_locations[key]
                });
            });
        }

        return peers_locations;
    }

    async set(peers_locations: PeerLocation[]) {
        const group_markers = {} as Record<string, PeerLocation[]>;

        this.set_peer_count(peers_locations.length);

        peers_locations.forEach((peer_location) => {
            const { geo_location } = peer_location;
            const key = `${geo_location.latitude},${geo_location.longitude}`;
            if (group_markers[key]) {
                group_markers[key].push(peer_location);
            } else {
                group_markers[key] = [peer_location];
            }
        });

        Object.keys(group_markers).forEach(async (key) => {
            const peers_locations = group_markers[key];
            const first_peer_location = peers_locations[0];
            const { geo_location } = first_peer_location;
            const peers = peers_locations.map(p => p.peer);

            const marker_key = this.build_marker_key(geo_location);
            const peer_marker = await this.new_peer_marker(geo_location, peers.length);
            const new_popup = this.build_marker_popup(geo_location, peers);
            peer_marker.addTo(this.map);
            peer_marker.bindPopup(new_popup);
            this.peer_markers[marker_key] = { marker: peer_marker, geo_location, peers };
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

    build_marker_popup(geo_location: GeoLocationData, peers: Peer[]) {
        const popup_peers = peers.map((peer) => {
            return `<div>${peer.addr} (${peer.version})</div>`;
        }).join(``);

        const popup = `
            <div class="xe-peers-map-tooltip">
                <div>${geo_location.city}, ${geo_location.country}</div>
                <div>
                    ${popup_peers}
                </div>
            </div>
        `;

        return popup;
    }

    build_marker_key(geo_location: GeoLocationData) {
        return `${geo_location.latitude},${geo_location.longitude}`;
    }

    async new_peer_marker(geo_location: GeoLocationData, peer_count: number) {
        const leaflet = await import("leaflet");
        return leaflet.circleMarker([geo_location.latitude, geo_location.longitude], {
            radius: 4 + peer_count,
            weight: 0,
            color: '#02FFCF',
            fillColor: '#02FFCF',
            fillOpacity: 0.5
        });
    }

    async add_peer_marker(peer_location: PeerLocation) {
        const { geo_location, peer } = peer_location;
        const marker_key = this.build_marker_key(geo_location);
        const peer_marker = this.peer_markers[marker_key];
        if (peer_marker) {
            // add peer to marker popup
            peer_marker.peers.push(peer);
            const new_popup = this.build_marker_popup(geo_location, peer_marker.peers);
            peer_marker.marker.bindPopup(new_popup);
            peer_marker.marker.setRadius(4 + peer_marker.peers.length); // resize marker
        } else {
            // add new marker
            const marker = await this.new_peer_marker(geo_location, 1);
            marker.addTo(this.map);
            this.peer_markers[marker_key] = { marker, geo_location, peers: [peer_location.peer] };
        }
    }

    remove_peer_marker(peer_id: string) {
        const marker_keys = Object.keys(this.peer_markers);
        for (let i = 0; i < marker_keys.length; i++) {
            const marker_key = marker_keys[i];
            const peer_marker = this.peer_markers[marker_key];

            for (let a = 0; a < peer_marker.peers.length; a++) {
                const peer = peer_marker.peers[a];
                if (peer.id === peer_id) {
                    if (peer_marker.peers.length > 1) {
                        // remove peer from popup
                        peer_marker.peers.splice(a, 1);
                        const new_popup = this.build_marker_popup(peer_marker.geo_location, peer_marker.peers);
                        peer_marker.marker.bindPopup(new_popup);
                    } else {
                        // remove marker completely
                        peer_marker.marker.remove();
                        Reflect.deleteProperty(this.peer_markers, marker_key);
                    }

                    break;
                }
            }
        }
    }
}