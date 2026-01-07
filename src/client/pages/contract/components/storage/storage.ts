import { XelisNode } from '../../../../app/xelis_node';
import { Container } from '../../../../components/container/container';
import { Box } from '../../../../components/box/box';
import { localization } from '../../../../localization/localization';
import { StorageHistoryModal } from './storage_history_modal';

import './storage.css';

// NOTE:
// The JS SDK does not yet expose strongly typed helpers for contract
// storage entries, so we intentionally go through `any` here to
// decouple the explorer UI from SDK changes while we experiment with
// the feature.

type ContractStorageEntry = {
    key: unknown; // Can be string, object, or other types
    topoheight?: number;
    data?: unknown;
    value?: unknown;
};

export class ContractStorageEntries {
    container: Container;
    list_element: HTMLElement;
    pagination_element: HTMLElement;
    info_element: HTMLElement;
    page_size_selector: HTMLSelectElement;
    history_modal: StorageHistoryModal;

    private contract_hash?: string;
    private page_size = 25;
    private current_page = 0;
    private has_next_page = false;
    private total_entries_shown = 0;

    constructor() {
        this.container = new Container();
        this.container.element.classList.add(`xe-contract-storage`);

        // Header with title and page size selector
        const header_element = document.createElement(`div`);
        header_element.classList.add(`xe-contract-storage-header`);
        this.container.element.appendChild(header_element);

        const title_element = document.createElement(`div`);
        title_element.classList.add(`xe-contract-storage-title`);
        title_element.innerHTML = localization.get_text(`STORAGE ENTRIES`);
        header_element.appendChild(title_element);

        const controls_element = document.createElement(`div`);
        controls_element.classList.add(`xe-contract-storage-controls`);
        header_element.appendChild(controls_element);

        const page_size_label = document.createElement(`label`);
        page_size_label.classList.add(`xe-contract-storage-page-size-label`);
        page_size_label.innerHTML = localization.get_text(`Per page:`);
        controls_element.appendChild(page_size_label);

        this.page_size_selector = document.createElement(`select`);
        this.page_size_selector.classList.add(`xe-contract-storage-page-size-selector`);
        [10, 25, 50, 100].forEach(size => {
            const option = document.createElement(`option`);
            option.value = String(size);
            option.textContent = String(size);
            if (size === this.page_size) {
                option.selected = true;
            }
            this.page_size_selector.appendChild(option);
        });
        this.page_size_selector.addEventListener(`change`, () => {
            this.page_size = Number(this.page_size_selector.value);
            this.current_page = 0;
            if (this.contract_hash) {
                this.load_entries(this.contract_hash, this.current_page);
            }
        });
        controls_element.appendChild(this.page_size_selector);

        // Info element to show "Showing X-Y of Z entries"
        this.info_element = document.createElement(`div`);
        this.info_element.classList.add(`xe-contract-storage-info`);
        this.container.element.appendChild(this.info_element);

        this.list_element = document.createElement(`div`);
        this.list_element.classList.add(`xe-contract-storage-list`);
        this.container.element.appendChild(this.list_element);

        this.pagination_element = document.createElement(`div`);
        this.pagination_element.classList.add(`xe-contract-storage-pagination`);
        this.container.element.appendChild(this.pagination_element);

        this.history_modal = new StorageHistoryModal();

        this.render_pagination();
    }

    private set_loading(loading: boolean) {
        if (loading) {
            Box.list_loading(this.list_element, this.page_size, `0.5rem`);
        } else {
            // Don't clear the list when turning off loading - entries are already added
            // Just remove loading class from any remaining loading boxes
            const loading_boxes = this.list_element.querySelectorAll<HTMLElement>(`.xe-box-loading`);
            loading_boxes.forEach(box => Box.set_loading(box, false));
        }
        Box.content_loading(this.pagination_element, loading);
    }

    // Extract human-readable value from nested structure
    private extract_display_value(value: any): { display: string; type?: string; isAddress?: boolean } {
        if (value === null || value === undefined) {
            return { display: '—' };
        }

        // Handle primitives directly
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            const isAddress = typeof value === 'string' && value.startsWith('xel:');
            return { display: String(value), isAddress };
        }

