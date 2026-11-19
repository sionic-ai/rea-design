// Site-wide motion: smooth scroll (Lenis 1.3.26, lerp .1) · header row (logo shrinks, hides on scroll down) · menu drawer · prop parallax and push ·
// Cloud and meadow edge shapes · art set (prop SVGs) · footer wordmark hop speed · subpage cloud parallax.
// Title pop-up, loader, paging, flag, path, card unfold, and SNS ball physics are handled by the _fx Motion parts.
(() => {
  gsap.registerPlugin(ScrollTrigger, ...(window.CustomEase ? [CustomEase] : []));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;

  // The same seed always gives the same shape — so edges don’t change each time it opens
  const seeded = (s) => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);

  /* ---------- Illustration set: props are <svg><use href="#ill-…"></svg> is used as is. Fills: ill-a (base), d (shade), l (light), w, k ---------- */
  const SPRITE = `
<symbol id="ill-sphere" viewBox="0 0 100 100"><circle class="ill-a" cx="50" cy="50" r="48"/><path class="ill-d" d="M88 30a48 48 0 0 1-66 62a44 44 0 0 0 66-62z" opacity=".55"/><ellipse class="ill-l" cx="34" cy="30" rx="15" ry="9" transform="rotate(-32 34 30)" opacity=".8"/><circle class="ill-w" cx="27" cy="26" r="4" opacity=".9"/></symbol>
<symbol id="ill-lego" viewBox="0 0 160 120"><path class="ill-d" d="M8 52 L80 84 L80 116 L8 84Z"/><path class="ill-a" d="M80 84 L152 52 L152 84 L80 116Z"/><path class="ill-l" d="M8 52 L80 20 L152 52 L80 84Z"/><g class="ill-a"><ellipse cx="62" cy="44" rx="13" ry="7"/><ellipse cx="98" cy="44" rx="13" ry="7"/><ellipse cx="62" cy="62" rx="13" ry="7"/><ellipse cx="98" cy="62" rx="13" ry="7"/></g><g class="ill-l"><ellipse cx="62" cy="38" rx="13" ry="7"/><ellipse cx="98" cy="38" rx="13" ry="7"/><ellipse cx="62" cy="56" rx="13" ry="7"/><ellipse cx="98" cy="56" rx="13" ry="7"/></g></symbol>
<symbol id="ill-notes" viewBox="0 0 80 100"><path class="ill-a" d="M24 22 L70 8 L70 72 L62 72 L62 22 L32 31 L32 82 L24 82Z"/><ellipse class="ill-a" cx="18" cy="84" rx="13" ry="10" transform="rotate(-20 18 84)"/><ellipse class="ill-a" cx="56" cy="74" rx="13" ry="10" transform="rotate(-20 56 74)"/></symbol>
<symbol id="ill-quaver" viewBox="0 0 50 80"><path class="ill-a" d="M26 6 L32 6 Q34 20 48 28 Q36 26 32 22 L32 62 L26 62Z"/><ellipse class="ill-a" cx="20" cy="64" rx="13" ry="10" transform="rotate(-20 20 64)"/></symbol>
<symbol id="ill-cloud" viewBox="0 0 200 105"><path class="ill-w" d="M20 100 Q0 100 4 82 Q8 62 32 66 Q30 38 58 36 Q70 6 104 12 Q132 2 146 30 Q176 24 182 52 Q200 58 196 80 Q194 100 172 100Z"/></symbol>
<symbol id="ill-critter" viewBox="0 0 120 140"><path class="ill-y" d="M36 30 L28 6 L48 24Z M84 30 L94 6 L72 24Z"/><ellipse class="ill-a" cx="60" cy="74" rx="52" ry="56"/><ellipse class="ill-l" cx="60" cy="96" rx="30" ry="26" opacity=".7"/><path class="ill-a" d="M10 78 Q-6 60 6 48 Q14 62 20 66Z M110 78 Q126 60 114 48 Q106 62 100 66Z"/><circle class="ill-w" cx="42" cy="58" r="13"/><circle class="ill-w" cx="78" cy="58" r="13"/><circle class="ill-k" cx="45" cy="60" r="6"/><circle class="ill-k" cx="75" cy="60" r="6"/><path class="ill-k" d="M38 82 Q60 104 82 82Z"/><path class="ill-w" d="M46 84 L50 92 L54 85 L60 93 L66 85 L70 92 L74 84Z"/><path class="ill-d" d="M32 128 L42 128 L42 138 L30 138Z M78 128 L88 128 L90 138 L78 138Z"/></symbol>
<symbol id="ill-bunny" viewBox="0 0 120 140"><ellipse class="ill-a" cx="40" cy="26" rx="10" ry="26" transform="rotate(-12 40 26)"/><ellipse class="ill-a" cx="80" cy="26" rx="10" ry="26" transform="rotate(12 80 26)"/><ellipse class="ill-l" cx="40" cy="28" rx="4" ry="16" transform="rotate(-12 40 28)"/><ellipse class="ill-l" cx="80" cy="28" rx="4" ry="16" transform="rotate(12 80 28)"/><ellipse class="ill-a" cx="60" cy="88" rx="44" ry="48"/><circle class="ill-w" cx="46" cy="76" r="9"/><circle class="ill-w" cx="74" cy="76" r="9"/><circle class="ill-k" cx="48" cy="77" r="4"/><circle class="ill-k" cx="72" cy="77" r="4"/><path class="ill-k" d="M52 96 Q60 106 68 96Z"/><ellipse class="ill-l" cx="60" cy="116" rx="22" ry="14" opacity=".7"/></symbol>
<symbol id="ill-trumpet" viewBox="0 0 160 106"><path class="ill-a" d="M6 46 L96 30 L96 70 L6 56Z"/><path class="ill-a" d="M92 16 Q130 22 154 4 L154 100 Q130 80 92 86Z"/><ellipse class="ill-d" cx="150" cy="52" rx="10" ry="46"/><rect class="ill-y" x="30" y="38" width="10" height="26" rx="4"/><rect class="ill-y" x="52" y="35" width="10" height="30" rx="4"/></symbol>
<symbol id="ill-badge" viewBox="0 0 82 85"><path class="ill-a" d="M41 2 L76 14 Q78 56 41 83 Q4 56 6 14Z"/><path class="ill-w" d="M35 24 h12 v12 h12 v12 h-12 v12 h-12 v-12 h-12 v-12 h12Z"/></symbol>
<symbol id="ill-volcano" viewBox="0 0 1000 600"><path class="ill-g" d="M-40 600 Q120 470 300 520 Q500 440 700 520 Q880 470 1040 600Z"/><path class="ill-v" d="M200 600 L430 120 Q503 96 576 120 L820 600Z"/><path class="ill-vd" d="M503 116 Q560 110 576 120 L820 600 L600 600 Q640 380 560 260Z" opacity=".55"/><ellipse class="ill-o" cx="503" cy="122" rx="74" ry="18"/><path class="ill-o" d="M440 124 Q450 190 430 240 Q470 200 478 150 Q490 260 470 330 Q520 260 515 150 Q540 220 560 270 Q556 190 566 124Z"/></symbol>`;
  const sprite = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  sprite.setAttribute("aria-hidden", "true");
  sprite.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  sprite.innerHTML = SPRITE;
  document.body.prepend(sprite);

  /* ---------- Cloud · grass edge: a band of joined round bumps ---------- */
  const edgePath = (kind, seed, w = 1920, h = 276) => {
    const rnd = seeded(seed);
    const cloud = kind === "cloud", base = cloud ? 150 : 120;
    let x = -60, y = base + (rnd() - 0.5) * 30, d = `M-60 ${h} L-60 ${y.toFixed(1)}`;
    while (x < w + 60) {
      const chord = cloud ? 150 + rnd() * 170 : 80 + rnd() * 70, nx = x + chord, ny = base + (rnd() - 0.5) * (cloud ? 60 : 26);
      const r = chord * (cloud ? 0.56 : 0.74);
      d += ` A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${nx.toFixed(1)} ${ny.toFixed(1)}`;
      x = nx; y = ny;
    }
    return `${d} L${(x).toFixed(1)} ${h} Z`;
  };
  document.querySelectorAll(".hl-edge").forEach((edge, i) => {
    const kind = edge.dataset.edge || "cloud";
    edge.innerHTML = `<svg viewBox="0 0 1920 276" preserveAspectRatio="none" aria-hidden="true"><path d="${edgePath(kind, (+edge.dataset.seed || i + 3) * 7919)}"/></svg>`;
  });
  window.hlEdgePath = edgePath;

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ autoRaf: false, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.hlLenis = lenis;
    const hold = () => (root.classList.contains("preloader-open") ? lenis.stop() : lenis.start());
    hold();
    new MutationObserver(hold).observe(root, { attributes: true, attributeFilter: ["class"] });
  }

  /* ---------- Header bar: over 0→420px the logo shrinks to .635x and moves left, hides when scrolled down past 500px and shows again when scrolled up ---------- */
  const top = document.querySelector(".hl-top");
  if (top) {
    const bits = [...top.querySelectorAll(":scope > .hl-brand, :scope > .hl-menu-btn")];
    const brand = top.querySelector(":scope > .hl-brand");
    let lift = 0, hidden = false;
    const setP = gsap.quickSetter(top, "--p");
    const size = () => {
      lift = top.getBoundingClientRect().height + 12;
      if (hidden) gsap.set(bits, { y: -lift });
      if (brand) {
        const t = top.getBoundingClientRect(), pad = parseFloat(getComputedStyle(top).paddingLeft);
        top.style.setProperty("--shift", `${Math.max(brand.getBoundingClientRect().left - t.left - pad, 0)}px`);
      }
    };
    const hide = (on) => { if (on === hidden) return; hidden = on; gsap.to(bits, { y: on ? -lift : 0, duration: on ? 0.7 : 0.95, ease: on ? "power3.in" : "expo.out", overwrite: true }); };
    size();
    const p = { p: 0 };
    gsap.to(p, { p: 1, ease: "power2.inOut", onUpdate: () => setP(p.p), scrollTrigger: { start: 0, end: 420, scrub: reduce ? true : 1.1 } });
    ScrollTrigger.create({ start: 0, end: () => ScrollTrigger.maxScroll(window), onRefresh: size, onUpdate: (st) => hide(!reduce && st.scroll() > 500 && st.direction === 1) });
  }

  /* ---------- Menu Drawer ---------- */
  const btn = document.querySelector(".hl-menu-btn"), menu = document.querySelector(".hl-menu");
  if (btn && menu) {
    const panel = menu.querySelector(".hl-menu-panel"), close = menu.querySelector(".hl-menu-close");
    let open = false, tl = null;
    const q = (s) => [...panel.querySelectorAll(s)];
    const build = () => {
      tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" }, onReverseComplete: () => { menu.hidden = true; } })
        .from(menu, { backgroundColor: "transparent", duration: 0.5, ease: "power2.out" }, 0)
        .from(panel, { "--wipe": "100%", yPercent: -7, duration: 0.9 }, 0)
        .from(q(".hl-menu-close"), { scale: 0, rotate: -135, duration: 0.6, ease: "back.out(2.2)" }, 0.2)
        .from(q(".hl-menu-label"), { yPercent: 130, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.22)
        .from(q(".hl-menu-tiles li"), { yPercent: 45, scale: 0.8, opacity: 0, duration: 0.65, ease: "back.out(2)", stagger: 0.045 }, 0.34)
        .from(q(".hl-menu-link"), { yPercent: 150, duration: 0.75, stagger: 0.06 }, 0.38)
        .from(q(".hl-menu-cta"), { yPercent: 55, scale: 0.9, opacity: 0, duration: 0.65, ease: "back.out(1.9)" }, 0.6)
        .from(q(".hl-menu-cta .hl-arrow"), { scale: 0, rotate: -120, duration: 0.55, ease: "back.out(2.6)" }, 0.72);
    };
    const set = (on) => {
      open = on;
      btn.setAttribute("aria-expanded", String(on));
      root.classList.toggle("menu-open", on);
      menu.style.pointerEvents = on ? "" : "none";
      if (on) { menu.hidden = false; lenis?.stop(); close?.focus(); }
      else { lenis?.start(); btn.focus(); }
      if (reduce) { if (!on) menu.hidden = true; return; }
      if (!tl) build();
      on ? tl.timeScale(1).play() : tl.timeScale(1.85).reverse();
    };
    btn.addEventListener("click", () => set(!open));
    close?.addEventListener("click", () => set(false));
    menu.addEventListener("click", (e) => { if (e.target === menu || e.target.closest("a[href]")) set(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) set(false); });

    // Tile: tilts up to 9° toward the hand with light following, the hovered tile floats up to 1.07x while the rest shrink to .955x and fade to .6
    if (fine && !reduce) {
      const tiles = q(".hl-menu-tile").map((tile) => {
        const art = tile.firstElementChild, cell = tile.parentElement, o = { duration: 0.6, ease: "power3.out" };
        const lean = { x: gsap.quickTo(tile, "rotationY", o), y: gsap.quickTo(tile, "rotationX", o), lx: gsap.quickTo(tile, "--tilt-x", o), ly: gsap.quickTo(tile, "--tilt-y", o), ax: art && gsap.quickTo(art, "x", o), ay: art && gsap.quickTo(art, "y", o) };
        return { tile, art, cell, lean };
      });
      const state = (who) => tiles.forEach((t) => {
        const s = !who ? "rest" : t === who ? "on" : "dim";
        if (s !== "on") { t.lean.x(0); t.lean.y(0); t.lean.lx(0); t.lean.ly(0); t.lean.ax?.(0); t.lean.ay?.(0); }
        t.cell.style.zIndex = s === "on" ? "2" : "";
        const v = s === "on" ? { scale: 1.07, y: -0.11 * t.cell.getBoundingClientRect().height, opacity: 1, "--glow": 1, duration: 0.55, ease: "back.out(2.6)" }
          : s === "dim" ? { scale: 0.955, y: 0, opacity: 0.6, "--glow": 0, duration: 0.5, ease: "power3.out" }
          : { scale: 1, y: 0, opacity: 1, "--glow": 0, duration: 0.9, ease: "elastic.out(1, 0.62)" };
        gsap.to(t.tile, { ...v, overwrite: "auto" });
        if (t.art) gsap.to(t.art, { scale: s === "on" ? 1.11 : 1, duration: v.duration, ease: v.ease, overwrite: "auto" });
      });
      tiles.forEach((t) => {
        t.cell.addEventListener("pointerenter", () => state(t));
        t.cell.addEventListener("pointerleave", () => state(null));
        t.cell.addEventListener("pointermove", (e) => {
          const r = t.cell.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          t.lean.x(2 * x * 9); t.lean.y(-(2 * y * 9)); t.lean.lx(2 * x); t.lean.ly(2 * y); t.lean.ax?.(x * r.height * 0.1); t.lean.ay?.(y * r.height * 0.1);
        });
      });
    }
  }

  /* ---------- Letter-roll link group: on hover the link’s letters roll up one by one (.022s) and a yellow second set rises (.62s expo.out, .5s power3.out on exit),
     That link shifts right by .3× the font size (.6s) and the others fade to .45 (.5s power3.out). Spaces are not rolled ---------- */
  if (!reduce) document.querySelectorAll(".hl-menu-nav, .hl-footer-menus").forEach((group) => {
    const items = [...group.querySelectorAll(".hl-menu-link, .hl-footer-link")].map((link) => {
      const text = link.textContent, wrap = document.createElement("span"), chars = [];
      wrap.className = "roll-in";
      for (const c of text.trim()) {
        if (c === " ") { wrap.append(" "); continue; }
        const roll = document.createElement("span"), inner = document.createElement("span"), a = document.createElement("span"), b = document.createElement("span");
        roll.className = "roll"; a.textContent = c; b.className = "roll-dup"; b.textContent = c; b.setAttribute("aria-hidden", "true");
        inner.append(a, b); roll.append(inner); wrap.append(roll); chars.push(inner);
      }
      link.setAttribute("aria-label", text.trim());
      link.replaceChildren(wrap);
      return { link, wrap, chars };
    });
    const lean = (who) => items.forEach((it) => {
      const on = it === who, fs = parseFloat(getComputedStyle(it.link).fontSize) || 16;
      gsap.to(it.chars, { yPercent: on ? -100 : 0, duration: on ? 0.62 : 0.5, ease: on ? "expo.out" : "power3.out", stagger: 0.022, overwrite: "auto" });
      gsap.to(it.wrap, { x: on ? 0.3 * fs : 0, opacity: !who || on ? 1 : 0.45, duration: on ? 0.6 : 0.5, ease: "power3.out", overwrite: "auto" });
    });
    items.forEach((it) => {
      if (fine) { it.link.addEventListener("pointerenter", () => lean(it)); it.link.addEventListener("pointerleave", () => lean(null)); }
      it.link.addEventListener("focus", () => it.link.matches(":focus-visible") && lean(it));
      it.link.addEventListener("blur", () => lean(null));
    });
  });

  /* ---------- Props: parallax by distance from screen center × --speed, .-push is pushed away when the pointer nears and springs back ---------- */
  document.querySelectorAll(".hl-props").forEach((list) => {
    const props = [...list.querySelectorAll(".hl-prop")].map((el) => ({ el, speed: parseFloat(getComputedStyle(el).getPropertyValue("--speed")) || 0, base: 0 }));
    if (!props.length) return;
    const paint = () => { const mid = scrollY + innerHeight / 2; props.forEach((p) => p.el.style.setProperty("--par-y", reduce ? "0px" : `${((mid - p.base) * p.speed).toFixed(1)}px`)); };
    const measure = () => { const t = list.getBoundingClientRect().top + scrollY; props.forEach((p) => (p.base = t + p.el.offsetTop + p.el.offsetHeight / 2)); paint(); };
    measure();
    addEventListener("scroll", paint, { passive: true });
    new ResizeObserver(measure).observe(root);
    const pushers = props.filter((p) => p.el.classList.contains("-push")).map((p) => ({ el: p.el, x: 0, y: 0, vx: 0, vy: 0 }));
    if (!pushers.length || reduce) return;
    let hand = null, raf = 0;
    const tick = () => {
      let busy = false;
      for (const b of pushers) {
        const r = b.el.getBoundingClientRect(), cx = r.left + r.width / 2 - b.x, cy = r.top + r.height / 2 - b.y, reach = 0.8 * r.width;
        let tx = 0, ty = 0;
        if (hand) {
          const dx = cx - hand.x, dy = cy - hand.y, d = Math.hypot(dx, dy) || 1;
          if (d < reach) { const f = (reach - d) * 0.3; tx = (dx / d) * f; ty = (dy / d) * f; }
          const half = r.width / 2;
          tx = Math.min(Math.max(tx, half - cx), Math.max(root.clientWidth - half - cx, 0));
        }
        b.vx = (b.vx + (tx - b.x) * 0.08) * 0.75; b.vy = (b.vy + (ty - b.y) * 0.08) * 0.75;
        b.x += b.vx; b.y += b.vy;
        if (Math.abs(tx - b.x) > 0.1 || Math.abs(ty - b.y) > 0.1 || Math.abs(b.vx) > 0.1 || Math.abs(b.vy) > 0.1) busy = true;
        else { b.x = tx; b.y = ty; b.vx = b.vy = 0; }
        b.el.style.setProperty("--push-x", `${b.x.toFixed(1)}px`);
        b.el.style.setProperty("--push-y", `${b.y.toFixed(1)}px`);
      }
      raf = busy ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener("pointermove", (e) => { hand = { x: e.clientX, y: e.clientY }; kick(); }, { passive: true });
    root.addEventListener("pointerleave", () => { hand = null; kick(); });
  });

  /* ---------- Subpage header clouds: as you scroll past the header (--p) they spread to the sides, sag and blur ---------- */
  document.querySelectorAll(".hl-page-hero").forEach((hero) => {
    if (reduce) return;
    gsap.to(hero, { "--p": 1, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  });

  /* ---------- Footer wordmark: the faster you scroll down, the hopping tempo speeds up to at most 2.4x, then returns to 1.6/s ---------- */
  const word = document.querySelector(".hl-footer-word");
  if (word && !reduce) {
    let anims = [], rate = 1, want = 1, lastY = scrollY, lastT = 0, raf = 0, prev = 0, seen = false;
    const apply = () => { if (!anims.length) anims = word.getAnimations({ subtree: true }); anims.forEach((a) => (a.playbackRate = rate)); };
    const step = (now) => {
      raf = 0;
      const dt = Math.min((now - prev) / 1000, 1 / 15); prev = now;
      want = now - lastT > 140 ? 1 : want + (1 - want) * (1 - Math.exp(-1.6 * dt));
      rate += (want - rate) * (1 - Math.exp(-7 * dt));
      apply();
      if (want === 1 && Math.abs(rate - 1) < 0.015) { rate = 1; apply(); return; }
      raf = requestAnimationFrame(step);
    };
    const go = () => { if (!raf && seen) { prev = performance.now(); raf = requestAnimationFrame(step); } };
    addEventListener("scroll", () => {
      const now = performance.now(), dy = Math.abs(scrollY - lastY), dt = (now - lastT) / 1000, first = !lastT;
      lastY = scrollY; lastT = now;
      if (first || dt <= 0 || dt > 0.5) return;
      want = Math.max(want, 1 + 1.4 * Math.min(1, dy / dt / 3800));
      go();
    }, { passive: true });
    new IntersectionObserver((es) => { seen = es.some((e) => e.isIntersecting); if (seen) go(); else { cancelAnimationFrame(raf); raf = 0; rate = want = 1; apply(); } }).observe(word);
  }


  /* ---------- Event card: rises from 46px below (.7s power3.out, .12 stagger) and the white body slides up from 100% below over 1.15s expo.out. On hover the body floats up by .9% of screen width ---------- */
  if (!reduce) gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".hl-events-cards").forEach((deck) => {
      const cards = gsap.utils.toArray(deck.querySelectorAll(".hl-event"));
      const bodies = cards.map((c) => c.querySelector(".hl-event-body"));
      gsap.set(cards, { y: 46, autoAlpha: 0 });
      gsap.set(bodies, { yPercent: 100 });
      gsap.timeline({ scrollTrigger: { trigger: deck, start: "top 82%", once: true } })
        .to(cards, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out", stagger: 0.12 })
        .to(bodies, { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: 0.12 }, 0.28);
      if (matchMedia("(hover: hover)").matches) cards.forEach((c, i) => {
        const lift = (on) => gsap.to(bodies[i], { y: on ? -(0.009 * innerWidth) : 0, duration: on ? 0.5 : 0.65, ease: on ? "power3.out" : "power2.out", overwrite: "auto" });
        c.addEventListener("pointerenter", () => lift(true));
        c.addEventListener("pointerleave", () => lift(false));
      });
    });
  });

  // If the font arrives late, the height changes, so measure once more
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
