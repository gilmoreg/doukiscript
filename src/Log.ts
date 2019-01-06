import { SYNC_LOG_ID, ERROR_LOG_ID } from './const';
import { id, getOperationDisplayName } from './util';

type NullableElement = HTMLElement | null;

const getCountLog = (operation: string, type: string): NullableElement =>
    document.querySelector(id(`douki-${operation}-${type}-items`));

export interface ILog {
    clear(type: string): void
    error(msg: string): void
    info(msg: string): void
    addCountLog(operation: string, type: string, max: number): void
    updateCountLog(operation: string, type: string, count: number): void
}

export class Log implements ILog {
    errorLogElement: NullableElement = null;
    syncLogElement: NullableElement = null;

    get errorLog() {
        if (!this.errorLogElement) {
            this.errorLogElement = document.querySelector(id(ERROR_LOG_ID));
        }
        return this.errorLogElement;
    }

    get syncLog() {
        if (!this.syncLogElement) {
            this.syncLogElement = document.querySelector(id(SYNC_LOG_ID));
        }
        return this.syncLogElement;
    }

    private clearErrorLog() {
        if (this.errorLog) {
            this.errorLog.innerHTML = '';
        }
    }

    private clearSyncLog() {
        if (this.syncLog) {
            this.syncLog.innerHTML = '';
        }
    }

    clear(type = '') {
        console.clear();
        if (type !== 'error') this.clearSyncLog();
        if (type !== 'sync') this.clearErrorLog();
    }

    error(msg: string) {
        if (this.errorLog) {
            this.errorLog.innerHTML += `<li>${msg}</li>`;
        } else {
            console.error(msg);
        }
    }

    info(msg: string) {
        if (this.syncLog) {
            this.syncLog.innerHTML += `<li>${msg}</li>`;
        } else {
            console.info(msg);
        }
    }

    addCountLog(operation: string, type: string, max: number) {
        const opName = getOperationDisplayName(operation);
        const logId = `douki-${operation}-${type}-items`;
        this.info(`${opName} <span id="${logId}">0</span> of ${max} ${type} items.`);
    }

    updateCountLog(operation: string, type: string, count: number) {
        const countLog = getCountLog(operation, type) as HTMLSpanElement;
        if (!countLog) return;
        countLog.innerHTML = `${count}`;
    }
}

export default new Log();