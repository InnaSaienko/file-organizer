# File Organizer CLI

**File Organizer** is a Node.js CLI tool designed to automate file organization in any directory. It helps analyze directory contents, find duplicates, organize files by categories, and delete outdated files.

## Features

- **Scan**: Recursively analyze directories with file statistics (count, sizes, types, age)
- **Duplicates**: Find duplicate files using SHA-256 hashing with stream-based processing
- **Organize**: Automatically categorize files into folders (Documents, Images, Archives, Code, Videos, Other)
- **Cleanup**: Find and delete old files with dry-run mode and confirmation

## Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd file-organizer
```

### 2. Install Dependencies
```bash
npm install
```

*(Uses built-in Node.js modules: fs, path, crypto, events, stream)*

---

## Usage

### General Syntax
```bash
node file-organizer.js <command> [options] <directory>
```

### Available Commands

| Command | Description | Options |
|---------|-------------|---------|
| `scan` | Analyze directory and show file statistics | None |
| `duplicates` | Find duplicate files using SHA-256 hashes | None |
| `organize` | Organize files into categories | `--target <dir>` |
| `cleanup` | Find and delete old files | `--olderThan <days>`, `--confirm` |
| `--help` | Show help message | None |

### Help
To see available commands and usage instructions:
```bash
node file-organizer.js --help
```
or
```bash
node file-organizer.js help
```

---

## Commands in Detail

### `scan` - Directory Analysis
Recursively scans the specified directory and collects statistics about files: count, sizes, types, and age.

**Syntax:**
```bash
node file-organizer.js scan <directory>
```

**Example:**
```bash
node file-organizer.js scan ~/Downloads
```

**Output:**
```
Scanning of resolved dir: /Users/username/Downloads
Processing... [progress bar] 247/247 files

Scan Results:
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

### `duplicates` - Find Duplicate Files
Scans the specified directory and finds duplicate files using SHA-256 hashing. Uses streams for efficient processing of large files.

**Syntax:**
```bash
node file-organizer.js duplicates <directory>
```

**Example:**
```bash
node file-organizer.js duplicates ~/Downloads
```

**Output:**
```
Searching for duplicates in: /Users/username/Downloads
Calculating hashes... [progress bar] 247/247 files

Found 3 duplicate groups (450 MB wasted):

Group 1 (2 copies, 1.2 MB each):
  SHA-256: a1b2c3d4e5f6...
  image1.jpg
  image1_copy.jpg
  Wasted space: 1.2 MB

Group 2 (2 copies, 2.5 MB each):
  SHA-256: d4e5f6g7h8i9...
  document.pdf
  document_backup.pdf
  Wasted space: 2.5 MB

Total wasted space: 450 MB
```

---

### `organize` - Organize Files into Categories
Organizes files into category folders. Files are copied (not moved) to maintain originals.

**Syntax:**
```bash
node file-organizer.js organize <directory> [--target <target_directory>]
```

**Options:**
- `--target <dir>`: Custom target directory (default: `<directory>/Organized`)

**Example:**
```bash
node file-organizer.js organize ~/Downloads --target ~/Sorted
```

**Categories:**
- **Documents**: .pdf, .docx, .doc, .txt, .md, .xlsx, .pptx
- **Images**: .png, .jpg, .jpeg, .gif, .svg, .webp, .bmp
- **Archives**: .zip, .rar, .tar, .gz, .7z
- **Code**: .js, .py, .java, .cpp, .html, .css, .json
- **Videos**: .mp4, .avi, .mkv, .mov, .webm
- **Other**: All other file types

