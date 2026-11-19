// First page interactions: phone login tab, phone purpose card fold (original slideToggle 300ms, swing = sine.inOut)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = matchMedia("(max-width: 1024px)");

  const tabs = document.querySelectorAll(".hm-members__tabs button");
  tabs.forEach((b) => b.addEventListener("click", () => {
    tabs.forEach((x) => x.classList.toggle("is-on", x === b));
    document.querySelectorAll(".hm-members__box").forEach((p) => p.classList.toggle("is-on", p.dataset.pane === b.dataset.tab));
  }));

  const slide = (el, open) => {
    if (!window.gsap || reduce) { el.style.display = open ? "block" : "none"; return; }
    gsap.killTweensOf(el);
    if (open) {
      el.style.display = "block";
      gsap.fromTo(el, { height: 0, overflow: "hidden" }, { height: el.scrollHeight, duration: 0.3, ease: "sine.inOut", clearProps: "height,overflow" });
    } else {
      gsap.to(el, { height: 0, overflow: "hidden", duration: 0.3, ease: "sine.inOut", onComplete: () => { el.style.display = "none"; gsap.set(el, { clearProps: "height,overflow" }); } });
    }
  };
  document.querySelectorAll(".hm-pcard__head").forEach((h) => h.addEventListener("click", () => {
    if (!sp.matches) return;
    const card = h.closest(".hm-pcard");
    const open = !card.classList.contains("is-open");
    card.classList.toggle("is-open", open);
    slide(card.querySelector(".hm-pcard__body"), open);
  }));
  // When the width changes, clear the collapsed state so the desktop panel always shows expanded
  sp.addEventListener("change", () => document.querySelectorAll(".hm-pcard").forEach((c) => { c.classList.remove("is-open"); c.querySelector(".hm-pcard__body").style.display = ""; }));
})();