        // Handle nested type/value structures
        if (typeof value === 'object' && value.type) {
            // Handle Address type: { type: "opaque", value: { type: "Address", value: "xel:..." } }
            if (value.type === 'opaque' && value.value?.type === 'Address' && value.value?.value) {
                return { display: value.value.value, type: 'Address', isAddress: true };
            }

            // Handle primitive with nested value: { type: "primitive", value: {...} }
            if (value.type === 'primitive' && value.value) {
                // Recursively extract from nested value
                return this.extract_display_value(value.value);
            }

            // Handle other typed structures
            if (value.value !== undefined) {
                return this.extract_display_value(value.value);
            }
        }

        // Fallback to JSON
        return { display: JSON.stringify(value, null, 2) };
    }

    private get_entry_preview(entry: ContractStorageEntry) {
        const value = (entry.value ?? entry.data ?? null) as unknown;
        const extracted = this.extract_display_value(value);

        try {
            if (extracted.display.length > 120) {
                return `${extracted.display.slice(0, 120)}…`;
            }
            return extracted.display;
        } catch {
            return String(value ?? `—`);
        }
    }

    private get_key_string(key: unknown): string {
        if (typeof key === 'string') {
            return key;
        }
        if (typeof key === 'number' || typeof key === 'boolean') {
            return String(key);
        }

        // Handle nested type/value structures for keys
        if (typeof key === 'object' && key !== null) {
            const extracted = this.extract_display_value(key);
            return extracted.display;
        }

        try {
            return JSON.stringify(key);
        } catch {
            return String(key);
        }
    }

    private truncate_middle(text: string, maxLength: number = 40): string {
        if (text.length <= maxLength) {
            return text;
        }
        const frontChars = Math.ceil(maxLength / 2) - 2;
        const backChars = Math.floor(maxLength / 2) - 2;
        return `${text.slice(0, frontChars)}...${text.slice(-backChars)}`;
    }

    private copy_to_clipboard(text: string, button: HTMLElement) {
        navigator.clipboard.writeText(text).then(() => {
            const originalHTML = button.innerHTML;
            button.innerHTML = `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>`;
            button.style.color = 'rgba(34, 197, 94, 1)';
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.color = '';
            }, 1500);
        });
    }

    private add_entry(entry: ContractStorageEntry) {
        const item = document.createElement('div');
        item.classList.add(`xe-contract-storage-item`);

        // Extract meaningful information
        const value = (entry.value ?? entry.data ?? null) as unknown;
        const extracted = this.extract_display_value(value);
        const key_str = this.get_key_string(entry.key);

        // Key container
        const key_container = document.createElement(`div`);
        key_container.classList.add(`xe-contract-storage-key-container`);
        item.appendChild(key_container);

        const key_element = document.createElement(`div`);
        key_element.classList.add(`xe-contract-storage-key`);
        key_element.textContent = this.truncate_middle(key_str, 30);
        key_element.title = key_str;
        key_container.appendChild(key_element);

        const key_copy_btn = document.createElement(`button`);
        key_copy_btn.classList.add(`xe-contract-storage-copy-btn`);
        key_copy_btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>`;
        key_copy_btn.title = localization.get_text(`Copy key`);
        key_copy_btn.onclick = (e) => {
            e.stopPropagation();
            this.copy_to_clipboard(key_str, key_copy_btn);
        };
        key_container.appendChild(key_copy_btn);

        // Value section
        const value_section = document.createElement(`div`);
        value_section.classList.add(`xe-contract-storage-item-value-section`);
        item.appendChild(value_section);

        // Display value with special handling for addresses
        if (extracted.isAddress) {
            const address_container = document.createElement(`div`);
            address_container.classList.add(`xe-contract-storage-address`);
            value_section.appendChild(address_container);

            const address_icon = document.createElement(`span`);
            address_icon.classList.add(`xe-contract-storage-address-icon`);
            address_icon.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                </svg>
            `;
            address_container.appendChild(address_icon);

            const address_link = document.createElement(`a`);
            address_link.classList.add(`xe-contract-storage-address-link`);
            address_link.href = `/account/${extracted.display}`;
            address_link.textContent = this.truncate_middle(extracted.display, 35);
            address_link.title = extracted.display;
            address_link.onclick = (e) => {
                e.stopPropagation();
            };
            address_container.appendChild(address_link);

            const address_copy_btn = document.createElement(`button`);
            address_copy_btn.classList.add(`xe-contract-storage-copy-btn`);
            address_copy_btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>`;
            address_copy_btn.title = localization.get_text(`Copy address`);
            address_copy_btn.onclick = (e) => {
                e.stopPropagation();
                this.copy_to_clipboard(extracted.display, address_copy_btn);
            };
            address_container.appendChild(address_copy_btn);
        } else {
            const value_element = document.createElement(`div`);
            value_element.classList.add(`xe-contract-storage-value`);
            value_section.appendChild(value_element);

            const value_text = document.createElement(`span`);
            value_text.style.flex = '1';
            value_text.style.minWidth = '0';
            value_text.style.overflow = 'hidden';
            value_text.style.textOverflow = 'ellipsis';
            value_text.style.whiteSpace = 'nowrap';
            const displayText = extracted.display.length > 100 ? this.truncate_middle(extracted.display, 100) : extracted.display;
            value_text.textContent = displayText;
            value_text.title = extracted.display;
            value_element.appendChild(value_text);

            const value_copy_btn = document.createElement(`button`);
            value_copy_btn.classList.add(`xe-contract-storage-copy-btn`);
            value_copy_btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>`;
            value_copy_btn.title = localization.get_text(`Copy value`);
            value_copy_btn.onclick = (e) => {
                e.stopPropagation();
                this.copy_to_clipboard(extracted.display, value_copy_btn);
            };
            value_element.appendChild(value_copy_btn);
        }

        // History button
        const history_button = document.createElement(`button`);
        history_button.classList.add(`xe-contract-storage-history-btn`);
        history_button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/>
                <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
                <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
            </svg>
        `;
        history_button.title = localization.get_text(`View History`) + (entry.topoheight !== undefined ? ` (${localization.get_text(`Topoheight`)} ${entry.topoheight.toLocaleString()})` : '');
        history_button.onclick = (e) => {
            e.stopPropagation();
            if (this.contract_hash) {
                let key_to_use: any = entry.key;
                if (typeof entry.key === 'string') {
                    try {
                        key_to_use = JSON.parse(entry.key);
                    } catch {
                        key_to_use = entry.key;
                    }
                }
                this.history_modal.show(this.contract_hash, key_to_use);
            }
        };
        item.appendChild(history_button);

        this.list_element.appendChild(item);
    }

    private render_pagination() {
        this.pagination_element.replaceChildren();

        // First page button
        const first_button = document.createElement(`button`);
        first_button.classList.add(`xe-contract-storage-pagination-btn`, `xe-contract-storage-pagination-first`);
        first_button.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M11.854 3.646a.5.5 0 0 1 0 .708L8.207 8l3.647 3.646a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708 0zM4.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 1 0v-13a.5.5 0 0 0-.5-.5z"/></svg>`;
        first_button.title = localization.get_text(`First page`);
        first_button.disabled = this.current_page === 0;
        first_button.onclick = () => this.goto_page(0);
        this.pagination_element.appendChild(first_button);

        // Previous page button
        const previous_button = document.createElement(`button`);
        previous_button.classList.add(`xe-contract-storage-pagination-btn`, `xe-contract-storage-pagination-prev`);
        previous_button.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>`;
        previous_button.title = localization.get_text(`Previous page`);
        previous_button.disabled = this.current_page === 0;
        previous_button.onclick = () => {
            if (this.current_page > 0) {
                this.goto_page(this.current_page - 1);
            }
        };
        this.pagination_element.appendChild(previous_button);

        // Page indicator
        const page_indicator = document.createElement(`div`);
        page_indicator.classList.add(`xe-contract-storage-page-indicator`);
        page_indicator.innerText = localization.get_text(`Page {}`, [(this.current_page + 1).toLocaleString()]);
        this.pagination_element.appendChild(page_indicator);

        // Next page button
        const next_button = document.createElement(`button`);
        next_button.classList.add(`xe-contract-storage-pagination-btn`, `xe-contract-storage-pagination-next`);
        next_button.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>`;
        next_button.title = localization.get_text(`Next page`);
        next_button.disabled = !this.has_next_page;
        next_button.onclick = () => {
            if (this.has_next_page) {
                this.goto_page(this.current_page + 1);
            }
        };
        this.pagination_element.appendChild(next_button);

        // Update info element
        if (this.total_entries_shown > 0) {
            const start = this.current_page * this.page_size + 1;
            const end = start + this.total_entries_shown - 1;
            this.info_element.innerHTML = localization.get_text(`Showing {}-{} entries`, [
                start.toLocaleString(),
                end.toLocaleString()
            ]);
            if (this.has_next_page) {
                this.info_element.innerHTML += ` ${localization.get_text(`(more available)`)}`;
            }
        } else {
            this.info_element.innerHTML = ``;
        }
    }

    private async goto_page(page: number) {
        if (!this.contract_hash) {
            return;
        }
        this.current_page = page;
        this.render_pagination();
        await this.load_entries(this.contract_hash, this.current_page);
    }

    private async load_entries(contract_hash: string, page: number) {
        const node = XelisNode.instance();
        const skip = page * this.page_size;
        const maximum = this.page_size;

        this.list_element.replaceChildren();
        this.set_loading(true);

        try {
            // Use the SDK method directly - it exists and is properly typed
            const entries = await node.rpc.getContractDataEntries({
                contract: contract_hash,
                minimum_topoheight: undefined,
                maximum_topoheight: undefined,
                skip,
                maximum,
            }) as ContractStorageEntry[];

            // Debug: log the response to understand the format
            console.log(`Storage entries response for contract ${contract_hash}:`, entries);
            
            this.total_entries_shown = Array.isArray(entries) ? entries.length : 0;
            this.has_next_page = this.total_entries_shown === maximum;
            this.render_pagination();

            if (!entries || entries.length === 0) {
                this.list_element.replaceChildren();
                const empty_element = document.createElement(`div`);
                empty_element.classList.add(`xe-contract-storage-empty`);
                empty_element.innerHTML = `
                    <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor" style="opacity: 0.3; margin-bottom: 1rem;">
                        <path d="M5 0h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2 2 2 0 0 1-2 2H3a2 2 0 0 1-2-2h1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1H1a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1H3a2 2 0 0 1 2-2z"/>
                        <path d="M1 6v-.5a.5.5 0 0 1 1 0V6h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V9h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 2.5v.5H.5a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1H2v-.5a.5.5 0 0 0-1 0z"/>
                    </svg>
                    <div>${localization.get_text(`No storage entries found`)}</div>
                    <div style="font-size: 0.85rem; opacity: 0.7; margin-top: 0.5rem;">${localization.get_text(`This contract has no storage entries yet`)}</div>
                `;
                this.list_element.appendChild(empty_element);
                return;
            }

            // Clear loading boxes and add entries
            this.list_element.replaceChildren();
            entries.forEach((entry) => {
                console.log(`Processing storage entry:`, entry);
                try {
                    this.add_entry(entry);
                } catch (entryError) {
                    console.error(`Error adding storage entry:`, entryError, entry);
                }
            });
            
            // Turn off loading after entries are added
            this.set_loading(false);
        } catch (e) {
            console.error(`Failed to load storage entries for contract ${contract_hash}:`, e);
            this.list_element.replaceChildren();
            const error_element = document.createElement(`div`);
            error_element.classList.add(`xe-contract-storage-error`);
            const error_message = e instanceof Error ? e.message : String(e);
            error_element.innerHTML = `
                <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor" style="opacity: 0.3; margin-bottom: 1rem; color: #ff6b6b;">
                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                <div>${localization.get_text(`Unable to load storage entries`)}</div>
                <div style="font-size: 0.85rem; opacity: 0.7; margin-top: 0.5rem;">${error_message}</div>
            `;
            this.list_element.appendChild(error_element);
            this.set_loading(false);
        }
    }

    async load(contract_hash: string) {
        this.contract_hash = contract_hash;
        this.current_page = 0;
        this.has_next_page = false;
        this.render_pagination();
        await this.load_entries(contract_hash, this.current_page);
    }

    destroy() {
        this.history_modal.destroy();
    }
}

