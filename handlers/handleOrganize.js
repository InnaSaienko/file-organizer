// Handle organize command
import Organizer from "../lib/organizer.js";
import {drawProgressBar, formatSize} from "../utils/helpers.js";
import path from "path";

export async function handleOrganize(directory, options) {
    const organizer = new Organizer();

    organizer.on('organize-start', ({sourceDir, targetDir}) => {
        console.log(`📦 Organizing: ${sourceDir}`);
        console.log(`Target: ${targetDir}\n`);
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
    const targetDir = options.target || path.join(directory, 'Organized');
    await organizer.organize(directory, targetDir);
}