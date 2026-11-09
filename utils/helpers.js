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