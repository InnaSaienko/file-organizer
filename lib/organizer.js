import EventEmitter from "events";
import * as path from "node:path";
import { promises as fsp} from "node:fs";
import { pipeline } from 'stream/promises';
import fs from "node:fs";
import {categories, getAllFiles, getCategory, getUniqueFilename} from "../utils/helpers.js";

export default class Organizer extends EventEmitter {
    constructor() {
        super();
        this.stats = {};
        for (const category of Object.keys(categories)) {
            this.stats[category] = 0;
        }
        this.totalFiles = 0;
        this.processedFiles = 0;
    }

    async createCategoryDirectories(baseDir) {
        this.emit('creating-folders');
        for (const category of Object.keys(categories)) {
            const dirPath = path.join(baseDir, category);
            await fsp.mkdir(dirPath, { recursive: true });
            this.emit('folder-created', { category });
        }
    }

    async copyFile(filePath, targetPath) {
        const stats = await fsp.stat(filePath);

        if (stats.size < 10 * 1024 * 1024) {
            await fsp.copyFile(filePath, targetPath);
        } else {
            await pipeline(
                fs.createReadStream(filePath),
                fs.createWriteStream(targetPath)
            );
        }
    }

    async organize(sourceDir, targetDir) {
        const files = await getAllFiles(sourceDir, { excludeDirs: [path.relative(sourceDir, targetDir)]});
        this.totalFiles = files.length;
        let totalSize = 0;

        this.emit('organize-start', { sourceDir, targetDir });

        await this.createCategoryDirectories(targetDir);

        for (const filePath of files) {
            try {
                const category = getCategory(filePath);
                const fileName = path.basename(filePath);
                let targetPath = path.join(targetDir, category, fileName);

                // Handle duplicate filenames
                targetPath = await getUniqueFilename(targetPath);

                const stats = await fsp.stat(filePath);
                totalSize += stats.size;

                this.emit('copy-start', {
                    filePath,
                    targetPath,
                    current: this.processedFiles + 1,
                    total: this.totalFiles
                });
                await this.copyFile(filePath, targetPath);

                this.stats[category]++;
                this.processedFiles++;
                this.emit('copy-complete', { filePath, targetPath });
            } catch (error) {
                this.emit('copy-error', { filePath, error: error.message });
            }
        }

        this.emit('organize-complete', {
            stats: this.stats,
            targetDir,
            totalFiles: this.totalFiles,
            totalSize
        });

        return this.stats;
    }

}