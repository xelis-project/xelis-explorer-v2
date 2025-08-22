import { App } from "./app/app";

function main() {
    const root = document.getElementById(`app`);
    if (root) {
       const instance = App.instance();
       instance.load(root);
    } else {
        throw new Error("root element is not in dom");
    }
}

main();