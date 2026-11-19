// First page — progress bar and arrows on the horizontal photo strip, endlessly cycling photo slides on each lodging card, ridge photo swapping every 4 seconds.
(() => {
  const mm = gsap.matchMedia();

  /* Hero video: plays silently once loading finishes, and if autoplay is blocked as in low-power mode it plays again on the first touch·press — original order as is */
  const mvVideos = [...document.querySelectorAll(".eb-mv__video")];
  const playMv = () => mvVideos.forEach((v) => { v.muted = true; if (v.paused) v.play().catch(() => {}); });
  mm.add({ still: "(prefers-reduced-motion: reduce)", move: "(prefers-reduced-motion: no-preference)" }, ({ conditions }) => {
    if (conditions.still) { mvVideos.forEach((v) => { v.pause(); v.currentTime = 0; }); return; }
    if (document.readyState === "complete") playMv();
    else addEventListener("load", playMv, { once: true });
    const onGesture = () => {
      playMv();
      document.removeEventListener("touchstart", onGesture, true);
      document.removeEventListener("click", onGesture, true);
    };
    document.addEventListener("touchstart", onGesture, { capture: true, passive: true, once: true });
    document.addEventListener("click", onGesture, { capture: true, once: true });
    return () => {
      document.removeEventListener("touchstart", onGesture, true);
      document.removeEventListener("click", onGesture, true);
    };
  });

  /* Photo strip: the bar is pre-filled 150px from the start and the remaining length grows with the horizontal scroll ratio. Arrows move one photo width (290px) at a time */
  const scroller = document.querySelector("[data-gallery]");
  const fill = document.querySelector("[data-gallery-fill]");
  if (scroller && fill) {
    const paint = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      const barW = fill.parentElement.offsetWidth;
      const ratio = max > 0 ? scroller.scrollLeft / max : 0;
      fill.style.width = `${150 + (barW - 150) * ratio}px`;
    };
    scroller.addEventListener("scroll", paint, { passive: true });
    addEventListener("resize", paint, { passive: true });
    paint();
    document.querySelectorAll(".eb-gallery__arrows button").forEach((b) => {
      b.addEventListener("click", () => scroller.scrollBy({ left: b.dataset.dir === "prev" ? -290 : 290, behavior: "smooth" }));
    });
  }

  /* Lodging photo slider: clone end slides before and after so pressing next at the end keeps going in the same direction, and when sliding finishes silently jump to the real slide */
  document.querySelectorAll(".eb-car").forEach((car) => {
    const track = car.querySelector(".eb-car__track");
    const dots = [...car.querySelectorAll(".eb-car__dots button")];
    const count = track.children.length;
    if (count < 2) return;
    track.append(track.children[0].cloneNode(true));
    track.prepend(track.children[count - 1].cloneNode(true));
    let pos = 1;
    let busy = false;
    const move = (to, instant) => {
      track.style.transition = instant ? "none" : "transform 0.35s ease";
      if (instant) void track.offsetWidth;
      track.style.transform = `translateX(-${to * 100}%)`;
      pos = to;
    };
    const mark = () => {
      const cur = (pos - 1 + count) % count;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === cur));
    };
    move(1, true);
    track.addEventListener("transitionend", (e) => {
      if (e.propertyName !== "transform") return;
      if (pos === count + 1) move(1, true);
      else if (pos === 0) move(count, true);
      mark();
      busy = false;
    });
    const go = (to) => {
      if (busy || to === pos) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { move(to === count + 1 ? 1 : to === 0 ? count : to, true); mark(); return; }
      busy = true;
      move(to, false);
    };
    car.querySelectorAll(".eb-car__btns button").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      go(b.dataset.dir === "prev" ? pos - 1 : pos + 1);
    }));
    dots.forEach((d, i) => d.addEventListener("click", (e) => { e.stopPropagation(); go(i + 1); }));
    let sx = 0;
    let sy = 0;
    car.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    car.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) go(dx < 0 ? pos + 1 : pos - 1);
    }, { passive: true });
  });

  /* Ridge photo: every 4s the next shot fades in over 1.2s */
  const slides = [...document.querySelectorAll("[data-about-slider] .eb-ph")];
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    if (slides.length < 2) return;
    let cur = slides.findIndex((s) => s.classList.contains("is-active"));
    const id = setInterval(() => {
      slides[cur].classList.remove("is-active");
      cur = (cur + 1) % slides.length;
      slides[cur].classList.add("is-active");
    }, 4000);
    return () => clearInterval(id);
  });
})();
