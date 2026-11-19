// Home page only — Hero branch switch (pressing it changes the site skin between personal ↔ business and crossfades photos·images) and location tabs (hover preview · press to lock · cover drawing)
(() => {
  const SD = window.SD;
  if (!SD) return;

  SD.use((root) => {
    const hero = root.querySelector("[data-sd-hero]");
    if (!hero) return;
    const triggers = [...hero.querySelectorAll("[data-hero-trigger]")];
    const slides = [...hero.querySelectorAll("[data-hero-slide]")], arts = [...hero.querySelectorAll("[data-hero-art]")];
    const tones = ["individuals", "business"];
    let cur = SD.tone() === "business" ? 1 : 0;
    const swap = (list, key, i, last) => list.forEach((n) => {
      const k = +n.dataset[key];
      if (k === i) { n.classList.remove("is-active", "was-active"); void n.offsetWidth; n.classList.add("is-active"); }
      else { n.classList.remove("is-active"); n.classList.toggle("was-active", k === last); }
    });
    const show = (i) => {
      if (i === cur) return;
      swap(slides, "heroSlide", i, cur);
      swap(arts, "heroArt", i, cur);
      cur = i;
      triggers.forEach((t) => t.setAttribute("aria-current", +t.dataset.heroTrigger === i ? "true" : "false"));
    };
    if (cur) { const c = cur; cur = 0; show(c); }
    const click = (e) => { const i = +e.currentTarget.dataset.heroTrigger; show(i); SD.setTone(tones[i]); };
    triggers.forEach((t) => t.addEventListener("click", click));
    const onTone = (e) => show(e.detail.business ? 1 : 0);
    document.addEventListener("sd:tone", onTone);
    // The original loads the hero module late, so the photo opening starts about 130ms late (loader screen length fixed at 950ms).
    const enterT = setTimeout(() => hero.classList.add("is-entered"), 130);
    return () => { clearTimeout(enterT); triggers.forEach((t) => t.removeEventListener("click", click)); document.removeEventListener("sd:tone", onTone); };
  });

  // Locations: the cover lines are drawn over 1.6s. Each line takes 60%, and the next line splits the remaining 40% and starts later (original Locations · cubic-bezier(.61,1,.88,1))
  SD.use((root) => {
    const sec = root.querySelector("[data-sd-locations]");
    if (!sec) return;
    const tabs = [...sec.querySelectorAll("[data-loc-tab]")], panels = [...sec.querySelectorAll("[data-loc-panel]")];
    const pics = [...sec.querySelectorAll("[data-loc-image]")], tint = sec.querySelector("[data-loc-tint]");
    const DRAW = 1600;
    const marks = [...sec.querySelectorAll("[data-loc-mark]")].map((el) => ({ el, key: el.dataset.locMark, ready: false, t: 0 }));
    const prep = (m) => {
      if (m.ready) return;
      m.ready = true;
      const parts = [...m.el.querySelectorAll("path")];
      const each = DRAW * 0.6, gap = parts.length > 1 ? (DRAW * 0.4) / (parts.length - 1) : 0;
      parts.forEach((p, i) => {
        const len = Math.ceil(p.getTotalLength());
        p.style.strokeDasharray = `${len}`;
        p.style.setProperty("--draw-length", `${len}`);
        p.style.setProperty("--draw-duration", `${each}ms`);
        p.style.setProperty("--draw-delay", `${i * gap}ms`);
      });
    };
    let sel = null, peek = null;
    // The chosen place name is redrawn in view, and the departing one fades out over .45s before its line is withdrawn
    const draw = (key) => marks.forEach((m) => {
      clearTimeout(m.t);
      if (m.key === key) { prep(m); m.el.classList.remove("is-drawn"); m.el.getBoundingClientRect(); m.el.classList.add("is-visible", "is-drawn"); }
      else if (m.el.classList.contains("is-visible")) { m.el.classList.remove("is-visible"); m.t = setTimeout(() => m.el.classList.remove("is-drawn"), 450); }
      else m.el.classList.remove("is-drawn");
    });
    const paint = () => {
      const want = peek ?? sel ?? "default";
      pics.forEach((p) => p.classList.toggle("is-on", p.dataset.locImage === want));
      tint?.toggleAttribute("data-active", !!sel && (peek === null || peek === sel));
      panels.forEach((p) => { const on = p.dataset.locPanel === sel && (peek === null || peek === sel); p.toggleAttribute("data-active", on); p.toggleAttribute("inert", !on); });
    };
    const select = (key) => {
      sel = key;
      tabs.forEach((t, i) => { const on = t.dataset.locTab === key; t.setAttribute("aria-selected", on); t.tabIndex = on || (!key && i === 0) ? 0 : -1; });
      paint();
      draw(key);
    };
    const click = (e) => { const k = e.currentTarget.dataset.locTab; select(k === sel ? null : k); };
    const enter = (e) => { if (e.pointerType === "touch") return; peek = e.currentTarget.dataset.locTab; paint(); };
    const list = sec.querySelector('[role="tablist"]');
    const leave = (e) => { if (e.pointerType === "touch") return; peek = null; paint(); };
    tabs.forEach((t) => { t.addEventListener("click", click); t.addEventListener("pointerenter", enter); });
    list.addEventListener("pointerleave", leave);
    return () => { marks.forEach((m) => clearTimeout(m.t)); tabs.forEach((t) => { t.removeEventListener("click", click); t.removeEventListener("pointerenter", enter); }); list.removeEventListener("pointerleave", leave); };
  });
})();
