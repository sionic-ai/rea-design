// Each word of the section title, inside its own mask, tilted 5° (pivot at bottom left), rises from below and transparent by its own height over .75s back (.025s stagger),
// When it leaves the screen it fades out with 1s back — it stands again on re-entry (original motionHeadingFrom/To·motionDefaultExit).
// Body lines ([data-fx-part=If line]) is present, each line stands up from 50% below, following .25s late with .1s gaps (motionTextFrom/To).
(() => {
  const wrapWords = (node) => {
    const out = [];
    const walk = (n) => {
      [...n.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const parts = c.textContent.split(/(\s+)/);
          if (parts.length === 1 && !parts[0]) return;
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.append(document.createTextNode(p)); return; }
            const mask = document.createElement("span");
            mask.setAttribute("data-fx-part", "mask");
            const w = document.createElement("span");
            w.setAttribute("data-fx-part", "word");
            w.textContent = p;
            mask.append(w);
            frag.append(mask);
            out.push(w);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.getAttribute("data-fx-part") !== "line" && c.tagName !== "BR") walk(c);
      });
    };
    walk(node);
    return out;
  };
  kfFx.register("tilt-word-mask-rise", (el, { options, reduce, scroller }) => {
    const head = el.querySelector('[data-fx-part="head"]') || el;
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    if (!head.textContent.trim() && !lines.length) return;
    const before = head.innerHTML;
    const words = head.textContent.trim() ? wrapWords(head) : [];
    if (reduce || !window.ScrollTrigger) return () => { head.innerHTML = before; };
    const tilt = +(options.tilt ?? 5), each = +(options.each ?? 0.025), dur = +(options.dur ?? 0.75), lag = +(options.lag ?? 0.25);
    const ease = options.ease || "back", exit = +(options.exit ?? 1);
    const FROM = { yPercent: 100, opacity: 0, rotation: tilt, transformOrigin: "0% 100%" };
    const all = [...words, ...lines];
    gsap.set(all, { opacity: 0 });
    const enter = () => {
      gsap.killTweensOf(all);
      if (words.length) { gsap.set(words, FROM); gsap.to(words, { yPercent: 0, opacity: 1, rotation: 0, stagger: each, duration: dur, ease }); }
      if (lines.length) { gsap.set(lines, { yPercent: 50, opacity: 0 }); gsap.to(lines, { yPercent: 0, opacity: 1, stagger: 0.1, duration: dur, ease, delay: words.length ? lag : 0 }); }
    };
    const leave = () => { gsap.killTweensOf(all); gsap.to(all, { opacity: 0, duration: exit, ease, overwrite: true }); };
    const once = options.once === "true";
    const st = ScrollTrigger.create({
      trigger: el, scroller, start: options.start || "top 75%", end: options.end || "bottom 25%",
      onEnter: enter, onEnterBack: enter, onLeave: once ? null : leave, onLeaveBack: once ? null : leave,
    });
    return () => { st.kill(); gsap.killTweensOf(all); if (lines.length) gsap.set(lines, { clearProps: "transform,opacity" }); head.innerHTML = before; };
  });
})();
