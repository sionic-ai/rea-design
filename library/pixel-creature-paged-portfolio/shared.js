// Motion spanning several panels and pages: screen-by-screen snap, menu drawer with rotating square marker, square cursor, film grain, text unscrambling on language change, clock
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AC = (window.AC = { reduce });
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  AC.clamp = clamp;
  AC.delta = (e) => (e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY);

  // One trackpad swipe sends dozens of inertial wheel events, so separate fresh pushes from the tail so each gesture advances only once
  const wheel = (AC.wheel = { fresh: false, spent: false, dist: 0 });
  const touch = (AC.touch = { spent: false });
  const GESTURE_GAP = 120, MIN_DIST = 20, SWIPE = 56;
  const hist = [];
  let lastAt = -1e9, lastDir = 0, surging = false;
  const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  addEventListener("wheel", (e) => {
    const d = AC.delta(e);
    if (!d) return;
    const now = performance.now(), dir = Math.sign(d), a = Math.abs(d);
    let fresh = now - lastAt > GESTURE_GAP || dir !== lastDir;
    if (fresh) { hist.length = 0; surging = true; }
    hist.push(a);
    if (hist.length > 15) hist.shift();
    // When inertia fades then strengthens again (one more push in the same direction), count it as a new gesture
    if (!fresh && hist.length > 3) {
      const recent = avg(hist.slice(-3)), before = avg(hist.slice(0, -3));
      if (!surging && recent > before * 1.5 && recent >= 8) { surging = true; fresh = true; }
      else if (surging && recent < before * 0.85) surging = false;
    }
    if (fresh) { wheel.dist = 0; wheel.spent = false; }
    wheel.fresh = fresh;
    wheel.dist += a;
    lastAt = now;
    lastDir = dir;
  }, { capture: true, passive: true });
  addEventListener("touchstart", () => { touch.spent = false; }, { capture: true, passive: true });

  // Snap: move the track by one screen height in .5s power2.inOut
  const root = document.querySelector("[data-snap]");
  const track = root?.querySelector(".ac-track");
  const panels = track ? [...track.children] : [];
  let index = 0, moving = false, queued = 0;
  const mark = (i) => {
    document.body.classList.toggle("on-light", !!panels[i]?.classList.contains("ac-light"));
    document.body.classList.toggle("at-hero", i === 0);
  };
  const emit = (i, dir) => dispatchEvent(new CustomEvent("snap:section", { detail: { index: i, panel: panels[i], dir } }));
  const holdsWheel = (p) => !!p?.querySelector("[data-scroll], [data-wheel-capture]");
  function go(i) {
    if (!track || i < 0 || i >= panels.length || i === index) return;
    moving = true;
    wheel.spent = true;
    touch.spent = true;
    const dir = i > index ? 1 : -1;
    index = i;
    emit(i, dir);
    mark(i);
    gsap.to(track, {
      y: -i * root.clientHeight, duration: reduce ? 0 : 0.5, ease: "power2.inOut", overwrite: true,
      onComplete() {
        moving = false;
        const q = queued;
        queued = 0;
        if (q && !holdsWheel(panels[index])) go(index + q);
      },
    });
  }
  function step(dir, queue = true) {
    if (moving) { if (queue) queued = dir; return; }
    go(index + dir);
  }
  const tryStep = (dir) => {
    if (wheel.spent || wheel.dist < MIN_DIST) return;
    wheel.spent = true;
    step(dir, false);
  };
  AC.snap = { step, go, tryStep, panels, get index() { return index; } };
  addEventListener("snap:step", (e) => {
    const { dir, queue } = e.detail || {};
    if (dir === 1 || dir === -1) step(dir, queue !== false);
  });

  const atEdge = (el, dir) => (dir === 1 ? el.scrollTop + el.clientHeight >= el.scrollHeight - 1 : el.scrollTop <= 0);
  const innerScrolls = (t, stop, dir) => {
    for (let n = t; n && n !== stop; n = n.parentElement) {
      if (n.scrollHeight > n.clientHeight + 1 && !atEdge(n, dir)) {
        const o = getComputedStyle(n).overflowY;
        if (o === "auto" || o === "scroll") return true;
      }
    }
    return false;
  };
  const keepsScroll = (t, el, dir) => innerScrolls(t, el, dir) || !atEdge(el, dir);

  if (track) {
    mark(0);
    addEventListener("wheel", (e) => {
      if (e.target.closest?.("[data-scroll], [data-wheel-capture]")) return;
      e.preventDefault();
      const d = AC.delta(e);
      if (Math.abs(d) >= 1) tryStep(Math.sign(d));
    }, { passive: false });
    // A box that scrolls inside passes to the next panel only when it reaches the end
    root.querySelectorAll("[data-scroll]").forEach((el) => {
      el.addEventListener("wheel", (e) => {
        const dir = AC.delta(e) > 0 ? 1 : -1;
        if (keepsScroll(e.target, el, dir)) { wheel.spent = true; return; }
        e.preventDefault();
        tryStep(dir);
      }, { passive: false });
    });

    let ty = 0, tacc = 0, tdir = 0;
    addEventListener("touchstart", (e) => { ty = e.touches[0].clientY; tacc = 0; tdir = 0; }, { passive: true });
    addEventListener("touchmove", (e) => {
      if (e.target.closest?.("[data-touch-capture]")) return;
      const y = e.touches[0].clientY, d = ty - y;
      ty = y;
      if (!d) return;
      const dir = d > 0 ? 1 : -1;
      const sc = e.target.closest?.("[data-scroll]");
      if (sc && keepsScroll(e.target, sc, dir)) { touch.spent = true; return; }
      if (e.cancelable) e.preventDefault();
      if (touch.spent) return;
      if (dir !== tdir) { tdir = dir; tacc = 0; }
      tacc += Math.abs(d);
      if (tacc >= SWIPE) { touch.spent = true; step(dir, false); }
    }, { passive: false });

    addEventListener("keydown", (e) => {
      if (e.defaultPrevented || e.target.closest?.("input, textarea, select, [contenteditable]")) return;
      const dir = e.key === "ArrowDown" || e.key === "PageDown" ? 1 : e.key === "ArrowUp" || e.key === "PageUp" ? -1 : 0;
      if (!dir) return;
      const sc = panels[index]?.querySelector("[data-scroll]");
      if (sc && !atEdge(sc, dir)) { sc.scrollTop += dir * 80; return; }
      e.preventDefault();
      step(dir);
    });

    // In-page #links snap to that panel without scrolling the document
    const panelOf = (hash) => panels.findIndex((p) => p.id && "#" + p.id === hash);
    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const i = panelOf(a.getAttribute("href"));
      if (i < 0) return;
      history.replaceState(null, "", a.getAttribute("href"));
      go(i);
    }, true);
    root.addEventListener("scroll", () => { root.scrollTop = 0; root.scrollLeft = 0; });
    addEventListener("resize", () => gsap.set(track, { y: -index * root.clientHeight }));

    const start = panelOf(location.hash);
    if (start > 0) {
      index = start;
      gsap.set(track, { y: -start * root.clientHeight });
      mark(start);
    }
    requestAnimationFrame(() => emit(index, 1));
  }

  // Menu drawer: 850ms after opening, a green square marker spins in, and moves to the hovered row with a 180° spin
  const menu = document.getElementById("ac-menu");
  if (menu) {
    const nav = menu.querySelector(".ac-menu__nav");
    const marker = menu.querySelector(".ac-menu__marker");
    const toggles = document.querySelectorAll("[data-menu-toggle]");
    const links = () => [...menu.querySelectorAll(".ac-menu__link")];
    const activeLink = () => links().find((l) => l.classList.contains("is-active")) || links()[0];
    const isOpen = () => document.documentElement.classList.contains("menu-open");
    const armed = () => menu.classList.contains("is-armed");
    let armTimer = 0, closeTimer = 0, rot = 0, hovered = null;

    const moveMarker = (link, animate) => {
      links().forEach((l) => l.classList.toggle("is-marked", l === link));
      const y = link.offsetTop + (link.offsetHeight - marker.offsetHeight) / 2;
      gsap.killTweensOf(marker, "y,rotation,scale");
      if (!animate || reduce) { gsap.set(marker, { y, rotation: rot, scale: 1 }); return; }
      rot += 180;
      gsap.timeline()
        .to(marker, { y, rotation: rot, duration: 0.62, ease: "expo.out" }, 0)
        .to(marker, { scale: 1.22, duration: 0.14, ease: "power2.out" }, 0)
        .to(marker, { scale: 1, duration: 0.5, ease: "back.out(2.2)" }, 0.14);
    };
    const arm = () => {
      if (armed()) return;
      clearTimeout(armTimer);
      menu.classList.add("is-armed");
      moveMarker(hovered || activeLink(), false);
      gsap.killTweensOf(marker, "opacity");
      if (reduce) { gsap.set(marker, { opacity: 1, scale: 1 }); return; }
      gsap.fromTo(marker, { opacity: 0, scale: 0.2, rotation: rot - 135 }, { opacity: 1, scale: 1, rotation: rot, duration: 0.55, ease: "back.out(1.7)" });
    };
    const disarm = () => {
      menu.classList.remove("is-armed");
      links().forEach((l) => l.classList.remove("is-marked"));
      hovered = null;
      gsap.killTweensOf(marker);
      gsap.set(marker, { opacity: 0, scale: 0.2 });
    };
    const setMenu = (open) => {
      const was = menu.classList.contains("is-open");
      document.documentElement.classList.toggle("menu-open", open);
      document.body.classList.toggle("menu-open", open);
      menu.classList.toggle("is-open", open);
      menu.inert = !open;
      toggles.forEach((b) => b.setAttribute("aria-expanded", String(open)));
      clearTimeout(armTimer);
      clearTimeout(closeTimer);
      if (open) {
        menu.classList.remove("is-closing");
        disarm();
        armTimer = setTimeout(arm, 850);
        activeLink()?.focus({ preventScroll: true });
      } else if (was) {
        menu.classList.add("is-closing");
        closeTimer = setTimeout(() => { menu.classList.remove("is-closing"); disarm(); }, 520);
      }
    };
    disarm();
    nav.addEventListener("pointerover", (e) => {
      const l = e.target.closest(".ac-menu__link");
      if (!l || l === hovered) return;
      hovered = l;
      armed() ? moveMarker(l, true) : arm();
    });
    nav.addEventListener("pointerleave", () => {
      if (!isOpen()) return;
      hovered = null;
      if (armed()) moveMarker(activeLink(), true);
    });
    nav.addEventListener("focusin", (e) => {
      const l = e.target.closest(".ac-menu__link");
      if (!l || l === hovered) return;
      hovered = l;
      if (armed()) moveMarker(l, true);
    });
    document.addEventListener("click", (e) => {
      if (e.target.closest?.("[data-menu-toggle]")) { setMenu(!isOpen()); return; }
      if (e.target.closest?.("#ac-menu a")) setMenu(false);
    });
    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) { setMenu(false); toggles[0]?.focus(); }
    });
    addEventListener("snap:section", (e) => {
      const id = e.detail?.panel?.id;
      links().forEach((l) => l.classList.toggle("is-active", !!id && l.dataset.section === id));
      if (isOpen() && armed() && !hovered) moveMarker(activeLink(), true);
    });
    addEventListener("resize", () => { if (isOpen() && armed()) moveMarker(hovered || activeLink(), false); });
  }

  // Square cursor
  const cursor = document.getElementById("ac-cursor");
  if (cursor && matchMedia("(pointer: fine)").matches) {
    const qx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
    const qy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });
    addEventListener("pointermove", (e) => {
      cursor.style.opacity = "1";
      if (reduce) gsap.set(cursor, { x: e.clientX, y: e.clientY });
      else { qx(e.clientX); qy(e.clientY); }
    });
    document.documentElement.addEventListener("pointerleave", () => { cursor.style.opacity = "0"; });
  }

  // Film grain: one grain every 2.2px of screen (1.4px on phone), 14fps — re-scatter only the visible panel’s grain
  const small = matchMedia("(max-width: 860px)");
  const grainOf = (p) => p?.querySelector(".ac-grain canvas");
  const sowGrain = (c) => {
    if (!c || !c.clientWidth) return;
    const s = small.matches ? 1.4 : 2.2;
    const w = Math.max(1, Math.ceil(c.clientWidth / s)), h = Math.max(1, Math.ceil(c.clientHeight / s));
    if (c.width !== w || c.height !== h || !c._buf) {
      c.width = w;
      c.height = h;
      c._img = c.getContext("2d").createImageData(w, h);
      c._buf = new Uint32Array(c._img.data.buffer);
    }
    const b = c._buf;
    for (let i = 0; i < b.length; i++) {
      const v = ((Math.random() + Math.random()) * 127.5) | 0;
      b[i] = 0xff000000 | (v << 16) | (v << 8) | v;
    }
    c.getContext("2d").putImageData(c._img, 0, 0);
  };
  const grainPanels = panels.length ? panels : [document.body];
  if (reduce) grainPanels.forEach((p) => sowGrain(grainOf(p)));
  else {
    let last = 0;
    gsap.ticker.add((t) => {
      if (t - last < 1 / 14) return;
      last = t;
      sowGrain(grainOf(grainPanels[index]));
    });
    addEventListener("snap:section", (e) => sowGrain(grainOf(e.detail?.panel)));
  }

  // Character scramble: each character swaps among a set of similar characters every 85ms until its set time, then settles in place
  AC.decode = (el, ms = 380, swap = 85) => {
    const nodes = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) if (n.data.trim()) nodes.push(n);
    const total = nodes.reduce((s, n) => s + [...n.data].filter((c) => c.trim()).length, 0) || 1;
    let k = 0;
    const jobs = nodes.map((n) => {
      const fin = [...n.data];
      const pool = [...new Set(fin.filter((c) => c.trim()))];
      const pick = () => pool[(Math.random() * pool.length) | 0];
      return {
        n, fin, pick,
        at: fin.map((c) => (c.trim() ? ms * (0.06 + 0.7 * (k++ / total) + 0.2 * Math.random()) : 0)),
        cur: fin.map((c) => (c.trim() ? pick() : c)),
        swapped: fin.map(() => -Math.random() * swap),
      };
    });
    if (reduce) return;
    const t0 = performance.now();
    const tick = () => {
      const t = performance.now() - t0;
      let live = false;
      for (const j of jobs) {
        j.n.data = j.fin.map((c, i) => {
          if (t >= j.at[i]) return c;
          live = true;
          if (t - j.swapped[i] > swap) { j.cur[i] = j.pick(); j.swapped[i] = t; }
          return j.cur[i];
        }).join("");
      }
      if (live) requestAnimationFrame(tick);
    };
    tick();
  };

  // Language switch: pressing it expands the other language cells, and choosing one makes the text unravel and change (placeholder, so the copy stays the same)
  const closeLangs = () => document.querySelectorAll("[data-lang-switch].is-open").forEach((s) => s.classList.remove("is-open"));
  document.querySelectorAll("[data-lang-switch]").forEach((sw) => {
    sw.addEventListener("click", (e) => {
      const opt = e.target.closest("[data-lang-opt]");
      if (!opt) return;
      if (!sw.classList.contains("is-open")) { sw.classList.add("is-open"); return; }
      sw.classList.remove("is-open");
      if (opt.getAttribute("aria-pressed") === "true") return;
      sw.querySelectorAll("[data-lang-opt]").forEach((o) => o.setAttribute("aria-pressed", String(o === opt)));
      document.querySelectorAll("[data-decode]").forEach((el) => AC.decode(el));
    });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest?.("[data-lang-switch]")) closeLangs(); });

  // Local time
  const clock = document.querySelector("[data-clock]");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 1000);
  }
})();
