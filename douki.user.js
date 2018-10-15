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

const sleep = (ms) => new Promise(resolve => setTimeout(() => resolve(), ms));

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
    throw new Error({
      res,
      data
    });
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
    throw new Error({
      res,
      data
    });
  });

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

// TODO find out if this respects internationalization
const buildDateString = (date) =>
  date.month === 0 && date.day === 0 && date.year === 0 ? null :
  `${String(date.month).length < 2 ? '0' : ''}${date.month}-${String(date.day).length < 2 ? '0' : ''}${date.day}-${date.year ? String(date.year).slice(-2) : 0}`;

const createMALData = (anilistData, csrf_token) => {
  const result = {
    status: getStatus(anilistData.status),
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
  if (anilistData.type === 'anime') {
    result.num_watched_episodes = anilistData.progress || 0;
    result.num_watched_times = anilistData.repeat || 0;
    // result.rewatch_value = anilistData.repeat || 0;
  } else {
    result.num_read_chapters = anilistData.progress || 0;
    result.num_read_volumes = anilistData.progressVolumes || 0;
    result.num_read_times = anilistData.repeat || 0;
  }
  result[`${anilistData.type}_id`] = anilistData.id;
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
      default:
        {
          // Treat falsy values as equivalent (!= doesn't do the trick here)
          if (!mal[key] && !al[key]) return false;
          return al[key] !== mal[key];
        }
    }
  });

const anilistSync = async (type, malUsername, anilistList) => {
  logMessage(`Fetching MyAnimeList ${type} list...`);
  const malAnimeList = await getMALList(type, malUsername);
  logMessage(`Fetched MyAnimeList ${type} list.`);
  const malHashMap = createMALHashMap(malAnimeList, type);
  const addList = anilistList.filter(item => !malHashMap[item[`${type}_id`]]);
  const syncList = anilistList.filter(item => {
    const malItem = malHashMap[item[`${type}_id`]];
    // Do not try to sync items in the addList
    if (!malItem) return false;
    return shouldUpdate(malItem, item);
  });

  let addedItems = 0;
  let updatedItems = 0;

  logMessage(`Adding ${addList.length} ${type} items.`);

  for (let item of addList) {
    await sleep(500);
    try {
      await malAdd(type, item);
      addedItems++;
    } catch (e) {
      console.error(JSON.stringify(e));
      const itemId = item[`${type}_id`];
      logMessage(`Error adding ${type} <a href="https://myanimelist.net/${type}/${itemId}>${itemId}</a>. Try adding it manually.`);
    }
  }

  logMessage(`Added ${addedItems} ${type} items`);
  logMessage(`Updating ${syncList.length} ${type} items.`);

  for (let item of syncList) {
    await sleep(500);
    try {
      await malEdit(type, item);
      updatedItems++;
    } catch (e) {
      console.error(JSON.stringify(e));
      const itemId = item[`${type}_id`];
      logMessage(`Error updating ${type} ${itemId}`);
    }
  }
  logMessage(`Updated ${updatedItems} ${type} items`);
  logMessage('Import complete.');
};

const logMessage = (msg) =>
  document.querySelector('#douki-sync-log').innerHTML += `<li>${msg}</li>`;

const clearLog = () =>
  document.querySelector('#douki-sync-log').innerHTML = '';

const sync = async (e) => {
  e.preventDefault();
  console.clear();
  clearLog();
  logMessage(`Fetching data from Anilist...`);
  const anilistUser = document.querySelector('#douki-anilist-username').value;
  const anilistList = await Anilist.getList(anilistUser);
  if (!anilistList || !anilistList.length) {
    logMessage(`No data found for user ${anilistUser}.`);
    return;
  }
  logMessage(`Fetched Anilist data.`);
  const csrfToken = document.querySelector('meta[name~="csrf_token"]').getAttribute("content");
  const anilistInMalFormat = anilistList.map(item => createMALData(item, csrfToken));
  const anilistAnimeList = anilistInMalFormat.filter(item => item.anime_id);
  const anilistMangaList = anilistInMalFormat.filter(item => item.manga_id);
  const malUsername = document.querySelector('.header-profile-link').innerText;

  await anilistSync('anime', malUsername, anilistAnimeList);
  await anilistSync('manga', malUsername, anilistMangaList);
}

const addImportForm = () => {
  const html = `
   <div>
     <h1 class="h1">Import From Anilist</h1>
     <form id="douki-anilist-import" style="padding: 5px 0px 10px 0px">
       <p style="margin: 10px"><label>Anilist Username: <input type="text" id="douki-anilist-username" /></label></p>
       <p style="margin: 10px"><button id="douki-import">Import</button></p>
     </form>
     <br />
     <p>Please be patient. If the import goes any faster MAL will ban you for violating the TOS.</p>
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
