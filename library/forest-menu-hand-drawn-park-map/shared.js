// Common to all pages: draws the header icon, menu button, drawer, bottom info bar, bottom-right icon and footer in one place, and wires drawer open/close, bar hiding, button color change, entrance and stagger.
// Original values: drawer opacity .3s ease-out · bar hides while scrolling and returns after 1000ms · reveal at top bottom-=200 · parallax photo y -50% scrub · anchor move 500ms (minus the 130px header).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const page = document.body.dataset.page || "home";
  const isHome = page === "home";
  const BN = (window.BN = {});

  // Newly drawn placeholder mark instead of the logo, two leaves and a sun
  const mark = '<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M2 21c6-10 16-14 27-12-7 2-11 6-13 12-4-2-9-2-14 0z" fill="currentColor"/><path d="M18 31c4-9 12-15 27-14-8 3-12 8-13 15-5-3-9-3-14-1z" fill="currentColor"/><circle cx="39" cy="6.5" r="4.5" fill="currentColor"/></svg>';
  const wordmark = '<span class="bn-mark"><b>Your name here<small>PLACE · NAME PARK</small></b>' + mark + "</span>";
  const icon = {
    mail: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1"><rect x="1.5" y="3.5" width="13" height="9" rx="1"/><path d="m2 4 6 5 6-5"/></svg>',
    cal: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1"><rect x="1.5" y="2.5" width="13" height="12" rx="1"/><path d="M1.5 6h13M5 1v3M11 1v3M4 8.5h2M7 8.5h2M10 8.5h2M4 11h2M7 11h2"/></svg>',
    insta: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="14" height="14" rx="4"/><circle cx="10" cy="10" r="3.2"/><circle cx="14.2" cy="5.8" r=".6" fill="currentColor"/></svg>',
    x: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.1"><path d="M4 4l12 12M16 4 4 16"/></svg>',
    fb: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1"><circle cx="10" cy="10" r="7"/><path d="M11.2 17V9.6h2.1M9 11.6h4M11.2 9.6c0-1.6.4-2.4 2.1-2.4"/></svg>',
  };
  // Small hand-drawn icon before drawer menu items: the original has a different drawing per item
  const doodle = [
    '<path d="M6 26V14l10-8 10 8v12M12 26v-7h8v7"/>',
    '<path d="M8 6h16v20H8zM8 12h16M13 6v20"/><path d="M17 17h4M17 21h3"/>',
    '<path d="M4 24 12 8l6 10 4-6 6 12zM16 8a2 2 0 1 0 0-.1"/>',
    '<path d="M16 28V12M16 12c-6-1-9-5-9-9 5 0 8 3 9 9zM16 16c5-1 8-4 8-8-4 0-7 3-8 8z"/>',
    '<path d="M6 18c0-6 4-10 10-10s10 4 10 10M4 18h24M16 8V4M10 26l2-8M22 26l-2-8"/>',
    '<path d="M16 28s-8-8-8-14a8 8 0 0 1 16 0c0 6-8 14-8 14z"/><circle cx="16" cy="14" r="3"/>',
  ];
  const d = (i) => `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1">${doodle[i]}</svg>`;
  BN.mark = mark;
  BN.icon = icon;

  const main = [
    ["Home", "Home", "index.html"],
    ["Event", "Events", "index.html#events"],
    ["Map and facility guide", "Map", "index.html#map"],
    ["How to enjoy", "Explore", "index.html#explore"],
    ["Our Nature", "Inhabitants", "index.html#nature"],
    ["Directions", "Access", "index.html#access"],
  ];
  const sub = [
    ["About This Place", "About us", "about.html"],
    ["Frequently asked questions", "FAQ", "#"],
    ["News", "News", "news.html"],
    ["Blog", "Blog", "news.html"],
    ["Usage guide", "Service guide", "service.html"],
  ];
  const cta = `<a class="bn-cta" href="#">${icon.mail}Contact Us</a><a class="bn-cta is-ghost" href="#">${icon.cal}Book a Facility</a>`;
  const sns = `<span class="bn-sns"><a href="#" aria-label="SNS 1">${icon.insta}</a><a href="#" aria-label="SNS 2">${icon.x}</a><a href="#" aria-label="SNS 3">${icon.fb}</a></span>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("bn-head");
    head.classList.toggle("is-home", isHome);
    head.innerHTML = `
      <a class="bn-logo" href="index.html" aria-label="Home">${mark}</a>
      <span class="bn-side is-left">Place Name</span><span class="bn-side is-right">Place Name</span>
      <button class="bn-burger${isHome ? " is-gray" : ""}" type="button" aria-label="Open Menu"><span></span><span></span></button>`;
    head.insertAdjacentHTML(
      "afterend",
      `<div class="bn-drawer" data-slot="menu-drawer">
        <div class="bn-drawer__bg"></div>
        <div class="bn-drawer__in">
          <span class="bn-drawer__logo">${mark}</span>
          <nav class="bn-drawer__main">${main.map(([ja, en, href], i) => `<a href="${href}">${d(i)}<span>${ja}<i>${en}</i></span></a>`).join("")}</nav>
          <nav class="bn-drawer__sub">${sub.map(([ja, en, href]) => `<a href="${href}">${ja}<span>${en}</span></a>`).join("")}</nav>
          <div class="bn-drawer__cta">${cta}</div>
          <div class="bn-drawer__foot">
            <span class="bn-drawer__mark">${wordmark}</span>
            <div class="bn-drawer__sns"><span>Official SNS</span>${sns}</div>
            <a class="bn-drawer__policy" href="#">Privacy policy</a>
          </div>
        </div>
      </div>`,
    );
  }

  const burger = document.querySelector(".bn-burger");
  const drawer = document.querySelector(".bn-drawer");
  const toggle = () => {
    burger.classList.toggle("is-active");
    drawer.classList.toggle("is-active");
  };
  burger?.addEventListener("click", toggle);
  drawer?.querySelector(".bn-drawer__bg").addEventListener("click", toggle);
  drawer?.querySelectorAll("a[href*='#']").forEach((a) => a.addEventListener("click", () => drawer.classList.contains("is-active") && toggle()));

  // Bottom info bar — the original fills it from a weather API. Here only today’s date is filled in, weather and temperature are placeholders
  const now = new Date();
  const mon = now.toLocaleString("en", { month: "short" });
  const date = `${String(now.getDate()).padStart(2, "0")}.${mon}.${now.getFullYear()}`;
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="bn-info${isHome ? " is-top" : ""}" data-slot="info-bar"><p><span class="is-pc">Place Name 00-island Region Country </span><span class="is-sp">Place Name 00-island<br></span>( ${date} / Weather / 00 ° C )</p></div>`,
  );
  const info = document.querySelector(".bn-info");
  let hideTimer;
  addEventListener(
    "scroll",
    () => {
      info.classList.add("is-hide");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => info.classList.remove("is-hide"), 1000);
    },
    { passive: true },
  );

  if (isHome) {
    document.body.insertAdjacentHTML("beforeend", `<div class="bn-corner" data-slot="corner-logo"><span class="is-default">${wordmark}</span><span class="is-start">${wordmark}</span></div>`);
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const fmain = [["Home", "index.html"], ["Event", "index.html#events"], ["Map and facility guide", "index.html#map"], ["How to enjoy", "index.html#explore"], ["Our Nature", "index.html#nature"], ["Creature guide", "#"], ["Directions", "index.html#access"], ["About This Place", "about.html"]];
    const fsub = [["News", "news.html"], ["Blog", "news.html"], ["Frequently asked questions", "#"], ["Usage guide", "service.html"], ["Contact Us", "#"]];
    foot.classList.add("bn-foot");
    foot.innerHTML = `
      <div class="bn-foot__in">
        <div class="bn-foot__head"><p>Your name here</p>${sns}</div>
        <div class="bn-foot__detail">
          <p>(Zip) 00000 Address in one line here 000-0</p>
          <p class="is-en">000-0 Address line in English, City 000-0000, Country</p>
          <p class="is-open">Closed days 00/00-00/00<br>※ Some facilities are closed on Thursdays</p>
          <p class="is-tel">Tel.<u>000-00-0000</u></p>
          <p class="is-admin">Operated by: Organization name here</p>
        </div>
        <div class="bn-foot__cta">${cta}</div>
        <ul class="bn-foot__main">${fmain.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
        <ul class="bn-foot__sub">${fsub.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}<li><a class="is-small" href="#">Privacy policy</a></li></ul>
        <p class="bn-foot__copy">© 2025 Your operating organization here</p>
        <span class="bn-foot__mark">${wordmark}</span>
      </div>`;
  }

  // Same-page anchors glide in 500ms, minus the 130px header height
  document.querySelectorAll('a[href^="#"]:not([href="#"]), a[href^="index.html#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const hash = a.getAttribute("href").split("#")[1];
      const target = hash && document.getElementById(hash);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + scrollY - 130;
      gsap.to(document.scrollingElement, { scrollTop: top, duration: 0.5, ease: "power1.inOut", overwrite: true });
    });
  });

  // Block transitions for 100ms so they don’t all play at once on first draw (original c-preload)
  document.body.classList.add("is-preload");
  setTimeout(() => document.body.classList.remove("is-preload"), 100);

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray(".bn-fade").forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: "top bottom-=200", once: true, onEnter: () => el.classList.add("is-animated") });
    });
    gsap.utils.toArray(".bn-parallax").forEach((box) => {
      gsap.to(box.querySelector(".bn-img"), { yPercent: -50, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.querySelectorAll(".bn-fade").forEach((el) => el.classList.add("is-animated"));
  });

  // Past the hero the button goes gray → default color, and the bottom-right symbol and bottom bar switch to the dark board
  BN.afterHero = (hero) => {
    ScrollTrigger.create({ trigger: hero, start: "bottom top", onEnter: () => burger.classList.remove("is-gray"), onLeaveBack: () => burger.classList.add("is-gray") });
    const corner = document.querySelector(".bn-corner");
    ScrollTrigger.create({
      trigger: hero,
      start: "bottom+=100 bottom",
      onEnter: () => { corner?.classList.add("is-active"); info.classList.add("is-active"); },
      onLeaveBack: () => { corner?.classList.remove("is-active"); info.classList.remove("is-active"); },
    });
  };
})();
