import { syncType } from '../src/MAL';
import * as fetchMock from 'fetch-mock';
import * as fakes from '../__testutils__/testData';
import { MALLoadItem } from '../src/Types';

const mockGetMALList = (list: Array<MALLoadItem>) => {
    fetchMock
        .mock(/.+load.json.+/, list, { repeat: 1 })
        .mock(/.+load.json.+/, []);
}

describe('syncType()', () => {
    beforeAll(() => fetchMock.catch(500));
    afterEach(() => fetchMock.restore());

    it.only('should skip sync when items are the same', async () => {
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
            .once(/.+edit.+/, {});
        await syncType('anime', [alAnime], 'test', 'test');
        const [url] = fetchMock.calls()[4];
        expect(url).toEqual('https://myanimelist.net/ownlist/anime/1/edit?hideLayout');
    });

    it('should add a new manga', async () => {
        const malManga = fakes.createFakeMALManga();
        const alManga = fakes.createFakeAnilistManga();
        fetchMock
            .once(/.+load.json.+/, [])
            .once(/.+add.json/, {})
            .once(/.+load.json.+/, [malManga])
            .once(/.+load.json.+/, [])
            .once(/.+edit.+/, {});
        await syncType('manga', [alManga], 'test', 'test');
        const [url] = fetchMock.calls()[1];
        expect(url).toEqual('https://myanimelist.net/ownlist/manga/add.json');
    });
});
