import { AccountHistory } from '@xelis/sdk/daemon/types';
import { Container } from '../../../../components/container/container';
import './history_list.css';
import { AccountHistoryListItem } from './history_item';
import icons from '../../../../assets/svg/icons';

export class AccountHistoryList {
    container: Container;
    list_element: HTMLDivElement;
    empty_element: HTMLDivElement;

    constructor(title: string) {
        this.container = new Container();
        this.container.element.classList.add(`xe-account-list`, `scrollbar-1`, `scrollbar-1-right`);

        const title_element = document.createElement(`div`);
        title_element.innerHTML = title;
        this.container.element.appendChild(title_element);

        this.empty_element = document.createElement(`div`);
        this.empty_element.classList.add(`xe-mempool-txs-list-empty`);
        this.empty_element.innerHTML = `${icons.empty_box()}<div>No activity.</div>`;
  
        this.list_element = document.createElement(`div`);
        this.container.element.appendChild(this.list_element);
    }

    set(history_list: AccountHistory[]) {
        this.list_element.replaceChildren();
        if (history_list.length > 0) {
            history_list.forEach(history_item => this.prepend_history(history_item));
        } else {
      this.container.element.appendChild(this.empty_element);

        }
    }

    prepend_history(history: AccountHistory) {
        let link = undefined;
        if (history.outgoing || history.incoming) {
            link = `/tx/${history.hash}`;
        } else if (history.mining) {
            link = `/block/${history.hash}`;
        }

        const history_item = new AccountHistoryListItem(link);
        history_item.set(history);

        this.list_element.insertBefore(history_item.box.element, this.list_element.firstChild);
        return history_item;
    }
}