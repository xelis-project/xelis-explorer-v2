import { AssetWithData } from "@xelis/sdk/daemon/types";
import { Container } from "../../../../components/container/container";

export class AccountAssets {
    container: Container;

    constructor() {
        this.container = new Container();

        const title_element = document.createElement(`div`);
        title_element.innerHTML = `ASSETS`;
        this.container.element.appendChild(title_element);
    }

    set(assets_data: AssetWithData[]) {
        
    }
}