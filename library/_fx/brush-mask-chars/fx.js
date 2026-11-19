(() => {
  kfFx.register("brush-mask-chars", (el, { options, reduce, scroller }) => {
    const text = el.textContent;
    if (!text.trim()) return;
    const rise = (options.look || "") === "rise";
    const keep = [...el.childNodes];
    const label = el.getAttribute("aria-label");
    // Each word is wrapped as its own inline-block and the spaces between are kept as is — so multi-line Korean titles don’t break mid-word
    const frag = document.createDocumentFragment();
    const chars = [];
    text.split(/(\s+)/).forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) return frag.append(w);
      const word = document.createElement("span");
      word.className = "fx-bm-word";
      word.setAttribute("aria-hidden", "true");
      [...w].forEach((c) => {
        const s = document.createElement("span");
        s.className = "fx-bm-char";
        s.textContent = c;
        word.append(s);
        chars.push(s);
      });
      frag.append(word);
    });
    el.setAttribute("aria-label", text.trim());
    el.replaceChildren(frag);
    // Original: the title is delayed (i+1)×25ms per letter, the rise type (GSAP stagger) i×40ms starting from the first letter
    const each = +(options.stagger ?? (rise ? 0.04 : 0.025));
    const delay = +(options.delay ?? 0);
    chars.forEach((c, i) => (c.style.transitionDelay = `${delay + (rise ? i : i + 1) * each}s`));
    if (options.dur != null) el.style.setProperty("--fx-dur", +options.dur + "s");
    if (options.ease) el.style.setProperty("--fx-ease", options.ease);
    const play = () => el.classList.add("is-fx-in");
    const reset = () => el.classList.remove("is-fx-in");
    el.addEventListener("fx:play", play);
    el.addEventListener("fx:reset", reset);
    let io = null;
    if (reduce) play();
    else if (options.on !== "manual") {
      // Original IntersectionObserver rootMargin -30% 0px — fires once when it enters the band left after removing 30% from the top and bottom of the screen
      const margin = +(options.margin ?? 30);
      io = new IntersectionObserver(
        (es) => es.forEach((e) => {
          if (!e.isIntersecting) return;
          play();
          io.disconnect();
        }),
        { root: scroller && scroller !== window ? scroller : null, rootMargin: `-${margin}% 0px` }
      );
      io.observe(el);
    }
    return () => {
      io?.disconnect();
      el.removeEventListener("fx:play", play);
      el.removeEventListener("fx:reset", reset);
      el.classList.remove("is-fx-in");
      el.style.removeProperty("--fx-dur");
      el.style.removeProperty("--fx-ease");
      if (label == null) el.removeAttribute("aria-label");
      else el.setAttribute("aria-label", label);
      el.replaceChildren(...keep);
    };
  });
})();
