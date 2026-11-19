/* Home motion — three circles scale up (the original’s IX scroll-progress keyframes as is), service panel swap, publication push, quote words getting bolder */
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  mm.add({ desk: "(min-width: 992px)", phone: "(max-width: 991px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { desk, reduce } = ctx.conditions;
    const sec = document.querySelector(".hm-circles");
    const wrap = sec.querySelector("[data-c-wrap]"), c1 = sec.querySelector("[data-c1]"), c2 = sec.querySelector("[data-c2]"), c3 = sec.querySelector("[data-c3]");
    const title = sec.querySelector(".hm-circles__title");
    if (reduce) {
      gsap.set(wrap, { scale: desk ? 1.3 : 1 });
      gsap.set(c1, { width: desk ? "70vw" : "250vw", height: desk ? "70vw" : "250vw" });
      gsap.set(c2, { width: "200vw", height: "200vw" });
      gsap.set(c3, { width: "200vh", height: "200vh" });
      return;
    }
    // The keyframe is progress % — the original hook is a plane attached 100vh below the section head, so from when the section head touches the top of the screen (0) to when the section end passes the top of the screen (100). Webflow smoothing 50 ≈ scrub .5
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: 0.5 } });
    const at = (p) => p / 100;
    if (desk) {
      gsap.set(wrap, { scale: 0.4 }); gsap.set(title, { opacity: 0 }); gsap.set(c3, { width: "65vh", height: "65vh" });
      gsap.set(c1, { width: "4vh", height: "4vh" }); gsap.set(c2, { width: "4vh", height: "4vh" });
      tl.to(wrap, { scale: 1.3, duration: at(15) }, 0)
        .to(title, { opacity: 1, duration: at(1) }, at(4))
        .to(c1, { width: "10vw", height: "10vw", duration: at(10) }, 0)
        .to(c1, { width: "70vw", height: "70vw", duration: at(25) }, at(10))
        .to(c2, { width: "15vw", height: "15vw", duration: at(15) }, 0)
        .to(c2, { width: "200vw", height: "200vw", duration: at(42) }, at(15))
        .to(c3, { width: "200vh", height: "200vh", duration: at(57) }, 0)
        .to({}, { duration: at(43) }, at(57));
    } else {
      gsap.set(wrap, { scale: 0.7 }); gsap.set(c3, { width: "50vh", height: "50vh" });
      gsap.set(c1, { width: "4vh", height: "4vh" });
      tl.to(wrap, { scale: 1, duration: at(15) }, 0)
        .to(c1, { width: "10vw", height: "10vw", duration: at(10) }, 0)
        .to(c1, { width: "250vw", height: "250vw", duration: at(40) }, at(10))
        .to(c3, { width: "200vh", height: "200vh", duration: at(50) }, 0)
        .to({}, { duration: at(50) }, at(50));
    }

    // Services — when the right pattern panel’s head passes 50% of the screen, that panel’s color plate appears in .5s and the previous plate disappears in .5s
    if (desk) {
      const items = [...document.querySelectorAll("[data-svc]")];
      const show = (i) => items.forEach((it, k) => {
        const on = k === i;
        if (on === it.classList.contains("is-on")) return;
        it.classList.toggle("is-on", on);
        gsap.to(it, { autoAlpha: on ? 1 : 0, duration: 0.5, ease: on ? "power1.inOut" : "power1.inOut", overwrite: true });
      });
      gsap.set(items, { autoAlpha: (i) => (i === 0 ? 1 : 0) });
      document.querySelectorAll("[data-svc-img]").forEach((img, i) => {
        ScrollTrigger.create({ trigger: img, start: "top 50%", end: "bottom 50%", onEnter: () => show(i), onEnterBack: () => show(i) });
      });
      return () => gsap.set(items, { clearProps: "opacity,visibility" });
    }
  });

  // Quote — words are split and go from .25 to 1, .1 stagger, section top at screen center (phone 35%) → section end at screen center (phone 90%), scrub 2
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const q = document.querySelector("[data-quote]");
    if (!q || !window.SplitType) return;
    const split = new SplitType(q, { types: "words" });
    const phone = innerWidth <= 767;
    gsap.from(split.words, {
      opacity: 0.25, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: ".hm-quote", start: phone ? "top 35%" : "top center", end: phone ? "bottom 90%" : "bottom center", scrub: 2 },
    });
    return () => split.revert();
  });

  // Area accordion — click to open, click again to close (each independent)
  document.querySelectorAll("[data-acc]").forEach((it) => {
    const q = it.querySelector("button");
    q.addEventListener("click", () => { const on = !it.classList.contains("is-open"); it.classList.toggle("is-open", on); q.setAttribute("aria-expanded", String(on)); });
  });

  document.querySelectorAll(".hm-pub").forEach((c) => c.addEventListener("mouseleave", () => c.classList.add("is-left")));

  // Publication slider — arrows move one page at a time (.5s), blocked at the ends
  const slider = document.querySelector("[data-slider]");
  if (slider) {
    const track = slider.querySelector("[data-track]");
    const prev = slider.querySelector("[data-prev]"), next = slider.querySelector("[data-next]");
    let idx = 0;
    const perView = () => Math.max(1, Math.round(slider.clientWidth / track.children[0].getBoundingClientRect().width));
    const max = () => Math.max(0, track.children.length - perView());
    const go = (i) => {
      idx = Math.max(0, Math.min(max(), i));
      const step = track.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
      track.style.transform = `translateX(${-idx * step}px)`;
      prev.disabled = idx === 0;
      next.disabled = idx >= max();
    };
    prev.addEventListener("click", () => go(idx - 1));
    next.addEventListener("click", () => go(idx + 1));
    addEventListener("resize", () => go(idx));
    go(0);
  }
})();
