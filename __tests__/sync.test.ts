jest.mock('../src/Dom');
jest.mock('../src/Log');
jest.mock('../src/util');
import { syncType } from '../src/MAL';
import * as fetchMock from 'fetch-mock';
import * as fakes from '../__testutils__/testData';
import { MALItem } from '../src/Types';

const mockGetMALList = (list: Array<MALItem>) => {
    fetchMock
        .mock(/.+load.json.+/, list, { repeat: 1 })
        .mock(/.+load.json.+/, []);
}

describe('Sync', () => {
    beforeAll(() => fetchMock.catch(500));
    afterEach(() => fetchMock.restore());
    it('should skip sync when items are the same', async () => {
        mockGetMALList([fakes.createFakeMALAnime()]);
        await syncType('anime', [fakes.createFakeAnilistAnime()], 'test', 'test');
        // Two calls to load list, one to refresh, no calls to edit
        expect(fetchMock.calls().length).toBe(3);
    });

    it('should sync when episode count is different', async () => {
        const malAnime = fakes.createFakeMALAnime({ status: 1, num_episodes_watched: 1 });
        const alAnime = fakes.createFakeAnilistAnime({ status: 'CURRENT', progress: 2 });
        fetchMock
            .once(/.+load.json.+/, [malAnime])
            .once(/.+load.json.+/, [])
            .once(/.+load.json.+/, [malAnime])
            .once(/.+load.json.+/, [])
            .once(/.+edit.json/, {});
        await syncType('anime', [alAnime], 'test', 'test');
        // expect(fetchMock.calls().length).toBe(4);
        const [url, data] = fetchMock.calls()[4];
        expect(url).toEqual('https://myanimelist.net/ownlist/anime/edit.json');
        // @ts-ignore
        expect(data.method).toEqual('post');
    });
});