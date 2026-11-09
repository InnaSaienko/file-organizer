// Handle duplicates command
import DuplicateFinder from "../lib/duplicates.js";

export async function handleDuplicates(directory) {
    const duplicateFinder = new DuplicateFinder();
    let processedFiles = 0;
    let totalFiles = 0;

    // Get total files first
    try {
        const files = await duplicateFinder.getAllFiles(directory);
        totalFiles = files.length;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }

    console.log(`🔍 Searching for duplicates in: ${directory}`);

    duplicateFinder.on('file-processed', () => {
        processedFiles++;
        process.stdout.write(`\rProcessing... ${processedFiles}/${totalFiles} files`);
    });

    duplicateFinder.on('duplicates-found', ({ duplicates, totalGroups }) => {
        console.log('\n');
        console.log('📋 Duplicate Files Found:');
        console.log('━'.repeat(50));

        if (totalGroups === 0) {
            console.log('No duplicate files found.');
            return;
        }

        console.log(`Total duplicate groups: ${totalGroups}\n`);

        duplicates.forEach((group, index) => {
            console.log(`Group ${index + 1} (${group.length} files, ${group[0].size} bytes):`);
            group.forEach(file => {
                console.log(`  - ${file.path}`);
            });
            console.log('');
        });
    });

    await duplicateFinder.findDuplicates(directory);
}
