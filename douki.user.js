// ==UserScript==
// @name Douki
// @namespace http://gilmoreg.com
// @description Import Anime and Manga Lists from Anilist (see https://anilist.co/forum/thread/2654 for more info)
// @include https://myanimelist.net/*
// @version 0.1.4
// ==/UserScript==

// Utility Functions
const logMessage = (msg) =>
  document.querySelector('#douki-sync-log').innerHTML += `<li>${msg}</li>`;

const clearLog = () =>
  document.querySelector('#douki-sync-log').innerHTML = '';

const sleep = (ms) => new Promise(resolve => setTimeout(() => resolve(), ms));

const flatten = obj =>
  // Outer reduce concats arrays built by inner reduce
  Object.keys(obj).reduce((accumulator, list) =>
    // Inner reduce builds an array out of the lists
    accumulator.concat(Object.keys(obj[list]).reduce((acc2, item) =>
      acc2.concat(obj[list][item]), [])), []);

const uniqify = (arr) => {
  const seen = new Set();
  return arr.filter(item => (seen.has(item.media.idMal) ? false : seen.add(item.media.idMal)));
};

// Anilist Functions
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

const getAnilistList = username =>
  fetchList(username)
  .then(lists => ({
    anime: lists.anime.map(item => sanitize(item, 'anime')).filter(item => item.id),
    manga: lists.manga.map(item => sanitize(item, 'manga')).filter(item => item.id),
  }))
  .catch((err) => {
    console.error('Anilist getList error', err);
    return `No data found for user ${username}`;
  });

// MAL Functions
const getMALList = async (type, username, list = [], page = 1) => {
  const offset = (page - 1) * 300;
  const nextList = await fetch(`https://myanimelist.net/${type}list/${username}/load.json?offset=${offset}`).then(res => res.json());
  if (nextList && nextList.length) {
    await sleep(1000);
    return getMALList(type, username, [...list, ...nextList], page + 1);
  }
  return [...list, ...nextList];
}

const malEdit = (type, data) =>
  fetch(`/ownlist/${type}/edit.json`, {
    method: 'post',
    body: JSON.stringify(data)
  })
  .then((res) => {
    if (res.status === 200) return res;
    throw new Error(JSON.stringify(data));
  });

const malAdd = (type, data) =>
  fetch(`/ownlist/${type}/add.json`, {
    method: 'post',
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest'
    },
    body: JSON.stringify(data)
  })
  .then((res) => {
    if (res.status === 200) return res;
    throw new Error(JSON.stringify(data));
  });

// Use Jikan since MAL doesn't seem to have a GET method for a single item
// Jikan also doesn't return episode counts as a single value except in search results
// Have to take first page of results and hope for a match
const getMALItem = ({
    title,
    id,
    type
  }) =>
  fetch(`https://api.jikan.moe/v3/search/${type}/?q=${encodeURIComponent(title)}&page=1`)
  .then(res => res.json())
  .then(res => res.results && res.results.filter(r => r.mal_id === id))
  .then(res => res && res.length ? res[0] : null);

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
}

// TODO find out if this respects internationalization
const buildDateString = (date) =>
  date.month === 0 && date.day === 0 && date.year === 0 ? null :
  `${String(date.month).length < 2 ? '0' : ''}${date.month}-${String(date.day).length < 2 ? '0' : ''}${date.day}-${date.year ? String(date.year).slice(-2) : 0}`;

const createMALData = async (anilistData, malData, csrf_token) => {
  const status = getStatus(anilistData.status);
  const result = {
    status,
    csrf_token,
    score: anilistData.score || 0,
    finish_date: {
      year: anilistData.completedAt.year || 0,
      month: anilistData.completedAt.month || 0,
      day: anilistData.completedAt.day || 0
    },
    start_date: {
      year: anilistData.startedAt.year || 0,
      month: anilistData.startedAt.month || 0,
      day: anilistData.startedAt.day || 0
    },
  };

  result[`${anilistData.type}_id`] = anilistData.id;

  if (anilistData.repeat) {
    const verb = anilistData.type === 'anime' ? 'watched' : 'read';
    result[`num_${verb}_times`] = anilistData.repeat;
  }

  // If status is COMPLETED (2) use episode, volume, and chapter counts from MAL
  // Otherwise use AL's
  if (status === 2) {
    // Existing item; use MAL's provided counts
    if (malData && Object.keys(malData).length) {
      if (anilistData.type === 'anime') {
        result.num_watched_episodes = malData.anime_num_episodes || 0;
      } else {
        result.num_read_chapters = malData.manga_num_chapters || 0;
        result.num_read_volumes = malData.manga_num_volumes || 0;
      }
      // New item; fetch counts from Jikan
    } else {
      const malItem = await getMALItem(anilistData);
      // If search was unsucessful, the best thing to do is bail and not touch the counts
      if (!malItem) return result;

      if (anilistData.type === 'anime') {
        result.num_watched_episodes = malItem.episodes || 0;
      } else {
        result.num_read_chapters = malItem.chapters || 0;
        result.num_read_volumes = malItem.volumes || 0;
      }
    }
    // Non-completed item; use Anilist's counts
    // Note the possibility that this count could be higher than MAL's max; see if that creates problems
  } else {
    if (anilistData.type === 'anime') {
      result.num_watched_episodes = anilistData.progress || 0;
    } else {
      result.num_read_chapters = anilistData.progress || 0;
      result.num_read_volumes = anilistData.progressVolumes || 0;
    }
  }
  return result;
};

