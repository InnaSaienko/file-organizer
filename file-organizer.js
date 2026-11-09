import { getActionHandler } from './utils/actionMap.js';
import process from 'process';
import {showHelp} from "./utils/showHelp.js";
import {handleScan} from "./handlers/scanHandler.js";
import { parseArgs } from './utils/parseArgs.js';
import { handleDuplicates } from './handlers/handleDuplicates.js';
import { handleOrganize } from './handlers/handleOrganize.js';
import { handleCleanup } from './handlers/handleCleanup.js';

// Main function to handle commands
async function main() {
  const args = process.argv;
  const { command, options, positional } = parseArgs(args);

  // In main(), after parsing args:
  if (!command || options.help) {
    showHelp();
  }

  const directory = positional[0];
  if (!directory && command !== 'help') {
    console.error('Error: Please specify a directory path.');
    process.exit(1);
  }
  const actionMap = getActionHandler({
    handleScan,
    handleDuplicates,
    handleOrganize,
    handleCleanup,
  });

  const handler = actionMap[command];
  if (handler) {
    await handler(directory, options);
  } else {
    console.error(`❌ Error: Unknown command '${command}'`);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
});
