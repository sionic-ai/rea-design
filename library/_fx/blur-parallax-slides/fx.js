(() => {
  // When a photo panel slides sideways, the photo inside moves the opposite way by shift vw while blurring (outgoing slide), and the incoming slide’s photo clears its blur and grows by zoom times —
  // Panel and photo move by different distances to create parallax, both with the same length and curve (original: Swiper speed 3000 + photo transition 3s ease)
  kfFx.register("blur-parallax-slides", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length || typeof gsap === "undefined") return;
    const media = slides.map((s) => s.querySelector('[data-fx-part="media"]') || s);
    const every = Math.max(0.5, +(options.every || 6)), dur = +(options.dur ?? 3), shift = +(options.shift ?? 40);
    const blur = +(options.blur ?? 30), zoom = +(options.zoom ?? 1.2), ease = kfFx.ease(options.ease || "0.25,0.1,0.25,1", "power1.inOut");
    const dotsBox = el.querySelector('[data-fx-part="dots"]');
    let i = 0, timer = 0, busy = null;
    const sharp = { x: 0, scale: zoom, filter: "blur(0px)" };
    gsap.set(slides, { xPercent: 100, autoAlpha: 0 });
    gsap.set(slides[0], { xPercent: 0, autoAlpha: 1 });
    gsap.set(media, { x: 0, scale: 1, filter: `blur(${blur}px)` });
    gsap.set(media[0], sharp);
    const dots = dotsBox ? slides.map((_, n) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `${n + 1}Nth photo`);
      b.addEventListener("click", () => { go(n); restart(); });
      dotsBox.append(b);
      return b;
    }) : [];
    const mark = () => dots.forEach((b, n) => b.classList.toggle("is-active", n === i));
    // Going forward the panel goes left and the outgoing photo goes right (+shift) · going back is reversed
    const go = (n) => {
      n = (n + slides.length) % slides.length;
      if (n === i) return;
      const dir = n > i || (i === slides.length - 1 && n === 0 && slides.length > 2) ? 1 : -1;
      const from = i;
      i = n;
      mark();
      busy?.progress(1);
      if (reduce || !dur) {
        gsap.set(slides[from], { autoAlpha: 0 });
        gsap.set(media[from], { x: 0, scale: 1, filter: `blur(${blur}px)` });
        gsap.set(slides[n], { xPercent: 0, autoAlpha: 1 });
        gsap.set(media[n], sharp);
        return;
      }
      gsap.set(slides[n], { xPercent: 100 * dir, autoAlpha: 1 });
      gsap.set(media[n], { x: `${-shift * dir}vw`, scale: 1, filter: `blur(${blur}px)` });
      busy = gsap.timeline({ defaults: { duration: dur, ease }, onComplete: () => { gsap.set(slides[from], { autoAlpha: 0 }); busy = null; } })
        .to(slides[from], { xPercent: -100 * dir }, 0)
        .to(media[from], { x: `${shift * dir}vw`, scale: 1, filter: `blur(${blur}px)` }, 0)
        .to(slides[n], { xPercent: 0 }, 0)
        .to(media[n], sharp, 0);
    };
    const restart = () => { clearInterval(timer); if (!reduce && slides.length > 1) timer = setInterval(() => go(i + 1), every * 1000); };
    mark();
    restart();
    const next = () => { go(i + 1); restart(); }, prev = () => { go(i - 1); restart(); };
    el.addEventListener("fx:next", next);
    el.addEventListener("fx:prev", prev);
    return () => {
      clearInterval(timer);
      busy?.kill();
      el.removeEventListener("fx:next", next);
      el.removeEventListener("fx:prev", prev);
      dots.forEach((b) => b.remove());
      gsap.set([...slides, ...media], { clearProps: "transform,filter,opacity,visibility" });
    };
  });
})();
