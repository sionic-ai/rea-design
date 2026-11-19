(() => {
  // Header row — the room menu, language menu and phone menu open on click, and close on an outside click or Esc (the original closes the others when one opens)
  const toggles = [
    [document.querySelector(".su-nav__toggle"), document.querySelector(".su-menu--room")],
    [document.querySelector(".su-lang__btn"), document.querySelector(".su-menu--lang")],
    [document.querySelector(".su-burger"), document.querySelector(".su-mobile")],
  ].filter(([b, m]) => b && m);
  const close = (except) => toggles.forEach(([b, m]) => { if (b !== except) { m.hidden = true; b.setAttribute("aria-expanded", "false"); } });
  toggles.forEach(([b, m]) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    close(b);
    m.hidden = !m.hidden;
    b.setAttribute("aria-expanded", String(!m.hidden));
  }));
  document.addEventListener("click", (e) => { if (!e.target.closest(".su-menu, .su-mobile")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  // FAQ — pressing a row drops its answer down from above in .2s and flips the arrow in .3s (several can be open)
  document.querySelectorAll(".su-fq").forEach((li) => {
    const q = li.querySelector(".su-fq__q"), a = li.querySelector(".su-fq__a");
    li.addEventListener("click", () => {
      const open = a.hidden;
      a.hidden = !open;
      li.classList.toggle("is-open", open);
      q.setAttribute("aria-expanded", String(open));
    });
  });
})();
