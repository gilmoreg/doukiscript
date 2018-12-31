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

export interface MALFormData {
    csrf_token: string
    submitIt: number
    [key: string]: any
}

export interface MALAnimeFormData extends MALFormData {
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
    astatus: number
}

export interface MALMangaFormData extends MALFormData {
    entry_id: number // NOT SURE WHAT THIS DOES, SEEMS TO BE 0 - could be volume in set
    manga_id: number
    'add_manga[status]': number
    'add_manga[num_read_volumes]': number
    last_completed_vol: number
    'add_manga[num_read_chapters]': number
    'add_manga[score]': number
    'add_manga[start_date][month]': number
    'add_manga[start_date][day]': number
    'add_manga[start_date][year]': number
    'add_manga[finish_date][month]': number
    'add_manga[finish_date][day]': number
    'add_manga[finish_date][year]': number
    'add_manga[tags]': string
    'add_manga[priority]': number
    'add_manga[storage_type]': number
    'add_manga[num_retail_volumes]': number
    'add_manga[num_read_times]': number
    'add_manga[reread_value]': number
    'add_manga[comments]': string
    'add_manga[is_asked_to_discuss]': number
    'add_manga[sns_post_type]': number
}