(() => {
  // Original animateTagline: each character goes from blur(20px), translateY(20px) and transparent, in order from the front at .048s intervals over .6s ease. 20px is based on a 1440 width, so it scales with screen width.
  kfFx.register("ink-bleed-chars", (el, { options, reduce, scroller }) => {
    const text = el.textContent;
    if (!text.trim()) return;
    const was = el.innerHTML;
    el.setAttribute("aria-label", text.trim());
    const frag = document.createDocumentFragment();
    text.trim().split(/(\s+)/).forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) { frag.append(" "); return; }
      const word = document.createElement("span");
      word.className = "fx-ibc-word";
      word.setAttribute("aria-hidden", "true");
      for (const ch of w) {
        const s = document.createElement("span");
        s.className = "fx-ibc-ch";
        s.textContent = ch;
        word.append(s);
      }
      frag.append(word);
    });
    el.replaceChildren(frag);
    const chars = [...el.querySelectorAll(".fx-ibc-ch")];
    // size: fixed does not scale blur and offset to the screen width (a title blur of 6px stays 6px on phones)
    const scale = () => (options.size === "fixed" ? 1 : Math.min(innerWidth / 1440, 1));
    const blur = +(options.blur ?? 20), rise = +(options.rise ?? 20);
    const each = +(options.each ?? 0.048), dur = +(options.dur ?? 0.6), delay = +(options.delay ?? 0.5);
    const ease = kfFx.ease(options.ease || "0.25,0.1,0.25,1", "power1.inOut");
    let st = null, call = null;
    const off = () => { st?.kill(); call?.kill(); gsap.killTweensOf(chars); el.removeEventListener("fx:play", play); el.innerHTML = was; el.removeAttribute("aria-label"); };
    if (reduce) { gsap.set(chars, { opacity: 1 }); return off; }
    gsap.set(chars, { opacity: 0, y: () => rise * scale(), filter: () => `blur(${blur * scale()}px)` });
    const play = (wait = 0) => {
      call?.kill();
      gsap.to(chars, { opacity: 1, y: 0, filter: "blur(0px)", duration: dur, stagger: each, ease, delay: typeof wait === "number" ? wait : 0, overwrite: true, onComplete: () => gsap.set(chars, { clearProps: "filter" }) });
    };
    el.addEventListener("fx:play", play);
    if (options.on === "view") st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 85%", once: true, onEnter: () => play(delay) });
    else if (options.on !== "state") call = gsap.delayedCall(delay, () => play(0));
    return off;
  });
})();
