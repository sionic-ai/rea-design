// Clicking a same-page link (#) scrolls to the target spot, offset by the fixed header height, in .8s easeOutQuart (= slides down with power3.out) and
// If the target (or something inside it) is a folded height-fold, open it too — like a region button on a map opening the region accordion below and scrolling down to it.
(() => {
  kfFx.register("anchor-glide-open", (el, { options, reduce, scroller }) => {
    const href = el.getAttribute("href") || options.target || "";
    if (!href.startsWith("#")) return;
    const dur = reduce ? 0 : +(options.dur ?? 0.8);
    const ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    const box = scroller || null;
    const offsetOf = () => {
      const o = options.offset ?? "header";
      if (/^-?\d+(\.\d+)?$/.test(String(o))) return +o;
      return document.querySelector(o)?.clientHeight || 0;
    };
    let tw;
    const onClick = (e) => {
      const id = href.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (id && !target) return;
      e.preventDefault();
      const fold = target && (target.closest('[data-fx~="height-fold"]') || target.querySelector('[data-fx~="height-fold"]'));
      if (fold && options.open !== "false" && !fold.classList.contains("is-opened")) fold.querySelector('[data-fx-part="head"]')?.click();
      const now = box ? box.scrollTop : window.scrollY;
      const top = box ? box.getBoundingClientRect().top : 0;
      const to = target ? Math.max(0, target.getBoundingClientRect().top - top + now - offsetOf()) : 0;
      const s = { y: now };
      const put = () => (box ? (box.scrollTop = s.y) : window.scrollTo(0, s.y));
      tw?.kill();
      tw = gsap.to(s, {
        y: to, duration: dur, ease, onUpdate: put,
        onComplete: () => {
          // As in the original, when finished it briefly focuses the target to move the keyboard position
          if (!target) return;
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
          target.blur();
        },
      });
      const stop = () => tw?.kill();
      window.addEventListener("wheel", stop, { once: true, passive: true });
      window.addEventListener("touchstart", stop, { once: true, passive: true });
    };
    el.addEventListener("click", onClick);
    return () => { el.removeEventListener("click", onClick); tw?.kill(); };
  });
})();
