// Common to all pages: draws in the header, phone menu, loader, right drawer and curtain footer, and hooks up smooth scroll, reveals, band mask, parallax and endless photo row.
// Original values: Lenis duration 1.1 · lerp .12 / loader photos overlap 1.1s sine.out + .5 hold, last section cut upward .6 sine.inOut, white mask 1.5s /
// Block y40 .8 sine.inOut "0% 80%" / band mask 2s sine.out "top 75%" / drawer x110%→0 .8 power2.inOut / menu items y-15 .8 stagger .07 / footer y-1600 scrub .1
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const root = document.documentElement;
  const FJ = (window.FJ = { reduced, lenis: null, ready: [] });
  const home = page === "home" ? "" : "index.html";

  const arrowR = '<svg viewBox="0 0 20 10" aria-hidden="true"><path d="m11.37 8.71-.77-.76 2.41-2.41H3.92V4.46h9.09L10.6 2.05l.77-.76L15.08 5l-3.71 3.71Z"/></svg>';
  const arrowUp = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m13.62 8.59-.75.76-2.38-2.38v8.98H9.42V6.97L7.04 9.35l-.75-.76 3.67-3.67 3.66 3.67Z"/></svg>';
  FJ.icons = { arrowR };

  const btn = (label, href = "#reservation", cls = "") => `<a class="fj-btn ${cls}" href="${href}"><span class="fj-btn__txt">${label}</span></a>`;

  const NAV = [
    ["Menu 1", "#concept"], ["Menu 2", "#message"], ["Menu 3", "#menu"], ["Menu 4", "#history"],
    ["Menu 5", "#news"], ["Menu 6", "#contact"], ["Menu 7", "#access"],
  ];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("fj-head");
    head.innerHTML = `
      <nav class="fj-gnav" aria-label="Main menu">
        <ul class="fj-gnav__list fj-en" data-label="Your section name in English (one word) here">
          ${NAV.map(([t, h]) => `<li class="fj-gnav__item"><a href="${home}${h}">${t}</a></li>`).join("")}
        </ul>
        <div class="fj-gnav__btn">${btn("Reserve")}</div>
        <button class="fj-gnav__close fj-underline" type="button"><span class="fj-underline__txt">close</span></button>
      </nav>
      <ul class="fj-lang"><li><a class="is-active" href="#">KO</a></li><li><a href="#">EN</a></li></ul>
      <div class="fj-head__reserve">${btn("Reserve")}</div>
      <button class="fj-burger" type="button" aria-label="Open Menu"><i></i><i></i><i></i></button>`;
  }

  // Loader background: redraws the original’s photo of leaf shadows on a white wall as blurred leaf-shaped shapes
  const leafShadow = () => {
    const leaves = [];
    let s = 7;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 46; i++) {
      const x = rnd() * 1600 - 80, y = rnd() * 1000 - 50;
      const w = 50 + rnd() * 120, h = 14 + rnd() * 26, r = -38 + rnd() * 20;
      leaves.push(`<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${w.toFixed(0)}" ry="${h.toFixed(0)}" transform="rotate(${r.toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`);
    }
    for (let i = 0; i < 9; i++) {
      const x = rnd() * 1500, y = rnd() * 900;
      leaves.push(`<path d="M${x} ${y} l${600 + rnd() * 300} ${-420 - rnd() * 200}" stroke="currentColor" stroke-width="${4 + rnd() * 6}" fill="none"/>`);
    }
    return `<svg class="fj-loading__bg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><filter id="fj-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="22"/></filter></defs>
      <g filter="url(#fj-soft)" fill="currentColor" opacity=".085">${leaves.join("")}</g></svg>`;
  };

  const LOADER_PHOTOS = [
    ["is-forest", "Fern thicket · green in shade · portrait 3:4"],
    ["is-moss", "Grass blade close-up · backlit lime green · portrait 3:4"],
    ["is-deep", "Mossy fallen tree · dark forest · portrait 3:4"],
    ["is-teal", "Lake surrounded by forest · clear day · portrait 3:4"],
    ["is-forest", "Cedar forest waterside · overcast light · vertical 3:4"],
    ["is-deep", "Straight cedar trunks · In the forest · Portrait 3:4"],
  ];
  const loaderSlot = document.querySelector('[data-slot="loader"]');
  if (loaderSlot && !reduced) {
    root.classList.add("is-loading");
    loaderSlot.outerHTML = `
      <div class="fj-loading" data-slot="loader">
        ${leafShadow()}
        <ul class="fj-loading__img">
          ${LOADER_PHOTOS.map(([t, l]) => `<li class="fj-loading__item"><div class="wf-img fj-ph ${t}" data-label="${l}"></div></li>`).join("")}
        </ul>
        <button class="fj-loading__skip" type="button">Skip ${arrowR}</button>
      </div>
      <div class="fj-loadingmask" aria-hidden="true"></div>`;
  } else if (loaderSlot) loaderSlot.remove();

  const FOOT_PHOTOS = [
    ["is-moss", "Grass field swaying in the wind · Lime-green backlight · Full-height portrait"],
    ["is-deep", "Mossy old tree roots · dark forest floor · portrait full-bleed"],
    ["is-teal", "Cedar forest and clear lake · overcast day · portrait full bleed"],
    ["is-forest", "Straight cedar trunk · Shade · Full vertical"],
    ["is-moss", "Fern leaves · forest shade · portrait full bleed"],
    ["is-deep", "Wet rocks and moss · dim light · fills the portrait frame"],
  ];
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("fj-foot");
    foot.innerHTML = `
      <div class="fj-foot__inner">
        <div class="fj-foot__body fj-section">
          <div class="fj-foot__top">
            <a class="fj-foot__logo" href="${home || "#"}" aria-label="Back to top">
              <span class="fj-mark" style="font-size:calc(56em / 16)"><b>Logo</b><small>0000</small></span>
              <span class="fj-mark-copy" style="font-size:calc(12em / 16);margin-top:1.4em">Your one-line intro here</span>
            </a>
            <dl class="fj-foot__info">
              <div class="fj-foot__row"><dt>Item 1</dt><dd><span>00:00 — Your business info here</span></dd></div>
              <div class="fj-foot__row"><dt>Item 2</dt><dd><span>Your days-off notice here</span></dd></div>
              <div class="fj-foot__row"><dt>Item 3</dt><dd><span>〒000-0000 Add your address on a single line here</span></dd></div>
              <div class="fj-foot__row"><dt>Item 4</dt><dd><span>Nearest station 1 · 0 min walk here</span><span>Nearest station 2 · 0 min walk here</span></dd></div>
            </dl>
          </div>
          <div class="fj-foot__btm">
            <p class="fj-foot__copy"><small>© 0000 Logo</small></p>
            <a class="fj-foot__top-link" href="#" data-pagetop>Back to page top ${arrowUp}</a>
          </div>
        </div>
        <div class="fj-foot__photos" data-slot="footer-photo-loop">
          <div class="fj-foot__slider splide" data-loop aria-label="Nature photo row">
            <div class="splide__track"><ul class="splide__list">
              ${FOOT_PHOTOS.map(([t, l]) => `<li class="splide__slide fj-foot__slide"><div class="wf-img fj-ph ${t}" data-label="${l}"></div></li>`).join("")}
            </ul></div>
          </div>
        </div>
      </div>`;
  }

  // Drawer: gathers the page’s [data-popup-body] into one panel and brings it out from the right. The privacy notice is common to all pages
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="fj-popup" data-slot="drawer" data-lenis-prevent>
       <div class="fj-popup__body">
         <div class="fj-popup__item" id="privacy">
           <h3>Your guide title here</h3>
           ${Array.from({ length: 4 }, (_, i) => `<p><b>Item ${i + 1}</b><br>Put two or three lines of guide text here. Put two or three lines of guide text here. Put two or three lines of guide text here.</p>`).join("")}
         </div>
       </div>
     </div>
     <div class="fj-popup__bg"></div>
     <button class="fj-popupmask" type="button" aria-label="Close"></button>
     <button class="fj-popup__close fj-underline" type="button"><span class="fj-underline__txt">close</span></button>`
  );
  const popup = document.querySelector(".fj-popup");
  document.querySelectorAll("[data-popup-body]").forEach((el) => popup.querySelector(".fj-popup__body").append(el));

  // ── Smooth scroll ──
  if (!reduced && window.Lenis) {
    const lenis = (FJ.lenis = new Lenis({ duration: 1.1, lerp: 0.12 }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const stopScroll = () => FJ.lenis && FJ.lenis.stop();
  const startScroll = () => FJ.lenis && FJ.lenis.start();

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (a.hasAttribute("data-popup")) return;
    e.preventDefault();
    if (root.classList.contains("is-menuopen")) toggleMenu();
    const target = id === "#" || a.hasAttribute("data-pagetop") ? 0 : document.querySelector(id);
    if (target === null) return;
    if (FJ.lenis) FJ.lenis.scrollTo(target, { duration: 1.1 });
    else if (target === 0) scrollTo(0, 0);
    else target.scrollIntoView();
  });

  // ── Phone menu: the beige panel turns on and items drop in from the top at .07 intervals ──
  const nav = head && head.querySelector(".fj-gnav");
  const navItems = head ? head.querySelectorAll(".fj-gnav__item, .fj-gnav__btn") : [];
  const navClose = head && head.querySelector(".fj-gnav__close");
  function toggleMenu() {
    if (matchMedia("(min-width: 781px)").matches) return;
    if (root.classList.contains("is-menuopen")) {
      root.classList.remove("is-menuopen");
      startScroll();
      gsap.to(nav, { autoAlpha: 0, ease: "sine.out", duration: 0.6 });
      gsap.to(navItems, { alpha: 0, ease: "sine.out", duration: 0.4 });
      gsap.to(navClose, { alpha: 0, ease: "sine.out", duration: 0.4 });
    } else {
      root.classList.add("is-menuopen");
      stopScroll();
      gsap.timeline()
        .to(nav, { autoAlpha: 1, ease: "sine.out", duration: 0.4 })
        .fromTo(navItems, { y: -15 }, { y: 0, alpha: 1, ease: "sine.out", duration: 0.8, stagger: 0.07 }, "<+=.2")
        .to(navClose, { alpha: 1, ease: "sine.out", duration: 0.8 }, "<");
    }
  }
  if (head) {
    head.querySelector(".fj-burger").addEventListener("click", toggleMenu);
    navClose.addEventListener("click", toggleMenu);
    const syncNav = () => {
      if (matchMedia("(min-width: 781px)").matches) {
        root.classList.remove("is-menuopen");
        gsap.set(nav, { clearProps: "opacity,visibility" });
        gsap.set([...navItems, navClose], { clearProps: "opacity,transform" });
      }
    };
    addEventListener("resize", syncNav);
  }

  // ── Drawer ──
  const pBg = document.querySelector(".fj-popup__bg");
  const pMask = document.querySelector(".fj-popupmask");
  const pClose = document.querySelector(".fj-popup__close");
  let current = null;
  const openPopup = (id) => {
    const body = popup.querySelector(`#${CSS.escape(id)}`);
    if (!body) return;
    current = body;
    stopScroll();
    root.classList.add("is-popupopen");
    popup.scrollTop = 0;
    body.classList.add("is-active");
    const items = body.children;
    const tl = gsap.timeline();
    if (matchMedia("(max-width: 780px)").matches) {
      tl.fromTo(pBg, { autoAlpha: 0, scale: 0.95, x: 0 }, { scale: 1, autoAlpha: 1, pointerEvents: "auto", ease: "power2.inOut", duration: 0.8 });
    } else {
      tl.fromTo(pBg, { x: "110%", autoAlpha: 1, scale: 1 }, { x: 0, pointerEvents: "auto", ease: "power2.inOut", duration: 0.8 });
    }
    tl.set(popup, { autoAlpha: 1, pointerEvents: "auto" }, "<")
      .to(pMask, { autoAlpha: 1, ease: "sine.out", duration: 0.8, pointerEvents: "auto" }, "<")
      .to(pClose, { alpha: 1, ease: "sine.out", duration: 0.8 }, "<+=.6")
      .fromTo(items, { y: -10 }, { alpha: 1, y: 0, ease: "sine.out", duration: 0.8, stagger: 0.06 }, "<");
  };
  const closePopup = () => {
    if (!current) return;
    const body = current;
    const tl = gsap.timeline({
      onComplete: () => {
        body.classList.remove("is-active");
        root.classList.remove("is-popupopen");
        startScroll();
      },
    });
    if (matchMedia("(max-width: 780px)").matches) tl.to(pBg, { autoAlpha: 0, ease: "sine.out", duration: 0.6 });
    else tl.to(pBg, { x: "110%", ease: "power2.out", duration: 0.6 });
    tl.to(pMask, { autoAlpha: 0, ease: "sine.out", duration: 0.8, pointerEvents: "none" }, "<")
      .to(body.children, { alpha: 0, ease: "power2.out", duration: 0.1 }, "<")
      .to(pClose, { alpha: 0, ease: "sine.out", duration: 0.1 }, "<")
      .set(popup, { autoAlpha: 0, pointerEvents: "none" }, ">+.2")
      .set(pBg, { autoAlpha: 0, pointerEvents: "none" }, ">+.2");
    current = null;
  };
  FJ.openPopup = openPopup;
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-popup]");
    if (!link) return;
    e.preventDefault();
    openPopup(link.dataset.popup);
  });
  pClose.addEventListener("click", closePopup);
  pMask.addEventListener("click", closePopup);
  addEventListener("keydown", (e) => e.key === "Escape" && closePopup());

  // ── Endlessly flowing photo row — same Splide 4.1.4 loop + AutoScroll as the original (.9px per frame, does not stop on hover, free when dragged) ──
  const LOOP = { type: "loop", drag: "free", autoWidth: true, arrows: false, pagination: false, autoScroll: { speed: 0.9, pauseOnHover: false, pauseOnFocus: false } };
  FJ.loop = (el, opts = {}) => {
    if (!window.Splide) return null;
    const AutoScroll = window.splide?.Extensions?.AutoScroll;
    const sp = new Splide(el, { ...LOOP, ...opts });
    sp.mount(AutoScroll && !reduced ? { AutoScroll } : {});
    return sp;
  };
  document.querySelectorAll("[data-loop]").forEach((el) => FJ.loop(el, el.dataset.loopGap ? { gap: el.dataset.loopGap } : {}));

  // ── Scroll Reveal ──
  const mm = gsap.matchMedia();
  const animated = () => {
    gsap.set(".js-block", { autoAlpha: 0 });
    ScrollTrigger.batch(".js-block", {
      start: "0% 80%",
      once: true,
      onEnter: (els) => gsap.fromTo(els, { y: 40 }, { duration: 0.8, ease: "sine.inOut", autoAlpha: 1, y: 0 }),
    });
    ScrollTrigger.batch(".js-mask", {
      start: "top 75%",
      once: true,
      onEnter: (els) => gsap.to(els, { "--mask-position": "100%", duration: 2, ease: "sine.out", overwrite: true }),
    });
    const sweep = (sel) =>
      document.querySelectorAll(sel).forEach((el) =>
        ScrollTrigger.create({ trigger: el, start: "-40% 100%", once: true, toggleClass: { targets: el, className: "is-active" } })
      );
    mm.add("(min-width: 781px)", () => sweep(".js-sweep"));
    mm.add("(max-width: 780px)", () => sweep(".js-sweep-sp"));

    // Inside the photo frame, the body travels back up by the leftover length (1025px and up)
    mm.add("(min-width: 1025px)", () => {
      document.querySelectorAll(".js-parallax").forEach((box) => {
        const body = box.querySelector(".js-parallax__body");
        gsap.fromTo(body, { y: 0 }, {
          y: () => -Math.max(0, body.offsetHeight - box.clientHeight),
          ease: "none",
          scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: 0.5, invalidateOnRefresh: true },
        });
      });
    });

    // On entering a light section, header text and booking button turn brown
    if (head) {
      mm.add("(min-width: 781px)", () => {
        const h = head.clientHeight / 2;
        document.querySelectorAll("[data-hblack]").forEach((el) =>
          ScrollTrigger.create({ trigger: el, start: `${-h} 0`, end: `100% ${h}`, toggleClass: { targets: head, className: "is-black" } })
        );
      });
      mm.add("(max-width: 780px)", () => {
        const b = head.querySelector(".fj-burger");
        const off = b.offsetHeight + parseFloat(getComputedStyle(b).top);
        document.querySelectorAll("[data-hblack]").forEach((el) =>
          ScrollTrigger.create({ trigger: el, start: `${-off} 0`, end: `100% ${off}`, toggleClass: { targets: head, className: "is-black" } })
        );
      });
    }

    // Curtain footer: the inner part follows down from above 1600
    if (foot) {
      mm.add("(min-width: 781px)", () => {
        gsap.fromTo(foot.querySelector(".fj-foot__inner"), { y: -1600 }, {
          y: 0,
          ease: "none",
          scrollTrigger: { trigger: foot, start: "top-=1200 100%", end: "100% 100%", scrub: 0.1, invalidateOnRefresh: true },
        });
      });
    }
  };
  if (reduced) {
    document.querySelectorAll(".js-sweep, .js-sweep-sp").forEach((el) => el.classList.add("is-active"));
    document.querySelectorAll(".js-mask").forEach((el) => el.style.setProperty("--mask-position", "100%"));
  } else animated();

  // ── Loader: 6 photos crossfade → cut over the last one → white mask clears. Skip jumps to the clearing point ──
  const done = () => {
    root.classList.remove("is-loading");
    FJ.ready.forEach((fn) => fn());
    ScrollTrigger.refresh();
  };
  const loader = document.querySelector(".fj-loading");
  if (loader) {
    const imgs = loader.querySelectorAll(".fj-loading__item");
    const mask = document.querySelector(".fj-loadingmask");
    const tl = gsap.timeline({ paused: true });
    imgs.forEach((el, i) => {
      if (i !== 0) tl.fromTo(el, {}, { ease: "sine.out", duration: 1.1, alpha: 1 }, "<");
      if (i !== imgs.length - 1) tl.to(el, { ease: "sine.out", duration: 1.1, alpha: 0 }, "+=.5");
      else tl.fromTo(el, { clipPath: "inset(0 0 0 0)" }, { ease: "sine.inOut", duration: 0.6, clipPath: "inset(0 0 100% 0)" }, "+=.5");
    });
    tl.addLabel("finishLoading")
      .to(loader, { ease: "sine.out", duration: 0.1, autoAlpha: 0, pointerEvents: "none" })
      .to(mask, { ease: "sine.out", duration: 1.5, "--mask-position": "0%" }, "<")
      .call(done, null, "<");
    loader.querySelector(".fj-loading__skip").addEventListener("click", () => tl.isActive() && tl.seek("finishLoading"));
    stopScroll();
    tl.eventCallback("onComplete", () => {
      mask.remove();
      loader.remove();
    });
    tl.add(startScroll, "finishLoading");
    const go = () => tl.play();
    if (document.readyState === "complete") go();
    else addEventListener("load", go);
  } else addEventListener("DOMContentLoaded", done);
})();
