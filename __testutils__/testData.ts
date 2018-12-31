import * as Types from '../src/Types';

const createDate = (year = 0, month = 0, day = 0) => ({ year, month, day });

const malItem: Types.BaseMALItem = {
    status: 2,
    csrf_token: 'csrfToken',
    score: 10,
    finish_date_string: null,
    start_date_string: null,
};

const malAnime: Types.MALAnime = {
    ...malItem,
    anime_id: 1,
    num_watched_times: 1,
    num_watched_episodes: 12,
};

const malManga: Types.MALManga = {
    ...malItem,
    manga_id: 2,
    num_read_chapters: 12,
    num_read_times: 1,
    num_read_volumes: 1
};

export const createFakeMALAnime = (data: any = {}) =>
    ({ ...malAnime, ...data });
export const createFakeMALManga = (data: any = {}) =>
    ({ ...malManga, ...data });

const alAnime: Types.FormattedEntry = {
    status: 'COMPLETED',
    score: 10,
    progress: 12,
    progressVolumes: 0,
    startedAt: createDate(),
    completedAt: createDate(),
    repeat: 1,
    id: malAnime.anime_id,
    title: 'title',
    type: 'anime'
};

const alManga: Types.FormattedEntry = {
    status: 'COMPLETED',
    score: 10,
    progress: 12,
    progressVolumes: 1,
    startedAt: createDate(),
    completedAt: createDate(),
    repeat: 1,
    id: malManga.manga_id,
    title: 'title',
    type: 'manga'
};

export const createFakeAnilistAnime = (data: any = {}): Types.FormattedEntry =>
    ({ ...alAnime, ...data });
export const createFakeAnilistManga = (data: any = {}): Types.FormattedEntry =>
    ({ ...alManga, ...data });