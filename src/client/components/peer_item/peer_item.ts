
import { Peer } from '@xelis/sdk/daemon/types';
import { GeoLocationData } from '../../utils/fetch_geo_location';
import { Box } from '../box/box';
import './peer_item.css';
import { PeerLocation } from '../peers_map/peers_map';
import { localization } from '../../localization/localization';

export class PeerItem {
    box: Box;
    data?: PeerLocation;
    element_addr: HTMLDivElement;
    element_peer_count: HTMLDivElement;
    element_version: HTMLDivElement;
    element_location: HTMLDivElement;
    element_height: HTMLDivElement;
    element_topo: HTMLDivElement;
    element_pruned: HTMLDivElement;

    constructor() {
        this.box = new Box();
        this.box.element.classList.add(`xe-peer-item`);

        const container_1 = document.createElement(`div`);
        this.box.element.appendChild(container_1);

        const sub_container_1 = document.createElement(`div`);
        container_1.appendChild(sub_container_1);

        this.element_addr = document.createElement(`div`);
        this.element_addr.classList.add(`xe-peer-item-addr`);
        sub_container_1.appendChild(this.element_addr);

        const sub_container_2 = document.createElement(`div`);
        sub_container_1.appendChild(sub_container_2);
        this.element_peer_count = document.createElement(`div`);
        this.element_peer_count.classList.add(`xe-peer-item-pcount`);
        sub_container_2.appendChild(this.element_peer_count);
        this.element_version = document.createElement(`div`);
        this.element_version.classList.add(`xe-peer-item-version`);
        sub_container_2.appendChild(this.element_version);

        this.element_location = document.createElement(`div`);
        this.element_location.classList.add(`xe-peer-item-location`);
        container_1.appendChild(this.element_location);

        const container_2 = document.createElement(`div`);
        this.box.element.appendChild(container_2);

        this.element_height = document.createElement(`div`);
        container_2.appendChild(this.element_height);
        this.element_topo = document.createElement(`div`);
        container_2.appendChild(this.element_topo);
        this.element_pruned = document.createElement(`div`);
        container_2.appendChild(this.element_pruned);
    }

    set_peer_count(peer_count: number) {
        this.element_peer_count.innerHTML = `${peer_count.toLocaleString()} ${localization.get_text(`peers`)}`;
    }

    set_version(version: string) {
        this.element_version.innerHTML = version;
    }

    set_addr(addr: string) {
        this.element_addr.innerHTML = addr;
    }

    set_location(geo_location: GeoLocationData) {
        if (geo_location.success) {
            this.element_location.innerHTML = `
                <i class="fi fi-${geo_location.country_code.toLowerCase()}"></i>
                <div>${geo_location.country} / ${geo_location.city}</div>
            `;
        } else {
            this.element_location.innerHTML = localization.get_text(`Geo location failed.`);
        }
    }

    set_height(height: number) {
        this.element_height.innerHTML = `
            <div>${localization.get_text(`HEIGHT`)}</div>
            <div>${height.toLocaleString()}</div>
        `;
    }

    set_topoheight(topoheight: number) {
        this.element_topo.innerHTML = `
            <div>${localization.get_text(`TOPOHEIGHT`)}</div>
            <div>${topoheight.toLocaleString()}</div>
        `;
    }

    set_pruned(pruned_height?: number) {
        this.element_pruned.innerHTML = `
            <div>${localization.get_text(`PRUNED`)}</div>
            <div>${pruned_height ? pruned_height.toLocaleString() : `--`}</div>
        `;
    }

    set(peer_location: PeerLocation) {
        const { peer, geo_location } = peer_location;
        this.set_addr(peer.addr);
        this.set_location(geo_location);
        this.set_height(peer.height);
        this.set_topoheight(peer.topoheight);
        this.set_pruned(peer.pruned_topoheight);
        this.set_peer_count(Object.keys(peer.peers).length);
        this.set_version(peer.version);
        this.data = peer_location;
    }
}