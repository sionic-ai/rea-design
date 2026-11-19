// The new section turns on above the previous one (the previous stays underneath until the next transition), and the photo and card parallax inside is handled by the css transition.
// Auto-advance only while the board is inside the start line — counts every s afresh after each advance
(() => {
  kfFx.register("rise-fade-slides", (el, { options, reduce, scroller }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length) return;
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const prevB = part("prev"), nextB = part("next"), now = part("now"), total = part("total");
    const every = +(options.every ?? 6.8) * 1000;
    const pad = (n) => String(n).padStart(2, "0");
    let cur = 0, timer = null, playing = false;
    const show = (n) => {
      const prev = cur;
      cur = (n + slides.length) % slides.length;
      slides.forEach((s, i) => {
        s.classList.toggle("is-on", i === cur);
        s.classList.toggle("is-prev", i === prev && prev !== cur);
      });
      if (now) now.textContent = pad(cur + 1);
    };
    const tick = () => {
      clearTimeout(timer);
      if (playing && slides.length > 1) timer = setTimeout(() => { show(cur + 1); tick(); }, every);
    };
    const play = () => { playing = !reduce; tick(); };
    const stop = () => { playing = false; clearTimeout(timer); };
    if (total) total.textContent = pad(slides.length);
    slides[0].classList.add("is-on");
    if (now) now.textContent = pad(1);
    const go = (d) => () => { show(cur + d); tick(); };
    const onPrev = go(-1), onNext = go(1);
    prevB?.addEventListener("click", onPrev);
    nextB?.addEventListener("click", onNext);
    let st = null;
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top 80%", onEnter: play, onLeave: stop, onEnterBack: play, onLeaveBack: stop });
    } else play();
    return () => {
      stop(); st?.kill();
      prevB?.removeEventListener("click", onPrev);
      nextB?.removeEventListener("click", onNext);
      slides.forEach((s) => s.classList.remove("is-on", "is-prev"));
    };
  });
})();
