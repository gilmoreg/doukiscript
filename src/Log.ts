import { SYNC_LOG_ID, ERROR_LOG_ID } from './const';
import { id, getOperationDisplayName } from './util';

const getSyncLog = (): Element | null => document.querySelector(id(SYNC_LOG_ID));
const getErrorLog = (): Element | null => document.querySelector(id(ERROR_LOG_ID));
const getCountLog = (operation: string, type: string): Element | null => document.querySelector(id(`douki-${operation}-${type}-items`));

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

export const addCountLog = (operation: string, type: string, max: number) => {
    const opName = getOperationDisplayName(operation);
    const logId = `douki-${operation}-${type}-items`;
    info(`${opName} <span id="${logId}">0</span> of ${max} ${type} items.`);
}

export const updateCountLog = (operation: string, type: string, count: number) => {
    const countLog = getCountLog(operation, type) as HTMLSpanElement;
    if (!countLog) return;
    countLog.innerHTML = `${count}`;
}