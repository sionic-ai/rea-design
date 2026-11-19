// Attaches which panel it is (--fx-i) and the stacking order (--fx-z), only on wide screens. Recounts when panels are added or removed
(() => {
  kfFx.register("tab-stack", (el, { options }) => {
    const panels = () => [...el.children].filter((c) => c.matches('[data-fx-part="panel"]'));
    if (!panels().length) return;
    const marked = new Set();
    const index = () => panels().forEach((p, i) => {
      p.style.setProperty("--fx-z", String(i + 1));
      marked.add(p);
      const tab = p.querySelector('[data-fx-part="tab"]');
      if (!tab) return;
      tab.style.setProperty("--fx-i", String(i));
      tab.style.setProperty("--fx-tab-bg", getComputedStyle(p).backgroundColor);
      marked.add(tab);
    });
    index();
    const mo = new MutationObserver(index);
    mo.observe(el, { childList: true });
    const mq = matchMedia(`(min-width: ${+(options.min || 960)}px)`);
    const set = () => el.classList.toggle("fx-ts-on", mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", set);
      el.classList.remove("fx-ts-on");
      marked.forEach((n) => ["--fx-z", "--fx-i", "--fx-tab-bg"].forEach((k) => n.style.removeProperty(k)));
    };
  });
})();
