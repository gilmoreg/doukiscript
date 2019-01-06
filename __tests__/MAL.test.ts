import MAL from '../src/MAL';
import FakeLog from '../__mocks__/Log';
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

    it('should skip sync when items are the same', async () => {
        mockGetMALList([fakes.createFakeMALAnime()]);
        const mal = new MAL('test', 'csrfToken');
        await mal.syncType('anime', [fakes.createFakeAnilistAnime()]);
        // Two calls to load list, no refresh, no calls to edit
        expect(fetchMock.calls().length).toBe(2);
    });

    it('should sync when episode count is different', async () => {
        const malAnime = fakes.createFakeMALAnime({ status: 1, num_watched_episodes: 1 });
        const alAnime = fakes.createFakeAnilistAnime({ status: 'CURRENT', progress: 2 });
        fetchMock
            .once(/.+load.json.+/, [malAnime])
            .once(/.+load.json.+/, [])
            .once(/.+edit.+/, ' Successfully updated entry ');
        const mal = new MAL('test', 'csrfToken', new FakeLog());
        await mal.syncType('anime', [alAnime]);
        const [url] = fetchMock.calls()[2];
        expect(url).toEqual('https://myanimelist.net/ownlist/anime/1/edit?hideLayout');
    });

    it('should add a new manga', async () => {
        const malManga = fakes.createFakeMALManga();
        const alManga = fakes.createFakeAnilistManga();
        fetchMock
            .once(/.+load.json.+/, [])
            .once(/.+add.json/, {})
            .once(/.+load.json.+/, [malManga])
            .once(/.+load.json.+/, []);
        const mal = new MAL('test', 'csrfToken', new FakeLog());
        await mal.syncType('manga', [alManga]);
        const [url] = fetchMock.calls()[1];
        expect(url).toEqual('https://myanimelist.net/ownlist/manga/add.json');
    });

    it('should sync a manga when volume count is different', async () => {
        const malManga = fakes.createFakeMALManga({ status: 1, manga_num_volumes: 2, num_read_volumes: 1 });
        const alManga = fakes.createFakeAnilistManga({ status: 'CURRENT', progressVolumes: 2 });
        fetchMock
            .once(/.+load.json.+/, [malManga])
            .once(/.+load.json.+/, [])
            .once(/.+edit.+/, ' Successfully updated entry ')
            .once(/.+load.json.+/, [fakes.createFakeMALManga({ num_read_volumes: 2 })])
            .once(/.+load.json.+/, []);
        const mal = new MAL('test', 'csrfToken', new FakeLog());
        await mal.syncType('manga', [alManga]);
        const [url] = fetchMock.calls()[2];
        expect(url).toEqual('https://myanimelist.net/ownlist/manga/2/edit?hideLayout');
    });
});
