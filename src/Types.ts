export type MediaDate = {
    year: number
    month: number
    day: number
}

interface AnilistBaseEntry {
    status: string
    score: number
    progress: number
    progressVolumes: number
    startedAt: MediaDate
    completedAt: MediaDate
    repeat: number
}

export interface AnilistEntry extends AnilistBaseEntry {
    media: {
        idMal: number
        title: {
            romaji: string
        }
    }
}

export interface MediaList {
    entries: Array<AnilistEntry>
    [key: string]: Array<AnilistEntry>
}

interface MediaListCollection {
    lists: MediaList
}

export interface AnilistResponse {
    anime: MediaListCollection
    manga: MediaListCollection
    [key: string]: MediaListCollection
}

export interface FormattedEntry extends AnilistBaseEntry {
    type: string
    id: number
    title: string
    [key: string]: any
}

export interface FullDataEntry extends FormattedEntry {
    malData: MALItem
}

export interface DoukiAnilistData {
    anime: Array<FormattedEntry>
    manga: Array<FormattedEntry>
}

interface BaseMALItem {
    status: number
    csrf_token: string
    score: number
    finish_date: MediaDate
    start_date: MediaDate
    [key: string]: any
}

interface MALAnime extends BaseMALItem {
    anime_id: number
    num_watched_times: number
    num_watched_episodes: number
}

interface MALManga extends BaseMALItem {
    manga_id: number
    num_read_times: number
    num_read_chapters: number
    num_read_volumes: number
}

export type MALItem = MALAnime | MALManga;

export interface MALHashMap {
    [key: number]: MALItem
}