import EventEmitter from "events";
import path from "path";
import {promises as fsp} from "node:fs";

export default class Cleanup extends EventEmitter {
    constructor() {
        super();
        this.filesToDelete = [];
        this.totalFilesToDelete = this.filesToDelete.length;
        this.totalFilesSizeToDelete = 0;
    }

    async getAllFiles(directory) {
        const files = [];
        const entries = await fsp.readdir(directory, {withFileTypes: true});

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

    async cleanup(directory, timeLimit, confirm = false) {
        const files = await this.getAllFiles(directory);
        const timeLimitMs = timeLimit * 24 * 60 * 60 * 1000;
        const now = Date.now();

        this.emit('cleanup-start', {directory, timeLimit});

        for (const filePath of files) {
            try {
                const stats = await fsp.stat(filePath);
                const fileAge = now - stats.mtime.getTime();

                if (fileAge > timeLimitMs) {
                    this.filesToDelete.push({
                        path: filePath,
                        size: stats.size,
                        mtime: stats.mtime
                    });
                    this.totalFilesSizeToDelete += stats.size;
                    this.totalFilesToDelete += 1;
                    this.emit('file-found', {filePath, size: stats.size, mtime: stats.mtime});
                }
            } catch (error) {
                this.emit('error', {filePath, error: error.message});
            }
        }

        if (confirm) {
            this.emit('deleting-start', {
                count: this.filesToDelete.length,
                totalSize: this.totalFilesSizeToDelete
            });

            for (const [index, file] of this.filesToDelete.entries()) {
                try {
                    await fsp.unlink(file.path);
                    this.emit('file-deleted', {
                        filePath: file.path,
                        current: index + 1,
                        total: this.filesToDelete.length
                    });
                } catch (error) {
                    this.emit('delete-error', {filePath: file.path, error: error.message});
                }
            }
        }
        this.emit('cleanup-complete', {
            files: this.filesToDelete,
            totalSize: this.totalFilesSizeToDelete,
            confirm
        });
    }


}