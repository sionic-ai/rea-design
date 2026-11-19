// News — original NewsPage: each card’s photo (40px below · transparent) and text (18px below) stand up separately. The top card of each column (first row) goes straight at .1 intervals
// Photo .52s, text .34s (after .12) power3.out, the rest, on reaching 92% of the screen, photo .6s, text .4s. Load more unfolds the remaining cards and reruns this setup from the start.
(() => {
  const TW = window.TW, { q, qa } = TW;
  TW.start(() => {
    let ctx = null;
    const setup = () => {
      if (TW.reduce) return;
      ctx?.revert();
      ctx = gsap.context(() => {
        const cards = qa(".tw-ncard:not([hidden])");
        const parts = (c) => [q(".tw-ncard-media", c), q(".tw-ncard-txt", c)];
        gsap.set(cards.map((c) => parts(c)[0]), { autoAlpha: 0, y: 40 });
        gsap.set(cards.map((c) => parts(c)[1]), { autoAlpha: 0, y: 18 });
        const first = qa(".tw-news-col").map((col) => q(".tw-ncard:not([hidden])", col)).filter(Boolean);
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        first.forEach((c, i) => {
          const [m, t] = parts(c);
          tl.to(m, { autoAlpha: 1, y: 0, duration: 0.52 }, 0.1 * i).to(t, { autoAlpha: 1, y: 0, duration: 0.34 }, 0.1 * i + 0.12);
        });
        cards.filter((c) => !first.includes(c)).forEach((c) => {
          const [m, t] = parts(c);
          gsap.timeline({ defaults: { ease: "power3.out" }, scrollTrigger: { trigger: c, start: "top 92%", toggleActions: "play none none none" } })
            .to(m, { autoAlpha: 1, y: 0, duration: 0.6 }, 0)
            .to(t, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.12);
        });
        ScrollTrigger.refresh();
      }, q(".tw-news"));
    };
    setup();
    qa(".tw-nf").forEach((b) => b.addEventListener("click", () => qa(".tw-nf").forEach((x) => x.classList.toggle("is-active", x === b))));
    q(".tw-more")?.addEventListener("click", (e) => {
      // Newly attached card photos appear once loaded, like the original FadeInImage
      const fresh = qa(".tw-ncard[data-more] .wf-img");
      fresh.forEach((m) => m.classList.add("tw-fade-img"));
      qa(".tw-ncard[data-more]").forEach((c) => { c.hidden = false; });
      e.currentTarget.closest(".tw-more-row").remove();
      setup();
      TW.loaded(fresh);
    });
  });
})();
