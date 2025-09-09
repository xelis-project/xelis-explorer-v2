import { AccountHistory } from '@xelis/sdk/daemon/types';
import { Container } from '../../../../components/container/container';
import './history_list.css';
import { AccountHistoryListItem } from './history_item';

export class AccountHistoryList {
    container: Container;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-account-list`, `scrollbar-1`, `scrollbar-1-right`);
    }

    set(history_list: AccountHistory[]) {
        this.container.element.replaceChildren();
        history_list.forEach(history_item => this.prepend_history(history_item));
    }

    prepend_history(history: AccountHistory) {
        const history_item = new AccountHistoryListItem();
        history_item.set(history);
        //block_item.box.element.addEventListener(`click`, () => {
        //     App.instance().go_to(`/block/${block.hash}`);
        //});

        this.container.element.insertBefore(history_item.box.element, this.container.element.firstChild);
        return history_item;
    }
}