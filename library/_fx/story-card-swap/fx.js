// Story card swap: of the cards stacked in one spot only one stands, and when it changes the old card rotates 16° around its bottom-right corner and exits to the upper right (45%, −35%) and
// New cards rise from 110% below (both .45s cubic-bezier(.22,1,.36,1)) — the explanation card that changes at each scene of a scroll story (story site).
// The user dispatches an fx:show event to the element (detail: number, −1 lowers all) or changes data-active.
(() => {
  kfFx.register("story-card-swap", (el, { options, reduce }) => {
    const cards = () => [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards().length) return;
    const dur = +(options.dur ?? 0.45);
    el.style.setProperty("--fx-dur", `${reduce ? 0 : dur}s`);
    let cur = -1;
    const show = (i) => {
      const list = cards();
      i = Number.isFinite(i) ? i : -1;
      if (i === cur) return;
      list.forEach((c, k) => {
        if (k === i) { c.classList.remove("fx-out"); c.classList.add("fx-on"); }
        else if (c.classList.contains("fx-on")) { c.classList.remove("fx-on"); c.classList.add("fx-out"); }
      });
      cur = i;
      el.dispatchEvent(new CustomEvent("fx:shown", { bubbles: true, detail: i }));
    };
    const onShow = (e) => show(Number(e.detail));
    el.addEventListener("fx:show", onShow);
    const mo = new MutationObserver(() => show(Number(el.dataset.active ?? -1)));
    mo.observe(el, { attributes: true, attributeFilter: ["data-active"] });
    show(Number(el.dataset.active ?? options.start ?? 0));
    return () => {
      el.removeEventListener("fx:show", onShow);
      mo.disconnect();
      cards().forEach((c) => c.classList.remove("fx-on", "fx-out"));
      el.style.removeProperty("--fx-dur");
    };
  });
})();
