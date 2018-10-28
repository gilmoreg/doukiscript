# Doukiscript

## Disclaimer
Use this script at your own risk! The author assumes no responsibility for any damages of any kind. It is *strongly* recommended you test this out on a throwaway MAL account before attempting to sync your main account.

## About
So you're an Anilist user (perhaps you came over after MAL melted down) but you still want to keep your MAL page up to date for all your friends who still use it. Douki can sync your Anilist lists to MAL with the click of a button.

Unfortunately, given that MAL shut down its public API over security concerns, the only way to modify a MAL list is from the MAL site itself. Thus, Douki is no longer a standalone web app but a userscript that can run right on MAL and use its API.

## Usage
1. Install a userscript manager ([choose one from this list](https://greasyfork.org/en))
2. Install the script [here](https://greasyfork.org/en/scripts/373467-douki)
3. Visit [the import page on Myanimelist.net](https://myanimelist.net/import.php)
4. Alternatively, a link to the import page is added to the List dropdown at the top of the main page
5. Fill in your Anilist username and hit `Import`

## Notes
- The most common source of errors are titles that are not yet approved on Myanimelist. These cannot be added even manually. **Before reporting errors, check to see if you can add an item manually. If you can't add it, neither can Douki.**
- All custom scoring formats on Anilist (1-5, 1-100, stars) will be converted to MAL's 1-10 system. The scores will round down (i.e. a 95 will become a 9). This follows an established community practice.
- Custom lists will be imported into the main MAL list.
- Private lists will be ignored.
- Tags and notes will be ignored. Keeping these consistent across the two sites is too difficult for now. I am open to attempting this in the future, but no promises.

Please report issues [on the Anilist forum thread](https://anilist.co/forum/thread/2654). All suggestions, feedback, or bug reports are welcome.
