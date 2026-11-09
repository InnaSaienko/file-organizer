import EventEmitter from "events";

export default class Duplicates extends EventEmitter {
    constructor() {
        super();
    }

    async calculateHash(filePath) {
    }

    async getAllFiles(directory) {
        const files = [];
        return files;
    }

    async findDuplicates(directory) {
        const files = await this.getAllFiles(directory);
        const hashMap = new Map();
        const duplicates = [];
        return duplicates;

    };
}