import * as Dom from './Dom';
import * as T from "./Types";

export const createMALEntry = (al: T.FormattedEntry, mal: T.MALLoadItem, csrfToken: string) =>
    al.type === 'anime' ? new MALEntryAnime(al, mal, csrfToken) : new MALEntryManga(al, mal, csrfToken);

const MALStatus = {
    Current: 1,
    Completed: 2,
    Paused: 3,
    Dropped: 4,
    Planning: 6
}

const getStatus = (status: string) => {
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
}

const buildDateString = (date: T.MediaDate) => {
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

const createMALFormData = (malData: T.MALFormData): string => {
    let formData = '';
    Object.keys(malData).forEach(key => {
        formData += `${encodeURIComponent(key)}=${encodeURIComponent(malData[key])}&`;
    });
    return formData.replace(/&$/, '');
}

export interface MALEntry {
    shouldUpdate(): boolean
    shouldAdd(): boolean
    formData(): string
    type: string
    id: number
    title: string
    postData: T.MALPostItem
}

export class BaseMALEntry implements MALEntry {
    alData: T.FormattedEntry
    malData: T.MALLoadItem
    _postData: T.MALPostItem
    csrfToken: string

    constructor(al: T.FormattedEntry, mal: T.MALLoadItem, csrfToken: string = '') {
        this.alData = al;
        this.malData = mal;
        this.csrfToken = csrfToken;
        this._postData = this.createPostData();
    }

    protected createBaseMALPostItem(): T.MALPostItem {
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
        } as T.MALPostItem;
    }

    shouldUpdate(): boolean {
        return Object.keys(this._postData).some(key => {
            switch (key) {
                case 'csrf_token':
                case 'anime_id':
                case 'manga_id':
                    return false;
                case 'start_date':
                case 'finish_date':
                    {
                        // @ts-ignore
                        const dateString = buildDateString(this._postData[key]);
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
                        };
                        return false;
                    }
                // In certain cases the next two values will be missing from the MAL data and trying to update them will do nothing.
                // To avoid a meaningless update every time, skip it if undefined on MAL
                case 'num_watched_times':
                case 'num_read_times':
                    {
                        if (!this.malData.hasOwnProperty(key)) {
                            return false;
                        }
                        if (this._postData[key] !== this.malData[key]) {
                            return true;
                        };
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

    shouldAdd(): boolean {
        return !this.malData;
    }

    formData(): string {
        throw new Error("Method not implemented.");
    }
    protected createPostData(): T.MALPostItem {
        throw new Error("Method not implemented.");
    }

    get type(): string {
        return this.alData.type;
    }
    get id(): number {
        return this.alData.id;
    }
    get title(): string {
        return this.alData.title;
    }
    get postData(): T.MALPostItem {
        return this._postData;
    }
}

export class MALEntryAnime extends BaseMALEntry {
    constructor(al: T.FormattedEntry, mal: T.MALLoadItem, csrfToken: string) {
        super(al, mal, csrfToken);
    }

    createPostData(): T.MALPostItem {
        const result = this.createBaseMALPostItem();
        result.anime_id = this.alData.id;

        if (this.alData.repeat) result.num_watched_times = this.alData.repeat;

        // If MAL episode count is available, use it as a maximum
        // For new items it will not be present; however the list will refresh after add and
        // it should be available then
        result.num_watched_episodes = this.malData && this.malData.anime_num_episodes ?
            Math.min(this.alData.progress, this.malData.anime_num_episodes) :
            this.alData.progress || 0;

        return result;
    }

    formData(): string {
        const formData = {
            anime_id: this.malData.anime_id,
            aeps: this._postData.anime_num_episodes || 0,
            astatus: this.malData.anime_airing_status,
            'add_anime[status]': this._postData.status,
            'add_anime[num_watched_episodes]': this._postData.num_watched_episodes || 0,
            'add_anime[score]': this._postData.score,
            'add_anime[start_date][month]': this._postData.start_date && this._postData.start_date.month || '',
            'add_anime[start_date][day]': this._postData.start_date && this._postData.start_date.day || '',
            'add_anime[start_date][year]': this._postData.start_date && this._postData.start_date.year || '',
            'add_anime[finish_date][month]': this._postData.finish_date && this._postData.finish_date.month || '',
            'add_anime[finish_date][day]': this._postData.finish_date && this._postData.finish_date.day || '',
            'add_anime[finish_date][year]': this._postData.finish_date && this._postData.finish_date.year || '',
            'add_anime[tags]': this.malData.tags || '',
            'add_anime[priority]': 0,
            'add_anime[storage_type]': '',
            'add_anime[storage_value]': 0,
            'add_anime[num_watched_times]': this._postData.num_watched_times || 0,
            'add_anime[rewatch_value]': '',
            'add_anime[comments]': '',
            'add_anime[is_asked_to_discuss]': 0,
            'add_anime[sns_post_type]': 0,
            submitIt: 0,
            csrf_token: this.csrfToken,
        } as T.MALFormData;
        if (this.alData.status === 'REPEATING') {
            formData['add_anime[is_rewatching]'] = 1;
        }
        return createMALFormData(formData);
    }
}

export class MALEntryManga extends BaseMALEntry {
    constructor(al: T.FormattedEntry, mal: T.MALLoadItem, csrfToken: string) {
        super(al, mal, csrfToken);
    }

    createPostData(): T.MALPostItem {
        const result = this.createBaseMALPostItem();
        result.manga_id = this.alData.id;

        if (this.alData.repeat) result.num_read_times = this.alData.repeat;

        // If MAL chapter and volume counts are available, use them as a maximum
        // For new items they will not be present; however the list will refresh after add and
        // they should be available then
        result.num_read_chapters = this.malData && this.malData.manga_num_chapters ?
            Math.min(this.alData.progress, this.malData.manga_num_chapters) :
            this.alData.progress || 0;

        result.num_read_volumes = this.malData && this.malData.manga_num_volumes ?
            Math.min(this.alData.progressVolumes, this.malData.manga_num_volumes) :
            this.alData.progressVolumes || 0;

        return result;
    }

    formData(): string {
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
            'add_manga[priority]': 0,
            'add_manga[storage_type]': '',
            'add_manga[num_retail_volumes]': this.malData.manga_num_volumes || 0,
            'add_manga[num_read_times]': this._postData.num_read_times || 0,
            'add_manga[reread_value]': '',
            'add_manga[comments]': '',
            'add_manga[is_asked_to_discuss]': 0,
            'add_manga[sns_post_type]': 0,
            csrf_token: this.csrfToken,
            submitIt: 0
        } as T.MALFormData;
        if (this.alData.status === 'REPEATING') {
            formData['add_manga[is_rewatching]'] = 1;
        }
        return createMALFormData(formData);
    }
}