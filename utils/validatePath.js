import { resolve } from 'node:path';

// Validates that a path is within the current working directory.
export function validatePath(inputPath) {
    const resolvedPath = resolve(inputPath);
    const cwd = resolve(process.cwd());
    if (!resolvedPath.startsWith(cwd)) {
        throw new Error(`Path "${inputPath}" is outside the current directory.`);
    }
    return resolvedPath;
}