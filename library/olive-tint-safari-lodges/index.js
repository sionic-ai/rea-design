// Home — big photo strip unfold (inset 0 36% → 0), next photo width wipe, photo cloud speed, photo strip joining.
(() => {
  const T = window.T;
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const exp = document.querySelector(".t-large__exp");
    if (exp && T.desk()) {
      gsap.set(exp, { clipPath: "inset(0% 36% 0%)" });
      gsap.to(exp, { clipPath: "inset(0% 0% 0%)", ease: "power2.inOut", duration: 0.8, scrollTrigger: { trigger: exp, start: "top bottom", end: "bottom bottom", scrub: true } });
    }
    document.querySelectorAll(".t-cloud__img").forEach((img, i) => {
      const speed = [-80, -140, -60, 120, 60, 100][i % 6];
      gsap.fromTo(img, { y: -speed }, { y: speed, ease: "none", scrollTrigger: { trigger: ".t-cloud", start: "top bottom", end: "bottom top", scrub: true } });
    });
  });

  /* Large photo — on press the next one widens from the right to cover it (width 0 → 100%) */
  const slides = [...document.querySelectorAll(".t-large__slide")], count = document.querySelector("[data-count]");
  let cur = 0, busy = false;
  const next = () => {
    if (busy || slides.length < 2) return;
    busy = true;
    const n = (cur + 1) % slides.length, el = slides[n];
    el.style.zIndex = 2;
    slides[cur].style.zIndex = 1;
    gsap.fromTo(el, { width: "0%" }, { width: "100%", duration: T.reduce ? 0 : 1, ease: "power3.inOut", onComplete: () => {
      slides[cur].classList.remove("is-on"); slides[cur].style.width = ""; slides[cur].style.zIndex = "";
      el.classList.add("is-on"); el.style.zIndex = ""; cur = n; busy = false;
      if (count) count.textContent = `${String(cur + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    } });
  };
  document.querySelector(".t-large__slides")?.addEventListener("click", next);
  document.querySelector("[data-next]")?.addEventListener("click", next);

  /* Photo strip — append one more copy of the same row and run it to -50% for a seamless loop */
  const track = document.querySelector(".t-marq__track");
  if (track) [...track.children].forEach((c) => { const d = c.cloneNode(true); d.setAttribute("aria-hidden", "true"); track.append(d); });
})();
