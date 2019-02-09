import * as fetchMock from 'fetch-mock';
import * as T from '../src/Types';
import * as fakes from '../__testutils__/testData';

const defaultAnime: T.MALLoadAnime[] = [fakes.createFakeMALAnime()];
const defaultManga: T.MALLoadManga[] = [fakes.createFakeMALManga()];

// https://myanimelist.net/${type}list/${this.username}/load.json?offset=${offset}&status=7
const loadRegex = /^https:\/\/myanimelist\.net\/(.+)list\/.+\/load\.json\?offset=(.+)&status=7$/;

// https://myanimelist.net/ownlist/${type}/${id}/edit?hideLayout
const editRegex = /^https:\/\/myanimelist\.net\/ownlist\/(.+)\/(.+)\/edit\?hideLayout$/;

// https://myanimelist.net/ownlist/${data.type}/add.json
const addRegex = /^https:\/\/myanimelist\.net\/ownlist\/(.+)\/add\.json$/;

const animeDb: any = {
    1: {
        anime_num_episodes: 12,
    },
    3: {
        anime_num_episodes: 0,
    }
}

const mangaDb: any = {
    2: {
        manga_num_chapters: 12,
        manga_num_volumes: 2,
        manga_publishing_status: 0,
    },
    4: {
        manga_num_chapters: 0,
        manga_num_volumes: 0,
        manga_publishing_status: 1,
    }
}

const parseFormData = (formData: string) => {
    const result: any = {};
    formData.split('&').forEach(i => {
        const [key, value] = i.split('=');
        const parsedKey = key.replace(/%5B/g, '[').replace(/%5D/g, ']');
        result[parsedKey] = value;
    });
    return result;
}

const createDateString = (listType: string, dateType: string, f: any): string => {
    const rawMonth = f[`add_${listType}[${dateType}_date][month]`];
    const rawDay = f[`add_${listType}[${dateType}_date][day]`];
    const rawYear = f[`add_${listType}[${dateType}_date][year]`];

    const month = `${String(rawMonth).length < 2 ? '0' : ''}${rawMonth}`;
    const day = `${String(rawDay).length < 2 ? '0' : ''}${rawDay}`;
    const year = `${rawYear ? String(rawYear).slice(-2) : 0}`;

    // Assuming dateSetting = 'a':
    return `${month}-${day}-${year}`;
}

const formDataToLoadAnime = (f: T.MALAnimeFormData, e: T.MALLoadAnime): T.MALLoadAnime => {
    const entry: T.MALLoadAnime = e || fakes.createFakeMALAnime();
    return {
        anime_id: Number(f.anime_id),
        num_watched_episodes: Number(f['add_anime[num_watched_episodes]']),
        anime_num_episodes: entry.anime_num_episodes,
        anime_airing_status: entry.anime_airing_status,
        finish_date_string: createDateString('anime', 'finish', f),
        start_date_string: createDateString('anime', 'start', f),
        priority_string: `${f['add_anime[priority]']}`,
        comments: f['add_anime[comments]'],
        score: Number(f['add_anime[score]']),
        csrf_token: entry.csrf_token,
        status: Number(f['add_anime[status]']),
    }
};

const formDataToLoadManga = (f: T.MALMangaFormData, e: T.MALLoadManga): T.MALLoadManga => {
    const entry: T.MALLoadManga = e || fakes.createFakeMALManga();
    return {
        manga_id: Number(f.manga_id),
        num_read_chapters: Number(f['add_manga[num_read_chapters]']),
        num_read_volumes: Number(f['add_manga[num_read_volumes]']),
        manga_num_chapters: entry.manga_num_chapters,
        manga_num_volumes: entry.manga_num_volumes,
        manga_publishing_status: entry.manga_publishing_status,
        finish_date_string: createDateString('manga', 'finish', f),
        start_date_string: createDateString('manga', 'start', f),
        priority_string: `${f['add_manga[priority]']}`,
        comments: f['add_manga[comments]'],
        score: Number(f['add_manga[score]']),
        csrf_token: entry.csrf_token,
        status: Number(f['add_manga[status]']),
    };
}

class MockMAL {
    anime: T.MALLoadAnime[]
    manga: T.MALLoadManga[]

    constructor(anime: T.MALLoadAnime[] = [], manga: T.MALLoadManga[] = []) {
        this.anime = anime;
        this.manga = manga;

        this.load = this.load.bind(this);
        this.add = this.add.bind(this);
        this.edit = this.edit.bind(this);

        fetchMock.mock(/.+load.json.+/, url => this.load(url));
        fetchMock.mock(/.+add.+/, (url, opts) => this.add(url, opts));
        fetchMock.mock(/.+edit.+/, (url, opts) => this.edit(url, opts));
    }

    load(url: string): T.MALLoadItem[] {
        // @ts-ignore
        const [_, listType, offset] = loadRegex.exec(url);
        if (Number(offset) > 0) return [];

        return listType === 'anime' ? this.anime : this.manga;
    }

    add(url: string, opts: any): string {
        // @ts-ignore
        const [_, type] = addRegex.exec(url);

        const entry: any = JSON.parse(opts.body);

        if (type === 'anime') {
            if (!animeDb[entry.anime_id]) {
                throw new Error('unknown anime');
            }
            const fullEntry = { ...animeDb[entry.anime_id], ...entry };
            this.anime.push(fullEntry);
        } else {
            if (!mangaDb[entry.manga_id]) {
                throw new Error('unknown manga');
            }
            const fullEntry = { ...mangaDb[entry.manga_id], ...entry };
            this.manga.push(fullEntry);
        }

        return ' Successfully added entry ';
    }

    edit(url: string, opts: any): string {
        // @ts-ignore
        const [_, listType, id] = editRegex.exec(url);
        const nid = Number(id);
        const entry = listType === 'anime' ?
            this.anime.find(i => i.anime_id === nid) :
            this.manga.find(i => i.manga_id === nid);
        if (!entry) return ' Not found ';

        const formData = parseFormData(opts.body);

        if (listType === 'anime') {
            this.anime = this.anime.map(i => {
                if (i.anime_id === nid) {
                    return formDataToLoadAnime(formData, entry as T.MALLoadAnime);
                }
                return i;
            });
        } else {
            this.manga = this.manga.map(i => {
                if (i.manga_id === nid) {
                    return formDataToLoadManga(formData, entry as T.MALLoadManga);
                }
                return i;
            });
        }

        return ' Successfully updated entry ';
    }
}

export default MockMAL;