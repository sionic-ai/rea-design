// Common mechanisms of the desktop OS. Values carried over as in the original settings (window open .3s back.out(1.5) · stair 28px · dock .8s power4.out …).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = () => matchMedia("(min-width: 768px)").matches;
  const dur = (d) => (reduce ? 0 : d);
  const G = (window.G = {});

  // ── Window ──
  const WIN = {
    zStart: 500, pad: 12, cascade: 28, cascadeMax: 5,
    open: 0.3, close: 0.2, minimize: 0.25,
    openEase: "back.out(1.5)", closeEase: "power2.in",
    dragIgnore: 'a, button, input, textarea, select, label, [data-acc-status] > .g-acc__top, [data-side-nav], [data-window-close], [data-window-minimize], [data-open-window], [data-open-modal], [data-no-drag], [data-icon]',
  };
  let topZ = WIN.zStart, cascadeStep = 0;
  const opened = new Set(), minimized = new Set();
  const panelOf = (key) => $(`[data-window="${key}"]`);

  function switchView(panel, name) {
    if (!name) return;
    $$("[data-view]", panel).forEach((v) => v.classList.toggle("is-active", v.dataset.view === name));
    $$("[data-side-nav]", panel).forEach((n) => n.classList.toggle("is-active", n.dataset.viewTarget === name));
    panel.dispatchEvent(new CustomEvent("view:change", { detail: name }));
  }
  const front = (panel) => { panel.style.zIndex = ++topZ; };

  function placeCentered(panel, step) {
    gsap.set(panel, { x: 0, y: 0, scale: 1 });
    const r = panel.getBoundingClientRect();
    const off = wide() ? step : 0;
    const x = Math.min(Math.max(WIN.pad, (innerWidth - r.width) / 2 + off), Math.max(WIN.pad, innerWidth - r.width - WIN.pad));
    const y = Math.min(Math.max(WIN.pad, (innerHeight - r.height) / 2 + off), Math.max(WIN.pad, innerHeight - r.height - WIN.pad));
    gsap.set(panel, { x, y });
  }

  function openWin(key, trigger) {
    const panel = panelOf(key);
    if (!panel) return;
    if (trigger && trigger.dataset.viewTarget) switchView(panel, trigger.dataset.viewTarget);
    if (opened.has(key) && !minimized.has(key)) return front(panel);
    const restoring = minimized.has(key);
    minimized.delete(key);
    opened.add(key);
    panel.removeAttribute("inert");
    panel.style.display = "block";
    front(panel);
    if (!restoring && !panel.dataset.placed) {
      placeCentered(panel, (cascadeStep++ % WIN.cascadeMax) * WIN.cascade);
      panel.dataset.placed = "1";
    }
    gsap.fromTo(panel, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: dur(WIN.open), ease: WIN.openEase });
  }

  function closeWin(key) {
    const panel = panelOf(key);
    if (!panel || !opened.has(key)) return;
    opened.delete(key); minimized.delete(key);
    gsap.to(panel, {
      autoAlpha: 0, scale: 0.97, duration: dur(WIN.close), ease: WIN.closeEase,
      onComplete: () => {
        panel.style.display = "none";
        panel.setAttribute("inert", "");
        delete panel.dataset.placed;
        panel.dispatchEvent(new CustomEvent("window:closed"));
      },
    });
  }

  function minimizeWin(key) {
    const panel = panelOf(key);
    if (!panel || !opened.has(key) || minimized.has(key)) return;
    minimized.add(key);
    gsap.to(panel, {
      autoAlpha: 0, scale: 0.9, duration: dur(WIN.minimize), ease: WIN.closeEase,
      onComplete: () => { panel.style.display = "none"; panel.setAttribute("inert", ""); },
    });
  }

  // If the title line goes off-screen, push it back inside
  function clampBack(panel) {
    const r = ($("[data-window-bar]", panel) || panel).getBoundingClientRect();
    let dx = 0, dy = 0;
    if (r.right < WIN.pad) dx = WIN.pad - r.right;
    if (r.left > innerWidth - WIN.pad) dx = innerWidth - WIN.pad - r.left;
    if (r.top < WIN.pad) dy = WIN.pad - r.top;
    if (r.top > innerHeight - WIN.pad) dy = innerHeight - WIN.pad - r.top;
    if (dx || dy) gsap.to(panel, { x: `+=${dx}`, y: `+=${dy}`, duration: 0.3, ease: "power2.out" });
  }

  function dragWin(panel) {
    let sx, sy, ox, oy, pid = null;
    panel.addEventListener("pointerdown", (e) => {
      front(panel);
      if (!wide() || e.button !== 0 || e.target.closest(WIN.dragIgnore) || document.body.classList.contains("is-crazy")) return;
      pid = e.pointerId; sx = e.clientX; sy = e.clientY;
      ox = gsap.getProperty(panel, "x"); oy = gsap.getProperty(panel, "y");
      panel.setPointerCapture(pid);
      document.body.style.cursor = "grabbing";
      e.preventDefault();
    });
    panel.addEventListener("pointermove", (e) => {
      if (e.pointerId !== pid) return;
      const maxX = Math.max(WIN.pad, innerWidth - panel.offsetWidth - WIN.pad);
      const maxY = Math.max(WIN.pad, innerHeight - panel.offsetHeight - WIN.pad);
      gsap.set(panel, {
        x: Math.min(Math.max(WIN.pad, ox + e.clientX - sx), maxX),
        y: Math.min(Math.max(WIN.pad, oy + e.clientY - sy), maxY),
      });
    });
    const up = (e) => {
      if (e.pointerId !== pid) return;
      pid = null;
      document.body.style.cursor = "";
      clampBack(panel);
    };
    panel.addEventListener("pointerup", up);
    panel.addEventListener("pointercancel", up);
  }

  function registerWin(panel) {
    const key = panel.dataset.window;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("inert", "");
    panel.style.display = "none";
    $$("[data-window-close]", panel).forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); closeWin(key); }));
    $$("[data-window-minimize]", panel).forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); minimizeWin(key); }));
    $$("[data-side-nav]", panel).forEach((n) => n.addEventListener("click", (e) => { e.preventDefault(); switchView(panel, n.dataset.viewTarget); }));
    if (wide()) panel.style.cursor = "grab";
    dragWin(panel);
  }
  $$("[data-window]").forEach(registerWin);
  G.win = { open: openWin, close: closeWin, minimize: minimizeWin, register: registerWin, opened, minimized };

  // ── Accordion: only one among siblings in the same row, with data-hover-open it opens .12s after hover ──
  function setAcc(item, on) {
    item.dataset.accStatus = on ? "active" : "not-active";
    if (on) [...item.parentElement.children].forEach((s) => { if (s !== item && s.dataset.accStatus) s.dataset.accStatus = "not-active"; });
  }
  $$("[data-acc-status]").forEach((item) => {
    const top = $(".g-acc__top", item);
    top.addEventListener("click", (e) => { e.stopPropagation(); setAcc(item, item.dataset.accStatus !== "active"); });
    if (item.hasAttribute("data-hover-open") && matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let t = null;
      item.addEventListener("pointerenter", () => { t = setTimeout(() => setAcc(item, true), 120); });
      item.addEventListener("pointerleave", () => clearTimeout(t));
    }
  });

  // ── Modal · Blur ──
  const blur = $("[data-blur]");
  const isHeight = (m) => m.hasAttribute("data-modal-height");
  function openModal(key) {
    const m = $(`[data-modal="${key}"]`);
    if (!m) return;
    m.removeAttribute("inert");
    if (isHeight(m)) {
      gsap.killTweensOf(m);
      m.classList.add("is-open");
      gsap.set(m, { display: "block", height: "auto" });
      const full = m.offsetHeight;
      gsap.fromTo(m, { height: 0 }, { height: full, duration: dur(0.95), ease: "power4.inOut", onComplete: () => gsap.set(m, { height: "auto" }) });
    } else {
      requestAnimationFrame(() => m.classList.add("is-open"));
    }
    blur.classList.add("is-active");
  }
  function closeModal(m) {
    if (!m || !m.classList.contains("is-open")) return;
    m.setAttribute("inert", "");
    if (!$$("[data-modal].is-open").some((o) => o !== m)) blur.classList.remove("is-active");
    if (isHeight(m)) {
      gsap.killTweensOf(m);
      gsap.set(m, { height: m.offsetHeight });
      gsap.to(m, { height: 0, duration: dur(0.95), ease: "power4.inOut", onComplete: () => { gsap.set(m, { display: "none" }); m.classList.remove("is-open"); } });
    } else {
      m.classList.remove("is-open");
    }
  }
  $$("[data-modal]").forEach((m) => m.setAttribute("inert", ""));
  $$("[data-modal-close]").forEach((b) => b.addEventListener("click", () => closeModal(b.closest("[data-modal]"))));
  blur.addEventListener("click", () => $$("[data-modal].is-open").forEach(closeModal));
  G.modal = { open: openModal, close: closeModal };

  // ── Dock menu: height 0→auto .8s power4.out, hamburger turns into an X in .45s ──
  const menu = $("[data-menu]"), burger = $("[data-menu-toggle]");
  // The hamburger Lottie isn’t played, frames are pushed with GSAP — open goes to 45% of total frames (X), close goes to 0
  const burgerAnim = lottie.loadAnimation({ container: $("[data-lottie=burger]", burger), renderer: "svg", loop: false, autoplay: false, animationData: G_LOTTIE.burger() });
  const burgerFrame = { f: 0 };
  burgerAnim.goToAndStop(0, true);
  const burgerTo = (open) => {
    gsap.killTweensOf(burgerFrame);
    gsap.to(burgerFrame, {
      f: open ? Math.round(0.45 * burgerAnim.totalFrames) : 0, duration: dur(0.45), ease: "power2.inOut",
      onUpdate: () => burgerAnim.goToAndStop(burgerFrame.f, true),
    });
  };
  let menuOpen = false;
  function setMenu(open, force) {
    if (open === menuOpen || (!force && gsap.isTweening(menu))) return;
    gsap.killTweensOf(menu);
    menuOpen = open;
    burger.setAttribute("aria-expanded", String(open));
    burgerTo(open);
    if (open) {
      gsap.set(menu, { display: "block", height: "auto" });
      const full = menu.offsetHeight;
      gsap.fromTo(menu, { height: 0 }, { height: full, duration: dur(0.8), ease: "power4.out", onComplete: () => gsap.set(menu, { height: "auto" }) });
    } else {
      gsap.set(menu, { height: menu.offsetHeight });
      gsap.to(menu, { height: 0, duration: dur(0.8), ease: "power4.out", onComplete: () => gsap.set(menu, { display: "none" }) });
    }
  }
  burger.addEventListener("click", () => setMenu(!menuOpen));
  G.menu = { set: setMenu };

  // ── Openers: the menu row closes the menu and then opens after .25s, the button inside a notice closes the notice ──
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-open-window], [data-open-modal]");
    if (!el || el.closest("[data-drag-item]")) return;
    e.preventDefault();
    const run = () => {
      if (el.dataset.openModal) openModal(el.dataset.openModal);
      else openWin(el.dataset.openWindow, el);
    };
    if (el.hasAttribute("data-close-parent")) G.noti?.close(el.closest("[data-noti]"));
    if (el.hasAttribute("data-nav-link")) {
      setMenu(false, true);
      setTimeout(run, 250);
    } else run();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || document.body.classList.contains("is-crazy")) return;
    const m = $("[data-modal].is-open");
    if (m) return closeModal(m);
    if (menuOpen) return setMenu(false, true);
    const live = [...opened].filter((k) => !minimized.has(k));
    if (live.length) closeWin(live.pop());
  });

  // ── Clock ──
  const clock = $("[data-clock]");
  const DAYS = ["Day", "Month", "Fire", "Number", "Neck", "Gold", "Earth"];
  const tick = () => {
    const d = new Date();
    clock.textContent = `${DAYS[d.getDay()]} ${d.getMonth() + 1}Month ${d.getDate()}Sun, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  tick();
  setInterval(tick, 15000);

  // ── Playlist: the cover’s play button opens the card, while the card button only toggles play (no sound) ──
  const pill = $("[data-player-pill]"), card = $("[data-player]");
  const TRACKS = [["Your song title 1 here", "Your artist here"], ["Your song title 2 here", "Your artist here"], ["Your song title 3 here", "Your artist here"]];
  let track = 0, playing = false, cardOpen = false, advanced = false;
  // Sound wave Lottie: spins only while playing and stands in place when stopped. When the track changes, it restarts from frame 0
  const wave = lottie.loadAnimation({ container: $("[data-wave]"), renderer: "svg", loop: true, autoplay: false, animationData: G_LOTTIE.waves() });
  wave.goToAndStop(0, true);
  const syncPlay = () => {
    pill.classList.toggle("is-playing", playing); card.classList.toggle("is-playing", playing);
    playing && !reduce ? wave.play() : wave.pause();
  };
  const showTrack = () => {
    $("[data-track-title]", card).textContent = TRACKS[track][0];
    $("[data-track-artist]", card).textContent = TRACKS[track][1];
    $("[data-prev]", card).classList.toggle("is-active", advanced);
    wave.goToAndStop(0, true);
    playing = true; syncPlay();
  };
  const togglePlay = () => { playing = !playing; syncPlay(); };
  const goNext = () => { track = (track + 1) % TRACKS.length; advanced = true; showTrack(); };
  const goPrev = () => { track = (track - 1 + TRACKS.length) % TRACKS.length; showTrack(); };
  const closeCard = () => {
    cardOpen = false; card.classList.remove("is-active"); playing = false;
    setTimeout(() => { if (!cardOpen) card.style.display = "none"; }, 200);
    card.setAttribute("aria-hidden", "true");
    syncPlay();
  };
  $("[data-player-trigger]").addEventListener("click", () => {
    if (cardOpen) return closeCard();
    cardOpen = true; card.style.display = "block"; requestAnimationFrame(() => card.classList.add("is-active"));
    card.setAttribute("aria-hidden", "false");
    if (!playing) showTrack();
  });
  $("[data-play]", card).addEventListener("click", togglePlay);
  $("[data-next]", card).addEventListener("click", goNext);
  $("[data-prev]", card).addEventListener("click", () => { if (advanced) goPrev(); });
  // Like the original, intercept keys only while the card is open — Space·k play, →·l next, ←·j previous, Esc close
  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement?.tagName;
    if (!cardOpen || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.key === " " || e.key === "k") { e.preventDefault(); togglePlay(); }
    else if (e.key === "ArrowRight" || e.key === "l") { e.preventDefault(); goNext(); }
    else if (e.key === "ArrowLeft" || e.key === "j") { e.preventDefault(); goPrev(); }
    else if (e.key === "Escape") closeCard();
  });

  // ── Notifications: first at 15~22s, next at 27~35s intervals. Pops up with elastic.out(1, .75) ──
  (function notis() {
    const wrap = $("[data-notis]");
    // Notices whose event date has passed are left out of both the order and the tabs
    const list = $$("[data-noti]").filter((n) => !n.dataset.notiUntil || Date.now() < Date.parse(n.dataset.notiUntil));
    $$("[data-noti]").filter((n) => !list.includes(n)).forEach((n) => { n.style.display = "none"; });
    if (!wide()) return;
    const GAP = 12, SLIDE = 60, rand = (a, b) => a + Math.random() * (b - a);
    const active = new Set();
    const sync = () => wrap.classList.toggle("is-active", active.size > 0);
    list.forEach((n) => { const h = n.offsetHeight; n.dataset.h = h; gsap.set(n, { y: h + SLIDE, autoAlpha: 0, marginTop: -(h + GAP) }); });
    const reveal = (n) => {
      if (active.has(n) || n.dataset.closed === "1") return;
      active.add(n); sync();
      gsap.timeline()
        .to(n, { marginTop: 0, duration: dur(0.55), ease: "power3.out" }, 0)
        .to(n, { y: 0, autoAlpha: 1, duration: dur(1.1), ease: "elastic.out(1, 0.75)" }, 0);
    };
    const close = (n) => {
      if (!n || n.dataset.closed === "1") return;
      n.dataset.closed = "1";
      active.delete(n); sync();
      gsap.timeline()
        .to(n, { autoAlpha: 0, marginTop: -(Number(n.dataset.h) + GAP), duration: dur(0.25), ease: "power2.out" })
        .set(n, { display: "none", y: Number(n.dataset.h) + SLIDE });
    };
    const show = (n) => {
      n.dataset.closed = "0";
      gsap.set(n, { display: "", y: Number(n.dataset.h) + SLIDE, autoAlpha: 0, marginTop: -(Number(n.dataset.h) + GAP) });
      reveal(n);
    };
    list.forEach((n) => $("[data-noti-close]", n).addEventListener("click", (e) => { e.stopPropagation(); close(n); }));
    $("[data-noti-tab]").addEventListener("click", () => {
      if (list.every((n) => active.has(n))) list.forEach(close);
      else list.forEach((n) => !active.has(n) && show(n));
    });
    let delay = rand(15, 22);
    list.forEach((n) => { gsap.delayedCall(delay, () => reveal(n)); delay += rand(27, 35); });
    G.noti = { close };
  })();

  // ── Screensaver: after 50s hands-off, a logo bounces off the walls at 160px per second ──
  (function saver() {
    if (!wide() || reduce) return;
    const ov = $("[data-saver]"), logo = $("[data-saver-logo]");
    let x = 0, y = 0, vx = 0, vy = 0, bw = 0, bh = 0, on = false, raf = 0, last = 0, idle = null;
    const measure = () => { bw = Math.max(0, innerWidth - logo.getBoundingClientRect().width); bh = Math.max(0, innerHeight - logo.getBoundingClientRect().height); };
    const frame = (ts) => {
      raf = requestAnimationFrame(frame);
      if (!last) { last = ts; return; }
      const dt = Math.min(ts - last, 50) / 1000;
      last = ts;
      x += vx * dt; y += vy * dt;
      if (x <= 0) { x = 0; vx = Math.abs(vx); } else if (x >= bw) { x = bw; vx = -Math.abs(vx); }
      if (y <= 0) { y = 0; vy = Math.abs(vy); } else if (y >= bh) { y = bh; vy = -Math.abs(vy); }
      logo.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const start = () => {
      if (on) return;
      on = true;
      gsap.set(ov, { display: "block", autoAlpha: 0 });
      measure();
      x = Math.random() * bw; y = Math.random() * bh;
      vx = 160 * gsap.utils.random(0.45, 0.85) * (Math.random() < 0.5 ? -1 : 1);
      vy = Math.sqrt(160 ** 2 - vx ** 2) * (Math.random() < 0.5 ? -1 : 1);
      gsap.to(ov, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
      last = 0; raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!on) return;
      on = false;
      cancelAnimationFrame(raf); raf = 0;
      gsap.to(ov, { autoAlpha: 0, duration: 0.18, ease: "power3.out", onComplete: () => gsap.set(ov, { display: "none" }) });
    };
    const wake = () => { stop(); clearTimeout(idle); idle = setTimeout(start, 50000); };
    ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"].forEach((t) => addEventListener(t, wake, { passive: true }));
    wake();
  })();

  // ── Loader: the word strip rolls for 2.8s and stops on the event name, the bar fills at 3.75s and clears .25s later ──
  const loader = $("[data-loader]");
  const icons = $$("[data-drag-item]");
  const revealIcons = () => {
    gsap.to(icons, { autoAlpha: 1, duration: dur(0.45), ease: "power1.out", stagger: 0.015, delay: dur(0.3) });
    gsap.to(icons, { scale: 1, duration: dur(0.45), ease: "back.out(2)", stagger: 0.015, delay: dur(0.3) });
  };
  const startWindow = () => gsap.delayedCall(reduce ? 0 : 8, () => openWin("main", $('[data-open-window="main"]')));
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (G.loaderDone) return;
    G.loaderDone = true;
    if (ctx.conditions.still) {
      loader.style.display = "none";
      gsap.set(icons, { autoAlpha: 1, scale: 1 });
      startWindow();
      return;
    }
    gsap.set(icons, { autoAlpha: 0, scale: 0.85 });
    const WORDS = ["One word", "Word two", "Word three", "Word four", "Five words", "Event name©"];
    const list = $("[data-loader-list]"), slot = $("[data-loader-slot]"), bar = $("[data-loader-bar]");
    const strip = [];
    for (let r = 0; r < 5; r++) strip.push(...WORDS);
    strip.push(WORDS[0], WORDS[1]);
    const items = strip.map((w) => { const d = document.createElement("div"); d.textContent = w; list.append(d); return d; });
    const target = items[4 * WORDS.length + WORDS.length - 1];
    const endY = -(target.offsetTop - (slot.clientHeight - target.offsetHeight) / 2);
    const slotDur = 3.75 - 0.95;
    gsap.to(list, { y: endY, duration: slotDur, ease: "power3.out" });
    gsap.delayedCall(slotDur - 1.35, () => gsap.to(items.filter((i) => i !== target), { opacity: 0, duration: 0.65, ease: "power2.out" }));
    gsap.to(bar, {
      width: "100%", duration: 3.75, ease: "none",
      onComplete: () => gsap.delayedCall(0.25, () => gsap.to(loader, {
        autoAlpha: 0, duration: 0.5, ease: "power2.inOut",
        onComplete: () => { loader.style.display = "none"; revealIcons(); },
      })),
    });
    startWindow();
  });
})();
