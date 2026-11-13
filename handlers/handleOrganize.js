// Handle organize command
import Organizer from "../lib/organizer.js";
import {drawProgressBar, formatSize} from "../utils/helpers.js";
import path from "path";
import { promises as fsp} from "node:fs";

export async function handleOrganize(directory, options) {

    const targetDir = options.output
        ? path.join(options.output, 'Organized')
        : path.join(directory, '..', 'Organized');
    console.log("Target directory before fsp.mkdir()", targetDir);

    try{
        const dirExists = await fsp.access(targetDir).then(() => true).catch(() => false);
        if (dirExists) {
            console.error(`❌ Directory '${targetDir}' already exists. Please choose a different directory.`);
            process.exit(1);
        }
    } catch (e) {
    }


    await fsp.mkdir(targetDir, { recursive: true });

    const organizer = new Organizer();

    organizer.on('organize-start', ({sourceDir, targetDir}) => {
        console.log(`📦 Organizing: ${sourceDir}`);
        console.log(`Target: ${targetDir}\n`);
    });

    organizer.on('error', ({ message }) => {
        console.error(`❌ ${message}`);
        process.exit(1);
    });

    organizer.on('creating-folders', () => {
        process.stdout.write('Creating folders...\n');
    });

    organizer.on('folder-created', ({category}) => {
        console.log(`  ✓ ${category}/`);
    });

    organizer.on('copy-start', ({current, total}) => {
        process.stdout.write(`\rCopying files... ${drawProgressBar(current, total)}`);
    });

    organizer.on('organize-complete', ({stats, targetDir, totalFiles, totalSize}) => {
        console.log('\n\n✅ Organization complete!\n');
        console.log('Summary:');

        for (const [category, count] of Object.entries(stats)) {
            console.log(`  ${category.padEnd(10)}: ${count} files → ${path.join(targetDir, category)}/`);
        }
        console.log(`\nTotal copied: ${totalFiles} files (${formatSize(totalSize)})`);
    });

    organizer.on('copy-error', ({filePath, error}) => {
        console.error(`\n❌ Failed to copy: ${filePath}`);
        console.error(`Reason: ${error}`);
    });

    await organizer.organize(directory, targetDir);
    console.log("Target dir path: ", targetDir);
}