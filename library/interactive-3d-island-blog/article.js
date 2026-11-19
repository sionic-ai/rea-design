// An article — marks the visible section on the table-of-contents ticks (click a tick to jump to that section), and the listen bar fills its 11 segments in order on play (4:05).
// ”Listen from here” starts from that chapter’s segment. No sound — only the bar’s time runs
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const story = $(".bb-story"), mast = $(".bb-mast");
  const beats = $$(".bb-story__beat", story);
  const rail = $$(".bb-story__rail button");
  story.addEventListener("scroll", () => mast.toggleAttribute("data-veiled", story.scrollTop > 8), { passive: true });
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = beats.indexOf(e.target);
      rail.forEach((b, k) => b.setAttribute("aria-current", String(k === i)));
    });
  }, { root: story, threshold: 0.55 });
  beats.forEach((b) => io.observe(b));
  rail.forEach((b) => b.addEventListener("click", () => beats[+b.dataset.to]?.scrollIntoView({ block: "start" })));

  const bar = $(".bb-listen"), now = $(".bb-listen__now"), range = $(".bb-listen__scrub input"), more = $(".bb-listen__more");
  const chapter = $(".bb-listen__chapter");
  const setMenu = (open) => { bar.toggleAttribute("data-menu", open); chapter.dataset.state = open ? "open" : "closed"; chapter.setAttribute("aria-expanded", String(open)); };
  // Opens at the moment of press (pointerdown) — doesn’t wait for release
  chapter.addEventListener("pointerdown", (e) => { if (e.button) return; e.stopPropagation(); setMenu(!bar.hasAttribute("data-menu")); });
  chapter.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMenu(!bar.hasAttribute("data-menu")); } });
  document.addEventListener("pointerdown", (e) => { if (!bar.contains(e.target)) setMenu(false); });
  const segs = $$(".bb-listen__segments span");
  const total = 245;
  let pos = 0, playing = false, last = 0, raf = 0;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const draw = () => {
    now.textContent = fmt(pos);
    range.value = String(Math.round(pos));
    segs.forEach((s, i) => { const a = (i / segs.length) * total, b = ((i + 1) / segs.length) * total; s.style.setProperty("--fill", Math.max(0, Math.min(1, (pos - a) / (b - a))).toFixed(3)); });
    const part = Math.min(beats.length - 1, Math.floor((pos / total) * (beats.length - 1)) + 1);
    beats.forEach((b, i) => { b.toggleAttribute("data-listening", playing && i === part); b.querySelector(".bb-story__passage")?.toggleAttribute("data-active", playing && i === part); });
    $$(".bb-story__listenHere").forEach((h) => { h.lastChild.textContent = playing && beats.indexOf(h.closest(".bb-story__beat")) === part ? "Now listening to this" : "Listen from here"; });
    // Moving the bar makes the contents ticks point to the section being heard
    if (playing || pos > 0) rail.forEach((b, k) => b.setAttribute("aria-current", String(k === part)));
  };
  const tick = (t) => { if (!playing) return; pos = Math.min(total, pos + (t - last) / 1000); last = t; draw(); if (pos >= total) { playing = false; bar.removeAttribute("data-playing"); draw(); return; } raf = requestAnimationFrame(tick); };
  const play = (on) => { playing = on; bar.toggleAttribute("data-playing", on); if (on) more.hidden = false; cancelAnimationFrame(raf); if (on) { last = performance.now(); raf = requestAnimationFrame(tick); } draw(); };
  $(".bb-listen__play").addEventListener("click", () => play(!playing));
  range.addEventListener("input", () => { pos = +range.value; more.hidden = false; draw(); });
  $$(".bb-listen__menu button").forEach((b) => b.addEventListener("click", () => { pos = ((+b.dataset.part - 1) / (beats.length - 1)) * total; setMenu(false); play(true); }));
  $$(".bb-story__listenHere").forEach((b) => b.addEventListener("click", () => {
    const i = beats.indexOf(b.closest(".bb-story__beat"));
    pos = ((i - 1) / (beats.length - 1)) * total;
    play(true);
  }));
  draw();
})();
