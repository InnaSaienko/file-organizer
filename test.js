import {describe, it, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdir, rm} from 'node:fs/promises';

// Setup test directory
const testDir = './test';
before(async () => {
    await mkdir(testDir, {recursive: true}).catch(() => {
    });
});
after(async () => {
    await rm(testDir, {recursive: true, force: true}).catch(() => {
    });
});

// Test parseArgs
import {parseArgs} from './utils/parseArgs.js';

describe('parseArgs', () => {
    it('should return the command', () => {
        const args = ['node', 'file-organizer.js', 'scan'];
        const result = parseArgs(args);
        assert.strictEqual(result.command, 'scan');
    });
    it('should return positional arguments', () => {
        const args = ['node', 'file-organizer.js', 'scan', './Downloads'];
        const result = parseArgs(args);
        assert.deepStrictEqual(result.positional, ['./Downloads']);
    });
    it('should return options', () => {
        const args = ['node', 'file-organizer.js', 'scan', '--confirm'];
        const result = parseArgs(args);
        assert.deepStrictEqual(result.options, {confirm: true});
    });
});


// Test validatePath
import {validatePath} from './utils/validatePath.js';

describe('validatePath', () => {
    it('resolves relative paths', async () => {
        const resolved = await validatePath(testDir);
        assert.ok(resolved.startsWith(process.cwd()));
    });
});

// Test getAllFiles
import {getAllFiles} from './utils/helpers.js';

describe('getAllFiles', () => {
    it('returns array of files', async () => {
        const files = await getAllFiles(testDir);
        assert.ok(Array.isArray(files));
    });
});

// Test formatSize
import {formatSize} from './utils/helpers.js';

describe('formatSize', () => {
    it('formats bytes to human-readable', () => {
        assert.equal(formatSize(1024), '1.0 KB');
        assert.equal(formatSize(1024 * 1024), '1.0 MB');
    });
});