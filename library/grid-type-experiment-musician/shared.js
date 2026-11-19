/* Shared by all pages: grid menu·sound on·background grid·white panel cover page transition (swup)·bottom Next strip·smooth scroll.
   Values were read from the original bundle. The original scrolls an inner box, but here the window scrolls (the visible result is the same).
   Pages swap only #swup with swup 4.9.0 + JsPlugin like the original. The header, sound and curtain stay, and page scripts are registered as sh.page so they are attached again on every entry. */
(() => {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = () => innerWidth <= 750;
  const split = () => (sp() ? 10 : 24);
  const gridSize = () => innerWidth / split();
  const NEXT = { home: "about.html", about: "works.html", works: "discography.html" };
  const pageName = () => document.querySelector("#swup")?.dataset.pageName || "";

  // Canvas can’t read variables shaped like color-mix or oklch(from …) directly — paint them onto an element to get the computed color, then read rgb via a 1px canvas
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (v) => {
    const el = document.createElement("i");
    el.style.color = `var(${v})`;
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };
  const logo = '<svg viewBox="0 0 218 132" aria-hidden="true"><path d="M8 66 46 30v72z" fill="currentColor"/><path d="M210 66l-38-36v72z" fill="currentColor"/><circle cx="109" cy="66" r="62" fill="currentColor"/><path class="is-cut" d="M96 40c14 4 22 16 20 30" stroke-width="7" fill="none" stroke-linecap="round"/></svg>';
  const cur = (p) => (p === pageName() ? ' aria-current="page"' : "");
  document.body.insertAdjacentHTML("afterbegin", `
    <header class="sh-head" data-slot="header">
      <a class="sh-head__home sh-cell" href="index.html" aria-label="Back to start" sound-is>${logo}</a>
      <nav class="sh-head__nav" aria-label="Menu">
        <a class="sh-head__item sh-cell" href="about.html"${cur("about")} sound-is><span>Day</span></a>
        <a class="sh-head__item sh-cell" href="works.html"${cur("works")} sound-is><span>This</span></a>
        <a class="sh-head__item sh-cell" href="discography.html"${cur("discography")} sound-is><span>Three</span></a>
      </nav>
      <a class="sh-head__contact sh-cell" href="#" sound-is><span>Door</span></a>
    </header>
    <div class="sh-sounds" track-muted="true" data-slot="sound-toggle">
      <button class="sh-sounds__title sh-cell" type="button"><span class="is-name">Sound</span><span class="is-del">Erase</span></button>
      <button class="sh-sounds__button sh-cell" type="button" aria-label="Toggle sound off and on"><span class="is-unmute">Oil</span><span>/</span><span class="is-mute">Radish</span></button>
    </div>
    <div class="sh-cover" aria-hidden="true"><div class="sh-cover__grid"></div></div>`);

  /* ── Background grid (inside #swup on each page) and overlay (stays like the header) fill cells to the screen/document height ── */
  const fill = (grid, rows, html) => { grid.innerHTML = html.repeat(rows * split()); };
  const build = () => {
    const container = document.querySelector("#swup");
    let pattern = container.querySelector(":scope > .sh-pattern");
    if (!pattern) {
      pattern = document.createElement("div");
      pattern.className = "sh-pattern";
      pattern.setAttribute("aria-hidden", "true");
      pattern.innerHTML = '<div class="sh-pattern__grid"></div>';
      container.prepend(pattern);
    }
    fill(pattern.firstChild, Math.ceil(container.scrollHeight / gridSize()) + 1, '<div class="sh-pattern__item"><i class="sh-pattern__bar"></i><i class="sh-pattern__bar"></i></div>');
    fill(document.querySelector(".sh-cover__grid"), Math.ceil(innerHeight / gridSize()), '<div class="sh-cover__item"></div>');
    document.querySelectorAll("[round-height]").forEach((el) => {
      el.style.removeProperty("--height-fallback");
      el.style.setProperty("--height-fallback", `${Math.ceil(el.scrollHeight / gridSize()) * gridSize()}px`);
    });
    document.dispatchEvent(new CustomEvent("sh:grid"));
  };
  build();
  let rt = 0;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { build(); ScrollTrigger.refresh(); }, 150); });

  /* ── Smooth scroll: same Lenis 1.3.23 as the original, 0.7s · 1-(1-t)^5 · its own rAF ── */
  let lenis = null;
  if (!reduce) {
    lenis = window.lenis = new Lenis({ duration: 0.7, easing: (t) => 1 - Math.pow(1 - t, 5), autoRaf: true });
    lenis.on("scroll", ScrollTrigger.update);
  }

  /* ── Sound: when on, a short sound plays each time [sound-is] is hit and the 9-cell bars near the cursor bounce (the original uses recorded sound effects) ── */
  const sounds = document.querySelector(".sh-sounds");
  let audio = null;
  const muted = () => sounds.getAttribute("track-muted") === "true";
  const setMuted = (m) => sounds.setAttribute("track-muted", String(m));
  sounds.querySelector(".sh-sounds__button").addEventListener("click", () => setMuted(!muted()));
  sounds.querySelector(".sh-sounds__title").addEventListener("click", () => setMuted(true));
  const mouse = { x: -999, y: -999 };
  addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  const blip = () => {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator();
    const g = audio.createGain();
    const notes = [220, 277, 330, 415, 440, 554];
    o.type = Math.random() < 0.5 ? "square" : "triangle";
    o.frequency.value = notes[Math.floor(Math.random() * notes.length)];
    g.gain.setValueAtTime(0.06, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.12);
    o.connect(g).connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.13);
  };
  const burst = () => {
    const pattern = document.querySelector(".sh-pattern");
    if (!pattern) return;
    const items = [...pattern.querySelectorAll(".sh-pattern__item")];
    const gs = gridSize();
    const r = pattern.getBoundingClientRect();
    const col = Math.floor((mouse.x - r.left) / gs);
    const row = Math.floor((mouse.y - r.top) / gs);
    const hit = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const c = col + dx, w = row + dy;
      if (c >= 0 && c < split() && w >= 0) { const it = items[w * split() + c]; if (it) hit.push(it); }
    }
    const angle = Math.round(Math.random() * 4) * 45;
    hit.forEach((it) => {
      it.style.setProperty("--sounds-num", String(1 + Math.round(Math.random() * 2)));
      it.style.setProperty("--sounds-angle", `${angle}deg`);
      it.setAttribute("sounds-target", "");
    });
    setTimeout(() => hit.forEach((it) => it.removeAttribute("sounds-target")), 120);
  };
  document.addEventListener("pointerover", (e) => {
    const el = e.target.closest("[sound-is]");
    if (!el || el.contains(e.relatedTarget) || muted() || sp()) return;
    try { blip(); } catch {}
    burst();
  });

  /* ── Page: on entry, registered scripts are attached (ScrollTrigger and tweens via gsap.context, window listeners and ticker via on and tick) and released on exit ── */
  const pages = {};
  let unmount = null, mounted = "";
  const mount = () => {
    unmount?.();
    const main = document.querySelector("#swup");
    const name = pageName();
    document.body.dataset.page = name;
    document.querySelectorAll(".sh-head__item").forEach((a) => (a.getAttribute("href") === `${name}.html` ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    build();
    const offs = [];
    const on = (t, type, fn, o) => { t.addEventListener(type, fn, o); offs.push(() => t.removeEventListener(type, fn, o)); };
    const tick = (fn) => { gsap.ticker.add(fn); offs.push(() => gsap.ticker.remove(fn)); };
    const ctx = gsap.context(() => {
      footBar(main, { on, tick });
      const off = pages[name]?.({ on, tick, main });
      if (typeof off === "function") offs.push(off);
    });
    mounted = name;
    unmount = () => { ctx.revert(); offs.splice(0).reverse().forEach((f) => f()); unmount = null; mounted = ""; };
    ScrollTrigger.refresh();
  };
  const page = (name, init) => {
    pages[name] = init;
    if (name === pageName() && mounted !== name) mount();
  };

  /* ── Bottom Next: once the strip is fully in view, each wheel tick fills 2% and each touch move fills 7%, and when full it goes to the next page ── */
  const footBar = (main, { on, tick }) => {
    const foot = main.querySelector(".sh-foot");
    const next = NEXT[pageName()];
    if (!foot || !next) return;
    let atEnd = false, r = 0, ty = 0;
    const child = foot.querySelector(".sh-foot__progress-child");
    tick(() => {
      atEnd = foot.getBoundingClientRect().bottom <= innerHeight + 1;
      if (!atEnd) { r = 0; }
      const p = Math.min(r / 100, 1);
      child.style.setProperty("--progress", String(p));
      if (p === 1 && !document.documentElement.classList.contains("is-leaving")) go(next);
    });
    on(window, "wheel", (e) => { if (e.deltaY > 0 && atEnd) r += 2; }, { passive: true });
    on(window, "touchstart", (e) => { ty = e.touches[0].clientY; }, { passive: true });
    on(window, "touchmove", (e) => { if (!atEnd) return; const y = e.touches[0].clientY; if (ty - y > 0) r += 7; ty = y; }, { passive: true });
  };

  /* ── Page transition (swup + JsPlugin): white cells switch on at random with 0.01s gaps to cover the screen, then after the new page loads and 0.1s passes they switch off the same way ── */
  const coverItems = () => document.querySelectorAll(".sh-cover__item");
  const stagger = { each: 0.01, from: "random", grid: "auto" };
  const swup = window.Swup && window.SwupJsPlugin ? new Swup({
    animateHistoryBrowsing: true,
    linkSelector: 'a[href]:not([href*="#"])',
    // The wire toolbar (.wf-ui) List is a page outside the site, so it’s not swapped and is simply passed over
    ignoreVisit: (url, { el } = {}) => !!el?.closest("[data-no-swup], .wf-ui"),
    plugins: [new SwupJsPlugin({ animations: [{
      from: "(.*)", to: "(.*)",
      out: (done) => {
        document.documentElement.classList.add("is-leaving");
        if (reduce) return done();
        gsap.timeline().to(coverItems(), { opacity: 1, duration: 0.01, stagger }).add(() => done());
      },
      in: (done) => {
        document.documentElement.classList.remove("is-leaving");
        if (reduce) { gsap.set(coverItems(), { opacity: 0 }); return done(); }
        gsap.timeline().fromTo(coverItems(), { opacity: 1 }, { opacity: 0, duration: 0.01, delay: 0.1, stagger }).call(() => done());
      },
    }] })],
  }) : null;
  if (swup) {
    swup.hooks.before("content:replace", () => unmount?.());
    swup.hooks.on("content:replace", () => { lenis?.scrollTo(0, { immediate: true, force: true }); mount(); });
  }
  const go = (href) => (swup ? swup.navigate(href) : (location.href = href));
  // Original: after window load, mounts the app, waits .5s, then turns on the body in .5s power2.out
  const showBody = () => gsap.to(document.body, { opacity: 1, duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.5, ease: "power2.out" });
  if (document.readyState === "complete") showBody(); else addEventListener("load", showBody, { once: true });

  window.sh = { reduce, sp, split, gridSize, lenis, go, rgb, page };
})();
