/* Shared by all pages: header, phone menu, footer, curtain shadow background, loader, page transition, smooth scroll, 
   Section reveal, parallax, tabs, View circle cursor. Values are read from the original bundle. */
(() => {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPc = () => innerWidth > 1024;
  const OP_KEY = "ik-op";
  const VISITED_KEY = "ik-visited";
  const firstVisit = (() => { try { return !sessionStorage.getItem(OP_KEY); } catch { return true; } })();
  if (firstVisit && !reduce) html.classList.add("is-first-visit");
  // As in the original, on first open the body box is hidden only with CSS opacity (html.is-loading) — removed once the reveal finishes
  html.classList.add("is-loading");

  const arrow = '<svg viewBox="0 0 20 12" fill="none"><path d="M0 6h18.6M13.4.6 18.8 6l-5.4 5.4" stroke="currentColor" stroke-width="1"/></svg>';
  const out = '<svg viewBox="0 0 11 11" fill="none"><path d="M1 10 10 1M3 1h7v7" stroke="currentColor" stroke-width="1"/></svg>';
  window.ikIcons = { arrow, out };
  const fillIcons = (root) => root.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = window.ikIcons[el.dataset.icon] || ""; });
  fillIcons(document);

  const MENU = [
    ["Menu 1", "index.html#profile"],
    ["Menu 2", "index.html#schedule"],
    ["Menu 3", "news.html"],
    ["Menu 4", "index.html#discography"],
    ["Menu 5", "works.html"],
    ["Menu 6", "#"],
  ];
  const PROJECTS = [["Project 1", "index.html#projects"], ["Project 2", "index.html#projects"]];
  const SNS = ["Social 1", "Social 2"];
  const NAME = "Artist Surname";
  const link = ([t, h]) => `<a class="ik-link" href="${h}"><span>${t}</span></a>`;
  const li = (m) => `<li>${link(m)}</li>`;
  const sns = (t) => `<a class="ik-sns" href="#" target="_blank" rel="noopener"><span class="ik-sns__in"><i class="ik-sns__ic is-a">${out}</i><span class="ik-sns__t">${t}</span><i class="ik-sns__ic is-b">${out}</i></span></a>`;
  const cols = `
    <div class="ik-cols__item" data-label="Your English menu name here"><p class="ik-label">(Menu)</p><ul class="ik-cols__list">${MENU.map(li).join("")}</ul></div>
    <div class="ik-cols__item" data-label="Your project English name here"><p class="ik-label">(Projects)</p><ul class="ik-cols__list">${PROJECTS.map(li).join("")}</ul></div>
    <div class="ik-cols__item" data-label="Your external link English name here"><p class="ik-label">(Links)</p><div class="ik-cols__list">${SNS.map(sns).join("")}</div></div>`;

  document.body.insertAdjacentHTML("afterbegin", `
    <div class="ik-op" aria-hidden="true"><p class="ik-op__txt" data-label="Your performer’s English name">${[...NAME].map((c) => (c === " " ? '<span class="space"></span>' : `<span>${c}</span>`)).join("")}</p></div>
    <header class="ik-head" data-slot="header">
      <div class="ik-head__in">
        <a class="ik-logo" href="index.html" data-label="English logo text for the performer here">${NAME}</a>
        <div class="ik-head__right">
          <div class="ik-head__proj" data-label="Your project English name here"><p class="ik-label">(Projects)</p><div class="ik-head__list">${PROJECTS.map(link).join("")}</div></div>
          <div class="ik-head__menu">
            <div class="ik-head__gnav">
              <ul class="ik-head__list">${MENU.slice(0, 3).map(li).join("")}</ul>
              <ul class="ik-head__list">${MENU.slice(3).map(li).join("")}</ul>
            </div>
            <div class="ik-head__sns">${SNS.map(sns).join("")}</div>
          </div>
        </div>
        <button class="ik-burger" type="button" aria-expanded="false"><i class="ik-burger__dot"></i><span class="ik-burger__t">menu</span></button>
      </div>
    </header>
    <div class="ik-spmenu" data-slot="mobile-menu"><div class="ik-spmenu__in"><div class="ik-cols">${cols}</div></div></div>
    <div class="ik-stalker" aria-hidden="true"><div class="ik-stalker__in"><span class="ik-stalker__t">View</span></div></div>`);

  const footerHTML = `
    <footer class="ik-foot" data-slot="footer">
      <div class="ik-foot__in">
        <a class="ik-foot__logo" href="index.html" data-label="English logo text for the performer here">${NAME}</a>
        <div class="ik-cols">${cols}</div>
      </div>
    </footer>`;
  const addFooter = (root) => { if (!root.querySelector(".ik-foot")) { root.insertAdjacentHTML("beforeend", footerHTML); fillIcons(root.lastElementChild); } };

  /* ── Curtain shadow background: like the original, a curtain shadow video on white paper is blended with difference over a navy background.
     Once the video actually starts playing (playing·timeupdate) it appears at 2s, and it plays again when the tab becomes visible or the window regains focus ── */
  document.body.insertAdjacentHTML("afterbegin", '<div class="ik-bg" aria-hidden="true"><video class="ik-bg__video" src="media/curtain.mp4" muted loop playsinline autoplay preload="auto"></video></div>');
  const bg = document.querySelector(".ik-bg");
  const bgVideo = bg.querySelector("video");
  const bgReady = () => bg.classList.add("is-video-ready");
  const bgPlay = () => {
    if (reduce) return;
    if (!bgVideo.paused && bgVideo.readyState >= 2) return bgReady();
    const p = bgVideo.play();
    if (p && p.catch) p.catch(() => bg.classList.remove("is-video-ready"));
  };
  bgVideo.addEventListener("playing", bgReady);
  bgVideo.addEventListener("timeupdate", bgReady);
  bgVideo.addEventListener("error", () => bg.classList.remove("is-video-ready"));
  // On reduced-motion screens, lay down only the paper paused on the first scene
  if (reduce) { bgVideo.removeAttribute("autoplay"); bgVideo.addEventListener("loadeddata", () => { bgVideo.pause(); bgReady(); }, { once: true }); }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") bgPlay(); });
  addEventListener("focus", bgPlay);
  bgPlay();
  // The original once transition waits up to 2s until the background video can play (canplay), then runs the loader
  const bgCanPlay = (ms = 2000) => new Promise((r) => {
    if (bgVideo.readyState >= 3) return r();
    const t = setTimeout(r, ms);
    bgVideo.addEventListener("canplay", () => { clearTimeout(t); r(); }, { once: true });
  });

  /* ── Smooth scroll: PC only (1025 and up), lerp 0.08 ── */
  let lenis = null;
  const tick = (time) => lenis?.raf(time * 1000);
  const syncLenis = () => {
    if (!reduce && isPc() && !lenis) {
      lenis = window.lenis = new Lenis({ lerp: 0.08 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    } else if ((!isPc() || reduce) && lenis) {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenis = window.lenis = null;
    }
  };
  syncLenis();
  matchMedia("(max-width: 1024px)").addEventListener("change", () => { syncLenis(); ScrollTrigger.refresh(true); });

  /* ── Phone menu: button label toggles menu ↔ close ── */
  const burger = document.querySelector(".ik-burger");
  const spmenu = document.querySelector(".ik-spmenu");
  const setMenu = (open) => {
    spmenu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.querySelector(".ik-burger__t").textContent = open ? "close" : "menu";
    html.classList.toggle("is-menu-open", open);
  };
  burger.addEventListener("click", () => setMenu(!spmenu.classList.contains("is-open")));
  addEventListener("resize", () => { if (isPc()) setMenu(false); }, { passive: true });

  /* ── Section reveal and parallax (per box) ── */
  const reveal = (root) => {
    const els = gsap.utils.toArray(root.querySelectorAll(".js-reveal"));
    if (reduce || !els.length) return;
    gsap.set(els, { autoAlpha: 0, filter: "blur(20px)" });
    els.forEach((el) => ScrollTrigger.create({
      trigger: el,
      start: "top 60%",
      once: true,
      onEnter: () => gsap.to(el, { autoAlpha: 1, filter: "blur(0px)", duration: 1.2, ease: "power2.out" }),
    }));
  };
  const parallax = (root) => {
    const mm = gsap.matchMedia();
    mm.add({ isPc: "(min-width: 1024px)", isSp: "(max-width: 1023px)", ok: "(prefers-reduced-motion: no-preference)" }, (c) => {
      if (!c.conditions.ok) return;
      root.querySelectorAll(".js-parallax").forEach((el) => {
        const num = (v, d) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : d);
        const d = c.conditions.isPc ? num(el.dataset.pc, 24) : num(el.dataset.sp, 14);
        const s = c.conditions.isPc ? num(el.dataset.pcScrub, 0.6) : num(el.dataset.spScrub, 0.85);
        if (!d) return;
        gsap.to(el, { y: -d, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: s === 0 ? true : s } });
      });
    });
  };

  /* ── Tabs: buttons and panels of the same name are tied together with is-active ── */
  window.ikTabs = (root, { btn, panel, onChange } = {}) => {
    const btns = [...root.querySelectorAll(`[${btn}]`)];
    const panels = [...root.querySelectorAll(`[${panel}]`)];
    root.addEventListener("click", (e) => {
      const b = e.target.closest(`[${btn}]`);
      if (!b || !root.contains(b)) return;
      e.preventDefault();
      const key = b.getAttribute(btn);
      if (b.classList.contains("is-active")) return;
      btns.forEach((x) => { const on = x.getAttribute(btn) === key; x.classList.toggle("is-active", on); x.setAttribute("aria-selected", String(on)); });
      panels.forEach((p) => p.classList.toggle("is-active", p.getAttribute(panel) === key));
      onChange?.(key, panels.find((p) => p.getAttribute(panel) === key));
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  };

  /* ── View circle cursor: follows 80px above and to the left of the cursor with lerp 0.12 ── */
  const stalker = document.querySelector(".ik-stalker");
  const st = { x: 0, y: 0, cx: 0, cy: 0, on: false };
  addEventListener("pointermove", (e) => { st.x = e.clientX; st.y = e.clientY; }, { passive: true });
  window.ikStalker = (selector, text = "View") => {
    if (!isPc() || reduce) return;
    const areas = [...document.querySelectorAll(selector)];
    if (!areas.length) return;
    let inside = 0;
    areas.forEach((a) => {
      a.addEventListener("pointerenter", () => {
        inside++;
        stalker.querySelector(".ik-stalker__t").textContent = a.dataset.stalker || text;
        stalker.classList.add("is-active");
      });
      a.addEventListener("pointerleave", () => { inside = Math.max(0, inside - 1); if (!inside) stalker.classList.remove("is-active"); });
    });
    if (st.on) return;
    st.on = true;
    st.cx = st.x - 80;
    st.cy = st.y - 80;
    gsap.ticker.add(() => {
      st.cx += (st.x - 80 - st.cx) * 0.12;
      st.cy += (st.y - 80 - st.cy) * 0.12;
      gsap.set(stalker, { x: st.cx, y: st.cy });
    });
  };

  /* ── Loader → first scene → page turn ── */
  const runOp = () => new Promise((resolve) => {
    const op = document.querySelector(".ik-op");
    const done = () => {
      html.classList.remove("is-first-visit");
      html.classList.add("is-op-done");
      op.style.display = "none";
      gsap.set(".ik-head__in", { autoAlpha: 1, clearProps: "filter,y" });
      resolve();
    };
    if (!firstVisit || reduce) { html.classList.add("is-op-done"); op.style.display = "none"; return resolve(); }
    try { sessionStorage.setItem(OP_KEY, "1"); } catch {}
    const spans = [...op.querySelectorAll(".ik-op__txt span")];
    const safety = setTimeout(done, 4500);
    let mid = spans.findIndex((s, i) => i > 0 && spans[i - 1].classList.contains("space"));
    if (mid < 0) mid = Math.floor((spans.length - 1) / 2);
    const order = [mid];
    for (let d = 1; d < spans.length; d++) {
      if (mid + d < spans.length) order.push(mid + d);
      if (mid - d >= 0) order.push(mid - d);
    }
    gsap.set(spans, { opacity: 0, filter: "blur(30px)" });
    const tl = gsap.timeline();
    order.forEach((idx, k) => tl.to(spans[idx], { opacity: 1, filter: "blur(2px)", duration: 1.2, ease: "power2.out" }, k * 0.12));
    tl.to({}, { duration: 0.45 });
    tl.to(op, { opacity: 0, filter: "blur(20px)", duration: 1.4, ease: "power2.inOut" });
    tl.to({}, { duration: 0.3 });
    tl.add(() => { clearTimeout(safety); done(); });
  });

  /* ── Attach/detach boxes: page scripts live in ikPages[name] = (Box) => Set up with detach, attach when the box enters and detach when it leaves ── */
  window.ikPages = window.ikPages || {};
  let mounted = null;
  const mount = (root) => {
    addFooter(root);
    fillIcons(root);
    let off = null;
    const ctx = gsap.context(() => {
      reveal(root);
      parallax(root);
      off = window.ikPages[root.dataset.barbaNamespace]?.(root) || null;
    }, root);
    mounted = { ctx, off, root };
  };

  // Original transition curve: on leave the box blurs to 4px and vanishes in .5s, and the entering box sharpens in .6s (power2.out)
  const fadeOut = (el) => (reduce ? Promise.resolve() : gsap.to(el, { autoAlpha: 0, filter: "blur(4px)", duration: 0.5, ease: "power2.out" }));
  const fadeIn = (el) => {
    if (reduce) { gsap.set(el, { autoAlpha: 1 }); return Promise.resolve(); }
    return gsap.fromTo(el, { autoAlpha: 0, filter: "blur(4px)" }, { autoAlpha: 1, filter: "blur(0px)", duration: 0.6, ease: "power2.out", clearProps: "filter" });
  };
  const toHash = (hash, immediate) => {
    const t = hash && document.getElementById(hash);
    if (!t) return false;
    lenis ? lenis.scrollTo(t, { offset: -40, immediate }) : t.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
    return true;
  };
  const refresh = () => requestAnimationFrame(() => requestAnimationFrame(() => { ScrollTrigger.refresh(true); lenis?.start(); }));

  // Same-page anchors move smoothly, and empty links with only # are blocked
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (href === "#") { e.preventDefault(); return; }
    const url = new URL(a.href, location.href);
    if (url.pathname === location.pathname && url.hash) {
      e.preventDefault();
      setMenu(false);
      toHash(url.hash.slice(1));
    }
  }, true);

  // barba must fetch documents so it only runs on http — opened via file:// it blurs with the same curve, then changes the address and resolves on the new page
  const plainNav = () => {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (!/\.html(#.*)?$/.test(a.getAttribute("href"))) return;
      e.preventDefault();
      setMenu(false);
      if (reduce) { location.href = a.href; return; }
      lenis?.stop();
      fadeOut(document.querySelector('[data-barba="container"]')).then(() => { location.href = a.href; });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) { gsap.set('[data-barba="container"]', { clearProps: "all" }); lenis?.start(); } });
  };

  // Bring in css·scripts that only the next page has, and when the transition ends, remove css the next page doesn’t have
  const abs = (h) => new URL(h, location.href).href;
  const bring = async (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (doc.title) document.title = doc.title;
    const want = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => abs(l.getAttribute("href")));
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    await Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((href) => new Promise((r) => {
      document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href, onload: r, onerror: r }));
      setTimeout(r, 800);
    })));
    const loaded = [...document.querySelectorAll("script[src]")].map((x) => x.src);
    for (const x of doc.querySelectorAll("script[src]")) {
      const src = abs(x.getAttribute("src"));
      if (loaded.includes(src)) continue;
      await new Promise((r) => document.body.append(Object.assign(document.createElement("script"), { src, onload: r, onerror: r })));
    }
    return () => [...document.querySelectorAll('link[rel="stylesheet"]')].forEach((l) => want.includes(l.href) || l.remove());
  };

  window.ik = { reduce, isPc, firstVisit, VISITED_KEY, lenis: () => lenis };

  const start = async () => {
    const first = document.querySelector('[data-barba="container"]');
    const ns = first.dataset.barbaNamespace;
    // The Footer is in the document from the start like the original — inserted right away without waiting for the loader (motion is attached at mount after the loader)
    addFooter(first);
    // Original once: background video → loader → on the first page turn the box on as is, on a subpage let it settle first and then attach.
    await bgCanPlay();
    await runOp();
    const loaded = () => html.classList.remove("is-loading");
    if (ns === "home") { first.style.opacity = "1"; loaded(); }
    else Promise.resolve(fadeIn(first)).then(loaded);
    mount(first);
    refresh();
    if (location.hash) requestAnimationFrame(() => requestAnimationFrame(() => toHash(location.hash.slice(1), true)));
    if (!window.barba || !/^https?:$/.test(location.protocol)) return plainNav();
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    let dropOld = null;
    barba.init({
      preventRunning: true,
      prevent: ({ el }) => {
        const a = el?.closest?.("a");
        if (!a) return true;
        const raw = a.getAttribute("href") || "";
        if (!raw || raw.startsWith("#") || a.target === "_blank" || a.hasAttribute("download") || /^(mailto|tel):/.test(raw)) return true;
        try {
          const u = new URL(a.href, location.href);
          if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return true;
        } catch { return true; }
        return false;
      },
      transitions: [{
        name: "fade",
        // Original order: stop scroll → undo and kill ScrollTrigger → detach page → fade out. Leftover GSAP shapes are restored after everything has faded out
        leave({ current }) {
          setMenu(false);
          lenis?.stop();
          const m = mounted;
          mounted = null;
          try { m?.off?.(); } catch {}
          ScrollTrigger.getAll().forEach((t) => t.kill(true));
          ScrollTrigger.clearScrollMemory?.();
          return Promise.resolve(fadeOut(current.container)).then(() => m?.ctx.revert());
        },
        async beforeEnter({ next }) {
          gsap.set(next.container, { autoAlpha: 0 });
          dropOld = await bring(next.html);
        },
        afterEnter({ next, trigger }) {
          dropOld?.();
          scrollTo({ top: 0, left: 0, behavior: "auto" });
          lenis?.scrollTo(0, { immediate: true, force: true });
          mount(next.container);
          fadeIn(next.container);
          refresh();
          const hash = trigger?.hash || (trigger?.href && new URL(trigger.href, location.href).hash.slice(1));
          if (hash) requestAnimationFrame(() => requestAnimationFrame(() => toHash(hash, true)));
        },
      }],
    });
  };
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve();
  const boot = () => fontsReady.then(() => requestAnimationFrame(start));
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();
})();
