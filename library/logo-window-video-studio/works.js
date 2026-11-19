// Work — the archive filter panel opens below the header with clip (1s expoOut), and if any cell is chosen Clear all turns on
(() => {
  const { E } = window.pSite;
  const btn = document.querySelector(".p-archive__filter"), panel = document.querySelector(".p-archive__filters"), clear = document.querySelector(".p-archive__clear");
  if (!btn || !panel) return;
  let open = false;
  btn.addEventListener("click", () => {
    open = !open;
    btn.classList.toggle("is-active", open);
    btn.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("is-open", open);
    gsap.to(panel, { clipPath: open ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)", duration: open ? 1.25 : 1, ease: E.z, overwrite: true });
  });
  const picks = [...panel.querySelectorAll("button")];
  const sync = () => clear.classList.toggle("is-hidden", !picks.some((b) => b.classList.contains("is-active")));
  picks.forEach((b) => b.addEventListener("click", () => { b.classList.toggle("is-active"); sync(); }));
  clear.addEventListener("click", () => { picks.forEach((b) => b.classList.remove("is-active")); sync(); });
})();
