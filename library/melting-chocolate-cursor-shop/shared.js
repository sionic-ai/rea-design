// Motion shared by the four sections. The original uses barba 2.10.3 — on exit a cursor blob covers the screen (html.pageload) and 1 second later the new section opens at the top as the blob shrinks.
// Section motion is registered with TB.use (attach), attached when a box enters and detached when it leaves. Hero-only parts (product picker, features, scroll frame) are registered by index.js.
(() => {
  const TB = (window.TB = window.TB || {});
  const mods = (TB.mods = TB.mods || []);
  TB.use = (fn) => mods.push(fn);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover)");
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  // Original reveal-bounce — overshoots slightly at the end and settles
  CustomEase.create("reveal-bounce", "M0,0 C0.18,0.62 0.3,1.06 0.52,1.05 0.7,1.03 0.82,1 1,1");

  // ── Button: the spot where the pointer rests as --x · --y (the ripple spreads from there)
  const btnMove = (e) => {
    const b = e.target.closest?.("[data-tb-btn]");
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty("--x", `${e.clientX - r.left}px`);
    b.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  document.addEventListener("pointermove", btnMove, { passive: true });

  // ── Header: Shop expand · phone drawer
  const head = document.querySelector("[data-tb-head]");
  const drawer = document.querySelector(".tb-drawer");
  const mega = head?.querySelector("[data-tb-mega]");
  const megaOpen = (on) => { head.classList.toggle("is-mega", on); mega.setAttribute("aria-expanded", String(on)); };
  // Search panel
  const search = document.querySelector("[data-tb-search-panel]");
  const searchOpen = (on) => { search?.classList.toggle("is-open", on); if (on) setTimeout(() => search.querySelector("input")?.focus(), 400); };
  head?.querySelector("[data-tb-search]")?.addEventListener("click", () => searchOpen(true));
  search?.querySelector("[data-tb-search-close]")?.addEventListener("click", () => searchOpen(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") searchOpen(false); });
  // The Shop dropdown opens and closes on click like the original (hover does not open it). Clicking outside the header or pressing Esc closes it
  if (mega) {
    mega.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); megaOpen(!head.classList.contains("is-mega")); });
    document.addEventListener("click", (e) => { if (!head.contains(e.target)) megaOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") megaOpen(false); });
  }
  const burger = head?.querySelector("[data-tb-burger]");
  burger?.addEventListener("click", () => {
    const on = !head.classList.contains("is-open");
    head.classList.toggle("is-open", on);
    burger.setAttribute("aria-expanded", String(on));
    if (on && drawer) gsap.fromTo(drawer.querySelectorAll("a"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" });
  });
  TB.closeMenus = () => { head?.classList.remove("is-open", "is-mega"); burger?.setAttribute("aria-expanded", "false"); };

  // ── Letter bounce: words hide 115% below tilted 5°, and on reaching 88% of the screen play a 1.1s reveal-bounce, .035s per word (within a max of .7s).
  //    On first open it waits 1 second then starts (original _baseDelay). pop springs up from 60px below at .85 scale
  TB.use((root) => {
    const els = [...root.querySelectorAll("[data-tb-reveal]")];
    if (!els.length) return;
    if (reduce.matches) { els.forEach((e) => (e.style.visibility = "visible")); return; }
    const splits = [], tws = [];
    const prep = els.map((el) => {
      const type = el.dataset.tbReveal, delay = +(el.dataset.delay || 0);
      let targets = [];
      if (type === "words" || type === "lines") {
        const s = new SplitText(el, { type, wordsClass: "tb-word", linesClass: "tb-word" });
        splits.push(s);
        const parts = type === "lines" ? s.lines : s.words;
        parts.forEach((w) => { const inner = document.createElement("span"); while (w.firstChild) inner.append(w.firstChild); w.append(inner); });
        targets = parts.map((w) => w.firstElementChild);
        gsap.set(targets, { yPercent: 115, rotate: 5, transformOrigin: "0% 100%" });
      } else if (type === "frame") {
        // Frame: turns on at .6x and transparent, reaches full size with a 1.2s reveal-bounce, and the photo inside goes from .8/.6x to 1 over 1.5s.
        targets = [...el.querySelectorAll(".wf-img, img, video, svg")];
        gsap.set(el, { scale: 0.6, opacity: 0 });
        gsap.set(targets, { "--reveal-inner": 0.8 / 0.6 });
      } else if (type === "pop") gsap.set(el, { y: 60, scale: 0.85, opacity: 0 });
      el.style.visibility = "visible";
      return { el, type, delay, targets };
    });
    const play = () => prep.forEach(({ el, type, delay, targets }) => {
      const st = { trigger: el, start: "top 88%", once: true };
      if (type === "words" || type === "lines") tws.push(gsap.to(targets, { yPercent: 0, rotate: 0, duration: 1.1, ease: "reveal-bounce", delay, stagger: Math.min(type === "lines" ? 0.09 : 0.035, 0.7 / Math.max(1, targets.length)), scrollTrigger: st }));
      else if (type === "frame") tws.push(gsap.timeline({ delay, scrollTrigger: st }).to(el, { opacity: 1, duration: 0.35, ease: "power1.out" }, 0).to(el, { scale: 1, duration: 1.2, ease: "reveal-bounce" }, 0).to(targets, { "--reveal-inner": 1, duration: 1.5, ease: "reveal-bounce" }, 0.05));
      else if (type === "pop") tws.push(gsap.timeline({ delay, scrollTrigger: st }).to(el, { opacity: 1, duration: 0.35, ease: "power1.out" }, 0).to(el, { y: 0, scale: 1, duration: 1.1, ease: "reveal-bounce" }, 0));
    });
    // The original waits 1 second each time a section is attached before hooking it — after a flip it overlaps the 1 second the bubble shrinks
    const t = setTimeout(play, 1000);
    return () => { clearTimeout(t); tws.forEach((w) => { w.scrollTrigger?.kill(); w.kill(); }); splits.forEach((s) => s.revert()); };
  });

  // ── Parallax·handwriting: [data-tb-parallax] goes +n → −n px while passing (scrub), handwritten notes turn on at 80% of the screen .25s late with a 1.1s reveal-bounce
  TB.use((root) => {
    if (reduce.matches) return;
    const tws = [...root.querySelectorAll("[data-tb-parallax]")].flatMap((el) => {
      const n = +el.dataset.tbParallax || 40;
      const list = [gsap.fromTo(el, { "--parallax": `${n}px` }, { "--parallax": `${-n}px`, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } })];
      el.querySelectorAll(".tb-note").forEach((note) => list.push(gsap.fromTo(note, { "--cerise-in": 0 }, { "--cerise-in": 1, duration: 1.1, delay: 0.25, ease: "reveal-bounce", scrollTrigger: { trigger: el, start: "top 80%", once: true } })));
      return list;
    });
    return () => tws.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
  });

  // ── Product card: the photo tilts toward the cursor (--mx · --my chase at .12 per frame)
  TB.use((root) => {
    if (!fine.matches || reduce.matches) return;
    const offs = [...root.querySelectorAll("[data-tb-tilt]")].map((card) => {
      const media = card.querySelector(".tb-card__media");
      if (!media) return null;
      const want = { x: 0, y: 0 }, now = { x: 0, y: 0 };
      let raf = 0;
      const step = () => {
        now.x += (want.x - now.x) * 0.12; now.y += (want.y - now.y) * 0.12;
        media.style.setProperty("--mx", now.x.toFixed(4));
        media.style.setProperty("--my", now.y.toFixed(4));
        raf = Math.abs(want.x - now.x) + Math.abs(want.y - now.y) > 0.001 ? requestAnimationFrame(step) : 0;
      };
      const move = (e) => { const r = media.getBoundingClientRect(); want.x = (e.clientX - r.left) / r.width * 2 - 1; want.y = (e.clientY - r.top) / r.height * 2 - 1; if (!raf) raf = requestAnimationFrame(step); };
      const leave = () => { want.x = want.y = 0; if (!raf) raf = requestAnimationFrame(step); };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      return () => { cancelAnimationFrame(raf); card.removeEventListener("pointermove", move); card.removeEventListener("pointerleave", leave); };
    });
    return () => offs.forEach((f) => f?.());
  });

  // ── Product picker board (first section · About): choose a category with tabs, and the board tints over .8s to the color of the product at the center of the strip. Dots and left/right drag to move on
  TB.use((root) => {
    const sec = root.querySelector("[data-tb-ps]");
    if (!sec) return;
    const tabs = [...sec.querySelectorAll("[data-ps-tab]")], panels = [...sec.querySelectorAll("[data-ps-panel]")];
    const dots = sec.querySelector("[data-ps-dots]"), link = sec.querySelector("[data-ps-link]");
    let panel = panels.find((p) => !p.hidden) || panels[0], idx = 0;
    const items = () => [...panel.querySelectorAll("[data-ps-item]")];
    const go = (i) => {
      const list = items();
      idx = (i + list.length) % list.length;
      const track = panel.querySelector("[data-ps-track]");
      const w = list[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 96;
      track.style.transform = `translateX(${-idx * (w + gap)}px)`;
      list.forEach((n, k) => n.classList.toggle("is-current", k === idx));
      const cur = list[idx];
      sec.style.setProperty("--ps-bg", cur.dataset.psColor);
      sec.style.setProperty("--ps-text", cur.dataset.psText);
      link?.setAttribute("data-blob-color", cur.dataset.psColor);
      [...dots.children].forEach((d, k) => (k === idx ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current")));
    };
    const drawDots = () => {
      dots.innerHTML = items().map((_, k) => `<button class="tb-ps__dot" type="button" aria-label="${k + 1}Product No."></button>`).join("");
      [...dots.children].forEach((d, k) => d.addEventListener("click", () => go(k)));
    };
    const pick = (k) => {
      tabs.forEach((t, j) => { t.setAttribute("aria-selected", String(j === k)); t.parentElement.classList.toggle("is-current", j === k); });
      panels.forEach((p, j) => { p.hidden = j !== k; p.classList.toggle("is-current", j === k); });
      panel = panels[k];
      drawDots();
      // In the original, not the first product but the next one (orange panel) stands at the center when it opens
      go(Math.min(1, items().length - 1));
    };
    // Pressing the current branch again does nothing, like the original
    const tabClick = (e) => { const k = +e.currentTarget.dataset.psTab; if (panels[k] !== panel || panel.hidden) pick(k); };
    tabs.forEach((t) => t.addEventListener("click", tabClick));
    // Band drag: one step toward the released side
    let sx = null;
    const down = (e) => { sx = e.clientX; };
    const up = (e) => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1)); };
    const itemClick = (e) => { const it = e.target.closest("[data-ps-item]"); if (it) go(items().indexOf(it)); };
    sec.addEventListener("pointerdown", down);
    addEventListener("pointerup", up);
    sec.addEventListener("click", itemClick);
    pick(Math.max(0, panels.indexOf(panel)));
    const ro = new ResizeObserver(() => go(idx));
    ro.observe(sec);
    return () => { ro.disconnect(); tabs.forEach((t) => t.removeEventListener("click", tabClick)); sec.removeEventListener("pointerdown", down); removeEventListener("pointerup", up); sec.removeEventListener("click", itemClick); };
  });

  // ── Attach·Detach
  let mounted = null;
  const mount = (root) => {
    const offs = [];
    const ctx = gsap.context(() => mods.forEach((fn) => { const off = fn(root); if (typeof off === "function") offs.push(off); }), root);
    mounted = { offs, ctx };
  };
  const unmount = () => { if (!mounted) return; mounted.offs.forEach((f) => f()); mounted.ctx.revert(); mounted = null; };
  const markCurrent = () => {
    const here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".tb-menu a[href]:not([data-tb-mega]), .tb-foot a[href]").forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === here));
  };

  // ── Transition: a blob covers the screen in 1s (fx:flood), 1s later opens the new section from the top and the blob shrinks ──
  const abs = (h) => new URL(h, location.href).href;
  const bring = async (doc) => {
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href);
    await Promise.all([...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => abs(l.getAttribute("href"))).filter((h) => !have.includes(h)).map((href) => new Promise((r) => {
      document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href, onload: r, onerror: r }));
      setTimeout(r, 800);
    })));
    const loaded = [...document.querySelectorAll("script[src]")].map((s) => s.src);
    for (const s of doc.querySelectorAll("script[src]")) {
      const src = abs(s.getAttribute("src"));
      if (loaded.includes(src)) continue;
      await new Promise((r) => document.body.append(Object.assign(document.createElement("script"), { src, onload: r, onerror: r })));
    }
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const flood = (on) => document.dispatchEvent(new CustomEvent("fx:flood", { detail: { on } }));
  const start = () => {
    const first = document.querySelector('[data-barba="container"]');
    if (first) mount(first);
    markCurrent();
    ScrollTrigger.refresh();
    if (!window.barba || !/^https?:$/.test(location.protocol)) return;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    barba.init({
      prevent: ({ el }) => !el || el.hasAttribute("download") || el.target === "_blank" || /^(#|mailto:|tel:)/.test(el.getAttribute("href") || "") || !!el.closest(".wf-ui"),
      transitions: [{
        name: "default-transition",
        async leave() {
          TB.closeMenus();
          flood(true);
          await wait(reduce.matches ? 0 : 1000);
          unmount();
          ScrollTrigger.getAll().forEach((t) => t.kill());
        },
        async enter({ next }) {
          await bring(new DOMParser().parseFromString(next.html, "text/html"));
          scrollTo({ top: 0, left: 0, behavior: "instant" });
          mount(next.container);
          flood(false);
        },
        after() { markCurrent(); ScrollTrigger.refresh(); },
      }],
    });
  };
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve();
  const boot = () => fontsReady.then(() => requestAnimationFrame(start));
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();
  addEventListener("load", () => ScrollTrigger.refresh());
})();
