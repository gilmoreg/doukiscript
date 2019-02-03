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

const parseFormData = (formData: string) => {
    const result: any = {};
    formData.split('&').forEach(i => {
        const [key, value] = i.split('=');
        const parsedKey = key.replace(/%5B/g, '[').replace(/%5D/g, ']');
        result[parsedKey] = value;
    });
    return result;
}

const formDataToLoadAnime = (f: T.MALAnimeFormData, e: T.MALLoadAnime): T.MALLoadAnime => {
    const entry: T.MALLoadAnime = e || fakes.createFakeMALAnime();
    return {
        anime_id: Number(f.anime_id),
        num_watched_episodes: Number(f['add_anime[num_watched_episodes]']),
        anime_num_episodes: entry.anime_num_episodes,
        anime_airing_status: entry.anime_airing_status,
        finish_date_string: `${f["add_anime[finish_date][day]"]}-${f['add_anime[finish_date][month]']}-${f['add_anime[finish_date][year]']}`,
        start_date_string: `${f["add_anime[start_date][day]"]}-${f['add_anime[start_date][month]']}-${f['add_anime[start_date][year]']}`,
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
        finish_date_string: `${f["add_manga[finish_date][day]"]}-${f['add_manga[finish_date][month]']}-${f['add_manga[finish_date][year]']}`,
        start_date_string: `${f["add_manga[start_date][day]"]}-${f['add_manga[start_date][month]']}-${f['add_manga[start_date][year]']}`,
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

    constructor(anime: T.MALLoadAnime[] = defaultAnime, manga: T.MALLoadManga[] = defaultManga) {
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

        const entry = JSON.parse(opts.body);

        if (type === 'anime') {
            this.anime.push(entry);
        } else {
            this.manga.push(entry);
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