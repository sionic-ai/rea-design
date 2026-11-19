// Home motion. Values are exactly the original IX2 (ixData) and the original inline script (word-by-word paragraph).
(() => {
  const { reduce, ease: E } = window.X;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rem = window.X.rem;

  // ── Curtain entrance (IX2 a-22·a-48): on click the remaining sections enter the document right away,
  //    While the logo and button group fade out over .5s ease, the curtain parts ±105% over 1.5s inCubic (when done, the group rises by its own height over .5s linear).
  //    The first title line rises 6rem from below after 1s in 1s outCubic with opacity 1s ease, and the second line does the same at 2s when that one ends ──
  const lines = $$("[data-hero-line]");
  if (!reduce) gsap.set(lines, { opacity: 0, y: () => 6 * rem() });
  let entered = false;
  $("[data-enter]").addEventListener("click", (e) => {
    e.preventDefault();
    if (entered) return;
    entered = true;
    document.body.classList.remove("is-gated");
    build();
    if (reduce) {
      gsap.set("[data-gate]", { opacity: 0, yPercent: -100 });
      gsap.set("[data-curtain='l']", { xPercent: -105 });
      gsap.set("[data-curtain='r']", { xPercent: 105 });
      return;
    }
    gsap.timeline()
      .to("[data-gate]", { opacity: 0, duration: 0.5, ease: E.ease }, 0)
      .to("[data-curtain='l']", { xPercent: -105, duration: 1.5, ease: E.inCubic }, 0)
      .to("[data-curtain='r']", { xPercent: 105, duration: 1.5, ease: E.inCubic }, 0)
      .to("[data-gate]", { yPercent: -100, duration: 0.5, ease: "none" }, 1.5);
    gsap.timeline()
      .to(lines[0], { opacity: 1, duration: 1, ease: E.ease }, 1)
      .to(lines[0], { y: 0, duration: 1, ease: E.outCubic }, 1)
      .to(lines[1], { opacity: 1, duration: 1, ease: E.ease }, 2)
      .to(lines[1], { y: 0, duration: 1, ease: E.outCubic }, 2);
  });

  // Positions can only be measured after the sections enter the document, so build once after pressing the entrance
  function build() {
    ScrollTrigger.refresh();
    window.X.slideIn();
    const mm = gsap.matchMedia();
    const ctx = { desk: "(min-width: 480px)", mob: "(max-width: 479px)", still: "(prefers-reduced-motion: reduce)" };

    // ── Declaration (IX2 a-30·a-16~21·a-31) ──
    const mani = $(".x-mani");
    const words = $$("[data-mani-word]", mani);
    const texts = Object.fromEntries($$("[data-mani-text]", mani).map((p) => [p.dataset.maniText, p]));
    const fadeB = $("[data-mani-fade='b']", mani);
    mm.add(ctx, ({ conditions: c }) => {
      if (c.still) return;
      if (c.desk) {
        // When the section reaches the 30% line of the screen, the whole section appears with a 1.5s ease (once)
        gsap.set(mani, { opacity: 0 });
        window.X.inViewOnce(mani, 70, () => gsap.to(mani, { opacity: 1, duration: 1.5, ease: E.ease }));
        // Hovering a big word brings the small text beside it in from beyond 14rem with .7s easeOut, appearing with 1.2s ease,
        // On scroll down it exits with .7s easeIn and fades with .7s ease (center line from the right, opacity per cell)
        const side = { a: -1, b: 1, c: -1 };
        const offs = [];
        words.forEach((w) => {
          const k = w.dataset.maniWord, p = texts[k], fader = k === "b" ? fadeB : p;
          gsap.set(p, { x: () => side[k] * 14 * rem() });
          gsap.set(fader, { opacity: 0 });
          const over = () => {
            gsap.to(p, { x: 0, duration: 0.7, ease: E.easeOut, overwrite: "auto" });
            gsap.to(fader, { opacity: 1, duration: 1.2, ease: E.ease, overwrite: "auto" });
          };
          const out = () => {
            gsap.to(p, { x: () => side[k] * 14 * rem(), duration: 0.7, ease: E.easeIn, overwrite: "auto" });
            gsap.to(fader, { opacity: 0, duration: 0.7, ease: E.ease, overwrite: "auto" });
          };
          w.addEventListener("mouseenter", over);
          w.addEventListener("mouseleave", out);
          offs.push(() => { w.removeEventListener("mouseenter", over); w.removeEventListener("mouseleave", out); });
        });
        return () => offs.forEach((f) => f());
      }
      // Phone: once when the section center crosses screen center, the big word moves in from outside 15.625rem over .7s outQuad, and the first word appears over .5s,
      // The vertical logo rises from 6.25px below in .7s outQuad · 1s ease, and the small text below from 6.25rem below in 1.2s outQuad · 1s ease
      const movers = $$("[data-mob-from]", mani);
      const logo = $("[data-mani-logo]", mani), mob = $("[data-mani-mob]", mani), first = $("[data-mani-word='a']", mani);
      gsap.set(movers, { x: (i, el) => Number(el.dataset.mobFrom) * 15.625 * rem() });
      gsap.set([first, logo, mob], { opacity: 0 });
      gsap.set(logo, { y: 6.25 });
      gsap.set(mob, { y: () => 6.25 * rem() });
      window.X.inViewOnce(mani, 50, () => {
        gsap.to(movers, { x: 0, duration: 0.7, ease: E.outQuad });
        gsap.to(first, { opacity: 1, duration: 0.5, ease: "none" });
        gsap.to(logo, { y: 0, duration: 0.7, ease: E.outQuad });
        gsap.to(logo, { opacity: 1, duration: 1, ease: E.ease });
        gsap.to(mob, { y: 0, duration: 1.2, ease: E.outQuad });
        gsap.to(mob, { opacity: 1, duration: 1, ease: E.ease });
      });
    });

    // ── Wordmark window (IX2 a-4·a-5·a-34 + original word-by-word script) ──
    const about = $(".x-about");
    const dark = window.X.rgb("var(--kf-contrast-bg)"), out = window.X.rgb("var(--site-about-out)");
    const firsts = $$("[data-about-img] > .x-photo:nth-child(1)", about);
    const nth = (n) => $$(`[data-about-img] > .x-photo:nth-child(${n})`, about);
    new SplitType(".x-seq", { types: "words", tagName: "span" });
    mm.add(ctx, ({ conditions: c }) => {
      if (c.still) {
        gsap.set(about, { backgroundColor: dark });
        gsap.set([...nth(1), ...nth(2), ...nth(3)], { opacity: 0 });
        return;
      }
      // On touching the 30% line of the screen, the background turns black over 1.2s ease and the first photo enters from 105% — each time it leaves, it turns light gray in 1s linear
      gsap.set(firsts, { xPercent: 105 });
      window.X.inView(about, 70, () => {
        gsap.to(about, { backgroundColor: dark, duration: 1.2, ease: E.ease, overwrite: "auto" });
        gsap.to(firsts, { xPercent: 0, duration: 1.2, ease: E.ease });
      });
      window.X.inView(about, 30, null, () => gsap.to(about, { backgroundColor: out, duration: 1, ease: "none", overwrite: "auto" }));
      // Scroll progress 10→20% brings the second photo (inCubic), 40→50% the third, 70→80% the fourth, each sliding in from 105%, and once covered the photo beneath switches off within 1%.
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } })
        .set(nth(2), { xPercent: 105 }, 0).set(nth(3), { xPercent: 105 }, 0).set(nth(4), { xPercent: 105 }, 0)
        .to(nth(2), { xPercent: 0, duration: 10, ease: E.inCubic }, 10)
        .to(nth(1), { opacity: 0, duration: 1 }, 20)
        .to(nth(3), { xPercent: 0, duration: 10 }, 40)
        .to(nth(2), { opacity: 0, duration: 1 }, 50)
        .to(nth(4), { xPercent: 0, duration: 10 }, 70)
        .to(nth(3), { opacity: 0, duration: 1 }, 80)
        .set({}, {}, 100);
      const stop = window.X.ixScroll(about, tl, 0.9);

      // Original script: one screen per paragraph, words rise from below (.05 stagger power2.out), pause half a beat, then vanish upward (power2.in)
      const seqs = gsap.utils.toArray(".x-seq");
      seqs.forEach((text, i) => {
        const chars = text.querySelectorAll(".word");
        const startValue = i === 0 ? "bottom bottom" : "top+=" + i * window.innerHeight + " top";
        const tl = gsap.timeline({ scrollTrigger: { trigger: about, start: startValue, end: () => "top+=" + (i + 1) * window.innerHeight + " top", scrub: true } });
        tl.set(text, { opacity: 1 });
        tl.fromTo(chars, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 1, ease: "power2.out" });
        if (i !== seqs.length - 1) tl.to(chars, { yPercent: -100, opacity: 0, stagger: 0.05, duration: 1, ease: "power2.in" }, "+=0.5");
      });
      return stop;
    });

    // ── Quote pass (IX2 a-10·a-11·a-12): at the 30% line of the screen the background goes black once over 1.2s ease. ──
    //    Over progress 0→60% the card strip shrinks from 100% of its own width to 0 (inCubic), the quote goes 1 → .2 (ease), and the remaining 40% stays still ──
    const look = $(".x-look"), track = $("[data-look-track]"), quote = $("[data-look-quote]");
    mm.add(ctx, ({ conditions: c }) => {
      const lookDark = window.X.rgb("var(--kf-contrast-bg)");
      if (c.still) { gsap.set(look, { backgroundColor: lookDark }); gsap.set(quote, { opacity: 0.2 }); return; }
      window.X.inViewOnce(look, 70, () => gsap.to(look, { backgroundColor: lookDark, duration: 1.2, ease: E.ease }));
      const from = c.desk ? { xPercent: 100 } : { x: () => 23.4375 * rem() };
      const to = c.desk ? { xPercent: 0 } : { x: () => -32.5 * rem() };
      const tl = gsap.timeline({ paused: true })
        .fromTo(track, from, { ...to, duration: 60, ease: E.inCubic }, 0)
        .fromTo(quote, { opacity: 1 }, { opacity: 0.2, duration: 60, ease: E.ease }, 0)
        .set({}, {}, 100);
      const stop = window.X.ixScroll(look, tl, c.desk ? 0.95 : 0.9);
      const fit = () => { const p = tl.progress(); tl.invalidate().progress(p); };
      addEventListener("resize", fit);
      return () => { stop(); removeEventListener("resize", fit); };
    });

    // ── Contact card (IX2 a-15): the whole section appears once at the 30% screen line with 1.5s ease ──
    const cta = $(".x-cta");
    mm.add(ctx, ({ conditions: c }) => {
      if (c.still) return;
      gsap.set(cta, { opacity: 0 });
      window.X.inViewOnce(cta, 70, () => gsap.to(cta, { opacity: 1, duration: 1.5, ease: E.ease }));
    });
  }

  // ── Questions (IX2 a-13·a-14, web builder dropdown): on open height .8s outCubic · + 45° .8s outCubic · answer .4s ease,
  //    On close, answer .6s ease · height .7s inCubic · + return .7s inCubic. Opening one counts as pressing elsewhere, so any open one closes ──
  const items = $$(".x-faq__item");
  const k = reduce ? 0 : 1;
  const setItem = (item, open) => {
    if (item.classList.contains("is-open") === open) return;
    item.classList.toggle("is-open", open);
    const a = $(".x-faq__a", item), p = $(".x-faq__a p", item), icon = $(".x-faq__q svg", item);
    if (open) {
      gsap.to(a, { height: "auto", duration: 0.8 * k, ease: E.outCubic, overwrite: "auto" });
      gsap.to(icon, { rotation: 45, duration: 0.8 * k, ease: E.outCubic, overwrite: "auto" });
      gsap.to(p, { opacity: 1, duration: 0.4 * k, ease: E.ease, overwrite: "auto" });
    } else {
      gsap.to(p, { opacity: 0, duration: 0.6 * k, ease: E.ease, overwrite: "auto" });
      gsap.to(a, { height: 0, duration: 0.7 * k, ease: E.inCubic, overwrite: "auto", onComplete: () => ScrollTrigger.refresh() });
      gsap.to(icon, { rotation: 0, duration: 0.7 * k, ease: E.inCubic, overwrite: "auto" });
    }
  };
  gsap.set($$(".x-faq__a p"), { opacity: 0 });
  items.forEach((item) => {
    $(".x-faq__q", item).addEventListener("click", () => setItem(item, !item.classList.contains("is-open")));
  });
  document.addEventListener("click", (e) => items.forEach((item) => !item.contains(e.target) && setItem(item, false)));
  const more = $("[data-faq-more]");
  more.addEventListener("click", () => {
    const on = !more.classList.contains("is-more");
    more.classList.toggle("is-more", on);
    $("[data-faq]").classList.toggle("is-more", on);
    ScrollTrigger.refresh();
  });
})();
