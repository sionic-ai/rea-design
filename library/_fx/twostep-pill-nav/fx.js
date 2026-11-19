// Two-step pill menu: one state (data-nav-state=open) is the only thing changed and CSS does the motion — the pill width first in .5s, then after .25s the lower panel unfolds in .75s and
// The cells in the panel rise from 2em below with a .5s delay. Hovering a link lights the photo with the same key from 1.1→1 — Studio twostep-nav
(() => {
  kfFx.register("twostep-pill-nav", (el, { hover }) => {
    const toggle = el.querySelector('[data-fx-part="toggle"]');
    if (!toggle) return;
    const veil = el.querySelector('[data-fx-part="veil"]');
    const links = [...el.querySelectorAll('[data-fx-part="link"]')], pics = [...el.querySelectorAll('[data-fx-part="visual"]')];
    const pick = (k) => { links.forEach((l) => l.classList.toggle("is-active", l.dataset.key === k)); pics.forEach((p) => p.classList.toggle("is-active", p.dataset.key === k)); };
    const isOpen = () => el.getAttribute("data-nav-state") === "open";
    const set = (on) => { el.setAttribute("data-nav-state", on ? "open" : "closed"); toggle.setAttribute("aria-expanded", String(on)); if (on) pick(links[0]?.dataset.key); el.dispatchEvent(new CustomEvent(on ? "fx:open" : "fx:close", { bubbles: true })); };
    const onToggle = () => set(!isOpen()), onClose = () => set(false), onKey = (e) => { if (e.key === "Escape" && isOpen()) set(false); };
    const enters = links.map((l) => { const f = () => pick(l.dataset.key); if (hover) l.addEventListener("mouseenter", f); return [l, f]; });
    toggle.addEventListener("click", onToggle); veil?.addEventListener("click", onClose); document.addEventListener("keydown", onKey);
    set(false);
    return () => { toggle.removeEventListener("click", onToggle); veil?.removeEventListener("click", onClose); document.removeEventListener("keydown", onKey); enters.forEach(([l, f]) => l.removeEventListener("mouseenter", f)); el.removeAttribute("data-nav-state"); };
  });
})();
