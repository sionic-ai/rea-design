// Sub pages — the reasons slider and case slider (swiper) of the head-treatment landing, and the price tabs. News and article pages use only the shared rise-in
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.Swiper) {
    const reasons = document.querySelector("[data-hair-reasons]");
    if (reasons) new Swiper(reasons, {
      slidesPerView: "auto", spaceBetween: 40, speed: reduce ? 0 : 600,
      pagination: { el: "[data-hair-reasons-pager]", clickable: true, renderBullet: (i, cls) => `<span class="${cls}">Reason ${i + 1}</span>` },
    });
    const q = document.querySelector("[data-hair-q]");
    if (q) new Swiper(q, { slidesPerView: "auto", spaceBetween: 40, speed: reduce ? 0 : 600, pagination: { el: "[data-hair-q-pager]", clickable: true } });
    const cases = document.querySelector("[data-hair-cases]");
    if (cases) new Swiper(cases, { slidesPerView: 1, spaceBetween: 40, speed: reduce ? 0 : 600, pagination: { el: "[data-hair-cases-pager]", clickable: true } });
  }
  const tabs = document.querySelector("[data-hair-tabs]"), panels = document.querySelector("[data-hair-panels]");
  tabs?.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const i = [...tabs.children].indexOf(b);
    [...tabs.children].forEach((x, j) => x.classList.toggle("is-active", j === i));
    [...panels.children].forEach((x, j) => x.classList.toggle("is-active", j === i));
  });

  // Hero first screen — 0.8s after DOMContentLoaded the setup is released, and every 2.5s a new photo is laid over each panel (original p-visual)
  const kvPanels = document.querySelectorAll(".op-hkv__panel");
  if (document.body.classList.contains("is-ready")) {
    const go = () => setTimeout(() => document.body.classList.remove("is-ready"), reduce ? 0 : 800);
    document.readyState === "loading" ? addEventListener("DOMContentLoaded", go) : go();
  }
  if (kvPanels.length && !reduce) {
    const ALT = ["Upper body of a man with arms crossed · front · portrait", "Man taking off his hat · Side profile · Portrait", "Man smiling and brushing back his hair · portrait", "Man showing the crown of his head · From behind · Portrait", "Man resting chin on hand · angled · portrait", "Man holding his head with both hands · portrait"];
    let step = 0;
    const swap = () => kvPanels.forEach((p, i) => {
      const old = p.querySelectorAll(".op-hkv__person"), last = old[old.length - 1];
      const next = last.cloneNode(false);
      next.className = `op-ph op-hkv__person is-new${step % 2 ? "" : " is-alt"}`;
      next.dataset.label = ALT[(step * 4 + i) % ALT.length];
      if (i === kvPanels.length - 1) step++;
      p.append(next);
      requestAnimationFrame(() => requestAnimationFrame(() => next.classList.add("is-reveal")));
      next.addEventListener("transitionend", () => old.forEach((o) => o.remove()), { once: true });
    });
    setInterval(swap, 2500);
  }

  // Pseudo window — removing is-hide makes CSS raise the panel and float the card. During the 1s of opening or closing it can’t be pressed again (original isAnimation)
  const doctor = document.getElementById("op-doctor");
  if (doctor) {
    let busy = false;
    const set = (show) => {
      if (busy || show === !doctor.classList.contains("is-hide")) return;
      busy = !reduce;
      doctor.classList.toggle("is-hide", !show);
      doctor.setAttribute("aria-hidden", String(!show));
      document.body.style.overflow = show ? "hidden" : "";
      if (busy) setTimeout(() => { busy = false; }, 1000);
    };
    document.querySelectorAll("[data-doctor-open]").forEach((b) => b.addEventListener("click", () => set(true)));
    doctor.querySelector("[data-doctor-close]")?.addEventListener("click", () => set(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }
})();
