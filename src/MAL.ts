import { sleep } from './Util';
import { MALHashMap, FormattedEntry, MALLoadItem } from './Types';
import { MALEntry, createMALEntry } from './MALEntry';
import Log, { ILog } from './Log';
import Dom, { IDomMethods } from "./Dom";

export default class MAL {
    username: string
    csrfToken: string
    Log: ILog
    dom: IDomMethods

    constructor(username: string, csrfToken: string, log: ILog = Log, dom: IDomMethods = Dom) {
        this.username = username;
        this.csrfToken = csrfToken;
        this.Log = log;
        this.dom = dom;
    }

    private createMALHashMap(malList: Array<MALLoadItem>, type: string): MALHashMap {
        const hashMap: MALHashMap = {};
        malList.forEach(item => {
            hashMap[item[`${type}_id`]] = item;
        });
        return hashMap;
    }

    private async getMALHashMap(type: string, list: Array<MALLoadItem> = [], page = 1): Promise<MALHashMap> {
        const offset = (page - 1) * 300;
        const nextList = await fetch(`https://myanimelist.net/${type}list/${this.username}/load.json?offset=${offset}&status=7`)
            .then(async res => {
                if (res.status !== 200) {
                    await sleep(2000);
                    return this.getMALHashMap(type, list, page);
                }
                return res.json();
            });
        if (nextList && nextList.length) {
            await sleep(1500);
            return this.getMALHashMap(type, [...list, ...nextList], page + 1);
        }
        this.Log.info(`Fetched MyAnimeList ${type} list.`);
        return this.createMALHashMap([...list, ...nextList], type);
    }

    private async getEntriesList(anilistList: Array<FormattedEntry>, type: string): Promise<Array<MALEntry>> {
        const malHashMap = await this.getMALHashMap(type);
        return anilistList.map(entry => createMALEntry(entry, malHashMap[entry.id], this.csrfToken, this.dom));
    }

    private async malEdit(data: MALEntry) {
        const { type, id } = data;
        const formData = await data.formData();
        return fetch(`https://myanimelist.net/ownlist/${type}/${id}/edit?hideLayout`,
            {
                credentials: 'include',
                headers: {
                    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'accept-language': 'en-US,en;q=0.9,ja;q=0.8',
                    'cache-control': 'max-age=0',
                    'content-type': 'application/x-www-form-urlencoded',
                    'upgrade-insecure-requests': '1'
                },
                referrer: `https://myanimelist.net/ownlist/${type}/${id}/edit?hideLayout`,
                referrerPolicy: 'no-referrer-when-downgrade',
                body: formData,
                method: 'POST',
                mode: 'cors'
            }).then((res) => {
                if (res.status === 200) return res;
                throw new Error(`Error updating ${type} id ${id}`);
            }).then((res) => res.text())
            .then((text: string) => {
                if (text.match(/.+Successfully updated entry.+/)) return;
                throw new Error(`Error updating ${type} id ${id}`);
            });
    }

    private malAdd(data: MALEntry) {
        return fetch(`https://myanimelist.net/ownlist/${data.type}/add.json`, {
            method: 'post',
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest'
            },
            body: JSON.stringify(data.postData)
        })
            .then((res) => {
                if (res.status === 200) return res;
                throw new Error(JSON.stringify(data));
            });
    }

    private async syncList(type: string, list: Array<MALEntry>, operation: string) {
        if (!list || !list.length) {
            return;
        }
        this.Log.addCountLog(operation, type, list.length);
        let itemCount = 0;
        const fn = operation === 'add' ? this.malAdd : this.malEdit;
        for (let item of list) {
            await sleep(500);
            try {
                await fn(item);
                itemCount++;
                this.Log.updateCountLog(operation, type, itemCount);
            } catch (e) {
                console.error(e);
                this.Log.info(`Error for ${type} <a href="https://myanimelist.net/${type}/${item.id}" target="_blank" rel="noopener noreferrer">${item.title}</a>. Try adding or updating it manually.`);
            }
        }
    }

    async syncType(type: string, anilistList: Array<FormattedEntry>) {
        this.Log.info(`Fetching MyAnimeList ${type} list...`);
        let list = await this.getEntriesList(anilistList, type);
        const addList = list.filter(entry => entry.shouldAdd());
        await this.syncList(type, addList, 'add');

        // Refresh list to get episode/chapter counts of new completed items
        if (addList.length) {
            this.Log.info(`Refreshing MyAnimeList ${type} list...`);
            list = await this.getEntriesList(anilistList, type);
        }
        const updateList = list.filter(entry => entry.shouldUpdate());
        await this.syncList(type, updateList, 'edit');
    }
}