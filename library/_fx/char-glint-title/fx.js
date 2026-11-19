(() => {
  // Section title letters float up one at a time from the background color to gold, then return to dark ink — the look of the original (two TweenMax staggerTo lines) kept as options
  const split = (node) => {
    const words = node.textContent.split(/(\s+)/);
    node.textContent = "";
    const chars = [];
    words.forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) { node.append(w); return; }
      const word = document.createElement("span");
      word.style.display = "inline-block";
      [...w].forEach((c) => {
        const s = document.createElement("span");
        s.textContent = c;
        word.append(s);
        chars.push(s);
      });
      node.append(word);
    });
    return chars;
  };
  kfFx.register("char-glint-title", (el, { options, reduce, scroller }) => {
    const text = el.querySelector('[data-fx-part="text"]') || el;
    if (!text.textContent.trim()) return;
    const original = text.innerHTML;
    const sub = el.querySelector('[data-fx-part="sub"]');
    if (reduce) return;
    const chars = split(text);
    const cs = getComputedStyle(el);
    const glint = cs.getPropertyValue("--fx-glint").trim() || cs.getPropertyValue("--kf-accent-soft").trim() || cs.color;
    const from = cs.getPropertyValue("--fx-from").trim() || cs.getPropertyValue("--kf-bg").trim();
    const ink = getComputedStyle(text).color;
    const dur = +(options.dur ?? 0.4), each = +(options.each ?? 0.06), back = +(options.back ?? 0.4);
    const durBack = +(options["dur-back"] ?? dur), eachBack = +(options["each-back"] ?? each);
    const subDelay = +(options["sub-delay"] ?? 0.8), subDur = +(options["sub-dur"] ?? 0.6);
    const fade = options.fade === "on";
    const ease = kfFx.ease(options.ease || "0.25,0.46,0.45,0.94", "power1.out");
    gsap.set(chars, { color: from, opacity: fade ? 0 : 1 });
    if (sub) gsap.set(sub, { opacity: 0 });
    let tl, st, io;
    const play = () => {
      tl = gsap.timeline();
      tl.to(chars, { duration: dur, color: glint, opacity: 1, stagger: each, ease }, 0)
        .to(chars, { duration: durBack, color: ink, stagger: eachBack, ease }, back);
      if (sub) gsap.fromTo(sub, { opacity: 0, y: -5 }, { duration: subDur, ease: "circ.out", opacity: 1, y: 0, delay: subDelay });
    };
    if (options.on === "load") {
      if (document.readyState === "complete") play();
      else addEventListener("load", play, { once: true });
    } else {
      io = new IntersectionObserver((en) => {
        if (!en.some((e) => e.isIntersecting)) return;
        io.disconnect();
        play();
      }, { root: scroller || null, rootMargin: `0px 0px ${-(+(options.pad ?? 0))}px 0px` });
      io.observe(el);
    }
    return () => {
      io?.disconnect();
      removeEventListener("load", play);
      tl?.kill();
      if (sub) gsap.set(sub, { clearProps: "opacity,transform" });
      text.innerHTML = original;
    };
  });
})();
