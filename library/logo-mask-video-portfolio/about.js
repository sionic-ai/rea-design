// About — original values: collage open/close 1.1s osmo (Flip, size included), veil, indicator and close .6s, sliding after release of drag ·
// Strength rows stack stuck at the top and the top line goes from the previous row’s spot to its own spot with scrub · reel year at each spot, a number strip rolls over 1.25s expo.inOut to change.
RW.page("about", (root) => {
  const { $, $$, reduce } = RW;
  const kill = [];
  const st = (o) => { const s = ScrollTrigger.create(o); kill.push(() => s.kill()); return s; };

  // ── Collage ──
  const col = $(".collage", root), list = $(".collage__list", col), items = $$(".collage__item", col), ind = $(".collage__indicator", col), close = $(".collage__close", col), back = $(".collage__backdrop", col);
  ind.innerHTML = items.map((_, i) => `<button type="button" aria-label="${i + 1} / ${items.length}"><span></span></button>`).join("");
  const bars = $$("button", ind);
  let state = "closed", cur = 0, x = 0, vx = 0, drag = null, raf = 0;
  const visible = () => items.filter((it) => getComputedStyle(it).display !== "none");
  const offsets = () => { const v = visible(), gap = 16; let acc = 0; return v.map((it) => { const o = acc; acc += it.offsetWidth + gap; return o; }); };
  const centerX = (i) => { const v = visible(), o = offsets(); return innerWidth / 2 - (o[i] + v[i].offsetWidth / 2); };
  const place = () => { const v = visible(), o = offsets(); v.forEach((it, i) => gsap.set(it, { x: o[i] + x })); };
  const mark = () => {
    const v = visible(), o = offsets();
    let best = 0, bd = 1e9;
    v.forEach((it, i) => { const d = Math.abs(o[i] + x + it.offsetWidth / 2 - innerWidth / 2); if (d < bd) { bd = d; best = i; } });
    cur = best;
    bars.forEach((b, i) => b.classList.toggle("is-on", i === best));
  };
  const glide = () => {
    raf = 0;
    if (drag || state !== "open") return;
    if (Math.abs(vx) < 0.2) return;
    x += vx; vx *= 0.92;
    const v = visible(), o = offsets(), min = centerX(v.length - 1), max = centerX(0);
    x = Math.max(min, Math.min(max, x));
    place(); mark();
    raf = requestAnimationFrame(glide);
  };
  function open(i) {
    if (state !== "closed") return;
    state = "opening";
    const v = visible(), fs = Flip.getState(v);
    col.classList.add("is-open");
    window.rwLenis?.stop();
    cur = Math.max(0, v.indexOf(items[i]));
    x = centerX(cur);
    place(); mark();
    Flip.from(fs, { duration: reduce ? 0 : 1.1, ease: "osmo", scale: true, onComplete: () => (state = "open") });
    gsap.to([back, ind, close], { autoAlpha: 1, duration: reduce ? 0 : 0.6, overwrite: true });
  }
  function shut() {
    if (state !== "open") return;
    state = "closing";
    const v = visible(), fs = Flip.getState(v);
    col.classList.remove("is-open");
    col.classList.add("is-anim");
    gsap.set(v, { clearProps: "x" });
    Flip.from(fs, { duration: reduce ? 0 : 1.1, ease: "osmo", scale: true, onComplete: () => { col.classList.remove("is-anim"); state = "closed"; window.rwLenis?.start(); } });
    gsap.to([back, ind, close], { autoAlpha: 0, duration: reduce ? 0 : 0.6, overwrite: true });
  }
  items.forEach((it, i) => it.addEventListener("click", () => { if (state === "closed") open(i); }));
  bars.forEach((b, i) => b.addEventListener("click", () => { if (state !== "open") return; const o = { x }; gsap.to(o, { x: centerX(i), duration: 1.1, ease: "osmo", onUpdate: () => { x = o.x; place(); mark(); } }); }));
  close.addEventListener("click", shut);
  const esc = (e) => e.key === "Escape" && shut();
  addEventListener("keydown", esc);
  kill.push(() => removeEventListener("keydown", esc));
  list.addEventListener("pointerdown", (e) => { if (state !== "open") return; drag = { sx: e.clientX, x0: x, lx: e.clientX, t: performance.now(), moved: 0 }; list.setPointerCapture(e.pointerId); col.dataset.pointer = "grabbing"; });
  list.addEventListener("pointermove", (e) => { if (!drag) return; const dx = e.clientX - drag.lx; drag.lx = e.clientX; drag.moved += Math.abs(dx); vx = dx; x = drag.x0 + (e.clientX - drag.sx); place(); mark(); });
  const up = () => { if (!drag) return; drag = null; delete col.dataset.pointer; if (!raf) raf = requestAnimationFrame(glide); };
  list.addEventListener("pointerup", up);
  list.addEventListener("pointercancel", up);
  list.addEventListener("click", (e) => { if (state === "open" && e.target === list) shut(); });

  // ── Benefits Row ──
  const wraps = $$(".usps__wrap", root), usps = wraps.map((w) => $(".usps__item", w));
  const last = usps.length - 1;
  const topOf = (i) => parseFloat(getComputedStyle(usps[i]).top);
  const startOf = (i) => wraps[i].getBoundingClientRect().top + scrollY - topOf(i);
  const extra = () => { const e = wraps[last].getBoundingClientRect().bottom + scrollY - topOf(last) - usps[last].offsetHeight; for (let t = 0; t < last; t++) wraps[t].style.setProperty("--extra", `${Math.max(0, e - startOf(t))}px`); };
  extra();
  st({ trigger: $(".usps", root), onRefresh: extra });
  usps.forEach((u, i) => {
    const fill = $(".usps__fill", u);
    const tw = gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: () => (i > 0 ? startOf(i - 1) : startOf(0) - (last > 0 ? startOf(1) - startOf(0) : innerHeight / 2)), end: () => startOf(i), scrub: true, invalidateOnRefresh: true } });
    kill.push(() => { tw.scrollTrigger?.kill(); tw.kill(); });
  });

  // ── Showreel row: year counter ──
  const yEl = $(".feed__year", root), years = yEl.dataset.years.split(","), len = Math.max(...years.map((y) => y.length));
  yEl.textContent = "";
  yEl.classList.add("year-odometer");
  const digits = [...years[0].padStart(len, "0")].map((d) => {
    const box = document.createElement("span"); box.className = "year-odometer__digit"; box.style.height = "1.35em";
    const r = document.createElement("span"); r.className = "year-odometer__roller"; r.style.lineHeight = "1.35";
    r.textContent = Array.from({ length: 30 }, (_, i) => i % 10).join("\n");
    box.append(r); yEl.append(box);
    gsap.set(r, { yPercent: (-100 * (10 + Number(d))) / 30 });
    return { r, d: Number(d) };
  });
  let at = 0;
  const showYear = (k) => {
    if (k === at) return;
    const dir = Math.sign(Number(years[k]) - Number(years[at]));
    [...years[k].padStart(len, "0")].forEach((ch, i) => {
      const g = digits[i], t = Number(ch), o = g.d;
      if (o === t) return;
      g.d = t;
      const to = dir >= 0 ? (t > o ? 10 + t : 20 + t) : (t < o ? 10 + t : t);
      gsap.set(g.r, { yPercent: (-100 * (10 + o)) / 30 });
      gsap.to(g.r, { yPercent: (-100 * to) / 30, duration: reduce ? 0 : 1.25, ease: "expo.inOut", overwrite: true, onComplete: () => gsap.set(g.r, { yPercent: (-100 * (10 + t)) / 30 }) });
    });
    at = k;
  };
  const vids = $$(".reels .feed__video", root), feed = $(".reels", root);
  vids.forEach((v, i) => {
    const next = vids[i + 1];
    st({ trigger: v, endTrigger: next || feed, start: i === 0 ? "top bottom" : "top 60%", end: next ? "top 60%" : "bottom -100%", toggleClass: { targets: v, className: "is-active" }, onLeave: () => v.classList.add("is-above"), onEnterBack: () => v.classList.remove("is-above"), onToggle: (s) => s.isActive && showYear(i) });
  });

  if (!reduce) {
    const h = gsap.fromTo($(".a-hero__media", root), { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: $(".a-hero", root), start: "top top", end: "bottom top", scrub: true } });
    kill.push(() => { h.scrollTrigger?.kill(); h.kill(); });
  }
  return () => { kill.forEach((f) => f()); cancelAnimationFrame(raf); };
});
