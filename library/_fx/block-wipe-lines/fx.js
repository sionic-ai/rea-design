(() => {
  kfFx.register("block-wipe-lines", (el, { options, reduce, scroller }) => {
    // With split: lines, the text is split into lines and a block is attached per line — for long paragraphs where line-marker children can’t be attached separately (Name’s about text)
    const auto = options.split === "lines" && !el.querySelector('[data-fx-part="line"]');
    if (reduce || !(auto ? el.textContent.trim() : el.children.length)) return;
    gsap.registerPlugin(ScrollTrigger);
    const fill = +(options.fill ?? 0.3), reveal = +(options.reveal ?? 0.45), each = +(options.each ?? 0.05), delay = +(options.delay ?? 0);
    const left = options.from === "left";
    // look: slide — blocks do not grow but slide in from one side (−101%) to cover and exit to the other (the line clips overflow). hold is how long it stays covering, show is when the text turns on (seconds from line start)
    const slide = options.look === "slide", hold = +(options.hold ?? 0), show = options.show == null ? null : +options.show;
    const easeIn = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    const easeOut = kfFx.ease(options["reveal-ease"] || options.ease || "power3.out", "power3.out");
    let parts = [], split = null, live = true;
    const mm = gsap.matchMedia();
    const build = () => {
      if (!live) return;
      if (auto) split = SplitText.create(el, { type: "lines", linesClass: "fx-block-wipe-lines__line" });
      let lines = auto ? split.lines : [...el.querySelectorAll('[data-fx-part="line"]')];
      if (!lines.length) lines = [...el.children];
      // Text within a line is wrapped as one chunk and hidden, and one block is added per line — on teardown it is restored to the original children
      parts = lines.map((line) => {
        const text = document.createElement("span");
        text.className = "fx-block-wipe-lines__text";
        text.append(...line.childNodes);
        const mask = document.createElement("span");
        mask.className = "fx-block-wipe-lines__mask";
        line.append(text, mask);
        return { line, text, mask };
      });
      el.classList.add("fx-block-wipe-lines--ready");
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ delay, scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "top 80%", ...(options.replay === "true" && { toggleActions: "restart none none reset" }) } });
        parts.forEach(({ text, mask }, i) => {
          const t0 = i * each, side = left ? -101 : 101;
          tl.set(text, { visibility: "hidden" }, t0);
          if (slide) {
            gsap.set(mask, { scaleX: 1, xPercent: side });
            tl.fromTo(mask, { xPercent: side }, { xPercent: 0, duration: fill, ease: easeIn, immediateRender: false }, t0)
              .to(mask, { xPercent: -side, duration: reveal, ease: easeOut }, t0 + fill + hold);
          } else {
            tl.fromTo(mask, { scaleX: 0 }, { scaleX: 1, transformOrigin: left ? "left center" : "right center", duration: fill, ease: easeIn, immediateRender: false }, t0)
              .to(mask, { scaleX: 0, transformOrigin: left ? "right center" : "left center", duration: reveal, ease: easeOut }, t0 + fill + hold);
          }
          tl.set(text, { visibility: "visible" }, t0 + (show ?? fill));
        });
      });
    };
    if (auto) document.fonts.ready.then(build); else build();
    return () => {
      live = false;
      mm.revert();
      el.classList.remove("fx-block-wipe-lines--ready");
      parts.forEach(({ line, text, mask }) => { mask.remove(); line.append(...text.childNodes); text.remove(); });
      split?.revert();
    };
  });
})();
