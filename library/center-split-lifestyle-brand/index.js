// Home page — loader sequence (.2s → 2s → .5s), two hero sets crossfading over 5s, video cell horizontal flow behind pinned copy
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loading = document.querySelector(".rw-loading");
  const mv = document.querySelector(".rw-mv");
  const bg = document.querySelector(".rw-bg");

  const startSlides = () => {
    const slides = mv.querySelectorAll(".rw-mv-slide__item");
    const copies = mv.querySelectorAll(".rw-mv-copy__item");
    let i = 0;
    slides[0].classList.add("is-active");
    copies[0]?.classList.add("is-active");
    if (reduce) return;
    setInterval(() => {
      slides[i].classList.remove("is-active"); copies[i]?.classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active"); copies[i]?.classList.add("is-active");
    }, 5000);
  };

  // In the original the loader clock only runs after the bundle script has downloaded — the placeholder copy has nothing to download, so it waits for load and starts at the same point
  const run = (fn) => (document.readyState === "complete" ? fn() : addEventListener("load", fn, { once: true }));
  if (loading && !reduce) {
    mv.classList.add("is-hide"); bg.classList.add("is-hide");
    run(() => setTimeout(() => {
      mv.classList.remove("is-hide"); bg.classList.remove("is-hide");
      loading.classList.add("is-animated");
      setTimeout(() => {
        loading.classList.add("is-hide");
        setTimeout(() => { mv.classList.add("is-animated"); startSlides(); }, 500);
      }, 2000);
    }, 200));
  } else {
    loading?.classList.add("is-hide");
    mv.classList.add("is-animated");
    startSlides();
  }

  // Gallery — per cell x 60 → screen width − strip width − 80·screen width/cell width, scrub 1.5 from when 10% of a sheet touches the top to when 90% touches the bottom
  const gallery = document.querySelector(".home-gallery");
  if (gallery && window.gsap) {
    const wrap = gallery.querySelector(".home-gallery-bg");
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(gallery.querySelectorAll(".home-gallery-bg__item"), { x: 60 }, {
        x: (i, el) => innerWidth - wrap.clientWidth - (80 * innerWidth) / el.clientWidth,
        ease: "none",
        scrollTrigger: { trigger: gallery, start: "10% top", end: "90% bottom", scrub: 1.5, invalidateOnRefresh: true },
      });
    });
  }
})();
