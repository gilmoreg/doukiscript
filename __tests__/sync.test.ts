jest.mock('../src/Dom');
jest.mock('../src/Log');
jest.mock('../src/util');
import { syncType } from '../src/MAL';
import * as fetchMock from 'fetch-mock';
import { completedAnime, completedAnilistAnime } from '../__testutils__/testData';

// jest.useFakeTimers();

describe('Sync', () => {
    beforeAll(() => fetchMock.catch(500));
    afterEach(() => fetchMock.restore());
    it('should sync', async () => {
        fetchMock
            .mock(/.+load.json.+/, [completedAnime], { repeat: 1 })
            .mock(/.+load.json.+/, []);
        try {
            await syncType('anime', [completedAnilistAnime], 'test', 'test');
        } catch (e) {
            console.error(e);
        }
        console.log(fetchMock.calls())
    });
});