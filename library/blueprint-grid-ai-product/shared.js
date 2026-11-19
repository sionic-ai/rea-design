// Shared by all pages: smooth scroll, header line, buttons, cursor, cookie bar, loader, reveal bundle and barba transition.
// Page script is HR.page("<namespace>", (container) => ...cleanup function) is only registered, and called here when the document first opens and when entering via barba.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  const HR = (window.HR = window.HR || {});
  HR.inits = HR.inits || {};
  HR.page = (ns, fn) => { HR.inits[ns] = fn; if (HR.ready && HR.ns === ns && HR.pageOff === undefined) HR.pageOff = fn(HR.container) || null; };
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hover = matchMedia("(hover: hover) and (min-width: 992px)").matches;
  const rem = () => parseFloat(getComputedStyle(root).fontSize);
  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  HR.rem = rem;
  HR.reduce = reduce;
  CustomEase.create("hr-split", "1, 0, 0.44, 1");

  // ───────── Button background pixel sprite: 24×6 cells, 20 frames. Each cell’s threshold is a left→right gradient plus noise, so the spread sweeps from left to right
  (() => {
    const F = 20, CW = 24, CH = 6, S = 10;
    const c = document.createElement("canvas");
    c.width = F * CW * S; c.height = CH * S;
    const g = c.getContext("2d");
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const th = [];
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) th.push((x / CW) * 0.7 + rnd() * 0.3);
    g.fillStyle = "rgba(255,255,255,1)"; /* Not skin: mask alpha channel (white = Visible) */
    for (let f = 0; f < F; f++) {
      const p = f / (F - 1);
      for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
        const a = Math.max(0, Math.min(1, (p * 1.3 - th[y * CW + x]) / 0.3));
        if (a <= 0) continue;
        g.globalAlpha = f === F - 1 ? 1 : Math.round(a * 20) / 20;
        g.fillRect(f * CW * S + x * S, y * S, S, S);
      }
    }
    root.style.setProperty("--site-px-mask", `url(${c.toDataURL()})`);
  })();

  // Smooth scroll — original Lenis 1.1.5 (syncTouch·smoothWheel)
  const lenis = (HR.lenis = new Lenis({ syncTouch: true, smoothWheel: true, smoothTouch: false, infinite: false }));
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // ───────── button: on enter, dark ink pixels spread with .58s steps(19) and the text rolls to white (.15s circ.in), on leave the background-color pixels spread back again
  HR.bindBtn = (btn) => {
    if (btn._hr) return;
    btn._hr = 1;
    const fill = btn.querySelector(".hr-btn__fill"), bg = btn.querySelector(".hr-btn__bg");
    if (!fill || !bg) return;
    const base = getComputedStyle(fill).color;
    const rootColor = btn.parentElement.classList.contains("hr-menu");
    let tl;
    // Like the original, the base layer is always on and the mask position (0% = Blank sheet) only moves — when finished, put it back to a blank sheet
    const play = (exit) => {
      tl && tl.kill();
      gsap.set(bg, { webkitMaskPosition: "0% 0", maskPosition: "0% 0" });
      tl = gsap.timeline({ onComplete: () => { btn.classList.toggle("is-entered", !exit); btn.classList.remove("is-exiting"); gsap.set(bg, { webkitMaskPosition: "0% 0", maskPosition: "0% 0" }); } });
      tl.to(bg, { webkitMaskPosition: "100% 0", maskPosition: "100% 0", duration: 0.58, ease: "steps(19)" }, 0);
      rootColor || tl.to(fill, { color: exit ? base : css("--kf-on-accent"), duration: 0.15, ease: "circ.in" }, 0);
    };
    btn.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "touch" || !hover) return;
      btn.classList.add("is-active");
      btn.classList.remove("is-exiting");
      play(false);
    });
    btn.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "touch" || !hover) return;
      btn.classList.remove("is-active");
      btn.classList.add("is-exiting");
      play(true);
    });
  };

  // ───────── Header row: hides when scrolling down (.4s) and returns when scrolling up. Past 50px the logo letters drop out
  const header = document.querySelector(".hr-header");
  if (header) {
    let last = 0;
    lenis.on("scroll", ({ scroll }) => {
      const d = scroll - last;
      if (Math.abs(d) > 2) header.classList.toggle("is-hide", d > 0 && scroll > 120 && !header.classList.contains("is-open"));
      header.classList.toggle("is-scrolled", scroll > 50);
      last = scroll;
    });
    const burger = header.querySelector(".hr-header__burger");
    burger && burger.addEventListener("click", () => header.classList.toggle("is-open"));
    header.querySelectorAll(".hr-menu.has-sub > .hr-btn").forEach((b) => b.addEventListener("click", () => { if (!hover) b.parentElement.classList.toggle("is-open"); }));
  }

  // ───────── Cursor: a dot that follows the mouse late (original cursor-main) — each 60fps frame covers .19 of the remaining distance (measured with motion-probe on the original: 98% at 317ms)
  const cur = document.querySelector(".hr-cursor__main");
  if (cur && hover && !reduce) {
    const pos = { x: -100, y: -100 }, to = { x: -100, y: -100 };
    let seen = false;
    addEventListener("pointermove", (e) => { to.x = e.clientX; to.y = e.clientY; if (!seen) { pos.x = to.x; pos.y = to.y; seen = true; } }, { passive: true });
    let lastT = 0;
    // The dot grows and shows only over links and buttons that have no interaction of their own (pixel smear) — the original isn’t a css transition but a value that follows .15 per frame (measured value)
    const dot = cur.querySelector(".hr-cursor__dot");
    const dv = { s: 0.43, o: 0, ts: 0.43, to: 0 };
    let link = false;
    addEventListener("pointerover", (e) => {
      const t = e.target.closest && e.target.closest("a, button, input, [data-cursor]");
      link = !!t && !t.closest(".hr-btn, .hr-ctl, .hr-cookie__act");
      dv.ts = link ? 1 : 0.43; dv.to = link ? 1 : 0;
    }, { passive: true });
    addEventListener("pointerdown", () => { dv.ts = 0.43; }, { passive: true });
    addEventListener("pointerup", () => { dv.ts = link ? 1 : 0.43; }, { passive: true });
    gsap.ticker.add((t) => {
      const now = t * 1000, dt = lastT ? Math.max(1, now - lastT) : 16.7;
      lastT = now;
      const k = 1 - Math.pow(1 - 0.19, dt / 16.7), kd = 1 - Math.pow(1 - 0.15, dt / 16.7);
      pos.x += (to.x - pos.x) * k; pos.y += (to.y - pos.y) * k;
      dv.s += (dv.ts - dv.s) * kd; dv.o += (dv.to - dv.o) * kd;
      dot.style.transform = `scale(${dv.s})`; dot.style.opacity = dv.o;
      cur.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    });
  }

  // ───────── Cookie bar
  const cookie = document.querySelector(".hr-cookie");
  if (cookie) {
    // As in the original, pressing makes everything in the band vanish at once after .09s (nothing gets pushed down). It shows again each time it opens — the original doesn’t remember consent either, it shows it every time
    cookie.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      setTimeout(() => { cookie.classList.add("is-gone", "is-hidden"); }, 90);
    }));
  }

  // ───────── Entrance group: when a [data-hr-in] block enters the view (default top+=55% bottom) rotate the marks inside together
  //   data-hr-split word·line mask rises .8s power2.out .02 · data-hr-fade 3.2rem from below 1s power3
  //   .hr-line[data-hr-draw] drawn from 0 at 1.2s none · data-hr-zoom from 1.25x at 1.6s expo.out
  HR.split = (el) => {
    if (el._split) return el._split;
    const type = el.dataset.hrSplit || "lines,words";
    el._split = new SplitText(el, { type, linesClass: "hr-line-mask", mask: "lines", wordsClass: "hr-word" });
    return el._split;
  };
  const prep = (block) => {
    const set = [];
    block.querySelectorAll("[data-hr-split]").forEach((el) => {
      const s = HR.split(el), t = el.dataset.hrSplit === "lines" ? s.lines : s.words;
      gsap.set(t, { autoAlpha: 0, yPercent: 100 });
      set.push(() => gsap.to(t, { autoAlpha: 1, yPercent: 0, stagger: 0.02, duration: 0.8, ease: "power2.out" }));
    });
    block.querySelectorAll("[data-hr-fade]").forEach((el) => {
      gsap.set(el, { opacity: 0, y: 3.2 * rem() });
      set.push(() => gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3", clearProps: "all" }));
    });
    block.querySelectorAll("[data-hr-draw]").forEach((el) => {
      const v = el.classList.contains("is-v");
      const o = el.dataset.hrDraw || "top left";
      gsap.set(el, v ? { scaleY: 0, transformOrigin: o } : { scaleX: 0, transformOrigin: o });
      set.push(() => gsap.to(el, v ? { scaleY: 1, duration: 1.2, ease: "none", clearProps: "all" } : { scaleX: 1, duration: 1.2, ease: "none", clearProps: "all" }));
    });
    block.querySelectorAll("[data-hr-zoom]").forEach((el) => {
      gsap.set(el, { scale: 1.25, autoAlpha: 0 });
      set.push(() => gsap.to(el, { scale: 1, autoAlpha: 1, duration: 1.6, ease: "expo.out", clearProps: "all", overwrite: true }));
    });
    return () => set.forEach((f) => f());
  };
  HR.reveal = (scope) => {
    const mm = gsap.matchMedia();
    mm.add({ ok: "(prefers-reduced-motion: no-preference)" }, () => {
      scope.querySelectorAll("[data-hr-in]").forEach((block) => {
        if (block.dataset.hrIn === "load") return;
        const go = prep(block);
        ScrollTrigger.create({ trigger: block, start: block.dataset.hrIn || "top+=55% bottom", once: true, onEnter: go });
      });
    });
    return () => mm.revert();
  };
  HR.revealNow = (block) => prep(block)();
  HR.prep = prep;
  HR.bindAll = (scope) => scope.querySelectorAll(".hr-btn").forEach(HR.bindBtn);

  // ───────── Header entrance — after the loader lifts: vertical line from bottom to top 1.2s none, cell text 1s power3
  HR.headerIn = () => {
    if (!header || reduce) return;
    const tl = gsap.timeline({ delay: 0.1 });
    tl.fromTo(header.querySelectorAll(".hr-line.is-v"), { scaleY: 0, transformOrigin: "bottom right" }, { scaleY: 1, duration: 1.2, ease: "none", clearProps: "all" }, 0);
    tl.fromTo(header.querySelectorAll(".hr-header__logo, .hr-menu > .hr-btn, .hr-header__cta > .hr-btn, .hr-header__burger"), { opacity: 0 }, { opacity: 1, duration: 1, ease: "power3", clearProps: "all" }, 0);
    return tl;
  };

  // ───────── Loader — original values: 64 lines strokeDashoffset 1.3s power1.out (gaps total 3s), title words .5s .02, progress 0→60 (3s power2.out)→100 (2.5s power3.out),
  //   Process rows fill .25s each at .3 intervals, when full the text fades out in .4s and the top and bottom bars split with cubic-bezier(1,0,.44,1) .8s, opening the panel from the center
  const loader = document.querySelector(".hr-loader");
  HR.loaderDone = new Promise((res) => {
    if (!loader || reduce) { loader && loader.classList.add("is-done"); res(); return; }
    document.body.classList.add("is-locked");
    lenis.stop();
    const lines = loader.querySelectorAll(".hr-loader__img [data-draw]");
    lines.forEach((l) => { const n = l.getTotalLength ? l.getTotalLength() : 200; gsap.set(l, { strokeDasharray: n, strokeDashoffset: n }); });
    const title = loader.querySelector(".hr-loader__title");
    const st = title ? new SplitText(title, { type: "lines,words", linesClass: "hr-line-mask", mask: "lines" }) : null;
    st && gsap.set(st.words, { opacity: 0, yPercent: 100 });
    const rows = loader.querySelectorAll(".hr-loader__row");
    gsap.set(rows, { opacity: 0 });
    const pct = loader.querySelector(".hr-loader__pct b"), bar = loader.querySelector(".hr-loader__bar");
    const prog = { value: 0 };
    const tl = gsap.timeline({ paused: true });
    tl.to(lines, { strokeDashoffset: 0, duration: 1.3, stagger: { amount: 3, from: "start" }, ease: "power1.out" }, 0);
    st && tl.to(st.words, { opacity: 1, yPercent: 0, duration: 0.5, stagger: 0.02, ease: "power2.out" }, 0);
    tl.to(loader.querySelector(".hr-loader__pct"), { opacity: 1, duration: 0.6, ease: "power2.out" }, 0);
    tl.to(prog, { keyframes: [{ value: 60, duration: 3, ease: "power2.out" }, { value: 100, duration: 2.5, ease: "power3.out" }],
      onUpdate: () => { const v = Math.round(prog.value); pct && (pct.textContent = v); bar && (bar.style.width = Math.max(6, v) + "%"); } }, 0);
    tl.to(rows, { opacity: 1, duration: 0.25, stagger: 0.3, ease: "power3.out" }, 0);
    // Ruler crosshair — as in the original, it follows the mouse position late and writes out X and Y
    const rl = loader.querySelector(".hr-loader__ruler");
    let follow;
    if (rl && hover) {
      const lh = rl.querySelector(".hr-line.is-h"), lv = rl.querySelector(".hr-line.is-v"), co = rl.querySelector(".hr-loader__coord"), cx = co && co.querySelectorAll("b");
      const p = { x: innerWidth / 2, y: innerHeight / 2 }, q = { ...p };
      const mv = (e) => { q.x = e.clientX; q.y = e.clientY; };
      addEventListener("pointermove", mv, { passive: true });
      follow = () => {
        p.x += (q.x - p.x) * 0.12; p.y += (q.y - p.y) * 0.12;
        const dx = p.x - innerWidth / 2, dy = p.y - innerHeight / 2;
        lv && (lv.style.transform = `translateX(${dx}px)`);
        lh && (lh.style.transform = `translateY(${dy}px)`);
        co && (co.style.transform = `translate(${dx}px, ${dy}px)`);
        if (cx && cx.length > 1) { cx[0].textContent = Math.round(p.x); cx[1].textContent = Math.round(p.y); }
      };
      gsap.ticker.add(follow);
    }
    const main = loader.querySelector(".hr-loader__main");
    tl.add(() => {
      const H = innerHeight;
      gsap.to(loader.querySelectorAll(".hr-loader__content, .hr-loader__img, .hr-loader__pct, .hr-loader__ruler"), { opacity: 0, duration: 0.4, ease: "power2.out" });
      const top = loader.querySelector(".hr-loader__bar .is-top"), bot = loader.querySelector(".hr-loader__bar .is-bot");
      const gap = { top: 50, bot: 50 };
      gsap.to(bot, { y: H * 0.345, backgroundColor: css("--kf-line"), duration: 0.8, ease: "hr-split" });
      gsap.to(top, { y: -H * 0.4306, backgroundColor: css("--kf-line"), duration: 0.8, ease: "hr-split" });
      gsap.to(gap, { top: 0, bot: 100, duration: 0.8, ease: "hr-split",
        onUpdate: () => { main.style.clipPath = `polygon(0% 0%, 100% 0%, 100% ${gap.top}%, 0% ${gap.top}%, 0% ${gap.bot}%, 100% ${gap.bot}%, 100% 100%, 0% 100%)`; },
        onComplete: () => {
          follow && gsap.ticker.remove(follow);
          loader.classList.add("is-done");
          document.body.classList.remove("is-locked");
          lenis.start();
          res();
        } });
    }, "+=0.85");
    const start = () => tl.play();
    document.fonts && document.fonts.ready ? document.fonts.ready.then(start) : start();
  });

  // ───────── Page on · off ─────────
  const boot = (container) => {
    HR.container = container;
    HR.ns = container.dataset.barbaNamespace;
    HR.bindAll(document);
    HR.offReveal = HR.reveal(container);
    const fn = HR.inits[HR.ns];
    HR.pageOff = fn ? fn(container) || null : undefined;
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  const teardown = () => {
    HR.offReveal && HR.offReveal();
    HR.pageOff && HR.pageOff();
    HR.pageOff = undefined;
    ScrollTrigger.getAll().forEach((s) => s.kill());
  };

  // If the css·js of the next page to swap via barba aren’t loaded yet, load them first — because each page keeps its own files
  const loadAssets = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const jobs = [];
    doc.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
      const href = new URL(l.getAttribute("href"), location.href).href;
      if ([...document.querySelectorAll('link[rel="stylesheet"]')].some((x) => x.href === href)) return;
      const n = document.createElement("link");
      n.rel = "stylesheet"; n.href = href;
      jobs.push(new Promise((r) => { n.onload = n.onerror = r; }));
      document.head.append(n);
    });
    doc.querySelectorAll("script[src]").forEach((s) => {
      const src = new URL(s.getAttribute("src"), location.href).href;
      if ([...document.scripts].some((x) => x.src === src)) return;
      const n = document.createElement("script");
      n.src = src;
      jobs.push(new Promise((r) => { n.onload = n.onerror = r; }));
      document.body.append(n);
    });
    return Promise.all(jobs);
  };

  // Transition — original barba: four frame lines converge to the center, cutting the old page into a shrinking rectangle (.7s), and on the new page the lines spread outward again (.6s)
  const deco = document.querySelector(".hr-deco__in");
  const tv = { p: 0 };
  const setTrans = () => deco && deco.style.setProperty("--site-trans", tv.p + "%");
  const cover = (old) => {
    const H = innerHeight, sy = scrollY, ch = old.offsetHeight;
    return gsap.timeline()
      .to([header, cookie].filter(Boolean), { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, 0)
      .to(tv, { p: 50, duration: 0.7, ease: "power2.inOut", onUpdate: () => {
        setTrans();
        const k = tv.p / 100;
        old.style.clipPath = `inset(${sy + k * H}px ${k * 100}% ${Math.max(0, ch - sy - H) + k * H}px ${k * 100}%)`;
      } }, 0);
  };
  const uncover = () => gsap.timeline()
    .to(tv, { p: 0, duration: 0.6, ease: "power2.out", onUpdate: setTrans }, 0)
    .to(cookie && !cookie.classList.contains("is-hidden") ? cookie : [], { autoAlpha: 1, duration: 0.3 }, 0.4)
    .set(header || [], { autoAlpha: 1 }, 0.5)
    .add(() => HR.headerIn(), 0.5);

  const first = document.querySelector('[data-barba="container"]');
  HR.ready = true;
  boot(first);
  HR.loaderDone.then(() => { HR.headerIn(); HR.ns && HR.onLoaded && HR.onLoaded(); document.dispatchEvent(new CustomEvent("hr:loaded")); });

  if (window.barba && !reduce) {
    barba.init({
      preventRunning: true,
      prevent: ({ href }) => !/\.html(\?|#|$)/.test(href) || href.includes("#"),
      transitions: [{
        name: "hr",
        async leave({ current }) { header && header.classList.remove("is-open"); await cover(current.container); },
        async enter({ next }) {
          teardown();
          await loadAssets(next.html);
          lenis.scrollTo(0, { immediate: true });
          document.querySelectorAll(".hr-menu").forEach((m) => m.classList.toggle("is-current", m.dataset.ns === next.namespace));
          boot(next.container);
          document.dispatchEvent(new CustomEvent("hr:loaded"));
          await uncover();
        },
      }],
    });
  }
})();
