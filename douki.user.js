// ==UserScript==
// @name Douki
// @namespace http://gilmoreg.com
// @description Import Anime and Manga Lists from Anilist
// @include https://myanimelist.net/*
// ==/UserScript==

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
