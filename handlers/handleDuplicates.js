// Handle duplicates command
import DuplicateFinder from "../lib/duplicates.js";
import {drawProgressBar, formatSize, getAllFiles} from "../utils/helpers.js";
import {validatePath} from "../utils/validatePath.js";
import path from "path";

export async function handleDuplicates(directory) {
    const resolvedDir = await validatePath(directory);
    const duplicateFinder = new DuplicateFinder();

    console.log(`\n 🔍 Searching for duplicates in: ${resolvedDir}`);

    duplicateFinder.on('file-processed', ({ current, total }) => {
        process.stdout.write(`\rCalculating hashes... ${drawProgressBar(current, total)} ${current}/${total} files`);
    });

    duplicateFinder.on('duplicates-found', ({ duplicates, totalGroups, totalWastedSpace }) => {
        console.log('\n');
        console.log('━'.repeat(40));

        if (totalGroups === 0) {
            console.log('No duplicate files found.');
            return;
        }

        console.log(`Found ${totalGroups} duplicate groups (${formatSize(totalWastedSpace)} wasted):\n`);

        duplicates.forEach((group, index) => {
            console.log('━'.repeat(40));
            console.log(`Group ${index + 1} (${group.count} copies, ${formatSize(group.sizeEach)} each):`);
            console.log(`  SHA-256: ${group.files[0].hash.substring(0, 12)}...`);
            console.log('');

            // Extract relative path from resolvedDir
            group.files.forEach(file => {
                const relativePath = path.relative(resolvedDir, file.path);
                console.log(`  📄 ${relativePath}`);
            });

            console.log('');
            console.log(`  Wasted space: ${formatSize(group.wastedSpace)}`);
            console.log('');
        });

        console.log('━'.repeat(40), '\n');
        console.log(`💾 Total wasted space: ${formatSize(totalWastedSpace)}`);
    });

    await duplicateFinder.findDuplicates(resolvedDir);
}
