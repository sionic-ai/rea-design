// Home page — carried over the order and values from original topPage.
// Cassette loader (appears in order at .5~.8s → 18 goes 00 → FINISHED in 1s · props pop → 1.2s later three layers fold away) · hero 1.2→1 · 4s slide · ticker 25s marquee
// · News panel pinned to bottom edge · giant marquee 20s · About panel pinned + window xPercent −130×3 · card carousel .8s power3.inOut · section name shuffle.
(() => {
  const ET = window.ET;
  const { mode, reduce, rand, shuffle } = ET;
  const pc = mode === "pc";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Hides the fixed panels at first (original init — turned on by an effect when entering via scroll)
  if (!reduce) {
    gsap.set(".mc-block.is-current, .mc-nav, .mc-items, .mv-tickets, .mv-cover, .mv-frame, .mv-items", { opacity: 0 });
    gsap.set(".in-content, .in-plane__wrapper, .in-plane__items", { opacity: 0 });
  }
  $(".et-ham").classList.add("is-show");
  if (!pc) $(".et-ham").classList.add("is-black");

  // ===== Display board: date·time (the original also adds temperature from weather agency values — temperature stays a placeholder) =====
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  $(".vs-board .is-today").textContent = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} (${["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][now.getDay()]})`;
  const tick = () => { const d = new Date(); $(".vs-board .is-hours").textContent = pad(d.getHours()); $(".vs-board .is-minutes").textContent = pad(d.getMinutes()); };
  tick();
  setInterval(tick, 10000);
  const board = $(".vs-board__icons"), row = $("p", board);
  const rowW = row.getBoundingClientRect().width;
  for (let i = 0; i < 2; i++) board.append(row.cloneNode(true));
  if (!reduce) { const loopBoard = () => gsap.fromTo(board, { x: 0 }, { x: -rowW, duration: 25, ease: "none", onComplete: loopBoard }); loopBoard(); }

  // ===== Giant Marquee Boundary =====
  const head = $(".in-headline__title"), word = $("span", head);
  const wordW = word.getBoundingClientRect().width;
  head.append(word.cloneNode(true));
  if (!reduce) { const loopHead = () => gsap.fromTo(head, { x: 0 }, { x: -wordW, duration: 20, ease: "none", onComplete: loopHead }); loopHead(); }

  ET.linkMarquee();

  // ===== News panel: if the panel is taller than the screen, top is raised by that much so it sticks at the bottom edge =====
  const news = $("#news"), visual = $("#visual");
  const resize = () => {
    const h = news.offsetHeight;
    news.style.top = pc ? -(h >= innerHeight ? h - innerHeight : 0) + "px" : "";
    if (!pc) visual.style.height = innerHeight + "px";
  };
  resize();
  addEventListener("resize", resize);

  // ===== Card carousel =====
  let block, count, busy = false;
  const setBlock = () => {
    block = $(".mc-block.is-current");
    busy = false;
    const ul = $("ul", block);
    if (block.dataset.count === "0") {
      count = $$("li", block).length;
      ul.insertAdjacentHTML("beforeend", ul.innerHTML);
      block.dataset.count = "1";
    } else count = $$("li", block).length / 2;
  };
  const place = () => {
    const c = count + 1;
    busy = false;
    const lis = $$("li", block);
    lis.forEach((li) => { li.removeAttribute("style"); li.className = ""; });
    const at = (n, cls) => lis[n - 1]?.classList.add(cls);
    at(c - 2, "pos-nextleft"); at(c - 1, "pos-left"); at(c, "pos-center"); at(c + 1, "pos-right"); at(c + 2, "pos-nextright");
    const num = Number($(".pos-center", block).dataset.num);
    $$(".mc-block__paging span", block).forEach((s, i) => s.classList.toggle("is-current", i + 1 === num));
  };
  setBlock();
  place();
  const tilt = (el, deg) => {
    const s = $$(".mc-card", el);
    gsap.to(s, { rotate: deg, duration: 0.5, ease: "power2.inOut" });
    gsap.to(s, { rotate: 0, duration: 0.3, delay: 0.5, ease: "power2.out" });
  };
  const go = (dir) => {
    if (busy) return;
    busy = true;
    ET.scrollToY(Math.floor($("#members").getBoundingClientRect().top + scrollY), 0.6);
    const L = $(".pos-left", block), C = $(".pos-center", block), R = $(".pos-right", block), NL = $(".pos-nextleft", block), NR = $(".pos-nextright", block);
    const ul = $("ul", block);
    if (reduce) {
      dir === "next" ? ul.append($("li", ul)) : ul.prepend($("li:last-child", ul));
      place();
      return;
    }
    if (dir === "next") {
      gsap.to(L, { marginLeft: pc ? "-110%" : "-200%", scale: 0.6, duration: 0.8, ease: "power3.inOut" });
      gsap.to(C, { marginLeft: pc ? "-55%" : "-105%", scale: 0.8, duration: 0.8, ease: "power3.inOut" });
      gsap.to(R, { marginLeft: "0%", scale: 1, duration: 0.8, ease: "power3.inOut" });
      [L, C, R, NR].forEach((el) => tilt(el, -8));
      gsap.to(NR, { marginLeft: pc ? "55%" : "105%", scale: 0.8, duration: 0.8, ease: "power3.inOut", onComplete: () => { ul.append($("li", ul)); place(); } });
    } else {
      gsap.to(L, { marginLeft: "0%", scale: 1, duration: 0.8, ease: "power3.inOut" });
      gsap.to(C, { marginLeft: pc ? "55%" : "105%", scale: 0.8, duration: 0.8, ease: "power3.inOut" });
      gsap.to(R, { marginLeft: pc ? "110%" : "200%", scale: 0.6, duration: 0.8, ease: "power3.inOut" });
      [L, C, R, NL].forEach((el) => tilt(el, 8));
      gsap.to(NL, { marginLeft: pc ? "-55%" : "-105%", scale: 0.8, duration: 0.8, ease: "power3.inOut", onComplete: () => { ul.prepend($("li:last-child", ul)); place(); } });
    }
  };
  $$(".mc-block__prev, .mc-block__next").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); go(b.dataset.dir); }));
  $$(".mc-nav a").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    if (busy) return;
    busy = true;
    ET.scrollToY(Math.floor($("#members").getBoundingClientRect().top + scrollY), 0.6);
    $$(".mc-nav li").forEach((li) => li.classList.toggle("is-current", li === a.parentNode));
    const next = $(".mc-block--" + a.dataset.team);
    // Panel color is a skin variable (oklch), so change it with a CSS transition (.6s power2.inOut curve) instead of GSAP.
    $(".mc__bg").style.backgroundColor = a.dataset.color;
    gsap.to(block, { y: 50, opacity: 0, duration: reduce ? 0 : 0.6, ease: "power2.inOut", onComplete: () => {
      block.removeAttribute("style");
      block.classList.remove("is-current");
      next.classList.add("is-current");
      setBlock();
      place();
      gsap.fromTo(next, { opacity: 0, y: 50 }, { y: 0, opacity: 1, duration: reduce ? 0 : 0.6, ease: "power2.inOut" });
    } });
  }));

  // ===== Scroll effect (first page only) =====
  ET.registerEffect("newsList", (el) => {
    el.style.opacity = "";
    const lis = $$("li", el), U = pc ? 0 : 0.5;
    lis.forEach((li, i) => {
      const date = $(".nw-date", li), digits = $$(".nw-date i", li);
      date.style.opacity = 0;
      gsap.fromTo(li, { opacity: 0 }, { delay: U + 0.1 * (i + 1), opacity: 1, duration: 0.4, ease: "power2.out", onComplete: () => { date.style.opacity = ""; shuffle(digits, 2000); } });
    });
    $$(".nw-items > p").forEach((p, i) => gsap.fromTo(p, { opacity: 0, y: 100 }, { delay: 1 + 0.1 * (i + 1), opacity: 1, y: 0, duration: 1, ease: "circ.out" }));
  });
  ET.registerEffect("members", (el) => {
    el.style.opacity = "";
    gsap.fromTo(".mc-block.is-current", { opacity: 0, y: 50 }, { delay: 0.5, opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
    gsap.fromTo(".mc-nav", { opacity: 0, y: 50 }, { delay: 0.5, opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
    gsap.set(".mc-items", { opacity: 1 });
    $$(".mc-items > p").forEach((p, i) => gsap.fromTo(p, { opacity: 0, y: 100 }, { delay: 1 + 0.2 * (i + 1), opacity: 1, y: 0, duration: 1, ease: "circ.out" }));
  });
  ET.registerEffect("movie", (el) => {
    el.style.opacity = "";
    gsap.set(".mv-tickets, .mv-items", { opacity: 1 });
    $$(".mv-tickets p > span").forEach((s, i) => {
      gsap.fromTo(s, { opacity: 0 }, { delay: 0.1 * (i + 1), opacity: 1, duration: 0.2, ease: "power2.out" });
      gsap.fromTo(s, { x: pc ? rand(-500, 500) : 0, y: rand(-300, 300), rotate: pc ? rand(-20, 20) : 0 }, { delay: 0.1 * (i + 1), x: 0, y: 0, rotate: 0, duration: 1, ease: "circ.out" });
    });
    gsap.fromTo(".mv-cover", { opacity: 0 }, { delay: 1, opacity: 1, duration: 0.6, ease: "power2.out" });
    $$(".mv-items > p").forEach((p, i) => gsap.fromTo(p, { opacity: 0, y: 100 }, { delay: 1 + 0.2 * (i + 1), opacity: 1, y: 0, duration: 1, ease: "circ.out" }));
    gsap.fromTo(".mv-frame", { opacity: 0 }, { delay: 1, opacity: 1, duration: 0.6, ease: "power2.out" });
  });
  const introContent = () => {
    const box = $(".in-content");
    const title = $(".in-content__title", box);
    const wraps = $$(`.in-text.${pc ? "et-pc" : "et-sp"} .et-bar`, box), covers = $$(`.in-text.${pc ? "et-pc" : "et-sp"} .et-bar__cover`, box);
    gsap.set(box, { opacity: 1 });
    gsap.fromTo(title, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 0.6, ease: "circ.out" });
    gsap.fromTo(wraps, { scaleX: 0 }, { delay: 0.6, scaleX: 1, duration: 0.6, ease: "circ.inOut", onComplete: () => {
      gsap.set(wraps, { clearProps: "transform" });
      gsap.fromTo(covers, { scaleX: 1 }, { scaleX: 0, duration: 0.6, ease: "circ.inOut" });
    } });
    $$(".in-content__items > p").forEach((p, i) => gsap.fromTo(p, { opacity: 0, y: 100 }, { delay: 1 + 0.15 * (i + 1), opacity: 1, y: 0, duration: 1, ease: "circ.out" }));
  };
  const introPlane = () => {
    gsap.fromTo(".in-plane__wrapper", { opacity: 0, x: 500 }, { opacity: 1, x: 0, duration: 1.6, ease: "circ.out" });
    gsap.set(".in-plane__items", { opacity: 1 });
    const els = pc ? $$(".in-plane__items > p") : $$(".in-window");
    els.forEach((p, i) => gsap.fromTo(p, { opacity: 0, y: 100 }, { delay: (pc ? 1.6 : 0) + 0.2 * (i + 1), opacity: 1, y: 0, duration: 1, ease: "circ.out" }));
    if (!pc) gsap.set(".in-plane__items", { opacity: 1 });
  };

  // ===== Section name vertical label · logo · back to top — range detection from the original scrollEvents =====
  const title = $(".et-section-title"), titleSpan = $("span", title);
  const pagetop = $(".et-pagetop"), back = $(".et-backtotop");
  let current = "", introShown = false, introContentShown = false;
  const setTitle = (key, text, white) => {
    titleSpan.classList.toggle("is-white", white);
    if (current === key) return;
    current = key;
    titleSpan.textContent = text;
    shuffle(titleSpan, 800);
  };
  ET.onScroll = () => {
    const y = scrollY, H = innerHeight;
    const e = visual.offsetHeight, t = news.offsetHeight;
    const o = $("#introduction").offsetHeight + $(".in").offsetHeight;
    const a = $("#members").offsetHeight, n = $("#movie").offsetHeight;
    const half = Math.floor(e / 2), hh = Math.floor(H / 2);
    [pagetop, back].forEach((el) => el.classList.toggle("is-show", y >= e));
    title.classList.toggle("is-show", y >= half && y < e + t + o + a);
    const ham = $(".et-ham");
    if (y >= half && y < e + t / 2) { setTitle("news", "NEWS", false); ham.classList.remove("is-black"); pagetop.classList.remove("is-black"); }
    else if (y >= e + t / 2 && y < e + t + o - hh) { setTitle("intro", "SECTION TITLE", false); ham.classList.add("is-black"); pagetop.classList.add("is-black"); }
    else if (y >= e + t + o - hh && y < e + t + o + a - hh) { setTitle("members", "MEMBERS", false); ham.classList.add("is-black"); pagetop.classList.add("is-black"); }
    else if (y >= e + t + o + a - hh && y < e + t + o + a + n - hh) { setTitle("movie", "MOVIE", true); ham.classList.remove("is-black"); pagetop.classList.remove("is-black"); }
    else if (y >= e + t + o + a + n - hh) { ham.classList.add("is-black"); pagetop.classList.add("is-black"); }
    else if (pc) { ham.classList.remove("is-black"); }
    const s = $(".in").getBoundingClientRect().top + y, m = $("#members").getBoundingClientRect().top + y;
    if (y >= s && y < m && !introShown) {
      introShown = true;
      if (reduce) gsap.set(".in-content, .in-plane__wrapper, .in-plane__items", { opacity: 1 });
      else if (pc) { introContent(); introPlane(); introContentShown = true; }
      else introPlane();
    }
    if (!pc && !introContentShown && y >= $(".in-content").getBoundingClientRect().top + y - hh) {
      introContentShown = true;
      reduce ? gsap.set(".in-content", { opacity: 1 }) : introContent();
    }
  };

  // ===== About panel pinned + window flows horizontally (scrub 0, end = Window line width) =====
  const setIntroPin = () => {
    const wins = $$(".in-window"), wrap = $(".in-plane__wrapper");
    const px = (el, p) => parseFloat(getComputedStyle(el)[p]) || 0;
    const w = wins[0].offsetWidth * wins.length + px(wins[0], "marginLeft") + px(wins[1], "marginLeft") + px(wins[1], "marginRight") + px(wins[2], "marginLeft") + px(wins[2], "marginRight") + px(wins[3], "marginRight");
    wrap.style.width = w + "px";
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(wins, { xPercent: (pc ? -130 : -119) * (wins.length - 1), ease: "none", scrollTrigger: { trigger: ".in__inner", pin: true, scrub: 0, start: "top top", end: "+=" + w, anticipatePin: 1, invalidateOnRefresh: true } });
    });
  };

  // ===== Hero slide (4s) =====
  const loopVisual = () => {
    const wrap = pc ? "#visualPC" : "#visualSP";
    const slides = $$(`${wrap} .vs-main__slide`), n = slides.length;
    const ctrl = $(".vs-board__controller");
    let timer;
    const idx = () => slides.findIndex((s) => s.classList.contains("is-current")) + 1;
    const change = (dir) => {
      if (ctrl.classList.contains("is-hidden")) return;
      ctrl.classList.add("is-hidden");
      const o = idx(), i = dir === "next" ? (o < n ? o + 1 : 1) : (o > 1 ? o - 1 : n);
      const s = slides[i - 1];
      s.classList.add("is-next");
      if (pc) [$(".et-sidenav"), $(".vs__title"), $(".et-ham")].forEach((el) => el.classList.toggle("is-black", s.dataset.color === "black"));
      gsap.fromTo(s, { scale: 1.1, opacity: 0 }, { scale: 1, opacity: 1, duration: reduce ? 0 : 1.2, ease: "circ.out", onComplete: () => {
        slides.forEach((p) => p.classList.remove("is-current"));
        s.classList.remove("is-next");
        s.classList.add("is-current");
        s.removeAttribute("style");
        ctrl.classList.remove("is-hidden");
        if (!reduce) timer = setTimeout(() => change("next"), 4000);
      } });
    };
    if (!reduce) timer = setTimeout(() => change("next"), 4000);
    $$("a", ctrl).forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      if (!a.dataset.type) return;
      clearTimeout(timer);
      change(a.dataset.type);
    }));
  };

  // ===== Loader =====
  const finishedLoading = () => {
    $("#loader")?.remove();
    const show = pc ? $$(".et-sidenav, .vs__title, .vs__logo, .vs-board") : $$(".vs__title .et-sp, .vs__logo");
    show.forEach((el) => (el.style.visibility = ""));
    if (pc) shuffle(".et-sidenav a", 800);
    shuffle(pc ? ".vs__title .et-pc" : ".vs__title .et-sp", 800);
    if (reduce) return;
    gsap.fromTo(".vs__logo", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(".vs__logo", { rotate: rand(-30, 30) }, { rotate: 0, duration: 1, ease: "elastic.out(1, 0.3)", clearProps: "transform" });
    if (pc) gsap.fromTo(".vs-board", { y: 68 }, { y: 0, duration: 0.8, ease: "circ.out" });
  };
  const initFinishedLoading = () => {
    const hide = pc ? $$(".et-sidenav, .vs__title, .vs__logo, .vs-board") : $$(".vs__title .et-sp, .vs__logo");
    hide.forEach((el) => (el.style.visibility = "hidden"));
    setIntroPin();
    ET.startScroll();
    ET.smooth();
    if (reduce) { gsap.set("#loader", { display: "none" }); finishedLoading(); loopVisual(); return; }
    const ax = pc ? "scaleX" : "scaleY";
    gsap.to("#loader .ld__content", { [pc ? "width" : "height"]: 0, duration: 1.2, ease: "power3.inOut" });
    gsap.to("#loader .ld__bg.is-2", { [ax]: 0, duration: 1.2, delay: 0.1, ease: "power3.inOut" });
    gsap.to("#loader .ld__bg.is-1", { [ax]: 0, duration: 1.2, delay: 0.2, ease: "power3.inOut", onComplete: finishedLoading });
    gsap.fromTo(pc ? ".vs-main__wrapper" : ".vs-main__sp", { scale: 1.2 }, { scale: 1, duration: 1.2, delay: 0.2, ease: "circ.out", onComplete: loopVisual });
  };
  const countDone = () => {
    $$(".ld-cas__gear").forEach((g) => g.classList.remove("is-animate"));
    gsap.to(".ld-cas__bg, .ld-cas__gear circle", { fill: getComputedStyle(document.documentElement).getPropertyValue("--site-ink"), duration: 1, ease: "power2.out" });
    gsap.to(".ld-cas__line", { fill: getComputedStyle(document.documentElement).getPropertyValue("--kf-accent"), duration: 1, ease: "power2.out" });
    const e = pc ? 30 : 10;
    $(".ld__finished").style.display = "block";
    gsap.fromTo(".ld__timer", { y: 0 }, { y: -e, opacity: 0, duration: 0.5, ease: "circ.out" });
    gsap.fromTo(".ld__finished", { y: e, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "circ.out" });
    $$(".ld__items").forEach((el) => { el.style.display = "block"; gsap.fromTo(el, { y: 50, opacity: 0, rotate: rand(-50, 50) }, { delay: rand(1, 5) / 10, y: 0, opacity: 1, rotate: 0, duration: 0.6, ease: "back.out(2)" }); });
    $$(".ld__lines").forEach((el) => { el.style.display = "block"; gsap.fromTo(el, { scale: 0, opacity: 0 }, { delay: rand(1, 5) / 10, scale: 1, opacity: 1, duration: 0.4, ease: "back.out(3)" }); });
    setTimeout(initFinishedLoading, 1200);
  };
  const showContent = () => {
    scrollTo(0, 0);
    ET.stopScroll();
    // Original uses a one-hour cookie to skip the loader text from the second visit on, only lifting the curtain
    const KEY = "et-brand-loading", seen = Number(localStorage.getItem(KEY) || 0) > Date.now();
    if (!seen) localStorage.setItem(KEY, String(Date.now() + 36e5));
    const skip = seen && !/[?&]debug/.test(location.search);
    if (skip || reduce) { $(".ld__inner").remove(); initFinishedLoading(); return; }
    $$(".ld__items, .ld__lines").forEach((el) => (el.style.display = "none"));
    gsap.fromTo(".ld__cassette", { opacity: 0, y: 30 }, { delay: 0.5, opacity: 1, y: 0, duration: 0.6, ease: "circ.out" });
    gsap.fromTo(".ld__timer", { opacity: 0, y: 30 }, { delay: 0.6, opacity: 1, y: 0, duration: 0.6, ease: "circ.out" });
    gsap.fromTo(".ld__bar", { opacity: 0, y: 30 }, { delay: 0.7, opacity: 1, y: 0, duration: 0.6, ease: "circ.out" });
    gsap.fromTo(".ld__icons", { opacity: 0, y: 30 }, { delay: 0.8, opacity: 1, y: 0, duration: 0.6, ease: "circ.out", onComplete: () => {
      const t = { count: 18 }, num = $(".ld__timer-num span");
      $$(".ld-cas__gear").forEach((g) => g.classList.add("is-animate"));
      gsap.to(t, { count: 0, duration: 1, ease: "none", onUpdate: () => { num.textContent = String(Math.floor(t.count)).padStart(2, "0"); } });
      gsap.to(".ld__bar span", { scaleX: 1, duration: 1, ease: "none", onComplete: countDone });
    } });
  };

  // ===== Video window =====
  const modal = $(".et-modal");
  $(".et-movie").addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "block";
    modal.classList.add("is-movie");
    ET.lenis?.stop();
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.3, ease: "power1.out" });
  });
  const closeModal = (e) => {
    e.preventDefault();
    ET.lenis?.start();
    gsap.to(modal, { opacity: 0, delay: reduce ? 0 : 0.1, duration: reduce ? 0 : 0.4, ease: "power1.out", onComplete: () => { modal.removeAttribute("style"); modal.classList.remove("is-movie"); } });
  };
  $(".et-modal__close a").addEventListener("click", closeModal);
  $(".et-modal__close-bg").addEventListener("click", closeModal);

  ET.setEffects();
  // The original starts after all images in the document are loaded (max 3 seconds) — this copy waits until fonts and the document have all arrived
  const ready = () => (document.fonts?.ready || Promise.resolve()).then(showContent);
  document.readyState === "complete" ? ready() : addEventListener("load", ready, { once: true });
})();
