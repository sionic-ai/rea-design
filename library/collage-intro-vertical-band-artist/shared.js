/* Shared across pages — plaster background · right vertical-strip header · menu drawer · footer · entrance · shuffle typing. 
   The original is a jQuery site, so timing is handled with setTimeout and CSS transitions. The same timings and the same transition values are kept. */
(() => {
  const SK = (window.SK = {});
  const page = document.body.dataset.page || "home";
  const PC = () => innerWidth > 999;

  const LINKS = [
    ["NEW ARRIVALS", "news.html", ["news", "article"]],
    ["SCHEDULE", "schedule.html", ["schedule"]],
    ["DISCOGRAPHY", "index.html#disco", []],
    ["PROFILE", "#", []],
    ["STAGE ARCHIVE", "index.html#stage", []],
    ["FANCLUB", "#", []],
    ["GOODS", "#", [], true],
    ["DOWNLOAD & STREAM", "#", [], true],
    ["CONTACT", "#", []],
  ];
  const MEMBERS = ["Member 01", "Member 02", "Member 03", "MEMBER 04"];
  const ICON = {
    x: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 3.5l12 13M16 3.5l-12 13"/></svg>',
    ig: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="14" height="14" rx="4"/><circle cx="10" cy="10" r="3.2"/><circle cx="14.2" cy="5.8" r=".6" fill="currentColor"/></svg>',
    fb: '<svg viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="8"/></svg>',
    yt: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 6.5Q2 4 4.5 4h11Q18 4 18 6.5v7q0 2.5-2.5 2.5h-11Q2 16 2 13.5Z"/></svg>',
    ap: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 6q1-3.4 4-3.6-.2 2.8-3 3.8Zm0 1.2q2-1.4 4-1 2 .4 2.6 2-2.2 1.4-1.6 4 .4 1.6 1.4 2.2-1 3-2.8 3.4-1 .2-2.2-.4-1.4-.6-2.6 0-1.4.6-2.2.2Q4.4 17 3.4 13.4 2.6 9.8 4.6 7.6 6 6.2 7.8 6.6 9 7 10 7.2Z"/></svg>',
    ln: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 3c4.4 0 8 2.8 8 6.3 0 3.6-4.1 6.6-8.6 8.5.3-.8.4-1.7 0-2.1C5.3 15.4 2 12.6 2 9.3 2 5.8 5.6 3 10 3Z"/></svg>',
  };
  const SNS = [["x", "X"], ["ig", "Photo SNS"], ["fb", "SNS"], ["yt", "Video channel"], ["ap", "Music app"], ["ln", "Messenger"]];
  const MEMBER_SNS = [["x", "X"], ["ig", "Photo SNS"], ["ln", "Messenger"]];

  // Shuffle typewriter (original shuffleLetters step 2 · 20fps) — letter order 50ms, each letter shows two random glyphs (100ms) before its true letter
  const TYPE = "life: .1; each: .05; flicker: .05; lead: blank; mix: case; idle: full; space: skip";
  const typed = (text, extra = "start: top bottom; delay: .15", cls = "", tag = "a", attrs = "") =>
    `<${tag}${attrs}${cls ? ` class="${cls}"` : ""} data-fx="text-scramble" data-fx-text-scramble="${TYPE}; ${extra}">${text}</${tag}>`;

  const vlabel = (t, mode) => typed(t, mode, "sk-vlabel", "p");
  const contents = (mode) => `<div class="sk-contents" data-slot="contents-list">${vlabel("CONTENTS", mode)}<ul>${LINKS.map(([t, h, on, ext]) =>
    `<li${on.includes(page) ? ' class="is-current"' : ""}>${typed(t.replace("&", "&amp;"), mode, "sk-typed", "a", ` href="${h}"${ext ? ' target="_blank" rel="noopener"' : ""}`)}</li>`).join("")}</ul></div>`;
  const fanclub = (cls = "") => `<div class="sk-fanclub ${cls}" data-slot="fanclub"><p class="sk-vlabel">FANCLUB</p><div class="sk-fanclub__logo">
    <a class="sk-club" href="#" target="_blank" rel="noopener" data-label="Fan club logo 1 · thin serif capitals with dotted abbreviation">C.L.U.B.A</a>
    <a class="sk-club is-second" href="#" target="_blank" rel="noopener" data-label="Fan club logo 2 · thin serif capitals with dotted abbreviation">C.L.U.B.B</a></div></div>`;
  const members = (mode, nameTyped = true) => `<div class="sk-members" data-slot="member-list">${vlabel("MEMBER", mode)}<ul>${MEMBERS.map((m) => `<li>
    ${nameTyped ? typed(m, mode, "sk-members__name", "a", ' href="#"') : `<a href="#" class="sk-members__name">${m}</a>`}
    <div class="sk-members__js"><ul class="sk-members__sns"><li><span class="sk-members__site"><a href="#" target="_blank" rel="noopener">Official Site</a></span></li>${MEMBER_SNS.map(([k, l]) => `<li><a href="#" target="_blank" rel="noopener" aria-label="${l}">${ICON[k]}</a></li>`).join("")}</ul></div>
    <span class="sk-members__ico" role="button" aria-label="Close"></span></li>`).join("")}</ul></div>`;
  const sns = (cls = "") => `<div class="sk-sns ${cls}" data-slot="sns"><ul>${SNS.map(([k, l]) => `<li><a href="#" target="_blank" rel="noopener" aria-label="${l}">${ICON[k]}</a></li>`).join("")}</ul></div>`;
  // Vertical wordmark — 12 original letter images (Brand name). Word gaps become spaces.
  const WORD = "THE BAND NAME";
  const mark = () => `<div class="sk-mark" aria-label="${WORD}" data-label="Band English name wordmark · rough stencil lettering">${[...WORD].map((c, i, a) => c === " " ? "" : `<i${a[i + 1] === " " ? ' class="is-gap"' : ""}>${c}</i>`).join("")}</div>`;
  SK.parts = { contents, fanclub, members, sns, mark, typed, vlabel, ICON, TYPE };

  // Plaster wall background — a board with light cast obliquely on noise (color from the skin’s --site-plaster)
  const wall = document.createElement("div");
  wall.innerHTML = `<svg class="sk-wall" aria-hidden="true" data-slot="wall-texture" preserveAspectRatio="none"><filter id="sk-plaster" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006 .011" numOctaves="5" seed="11"/><feDiffuseLighting lighting-color="currentColor" surfaceScale="4.5" diffuseConstant="1.18"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting></filter><rect width="100%" height="100%" filter="url(#sk-plaster)"/></svg>`;
  document.body.prepend(wall.firstChild);

  // Header — a vertical strip on the right (a top strip on phones). Phone subpages have one more flowing header at the very top
  const logo = `<a class="sk-head__logo" href="index.html" data-label="Band English logo · Stencil lettering"><span class="sk-head__logo-pc">${WORD}</span><span class="sk-head__logo-sp">${WORD}</span></a>`;
  const burger = `<button class="sk-burger" type="button" aria-label="Menu"><span></span><span></span><span></span></button>`;
  const head = document.querySelector('[data-slot="header"]');
  head.className = "sk-head";
  head.innerHTML = logo + burger;
  head.insertAdjacentHTML("afterend", `<div class="sk-top" data-slot="top-header">${logo}${burger}</div>`);

  // Menu drawer
  const menu = document.querySelector('[data-slot="menu-drawer"]');
  menu.className = "sk-menu";
  const MENU = "on: manual; delay: .35";
  menu.innerHTML = `<div class="sk-menu__sub"><div class="sk-menu__mark"><a href="index.html">${mark()}</a></div>
    <div class="sk-menu__body"><div class="sk-menu__inner">${contents(MENU)}${fanclub("sk-fade")}${members(MENU)}${sns("sk-fade")}</div></div></div>
    <div class="sk-menu__video" data-label="Stage performance video · dim lighting · loops full screen"><video muted loop playsinline preload="metadata" src="media/stage.mp4"></video></div>`;

  // Footer
  const foot = document.querySelector('[data-slot="footer"]');
  foot.className = "sk-foot";
  foot.innerHTML = `<div class="sk-foot__mark sk-fade-in"><a href="index.html" data-label="Band English wordmark · Vertical stencil"><span>${WORD}</span></a></div>
    <div class="sk-foot__content"><div class="sk-foot__inner"><div class="sk-foot__r">${contents("start: top bottom; delay: .15")}</div>
    <div class="sk-foot__l">${fanclub("sk-fade-in")}${members("start: top bottom; delay: .15", false)}${sns("sk-fade-in")}</div></div>
    <address class="sk-copy">Copyright © Company Name. All Rights Reserved.</address></div>`;

  // Member accordion — clicking a name opens only that row and closes the rest
  const memberInit = (box) => box.querySelectorAll(":scope > ul > li").forEach((li) => {
    const js = li.querySelector(".sk-members__js"), ico = li.querySelector(".sk-members__ico");
    const close = (x) => { x.classList.remove("is-show"); const j = x.querySelector(".sk-members__js"); j.style.marginRight = `-${j.offsetWidth}px`; x.querySelector(".sk-members__ico").classList.remove("is-on"); };
    li.querySelector(".sk-members__name").addEventListener("click", (e) => {
      e.preventDefault();
      js.style.marginRight = "0px";
      li.classList.add("is-show");
      ico.classList.add("is-on");
      [...li.parentElement.children].filter((x) => x !== li).forEach(close);
    });
    ico.addEventListener("click", () => close(li));
  });
  const memberReset = () => document.querySelectorAll(".sk-members__js").forEach((j) => { if (!j.closest("li").classList.contains("is-show")) j.style.marginRight = `-${j.offsetWidth}px`; });
  document.querySelectorAll(".sk-members").forEach(memberInit);
  SK.memberInit = memberInit;
  addEventListener("load", memberReset);
  addEventListener("resize", memberReset);
  memberReset();

  // Random reveal of letter graphics (original randomShow) — 80ms intervals, random order
  SK.randomShow = (items, gap = 80) => {
    const order = [...items].map((el) => [Math.random(), el]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
    return order.map((el, i) => setTimeout(() => el.classList.add("is-on"), gap * i));
  };

  // Open and close the menu — anywhere on the band on PC (except the logo), hamburger on phone
  const video = menu.querySelector("video");
  let open = false, timers = [];
  const burgers = () => document.querySelectorAll(".sk-burger");
  const toggle = (e) => {
    if (e.target.closest(".sk-head__logo")) return;
    e.preventDefault();
    open = !open;
    document.documentElement.classList.toggle("is-locked", open);
    burgers().forEach((b) => b.classList.toggle("is-on", open));
    menu.classList.toggle("is-open", open);
    head.classList.toggle("is-menu", open);
    timers.forEach(clearTimeout);
    if (open) {
      if (video.readyState >= 1 && video.duration) video.currentTime = Math.random() * video.duration;
      else video.addEventListener("loadedmetadata", () => { video.currentTime = Math.random() * video.duration; }, { once: true });
      video.play().catch(() => {});
      timers = [setTimeout(() => {
        timers.push(...SK.randomShow(menu.querySelectorAll(".sk-mark i")));
        menu.classList.add("is-shown");
      }, 200)];
      menu.querySelectorAll('[data-fx~="text-scramble"]').forEach((el) => el.dispatchEvent(new Event("fx:play")));
    } else {
      video.pause();
      menu.querySelectorAll('[data-fx~="text-scramble"]').forEach((el) => el.dispatchEvent(new Event("fx:rest")));
      menu.querySelectorAll(".sk-mark i").forEach((i) => i.classList.remove("is-on"));
      menu.classList.remove("is-shown");
      menu.querySelectorAll(".sk-members > ul > li").forEach((li) => { li.classList.remove("is-show"); li.querySelector(".sk-members__ico").classList.remove("is-on"); });
      memberReset();
    }
  };
  head.addEventListener("click", (e) => { if (PC() || e.target.closest(".sk-burger")) toggle(e); });
  document.querySelector(".sk-top .sk-burger")?.addEventListener("click", toggle);

  // Typed text pins its height as min-height at document ready — so vertical labels and line height don’t collapse while it is emptied and retyped (original resize handler, measured once before the font arrives)
  const lockTyped = () => document.querySelectorAll('[data-fx~="text-scramble"]').forEach((el) => { el.style.minHeight = `${el.offsetHeight}px`; });
  addEventListener("resize", lockTyped);
  requestAnimationFrame(lockTyped);

  // Category chip — original skipFilter: skips the card link and goes straight to that category list (no curtain)
  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".sk-chip, .sk-sched__chip");
    if (!chip) return;
    e.preventDefault();
    e.stopPropagation();
    location.href = chip.closest(".sk-band, .sk-schedule") ? "schedule.html" : "news.html";
  }, true);

  // Scroll — reveal header, darken header and menu over dark bands, reveal classes
  const fades = () => document.querySelectorAll(".sk-fade-in, .sk-fade-up, .sk-ftitle, .sk-line, .sk-light");
  const onScroll = () => {
    const y = scrollY, h = innerHeight;
    const showAt = page === "home" && PC() ? h : PC() ? Infinity : 40;
    head.classList.toggle("is-visible", y > showAt);
    const band = document.querySelector("[data-dark-band]");
    if (band) {
      const top = band.getBoundingClientRect().top + y, bottom = top + band.offsetHeight;
      const off = PC() ? h / 2 : head.offsetHeight;
      const dark = y > top - off && y < bottom - off;
      head.classList.toggle("is-dark", dark);
      menu.classList.toggle("is-dark", dark);
    }
    fades().forEach((el) => { if (!el.classList.contains("is-visible") && y > el.getBoundingClientRect().top + y - h) el.classList.add("is-visible"); });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("load", () => setTimeout(onScroll, 100));
  SK.onScroll = onScroll;
  onScroll();
})();
