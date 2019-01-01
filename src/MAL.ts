import { sleep } from './util';
import * as Log from './Log';
import { MALHashMap, FormattedEntry, MALLoadItem, MALPostItem } from './Types';
import { MALEntry, createMALEntry } from './MALEntry';

const createMALHashMap = (malList: Array<MALLoadItem>, type: string): MALHashMap => {
    const hashMap: MALHashMap = {};
    malList.forEach(item => {
        hashMap[item[`${type}_id`]] = item;
    });
    return hashMap;
}

const getMALHashMap = async (type: string, username: string, list: Array<MALLoadItem> = [], page = 1): Promise<MALHashMap> => {
    const offset = (page - 1) * 300;
    const nextList = await fetch(`https://myanimelist.net/${type}list/${username}/load.json?offset=${offset}&status=7`)
        .then(async res => {
            if (res.status !== 200) {
                await sleep(2000);
                return getMALHashMap(type, username, list, page);
            }
            return res.json();
        });
    if (nextList && nextList.length) {
        await sleep(1500);
        return getMALHashMap(type, username, [...list, ...nextList], page + 1);
    }
    Log.info(`Fetched MyAnimeList ${type} list.`);
    return createMALHashMap([...list, ...nextList], type);
}

const getEntriesList = async (anilistList: Array<FormattedEntry>, type: string, malUsername: string, csrfToken: string) => {
    const malHashMap = await getMALHashMap(type, malUsername);
    return anilistList.map(entry => createMALEntry(entry, malHashMap[entry.id], csrfToken));
}

const malEdit = (data: MALEntry) => {
    const { type, id } = data;
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
            body: data.formData(),
            method: 'POST',
            mode: 'cors'
        }).then((res) => {
            // TODO figure out how to error check the html that comes back
            if (res.status === 200) return res;
            throw new Error(JSON.stringify(data));
        }).then((res) => res.text())
        .then((text) => {
            if (text.match(/.+Successfully updated entry.+/)) return true;
            throw new Error(JSON.stringify(data));
        });
}

const malAdd = (data: MALEntry) =>
    fetch(`https://myanimelist.net/ownlist/${data.type}/add.json`, {
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

const syncList = async (type: string, list: Array<MALEntry>, operation: string) => {
    if (!list || !list.length) {
        return;
    }
    Log.addCountLog(operation, type, list.length);
    let itemCount = 0;
    // This uses malEdit() for 'completed' as well
    const fn = operation === 'add' ? malAdd : malEdit;
    for (let item of list) {
        await sleep(500);
        try {
            await fn(item);
            itemCount++;
            Log.updateCountLog(operation, type, itemCount);
        } catch (e) {
            console.error(e);
            Log.info(`Error for ${type} <a href="https://myanimelist.net/${type}/${item.id}" target="_blank" rel="noopener noreferrer">${item.title}</a>. Try adding or updating it manually.`);
        }
    }
}

export const syncType = async (type: string, anilistList: Array<FormattedEntry>, malUsername: string, csrfToken: string) => {
    Log.info(`Fetching MyAnimeList ${type} list...`);
    let list = await getEntriesList(anilistList, type, malUsername, csrfToken);
    const addList = list.filter(entry => entry.shouldAdd());
    await syncList(type, addList, 'add');

    // Refresh list to get episode/chapter counts of new completed items
    Log.info(`Refreshing MyAnimeList ${type} list...`);
    list = await getEntriesList(anilistList, type, malUsername, csrfToken);
    const updateList = list.filter(entry => entry.shouldUpdate());
    await syncList(type, updateList, 'edit');
};