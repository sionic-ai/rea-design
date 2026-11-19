// Work list filter — when the category changes, the current words exit upward (.5s) and new words rise from below (1s, .025 stagger, power4.out).
// Pressing a word selects it as black + × (press again to release), a 1 appears beside the branch and a Reset below. It does not actually filter the cards
(() => {
  const tabs = [...document.querySelectorAll("[data-tax]")];
  const lists = Object.fromEntries([...document.querySelectorAll("[data-opts]")].map((l) => [l.dataset.opts, l]));
  const reset = document.querySelector("[data-reset]");
  const btns = (k) => [...lists[k].querySelectorAll("[data-opt]")];
  let cur = "svc";
  gsap.set(btns("ind"), { yPercent: 110 });
  tabs.forEach((t) => t.addEventListener("click", () => {
    const k = t.dataset.tax;
    if (k === cur) return;
    gsap.to(btns(cur), { yPercent: -110, duration: 0.5, stagger: 0.025, ease: "power4.out", overwrite: true });
    gsap.fromTo(btns(k), { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.025, ease: "power4.out", overwrite: true });
    lists[cur].style.pointerEvents = "none";
    lists[k].style.pointerEvents = "auto";
    tabs.forEach((o) => o.classList.toggle("is-dim", o !== t));
    cur = k;
  }));
  const sync = () => {
    let any = false;
    Object.entries(lists).forEach(([k, l]) => {
      const on = l.querySelector("[data-opt]:not(.is-dim)");
      any ||= !!on;
      tabs.find((t) => t.dataset.tax === k).querySelector("sup").hidden = !on;
    });
    reset.hidden = !any;
  };
  Object.values(lists).forEach((l) => l.querySelectorAll("[data-opt]").forEach((b) => b.addEventListener("click", () => {
    const pick = b.classList.contains("is-dim");
    l.querySelectorAll("[data-opt]").forEach((o) => { o.classList.add("is-dim"); o.querySelector(".tw-list__x").hidden = true; });
    if (pick) { b.classList.remove("is-dim"); b.querySelector(".tw-list__x").hidden = false; }
    sync();
  })));
  reset.addEventListener("click", () => { document.querySelectorAll("[data-opt]").forEach((o) => { o.classList.add("is-dim"); o.querySelector(".tw-list__x").hidden = true; }); sync(); });
})();
