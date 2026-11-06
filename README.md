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

### 🔎 `duplicates` – Find Duplicate Files
Finds files with identical content by computing **SHA-256 hashes** and shows wasted disk space.

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
Calculating hashes... ████████████████████ 247/247 files

Found 3 duplicate groups (8.7 MB wasted):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Group 1 (3 copies, 3.2 MB each):
  SHA-256: a3f2e1b8c4d5...
  
  📄 Downloads/lecture.pdf
  📄 Downloads/lecture(1).pdf
  📄 Downloads/backup/lecture_copy.pdf
  
  Wasted space: 6.4 MB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💾 Total wasted space: 8.7 MB
```

---

### 📦 `organize` – Organize Files by Categories
Copies files from the source directory to the target directory, organizing them into categories (**Documents**, **Images**, **Archives**, **Code**, **Videos**, **Other**).

**Syntax:**
```bash
node file-organizer.js organize /source/directory --output /target/directory
```

**Example:**
```bash
npm run organize -- ~/Downloads --output ~/Organized
```

**Output:**
```
📦 Organizing: /Users/student/Downloads
Target: /Users/student/Organized

Creating folders...
  ✓ Documents/
  ✓ Images/
  ✓ Archives/
  ✓ Code/
  ✓ Videos/
  ✓ Other/

Copying files... ████████████████████ 247/247

✅ Organization complete!

Summary:
  Documents: 134 files → Organized/Documents/
  Images:     67 files → Organized/Images/
  Archives:   23 files → Organized/Archives/
  Code:       12 files → Organized/Code/
  Videos:      8 files → Organized/Videos/
  Other:       3 files → Organized/Other/

Total copied: 247 files (1.2 GB)
```

**File Categories:**
| Category   | Extensions                                                                 |
|------------|----------------------------------------------------------------------------|
| Documents  | `.pdf`, `.docx`, `.doc`, `.txt`, `.md`, `.xlsx`, `.pptx`                  |
| Images     | `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`, `.bmp`                  |
| Archives   | `.zip`, `.rar`, `.tar`, `.gz`, `.7z`                                      |
| Code       | `.js`, `.py`, `.java`, `.cpp`, `.html`, `.css`, `.json`                   |
| Videos     | `.mp4`, `.avi`, `.mkv`, `.mov`, `.webm`                                  |
| Other      | All other extensions                                                      |

---

### 🧹 `cleanup` – Delete Old Files
Finds and deletes files older than the specified number of days. By default, it runs in **dry run mode** (shows the list without deletion).

**Syntax:**
```bash
# Show list of old files (without deletion)
node file-organizer.js cleanup /path/to/directory --older-than 90

# Delete files with confirmation
node file-organizer.js cleanup /path/to/directory --older-than 90 --confirm
```

**Example (Dry Run):**
```bash
npm run cleanup -- ~/Downloads --older-than 90
```

**Output (Dry Run):**
```
🧹 Cleanup: /Users/student/Downloads
Looking for files older than 90 days...

Found 45 files to delete:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
old_report.pdf
  Size: 2.3 MB
  Modified: 120 days ago (2024-09-05)

backup_2023.zip
  Size: 45 MB
  Modified: 180 days ago (2023-07-08)
... (42 more files)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: 45 files (156 MB)

⚠️  DRY RUN MODE: No files were deleted.
To actually delete these files, run with --confirm flag.
```

**Example (With Deletion):**
```bash
npm run cleanup -- ~/Downloads --older-than 90 --confirm
```

**Output (With Deletion):**
```
🧹 Cleanup: /Users/student/Downloads
Looking for files older than 90 days...

Found 45 files to delete:
... (file list) ...

⚠️  DELETING 45 files (156 MB). This action cannot be undone!

Deleting... ████████████████████ 45/45

✅ Cleanup complete!
Deleted: 45 files (156 MB freed)
```

---

## 📁 Project Structure
```
file-organizer/
├── package.json          # Project configuration
├── .gitignore            # Files excluded from Git
├── README.md             # Documentation
├── file-organizer.js     # Entry point
└── lib/
    ├── scanner.js        # `scan` command
    ├── duplicates.js     # `duplicates` command
    ├── organizer.js      # `organize` command
    └── cleanup.js        # `cleanup` command
```

---

## ⚙️ Technical Details

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
