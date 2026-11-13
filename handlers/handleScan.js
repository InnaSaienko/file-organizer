// Handle scan command
import {drawProgressBar, formatSize, getAllFiles} from "../utils/helpers.js";
import Scanner from "../lib/scanner.js";
import {validatePath} from "../utils/validatePath.js";

export async function handleScan(directory, options) {
    const resolvedDir = await validatePath(directory);

    const scanner = new Scanner();
    let processedFiles = 0;
    let totalFiles = 0;

    // Get total files first for progress bar
    try {
        const files = await getAllFiles(resolvedDir);
        totalFiles = files.length;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }

    console.log(`📂 Scanning of resolved dir: ${resolvedDir}`);

    scanner.on('file-found', () => {
        processedFiles++;
        process.stdout.write(`\rProcessing... ${drawProgressBar(processedFiles, totalFiles)}`);
    });

    scanner.on('scan-complete', (statistics) => {
        console.log('\n');
        console.log('📊 Scan Results:');
        console.log('━'.repeat(50));
        console.log(`Total files: ${statistics.totalFiles}`);
        console.log(`Total size: ${formatSize(statistics.totalSize)}`);
        console.log('');

        console.log('By File Type:');
        for (const [ext, data] of Object.entries(statistics.byType)) {
            console.log(`  ${ext.padEnd(6)} ${data.count.toString().padStart(3)} files   ${formatSize(data.totalSize).padStart(8)}`);
        }
        console.log('');

        console.log('File Age:');
        console.log(`  Last 7 days:    ${statistics.age.last7Days} files`);
        console.log(`  Last 30 days:   ${statistics.age.last30Days} files`);
        console.log(`  Older than 90:  ${statistics.age.olderThan90} files`);
        console.log('');

        console.log('Largest files:');
        statistics.largestFiles.slice(0, 3).forEach((file, index) => {
            console.log(`  ${index + 1}. ${file.name.padEnd(25)} ${formatSize(file.size).padStart(8)}`);
        });
        console.log('');

        if (statistics.oldestFile) {
            const daysAgo = Math.floor((Date.now() - statistics.oldestFile.mtime) / (1000 * 60 * 60 * 24));
            console.log(`Oldest file: ${statistics.oldestFile.name} (modified ${daysAgo} days ago)`);
        }
    });

    await scanner.scan(resolvedDir);
}