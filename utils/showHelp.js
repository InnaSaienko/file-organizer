export const showHelp = () => {
    console.log('Usage: node file-organizer.js <command> [options] <directory>');
    console.log('\nAvailable commands:');
    console.log('  scan       - Analyze directory and show file statistics');
    console.log('  duplicates - Find duplicate files using SHA-256 hashes');
    console.log('  organize   - Organize files into categories');
    console.log('  cleanup    - Find and delete old files');
    process.exit(1);
}