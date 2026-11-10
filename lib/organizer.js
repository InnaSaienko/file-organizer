import EventEmitter from "events";
import * as path from "node:path";
import { promises as fs} from "node:fs";

export default class Organizer extends EventEmitter {
    constructor() {
        super();
    }

    async createCategoryDirectories(baseDir) {
        for (const category of Object.keys(categories)) {
            const dirPath = path.join(baseDir, category);
            await fs.mkdir(dirPath, { recursive: true });
        }
    }



}