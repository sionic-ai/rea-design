// Gap-closing pinned section: two huge title halves spread ±30vw apart on a stage stuck to the screen converge at center (letters settle in place at ±80px·.95),
// The photo window in that gap opens from inset 50% and the photo changes every .8 seconds — Brand ”WE CLOSE THAT GAP”
(() => {
  kfFx.register("gap-close-pin", (el, { options, reduce, scroller }) => {
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const stage = part("stage") || el, left = part("left"), right = part("right"), win = part("window");
    if (!left || !right) return;
    gsap.registerPlugin(ScrollTrigger);
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    const spread = +(options.spread ?? 30), shift = +(options.shift ?? 80), each = +(options.each ?? 0.022), every = +options.every || 800, round = options.round ?? "0.25rem";
    const ease = kfFx.ease(options.ease || "0.22,1,0.36,1", "power3.out");
    let idx = 0, timer = null;
    photos.forEach((p, i) => gsap.set(p, { opacity: +(i === 0) }));
    if (reduce) { gsap.set([left, right], { x: 0 }); return () => gsap.set([left, right, ...photos], { clearProps: "all" }); }
    const flip = () => { if (photos.length < 2) return; gsap.set(photos[idx], { opacity: 0 }); idx = (idx + 1) % photos.length; gsap.set(photos[idx], { opacity: 1 }); };
    const run = () => { if (!timer) timer = setInterval(flip, every); };
    const halt = () => { clearInterval(timer); timer = null; };
    const cycle = ScrollTrigger.create({ scroller, trigger: el, start: "top bottom", end: "bottom top", onEnter: run, onLeave: halt, onEnterBack: run, onLeaveBack: halt });
    gsap.set(left, { x: `${-spread}vw` }); gsap.set(right, { x: `${spread}vw` });
    const tl = gsap.timeline({ scrollTrigger: { scroller, trigger: el, start: "top 50%", end: "bottom top", scrub: true } }).to([left, right], { x: "0vw", duration: 0.95, ease });
    if (win) tl.fromTo(win, { clipPath: `inset(50% 50% 50% 50% round ${round})` }, { clipPath: `inset(0% 0% 0% 0% round ${round})`, duration: 0.95, ease }, "<");
    const splits = [], tweens = [];
    if (window.SplitText) [left, right].forEach((half) => {
      const isLeft = half === left;
      splits.push(SplitText.create(half, { type: "words,chars", wordsClass: "fx-gcp-word", autoSplit: true, onSplit(s) {
        gsap.set(s.chars, { display: "inline-block", x: isLeft ? -shift : shift, scaleY: 0.95, opacity: 0 });
        const tw = gsap.to(s.chars, { keyframes: { "40%": { opacity: 1 }, "90%": { x: 0, scaleY: 1 }, "100%": {} }, duration: 1, ease: "expo.out", stagger: { each, from: isLeft ? "end" : "start" }, scrollTrigger: { scroller, trigger: stage, start: "top 50%", end: "bottom top", scrub: 0.5, invalidateOnRefresh: true } });
        tweens.push(tw);
        return tw;
      } }));
    });
    return () => { halt(); cycle.kill(); tl.scrollTrigger?.kill(); tl.kill(); tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); }); splits.forEach((s) => s.revert()); gsap.set([left, right, win, ...photos].filter(Boolean), { clearProps: "all" }); };
  });
})();
