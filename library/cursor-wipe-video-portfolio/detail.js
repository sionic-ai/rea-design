// Work detail — title words rise as soon as it opens, and text block lines rise from 160% below at .85 outQuint when entering the screen (top edge from screen bottom → 70%).
// Clicking the video cell plays/pauses (a placeholder canvas pauses and resumes the flow). The blurred video behind the screen is this work’s video.
window.gbSite.boot(() => {
  const site = window.gbSite, $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger);
  const title = document.querySelector(".js-work-title");
  const spT = site.split(title), tw = spT ? spT.words : [title];
  gsap.set(tw, site.hide());
  site.ready.then(() => gsap.to(tw, { ...site.D, ...site.show(), stagger: spT ? site.stagger(spT.lines, spT.words) : 0 }));
  $$(".js-wc").forEach((el) => {
    const sp = site.split(el), w = sp ? sp.words : [el];
    gsap.set(w, site.hide());
    site.ready.then(() => ScrollTrigger.create({ trigger: el, start: "top bottom", end: "top 70%", once: true, onEnter: () => gsap.to(w, { ...site.D, ...site.show(), stagger: sp ? site.stagger(sp.lines, sp.words) : 0 }) }));
  });
  // Video cell: pressing toggles the play indicator. For a real video, call video.play()/pause() here
  const vid = document.querySelector(".gb-wc__video");
  const toggle = () => { const on = vid.classList.toggle("is-playing"); vid.setAttribute("aria-pressed", String(on)); const v = vid.querySelector("video"); if (v) on ? v.play() : v.pause(); };
  vid?.addEventListener("click", toggle);
  vid?.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  // Play tag — when the video is visible it rises from 160% below (.85 outQuint), and follows the cursor if over the video, otherwise the anchor, with .6s power3
  const play = document.querySelector(".gb-play"), inner = play && play.querySelector(".gb-play__in"), anchor = vid && vid.querySelector(".js-anchor");
  if (play && vid && anchor) {
    const p = { x: 0, y: 0 }, qx = gsap.quickTo(p, "x", { duration: 0.6, ease: "power3" }), qy = gsap.quickTo(p, "y", { duration: 0.6, ease: "power3" });
    let over = null;
    gsap.set(play, { xPercent: -50, yPercent: -50 });
    gsap.set(inner, { yPercent: 160 });
    const target = (r) => { if (over) return { x: over.x - r.left, y: over.y - r.top }; const a = anchor.getBoundingClientRect(); return { x: a.left - r.left + play.offsetWidth / 2, y: a.top - r.top }; };
    const r0 = vid.getBoundingClientRect(), t0 = target(r0);
    qx(t0.x, t0.x); qy(t0.y, t0.y);
    gsap.ticker.add(() => { const r = vid.getBoundingClientRect(), t = target(r); qx(t.x); qy(t.y); gsap.set(play, { x: r.left + p.x, y: r.top + p.y }); });
    if (!site.touch) {
      // While a hand is over the video the Play button stands as a flipped panel (same timeline as the original Action hover)
      const act = play.querySelector(".gb-play__act");
      vid.addEventListener("pointermove", (e) => { over = { x: e.clientX, y: e.clientY }; act.classList.add("is-current"); });
      vid.addEventListener("pointerleave", () => { over = null; act.classList.remove("is-current"); });
    }
    new IntersectionObserver(([en]) => gsap.to(inner, { ...site.D, yPercent: en.isIntersecting ? 0 : 150, overwrite: true })).observe(vid);
  }
  site.setBg(document.getElementById("film-3"), true);
});
