// Site-wide shared behavior — inner panel smooth scroll and data-speed parallax, drawer, clock and radio in the drawer, header contact button, five question cards behind the post-it deck.
// Original, instead of a window <main> The panel scrolls — blocks the wheel, stacks target positions, and each frame follows .12 of the remaining distance (gsap ticker).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const view = document.querySelector(".ps-view");
  const body = document.body;
  if (view) ScrollTrigger.defaults({ scroller: view });

  // ── Smooth inner scroll + data-speed parallax (original 0.96~0.98 · clamp — only shifts within its own height × |1−speed|)
  const smooth = (() => {
    if (!view) return { to() {}, stop() {} };
    let target = view.scrollTop, cur = target, set = target, ticking = false, lerp = 0.12;
    let speedNodes = [];
    const measure = () => {
      speedNodes = [...view.querySelectorAll("[data-speed]")].map((node) => {
        const m = /clamp\(([^)]+)\)/.exec(node.dataset.speed);
        const speed = Math.max(0.5, Math.min(1.5, parseFloat(m ? m[1] : node.dataset.speed)));
        node.style.removeProperty("transform");
        let top = 0, n = node;
        while (n && n !== view) { top += n.offsetTop; n = n.offsetParent; if (n && !view.contains(n)) break; }
        return { node, speed, clamp: !!m, center: top + node.offsetHeight / 2, h: node.offsetHeight };
      }).filter((s) => Math.abs(s.speed - 1) > 1e-4);
      parallax(view.scrollTop);
    };
    const parallax = (st) => {
      if (reduce) return;
      const vh = view.clientHeight;
      for (const s of speedNodes) {
        let d = (1 - s.speed) * (st + vh / 2 - s.center);
        if (s.clamp) { const r = Math.abs(1 - s.speed) * s.h; d = Math.max(-r, Math.min(r, d)); if (st <= 0) d = Math.min(d, 0); }
        s.node.style.transform = Math.abs(d) < 0.01 ? "" : `translate3d(0, ${d}px, 0)`;
      }
    };
    const tick = () => {
      if (view.scrollTop !== set) { target = cur = set = view.scrollTop; return stop(); }
      const d = target - cur;
      if (Math.abs(d) < 0.5) { view.scrollTop = cur = target; set = view.scrollTop; return stop(); }
      view.scrollTop = cur += lerp * d;
      set = view.scrollTop;
    };
    const stop = () => { if (ticking) { ticking = false; gsap.ticker.remove(tick); } };
    const nested = (t, dy) => {
      for (let n = t; n && n !== view; n = n.parentElement) {
        if (n.hasAttribute?.("data-smooth-ignore")) return true;
        const cs = getComputedStyle(n);
        if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight) {
          const max = n.scrollHeight - n.clientHeight;
          if ((dy > 0 && n.scrollTop < max - 1) || (dy < 0 && n.scrollTop > 1)) return true;
        }
      }
      return false;
    };
    const wheel = (e) => {
      if (e.ctrlKey || e.metaKey) return;
      let dy = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      dy *= e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      if (!dy || nested(e.target, dy)) return;
      const max = Math.max(0, view.scrollHeight - view.clientHeight);
      if ((target <= 0 && dy < 0) || (target >= max && dy > 0)) return;
      e.preventDefault();
      target = Math.max(0, Math.min(max, target + dy));
      if (!ticking) { cur = set = view.scrollTop; ticking = true; gsap.ticker.add(tick); }
    };
    if (!reduce) view.addEventListener("wheel", wheel, { passive: false });
    view.addEventListener("scroll", () => { parallax(view.scrollTop); ScrollTrigger.update(); }, { passive: true });
    document.addEventListener("pointerdown", () => { target = cur = set = view.scrollTop; stop(); }, { capture: true });
    new ResizeObserver(measure).observe(view);
    ScrollTrigger.addEventListener("refresh", measure);
    addEventListener("load", measure);
    return {
      measure,
      stop() { target = cur = set = view.scrollTop; stop(); },
      // Original scrollHomeViewToCenterElement — section center to panel center in .75s power3.inOut
      to(el) {
        const r = el.getBoundingClientRect(), v = view.getBoundingClientRect();
        const y = Math.max(0, Math.min(view.scrollHeight - view.clientHeight, view.scrollTop + r.top + r.height / 2 - (v.top + v.height / 2)));
        this.stop();
        gsap.to(view, { scrollTop: y, duration: reduce ? 0 : 0.75, ease: "power3.inOut", overwrite: true, onComplete: () => this.stop() });
      },
    };
  })();
  window.psSmooth = smooth;

  // ── Drawer: the panel and header slide over by the drawer width and the ＋ rotates 135° (.52s cubic-bezier(.55,.085,.675,.19)). On wide screens it opens by itself when you scroll to the very bottom of the panel
  const menuBtn = document.querySelector(".ps-menu-btn");
  const drawer = document.querySelector(".ps-drawer");
  const setDrawer = (open) => {
    body.classList.toggle("is-drawer-open", open);
    menuBtn?.setAttribute("aria-expanded", String(open));
    drawer?.toggleAttribute("inert", !open);
    smooth.stop();
  };
  setDrawer(false);
  menuBtn?.addEventListener("click", () => setDrawer(!body.classList.contains("is-drawer-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setDrawer(false); });
  if (view && view.dataset.drawerOnBottom != null) {
    let last = view.scrollTop, armed = false, skip = false;
    view.addEventListener("scroll", () => {
      const max = view.scrollHeight - view.clientHeight, st = view.scrollTop, left = max - st, down = st - last;
      last = st;
      if (left > 120) { armed = true; skip = false; }
      if (matchMedia("(max-width: 768px)").matches || max < 8 || skip) return;
      if (left <= 12 && armed && down > 0 && !body.classList.contains("is-drawer-open")) { armed = false; skip = true; setDrawer(true); }
    }, { passive: true });
  }

  // ── Drawer clock: current time, second hand sweeps smoothly
  const clock = document.querySelector(".ps-clock svg");
  if (clock) {
    const [h, m, s] = ["hour", "min", "sec"].map((k) => clock.querySelector(`[data-hand="${k}"]`));
    const tickClock = () => {
      const d = new Date(), sec = d.getSeconds() + d.getMilliseconds() / 1000, min = d.getMinutes() + sec / 60, hr = (d.getHours() % 12) + min / 60;
      h?.setAttribute("transform", `rotate(${hr * 30} 50 50)`);
      m?.setAttribute("transform", `rotate(${min * 6} 50 50)`);
      s?.setAttribute("transform", `rotate(${sec * 6} 50 50)`);
    };
    tickClock();
    if (!reduce) gsap.ticker.add(tickClock);
  }

  // ── Drawer radio: power light (.16s), the knob turns one notch (30°) per press
  document.querySelector(".ps-radio__power")?.addEventListener("click", (e) => {
    const b = e.currentTarget, on = b.getAttribute("aria-pressed") !== "true";
    b.setAttribute("aria-pressed", String(on));
    b.querySelector(".ps-radio__label").textContent = on ? "On" : "Off";
  });
  document.querySelectorAll(".ps-radio__dial").forEach((dial) => {
    let turn = 0;
    dial.addEventListener("click", () => { turn = (turn + 1) % 12; dial.querySelector(".ps-radio__notch").style.transform = `rotate(${turn * 30 - 135}deg)`; });
  });

  // ── Showreel slot: silent looping placeholder video, PLAY toggles pause·play ──
  document.querySelectorAll("video[data-autoplay]").forEach((v) => {
    v.muted = true;
    if (!reduce) v.play().catch(() => {});
  });
  document.querySelector(".ps-reel__play")?.addEventListener("click", (e) => {
    const v = document.querySelector(".ps-reel video");
    if (!v) return;
    v.paused ? v.play().catch(() => {}) : v.pause();
    e.currentTarget.querySelector("span").textContent = v.paused ? "Play" : "Pause";
  });

  // ── Question card deck: when the sticky-note stack slides out to the left (fx:open), a row of five cards enters from off the right edge over 1s power2.inOut and the first card stands at the center.
  //    The next section overlaps behind on the right at .858x tilted 3° · 5°, and past sections stack behind on the left at ±3° — .92s power2.inOut when flipping
  document.querySelectorAll(".ps-inquire").forEach((root) => {
    const cluster = root.querySelector(".ps-deck__cluster");
    const deck = root.querySelector(".ps-form__deck");
    const steps = [...root.querySelectorAll(".ps-step")];
    if (!cluster || !deck || !steps.length) return;
    let index = 0, open = false;
    const home = body.classList.contains("is-index");
    // Home page deck only — over the previous and next side cards, a Previous / Next pill follows the cursor position (original CursorPill: no lag, centered on the cursor, −3°, vanishes immediately on leaving).
    //   Like the original, not shown at 768px or below or on touch, and turned off under reduced motion
    const pill = home && fine && !reduce && !navigator.maxTouchPoints ? document.createElement("div") : null;
    const hidePill = () => pill?.classList.remove("is-on");
    if (pill) {
      pill.className = "ps-pill";
      pill.setAttribute("aria-hidden", "true");
      pill.append(document.createElement("span"));
      body.append(pill);
      root.addEventListener("pointermove", (e) => {
        const s = open && innerWidth > 768 ? e.target.closest(".ps-step") : null;
        const n = s ? steps.indexOf(s) - index : 0;
        if (!n || n > 2) return hidePill();
        pill.firstChild.textContent = n < 0 ? "Previous section" : "Next section";
        pill.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        pill.classList.add("is-on");
      });
      root.addEventListener("pointerout", (e) => { if (!root.contains(e.relatedTarget)) hidePill(); });
    }
    const vw = () => innerWidth / 100;
    const adv1 = () => Math.max(300, Math.min(440, 8.33 * vw() + 310));
    const adv2 = () => Math.max(200, Math.min(280, 16.67 * vw() + 25));
    const gap = () => Math.max(72, Math.min(96, 6 * vw()));
    const layer = () => Math.max(40, Math.min(56, 3 * vw()));
    const poseOf = (i, at) => {
      const n = i - at, w = deck.offsetWidth;
      if (n === 0) return { x: 0, scale: 1, rotation: 0, autoAlpha: 1, zIndex: 20 };
      if (n === 1) return { x: adv1(), scale: 0.858, rotation: 3, autoAlpha: 1, zIndex: 8 };
      if (n === 2) return { x: adv1() + adv2(), scale: 0.858, rotation: 5, autoAlpha: 1, zIndex: 7 };
      if (n > 2) return { x: adv1() + adv2() + 200, scale: 0.858, rotation: 5, autoAlpha: 0, zIndex: 1 };
      const u = -n;
      return { x: -(gap() + 0.858 * w + (u - 1) * layer()) + (w - 0.858 * w) / 2, scale: 0.858, rotation: i % 2 === 0 ? -3 : 3, autoAlpha: u <= 2 ? 1 : 0, zIndex: 8 + Math.max(0, 3 - u) };
    };
    const lay = (at, dur) => steps.forEach((s, i) => {
      const { zIndex, ...p } = poseOf(i, at);
      s.style.zIndex = zIndex;
      // First page original side card is a button pressed as a whole (inner buttons can’t be pressed) — put inert on the card and Chrome passes the cursor and clicks behind it, so neither the pill nor the advance triggers.
      if (home) { s.toggleAttribute("data-side", i !== at); for (const c of s.children) c.inert = i !== at; }
      else s.inert = i !== at;
      gsap.to(s, { ...p, transformOrigin: "50% 50%", duration: dur, ease: "power2.inOut", overwrite: "auto" });
    });
    const go = (to) => {
      if (to < 0 || to >= steps.length || to === index) return;
      hidePill();
      index = to;
      lay(index, reduce ? 0 : 0.92);
      steps[index].querySelector("button, input")?.focus({ preventScroll: true });
    };
    cluster.addEventListener("fx:open", () => {
      open = true;
      root.classList.add("is-open");
      index = 0;
      lay(0, 0);
      const r = deck.getBoundingClientRect();
      const off = Math.max(innerWidth - r.left + 48, r.width);
      gsap.fromTo(deck, { x: off }, { x: 0, duration: reduce ? 0 : 1, ease: "power2.inOut", onComplete: () => steps[0].querySelector("button")?.focus({ preventScroll: true }) });
    });
    const close = () => {
      if (!open) return;
      open = false;
      hidePill();
      gsap.to(deck, { x: innerWidth, duration: reduce ? 0 : 0.72, ease: "power3.in", onComplete: () => {
        root.classList.remove("is-open");
        gsap.set(deck, { x: 0 });
        cluster.dispatchEvent(new CustomEvent("fx:reset"));
      } });
    };
    steps.forEach((s, i) => {
      s.addEventListener("click", (e) => {
        if (i !== index) { e.preventDefault(); return go(i); }
        const chip = e.target.closest(".ps-chip");
        if (chip) {
          const multi = s.dataset.multi != null;
          if (!multi) s.querySelectorAll(".ps-chip").forEach((c) => c !== chip && c.setAttribute("aria-pressed", "false"));
          chip.setAttribute("aria-pressed", String(chip.getAttribute("aria-pressed") !== "true"));
        }
        if (e.target.closest(".ps-step__next")) i === steps.length - 1 ? close() : go(i + 1);
        if (e.target.closest(".ps-step__back")) go(i - 1);
      });
    });
    root.querySelector(".ps-step form")?.addEventListener("submit", (e) => { e.preventDefault(); close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    addEventListener("resize", () => open && lay(index, 0));
  });

  // When moving to the home page from a window that hasn’t seen the home intro yet, the header name, ＋ and Contact buttons are hidden the instant they’re pressed — the intro raises them again on arrival (original data-home-intro=pending)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || body.classList.contains("is-index") || sessionStorage.getItem("ps-home-ready") === "1") return;
    if (!/(^|\/)index\.html(#.*)?$/.test(a.getAttribute("href") || "")) return;
    document.querySelectorAll(".ps-head [data-intro]").forEach((n) => (n.style.visibility = "hidden"));
  }, true);
  addEventListener("load", () => ScrollTrigger.refresh());
})();
