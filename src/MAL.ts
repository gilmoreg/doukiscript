import { sleep, getOperationDisplayName } from './util';
import * as Log from './Log';
import * as Dom from './Dom';
import { MALHashMap, MALItem, MediaDate, FormattedEntry, FullDataEntry, MALAnimeFormData } from './Types';

const createMALHashMap = (malList: Array<MALItem>, type: string): MALHashMap => {
    const hashMap: MALHashMap = {};
    malList.forEach(item => {
        hashMap[item[`${type}_id`]] = item;
    });
    return hashMap;
}

const getMALHashMap = async (type: string, username: string, list: Array<MALItem> = [], page = 1): Promise<MALHashMap> => {
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

const createMALFormData = (data: MALItem): string => {
    const malData: MALAnimeFormData = {
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
    }

    let formData = '';
    Object.keys(malData).forEach(key => {
        formData += `${encodeURIComponent(key)}=${encodeURIComponent(malData[key])}&`;
    });
    return formData.replace(/&$/, '');
};

const malEdit = (type: string, data: MALItem) =>
    fetch(`https://myanimelist.net/ownlist/${type}/${data.anime_id}/edit?hideLayout`,
        {
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
            body: createMALFormData(data),
            method: 'POST',
            mode: 'cors'
        }).then((res) => {
            if (res.status === 200) return res;
            throw new Error(JSON.stringify(data));
        });
}

const malAdd = (type: string, data: MALItem) =>
    fetch(`https://myanimelist.net/ownlist/${type}/add.json`, {
        method: 'post',
        headers: {
            'Accept': '*/*',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'x-requested-with': 'XMLHttpRequest'
        },
        body: JSON.stringify(data)
    })
        .then((res) => {
            if (res.status === 200) return res;
            throw new Error(JSON.stringify(data));
        });

const getStatus = (status: string) => {
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
}

const buildDateString = (date: MediaDate) => {
    if (date.month === 0 && date.day === 0 && date.year === 0) return null;
    const dateSetting = Dom.getDateSetting();
    const month = `${String(date.month).length < 2 ? '0' : ''}${date.month}`;
    const day = `${String(date.day).length < 2 ? '0' : ''}${date.day}`;
    const year = `${date.year ? String(date.year).slice(-2) : 0}`;
    if (dateSetting === 'a') {
        return `${month}-${day}-${year}`;
    }
    return `${day}-${month}-${year}`;
}

export const createMALData = (anilistData: FormattedEntry, malData: MALItem, csrf_token: string): MALItem => {
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
    } as MALItem;

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
            } else {
                result.num_read_chapters = malData.manga_num_chapters || 0;
                result.num_read_volumes = malData.manga_num_volumes || 0;
            }
        }
    } else {
        // Non-completed item; use Anilist's counts
        // Note the possibility that this count could be higher than MAL's max; see if that creates problems
        if (anilistData.type === 'anime') {
            result.num_watched_episodes = anilistData.progress || 0;
        } else {
            result.num_read_chapters = anilistData.progress || 0;
            result.num_read_volumes = anilistData.progressVolumes || 0;
        }
    }
    return result;
};

export const shouldUpdate = (mal: MALItem, al: MALItem) =>
    Object.keys(al).some(key => {
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
                    };
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
                    };
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

const syncList = async (type: string, list: Array<FullDataEntry>, operation: string) => {
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
            await fn(type, item.malData);
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
    let malHashMap = await getMALHashMap(type, malUsername);
    let alPlusMal = anilistList.map(item => Object.assign({}, item, {
        malData: createMALData(item, malHashMap[item.id], csrfToken),
    })) as Array<FullDataEntry>;

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