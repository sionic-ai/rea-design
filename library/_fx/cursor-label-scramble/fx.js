(() => {
  // One label shared across the page — follows the cursor coordinates with a .8s power2.out lag, and on entering an attached element, a duration matched to the text length
  // during (.2 + letter count × .035, .27~1s) the letters gather from backslashes into the text
  let label = null, text = null, qx = null, qy = null, current = null, users = 0;
  const make = () => {
    label = document.createElement("div");
    label.setAttribute("data-fx-part", "cursor-label");
    label.setAttribute("aria-hidden", "true");
    label.innerHTML = '<span><b></b><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1"><path d="M1 7l6-6M2.5 1H7v4.5"/></svg></span>';
    document.body.append(label);
    text = label.querySelector("b");
    qx = gsap.quickTo(label, "x", { duration: 0.8, ease: "power2.out" });
    qy = gsap.quickTo(label, "y", { duration: 0.8, ease: "power2.out" });
    addEventListener("pointermove", (e) => { qx(e.clientX); qy(e.clientY); }, { passive: true });
  };
  kfFx.register("cursor-label-scramble", (el, { options, hover }) => {
    if (!hover) return;
    if (!label) make();
    users++;
    const words = options.text || el.getAttribute("aria-label") || "View";
    const enter = () => {
      current = el;
      label.dataset.look = options.look || "";
      if (window.ScrambleTextPlugin) gsap.to(text, { duration: Math.min(1, Math.max(0.27, 0.2 + words.length * 0.035)), ease: "none", overwrite: true, scrambleText: { text: words, chars: options.chars || "\\\\\\", speed: 1, delimiter: "" } });
      else text.textContent = words;
      label.classList.add("is-on");
    };
    const leave = () => { if (current === el) { current = null; label.classList.remove("is-on"); } };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => { leave(); el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave); if (--users === 0) { label.remove(); label = null; } };
  });
})();
