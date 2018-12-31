// ==UserScript==
// @name        Douki
// @namespace   http://gilmoreg.com
// @description Import Anime and Manga Lists from Anilist (see https://anilist.co/forum/thread/2654 for more info)
// @version     0.2.0
// @include     https://myanimelist.net/*
// ==/UserScript==

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Log = __webpack_require__(1);
const Dom = __webpack_require__(4);
const Anilist_1 = __webpack_require__(5);
const MAL_1 = __webpack_require__(6);
// Main business logic
const sync = async (e) => {
    e.preventDefault();
    const anilistUsername = Dom.getAnilistUsername();
    if (!anilistUsername)
        return;
    const malUsername = Dom.getMALUsername();
    if (!malUsername) {
        Log.info('You must be logged in!');
        return;
    }
    const csrfToken = Dom.getCSRFToken();
    console.clear();
    Log.clear();
    Log.info(`Fetching data from Anilist...`);
    const anilistList = await Anilist_1.getAnilistList(anilistUsername);
    if (!anilistList) {
        Log.info(`No data found for user ${anilistUsername}.`);
        return;
    }
    Log.info(`Fetched Anilist data.`);
    await MAL_1.syncType('anime', anilistList.anime, malUsername, csrfToken);
    await MAL_1.syncType('manga', anilistList.manga, malUsername, csrfToken);
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


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = __webpack_require__(2);
const util_1 = __webpack_require__(3);
const getSyncLog = () => document.querySelector(util_1.id(const_1.SYNC_LOG_ID));
const getErrorLog = () => document.querySelector(util_1.id(const_1.ERROR_LOG_ID));
const getCountLog = (operation, type) => document.querySelector(util_1.id(`douki-${operation}-${type}-items`));
const clearErrorLog = () => {
    const errorLog = getErrorLog();
    if (errorLog) {
        errorLog.innerHTML = '';
    }
};
const clearSyncLog = () => {
    const syncLog = getSyncLog();
    if (syncLog) {
        syncLog.innerHTML = '';
    }
};
exports.clear = (type = '') => {
    if (type !== 'error')
        clearSyncLog();
    if (type !== 'sync')
        clearErrorLog();
};
exports.error = (msg) => {
    const errorLog = getErrorLog();
    if (errorLog) {
        errorLog.innerHTML += `<li>${msg}</li>`;
    }
    else {
        console.error(msg);
    }
};
exports.info = (msg) => {
    const syncLog = getSyncLog();
    if (syncLog) {
        syncLog.innerHTML += `<li>${msg}</li>`;
    }
    else {
        console.info(msg);
    }
};
exports.addCountLog = (operation, type, max) => {
    const opName = util_1.getOperationDisplayName(operation);
    const logId = `douki-${operation}-${type}-items`;
    exports.info(`${opName} <span id="${logId}">0</span> of ${max} ${type} items.`);
};
exports.updateCountLog = (operation, type, count) => {
    const countLog = getCountLog(operation, type);
    if (!countLog)
        return;
    countLog.innerHTML = `${count}`;
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DOUKI_FORM_ID = 'douki-form';
exports.DOUKI_ANILIST_IMPORT_ID = 'douki-anilist-import';
exports.DATE_SETTING_ID = 'douki-date_format';
exports.CONTENT_ID = 'content';
exports.DOUKI_IMPORT_BUTTON_ID = 'douki-import';
exports.SYNC_LOG_ID = 'douki-sync-log';
exports.ERROR_LOG_ID = 'douki-error-log';
exports.ERROR_LOG_TOGGLE_ID = 'douki-error-log-toggle';
exports.ERROR_LOG_DIV_ID = 'douki-error-log-div';
exports.ANILIST_USERNAME_ID = 'douki-anilist-username';
exports.SETTINGS_KEY = 'douki-settings';
exports.DATE_SETTINGS_KEY = 'douki-settings-date';
exports.DROPDOWN_ITEM_ID = 'douki-sync';


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = (ms) => new Promise(resolve => setTimeout(() => resolve(), ms));
exports.id = (str) => `#${str}`;
exports.getOperationDisplayName = (operation) => {
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


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = __webpack_require__(2);
const util_1 = __webpack_require__(3);
const importFormHTML = `
    <div id="${const_1.DOUKI_FORM_ID}">
        <h1 class="h1">Import From Anilist</h1>
        <div style="padding: 20px">
            <p><strong>NOTICE</strong>: Use this script at your own risk. The author takes no responsibility for any damages of any kind.</p>
            <p>It is <em>highly</em> recommended that you try this script out on a test MAL account before importing to your main account.</p>
            <p>Visit <a href="https://anilist.co/forum/thread/2654" target="_blank" rel="noopener noreferrer">the Anilist thread</a> for this script to ask questions or report problems.</p>
            <p>Please be patient. If the import goes any faster you will be in violation of MyAnimeList's Terms of Service.</p>
        </div>
        <form id="${const_1.DOUKI_ANILIST_IMPORT_ID}" style="padding: 5px 0px 10px 0px">
            <p style="margin: 10px"><label>Anilist Username: <input type="text" id="${const_1.ANILIST_USERNAME_ID}" /></label></p>
            <p style="margin: 10px">
            <label>Date Format:
                <select id="${const_1.DATE_SETTING_ID}" class="inputtext">
                <option value="a" selected>American (MM-DD-YY)
                <option value="e" >European (DD-MM-YY)
                </select>
            </label>
            </p>
            <p style="margin: 10px"><button id="${const_1.DOUKI_IMPORT_BUTTON_ID}">Import</button></p>
        </form>
        <br />
        <ul id="${const_1.SYNC_LOG_ID}" style="list-type: none;"></ul>
        <p style="margin: 10px"><button id="${const_1.ERROR_LOG_TOGGLE_ID}" style="border: none">Show items that could not be synced</button></p>
        <div id="${const_1.ERROR_LOG_DIV_ID}" style="display: none;">
            <p style="margin: 10px">Anilist does not have a MAL ID for the following items. If a verified MAL entry exists for any of these, contact an Anilist data mod to have it added.</p>
            <ul id="${const_1.ERROR_LOG_ID}" style="list-type: none;"></ul>
        </div>
    </div>
`;
exports.addDropDownItem = () => {
    if (document.querySelector(util_1.id(const_1.DROPDOWN_ITEM_ID)))
        return;
    const selector = '.header-menu-dropdown > ul > li:last-child';
    const dropdown = document.querySelector(selector);
    if (dropdown) {
        const html = `<li><a aria-role="button" id="${const_1.DROPDOWN_ITEM_ID}">Import from Anilist</a></li>`;
        dropdown.insertAdjacentHTML('afterend', html);
        const link = document.querySelector(util_1.id(const_1.DROPDOWN_ITEM_ID));
        link && link.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.replace('https://myanimelist.net/import.php');
        });
    }
};
exports.addImportForm = (syncFn) => {
    if (document.querySelector(util_1.id(const_1.DOUKI_FORM_ID)))
        return;
    const element = document.querySelector(util_1.id(const_1.CONTENT_ID));
    if (!element) {
        throw new Error('Unable to add form to page');
    }
    element.insertAdjacentHTML('afterend', importFormHTML);
    addImportFormEventListeners(syncFn);
};
// TODO break this up
const addImportFormEventListeners = (syncFn) => {
    const importButton = document.querySelector(util_1.id(const_1.DOUKI_IMPORT_BUTTON_ID));
    importButton && importButton.addEventListener('click', function (e) {
        syncFn(e);
    });
    const textBox = document.querySelector(util_1.id(const_1.ANILIST_USERNAME_ID));
    textBox && textBox.addEventListener('change', function (e) {
        setLocalStorageSetting(const_1.SETTINGS_KEY, e.target.value);
    });
    const username = getLocalStorageSetting(const_1.SETTINGS_KEY);
    if (username && textBox) {
        textBox.value = username;
    }
    const dateFormatPicker = document.querySelector(util_1.id(const_1.DATE_SETTING_ID));
    dateFormatPicker && dateFormatPicker.addEventListener('change', function (e) {
        setLocalStorageSetting(const_1.DATE_SETTINGS_KEY, e.target.value);
    });
    const dateOption = getLocalStorageSetting(const_1.DATE_SETTINGS_KEY);
    if (dateOption && dateFormatPicker) {
        dateFormatPicker.value = dateOption;
    }
    const errorToggle = document.querySelector(util_1.id(const_1.ERROR_LOG_TOGGLE_ID));
    errorToggle && errorToggle.addEventListener('click', function (e) {
        e.preventDefault();
        const errorLog = document.querySelector(util_1.id(const_1.ERROR_LOG_DIV_ID));
        if (errorLog.style.display === 'none') {
            errorLog.style.display = 'block';
        }
        else {
            errorLog.style.display = 'none';
        }
    });
};
const getLocalStorageSetting = (setting) => {
    if (localStorage) {
        const value = localStorage.getItem(setting);
        if (value)
            return JSON.parse(value);
    }
    return null;
};
const setLocalStorageSetting = (setting, value) => {
    if (localStorage) {
        localStorage.setItem(setting, JSON.stringify(value));
    }
};
exports.getDateSetting = () => {
    const dateSetting = document.querySelector(util_1.id(const_1.DATE_SETTING_ID));
    if (!dateSetting)
        throw new Error('Unable to get date setting');
    return dateSetting.value;
};
exports.getCSRFToken = () => {
    const csrfTokenMeta = document.querySelector('meta[name~="csrf_token"]');
    if (!csrfTokenMeta)
        throw new Error('Unable to get CSRF token - no meta element');
    const csrfToken = csrfTokenMeta.getAttribute('content');
    if (!csrfToken)
        throw new Error('Unable to get CSRF token - no content attribute');
    return csrfToken;
};
exports.getMALUsername = () => {
    const malUsernameElement = document.querySelector('.header-profile-link');
    if (!malUsernameElement)
        return null;
    return malUsernameElement.innerText;
};
exports.getAnilistUsername = () => {
    const anilistUserElement = document.querySelector('#douki-anilist-username');
    if (!anilistUserElement)
        throw new Error('Unable to get Anilist username');
    return anilistUserElement.value;
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Log = __webpack_require__(1);
const flatten = (obj) => 
// Outer reduce concats arrays built by inner reduce
Object.keys(obj).reduce((accumulator, list) => 
// Inner reduce builds an array out of the lists
accumulator.concat(Object.keys(obj[list]).reduce((acc2, item) => 
// @ts-ignore
acc2.concat(obj[list][item]), [])), []);
const uniqify = (arr) => {
    const seen = new Set();
    return arr.filter(item => (seen.has(item.media.idMal) ? false : seen.add(item.media.idMal)));
};
// Anilist Functions
const anilistCall = (query, variables) => fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    body: JSON.stringify({
        query,
        variables,
    }),
});
const fetchList = (userName) => anilistCall(`
      query ($userName: String) {
        anime: MediaListCollection(userName: $userName, type: ANIME) {
          lists {
            entries {
              status
              score(format:POINT_10)
              progress
              startedAt {
                year
                month
                day
              }
              completedAt {
                year
                month
                day
              }
              repeat
              media {
                idMal
                title {
                  romaji
                }
              }
            }
          }
        },
        manga: MediaListCollection(userName: $userName, type: MANGA) {
          lists {
            entries {
              status
              score(format:POINT_10)
              progress
              progressVolumes
              startedAt {
                year
                month
                day
              }
              completedAt {
                year
                month
                day
              }
              repeat
              media {
                idMal
                title {
                  romaji
                }
              }
            }
          }
        }
      }
    `, {
    userName
})
    .then(res => res.json())
    .then(res => res.data)
    .then(res => ({
    anime: uniqify(flatten(res.anime.lists)),
    manga: uniqify(flatten(res.manga.lists)),
}));
const sanitize = (item, type) => ({
    type,
    progress: item.progress,
    progressVolumes: item.progressVolumes,
    startedAt: {
        year: item.startedAt.year || 0,
        month: item.startedAt.month || 0,
        day: item.startedAt.day || 0,
    },
    completedAt: {
        year: item.completedAt.year || 0,
        month: item.completedAt.month || 0,
        day: item.completedAt.day || 0
    },
    repeat: item.repeat,
    status: item.status,
    score: item.score,
    id: item.media.idMal,
    title: item.media.title.romaji
});
const filterNoMalId = (item) => {
    if (item.id)
        return true;
    Log.error(`${item.type}: ${item.title}`);
    return false;
};
exports.getAnilistList = (username) => fetchList(username)
    .then(lists => ({
    anime: lists.anime
        .map(item => sanitize(item, 'anime'))
        .filter(item => filterNoMalId(item)),
    manga: lists.manga
        .map(item => sanitize(item, 'manga'))
        .filter(item => filterNoMalId(item)),
}));


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __webpack_require__(3);
const Log = __webpack_require__(1);
const Dom = __webpack_require__(4);
const createMALHashMap = (malList, type) => {
    const hashMap = {};
    malList.forEach(item => {
        hashMap[item[`${type}_id`]] = item;
    });
    return hashMap;
};
const getMALHashMap = async (type, username, list = [], page = 1) => {
    const offset = (page - 1) * 300;
    const nextList = await fetch(`https://myanimelist.net/${type}list/${username}/load.json?offset=${offset}&status=7`)
        .then(async (res) => {
        if (res.status !== 200) {
            await util_1.sleep(2000);
            return getMALHashMap(type, username, list, page);
        }
        return res.json();
    });
    if (nextList && nextList.length) {
        await util_1.sleep(1500);
        return getMALHashMap(type, username, [...list, ...nextList], page + 1);
    }
    Log.info(`Fetched MyAnimeList ${type} list.`);
    return createMALHashMap([...list, ...nextList], type);
};
const createMALFormData = (data) => {
    const malData = {
        'add_anime[comments]': '',
        'add_anime[finish_date][day]': data.finish_date && data.finish_date.day || 0,
        'add_anime[finish_date][month]': data.finish_date && data.finish_date.month || 0,
        'add_anime[finish_date][year]': data.finish_date && data.finish_date.year || 0,
        'add_anime[is_asked_to_discuss]': 0,
        'add_anime[is_rewatching]': data.is_rewatching,
        'add_anime[num_watched_episodes]': data.num_watched_episodes,
        'add_anime[num_watched_times]': data.num_watched_times,
        'add_anime[priority]': 0,
        'add_anime[rewatch_value]': 0,
        'add_anime[score]': data.score,
        'add_anime[sns_post_type]': 0,
        'add_anime[start_date][day]': data.start_date && data.start_date.day || 0,
        'add_anime[start_date][month]': data.start_date && data.start_date.month || 0,
        'add_anime[start_date][year]': data.start_date && data.start_date.year || 0,
        'add_anime[status]': data.status,
        'add_anime[storage_type]': 0,
        'add_anime[storage_value]': 0,
        'add_anime[tags]': data.tags,
        aeps: data.anime_num_episodes,
        anime_id: data.anime_id,
        astatus: data.status,
        csrf_token: data.csrf_token,
        submitIt: 0
    };
    // const formData = new FormData();
    let formData = '';
    Object.keys(malData).forEach(key => {
        // formData.append(key, malData[key]);
        formData += `${encodeURIComponent(key)}=${encodeURIComponent(malData[key])}&`;
    });
    return formData.replace(/&$/, '');
};
// const malEdit = (type: string, data: MALItem) =>
//     fetch(`https://myanimelist.net/ownlist/${type}/edit.json`, {
//         method: 'post',
//         body: JSON.stringify(data)
//     })
//         .then((res) => {
//             if (res.status === 200) return res;
//             throw new Error(JSON.stringify(data));
//         });
const malEdit = (type, data) => {
    const formData = createMALFormData(data);
    return fetch(`https://myanimelist.net/ownlist/${type}/${data.anime_id}/edit?hideLayout`, {
        credentials: 'include',
        headers: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'accept-language': 'en-US,en;q=0.9,ja;q=0.8',
            'cache-control': 'max-age=0',
            'content-type': 'application/x-www-form-urlencoded',
            'upgrade-insecure-requests': '1'
        },
        referrer: `https://myanimelist.net/ownlist/${type}/${data.anime_id}/edit?hideLayout`,
        referrerPolicy: 'no-referrer-when-downgrade',
        body: formData,
        method: 'POST',
        mode: 'cors'
    }).then((res) => {
        if (res.status === 200)
            return res;
        throw new Error(JSON.stringify(data));
    });
};
const malAdd = (type, data) => fetch(`https://myanimelist.net/ownlist/${type}/add.json`, {
    method: 'post',
    headers: {
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest'
    },
    body: JSON.stringify(data)
})
    .then((res) => {
    if (res.status === 200)
        return res;
    throw new Error(JSON.stringify(data));
});
const getStatus = (status) => {
    // MAL status: 1/watching, 2/completed, 3/onhold, 4/dropped, 6/plantowatch
    // MAL handles REPEATING as a boolean, and keeps status as COMPLETE
    switch (status.trim()) {
        case 'CURRENT':
            return 1;
        case 'REPEATING':
        case 'COMPLETED':
            return 2;
        case 'PAUSED':
            return 3;
        case 'DROPPED':
            return 4;
        case 'PLANNING':
            return 6;
        default:
            throw new Error(`unknown status "${status}"`);
    }
};
const buildDateString = (date) => {
    if (date.month === 0 && date.day === 0 && date.year === 0)
        return null;
    const dateSetting = Dom.getDateSetting();
    const month = `${String(date.month).length < 2 ? '0' : ''}${date.month}`;
    const day = `${String(date.day).length < 2 ? '0' : ''}${date.day}`;
    const year = `${date.year ? String(date.year).slice(-2) : 0}`;
    if (dateSetting === 'a') {
        return `${month}-${day}-${year}`;
    }
    return `${day}-${month}-${year}`;
};
exports.createMALData = (anilistData, malData, csrf_token) => {
    const status = getStatus(anilistData.status);
    const result = {
        status,
        csrf_token,
        score: anilistData.score || 0,
        finish_date: {
            year: anilistData.completedAt.year || 0,
            month: anilistData.completedAt.month || 0,
            day: anilistData.completedAt.day || 0
        },
        start_date: {
            year: anilistData.startedAt.year || 0,
            month: anilistData.startedAt.month || 0,
            day: anilistData.startedAt.day || 0
        },
    };
    result[`${anilistData.type}_id`] = anilistData.id;
    if (anilistData.repeat) {
        const verb = anilistData.type === 'anime' ? 'watched' : 'read';
        result[`num_${verb}_times`] = anilistData.repeat;
    }
    // If status is COMPLETED (2) use episode, volume, and chapter counts from MAL
    // Otherwise use AL's
    // If the item is new, these values will not be present; however, once added, the update will swing back around
    // and they will be available for an update
    if (status === 2) {
        // Existing item; use MAL's provided counts
        if (malData && Object.keys(malData).length) {
            if (anilistData.type === 'anime') {
                result.num_watched_episodes = malData.anime_num_episodes || 0;
            }
            else {
                result.num_read_chapters = malData.manga_num_chapters || 0;
                result.num_read_volumes = malData.manga_num_volumes || 0;
            }
        }
    }
    else {
        // Non-completed item; use Anilist's counts
        // Note the possibility that this count could be higher than MAL's max; see if that creates problems
        if (anilistData.type === 'anime') {
            result.num_watched_episodes = anilistData.progress || 0;
        }
        else {
            result.num_read_chapters = anilistData.progress || 0;
            result.num_read_volumes = anilistData.progressVolumes || 0;
        }
    }
    return result;
};
exports.shouldUpdate = (mal, al) => Object.keys(al).some(key => {
    switch (key) {
        case 'csrf_token':
        case 'anime_id':
        case 'manga_id':
            return false;
        case 'start_date':
        case 'finish_date':
            {
                // @ts-ignore
                const dateString = buildDateString(al[key]);
                if (dateString !== mal[`${key}_string`]) {
                    return true;
                }
                return false;
            }
        case 'num_read_chapters':
        case 'num_read_volumes':
        case 'num_watched_episodes':
            // Anlist and MAL have different volume, episode, and chapter counts for some media;
            // If the item is marked as completed, ignore differences (Status 2 is COMPLETED)
            // EXCEPT when the count is 0, in which case this was newly added without a count and needs
            // to be updated now that the count is available
            {
                if (mal.status === 2 && mal[key] !== 0) {
                    return false;
                }
                if (al[key] !== mal[key]) {
                    return true;
                }
                ;
                return false;
            }
        // In certain cases the next two values will be missing from the MAL data and trying to update them will do nothing.
        // To avoid a meaningless update every time, skip it if undefined on MAL
        case 'num_watched_times':
        case 'num_read_times':
            {
                if (!mal.hasOwnProperty(key)) {
                    return false;
                }
                if (al[key] !== mal[key]) {
                    return true;
                }
                ;
                return false;
            }
        default:
            {
                // Treat falsy values as equivalent (!= doesn't do the trick here)
                if (!mal[key] && !al[key]) {
                    return false;
                }
                if (al[key] !== mal[key]) {
                    return true;
                }
                return false;
            }
    }
});
const syncList = async (type, list, operation) => {
    if (!list || !list.length) {
        return;
    }
    Log.addCountLog(operation, type, list.length);
    let itemCount = 0;
    // This uses malEdit() for 'completed' as well
    const fn = operation === 'add' ? malAdd : malEdit;
    for (let item of list) {
        await util_1.sleep(500);
        try {
            await fn(type, item.malData);
            itemCount++;
            Log.updateCountLog(operation, type, itemCount);
        }
        catch (e) {
            console.error(e);
            Log.info(`Error for ${type} <a href="https://myanimelist.net/${type}/${item.id}" target="_blank" rel="noopener noreferrer">${item.title}</a>. Try adding or updating it manually.`);
        }
    }
};
exports.syncType = async (type, anilistList, malUsername, csrfToken) => {
    Log.info(`Fetching MyAnimeList ${type} list...`);
    let malHashMap = await getMALHashMap(type, malUsername);
    let alPlusMal = anilistList.map(item => Object.assign({}, item, {
        malData: exports.createMALData(item, malHashMap[item.id], csrfToken),
    }));
    const addList = alPlusMal.filter(item => !malHashMap[item.id]);
    await syncList(type, addList, 'add');
    // Refresh list to get episode/chapter counts of new completed items
    Log.info(`Refreshing MyAnimeList ${type} list...`);
    malHashMap = await getMALHashMap(type, malUsername);
    alPlusMal = anilistList.map(item => Object.assign({}, item, {
        malData: exports.createMALData(item, malHashMap[item.id], csrfToken),
    }));
    const updateList = alPlusMal.filter(item => {
        const malItem = malHashMap[item.id];
        if (!malItem)
            return false;
        return exports.shouldUpdate(malItem, item.malData);
    });
    await syncList(type, updateList, 'edit');
};


/***/ })
/******/ ]);