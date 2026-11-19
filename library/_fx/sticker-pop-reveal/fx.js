// Topic stickers pop out first, and from .3s before they finish, that topic’s card group rises (original setupScrollAnimations)
(() => {
  kfFx.register("sticker-pop-reveal", (el, { options, reduce, scroller }) => {
    const sticker = el.querySelector('[data-fx-part="sticker"]');
    const group = el.querySelector('[data-fx-part="group"]');
    if (!sticker && !group) return;
    const targets = [sticker, group].filter(Boolean);
    if (reduce) { gsap.set(targets, { opacity: 1, scale: 1 }); return () => gsap.set(targets, { clearProps: "opacity,scale,transform" }); }
    const from = +(options.from ?? 0.8);
    if (sticker) gsap.set(sticker, { opacity: 0, scale: from });
    if (group) gsap.set(group, { opacity: 0 });
    const by = options.by === "group" && group ? group : sticker || group;
    const tl = gsap.timeline({ scrollTrigger: { trigger: by, scroller: scroller || undefined, start: options.start || "top 70%", toggleActions: "play none none none" } });
    if (sticker) tl.to(sticker, { opacity: 1, scale: 1, duration: +(options.dur ?? 0.5), ease: options.ease || "elastic.out(1, 0.6)" });
    if (group) tl.to(group, { opacity: 1, duration: +(options.fade ?? 1.5), ease: options["fade-ease"] || "power1.out" }, sticker ? `-=${+(options.overlap ?? 0.3)}` : 0);
    return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set(targets, { clearProps: "opacity,scale,transform" }); };
  });
})();
