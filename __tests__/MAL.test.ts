import MAL from '../src/MAL';
import FakeLog from '../__mocks__/Log';
import * as fetchMock from 'fetch-mock';
import * as fakes from '../__testutils__/testData';
import MockMAL from '../__mocks__/MockMAL'

const createFakeMAL = () => new MAL('test', 'csrfToken', new FakeLog(), fakes.createFakeDomMethods());

describe('syncType()', () => {
    beforeAll(() => fetchMock.catch(500));
    afterEach(() => fetchMock.restore());

    it('should skip sync when items are the same', async () => {
        new MockMAL([fakes.createFakeMALAnime()]);
        const mal = new MAL('test', 'csrfToken', new FakeLog(), fakes.createFakeDomMethods());
        await mal.syncType('anime', [fakes.createFakeAnilistAnime()]);
        // Two calls to load list, no refresh, no calls to edit
        expect(fetchMock.calls().length).toBe(2);
    });

    it('should sync when episode count is different', async () => {
        const malAnime = fakes.createFakeMALAnime({ status: 1, num_watched_episodes: 1 });
        const alAnime = fakes.createFakeAnilistAnime({ status: 'CURRENT', progress: 2 });
        const mockMAL = new MockMAL([malAnime]);
        const mal = createFakeMAL();
        await mal.syncType('anime', [alAnime]);
        const [result] = mockMAL.anime;
        expect(result.num_watched_episodes).toEqual(2);
    });

    it('should add a new manga', async () => {
        const malManga = fakes.createFakeMALManga();
        const alManga = fakes.createFakeAnilistManga();
        const mockMAL = new MockMAL();
        const mal = createFakeMAL();
        await mal.syncType('manga', [alManga]);
        const [result] = mockMAL.manga;
        expect(result).toEqual(malManga);
    });

    it('should sync a manga when volume count is different', async () => {
        const malManga = fakes.createFakeMALManga({ status: 1, manga_num_volumes: 2, num_read_volumes: 1 });
        const alManga = fakes.createFakeAnilistManga({ status: 'CURRENT', progressVolumes: 2 });
        const mockMAL = new MockMAL(undefined, [malManga]);
        const mal = createFakeMAL();
        await mal.syncType('manga', [alManga]);
        const [result] = mockMAL.manga;
        expect(result.num_read_volumes).toEqual(2);
    });

    it('should use MAL episode counts for completed shows when AL is higher', async () => {
        // MAL counts this show as having 12 episodes; let's say AL says it has 13
        const alAnime = fakes.createFakeAnilistAnime({ progress: 13 });
        const mockMAL = new MockMAL();
        const mal = createFakeMAL();
        await mal.syncType('anime', [alAnime]);
        const [result] = mockMAL.anime;
        // Should reflect MAL's count, not AL's in the end
        expect(result.num_watched_episodes).toEqual(12);
    });

    it('should use MAL chapter counts for completed manga when AL is higher', async () => {
        // MAL counts this manga as having 12 chapters; let's say AL says it has 13
        const alManga = fakes.createFakeAnilistManga({ progress: 13 });
        const mockMAL = new MockMAL();
        const mal = createFakeMAL();
        await mal.syncType('manga', [alManga]);
        const [result] = mockMAL.manga;
        // Should reflect MAL's count, not AL's in the end
        expect(result.num_read_chapters).toEqual(12);
    });

    it('should use MAL volume counts for completed manga when AL is higher', async () => {
        // MAL counts this manga as having 2 volumes; let's say AL says it has 3
        const alManga = fakes.createFakeAnilistManga({ progressVolumes: 3 });
        const mockMAL = new MockMAL();
        const mal = createFakeMAL();
        await mal.syncType('manga', [alManga]);
        const [result] = mockMAL.manga;
        // Should reflect MAL's count, not AL's in the end
        expect(result.num_read_volumes).toEqual(2);
    });

    it('should use MAL episode count for completed show when AL is lower', async () => {
        // MAL counts this show as having 12 episodes; let's say AL says it has 11
        const alAnime = fakes.createFakeAnilistAnime({ status: 'COMPLETED', progress: 11 });
        const mockMAL = new MockMAL();
        const mal = createFakeMAL();
        await mal.syncType('anime', [alAnime]);
        const [result] = mockMAL.anime;
        // Should reflect MAL's count, not AL's in the end
        expect(result.num_watched_episodes).toEqual(12);
    });

    it('should use MAL chapter counts for completed manga when AL is lower', async () => {
        // MAL counts this manga as having 12 chapters; let's say AL says it has 11
        const alManga = fakes.createFakeAnilistManga({ status: 'COMPLETED', progress: 11 });
        const mockMAL = new MockMAL();
        const mal = createFakeMAL();
        await mal.syncType('manga', [alManga]);
        const [result] = mockMAL.manga;
        // Should reflect MAL's count, not AL's in the end
        expect(result.num_read_chapters).toEqual(12);
    });

    it('should use MAL volume counts for completed manga when AL is lower', async () => {
        // MAL counts this manga as having 2 volumes; let's say AL says it has 1
        const alManga = fakes.createFakeAnilistManga({ status: 'COMPLETED', progressVolumes: 1 });
        const mockMAL = new MockMAL();
        const mal = createFakeMAL();
        await mal.syncType('manga', [alManga]);
        const [result] = mockMAL.manga;
        // Should reflect MAL's count, not AL's in the end
        expect(result.num_read_volumes).toEqual(2);
    });

    it('should use AL count when MAL has 0 episodes', async () => {
        const alAnime = fakes.createFakeAnilistAnime({ id: 3 });
        const mockMAL = new MockMAL();
        const mal = createFakeMAL();
        await mal.syncType('anime', [alAnime]);
        const [result] = mockMAL.anime;
        expect(result.num_watched_episodes).toEqual(12);
    });

    it('should use AL count when MAL has 0 chapters/volumes', async () => {
        const alManga = fakes.createFakeAnilistManga({ id: 4 });
        const mockMAL = new MockMAL();
        const mal = createFakeMAL();
        await mal.syncType('manga', [alManga]);
        const [result] = mockMAL.manga;
        expect(result.num_read_chapters).toEqual(12);
        expect(result.num_read_volumes).toEqual(2);
    });
});