const createMALHashMap = (malList, type) => {
  const hashMap = {};
  malList.forEach(item => {
    hashMap[item[`${type}_id`]] = item;
  });
  return hashMap;
}

const shouldUpdate = (mal, al) =>
  Object.keys(al).some(key => {
    switch (key) {
      case 'csrf_token':
      case 'anime_id':
      case 'manga_id':
        return false;
      case 'start_date':
      case 'finish_date':
        return buildDateString(al[key]) !== mal[`${key}_string`];
      case 'num_read_chapters':
      case 'num_read_volumes':
      case 'num_watched_episodes':
        // Anlist and MAL have different volume, episode, and chapter counts for some media;
        // If the item is marked as completed, ignore differences (Status 2 is COMPLETED)
        {
          if (mal.status === 2) return false;
          return al[key] !== mal[key];
        }
        // In certain cases the next two values will be missing from the MAL data and trying to update them will do nothing.
        // To avoid a meaningless update every time, skip it if undefined on MAL
      case 'num_watched_times':
        {
          if (!mal.hasOwnProperty('num_watched_times')) return false;
          return al[key] !== mal[key];
        }
      case 'num_read_times':
        {
          if (!mal.hasOwnProperty('num_read_times')) return false;
          return al[key] !== mal[key];
        }
      default:
        {
          // Treat falsy values as equivalent (!= doesn't do the trick here)
          if (!mal[key] && !al[key]) return false;
          return al[key] !== mal[key];
        }
    }
  });

const syncList = async (type, list, operation) => {
  let itemCount = 0;
  const logSelector = operation === 'add' ? `#douki-added-${type}-items` : `#douki-updated-${type}-items`;
  const fn = operation === 'add' ? malAdd : malEdit;
  for (let item of list) {
    await sleep(500);
    try {
      await fn(type, item);
      itemCount++;
      document.querySelector(logSelector).innerHTML = itemCount;
    } catch (e) {
      const itemId = item[`${type}_id`];
      logMessage(`Error adding ${type} <a href="https://myanimelist.net/${type}/${itemId}" target="_blank" rel="noopener noreferrer">${itemId}</a>. Try adding it manually.`);
    }
  }
}

const malSync = async (type, malUsername, anilistList, csrfToken) => {
  logMessage(`Fetching MyAnimeList ${type} list...`);
  const malAnimeList = await getMALList(type, malUsername);
  logMessage(`Fetched MyAnimeList ${type} list.`);
  const malHashMap = createMALHashMap(malAnimeList, type);
  const anilistInMalFormat = anilistList.map(async (item) => await createMALData(item, malHashMap[item[`${type}_id`]], csrfToken));
  const addList = anilistInMalFormat.filter(item => !malHashMap[item[`${type}_id`]]);
  const updateList = anilistInMalFormat.filter(item => {
    const malItem = malHashMap[item[`${type}_id`]];
    // Do not try to sync items in the addList
    if (!malItem) return false;
    return shouldUpdate(malItem, item);
  });

  if (addList && addList.length) {
    logMessage(`Added <span id="douki-added-${type}-items">0</span> of ${addList.length} ${type} items.`);
    await syncList(type, addList, 'add');
  }

  if (updateList && updateList.length) {
    logMessage(`Updating <span id="douki-updated-${type}-items">0</span> of ${updateList.length} ${type} items.`);
    await syncList(type, updateList, 'edit');
  }

  logMessage('Import complete.');
};

// Main business logic
const sync = async (e) => {
  e.preventDefault();
  const malUsernameElement = document.querySelector('.header-profile-link');
  if (!malUsernameElement) {
    logMessage('You must be logged in!');
    return;
  }
  console.clear();
  clearLog();
  logMessage(`Fetching data from Anilist...`);
  const anilistUser = document.querySelector('#douki-anilist-username').value;
  const anilistList = await getAnilistList(anilistUser);
  if (!anilistList) {
    logMessage(`No data found for user ${anilistUser}.`);
    return;
  }
  logMessage(`Fetched Anilist data.`);
  const csrfToken = document.querySelector('meta[name~="csrf_token"]').getAttribute("content");
  const malUsername = malUsernameElement.innerText;

  if (anilistList.anime && anilistList.anime.length) {
    await malSync('anime', malUsername, anilistList.anime, csrfToken);
  }
  if (anilistList.manga && anilistList.manga.length) {
    await malSync('manga', malUsername, anilistList.manga, csrfToken);
  }
}

// DOM functions
const addImportForm = () => {
  if (document.querySelector('#douki-form')) return;
  const html = `
      <div id="douki-form">
        <h1 class="h1">Import From Anilist</h1>
        <div style="padding: 20px">
          <p><strong>NOTICE</strong>: Use this script at your own risk. The author takes no responsibility for any damages of any kind.</p>
          <p>It is <em>highly</em> recommended that you try this script out on a test MAL account before importing to your main account.</p>
          <p>Visit <a href="https://anilist.co/forum/thread/2654" target="_blank" rel="noopener noreferrer">the Anilist thread</a> for this script to ask questions or report problems.</p>
          <p>Please be patient. If the import goes any faster you will be in violation of MyAnimeList's Terms of Service.</p>
        </div>
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
  importButton.addEventListener('click', sync);
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
  if (document.querySelector('#douki-sync')) return;
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

// Entrypoint
(() => {
  'use strict';
  addDropDownItem();

  if (window.location.pathname === '/import.php') {
    addImportForm();
  }
})();
