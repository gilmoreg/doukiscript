// ==UserScript== 
// @name Douki
// @namespace http://gilmoreg.com
// @description Import Anime and Manga Lists from Anilist 
// @include https://www.myanimelist.net/* 
// ==/UserScript==


// <div class="header-menu-dropdown header-profile-dropdown arrow_box" style="display: block;"><ul><li><a href="https://myanimelist.net/profile/solitethos">Profile</a></li><li class="clearfix"><a href="https://myanimelist.net/myfriends.php">Friends</a></li><li class="clearfix"><a href="/clubs.php?action=invitations" title="You have a club invitation." class="fl-r link-count">(1)</a><a href="https://myanimelist.net/clubs.php?action=myclubs">Clubs</a></li><li><a href="https://myanimelist.net/blog/solitethos">Blog Posts</a></li><li><a href="https://myanimelist.net/myreviews.php">Reviews</a></li><li><a href="https://myanimelist.net/myrecommendations.php">Recommendations</a></li><li><a href="https://myanimelist.net/store/bookshelf"><i class="fa fa-book mr4"></i>Bookshelf</a></li><li><a href="https://myanimelist.net/editprofile.php?go=myoptions"><i class="fa fa-cog mr4"></i>Account Settings</a></li><li><form action="https://myanimelist.net/logout.php" method="post"><a href="javascript:void(0);" onclick="$(this).parent().submit();"><i class="fa fa-sign-out mr4"></i>Logout</a></form></li></ul></div>

const selector = '.header-menu-dropdown > ul > li:last-child';
const html = '<li><button>Import from Anilist</button></li>';

const dropdown = document.querySelector(selector);
dropdown.insertAdjacentHTML('afterend', html);
