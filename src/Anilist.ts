import * as Log from './Log';

/*
Anilist response is as follows:
data: {
    anime: {
        lists: [
            {
                entries: [
                    {entry}
                ]
            }
        ]
    },
    manga: {
        lists: [
            {
                entries: [
                    {entry}
                ]
            }
        ]
    },
}
*/

type AnilistDate = {
    year: number
    month: number
    day: number
}

type BaseEntry = {
    status: string
    score: number
    progress: number
    progressVolumes: number
    startedAt: AnilistDate
    completedAt: AnilistDate
    repeat: number
}

type Entry = BaseEntry & {
    media: {
        idMal: number
        title: {
            romaji: string
        }
    }
}

type MediaList = {
    entries: Array<Entry>
    [key: string]: Array<Entry>
}

type MediaListCollection = {
    lists: MediaList
}

type AnilistResponse = {
    anime: MediaListCollection
    manga: MediaListCollection
    [key: string]: MediaListCollection
}

type FormattedEntry = BaseEntry & {
    type: string
    id: number
    title: string
}

type DoukiAnilistData = {
    anime: Array<FormattedEntry>
    manga: Array<FormattedEntry>
}

const flatten = (obj: MediaList) =>
    // Outer reduce concats arrays built by inner reduce
    Object.keys(obj).reduce((accumulator, list) =>
        // Inner reduce builds an array out of the lists
        accumulator.concat(Object.keys(obj[list]).reduce((acc2, item) =>
            // @ts-ignore
            acc2.concat(obj[list][item]), [])), []);

const uniqify = (arr: Array<Entry>) => {
    const seen = new Set();
    return arr.filter(item => (seen.has(item.media.idMal) ? false : seen.add(item.media.idMal)));
};

// Anilist Functions
const anilistCall = (query: string, variables: any): Promise<Response> =>
    fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });

const fetchList = (userName: string) =>
    anilistCall(`
      query ($userName: String) {
        anime: MediaListCollection(userName: $userName, type: ANIME) {
          lists {
            entries {
              status
              score(format:POINT_10)
              progress
              startedAt {
                year
                month
                day
              }
              completedAt {
                year
                month
                day
              }
              repeat
              media {
                idMal
                title {
                  romaji
                }
              }
            }
          }
        },
        manga: MediaListCollection(userName: $userName, type: MANGA) {
          lists {
            entries {
              status
              score(format:POINT_10)
              progress
              progressVolumes
              startedAt {
                year
                month
                day
              }
              completedAt {
                year
                month
                day
              }
              repeat
              media {
                idMal
                title {
                  romaji
                }
              }
            }
          }
        }
      }
    `, {
            userName
        })
        .then(res => res.json())
        .then(res => res.data)
        .then(res => ({
            anime: uniqify(flatten(res.anime.lists)),
            manga: uniqify(flatten(res.manga.lists)),
        }));

const sanitize = (item: Entry, type: string): FormattedEntry => ({
    type,
    progress: item.progress,
    progressVolumes: item.progressVolumes,
    startedAt: {
        year: item.startedAt.year || 0,
        month: item.startedAt.month || 0,
        day: item.startedAt.day || 0,
    },
    completedAt: {
        year: item.completedAt.year || 0,
        month: item.completedAt.month || 0,
        day: item.completedAt.day || 0
    },
    repeat: item.repeat,
    status: item.status,
    score: item.score,
    id: item.media.idMal,
    title: item.media.title.romaji
});

const filterNoMalId = (item: FormattedEntry) => {
    if (item.id) return true;
    Log.error(`${item.type}: ${item.title}`);
    return false;
}

export const getAnilistList = (username: string): Promise<DoukiAnilistData> =>
    fetchList(username)
        .then(lists => ({
            anime: lists.anime
                .map(item => sanitize(item, 'anime'))
                .filter(item => filterNoMalId(item)),
            manga: lists.manga
                .map(item => sanitize(item, 'manga'))
                .filter(item => filterNoMalId(item)),
        }));