// Set up the logo fold as a single timeline and only move its progress — scrolling the document past at px sets it to 1, going back up sets it to 0, riding the curve for dur seconds.
// so even when scrolling up and down quickly it just reverses midway instead of restarting from the beginning. When folded it stands already folded from the start (subpage) as if it had received fx:fold, and on receiving fx:unfold it follows the scroll again (page change · menu open)
(() => {
  const splitChars = (node) => {
    if (!node || node.dataset.fxSplit) return node ? [...node.querySelectorAll(".fx-lf__c")] : [];
    node.dataset.fxSplit = "1";
    const text = node.textContent;
    node.textContent = "";
    for (const ch of text) {
      const s = document.createElement("span");
      s.className = "fx-lf__c";
      s.textContent = ch;
      node.append(s);
    }
    return [...node.querySelectorAll(".fx-lf__c")];
  };
  kfFx.register("logo-fold-header", (el, { options, reduce, scroller }) => {
    const part = (n) => [...el.querySelectorAll(`[data-fx-part="${n}"]`)];
    const tops = part("top"), bottoms = part("bottom"), mark = el.querySelector('[data-fx-part="mark"]');
    const tag = el.querySelector('[data-fx-part="tag"]'), word = el.querySelector('[data-fx-part="word"]');
    // What shrinks is the text group (lockup, else the wordmark), what rises is the inner panel (body, else the element) — the frame only loses height so the header bar lowers with it.
    const bodyPart = el.querySelector('[data-fx-part="body"]'), body = bodyPart || el;
    const lockup = el.querySelector('[data-fx-part="lockup"]') || bodyPart || word;
    if (!mark && !word) return;
    const tagHtml = tag?.innerHTML, wordHtml = word?.innerHTML;
    const tagChars = splitChars(tag), wordChars = splitChars(word);
    const shift = +(options.shift ?? 91.34), at = +(options.at ?? 400), dur = +(options.dur ?? 1);
    const narrow = +(options.narrow ?? 0.57807), scale = +(options.scale ?? 0.83003);
    const ease = kfFx.ease(options.ease || "0.2,0.1,0,1", "expo.out");
    const w0 = el.offsetWidth, h0 = el.offsetHeight;
    gsap.set(tops, { transformOrigin: "0% 0%" });
    gsap.set(bottoms, { transformOrigin: "0% 100%" });
    if (lockup) gsap.set(lockup, { transformOrigin: "0% 0%" });
    const tl = gsap.timeline({ paused: true });
    if (tops.length) tl.to(tops, { duration: 1.2, rotate: -90, ease: "power1.inOut", stagger: 0.22 }, 0);
    if (bottoms.length) tl.to(bottoms, { duration: 1.2, rotate: 90, ease: "power1.inOut", stagger: 0.22 }, 0);
    if (tagChars.length) tl.to(tagChars, { duration: 1, x: -shift, opacity: 0, ease: "power2.inOut", stagger: 0.009 }, 0.18);
    if (wordChars.length) tl.to(wordChars, { duration: 1, x: -shift, ease: "power2.inOut", stagger: 0.009 }, 0.2);
    tl.fromTo(el, { width: w0 }, { duration: 1, width: w0 * narrow, ease: "power1.inOut" }, 0.38);
    if (lockup) tl.to(lockup, { duration: 1, scale, ease: "power1.inOut" }, 0.38);
    if (options.lift != null) tl.to(body, { duration: 1, y: -(+options.lift), ease: "power1.inOut" }, 0.38);
    if (options.height != null) tl.fromTo(el, { height: h0 }, { duration: 0.9, height: +options.height, ease: "power1.inOut" }, 0.4);
    // Progress combines two values — g (scroll: 1 past at) · s (outside state: 1 if menu, search or subpage). Progress = 1 − (1 − g)(1 − s)
    // So even if the menu is opened while expanding on scroll, it doesn’t expand and fold again but heads toward folding right where it is (original GLOBAL·STATEVAL·PAGEVAL)
    const y = () => (scroller ? scroller.scrollTop : scrollY);
    // g always starts at 0 — so the logo never folds and unfolds when the document opens at the previous scroll position and then returns to the top (the original also starts at 0 on the first page)
    const g = { v: 0 }, st = { v: options.folded === "true" ? 1 : 0 };
    const draw = () => tl.progress(1 - (1 - g.v) * (1 - st.v));
    draw();
    const sDur = +(options["state-dur"] ?? dur), sEase = options["state-ease"] ? kfFx.ease(options["state-ease"], options["state-ease"]) : ease;
    const tweenTo = (o, v, d, e) => {
      if (reduce) { o.v = v; draw(); return; }
      gsap.killTweensOf(o);
      gsap.to(o, { v, duration: d, ease: e, onUpdate: draw });
    };
    let down = false;
    const check = () => {
      const want = y() >= at;
      if (want !== down) { down = want; tweenTo(g, want ? 1 : 0, dur, ease); }
    };
    const target = scroller || window;
    target.addEventListener("scroll", check, { passive: true });
    const fold = () => tweenTo(st, 1, sDur, sEase);
    const unfold = () => tweenTo(st, 0, sDur, sEase);
    el.addEventListener("fx:fold", fold);
    el.addEventListener("fx:unfold", unfold);
    return () => {
      target.removeEventListener("scroll", check);
      el.removeEventListener("fx:fold", fold);
      el.removeEventListener("fx:unfold", unfold);
      gsap.killTweensOf(g); gsap.killTweensOf(st);
      tl.revert();
      if (tag) { tag.innerHTML = tagHtml; delete tag.dataset.fxSplit; }
      if (word) { word.innerHTML = wordHtml; delete word.dataset.fxSplit; }
    };
  });
})();
