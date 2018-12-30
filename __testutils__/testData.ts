import * as Types from '../src/Types';

const createDate = (year = 0, month = 0, day = 0) => ({ year, month, day });

const baseMalItem = (): Types.BaseMALItem => ({
    status: 0,
    csrf_token: 'csrfToken',
    score: 10,
    finish_date: createDate(),
    start_date: createDate(),
});

export const completedAnime: Types.MALAnime = {
    ...baseMalItem(),
    status: 2,
    anime_id: 1,
    num_watched_times: 1,
    num_watched_episodes: 12,
};

export const completedAnilistAnime: Types.FormattedEntry = {
    status: 'COMPLETED',
    score: 10,
    progress: 12,
    progressVolumes: 0,
    startedAt: createDate(),
    completedAt: createDate(),
    repeat: 1,
    type: 'anime',
    id: 1,
    title: 'title',
};