import EventEmitter from "events";
import { promises as fsp, createReadStream } from 'fs';
import * as path from "node:path";
import { createHash  } from 'crypto';
import {getAllFiles} from "../utils/helpers.js";

export default class Duplicates extends EventEmitter {
    constructor() {
        super();
        this.totalWastedSpace = 0;
        this.duplicateGroups = [];
        this.processedFiles = 0;
        this.totalFiles = 0;
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


    async findDuplicates(directory) {
        const files = await getAllFiles(directory);

        this.totalFiles = files.length;
        this.processedFiles = 0;
        this.totalWastedSpace = 0;

        const hashMap = new Map();

        for (const filePath of files) {
            try {
                const hash = await this.calculateHash(filePath);
                const stats = await fsp.stat(filePath);

                if (!hashMap.has(hash)) {
                    hashMap.set(hash, []);
                }

                hashMap.get(hash).push({
                    path: filePath,
                    size: stats.size,
                    name: path.basename(filePath),
                    hash
                });

                this.processedFiles++;

                this.emit('file-processed', {
                    current: this.processedFiles,
                    total: this.totalFiles,
                    filePath
                });

            } catch (error) {
                if (error.code !== 'EACCES' && error.code !== 'EPERM') {
                    console.warn(
                        `Warning: Could not process ${filePath}: ${error.message}`
                    );
                }
            }
        }

        this.duplicateGroups = Array.from(hashMap.values())
            .filter(group => group.length > 1)
            .map(group => {
                const sizeEach = group[0].size;
                const wastedSpace = (group.length - 1) * sizeEach;

                this.totalWastedSpace += wastedSpace;

                return {
                    hash: group[0].hash,
                    files: group,
                    count: group.length,
                    sizeEach,
                    wastedSpace
                };
            });

        this.emit('duplicates-found', {
            duplicates: this.duplicateGroups,
            totalGroups: this.duplicateGroups.length,
            totalWastedSpace: this.totalWastedSpace
        });

        return this.duplicateGroups;
    }

}