import EventEmitter from 'events';
import { promises as fs } from 'fs';
import * as path from "node:path";
import {getAllFiles, msPerDay} from "../utils/helpers.js";

export default class Scanner extends EventEmitter {
    constructor() {
        super();
    }

    async scan(directory) {
        const files = await getAllFiles(directory);
        const statistics = {
            totalFiles: 0,
            totalSize: 0,
            byType: {},
            age: {
                last7Days: 0,
                last30Days: 0,
                olderThan90: 0,
            },
            largestFiles: [],
            oldestFile: null,
        };

        const now = Date.now();
        const sevenDaysAgo = now - 7 * msPerDay;
        const thirtyDaysAgo = now - 30 * msPerDay;
        const ninetyDaysAgo = now - 90 * msPerDay;

        for (const filePath of files) {
            try {
                const stats = await fs.stat(filePath);

                if (!stats.isFile()) continue;

                const fileSize = stats.size;
                const mtime = stats.mtimeMs;
                const ext = path.extname(filePath).toLowerCase() || '.no-extension';

                // Update statistics
                statistics.totalFiles++;
                statistics.totalSize += fileSize;

                // By type
                if (!statistics.byType[ext]) {
                    statistics.byType[ext] = { count: 0, totalSize: 0 };
                }
                statistics.byType[ext].count++;
                statistics.byType[ext].totalSize += fileSize;

                // Age categories
                if (mtime >= sevenDaysAgo) {
                    statistics.age.last7Days++;
                } else if (mtime >= thirtyDaysAgo) {
                    statistics.age.last30Days++;
                } else if (mtime < ninetyDaysAgo) {
                    statistics.age.olderThan90++;
                }

                // Largest files (top 3)
                statistics.largestFiles.push({ name: path.basename(filePath), size: fileSize });
                statistics.largestFiles.sort((a, b) => b.size - a.size);
                if (statistics.largestFiles.length > 3) {
                    statistics.largestFiles.pop();
                }

                // Oldest file
                if (!statistics.oldestFile || mtime < statistics.oldestFile.mtime) {
                    statistics.oldestFile = {
                        name: path.basename(filePath),
                        mtime,
                    };
                }

                this.emit('file-found');
            } catch (error) {
                if (error.code !== 'EACCES' && error.code !== 'EPERM') {
                    console.warn(`Warning: Could not stat file ${filePath}: ${error.message}`);
                }
            }
        }

        this.emit('scan-complete', statistics);
    }
};