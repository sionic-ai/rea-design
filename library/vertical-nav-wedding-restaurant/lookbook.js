// The thumbnail strip moves .05rem per frame plus mouse .3·e³, pressing opens that category’s photos in a large white modal to flip through. The side index is pinned on pc.
(() => {
  const modal = document.querySelector(".lb-modal");
  const viewport = modal.querySelector(".lb-modal__viewport");
  const dots = modal.querySelector(".lb-modal__dots");
  const cur = modal.querySelector(".lb-modal__cur");
  const max = modal.querySelector(".lb-modal__max");
  const prev = modal.querySelector(".lb-modal__prev");
  const next = modal.querySelector(".lb-modal__next");
  let items = [], at = 0;

  const go = (i) => {
    at = Math.max(0, Math.min(items.length - 1, i));
    prev.style.display = at <= 0 ? "none" : "block";
    next.style.display = at >= items.length - 1 ? "none" : "block";
    cur.textContent = String(at + 1).padStart(2, "0");
    viewport.querySelectorAll(".lb-modal__image").forEach((el, n) => el.classList.toggle("is-current", n === at));
    const shift = Math.min(Math.max(items.length - 5, 0), Math.max(0, at - 2));
    dots.querySelectorAll(".lb-modal__dot").forEach((d, n) => {
      d.classList.toggle("is-current", n === at);
      d.classList.toggle("is-mini", Math.abs(at - n) > 2 && !(at < 2 && n < 5) && !(at > items.length - 3 && n > items.length - 6));
      d.style.transform = `translateX(${-100 * shift}%)`;
    });
  };
  const open = (list, i) => {
    items = list;
    viewport.innerHTML = list.map((label, n) => `<div class="lb-modal__image"><div class="wf-img nl-photo-mid" data-label="Zoomed photo ${n + 1} · ${label} · Original aspect ratio"></div></div>`).join("");
    dots.innerHTML = list.map((_, n) => `<span class="lb-modal__dot" data-n="${n}"></span>`).join("");
    max.textContent = String(list.length).padStart(2, "0");
    go(i);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add("is-active")));
  };
  const close = () => {
    modal.classList.remove("is-active");
    modal.setAttribute("aria-hidden", "true");
    setTimeout(() => { if (!modal.classList.contains("is-active")) modal.classList.remove("is-open"); }, 500);
  };
  prev.addEventListener("click", () => go(at - 1));
  next.addEventListener("click", () => go(at + 1));
  dots.addEventListener("click", (e) => { const d = e.target.closest(".lb-modal__dot"); if (d) go(Number(d.dataset.n)); });
  modal.querySelector(".lb-modal__close").addEventListener("click", close);
  addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-active")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") go(at - 1);
    if (e.key === "ArrowRight") go(at + 1);
  });

  const pc = () => document.body.clientWidth >= 767;
  document.querySelectorAll(".lb-section").forEach((section) => {
    const track = section.querySelector(".lb-pager__track");
    const pages = [...track.children];
    const labels = pages.map((p) => p.querySelector(".wf-img").dataset.label);
    pages.forEach((p, n) => (p.dataset.i = n));
    window.nlDrift(track, { base: 0.05, gain: 0.3, loopRem: () => (pc() ? 7 : 6) * pages.length, zone: track, basis: section });
    track.addEventListener("click", (e) => {
      const p = e.target.closest(".lb-pager__page");
      if (!p) return;
      e.preventDefault();
      e.stopPropagation();
      open(labels, Number(p.dataset.i));
    });
  });

  const links = [...document.querySelectorAll(".lb-nav a")];
  document.querySelectorAll(".lb-section").forEach((section, n) => {
    ScrollTrigger.create({
      trigger: section, start: "top top+=80", end: "bottom top+=80",
      onToggle: (st) => { if (st.isActive) links.forEach((a, k) => a.classList.toggle("is-current", k === n)); },
    });
  });

  gsap.matchMedia().add("(min-width: 768px)", () => {
    const pane = document.querySelector(".lb-pane");
    const main = document.querySelector(".lb-main .nl-col2__main");
    ScrollTrigger.create({ trigger: pane, start: "top top", endTrigger: main, end: () => `bottom+=${innerHeight - pane.offsetHeight} bottom`, pin: true, pinSpacing: false, invalidateOnRefresh: true });
  });
})();
