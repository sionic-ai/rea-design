/* Shared by all pages plus per-page motion — barba swaps only the main, so page motion is attached and detached by namespace.
   Original: Alpine + Lenis 1.3.8 (lerp .1) + barba 2.10.3 (beige curtain .5s) + three r164 gradient background */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover)").matches;
  const md = () => innerWidth >= 768;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
  gsap.registerPlugin(ScrollTrigger);

  const LOGO = '<svg viewBox="0 0 64 52" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="32" cy="26" r="19"/><path d="M9 27c5-6 10-6 15 0s10 6 15 0 10-6 16-1"/><path d="M17 17c4-3 8-3 12 0M35 35c4 3 8 3 12 0"/></svg>';
  const ARROW = '<svg class="is-prev" viewBox="0 0 5 7"><path d="M0 0 5 3.5 0 7z" fill="currentColor"/></svg><svg class="is-now" viewBox="0 0 5 7"><path d="M0 0 5 3.5 0 7z" fill="currentColor"/></svg>';
  const NAV = [
    [["Menu 1", "service.html", "service"], ["Menu 2", "#"], ["Menu 3", "#"]],
    [["Menu 4", "#"], ["Menu 5", "about.html", "about"], ["Menu 6", "#"]],
  ];
  // Text roll — two copies of the same text (original text-up·text-down). The outgoing line lies back upward and the incoming line rises from below
  const roll = (t) => `<span class="st-roll"><span class="st-roll__up">${t}</span><span class="st-roll__down" aria-hidden="true">${t}</span></span>`;
  const navCols = (dot) => NAV.map((col) => `<ul>${col.map(([t, h, ns]) => `<li><a href="${h}"${ns ? ` data-ns="${ns}"` : " data-barba-prevent"} data-hl>${dot ? '<i class="st-dot"></i>' : ""}${roll(t)}</a></li>`).join("")}</ul>`).join("");

  /* ───────── Build the header·menu·footer·background just once (barba swaps only main) ───────── */
  const buildChrome = () => {
    const main = document.querySelector("main");
    document.body.insertAdjacentHTML("afterbegin", `
<header class="st-header" data-slot="header">
  <div class="st-header__in">
    <a class="st-logo" href="index.html" aria-label="Back to start">${LOGO}</a>
    <div class="st-header__side">
      <div class="st-lang"><a href="#" aria-current="page">KO</a> / <a href="index.html?lang=en">EN</a></div>
      <div class="st-header__row">
        <nav class="st-nav" aria-label="Main menu"><div class="st-nav__cols">${navCols(true)}</div></nav>
        <div class="st-header__btns">
          <button class="st-burger" type="button" aria-label="Open Menu" data-burger><span class="st-burger__bg"></span><span class="st-burger__lines"><i></i><i></i><i></i></span></button>
          <a class="st-reserve" href="#" data-barba-prevent data-hl data-fx="tilt-glow-hover" data-fx-tilt-glow-hover="track: target"><span class="st-reserve__bg"></span><i class="st-reserve__glow" data-fx-part="glow"></i><span class="st-reserve__in"><span>Book now</span><i class="st-reserve__line"></i><span class="st-circle">${ARROW}</span></span></a>
        </div>
      </div>
    </div>
  </div>
</header>
<div class="st-navmodal" data-slot="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
  <div class="st-navmodal__in">
    <ul>${NAV.flat().map(([t, h, ns], i) => `<li style="--i:${i}"><a href="${h}"${ns ? "" : " data-barba-prevent"}>${t}</a></li>`).join("")}</ul>
    <address>Postal code 000-0000<br>Your one-line address here<br>Phone 00-0000-0000</address>
  </div>
  <div class="st-wordmark" data-wordmark>WORDMARK HERE</div>
</div>`);
    document.body.insertAdjacentHTML("beforeend", `
<footer class="st-footer" data-slot="footer">
  <div class="st-footer__top">
    <a class="st-footer__logo" href="index.html" aria-label="Back to start"><svg viewBox="0 0 247 50" fill="none" stroke="currentColor" stroke-width="1.4"><g transform="translate(0 0) scale(.96)"><circle cx="32" cy="26" r="19"/><path d="M9 27c5-6 10-6 15 0s10 6 15 0 10-6 16-1"/><path d="M17 17c4-3 8-3 12 0M35 35c4 3 8 3 12 0"/></g><text x="74" y="22" fill="currentColor" stroke="none" font-size="17" letter-spacing="1.5" style="font-family:var(--kf-font-latin)">BRAND</text><text x="74" y="42" fill="currentColor" stroke="none" font-size="17" letter-spacing="1.5" style="font-family:var(--kf-font-latin)">NAME</text></svg></a>
    <div class="st-footer__line"></div>
    <ul class="st-footer__mnav">${NAV.flat().map(([t, h, ns]) => `<li><a href="${h}"${ns ? "" : " data-barba-prevent"}>${t}</a></li>`).join("")}</ul>
    <div class="st-footer__menu" data-footer-menu>
      <nav class="st-nav__cols" aria-label="Footer Menu">${navCols(false)}</nav>
      <a class="st-reserve is-m" href="#" data-barba-prevent data-hl data-fx="tilt-glow-hover" data-fx-tilt-glow-hover="track: target"><span class="st-reserve__bg"></span><i class="st-reserve__glow" data-fx-part="glow"></i><span class="st-reserve__in"><span>Book now</span><i class="st-reserve__line"></i><span class="st-circle is-f">${ARROW}</span></span></a>
    </div>
  </div>
  <div class="st-footer__bottom">
    <div>
      <p class="st-footer__label">STAY &amp; PLACE</p>
      <ul class="st-footer__sub"><li><a href="news.html" data-hl>${roll("News")}</a></li><li><a href="#" data-barba-prevent data-hl>${roll("Inquiry")}</a></li></ul>
    </div>
    <div class="st-footer__right-col">
      <div class="st-footer__right"><div class="st-footer__sns"><a href="#" aria-label="Social 1" data-barba-prevent data-hl><svg viewBox="0 0 14 14" fill="none" stroke="currentColor"><path d="M2 2l10 10M12 2 2 12"/></svg></a><a href="#" aria-label="Social 2" data-barba-prevent data-hl><svg viewBox="0 0 14 14" fill="none" stroke="currentColor"><rect x="1.5" y="1.5" width="11" height="11" rx="3"/><circle cx="7" cy="7" r="2.6"/></svg></a></div></div>
      <p class="st-footer__copy">Your one-line copy goes here.</p>
      <div class="st-footer__info">
        <address>Postal code 000-0000<br>Your one-line address here<br>Phone 00-0000-0000</address>
        <div class="st-footer__right"><a class="st-footer__top-btn" href="#top" data-top data-dir="up" data-hl>Back to top <span class="st-circle">${ARROW}</span></a><p class="st-footer__small">© BRAND NAME<br>All Rights Reserved.</p></div>
      </div>
    </div>
  </div>
</footer>`);
    document.querySelectorAll("[data-logo]").forEach((n) => (n.innerHTML = LOGO));
  };

  /* ───────── Wordmark — each letter rises from below (.05s gap) and fades one letter at a time with scroll ───────── */
  const wordmarks = new Map();
  const makeWordmark = (el) => {
    if (wordmarks.has(el)) return wordmarks.get(el);
    const text = el.textContent;
    el.textContent = "";
    el.setAttribute("aria-label", text);
    const groups = [...text].map((c) => {
      const g = document.createElement("span"), inner = document.createElement("span"), p = document.createElement("span");
      g.className = "wm-g"; inner.className = "wm-in"; p.className = "wm-p";
      p.textContent = c === " " ? "\u00a0" : c;
      g.style.display = inner.style.display = p.style.display = "inline-block";
      inner.append(p); g.append(inner); el.append(g);
      return { g, inner, p, timer: 0 };
    });
    // Fit the font size so it exactly fills the plate width like a letter image (the original is an SVG fit to width)
    const fit = () => {
      el.style.fontSize = "";
      const box = el.parentElement, cs = getComputedStyle(box);
      const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (el.scrollWidth > 0 && avail > 0) el.style.fontSize = `${(parseFloat(getComputedStyle(el).fontSize) * avail) / el.scrollWidth}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    addEventListener("resize", fit);
    const h = () => el.getBoundingClientRect().height || 100;
    const api = {
      show({ delay = 0, step = 0.05, duration = 1 } = {}) {
        groups.forEach((o, i) => {
          clearTimeout(o.timer);
          o.g.classList.remove("is-on");
          o.g.classList.toggle("is-instant", duration === 0 || reduced);
          o.g.style.opacity = 0;
          o.g.style.transform = `translate3d(0, ${h() * 0.3}px, 0)`;
          o.inner.style.transform = `translate3d(0, ${h() * 1.7}px, 0)`;
          o.timer = setTimeout(() => {
            o.g.classList.add("is-on");
            o.g.style.opacity = 1;
            o.g.style.transform = o.inner.style.transform = "translate3d(0,0,0)";
          }, reduced ? 0 : 30 + (i * step + delay) * 1000);
        });
      },
      hide(now = false, { step = 0.05 } = {}) {
        groups.forEach((o, i) => {
          clearTimeout(o.timer);
          if (now) o.g.classList.remove("is-on");
          o.timer = setTimeout(() => {
            o.g.style.opacity = 0;
            o.g.style.transform = `translate3d(0, ${-h() * 0.3}px, 0)`;
            o.inner.style.transform = `translate3d(0, ${-h() * 1.7}px, 0)`;
          }, now ? 0 : 30 + i * step * 1000);
        });
      },
      fade(s) {
        groups.forEach((o, i) => { o.p.style.opacity = clamp(1 - (s * groups.length - i * 0.8) * 1.2); });
      },
    };
    wordmarks.set(el, api);
    return api;
  };

  /* ───────── Interaction response (.is-hl) — original highlighted class ───────── */
  const hl = (scope) => {
    if (!canHover) return;
    scope.querySelectorAll("[data-hl]").forEach((a) => {
      if (a.dataset.hlOn) return;
      a.dataset.hlOn = "1";
      // The current page menu does not react (original is-page)
      a.addEventListener("mouseenter", () => a.getAttribute("aria-current") === "page" || a.classList.add("is-hl"));
      a.addEventListener("mouseleave", () => a.classList.remove("is-hl"));
      a.addEventListener("focus", () => a.getAttribute("aria-current") === "page" || a.classList.add("is-hl"));
      a.addEventListener("blur", () => a.classList.remove("is-hl"));
    });
  };

  /* ───────── Smooth scroll ───────── */
  let lenis = null;
  const startLenis = () => {
    if (reduced || !window.Lenis) return;
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  };
  const stopScroll = () => { lenis?.stop(); document.body.classList.add("is-locked"); };
  const startScroll = () => { lenis?.start(); document.body.classList.remove("is-locked"); };
  const scrollTo = (y, immediate) => (lenis ? lenis.scrollTo(y, { immediate, duration: 1.2 }) : window.scrollTo({ top: y, behavior: immediate || reduced ? "auto" : "smooth" }));

  /* ───────── Background shape · header bar color ───────── */
  const bg = () => document.querySelector(".st-gradient");
  let bgMode = "", bgBefore = "";
  const setBg = (m) => { if (m === bgMode) return; bgMode = m; bg().dataset.mode = m; };
  const setHeader = (c) => (root.dataset.header = c || "white");

  /* ───────── In-page motion bundle (everything created on attach is removed at the end) ───────── */
  const scope = { offs: [], add(f) { this.offs.push(f); } };
  const listen = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); scope.add(() => t.removeEventListener(ev, fn, o)); };
  const onScroll = (fn) => {
    let ticking = false;
    const run = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; fn(); }); };
    if (lenis) { lenis.on("scroll", run); scope.add(() => lenis.off("scroll", run)); } else listen(window, "scroll", run, { passive: true });
    listen(window, "resize", run);
    fn();
  };
  const observe = (els, fn, opt) => {
    const io = new IntersectionObserver((es) => es.forEach((e) => fn(e.target, e)), opt);
    els.forEach((n) => io.observe(n));
    scope.add(() => io.disconnect());
  };

  // Scene text — split per character, the outside rises from 10% and the inside from 120% below (.02s per character). Reverses when it falls back down
  const chars = (box) => {
    box.querySelectorAll("[data-chars]").forEach((el) => {
      if (!el.dataset.split) {
        el.dataset.split = "1";
        let i = 0;
        el.querySelectorAll("p").forEach((p) => {
          const words = p.textContent.split(" ");
          p.textContent = "";
          words.forEach((w, wi) => {
            const word = document.createElement("span");
            word.className = "st-word";
            [...w].forEach((c) => { const o = document.createElement("span"); o.className = "st-ch"; o.style.setProperty("--i", i++); o.innerHTML = "<span></span>"; o.firstChild.textContent = c; word.append(o); });
            p.append(word);
            if (wi < words.length - 1) p.append(" ");
          });
        });
        el.classList.add("st-chline");
      }
    });
    observe(box.querySelectorAll("[data-chars]"), (el, e) => {
      if (e.isIntersecting) el.classList.add("is-in");
      else if (e.boundingClientRect.top > innerHeight * 0.5) el.classList.remove("is-in");
    });
  };

  // Photo parallax — on entering the screen brightness turns on 2 → 1, and while the cell passes bottom to top the inside drifts by offsetY%
  const para = (box) => {
    const list = [...box.querySelectorAll("[data-para]")];
    list.forEach((el) => { el.style.setProperty("--oy", el.dataset.oy || 10); el.style.setProperty("--sc", el.dataset.sc || 1.1); });
    observe(list, (el, e) => {
      if (e.isIntersecting) el.classList.add("is-in");
      else if (e.boundingClientRect.top > innerHeight * 0.5) el.classList.remove("is-in");
    });
    onScroll(() => list.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      el.style.setProperty("--p", clamp((innerHeight - r.top) / (r.height + innerHeight)).toFixed(3));
    }));
  };

  // Video plays only while visible (original c-video autoplay, loop)
  const videos = (box) => observe(box.querySelectorAll("video[data-autoplay]"), (v, e) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));

  // Slider — original splide 4.1.4 as is (auto flow is auto-scroll 0.5.3)
  const sliders = (box) => {
    if (!window.Splide) return;
    box.querySelectorAll("[data-slider-auto]").forEach((el) => {
      const s = new Splide(el, { type: "loop", arrows: false, pagination: false, drag: false, autoWidth: true, gap: 40, autoScroll: { speed: reduced ? 0 : 0.5, autoStart: !reduced, pauseOnHover: false, pauseOnFocus: false, rewind: false }, breakpoints: { 900: { gap: 20, autoScroll: { speed: reduced ? 0 : 0.7 } } } });
      s.mount(window.splide?.Extensions || {});
      // Each cell passes its horizontal screen position (0 to 1) to the inner photo to produce a sideways-flowing parallax
      let raf = 0;
      const tick = () => { el.querySelectorAll(".splide__slide").forEach((li) => { const r = li.getBoundingClientRect(); li.style.setProperty("--x", ((r.left + r.width) / (innerWidth + r.width)).toFixed(3)); }); raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
      scope.add(() => { cancelAnimationFrame(raf); s.destroy(); });
    });
    box.querySelectorAll("[data-slider]").forEach((el) => {
      const s = new Splide(el, { type: "slide", perPage: 3, perMove: 1, gap: 0, pagination: false, arrows: false, mediaQuery: "max", autoWidth: true, drag: true, breakpoints: { 1024: { perPage: 1, perMove: 1, drag: true, speed: 600, dragMinThreshold: 30, flickPower: 200, flickVelocityThreshold: 0.6, padding: { right: "2.5vw" } } } });
      s.mount();
      scope.add(() => s.destroy());
    });
  };

  // Header-line color change marker — when the marker enters below the screen center it turns to the changed color, and on leaving again it returns to the original color (original headerColorChanger)
  const headerMarks = (box) => observe(box.querySelectorAll("[data-header-change]"), (el, e) => {
    const r = e.boundingClientRect;
    if (r.top < -innerHeight * 0.5 || r.bottom > innerHeight * 1.5 || !(r.top > innerHeight * 0.5)) return;
    setHeader(e.isIntersecting ? el.dataset.headerChange : el.dataset.headerFrom);
  });

  /* ───────── Front page ───────── */
  let introShown = false, topShown = false;
  const home = (box) => {
    const kv = box.querySelector(".kv"), kvImg = box.querySelector(".kv__img"), kvContent = box.querySelector(".kv__content");
    const margin = box.querySelector(".kv__margin"), title = box.querySelector(".kv__title"), ind = box.querySelector(".kv__ind");
    const addr = box.querySelector(".kv__addr"), news = box.querySelector(".kv__news"), word = makeWordmark(box.querySelector(".kv [data-wordmark]"));
    const ui = box.querySelector(".scene-ui"), scenes = [...box.querySelectorAll(".scene")];
    let ended = false, current = 0;

    // Wrap each word of the intro text — they turn on randomly, one by one
    const sum = box.querySelector("[data-words]");
    if (sum && !sum.dataset.split) {
      sum.dataset.split = "1";
      const ws = sum.textContent.trim().split(/\s+/);
      sum.innerHTML = ws.map((w) => `<span class="st-word">${w}</span>`).join(" ");
    }
    const newsTitle = box.querySelector(".kv__news-title"), track = box.querySelector(".kv__news-track");
    if (newsTitle && track.scrollWidth > newsTitle.clientWidth && !track.dataset.loop) {
      track.dataset.loop = "1";
      const one = track.firstElementChild;
      track.append(one.cloneNode(true), one.cloneNode(true));
      newsTitle.classList.add("is-loop");
      newsTitle.style.setProperty("--loop", `${one.offsetWidth / 26}s`);
    }

    const fit = () => {
      const ih = box.querySelector(".kv__inner").clientHeight;
      kvImg.style.setProperty("--fit", (ih - kvImg.clientHeight) / kvImg.clientHeight);
    };
    fit();
    listen(window, "resize", fit);

    onScroll(() => {
      const vh = innerHeight, mr = margin.getBoundingClientRect();
      const s = 1 - mr.top / vh;                      // Hero pinned-section progress (continues past 0 → 1)
      const a = clamp((vh - mr.bottom) / vh);         // Pinned range ends at screen bottom → upward
      const tb = clamp((vh - mr.top) / (mr.height));  // Fixed range, top → bottom
      const p = clamp(s);
      kvImg.style.setProperty("--p", p);
      kvImg.style.setProperty("--tb", tb);
      kvContent.style.setProperty("--p", p);
      title.style.setProperty("--t", clamp((s * 1.5 - 0.7) * (1 - a * 1.5)));
      const q = clamp(p * 4);
      addr.style.setProperty("--q", q); news.style.setProperty("--q", q); ind.style.setProperty("--q", q);
      if (ended) { word.fade(s); ind.inert = s > 1; }
      // Scene progress — when the top of the first scene touches the screen, lift the first screen slightly
      let any = false;
      scenes.forEach((sc, i) => {
        const r = sc.getBoundingClientRect();
        if (i === 0) kv.style.setProperty("--first", clamp((vh - r.top) / vh));
        const area = sc.querySelector(".scene__spacer").getBoundingClientRect();
        const d = (vh - (area.top + vh * 0.5)) / (r.bottom - area.top - vh * 0.5);
        if (d > 0 && d < 1) { any = true; if (current !== i + 1) { current = i + 1; ui.style.setProperty("--cur", i); } ui.style.setProperty("--prog", clamp(d).toFixed(3)); }
        const btn = sc.querySelector("[data-next]");
        if (btn) btn.inert = (vh - r.bottom) / vh > ((vh - 180) * 0.5 / vh) * 0.9;
      });
      ui.classList.toggle("is-on", any && s > 1);
    });

    box.querySelectorAll("[data-next]").forEach((b) => listen(b, "click", () => {
      const next = b.closest(".scene").nextElementSibling;
      if (next) scrollTo(next.getBoundingClientRect().top + scrollY + innerHeight * 0.5);
    }));

    const words = () => sum?.querySelectorAll(".st-word").forEach((w) => setTimeout(() => w.classList.add("is-on"), reduced ? 0 : Math.random() * 300 + 300));
    const showTop = async () => {
      topShown = true;
      setBg("top");
      document.querySelector(".st-header").classList.add("is-on");
      word.hide(true);
      kvContent.classList.add("is-on");
      if (md()) { await wait(300); kvImg.classList.add("is-on"); await wait(500); kvImg.classList.add("is-img-on"); word.show(); await wait(700); words(); }
      else { await wait(450); kvImg.classList.add("is-on"); await wait(100); kvImg.classList.add("is-img-on"); word.show(); words(); await wait(500); }
      await wait(100);
      kvImg.classList.add("is-bg-off");
      addr.classList.add("is-on"); news.classList.add("is-on");
      ind.inert = false;
      ended = true;
      startScroll();
    };
    const intro = async () => {
      const el = box.querySelector(".intro"), group = el.querySelector(".intro__group");
      // A round mask spreads from the center — outer radius 0 → 150% (1s linear), then .3s later inner radius 0 → 100% (1s power1)
      const m = { inR: 0, outR: 0 };
      const paint = () => { group.style.webkitMaskImage = group.style.maskImage = `radial-gradient(circle, black ${m.inR * 100}%, transparent ${m.outR * 100}%)`; };
      paint();
      el.classList.add("is-ready");
      await wait(200);
      // The original starts counting 2s right away without waiting for the curtain — the curtain (1.7s) runs inside that 2s hold
      gsap.timeline({ onUpdate: paint }).to(m, { outR: 1.5, duration: reduced ? 0 : 1, ease: "none" }).to(m, { inR: 1, duration: reduced ? 0 : 1, ease: "power1.out" }, reduced ? 0 : "-=0.3");
      await wait(2000);
      setBg("top");
      el.classList.add("is-hide");
      await wait(500);
      el.remove();
    };
    const showTopSkip = async () => {
      setBg("top");
      document.querySelector(".st-header").classList.add("is-on");
      word.hide(true);
      kvImg.classList.add("is-bg-off");
      kv.classList.add("is-skip-on");
      await wait(500);
      kv.classList.add("is-skip-off");
      requestAnimationFrame(() => {
        kvContent.classList.add("is-on"); kvImg.classList.add("is-on", "is-img-on");
        word.show({ delay: 0, step: 0, duration: 0 });
        sum?.querySelectorAll(".st-word").forEach((w) => setTimeout(() => w.classList.add("is-on"), Math.random() * (md() ? 100 : 300)));
        addr.classList.add("is-on"); news.classList.add("is-on");
        ind.inert = false;
        ended = true;
        startScroll();
      });
    };
    stopScroll();
    scrollTo(0, true);
    if (!introShown) { introShown = true; intro().then(showTop); }
    else { box.querySelector(".intro")?.remove(); setTimeout(topShown ? showTopSkip : showTop, 10); }
    scope.add(() => { wordmarks.delete(box.querySelector(".kv [data-wordmark]")); });
  };

  /* ───────── Subpage header (small title → copy → photo in order) ───────── */
  // Subpages have no separate entrance motion — only on first open does the headline line light up after .5s (original once)
  const sub = (box) => {
    introShown = true;
    setBg(bgMode === "footer" ? "footer" : "normal");
    const header = document.querySelector(".st-header");
    if (!header.classList.contains("is-on")) setTimeout(() => header.classList.add("is-on"), reduced ? 0 : 500);
  };

  // News list categories (the original has a different URL per category — here we filter on the same page and re-show in .4s)
  const newsFilter = (box) => box.querySelectorAll("[data-cat-link]").forEach((a) => listen(a, "click", (e) => {
    e.preventDefault();
    const cat = a.dataset.catLink;
    box.querySelectorAll("[data-cat-link]").forEach((x) => x.classList.toggle("is-current", x === a));
    const rows = [...box.querySelectorAll("[data-cat]")];
    gsap.to(rows, { autoAlpha: 0, duration: reduced ? 0 : 0.2, onComplete: () => {
      rows.forEach((r) => (r.hidden = cat !== "all" && r.dataset.cat !== cat));
      ScrollTrigger.refresh();
      gsap.fromTo(rows.filter((r) => !r.hidden), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: reduced ? 0 : 0.4, stagger: reduced ? 0 : 0.03, ease: "power2.out" });
    } });
  }));

  // Stay — pressing a facility guide button smoothly scrolls to that section
  const anchors = (box) => box.querySelectorAll("[data-goto]").forEach((b) => listen(b, "click", () => {
    const t = box.querySelector(b.dataset.goto);
    if (t) scrollTo(t.getBoundingClientRect().top + scrollY - 80);
  }));

  const mount = (box) => {
    const ns = box.dataset.barbaNamespace;
    setHeader(box.dataset.headerColor);
    // The current-page menu is inert like the original — untouchable and just dimmed (.6). The marker is aria-current, not a class, so it keeps the same type as the other menu items
    document.querySelectorAll(".st-nav a, .st-navmodal a").forEach((a) => { const on = a.dataset.ns === ns; if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); a.inert = on; });
    hl(box);
    chars(box);
    para(box);
    videos(box);
    sliders(box);
    headerMarks(box);
    anchors(box);
    if (ns === "home") home(box);
    else sub(box);
    if (ns === "news") newsFilter(box);
    ScrollTrigger.refresh();
  };
  const unmount = () => { scope.offs.splice(0).forEach((f) => f()); };
  // On first open — the original loads a big bundled script before motion attaches, so photos and headline lines on subpages switch on that much later.
  // That moment differs per page consistently (measured open about 1.83s · stay 1.53s · news 1.33s), so it is received through the body’s data-first-delay
  const first = (box) => (box.dataset.barbaNamespace === "home" || reduced ? mount(box) : setTimeout(() => mount(box), +(box.dataset.firstDelay ?? 600)));

  /* ───────── Phone Menu ───────── */
  const navi = (open) => {
    const was = document.body.classList.contains("is-navi");
    if (open === was) return;
    const modalWord = makeWordmark(document.querySelector(".st-navmodal [data-wordmark]"));
    document.body.classList.toggle("is-navi", open);
    if (open) { bgBefore = bgMode; setBg("navi"); stopScroll(); setTimeout(() => modalWord.show({ step: 0.03, delay: 0.8 }), 100); }
    else { setBg(bgBefore || "normal"); startScroll(); modalWord.hide(false, { step: 0.01 }); }
  };

  /* ───────── Footer — on entering, the background switches to the footer type, and when the footer menu shows, the header row menu hides ───────── */
  const footer = () => {
    const f = document.querySelector(".st-footer"), menu = f.querySelector("[data-footer-menu]");
    const header = document.querySelector(".st-header"), hideIt = [header.querySelector(".st-nav"), header.querySelector(".st-lang"), header.querySelector(".st-reserve")];
    const y = () => (bg().dataset.y = (f.clientHeight / innerHeight).toFixed(3));
    y();
    new ResizeObserver(y).observe(f);
    let inside = false;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { inside = true; bgBefore = bgMode === "footer" ? bgBefore : bgMode; setBg("footer"); }
      else if (inside) { inside = false; setBg(document.querySelector("main").dataset.barbaNamespace === "home" && bgBefore === "top" ? "top" : "normal"); }
    }).observe(f);
    new IntersectionObserver(([e]) => hideIt.forEach((n) => { n.style.opacity = e.isIntersecting ? 0 : 1; n.inert = e.isIntersecting; })).observe(menu);
    f.querySelector("[data-top]").addEventListener("click", (e) => { e.preventDefault(); scrollTo(0); });
  };

  /* ───────── Page transition — original barba opacity-transition (curtain .5s → swap → clears after .1s) ───────── */
  const sheets = (html) => {
    const want = [...new DOMParser().parseFromString(html, "text/html").querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).href);
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    have.forEach((l) => want.includes(l.href) || l.remove());
    return Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((h) => new Promise((res) => {
      const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href: h });
      l.onload = l.onerror = res;
      document.head.append(l);
    })));
  };
  const veil = (on) => document.querySelector(".st-veil").classList.toggle("is-on", on);

  const start = () => {
    root.classList.add("is-js");
    buildChrome();
    hl(document);
    startLenis();
    footer();
    document.querySelector("[data-burger]").addEventListener("click", () => navi(!document.body.classList.contains("is-navi")));
    addEventListener("keydown", (e) => e.key === "Escape" && navi(false));
    const box = document.querySelector('[data-barba="container"]');
    if (window.barba && /^https?:$/.test(location.protocol)) {
      // Like the original, prefetches visible links when idle (@barba/prefetch)
      if (window.barbaPrefetch) barba.use(barbaPrefetch);
      barba.init({
        timeout: 5000,
        preventRunning: true,
        prevent: ({ el }) => el.hasAttribute("data-barba-prevent") || el.getAttribute("href") === "#",
        transitions: [{
          name: "opacity-transition",
          once: ({ next }) => first(next.container),
          // The original stops only Lenis — locking body with overflow:hidden would re-lay out the whole page, so the curtain would cover late
          leave: () => { navi(false); lenis?.stop(); veil(true); return wait(500); },
          // Attach the motion as soon as the new body arrives (the original starts the moment Alpine inserts it) — the Hero starts moving before the curtain lifts
          beforeEnter: async ({ current, next }) => {
            unmount();
            current.container.remove();
            await sheets(next.html);
            scrollTo(0, true);
            window.scrollTo(0, 0);
            startScroll();
            mount(next.container);
          },
          enter: ({ next }) => {
            document.title = new DOMParser().parseFromString(next.html, "text/html").title;
            // In the original, Alpine starts the first screen the moment the body is inserted (before enter) and the curtain lifts .1s after enter — the copy attaches in beforeEnter, so add the gap in between (.07s)
            setTimeout(() => veil(false), reduced ? 0 : 170);
          },
        }],
      });
      return;
    }
    first(box);
    // On file:// barba can’t fetch the next page — cover with the same curtain, then navigate normally
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || e.metaKey || e.ctrlKey || a.hasAttribute("data-barba-prevent")) return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html$/.test(href)) return;
      e.preventDefault();
      veil(true);
      setTimeout(() => (location.href = href), reduced ? 0 : 500);
    });
    addEventListener("pageshow", (e) => e.persisted && veil(false));
  };
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();
})();
