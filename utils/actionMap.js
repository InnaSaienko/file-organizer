export const getActionHandler = (handlers) => {
    return {
        scan: (directory) => handlers.handleScan(directory),
        duplicates: (directory) => handlers.handleDuplicates(directory),
        organize: (directory, options) => handlers.handleOrganize(directory, options),
        cleanup: (directory, options) => handlers.handleCleanup(directory, options),
    };
};