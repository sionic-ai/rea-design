// Interaction responses across multiple pages — header glass state, phone menu, FAQ open/close, contact popup, review strip
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  // Header — once scrolled past 0, it turns into 60% white glass
  const header = document.querySelector(".header");
  if (header) {
    const sync = () => header.classList.toggle("__active", scrollY > 0);
    addEventListener("scroll", sync, { passive: true });
    sync();
    const burger = header.querySelector(".header__burger"), menu = header.querySelector(".header__menu");
    const close = () => { header.classList.remove("__menu-open"); burger.setAttribute("aria-expanded", "false"); root.classList.remove("menu-lock"); };
    burger.addEventListener("click", () => {
      const open = header.classList.toggle("__menu-open");
      burger.setAttribute("aria-expanded", String(open));
      root.classList.toggle("menu-lock", open);
    });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());
    addEventListener("resize", () => innerWidth > 991.98 && close());
  }

  // FAQ — height expands and collapses with 300ms easeInOutQuad (original as is, rAF)
  const quad = (p) => (p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p);
  document.querySelectorAll(".faq__details").forEach((d) => {
    const s = d.querySelector("summary");
    s.addEventListener("click", (e) => {
      e.preventDefault();
      const open = d.open, h0 = s.offsetHeight;
      const from = open ? d.scrollHeight : h0;
      if (!open) d.open = true;
      const to = open ? h0 : d.scrollHeight;
      if (reduce.matches) { if (open) d.open = false; return; }
      d.style.height = from + "px";
      d.style.overflow = "hidden";
      let t0 = null;
      const step = (now) => {
        t0 ??= now;
        const g = Math.min((now - t0) / 300, 1);
        d.style.height = from + (to - from) * quad(g) + "px";
        if (g < 1) requestAnimationFrame(step);
        else { if (open) d.open = false; d.style.height = ""; d.style.overflow = ""; }
      };
      requestAnimationFrame(step);
    });
  });

  // Contact popup — COLLABORATE · Contact us · Start a project
  const popup = document.getElementById("contacts-popup");
  if (popup) {
    const open = (e) => { e?.preventDefault(); popup.classList.add("__open"); popup.setAttribute("aria-hidden", "false"); root.classList.add("menu-lock"); };
    const close = () => { popup.classList.remove("__open"); popup.setAttribute("aria-hidden", "true"); root.classList.remove("menu-lock"); };
    document.querySelectorAll('[data-contacts-popup-open], a[href="#popup"]').forEach((a) => a.addEventListener("click", open));
    popup.querySelectorAll("[data-contacts-popup-close]").forEach((b) => b.addEventListener("click", close));
    document.addEventListener("keydown", (e) => e.key === "Escape" && popup.classList.contains("__open") && close());
  }

  // Testimonial strip — moves one cell smoothly, automatically every 6.5s (pauses on hover or focus), from the end back to the start
  document.querySelectorAll(".reviews").forEach((sec) => {
    const track = sec.querySelector(".reviews__track"), now = sec.querySelector(".reviews__now");
    const cards = [...track.children];
    const width = () => cards[0].getBoundingClientRect().width;
    let timer = 0, hovering = false;
    const index = () => Math.round(track.scrollLeft / width());
    const move = (dir) => {
      const max = track.scrollWidth - track.clientWidth - 2;
      let left = track.scrollLeft + dir * width();
      if (left > max + width() / 2) left = 0;
      if (left < -width() / 2) left = max;
      track.scrollTo({ left, behavior: reduce.matches ? "instant" : "smooth" });
    };
    const schedule = () => { clearTimeout(timer); if (!hovering && !sec.contains(document.activeElement) && !reduce.matches && !document.hidden) timer = setTimeout(() => { move(1); schedule(); }, 6500); };
    sec.querySelector(".reviews__arrow--prev").addEventListener("click", () => { move(-1); schedule(); });
    sec.querySelector(".reviews__arrow--next").addEventListener("click", () => { move(1); schedule(); });
    track.addEventListener("scroll", () => { now.textContent = String(Math.min(cards.length, index() + 1)).padStart(2, "0"); }, { passive: true });
    sec.addEventListener("pointerenter", () => { hovering = true; clearTimeout(timer); });
    sec.addEventListener("pointerleave", () => { hovering = false; schedule(); });
    document.addEventListener("visibilitychange", schedule);
    schedule();
  });
})();
