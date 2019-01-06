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
export const fetchDocument = (type: string, id: number): Promise<Document | null> =>
    new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            return resolve(this.responseXML ? this.responseXML : null);
        }
        xhr.onerror = function (e) {
            reject(e);
        }
        xhr.open('GET', `https://myanimelist.net/ownlist/${type}/${id}/edit`);
        xhr.responseType = 'document';
        xhr.send();
    });