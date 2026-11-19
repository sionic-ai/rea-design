(() => {
  // A heading that unfurls while scrolling down, with the last letter falling — split letters by em (keeping the line-break br) and hang three branches on one timeline
  kfFx.register("title-drop-fall", (el, { options, reduce }) => {
    const text = el.textContent;
    if (!text.trim()) return;
    const keep = el.innerHTML;
    const GLYPHS = options.chars || "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789!#$%/=?*+~^<>";
    const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    const phone = matchMedia("(max-width: 767px)").matches;
    const which = options.which && options.which !== "auto" ? options.which : phone ? "first-of-last-word" : "last";
    // Split per line and use em — leave br as is
    const lines = [];
    let cur = "";
    el.childNodes.forEach((n) => { if (n.nodeName === "BR") { lines.push(cur); cur = ""; } else cur += n.textContent; });
    lines.push(cur);
    el.setAttribute("aria-label", text.trim());
    el.innerHTML = lines.map((l) => [...l].map((c) => `<em data-fx-part="char" aria-hidden="true">${c === "<" ? "&lt;" : c === "&" ? "&amp;" : c}</em>`).join("")).join("<br>");
    const ems = [...el.querySelectorAll('[data-fx-part="char"]')];
    const lastLine = lines[lines.length - 1], startOf = ems.length - [...lastLine].length;
    const fallIdx = which === "last" ? ems.length - 1 - [...lastLine].reverse().findIndex((c) => c.trim()) : startOf + lastLine.trimEnd().lastIndexOf(" ") + 1;
    const last = ems[fallIdx];
    last?.classList.add("fx-last");
    const live = ems.filter((e) => e.textContent.trim()).map((e) => ({ el: e, to: e.textContent }));
    const floorEl = el.parentElement?.querySelector(':scope > [data-fx-part="floor"]') || el.parentElement?.nextElementSibling;
    const tilt = +(options.tilt ?? (phone ? -6 : 16));
    const fallVars = () => {
      if (!last) return {};
      const r = last.getBoundingClientRect();
      const floor = floorEl ? floorEl.getBoundingClientRect().top : el.getBoundingClientRect().bottom + r.height * 0.4;
      return { y: floor - r.bottom - r.height * 0.02, x: r.width * (phone ? -0.1 : 0.25), rotation: tilt };
    };
    const off = () => { el.innerHTML = keep; el.removeAttribute("aria-label"); };
    if (reduce) { if (last) gsap.set(last, fallVars()); return off; }
    const dur = +(options.dur ?? 3), scr = +(options.scramble ?? 2.1), hold = +(options.hold ?? 0.45), fall = +(options.fall ?? 0.7);
    const drop = +(options.drop ?? 1);
    live.forEach(({ el: e }) => { e.style.width = e.getBoundingClientRect().width + "px"; e.style.textAlign = "center"; });
    const st = { p: 0 };
    let lastTick = 0;
    const n = Math.max(1, live.length);
    const tl = gsap.timeline();
    // Original: y = From −(title cell height + title height) to 0 — farther by the drop factor
    tl.fromTo(el, { y: () => -(el.parentElement.offsetHeight + el.offsetHeight) * drop }, { y: 0, duration: dur, ease: "power1.out" }, 0);
    if (scr > 0) {
      tl.to(st, {
        p: 1, duration: scr, ease: "none",
        onUpdate() {
          const t = st.p * scr, tick = t - lastTick >= 0.04;
          if (tick) lastTick = t;
          live.forEach(({ el: e, to }, i) => {
            if (t >= hold + (i / (n - 1 || 1)) * (scr - hold)) { if (e.textContent !== to) e.textContent = to; }
            else if (tick) e.textContent = glyph();
          });
        },
      }, 0);
    }
    tl.add(() => {
      live.forEach(({ el: e, to }) => { e.textContent = to; e.style.width = ""; e.style.textAlign = ""; });
      if (last) gsap.to(last, { ...fallVars(), duration: fall, ease: "power2.in" });
    }, Math.max(dur, scr));
    return () => { tl.kill(); if (last) gsap.killTweensOf(last); gsap.set(el, { clearProps: "transform" }); off(); };
  });
})();
