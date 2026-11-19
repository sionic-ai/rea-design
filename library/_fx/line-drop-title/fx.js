(() => {
  // Once the element’s top edge rises above the ratio line (default .6) from the top of the screen, add is-in one time — original is-tween condition (scrollY + vh × ratio > Top edge, scrollY < Bottom end)
  kfFx.register("line-drop-title", (el, { options, reduce, scroller }) => {
    const words = [...el.querySelectorAll('[data-fx-part="word"]')];
    if (!words.length) {
      // If there are no child marks, wrap the text in word chunks (spaces kept as they are)
      const box = el.querySelector('[data-fx-part="text"]') || el;
      if (!box.textContent.trim() || box.children.length) return;
      box.innerHTML = box.textContent.trim().split(/(\s+)/).map((w) => (/^\s+$/.test(w) ? w : `<span data-fx-part="word">${w}</span>`)).join("");
    }
    if (reduce) { el.classList.add("is-in"); return () => el.classList.remove("is-in"); }
    const ratio = +(options.ratio ?? 0.6);
    const box = scroller || window;
    const check = () => {
      const r = el.getBoundingClientRect(), top = scroller ? scroller.getBoundingClientRect().top : 0, vh = scroller ? scroller.clientHeight : innerHeight;
      if (r.top - top < vh * ratio && r.bottom - top > 0) { el.classList.add("is-in"); off(); }
    };
    const off = () => { box.removeEventListener("scroll", check); removeEventListener("resize", check); };
    box.addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    requestAnimationFrame(check);
    return () => { off(); el.classList.remove("is-in"); };
  });
})();
