// Mounts the header band, menu panel, search, footer and spinning badge, and hooks up the original interaction responses — hamburger and search only change classes (.3s is in css),
// Scroll even 1px and the header band sticks as a white bar, same-page links use jQuery animate 500ms swing, and the footer photo strip is infiniteslide 70px/s (never stops)
(() => {
  const $ = window.jQuery;
  const search = '<svg class="ld-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="m15 15 5 5" stroke="currentColor" stroke-width="2"/></svg>';
  const arrow = '<span class="ld-arrow"><svg viewBox="0 0 10 7" aria-hidden="true"><path d="M0 3.5h9M6 .5l3 3-3 3" fill="none" stroke="currentColor"/></svg></span>';
  const logo = '<svg class="ld-logo" viewBox="0 0 120 48" aria-hidden="true"><path d="M8 5 5 40l23-3M30 41 46 6l14 34M37 28l18-2M66 40l2-33 20 30 2-32M98 7l-2 33c16 1 22-8 21-18-1-9-8-15-19-15Z" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const cats = [...document.querySelectorAll(".article__slide > li")].map((li) => li.innerHTML).join("") ||
    ["Fashion", "Foodie spot", "Day", "Art & Events", "Hobby", "Home & Interior", "Shopping", "Travel"].map((t) => `<a href="#"><span class="article__img"></span>${t}</a>`).join("");

  const hd = document.querySelector("[data-site-header]");
  if (hd) hd.outerHTML = `<header class="header" data-slot="header">
  <div class="header__wrapper">
    <div class="header__searchOpen"><div class="header__searchOpenWrap"><input type="search" placeholder="SEARCH KEYWORDS" aria-label="Search term"><button type="button" aria-label="Find">${search}</button></div><button class="header__searchClose" type="button" aria-label="Close search"></button></div>
    <button class="ham" type="button" aria-label="Menu"><span></span><span></span></button>
    <div class="header__logo"><a href="index.html" aria-label="Back to start">${logo}</a></div>
    <button class="header__search" type="button" aria-label="Search">${search}</button>
    <div class="header__cate"><ul>${["Fashion", "Foodie spot", "Day", "Art & Events", "Hobby", "Home & Interior", "Shopping", "Travel"].map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul></div>
    <div class="header__overlay"></div>
    <div class="header__navWrap" data-slot="menu-panel"><div class="header__navScroll">
      <div class="header__navSearch"><input type="search" placeholder="SEARCH KEYWORDS" aria-label="Search term"><button type="button" aria-label="Find">${search}</button></div>
      <nav class="header__nav"><ul>${cats.split("</li>").join("")}</ul></nav>
      <div class="header__nav2"><h2 class="ld-title sml"><span class="en">REGULARS</span><span class="ja">Series list</span></h2><ul>
        <li><a href="#"><span class="wf-img" data-label="Series logo 1"></span>Your first series name{arrow}</a></li>
        <li><a href="#"><span class="wf-img" data-label="Series logo 2"></span>Your slightly long series name${arrow}</a></li>
        <li><a href="#"><span class="wf-img" data-label="Series logo 3"></span>Your series name$ here{arrow}</a></li>
        <li><a href="#"><span class="wf-img" data-label="Series logo 4"></span>Your fourth series name{arrow}</a></li>
      </ul></div>
      <div class="header__sns"><div class="about-us__sns"><a class="about-us__snsLine" href="#"><span class="ld-title is-left sml"><span class="en">FOLLOW US</span><span class="ja">Our official SNS is here</span></span><span class="sns"><span class="sns__btn"><svg class="ld-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg><span>Instagram</span></span><span class="sns__btn"><svg class="ld-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 11.2c-.3-2.6-2-3.9-4.4-3.9-2 0-3.4 1-4 2.6M8 12.2c0 2.5 1.7 4 4 4 2.6 0 4.2-1.6 4.2-4.6 0-3.6-2.4-7.6-7-7.6C5.5 4 3.5 7 3.5 12s2.4 8 8.4 8c3.6 0 6-1.6 7-4.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>Threads</span></span></span></a><a class="about-us__snsRgt" href="#"><span class="about-us__snsInner"><span class="about-us__snsJoin"><span class="ld-title is-left sml"><span class="en">JOIN US !</span><span class="ja">Official supporters here</span></span><span class="ld-arrow"><svg viewBox="0 0 10 7" aria-hidden="true"><path d="M0 3.5h9M6 .5l3 3-3 3" fill="none" stroke="currentColor"/></svg></span></span><span class="about-us__snsText">Your four or so lines here announcing recruitment of Supporters who will find the town’s next step together with the editorial team. Add a sentence saying you can talk directly with the editorial team on the official messenger.</span></span></a></div></div>
    </div></div>
  </div>
</header>`;
  const header = document.querySelector(".header");
  // The menu panel’s category groups unpack the band’s li, so wrap them in li again
  document.querySelectorAll(".header__nav ul > a").forEach((a) => { const li = document.createElement("li"); a.replaceWith(li); li.append(a); });

  const ft = document.querySelector("[data-site-footer]");
  if (ft) {
    const shots = ["Hand flipping through a record crate · dark shop · portrait", "Shelf lined with wooden dolls · yellow lighting · portrait", "Hand holding up a spread-out lettering-print T-shirt · indoor · portrait", "Vintage dish display cabinet · warm lighting · portrait", "Café window seat · evening · portrait", "Alley shop signboard · overcast day · portrait"];
    ft.outerHTML = `<footer class="footer" data-slot="footer">
  <ul class="footer__bgSlide">${shots.map((l) => `<li><span class="wf-img" data-label="${l}"></span></li>`).join("")}</ul>
  <span class="footer__veil"></span>
  <a class="footer__logo" href="#top" aria-label="Back to top">${logo}</a>
  <p class="footer__copy" data-label="Your magazine’s English name here">© Magazine Name</p>
</footer>
<div class="podcastBtn" data-slot="circle-badge"><a class="circle-btn" href="#" aria-label="Listen to radio"><svg class="circle-btn__svg" viewBox="0 0 140 140" aria-hidden="true"><defs><path id="ld-ring" d="M70 70m-58 0a58 58 0 1 1 116 0a58 58 0 1 1-116 0"/></defs><text class="top-text"><textPath href="#ld-ring">Your radio name here · On air monthly · Your radio name here ·</textPath></text></svg><span class="circle-btn__logo">Radio<br>Logo</span></a></div>`;
  }

  if (!$) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $body = $("body");
  $(".ham").on("click", function () {
    $(".header__searchOpen").removeClass("open"); $body.removeClass("search-open");
    $(this).toggleClass("open"); $(".header__navWrap").toggleClass("panelactive"); $body.toggleClass("menu-open");
  });
  $(".header__overlay").on("click", () => { $(".ham").removeClass("open"); $(".header__navWrap").removeClass("panelactive"); $body.removeClass("menu-open"); });
  $(".header__search").on("click", () => {
    $(".ham").removeClass("open"); $(".header__navWrap").removeClass("panelactive"); $body.removeClass("menu-open");
    $body.toggleClass("search-open");
  });
  $(".header__searchClose").on("click", () => $body.removeClass("search-open"));
  $(window).on("scroll", function () { $(".header").toggleClass("header__fixed", $(this).scrollTop() > 0); });
  $('a[href^="#"]').on("click", function () {
    const href = $(this).attr("href");
    if (href === "#" ) return false;
    const $t = $(href === "#top" ? "html" : href);
    if (!$t.length) return false;
    const pos = href === "#top" ? 0 : $t.offset().top - $("header").outerHeight();
    $("body,html").animate({ scrollTop: pos }, reduce ? 0 : 500, "swing");
    return false;
  });
  $(function () {
    $(".creators__profile").matchHeight();
    $(".archive__itemTtl").matchHeight();
    if (!reduce && $.fn.infiniteslide) $(".footer__bgSlide").infiniteslide({ speed: 70, clone: 20, pauseonhover: false });
    else $(".footer__bgSlide").css({ display: "flex" });
  });
})();
