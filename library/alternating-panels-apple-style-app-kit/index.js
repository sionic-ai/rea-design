// Home page — feature card carousel (horizontal snap, dots, prev/next buttons, snap off while flowing) and use-case pill tabs
(() => {
  const car = document.querySelector("[data-carousel]");
  if (car) {
    const track = car.querySelector(".pa-carousel__track");
    const cards = [...track.children];
    const dots = [...car.querySelectorAll(".pa-dots button")];
    const [prev, next] = car.querySelectorAll(".pa-arrows button");
    let at = 0;
    const step = () => cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth;
    const mark = () => {
      at = Math.max(0, Math.min(cards.length - 1, Math.round(track.scrollLeft / step())));
      dots.forEach((d, i) => d.setAttribute("aria-current", String(i === at)));
      if (prev) prev.disabled = at === 0;
      if (next) next.disabled = at === cards.length - 1;
    };
    // When stepping with the buttons, snap is briefly turned off to glide smoothly and then turned back on — if snap stays on while gliding, it pulls and stops midway
    const go = (i) => {
      i = Math.max(0, Math.min(cards.length - 1, i));
      track.setAttribute("data-gliding", "");
      track.scrollTo({ left: i * step(), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      clearTimeout(go.t);
      go.t = setTimeout(() => track.removeAttribute("data-gliding"), 700);
    };
    track.addEventListener("scroll", mark, { passive: true });
    track.addEventListener("scrollend", () => track.removeAttribute("data-gliding"));
    prev?.addEventListener("click", () => go(at - 1));
    next?.addEventListener("click", () => go(at + 1));
    dots.forEach((d, i) => d.addEventListener("click", () => go(i)));
    cards.forEach((c, i) => c.addEventListener("click", () => { if (i !== at) go(i); }));
    addEventListener("resize", mark);
    mark();
  }

  document.querySelectorAll("[data-tabs]").forEach((box) => {
    const seg = box.querySelector(".pa-seg");
    const tabs = [...seg.querySelectorAll("button")];
    const copies = [...box.querySelectorAll(".pa-work__copy p")];
    const screens = [...box.querySelectorAll(".pa-laptop__screen .pa-media")];
    const place = () => {
      const t = tabs.find((b) => b.getAttribute("aria-selected") === "true") || tabs[0];
      seg.style.setProperty("--seg-x", `${t.offsetLeft}px`);
      seg.style.setProperty("--seg-w", `${t.offsetWidth}px`);
    };
    tabs.forEach((t, i) => t.addEventListener("click", () => {
      tabs.forEach((b, j) => { b.setAttribute("aria-selected", String(i === j)); b.tabIndex = i === j ? 0 : -1; });
      copies.forEach((p, j) => { p.classList.toggle("is-on", i === j); p.inert = i !== j; });
      screens.forEach((s, j) => s.classList.toggle("is-on", i === j));
      place();
    }));
    place();
    new ResizeObserver(place).observe(seg);
    requestAnimationFrame(() => seg.setAttribute("data-ready", ""));
  });
})();
