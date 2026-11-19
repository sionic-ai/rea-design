// One long paragraph starts each word at 14% opacity and, tied to scroll as it passes the screen, sharpens word by word from the front
(() => {
  kfFx.register("word-dim-scrub", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger || !window.SplitText || !el.textContent.trim()) return;
    if (reduce) return;
    const chars = options.by === "chars";
    // Image between text lines (data-fx-part="slot") is counted as a single word without splitting — when lit, is-fx-lit and the fx:lit event (detail.on)
    const slots = [...el.querySelectorAll('[data-fx-part="slot"]')];
    const split = SplitText.create(el, { ...(chars ? { type: "words,chars", wordsClass: "fx-word-dim-scrub__w", charsClass: "fx-word-dim-scrub__c" } : { type: "words", wordsClass: "fx-word-dim-scrub__w" }), ...(slots.length ? { ignore: slots } : {}) });
    // look: step — Framer ”Fill Text” type: scroll only decides the number of words to light (ratio of the paragraph top moving from screen bottom → top × fill, rounded up) and each word lights with its own timed transition
    if (options.look === "step") {
      const units = [...(chars ? split.chars : split.words).filter((u) => !slots.some((s) => s.contains(u))), ...slots]
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      const fill = +(options.fill || 1), lead = +(options.lead ?? 0), tail = Math.max(0, +(options.tail ?? 0));
      const page = options.range === "page";
      el.classList.add("is-fx-step");
      el.style.setProperty("--fx-from", String(+(options.from ?? 0.2)));
      const on = new Array(units.length).fill(false);
      const paint = () => {
        let lit;
        if (page) {
          // range: page — Studio type: lights up to ⌊p × (cells + tail + 1)⌋ − 1 cells, using the whole-document scroll progress p
          const src = scroller || document.documentElement, max = src.scrollHeight - src.clientHeight;
          const p = max > 0 ? Math.min(1, Math.max(0, src.scrollTop / max)) : 0;
          lit = Math.floor(p * (units.length + tail + 1)) - 1;
        } else {
          const r = el.getBoundingClientRect(), vh = scroller ? scroller.clientHeight : innerHeight;
          const top = scroller ? r.top - scroller.getBoundingClientRect().top : r.top;
          const seen = Math.max(0, Math.min(1, 1 - top / vh));
          lit = Math.ceil(Math.min(1, Math.max(0, (seen - lead) / (1 - lead)) * fill) * units.length);
        }
        units.forEach((u, i) => {
          const next = page ? lit > i : i < lit;
          if (next === on[i]) return;
          on[i] = next;
          u.classList.toggle("is-fx-lit", next);
          if (slots.includes(u)) u.dispatchEvent(new CustomEvent("fx:lit", { bubbles: true, detail: { on: next, index: i } }));
        });
      };
      const src = scroller || window;
      src.addEventListener("scroll", paint, { passive: true });
      addEventListener("resize", paint);
      paint();
      return () => { src.removeEventListener("scroll", paint); removeEventListener("resize", paint); el.classList.remove("is-fx-step"); el.style.removeProperty("--fx-from"); split.revert(); };
    }
    const tw = gsap.fromTo(chars ? split.chars : split.words, { opacity: +(options.from ?? 0.14) }, {
      opacity: 1, ease: "none", stagger: +(options.stagger ?? 0.1),
      scrollTrigger: { trigger: el, scroller, start: options.start || "top 80%", end: options.end || "bottom 45%", scrub: options.scrub ? +options.scrub : true },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); split.revert(); };
  });
})();
