// ==UserScript==
// @name Douki
// @namespace http://gilmoreg.com
// @description Import Anime and Manga Lists from Anilist
// @include https://myanimelist.net/*
// ==/UserScript==

const Anilist = (() => {
  /*
    Anilist response takes the following form:
    data: {
      anime: {
        lists: [
          { entries: [] },
          { entries: [] },
          etc.
        },
      },
      manga: {
        lists: [
          { entries: [] },
          { entries: [] },
          etc.
        },
      }
    }
    'data' is stripped off by the fetch function, and flatten() is called once for
    anime and once for manga
    flatten() combines the lists (completed, planning, all custom lists, etc)
    and creates one big flat array of items
  */
  const flatten = obj =>
    // Outer reduce concats arrays built by inner reduce
    Object.keys(obj).reduce((accumulator, list) =>
      // Inner reduce builds an array out of the lists
      accumulator.concat(Object.keys(obj[list]).reduce((acc2, item) =>
        acc2.concat(obj[list][item]), [])), []);

  // Remove duplicates from array
  const uniqify = (arr) => {
    const seen = new Set();
    return arr.filter(item => (seen.has(item.media.idMal) ? false : seen.add(item.media.idMal)));
  };

  const anilistCall = (query, variables) =>
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

  const fetchList = userName =>
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

  const sanitize = (item, type) => ({
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
      day: item.completedAt.day || 0,
    },
    repeat: item.repeat,
    status: item.status,
    score: item.score,
    id: item.media.idMal,
    title: item.media.title.romaji,
  });

  return {
    getList: username =>
      fetchList(username)
      .then(lists => [
        ...lists.anime.map(item => sanitize(item, 'anime')).filter(item => item.id),
        ...lists.manga.map(item => sanitize(item, 'manga')).filter(item => item.id),
      ])
      .catch((err) => {
        console.error('Anilist getList error', err);
        return `No data found for user ${username}`;
      }),
  };
})();

const getMALList = (username) =>
  fetch(`https://myanimelist.net/animelist/${username}/load.json`).then(res => res.json());

const malCall = (type, action, data, csrf_token) =>
  fetch(`/ownlist/${type}/${action}.json`, {
    method: 'post',
    body: JSON.stringify(Object.assign(data, {
      csrf_token
    }))
  })
  .then((res) => res.json());

const editAnime = (data, csrf_token) => malCall('anime', 'edit', data, csrf_token);
const addAnime = (data, csrf_token) => malCall('anime', 'add', data, csrf_token);
const editManga = (data, csrf_token) => malCall('manga', 'edit', data, csrf_token);
const addManga = (data, csrf_token) => malCall('manga', 'add', data, csrf_token);

const getStatus = (status) => {
  // MAL status: 1/watching, 2/completed, 3/onhold, 4/dropped, 6/plantowatch
  switch (status.trim()) {
    case 'CURRENT':
      return 1;
    case 'COMPLETED':
      return 2;
    case 'PAUSED':
      return 3;
    case 'DROPPED':
      return 4;
    case 'PLANNING':
      return 6;
    default:
      throw new Error(`unknown status "${status}"`);
  }
};

const createMALData = (anilistData) => {
  const result = {
    anime_id: anilistData.id,
    status: getStatus(anilistData.status),
    score: anilistData.score || 0,
    num_watched_episodes: anilistData.progress || 0,
    num_watched_times: anilistData.rewatched || 0,
    num_watched_times: anilistData.rewatched || 0
  };
  if (anilistData.startedAt) {
    result.start_date = {
      year: anilistData.startedAt.year || 0,
      month: anilistData.startedAt.month || 0,
      day: anilistData.startedAt.day || 0
    }
  }
  if (anilistData.completedAt) {
    result.finish_date = {
      year: anilistData.completedAt.year || 0,
      month: anilistData.completedAt.month || 0,
      day: anilistData.completedAt.day || 0
    }
  }
  return result;
};


