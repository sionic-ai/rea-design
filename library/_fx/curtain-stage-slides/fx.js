// Photo stage — stretches the panel height by (lead + per×p + lead) screens for p photos, keeps the inner stage pinned, and from the second photo on, each one covers the last from below every per screens:
// The section moves yPercent 100→0 and its inside −100→0 together (ease none, scrub true), revealing like a curtain being drawn back.
// Section photo ([data-fx-part=image]) starts at yPercent 10 for the first section and 30 for the rest → −10 and −30 for the last, flowing across the whole stage at 1.2→1.3 scale.
// For each section, apply fx:slide to elements as they enter and leave that section’s first screen { index, active, progress } Fires — hook the Lottie frame and text entrance on this.
(() => {
  kfFx.register("curtain-stage-slides", (el, { options, reduce, scroller }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length) return;
    const inners = slides.map((s) => s.querySelector('[data-fx-part="inner"]') || s);
    const per = +(options.per ?? 1.5), lead = +(options.lead ?? 0.5), tail = +(options.tail ?? 0.5);
    const P = slides.length;
    el.style.setProperty("--fx-screens", lead + per * P + tail);
    const send = (index, active, progress) => el.dispatchEvent(new CustomEvent("fx:slide", { detail: { index, active, progress } }));
    if (reduce || !window.ScrollTrigger) { slides.forEach((s, i) => send(i, true, 1)); return () => el.style.removeProperty("--fx-screens"); }
    const vh = () => (scroller ? scroller.clientHeight : innerHeight);
    const at = (k) => () => `top+=${vh() * k} top`;
    const made = [];
    gsap.set(slides, { yPercent: 100 }); gsap.set(slides[0], { yPercent: 0 });
    gsap.set(inners, { yPercent: -100 }); gsap.set(inners[0], { yPercent: 0 });
    if (P > 1) {
      const wipe = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: at(lead), end: at(lead + (P - 1) * per), scrub: true, invalidateOnRefresh: true } });
      slides.forEach((s, t) => { if (!t) return; const k = (t - 1) * per + lead; wipe.to(s, { yPercent: 0, ease: "none", duration: 1 }, k).to(inners[t], { yPercent: 0, ease: "none", duration: 1 }, k); });
      made.push(wipe);
    }
    slides.forEach((s, i) => {
      const img = s.querySelector('[data-fx-part="image"]');
      if (img) made.push(gsap.fromTo(img, { yPercent: i === 0 ? 10 : 30, scale: 1.2 }, { yPercent: i === P - 1 ? -10 : -30, scale: 1.3, ease: "none", scrollTrigger: { trigger: el, scroller, start: at(lead), end: at(lead + (P - 1) * per + 1), scrub: true, invalidateOnRefresh: true } }));
      made.push(ScrollTrigger.create({ trigger: el, scroller, start: at(per * i), end: at(per * i + 1), invalidateOnRefresh: true, onToggle: (st) => send(i, st.isActive, st.progress), onUpdate: (st) => send(i, true, st.progress) }));
    });
    return () => { made.forEach((m) => { m.scrollTrigger?.kill(); m.kill(); }); gsap.set([...slides, ...inners], { clearProps: "transform" }); el.style.removeProperty("--fx-screens"); };
  });
})();
