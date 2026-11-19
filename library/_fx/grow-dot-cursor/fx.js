(() => {
  // A small dot sticks right at the mouse position (no follow lag), grows over links and buttons, and becomes a large circle holding an arrow over the left and right halves of the slider.
  kfFx.register("grow-dot-cursor", (el, { options, hover }) => {
    const min = +(options.min ?? 900);
    if (!hover || !matchMedia("(pointer: fine)").matches || innerWidth <= min) return;
    let dot = el.querySelector(':scope > [data-fx-part="dot"]');
    const made = !dot;
    if (made) {
      dot = document.createElement("span");
      dot.setAttribute("data-fx-part", "dot");
      dot.setAttribute("aria-hidden", "true");
      el.append(dot);
    }
    const links = options.links || "a, button, [data-fx-part=target]";
    // Hide the system cursor only when the dot is actually attached — so the cursor doesn’t vanish entirely in narrow windows or on touch
    const hide = String(options.hide ?? "0") === "1";
    if (hide) el.classList.add("is-dot-cursor");
    // Hover a half and the picture in the dot swaps to that side’s arrow, and leaving clears it — like the original, the picture changes instantly with no transition
    const ART = {
      next: '<svg viewBox="0 0 29 12"><path d="M0 6h27M22 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
      prev: '<svg viewBox="0 0 29 12"><path d="M29 6H2M7 1 2 6l5 5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
    };
    const kept = dot.innerHTML;
    const draw = (art) => { if (dot.dataset.art !== art) { dot.innerHTML = art; dot.dataset.art = art; } };
    // move: transform — moves position with transform instead of left · top (the original moves by matrix, so it does not re-layout)
    const byTransform = options.move === "transform";
    const move = byTransform
      ? (e) => { dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`; dot.classList.add("is-on"); }
      : (e) => { dot.style.left = `${e.clientX}px`; dot.style.top = `${e.clientY}px`; dot.classList.add("is-on"); };
    const over = (e) => {
      const nav = e.target.closest?.('[data-fx-part="prev"], [data-fx-part="next"]');
      dot.classList.toggle("is-nav", !!nav);
      draw(nav ? ART[nav.getAttribute("data-fx-part")] : "");
      dot.classList.toggle("is-link", !nav && !!e.target.closest?.(links));
    };
    const leave = () => { dot.classList.remove("is-on", "is-nav", "is-link"); draw(""); };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseover", over);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseover", over);
      el.removeEventListener("mouseleave", leave);
      if (hide) el.classList.remove("is-dot-cursor");
      if (made) dot.remove();
      else { leave(); dot.innerHTML = kept; delete dot.dataset.art; dot.style.left = dot.style.top = dot.style.transform = ""; }
    };
  });
})();
