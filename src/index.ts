import * as Log from './Log';
import * as Dom from './Dom';
import { getAnilistList } from './Anilist';
import { syncType } from './MAL';

// Main business logic
const sync = async (e: Event) => {
    e.preventDefault();

    const anilistUsername = Dom.getAnilistUsername();
    if (!anilistUsername) return;

    const malUsername = Dom.getMALUsername();
    if (!malUsername) {
        Log.info('You must be logged in!');
        return;
    }

    const csrfToken = Dom.getCSRFToken();

    console.clear();
    Log.clear();
    Log.info(`Fetching data from Anilist...`);

    const anilistList = await getAnilistList(anilistUsername);
    if (!anilistList) {
        Log.info(`No data found for user ${anilistUsername}.`);
        return;
    }
    Log.info(`Fetched Anilist data.`);

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
