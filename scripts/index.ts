import { program } from 'commander';
import unzipper from "unzipper";
import { request } from "node:http"
import fs from "fs"
import fs_async from "fs/promises";
import path from 'node:path';

program
    .name('canvas-to-observable')
    .version('0.0.0');

program.command('import')
    .description('Imports a zip of student submissions')
    .argument('<url-or-file>', 'link or file where the zip is holding all the student submissions')
    .option('-o, --out <directory>', 'output directory', 'docs')
    .action(async (file: string, options) => {

        if (fs.existsSync(options.out)) await fs_async.rm(options.out, { recursive: true })
        await fs_async.mkdir(options.out);

        let zip: unzipper.CentralDirectory;
        if (file.startsWith("http")) {
            zip = await unzipper.Open.url(request(file), file)
        } else {
            zip = await unzipper.Open.file(file)
        }

        for (let file of zip.files) {
            const linkHTML = (await file.buffer()).toString();

            let id = null;

            // Match unlisted share links
            let match = linkHTML.match(/https:\/\/observablehq\.com\/d\/([0-9a-f]+)/);
            if (match == null) {
                // Match public share links
                match = linkHTML.match(/https:\/\/observablehq\.com\/(@[\w]+\/[\w\-]+)/)
                if (match == null) {
                    console.warn("Could not find observable url in file "+file.path)
                    continue;
                }

                let publicId = match[1]; // Like "@username/my-notebook"
                // We need the id in order to export, so we need to request the notebook id from the document api using the public path
                const res = await fetch(`https://api.observablehq.com/document/${publicId}`);
                if (!res.ok) {
                    console.warn("Failed to fetch id from ", res.url, " found in ", file.path);
                    continue
                }
                id = (await res.json()).id

            } else {
                id = match[1];
            }

            // Download the notebook html file
            const res = await fetch(`https://observablehq.com/api/export/${id}?format=html`);
            if (!res.ok) {
                console.warn("Failed to download notebook from ", res.url, " found in ", file.path)
                continue;
            }
            // Save to the folder with the exact same name as the canvas link file
            await fs_async.writeFile(path.resolve(options.out, file.path), new DataView(await res.arrayBuffer()))
        }
    });

program.parse();

