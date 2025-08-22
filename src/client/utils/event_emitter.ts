export type EventEmitterMap = {
    [key: string]: any;
}

type EventListener<T> = (data?: T) => void;

export class EventEmitter<T extends EventEmitterMap> {
    private _events: Map<keyof T, EventListener<T[keyof T]>[]>

    constructor() {
        this._events = new Map();
    }

    emit(event: keyof T, data: T[keyof T]) {
        const listeners = this._events.get(event);
        if (!listeners) return;
        listeners.forEach(listener => listener(data));
    }

    add_listener(event: keyof T, listener: EventListener<T[keyof T]>) {
        const listeners = this._events.get(event) || [];
        this._events.set(event, [...listeners, listener]);
    }

    remove_listener(event: keyof T, listener: EventListener<T[keyof T]>) {
        const listeners = this._events.get(event);
        if (!listeners) return;
        this._events.set(event, listeners.filter(l => l !== listener));
    }

    clear_listeners(event?: keyof T) {
        if (event) {
            this._events.delete(event);
        } else {
            this._events.clear();
        }
    }
}