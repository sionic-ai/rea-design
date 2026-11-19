/* Motion of the whole site — as in the original, each module has Init/Destroy and is re-attached on a swup transition */
(() => {
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const modules = {};

  /* ───── When visible, inviewed — original margins (-25%, -50%, top only -50%) kept as they are ───── */
  {
    let obs = [];
    const watch = (sel, margin, once = true) => {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("inviewed"); if (once) io.unobserve(e.target); }
        else if (!once) e.target.classList.remove("inviewed");
      }), { rootMargin: margin });
      $$(sel).forEach((el) => io.observe(el));
      obs.push(io);
    };
    modules.Inview = {
      init() {
        watch(".js-inview", "0px");
        watch(".js-inview25", "-25% 0px");
        watch(".js-inview50:not(.js-inview-top)", "-50% 0px");
        watch(".js-inview50.js-inview-top", "0px 0px -50% 0px");
      },
      destroy() { obs.forEach((o) => o.disconnect()); obs = []; },
    };
  }

  /* ───── Hero video: 3.003s clips in a shuffled order, two players alternate and hand off .3s before the end ───── */
  const KV = (() => {
    const g = 0.3;
    const clipsOf = (n, d) => Array.from({ length: n }, (_, i) => ({ start: +(i * d).toFixed(3), end: +((i + 1) * d).toFixed(3) }));
    const SRC = { pc: { url: "media/kv-pc.mp4", clips: clipsOf(12, 3.003) }, sp: { url: "media/kv-sp.mp4", clips: clipsOf(12, 3.003) } };
    const mq = matchMedia("(orientation: landscape)");
    let root, wa, wb, va, vb, cur, nxt, curW, nxtW, list = [], idx = 0, active = false, switching = false, nextReady = false, pending = false;
    const seek = (v, t) => new Promise((res) => {
      const done = () => { v.removeEventListener("seeked", done); res(); };
      v.addEventListener("seeked", done);
      v.currentTime = t;
      setTimeout(done, 1200);
    });
    const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    function prepNext() {
      const c = list[(idx + 1) % list.length];
      nextReady = false;
      seek(nxt, c.start + g).then(() => { nxt.pause(); nxtW.style.visibility = "visible"; nextReady = true; if (pending) swap(); });
    }
    function swap() {
      switching = pending = false;
      idx = (idx + 1) % list.length;
      nxtW.style.visibility = "";
      curW.classList.remove("is-active");
      nxtW.classList.add("is-active");
      if (active) nxt.play().catch(() => {});
      [cur, nxt] = [nxt, cur];
      [curW, nxtW] = [nxtW, curW];
      prepNext();
    }
    function tick() {
      if (switching || !list.length) return;
      if (cur.currentTime >= list[idx].end - g) {
        switching = true;
        cur.pause();
        if (nextReady) swap(); else pending = true;
      }
    }
    function load() {
      const src = mq.matches ? SRC.pc : SRC.sp;
      root.classList.toggle("is-sp", src === SRC.sp);
      list = shuffle(src.clips); idx = 0; switching = pending = nextReady = false;
      cur = va; nxt = vb; curW = wa; nxtW = wb;
      [wa, wb].forEach((w) => { w.classList.remove("is-active"); w.style.visibility = ""; });
      [va, vb].forEach((v) => { v.removeEventListener("timeupdate", tick); v.src = src.url; v.load(); });
      va.addEventListener("timeupdate", tick); vb.addEventListener("timeupdate", tick);
      Promise.all([va, vb].map((v) => new Promise((r) => (v.readyState >= 1 ? r() : v.addEventListener("loadedmetadata", r, { once: true })))))
        .then(() => seek(cur, list[0].start + g))
        // Don’t lift until the loading panel’s leaves (.7s) and flowers (.6s after .5s) finish popping — the original waits until the video host is ready, so it’s always later than this
        .then(() => new Promise((r) => setTimeout(r, Math.max(0, 1200 - performance.now()))))
        .then(() => { curW.classList.add("is-active"); $(".video-loading", root)?.remove(); return active ? cur.play().catch(() => {}) : null; })
        .then(prepNext);
    }
    return {
      init() {
        root = $(".kv-video");
        if (!root || root.dataset.ready) return;
        root.dataset.ready = "1";
        [wa, wb] = $$(".kv-video__wrapper", root);
        [va, vb] = [wa, wb].map((w) => $("video", w));
        active = !!$("#swup.home");
        load();
        mq.addEventListener("change", load);
        document.addEventListener("visibilitychange", () => { if (document.hidden) cur.pause(); else if (active) cur.play().catch(() => {}); });
      },
      setActive(on) { active = on; if (!cur) return; if (on && !document.hidden) cur.play().catch(() => {}); else cur.pause(); },
    };
  })();

  /* ───── Tab folder stack — when the next folder touches, the previous folder is released from sticky and exits upward ───── */
  {
    let items = [], on = false, raf = false;
    const update = () => {
      const y = scrollY;
      items.forEach((it) => {
        const out = y >= it.trigger;
        if (out === it.exiting) return;
        it.exiting = out;
        it.el.style.position = out ? "relative" : "";
        it.el.style.top = out ? "0" : "";
        it.el.style.transform = out ? `translateY(${it.offset}px)` : "";
      });
    };
    const measure = () => {
      items = [];
      $$(".top__bg").forEach((bg) => {
        const fs = $$(":scope > .folder", bg);
        if (fs.length < 2) return;
        fs.forEach((f) => { f.style.position = "static"; f.style.top = ""; f.style.transform = ""; });
        const tops = fs.map((f) => f.getBoundingClientRect().top + scrollY);
        const hs = fs.map((f) => f.getBoundingClientRect().height);
        const links = fs.map((f) => $(".folder__link", f)?.getBoundingClientRect().height || 0);
        fs.forEach((f) => (f.style.position = ""));
        const st = fs.map((f) => parseFloat(getComputedStyle(f).top) || 0);
        const bottom = bg.getBoundingClientRect().bottom + scrollY;
        const last = fs.length - 1;
        fs.forEach((f, i) => {
          const trigger = i === last ? bottom - hs[last] - st[last] : tops[i + 1] - st[i + 1] - links[i];
          items.push({ el: f, trigger, offset: st[i] + trigger - tops[i], exiting: false });
        });
      });
      update();
    };
    const onScroll = () => { if (!raf) { raf = true; requestAnimationFrame(() => { update(); raf = false; }); } };
    const onResize = debounce(measure, 150);
    modules.FolderStack = {
      init() { if (on) return; on = true; measure(); addEventListener("load", measure); addEventListener("resize", onResize); addEventListener("scroll", onScroll, { passive: true }); },
      destroy() { if (!on) return; on = false; items = []; removeEventListener("load", measure); removeEventListener("resize", onResize); removeEventListener("scroll", onScroll); },
    };
  }

  /* ───── Swiper seamless strip (speed 14000 · delay 1) — runs only within 300px of the screen ───── */
  const flowSwipers = (sel, opts) => {
    let io, list = [];
    return {
      init() {
        const els = $$(sel);
        if (!els.length || typeof Swiper === "undefined") return;
        io = new IntersectionObserver((es) => es.forEach((e) => {
          const t = e.target;
          if (e.isIntersecting) {
            if (t.swiper) t.swiper.autoplay.start();
            else { list.push(new Swiper(t, opts)); t.dispatchEvent(new CustomEvent("flow:ready")); }
          } else if (t.swiper) t.swiper.autoplay.stop();
        }), { rootMargin: "300px 0px" });
        els.forEach((el) => io.observe(el));
      },
      destroy() { io?.disconnect(); list.forEach((s) => s.destroy(true, true)); list = []; },
    };
  };
  const auto = { delay: 1, disableOnInteraction: false, pauseOnMouseEnter: false };
  modules.FolderSlider = flowSwipers(".folder__slider", {
    direction: "vertical", slidesPerView: 3, spaceBetween: 16, loop: true, allowTouchMove: false, speed: 14000, autoplay: auto,
    breakpoints: { 600: { direction: "horizontal", slidesPerView: 3.1, spaceBetween: 33 } },
  });
  {
    const base = flowSwipers(".about-members__slider, .about-first__slider", { slidesPerView: "auto", spaceBetween: 0, loop: true, allowTouchMove: false, speed: 14000, autoplay: auto });
    let pops = [];
    modules.MembersSlider = {
      init() {
        $$(".about-members__slider").forEach((s) => s.addEventListener("flow:ready", () => {
          const root = s.closest(".about-members__image");
          const b = $$(".baloon", s);
          if (!root || !b.length) return;
          const inn = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("popped")), { root, rootMargin: "0px -50% 0px -50%" });
          const outn = new IntersectionObserver((es) => es.forEach((e) => !e.isIntersecting && e.target.classList.remove("popped")), { root });
          b.forEach((x) => { inn.observe(x); outn.observe(x); });
          pops.push(inn, outn);
        }, { once: true }));
        base.init();
      },
      destroy() { pops.forEach((o) => o.disconnect()); pops = []; base.destroy(); },
    };
  }

  /* ───── Photo crossfade (every 4s, 1s ease) ───── */
  {
    let timers = [];
    modules.Crossfade = {
      init() {
        $$(".crossfade").forEach((ul) => {
          const li = $$(":scope > li", ul);
          if (li.length < 2) return;
          let i = 0;
          li[0].classList.add("is-active");
          timers.push(setInterval(() => { const n = (i + 1) % li.length; li[n].classList.add("is-active"); li[i].classList.remove("is-active"); i = n; }, Number(ul.dataset.interval) || 4000));
        });
      },
      destroy() { timers.forEach(clearInterval); timers = []; },
    };
  }

  /* ───── Press a tile and a circle grows from that tile’s spot to open the description panel ───── */
  modules.TileModal = {
    init() {
      $$(".tile-modal").forEach((root) => {
        let open = null;
        const close = (el, then) => {
          el.classList.remove("is-open");
          let done = false;
          const fin = () => { if (!done) { done = true; then?.(); } };
          el.addEventListener("transitionend", fin, { once: true });
          setTimeout(fin, 500);
        };
        const show = (el, btn) => {
          const t = btn.getBoundingClientRect(), r = el.getBoundingClientRect();
          // So that moving the center itself doesn’t slide the circle, first moves the closed circle to that spot, then opens it
          el.style.transition = "none";
          el.style.setProperty("--tile-modal-origin", `${((t.left + t.width / 2 - r.left) / r.width) * 100}% ${((t.top + t.height / 2 - r.top) / r.height) * 100}%`);
          el.getBoundingClientRect();
          el.style.transition = "";
          el.classList.add("is-open");
          open = el;
        };
        $$(".tile-nav__button", root).forEach((btn) => btn.addEventListener("click", (e) => {
          e.preventDefault();
          const el = $(".tile-modal__item#" + CSS.escape(btn.getAttribute("href").slice(1)), root);
          if (!el) return;
          if (open === el) { close(el); open = null; }
          else if (open) { const prev = open; open = null; close(prev, () => show(el, btn)); }
          else show(el, btn);
        }));
        $$(".tile-modal__item", root).forEach((el) => el.addEventListener("click", () => { if (el.classList.contains("is-open")) { close(el); open = null; } }));
      });
    },
  };

  /* ───── Case panels stacked — panel height as a variable ───── */
  {
    let ro = null;
    modules.CaseStack = {
      init() {
        const cs = $$(".feature-case");
        if (cs.length < 2) return;
        const set = (el) => el.style.setProperty("--case-height", el.offsetHeight + "px");
        cs.forEach(set);
        ro = new ResizeObserver((es) => es.forEach((e) => set(e.target)));
        cs.forEach((c) => ro.observe(c));
      },
      destroy() { ro?.disconnect(); ro = null; },
    };
  }

  /* ───── Small video in the footer and menu panel, plays when you get close ───── */
  {
    let io = null;
    modules.MenuVideo = {
      init() {
        io = new IntersectionObserver((es) => es.forEach((e) => {
          const v = e.target;
          if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
        }), { rootMargin: "200px" });
        $$(".menu-video video").forEach((v) => io.observe(v));
      },
      destroy() { io?.disconnect(); },
    };
  }

  /* ───── Flower and leaf iris calculation — the scale that puts the shape box’s center on the point and covers all four screen corners ───── */
  const Iris = (() => {
    const box = (id) => { const p = document.getElementById(id); const b = p.getBBox(); return { w: b.width, h: b.height, r: Math.hypot(b.width / 2, b.height / 2) }; };
    const shapes = {};
    const get = (k) => (shapes[k] ||= (() => { const s = box(k === "flower" ? "shape-flower-src" : "shape-leaf-src"); if (k === "leaf") s.r = Math.min(s.w, s.h) / 2; return s; })());
    return {
      openScale(k, x, y) { const far = [[0, 0], [innerWidth, 0], [0, innerHeight], [innerWidth, innerHeight]].reduce((m, [a, b]) => Math.max(m, Math.hypot(a - x, b - y)), 0); return (far / get(k).r) * 2; },
      transform(k, x, y, s) { const g = get(k); return `translate(${x}px, ${y}px) scale(${s}) translate(${-g.w / 2}px, ${-g.h / 2}px)`; },
      d(k) { return document.getElementById(k === "flower" ? "shape-flower-src" : "shape-leaf-src").getAttribute("d"); },
    };
  })();

  /* ───── Header row · menu drawer ───── */
  const Header = (() => {
    let header, nav, btn, path, open = false, solid = true, spacerIO = null, scrollHint = null;
    const center = () => { const r = $(".arrow", btn).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    const paint = () => header.classList.toggle("is-scrolled", scrollY > 0 && solid);
    const invert = () => header.classList.toggle("invert", open);
    function watchSpacer() {
      spacerIO?.disconnect();
      const sp = $(".global-header__spacer");
      if (!sp) { solid = true; paint(); return; }
      solid = false;
      spacerIO = new IntersectionObserver((es) => { solid = es[0].boundingClientRect.bottom <= 0; paint(); }, { threshold: 0 });
      spacerIO.observe(sp);
    }
    function scrollCue() {
      const el = $(".kv__scroll");
      if (!el) return;
      const down = scrollY > 50;
      if (down === scrollHint) return;
      scrollHint = down;
      el.classList.remove("is-revealing", "is-hiding", "is-hidden");
      el.classList.add(down ? "is-hiding" : "is-revealing");
    }
    function openMenu() {
      btn.classList.add("open");
      const top = header.getBoundingClientRect().top;
      if (top > 0) scrollBy(0, Math.ceil(top));
      document.body.style.overflow = "hidden";
      const c = center();
      path.style.transition = "none";
      path.style.transform = Iris.transform("flower", c.x, c.y, 0);
      nav.classList.add("open");
      path.classList.add("open");
      path.getBoundingClientRect();
      path.style.transition = "";
      requestAnimationFrame(() => { path.style.transform = Iris.transform("flower", c.x, c.y, Iris.openScale("flower", c.x, c.y)); });
      open = true; invert();
    }
    function closeMenu() {
      btn.classList.remove("open");
      const c = center();
      path.style.transform = Iris.transform("flower", c.x, c.y, 0);
      nav.classList.remove("open");
      path.classList.remove("open");
      let done = false;
      const fin = () => { if (!done) { done = true; document.body.style.overflow = ""; } };
      path.addEventListener("transitionend", function h(e) { if (e.propertyName === "transform") { path.removeEventListener("transitionend", h); fin(); } });
      setTimeout(fin, 1000);
      open = false; invert();
    }
    function forceClose() {
      if (!open) return;
      btn.classList.remove("open");
      path.style.transition = "none";
      const c = center();
      path.style.transform = Iris.transform("flower", c.x, c.y, 0);
      nav.classList.remove("open"); path.classList.remove("open");
      path.getBoundingClientRect(); path.style.transition = "";
      open = false; invert(); document.body.style.overflow = "";
    }
    return {
      init() {
        header = $(".global-header"); nav = $(".global-navigation"); btn = $(".menu-button", header); path = document.getElementById("iris-clip-nav-path");
        path.setAttribute("d", Iris.d("flower"));
        path.style.transform = Iris.transform("flower", innerWidth, 0, 0);
        btn.addEventListener("click", () => (open ? closeMenu : openMenu)());
        nav.addEventListener("click", (e) => { if (!e.target.closest(".menu")) closeMenu(); });
        matchMedia("(min-width: 1100px)").addEventListener("change", (e) => e.matches && forceClose());
        addEventListener("resize", debounce(() => {
          if (!open) return;
          const c = center();
          path.style.transition = "none";
          path.style.transform = Iris.transform("flower", c.x, c.y, Iris.openScale("flower", c.x, c.y));
          path.getBoundingClientRect(); path.style.transition = "";
        }, 100));
        addEventListener("scroll", () => { paint(); scrollCue(); }, { passive: true });
        document.addEventListener("animationend", (e) => {
          if (e.animationName === "kvScrollHide") { e.target.classList.remove("is-hiding"); e.target.classList.add("is-hidden"); }
          else if (e.animationName === "kvScrollShow") e.target.classList.remove("is-revealing");
        });
        document.addEventListener("click", (e) => {
          const t = e.target.closest(".kv__menubtn, .kv__scroll, .global-footer__totop");
          if (!t) return;
          if (t.matches(".global-footer__totop")) { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); return; }
          scrollBy({ top: header.offsetHeight, behavior: reduce() ? "instant" : "smooth" });
        });
        this.reinit();
      },
      reinit() {
        watchSpacer();
        const el = $(".kv__scroll");
        if (el) { scrollHint = true; el.classList.remove("is-revealing", "is-hiding"); el.classList.add("is-hidden"); el.getBoundingClientRect(); scrollCue(); }
      },
      forceClose,
      isOpen: () => open,
      nav: () => nav,
    };
  })();

  const order = ["Inview", "FolderStack", "FolderSlider", "MembersSlider", "TileModal", "Crossfade", "CaseStack", "MenuVideo", "CharaMesh"];
  const run = (fn) => order.forEach((k) => { const m = modules[k] || window.TLModules?.[k]; m?.[fn]?.(); });

  /* ───── Page transition (swup): a leaf shape closes at the pressed spot, the new page opens as a flower shape from the screen center ───── */
  function startSwup() {
    if (typeof Swup === "undefined" || !$("#swup")) return;
    const swup = new Swup({ containers: ["#swup"], plugins: [new SwupHeadPlugin()] });
    const main = () => document.getElementById("swup");
    const path = () => document.getElementById("iris-clip-swup-path");
    const mid = () => ({ x: innerWidth / 2, y: innerHeight / 2 });
    const local = (el, p) => { const r = el.getBoundingClientRect(); return { x: p.x - r.left, y: p.y - r.top }; };
    const waitTransform = (el) => new Promise((res) => {
      let done = false;
      const fin = () => { if (!done) { done = true; el.removeEventListener("transitionend", h); res(); } };
      const h = (e) => { if (e.target === el && e.propertyName === "transform") fin(); };
      el.addEventListener("transitionend", h);
      setTimeout(fin, 1000);
    });
    let from = null, hash = null;
    swup.hooks.on("visit:start", (v) => {
      const t = !v.history.popstate && v.trigger.el;
      from = t ? (() => { const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })() : mid();
      hash = v.to.hash;
      if (!hash) v.scroll.reset = false;
    });
    swup.hooks.replace("animation:out:await", async () => {
      const m = main(), p = path();
      if (!reduce()) {
        const c = mid(), to = local(m, from || c), at = local(m, c);
        p.setAttribute("d", Iris.d("leaf"));
        m.style.clipPath = "url(#iris-clip-swup)";
        p.style.willChange = "transform";
        p.style.transition = "none";
        p.style.transform = Iris.transform("leaf", at.x, at.y, Iris.openScale("leaf", c.x, c.y));
        p.getBoundingClientRect();
        p.style.transition = "";
        p.style.transform = Iris.transform("leaf", to.x, to.y, 0);
        if (Header.isOpen()) {
          const np = document.getElementById("iris-clip-nav-path"), f = from || c;
          np.style.transition = "transform .6s cubic-bezier(0.87, 0, 0.13, 1)";
          np.style.transform = Iris.transform("flower", f.x, f.y, 0);
        }
        await waitTransform(p);
        p.style.willChange = "";
      }
      if (!hash) scrollTo({ top: 0, left: 0, behavior: "instant" });
      Header.forceClose();
      document.getElementById("iris-clip-nav-path").style.transition = "";
    });
    swup.hooks.before("content:replace", () => run("destroy"));
    swup.hooks.replace("animation:in:await", async () => {
      const m = main(), p = path();
      if (!hash) scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (reduce()) m.style.clipPath = "";
      else {
        const c = mid(), at = local(m, c);
        p.setAttribute("d", Iris.d("flower"));
        m.style.clipPath = "url(#iris-clip-swup)";
        p.style.willChange = "transform";
        p.style.transition = "none";
        p.style.transform = Iris.transform("flower", at.x, at.y, 0);
        p.classList.add("is-entering");
        p.getBoundingClientRect();
        p.style.transition = "";
        requestAnimationFrame(() => { p.style.transform = Iris.transform("flower", at.x, at.y, Iris.openScale("flower", c.x, c.y)); });
        await waitTransform(p);
        p.classList.remove("is-entering");
        m.style.clipPath = "";
        p.style.willChange = "";
      }
      run("init");
      KV.setActive(main().classList.contains("home"));
    });
    swup.hooks.on("page:view", (v) => {
      Header.reinit();
      if (!v.animation.animate) { run("init"); KV.setActive(main().classList.contains("home")); }
    });
  }

  const boot = () => {
    Header.init();
    KV.init();
    run("init");
    startSwup();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
