// When the photo frame reaches 72% of the screen, a cropped face (20% on all sides) at .6 size in the center opens to fill the frame in .9s, while the inner photo settles from 1.1 to 1 — once only (Brand photo frame)
// With round·fade, the clipped face opens from a rounded window into square cells and fades on from transparent (Brand photo collage: 10% on all sides · roundness 100px · 1s, transparent 1.5s ease)
(() => {
  kfFx.register("inset-zoom-reveal", (el, { options, reduce, scroller }) => {
    const media = el.querySelector('[data-fx-part="media"]') || el.firstElementChild;
    if (reduce) return;
    const from = +(options.from ?? 0.6), zoom = +(options.zoom ?? 1.1), dur = +(options.dur ?? 0.9), cut = ((1 - from) / 2) * 100;
    const round = +(options.round ?? 0), fade = +(options.fade ?? 0);
    const ease = kfFx.ease(options.ease || "0.625,0.05,0,1", "power3.inOut");
    const shape = (c, r) => `inset(${c}% ${c}% ${c}% ${c}%${round ? ` round ${r}px` : ""})`;
    gsap.set(el, { clipPath: shape(cut, round), ...(fade && { opacity: 0 }) });
    if (media && zoom !== 1) gsap.set(media, { scale: zoom });
    const tl = gsap.timeline({ paused: true })
      .to(el, { clipPath: shape(0, 0), duration: dur, ease }, 0);
    if (media && zoom !== 1) tl.to(media, { scale: 1, duration: dur, ease }, 0);
    if (fade) tl.to(el, { opacity: 1, duration: fade, ease: kfFx.ease(options["fade-ease"] || "0.25,0.1,0.25,1", "power1.inOut") }, 0);
    const st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 72%", once: true, onEnter: () => tl.play() });
    return () => { st.kill(); tl.kill(); gsap.set(el, { clearProps: fade ? "clipPath,opacity" : "clipPath" }); if (media) gsap.set(media, { clearProps: "transform" }); };
  });
})();
