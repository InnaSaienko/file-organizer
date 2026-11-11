// Handle cleanup command
import Cleanup from "../lib/cleanup.js";
import { formatSize, drawProgressBar } from "../utils/helpers.js";
import * as path from "node:path";

export async function handleCleanup(directory, options) {
    const cleanup = new Cleanup();
    const timeLimit = parseInt(options.olderThan) || 0;
    const confirm = options.confirm || false;

    cleanup.on('cleanup-start', ({ directory, timeLimit }) => {
        console.log(`🧹 Cleanup: ${directory}`);
        console.log(`Looking for files older than ${timeLimit} days...\n`);
    });

    cleanup.on('file-found', ({ filePath, size, mtime }) => {
        const fileName = path.basename(filePath);
        const daysAgo = Math.floor((Date.now() - mtime.getTime()) / (1000 * 60 * 60 * 24));
        const date = mtime.toISOString().split('T')[0];
        console.log(`${fileName}`);
        console.log(`  Size: ${formatSize(size)}`);
        console.log(`  Modified: ${daysAgo} days ago (${date})\n`);
    });

    cleanup.on('deleting-start', ({ count, totalSize }) => {
        console.log(`\n⚠️  DELETING ${count} files (${formatSize(totalSize)}). This action cannot be undone!\n`);
        console.log('Deleting...');
    });

    cleanup.on('file-deleted', ({ current, total }) => {
        process.stdout.write(`\r${drawProgressBar(current, total)} ${current}/${total}`)
    });

    cleanup.on('cleanup-complete', ({ files, totalSize, confirm }) => {
        console.log(confirm ? '\n' : '');
        if (files.length === 0) {
            console.log('No old files found.');
        } else {
            console.log(`\nTotal: ${files.length} files (${formatSize(totalSize)})`);
            if (!confirm) {
                console.log('\n⚠️  DRY RUN MODE: No files were deleted.');
                console.log('To actually delete these files, run with --confirm flag.');
            } else {
                console.log(`\n✅ Cleanup complete!`);
                console.log(`Deleted: ${files.length} files (${formatSize(totalSize)} freed)`);
            }
        }
    });

    cleanup.on('delete-error', ((filePath, error) => {
        console.error(`\n❌ Failed to delete: ${filePath}`);
        console.error(`Reason: ${error}`);
    }));

    await cleanup.cleanup(directory, timeLimit, confirm);

}