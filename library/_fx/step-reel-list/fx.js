(() => {
  kfFx.register("step-reel-list", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll(":scope > [data-fx-part=item]")];
    if (!items.length) return;
    const every = +(options.every ?? 1.2) || 1.2, dur = reduce ? 0 : +(options.dur ?? 0.45), VIS = Math.max(1, +options.visible || 4);
    const fade = String(options.fade ?? "1,.85,.6,.25").split(",").map(Number);
    const track = document.createElement("div");
    track.className = "fx-srl-track";
    items.forEach((it) => track.appendChild(it));
    const clones = items.map((it) => { const c = it.cloneNode(true); c.setAttribute("aria-hidden", "true"); return c; });
    clones.forEach((c) => track.appendChild(c));
    el.appendChild(track);
    const all = [...track.children];
    let row = 0, idx = 0, timer = 0, tw = null;
    const measure = () => { row = items[0].offsetHeight || 1; el.style.height = `${row * VIS}px`; gsap.set(track, { y: -idx * row }); };
    const paint = () => all.forEach((li, i) => {
      const d = idx + VIS - 1 - i;
      li.classList.toggle("is-now", d === 0);
      li.style.opacity = d < 0 || d >= VIS ? 0 : (fade[d] ?? 0);
    });
    const step = () => {
      idx++;
      paint();
      tw = gsap.to(track, { y: -idx * row, duration: dur, ease: "back.out(1.7)", onComplete: () => { if (idx >= items.length) { idx = 0; gsap.set(track, { y: 0 }); paint(); } } });
    };
    measure(); paint();
    const ro = new ResizeObserver(measure);
    ro.observe(items[0]);
    const st = ScrollTrigger.create({ trigger: el, scroller: scroller || undefined, start: "top bottom", end: "bottom top", onToggle: (s) => { clearInterval(timer); if (s.isActive && !reduce) timer = setInterval(step, every * 1000); } });
    return () => {
      clearInterval(timer); tw?.kill(); st.kill(); ro.disconnect();
      clones.forEach((c) => c.remove());
      items.forEach((it) => { it.classList.remove("is-now"); it.style.opacity = ""; el.appendChild(it); });
      track.remove(); el.style.height = "";
    };
  });
})();
