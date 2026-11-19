(() => {
  // Wrap words into inline-block chunks and split the letters inside — leave the spaces between untouched so multi-line Korean text doesn’t break in the middle of a word.
  const split = (node) => {
    const chars = [];
    const words = node.textContent.split(/(\s+)/);
    node.textContent = "";
    for (const w of words) {
      if (!w) continue;
      if (/^\s+$/.test(w)) { node.append(w); continue; }
      const word = document.createElement("span");
      word.className = "fx-word";
      for (const c of w) {
        const ch = document.createElement("span");
        ch.className = "fx-ch";
        ch.textContent = c;
        word.append(ch);
        chars.push(ch);
      }
      node.append(word);
    }
    return chars;
  };

  kfFx.register("rise-underline-title", (el, { options, reduce, scroller }) => {
    const vertical = options.look === "vertical";
    const en = el.querySelector('[data-fx-part="en"]');
    const subs = [...el.querySelectorAll(vertical ? '[data-fx-part="line"]' : '[data-fx-part="sub"]')];
    if (!en && !subs.length) return;
    const delay = +(options.delay ?? 0), step = +(options.step ?? 0.1), subDelay = +(options["sub-delay"] ?? 0.4);
    const lineGap = +(options["line-gap"] ?? 1.1), lead = +(options.lead ?? 0.1);
    const saved = subs.map((s) => s.innerHTML);
    const vars = { dur: "--fx-dur", "char-dur": "--fx-char-dur", "line-dur": "--fx-line-dur", ease: "--fx-ease" };
    for (const [k, v] of Object.entries(vars)) if (options[k] != null) el.style.setProperty(v, /^[\d.]+$/.test(options[k]) ? `${options[k]}s` : options[k]);
    el.style.setProperty("--fx-d", `${delay}s`);
    subs.forEach((s, li) => {
      const chars = split(s);
      // Vertical copy: each line’s rule grows with an extra line-gap delay and letters start after lead. The title starts with the English line, and underline · letters follow after sub-delay
      const base = vertical ? delay + li * lineGap : delay + subDelay;
      s.style.setProperty("--fx-d", `${vertical ? base : subDelay}s`);
      chars.forEach((c, i) => c.style.setProperty("--fx-d", `${(base + (vertical ? lead : 0) + i * step).toFixed(3)}s`));
    });
    // On phone, when vertical text is turned horizontal, letters rise from below and the line becomes an underline
    const flat = () => el.classList.toggle("is-fx-flat", vertical && subs[0] && !getComputedStyle(subs[0]).writingMode.startsWith("vertical"));
    flat();
    const ro = vertical ? new ResizeObserver(flat) : null;
    ro?.observe(el);
    const show = () => el.classList.add("is-fx-in");
    let st = null;
    if (reduce) el.classList.add("is-fx-in", "is-fx-still");
    else if ((options.on || "scroll") === "scroll" && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      // The original fires once when the top edge rises above the 85% line of the screen — immediately on open if already past
      st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 85%", once: true, onEnter: show });
    } else if (options.on === "load" && document.readyState !== "complete") addEventListener("load", show, { once: true });
    else requestAnimationFrame(() => requestAnimationFrame(show));
    return () => {
      st?.kill();
      ro?.disconnect();
      removeEventListener("load", show);
      subs.forEach((s, i) => { s.innerHTML = saved[i]; s.style.removeProperty("--fx-d"); });
      el.classList.remove("is-fx-in", "is-fx-still", "is-fx-flat");
      ["--fx-d", ...Object.values(vars)].forEach((v) => el.style.removeProperty(v));
    };
  });
})();
