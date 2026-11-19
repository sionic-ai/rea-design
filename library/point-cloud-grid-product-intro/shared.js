// Shared mechanism for the whole site — plugs in header, phone menu, footer and loader, and every page shares the entrances (line rising, scramble, photo curtain) and the clearing on leave.
// Box line drawing, cursor, photo flow distortion and clouds are handled by the motion part (_fx), here we only decide where to attach it and in what order.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
  const page = document.body.dataset.page || "home";
  const SCRAMBLE = "A!B@C#D$E%F&G*H?J[K]L{M}N=O+P-QRSTUVWXYZ";

  const MARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2h9a9 9 0 0 1 0 18H4v-4h3v-3H4V9h3V6H4z"/></svg>';
  const ARROW_UP = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 8 8 2M3.5 2H8v4.5"/></svg>';
  const ARROW_R = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h12m0 0-5-5m5 5-5 5"/></svg>';
  const NAV = [
    ["service", "service.html", "Solutions"],
    ["experiences", "index.html#demo", "Experiences"],
    ["features", "index.html#framework", "Features"],
    ["news", "news.html", "Blog"],
  ];
  const cur = (k) => (k === page || (page === "article" && k === "news") ? ' aria-current="page"' : "");

  // ---------- Plugging in header, menu, loader, footer ----------
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "dd-head";
    head.insertAdjacentHTML("beforebegin", '<a class="dd-skip" href="#main">Skip to content</a>');
    document.querySelector("main")?.setAttribute("id", "main");
    head.innerHTML = `<div class="dd-head__in">
      <a class="dd-logo" href="index.html" data-label="Brand mark + English wordmark">${MARK}<span>Wordmark</span></a>
      <nav class="dd-nav" aria-label="Main menu"><ul>${NAV.map(([k, h, t]) => `<li><a href="${h}"${cur(k)}><span>${t}</span></a></li>`).join("")}</ul></nav>
      <div class="dd-actions">
        <button class="dd-theme" type="button" aria-label="Change brightness"><i class="is-sun"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></i><i class="is-moon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg></i></button>
        <a class="dd-cta" href="about.html#contact">Book a demo ${ARROW_UP}</a>
        <button class="dd-burger" type="button" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button>
      </div>
    </div>`;
    const menu = document.createElement("div");
    menu.className = "dd-menu";
    menu.setAttribute("data-slot", "mobile-menu");
    menu.innerHTML = `<div class="dd-menu__panel"><nav aria-label="Phone menu">${NAV.map(([k, h, t], i) => `<a href="${h}"${cur(k)}><small>${String(i + 1).padStart(2, "0")}</small><b>${t}</b>${ARROW_R}</a>`).join("")}</nav>
      <div class="dd-menu__foot"><p>Your consultation notice here, one line</p><a href="about.html#contact">Book a demo ${ARROW_R}</a></div></div>`;
    head.after(menu);
  }
  const intro = document.createElement("div");
  intro.className = "dd-intro";
  intro.setAttribute("aria-hidden", "true");
  intro.innerHTML = '<span class="dd-intro__mask"><span class="dd-intro__count">0</span></span>';
  document.body.prepend(intro);

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const col = (area, name, links) => `<div class="dd-tile" style="grid-area: ${area}" data-fx="tile-line-draw"><p class="dd-label">${name}</p><ul class="dd-foot__links">${links.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></div>`;
    foot.className = "dd-foot";
    foot.innerHTML = `<div class="dd-foot__in">
      <section class="dd-section dd-section--auto" data-fx="tile-line-draw" data-fx-tile-line-draw="look: frame">
        <div class="dd-tile dd-foot__mark" data-fx="tile-line-draw">
          <div class="dd-foot__rules" aria-hidden="true">${Array.from({ length: 20 }, (_, i) => `<i style="left: ${((i + 0.5) * 5).toFixed(1)}%"></i>`).join("")}</div>
          <div class="dd-foot__wrap" data-fx="flow-pixel-distort"><canvas class="dd-foot__word" data-fx-part="image" role="img" aria-label="Wordmark" data-label="Large wordmark — symbol + English name, full panel width"></canvas></div>
        </div>
      </section>
      <section class="dd-section" data-fx="tile-line-draw" data-fx-tile-line-draw="look: frame">
        <div class="dd-tile" style="grid-area: 1 / 1 / 7 / 5" data-fx="tile-line-draw"><p class="dd-label dd-label--muted">Exploring new dimensions</p><p class="dd-body" style="margin-top: auto; max-width: 30ch">Add about four lines introducing the company. What it makes and who it serves.</p></div>
        ${col("1 / 5 / 7 / 7", "Solutions", [["New-build real estate", "service.html"], ["Hospitality", "service.html"], ["Heritage & Culture", "service.html"], ["Brands & Products", "service.html"], ["Events", "service.html"]])}
        ${col("1 / 7 / 7 / 9", "Product", [["Experiences", "index.html#demo"], ["Features", "index.html#framework"], ["Book a demo", "about.html#contact"], ["FAQ", "index.html#faq"]])}
        ${col("1 / 9 / 7 / 11", "Company", [["Partners", "about.html"], ["About", "about.html"], ["Vision / Manifesto", "about.html"], ["Contact", "about.html#contact"], ["Pro access", "about.html"], ["Graphic system", "about.html"]])}
        ${col("1 / 11 / 7 / 13", "Legal", [["Legal notice", "about.html"], ["Privacy policy", "about.html"]])}
        <div class="dd-tile dd-tile--center" style="grid-area: 7 / 1 / 8 / 7" data-fx="tile-line-draw"><p class="dd-foot__small">© 2026 Studio Name. All rights reserved.</p></div>
        <div class="dd-tile dd-tile--center" style="grid-area: 7 / 7 / 8 / 13; flex-direction: row; align-items: center" data-fx="tile-line-draw"><a class="dd-foot__small" href="#">LinkedIn</a><span class="dd-foot__small dd-foot__lang"><span>FR</span>/<b>EN</b></span></div>
      </section>
    </div>`;
  }

  // While the loader runs, keep the hero grid from being drawn early behind it — attach ”wait until is-intro clears” to every cell-line part (before the parts attach)
  if (root.classList.contains("is-intro")) {
    document.querySelectorAll('[data-fx~="tile-line-draw"]').forEach((el) => {
      const o = el.getAttribute("data-fx-tile-line-draw");
      el.setAttribute("data-fx-tile-line-draw", o ? `${o}; hold: is-intro` : "hold: is-intro");
    });
  }
  // Video slot — as in the original, plays 200px before the screen and pauses once out of view (muted, looped)
  const vio = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play?.().catch(() => {}) : e.target.pause?.())), { rootMargin: "200px 0px" });
  if (!reduce) document.querySelectorAll("video[data-autoplay]").forEach((v) => vio.observe(v));

  // ---------- Theme·menu ----------
  document.querySelector(".dd-theme")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("dd-theme", next); } catch {}
    paintWord();
  });
  const burger = document.querySelector(".dd-burger"), menuEl = document.querySelector(".dd-menu");
  const setMenu = (open) => {
    if (!burger || !menuEl) return;
    burger.setAttribute("aria-expanded", String(open));
    menuEl.classList.toggle("is-open", open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger?.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  menuEl?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // ---------- Smooth scroll (original lenis 1.3.17 · .9s · wheel ×1.15) ----------
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 0.9, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 1.15, touchMultiplier: 2 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.ddLenis = lenis;
  }
  document.querySelectorAll('a[href^="#"], a[href*=".html#"]').forEach((a) => {
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    a.addEventListener("click", (e) => {
      const t = document.querySelector(url.hash);
      if (!t) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(t, { offset: -80 }) : t.scrollIntoView();
    });
  });

  // ---------- Footer wordmark — paint the symbol + English name on a canvas to fill the panel width (the flow distortion uses this canvas as its image) ----------
  const word = document.querySelector(".dd-foot__word");
  function paintWord() {
    if (!word) return;
    const w = word.clientWidth, h = word.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(devicePixelRatio || 1, 2), x = word.getContext("2d");
    word.width = Math.round(w * dpr); word.height = Math.round(h * dpr);
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, w, h);
    const cs = getComputedStyle(word);
    x.fillStyle = cs.color;
    const s = h / 24;
    x.save(); x.scale(s, s); x.fill(new Path2D("M4 2h9a9 9 0 0 1 0 18H4v-4h3v-3H4V9h3V6H4z")); x.restore();
    const fam = getComputedStyle(root).getPropertyValue("--kf-font-display");
    let size = h * 1.02;
    x.font = `600 ${size}px ${fam}`;
    const room = w - h * 1.1, tw = x.measureText("Wordmark").width;
    if (tw > room) { size *= room / tw; x.font = `600 ${size}px ${fam}`; }
    x.textBaseline = "alphabetic";
    x.fillText("Wordmark", h * 1.1, h * 0.8);
    word.closest('[data-fx~="flow-pixel-distort"]')?.dispatchEvent(new CustomEvent("fx:refresh"));
  }
  if (word) {
    new ResizeObserver(paintWord).observe(word);
    document.fonts?.ready.then(paintWord);
  }

  // ---------- Loader ----------
  const introDone = [];
  const onIntroDone = (fn) => (root.classList.contains("is-intro") ? introDone.push(fn) : fn());
  window.ddIntro = onIntroDone;
  const finishIntro = () => {
    root.classList.remove("is-intro");
    introDone.splice(0).forEach((fn) => fn());
    ScrollTrigger.refresh();
  };
  if (root.classList.contains("is-intro")) {
    const count = intro.querySelector(".dd-intro__count");
    const start = 15 + Math.floor(Math.random() * 11);
    const total = 2;
    let got = 0, p = 0, shown = start, ended = false;
    count.textContent = String(start);
    (document.fonts?.ready || Promise.resolve()).then(() => got++);
    (window.requestIdleCallback || ((f) => setTimeout(f, 32)))(() => got++, { timeout: 500 });
    const t0 = performance.now();
    // As in the original, the larger the value the finer the steps — narrowing 50 → 15 → 6 → 2 → 1 so it climbs densely at the end
    const snap = (v) => (v >= 98 ? Math.round(v) : v >= 93 ? 2 * Math.round(v / 2) : v >= 82 ? 6 * Math.round(v / 6) : v >= 55 ? 15 * Math.round(v / 15) : 50 * Math.round(v / 50));
    const tick = () => {
      if (ended) return;
      const t = performance.now() - t0;
      p += ((t > 3000 ? 100 : (got / total) * 100) - p) * 0.1;
      const r = Math.min(100, Math.max(start, snap(p)));
      if (r !== shown) count.textContent = String((shown = r));
      if ((got >= total || t > 3000) && t >= 400) {
        ended = true;
        count.textContent = "100";
        count.style.transition = "transform 0.5s cubic-bezier(0.32, 0, 0.67, 0)";
        void count.offsetWidth;
        count.style.transform = "translateY(-110%)";
        let fired = false;
        const end = () => { if (fired) return; fired = true; finishIntro(); };
        count.addEventListener("transitionend", end, { once: true });
        setTimeout(end, 700);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ---------- Entrance ----------
  const splits = new Map();
  const skip = (el) => el.closest("[data-reveal-off]");
  const veil = (el, delay) => {
    let v = el.querySelector(":scope > .dd-veil");
    if (!v) { v = document.createElement("span"); v.className = "dd-veil"; v.setAttribute("aria-hidden", "true"); el.append(v); }
    gsap.timeline({ delay })
      .set(v, { scaleX: 0, transformOrigin: "left center" })
      .to(v, { scaleX: 1, duration: 0.45, ease: "power2.inOut" })
      .add(() => el.classList.add("is-in"))
      .set(v, { transformOrigin: "right center" })
      .to(v, { scaleX: 0, duration: 0.6, ease: "power3.inOut" }, "+=0.05");
  };
  const kinds = [
    [".dd-display, .dd-heading", (el, delay) => {
      const s = SplitText.create(el, { type: "lines", mask: "lines", aria: "none" });
      splits.set(el, s);
      el.classList.add("is-in");
      gsap.fromTo(s.lines, { yPercent: 100 }, { yPercent: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, delay, onComplete: () => { s.revert(); splits.delete(el); } });
    }],
    [".dd-subtitle, .dd-body", (el, delay) => {
      gsap.delayedCall(delay, () => {
        el.classList.add("is-in");
        const s = SplitText.create(el, { type: "lines", linesClass: "dd-scramble-line", aria: "none" });
        splits.set(el, s);
        const tl = gsap.timeline({ onComplete: () => { s.revert(); splits.delete(el); } });
        s.lines.forEach((line, i) => {
          const text = line.textContent || "";
          tl.fromTo(line, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "power2.out" }, 0.1 * i);
          tl.to(line, { duration: 0.9, ease: "none", scrambleText: { text, chars: SCRAMBLE, revealDelay: 0.15, speed: 0.3 } }, 0.1 * i);
        });
      });
    }],
    [".dd-label, .dd-foot__links a, .dd-foot__small, .dd-toc a", (el, delay) => {
      el.classList.add("is-in");
      gsap.fromTo(el, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.5, ease: "power2.out", delay });
    }],
    [".dd-prose > *", (el, delay) => {
      el.classList.add("is-in");
      gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay });
    }],
    [".dd-img, .dd-thumb", veil],
  ];
  const startReveal = () => {
    if (reduce) { document.querySelectorAll(".dd-img, .dd-thumb").forEach((el) => el.classList.add("is-in")); return; }
    const inView = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight * 0.92; };
    kinds.forEach(([sel, play]) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (skip(el) || el.closest(".dd-head, .dd-menu, .dd-intro")) return;
        if (inView(el)) play(el, 0.1);
        else ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => play(el, 0) });
      });
    });
    const rules = document.querySelectorAll(".dd-foot__rules i");
    if (rules.length) {
      gsap.set(rules, { "--draw-y": 0 });
      ScrollTrigger.create({ trigger: ".dd-foot", start: "top 88%", once: true, onEnter: () => gsap.to(rules, { "--draw-y": 1, duration: 0.9, ease: "power2.out", stagger: 0.03 }) });
    }
  };
  onIntroDone(startReveal);

  // ---------- On leave — grid lines clear, text lines slide up, the photo is covered by a background-color curtain, then the footer is clipped upward and vanishes ----------
  let leaving = false;
  const near = (el) => { const r = el.getBoundingClientRect(); return r.bottom > -100 && r.top < innerHeight + 100; };
  function leave(go) {
    if (leaving) return;
    leaving = true;
    root.classList.add("is-navigating");
    try { sessionStorage.setItem("dd-nav", "1"); } catch {}
    if (reduce) { go(); return; }
    splits.forEach((s) => s.revert());
    splits.clear();
    const tl = gsap.timeline({ onComplete: go });
    let any = false;
    const lines = [...document.querySelectorAll('[data-fx~="tile-line-draw"]')].filter(near);
    if (lines.length) { tl.call(() => lines.forEach((n) => n.dispatchEvent(new CustomEvent("fx:leave"))), null, 0); tl.to({}, { duration: 0.4 }, 0); any = true; }
    const titles = [...document.querySelectorAll("main .dd-display, main .dd-heading")].filter(near);
    if (titles.length) {
      const l = titles.flatMap((el) => SplitText.create(el, { type: "lines", mask: "lines", aria: "none" }).lines);
      tl.to(l, { yPercent: -100, duration: 0.6, ease: "power3.in", stagger: 0.06 }, 0); any = true;
    }
    const prose = [...document.querySelectorAll(".dd-prose > *")].filter(near);
    if (prose.length) { tl.to(prose, { opacity: 0, y: -16, duration: 0.45, ease: "power2.in", stagger: 0.03 }, 0); any = true; }
    const copy = [...document.querySelectorAll("main .dd-subtitle, main .dd-body")].filter(near);
    if (copy.length) {
      const l = copy.flatMap((el) => SplitText.create(el, { type: "lines", linesClass: "dd-scramble-line" }).lines);
      tl.to(l, { clipPath: "inset(0 100% 0 0)", duration: 0.5, ease: "power2.in", stagger: 0.04 }, 0); any = true;
    }
    const labels = [...document.querySelectorAll("main .dd-label")].filter(near);
    if (labels.length) { tl.to(labels, { clipPath: "inset(0 100% 0 0)", duration: 0.4, ease: "power2.in", stagger: 0.02 }, 0); any = true; }
    const pics = [...document.querySelectorAll(".dd-img, .dd-thumb")].filter(near);
    if (pics.length) {
      const bg = getComputedStyle(document.body).backgroundColor;
      const vs = pics.map((el) => { const v = document.createElement("span"); v.className = "dd-veil"; v.style.cssText = `background:${bg};transform-origin:right center`; el.append(v); return v; });
      tl.to(vs, { scaleX: 1, duration: 0.4, ease: "power3.inOut" }, 0.42); any = true;
    }
    const f = document.querySelector(".dd-foot");
    if (f && near(f)) { tl.fromTo(f, { clipPath: "inset(0% 0 0 0)" }, { clipPath: "inset(100% 0 0 0)", duration: 0.7, ease: "expo.inOut" }, Math.max(0, tl.duration() - 0.3)); any = true; }
    if (!any) { tl.kill(); go(); }
  }
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.("a[href]");
    if (!a || a.target === "_blank") return;
    const url = new URL(a.getAttribute("href"), location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || !/\.html$/.test(url.pathname)) return;
    e.preventDefault();
    leave(() => { location.href = url.href; });
  }, true);
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });
})();
