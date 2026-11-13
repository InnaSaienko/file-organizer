export const getActionHandler = (handlers) => {
    return {
        scan: (directory, options) => handlers.handleScan(directory, options),
        duplicates: (directory, options) => handlers.handleDuplicates(directory, options),
        organize: (directory, options) => handlers.handleOrganize(directory, options),
        cleanup: (directory, options) => handlers.handleCleanup(directory, options),
    };
};