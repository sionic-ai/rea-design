// Shared for the whole site — in the original, Highway swaps only [data-router-view], and the transitions (contextual) built separately for each departure·arrival pair
// Grows the pressed box to the next page’s panel size, then opens the new panel. So the looping motions of each page are re-attached on every switch (init·cleanup).
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const MOBILE = 900;
  const mobile = () => innerWidth < MOBILE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  // GSAP cannot mix var() · oklch() — paint the skin’s color and read it back as rgb to pass along
  const paint = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const probe = document.createElement("i");
  probe.style.display = "none";
  const color = (v) => {
    if (!probe.isConnected) document.body.append(probe);
    probe.style.color = `var(${v})`;
    paint.clearRect(0, 0, 1, 1);
    paint.fillStyle = getComputedStyle(probe).color;
    paint.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = paint.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${+(a / 255).toFixed(3)})`;
  };

  let cleanups = [];
  const later = (fn) => cleanups.push(fn);
  // The original randomly picks one of four team photos on first open and keeps the same person while paging
  let pick = -1;
  let initialLoad = true;

  function showPick(scope = document) {
    $$("[data-random-img]", scope).forEach((box) => {
      const imgs = $$("[data-preview-img]", box);
      if (!imgs.length) return;
      if (pick < 0) pick = Math.floor(Math.random() * imgs.length);
      imgs.forEach((f, i) => { if (i === pick) f.style.display = "block"; });
    });
  }

  // ───────── Height: pin the window height instead of vh because of the phone address bar ─────────
  function heights() {
    const set = () => {
      $$("[data-height]").forEach((el) => gsap.set(el, { height: innerHeight }));
      $$("[data-min-height]").forEach((el) => (el.style.minHeight = `${innerHeight}px`));
    };
    set();
    addEventListener("resize", set);
    later(() => removeEventListener("resize", set));
  }

  // ───────── First curtain: the white curtain lifts and the bottom nav rises from below ─────────
  function intro() {
    const curtain = $("[data-intro-curtain]");
    if (!curtain) return;
    const bar = $("header");
    gsap.to(curtain, { opacity: 0, duration: 0.7, ease: "expo.out", delay: 0.2, onComplete: () => gsap.set(curtain, { display: "none" }) });
    if (initialLoad && !mobile() && bar && !reduce) gsap.fromTo(bar, { yPercent: 100 }, { yPercent: 0, duration: 1.8, ease: "expo.out" });
  }

  // ───────── Changing word: tilted 7° it rises from 80px below, then exits 50px upward at −3° (2.25s beat) ─────────
  function changingText(el) {
    const spans = $$("span", el);
    gsap.to(el, { autoAlpha: 1, duration: 0.2 });
    if (reduce || spans.length < 2) return;
    const ease = "expo.out", each = 2.25;
    const rest = each * (spans.length - 1) + 0.75;
    const tl = gsap.timeline()
      .from(spans, { y: 80, skewY: 7, duration: 1.5, ease, stagger: { each, repeat: -1, repeatDelay: rest } })
      .to(spans, { y: -50, skewY: -3, duration: 1.5, ease, stagger: { each, repeat: -1, repeatDelay: rest } }, each);
    later(() => tl.kill());
  }

  // ───────── Round arrow: slips out to the right and re-enters from the left ─────────
  function arrowHover(box) {
    const svg = $("[data-anim-arrow] svg", box);
    if (!svg || reduce) return;
    box.addEventListener("mouseenter", () => {
      gsap.to(svg, { x: 30, duration: 0.5, ease: "expo.inOut" });
      gsap.set(svg, { x: -30, delay: 0.5 });
      gsap.to(svg, { x: 0, duration: 0.2, delay: 0.5, ease: "expo.out" });
    });
  }

  // ───────── Bottom nav underline: enters from the left (.8s) and exits to the right (.6s) on release ─────────
  function navHover(link) {
    if (reduce) return;
    link.addEventListener("mouseenter", () => gsap.fromTo(link, { "--fo-x": "-100%" }, { "--fo-x": "0%", duration: 0.8, ease: "expo.out" }));
    link.addEventListener("mouseleave", () => {
      gsap.killTweensOf(link);
      gsap.to(link, { "--fo-x": "105%", duration: 0.6, ease: "power4.out" });
    });
  }

  // ───────── Phone menu: a pink panel opens from top to bottom with clip ─────────
  function menu() {
    const bar = $("header"), btn = $("[data-menu-btn]"), nav = $("[data-nav-mobile]");
    if (!bar || !btn || !nav) return;
    const dot = $("[data-btn-dot]", btn), text = $("[data-btn-text]", btn), ig = $("[data-instagram]");
    let open = false;
    const ease = "power4.out";
    const fit = () => gsap.set(nav, { height: innerHeight - bar.offsetHeight });
    fit();
    const kill = () => gsap.killTweensOf([bar, dot, ig, btn, text, nav].filter(Boolean));
    const render = () => {
      kill();
      if (open) {
        gsap.to([bar, dot], { background: color("--kf-bg"), duration: 0.3, ease });
        if (ig) gsap.to(ig, { opacity: 1, pointerEvents: "all", duration: 0.3, ease });
        gsap.to(btn, { boxShadow: "0px 4px 4px rgba(0, 0, 0, 0)", duration: 0.3, ease });
        gsap.set(text, { textContent: "Close Menu" });
        gsap.to(btn, { x: 15, duration: 0.3, ease, delay: 0.2 });
        gsap.to(nav, { clipPath: "inset(0% 0% 0% 0%)", pointerEvents: "all", delay: 0.1, duration: 0.6, ease: "expo.out" });
        document.body.style.overflow = "hidden";
      } else {
        gsap.to(nav, { clipPath: "inset(0% 0% 100% 0%)", pointerEvents: "none", duration: 0.6, ease: "expo.inOut" });
        if (ig) gsap.to(ig, { opacity: 0, pointerEvents: "none", duration: 0.3, ease, delay: 0.2 });
        gsap.to(bar, { background: "transparent", duration: 0.3, ease, delay: 0.2 });
        gsap.set(text, { textContent: "Menu", delay: 0.1 });
        gsap.to(dot, { background: color("--kf-ink"), duration: 0.3, ease, delay: 0.2 });
        gsap.to(btn, { boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", duration: 0.3, ease, delay: 0.2 });
        gsap.to(btn, { x: 0, duration: 0.3, ease });
        document.body.style.overflow = "";
      }
    };
    btn.addEventListener("click", () => { open = !open; render(); });
    $$("[data-nav-item]").forEach((a) => a.addEventListener("click", () => { open = false; render(); }));
    const esc = (e) => { if (open && e.key === "Escape") { open = false; render(); } };
    addEventListener("keydown", esc);
    addEventListener("resize", fit);
    later(() => { removeEventListener("keydown", esc); removeEventListener("resize", fit); document.body.style.overflow = ""; });
  }

  // ───────── Phone slider (keen-slider original version): arrows fade at the ends ─────────
  function slider(list, scope) {
    if (typeof KeenSlider === "undefined") return;
    const prev = $("[data-arrow-left]", scope), next = $("[data-arrow-right]", scope);
    const ks = new KeenSlider(list, {
      loop: false, mode: "snap", slides: { perView: "auto", spacing: 25 },
      slideChanged: ({ track }) => {
        if (!prev || !next) return;
        const first = track.details.rel === 0, last = track.details.rel === track.details.slides.length - 2, d = 0.2;
        gsap.to(next, { pointerEvents: last ? "none" : "all", opacity: last ? 0.5 : 1, duration: d });
        gsap.to(prev, { pointerEvents: first ? "none" : "all", opacity: first ? 0.5 : 1, duration: d });
      },
    });
    if (prev) prev.addEventListener("click", () => ks.prev());
    if (next) next.addEventListener("click", () => ks.next());
    later(() => ks.destroy());
    return ks;
  }

  // ───────── Band flow (phone newsletter 12s · referred customers 24s) ─────────
  function marquee(el) {
    if (reduce) return;
    const dur = $("[data-template]")?.dataset.template === "about" ? 24 : 12;
    const tws = $$("[data-marquee-content]", el).map((p) => gsap.fromTo(p, { x: "0%" }, { x: "-100%", duration: dur, ease: "linear", repeat: -1 }));
    later(() => tws.forEach((t) => t.kill()));
  }

  // ───────── Panel rising from below (phone newsletter · news) ─────────
  const rise = (el, z, after) => {
    gsap.set(el, { display: "block", zIndex: z });
    gsap.fromTo(el, { y: "100%" }, { y: 0, delay: 0.1, ease: "expo.out", duration: 0.6, onComplete: after });
  };
  const sink = (el) => {
    gsap.to(el, { y: "100%", ease: "power4.out", duration: 0.5 });
    gsap.set(el, { display: "none", delay: 0.6 });
  };
  function sheet(overlay, openers) {
    const close = $("[data-close-overlay]", overlay);
    openers.forEach((b) => b.addEventListener("click", () => rise(overlay, 40)));
    if (close) close.addEventListener("click", () => sink(overlay));
  }
  // News panels go one at a time in slide order — ”Next news” keeps the current panel beneath while the next panel covers it rising up, then lowers the current panel
  function newsSheets() {
    const sheets = $$("[data-news-sheet]");
    if (!sheets.length) return;
    const closeAll = () => sheets.forEach(sink);
    $$("[data-news-carousel] .fo-slide").forEach((s, i) => s.addEventListener("click", () => rise(sheets[i % sheets.length], 50)));
    sheets.forEach((el, i) => {
      $("[data-close-overlay]", el)?.addEventListener("click", closeAll);
      $("[data-next-overlay]", el)?.addEventListener("click", () => {
        gsap.set(el, { zIndex: 30 });
        rise(sheets[(i + 1) % sheets.length], 50, () => sink(el));
      });
    });
    const esc = (e) => e.key === "Escape" && closeAll();
    addEventListener("keydown", esc);
    later(() => removeEventListener("keydown", esc));
  }

  // ───────── About accordion · team name accordion ─────────
  function accordion(container) {
    const template = $("[data-template]")?.dataset.template;
    const about = template === "about";
    const btns = $$("[data-accordion-btn]", container);
    const logo = $("[data-logo] g");
    const ease = "power2.out", duration = 0.4;
    const open = (c) => { gsap.to(c, { height: "auto", ease, duration }); gsap.to(c, { autoAlpha: 1, ease, duration, delay: 0.2 }); };
    const close = (c) => { gsap.to(c, { autoAlpha: 0, ease, duration }); gsap.to(c, { height: 0, ease, duration, delay: 0.1 }); };
    const itemOf = (b) => (about ? b.parentElement.parentElement : b.parentElement);
    btns.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        if (!about) {
          const previewImg = $$("[data-preview-img]")[pick];
          if (previewImg) gsap.to(previewImg, { ease: "expo.out", duration: 0.8, clipPath: "inset(0% 0 100% 0)" });
        }
        btns.forEach((other, j) => {
          const item = itemOf(other), content = $("[data-content]", item);
          if (!content) return;
          if (i === j) {
            open(content);
            if (about) {
              gsap.to($("[data-colon]", other), { autoAlpha: 1, duration: 0.1 });
              gsap.to($("[data-arrow]", other), { autoAlpha: 0, duration: 0.1 });
            } else {
              const dot = $("[data-member-dot]", item), img = $(`[data-member-img="${item.dataset.member}"]`), media = img && img.firstElementChild;
              if (img && media) {
                gsap.killTweensOf([img, media]);
                gsap.from(media, { scale: 1.5, ease: "expo.out", duration: 1.6 });
                gsap.set(img, { display: "flex" });
                gsap.fromTo(img, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", ease: "expo.out", duration: 0.8 });
                if (logo) gsap.to(logo, { fill: color(img.classList.contains("fo-member-img--illu") ? "--kf-ink" : "--kf-bg"), duration: 0.2 });
              }
              if (dot) { dot.setAttribute("data-open", ""); gsap.to(dot, { autoAlpha: 1, duration: 0.1 }); }
            }
          } else {
            close(content);
            if (about) {
              gsap.to($("[data-colon]", other), { autoAlpha: 0, duration: 0.1 });
              gsap.to($("[data-arrow]", other), { autoAlpha: 1, duration: 0.1 });
            } else {
              const dot = $("[data-member-dot]", item), img = $(`[data-member-img="${item.dataset.member}"]`);
              if (img) { gsap.killTweensOf(img); gsap.to(img, { ease: "expo.out", duration: 0.8, clipPath: "inset(0% 0 100% 0)" }); }
              if (dot) { dot.removeAttribute("data-open"); gsap.to(dot, { autoAlpha: 0, duration: 0.1 }); }
            }
          }
        });
      });
      if (!about) {
        const dot = btn.previousElementSibling;
        if (!dot) return;
        btn.addEventListener("mouseover", () => gsap.to(dot, { autoAlpha: 1, duration: 0.2 }));
        btn.addEventListener("mouseleave", () => { if (dot.dataset.open !== "") gsap.to(dot, { autoAlpha: 0, duration: 0.2 }); });
      }
    });
  }

  // ───────── Team filter: buttons are built from the tags, and pressing one collapses and expands the rows ─────────
  function filter(container) {
    const cats = $("[data-categories]", container);
    if (!cats) return;
    const items = $$("[data-filter-item]", container);
    const tags = [...new Set(items.flatMap((it) => $("[data-tags]", it).textContent.split(",")).filter(Boolean))];
    tags.forEach((t, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "fo-cat"; b.textContent = t; b.dataset.category = t;
      cats.append(b);
      if (i === tags.length - 1) { const pad = document.createElement("div"); pad.textContent = "____"; gsap.set(pad, { opacity: 0, pointerEvents: "none" }); cats.append(pad); }
    });
    gsap.to(cats, { opacity: 1, duration: 0.2, delay: 0.2 });
    const e = "power4.out", d = 0.3;
    const hide = (it) => { gsap.killTweensOf(it); gsap.to(it, { autoAlpha: 0, duration: d, ease: e }); gsap.to(it, { height: 0, duration: d, ease: e, delay: d / 2 }); gsap.set(it, { display: "none", delay: d * 2 }); };
    const show = (it) => { gsap.killTweensOf(it); gsap.set(it, { display: "block" }); gsap.to(it, { height: "auto", duration: 0.2, ease: e, delay: d / 2 }); gsap.to(it, { autoAlpha: 1, delay: d, duration: d, ease: e }); };
    cats.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-category]");
      if (!b) return;
      $$(".fo-cat", cats).forEach((c) => c.classList.toggle("is-on", c === b));
      items.forEach((it) => (b.dataset.category === "all" || $("[data-tags]", it).textContent.includes(b.textContent) ? show(it) : hide(it)));
    });
  }

  // ───────── Team page first scene: the white panel turns transparent and the wordmark sits over the photo as white text ─────────
  function teamLogo() {
    if ($("[data-template]")?.dataset.template !== "team") return;
    const box = $("[data-logo]"), g = $("[data-logo] g"), wrap = $("[data-random-img]");
    if (!box || !g || !wrap) return;
    const ease = "expo.out";
    gsap.to(box, { background: "transparent", duration: 0.8, ease, delay: 0.05 });
    gsap.to(g, { fill: color("--kf-bg"), duration: 0.8, ease, delay: 0.05 });
    const hole = $("[data-logo-hole]");
    if (hole) gsap.to(hole, { width: 152, height: 152, delay: 0.4, ease });
    $$("figure", wrap).forEach((f) => {
      gsap.fromTo(f, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", ease, duration: 0.8 });
      if (f.firstElementChild) gsap.from(f.firstElementChild, { scale: 1.5, ease, duration: 1.6 });
    });
  }

  // ───────── Team phone card: pressing ‹Say hi› turns on the contact info ─────────
  function helloCards(list) {
    $$("[data-hello-btn]", list).forEach((b) => b.addEventListener("click", () => {
      gsap.to(b.parentElement.previousElementSibling, { opacity: 1, duration: 0.1 });
      gsap.set(b, { display: "none" });
    }));
  }

  function init() {
    showPick();
    heights();
    intro();
    menu();
    $$("[data-changing-text]").forEach(changingText);
    $$('[data-animation="arrow"]').forEach(arrowHover);
    $$(".fo-nav-link").forEach(navHover);
    $$("[data-news-carousel], [data-list-carousel], [data-team-carousel]").forEach((l) => slider(l, l.parentElement));
    $$("[data-team-carousel]").forEach(helloCards);
    $$("[data-marquee]").forEach(marquee);
    $$("[data-mobile-newsletter-overlay]").forEach((o) => sheet(o, $$("[data-mobile-newsletter]")));
    newsSheets();
    $$("[data-filter]").forEach(filter);
    $$("[data-accordion-container]").forEach(accordion);
    teamLogo();
    $$(".wf-ui a").forEach((a) => a.setAttribute("data-router-disabled", ""));
    initialLoad = false;
  }
  const destroy = () => { cleanups.forEach((f) => f()); cleanups = []; };

  // ───────── Page turn ─────────
  const H = window.highway;
  // Opened as a file, fetch is blocked so paging doesn’t work — fall back to a normal link then
  if (!H || location.protocol === "file:") {
    addEventListener("DOMContentLoaded", () => setTimeout(init, 100));
    if (document.readyState !== "loading") setTimeout(init, 100);
    return;
  }

  const curtainOf = (c) => $(`[data-mobile-curtain="${c}"]`);
  // Phone: the color curtain covers from the top (.6s power3.out) and exits downward on the new page (.6s expo.inOut).
  const cover = (el, done) => { gsap.set(el, { zIndex: 40, autoAlpha: 1, display: "block", y: "-100%" }); gsap.to(el, { y: 0, duration: 0.6, delay: 0.1, ease: "power3.out", onComplete: done }); };
  const uncover = (el, done) => { gsap.to(el, { y: "100%", duration: 0.6, delay: 0.2, ease: "expo.inOut", onComplete: done }); gsap.set(el, { display: "none", delay: 0.8 }); };
  // The pressed box (or the ghost box behind it) grows to the next page’s panel size
  const grow = (el, w, h, d, done) => { gsap.set(el, { display: "flex", zIndex: 1 }); gsap.to(el, { position: "absolute", width: w, height: h, duration: d, ease: "power4.inOut", onComplete: done }); };
  const some = (sel) => $$(sel).length ? $$(sel) : null;
  const homeIn = (done) => {
    const e = "expo.out";
    gsap.from("[data-projects-box]", { autoAlpha: 0, duration: 0.8, ease: e, delay: 0.05 });
    gsap.from("[data-newsletter-box]", { autoAlpha: 0, duration: 0.8, ease: e, delay: 0.2 });
    gsap.from("[data-raum-box]", { autoAlpha: 0, duration: 0.8, ease: e, delay: 0.2, onComplete: done });
  };
  const workIn = (done) => {
    const els = some("[data-work-content], [data-accordion-container], [data-casestudies]");
    if (els) gsap.from(els, { autoAlpha: 0, duration: 0.2 });
    const more = some("[data-readmore]");
    if (more) gsap.fromTo(more, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, stagger: 0.15, ease: "expo.out", onComplete: done });
    else done();
  };
  const aboutIn = (done) => {
    const e = "expo.out";
    gsap.from("[data-team-box]", { autoAlpha: 0, duration: 0.8, ease: e, delay: 0.05 });
    gsap.from("[data-accordion-container]", { autoAlpha: 0, duration: 0.8, ease: e, delay: 0.2, onComplete: done });
  };
  const teamIn = (done) => gsap.fromTo("[data-team-content]", { autoAlpha: 0 }, { delay: 0.1, duration: 0.3, autoAlpha: 1, onComplete: done });
  const greenTeam = () => {
    const box = $("[data-team-box]");
    if (!box) return;
    gsap.to(box, { background: color("--site-green"), duration: 1, ease: "expo.out" });
    const pill = $(".fo-pill", box);
    if (pill) gsap.to(pill, { opacity: 0, duration: 0.05 });
  };
  const logoBack = () => {
    const e = "expo.out";
    const hole = $("[data-logo-hole]");
    if (hole) gsap.to(hole, { width: 0, height: 0, duration: 0.4, ease: e });
    gsap.to("[data-logo]", { background: color("--kf-bg"), duration: 0.8, ease: e });
    gsap.to("[data-logo] g", { fill: color("--kf-ink"), duration: 0.8, ease: e });
  };
  const byTemplate = (to, done) => {
    const t = to.dataset.template;
    if (t === "frontpage") homeIn(done);
    else if (t === "about") aboutIn(done);
    else if (t === "work") workIn(done);
    else done();
  };
  const start = (from) => { scrollTo(0, 0); from.remove(); };

  const T = (spec) => class extends H.Transition {
    in({ from, to, done }) { start(from); showPick(to); spec.in(to, done); }
    out({ from, done }) { spec.out(from, done); }
  };
  const instantOut = (from, done) => gsap.to(from, { duration: 0, autoAlpha: 1, onComplete: done });

  const transitions = {
    global: T({
      in: (to, done) => (mobile() ? uncover(curtainOf("pink"), done) : gsap.to(to, { duration: 0, autoAlpha: 1, onComplete: done })),
      out: (from, done) => {
        if (mobile()) { const c = curtainOf("pink"); gsap.set(c, { zIndex: 40, y: 0, display: "block" }); gsap.fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "power3.out", onComplete: done }); }
        else gsap.to(from, { duration: 0, autoAlpha: 0, onComplete: done });
      },
    }),
    contextual: {
      indextoabout: T({
        in: (to, done) => (mobile() ? uncover(curtainOf("red"), done) : gsap.fromTo("[data-about-content]", { autoAlpha: 0 }, { autoAlpha: 1, onComplete: done, duration: 0.2 })),
        out: (from, done) => {
          if (mobile()) return cover(curtainOf("red"), done);
          const ghost = $$("[data-about-box]")[1];
          [...ghost.children].forEach((c) => gsap.to(c, { autoAlpha: 0, duration: 0.2 }));
          grow(ghost, "70%", "94vh", 0.6, done);
        },
      }),
      indextoteam: T({
        in: (to, done) => (mobile() ? uncover(curtainOf("pink"), done) : teamIn(done)),
        out: (from, done) => {
          if (mobile()) return cover(curtainOf("pink"), done);
          const c = $("[data-index-team-curtain]");
          gsap.set(c, { display: "block" });
          gsap.to(c, { y: 0, duration: 0.6, ease: "power4.inOut" });
          grow($("[data-logo-transition]"), "60vw", "94vh", 0.6, done);
        },
      }),
      indextowork: T({
        in: (to, done) => (mobile() ? uncover(curtainOf("green"), done) : workIn(done)),
        out: (from, done) => {
          if (mobile()) return cover(curtainOf("green"), done);
          const news = $$("[data-newsletter-box]")[1], c = $("[data-index-work-curtain]");
          if (news) gsap.to($("[data-content]", news), { autoAlpha: 0, duration: 0.2, delay: 0.1 });
          greenTeam();
          gsap.set(c, { display: "block" });
          gsap.to(c, { x: 0, duration: 0.4, ease: "power4.inOut", onComplete: done });
        },
      }),
      abouttoindex: T({
        in: (to, done) => (mobile() ? uncover(curtainOf("red"), done) : homeIn(done)),
        out: (from, done) => {
          if (mobile()) return cover(curtainOf("red"), done);
          const c = $("[data-about-index-curtain]");
          gsap.set(c, { display: "block" });
          gsap.to(c, { autoAlpha: 1, duration: 0.1 });
          gsap.to("[data-accordion-container]", { autoAlpha: 0, duration: 0, delay: 0.2 });
          gsap.to(c, { delay: 0.2, width: "30%", height: "47vh", duration: 0.6, ease: "power4.inOut", onComplete: done });
        },
      }),
      abouttoteam: T({
        in: (to, done) => (mobile() ? uncover(curtainOf("pink"), done) : teamIn(done)),
        out: (from, done) => {
          if (mobile()) return cover(curtainOf("pink"), done);
          gsap.to("[data-about-content]", { autoAlpha: 0, duration: 0.2 });
          gsap.to("[data-accordion-container]", { background: color("--site-pink"), delay: 0.2, duration: 0.2 });
          grow($$("[data-logo-transition]")[1], "60vw", "94vh", 0.6, done);
        },
      }),
      abouttowork: T({
        in: (to, done) => workIn(done),
        out: (from, done) => {
          if (mobile()) return instantOut(from, done);
          greenTeam();
          gsap.to("[data-about-content]", { autoAlpha: 0, duration: 0.2 });
          gsap.to("[data-accordion-container]", { background: color("--kf-bg"), delay: 0.2, duration: 0.6, ease: "expo.out", onComplete: done });
        },
      }),
      teamtosmalllogo: T({
        in: (to, done) => byTemplate(to, done),
        out: (from, done) => {
          if (mobile()) return instantOut(from, done);
          gsap.to("[data-logo]", { height: "47vh", duration: 0.6, ease: "expo.out", delay: 0.5 });
          logoBack();
          gsap.to("[data-team-sections]", { opacity: 0, duration: 0.6, ease: "power4.inOut" });
          gsap.set("[data-random-img]", { background: color("--kf-bg") });
          gsap.to("[data-random-img]", { width: "30vw", duration: 0.6, ease: "expo.out", delay: 0.5, onComplete: done });
        },
      }),
      worktoabout: T({
        in: (to, done) => aboutIn(done),
        out: (from, done) => {
          if (mobile()) return instantOut(from, done);
          gsap.to(some("[data-casestudies], [data-work-box]"), { autoAlpha: 0, duration: 0.2, onComplete: done });
        },
      }),
      worktoteam: T({
        in: (to, done) => teamIn(done),
        out: (from, done) => {
          if (mobile()) return instantOut(from, done);
          const list = $("[data-casestudies]");
          [...list.children].forEach((c) => gsap.to(c, { autoAlpha: 0, duration: 0.2 }));
          gsap.to(list, { background: color("--site-pink"), duration: 0.6, ease: "expo.out" });
          grow($("[data-logo-transition]"), "60vw", "94vh", 0.6, done);
        },
      }),
    },
  };

  class Page extends H.Renderer {
    onEnter() { setTimeout(init, 100); }
    onLeaveCompleted() { destroy(); }
  }
  new H.Core({ renderers: { global: Page }, transitions });
})();
