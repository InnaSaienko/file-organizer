// Helper function to parse command line arguments
export const parseArgs = (args) => {
    const command = args[2];
    const options = {};
    const positional = [];

    for (let i = 3; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].substring(2);
            if (args[i + 1] && !args[i + 1].startsWith('--')) {
                options[key] = args[i + 1];
                i++;
            } else {
                options[key] = true;
            }
        } else {
            positional.push(args[i]);
        }
    }

    return { command, options, positional };
}