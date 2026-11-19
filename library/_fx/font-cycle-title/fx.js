// The middle word of the three-line big title swaps through several typefaces with a thud and settles on the last one, and then the top and bottom words sharpen from blur and come into place.
// The center word frame appears from 1.4x to 1.2x and stays while the word swaps, and once settled it shrinks to 1x and steps half an em to the left.
(() => {
  kfFx.register("font-cycle-title", (el, { options, reduce }) => {
    const stack = el.querySelector("[data-fx-part=stack]");
    const variants = stack ? [...stack.querySelectorAll("[data-fx-part=variant]")] : [];
    if (!stack || !variants.length) return;
    const words = [...el.querySelectorAll("[data-fx-part=word]")];
    const last = variants[variants.length - 1];
    const tailWord = words.length > 1 ? words[words.length - 1] : null;
    const shift = options.shift ?? "-0.5em";
    const tail = options.tail ?? "0.5em";
    const done = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));

    if (reduce) {
      gsap.set(variants, { autoAlpha: 0 });
      gsap.set(last, { autoAlpha: 1 });
      gsap.set(stack, { autoAlpha: 1, scale: 1, x: shift });
      if (words.length) gsap.set(words, { autoAlpha: 1, filter: "blur(0px)", y: 0 });
      if (tailWord) gsap.set(tailWord, { marginRight: tail });
      done();
      return () => gsap.set([stack, ...variants, ...words], { clearProps: "all" });
    }

    const step = +(options.step ?? 0.11);
    const loops = +(options.loops || 4);
    const blur = +(options.blur ?? 30);
    const rise = +(options.rise ?? 30);
    const tl = gsap.timeline({ paused: true, delay: +(options.delay ?? 0.35) });
    if (words.length) gsap.set(words, { autoAlpha: 0, filter: `blur(${blur}px)`, y: (i) => (i === 0 ? -rise : rise) });
    gsap.set(variants, { autoAlpha: 0 });
    gsap.set(stack, { scale: 1.4, opacity: 0 });

    tl.to(stack, { autoAlpha: 1, scale: 1.2, duration: 1.2, ease: "power3.inOut" }, 0);
    // The font swap starts at half of the appear time (.6s) at step intervals, repeats the font order loops times, and lands on the last set
    const start = tl.duration() * 0.5;
    const order = Array.from({ length: loops }, () => variants.map((_, i) => i)).flat();
    const span = order.length * step;
    tl.to(stack, { scale: 1.2, duration: start + span, ease: "power3.out" }, 0);
    order.forEach((k, i) => tl.add(() => { gsap.set(variants, { autoAlpha: 0 }); gsap.set(variants[k], { autoAlpha: 1 }); }, start + (span * i) / order.length));
    const settle = start + span;
    tl.add(done, settle);
    tl.to(stack, { scale: 1, duration: variants.length * step + 0.2, ease: "expo.out" }, settle);
    if (words.length) {
      tl.to(words, { autoAlpha: 1, filter: "blur(0px)", duration: 1, stagger: 0.05, ease: "power2.out" }, settle);
      tl.to(words, { y: 0, duration: 0.8, stagger: 0.05, ease: "expo.out" }, settle + 0.15);
    }
    tl.to(stack, { x: shift, duration: 0.8, ease: "expo.inOut" }, settle + 0.3);
    if (tailWord) tl.to(tailWord, { marginRight: tail, duration: 1, ease: "expo.inOut" }, settle + 0.3);
    tl.play();

    return () => {
      tl.kill();
      gsap.set([stack, ...variants, ...words], { clearProps: "all" });
    };
  });
})();
