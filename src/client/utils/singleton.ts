export class Singleton<T> {
    private static _instance: any = null;

    constructor() {
        if ((this.constructor as any)._instance) {
            throw new Error(`Instance of ${this.constructor.name} already created.`);
        }
    }

    static instance<T>(this: new () => T): T {
        const C = this as any;
        if (!C._instance) {
            C._instance = new C();
        }

        return C._instance;
    }
}
