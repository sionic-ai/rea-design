// Motion unique to the hero page — swapping the background video above underlined words, clouds popping out of the service band, Work background color steps,
// Two rows of logos flowing in opposite directions (1.07× near the cursor), review swipe (original hand gesture as is: 380~750ms, quintic deceleration, flick-through .35).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Hover an underlined word and the video fades out over .25s then back on with that word’s video — leave the text and it returns to the first video
  const video = document.querySelector(".ix-intro__video"), lead = document.querySelector(".ix-intro__lead");
  if (video && lead) {
    let cur = video.dataset.base, t = 0;
    const swap = (label) => { if (label === cur) return; cur = label; video.classList.add("is-fade"); clearTimeout(t); t = setTimeout(() => { if (cur !== label) return; video.dataset.label = label; video.classList.remove("is-fade"); }, 250); };
    lead.addEventListener("mouseover", (e) => { const w = e.target.closest("[data-video]"); if (w) swap(w.dataset.video); });
    lead.addEventListener("mouseout", (e) => { if (!lead.contains(e.relatedTarget)) swap(video.dataset.base); });
  }

  // Clouds on the service strip: on wide screens, when the strip touches 20% from the top of the screen or a hand hovers, they pop out with .6s power3.out, and return when it leaves
  gsap.matchMedia().add("(min-width: 1251px) and (prefers-reduced-motion: no-preference)", () => {
    const offs = $$("[data-pop]").map((band) => {
      const imgs = band.querySelectorAll(".ix-band__mascot");
      const tl = gsap.timeline({ paused: true }).to(imgs, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.06, ease: "power3.out" });
      let hov = false, inView = false;
      const upd = () => (hov || inView ? tl.play() : tl.reverse());
      const on = () => { hov = true; upd(); }, off = () => { hov = false; upd(); };
      band.addEventListener("mouseenter", on); band.addEventListener("mouseleave", off);
      ScrollTrigger.create({ trigger: band, start: "top 20%", end: "bottom top", onToggle: (s) => { inView = s.isActive; upd(); } });
      return () => { band.removeEventListener("mouseenter", on); band.removeEventListener("mouseleave", off); tl.kill(); };
    });
    return () => offs.forEach((f) => f());
  });
  gsap.matchMedia().add("(max-width: 1250px), (prefers-reduced-motion: reduce)", () => { gsap.set(".ix-band__mascot", { opacity: 1, scale: 1 }); });

  // Case background: 0 to 1 from when the panel top touches 60% of the screen until its bottom touches 25% — green and orange at .33 and .66
  const works = document.querySelector(".ix-works");
  if (works) {
    let a = 0, b = 1, state = 0, busy = false;
    const metric = () => { const r = works.getBoundingClientRect(), top = r.top + scrollY; a = top - innerHeight * 0.6; b = top + r.height - innerHeight * 0.25; };
    const onScroll = () => { if (busy) return; busy = true; requestAnimationFrame(() => { const p = Math.max(0, Math.min(1, (scrollY - a) / (b - a))); const s = p >= 0.66 ? 2 : p >= 0.33 ? 1 : 0; if (s !== state) { state = s; works.dataset.color = s; } busy = false; }); };
    addEventListener("resize", () => requestAnimationFrame(metric), { passive: true });
    new IntersectionObserver((es) => { if (es[0].isIntersecting) { metric(); addEventListener("scroll", onScroll, { passive: true }); } else removeEventListener("scroll", onScroll); }, { rootMargin: "100% 0px" }).observe(works);
  }

  // Logo two tiers: one goes up and one goes down endlessly on an 18s loop (wrapped per cell), and cells within 250px of the cursor grow up to 1.07x the closer they are
  const cols = $$("[data-loop]");
  const loopIO = new IntersectionObserver((es) => es.forEach((e) => { const c = e.target; if (e.isIntersecting) { c._anim?.play(); c._near && gsap.ticker.add(c._near); } else { c._anim?.pause(); c._near && gsap.ticker.remove(c._near); } }), { rootMargin: "150px 0px" });
  cols.forEach((col) => {
    const track = col.querySelector(".ix-logos__track"), items = [...track.children];
    const setY = items.map((n) => gsap.quickSetter(n, "y", "px"));
    let step = 0, total = 0, wrap = null;
    const state = { o: 0 };
    const measure = () => { setY.forEach((f) => f(0)); step = items.length > 1 ? items[1].offsetTop - items[0].offsetTop : items[0].offsetHeight; total = step * items.length; wrap = gsap.utils.wrap(-step, total - step); return step > 0; };
    const render = () => { if (wrap) items.forEach((n, i) => setY[i](wrap(i * step + state.o) - i * step)); };
    const make = () => {
      const prog = col._anim ? col._anim.progress() : 0, was = col._anim && !col._anim.paused();
      col._anim?.kill(); state.o = 0;
      col._anim = gsap.fromTo(state, { o: 0 }, { o: col.dataset.loop === "up" ? -total : total, duration: 18, ease: "none", repeat: -1, paused: true, onUpdate: render });
      col._anim.progress(prog); render(); if (was) col._anim.play();
    };
    let mx = 0, my = 0, over = false;
    if (matchMedia("(hover: hover)").matches && !reduce) {
      col.addEventListener("mouseenter", () => (over = true));
      col.addEventListener("mouseleave", () => { over = false; gsap.to(items, { scale: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" }); });
      col.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
      col._near = () => { if (!over) return; items.forEach((n) => { const r = n.getBoundingClientRect(); const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2)); gsap.set(n, { scale: 1 + 0.07 * gsap.utils.clamp(0, 1, gsap.utils.mapRange(0, 250, 1, 0, d)) }); }); };
    }
    let ready = false;
    const start = () => { if (ready || !measure()) return; ready = true; make(); if (!reduce) loopIO.observe(col); gsap.to(track, { opacity: 1, duration: 0.35, ease: "power1.out" }); };
    new ResizeObserver(() => { if (!ready) return start(); const old = step; if (measure() && Math.abs(old - step) > 0.5) make(); else render(); }).observe(track);
    requestAnimationFrame(start);
  });

  // Testimonial slider: when lifted 20% above the screen bottom it rises from 60px·.96 over 1s, and advances via dots, drag and arrow keys. Auto-advances every 5s (pauses with pointer or focus)
  $$("[data-rs]").forEach((sec) => {
    const track = sec.querySelector("[data-rs-track]"), dots = sec.querySelector("[data-rs-dots]"), slides = [...track.children];
    if (reduce || !("IntersectionObserver" in window)) sec.classList.add("is-in");
    else { const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { sec.classList.add("is-in"); io.disconnect(); } }, { rootMargin: "0px 0px -20% 0px" }); io.observe(sec); }
    const delay = parseInt(sec.dataset.rs, 10) || 0;
    let per = 1, max = 0, active = 0, timer = 0, anim = 0, busy = false;
    const paused = { hover: false, focus: false, drag: false, hidden: false, off: false };
    const measure = () => { const gap = parseFloat(getComputedStyle(track).columnGap) || 0, step = slides[0].getBoundingClientRect().width + gap; per = Math.max(1, Math.round((track.clientWidth + gap) / step)); max = Math.max(0, slides.length - per); };
    const near = (x) => { let best = 0, min = Infinity; for (let i = 0; i <= max; i++) { const d = Math.abs(slides[i].offsetLeft - x); if (d < min) { min = d; best = i; } } return best; };
    const stop = (restore) => { if (!anim) return; cancelAnimationFrame(anim); anim = 0; if (restore !== false) track.style.scrollSnapType = ""; };
    const ease = (t) => 1 - Math.pow(1 - t, 5);
    const glide = (left) => {
      stop(); const from = track.scrollLeft, dist = left - from;
      if (Math.abs(dist) < 1) return;
      if (reduce) { track.scrollLeft = left; return; }
      const dur = Math.min(750, Math.max(380, Math.abs(dist) * 0.45)); let t0 = null;
      track.style.scrollSnapType = "none";
      anim = requestAnimationFrame(function step(now) { if (t0 === null) t0 = now; const p = Math.min(1, (now - t0) / dur); track.scrollLeft = from + dist * ease(p); if (p < 1) anim = requestAnimationFrame(step); else { track.scrollLeft = left; anim = 0; track.style.scrollSnapType = ""; } });
    };
    const paint = () => [...dots.children].forEach((d, i) => d.setAttribute("aria-current", i === active ? "true" : "false"));
    const build = () => { dots.textContent = ""; if (max < 1) return; for (let i = 0; i <= max; i++) { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", `Review ${i + 1}Toward`); b.addEventListener("click", () => { go(i); restart(); }); dots.appendChild(b); } paint(); };
    const go = (i, instant) => { i = Math.min(Math.max(i, 0), max); const s = slides[i]; if (!s) return; active = i; paint(); if (instant) { stop(); track.scrollLeft = s.offsetLeft; } else glide(s.offsetLeft); };
    const refresh = () => { const keep = active; stop(); measure(); build(); active = near(track.scrollLeft); paint(); if (keep > 0) go(keep, true); };
    const isPaused = () => Object.values(paused).some(Boolean);
    const tick = () => { if (!isPaused() && max >= 1) go(active >= max ? 0 : active + 1); };
    const start = () => { if (!delay || reduce || timer) return; timer = setInterval(tick, delay); };
    const halt = () => { clearInterval(timer); timer = 0; };
    const restart = () => { halt(); start(); };
    const pause = (k, v) => { paused[k] = v; isPaused() ? halt() : restart(); };
    sec.addEventListener("pointerenter", () => pause("hover", true));
    sec.addEventListener("pointerleave", () => pause("hover", false));
    sec.addEventListener("focusin", () => pause("focus", true));
    sec.addEventListener("focusout", () => { if (!sec.contains(document.activeElement)) pause("focus", false); });
    document.addEventListener("visibilitychange", () => pause("hidden", document.hidden));
    new IntersectionObserver((es) => pause("off", !es[0].isIntersecting), { threshold: 0.15 }).observe(sec);
    let drag = null;
    track.addEventListener("pointerdown", (e) => { stop(); if (e.pointerType === "touch" || e.button !== 0) return; drag = { id: e.pointerId, x: e.clientX, left: track.scrollLeft, moved: false, lx: e.clientX, lt: e.timeStamp, v: 0 }; pause("drag", true); });
    track.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) { drag.moved = true; sec.classList.add("is-dragging"); try { track.setPointerCapture(drag.id); } catch (err) {} }
      if (!drag.moved) return;
      e.preventDefault(); track.scrollLeft = drag.left - dx;
      const dt = e.timeStamp - drag.lt; if (dt > 0) { drag.v = (e.clientX - drag.lx) / dt; drag.lx = e.clientX; drag.lt = e.timeStamp; }
    });
    const end = (e) => {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      const { moved, v } = drag, from = near(drag.left);
      try { track.releasePointerCapture(drag.id); } catch (err) {}
      drag = null; sec.classList.remove("is-dragging");
      if (moved) { let to = near(track.scrollLeft); if (Math.abs(v) > 0.35 && to === from) to = from + (v < 0 ? 1 : -1); go(to); }
      pause("drag", false);
    };
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
    track.addEventListener("dragstart", (e) => e.preventDefault());
    track.addEventListener("wheel", () => stop(), { passive: true });
    track.addEventListener("scroll", () => { if (busy || anim) return; busy = true; requestAnimationFrame(() => { const n = near(track.scrollLeft); if (n !== active) { active = n; paint(); } busy = false; }); }, { passive: true });
    track.addEventListener("keydown", (e) => { const k = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: max }[e.key]; if (k === undefined) return; e.preventDefault(); go(k); restart(); });
    let rt; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(refresh, 120); }).observe(track);
    refresh(); start();
  });
})();
