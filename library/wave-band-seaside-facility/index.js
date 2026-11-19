// Home — Story photo opening · plate rise (PC), Facility photo opening, activity cell hover, Column keen-slider and progress bar
(() => {
  const BREAKPOINT = 814;
  const CLOSED = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
  const OPEN = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

  const onLoad = () => {
    const mm = gsap.matchMedia();

    // Story — when the title reaches the 60% line of the screen, two photos open bottom to top over 1.2s (.15s apart, .5s late) and photos go 1.2 → 1 (1.1s late).
    // The photo is longer than the board, so it rises within the board by the leftover amount while scrolling
    mm.add(`(min-width: ${BREAKPOINT}px) and (prefers-reduced-motion: no-preference)`, () => {
      const boxes = gsap.utils.toArray(".tn-story__ph");
      if (!boxes.length) return;
      boxes.forEach((box) => {
        const img = box.querySelector(".tn-story__img");
        gsap.set(box, { clipPath: CLOSED });
        gsap.set(img, { scale: 1.2 });
        gsap.fromTo(img, { y: () => box.clientHeight - box.scrollHeight }, { y: 0, ease: "none", scrollTrigger: { trigger: box, scrub: true, start: "top bottom", end: "bottom top", invalidateOnRefresh: true } });
      });
      ScrollTrigger.create({
        trigger: ".tn-story .tn-sh__title", once: true, start: "top 60%",
        onEnter: () => {
          gsap.to(boxes, { clipPath: OPEN, duration: 1.2, stagger: 0.15, delay: 0.5, onComplete: () => gsap.set(boxes, { clearProps: "clipPath" }) });
          gsap.to(".tn-story__img", { scale: 1, duration: 1.2, delay: 1.1, stagger: 0.15 });
        },
      });
    });

    // Facility — when the photo slot reaches the 80% line of the screen it opens from below over 1.2s, and the photo goes 1.2 → 1 .6s later
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      [[".tn-facility__places", ".tn-facility__places li"], [".tn-facility__acts", ".tn-facility__acts li"]].forEach(([box, items]) => {
        const lis = gsap.utils.toArray(items);
        if (!lis.length) return;
        const imgs = lis.map((li) => li.querySelector(".wf-img"));
        gsap.set(lis, { clipPath: CLOSED });
        gsap.set(imgs, { scale: 1.2 });
        ScrollTrigger.create({
          trigger: box, once: true, start: "top 80%",
          onEnter: () => {
            gsap.to(lis, { clipPath: OPEN, duration: 1.2 });
            gsap.to(imgs, { scale: 1, duration: 1.2, delay: 0.6, onComplete: () => gsap.set([...lis, ...imgs], { clearProps: "all" }) });
          },
        });
      });
    });

    // Activity cell — when the pointer is on the photo or name link, the whole cell gets is-hover (blue veil over the photo · white name)
    document.querySelectorAll(".tn-facility__acts li").forEach((li) => {
      li.querySelectorAll("a").forEach((a) => {
        a.addEventListener("mouseenter", () => li.classList.add("is-hover"));
        a.addEventListener("mouseleave", () => li.classList.remove("is-hover"));
      });
    });

    // Column — keen-slider (drag·snap·auto width), the bar starts from the visible share and fills with progress. Cards rise from 22% below, .15s stagger, 1.2s
    const col = document.querySelector(".tn-column");
    const track = col?.querySelector(".keen-slider");
    if (track && window.KeenSlider) {
      const prev = col.querySelector(".tn-prev"), next = col.querySelector(".tn-next");
      const bar = col.querySelector(".tn-column__progress span");
      const base = Math.floor((track.clientWidth / track.scrollWidth) * 100) / 100;
      gsap.set(bar, { scaleX: base });
      const slider = new KeenSlider(track, { loop: false, mode: "snap", rtl: false, slides: { perView: "auto" } });
      prev.addEventListener("click", () => slider.prev());
      next.addEventListener("click", () => slider.next());
      slider.on("detailsChanged", (s) => {
        const d = s.track.details, p = d.progress;
        // The placeholder panel width is a fractional px, so progress stays non-zero even at the very start — the original (==Like 0), turns off within the first 2px
        prev.disabled = p <= 0 || Math.abs(d.position - d.min) < 2;
        next.disabled = p > 0.99;
        gsap.set(bar, { scaleX: (1 - base) * p + base });
      });
      const cards = gsap.utils.toArray(track.querySelectorAll(".tn-card"));
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(cards, { opacity: 0, yPercent: 22 });
        gsap.to(cards, { opacity: 1, yPercent: 0, duration: 1.2, stagger: 0.15, scrollTrigger: { trigger: track, start: "top 60%", once: true }, onComplete: () => gsap.set(cards, { clearProps: "all" }) });
      });
    }
  };
  if (document.readyState === "complete") onLoad(); else addEventListener("load", onLoad);
})();
