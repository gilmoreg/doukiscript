import { MALEntryAnime, MALEntryManga } from '../src/MALEntry';
import * as fakes from '../__testutils__/testData';
import { AssertionError } from 'assert';

const fakeDomMethods = fakes.createFakeDomMethods();

const parseFormData = (formData: string) => {
    const result: any = {};
    formData.split('&').forEach(i => {
        const [key, value] = i.split('=');
        result[key] = value;
    });
    return result;
}

describe('shouldUpdate()', () => {
    it('should not update if data is the same', () => {
        const malAnime = fakes.createFakeMALAnime();
        const alAnime = fakes.createFakeAnilistAnime();
        const malEntry = new MALEntryAnime(alAnime, malAnime, 'csrfToken', fakeDomMethods);
        const result = malEntry.shouldUpdate();
        expect(result).toEqual(false);
    });

    it('should update if the start date is different', () => {
        const malAnime = fakes.createFakeMALAnime({ start_date_string: '2-2-2002' });
        const alAnime = fakes.createFakeAnilistAnime({ startedAt: { year: 2002, month: 1, day: 1 } });
        const malEntry = new MALEntryAnime(alAnime, malAnime, 'csrfToken', fakeDomMethods);
        const result = malEntry.shouldUpdate();
        expect(result).toEqual(true);
    });

    it('should update if the episode count is different and show is incomplete', () => {
        const malAnime = fakes.createFakeMALAnime({ status: 1, num_watched_episodes: 1 });
        const alAnime = fakes.createFakeAnilistAnime({ status: 'CURRENT', proress: 2 });
        const malEntry = new MALEntryAnime(alAnime, malAnime, 'csrfToken', fakeDomMethods);
        const result = malEntry.shouldUpdate();
        expect(result).toEqual(true);
    });

    it('should not update if episode counts differ but show is complete', () => {
        const malAnime = fakes.createFakeMALAnime({ num_watched_episodes: 1 });
        const alAnime = fakes.createFakeAnilistAnime({ progress: 2 });
        const malEntry = new MALEntryAnime(alAnime, malAnime, 'csrfToken', fakeDomMethods);
        const result = malEntry.shouldUpdate();
        expect(result).toEqual(false);
    });
});

describe('formData()', () => {
    it('should return default values of correct types for anime', async () => {
        const malAnime = fakes.createFakeMALAnime();
        const alAnime = fakes.createFakeAnilistAnime();
        const malEntry = new MALEntryAnime(alAnime, malAnime, 'csrfToken', fakeDomMethods);
        const result = await malEntry.formData();
        const json = parseFormData(result);
        expect(json).toMatchSnapshot();
        expect(json['add_anime%5Bis_rewatching%5D']).toBeUndefined();
    });

    it('should return default values of correct types for manga', async () => {
        const malManga = fakes.createFakeMALManga();
        const alManga = fakes.createFakeAnilistManga();
        const malEntry = new MALEntryManga(alManga, malManga, 'csrfToken', fakeDomMethods);
        const result = await malEntry.formData();
        const json = parseFormData(result);
        expect(json).toMatchSnapshot();
        expect(json['add_manga%5Bis_rewatching%5D']).toBeUndefined();
    });

    it('should set rewatching for anime', async () => {
        const malAnime = fakes.createFakeMALAnime();
        const alAnime = fakes.createFakeAnilistAnime({ status: 'REPEATING' });
        const malEntry = new MALEntryAnime(alAnime, malAnime, 'csrfToken', fakeDomMethods);
        const result = await malEntry.formData();
        const json = parseFormData(result);
        expect(json['add_anime%5Bis_rewatching%5D']).toEqual('1');
    });

    it('should set rewatching for manga', async () => {
        const malManga = fakes.createFakeMALManga();
        const alManga = fakes.createFakeAnilistManga({ status: 'REPEATING' });;
        const malEntry = new MALEntryManga(alManga, malManga, 'csrfToken', fakeDomMethods);
        const result = await malEntry.formData();
        const json = parseFormData(result);
        expect(json['add_manga%5Bis_rewatching%5D']).toEqual('1');
    });
});

describe('createPostData()', () => {
    it('should use AL data if MAL data is not available for anime', () => {
        const alAnime = fakes.createFakeAnilistAnime();
        // @ts-ignore
        const malEntry = new MALEntryAnime(alAnime, undefined, 'csrfToken', fakeDomMethods);
        expect(malEntry._postData.num_watched_episodes).toEqual(alAnime.progress);
    });

    it('should use AL data if MAL data is not available for manga', () => {
        const alManga = fakes.createFakeAnilistAnime();
        // @ts-ignore
        const malEntry = new MALEntryManga(alManga, undefined, 'csrfToken', fakeDomMethods);
        expect(malEntry._postData.num_read_chapters).toEqual(alManga.progress);
        expect(malEntry._postData.num_read_volumes).toEqual(alManga.progressVolumes);
    });

    it('uses MAL count if AL count is higher for completed manga', () => {
        const malManga = fakes.createFakeMALManga({ manga_num_chapters: 11, manga_num_volumes: 1 });
        const alManga = fakes.createFakeAnilistManga({ progress: 12, progressVolumes: 2 });
        const malEntry = new MALEntryManga(alManga, malManga, 'csrfToken', fakeDomMethods);
        expect(malEntry._postData.num_read_chapters).toEqual(11);
        expect(malEntry._postData.num_read_volumes).toEqual(1);
    });
});