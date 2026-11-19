// The window is cut with an objectBoundingBox clipPath and that path is cycled through five types with MorphSVG — words, corners and photos share the type’s tempo
(() => {
  const FORMS = ["M.08 .22 L.42 .04 L.6 .16 L.93 .1 L.97 .58 L.74 .96 L.3 .88 L.03 .66Z", "M.02 .3 L.3 .3 L.3 .06 L.7 .06 L.7 .28 L.98 .32 L.9 .8 L.6 .97 L.12 .9Z", "M.18 .02 L.84 .12 L.99 .46 L.82 .62 L.9 .98 L.36 .9 L.04 .74 L.1 .4Z", "M.05 .12 L.62 .02 L.62 .2 L.96 .24 L.88 .7 L.98 .94 L.3 .98 L.02 .6Z", "M.3 .02 L.98 .2 L.86 .56 L.98 .7 L.66 .98 L.06 .86 L.16 .5 L.02 .24Z"];
  const DOT = "M.5 .47 L.53 .5 L.5 .53 L.47 .5Z";
  let n = 0;
  kfFx.register("shape-cycle", (el, { options, reduce, scroller }) => {
    const shape = el.querySelector(':scope > [data-fx-part="shape"]');
    if (!shape || !window.MorphSVGPlugin) return;
    gsap.registerPlugin(MorphSVGPlugin);
    const pics = [...shape.querySelectorAll('[data-fx-part="pic"]')];
    const corners = [...el.querySelectorAll(':scope > [data-fx-part="corner"]')];
    const words = [...el.querySelectorAll('[data-fx-part="word"]')];
    const id = `fx-sc-${++n}`, svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.style.position = "absolute";
    svg.innerHTML = `<clipPath id="${id}" clipPathUnits="objectBoundingBox"><path d="${reduce ? FORMS[0] : DOT}"/></clipPath>`;
    el.prepend(svg);
    shape.style.clipPath = `url(#${id})`;
    if (reduce) return () => { svg.remove(); shape.style.removeProperty("clip-path"); };
    const path = svg.querySelector("path"), dur = +(options.dur ?? 1), hold = +(options.hold ?? 0.5);
    const L0 = innerWidth <= 468 ? "95%" : "97%";
    const POS = [["4%", "4%", "0%", "3%", "20%", "0%", "3%", "3%", "0%"], ["4%", L0, "-100%", "42%", "5%", "3%", "3%", "48%", "0%"], ["4%", "4%", "0%", "30%", "4%", "0%", "3%", "3%", "0%"], ["4%", "4%", "0%", "58%", L0, "-100%", "3%", "25%", "0%"]];
    const count = Math.max(words.length, pics.length, 2);
    if (words.length) gsap.set(words.slice(1), { yPercent: 105 });
    if (pics.length) gsap.set(pics.slice(1), { opacity: 0 });
    const loop = gsap.timeline({ repeat: -1, paused: true });
    const step = (a, b, form, pos) => {
      loop.to(path, { morphSVG: { shape: form, type: "linear", map: "size" }, duration: dur, ease: "power4.inOut", onStart: () => el.dispatchEvent(new CustomEvent("fx:step", { detail: { index: b } })) }, `+=${hold / 5}`);
      if (words[a]) loop.to(words[a], { yPercent: -105, duration: dur / 2, ease: "power3.in" }, "<");
      if (words[b]) loop.fromTo(words[b], { yPercent: 105 }, { yPercent: 0, duration: dur / 2, delay: dur / 2, ease: "power3.out" }, "<");
      const props = [["top", "left"], ["bottom", "left"], ["bottom", "right"]];
      corners.slice(0, 3).forEach((c, k) => loop.to(c, { [props[k][0]]: pos[k * 3], [props[k][1]]: pos[k * 3 + 1], x: pos[k * 3 + 2], duration: dur, ease: "power3.inOut" }, k ? "<" : `<-=${dur / 2}`));
      if (pics[b % pics.length] && pics.length > 1) loop.fromTo(pics[b % pics.length], { opacity: 0 }, { opacity: 1, duration: dur, ease: "power3.inOut", onComplete: () => gsap.set(pics[a % pics.length], { opacity: 0 }) }, "<");
      loop.to({}, { duration: hold });
    };
    for (let i = 0; i < count - 1; i++) step(i, i + 1, FORMS[(i % 4) + 1], POS[i % 4]);
    step(count - 1, 0, FORMS[0], ["3%", L0, "-100%", "40%", "3%", "0%", "3%", "14%", "0%"]);
    const intro = gsap.timeline({ paused: true });
    intro.from(el, { scale: 0.01, duration: 1, ease: "power2.out" });
    intro.to(path, { morphSVG: { shape: FORMS[0], type: "linear", map: "size" }, duration: 0.75, ease: "back.inOut(.75)" }, "<+=.05");
    intro.add(() => loop.play());
    const st = ScrollTrigger.create({ scroller, trigger: el, start: "top 95%", end: "bottom 40%", onEnter: () => (intro.progress() < 1 ? intro.play() : loop.play()), onLeave: () => loop.pause(), onEnterBack: () => loop.play(), onLeaveBack: () => loop.pause() });
    return () => { st.kill(); intro.kill(); loop.kill(); svg.remove(); shape.style.removeProperty("clip-path"); gsap.set([el, ...corners, ...words, ...pics], { clearProps: "all" }); };
  });
})();
