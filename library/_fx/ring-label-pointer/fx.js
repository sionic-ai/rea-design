(() => {
  // Always track the mouse position over the panel (attached element), and at the press spot (data-fx-part="target") When it is over this, the ‹Click› circle scales up .5 → 1x and
  // The ring of letters around it turns once every 5 seconds. While off it follows the position late with .125s ease-in, and while on it sticks with no lag.
  let uid = 0;
  kfFx.register("ring-label-pointer", (el, { options, hover }) => {
    if (!hover) return;
    const text = options.text || "Click";
    const ring = (options.ring || el.getAttribute("aria-label") || "Studio Name Design Team").toUpperCase();
    const min = +(options.min ?? 768);
    const leave = +(options.leave ?? 125);
    const id = `fx-rlp-${++uid}`;
    const p = document.createElement("div");
    p.className = "fx-rlp";
    p.setAttribute("aria-hidden", "true");
    p.innerHTML = `<svg class="fx-rlp-ring" viewBox="0 0 100 100"><defs><path id="${id}" d="M50 50 m-42 0 a42 42 0 1 1 84 0 a42 42 0 1 1 -84 0"/></defs><text><textPath href="#${id}" textLength="262" lengthAdjust="spacing"></textPath></text></svg><span class="fx-rlp-label"></span>`;
    p.querySelector("textPath").textContent = `${ring} · `;
    p.querySelector(".fx-rlp-label").textContent = text;
    document.body.append(p);

    let over = null, timer = 0;
    const blocked = () => innerWidth < min || document.documentElement.classList.contains("fx-modal-open");
    const move = (e) => {
      if (blocked()) return;
      const w = p.offsetWidth / 2, h = p.offsetHeight / 2;
      p.style.left = `${e.pageX - w}px`;
      p.style.top = `${e.pageY - h}px`;
      const t = e.target.closest?.('[data-fx-part="target"]');
      if (t && el.contains(t) && !p.classList.contains("is-move")) {
        p.classList.add("is-move");
        if (t.dataset.shadow != null) p.classList.add("is-lift");
      }
    };
    const enter = (e) => {
      const t = e.target.closest?.('[data-fx-part="target"]');
      if (!t || !el.contains(t) || t === over || blocked()) return;
      over = t;
      clearTimeout(timer);
      p.querySelector(".fx-rlp-label").textContent = t.dataset.label || text;
      p.classList.add("is-on");
    };
    const out = (e) => {
      if (!over || over.contains(e.relatedTarget)) return;
      over = null;
      p.classList.remove("is-on", "is-lift");
      timer = setTimeout(() => p.classList.remove("is-move"), leave);
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseover", enter);
    el.addEventListener("mouseout", out);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseover", enter);
      el.removeEventListener("mouseout", out);
      p.remove();
    };
  });
})();
