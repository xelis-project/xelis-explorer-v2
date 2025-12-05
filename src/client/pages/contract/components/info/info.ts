import { GetContractModuleResult } from '@xelis/sdk/daemon/types';
import { Container } from '../../../../components/container/container';
import icons from '../../../../assets/svg/icons';
import { Box } from '../../../../components/box/box';
import { localization } from '../../../../localization/localization';
import { JsonViewerBox } from '../../../transaction/components/json_viewer_box/json_viewer_box';

import './info.css';

export class ContractInfo {
    container: Container;

    constant_json_viewer_box: JsonViewerBox;
    chunks_json_viewer_box: JsonViewerBox;
    hook_ids_box: Box;
    hash_element: HTMLDivElement;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-contract-info`);

        const container_1 = document.createElement(`div`);
        this.container.element.appendChild(container_1);

        this.hash_element = document.createElement(`div`);
        container_1.appendChild(this.hash_element);

        const contract_icon = document.createElement(`div`);
        contract_icon.innerHTML = icons.contract();
        container_1.appendChild(contract_icon);

        const constants_title_element = document.createElement(`div`);
        constants_title_element.innerHTML = localization.get_text(`CONSTANTS`);
        this.container.element.appendChild(constants_title_element);

        this.constant_json_viewer_box = new JsonViewerBox();
        this.container.element.appendChild(this.constant_json_viewer_box.box.element);

        const chunks_title_element = document.createElement(`div`);
        chunks_title_element.innerHTML = localization.get_text(`CHUNKS`);
        this.container.element.appendChild(chunks_title_element);

        this.chunks_json_viewer_box = new JsonViewerBox();
        this.container.element.appendChild(this.chunks_json_viewer_box.box.element);

        const hook_ids_title_element = document.createElement(`div`);
        hook_ids_title_element.innerHTML = localization.get_text(`HOOK CHUNK IDS`);
        this.container.element.appendChild(hook_ids_title_element);
        
        this.hook_ids_box = new Box();
        //hook_ids_box.element.innerHTML = JSON.stringify(deploy_contract.module.hook_chunk_ids || [], null, 2);
        this.container.element.appendChild(this.hook_ids_box.element);
    }

    set_loading(loading: boolean) {
        Box.content_loading(this.constant_json_viewer_box.box.element, loading);
        Box.content_loading(this.chunks_json_viewer_box.box.element, loading);
        Box.content_loading(this.hook_ids_box.element, loading);
        Box.content_loading(this.hash_element, loading);
    }

    set(contract_hash: string, module: GetContractModuleResult) {
        this.hash_element.innerHTML = contract_hash;

        if (module.data) {
            this.constant_json_viewer_box.set_data(module.data.constants);
            this.chunks_json_viewer_box.set_data(module.data.chunks);
            this.hook_ids_box.element.innerHTML = JSON.stringify(module.data.hook_chunk_ids || [], null, 2);
        }
    }
}