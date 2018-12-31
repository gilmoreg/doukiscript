export type MediaDate = {
    year: number
    month: number
    day: number
}

export interface AnilistBaseEntry {
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

export interface BaseMALItem {
    status: number
    csrf_token: string
    score: number
    finish_date_string?: string | null
    start_date_string?: string | null
    finish_date?: MediaDate
    start_date?: MediaDate
    [key: string]: any
}

export interface MALAnime extends BaseMALItem {
    anime_id: number
    num_watched_times: number
    num_watched_episodes: number
    anime_num_episodes?: number
}

export interface MALManga extends BaseMALItem {
    manga_id: number
    num_read_times: number
    num_read_chapters: number
    num_read_volumes: number
    manga_num_chapters?: number
    manga_num_volumes?: number
}

export type MALItem = MALAnime | MALManga;

export interface MALHashMap {
    [key: number]: MALItem
}

export interface MALAnimeFormData {
    'add_anime[comments]': string
    'add_anime[finish_date][day]': number
    'add_anime[finish_date][month]': number
    'add_anime[finish_date][year]': number
    'add_anime[is_asked_to_discuss]': number
    'add_anime[is_rewatching]': number
    'add_anime[num_watched_episodes]': number
    'add_anime[num_watched_times]': number
    'add_anime[priority]': number
    'add_anime[rewatch_value]': number | null
    'add_anime[score]': number
    'add_anime[sns_post_type]': number
    'add_anime[start_date][day]': number
    'add_anime[start_date][month]': number
    'add_anime[start_date][year]': number
    'add_anime[status]': number
    'add_anime[storage_type]': number
    'add_anime[storage_value]': number
    'add_anime[tags]': string
    aeps: number
    anime_id: number
    astatus: number // "2"
    csrf_token: string
    submitIt: number
    [key: string]: any
}