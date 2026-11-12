import {resolve} from 'node:path';
import {promises as fsp} from "node:fs";

// Validates that a path is within the current working directory.
export async function validatePath(inputPath) {
    const resolvedPath = resolve(inputPath);
    try {
        const stats = await fsp.stat(resolvedPath);

        if (!stats.isDirectory()) {
            throw new Error(`Path "${inputPath}" is not a directory.`);
        }
        return resolvedPath;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`Directory not found: ${inputPath}`);
        }
        throw error;
    }
}