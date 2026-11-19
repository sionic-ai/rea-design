// About the company — in the pinned panel, for each section the name list rises in .8s Out and the current name brightens, the photo opens from below (next) or above (previous), and the text rises (original initStickySlider)
(() => {
  const LV = window.LV;
  LV.pages.about = (root) => {
    const box = root.querySelector("[data-sticky-slider]");
    if (!box) return;
    const slides = [...box.querySelectorAll("[data-sticky-slide]")], trig = [...box.querySelectorAll("[data-sticky-trigger]")], names = [...box.querySelectorAll("[data-sticky-name]")], track = box.querySelector("[data-sticky-names]");
    const bar = box.querySelector(".values-progress");
    let cur = 0, z = slides.length;
    const els = (s) => [...s.querySelectorAll("[data-el]")];
    const mark = (i) => { names.forEach((n) => n.classList.remove("is-active")); names[i].classList.add("is-active"); gsap.to(track, { y: -(names[i].offsetTop - names[0].offsetTop), duration: LV.durM, ease: "Out" }); };
    const show = (s, dir) => {
      s._hide?.kill();
      gsap.set(s, { display: "block", zIndex: ++z });
      const a = els(s);
      gsap.set(a, { clearProps: "opacity" });
      a.forEach((e, k) => LV.REVEAL[e.dataset.el]?.(e, "reveal", k * LV.stagger, dir));
      return a.length * LV.stagger + LV.durL;
    };
    const go = (i) => {
      if (i === cur) return;
      const was = slides[cur], dir = i > cur ? "next" : "prev";
      cur = i;
      gsap.to(was.querySelectorAll('[data-el]:not([data-el="slide"])'), { opacity: 0, duration: 0.2, ease: "Out" });
      const t = show(slides[i], dir);
      mark(i);
      was._hide = gsap.delayedCall(t, () => gsap.set(was, { display: "none" }));
    };
    slides.slice(1).forEach((s) => els(s).forEach((e) => LV.REVEAL[e.dataset.el]?.(e, "initial")));
    gsap.set(slides.slice(1), { display: "none" });
    els(slides[0]).forEach((e) => (e.style.visibility = "visible"));
    mark(0);
    trig.forEach((t, i) => ScrollTrigger.create({ trigger: t, start: "top center", end: "bottom center", onEnter: () => go(i), onEnterBack: () => go(i) }));
    ScrollTrigger.create({ trigger: box, start: "top top", end: "bottom bottom", onUpdate: (s) => bar?.style.setProperty("--progress", s.progress) });
    names.forEach((n, i) => n.addEventListener("click", () => (LV.lenis ? LV.lenis.scrollTo(trig[i], { offset: -innerHeight / 2 + trig[i].offsetHeight / 2 }) : trig[i].scrollIntoView({ block: "center" }))));
  };
})();
