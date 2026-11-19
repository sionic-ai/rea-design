// Only one menu open at a time — outside click·Esc is attached once on the document, not separately per menu
(() => {
  const open = new Set();
  const part = (el, role) => el.querySelector(`:scope > [data-fx-part="${role}"]`);
  const close = (m) => {
    m.classList.remove("is-open");
    part(m, "trigger")?.setAttribute("aria-expanded", "false");
    m.querySelectorAll('[data-fx-part="sub"].is-open').forEach((s) => s.classList.remove("is-open"));
    open.delete(m);
  };
  const closeAll = (keep) => [...open].forEach((m) => m !== keep && close(m));
  document.addEventListener("click", (e) => !e.target.closest?.('[data-fx~="menu-pop"]') && closeAll());
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeAll());

  // When the plate is at 0 scale its size can’t be measured, so compute from offsetWidth and the landing spot and nudge it within 12px
  const fit = (pop, anchor, centered) => {
    const a = anchor.getBoundingClientRect(), w = pop.offsetWidth;
    const left = centered ? a.left + a.width / 2 - w / 2 : a.right;
    pop.style.setProperty("--fx-shift", `${Math.min(Math.max(left, 12), innerWidth - 12 - w) - left}px`);
  };

  kfFx.register("menu-pop", (m) => {
    const btn = part(m, "trigger"), pop = part(m, "pop");
    if (!btn || !pop) return;
    const ac = new AbortController(), on = { signal: ac.signal };
    btn.setAttribute("aria-haspopup", "menu");
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const was = m.classList.contains("is-open");
      closeAll(m);
      if (was) return close(m);
      fit(pop, btn, true);
      m.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      open.add(m);
    }, on);
    m.querySelectorAll('[data-fx-part="sub"]').forEach((s) => {
      const row = s.firstElementChild, sub = part(s, "pop");
      const show = () => { fit(sub, row, false); s.classList.add("is-open"); };
      s.addEventListener("mouseenter", show, on);
      s.addEventListener("mouseleave", () => s.classList.remove("is-open"), on);
      // On touch, a click arrives right after the hover opens, so a click only opens and never closes
      row.addEventListener("click", (e) => { e.stopPropagation(); show(); }, on);
    });
    pop.addEventListener("click", (e) => {
      const hit = e.target.closest("button, a, [role='menuitem']");
      if (hit && !hit.matches('[data-fx-part="sub"] > :first-child')) close(m);
    }, on);
    return () => { ac.abort(); close(m); m.querySelectorAll('[data-fx-part="pop"]').forEach((p) => p.style.removeProperty("--fx-shift")); };
  });
})();
