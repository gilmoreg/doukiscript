import { IDomMethods } from "../../src/Dom";

export default class FakeDomMethods implements IDomMethods {
    dateSetting: string
    constructor(dateSetting = 'a') {
        this.dateSetting = dateSetting;
    }

    addDropDownItem() { }

    addImportForm(syncFn: Function) {
        return jest.fn();
    }

    getDateSetting(): string {
        return this.dateSetting;
    };

    getDebugSetting(): boolean {
        return false;
    }

    getCSRFToken(): string {
        return 'csrfToken';
    }

    getMALUsername(): string {
        return 'malUsername';
    }

    getAnilistUsername(): string {
        return 'anilistUsername';
    }
}