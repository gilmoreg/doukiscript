import * as fetch from 'node-fetch';
// @ts-ignore
global.fetch = fetch;

class FakeDOM {
    querySelector(selector: string) {
        switch (selector) {
            case 'add_anime_comments':
            case 'add_manga_comments':
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