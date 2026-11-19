// Company overview left TOC: like the original STUDIO toggle, pressing the head folds and unfolds the inner list (＋/－ mark switches).
(() => {
  const fold = CustomEase.create("cpFold", "0.4,0.2,0,1");
  document.querySelectorAll(".cp-side__grp").forEach((grp) => {
    const btn = grp.querySelector(".cp-side__btn");
    const body = grp.querySelector(".cp-side__body");
    gsap.set(body, { height: grp.classList.contains("is-open") ? "auto" : 0 });
    btn.addEventListener("click", () => {
      const open = !grp.classList.contains("is-open");
      grp.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open);
      // Curve re-fitted from the original table-of-contents collapse using motion-probe (.28s cubic-bezier(.4,.2,0,1))
      // Pass the expand height as a pre-measured number. Measuring height:auto on the tween’s first frame stalls one frame and rises later than the original (motion-probe transport)
      gsap.to(body, { height: open ? body.scrollHeight : 0, duration: HS.reduced ? 0 : 0.28, ease: fold, onComplete: () => { open && gsap.set(body, { height: "auto" }); ScrollTrigger.refresh(); } });
    });
  });
})();
