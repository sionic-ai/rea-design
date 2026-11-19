(() => {
  // Fixed photo that sinks as it is covered — when the top edge of the section (the attached element) touches the top of the screen, the photo panel (data-fx-part="image") attached,
  // Until the section’s bottom end goes one more screen above the top of the screen, the dark overlay and blur on the plate are tied to scroll and deepen.
  // Meanwhile the text card (card) inside the section appears, and the next section covers over it upward
  kfFx.register("pin-blur-cover", (el, { options, reduce, scroller }) => {
    const image = el.querySelector('[data-fx-part="image"]');
    if (!image) return;
    const overlay = el.querySelector('[data-fx-part="overlay"]'), blur = el.querySelector('[data-fx-part="blur"]'), card = el.querySelector('[data-fx-part="card"]');
    if (reduce) { if (card) gsap.set(card, { opacity: 1 }); return () => card && gsap.set(card, { clearProps: "opacity" }); }
    gsap.registerPlugin(ScrollTrigger);
    const scrub = options.scrub === "true" ? true : +(options.scrub ?? 1);
    const phone = matchMedia(`(max-width: ${options.phone || 900}px)`).matches;
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, ...(scroller && { scroller }), scrub, pin: image, start: options.start || "top 0%", end: options.end || "bottom -100%" } });
    if (overlay) tl.fromTo(overlay, { opacity: 0 }, { opacity: 1 }, "<");
    if (blur) tl.to(blur, { opacity: 1, delay: +(options.delay ?? 0.2) });
    let tc = null;
    if (card) tc = gsap.timeline({ scrollTrigger: { trigger: el, ...(scroller && { scroller }), scrub, start: "top top", end: phone ? (options["phone-card-end"] || "bottom 10%") : (options["card-end"] || "bottom 30%") } }).fromTo(card, { opacity: 0 }, { opacity: 1 });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); tc?.scrollTrigger?.kill(); tc?.kill(); gsap.set([overlay, blur, card].filter(Boolean), { clearProps: "opacity" }); };
  });
})();
