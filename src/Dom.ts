import {
    DOUKI_FORM_ID,
    DOUKI_ANILIST_IMPORT_ID,
    DATE_SETTING_ID,
    CONTENT_ID,
    DOUKI_IMPORT_BUTTON_ID,
    SYNC_LOG_ID,
    ERROR_LOG_ID,
    ERROR_LOG_DIV_ID,
    ERROR_LOG_TOGGLE_ID,
    ANILIST_USERNAME_ID,
    SETTINGS_KEY,
    DATE_SETTINGS_KEY,
    DROPDOWN_ITEM_ID
} from './const';
import { id } from './util';

const importFormHTML = `
    <div id="${DOUKI_FORM_ID}">
        <h1 class="h1">Import From Anilist</h1>
        <div style="padding: 20px">
            <p><strong>NOTICE</strong>: Use this script at your own risk. The author takes no responsibility for any damages of any kind.</p>
            <p>It is <em>highly</em> recommended that you try this script out on a test MAL account before importing to your main account.</p>
            <p>Visit <a href="https://anilist.co/forum/thread/2654" target="_blank" rel="noopener noreferrer">the Anilist thread</a> for this script to ask questions or report problems.</p>
            <p>Please be patient. If the import goes any faster you will be in violation of MyAnimeList's Terms of Service.</p>
        </div>
        <form id="${DOUKI_ANILIST_IMPORT_ID}" style="padding: 5px 0px 10px 0px">
            <p style="margin: 10px"><label>Anilist Username: <input type="text" id="${ANILIST_USERNAME_ID}" /></label></p>
            <p style="margin: 10px">
            <label>Date Format:
                <select id="${DATE_SETTING_ID}" class="inputtext">
                <option value="a" selected>American (MM-DD-YY)
                <option value="e" >European (DD-MM-YY)
                </select>
            </label>
            </p>
            <p style="margin: 10px"><button id="${DOUKI_IMPORT_BUTTON_ID}">Import</button></p>
        </form>
        <br />
        <ul id="${SYNC_LOG_ID}" style="list-type: none;"></ul>
        <p style="margin: 10px"><button id="${ERROR_LOG_TOGGLE_ID}" style="border: none">Show items that could not be synced</button></p>
        <div id="${ERROR_LOG_DIV_ID}" style="display: none;">
            <p style="margin: 10px">Anilist does not have a MAL ID for the following items. If a verified MAL entry exists for any of these, contact an Anilist data mod to have it added.</p>
            <ul id="${ERROR_LOG_ID}" style="list-type: none;"></ul>
        </div>
    </div>
`;

export const addDropDownItem = () => {
    if (document.querySelector(id(DROPDOWN_ITEM_ID))) return;
    const selector = '.header-menu-dropdown > ul > li:last-child';
    const dropdown = document.querySelector(selector);
    if (dropdown) {
        const html = `<li><a aria-role="button" id="${DROPDOWN_ITEM_ID}">Import from Anilist</a></li>`;
        dropdown.insertAdjacentHTML('afterend', html);
        const link = document.querySelector(id(DROPDOWN_ITEM_ID));
        link && link.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.replace('https://myanimelist.net/import.php');
        });
    }
}

export const addImportForm = (syncFn: Function) => {
    if (document.querySelector(id(DOUKI_FORM_ID))) return;
    const element = document.querySelector(id(CONTENT_ID));
    if (!element) {
        throw new Error('Unable to add form to page');
    }
    element.insertAdjacentHTML('afterend', importFormHTML);
    addImportFormEventListeners(syncFn);
}

// TODO break this up
const addImportFormEventListeners = (syncFn: Function) => {
    const importButton = document.querySelector(id(DOUKI_IMPORT_BUTTON_ID));
    importButton && importButton.addEventListener('click', function (e) {
        syncFn();
    });

    const textBox = document.querySelector(id(ANILIST_USERNAME_ID)) as HTMLInputElement;
    textBox && textBox.addEventListener('change', function (e: any) {
        setLocalStorageSetting(SETTINGS_KEY, e.target.value);
    });
    const username = getLocalStorageSetting(SETTINGS_KEY);
    if (username && textBox) {
        textBox.value = username;
    }

    const dateFormatPicker = document.querySelector(id(DATE_SETTING_ID)) as HTMLSelectElement;
    dateFormatPicker && dateFormatPicker.addEventListener('change', function (e: any) {
        setLocalStorageSetting(DATE_SETTINGS_KEY, e.target.value);
    });
    const dateOption = getLocalStorageSetting(DATE_SETTINGS_KEY);
    if (dateOption && dateFormatPicker) {
        dateFormatPicker.value = dateOption;
    }

    const errorToggle = document.querySelector(id(ERROR_LOG_TOGGLE_ID)) as HTMLButtonElement;
    errorToggle && errorToggle.addEventListener('click', function (e) {
        e.preventDefault();
        const errorLog = document.querySelector(id(ERROR_LOG_DIV_ID)) as HTMLElement;
        if (errorLog.style.display === 'none') {
            errorLog.style.display = 'block';
        } else {
            errorLog.style.display = 'none';
        }
    });
}

const getLocalStorageSetting = (setting: string): string | null => {
    if (localStorage) {
        const value = localStorage.getItem(setting);
        if (value) return JSON.parse(value);
    }
    return null;
}

const setLocalStorageSetting = (setting: string, value: string) => {
    if (localStorage) {
        localStorage.setItem(setting, JSON.stringify(value));
    }
}

export const getDateSetting = (): string => {
    const dateSetting = document.querySelector(id(DATE_SETTING_ID)) as HTMLSelectElement;
    return dateSetting && dateSetting.value;
}