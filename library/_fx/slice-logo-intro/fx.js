// First-open curtain — pictures in the pieces slide in from the left one after another then exit to the right, and the curtain draws back to the right
(() => {
  kfFx.register("slice-logo-intro", (el, { options, reduce }) => {
    const done = () => { el.setAttribute("data-intro-done", ""); el.dispatchEvent(new CustomEvent("fx-done")); };
    const key = "fx-slice-logo-intro";
    if (reduce || (options.once === "session" && sessionStorage.getItem(key))) { done(); return () => el.removeAttribute("data-intro-done"); }
    const art = [...el.querySelectorAll('[data-fx-part="slice"]')].map((s) => s.firstElementChild).filter(Boolean);
    const msg = el.querySelector('[data-fx-part="message"]');
    const split = msg && window.SplitText && msg.textContent.trim() ? new SplitText(msg, { type: "words" }) : null;
    const words = split ? split.words : [];
    const each = +(options.each ?? 0.12), dur = +(options.dur ?? 1), hold = +(options.hold ?? 0.5), wipe = +(options.wipe ?? 1.5);
    if (options.once === "session") sessionStorage.setItem(key, "1");
    const tl = gsap.timeline({ delay: +(options.delay ?? 1), onComplete: done });
    if (msg) tl.set(msg, { autoAlpha: 1 });
    if (art.length) tl.fromTo(art, { autoAlpha: 0, xPercent: -100 }, { autoAlpha: 1, xPercent: 0, stagger: each, duration: dur, ease: "power4.out" }, 0);
    if (words.length) tl.fromTo(words, { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.1, duration: dur, ease: "power4.inOut" }, 0);
    const out = tl.duration() + hold;
    if (art.length) tl.to(art, { autoAlpha: 0, xPercent: 100, stagger: each, duration: dur, ease: "power4.in" }, out);
    if (words.length) tl.to(words, { autoAlpha: 0, stagger: 0.1, duration: dur, ease: "power4.inOut" }, out);
    tl.to(el, { clipPath: "inset(0% 0% 0% 100%)", duration: wipe, ease: "expo.inOut" }, out + 0.4);
    return () => {
      tl.kill();
      split?.revert();
      gsap.set([el, ...art], { clearProps: "all" });
      if (msg) gsap.set(msg, { clearProps: "all" });
      el.removeAttribute("data-intro-done");
    };
  });
})();
