// Attaches the shared header · fixed header · phone menu · hiring box · footer, and runs entrances, hovers and the menu with the original (TweenMax 1.19) values as they are.
(() => {
  const body = document.body;
  const page = body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPC = () => !matchMedia("(max-width: 880px)").matches;
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const NAV = [
    ["news", "news.html", "Menu First", "News"],
    ["about", "about.html", "Pharmacy about section", "About Us"],
    ["wellness", "#", "Wellness", "Wellness"],
    ["shop", "shop.html", "Find a store", "Shop Info"],
    ["company", "#", "Company overview", "Company"],
    ["recruit", "recruit.html", "Hiring Info", "Recruit"],
    ["contact", "#", "Contact Us", "Contact"],
  ];
  const cur = page === "detail" ? "shop" : page;
  const ytIcon = `<svg viewBox="0 0 91 19" aria-hidden="true"><path class="ic" d="M0 3.5A3.5 3.5 0 0 1 3.5 0h19A3.5 3.5 0 0 1 26 3.5v12a3.5 3.5 0 0 1-3.5 3.5h-19A3.5 3.5 0 0 1 0 15.5zM10 5v9l7.5-4.5z"/><path class="ic" d="M30 3h2.3l2.4 6 2.4-6h2.3l-3.7 8.4V16h-2v-4.6zM42 7.6a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4zm0 1.8a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zM48 7.8h1.9v5.1c0 1 .6 1.5 1.4 1.5s1.6-.6 1.6-1.6v-5h1.9V16h-1.8v-1a3 3 0 0 1-2.5 1.2c-1.7 0-2.5-1.1-2.5-2.8zM56.5 3h7.6v1.8h-2.8V16h-2V4.8h-2.8zM64.6 7.8h1.9v5.1c0 1 .6 1.5 1.4 1.5s1.6-.6 1.6-1.6v-5h1.9V16h-1.8v-1a3 3 0 0 1-2.5 1.2c-1.7 0-2.5-1.1-2.5-2.8zM73.6 2.6h1.9v6.1a2.9 2.9 0 0 1 2.3-1.1c2 0 3.2 1.6 3.2 4.2S79.8 16 77.8 16a2.9 2.9 0 0 1-2.4-1.2V16h-1.8zm3.6 6.6c-1.1 0-1.8 1-1.8 2.6s.7 2.6 1.8 2.6 1.8-1 1.8-2.6-.7-2.6-1.8-2.6zM86 7.6c-2.3 0-3.9 1.8-3.9 4.2s1.6 4.2 4 4.2c1.6 0 2.8-.8 3.4-2.1l-1.6-.7c-.4.8-1 1.1-1.8 1.1-1.2 0-2-.8-2.1-2.1h5.7v-.6c0-2.5-1.4-4-3.7-4zm-1.9 3.3c.2-1.1.9-1.7 1.9-1.7s1.6.6 1.7 1.7z"/></svg>`;
  const fbIcon = `<svg viewBox="0 0 18 18" aria-hidden="true"><path class="ic" d="M10.2 18v-7.4h2.4l.4-2.8h-2.8V6c0-.8.3-1.4 1.4-1.4H13V2.1c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.6v2.2H5v2.8h2.4V18z"/></svg>`;
  const igIcon = `<svg viewBox="0 0 18 18" aria-hidden="true"><path class="ic" d="M9 1.6c2.4 0 2.7 0 3.6.1 2.4.1 3.6 1.3 3.7 3.7.1.9.1 1.2.1 3.6s0 2.7-.1 3.6c-.1 2.4-1.3 3.6-3.7 3.7-.9.1-1.2.1-3.6.1s-2.7 0-3.6-.1c-2.4-.1-3.6-1.3-3.7-3.7C1.6 11.7 1.6 11.4 1.6 9s0-2.7.1-3.6C1.8 3 3 1.8 5.4 1.7c.9-.1 1.2-.1 3.6-.1zM9 0C6.6 0 6.3 0 5.3.1 2 .2.2 2 .1 5.3 0 6.3 0 6.6 0 9s0 2.7.1 3.7C.2 16 2 17.8 5.3 17.9c1 .1 1.3.1 3.7.1s2.7 0 3.7-.1c3.3-.1 5.1-1.9 5.2-5.2.1-1 .1-1.3.1-3.7s0-2.7-.1-3.7C17.8 2 16 .2 12.7.1 11.7 0 11.4 0 9 0zm0 4.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2zM9 12a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm4.8-8.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2z"/></svg>`;
  const arrow = `<svg viewBox="0 0 21 12" aria-hidden="true"><polygon points="15.2,0 14.8,0.4 19.9,5.7 0,5.7 0,6.3 19.9,6.3 14.8,11.6 15.2,12 21,6"/></svg>`;
  const navList = NAV.map(([k, href, jp, en]) => `<li class="jb-nav__item${k === cur ? " is-cur" : ""}"><a class="jb-nav__a jb-nav__a--${k}" href="${href}" data-label="Menu name · handwriting-style line above · English below"><span class="jb-nav__jp">${jp}</span><span class="jb-nav__en">${en}</span></a></li>`).join("");
  const head = (min) => `<header class="jb-h${min ? " is-min" : ""}" ${min ? 'data-slot="header-fixed" aria-hidden="true"' : 'data-slot="header"'}>
    <div class="jb-h__in">
      <a class="jb-brand" href="index.html" data-label="Pharmacy English wordmark + Korean name"><span class="jb-brand__en">Pharmacy Name</span><span class="jb-brand__jp">Pharmacy name</span></a>
      <nav class="jb-nav"><ul class="jb-nav__list">${navList}</ul><div class="jb-nav__yt"><a href="#" aria-label="Video channel">${ytIcon}</a></div></nav>
    </div>
    ${min ? "" : `<div class="jb-h__sp">
      <a class="jb-h__shop" href="shop.html"><svg viewBox="0 0 24 29" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" d="M12 1.5a9.5 9.5 0 0 0-9.5 9.5c0 7 9.5 16.5 9.5 16.5S21.5 18 21.5 11A9.5 9.5 0 0 0 12 1.5z"/><circle cx="12" cy="11" r="3.4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><span>Store search</span></a>
      <button class="jb-h__menu" type="button" aria-label="Open Menu"><span class="jb-burger"><i></i></span><span class="jb-menu-txt"><span class="is-open">Menu</span><span class="is-close">Close</span></span></button>
    </div>`}
  </header>`;
  const spnav = `<nav class="jb-spnav" data-slot="mobile-menu"><ul>${NAV.map(([k, href, jp, en]) => `<li class="jb-spnav__item"><a href="${href}">${jp}<small>${en}</small></a></li>`).join("")}</ul><a class="jb-spnav__yt jb-spnav__item" href="#">${ytIcon}</a></nav>`;
  const joinTxt = body.dataset.join || "View job info";
  const join = `<div class="jb-secwd jb-join" data-slot="join-banner"><a class="jb-join__a" href="recruit.html">
      <span class="jb-join__en">Join the Pharmacy Name</span>
      <span class="jb-join__jp">Your one-line invitation to work together here.</span>
      <span class="jb-join__btm"><span>${joinTxt}</span>${arrow}</span>
    </a></div>`;
  const foot = `<footer class="jb-f jb-secwd" data-slot="footer">
    <div class="jb-f__top">
      <ul class="jb-f__nav"><li><a class="jb-f__link" href="index.html">Home</a></li><li><a class="jb-f__link" href="about.html">About</a></li><li><a class="jb-f__link" href="shop.html">Shop Info</a></li><li><a class="jb-f__link" href="#">Company</a></li><li><a class="jb-f__link" href="#">Contact</a></li><li><a class="jb-f__link" href="#">Privacy Policy</a></li></ul>
      <ul class="jb-f__sns"><li><a class="is-yt" href="#" aria-label="Video channel">${ytIcon}</a></li><li><a class="is-fb" href="#" aria-label="SNS 1">${fbIcon}</a></li><li><a class="is-ig" href="#" aria-label="SNS 2">${igIcon}</a></li></ul>
      <a class="jb-f__top-btn" href="#top" aria-label="Back to top"><svg viewBox="0 0 20 12" aria-hidden="true"><polygon class="ic" points="10,0 0,10.6 1.2,11.8 10,2.4 18.8,11.8 20,10.6"/></svg><span>Page Top</span></a>
    </div>
    <div class="jb-f__btm"><a class="jb-f__sp" href="#">Privacy Policy</a><p class="jb-f__copy">Copyright © Pharmacy Name All Rights Reserved.</p></div>
  </footer>`;

  body.insertAdjacentHTML("afterbegin", head(true) + head(false) + spnav);
  const main = document.querySelector(".jb-main");
  if (!body.hasAttribute("data-no-join")) main.insertAdjacentHTML("beforeend", join);
  main.insertAdjacentHTML("afterend", foot);

  const header = document.querySelector(".jb-h:not(.is-min)");
  const clone = document.querySelector(".jb-h.is-min");

  // Section name Latin letter splitting: a span per letter, like the original letterSetting
  const letters = (el) => {
    el.innerHTML = [...el.textContent].map((c) => (c.trim() ? `<span>${c}</span>` : c)).join("");
    return el.querySelectorAll("span");
  };
  document.querySelectorAll(".js-lt").forEach(letters);

  if (reduce) {
    document.querySelectorAll(".jb-shine").forEach((el) => el.classList.add("is-load"));
    window.kfJb = { isPC, css, reduce };
    return;
  }

  // ── Body entrance: .8s Sine.easeOut after window load, hero white band lifts (is-load) ──
  addEventListener("load", () => {
    document.querySelectorAll(".jb-shine").forEach((el) => el.classList.add("is-load"));
    gsap.to(main, { duration: 0.8, ease: "sine.out", opacity: 1 });
    heroTitle();
  });

  // ── Vertical headings at the start of lower sections: letter by letter they float up in gold and then turn ink-black — original P(), store detail uses tighter spacing ──
  function heroTitle() {
    const t = document.querySelector(".js-herotitle");
    if (!t) return;
    const en = t.querySelectorAll(".txt--en .js-lt > span"), jp = t.querySelectorAll(".txt--jp .js-lt > span");
    const sp = css("--site-sparkle"), ink = css("--kf-ink");
    const tl = gsap.timeline({ defaults: { ease: "power1.out", duration: 0.8 } });
    // Sections whose text lines aren’t split, like the Careers head, skip those two steps
    const step = (tg, vars, pos) => tg.length && tl.to(tg, vars, pos);
    const [s1, s2] = page === "detail" ? [0.02, 0.03] : [0.04, 0.08];
    const [p1, p2, p3] = page === "detail" ? ["-=.9", "-=1.2", "-=.9"] : ["-=.7", "-=1.5", "-=.9"];
    step(en, { color: sp, opacity: 1, stagger: s1 });
    step(en, { color: ink, stagger: s2 }, p1);
    step(jp, { color: sp, opacity: 1, stagger: s1 }, p2);
    step(jp, { color: ink, stagger: s2 }, p3);
  }

  // ── Header menu hover: fade .6s Power3.easeOut, return .4s ──
  document.querySelectorAll(".jb-nav__item, .jb-nav__yt").forEach((li) => {
    const a = li.querySelector("a");
    a.addEventListener("mouseenter", () => isPC() && gsap.to(a, { duration: 0.6, ease: "power3.out", opacity: 0.5 }));
    a.addEventListener("mouseleave", () => isPC() && gsap.to(a, { duration: 0.4, ease: "power3.out", opacity: 1 }));
  });

  // ── Recruit box hover: background turns golden beige in .4s ──
  const joinA = document.querySelector(".jb-join__a");
  if (joinA) {
    joinA.addEventListener("mouseenter", () => isPC() && gsap.to(joinA, { duration: 0.4, ease: "power1.out", backgroundColor: css("--kf-accent-soft") }));
    joinA.addEventListener("mouseleave", () => isPC() && gsap.to(joinA, { duration: 0.4, ease: "power1.out", backgroundColor: css("--kf-raised") }));
  }

  // ── Fixed header: after scrolling more than 500px from the top (750px in the Careers section) it drops in with .5s Circ.easeOut, and on scroll up with .2s ──
  const limit = page === "recruit" ? 750 : 500;
  let fixed = false;
  const onFixed = () => {
    const subclone = document.querySelector(".jb-rnav.is-clone");
    if (!isPC()) return;
    const h = clone.offsetHeight || 50;
    if (scrollY > limit && !fixed) {
      fixed = true;
      gsap.fromTo(clone, { display: "none", y: -h, opacity: 0 }, { duration: 0.5, ease: "circ.out", display: "block", y: 0, opacity: 1 });
      if (subclone) gsap.fromTo(subclone, { display: "none", y: -h, opacity: 0 }, { duration: 0.5, ease: "circ.out", display: "block", y: 0, opacity: 1 });
    } else if (scrollY <= limit && fixed) {
      fixed = false;
      gsap.to(clone, { duration: 0.2, ease: "power1.out", display: "none", y: -h, opacity: 0 });
      if (subclone) gsap.to(subclone, { duration: 0.1, ease: "power1.out", display: "none", y: -h, opacity: 0 });
    }
  };

  // ── Scroll reveal: once, when the window bottom passes 150px above the element top ──
  const seen = new WeakSet();
  const once = (el, fn, pad = 150) => {
    if (seen.has(el)) return;
    if (el.getBoundingClientRect().top + pad < innerHeight) { seen.add(el); fn(el); }
  };
  const sparkle = (el) => {
    const tl = gsap.timeline();
    const sp = el.querySelectorAll(".jb-title__en span");
    tl.to(sp, { duration: 0.4, color: css("--site-sparkle"), stagger: 0.06, ease: "power1.out" }, 0)
      .to(sp, { duration: 0.4, color: css("--kf-ink"), stagger: 0.06, ease: "power1.out" }, 0.4);
    gsap.fromTo(el.querySelector(".jb-title__jp"), { opacity: 0, y: -5 }, { duration: 0.6, ease: "circ.out", opacity: 1, y: 0, delay: 0.8 });
  };
  const onScroll = () => {
    onFixed();
    if (!isPC()) return;
    document.querySelectorAll(".js-title").forEach((el) => once(el, sparkle, 0));
    document.querySelectorAll(".js-img").forEach((el) => once(el, () => gsap.fromTo(el, { opacity: 0, scale: 1.1 }, { duration: 1.1, ease: "power1.inOut", opacity: 1, scale: 1 })));
    document.querySelectorAll(".js-blockx").forEach((el) => once(el, () => gsap.fromTo(el, { opacity: 0, x: -20 }, { duration: 1.1, ease: "power1.inOut", opacity: 1, x: 0 })));
    document.querySelectorAll(".js-blocky").forEach((el) => once(el, () => gsap.fromTo(el, { opacity: 0, y: -20 }, { duration: 1.1, ease: "power1.inOut", opacity: 1, y: 0 })));
    document.querySelectorAll(".js-css").forEach((el) => once(el, () => el.classList.add("is-animate")));
    window.dispatchEvent(new CustomEvent("jb:scroll"));
  };
  addEventListener("scroll", onScroll, { passive: true });

  // ── ”Scroll Down” indicator: floats up after .55s over .9s with Power3.easeInOut, letters turn gold at .025s intervals on hover ──
  const hs = document.querySelector(".jb-hscroll");
  if (hs) {
    const sp = letters(hs.querySelector(".jb-hscroll__t"));
    const arr = hs.querySelector("svg");
    if (isPC()) gsap.fromTo(hs, { opacity: 0, scale: 0.9, y: -20 }, { duration: 0.9, ease: "power3.inOut", opacity: 1, scale: 1, y: 0, delay: 0.55 });
    hs.addEventListener("mouseenter", () => isPC() && gsap.to(sp, { duration: 0.1, ease: "power3.inOut", color: css("--kf-accent"), stagger: 0.025, onComplete: () => arr.classList.add("is-hover") }));
    hs.addEventListener("mouseleave", () => isPC() && gsap.to(sp, { duration: 0.1, ease: "power3.inOut", color: css("--kf-ink"), stagger: 0.025, onComplete: () => arr.classList.remove("is-hover") }));
    const hero = hs.closest("[data-slot]");
    // Same formula as the original — hide when hero bottom + margin (90, small window 40) − 40 − display height is above the window bottom
    const fade = () => {
      if (!isPC()) return;
      const v = matchMedia("(max-width: 1280px), (max-height: 800px)").matches ? 40 : 90;
      const bottom = hero.getBoundingClientRect().bottom;
      gsap.to(hs, { duration: 0.5, ease: "power4.out", opacity: bottom + v - 40 - hs.offsetHeight < innerHeight ? 0 : 1 });
    };
    addEventListener("scroll", fade, { passive: true });
    hs.addEventListener("click", (e) => {
      e.preventDefault();
      const t = document.querySelector(hs.getAttribute("href"));
      if (t) gsap.to(window, { duration: 0.7, ease: "power2.inOut", scrollTo: { y: t.getBoundingClientRect().top + scrollY - header.offsetHeight, autoKill: false } });
    });
  }

  // ── Phone menu: label menu→close .4s, panel fades .6s, items from x -30 at .05s intervals ──
  const btn = document.querySelector(".jb-h__menu");
  const nav = document.querySelector(".jb-spnav");
  const items = nav.querySelectorAll(".jb-spnav__item");
  const tOpen = btn.querySelector(".is-open"), tClose = btn.querySelector(".is-close");
  let open = false, keep = 0;
  btn.addEventListener("click", () => {
    open = !open;
    const [a, b] = open ? [tOpen, tClose] : [tClose, tOpen];
    header.classList.toggle("is-menu", open);
    gsap.to(a, { duration: 0.4, ease: "none", opacity: 0, y: 15, onComplete: () => { gsap.set(a, { position: "absolute" }); gsap.set(b, { position: "static" }); } });
    gsap.set(b, { y: 15 });
    gsap.to(b, { duration: 0.4, ease: "none", opacity: 1, y: 0, delay: 0.4 });
    if (open) {
      keep = scrollY;
      header.style.position = "fixed";
      gsap.to(nav, { duration: 0.6, ease: "sine.out", opacity: 1, display: "block" });
      gsap.set(items, { opacity: 0, x: -30 });
      gsap.to(items, { duration: 0.6, ease: "sine.out", opacity: 1, x: 0, delay: 0.3, stagger: 0.05 });
    } else {
      header.style.position = "";
      gsap.to(items, { duration: 0.6, ease: "sine.out", opacity: 0, x: -30, stagger: 0.05 });
      gsap.to(nav, { duration: 0.6, ease: "sine.out", opacity: 0, display: "none", delay: 0.4 });
      scrollTo(0, keep);
    }
  });

  window.kfJb = { isPC, css, reduce, letters };
})();
