jest.mock('../src/Dom');
jest.mock('../src/Log');
jest.mock('../src/util');
import { syncType, shouldUpdate, createMALData } from '../src/MAL';
import * as fetchMock from 'fetch-mock';
import * as fakes from '../__testutils__/testData';
import { MALItem } from '../src/Types';

const mockGetMALList = (list: Array<MALItem>) => {
    fetchMock
        .mock(/.+load.json.+/, list, { repeat: 1 })
        .mock(/.+load.json.+/, []);
}

describe('syncType()', () => {
    beforeAll(() => fetchMock.catch(500));
    afterEach(() => fetchMock.restore());

    it('should skip sync when items are the same', async () => {
        mockGetMALList([fakes.createFakeMALAnime()]);
        await syncType('anime', [fakes.createFakeAnilistAnime()], 'test', 'test');
        // Two calls to load list, one to refresh, no calls to edit
        expect(fetchMock.calls().length).toBe(3);
    });

    it('should sync when episode count is different', async () => {
        const malAnime = fakes.createFakeMALAnime({ status: 1, num_watched_episodes: 1 });
        const alAnime = fakes.createFakeAnilistAnime({ status: 'CURRENT', progress: 2 });
        fetchMock
            .once(/.+load.json.+/, [malAnime])
            .once(/.+load.json.+/, [])
            .once(/.+load.json.+/, [malAnime])
            .once(/.+load.json.+/, [])
            .once(/.+edit.json/, {});
        await syncType('anime', [alAnime], 'test', 'test');
        const [url] = fetchMock.calls()[4];
        expect(url).toEqual('https://myanimelist.net/ownlist/anime/edit.json');
    });

    it('should add a new manga', async () => {
        const malManga = fakes.createFakeMALManga();
        const alManga = fakes.createFakeAnilistManga();
        fetchMock
            .once(/.+load.json.+/, [])
            .once(/.+add.json/, {})
            .once(/.+load.json.+/, [malManga])
            .once(/.+load.json.+/, [])
            .once(/.+edit.json/, {});
        await syncType('manga', [alManga], 'test', 'test');
        const [url] = fetchMock.calls()[1];
        expect(url).toEqual('https://myanimelist.net/ownlist/manga/add.json');
    });
});

describe('shouldUpdate()', () => {
    it('should update if the start date is different', () => {
        const malAnime = fakes.createFakeMALAnime({ start_date_string: '2-2-2002' });
        const alAnime = fakes.createFakeAnilistAnime({ startedAt: { year: 2002, month: 1, day: 1 } });
        const alToMal = createMALData(alAnime, malAnime, 'csrfToken');
        const result = shouldUpdate(malAnime, alToMal);
        expect(result).toEqual(true);
    });

    it('should update if the episode count is different and show is incomplete', () => {
        const malAnime = fakes.createFakeMALAnime({ status: 1, num_watched_episodes: 1 });
        const alAnime = fakes.createFakeAnilistAnime({ status: 'CURRENT', proress: 2 });
        const alToMal = createMALData(alAnime, malAnime, 'csrfToken');
        const result = shouldUpdate(malAnime, alToMal);
        expect(result).toEqual(true);
    });

    it('should not update if chapter counts differ but show is complete', () => {
        const malAnime = fakes.createFakeMALAnime({ num_watched_episodes: 1 });
        const alAnime = fakes.createFakeAnilistAnime({ progress: 2 });
        const alToMal = createMALData(alAnime, malAnime, 'csrfToken');
        const result = shouldUpdate(malAnime, alToMal);
        expect(result).toEqual(false);
    });

    /*
        NOTES:

        The start_date vs start_date_string is a pain
        in shouldUpdate() I check for start_date on AL and start_date_string on MAL
        This is all well and good in the end but confusing
    */
});