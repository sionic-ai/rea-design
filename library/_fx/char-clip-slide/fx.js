// Each letter hides to the left inside a mask cell attached to its left side and slides in — the cell starts at the letter’s left edge, so the letter is revealed as if wiped
(() => {
  kfFx.register("char-clip-slide", (el, { options, reduce }) => {
    const text = el.textContent.replace(/\s+/g, " ").trim();
    if (!text) return;
    const before = el.innerHTML;
    const label = el.getAttribute("aria-label");
    el.setAttribute("aria-label", label || text);
    const frag = document.createDocumentFragment();
    const chars = [];
    text.split(" ").forEach((word, wi, all) => {
      const w = document.createElement("span");
      w.className = "fx-w";
      w.setAttribute("aria-hidden", "true");
      [...word].forEach((ch, ci) => {
        const c = document.createElement("span");
        c.className = "fx-c";
        c.innerHTML = '<span class="fx-ghost"></span><span class="fx-clip"><span></span></span>';
        c.firstChild.textContent = ch;
        c.lastChild.firstChild.textContent = ch;
        w.append(c);
        chars.push({ el: c.lastChild.firstChild, i: ci });
      });
      frag.append(w);
      if (wi < all.length - 1) frag.append(" ");
    });
    el.replaceChildren(frag);
    const restore = () => { el.innerHTML = before; if (label == null) el.removeAttribute("aria-label"); };
    if (reduce) return restore;

    const x = +(options.x ?? 3), dur = +(options.dur ?? 0.75), each = +(options.each ?? 0.001), delay = +(options.delay ?? 0);
    const ease = kfFx.ease(options.ease || "0.16,1,0.8,1", "expo.out");
    const targets = chars.map((c) => c.el);
    gsap.set(targets, { x: `${-x}em` });
    let tween = null;
    const play = (extra = 0) => {
      tween?.kill();
      tween = gsap.to(targets, { x: 0, duration: dur, ease, delay: (i) => delay + extra + chars[i].i * each,
        onComplete: () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })) });
    };
    const reset = () => { tween?.kill(); gsap.set(targets, { x: `${-x}em` }); };
    const mode = options.play || "view";
    let io = null;
    const onPlay = () => play();
    if (mode === "load") play();
    else if (mode === "event") { el.addEventListener("fx:play", onPlay); el.addEventListener("fx:reset", reset); }
    else {
      io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(); } }, { rootMargin: "0px 0px -5% 0px" });
      io.observe(el);
    }
    return () => {
      io?.disconnect();
      tween?.kill();
      el.removeEventListener("fx:play", onPlay);
      el.removeEventListener("fx:reset", reset);
      restore();
    };
  });
})();
