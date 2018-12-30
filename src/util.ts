export const sleep = (ms: number): Promise<null> => new Promise(resolve => setTimeout(() => resolve(), ms));
export const id = (str: string) => `#${str}`;
export const getOperationDisplayName = (operation: string) => {
    switch (operation) {
        case 'add':
            return 'Adding';
        case 'edit':
            return 'Updating';
        case 'complete':
            return 'Fixing';
        default:
            throw new Error('Unknown operation type');
    }
};
