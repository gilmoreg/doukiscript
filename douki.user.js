// ==UserScript==
// @name Douki
// @namespace http://gilmoreg.com
// @description Import Anime and Manga Lists from Anilist
// @include https://myanimelist.net/*
// ==/UserScript==

const addImportForm = () => {
  const html = `
   <h1 class="h1">Import From Anilist</h1>
   <form id="douki-anilist-import">
      <ul style="list-style: none;">
        <li>
          <label>
              Username: <input type="text" id="douki-anilist-username" />
          </label>
        </li>
        <li>
          <label>
              Full Sync: <input type="checkbox" id="douki-fullsync" />
          </label>
        </li>
        <li>
          <label>
              Sync on Page Load: <input type="checkbox" id="douki-sync-pageload" />
          </label>
        </li>
        <li>
          <button id="douki-import">Import</button>
        </li>
      </ul>
   </form>
`;

  const element = document.querySelector('#content');
  element.insertAdjacentHTML('afterend', html);
  const importButton = document.querySelector('#douki-import');
  importButton.addEventListener('click', function (e) {
    e.preventDefault();
    console.log('importing from anilist');
    const csrfToken = document.querySelector('meta[name~="csrf_token"]').getAttribute("content");
    fetch('/ownlist/anime/edit.json', {
        method: 'post',
        body: JSON.stringify({
          csrf_token: csrfToken,
          anime_id: 36904,
          num_watched_episodes: 9,
          status: 1,
        })
      })
      .then((res) => res.json())
      .then((res) => console.log(res))
      .catch(err => console.error(err));
  });
};

const anilistSync = () => {
  const config = JSON.parse(localStorage.getItem('douki-settings'));
  if (!config && window.location.pathname !== '/import.php') {
    window.location.replace('https://myanimelist.net/import.php');
  }
};

(function () {
  'use strict';
  const selector = '.header-menu-dropdown > ul > li:last-child';
  const dropdown = document.querySelector(selector);
  if (dropdown) {
    const html = '<li><a aria-role="button" id="douki-sync">Import from Anilist</a></li>';
    dropdown.insertAdjacentHTML('afterend', html);
    const link = document.querySelector('#douki-sync');
    link.addEventListener('click', function (e) {
      e.preventDefault();
      anilistSync();
    });
  }

  if (window.location.pathname === '/import.php') {
    addImportForm();
  }
})();
