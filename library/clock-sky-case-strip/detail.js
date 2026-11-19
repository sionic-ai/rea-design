// Case detail — hero text rises line by line from below (1s power2.out, stagger .06), the photo stays in place if it flew in from the gallery, otherwise it opens top to bottom (1.3s galleryReveal).
// The two-row photo strip stays pinned to the screen, the top row flowing left and the bottom row right, tied to scroll. The next case photo approaches 1.3 → 1× and the Next case line rolls over on hover
(() => {
  const { reduce, headIntro } = window.by;
  gsap.registerPlugin(CustomEase);
    const fromGallery = sessionStorage.getItem("by-from-gallery");
  sessionStorage.removeItem("by-from-gallery");
  // Header line intro plays only on the first page (same as the original)
  headIntro({ instant: true });

  const lift = (els) => els.map((el) => { const s = document.createElement("span"); s.style.display = "block"; s.append(...el.childNodes); el.append(s); return s; });
  const titleLines = lift([...document.querySelectorAll(".by-hero__title > div")]);
  const small = [...document.querySelectorAll(".by-hero .by-meta > span, .by-hero .by-cat > span, .by-hero .by-tags > span")];
  const desc = document.querySelector(".by-desc p");
  if (!reduce) {
    gsap.set([...titleLines, ...small], { yPercent: 100 });
    gsap.set(desc, { autoAlpha: 0, y: 24 });
    const tl = gsap.timeline({ delay: fromGallery ? 0 : 0.4 });
    // In the original detail Hero the photo is already in place and only the text rises (measured, it ends about .8s after the first change)
    const d = fromGallery ? 0.25 : 0.45;
    tl.to(titleLines, { yPercent: 0, duration: d, stagger: 0.06, ease: "power2.out" }, 0)
      .to(small, { yPercent: 0, duration: d, stagger: 0.06, ease: "power2.out" }, 0)
      .to(desc, { autoAlpha: 1, y: 0, duration: d, ease: "power2.out" }, 0);
  }

  // Two-row photo strip: stretch the section height so the strip can flow, and pin it
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const sec = document.querySelector(".by-rows");
    const [a, b] = sec.querySelectorAll(".by-rows__row");
    const span = () => Math.max(a.scrollWidth, b.scrollWidth) - innerWidth;
    const size = () => (sec.style.height = `${innerHeight + span()}px`);
    size();
    const st = { trigger: sec, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true, onRefreshInit: size };
    gsap.fromTo(a, { x: 0 }, { x: () => -(a.scrollWidth - innerWidth), ease: "none", scrollTrigger: st });
    gsap.fromTo(b, { x: () => -(b.scrollWidth - innerWidth) }, { x: 0, ease: "none", scrollTrigger: { ...st } });
    // The large-screen photo enters from the bottom of the screen at 1.1x and settles to 1x
    gsap.utils.toArray(".by-shot__img .by-ph").forEach((p) => gsap.fromTo(p, { scale: 1.1 }, { scale: 1, ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "bottom center", scrub: true } }));
    const next = document.querySelector(".by-next");
    gsap.to(next.querySelector(".by-next__img .by-ph"), { scale: 1, ease: "none", scrollTrigger: { trigger: next, start: "top bottom", end: "bottom bottom", scrub: true } });
    const nTitle = [next.querySelector(".by-next__line > span"), next.querySelector(".by-next__name")];
    gsap.set(nTitle, { yPercent: 100 });
    ScrollTrigger.create({ trigger: next, start: "top 60%", once: true, onEnter: () => gsap.to(nTitle, { yPercent: 0, duration: 1, stagger: 0.06, ease: "power2.out" }) });
    return () => { sec.style.height = ""; };
  });
  // Going to the first page — the detail body pulls back evenly over 1.25s after a .09s delay, then navigates, and the first page only floats up its cells (original app doesn’t come back: delay .12s · exit 1.23s near-straight curve · enter 2.1s)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href="index.html"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || reduce) return;
    e.preventDefault();
    sessionStorage.setItem("by-back", "1");
    gsap.to(".by-main", { autoAlpha: 0, y: -60, scale: 0.96, transformOrigin: "50% 0%", duration: 1.25, delay: 0.09, ease: "none", onComplete: () => { location.href = "index.html"; } });
  });
  if (!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    // The next-case cell rises −8px over .6s power2.out like the case cells, the photo +4px, and both return to place on leave
    const link = document.querySelector(".by-next__link");
    const pic = link.querySelector(".by-next__img");
    link.addEventListener("mouseenter", () => { gsap.to(link, { y: -8, duration: 0.6, ease: "power2.out", overwrite: "auto" }); gsap.to(pic, { y: 4, duration: 0.6, ease: "power2.out", overwrite: "auto" }); });
    link.addEventListener("mouseleave", () => { gsap.to([link, pic], { y: 0, duration: 0.6, ease: "power2.out", overwrite: "auto" }); });
  }
})();
