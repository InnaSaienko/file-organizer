# File Organizer CLI

**File Organizer** is a Node.js CLI tool designed to automate file organization in your `Downloads` directory (or any other). It helps analyze directory contents, find duplicates, organize files by categories, and delete outdated files.

## 📌 Task Description
This project is a practical assignment from the **Node.js** course, implementing a CLI application for file management. It demonstrates the following concepts:
- File system operations (`fs`, `fs/promises`)
- Event-driven architecture using `EventEmitter`
- Handling large files via `streams`
- Asynchronous programming (`async/await`, `Promises`)
- SHA-256 hashing for duplicate detection
- Error handling with `try...catch`

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd file-organizer
```

### 2. Install Dependencies
```bash
npm install
```

*(No dependencies are required if you only use built-in Node.js modules.)*

---

## 📖 Usage

### 🔹 General Syntax
```bash
node file-organizer.js <command> [options] <directory>
```

Or via npm scripts:
```bash
npm run <command> -- [options] <directory>
```

### 🔹 Help Command

To see available commands and usage instructions:
```bash
node file-organizer.js --help
```
or
```bash
node file-organizer.js
```

This will display all available commands including `scan` and `duplicates`.

---

## 🛠️ Available Commands

### 🔍 `scan` – Directory Analysis
Recursively scans the specified directory and collects statistics about files: count, sizes, types, and age.

**Syntax:**
```bash
node file-organizer.js scan /path/to/directory
```

**Example:**
```bash
npm run scan -- ~/Downloads
```
**Output:**
```
📂 Scanning: /Users/student/Downloads
Processing... ████████████████████ 247/247 files

📊 Scan Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total files: 247
Total size: 1.2 GB

By File Type:
  .pdf    89 files   456 MB
  .zip    23 files   234 MB
  .png    67 files   187 MB

File Age:
  Last 7 days:    45 files
  Last 30 days:   89 files
  Older than 90:  56 files

Largest files:
  1. video_lecture.mp4    450 MB
  2. archive_backup.zip   156 MB
  3. presentation.pptx     89 MB

Oldest file: old_report.pdf (modified 365 days ago)
```

---

### 🔄 `duplicates` – Find Duplicate Files
Scans the specified directory and finds duplicate files using SHA-256 hashing. Efficiently processes large files using streams.

**Syntax:**
```bash
node file-organizer.js duplicates /path/to/directory
```

**Example:**
```bash
npm run duplicates -- ~/Downloads
```

**Output:**
```
🔍 Searching for duplicates in: /Users/student/Downloads
Processing files... ███████████████████ 247/247

📋 Duplicate Files Found:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total duplicate groups: 3

Group 1 (SHA-256: a1b2c3...):
  1. /Downloads/image1.jpg (1.2 MB)
  2. /Downloads/image1_copy.jpg (1.2 MB)

Group 2 (SHA-256: d4e5f6...):
  1. /Downloads/document.pdf (2.5 MB)
  2. /Downloads/document_backup.pdf (2.5 MB)

Group 3 (SHA-256: g7h8i9...):
  1. /Downloads/notes.txt (12 KB)
  2. /Downloads/notes_old.txt (12 KB)
```

---

### Event-Driven Architecture (`EventEmitter`)
Each command is implemented as a class extending `EventEmitter`, separating business logic from progress display.

**Example (Scanner):**
```javascript
import { EventEmitter } from 'events';

class Scanner extends EventEmitter {
  async scan(directory) {
    this.emit('scan-start', { directory });
    // ... обробка файлів
    this.emit('file-found', { path: filePath, size: fileSize });
    this.emit('scan-complete', { totalFiles, totalSize });
  }
}
```

### Handling Large Files (`streams`)
For files **≥10 MB**, `streams` are used instead of `fs.readFile()` or `fs.copyFile()` to avoid memory overload.

**Example (Copying a Large File):**
```javascript
import { pipeline } from 'stream/promises';
import fs from 'fs';

await pipeline(
  fs.createReadStream(sourcePath),
  fs.createWriteStream(targetPath)
);
```

### Hashing (SHA-256)
For duplicate detection, `crypto.createHash('sha256')` is used with `fs.createReadStream()` for efficient processing of large files.

**Example:**
```javascript
import crypto from 'crypto';
import fs from 'fs';

function calculateHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}
```

### Error Handling
All file operations are wrapped in `try...catch` with specific messages for error codes (`ENOENT`, `EACCES`, etc.).

**Example:**
```javascript
try {
  const files = await fs.readdir(directory);
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(`❌ Error: Directory not found: ${directory}`);
  } else if (error.code === 'EACCES') {
    console.error(`❌ Error: Permission denied: ${directory}`);
  } else {
    console.error(`❌ Unexpected error: ${error.message}`);
  }
  process.exit(1);
}
```

---

## 🎯 Useful Links
- [Node.js Documentation (fs module)](https://nodejs.org/api/fs.html)
- [Node.js Documentation (streams)](https://nodejs.org/api/stream.html)
- [Node.js Documentation (crypto module)](https://nodejs.org/api/crypto.html)
- [EventEmitter API](https://nodejs.org/api/events.html)

---

## 📜 License
This project is created as an educational assignment and is not intended for commercial use.
