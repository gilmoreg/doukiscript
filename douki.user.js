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

const editAnime = (anime, csrf_token) =>
  fetch('/ownlist/anime/edit.json', {
    method: 'post',
    body: JSON.stringify(Object.assign(anime, {
      csrf_token
    }))
  })
  .then((res) => res.json());

const fakeXml = `
<?xml version="1.0" encoding="UTF-8" ?>
  <myinfo>
    <user_id>5263009</user_id>
    <user_name>solitethos</user_name>
    <user_export_type>1</user_export_type>
    <user_total_anime>671</user_total_anime>
    <user_total_watching>26</user_total_watching>
    <user_total_completed>413</user_total_completed>
    <user_total_onhold>19</user_total_onhold>
    <user_total_dropped>83</user_total_dropped>
    <user_total_plantowatch>130</user_total_plantowatch>
  </myinfo>

  <myanimelist>
    <anime>
      <series_animedb_id>36904</series_animedb_id>
      <series_title><![CDATA[Aggressive Retsuko (ONA)]]></series_title>
      <series_type>ONA</series_type>
      <series_episodes>10</series_episodes>
      <my_id>0</my_id>
      <my_watched_episodes>10</my_watched_episodes>
      <my_start_date>2018-05-04</my_start_date>
      <my_finish_date>0000-00-00</my_finish_date>
      <my_rated></my_rated>
      <my_score>0</my_score>
      <my_dvd></my_dvd>
      <my_storage></my_storage>
      <my_status>Watching</my_status>
      <my_comments><![CDATA[]]></my_comments>
      <my_times_watched>0</my_times_watched>
      <my_rewatch_value></my_rewatch_value>
      <my_tags><![CDATA[]]></my_tags>
      <my_rewatching>0</my_rewatching>
      <my_rewatching_ep>0</my_rewatching_ep>
      <update_on_import>1</update_on_import>
    </anime>
  </myanimelist>
`;

const uploadTest = () => {
  const csrfToken = document.querySelector('meta[name~="csrf_token"]').getAttribute("content");
  const formData = new FormData();
  const blob = new Blob([fakeXml], {
    type: 'text/xml'
  });
  formData.append('importtype', '3');
  formData.append('file', new Blob([], {
    type: 'application/octet-stream'
  }), '');
  formData.append('mal', blob, 'sample.xml');
  formData.append('subimport', 'Import Data');
  formData.append('csrf_token', csrfToken);
  return fetch('/import.php', {
      method: 'post',
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      },
      mode: 'cors',
      body: formData,
    })
    .then((res) => res.text());
}

const anilistSync = async () => {
  const csrfToken = document.querySelector('meta[name~="csrf_token"]').getAttribute("content");
  // const anilistUser = document.querySelector('#douki-anilist-username').value;
  // const list = await Anilist.getList(anilistUser);
  // console.log(list);
  const test = await uploadTest();
  console.log(test);
};

const addImportForm = () => {
  const html = `
   <div>
     <h1 class="h1">Import From Anilist</h1>
     <form id="douki-anilist-import" style="padding: 5px 0px 10px 0px">
       <p style="margin: 10px"><label>Anilist Username: <input type="text" id="douki-anilist-username" /></label></p>
       <p style="margin: 10px"><button id="douki-import">Import</button></p>
     </form>
   </div>
`;

  const element = document.querySelector('#content');
  element.insertAdjacentHTML('afterend', html);
  const importButton = document.querySelector('#douki-import');
  importButton.addEventListener('click', function (e) {
    e.preventDefault();
    anilistSync();
  });
  const config = JSON.parse(localStorage.getItem('douki-settings'));
  if (config && config.username) {
    const textBox = document.querySelector('#douki-anilist-username');
    textBox.value = config.username;
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
fetch("https://myanimelist.net/ownlist/anime/add.json", {"credentials":"include","headers":{},"referrer":"https://myanimelist.net/addtolist.php?hidenav=1","referrerPolicy":"no-referrer-when-downgrade","body":"{\"anime_id\":34577,\"status\":1,\"score\":0,\"num_watched_episodes\":0,\"storage_value\":0,\"storage_type\":0,\"start_date\":{\"year\":0,\"month\":0,\"day\":0},\"finish_date\":{\"year\":0,\"month\":0,\"day\":0},\"num_watched_times\":0,\"rewatch_value\":0,\"csrf_token\":\"c53ffebe02a2e5f7cc08224528a1c48708bc1167\"}","method":"POST","mode":"cors"});
IMPORT
*/
