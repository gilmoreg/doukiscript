// ==UserScript==
// @name        Douki
// @namespace   http://gilmoreg.com
// @description Import Anime and Manga Lists from Anilist (see https://anilist.co/forum/thread/2654 for more info)
// @version     0.2.1
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
const Log_1 = __webpack_require__(1);
const Dom_1 = __webpack_require__(4);
const Anilist_1 = __webpack_require__(5);
const MAL_1 = __webpack_require__(6);
// Main business logic
const sync = async (e) => {
    e.preventDefault();
    const anilistUsername = Dom_1.default.getAnilistUsername();
    if (!anilistUsername)
        return;
    const malUsername = Dom_1.default.getMALUsername();
    if (!malUsername) {
        Log_1.default.info('You must be logged in!');
        return;
    }
    const csrfToken = Dom_1.default.getCSRFToken();
    Log_1.default.clear();
    Log_1.default.info(`Fetching data from Anilist...`);
    const anilistList = await Anilist_1.getAnilistList(anilistUsername);
    if (!anilistList) {
        Log_1.default.info(`No data found for user ${anilistUsername}.`);
        return;
    }
    Log_1.default.info(`Fetched Anilist data.`);
    const mal = new MAL_1.default(malUsername, csrfToken);
    await mal.syncType('anime', anilistList.anime);
    await mal.syncType('manga', anilistList.manga);
    Log_1.default.info('Import complete.');
};
// Entrypoint
(() => {
    'use strict';
    Dom_1.default.addDropDownItem();
    if (window.location.pathname === '/import.php') {
        Dom_1.default.addImportForm(sync);
    }
})();


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = __webpack_require__(2);
const util_1 = __webpack_require__(3);
const getCountLog = (operation, type) => document.querySelector(util_1.id(`douki-${operation}-${type}-items`));
class Log {
    constructor() {
        this.errorLogElement = null;
        this.syncLogElement = null;
    }
    get errorLog() {
        if (!this.errorLogElement) {
            this.errorLogElement = document.querySelector(util_1.id(const_1.ERROR_LOG_ID));
        }
        return this.errorLogElement;
    }
    get syncLog() {
        if (!this.syncLogElement) {
            this.syncLogElement = document.querySelector(util_1.id(const_1.SYNC_LOG_ID));
        }
        return this.syncLogElement;
    }
    clearErrorLog() {
        if (this.errorLog) {
            this.errorLog.innerHTML = '';
        }
    }
    clearSyncLog() {
        if (this.syncLog) {
            this.syncLog.innerHTML = '';
        }
    }
    clear(type = '') {
        console.clear();
        if (type !== 'error')
            this.clearSyncLog();
        if (type !== 'sync')
            this.clearErrorLog();
    }
    error(msg) {
        if (this.errorLog) {
            this.errorLog.innerHTML += `<li>${msg}</li>`;
        }
        else {
            console.error(msg);
        }
    }
    info(msg) {
        if (this.syncLog) {
            this.syncLog.innerHTML += `<li>${msg}</li>`;
        }
        else {
            console.info(msg);
        }
    }
    addCountLog(operation, type, max) {
        const opName = util_1.getOperationDisplayName(operation);
        const logId = `douki-${operation}-${type}-items`;
        this.info(`${opName} <span id="${logId}">0</span> of ${max} ${type} items.`);
    }
    updateCountLog(operation, type, count) {
        const countLog = getCountLog(operation, type);
        if (!countLog)
            return;
        countLog.innerHTML = `${count}`;
    }
}
exports.Log = Log;
exports.default = new Log();


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
class DomMethods {
    constructor() {
        this.csrfToken = null;
        this.dateSetting = null;
    }
    addDropDownItem() {
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
    }
    addImportForm(syncFn) {
        if (document.querySelector(util_1.id(const_1.DOUKI_FORM_ID)))
            return;
        const element = document.querySelector(util_1.id(const_1.CONTENT_ID));
        if (!element) {
            throw new Error('Unable to add form to page');
        }
        element.insertAdjacentHTML('afterend', importFormHTML);
        this.addImportFormEventListeners(syncFn);
    }
    // TODO break this up
    addImportFormEventListeners(syncFn) {
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
    }
    getDateSetting() {
        if (this.dateSetting)
            return this.dateSetting;
        const dateSetting = document.querySelector(util_1.id(const_1.DATE_SETTING_ID));
        if (!dateSetting || !dateSetting.value)
            throw new Error('Unable to get date setting');
        this.dateSetting = dateSetting.value;
        return this.dateSetting;
    }
    getCSRFToken() {
        if (this.csrfToken)
            return this.csrfToken;
        const csrfTokenMeta = document.querySelector('meta[name~="csrf_token"]');
        if (!csrfTokenMeta)
            throw new Error('Unable to get CSRF token - no meta element');
        const csrfToken = csrfTokenMeta.getAttribute('content');
        if (!csrfToken)
            throw new Error('Unable to get CSRF token - no content attribute');
        this.csrfToken = csrfToken;
        return csrfToken;
    }
    getMALUsername() {
        const malUsernameElement = document.querySelector('.header-profile-link');
        if (!malUsernameElement)
            return null;
        return malUsernameElement.innerText;
    }
    getAnilistUsername() {
        const anilistUserElement = document.querySelector('#douki-anilist-username');
        if (!anilistUserElement)
            throw new Error('Unable to get Anilist username');
        return anilistUserElement.value;
    }
}
exports.DomMethods = DomMethods;
exports.default = new DomMethods();


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = __webpack_require__(1);
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
    Log_1.default.error(`${item.type}: ${item.title}`);
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
const MALEntry_1 = __webpack_require__(7);
const Log_1 = __webpack_require__(1);
const Dom_1 = __webpack_require__(4);
class MAL {
    constructor(username, csrfToken, log = Log_1.default, dom = Dom_1.default) {
        this.username = username;
        this.csrfToken = csrfToken;
        this.Log = log;
        this.dom = dom;
    }
    createMALHashMap(malList, type) {
        const hashMap = {};
        malList.forEach(item => {
            hashMap[item[`${type}_id`]] = item;
        });
        return hashMap;
    }
    async getMALHashMap(type, list = [], page = 1) {
        const offset = (page - 1) * 300;
        const nextList = await fetch(`https://myanimelist.net/${type}list/${this.username}/load.json?offset=${offset}&status=7`)
            .then(async (res) => {
            if (res.status !== 200) {
                await util_1.sleep(2000);
                return this.getMALHashMap(type, list, page);
            }
            return res.json();
        });
        if (nextList && nextList.length) {
            await util_1.sleep(1500);
            return this.getMALHashMap(type, [...list, ...nextList], page + 1);
        }
        this.Log.info(`Fetched MyAnimeList ${type} list.`);
        return this.createMALHashMap([...list, ...nextList], type);
    }
    async getEntriesList(anilistList, type) {
        const malHashMap = await this.getMALHashMap(type);
        return anilistList.map(entry => MALEntry_1.createMALEntry(entry, malHashMap[entry.id], this.csrfToken, this.dom));
    }
    async malEdit(data) {
        const { type, id } = data;
        const formData = await data.formData();
        return fetch(`https://myanimelist.net/ownlist/${type}/${id}/edit?hideLayout`, {
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
            if (res.status === 200)
                return res;
            throw new Error(`Error updating ${type} id ${id}`);
        }).then((res) => res.text())
            .then((text) => {
            if (text.match(/.+Successfully updated entry.+/))
                return;
            throw new Error(`Error updating ${type} id ${id}`);
        });
    }
    malAdd(data) {
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
            if (res.status === 200)
                return res;
            throw new Error(JSON.stringify(data));
        });
    }
    async syncList(type, list, operation) {
        if (!list || !list.length) {
            return;
        }
        this.Log.addCountLog(operation, type, list.length);
        let itemCount = 0;
        const fn = operation === 'add' ? this.malAdd : this.malEdit;
        for (let item of list) {
            await util_1.sleep(500);
            try {
                await fn(item);
                itemCount++;
                this.Log.updateCountLog(operation, type, itemCount);
            }
            catch (e) {
                console.error(e);
                this.Log.info(`Error for ${type} <a href="https://myanimelist.net/${type}/${item.id}" target="_blank" rel="noopener noreferrer">${item.title}</a>. Try adding or updating it manually.`);
            }
        }
    }
    async syncType(type, anilistList) {
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
exports.default = MAL;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const MALForm_1 = __webpack_require__(8);
const Dom_1 = __webpack_require__(4);
exports.createMALEntry = (al, mal, csrfToken, dom) => al.type === 'anime' ?
    new MALEntryAnime(al, mal, csrfToken, dom) :
    new MALEntryManga(al, mal, csrfToken, dom);
const MALStatus = {
    Current: 1,
    Completed: 2,
    Paused: 3,
    Dropped: 4,
    Planning: 6
};
const getStatus = (status) => {
    // MAL status: 1/watching, 2/completed, 3/onhold, 4/dropped, 6/plantowatch
    // MAL handles REPEATING as a boolean, and keeps status as COMPLETE
    switch (status.trim()) {
        case 'CURRENT':
            return MALStatus.Current;
        case 'REPEATING':
        case 'COMPLETED':
            return MALStatus.Completed;
        case 'PAUSED':
            return MALStatus.Paused;
        case 'DROPPED':
            return MALStatus.Dropped;
        case 'PLANNING':
            return MALStatus.Planning;
        default:
            throw new Error(`unknown status "${status}"`);
    }
};
const createMALFormData = (malData) => {
    let formData = '';
    Object.keys(malData).forEach(key => {
        formData += `${encodeURIComponent(key)}=${encodeURIComponent(malData[key])}&`;
    });
    return formData.replace(/&$/, '');
};
class BaseMALEntry {
    constructor(al, mal, csrfToken = '', dom = Dom_1.default) {
        this.alData = al;
        this.malData = mal;
        this.csrfToken = csrfToken;
        this._postData = this.createPostData();
        this.dom = dom;
    }
    createBaseMALPostItem() {
        return {
            status: getStatus(this.alData.status),
            csrf_token: this.csrfToken,
            score: this.alData.score || 0,
            finish_date: {
                year: this.alData.completedAt.year || 0,
                month: this.alData.completedAt.month || 0,
                day: this.alData.completedAt.day || 0
            },
            start_date: {
                year: this.alData.startedAt.year || 0,
                month: this.alData.startedAt.month || 0,
                day: this.alData.startedAt.day || 0
            }
        };
    }
    buildDateString(date) {
        if (date.month === 0 && date.day === 0 && date.year === 0)
            return null;
        const dateSetting = this.dom.getDateSetting();
        const month = `${String(date.month).length < 2 ? '0' : ''}${date.month}`;
        const day = `${String(date.day).length < 2 ? '0' : ''}${date.day}`;
        const year = `${date.year ? String(date.year).slice(-2) : 0}`;
        if (dateSetting === 'a') {
            return `${month}-${day}-${year}`;
        }
        return `${day}-${month}-${year}`;
    }
    shouldUpdate() {
        return Object.keys(this._postData).some(key => {
            switch (key) {
                case 'csrf_token':
                case 'anime_id':
                case 'manga_id':
                // This data is not part of the load.json list and so can't be used as update test
                case 'num_watched_times':
                case 'num_read_times':
                    return false;
                case 'start_date':
                case 'finish_date':
                    {
                        // @ts-ignore
                        const dateString = this.buildDateString(this._postData[key]);
                        if (dateString !== this.malData[`${key}_string`]) {
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
                        if (this.malData.status === MALStatus.Completed && this.malData[key] !== 0) {
                            return false;
                        }
                        if (this._postData[key] !== this.malData[key]) {
                            return true;
                        }
                        return false;
                    }
                default:
                    {
                        // Treat falsy values as equivalent (!= doesn't do the trick here)
                        if (!this._postData[key] && !this.malData[key]) {
                            return false;
                        }
                        if (this._postData[key] !== this.malData[key]) {
                            return true;
                        }
                        return false;
                    }
            }
        });
    }
    shouldAdd() {
        return !this.malData;
    }
    formData() {
        throw new Error("Method not implemented.");
    }
    createPostData() {
        throw new Error("Method not implemented.");
    }
    get type() {
        return this.alData.type;
    }
    get id() {
        return this.alData.id;
    }
    get title() {
        return this.alData.title;
    }
    get postData() {
        return this._postData;
    }
}
exports.BaseMALEntry = BaseMALEntry;
class MALEntryAnime extends BaseMALEntry {
    constructor(al, mal, csrfToken = '', dom = Dom_1.default) {
        super(al, mal, csrfToken, dom);
    }
    createPostData() {
        const result = this.createBaseMALPostItem();
        result.anime_id = this.alData.id;
        if (this.alData.repeat)
            result.num_watched_times = this.alData.repeat;
        // If MAL episode count is available, use it
        // For completed shows, use it outright in case AL counts fewer episodes
        // Otherwise, use it as a maximum
        // For new items it will not be present; in that case set it to 0
        // When the list refreshes the count will be available and be set then
        if (result.status === MALStatus.Completed) {
            result.num_watched_episodes = this.malData && this.malData.anime_num_episodes ?
                this.malData.anime_num_episodes : 0;
        }
        else {
            result.num_watched_episodes = this.malData && this.malData.anime_num_episodes ?
                Math.min(this.alData.progress, this.malData.anime_num_episodes) : 0;
        }
        return result;
    }
    async formData() {
        const malFormData = new MALForm_1.MALForm(this.alData.type, this.alData.id);
        await malFormData.get();
        const formData = {
            anime_id: this.malData.anime_id,
            aeps: this.malData.anime_num_episodes || 0,
            astatus: this.malData.anime_airing_status,
            'add_anime[status]': this._postData.status,
            'add_anime[num_watched_episodes]': this._postData.num_watched_episodes || 0,
            'add_anime[score]': this._postData.score || '',
            'add_anime[start_date][month]': this._postData.start_date && this._postData.start_date.month || '',
            'add_anime[start_date][day]': this._postData.start_date && this._postData.start_date.day || '',
            'add_anime[start_date][year]': this._postData.start_date && this._postData.start_date.year || '',
            'add_anime[finish_date][month]': this._postData.finish_date && this._postData.finish_date.month || '',
            'add_anime[finish_date][day]': this._postData.finish_date && this._postData.finish_date.day || '',
            'add_anime[finish_date][year]': this._postData.finish_date && this._postData.finish_date.year || '',
            'add_anime[tags]': this.malData.tags || '',
            'add_anime[priority]': malFormData.priority,
            'add_anime[storage_type]': malFormData.storageType,
            'add_anime[storage_value]': malFormData.storageValue,
            'add_anime[num_watched_times]': this._postData.num_watched_times || 0,
            'add_anime[rewatch_value]': malFormData.rewatchValue,
            'add_anime[comments]': malFormData.comments,
            'add_anime[is_asked_to_discuss]': malFormData.discussionSetting,
            'add_anime[sns_post_type]': malFormData.SNSSetting,
            submitIt: 0,
            csrf_token: this.csrfToken,
        };
        if (this.alData.status === 'REPEATING') {
            formData['add_anime[is_rewatching]'] = 1;
        }
        return createMALFormData(formData);
    }
}
exports.MALEntryAnime = MALEntryAnime;
class MALEntryManga extends BaseMALEntry {
    constructor(al, mal, csrfToken = '', dom = Dom_1.default) {
        super(al, mal, csrfToken, dom);
    }
    createPostData() {
        const result = this.createBaseMALPostItem();
        result.manga_id = this.alData.id;
        if (this.alData.repeat)
            result.num_read_times = this.alData.repeat;
        // If MAL chapter and volume counts are available, use them
        // For completed shows, use them outright in case AL counts fewer chapters/volumes
        // Otherwise, use them as a maximum
        // For new items they will not be present; in that case set them to 0
        // When the list refreshes the counts will be available and be set then
        if (result.status === MALStatus.Completed) {
            result.num_read_chapters = this.malData && this.malData.manga_num_chapters ?
                this.malData.manga_num_chapters : 0;
            result.num_read_volumes = this.malData && this.malData.manga_num_volumes ?
                this.malData.manga_num_volumes : 0;
        }
        else {
            result.num_read_chapters = this.malData && this.malData.manga_num_chapters ?
                Math.min(this.alData.progress, this.malData.manga_num_chapters) : 0;
            result.num_read_volumes = this.malData && this.malData.manga_num_volumes ?
                Math.min(this.alData.progressVolumes, this.malData.manga_num_volumes) : 0;
        }
        return result;
    }
    async formData() {
        const malFormData = new MALForm_1.MALForm(this.alData.type, this.alData.id);
        await malFormData.get();
        const formData = {
            entry_id: 0,
            manga_id: this.malData.manga_id,
            'add_manga[status]': this._postData.status,
            'add_manga[num_read_volumes]': this._postData.num_read_volumes || 0,
            last_completed_vol: '',
            'add_manga[num_read_chapters]': this._postData.num_read_chapters || 0,
            'add_manga[score]': this._postData.score || '',
            'add_manga[start_date][month]': this._postData.start_date && this._postData.start_date.month || '',
            'add_manga[start_date][day]': this._postData.start_date && this._postData.start_date.day || '',
            'add_manga[start_date][year]': this._postData.start_date && this._postData.start_date.year || '',
            'add_manga[finish_date][month]': this._postData.finish_date && this._postData.finish_date.month || '',
            'add_manga[finish_date][day]': this._postData.finish_date && this._postData.finish_date.day || '',
            'add_manga[finish_date][year]': this._postData.finish_date && this._postData.finish_date.year || '',
            'add_manga[tags]': this.malData.tags || '',
            'add_manga[priority]': malFormData.priority,
            'add_manga[storage_type]': malFormData.storageType,
            'add_manga[num_retail_volumes]': malFormData.numRetailVolumes,
            'add_manga[num_read_times]': this._postData.num_read_times || 0,
            'add_manga[reread_value]': malFormData.rereadValue,
            'add_manga[comments]': malFormData.comments,
            'add_manga[is_asked_to_discuss]': malFormData.discussionSetting,
            'add_manga[sns_post_type]': malFormData.SNSSetting,
            csrf_token: this.csrfToken,
            submitIt: 0
        };
        if (this.alData.status === 'REPEATING') {
            formData['add_manga[is_rewatching]'] = 1;
        }
        return createMALFormData(formData);
    }
}
exports.MALEntryManga = MALEntryManga;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __webpack_require__(3);
class MALForm {
    constructor(type, id) {
        this.document = null;
        this.type = type;
        this.id = id;
    }
    fetchDocument(type, id) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                return resolve(this.responseXML ? this.responseXML : null);
            };
            xhr.onerror = function (e) {
                reject(e);
            };
            xhr.open('GET', `https://myanimelist.net/ownlist/${type}/${id}/edit`);
            xhr.responseType = 'document';
            xhr.send();
        });
    }
    getElement(id) {
        if (!this.document)
            throw new Error('Document not loaded');
        return this.document.querySelector(`#add_${this.type}_${id}`);
    }
    async get() {
        await util_1.sleep(500);
        const document = await this.fetchDocument(this.type, this.id);
        if (document) {
            this.document = document;
        }
        else {
            throw new Error('Unable to fetch form data');
        }
    }
    get priority() {
        const el = this.getElement('priority');
        if (!el)
            throw new Error('Unable to get priority');
        return el.value;
    }
    get storageType() {
        const el = this.getElement('storage_type');
        if (!el)
            throw new Error('Unable to get storage type');
        return el.value;
    }
    get storageValue() {
        const el = this.getElement('storage_value');
        if (!el)
            return '0';
        return el.value;
    }
    get numRetailVolumes() {
        const el = this.getElement('num_retail_volumes');
        if (!el)
            return '0';
        return el.value;
    }
    get rewatchValue() {
        const el = this.getElement('rewatch_value');
        if (!el)
            throw new Error('Unable to get rewatch value');
        return el.value;
    }
    get rereadValue() {
        const el = this.getElement('reread_value');
        if (!el)
            throw new Error('Unable to get reread value');
        return el.value;
    }
    get comments() {
        const el = this.getElement('comments');
        if (!el)
            throw new Error('Unable to get comments');
        return el.value;
    }
    get discussionSetting() {
        const el = this.getElement('is_asked_to_discuss');
        if (!el)
            throw new Error('Unable to get discussion value');
        return el.value;
    }
    get SNSSetting() {
        const el = this.getElement('sns_post_type');
        if (!el)
            throw new Error('Unable to get SNS setting');
        return el.value;
    }
}
exports.MALForm = MALForm;


/***/ })
/******/ ]);