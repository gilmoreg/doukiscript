import { sleep } from './util';
import { getAnilistList } from './Anilist';
import * as Log from './Log';
import * as Dom from './Dom';

const getOperationDisplayName = (operation: string) => {
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

// MAL Functions

const syncList = async (type, list, operation) => {
    if (!list || !list.length) {
        return;
    }
    const opName = getOperationDisplayName(operation);
    const logId = `douki-${operation}-${type}-items`;
    Log.info(`${opName} <span id="${logId}">0</span> of ${list.length} ${type} items.`);
    let itemCount = 0;
    // This uses malEdit() for 'completed' as well
    const fn = operation === 'add' ? malAdd : malEdit;
    for (let item of list) {
        await sleep(500);
        try {
            await fn(type, item.malData);
            itemCount++;
            document.querySelector(`#${logId}`).innerHTML = itemCount;
        } catch (e) {
            console.error(e);
            Log.info(`Error for ${type} <a href="https://myanimelist.net/${type}/${item.id}" target="_blank" rel="noopener noreferrer">${item.title}</a>. Try adding or updating it manually.`);
        }
    }
}

const syncType = async (type, anilistList, malUsername, csrfToken) => {
    Log.info(`Fetching MyAnimeList ${type} list...`);
    let malHashMap = await getMALHashMap(type, malUsername);
    let alPlusMal = anilistList.map(item => Object.assign({}, item, {
        malData: createMALData(item, malHashMap[item.id], csrfToken),
    }));

    const addList = alPlusMal.filter(item => !malHashMap[item.id]);
    await syncList(type, addList, 'add');

    // Refresh list to get episode/chapter counts of new completed items
    Log.info(`Refreshing MyAnimeList ${type} list...`);
    malHashMap = await getMALHashMap(type, malUsername);
    alPlusMal = anilistList.map(item => Object.assign({}, item, {
        malData: createMALData(item, malHashMap[item.id], csrfToken),
    }));
    const updateList = alPlusMal.filter(item => {
        const malItem = malHashMap[item.id];
        if (!malItem) return false;
        return shouldUpdate(malItem, item.malData)
    });
    await syncList(type, updateList, 'edit');
};


// Main business logic
const sync = async (e: Event) => {
    e.preventDefault();
    const malUsernameElement = document.querySelector('.header-profile-link');
    if (!malUsernameElement) {
        Log.info('You must be logged in!');
        return;
    }
    console.clear();
    Log.clear();
    Log.info(`Fetching data from Anilist...`);
    const anilistUser = document.querySelector('#douki-anilist-username').value;
    const anilistList = await getAnilistList(anilistUser);
    if (!anilistList) {
        Log.info(`No data found for user ${anilistUser}.`);
        return;
    }
    fillErrorLog(anilistList);
    Log.info(`Fetched Anilist data.`);
    const csrfToken = document.querySelector('meta[name~="csrf_token"]').getAttribute('content');
    const malUsername = malUsernameElement.innerText;

    await syncType('anime', anilistList.anime, malUsername, csrfToken);
    await syncType('manga', anilistList.manga, malUsername, csrfToken);
    Log.info('Import complete.');
};

// Entrypoint
(() => {
    'use strict';
    Dom.addDropDownItem();

    if (window.location.pathname === '/import.php') {
        Dom.addImportForm(sync);
    }
})();
