// Home page scenes: head photo slideshow (Webflow slider — pushes to the next every 3s over .5s, endless), customer list hover (that row’s photo, others .25), list rows appearing
(() => {
  const { E } = window.msMotion;
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const mm = gsap.matchMedia();

  const slides = $$(".ms-hero__slide");
  if (slides.length > 1) {
    let i = 0;
    gsap.set(slides, { x: 0, xPercent: (k) => (k === 0 ? 0 : 100) });
    const next = () => {
      const cur = slides[i];
      i = (i + 1) % slides.length;
      const nxt = slides[i];
      gsap.set(nxt, { xPercent: 100 });
      gsap.to(cur, { xPercent: -100, duration: 0.5, ease: E.ease });
      gsap.to(nxt, { xPercent: 0, duration: 0.5, ease: E.ease });
      gsap.delayedCall(3, next);
    };
    // Like the original slider, counts 3 seconds from the same moment as the loader (Webflow.ready)
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const call = gsap.delayedCall(3, next);
      return () => call.kill();
    });
  }

  const list = document.querySelector(".ms-clients__list");
  if (!list) return;
  const links = $$(".ms-clients__link", list);
  const rows = $$(".ms-clients__row", list);
  const def = document.querySelector(".ms-clients__default .ms-img");

  mm.add("(min-width: 992px)", () => {
    const onList = () => def && gsap.to(def, { opacity: 0, duration: 0.2, ease: E.ease, overwrite: "auto" });
    const offList = () => def && gsap.to(def, { opacity: 1, duration: 0.2, ease: E.ease, overwrite: "auto" });
    list.addEventListener("mouseenter", onList);
    list.addEventListener("mouseleave", offList);
    const offs = links.map((a) => {
      const img = a.querySelector(".ms-clients__img .ms-img"), row = a.querySelector(".ms-clients__row");
      const on = () => {
        gsap.set(img, { display: "block" });
        gsap.to(img, { opacity: 1, duration: 0.2, ease: E.ease, overwrite: "auto" });
        gsap.to(rows.filter((r) => r !== row), { opacity: 0.25, duration: 0.2, ease: E.ease, overwrite: "auto" });
        gsap.to(row, { opacity: 1, duration: 0.2, ease: E.ease, overwrite: "auto" });
      };
      const off = () => {
        gsap.to(img, { opacity: 0, duration: 0.2, ease: E.ease, overwrite: "auto", onComplete: () => gsap.set(img, { display: "none" }) });
        gsap.to(rows, { opacity: 1, duration: 0.2, ease: E.ease, overwrite: "auto" });
      };
      a.addEventListener("mouseenter", on);
      a.addEventListener("mouseleave", off);
      return () => { a.removeEventListener("mouseenter", on); a.removeEventListener("mouseleave", off); };
    });
    return () => { list.removeEventListener("mouseenter", onList); list.removeEventListener("mouseleave", offList); offs.forEach((f) => f()); };
  });

  // List rows rest .2s once visible and then appear over 1s (Fade In #2)
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    links.forEach((a) => {
      const row = a.querySelector(".ms-clients__row");
      gsap.fromTo(row, { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.2, ease: E.easeInOut, scrollTrigger: { trigger: a, start: "top bottom", once: true } });
    });
  });
})();
