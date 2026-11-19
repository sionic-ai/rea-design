(() => {
  // Speech bubbles (item) scattered in the panel wake when the panel enters below the screen — first show the first first items, then withdraw them one by one,
  // Every interval, one is picked at random and shown. When shown, any item in the same group (data-group) as one already visible is skipped — so stacked spots don’t overlap.
  // The floating speech bubble goes down after hold. Its look (transparent · rises .3s) is handled by is-fx-on in fx.css
  kfFx.register("random-bubble-pop", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const first = Math.max(0, Math.round(+(options.first ?? 2)));
    const narrowAt = +(options.narrow ?? 768);
    const narrow = () => innerWidth <= narrowAt;
    const every = +options.every || 1500;
    const hold = () => (narrow() ? +(options["hold-narrow"] ?? 5000) : +(options.hold ?? 8000));
    const firstHold = () => (narrow() ? +(options["first-narrow"] ?? 3000) : +(options["first-hold"] ?? 4000));
    const groups = (it) => {
      const g = (narrow() && it.dataset.groupNarrow != null ? it.dataset.groupNarrow : it.dataset.group) || "";
      return g ? g.split(",").map((s) => s.trim()).filter(Boolean) : [];
    };
    if (reduce) {
      items.slice(0, Math.max(1, first)).forEach((it) => it.classList.add("is-fx-on"));
      return () => items.forEach((it) => it.classList.remove("is-fx-on"));
    }
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    let z = 1, loop = 0, began = false;
    const pick = () => {
      z++;
      const busy = new Set(items.filter((it) => it.classList.contains("is-fx-on")).flatMap(groups));
      const free = items.filter((it) => !it.classList.contains("is-fx-on") && !groups(it).some((g) => busy.has(g)));
      if (!free.length) return;
      const it = free[Math.floor(Math.random() * free.length)];
      it.style.zIndex = z;
      it.classList.add("is-fx-on");
      later(() => it.classList.remove("is-fx-on"), hold());
    };
    const begin = () => {
      if (began) return;
      began = true;
      items.slice(0, first).forEach((it) => it.classList.add("is-fx-on"));
      // The original clears the first three slots — one more than the number first shown (the third, already shown at random, is cleared too)
      for (let i = 0; i < Math.min(items.length, first + 1); i++) later(() => items[i].classList.remove("is-fx-on"), firstHold() + 2000 * i);
      loop = setInterval(pick, every);
    };
    const box = scroller || window;
    const view = () => (scroller ? scroller.getBoundingClientRect().bottom : innerHeight);
    const check = () => { if (!began && el.getBoundingClientRect().top < view()) begin(); };
    box.addEventListener("scroll", check, { passive: true });
    check();
    return () => {
      box.removeEventListener("scroll", check);
      clearInterval(loop);
      timers.forEach(clearTimeout);
      items.forEach((it) => { it.classList.remove("is-fx-on"); it.style.zIndex = ""; });
    };
  });
})();
