// Recruiting accordion rows — original Accordion: on press, is-active is swapped onto the summary immediately (two marker strokes 180°) and the inner height opens and closes over expo.out .3s (original data-duration default).
// As in the original, height is measured by GSAP on the first tick ("auto"· current height) — forcing layout with scrollHeight at the pressed spot pushes the start to the end of the frame, so the first-frame progress diverges from the original
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".th-acc").forEach((d) => {
    const sum = d.querySelector("summary");
    const body = d.querySelector(".th-rc__dl");
    if (!sum || !body) return;
    body.classList.add("th-acc__body");
    sum.classList.toggle("is-active", d.open);
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      const opening = !d.open;
      sum.classList.toggle("is-active", opening);
      const dur = reduced ? 0 : 0.3;
      if (opening) {
        body.style.height = "0px";
        d.open = true;
        gsap.to(body, { height: "auto", duration: dur, ease: "expo.out", overwrite: "auto", onComplete: () => ScrollTrigger.refresh() });
      } else {
        gsap.to(body, { height: 0, duration: dur, ease: "expo.out", overwrite: "auto", onComplete: () => { d.open = false; ScrollTrigger.refresh(); } });
      }
    });
  });
})();
