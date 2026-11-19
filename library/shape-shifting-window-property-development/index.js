// Home — after the loader, video plays once → name rises, About 900vh stage, section background parallax, list·photo picker, root mask, slider around the phone.
(() => {
  if (!window.gsap) return;
  const { reduce } = window.BA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  $$("[data-logo]").forEach((n) => (n.innerHTML = BA.LOGO));
  // The map part turns off only the tilt under reduced motion and keeps cursor lighting on — it passes a lighting strength of 0 before the part attaches (DOMContentLoaded)
  const map = $(".ba-map[data-fx-tilt-map-light]");
  if (reduce && map) map.setAttribute("data-fx-tilt-map-light", map.getAttribute("data-fx-tilt-map-light") + "; light: 0");

  // Window video starts loading and playing 400px before it enters the screen (original LazyVideo)
  const vio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    vio.unobserve(e.target);
    const v = e.target;
    if (!v.src) v.src = v.dataset.src;
    v.play().catch(() => {});
  }), { rootMargin: "400px" });
  $$("video[data-src]").forEach((v) => vio.observe(v));

  // Lock scroll during the loader (part), and when it ends play the hero video once — when the video ends the name letters rise
  const loader = $(".loader"), video = $(".ba-hero__video"), title = $(".ba-hero__title"), h1 = $(".ba-hero__title h1");
  BA.lenis?.stop();
  const reveal = () => {
    // Also group by word so English names don’t break mid-word at phone width (the original also groups with word-wrap)
    const split = new SplitText(h1, { type: "chars,words" });
    if (reduce) return gsap.set(title, { opacity: 1 });
    gsap.set(split.chars, { opacity: 0, y: "2rem" });
    gsap.timeline()
      .to(title, { opacity: 1, duration: 0.8, ease: "power2.out" }, 0)
      .to(split.chars, { opacity: 1, y: 0, duration: 0.9, stagger: 0.05, ease: "power2.out" }, 0);
  };
  let shown = false;
  const once = () => { if (!shown) { shown = true; reveal(); } };
  video.addEventListener("ended", once, { once: true });
  loader.addEventListener("fx:done", () => {
    BA.lenis?.start();
    video.play().catch(once);
    // Even if the video stalls or the end event never arrives, the name is raised once the video length has passed
    setTimeout(once, ((video.duration || 2.75) + 0.1) * 1000);
  }, { once: true });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    BA.intro(document.querySelector(".ba-intro"));

    // Photo stage section — background +20rem, video in the window +10rem (tied to scroll)
    $$(".ba-open").forEach((sec) => {
      const tl2 = gsap.timeline({ scrollTrigger: { trigger: sec, scrub: true } });
      tl2.to($(".ba-parallax", sec), { top: "+=20rem", ease: "power1.inOut" });
      const p = $(".ba-portrait", sec);
      if (p) tl2.to(p, { top: "+=10rem", ease: "power1.inOut" }, "<");
    });

    // Roots — after 2s the mask opens from 0 to full size over 1.5s at .3 stagger, and the label line moves from −10rem to +15rem during scroll
    const roots = $(".ba-roots__trigger");
    const masks = $$(".ba-roots__mask", roots);
    // If from reads the end value from the computed value, the forms ”0%” ↔ ”100% auto” differ and the browser stalls at 0% and 88% — pin the start and end to the same form
    const sizes = masks.map((m) => getComputedStyle(m).maskSize || "100% auto");
    gsap.fromTo(masks, { maskSize: "0% auto", webkitMaskSize: "0% auto" }, { maskSize: (i) => sizes[i], webkitMaskSize: (i) => sizes[i], stagger: 0.3, ease: "power2.inOut", duration: 1.5, delay: 2, scrollTrigger: { trigger: roots, start: "top 70%" } });
    gsap.set(".ba-roots__kicker-wrap", { y: "-10rem" });
    gsap.to(".ba-roots__kicker-wrap", { y: "+=15rem", ease: "none", scrollTrigger: { trigger: roots, scrub: true } });
  });

  BA.lists();

  // Phone and tablet side section — original keen-slider cards
  if (window.KeenSlider && matchMedia("(max-width: 1120px)").matches) {
    new KeenSlider(".ba-around__slider", { loop: true, slides: { perView: 1 } });
  }
})();