**Output:**
```
Organizing: /Users/username/Downloads
Target: /Users/username/Downloads/Organized

Creating folders...
  Documents/
  Images/
  Archives/
  Code/
  Videos/
  Other/
Copying files... [progress bar]

Organization complete!

Summary:
  Documents: 45 files -> /Users/username/Downloads/Organized/Documents/
  Images: 67 files -> /Users/username/Downloads/Organized/Images/
  Archives: 23 files -> /Users/username/Downloads/Organized/Archives/
  Code: 12 files -> /Users/username/Downloads/Organized/Code/
  Videos: 8 files -> /Users/username/Downloads/Organized/Videos/
  Other: 92 files -> /Users/username/Downloads/Organized/Other/

Total copied: 247 files (1.2 GB)
```

**Note:** Files >=10 MB are copied using streams to avoid memory issues.

---

### `cleanup` - Delete Old Files
Finds and optionally deletes files older than a specified number of days.

**Syntax:**
```bash
node file-organizer.js cleanup <directory> --olderThan <days> [--confirm]
```

**Options:**
- `--olderThan <days>`: Delete files older than this many days (required)
- `--confirm`: Actually delete files (without this flag, runs in dry-run mode)

**Example (dry run):**
```bash
node file-organizer.js cleanup ~/Downloads --olderThan 30
```

**Example (actual deletion):**
```bash
node file-organizer.js cleanup ~/Downloads --olderThan 30 --confirm
```

**Output (dry run):**
```
Cleanup: /Users/username/Downloads
Looking for files older than 30 days...

old_report.pdf
  Size: 2.5 MB
  Modified: 45 days ago (2024-10-01)

backup.zip
  Size: 150 MB
  Modified: 60 days ago (2024-09-15)

DELETING 2 files (152.5 MB). This action cannot be undone!

Deleting... [progress bar]

Total: 2 files (152.5 MB)

DRY RUN MODE: No files were deleted.
To actually delete these files, run with --confirm flag.
```

---

## Architecture

### Event-Driven Design
Each command uses `EventEmitter` to separate business logic from progress display:

- **Scanner**: Emits `file-found`, `scan-complete`
- **Duplicates**: Emits `file-processed`, `duplicates-found`
- **Organizer**: Emits `organize-start`, `creating-folders`, `folder-created`, `copy-start`, `copy-complete`, `copy-error`, `organize-complete`
- **Cleanup**: Emits `cleanup-start`, `file-found`, `deleting-start`, `file-deleted`, `delete-error`, `cleanup-complete`

### Stream-Based Processing
For files >=10 MB, streams are used to avoid memory overload:
- File copying in `organize` command
- Hash calculation in `duplicates` command

### Error Handling
All file operations include comprehensive error handling with specific messages for:
- `ENOENT`: Directory or file not found
- `EACCES`/`EPERM`: Permission denied
- Other unexpected errors

### Path Validation
All directory paths are validated to ensure they:
- Exist
- Are accessible
- Are within the current working directory (security)

---

## Project Structure

```
file-organizer/
├── file-organizer.js          # Main CLI entry point
├── package.json
├── README.md
├── lib/
│   ├── scanner.js             # Scan command implementation
│   ├── duplicates.js          # Duplicates command implementation
│   ├── organizer.js           # Organize command implementation
│   └── cleanup.js             # Cleanup command implementation
├── handlers/
│   ├── handleScan.js          # Scan command handler
│   ├── handleDuplicates.js    # Duplicates command handler
│   ├── handleOrganize.js      # Organize command handler
│   └── handleCleanup.js       # Cleanup command handler
└── utils/
    ├── actionMap.js           # Command to handler mapping
    ├── parseArgs.js           # CLI argument parsing
    ├── validatePath.js        # Path validation
    ├── showHelp.js            # Help display
    └── helpers.js             # Shared utilities (formatSize, getAllFiles, etc.)
```

---

## Useful Links

- [Node.js Documentation (fs module)](https://nodejs.org/api/fs.html)
- [Node.js Documentation (streams)](https://nodejs.org/api/stream.html)
- [Node.js Documentation (crypto module)](https://nodejs.org/api/crypto.html)
- [EventEmitter API](https://nodejs.org/api/events.html)

---

## License

This project is created as an educational assignment and is not intended for commercial use.

MIT License
