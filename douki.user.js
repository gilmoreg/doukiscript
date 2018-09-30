// ==UserScript==
// @name Douki
// @namespace http://gilmoreg.com
// @description Import Anime and Manga Lists from Anilist
// @include https://myanimelist.net/*
// ==/UserScript==

(function() {
    'use strict';
    const selector = '.header-menu-dropdown > ul > li:last-child';
    const html = '<li><a aria-role="button" id="anilistImport">Import from Anilist</a></li>';

    const dropdown = document.querySelector(selector);
    console.log(dropdown);
    dropdown.insertAdjacentHTML('afterend', html);
    const importButton = document.querySelector('#anilistImport');
    importButton.addEventListener('click', function() {
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
})();
