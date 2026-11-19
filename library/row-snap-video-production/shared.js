/* Motion shared by all pages. Page transition uses swup 4.9.2 (same build as the original · head / body-class / preload plugins), so only the body (#swup) is swapped — 
   So the motion for each page is also split here into ”attach → detach”: hero line breaks · detail stage · gallery · card hover · About slider · contact button expand.
   Original values are noted per function. */
(() => {
  const html = document.documentElement;
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger);

  /* Smooth scroll: Lenis 1.3.23 · duration 1.1 */
  let lenis = null;
  if (window.Lenis && !reduce()) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const stopLenis = () => lenis && lenis.stop(), startLenis = () => lenis && lenis.start();

  /* ───────── Text wave: put the letters in a mask cell and delay each one by its distance from the chunk center ───────── */
  function splitLine(el, inners) {
    const frag = document.createDocumentFragment();
    el.textContent.split(/(\s+)/).forEach((tok) => {
      if (tok === "") return;
      if (/^\s+$/.test(tok)) { frag.append(document.createTextNode(tok)); return; }
      const word = document.createElement("span");
      word.className = "e-w";
      [...tok].forEach((ch) => {
        const mask = document.createElement("span"), inner = document.createElement("span");
        mask.className = "e-ch"; inner.textContent = ch;
        mask.append(inner); word.append(mask); inners.push(inner);
      });
      frag.append(word);
    });
    el.textContent = "";
    el.append(frag);
  }
  function waveStagger(inners, spread = 0.4) {
    const pts = inners.map((c) => { const r = c.parentElement.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const d = pts.map(([x, y]) => Math.hypot(x - cx, y - cy)), max = Math.max(...d) || 1;
    return (i) => (d[i] / max) * spread;
  }

  /* ───────── Carrying the video to the next page (Hero → Detail): 1s power3.out, the inner window margin (clip) releases until it reaches the stage size ───────── */
  let hero = null, heroCaption = null;
  function beginHero(video) {
    if (!video) { hero = null; return; }
    const pane = video.parentElement, from = video.getBoundingClientRect(), win = pane.getBoundingClientRect();
    const ratio = parseFloat(getComputedStyle(pane).getPropertyValue("--inset")) || 0.19;
    const ix = win.width * ratio, iy = win.height * ratio, dx = from.left - win.left, dy = from.top - win.top;
    const clipAt = (k) => `inset(${(iy - dy) * k}px ${(ix + dx) * k}px ${(iy + dy) * k}px ${(ix - dx) * k}px)`;
    let layer = $(".e-hero");
    if (!layer) { layer = document.createElement("div"); layer.className = "e-hero"; layer.setAttribute("aria-hidden", "true"); document.body.append(layer); }
    layer.append(video);
    gsap.set(video, { position: "fixed", margin: 0, right: "auto", bottom: "auto", left: from.left, top: from.top, width: from.width, height: from.height, objectFit: "cover", clipPath: clipAt(1), zIndex: 10000, x: 0, y: 0, scale: 1 });
    const p = video.play(); if (p) p.catch(() => {});
    // Caption is carried along too
    const parts = [$(".hw__title"), $(".hw__meta")].filter((el) => el && el.textContent.trim());
    if (parts.length) {
      const shots = parts.map((el) => ({ el, r: el.getBoundingClientRect(), color: getComputedStyle(el).color }));
      const box = document.createElement("div");
      layer.append(box);
      shots.forEach((s) => { box.append(s.el); gsap.set(s.el, { position: "fixed", margin: 0, left: s.r.left, top: s.r.top, width: s.r.width, textAlign: "center", color: s.color, zIndex: 10001 }); });
      heroCaption = box;
    }
    hero = { video, clipAt };
  }
  const heroEnter = () => new Promise((resolve) => {
    gsap.set("#swup", { opacity: 0 });
    const target = $(".ws__media");
    const finish = () => {
      const v = hero && hero.video;
      if (v && target) { const real = $("video", target); target.append(v); if (real && real !== v) real.remove(); v.className = ""; gsap.set(v, { clearProps: "all" }); gsap.set(target, { opacity: 1 }); }
      else if (v) v.remove();
      if (heroCaption) { const el = heroCaption; heroCaption = null; gsap.to(el, { opacity: 0, duration: 0.3, ease: "power2.out", onComplete: () => el.remove() }); }
      gsap.set("#swup", { opacity: 1 });
      hero = null;
      resolve();
    };
    if (!target) { gsap.set("#swup", { opacity: 1 }); finish(); return; }
    gsap.set(target, { opacity: 0 });
    const to = target.getBoundingClientRect(), tl = gsap.timeline({ onComplete: finish }), v = hero.video, clipAt = hero.clipAt, clip = { k: 1 };
    tl.to("#swup", { opacity: 1, duration: 1, ease: "power2.out" }, 0);
    tl.to(v, { left: to.left, top: to.top, width: to.width, height: to.height, duration: 1, ease: "power3.out" }, 0.3);
    tl.to(clip, { k: 0, duration: 1, ease: "power3.out", onUpdate: () => { v.style.clipPath = clipAt(clip.k); } }, "<");
  });

  /* ───────── Loader: letter wave (.6s power2.out, spread .4) → hold .6s → curtain lifts .6s + preview rises from 300px below in 1s power3.out ───────── */
  function revealPreview() {
    const preview = $(".hw__preview");
    if (!preview || reduce()) return;
    dispatchEvent(new Event("works:reveal"));
    gsap.fromTo(preview, { xPercent: -50, yPercent: -50, y: 300, opacity: 0 }, { xPercent: -50, yPercent: -50, y: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "transform,opacity" });
  }
  function initial() {
    const inner = $(".e-load__in"), finish = () => html.classList.add("is-ready");
    if (!inner) { finish(); return; }
    const chars = [];
    $$(".e-load__line", inner).forEach((l) => splitLine(l, chars));
    if (!reduce() && chars.length) gsap.set(chars, { yPercent: 110 });
    inner.classList.add("is-shown");
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
      const tl = gsap.timeline({ onComplete: finish });
      if (!reduce() && chars.length) {
        tl.to(chars, { yPercent: 0, duration: 0.6, ease: "power2.out", stagger: waveStagger(chars, 0.4) }, 0.25);
        tl.to({}, { duration: 0.6 });
      }
      tl.to(".e-load", { opacity: 0, duration: 0.6, ease: "power2.out" });
      tl.add(revealPreview, "<");
    });
  }

  /* ───────── Hero: line-by-line paging ─────────
     Original values: line 23px · follow .09 · wheel: discard under 4 · 120ms between gestures · 200ms per line · discard when strength within an 80ms window falls below .9 of the previous (inertia)
     · Video window spacing -.2 (phone .25) · parallax = min(step × .2, gap × .55) · inner parallax exponent 1.8 · caption exit .28s power2.in (spread .18) / enter .4s power3.out (spread .4) · at first it slides in from the fourth row to the first. */
  function initWorksScroll(onOpen) {
    const list = $(".hw__list");
    if (!list) return () => {};
    const rows = $$(".hw-row", list), preview = $(".hw__preview"), caption = $(".hw__caption"), capTitle = $(".hw__title"), capMeta = $(".hw__meta"), more = $(".hw__more");
    const rm = reduce(), esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const W = rows.map((li) => ({ ...li.dataset }));
    const ROW_H = parseInt(getComputedStyle(html).getPropertyValue("--site-row-h"), 10) || 23;
    const CENTER = (parseFloat(getComputedStyle(html).getPropertyValue("--site-center")) || 50) / 100;
    const PC = matchMedia("(min-width: 48rem)").matches, GAP_R = PC ? -0.2 : 0.25, GAP_USE = PC ? 0.55 : 0.22;
    const track = document.createElement("div");
    track.className = "hw__track";
    preview.append(track);
    W.forEach((w, i) => {
      rows[i].innerHTML = `<span class="hw-row__num">${String(i + 1).padStart(2, "0")}</span><span>${esc(w.title)} - ${esc(w.brand)}</span><span>${esc(w.client)}</span><span>${esc(w.cat)}</span><span class="hw-row__year">${esc(w.year)}</span>`;
      rows[i].addEventListener("click", () => { if (i === active) open(i); });
      const m = document.createElement("div");
      m.className = "hw-media";
      m.dataset.index = i;
      m.style.top = `calc(${i} * (100% + ${GAP_R * 100}%))`;
      m.innerHTML = `<div class="hw-pane"><video class="hw-pan" muted loop playsinline preload="none" aria-label="Work video slot · ${esc(w.label)} · Landscape 16:9 · 8s loop"></video></div>`;
      track.append(m);
    });
    const media = [...track.children], panes = media.map((m) => m.firstElementChild), videos = media.map((m) => $("video", m));
    const MAX = (W.length - 1) * ROW_H, EASE = rm ? 1 : 0.09, clamp = (v) => Math.max(0, Math.min(MAX, v));
    let current = Math.min(3, W.length - 1) * ROW_H, target = rm ? 0 : current, active = -1, capTween = null, raf = 0, entering = true, revealed = rm;
    const onReveal = () => { target = 0; revealed = true; };
    addEventListener("works:reveal", onReveal);
    if (html.classList.contains("is-ready")) onReveal(); // No loader when arriving from another page
    let lastT = -Infinity, lastStep = -Infinity, winT = -Infinity, winAbs = 0, prevAbs = 0;
    const onWheel = (e) => {
      const abs = Math.abs(e.deltaY), now = e.timeStamp, gap = now - lastT;
      lastT = now;
      if (abs < 4) return;
      if (now - winT >= 80) { prevAbs = winAbs; winAbs = abs; winT = now; } else if (abs > winAbs) winAbs = abs;
      if (!(gap > 120) && !(abs > prevAbs * 0.9)) return;
      if (now - lastStep < 200) return;
      lastStep = now;
      target = clamp(Math.round(target / ROW_H) * ROW_H + (e.deltaY > 0 ? 1 : -1) * ROW_H);
    };
    let ty0 = null, tyLast = null, t0 = 0;
    const onTS = (e) => { if (e.touches.length > 1) { ty0 = null; return; } ty0 = tyLast = e.touches[0].clientY; t0 = clamp(Math.round(target / ROW_H) * ROW_H); };
    const onTM = (e) => {
      if (ty0 === null) return;
      tyLast = e.touches[0].clientY;
      const dy = ty0 - tyLast;
      if (Math.abs(dy) <= 6) { target = clamp(t0); return; }
      target = clamp(t0 + Math.max(-ROW_H, Math.min(ROW_H, (dy - Math.sign(dy) * 6) * 0.5)));
    };
    const onTE = () => { if (ty0 === null) return; const dy = ty0 - (tyLast ?? ty0); target = clamp(t0 + (dy > 16 ? 1 : dy < -16 ? -1 : 0) * ROW_H); ty0 = tyLast = null; };
    const onKey = (e) => {
      if (e.key === "ArrowDown") { target = clamp(Math.round(target / ROW_H) * ROW_H + ROW_H); e.preventDefault(); }
      if (e.key === "ArrowUp") { target = clamp(Math.round(target / ROW_H) * ROW_H - ROW_H); e.preventDefault(); }
      if (e.key === "Enter" && active >= 0) open(active);
    };
    addEventListener("wheel", onWheel, { passive: true });
    addEventListener("touchstart", onTS, { passive: true });
    addEventListener("touchmove", onTM, { passive: true });
    addEventListener("touchend", onTE);
    addEventListener("keydown", onKey);
    const pc = matchMedia("(min-width: 64rem)");
    const onMore = (e) => { e.preventDefault(); if (active >= 0) open(active); };
    const onPreview = (e) => { if (!pc.matches || active < 0) return; const m = e.target.closest(".hw-media"); if (m && +m.dataset.index === active) open(active); };
    const onCaption = (e) => { if (pc.matches && active >= 0 && !e.target.closest("a")) open(active); };
    more.addEventListener("click", onMore);
    preview.addEventListener("click", onPreview);
    caption.addEventListener("click", onCaption);
    function render(i) {
      const w = W[i], lines = [w.title];
      if (w.client) lines.push(w.brand);
      capTitle.innerHTML = lines.filter((l) => l.trim()).map((l) => `<span class="hw__line">${esc(l)}</span>`).join("");
      const meta = [w.client, w.cat].filter(Boolean).join("  /  ");
      capMeta.innerHTML = meta ? `<span class="hw__line">${esc(meta)}</span>` : "";
    }
    function enterCaption(i) {
      render(i);
      const inners = [];
      $$(".hw__line", caption).forEach((l) => splitLine(l, inners));
      if (!inners.length) return;
      gsap.set(inners, { yPercent: 110 });
      capTween = gsap.to(inners, { yPercent: 0, duration: 0.4, ease: "power3.out", stagger: waveStagger(inners, 0.4) });
    }
    function setActive(i) {
      if (i === active) return;
      active = i;
      rows.forEach((r, k) => r.classList.toggle("is-active", k === i));
      media.forEach((m, k) => m.classList.toggle("is-active", k === i));
      more.href = W[i].href || "";
      if (entering) return;
      if (capTween) capTween.kill();
      if (rm) { render(i); return; }
      const old = $$(".e-ch > span", caption);
      if (!old.length) { enterCaption(i); return; }
      capTween = gsap.to(old, { yPercent: -110, duration: 0.28, ease: "power2.in", stagger: waveStagger(old, 0.18), onComplete: () => enterCaption(i) });
    }
    function manage(k, near, center) {
      const v = videos[k];
      if (near && !v.dataset.loaded) { v.src = W[k].video; v.dataset.loaded = "1"; }
      if (center && !rm) { if (v.paused) { const p = v.play(); if (p) p.catch(() => {}); } } else if (!v.paused) v.pause();
    }
    let prev = null, dirty = true, paraAmp = 0, innerAmp = 0;
    const onResize = () => { dirty = true; };
    addEventListener("resize", onResize, { passive: true });
    function measure() {
      const winH = preview.clientHeight;
      if (rm || !winH) { paraAmp = innerAmp = 0; if (!winH) dirty = true; return; }
      const step = winH * (1 + GAP_R), videoH = panes[0].offsetHeight, inset = parseFloat(getComputedStyle(panes[0]).getPropertyValue("--inset")) || 0.05;
      paraAmp = Math.max(0, Math.min(step * 0.2, (step - videoH * (1 - inset * 2)) * GAP_USE));
      innerAmp = videoH * inset;
    }
    const opacityFor = (d) => (d <= 1 ? 1 - 0.2 * d : d <= 2 ? 0.8 - 0.3 * (d - 1) : d <= 3 ? 0.5 - 0.3 * (d - 2) : Math.max(0.1, 0.2 - 0.1 * (d - 3)));
    function tick() {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.05) current = target;
      if (entering && revealed && current === target) { entering = false; const at = Math.round(clamp(current) / ROW_H); if (rm) render(at); else enterCaption(at); }
      if (dirty || current !== prev) {
        if (dirty) { dirty = false; measure(); }
        prev = current;
        list.style.transform = `translate3d(0,${innerHeight * CENTER - ROW_H / 2 - current}px,0)`;
        if (PC) rows.forEach((r, k) => { r.style.opacity = opacityFor(Math.abs(k * ROW_H - current) / ROW_H); });
        const p = current / ROW_H, step = preview.clientHeight * (1 + GAP_R);
        track.style.transform = `translate3d(0,${-p * step}px,0)`;
        media.forEach((m, k) => {
          const d = k - p, dc = Math.max(-1, Math.min(1, d));
          m.style.transform = `translate3d(0,${-dc * paraAmp}px,0)`;
          const iy = Math.round(-Math.sign(dc) * Math.abs(dc) ** 1.8 * innerAmp);
          videos[k].style.transform = iy ? `translate3d(0,${iy}px,0)` : "none";
          manage(k, Math.abs(d) <= 1, Math.abs(d) < 0.5);
        });
        setActive(Math.round(clamp(current) / ROW_H));
      }
      raf = requestAnimationFrame(tick);
    }
    function open(i) {
      if (!W[i].href) return;
      cancelAnimationFrame(raf); raf = 0;
      onOpen(W[i].href, videos[i]);
    }
    setActive(Math.round(clamp(current) / ROW_H));
    tick();
    return () => {
      cancelAnimationFrame(raf);
      if (capTween) capTween.kill();
      removeEventListener("wheel", onWheel); removeEventListener("touchstart", onTS); removeEventListener("touchmove", onTM); removeEventListener("touchend", onTE);
      removeEventListener("keydown", onKey); removeEventListener("works:reveal", onReveal); removeEventListener("resize", onResize);
      videos.forEach((v) => { if (track.contains(v) && !v.paused) v.pause(); });
    };
  }

  /* ───────── Detail stage: full screen → 78% frame (1.2s power3.inOut), scroll locked meanwhile. Title wave out .45s (spread .25) / in .5s (spread .4) ───────── */
  function initSingle() {
    const stage = $(".ws__stage"), overlay = $(".ws__overlay");
    if (!stage) return () => {};
    const video = $("video", stage);
    if (video) { if (!video.src && video.dataset.src) video.src = video.dataset.src; video.muted = true; const p = video.play(); if (p) p.catch(() => {}); }
    const rm = reduce(), ratio = () => (matchMedia("(min-width: 48rem)").matches ? 1106 / 623 : 296 / 494), wrapper = stage.closest(".ws__stagewrap"), body = $(".ws__body");
    const state = { p: 0 };
    const insets = (p) => { const W = innerWidth, H = innerHeight, bw = Math.min(W, H * ratio()) * 0.78, bh = Math.min(H, W / ratio()) * 0.78; return { x: ((W - bw) / 2) * p, y: ((H - bh) / 2) * p }; };
    let lastClip = "";
    const bodyClip = () => { // Credits are visible only inside the frame
      if (!body) return;
      const { x, y } = insets(state.p), r = body.getBoundingClientRect();
      const next = `inset(${(y - r.top).toFixed(1)}px ${(r.right - (innerWidth - x)).toFixed(1)}px ${(r.bottom - (innerHeight - y)).toFixed(1)}px ${(x - r.left).toFixed(1)}px)`;
      if (next !== lastClip) { lastClip = next; body.style.clipPath = next; }
    };
    const apply = (p) => { const { x, y } = insets(p); stage.style.clipPath = `inset(${y}px ${x}px)`; bodyClip(); };
    apply(0);
    gsap.ticker.add(bodyClip);
    const title = $(".ws__title"), inners = [];
    if (heroCaption) { if (title) title.remove(); } // The caption carried over from the hero sits in the title spot
    else if (title) $$(".hw__line", title).forEach((l) => splitLine(l, inners));
    let capTween = null, hidden = false;
    const hide = (now) => {
      if (!inners.length || hidden) return;
      hidden = true;
      if (capTween) capTween.kill();
      if (now) gsap.set(inners, { yPercent: -140 });
      else capTween = gsap.to(inners, { yPercent: -140, duration: rm ? 0.001 : 0.45, ease: "power2.in", stagger: rm ? 0 : waveStagger(inners, 0.25) });
    };
    const show = () => {
      if (!inners.length || !hidden) return;
      hidden = false;
      if (capTween) capTween.kill();
      capTween = gsap.fromTo(inners, { yPercent: 140 }, { yPercent: 0, duration: rm ? 0.001 : 0.5, ease: "power3.out", stagger: rm ? 0 : waveStagger(inners, 0.4) });
    };
    let locked = false;
    const DOWN = new Set([" ", "ArrowDown", "PageDown", "End"]), UP = new Set(["ArrowUp", "PageUp", "Home"]);
    const onWheel = (e) => { if (e.cancelable) e.preventDefault(); if (e.deltaY > 0) play(); };
    let ty = 0;
    const onTS = (e) => { ty = e.touches[0] ? e.touches[0].clientY : 0; };
    const onTM = (e) => { if (e.cancelable) e.preventDefault(); if (ty - (e.touches[0] ? e.touches[0].clientY : ty) > 6) play(); };
    const onKey = (e) => { const d = DOWN.has(e.key); if (!d && !UP.has(e.key)) return; e.preventDefault(); if (d) play(); };
    const lock = () => { if (locked) return; locked = true; stopLenis(); addEventListener("wheel", onWheel, { passive: false }); addEventListener("touchstart", onTS, { passive: true }); addEventListener("touchmove", onTM, { passive: false }); addEventListener("keydown", onKey); };
    const unlock = () => { if (!locked) return; locked = false; removeEventListener("wheel", onWheel); removeEventListener("touchstart", onTS); removeEventListener("touchmove", onTM); removeEventListener("keydown", onKey); startLenis(); };
    const intro = gsap.to(state, { p: 1, duration: rm ? 0.001 : 1.2, ease: "power3.inOut", paused: true, onUpdate: () => apply(state.p), onComplete: unlock });
    function play() { if (intro.progress() === 1 && !intro.reversed()) { unlock(); return; } lock(); intro.play(); hide(); }
    function rewind() { lock(); scrollTo(0, 0); intro.reverse(); show(); }
    let armed = false;
    const onScroll = () => {
      if (locked) { if (scrollY > 2) { scrollTo(0, 0); play(); } return; }
      if (!armed) { armed = scrollY > 40; return; }
      if (scrollY <= 2) { armed = false; rewind(); }
    };
    addEventListener("scroll", onScroll, { passive: true });
    if (scrollY > 2) { intro.progress(1); hide(true); armed = scrollY > 40; } else lock();
    const onResize = () => apply(state.p);
    addEventListener("resize", onResize);
    const credits = $(".ws__credits");
    const ov = overlay && gsap.to(overlay, { opacity: 0.5, scrollTrigger: credits ? { trigger: credits, start: "top bottom", end: "top 60%", scrub: true } : { trigger: stage, start: "top top", end: "bottom top", scrub: true } });

    // Right progress bar
    const content = $(".ws__content"), bar = document.createElement("div"), thumb = document.createElement("i");
    bar.className = "ws-progress"; bar.setAttribute("aria-hidden", "true"); bar.append(thumb); document.body.append(bar);
    gsap.set(bar, { autoAlpha: 0 });
    const upd = (p) => gsap.set(thumb, { y: Math.max(0, bar.clientHeight - thumb.offsetHeight) * p });
    const st = ScrollTrigger.create({ trigger: content, start: "top top", end: "bottom bottom", invalidateOnRefresh: true, onUpdate: (s) => upd(s.progress), onToggle: (s) => gsap.to(bar, { autoAlpha: s.isActive ? 1 : 0, duration: 0.3, ease: "power2.out" }) });

    // Cursor tag on the stage: follows with .8s power3 and is visible only below the header
    let offCursor = () => {};
    if (matchMedia("(hover: hover)").matches && wrapper) {
      const cur = document.createElement("div");
      cur.className = "ws-cursor"; cur.setAttribute("aria-hidden", "true"); cur.textContent = "Play Video";
      document.body.append(cur);
      gsap.set(cur, { xPercent: -40, yPercent: -40, autoAlpha: 0 });
      const mx = gsap.quickTo(cur, "x", { duration: 0.8, ease: "power3" }), my = gsap.quickTo(cur, "y", { duration: 0.8, ease: "power3" });
      let shown = false;
      const set = (on) => { if (on === shown) return; shown = on; gsap.to(cur, { autoAlpha: on ? 1 : 0, duration: on ? 0.25 : 0.2, ease: "power2.out" }); };
      const mv = (e) => { mx(e.clientX); my(e.clientY); set(scrollY < innerHeight && e.clientY > 96); };
      const lv = () => set(false);
      wrapper.addEventListener("mousemove", mv); wrapper.addEventListener("mouseleave", lv);
      offCursor = () => { wrapper.removeEventListener("mousemove", mv); wrapper.removeEventListener("mouseleave", lv); cur.remove(); };
    }

    // Two gallery rows: move in opposite directions by 20% of half the row width on scroll
    const tweens = rm ? [] : $$(".ws-marquee").map((mq) => {
      const tr = $(".ws-marquee__track", mq), ltr = mq.classList.contains("is-ltr"), dist = () => tr.scrollWidth / 2;
      return gsap.fromTo(tr, { x: () => (ltr ? -dist() * 0.2 : 0) }, { x: () => (ltr ? 0 : -dist() * 0.2), ease: "none", scrollTrigger: { trigger: mq.closest(".ws-gallery"), start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
    return () => {
      intro.kill(); if (capTween) capTween.kill(); gsap.ticker.remove(bodyClip);
      if (ov) { ov.scrollTrigger && ov.scrollTrigger.kill(); ov.kill(); }
      st.kill(); bar.remove(); offCursor();
      tweens.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); });
      removeEventListener("resize", onResize); removeEventListener("scroll", onScroll);
      unlock();
    };
  }

  /* ───────── Card hover: a video floats over the thumbnail and plays, resets to the start on release ───────── */
  function initCards() {
    if (!matchMedia("(hover: hover)").matches) return () => {};
    const offs = $$(".e-card").map((card) => {
      const v = $("video", card);
      if (!v) return () => {};
      const on = () => { if (!v.src && v.dataset.src) v.src = v.dataset.src; v.classList.add("is-active"); const p = v.play(); if (p) p.catch(() => {}); };
      const off = () => { v.classList.remove("is-active"); v.pause(); try { v.currentTime = 0; } catch (e) {} };
      card.addEventListener("mouseenter", on); card.addEventListener("mouseleave", off);
      return () => { card.removeEventListener("mouseenter", on); card.removeEventListener("mouseleave", off); };
    });
    return () => offs.forEach((f) => f());
  }
  /* Branch row: in the original each branch has its own URL — here it filters within a single page */
  function initFilter() {
    const tabs = $$(".wa__tab"), items = $$(".wa__list article");
    const pick = (e) => {
      e.preventDefault();
      const t = e.currentTarget, f = t.dataset.filter;
      tabs.forEach((x) => x.classList.toggle("is-current", x === t));
      items.forEach((a) => { a.hidden = !!f && a.dataset.cat !== f; });
      ScrollTrigger.refresh();
    };
    tabs.forEach((t) => t.addEventListener("click", pick));
    return () => tabs.forEach((t) => t.removeEventListener("click", pick));
  }

  /* ───────── About slider: swiper 12.2 — centered 1.2 / 1.6 / 1.8 slides · loop · 700ms · 4s autoplay (starts when 75% of the screen is in view) ───────── */
  function initAbout() {
    const root = $(".ab-slider__view");
    if (!root || !window.Swiper) return () => {};
    const section = root.closest(".ab-slider"), dots = $$(".ab-dot", section), n = dots.length, rm = reduce();
    const setDot = (i) => dots.forEach((d, k) => { d.classList.toggle("is-active", k === i % n); if (k !== i % n) d.firstElementChild.style.transform = "scaleX(0)"; });
    const swiper = new Swiper(root, {
      centeredSlides: true, loop: true, slidesPerView: 1.2, spaceBetween: 12, speed: 700, grabCursor: true,
      autoplay: rm ? false : { delay: 4000, disableOnInteraction: false },
      breakpoints: { 768: { slidesPerView: 1.6, spaceBetween: 20 }, 1024: { slidesPerView: 1.8, spaceBetween: 24 } },
      on: { init: (s) => setDot(s.realIndex), slideChange: (s) => setDot(s.realIndex), autoplayTimeLeft: (s, t, progress) => { const b = dots[s.realIndex % n]; if (b) b.firstElementChild.style.transform = `scaleX(${1 - progress})`; } },
    });
    if (swiper.autoplay) swiper.autoplay.stop();
    dots.forEach((d, i) => { d.firstElementChild.style.transform = "scaleX(0)"; d.addEventListener("click", () => swiper.slideToLoop(i)); });
    const st = ScrollTrigger.create({ trigger: section, start: "top 75%", once: true, onEnter: () => { if (swiper.destroyed) return; swiper.slideToLoop(0, 0); setDot(0); if (!rm && swiper.autoplay) swiper.autoplay.start(); } });
    return () => { st.kill(); swiper.destroy(true, true); };
  }
  /* Parallax: About hero photo -20% → 0 (scrub) · photo behind company card 20% down (scrub 1) */
  function initParallax() {
    const made = [];
    const img = $(".ab-hero__img > *");
    if (img) made.push(gsap.fromTo(img, { yPercent: -20 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".ab-hero", start: "top top", end: "bottom top", scrub: true } }));
    const bg = $("[data-parallax]");
    if (bg) made.push(gsap.to(bg, { y: matchMedia("(min-width: 48rem)").matches ? "20%" : "10%", scrollTrigger: { trigger: bg, start: "top bottom", end: "bottom top", scrub: 1 } }));
    // While the light-panel range (Client logos to View work) passes under the header, flip the header text and background
    const light = $("[data-light]");
    const st = light && ScrollTrigger.create({ trigger: light, start: "top 40px", end: "bottom 40px", onToggle: (self) => document.body.classList.toggle("is-light", self.isActive) });
    return () => { made.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); }); if (st) { st.kill(); document.body.classList.remove("is-light"); } };
  }
  /* Contact button: unfolds into a notice text box 150px before the page end (.5s power2.out → text .3s) / folds back (.2s → .4s power2.in) */
  function initContactReveal() {
    const foot = $(".e-foot"), text = $(".e-contact__text"), inner = text && text.firstElementChild;
    if (!text || !matchMedia("(min-width: 48rem)").matches) return () => {};
    gsap.set(text, { width: 0, height: 0, opacity: 1 });
    gsap.set(inner, { opacity: 0 });
    const clear = () => gsap.set([text, inner], { clearProps: "all" });
    if (getComputedStyle(foot).position === "fixed") return clear;
    let tl;
    const run = (open) => {
      if (tl) tl.kill();
      tl = gsap.timeline();
      if (open) tl.to(text, { width: "auto", height: "auto", duration: 0.5, ease: "power2.out" }).to(inner, { opacity: 1, duration: 0.3, ease: "power1.out" }, ">-0.1");
      else tl.to(inner, { opacity: 0, duration: 0.2, ease: "power1.in" }).to(text, { width: 0, height: 0, duration: 0.4, ease: "power2.in" }, ">-0.05");
    };
    const st = ScrollTrigger.create({ trigger: "#swup", start: "bottom bottom+=150", onEnter: () => run(true), onLeaveBack: () => run(false) });
    return () => { if (tl) tl.kill(); st.kill(); clear(); };
  }

  /* ───────── Drawer (phone menu) ───────── */
  const burger = $(".e-burger");
  burger.addEventListener("click", () => { const on = html.classList.toggle("is-open"); burger.setAttribute("aria-expanded", String(on)); });
  const closeDrawer = () => { html.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); };
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  /* ───────── Attach · detach per page ───────── */
  let offs = [], heroFading = false, swup = null;
  function pageInit() {
    offs.forEach((f) => f());
    offs = [];
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    const home = !!$(".hw__list");
    if (home) stopLenis(); else startLenis();
    offs.push(initCards(), initSingle(), initFilter(), initAbout(), initContactReveal(), initParallax());
    offs.push(initWorksScroll((url, video) => {
      heroFading = true;
      document.body.classList.add("is-fade");
      if (swup && location.protocol !== "file:") { beginHero(video); swup.navigate(url); } else location.href = url;
    }));
    $(".e-foot").classList.toggle("is-light", !!$('#swup [data-footer="light"]'));
    $(".e-contact").classList.toggle("is-hidden", !!$("#swup #mailform"));
    const form = $("#mailform");
    if (form) form.addEventListener("submit", (e) => e.preventDefault());
    ScrollTrigger.refresh();
  }
  /* Transition: leaving #swup .3s fade / entering .4s — when carrying the video over, heroEnter */
  const leave = () => (hero ? Promise.resolve() : new Promise((r) => gsap.to("#swup", { opacity: 0, duration: 0.3, onComplete: r })));
  const enter = () => (hero ? heroEnter() : new Promise((r) => { revealPreview(); gsap.fromTo("#swup", { opacity: 0 }, { opacity: 1, duration: 0.4, onComplete: r }); }));
  if (window.Swup && location.protocol !== "file:") {
    swup = new Swup({
      containers: ["#swup"], animationSelector: false,
      ignoreVisit: (url, { el } = {}) => !!(el && el.closest("[data-no-swup]")),
      plugins: [new SwupHeadPlugin({ persistTags: "[data-swup-persist]", awaitAssets: true }), new SwupBodyClassPlugin(), new SwupPreloadPlugin({ preloadVisibleLinks: false })],
    });
    swup.hooks.on("visit:start", () => $$("#swup video").forEach((v) => { v.pause(); v.removeAttribute("src"); delete v.dataset.loaded; v.load(); }));
    swup.hooks.replace("animation:out:await", async () => { await leave(); });
    swup.hooks.replace("animation:in:await", async () => { await enter(); });
    swup.hooks.on("page:view", pageInit);
    swup.hooks.on("content:replace", () => { if (heroFading) document.body.classList.add("is-fade"); });
    swup.hooks.on("visit:end", () => { closeDrawer(); if (heroFading) { heroFading = false; document.body.classList.remove("is-fade"); } });
  }
  document.addEventListener("click", (e) => { const a = e.target.closest('a[href="#"]'); if (a) e.preventDefault(); });
  pageInit();
  initial();
})();
