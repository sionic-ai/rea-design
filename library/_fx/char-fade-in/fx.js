(() => {
  // Original textReveal: when turning on, start from the off values and switch on from the front, when turning off, switch off from the front at the current values (overwrite picks up half-on ones too)
  kfFx.register("char-fade-in", (el, { options, reduce, scroller }) => {
    const text = el.textContent;
    if (!text.trim()) return;
    const was = el.innerHTML;
    el.setAttribute("aria-label", text.trim());
    const frag = document.createDocumentFragment();
    // Position counted per character including spaces (used by spread · reverse)
    const posOf = [];
    let pos = 0;
    text.trim().split(/(\s+)/).forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) { frag.append(" "); pos++; return; }
      const word = document.createElement("span");
      word.className = "fx-cfi-word";
      word.setAttribute("aria-hidden", "true");
      for (const ch of w) {
        const s = document.createElement("span");
        s.className = "fx-cfi-ch";
        s.textContent = ch;
        word.append(s);
        posOf.push(pos++);
      }
      frag.append(word);
    });
    el.replaceChildren(frag);
    const chars = [...el.querySelectorAll(".fx-cfi-ch")];
    const base = +(options.base ?? 0);
    el.style.setProperty("--fx-base", base);
    const off = () => { st?.kill(); gsap.killTweensOf(chars); el.removeEventListener("fx:show", show); el.removeEventListener("fx:hide", hide); el.innerHTML = was; el.classList.remove("fx-cfi-y"); el.removeAttribute("aria-label"); el.style.removeProperty("--fx-base"); };
    let st = null;
    const each = +(options.each ?? 0.02), dur = +(options.dur ?? 0.25), back = +(options.back ?? 0.15);
    // order: shuffle — turns on in a 12-step shuffled cycle (0,1,4,3,2,7,6,5,9,8,11,10) — original site label
    const SHUF = [0, 1, 4, 3, 2, 7, 6, 5, 9, 8, 11, 10];
    // pause: the letter after a period (. 。) is delayed by this amount instead of each — Brand body text uses .026 spacing with .3 after a period
    const pause = options.pause == null ? null : +options.pause;
    let at = 0;
    const delays = pause == null ? null : chars.map((c, i) => (i ? (at += /[.。]/.test(chars[i - 1].textContent) ? pause : each) : 0));
    // spread: spreads the delay from first to last character evenly over this length (seconds) regardless of title length — per-character delay = spread ÷ (character count including spaces).
    // order: reverse starts from the last letter (Brand site’s ”Our Capabilities” goes from the end, ”The Process” from the front — both open in .5s)
    const total = pos;
    const spread = options.spread == null ? null : +options.spread;
    const rev = options.order === "reverse";
    const spreadAt = (i) => posOf[i] * (spread / total);
    const stag = options.order === "shuffle" ? (i) => (SHUF[i % 12] + Math.floor(i / 12) * 12) * each
      : rev ? (i) => (spread != null ? (total - 1 - posOf[i]) * (spread / total) : (chars.length - 1 - i) * each)
      : spread != null ? spreadAt : delays ? (i) => delays[i] : each;
    const easeIn = kfFx.ease(options.ease || "power1.out", "power1.out"), easeOut = kfFx.ease(options["ease-out"] || "power1.in", "power1.in");
    // y: text rises into place from this many px below as it fades in — 4px for the original hero description
    const y = +(options.y ?? 0);
    if (y) el.classList.add("fx-cfi-y");
    // delay: seconds to wait before turning on — so the line under the title is drawn first and then the text arrives (Brand .5s)
    const delay = +(options.delay ?? 0);
    // ease-y: the rise curve is separate from the opacity curve — where the original hangs two animations per letter, slide and fade, with different curves
    const easeY = options["ease-y"] ? kfFx.ease(options["ease-y"], "power2.out") : null;
    const show = () => {
      gsap.set(chars, { opacity: base, y });
      if (easeY && y) {
        gsap.to(chars, { opacity: 1, duration: dur, delay, stagger: stag, ease: easeIn, overwrite: true });
        gsap.to(chars, { y: 0, duration: dur, delay, stagger: stag, ease: easeY });
      } else gsap.to(chars, { opacity: 1, y: 0, duration: dur, delay, stagger: stag, ease: easeIn, overwrite: true });
    };
    const hide = () => gsap.to(chars, { opacity: base, y, duration: back, stagger: stag, ease: easeOut, overwrite: true });
    if (reduce) { gsap.set(chars, { opacity: 1 }); return off; }
    el.addEventListener("fx:show", show);
    el.addEventListener("fx:hide", hide);
    if (options.on !== "state")
      st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 80%", onEnter: show, onLeaveBack: back > 0 ? hide : null });
    return off;
  });
})();
