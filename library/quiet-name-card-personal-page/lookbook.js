// Per-photo object dots on/off — pressing the button makes only that photo’s dots appear in sequence (css animation), pressing again makes them vanish. After pressing, button focus is removed (original blur).
(() => {
  document.querySelectorAll(".ll-shot").forEach((shot) => {
    const btn = shot.querySelector(".ll-shot__toggle");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      const on = !shot.classList.contains("is-open");
      shot.classList.toggle("is-open", on);
      btn.setAttribute("aria-pressed", String(on));
      if (e.detail) e.currentTarget.blur();
    });
    shot.querySelectorAll(".ll-dot").forEach((d) => d.addEventListener("click", (e) => { if (e.detail && e.target === e.currentTarget) e.currentTarget.blur(); }));
  });
})();
