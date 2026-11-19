// Work filtering — original values as is: Flip .45s power4.out (absolute), appearing cards float up over .35s and leaving cards fade out over .35s,
// Board height also shrinks or grows to the new height in the same .45s. On phone the filter is folded and then opens (line drawn in .4s).
(() => {
  gsap.registerPlugin(Flip);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const toggle = document.getElementById("filter-toggle"), box = document.getElementById("filter-container");
  if (toggle && box) {
    let open = toggle.getAttribute("aria-expanded") === "true";
    const set = (v) => { if (v === open) return; open = v; toggle.setAttribute("aria-expanded", String(v)); v ? box.removeAttribute("hidden") : box.setAttribute("hidden", ""); };
    toggle.addEventListener("click", () => set(!open));
    document.querySelectorAll(".filter-close").forEach((b) => b.addEventListener("click", () => { set(false); toggle.focus(); }));
    // Wide screens are always left expanded — if hidden remains, content stays invisible even when the phone collapse rule doesn’t apply
    gsap.matchMedia().add("(min-width: 768px)", () => { box.removeAttribute("hidden"); return () => { if (!open) box.setAttribute("hidden", ""); }; });
  }

  const wrap = document.querySelector(".works-page"), inner = document.querySelector(".works-contents"), empty = document.querySelector(".works-empty");
  if (!wrap || !inner) return;
  const cards = [...wrap.querySelectorAll(".hz-work")];
  const D = reduce ? 0 : 0.45, E = "power4.out";
  const state = { use: "all", issue: "all" };
  let busy = false;
  const has = (el, kind, v) => v === "all" || (el.dataset[kind] || "").split("|").includes(v);
  const apply = () => {
    gsap.set(wrap, { height: inner.clientHeight });
    const st = Flip.getState(cards);
    cards.forEach((c) => c.classList.toggle("is-hidden", !(has(c, "use", state.use) && has(c, "issue", state.issue))));
    if (empty) empty.hidden = cards.some((c) => !c.classList.contains("is-hidden"));
    const h = inner.clientHeight;
    busy = true;
    Flip.from(st, {
      duration: D, ease: E, absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: Math.max(0, D - 0.1) }),
      onLeave: (els) => gsap.to(els, { opacity: 0, duration: Math.max(0, D - 0.1) }),
      onComplete: () => { busy = false; },
    });
    gsap.to(wrap, { height: h, duration: D, ease: E, onComplete: () => gsap.set(wrap, { height: "auto" }) });
  };
  ["use", "issue"].forEach((kind) => {
    const buttons = [...document.querySelectorAll(`.filter-section[data-kind="${kind}"] .filter-button`)];
    const all = buttons.find((b) => b.dataset.value === "all");
    buttons.forEach((b) => b.addEventListener("click", () => {
      if (busy) return;
      const v = b.dataset.value;
      if (!v || (v === "all" && state[kind] === "all")) return;
      state[kind] = v === state[kind] ? "all" : v;
      buttons.forEach((x) => x.classList.remove("is-active"));
      (state[kind] === "all" ? all : b).classList.add("is-active");
      apply();
    }));
  });
})();
