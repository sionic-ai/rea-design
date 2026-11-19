(() => {
  // Words are wrapped as chunks with the spaces between left intact, so multi-line Korean buttons don’t break in the middle of a word
  const split = (box, each, start) => {
    let i = start;
    const words = (box.textContent || "").trim().split(/(\s+)/);
    box.setAttribute("aria-label", box.textContent.trim());
    box.textContent = "";
    for (const w of words) {
      if (!w) continue;
      if (/^\s+$/.test(w)) { box.append(" "); continue; }
      const word = document.createElement("span");
      word.className = "fx-word";
      word.setAttribute("aria-hidden", "true");
      for (const ch of Array.from(w)) {
        const c = document.createElement("span");
        c.className = "fx-char";
        c.textContent = ch;
        c.style.setProperty("--fx-char-delay", `${i * each}ms`);
        word.append(c);
        i += 1;
      }
      box.append(word);
    }
    return i;
  };

  kfFx.register("char-wave-hover", (el, { options, hover, scroller }) => {
    const boxes = el.querySelectorAll('[data-fx-part="label"]');
    const targets = boxes.length ? Array.from(boxes) : [el];
    if (!targets.some((b) => (b.textContent || "").trim())) return;
    const each = +(options.each ?? 25);
    const keep = targets.map((b) => b.innerHTML);
    let n = 0;
    for (const b of targets) n = split(b, each, n);
    // The icon lags behind the text by lead — the sideways-sliding arrow .2s, the upward-popping icon when the last letter is nearly landed (original (letter count−1)×stagger + 300 − 70ms)
    const up = options.icon === "up";
    const lead = options.lead ?? (up ? ((n - 1) * each + 230) / 1000 : 0.2);
    el.style.setProperty("--fx-icon-delay", `${+lead}s`);

    let st = null;
    if (!hover && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      // A finger screen can’t raise a hand, so it waves once when entering above the bottom 20% of the screen (original 1.38s)
      st = ScrollTrigger.create({
        trigger: el, scroller, start: options.start || "top 80%", once: true,
        onEnter: () => el.classList.add("is-fx-wave"),
      });
    }
    return () => {
      st?.kill();
      el.classList.remove("is-fx-wave");
      el.style.removeProperty("--fx-icon-delay");
      targets.forEach((b, k) => { b.innerHTML = keep[k]; b.removeAttribute("aria-label"); });
    };
  });
})();
