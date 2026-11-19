// Sample detail: collapsible questions (open instantly on press), Framer layout transition for the other sample card images
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".dt-q").forEach((q) => {
    const t = q.querySelector(".dt-q__t"), a = q.querySelector(".dt-q__a");
    const bar = q.querySelector(".dt-q__bar--v");
    // Like the original Framer, paint the bars on the frame after the press — put a state marker on the bar first (so elements changed from outside get noticed), then lay it down on the next frame
    const flip = () => {
      const on = q.classList.toggle("is-open");
      a.hidden = !on;
      t.setAttribute("aria-expanded", String(on));
      bar.style.setProperty("--state", on ? "1" : "0");
      requestAnimationFrame(() => bar.classList.toggle("is-on", on));
    };
    t.addEventListener("click", flip);
    t.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), flip()));
    q.querySelector(".dt-q__plus").addEventListener("click", flip);
  });

  // After resizing, an inverse scale makes it look like the old size, then releases to 1 — the values the original measures (width·height immediately, scale as a .4s spring) come out as is.
  const spring = getComputedStyle(document.documentElement).getPropertyValue("--site-spring").trim() || "ease-out";
  document.querySelectorAll(".dt-card").forEach((card) => {
    const art = card.querySelector(".dt-card__art");
    if (!art) return;
    const swap = (on) => {
      const w0 = art.getBoundingClientRect().width;
      card.classList.toggle("is-hover", on);
      if (reduce) return;
      const k = w0 / art.getBoundingClientRect().width;
      art.animate([{ transform: `scale(${k})` }, { transform: "scale(1)" }], { duration: 400, easing: spring });
    };
    card.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && swap(true));
    card.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && swap(false));
  });
})();
