// Switch all photo sets within a page (or section) to the same branch (season·theme) with one button.
// The current section clears from the right over 1s, and beneath it the next section slides in from 5% aside into place — after 1s the order is tidied
(() => {
  const SEASONS = (m) => (m >= 11 || m <= 2 ? "winter" : m <= 5 ? "spring" : m <= 8 ? "summer" : "autumn");
  kfFx.register("season-wipe-swap", (root, { options, reduce }) => {
    const dur = reduce ? 0 : +(options.dur ?? 1), shift = +(options.shift ?? 5), store = options.remember ?? "fx-season";
    const items = () => [...root.querySelectorAll('[data-fx-part="item"]')];
    const triggers = () => [...root.querySelectorAll('[data-fx-part="trigger"]')];
    if (!items().length) return;
    root.style.setProperty("--fx-sws-dur", dur + "s");
    root.style.setProperty("--fx-sws-shift", shift + "%");
    const keys = [...new Set(items().map((n) => n.dataset.key))];
    let saved = null;
    try { saved = store && sessionStorage.getItem(store); } catch {}
    let current = [saved, options.start, SEASONS(new Date().getMonth() + 1), keys[0]].find((k) => k && keys.includes(k));
    let timer = 0;
    const mark = () => {
      items().forEach((n) => { n.classList.remove("fx-sws-view", "fx-sws-moment", "fx-sws-prev"); n.style.clipPath = ""; n.classList.toggle("fx-sws-view", n.dataset.key === current); });
      triggers().forEach((b) => { const on = b.dataset.key === current; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); });
    };
    mark();
    // Late-arriving cells are also matched to the current branch
    const mo = new MutationObserver(() => items().forEach((n) => {
      if (!n.matches(".fx-sws-view, .fx-sws-moment, .fx-sws-prev") && n.dataset.key === current) n.classList.add("fx-sws-view");
    }));
    mo.observe(root, { childList: true, subtree: true });
    const go = (key) => {
      if (!key || key === current || !keys.includes(key)) return;
      clearTimeout(timer);
      const olds = items().filter((n) => n.classList.contains("fx-sws-view")), news = items().filter((n) => n.dataset.key === key);
      items().forEach((n) => n.classList.remove("fx-sws-prev"));
      news.forEach((n) => n.classList.add("fx-sws-moment"));
      olds.forEach((n) => (n.style.clipPath = "inset(0% 100% 0% 0%)"));
      current = key;
      triggers().forEach((b) => { const on = b.dataset.key === current; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); });
      try { store && sessionStorage.setItem(store, key); } catch {}
      timer = setTimeout(() => {
        olds.forEach((n) => { n.style.clipPath = ""; n.classList.remove("fx-sws-view"); n.classList.add("fx-sws-prev"); });
        news.forEach((n) => { n.classList.add("fx-sws-view"); n.classList.remove("fx-sws-moment"); });
      }, dur * 1000);
    };
    const click = (e) => { const b = e.target.closest('[data-fx-part="trigger"]'); if (b && root.contains(b)) go(b.dataset.key); };
    root.addEventListener("click", click);
    return () => {
      clearTimeout(timer);
      mo.disconnect();
      root.removeEventListener("click", click);
      items().forEach((n) => { n.classList.remove("fx-sws-view", "fx-sws-moment", "fx-sws-prev"); n.style.clipPath = ""; });
      triggers().forEach((b) => { b.classList.remove("is-active"); b.removeAttribute("aria-pressed"); });
      root.style.removeProperty("--fx-sws-dur");
      root.style.removeProperty("--fx-sws-shift");
    };
  });
})();
