// Motion shared by five sections. The original uses barba 2.10.3, keeping the header and footer and [data-barba="container"] is the only thing swapped —
// Section motion is registered with SD.use (attach), attached when the box enters and detached when it leaves. Hero and branch parts, which are first-section only, are registered by index.js.
(() => {
  const SD = (window.SD = window.SD || {});
  const mods = (SD.mods = SD.mods || []);
  SD.use = (fn) => mods.push(fn);
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const wide = matchMedia("(min-width: 1024px)");
  gsap.registerPlugin(ScrollTrigger);

  // ── Skin switching: turns off the buttons’ own transitions for the 650ms of the change (original is-theme-flipping)
  let flipT = 0;
  SD.flipping = () => {
    body.classList.add("is-flipping");
    clearTimeout(flipT);
    flipT = setTimeout(() => body.classList.remove("is-flipping"), 650);
  };
  SD.tone = () => body.dataset.tone || "individuals";
  SD.setTone = (name) => {
    const want = name === "individuals" ? "" : name || "";
    if ((body.dataset.tone || "") === want) return false;
    SD.flipping();
    if (want) body.dataset.tone = want;
    else delete body.dataset.tone;
    document.dispatchEvent(new CustomEvent("sd:tone", { detail: { business: want === "business", name: want || "individuals" } }));
    return true;
  };
  // Panel alignment on first open and right after a page switch happens without transition (original theme-motion-settling), blending only when flipped by scrolling
  const settle = () => {
    body.classList.add("sd-settling");
    requestAnimationFrame(() => requestAnimationFrame(() => body.classList.remove("sd-settling")));
  };
  document.addEventListener("fx:theme", (e) => (e.detail?.instant ? settle() : SD.flipping()));

  // Header: the panel opens on hover and closes 200ms after the hand leaves. Presses within 600ms of opening are ignored (original Header)
  const head = document.querySelector("[data-sd-head]");
  const lock = { y: 0, on() { this.y = scrollY; Object.assign(body.style, { position: "fixed", top: `${-this.y}px`, width: "100%", overflow: "hidden" }); }, off() { Object.assign(body.style, { position: "", top: "", width: "", overflow: "" }); if (this.y) scrollTo(0, this.y); } };
  let openItem = null, openedAt = 0, leaveT = 0, drawerOpen = false;
  const closeItem = () => {
    if (!openItem) return;
    openItem.classList.remove("is-open");
    openItem.querySelector("[data-nav-trigger]")?.setAttribute("aria-expanded", "false");
    openItem = null;
  };
  const openIt = (item) => {
    if (openItem === item) return;
    closeItem();
    item.classList.add("is-open");
    item.querySelector("[data-nav-trigger]")?.setAttribute("aria-expanded", "true");
    openItem = item;
  };
  const drawer = head?.querySelector("[data-nav-drawer]");
  const burger = head?.querySelector("[data-nav-burger]");
  const closeSub = () => {
    drawer?.querySelectorAll(".is-sub-open").forEach((s) => s.classList.remove("is-sub-open"));
    drawer?.classList.remove("has-sub-open");
  };
  const closeDrawer = () => {
    if (!drawerOpen) return;
    drawerOpen = false;
    head.classList.remove("is-open");
    burger?.setAttribute("aria-expanded", "false");
    closeSub();
    lock.off();
  };
  SD.closeMenus = () => { closeItem(); closeDrawer(); head?.removeAttribute("data-search-open"); };
  if (head) {
    head.querySelectorAll("[data-nav-item]").forEach((item) => {
      const trig = item.querySelector("[data-nav-trigger]");
      trig?.addEventListener("click", () => {
        if (openItem === item) { if (Date.now() - openedAt < 600) return; closeItem(); } else openIt(item);
      });
      item.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse") return;
        clearTimeout(leaveT);
        if (openItem !== item) { openedAt = Date.now(); openIt(item); }
      });
      item.addEventListener("pointerleave", (e) => {
        if (e.pointerType !== "mouse") return;
        clearTimeout(leaveT);
        leaveT = setTimeout(closeItem, 200);
      });
    });
    burger?.addEventListener("click", () => {
      if (drawerOpen) return closeDrawer();
      drawerOpen = true;
      head.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      lock.on();
    });
    head.querySelectorAll("[data-nav-drill]").forEach((b) => b.addEventListener("click", () => {
      const sub = document.getElementById(b.getAttribute("aria-controls"));
      if (!sub) return;
      closeSub();
      sub.classList.add("is-sub-open");
      drawer.classList.add("has-sub-open");
    }));
    head.querySelectorAll("[data-nav-back]").forEach((b) => b.addEventListener("click", closeSub));
    const input = head.querySelector("[data-nav-search] input");
    input?.addEventListener("focus", () => { closeItem(); head.setAttribute("data-search-open", ""); });
    input?.addEventListener("blur", () => { if (!input.value.trim()) head.removeAttribute("data-search-open"); });
    head.querySelector("[data-nav-search]")?.addEventListener("submit", (e) => e.preventDefault());
    document.addEventListener("click", (e) => { if (!head.contains(e.target)) closeItem(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { SD.closeMenus(); input?.blur(); }
      else if (e.key === "/" && input && input.offsetParent && !/^(input|textarea|select)$/i.test(document.activeElement?.tagName || "")) { e.preventDefault(); input.focus(); }
    });
  }

  // ── Fade-up: [data-fade-in] inside a group at .11s steps (max .66s), once it passes 10% from the bottom of the screen.
  // The header, contact row and footer remain even after scrolling past, so attach it just once at the start (SD.fade(panel))
  SD.use(SD.fade = (root) => {
    const groups = [...root.querySelectorAll("[data-fade-group]")];
    const loose = [...root.querySelectorAll("[data-fade-in]")].filter((n) => !n.closest("[data-fade-group]"));
    const kids = (g) => [...g.querySelectorAll("[data-fade-in]")].filter((n) => n.closest("[data-fade-group]") === g);
    groups.forEach((g) => kids(g).forEach((n, i) => n.style.setProperty("--fade-in-index", i)));
    const go = (n) => (n.matches("[data-fade-group]") ? kids(n) : [n]).forEach((m) => m.classList.add("has-moved"));
    if (reduce.matches) { [...groups, ...loose].forEach(go); return; }
    const io = new IntersectionObserver((list) => list.forEach((en) => { if (en.isIntersecting) { go(en.target); io.unobserve(en.target); } }), { rootMargin: "0px 0px -10% 0px" });
    [...groups, ...loose].forEach((n) => io.observe(n));
    return () => io.disconnect();
  });

  // ── Cut face opens: once past the bottom 20% of the screen, runs .9s in that direction
  SD.use((root) => {
    const items = [...root.querySelectorAll("[data-clip-reveal]")];
    if (reduce.matches) { items.forEach((n) => n.classList.add("has-revealed")); return; }
    const io = new IntersectionObserver((list) => list.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("has-revealed"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -20% 0px" });
    items.forEach((n) => io.observe(n));
    return () => io.disconnect();
  });

  // ── Video: on wide screens it plays silently when visible and pauses when out of view. Below 1024 or with reduced motion, it plays only on press (original VideoPlayer)
  SD.use((root) => {
    const boxes = [...root.querySelectorAll("[data-sd-video]")];
    const offs = boxes.map((box) => {
      const v = box.querySelector("video"), btn = box.querySelector("[data-video-toggle]");
      if (!v) return null;
      const auto = wide.matches && !reduce.matches;
      const sync = () => box.classList.toggle("is-playing", !v.paused);
      // Like the original, the control bar turns on only after the video can be received (data-can-play)
      const ready = () => box.classList.add("is-ready");
      v.readyState >= 3 ? ready() : v.addEventListener("canplay", ready, { once: true });
      v.addEventListener("play", sync);
      v.addEventListener("pause", sync);
      const toggle = () => (v.paused ? v.play().catch(() => {}) : v.pause());
      const mute = box.querySelector("[data-video-mute]");
      const flip = () => { v.muted = !v.muted; mute.classList.toggle("is-on", !v.muted); };
      btn?.addEventListener("click", toggle);
      mute?.addEventListener("click", flip);
      // Like the original vidstack, loading starts when it enters the screen (preload none → load on entry)
      const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { if (v.preload === "none") { v.preload = "auto"; v.load(); } if (auto) v.play().catch(() => {}); } else v.pause(); });
      io.observe(box);
      return () => { io.disconnect(); btn?.removeEventListener("click", toggle); mute?.removeEventListener("click", flip); v.pause(); };
    });
    return () => offs.forEach((f) => f?.());
  });

  // ── News and partner strip: Swiper free-mode only when overflowing (inertia .85), page dots, horizontal wheel. Cards rise from 100px below in .18s sequence.
  //    The cursor disc is the edge-ring-cursor part — pressing in the screen’s outer 20% sends fx:prev and fx:next here
  SD.use((root) => {
    const offs = [...root.querySelectorAll("[data-sd-news]")].map((sec) => {
      const el = sec.querySelector(".swiper");
      if (!el) return null;
      const slides = [...el.querySelectorAll(".swiper-slide")];
      slides.forEach((s, i) => s.style.setProperty("--card-index", i));
      sec.classList.add("is-ready");
      const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { sec.classList.add("is-revealed"); io.disconnect(); } });
      io.observe(sec);
      const gap = 24;
      let sw = null;
      const fits = () => {
        const w = slides[0]?.getBoundingClientRect().width || 0;
        return w * slides.length + gap * (slides.length - 1) > el.getBoundingClientRect().width + 1;
      };
      const perGroup = () => {
        const w = (slides[0]?.getBoundingClientRect().width || 1) + gap;
        return Math.max(Math.max(1, Math.floor((el.getBoundingClientRect().width + gap) / w)), Math.ceil(slides.length / 6));
      };
      const build = () => {
        if (sw || !fits()) { el.classList.toggle("is-static", !sw); return; }
        el.classList.remove("is-static");
        sw = new Swiper(el, {
          slidesPerView: "auto", slidesPerGroup: perGroup(), spaceBetween: gap,
          freeMode: { enabled: true, momentum: true, momentumRatio: 0.85, momentumVelocityRatio: 0.85 },
          pagination: { el: sec.querySelector("[data-news-pager]"), clickable: true },
          navigation: { prevEl: sec.querySelector('[data-fx-part="prev"]'), nextEl: sec.querySelector('[data-fx-part="next"]') },
          mousewheel: { forceToAxis: true }, grabCursor: false, simulateTouch: false, a11y: { slideRole: "listitem" },
        });
      };
      build();
      const prev = () => sw?.slidePrev(), next = () => sw?.slideNext();
      sec.addEventListener("fx:prev", prev);
      sec.addEventListener("fx:next", next);
      let t = 0;
      const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => { if (sw && !fits()) { sw.destroy(true, true); sw = null; } build(); }, 100); });
      ro.observe(el);
      return () => { io.disconnect(); ro.disconnect(); clearTimeout(t); sec.removeEventListener("fx:prev", prev); sec.removeEventListener("fx:next", next); sw?.destroy(true, true); };
    });
    return () => offs.forEach((f) => f?.());
  });

  // ── Reviews · expert comments: Swiper fade 1s · 5s autoplay · loops from end to start. Photos cross with clip-path, and the bar beside the number fills with the time remaining
  SD.use((root) => {
    const offs = [...root.querySelectorAll("[data-sd-fade]")].map((sec) => {
      const el = sec.querySelector(".swiper");
      if (!el || el.querySelectorAll(".swiper-slide").length < 2) return null;
      const pics = [...sec.querySelectorAll("[data-fade-pic]")], layers = [...sec.querySelectorAll("[data-fade-layer]")], pages = [...sec.querySelectorAll("[data-slide-to]")];
      let last = 0;
      const show = (i) => {
        pics.forEach((p) => {
          const n = +p.dataset.fadePic;
          if (n === i) { p.classList.remove("is-active", "was-active"); void p.offsetWidth; p.classList.add("is-active"); }
          else { p.classList.remove("is-active"); p.classList.toggle("was-active", n === last); }
        });
        last = i;
        layers.forEach((l) => l.classList.toggle("is-active", +l.dataset.fadeLayer === i));
        pages.forEach((p) => { const on = +p.dataset.slideTo === i; p.classList.toggle("is-active", on); on ? p.setAttribute("aria-current", "true") : p.removeAttribute("aria-current"); });
        sec.style.setProperty("--fade-progress", "0");
      };
      const sw = new Swiper(el, {
        slidesPerView: 1, rewind: true, speed: 1000, effect: "fade", fadeEffect: { crossFade: true },
        autoplay: { delay: 5000, disableOnInteraction: false },
        on: { slideChange(s) { show(s.realIndex); }, autoplayTimeLeft(s, t, r) { sec.style.setProperty("--fade-progress", String(1 - r)); } },
      });
      const click = (e) => { const b = e.target.closest("[data-slide-to]"); if (b) sw.slideTo(+b.dataset.slideTo); };
      sec.addEventListener("click", click);
      // As in the original, it runs from creation and stops only when leaving after having been seen once (the initial not-visible notification is skipped)
      if (reduce.matches) sw.autoplay.stop();
      let seen = false;
      const io = new IntersectionObserver(([en]) => {
        if (reduce.matches) return;
        if (en.isIntersecting) { seen = true; sw.autoplay.resume(); } else if (seen) sw.autoplay.pause();
      });
      io.observe(sec);
      return () => { io.disconnect(); sec.removeEventListener("click", click); sw.destroy(true, true); };
    });
    return () => offs.forEach((f) => f?.());
  });

  // ── Service cells: switching tabs makes the cells rise again at an 80ms stagger. If the tab changes skin (personal ↔ business), it waits 650ms until the skin has fully changed
  SD.use((root) => {
    const offs = [...root.querySelectorAll("[data-sd-services]")].map((sec) => {
      const tabs = [...sec.querySelectorAll("[data-tab]")], panels = [...sec.querySelectorAll("[data-tab-panel]")];
      const items = (p) => [...p.querySelectorAll("[data-reveal-item]")];
      panels.forEach((p) => items(p).forEach((n, i) => (n.style.transitionDelay = `${i * 80}ms`)));
      const show = (p) => items(p).forEach((n) => n.classList.add("is-revealed"));
      const hide = (p) => { items(p).forEach((n) => { n.style.transitionProperty = "none"; n.classList.remove("is-revealed"); }); void p.offsetWidth; items(p).forEach((n) => n.style.removeProperty("transition-property")); };
      let seen = false, t = 0;
      const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { seen = true; const p = panels.find((x) => !x.hidden); if (p) show(p); io.disconnect(); } }, { rootMargin: "0px 0px -50% 0px" });
      if (reduce.matches) panels.forEach(show); else io.observe(sec);
      const select = (key, { replay = true } = {}) => {
        tabs.forEach((b) => { const on = b.dataset.tab === key; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
        panels.forEach((p) => {
          const on = p.dataset.tabPanel === key, was = p.hidden;
          p.hidden = !on;
          if (!on || !was) return;
          const flipped = p.dataset.panelTone ? SD.setTone(p.dataset.panelTone) : false;
          if (reduce.matches || !replay) return show(p);
          clearTimeout(t);
          hide(p);
          flipped ? (t = setTimeout(() => show(p), 650)) : show(p);
        });
      };
      const click = (e) => select(e.currentTarget.dataset.tab);
      tabs.forEach((b) => b.addEventListener("click", click));
      const onTone = (e) => { const p = panels.find((x) => (x.dataset.panelTone === "business") === e.detail.business); if (p && p.hidden) select(p.dataset.tabPanel, { replay: seen }); };
      document.addEventListener("sd:tone", onTone);
      return () => { io.disconnect(); clearTimeout(t); tabs.forEach((b) => b.removeEventListener("click", click)); document.removeEventListener("sd:tone", onTone); };
    });
    return () => offs.forEach((f) => f?.());
  });

  // ── People marquee: flows left at 22px per second, speeds up by scroll velocity × .32 (max 900) then decays by .94 each step. Flow reverses following scroll direction
  //  Pushed −140px while passing. Dragging with a finger gives inertia (.95), and pressing the last 20% on a wide screen slides by the strip width in .9s power3.out
  SD.use((root) => {
    const sec = root.querySelector("[data-sd-marquee]");
    const box = sec?.querySelector("[data-marquee]"), track = box?.querySelector("[data-marquee-track]");
    if (!track || reduce.matches) return;
    const originals = [...track.children];
    if (!originals.length) return;
    const clone = () => {
      const f = document.createDocumentFragment();
      originals.forEach((n) => { const c = n.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.querySelectorAll("a, button").forEach((a) => (a.tabIndex = -1)); f.append(c); });
      track.append(f);
    };
    let A = 0, j = 0, M = 0, N = 0, P = -1, F = 0, drag = false, pid = null, lx = 0, lt = 0;
    const page = { value: 0 };
    let tween = null;
    const measure = () => {
      [...track.children].slice(originals.length).forEach((n) => n.remove());
      clone();
      A = track.children[originals.length].getBoundingClientRect().left - originals[0].getBoundingClientRect().left;
      const need = Math.max(2, Math.ceil((Math.max(box.getBoundingClientRect().width, innerWidth) + A) / A) + 1);
      for (let i = 2; i < need; i++) clone();
    };
    measure();
    const wrap = gsap.utils.wrap(-A, 0);
    let wrapper = wrap;
    const place = () => gsap.set(track, { x: wrapper(j + F + page.value) });
    const tick = (time, dt) => {
      const s = Math.min(dt, 50) / 1000;
      if (!drag) { M *= 0.94; N *= 0.95; if (Math.abs(M) < 1) M = 0; if (Math.abs(N) < 1) N = 0; j += (22 + Math.abs(M)) * P * s; j += N * s; }
      place();
    };
    const st = ScrollTrigger.create({
      trigger: sec, start: "top bottom", end: "bottom top",
      onToggle: (s) => (s.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
      onUpdate: (s) => { const v = s.getVelocity(); if (Math.abs(v) > 12) P = v > 0 ? -1 : 1; M = gsap.utils.clamp(-900, 900, v * 0.32); F = -s.progress * 140; },
    });
    if (st.isActive) gsap.ticker.add(tick);
    const settle = () => { j += page.value; page.value = 0; tween?.kill(); tween = null; };
    const down = (e) => { if (e.pointerType === "mouse") return; settle(); drag = true; pid = e.pointerId; lx = e.clientX; lt = e.timeStamp; N = M = 0; box.setPointerCapture(pid); };
    const move = (e) => { if (!drag || e.pointerId !== pid) return; const dx = e.clientX - lx, dt = e.timeStamp - lt; j += dx; if (dt > 0) N = gsap.utils.clamp(-2600, 2600, (dx / dt) * 1000); lx = e.clientX; lt = e.timeStamp; };
    const up = (e) => { if (!drag || (e && e.pointerId !== pid)) return; drag = false; if (box.hasPointerCapture(pid)) box.releasePointerCapture(pid); if (Math.abs(N) > 12) P = N > 0 ? 1 : -1; pid = null; };
    const go = (dir) => { settle(); P = dir === "next" ? -1 : 1; tween = gsap.to(page, { value: box.getBoundingClientRect().width * P, duration: 0.9, ease: "power3.out" }); };
    const prev = () => go("prev"), next = () => go("next");
    box.addEventListener("pointerdown", down);
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerup", up);
    box.addEventListener("pointercancel", up);
    sec.addEventListener("fx:prev", prev);
    sec.addEventListener("fx:next", next);
    let rt = 0;
    const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => { measure(); wrapper = gsap.utils.wrap(-A, 0); st.refresh(); place(); }, 100); });
    ro.observe(box);
    box.classList.add("is-marquee");
    return () => {
      gsap.ticker.remove(tick); st.kill(); tween?.kill(); ro.disconnect(); clearTimeout(rt);
      box.removeEventListener("pointerdown", down); box.removeEventListener("pointermove", move); box.removeEventListener("pointerup", up); box.removeEventListener("pointercancel", up);
      sec.removeEventListener("fx:prev", prev); sec.removeEventListener("fx:next", next);
      [...track.children].slice(originals.length).forEach((n) => n.remove());
      gsap.set(track, { clearProps: "transform" });
    };
  });

  // ── Handwritten line: when the section head reaches 75% of the screen it is drawn once over 2.2s power1.inOut (original ExpertiseDraw)
  SD.use((root) => {
    const strokes = [...root.querySelectorAll("[data-sd-stroke]")];
    if (!strokes.length || reduce.matches) return;
    const tws = strokes.map((p) => {
      p.style.strokeDasharray = "1";
      p.style.strokeDashoffset = "1";
      return gsap.to(p, { strokeDashoffset: 0, duration: 2.2, ease: "power1.inOut", scrollTrigger: { trigger: p.closest("[data-slot]") || p, start: "top 75%", once: true } });
    });
    return () => tws.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
  });

  // ── Fold panel (job detail ”At a glance”)
  SD.use((root) => {
    const offs = [...root.querySelectorAll("[data-sidebar-toggle]")].map((btn) => {
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return null;
      const click = () => { const open = btn.getAttribute("aria-expanded") !== "true"; btn.setAttribute("aria-expanded", String(open)); panel.toggleAttribute("data-collapsed", !open); panel.firstElementChild?.toggleAttribute("inert", !open); };
      btn.addEventListener("click", click);
      return () => btn.removeEventListener("click", click);
    });
    return () => offs.forEach((f) => f?.());
  });

  // ── Attach·Detach
  let mounted = null;
  const mount = (root) => {
    const offs = [];
    const ctx = gsap.context(() => { mods.forEach((fn) => { const off = fn(root); if (typeof off === "function") offs.push(off); }); }, root);
    mounted = { offs, ctx };
  };
  const unmount = () => {
    if (!mounted) return;
    mounted.offs.forEach((f) => f());
    mounted.ctx.revert();
    mounted = null;
  };
  // Show current page menu
  const markCurrent = () => {
    const here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-sd-head] a[href], [data-sd-foot] a[href]").forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === here));
  };

  // ── Page transition (original barba fade): outgoing content opacity .25s power2.inOut → scroll to top → incoming content from y 20 · opacity 0 over .35s power2.out.
  //    The next section’s skin (body data-tone) blends in over .6s on entry. CSS and scripts that exist only in the next section are brought in
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
  const start = () => {
    const first = document.querySelector('[data-barba="container"]');
    if (first) mount(first);
    document.querySelectorAll("body > [data-slot]:not(main)").forEach((n) => SD.fade(n));
    markCurrent();
    settle();
    ScrollTrigger.refresh();
    if (!window.barba || !/^https?:$/.test(location.protocol)) return;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const d = (s) => (reduce.matches ? 0 : s);
    barba.init({
      timeout: 10000,
      preventRunning: true,
      prevent: ({ el }) => !el || el.target === "_blank" || /^(#|mailto:|tel:)/.test(el.getAttribute("href") || "") || !!el.closest(".wf-ui"),
      transitions: [{
        name: "fade",
        before() { SD.closeMenus(); },
        leave({ current }) {
          return new Promise((done) => gsap.to(current.container, { opacity: 0, duration: d(0.25), ease: "power2.inOut", onComplete: () => { unmount(); scrollTo(0, 0); done(); } }));
        },
        async enter({ next }) {
          const doc = new DOMParser().parseFromString(next.html, "text/html");
          await bring(doc);
          gsap.set(next.container, { opacity: 0, y: 20 });
          SD.setTone(doc.body.dataset.tone || "");
          mount(next.container);
          return gsap.to(next.container, { opacity: 1, y: 0, duration: d(0.35), ease: "power2.out", clearProps: "y,opacity" });
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
