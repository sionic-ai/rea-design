(() => {
  // Button text is split into letters inside word chunks, and on hover each letter re-forms in turn from blur and transparency (as if freshly stamped),
  // On release, fade out in turn, then come back all at once from a light blur right away
  kfFx.register("blur-char-retype-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const host = el.querySelector('[data-fx-part="text"]') || el;
    if (!host.textContent.trim() || host.children.length) return;
    const html = host.innerHTML;
    const blur = +(options.blur ?? 6), each = +(options.each ?? 0.03), inDur = +(options.in ?? 0.35), outDur = +(options.out ?? 0.25), back = +(options.back ?? 0.3);
    const frag = document.createDocumentFragment();
    for (const part of host.textContent.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { frag.append(part); continue; }
      const w = document.createElement("span");
      w.className = "fx-bcr-word";
      for (const ch of part) w.append(Object.assign(document.createElement("span"), { className: "fx-bcr-char", textContent: ch }));
      frag.append(w);
    }
    host.textContent = "";
    host.append(frag);
    const chars = [...host.querySelectorAll(".fx-bcr-char")];
    const enter = () => {
      gsap.killTweensOf(chars);
      gsap.set(chars, { filter: `blur(${blur}px)`, opacity: 0 });
      gsap.to(chars, { filter: "blur(0px)", opacity: 1, duration: inDur, stagger: each, ease: "power2.out" });
    };
    const leave = () => {
      gsap.killTweensOf(chars);
      gsap.to(chars, {
        filter: `blur(${blur}px)`, opacity: 0, duration: outDur, stagger: each, ease: "power2.in",
        onComplete: () => gsap.fromTo(chars, { filter: `blur(${blur / 2}px)`, opacity: 0 }, { filter: "blur(0px)", opacity: 1, duration: back, ease: "none" }),
      });
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(chars);
      host.innerHTML = html;
    };
  });
})();
