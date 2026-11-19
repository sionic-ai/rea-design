/* Brand shared — stone illustration, Lenis (1.3.25, duration .4), menu drawer, page transition (body .5s blur → move), 
   Raccoon tail (sways while scrolling · press eight times for the boss), screen saver (30s), contact and footer logos, handwritten heading, brush mask entrance. */
(() => {
  const STONES = {"1":{"w":135,"h":92,"d":"M2.7 4.6C13.9 -3.1 45.9 0.2 67.5 0.0C89.1 -0.2 121.7 -2.8 132.3 3.7C142.9 10.1 134.1 32.0 130.9 38.6C127.8 45.2 116.1 40.5 113.4 43.2C110.7 46.0 111.2 52.3 114.8 55.2C118.3 58.1 131.8 55.0 135.0 60.7C138.2 66.4 144.9 84.0 133.7 89.2C122.4 94.5 89.1 91.8 67.5 92.0C45.9 92.2 15.3 97.8 4.0 90.2C-7.2 82.5 0.2 60.3 0.0 46.0C-0.2 31.7 -8.6 12.3 2.7 4.6Z"},"2":{"w":56,"h":107,"d":"M19.6 0.0C25.0 -0.4 37.6 1.1 42.0 4.3C46.4 7.5 47.1 14.6 45.9 19.3C44.7 23.9 34.3 28.2 34.7 32.1C35.1 36.0 45.4 35.3 48.2 42.8C51.0 50.3 51.6 66.7 51.5 77.0C51.4 87.4 54.3 99.9 47.6 104.9C40.9 109.9 18.2 111.6 11.2 107.0C4.2 102.4 6.0 87.4 5.6 77.0C5.2 66.7 6.3 52.3 9.0 44.9C11.6 37.6 21.1 37.1 21.3 33.2C21.5 29.2 12.0 25.9 10.1 21.4C8.1 16.9 7.9 10.0 9.5 6.4C11.1 2.9 14.2 0.4 19.6 0.0Z"},"3":{"w":114,"h":101,"d":"M11.4 5.1C22.8 -3.4 52.2 -0.8 68.4 0.0C84.5 0.8 100.7 2.5 108.3 10.1C115.9 17.7 117.8 37.7 114.0 45.5C110.2 53.2 95.0 55.2 85.5 56.6C76.0 57.9 61.8 52.4 57.0 53.5C52.2 54.7 49.4 61.1 57.0 63.6C64.6 66.2 93.9 64.1 102.6 68.7C111.3 73.2 116.1 85.5 109.4 90.9C102.8 96.3 79.0 100.2 62.7 101.0C46.4 101.8 21.9 104.4 11.4 95.9C0.9 87.5 0.0 65.7 0.0 50.5C0.0 35.4 0.0 13.5 11.4 5.1Z"},"4":{"w":177,"h":96,"d":"M7.1 25.9C16.8 15.5 41.9 9.1 58.4 4.8C74.9 0.5 90.6 -0.5 106.2 0.0C121.8 0.5 140.4 0.5 152.2 7.7C164.0 14.9 174.3 29.4 177.0 43.2C179.7 57.0 182.9 81.4 168.2 90.2C153.4 99.0 110.6 96.2 88.5 96.0C66.4 95.8 50.1 94.1 35.4 89.3C20.6 84.5 4.7 77.8 0.0 67.2C-4.7 56.6 -2.7 36.3 7.1 25.9Z"},"5":{"w":150,"h":85,"d":"M0.0 13.6C2.0 3.3 11.8 -0.1 18.0 2.5C24.2 5.2 28.0 23.5 37.5 29.7C47.0 36.0 63.2 40.7 75.0 39.9C86.8 39.2 98.5 32.2 108.0 25.5C117.5 18.8 125.0 1.1 132.0 0.0C139.0 -1.1 147.5 8.8 150.0 18.7C152.5 28.6 154.5 48.4 147.0 59.5C139.5 70.5 122.0 80.8 105.0 85.0C88.0 89.2 61.5 88.4 45.0 85.0C28.5 81.6 13.5 76.5 6.0 64.6C-1.5 52.7 -2.0 23.9 0.0 13.6Z"},"6":{"w":34,"h":18,"d":"M0.0 7.6C1.7 4.9 8.5 0.9 13.6 0.0C18.7 -0.9 27.2 0.4 30.6 2.2C34.0 4.0 35.7 8.2 34.0 10.8C32.3 13.4 25.5 17.1 20.4 18.0C15.3 18.9 6.8 17.9 3.4 16.2C0.0 14.5 -1.7 10.3 0.0 7.6Z"},"7":{"w":173,"h":88,"d":"M0.0 37.0C5.2 27.0 21.6 14.4 34.6 10.6C47.6 6.7 63.4 15.8 77.9 14.1C92.3 12.3 106.7 -0.6 121.1 0.0C135.5 0.6 155.7 8.8 164.3 17.6C173.0 26.4 177.3 43.1 173.0 52.8C168.7 62.5 154.3 71.0 138.4 75.7C122.5 80.4 95.2 78.9 77.9 81.0C60.6 83.0 47.0 89.8 34.6 88.0C22.2 86.2 9.2 78.9 3.5 70.4C-2.3 61.9 -5.2 46.9 0.0 37.0Z"},"8":{"w":143,"h":85,"d":"M0.0 73.1C-9.5 63.2 4.8 37.7 14.3 25.5C23.8 13.3 41.7 3.5 57.2 0.0C72.7 -3.5 93.4 -2.1 107.2 4.2C121.1 10.6 134.2 25.4 140.1 38.2C146.1 51.1 154.4 73.8 143.0 81.6C131.6 89.4 95.3 86.4 71.5 85.0C47.7 83.6 9.5 83.0 0.0 73.1Z"}};
  /* Raccoon face = Spot where eight pebbles are stacked on a 324×278 board (left, top and width of the original PC layout) */
  const FACE = { 1: [12, 186, 135], 2: [149, 161, 56], 3: [205, 174, 114], 4: [0, 91, 177], 5: [174, 92, 150], 6: [86, 73, 34], 7: [10, 0, 173], 8: [172, 10, 143] };
  const stone = (n) => { const s = STONES[n]; return `<svg viewBox="0 0 ${s.w} ${s.h}" aria-hidden="true"><path d="${s.d}"/></svg>`; };
  const face = (eyes) => {
    let g = "";
    for (const n of [7, 8, 6, 4, 5, 2, 1, 3]) {
      const [x, y, w] = FACE[n], s = STONES[n], k = w / s.w;
      g += `<path transform="translate(${x} ${y}) scale(${k})" d="${s.d}"/>`;
    }
    if (eyes) g += `<g class="t-face-eyes"><ellipse cx="66" cy="132" rx="9" ry="7"/><ellipse cx="252" cy="128" rx="9" ry="7"/></g>`;
    return `<svg viewBox="0 0 324 278" aria-hidden="true">${g}</svg>`;
  };
  const line = (d, w = 1.6) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  /* Monster doodles, tail, boss, leaf, rice ball — original hand drawings replaced with our own line art at the same size */
  const ART = {
    stone: (el) => stone(el.dataset.n || 1),
    face: (el) => face(el.dataset.eyes === "1"),
    tail: () => `<svg viewBox="0 0 100 64" aria-hidden="true"><path d="M100 30C80 6 44 -4 18 8 2 16-2 34 8 46c10 12 30 18 50 14 18-4 30-14 42-22Z"/><path d="M8 46c6-10 18-14 26-12-8 6-12 14-10 22-6-2-12-5-16-10Z" fill="var(--site-paper)" opacity=".55"/></svg>`,
    kasa: () => `<svg viewBox="0 0 65 42" aria-hidden="true">${line("M4 26 32 4l29 22M4 26c9-4 18-4 28 0 10-4 19-4 29 0M32 4v36M24 40h16")}<circle cx="22" cy="18" r="2"/></svg>`,
    eye: () => `<svg viewBox="0 0 65 27" aria-hidden="true">${line("M3 14C14 3 50 3 62 14 50 25 14 25 3 14Z")}<circle cx="32" cy="14" r="6"/></svg>`,
    kao: () => `<svg viewBox="0 0 63 55" aria-hidden="true">${line("M8 20C8 8 22 3 32 3s24 5 24 17c4 12-2 30-24 31C10 50 4 34 8 20Z")}<circle cx="23" cy="24" r="2.4"/><circle cx="41" cy="24" r="2.4"/>${line("M26 36c4 3 8 3 12 0")}</svg>`,
    note: () => `<svg viewBox="0 0 58 65" aria-hidden="true">${line("M6 4h40l8 8v49H6Z M46 4v8h8 M14 22h28 M14 32h28 M14 42h20")}</svg>`,
    tokkuri: () => `<svg viewBox="0 0 62 59" aria-hidden="true">${line("M25 3h12v10c14 6 20 18 18 30-2 12-14 14-24 14S9 55 7 43C5 31 11 19 25 13Z M22 3h18")}</svg>`,
    kin: () => `<svg viewBox="0 0 82 73" aria-hidden="true">${line("M6 40C6 20 22 6 41 6s35 14 35 34-16 28-35 28S6 60 6 40Z M18 34h46 M41 6v10")}</svg>`,
    shippo: () => `<svg viewBox="0 0 90 58" aria-hidden="true">${line("M86 28C70 8 40 2 18 10 4 16 2 32 10 42c10 12 30 14 46 10 14-4 22-12 30-24Z M24 18c6 8 6 22 0 30 M44 12c6 10 6 26 0 38")}</svg>`,
    hara: () => `<svg viewBox="0 0 62 56" aria-hidden="true">${line("M8 30C8 14 20 4 31 4s23 10 23 26-10 22-23 22S8 46 8 30Z")}<circle cx="31" cy="32" r="3"/></svg>`,
    leaf: () => `<svg viewBox="0 0 63 45" aria-hidden="true"><path d="M4 40C10 14 32 2 60 4 56 30 34 44 4 40Z"/>${line("M4 40C20 30 36 20 52 10", 1.2).replace("currentColor", "var(--site-paper)")}</svg>`,
    onigiri: () => `<svg viewBox="0 0 34 33" aria-hidden="true"><path d="M17 2C24 2 32 20 32 26s-6 6-15 6-15 0-15-6S10 2 17 2Z"/><path d="M8 22h18v10H8Z" fill="var(--site-paper)" opacity=".35"/></svg>`,
    boss: () => `<svg viewBox="0 0 259 290" aria-hidden="true"><g transform="translate(12 0) scale(.72)">${face(false).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g><path d="M30 210C30 170 80 150 130 150s100 20 100 60-30 78-100 78S30 250 30 210Z"/><circle cx="130" cy="230" r="34" fill="var(--site-paper)" opacity=".4"/></svg>`,
    blob: () => `<svg viewBox="0 0 188 209" preserveAspectRatio="none" aria-hidden="true"><path d="M30 34C52 8 100 0 136 12c34 12 52 46 50 92-2 44-14 82-46 98-34 16-86 8-112-20C2 156-4 110 6 80c6-18 12-32 24-46Z"/></svg>`,
    arrow: () => `<svg viewBox="0 0 55 7" aria-hidden="true"><path d="M0 6h53L45 1"/></svg>`,
    ext: () => `<svg viewBox="0 0 13 13" aria-hidden="true"><path d="M2 11 11 2M4 2h7v7" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`,
  };
  const paint = (root = document) => {
    root.querySelectorAll("[data-art]:not([data-art-done])").forEach((el) => {
      const f = ART[el.dataset.art];
      if (!f) return;
      el.innerHTML = f(el);
      el.setAttribute("data-art-done", "");
    });
  };
  paint();

  const html = document.documentElement;
  const setVw = () => html.style.setProperty("--vw", `${html.clientWidth}px`);
  setVw();
  new ResizeObserver(setVw).observe(html);

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.Tanu = { paint, reduce, stone, face };
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  /* Lenis — original settings as they are (lerp 1, duration .4: follows one wheel notch within .4s), driven by the GSAP ticker */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 1, duration: 0.4, anchors: { offset: 0 } });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  Tanu.lenis = lenis;
  document.querySelectorAll(".js-top").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" }); }));

  /* Menu drawer — the moment it opens the logo appears in .3s from -20% above at a random tilt, then settles in place with .35s steps(3) */
  const menu = document.querySelector(".t-menu");
  const container = document.querySelector(".t-container");
  let open = false;
  const openMenu = () => {
    if (open || !menu) return;
    open = true;
    lenis?.stop();
    html.classList.add("is-menu-open", "is-scroll-lock");
    menu.setAttribute("aria-hidden", "false");
    menu.removeAttribute("inert");
    container?.setAttribute("inert", "");
    const logo = menu.querySelector(".t-menu__logo");
    if (logo) {
      gsap.set(logo, { yPercent: -20, rotation: gsap.utils.random(-10, 10), opacity: 0 });
      gsap.timeline().to(logo, { opacity: 1, duration: 0.3, ease: "sine.out" }).to(logo, { yPercent: 0, rotation: 0, duration: 0.35, ease: "steps(3)" });
    }
  };
  const closeMenu = () => {
    if (!open || !menu) return;
    open = false;
    lenis?.start();
    html.classList.remove("is-menu-open", "is-scroll-lock");
    menu.setAttribute("aria-hidden", "true");
    menu.setAttribute("inert", "");
    container?.removeAttribute("inert");
  };
  if (menu) menu.setAttribute("inert", "");
  document.querySelectorAll(".js-menu-button").forEach((b) => b.addEventListener("click", openMenu));
  document.querySelectorAll(".js-close-button").forEach((b) => b.addEventListener("click", closeMenu));
  document.querySelector(".t-menu__overlay")?.addEventListener("click", closeMenu);
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  /* Page transition — for same-site links, .js-fade (excluding the header) fades out in .5s sine.out and then navigates. The incoming side runs each section’s entrance timeline */
  let leaving = false, entrance = null;
  Tanu.registerEntrance = (tl) => { entrance = tl; };
  document.querySelectorAll("a[href]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.target === "_blank" || /^(mailto|tel):/.test(href) || /^https?:/.test(href) || href.includes("/")) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const url = new URL(href, location.href);
      if (url.pathname === location.pathname) return;
      e.preventDefault();
      if (leaving) return;
      leaving = true;
      if (a.classList.contains("js-close-button")) closeMenu();
      entrance?.kill();
      const targets = [...document.querySelectorAll(".js-fade")].filter((t) => !t.classList.contains("t-head"));
      if (!targets.length || reduce) { location.href = url.href; return; }
      gsap.to(targets, { opacity: 0, duration: 0.5, ease: "sine.out", overwrite: true, onComplete: () => { location.href = url.href; } });
    });
  });
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    const t = document.querySelectorAll(".js-fade");
    gsap.set(t, { opacity: 0 });
    gsap.to(t, { opacity: 1, duration: 0.7, ease: "sine.out" });
  });

  /* Tail — while scrolling it swings ±15° (phone 7°) at .35s (phone .6s) sine.inOut, and when scrolling stops it returns to 0° in .6s power1.out */
  const tail = document.querySelector(".t-shippo__image");
  if (tail && !reduce) {
    const rot = () => (innerWidth >= 960 ? -15 : -7), dur = () => (innerWidth >= 960 ? 0.35 : 0.6);
    gsap.set(tail, { rotation: 0 });
    const wag = gsap.to(tail, { rotation: rot(), duration: dur(), ease: "sine.inOut", repeat: -1, yoyo: true, paused: true });
    addEventListener("resize", () => { wag.vars.rotation = rot(); wag.vars.duration = dur(); wag.invalidate(); });
    let timer, scrolling = false, settle, easing = false;
    addEventListener("scroll", () => {
      scrolling = true;
      clearTimeout(timer);
      settle?.kill();
      if (wag.paused()) {
        if (!easing) { easing = true; gsap.to(tail, { rotation: 0, duration: 0.2, ease: "sine.out", onComplete: () => { easing = false; if (scrolling) wag.restart(); } }); }
      } else wag.play();
      timer = setTimeout(() => { scrolling = false; wag.pause(); settle = gsap.to(tail, { rotation: 0, duration: 0.6, ease: "power1.out" }); }, 100);
    }, { passive: true });
  }

  /* Screen guard and boss */
  const screen = document.querySelector(".t-screen");
  if (screen && tail) {
    const items = screen.querySelectorAll(".t-screen__item");
    const boss = screen.querySelector(".t-screen__boss"), bossItem = screen.querySelector(".t-screen__boss-item");
    const leaf = screen.querySelector(".t-screen__leaf"), leafItem = screen.querySelector(".t-screen__leaf-item");
    const talk = screen.querySelector(".t-screen__talk"), talks = screen.querySelectorAll(".t-screen__talk-text");
    let lastTalk = null, split = null;
    const say = () => {
      const keys = [...talks].map((t) => t.dataset.talk);
      let pool = keys.filter((k) => k !== lastTalk);
      if (!pool.length) pool = keys;
      const k = pool[Math.floor(Math.random() * pool.length)];
      lastTalk = k;
      talk.dataset.talk = k;
      const el = [...talks].find((t) => t.dataset.talk === k);
      split?.revert();
      gsap.set(el, { opacity: 1 });
      split = window.SplitText ? new SplitText(el, { type: "chars" }) : { chars: [el], revert() {} };
      gsap.set(split.chars, { opacity: 0 });
      gsap.to(split.chars, { opacity: 1, duration: 0.05, stagger: 0.05, ease: "none" });
    };
    const bossIn = () => {
      gsap.killTweensOf([boss, bossItem]);
      gsap.killTweensOf(tail, "x,xPercent");
      gsap.timeline()
        .to(tail, { xPercent: 100, duration: 0.45, ease: "power3.in" }, 0)
        .add(() => screen.classList.add("is-boss-show"))
        .set(boss, { opacity: 1 }, 0)
        .set(bossItem, { x: 0, y: "-40%", rotate: 0, scale: 0.3, opacity: 0 }, 0)
        .to(bossItem, { opacity: 1, y: "0%", rotate: 360, duration: 0.55, ease: "power1.in" })
        .to(bossItem, { scale: 1.15, rotate: 360, duration: 0.15, ease: "back.out(2)" })
        .to(bossItem, { scale: 1, duration: 0.15, ease: "power1.out" })
        .to(bossItem, { keyframes: [{ scaleY: 0.92, scaleX: 1.05, duration: 0.2 }, { scaleY: 1, scaleX: 1, duration: 0.1 }], ease: "steps(1)" })
        .add(() => { items.forEach((i) => i.classList.add("is-boss-show")); say(); });
    };
    const bossOut = () => {
      gsap.killTweensOf([boss, bossItem, leaf]);
      gsap.killTweensOf(tail, "x,xPercent");
      gsap.timeline({ onComplete: () => { html.dataset.boss = "false"; } })
        .set(leaf, { opacity: 0, y: 0, x: 0, rotate: 0 }).set(leafItem, { y: 0, x: 0, rotate: 0 })
        .to(bossItem, { scaleX: 0.9, scaleY: 1.15, duration: 0.1, ease: "power2.out" })
        .to(bossItem, { scaleX: 1.1, scaleY: 0.95, duration: 0.08, ease: "power1.inOut" })
        .add(() => { if (split) gsap.to(split.chars, { opacity: 0, duration: 0.15, ease: "sine.in" }); }, "<")
        .to(bossItem, { scale: 1, rotate: "-=360", duration: 0.4, ease: "power1.in" })
        .to(bossItem, { scale: 0.3, opacity: 0, duration: 0.45, ease: "sine.out" }, "<")
        .add(() => { screen.classList.remove("is-boss-show"); items.forEach((i) => i.classList.remove("is-boss-show")); split?.revert(); split = null; gsap.set(talks, { opacity: 0 }); }, "+=0.15")
        .to(leaf, { opacity: 1, duration: 0.5, ease: "sine.out" })
        .to(leaf, { x: 40, rotate: -25, duration: 1, ease: "sine.inOut", repeat: 3, yoyo: true }, "<")
        .to(leafItem, { y: 350, duration: 3, ease: "none" }, "<")
        .to(leaf, { opacity: 0, duration: 0.4, ease: "sine.in" }, "-=1.5")
        .call(() => gsap.killTweensOf(leaf, "x,rotate"))
        .to(tail, { xPercent: 0, duration: 0.9, ease: "back.out(1.2)" }, "<");
    };
    let clicks = 0, resetT, bossT;
    tail.addEventListener("click", () => {
      if (clicks >= 8) return;
      clicks++;
      html.dataset.shippoClick = clicks;
      const hidden = [...items].filter((i) => !i.classList.contains("is-show"));
      if (hidden.length) hidden[Math.floor(Math.random() * hidden.length)].classList.add("is-show");
      clearTimeout(resetT);
      if (clicks === 8) {
        setTimeout(() => {
          html.dataset.boss = "true";
          bossIn();
          clearTimeout(bossT);
          bossT = setTimeout(() => { clicks = 0; html.dataset.shippoClick = 0; items.forEach((i) => i.classList.remove("is-show")); bossOut(); }, 4500);
        }, 1000);
        return;
      }
      resetT = setTimeout(() => { clicks = 0; html.dataset.shippoClick = 0; items.forEach((i) => i.classList.remove("is-show")); }, 1000);
    });

    /* After 30s without interaction, show one picture for 4s, rest 4 · 5 · 6s, then the next — in shuffled order */
    let idleT, showT, on = false, last = null, queue = [];
    const gaps = [4000, 5000, 6000];
    const shuffle = () => {
      const a = [...items];
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      if (last && a[0] === last && a.length > 1) { const j = 1 + Math.floor(Math.random() * (a.length - 1)); [a[0], a[j]] = [a[j], a[0]]; }
      queue = a;
    };
    const step = () => {
      if (!on) return;
      if (!queue.length) shuffle();
      const it = queue.shift();
      it.classList.add("is-screen-show");
      last = it;
      showT = setTimeout(() => { if (!on) return; it.classList.remove("is-screen-show"); showT = setTimeout(step, gaps[Math.floor(Math.random() * 3)]); }, 4000);
    };
    const start = () => {
      if (html.dataset.boss === "true") { idleT = setTimeout(start, 1000); return; }
      on = true; last = null; queue = []; html.dataset.screen = "true"; step();
    };
    const stop = () => {
      if (!on) return;
      on = false; clearTimeout(showT); html.dataset.screen = "false";
      items.forEach((i) => i.classList.remove("is-screen-show"));
    };
    const poke = () => { clearTimeout(idleT); stop(); idleT = setTimeout(start, 30000); };
    if (!reduce) { ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel"].forEach((t) => addEventListener(t, poke, { passive: true })); poke(); }
  }

  /* Handwritten title — letters light up at .15s intervals for .1s each, rest .4s, handwriting .4s, then handwriting for 1s every 3~6 seconds */
  Tanu.tegaki = (root = document) => {
    root.querySelectorAll(".js-tegaki").forEach((t) => {
      const items = t.querySelectorAll(".js-tegaki-item"), hand = t.querySelector(".js-tegaki-image"), typo = t.querySelector(".js-tegaki-typo");
      if (!hand || !typo || !window.SplitText) return;
      if (reduce) return;
      const a = new SplitText(items, { type: "chars", charsClass: "char" }), b = new SplitText(typo, { type: "chars", charsClass: "char" });
      gsap.set([...a.chars, ...b.chars], { opacity: 0 });
      gsap.set(hand, { opacity: 0 });
      const chars = [];
      t.querySelectorAll(".js-tegaki-item, .js-tegaki-typo").forEach((e) => e.querySelectorAll(".char").forEach((c) => chars.push(c)));
      const gap = 0.15;
      const loop = gsap.timeline({ paused: true, repeat: -1, repeatRefresh: true });
      loop.to({}, { duration: () => gsap.utils.random(3, 6) })
        .to(hand, { opacity: 1, duration: 0.1, ease: "power4.out" }).to(typo, { opacity: 0, duration: 0.1, ease: "power4.out" }, "<")
        .to({}, { duration: 1 })
        .to(hand, { opacity: 0, duration: 0.1, clearProps: "opacity" }).to(typo, { opacity: 1, duration: 0.1, clearProps: "opacity" }, "<");
      const tl = gsap.timeline({ scrollTrigger: { trigger: t, start: "top 80%", once: true }, onComplete: () => loop.play() });
      chars.forEach((c, i) => tl.to(c, { opacity: 1, duration: 0.1, ease: "power4.out" }, i * gap));
      tl.to({}, { duration: 0.4 }, (chars.length - 1) * gap + 0.1)
        .to(typo, { opacity: 0, duration: 0.1, ease: "power4.out" }).to(hand, { opacity: 1, duration: 0.1, ease: "power4.out" }, "<")
        .to({}, { duration: 0.4 })
        .to(hand, { opacity: 0, duration: 0.1, clearProps: "opacity" }).to(typo, { opacity: 1, duration: 0.1, clearProps: "opacity" }, "<");
    });
  };

  /* Once the font loads or 1.2 seconds pass: sub-section entrances wait for this */
  /* The original starts its entrance once the font service has loaded — the copy matches the moment the original opens (body data-start-delay, ms) so it isn’t shaken by font loading */
  Tanu.fonts = () => new Promise((r) => setTimeout(r, +document.body.dataset.startDelay || 0));
  /* Split reveal (.js-split) — at 75% of the screen, image pieces .08s·letters .08s·lines .1s apart, .35s each */
  Tanu.split = (root = document) => {
    root.querySelectorAll(".js-split").forEach((t) => {
      const paths = [...t.querySelectorAll(".js-split-path")], chars = [], lines = [];
      t.querySelectorAll(".js-split-char").forEach((e) => chars.push(...new SplitText(e, { type: "chars", charsClass: "cChar" }).chars));
      t.querySelectorAll(".js-split-line").forEach((e) => { if (getComputedStyle(e).display !== "none") lines.push(...new SplitText(e, { type: "lines", linesClass: "cLine" }).lines); });
      if (reduce) { gsap.set([...paths, ...chars, ...lines], { opacity: 1 }); return; }
      const tl = gsap.timeline({ scrollTrigger: { trigger: t, start: "top 75%", once: true } });
      if (paths.length) { gsap.set(paths, { opacity: 0 }); tl.to(paths, { opacity: 1, duration: 0.35, stagger: 0.08, ease: "power4.out" }); }
      if (chars.length) { gsap.set(chars, { opacity: 0 }); tl.to(chars, { opacity: 1, duration: 0.35, stagger: 0.08, ease: "power4.out" }, paths.length ? "-=0.2" : ">"); }
      if (lines.length) { gsap.set(lines, { opacity: 0 }); tl.to(lines, { opacity: 1, duration: 0.35, stagger: 0.1, ease: "sine.out" }); }
    });
  };

  /* Brush-mask photo reveal — on reaching 75% of the screen, the mask position goes -50% → 100% in 1.5s power2.out */
  Tanu.reveal = (root = document) => {
    root.querySelectorAll(".t-reveal").forEach((el) => {
      if (reduce) { el.style.setProperty("--t-mask-pos", "100%"); return; }
      gsap.to(el, { "--t-mask-pos": "100%", duration: 1.5, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 75%", once: true } });
    });
  };

  /* Contact — intro line, chips and button enter one by one in .8s sine.out once they are above 40% from the screen bottom */
  const ops = html.dataset.page === "home" ? document.querySelectorAll(".t-op") : [];
  if (reduce) gsap.set(ops, { opacity: 1 });
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { gsap.to(e.target, { opacity: 1, duration: 0.8, ease: "sine.out" }); io.unobserve(e.target); } }), { rootMargin: "0px 0px -40% 0px", threshold: 0 });
    ops.forEach((o) => io.observe(o));
  }

  /* Footer logo — while visible, blinks an eye for .1s every two-odd seconds, and on reaching the very end darkens (1s) and grows */
  const flogo = document.querySelector(".t-flogo");
  if (flogo) {
    const hov = flogo.querySelector(".t-flogo__hover"), normal = flogo.querySelector('[data-type="normal"]'), link = flogo.querySelector(".t-flogo__inner"), ill = flogo.querySelector(".t-flogo__illust");
    gsap.set(hov, { opacity: 0 });
    gsap.set(flogo, { zIndex: 1 });
    let blink = null, seen = false, atEnd = false;
    const pc = matchMedia("(min-width: 960px)");
    const play = () => { blink?.kill(); blink = gsap.timeline({ repeat: -1 }).to(hov, { opacity: 1, duration: 0.1, delay: 0.5 }).to(hov, { opacity: 0, duration: 0.1, delay: 1.5 }).to({}, { duration: 2 }); };
    const halt = () => { blink?.kill(); blink = null; };
    const resume = () => { if (seen && !atEnd && !reduce) play(); };
    new IntersectionObserver((es) => es.forEach((e) => { seen = e.isIntersecting; if (seen) resume(); else { halt(); gsap.set(hov, { opacity: 0 }); } }), { threshold: 0 }).observe(flogo);
    const check = () => {
      const end = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
      if (end === atEnd) return;
      atEnd = end;
      if (end) { gsap.set(flogo, { zIndex: 10 }); if (pc.matches) { halt(); gsap.set(hov, { opacity: 0 }); } normal.classList.add("is-active"); link.classList.add("is-active"); }
      else { normal.classList.remove("is-active"); link.classList.remove("is-active"); gsap.set(flogo, { zIndex: 1 }); if (pc.matches) { resume(); gsap.set(hov, { opacity: 0 }); } }
    };
    addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    check();
    ill.addEventListener("mouseenter", () => { if (atEnd && pc.matches) gsap.to(hov, { opacity: 1, duration: 0.1 }); });
    ill.addEventListener("mouseleave", () => { if (atEnd && pc.matches) gsap.to(hov, { opacity: 0, duration: 0.1 }); });
  }

  /* The tail is in place from the start outside the first page — on the first page the opening in index.js brings it in */
  addEventListener("load", () => ScrollTrigger.refresh());
})();
