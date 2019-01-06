import { MALEntryAnime } from '../src/MALEntry';
import * as fakes from '../__testutils__/testData';

const fakeDomMethods = fakes.createFakeDomMethods();

describe('shouldUpdate()', () => {
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