import EventEmitter from "events";
import {promises as fsp} from "node:fs";
import {getAllFiles, msPerDay} from "../utils/helpers.js";
import {validatePath} from "../utils/validatePath.js";

export default class Cleanup extends EventEmitter {
    constructor() {
        super();
        this.filesToDelete = [];
        this.totalFilesToDelete = 0;
        this.totalFilesSizeToDelete = 0;
    }

    async cleanup(directory, options, timeLimit, confirm = false) {
        const resolvedDir = await validatePath(directory, {excludeDirs: [options?.output]});
        const files = await getAllFiles(resolvedDir);
        const timeLimitMs = timeLimit * msPerDay;
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
                    await new Promise(resolve => setTimeout(resolve, 10));
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