import * as fetch from 'node-fetch';
import mockGrecaptcha from '../__mocks__/grecaptcha';

// @ts-ignore
global.fetch = fetch;
// @ts-ignore
global.grecaptcha = mockGrecaptcha;

/*
NodeJS.Global.setTimeout: (callback: (...args: any[]) => void, ms: number, ...args: any[]) => NodeJS.Timer
*/

class FakeDOM {
    querySelector(selector: string) {
        switch (selector) {
            case '#add_anime_comments':
            case '#add_manga_comments':
                return {
                    value: 'comments'
                }
            default:
                return {
                    value: '0'
                }
        }
    }
}

class FakeXHR {
    onload: Function = () => { };
    onerror: Function = () => { };
    responseType: string = 'document';
    open(method: string, url: string) {
        console.log(`Making XHR ${method} request to ${url}`);
    }
    send() {
        this.onload();
    }
    responseXML: FakeDOM

    constructor() {
        this.responseXML = new FakeDOM();
    }
}
// @ts-ignore
global.XMLHttpRequest = FakeXHR;