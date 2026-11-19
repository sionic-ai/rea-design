// Just as the original fetches header.html and footer.html and inserts them, the header bar, footer and fixed tab of every page are drawn here in one place.
(() => {
  const ICON = {
    arrow: '<svg viewBox="0 0 10.5 7.4"><path d="M10.35 4.05a.5.5 0 0 0 0-.7L7.17.15a.5.5 0 1 0-.7.7L9.29 3.7 6.46 6.53a.5.5 0 1 0 .71.7zM0 4.2h10v-1H0z"/></svg>',
    blank: '<svg viewBox="0 0 12 12"><path d="M7 0h5v5h-1V1.7L5.35 7.35l-.7-.7L10.3 1H7zM0 2h5v1H1v8h8V7h1v5H0z"/></svg>',
    globe: '<svg viewBox="0 0 46 45"><path d="M23 0a22.5 22.5 0 1 0 0 45 22.5 22.5 0 0 0 0-45zm15.9 13.5h-6.6a35 35 0 0 0-3-9.7 19.6 19.6 0 0 1 9.6 9.7zM23 3c2 2.6 3.6 6.3 4.4 10.5h-8.8C19.4 9.3 21 5.6 23 3zM3.4 26a19.5 19.5 0 0 1 0-7h7.4a43 43 0 0 0 0 7zm1.7 3h6.6a35 35 0 0 0 3 9.7A19.6 19.6 0 0 1 5.1 29zm6.6-15.5H5.1a19.6 19.6 0 0 1 9.6-9.7 35 35 0 0 0-3 9.7zM23 42c-2-2.6-3.6-6.3-4.4-10.5h8.8C26.6 35.7 25 39.4 23 42zm5-13.5H18a40 40 0 0 1 0-10h10a40 40 0 0 1 0 10zm3.3 10.2a35 35 0 0 0 3-9.7h6.6a19.6 19.6 0 0 1-9.6 9.7zM35.2 26a43 43 0 0 0 0-7h7.4a19.5 19.5 0 0 1 0 7z"/></svg>',
    gift: '<svg viewBox="0 0 52 41"><path d="M4 14h44v6H4zm3 6h38v21H7zm17-6h4v27h-4zM26 14c-4-8-14-12-15-6s9 6 15 6zm0 0c4-8 14-12 15-6s-9 6-15 6z"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M14.2 10.2 22.9 0h-2.1l-7.5 8.8L7.3 0H.3l9.1 13.3L.3 24h2.1l8-9.3 6.4 9.3h7zm-2.8 3.3-.9-1.3L3.1 1.6h3.2l5.9 8.5.9 1.3 7.7 11h-3.2z"/></svg>',
    insta: '<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z"/></svg>',
    fb: '<svg viewBox="0 0 24 24"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>',
    mark: '<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="3"/><ellipse cx="13" cy="6" rx="3.2" ry="5"/><ellipse cx="13" cy="20" rx="3.2" ry="5"/><ellipse cx="6" cy="13" rx="5" ry="3.2"/><ellipse cx="20" cy="13" rx="5" ry="3.2"/></svg>'
  };
  const ico = (name, cls = "") => `<i class="kd-ico kd-ico--${name} ${cls}">${ICON[name] || ""}</i>`;
  const plus = '<i class="kd-ico kd-ico--plus"></i>';
  const logo = '<a class="kd-logo" href="index.html" data-label="School logo — flower motif + Korean name + small English name"><span class="kd-logo__mark">' + ICON.mark + '</span><span class="kd-logo__txt"><b>School Name</b><small>UNIVERSITY NAME</small></span></a>';
  window.kdIcon = ico;

  const header = `
<div class="kd-header__bar">
  <p class="kd-header__logo">${logo}</p>
  <button class="kd-header__trigger" type="button" aria-label="Menu"><span></span><span></span><span></span></button>
</div>
<nav class="kd-nav"><div class="kd-nav__inner">
  <ul class="kd-nav__list">
    <li class="kd-nav__item" data-mega>
      <button type="button"><b>ANNIVERSARY WORK</b><span>Memorial project</span>${plus}</button>
      <div class="kd-mega">${plus}<div class="kd-mega__inner">
        <p class="kd-mega__ttl"><a href="service.html">ANNIVERSARY<br>WORK 100<span>Memorial project</span>${ico("arrow")}</a></p>
        <ul class="kd-mega__list">
          <li><a href="service.html">Business Concept${ico("arrow")}</a></li>
          <li><a href="service.html">Message${ico("arrow")}</a></li>
          <li><a href="service.html">Toward the next 100 years${ico("arrow")}</a></li>
          <li><a href="service.html">Commemorative projects list${ico("arrow")}</a></li>
          <li><a href="service.html">Anniversary Newsletter${ico("arrow")}</a></li>
        </ul>
      </div></div>
    </li>
    <li class="kd-nav__item"><a href="about.html"><b>100 YEARS STORY</b><span>100 years of history</span>${ico("arrow")}</a></li>
    <li class="kd-nav__item"><a href="service.html"><b>VOICE OF ALUMNI</b><span>Alumni message</span>${ico("arrow")}</a></li>
    <li class="kd-nav__item"><a href="news.html"><b>NEWS</b><span>News</span>${ico("arrow")}</a></li>
  </ul>
  <a class="kd-header__btn" href="article.html">Fundraiser ended<br>Guide</a>
  <a class="kd-header__btn" href="service.html">Donor list</a>
  <div class="kd-global" data-global>
    <button class="kd-global__btn" type="button"><span>${ico("globe")}GLOBAL</span>${plus}</button>
    <div class="kd-global__list">${plus}<ul><li><a href="#">Language 1${ico("blank")}</a></li><li><a href="#">ENGLISH${ico("blank")}</a></li></ul></div>
  </div>
  <div class="kd-nav__sp"><a class="kd-nav__link" href="#">${ico("gift")}<span>Bequest Info${ico("blank")}</span></a><a href="#">Official school site</a><a href="#">Corporate site</a></div>
</div></nav>`;

  const conversion = `
<aside class="kd-conversion" data-slot="next-100-band"><div class="kd-inner">
  <div class="kd-conversion__top">
    <h2 class="kd-conversion__ttl" data-label="Big English handwriting-style slogan, two lines"><small>To the next</small>100years</h2>
    <dl class="kd-conversion__lead"><dt>And then, next <span>100</span>By year</dt>
      <dd>Your four lines here on the pledge toward the next 100 years.<br>A sentence about creating an environment where students learn freely.<br>Your sentence here about continuing to plan commemorative projects.<br>Your one-line request for sponsorship here.</dd></dl>
  </div>
  <div class="kd-conversion__btns">
    <a href="#">${ico("gift")}<span>Bequest Info${ico("blank")}</span></a>
    <a href="#">${ico("gift")}<span>General donation guide${ico("blank")}</span></a>
  </div>
</div></aside>`;

  const footer = `
<footer class="kd-footer" data-slot="footer"><div class="kd-inner">
  <div class="kd-footer__lt">
    ${logo}
    <p class="kd-footer__txt">Contact point<br>Your department name goes here<br>E-mail : name@example.com</p>
    <ul class="kd-footer__sns"><li><a href="#" aria-label="X">${ICON.x}</a></li><li><a href="#" aria-label="Instagram">${ICON.insta}</a></li><li><a href="#" aria-label="Facebook">${ICON.fb}</a></li></ul>
  </div>
  <nav class="kd-footer__nav">
    <div><div class="kd-footer__link"><a href="index.html">First page${ico("arrow")}</a></div></div>
    <div>
      <div class="kd-footer__link"><a href="service.html">Commemorative project${ico("arrow")}</a>
        <ul><li><a href="service.html">${ico("arrow")}Business Concept</a></li><li><a href="service.html">${ico("arrow")}Message</a></li><li><a href="service.html">${ico("arrow")}Toward the next 100 years</a></li><li><a href="service.html">${ico("arrow")}Commemorative Projects List</a></li><li><a href="service.html">${ico("arrow")}Anniversary newsletter</a></li></ul></div>
      <div class="kd-footer__link"><a href="about.html">100 years of history${ico("arrow")}</a></div>
      <div class="kd-footer__link"><a href="service.html">Alumni message${ico("arrow")}</a></div>
    </div>
    <div>
      <div class="kd-footer__link"><a href="news.html">Fundraising end notice · results report${ico("arrow")}</a>
        <ul><li><a href="article.html">${ico("arrow")}Fundraising closing notice</a></li><li><a href="#">${ico("arrow")}Tax Benefits Guide</a></li><li><a href="#">${ico("arrow")}To our donors</a></li><li><a href="#">${ico("arrow")}Legal disclosure</a></li><li><a href="#">${ico("arrow")}Donor list</a></li></ul></div>
    </div>
    <div>
      <div class="kd-footer__link"><ul><li><a href="#">${ico("arrow")}Recycling fundraiser</a></li><li><a href="#">${ico("arrow")}Previous special site</a></li></ul></div>
      <a class="kd-footer__btn" href="#">Official school site</a>
      <a class="kd-footer__btn" href="#">Corporate site</a>
    </div>
  </nav>
  <small class="kd-footer__copy">Copyright © School Name All Rights Reserved.</small>
</div></footer>`;

  const fixed = `<div class="kd-fixed-btns" data-slot="side-tab"><a href="#">${ico("gift")}<span>General donation info</span>${ico("blank")}</a></div>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) { head.classList.add("kd-header"); head.innerHTML = header; }
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) foot.outerHTML = fixed + conversion + footer;

  document.querySelectorAll("[data-ico]").forEach((el) => { el.innerHTML = ICON[el.dataset.ico] || ""; });

  // The fixed tab hides when the ‹Next 100 Years› band comes one screen ahead (on the history page, half a screen ahead of the footer) — the original toggleClass as is
  const tab = document.querySelector(".kd-fixed-btns");
  if (tab && window.ScrollTrigger) {
    const hist = document.body.dataset.page === "about";
    ScrollTrigger.create({
      trigger: hist ? ".kd-footer" : ".kd-conversion",
      start: hist ? "top-=50% top" : "top-=100% top",
      end: () => `${document.body.scrollHeight}px`,
      toggleClass: { targets: tab, className: "is-hidden" }
    });
  }

  const h = document.querySelector(".kd-header");
  if (!h) return;
  const trigger = h.querySelector(".kd-header__trigger"), nav = h.querySelector(".kd-nav");
  const isSp = () => matchMedia("(max-width: 767px)").matches;
  trigger.addEventListener("click", () => {
    const open = !trigger.classList.contains("is-opened");
    [h, trigger, nav].forEach((el) => el.classList.toggle("is-opened", open));
  });
  const megaItem = h.querySelector("[data-mega]"), mega = megaItem.querySelector(".kd-mega");
  const glob = h.querySelector("[data-global]"), globList = glob.querySelector(".kd-global__list");
  // On PC it expands via max-height on mouse hover, on phones on tap (original initMegaMenu·initHeaderToggle as is)
  const hover = (el) => {
    el.addEventListener("mouseover", () => { if (!isSp()) el.classList.add("is-active"); });
    el.addEventListener("mouseout", () => { if (!isSp()) el.classList.remove("is-active"); });
  };
  hover(megaItem); hover(glob);
  const spToggle = (btn, item, panel) => btn.addEventListener("click", () => {
    if (!isSp()) return;
    const on = !item.classList.contains("is-active");
    item.classList.toggle("is-active", on);
    panel.style.maxHeight = on ? panel.scrollHeight + "px" : "";
  });
  spToggle(megaItem.querySelector("button"), megaItem, mega);
  spToggle(glob.querySelector("button"), glob, globList);
})();
