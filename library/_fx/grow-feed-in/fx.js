// A batch newly appended to the list end expands from height 0 to full height in .6s, while the whole batch settles down from 20px above in .8s — the original Product news list load-more.
// Both curves are cubic-bezier(.54,.53,.1,.99). Once fully open, release the height and clipping so shadows and hovers inside aren’t cut off.
// When the end marker (more) enters the screen it fires fx:more on the element — the consumer attaches the bundle then (the part does not attach it)
(() => {
  kfFx.register("grow-feed-in", (el, { options, reduce, scroller }) => {
    const dur = reduce ? 0 : +(options.dur ?? 0.6), drop = reduce ? 0 : +(options.drop ?? 0.8), y = +(options.y ?? -20);
    const ease = kfFx.ease(options.ease || "0.54,0.53,0.1,0.99", "power2.out");
    const grown = new WeakSet();
    const grow = (b) => {
      if (grown.has(b)) return;
      grown.add(b);
      if (!dur && !drop) return;
      gsap.fromTo(b, { height: 0, overflow: "hidden" }, { height: "auto", duration: dur, ease, onComplete: () => gsap.set(b, { clearProps: "height,overflow" }) });
      gsap.fromTo(b, { y }, { y: 0, duration: drop, ease, clearProps: "transform" });
    };
    // Leave the groups that were there at first as they are — only open newly added ones
    el.querySelectorAll('[data-fx-part="batch"]').forEach((b) => grown.add(b));
    const mo = new MutationObserver((list) => {
      for (const m of list) for (const n of m.addedNodes) {
        if (n.nodeType !== 1) continue;
        if (n.matches('[data-fx-part="batch"]')) grow(n);
        else n.querySelectorAll?.('[data-fx-part="batch"]').forEach(grow);
      }
    });
    mo.observe(el, { childList: true, subtree: true });
    const more = el.querySelector('[data-fx-part="more"]');
    let io = null;
    if (more) {
      io = new IntersectionObserver(([en]) => { if (en.isIntersecting) el.dispatchEvent(new CustomEvent("fx:more", { bubbles: true })); }, { root: scroller || null, rootMargin: `0px 0px ${+(options.ahead ?? 0)}px 0px` });
      io.observe(more);
    }
    return () => {
      mo.disconnect();
      io?.disconnect();
      el.querySelectorAll('[data-fx-part="batch"]').forEach((b) => { gsap.killTweensOf(b); gsap.set(b, { clearProps: "height,overflow,transform" }); });
    };
  });
})();
