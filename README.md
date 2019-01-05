# Doukiscript

## Disclaimer
Use this script at your own risk! The author assumes no responsibility for any damages of any kind. It is *strongly* recommended you test this out on a throwaway MAL account before attempting to sync your main account.

## WARNING
Using this script will override certain advanced settings for MAL entries:
1. **Storage** will be cleared
2. **Rewatch/Re-read Value** will be cleared (not the number of rewatches, but your "rewatchability" setting from Low to Very High)
3. **Ask to Discuss?** will be set to: *Don't ask to discuss*
4. **Post to SNS** will be set to: *Follow default setting*

**Do not use this script if you care about those settings.** See details under Notes.

## About
So you're an Anilist user (perhaps you came over after MAL melted down) but you still want to keep your MAL page up to date for all your friends who still use it. Douki can sync your Anilist lists to MAL with the click of a button.

Unfortunately, given that MAL shut down its public API over security concerns, the only way to modify a MAL list is from the MAL site itself. Thus, Douki is no longer a standalone web app but a userscript that can run right on MAL and use its API.

## Usage
1. Install a userscript manager ([choose one from this list](https://greasyfork.org/en))
2. Install the script [here](https://greasyfork.org/en/scripts/373467-douki)
3. Visit [the import page on Myanimelist.net](https://myanimelist.net/import.php). *You need to be logged in to MAL.*
4. Alternatively, a link to the import page is added to the List dropdown at the top of the main page
5. Fill in your Anilist username and hit `Import`

## Notes
- The most common source of errors are titles that are not yet approved on Myanimelist. These cannot be added even manually. **Before reporting errors, check to see if you can add an item manually. If you can't add it, neither can Douki.**
- All custom scoring formats on Anilist (1-5, 1-100, stars) will be converted to MAL's 1-10 system. The scores will round down (i.e. a 95 will become a 9). This follows an established community practice.
- Custom lists will be imported into the main MAL list.
- Private lists will be ignored.
- Tags and notes will be ignored. Keeping these consistent across the two sites is too difficult for now. I am open to attempting this in the future, but no promises.
- The reason certain advanced settings have to be overwritten is that this data must be supplied when editing an entry, but due to limitations with how MAL works there is no practical way for the script to know what you have those set to. In lieu of this,  defaults have been chosen. Feedback on the choices is welcome. "Storage" is the one which *might* be possible to implement, but it would be a huge effort and I doubt many people use this setting. Let me know if it is important to you.

Please report issues [on the Anilist forum thread](https://anilist.co/forum/thread/2654). All suggestions, feedback, or bug reports are welcome.
