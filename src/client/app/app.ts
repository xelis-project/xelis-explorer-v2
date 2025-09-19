import { Page } from "../pages/page";
import { match_route } from "./router";
import { Singleton } from "../utils/singleton";
import { EventEmitter } from "../utils/event_emitter";
import { TopLoadingBar } from "./top_loading_bar/top_loading_bar";

import "reset-css";
import "urlpattern-polyfill"; // URLPattern is a new web API we use polyfill for now
import 'flag-icons/css/flag-icons.css';

import './app.css';
import './scrollbars.css';
import './fonts.css';

interface AppEventMap {
    page_load: void;
}

export class App extends Singleton {
    events: EventEmitter<AppEventMap>;
    root!: HTMLElement;
    current_page?: Page;

    top_loading_bar: TopLoadingBar;

    constructor() {
        super();
        this.events = new EventEmitter();
        this.top_loading_bar = new TopLoadingBar();
    }

    load(root: HTMLElement) {
        this.root = root;
        this.root.classList.add(`xe-app`);
        this.root.appendChild(this.top_loading_bar.element);

        this.load_page();
        this.register_events();
    }

    go_to(url: string) {
        window.history.pushState(null, ``, url);
        this.load_page();
    }

    set_window_title(title: string) {
        document.title = title;
    }

    load_page() {
        const url = new URL(window.location.href);
        const page_type = match_route(url);
        if (this.current_page) this.current_page.unload();
        this.current_page = page_type.instance();

        const load_page = async () => {
            if (this.current_page) {
                this.top_loading_bar.start();
                await this.current_page.load(this.root);
                this.top_loading_bar.end();
            }
        }

        load_page();
        this.events.emit("page_load");
    }

    on_pop_state = (_e: PopStateEvent) => {
        this.load_page();
    }

    on_click = (e: PointerEvent) => {
        // intercept link click recursively
        const check_parent_link = (element: HTMLElement) => {
            if (element.parentElement) {
                if (element instanceof HTMLAnchorElement) {
                    const link = element as HTMLAnchorElement;
                    if (link.target !== `_blank`) {
                        e.preventDefault();
                        this.go_to(element.href);
                    }
                } else {
                    check_parent_link(element.parentElement);
                }
            }
        }

        if (e.target instanceof HTMLElement) {
            check_parent_link(e.target);
        }
    }

    register_events() {
        window.addEventListener(`popstate`, this.on_pop_state);
        window.addEventListener(`click`, this.on_click);
    }
}