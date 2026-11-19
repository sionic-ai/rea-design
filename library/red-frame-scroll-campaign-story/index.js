// Ties the whole document height (40 screens) to a single timeline with scrub 1 — original label order (kv → story → about → history → desc → dreamer → entry → supporter → report).
// Inside the scene, [data-in] elements rise in turn from 60px below over 1s expo.out and exit upward over 0.7s expo.in. The distance number counts up from 0 while the scene stays on screen.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s) => document.querySelector(s);
  const scene = (n) => $(`[data-scene="${n}"]`);
  const tl = gsap.timeline({ paused: true, defaults: { overwrite: "auto" } });
  const ins = (sc) => sc.querySelectorAll("[data-in]");
  const enter = (n, at) => {
    const sc = scene(n);
    tl.addLabel(n, at)
      .set(sc, { visibility: "visible" }, at)
      .to(sc, { opacity: 1, duration: 0.3, ease: "power1.out" }, at)
      .fromTo(ins(sc), { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.12, ease: "expo.out", immediateRender: false }, at);
  };
  const leave = (n, at) => {
    const sc = scene(n);
    tl.to(ins(sc), { y: -60, autoAlpha: 0, duration: 0.7, stagger: 0.05, ease: "expo.in" }, at)
      .to(sc, { opacity: 0, duration: 0.3, ease: "power1.in" }, at + 0.7)
      .set(sc, { visibility: "hidden" }, at + 1);
  };
  const count = (el, at, dur) => {
    const to = +el.dataset.count, o = { v: 0 };
    tl.to(o, { v: to, duration: dur, ease: "none", onUpdate: () => (el.textContent = Math.floor(o.v).toLocaleString("en-US")) }, at);
  };

  tl.addLabel("kv", 0).addLabel("kv_hide", 0.5)
    .to(".jl-kv__person .jl-kv__in", { xPercent: -30, autoAlpha: 0, duration: 0.8, ease: "expo.in" }, 0.5)
    .to(".jl-kv__plane .jl-kv__in", { xPercent: 30, yPercent: -20, autoAlpha: 0, duration: 0.8, ease: "expo.in" }, 0.5)
    .to(".jl-kv__ticket .jl-kv__in", { xPercent: 20, autoAlpha: 0, duration: 0.8, ease: "expo.in" }, 0.5)
    .to([".jl-kv__mile .jl-kv__in", ".jl-kv__note", ".jl-kv__line"], { autoAlpha: 0, duration: 0.5, ease: "power1.in" }, 0.6)
    .fromTo(".jl-bnr", { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.5, ease: "power1.in", immediateRender: false }, 0.6)
    .fromTo(".jl-globe", { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 0.75, scale: 1, duration: 1.5, ease: "power2.inOut", immediateRender: false }, 1.2);
  enter("story", 1.5); leave("story", 4.5);
  tl.to(".jl-globe", { xPercent: 70, scale: 0.8, autoAlpha: 1, duration: 1.5, ease: "power2.inOut" }, 4.8);
  enter("about", 5.5); leave("about", 8.5);
  tl.to(".jl-globe", { xPercent: 0, yPercent: 40, scale: 1.6, autoAlpha: 0.35, duration: 1.5, ease: "power2.inOut" }, 8.8);
  enter("history", 9.5); leave("history", 13.5);
  tl.to(".jl-globe", { yPercent: 0, scale: 1.1, autoAlpha: 0.35, duration: 1.5, ease: "power2.inOut" }, 13.8);
  enter("desc", 14.5); count($(".jl-desc__km [data-count]"), 15, 1.8); leave("desc", 17.5);
  tl.to(".jl-globe", { xPercent: -60, scale: 0.7, autoAlpha: 0.75, duration: 1.5, ease: "power2.inOut" }, 17.8);
  enter("dreamer", 18.5); count($(".jl-dreamer [data-count]"), 19, 2.5);
  tl.fromTo(".jl-entry", { autoAlpha: 0, yPercent: 100 }, { autoAlpha: 1, yPercent: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, 18.8);
  leave("dreamer", 22.5);
  tl.to(".jl-globe", { autoAlpha: 0, duration: 0.8, ease: "power1.in" }, 22.6);
  enter("entry", 23.5); leave("entry", 26.5);
  tl.to(".jl-entry", { autoAlpha: 0, yPercent: 100, duration: 0.5, ease: "power2.in" }, 26.8);
  enter("supporter", 27.5); count($(".jl-supporter [data-count]"), 28, 2.5); leave("supporter", 31.5);
  enter("report", 32.5);
  tl.fromTo(".jl-book__page.is-left", { rotateY: 0 }, { rotateY: 180, duration: 1.5, ease: "power2.inOut", immediateRender: false }, 34)
    .to({}, { duration: 1.5 }, 35.5);

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const st = ScrollTrigger.create({
      animation: tl,
      trigger: document.body,
      start: "top top",
      end: () => document.documentElement.scrollHeight - innerHeight,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (s) => window.jlFrame.progress(s.progress),
    });
    window.jlFrame.go = (label) => {
      const t = tl.labels[label] ?? 0;
      scrollTo({ top: st.start + (st.end - st.start) * (t / tl.duration()) + 2, behavior: "instant" });
    };
    return () => st.kill();
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    // Reduced motion — stack scenes one after another (release the pinned board and flow like a document)
    document.documentElement.classList.add("jl-static");
    gsap.set(".jl-scene", { visibility: "visible", opacity: 1 });
    window.jlFrame.go = (label) => scene(label)?.scrollIntoView();
  });
})();
