// Common to all pages — smooth scroll, rolling text splitting, line masks, switch on when visible, header color change, phone menu, clock, name band gradient
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const site = (window.abSite = {});

  // Original Lenis 1.3.25 — lerp .16, smooth only for wheel, touch left as is
  if (window.Lenis && !reduce && !coarse) {
    site.lenis = new Lenis({ autoRaf: true, lerp: 0.16, smoothWheel: true, syncTouch: false, stopInertiaOnNavigate: true, prevent: (n) => n.closest?.("[data-lenis-prevent]") });
  }

  // When moving from another page it skips the first-page loader (the original only lifts the curtain on a transition entry and shows no loader)
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.origin !== location.origin) return;
    try { sessionStorage.setItem("fx-tint-count-loader", "1"); sessionStorage.setItem("ab-arrive", "1"); } catch {}
  }, true);

  // Arrived page: waits for fonts and the document load (1.4 seconds at most), removes the curtain, then enters. A directly opened page enters right away
  const root = document.documentElement;
  const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }));
  const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  site.revealed = root.classList.contains("ab-arrive")
    ? Promise.all([document.fonts?.ready || Promise.resolve(), Promise.race([loaded, new Promise((r) => setTimeout(r, 1400))])]).then(frames).then(() => root.classList.remove("ab-arrive"))
    : Promise.resolve();

  // Letter roll: wrap each letter and attach --c (a space is also one cell — white-space: pre keeps its width)
  document.querySelectorAll("[data-roll]").forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute("aria-hidden", "true");
    el.classList.add("ab-roll");
    el.innerHTML = [...text].map((ch, i) => `<span class="ab-roll__c" style="--c:${i}">${ch}</span>`).join("");
  });

  // Footer link: a single sunset image spanning the width of one link line, spread below
  const flinks = [...document.querySelectorAll("[data-flink]")];
  flinks.forEach((a) => {
    const text = a.textContent.trim();
    a.setAttribute("aria-label", text);
    a.innerHTML = `<span class="ab-flink" aria-hidden="true">${[...text].map((ch, i) => `<span class="ab-flink__c" data-c="${ch}" style="--c:${i}">${ch}</span>`).join("")}</span>`;
  });
  const sizeFlinks = () => flinks.forEach((a) => {
    const box = a.firstElementChild.getBoundingClientRect();
    a.querySelectorAll(".ab-flink__c").forEach((c) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--gw", `${box.width}px`);
      c.style.setProperty("--gx", `${box.left - r.left}px`);
    });
  });

  // Line mask: measures word positions with the fully drawn font and splits lines. data-lines="Delay, line spacing, length"(ms)
  const lineTargets = [...document.querySelectorAll("[data-lines]")];
  const splitLines = (el) => {
    const text = el.dataset.text || el.textContent.trim().replace(/\s+/g, " ");
    el.dataset.text = text;
    const [base, step, dur] = (el.dataset.lines || "0,90,1600").split(",").map(Number);
    el.innerHTML = text.split(" ").map((w) => `<span class="ab-word" style="display:inline-block">${w}</span>`).join(" ");
    const lines = [];
    let top;
    el.querySelectorAll(".ab-word").forEach((w) => {
      const t = Math.round(w.offsetTop);
      if (top === undefined || Math.abs(t - top) > 2) { lines.push([]); top = t; }
      lines.at(-1).push(w.textContent);
    });
    const first = el.dataset.indent ? " ab-first" : "";
    el.innerHTML = `<span class="ab-sr">${text}</span>` + lines.map((l, i) => `<span class="ab-mask${i ? "" : first}" aria-hidden="true"><span class="ab-line" style="--d:${base + i * step}ms;--t:${dur}ms">${l.join(" ")}</span></span>`).join("");
  };
  let laidWidth = 0;
  const layout = () => { lineTargets.forEach(splitLines); laidWidth = document.body.clientWidth; sizeFlinks(); };
  site.ready = (document.fonts?.ready || Promise.resolve()).catch(() => {}).then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))).then(layout);
  let resizeT;
  addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { if (Math.abs(document.body.clientWidth - laidWidth) >= 1) layout(); }, 180);
  }, { passive: true });

  // Turn on when visible — data-reveal="Bottom margin"(default -20%). Hidden first so that even fast scrolling doesn’t flash it fully drawn
  const watched = [...document.querySelectorAll("[data-reveal]")];
  if (reduce) watched.forEach((el) => el.classList.add("is-in"));
  else {
    watched.forEach((el) => el.classList.add("is-armed"));
    const ios = new Map();
    site.watch = () => watched.forEach((el) => {
      const m = el.dataset.reveal || "-20%";
      if (!ios.has(m)) ios.set(m, new IntersectionObserver((es, io) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: `0px 0px ${m} 0px` }));
      ios.get(m).observe(el);
    });
  }
  site.watch ||= () => {};

  // Header: when the header center sits over a dark section ([data-dark]), the text turns white
  const head = document.querySelector(".ab-head");
  const darks = [...document.querySelectorAll("[data-dark]")];
  let headRaf = 0;
  const tone = () => {
    headRaf = 0;
    if (!head) return;
    const b = head.getBoundingClientRect(), mid = b.top + b.height / 2;
    document.body.classList.toggle("is-head-dark", darks.some((d) => { const r = d.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; }));
  };
  addEventListener("scroll", () => { if (!headRaf) headRaf = requestAnimationFrame(tone); }, { passive: true });
  addEventListener("resize", tone);
  tone();

  // Phone menu: drops from the top in .68s, cleaned up 860ms after closing
  const burger = document.querySelector(".ab-burger"), menu = document.querySelector(".ab-menu");
  let menuT, lockY = 0;
  const setMenu = (open) => {
    if (!burger || !menu) return;
    clearTimeout(menuT);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    if (open) {
      lockY = scrollY;
      menu.classList.remove("is-closing");
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-menu");
      site.lenis?.stop();
      return;
    }
    if (!menu.classList.contains("is-open")) return;
    menu.classList.add("is-closing");
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-menu");
    site.lenis?.start();
    menuT = setTimeout(() => menu.classList.remove("is-closing"), reduce ? 0 : 860);
  };
  burger?.addEventListener("click", () => setMenu(!document.body.classList.contains("is-menu")));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  addEventListener("scroll", () => { if (document.body.classList.contains("is-menu") && scrollY !== lockY) scrollTo(0, lockY); }, { passive: true });
  menu?.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // Clocks: viewer’s time zone · studio time zone
  const you = document.querySelector("[data-clock-you]"), me = document.querySelector("[data-clock-me]"), youLabel = document.querySelector("[data-clock-you-label]");
  const fmt = (zone) => new Intl.DateTimeFormat("en-GB", { timeZone: zone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date());
  const tickClock = () => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (youLabel) {
      const short = new Intl.DateTimeFormat("en", { timeZone: zone, timeZoneName: "short" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value;
      youLabel.textContent = `Viewer’s time${short ? ` (${short})` : ""}`;
    }
    if (you) you.textContent = fmt(zone);
    if (me) me.textContent = fmt(me.dataset.zone || "Asia/City");
  };
  tickClock();
  setInterval(tickClock, 1000);

  // Name band: measure width and position so the two words share one sunset
  const name = document.querySelector(".ab-name h2");
  if (name) {
    const sync = () => {
      const b = name.getBoundingClientRect();
      if (!b.width) return;
      name.style.setProperty("--w", `${b.width}px`);
      name.querySelectorAll(".ab-name__w").forEach((w) => w.style.setProperty("--o", `${w.getBoundingClientRect().left - b.left}px`));
    };
    sync();
    new ResizeObserver(sync).observe(name);
  }
})();
