// Handle organize command
import Organizer from "../lib/organizer.js";

export async function handleOrganize(directory, options) {
    const outputDir = options.output || './organized';
    const organizer = new Organizer();
    let processedFiles = 0;
    let totalFiles = 0;
}