const anilistSync = async () => {
  const csrfToken = document.querySelector('meta[name~="csrf_token"]').getAttribute("content");
  const anilistUser = document.querySelector('#douki-anilist-username').value;
  const malUsername = document.querySelector('.header-profile-link').innerText;
  const malList = await jikanGetList(malUsername);
  const list = await Anilist.getList(anilistUser);
  console.log(malList);
  const test = list[700];
  console.log(test);
  const result = await editAnime(createMALData(test), csrfToken);

  const log = document.querySelector('#douki-sync-log');
  log.innerHTML += `<li>${test.title}</li>`;
};

const addImportForm = () => {
  const html = `
   <div>
     <h1 class="h1">Import From Anilist</h1>
     <form id="douki-anilist-import" style="padding: 5px 0px 10px 0px">
       <p style="margin: 10px"><label>Anilist Username: <input type="text" id="douki-anilist-username" /></label></p>
       <p style="margin: 10px"><button id="douki-import">Import</button></p>
     </form>
     <br />
     <ul id="douki-sync-log" style="list-type: none;"></ul>
   </div>
`;

  const element = document.querySelector('#content');
  element.insertAdjacentHTML('afterend', html);
  const importButton = document.querySelector('#douki-import');
  importButton.addEventListener('click', function (e) {
    e.preventDefault();
    anilistSync();
  });
  const textBox = document.querySelector('#douki-anilist-username');
  textBox.addEventListener('change', function (e) {
    localStorage.setItem('douki-settings', JSON.stringify(e.target.value));
  });
  const username = JSON.parse(localStorage.getItem('douki-settings'));
  if (username) {
    textBox.value = username;
  }
};

const addDropDownItem = () => {
  const selector = '.header-menu-dropdown > ul > li:last-child';
  const dropdown = document.querySelector(selector);
  if (dropdown) {
    const html = '<li><a aria-role="button" id="douki-sync">Import from Anilist</a></li>';
    dropdown.insertAdjacentHTML('afterend', html);
    const link = document.querySelector('#douki-sync');
    link.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.replace('https://myanimelist.net/import.php');
    });
  }
};

(function () {
  'use strict';
  addDropDownItem();

  if (window.location.pathname === '/import.php') {
    addImportForm();
  }
})();

/*
ADD
fetch("https://myanimelist.net/ownlist/anime/add.json",
  {
    "credentials":"include",
    "headers":{},
    "referrer":"https://myanimelist.net/addtolist.php?hidenav=1",
    "referrerPolicy":"no-referrer-when-downgrade",
    "body":"
      {\"anime_id\":34577,
      \"status\":1,
      \"score\":0,
      \"num_watched_episodes\":0,
      \"storage_value\":0,
      \"storage_type\":0,
      \"start_date\":{\"year\":0,\"month\":0,\"day\":0},
      \"finish_date\":{\"year\":0,\"month\":0,\"day\":0},
      \"num_watched_times\":0,
      \"rewatch_value\":0,
      \"csrf_token\":\"c53ffebe02a2e5f7cc08224528a1c48708bc1167\"
    }",
    "method":"POST",
    "mode":"cors"
  });
IMPORT

a
anime_airing_status: 2
anime_end_date_string: "04-24-99"
anime_id: 1
anime_image_path: "https://myanimelist.cdn-dena.com/r/96x136/images/anime/4/19644.jpg?s=58990770819ae823d1cdf8af63383b96"
anime_licensors: null
anime_media_type_string: "TV"
anime_mpaa_rating_string: "R"
anime_num_episodes: 26
anime_season: null
anime_start_date_string: "04-03-98"
anime_studios: null
anime_title: "Cowboy Bebop"
anime_url: "/anime/1/Cowboy_Bebop"
days_string: null
finish_date_string: null
has_episode_video: true
has_promotion_video: true
has_video: true
is_added_to_list: true
is_rewatching: 0
num_watched_episodes: 26
priority_string: null
score: 10
start_date_string: null
status: 2
storage_string: ""
tags: ""
video_url: "/anime/1/Cowboy_Bebop/video"
__proto__: Object
b
anime_id: 1
finish_date: {year: 0, month: 0, day: 0}
num_watched_episodes: 26
num_watched_times: 0
score: 10
start_date: {year: 0, month: 0, day: 0}
status: 2
__proto__: Object
*/
