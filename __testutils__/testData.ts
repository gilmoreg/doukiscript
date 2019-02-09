import * as Types from '../src/Types';
import { IDomMethods } from '../src/Dom';

const createDate = (year = 0, month = 0, day = 0) => ({ year, month, day });

const malItem: Types.BaseMALItem = {
    status: 2,
    csrf_token: 'csrfToken',
    score: 10,
    finish_date_string: '01-01-99',
    start_date_string: '01-01-99',
    priority_string: '0',
    comments: 'comments',
};

const malAnime = {
    ...malItem,
    anime_id: 1,
    num_watched_episodes: 12,
    anime_airing_status: 2,
    anime_num_episodes: 12,
} as Types.MALLoadAnime;

const malManga = {
    ...malItem,
    manga_id: 2,
    manga_num_chapters: 12,
    manga_num_volumes: 2,
    num_read_chapters: 12,
    num_read_volumes: 2,
    manga_publishing_status: 0,
} as Types.MALLoadManga;

export const createFakeMALAnime = (data: any = {}) =>
    ({ ...malAnime, ...data });
export const createFakeMALManga = (data: any = {}) =>
    ({ ...malManga, ...data });

const alAnime: Types.FormattedEntry = {
    status: 'COMPLETED',
    score: 10,
    progress: 12,
    progressVolumes: 0,
    startedAt: createDate(99, 1, 1),
    completedAt: createDate(99, 1, 1),
    repeat: 1,
    id: malAnime.anime_id,
    title: 'title',
    type: 'anime'
};

const alManga: Types.FormattedEntry = {
    status: 'COMPLETED',
    score: 10,
    progress: 12,
    progressVolumes: 2,
    startedAt: createDate(99, 1, 1),
    completedAt: createDate(99, 1, 1),
    repeat: 1,
    id: malManga.manga_id,
    title: 'title',
    type: 'manga'
};

export const createFakeAnilistAnime = (data: any = {}): Types.FormattedEntry =>
    ({ ...alAnime, ...data });
export const createFakeAnilistManga = (data: any = {}): Types.FormattedEntry =>
    ({ ...alManga, ...data });

export const createFakeDomMethods = (dateSetting = 'a'): IDomMethods => ({
    addDropDownItem: jest.fn(),
    addImportForm: (syncFn: Function) => jest.fn(),
    getDateSetting: jest.fn().mockImplementation().mockReturnValue(dateSetting),
    getCSRFToken: () => 'csrfToken',
    getMALUsername: () => 'malUsername',
    getAnilistUsername: () => 'anilistUsername'
});