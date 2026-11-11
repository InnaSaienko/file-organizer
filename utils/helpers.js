import path from "path";
import { promises as fsp } from 'node:fs';

export const formatSize = (bytes) => {
    if (bytes < 1024) {
        return `${bytes} bytes`;
    } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
}

export const drawProgressBar = (current, total, width = 20) =>{
    const percentage = current / total;
    const filled = Math.round(percentage * width);
    const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(width - filled);
    return `${bar} ${current}/${total}`;
}

export const categories = {
    Documents: ['.pdf', '.docx', '.doc', '.txt', '.md', '.xlsx', '.pptx'],
    Images: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'],
    Archives: ['.zip', '.rar', '.tar', '.gz', '.7z'],
    Code: ['.js', '.py', '.java', '.cpp', '.html', '.css', '.json'],
    Videos: ['.mp4', '.avi', '.mkv', '.mov', '.webm'],
    Other: []
};

export async function getUniqueFilename(filePath) {
    let uniquePath = filePath;
    let counter = 1;
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);

    while (await fsp.access(uniquePath).then(() => true).catch(() => false)) {
        uniquePath = path.join(dir, `${base}(${counter})${ext}`);
        counter++;
    }

    return uniquePath;
}

export function getCategory(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    for (const [category, extensions] of Object.entries(categories)) {
        if (extensions.includes(ext)) {
            return category;
        }
    }
    return "Other";
}