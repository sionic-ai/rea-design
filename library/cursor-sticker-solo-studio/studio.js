// Studio about: a chrome bell tower, a grid where numbers roll up, three green cards unfolding in a pinned range, and a staircase team card.
(() => {
  const SX = window.SX;
  SXChrome(document.querySelector("[data-chrome]"), "tower");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Numbers (original Webflow interaction): when a section head touches the bottom of the screen, the number strip in each slot rolls and stops —
    // Top-aligned slots move from -90%, bottom-aligned slots from 90%, in 2s power3.inOut, and the end mark comes from 20% below in 1.94s over .5s power2.out
    document.querySelectorAll(".s-stat__num").forEach((num) => {
      const tl = gsap.timeline({ paused: true });
      [...num.querySelectorAll(".s-roll")].forEach((c, i) => {
        const d = c.textContent.trim(), up = i % 2 === 0;
        if (!/\d/.test(d)) return;
        // Top alignment makes the first cell the target number, bottom alignment the last cell
        const list = up ? [d, ..."23456789"] : [..."012345678", d];
        c.classList.add(up ? "is-top" : "is-bottom");
        c.innerHTML = `<span>${list.map((x) => `<span>${x}</span>`).join("")}</span>`;
        tl.from(c.firstElementChild, { yPercent: up ? -90 : 90, duration: 2, ease: "power3.inOut" }, 0);
      });
      const suf = num.querySelector(".s-stat__suf");
      if (suf) tl.from(suf, { yPercent: 20, opacity: 0, duration: 0.5, ease: "power2.out" }, 1.94);
      ScrollTrigger.create({ trigger: num, start: "top bottom", once: true, onEnter: () => tl.play() });
    });
  });
  mm.add("(prefers-reduced-motion: no-preference) and (min-width: 992px)", () => {
    // Team (original site-builder interaction): from when the head of the 300vh cell touches the top of the screen until the cell’s end reaches 130% of the screen (scrub .8)
    // From the second card on, cards rise in turn (.5 apart) from transparent and 100% below into their stair positions
    gsap.timeline({ scrollTrigger: { trigger: ".s-team__track", start: "top top", end: "bottom 130%", scrub: 0.8 } })
      .from(".s-team__card:not(:first-child)", { opacity: 0, yPercent: 100, duration: 0.5, stagger: 0.5, ease: "none" });
  });
})();
