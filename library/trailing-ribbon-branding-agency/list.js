/* Work list — pressing the pill opens a category panel, and picking one fades the list out in .3s power2.in, sends it back to the top, and fades it in over .5s power2.out */
(() => {
  const OD = (window.OD = window.OD || {});
  OD.pages = OD.pages || {};
  let off = null;
  OD.pages.list = {
    init(root) {
      const box = root.querySelector(".od-list__filter"), list = root.querySelector(".od-list__items");
      if (!box || !list) return;
      const items = [...list.querySelectorAll(".od-list__item")], tog = box.querySelector(".od-filter__toggle"), cur = box.querySelector("[data-filter-current]");
      const btns = [...box.querySelectorAll(".od-filter__btn")];
      let cat = "all", busy = false;
      const open = (v) => { box.dataset.open = String(v); tog.setAttribute("aria-expanded", String(v)); };
      const apply = () => { items.forEach((it) => (it.hidden = !(cat === "all" || (it.dataset.category || "").split(" ").includes(cat)))); ScrollTrigger.refresh(); };
      const pick = async (c) => {
        open(false);
        if (busy || c === cat) return;
        busy = true; cat = c;
        btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.category === c)));
        cur.textContent = c === "all" ? "" : btns.find((b) => b.dataset.category === c).querySelector(".od-roll > span").textContent;
        await gsap.to(list, { autoAlpha: 0, duration: OD.reduce ? 0 : 0.3, ease: "power2.in" });
        apply();
        OD.lenis ? OD.lenis.scrollTo(0, { immediate: true }) : (OD.scroller.scrollTop = 0);
        await gsap.to(list, { autoAlpha: 1, duration: OD.reduce ? 0 : 0.5, ease: "power2.out" });
        busy = false;
      };
      const onTog = () => open(box.dataset.open !== "true");
      tog.addEventListener("click", onTog);
      btns.forEach((b) => b.addEventListener("click", () => pick(b.dataset.category)));
      off = () => { tog.removeEventListener("click", onTog); gsap.killTweensOf(list); };
    },
    destroy() { off?.(); off = null; },
  };
})();
