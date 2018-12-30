import { SYNC_LOG_ID, ERROR_LOG_ID } from './const';
import { id } from './util';

const getSyncLog = (): Element | null => document.querySelector(id(SYNC_LOG_ID));
const getErrorLog = (): Element | null => document.querySelector(id(ERROR_LOG_ID));

const clearErrorLog = () => {
    const errorLog = getErrorLog();
    if (errorLog) {
        errorLog.innerHTML = '';
    }
}

const clearSyncLog = () => {
    const syncLog = getSyncLog();
    if (syncLog) {
        syncLog.innerHTML = '';
    }
}

export const clear = (type = '') => {
    if (type !== 'error') clearSyncLog();
    if (type !== 'sync') clearErrorLog();
}

export const error = (msg: string) => {
    const errorLog = getErrorLog();
    if (errorLog) {
        errorLog.innerHTML += `<li>${msg}</li>`;
    } else {
        console.error(msg);
    }
}

export const info = (msg: string) => {
    const syncLog = getSyncLog();
    if (syncLog) {
        syncLog.innerHTML += `<li>${msg}</li>`;
    } else {
        console.info(msg);
    }
}
