// Big title letters rise 30px and open from a frame clipped at the bottom (clip inset bottom 100% → -20%) while fading from a tinted color to ink color, and the small English title blurs in and turns on after .15s,
// The description floats up 10px after .2s — restarts from the beginning when it reaches 95% of the screen, reverses when scrolled back up. When the text exceeds 6 characters the letter spacing is halved
(() => {
  const split = (el) => {
    if (el.dataset.fxSplit) return [...el.querySelectorAll(".fx-l")];
    el.dataset.fxSplit = el.innerHTML;
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((ln) => '<span class="fx-ln" aria-hidden="true">' + ln.replace(/<[^>]+>/g, "").split(" ").map((w) => '<span class="fx-w">' + [...w].map((c) => `<span class="fx-l">${c}</span>`).join("") + "</span>").join(" ") + "</span>").join("<br>");
    return [...el.querySelectorAll(".fx-l")];
  };
  const unsplit = (el) => { if (el?.dataset.fxSplit != null) { el.innerHTML = el.dataset.fxSplit; delete el.dataset.fxSplit; el.removeAttribute("aria-label"); } };
  kfFx.register("letter-clip-tint", (el, { options, reduce, scroller }) => {
    const main = el.querySelector('[data-fx-part="main"]');
    if (!main || !main.textContent.trim()) return;
    const sub = el.querySelector('[data-fx-part="sub"]'), desc = el.querySelector('[data-fx-part="desc"]');
    const ls = split(main), ss = sub ? split(sub) : [];
    if (reduce) return () => { unsplit(main); unsplit(sub); };
    const each = ls.length > 6 ? +(options["each-long"] ?? 0.045) : +(options.each ?? 0.09);
    const ease = kfFx.ease(options.ease || "0.16,1,0.3,1", "expo.out");
    const tint = getComputedStyle(el).getPropertyValue("--fx-tint").trim() || getComputedStyle(document.documentElement).getPropertyValue("--kf-accent").trim();
    const ink = getComputedStyle(main).color;
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(ls, { clipPath: "inset(0% 0% 100% 0%)", y: +(options.rise ?? 30) }, { visibility: "visible", x: 0, y: 0, clipPath: "inset(0% 0% -20% 0%)", duration: +(options.dur ?? 0.8), ease, stagger: { each } });
    tl.fromTo(ls, { color: tint }, { color: ink, duration: 0.35, delay: 0.2, ease: "power1.in", stagger: { each } }, "<");
    if (ss.length) tl.fromTo(ss, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "power1.out", stagger: { amount: 0.3 } }, "<+=.15");
    if (desc) tl.fromTo(desc, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power2.out" }, "<+=.2");
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ scroller, trigger: el, start: options.start || "top 95%", onEnter: () => tl.restart(), onLeaveBack: () => tl.reverse() });
    return () => { st.kill(); tl.kill(); gsap.set([...ls, ...ss, desc].filter(Boolean), { clearProps: "all" }); unsplit(main); unsplit(sub); };
  });
})();
