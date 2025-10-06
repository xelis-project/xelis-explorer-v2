import { Context } from "hono";
import { App as ServerApp } from "../../server";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { Singleton } from "../utils/singleton";

export class Page extends Singleton {
    element: HTMLDivElement;

    static pathname: string = "";
    static title: string = "";
    static description: string = "";
    static status: ContentfulStatusCode = 200;
    static server_data: any;
    static title_prefix = "XELIS - ";

    static get_title = () => {
        return `${this.title_prefix}${this.title}`;
    }

    static get_pattern() {
        return new URLPattern({ pathname: this.pathname });
    }

    static test_pattern(href: string) {
        const pattern = this.get_pattern();
        return pattern.test(new URL(href));
    }

    static exec_pattern(href: string) {
        const pattern = this.get_pattern();
        return pattern.exec(new URL(href));
    }

    static async handle_server(c: Context<ServerApp>) {
        return;
    }

    static serialize_server_data(data: any) {
        return `<script>window["SSR_${this.pathname}"] = ${JSON.stringify(data)};</script>`;
    }

    static consume_server_data<T>(): { server_data?: T, consumed: boolean } {
        const key = `SSR_${this.pathname}`;
        if (key in window) {
            const server_data = window[key as any] as T;
            Reflect.deleteProperty(window, key); // remove data as it might be outdated when returning to page
            return { server_data, consumed: true };
        }

        return { server_data: undefined, consumed: false };
    }

    constructor() {
        super();
        this.element = document.createElement(`div`);
    }

    set_window_title(title: string) {
        document.title = `${Page.title_prefix}${title}`;
    }

    async load(parent: HTMLElement) {
        parent.appendChild(this.element);
    }

    unload() {
        this.element.remove();
    }

    set_element(element: HTMLElement) {
        if (!this.element.contains(element)) {
            this.element.replaceChildren();
            this.element.appendChild(element);
        }
    }
}