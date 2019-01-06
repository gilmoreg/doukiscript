import Log from './Log';
import Dom from './Dom';
import { getAnilistList } from './Anilist';
import MAL from './MAL';

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

    Log.clear();
    Log.info(`Fetching data from Anilist...`);

    const anilistList = await getAnilistList(anilistUsername);
    if (!anilistList) {
        Log.info(`No data found for user ${anilistUsername}.`);
        return;
    }
    Log.info(`Fetched Anilist data.`);

    const mal = new MAL(malUsername, csrfToken);
    await mal.syncType('anime', anilistList.anime);
    await mal.syncType('manga', anilistList.manga);
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
