import EventEmitter from "events";
import { promises as fs, createReadStream  } from 'fs';
import * as path from "node:path";
import { createHash  } from 'crypto';

export default class Duplicates extends EventEmitter {
    constructor() {
        super();
    }

    async calculateHash(filePath) {
        return new Promise((resolve, reject) => {
            const hash = createHash('sha256');
            const stream = createReadStream(filePath);

            stream.on('data', (chunk) => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }

    async getAllFiles(directory) {
        const files = [];
        const entries = await fs.readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                const subFiles = await this.getAllFiles(fullPath);
                files.push(...subFiles);
            } else if (entry.isFile()) {
                files.push(fullPath);
            }
        }
        return files;
    }

    async findDuplicates(directory) {
        const files = await this.getAllFiles(directory);
        const hashMap = new Map();

        for (const filePath of files) {
            try {
                const hash = await this.calculateHash(filePath);
                const stats = await fs.stat(filePath);

                if (!hashMap.has(hash)) {
                    hashMap.set(hash, []);
                }
                hashMap.get(hash).push({
                    path: filePath,
                    size: stats.size,
                    name: path.basename(filePath)
                });

                this.emit('file-processed', { filePath });
            } catch (error) {
                if (error.code !== 'EACCES' && error.code !== 'EPERM') {
                    console.warn(`Warning: Could not process ${filePath}: ${error.message}`);
                }
            }
        }

        // Filter only duplicates (groups with more than 1 file)
        const duplicates = Array.from(hashMap.values()).filter(group => group.length > 1);

        this.emit('duplicates-found', { duplicates, totalGroups: duplicates.length });
        return duplicates;
    }
}