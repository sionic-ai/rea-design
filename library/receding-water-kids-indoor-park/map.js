// Zone map: open/close of the zone picker panel (spring), the picker button hides when leaving the section, pressing the ball button makes it bounce
(() => {
  const picker = document.querySelector(".hl-picker");
  if (picker) {
    const btn = picker.querySelector(".hl-picker-btn"), panel = picker.querySelector(".hl-picker-panel");
    const set = (on) => { btn.setAttribute("aria-expanded", String(on)); panel.classList.toggle("-open", on); };
    btn.addEventListener("click", (e) => { e.stopPropagation(); set(!panel.classList.contains("-open")); });
    document.addEventListener("click", (e) => { if (!picker.contains(e.target)) set(false); });
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
    const zone = document.querySelector(".hl-sneak");
    if (zone) new IntersectionObserver(([e]) => { picker.classList.toggle("-away", !e.isIntersecting); if (!e.isIntersecting) set(false); }, { rootMargin: "0px 0px -20% 0px" }).observe(zone);
  }
  document.querySelectorAll(".hl-bubble").forEach((b) => {
    b.addEventListener("click", () => { b.classList.remove("-boing"); void b.offsetWidth; b.classList.add("-boing"); });
    b.addEventListener("animationend", () => b.classList.remove("-boing"));
  });
})();
