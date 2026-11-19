// About — fold (original layout switch), value list (the hovered row comes forward and the description on the right changes)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Collapse — original Framer layout transition: the cell height changes right away, the inner content unfolds from its old spot (cell top) with a .9s spring while the divider rises along the same curve
  const spring = getComputedStyle(document.documentElement).getPropertyValue("--site-spring-900").trim() || "ease-out";
  document.querySelectorAll(".dv-acc").forEach((d) => {
    const sum = d.querySelector("summary"), inner = d.querySelector(".dv-acc__in"), line = d.querySelector(".dv-acc__line");
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      const open = !d.open;
      // Like the original no-code builder, it opens and starts releasing on the frame after the press — a state marker is attached inside first (so elements changed outside are recognized) and open/release starts in the same frame, so there is no flicker.
      inner?.style.setProperty("--open", open ? "1" : "0");
      line?.style.setProperty("--open", open ? "1" : "0");
      requestAnimationFrame(() => {
        d.open = open;
        window.ScrollTrigger?.refresh();
        window.dvLenis?.resize();
        if (!open || reduce || !inner) return;
        // The inner projection follows the original recorded curve (big release at first, within 2% at 367ms) with .78s cubic-bezier(.1,1,.1,1) — the divider stays the .9s spring
        inner.animate([{ transform: `translateY(${-Math.round(inner.offsetHeight * 0.5)}px) scaleY(0.5)` }, { transform: "none" }], { duration: 780, easing: "cubic-bezier(0.1, 1, 0.1, 1)" });
        line?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: spring });
      });
    });
  });

  document.querySelectorAll("[data-values]").forEach((box) => {
    const li = [...box.querySelectorAll("li")], ps = [...box.querySelectorAll(".ab-values__text p")];
    const on = (i) => { li.forEach((x, k) => x.classList.toggle("is-on", k === i)); ps.forEach((x, k) => x.classList.toggle("is-on", k === i)); };
    li.forEach((x, i) => { x.addEventListener("pointerenter", () => on(i)); x.addEventListener("click", () => on(i)); });
  });
})();
