import path from 'path';
import fs from 'fs';
import dir from 'node-dir';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
    .options({
        src: { type: "string", demandOption: true },
        out: { type: "string", demandOption: true }
    })
    .parseSync();

const main = () => {
    const patterns = [
        /localization.get_text\(`([^`]*)`/g,
        /localization.get_text\("([^"]*)"/g,
        /localization.get_text\('([^']*)'/g
    ]

    let dictionary = {} as Record<string, string>;

    const outdir = path.dirname(argv.out);
    if (!fs.existsSync(outdir)) {
        fs.mkdirSync(outdir, { recursive: true });
    }

    const on_file = (err: any, content: string | Buffer, next: () => void) => {
        if (err) throw err

        if (typeof content === `string`) {
            patterns.forEach(pattern => {
                const t_matches = content.matchAll(pattern);
                for (const match of t_matches) {
                    const key = match[1];
                    dictionary[key] = key;
                }
            });
        }

        next()
    }

    const on_finish = (err: any, files: string[]) => {
        if (err) throw err

        if (fs.existsSync(argv.out)) {
            const dictionary_string = fs.readFileSync(argv.out, `utf-8`)
            const current_dictionary = JSON.parse(dictionary_string)

            Object.keys(current_dictionary).forEach((key) => {
                if (!dictionary[key]) {
                    delete current_dictionary[key];
                    console.log(`Remove key: ${key}`);
                }
            });

            Object.keys(dictionary).forEach((key) => {
                if (!current_dictionary[key]) {
                    current_dictionary[key] = key;
                    console.log(`Add key: ${key}`);
                }
            });

            const new_dictionary_string = JSON.stringify(current_dictionary, null, 2);
            fs.writeFileSync(argv.out, new_dictionary_string);
        } else {
            console.log(dictionary);
            const dictionary_string = JSON.stringify(dictionary, null, 2);
            fs.writeFileSync(argv.out, dictionary_string);
            console.log(`New lang dictionary created.`);
        }
    }

    dir.readFiles(argv.src, on_file, on_finish);
}

main();