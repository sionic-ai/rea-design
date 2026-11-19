// About: team table — at 1200px and above, entering a row turns on that row’s photo in .15s and it follows the cursor (kept inside the screen), and leaving turns it off in .15s
(() => {
  const box = document.querySelector(".an-members");
  if (!box) return;
  gsap.matchMedia().add("(min-width: 1200px)", () => {
    const medias = [...box.querySelectorAll(".an-member__media")];
    let cur = null;
    // Like the original, measure only once — a hidden (display:none) photo is 0, so the anchor end becomes the screen edge
    const w = medias[0]?.offsetWidth ?? 0, h = medias[0]?.offsetHeight ?? 0;
    const move = (e) => gsap.set(medias, { x: Math.max(0, Math.min(e.clientX, innerWidth - w)), y: Math.max(0, Math.min(e.clientY, innerHeight - h)) });
    const enter = (e) => {
      const row = e.target.closest(".an-member");
      if (!row || !box.contains(row)) return;
      const m = row.querySelector(".an-member__media");
      if (!m) return;
      if (cur && cur !== m) { gsap.killTweensOf(cur); gsap.set(cur, { display: "none", opacity: 0 }); }
      cur = m;
      gsap.set(m, { display: "block" });
      gsap.to(m, { opacity: 1, duration: 0.15, ease: "none" });
    };
    const leave = (e) => {
      const row = e.target.closest(".an-member");
      if (!row || !box.contains(row)) return;
      const m = row.querySelector(".an-member__media");
      if (!m) return;
      if (cur === m) cur = null;
      gsap.to(m, { opacity: 0, duration: 0.15, ease: "none", onComplete: () => gsap.set(m, { display: "none" }) });
    };
    document.addEventListener("pointermove", move);
    box.addEventListener("pointerenter", enter, true);
    box.addEventListener("pointerleave", leave, true);
    return () => {
      cur = null;
      document.removeEventListener("pointermove", move);
      box.removeEventListener("pointerenter", enter, true);
      box.removeEventListener("pointerleave", leave, true);
      gsap.set(medias, { clearProps: "all" });
    };
  });
})();
