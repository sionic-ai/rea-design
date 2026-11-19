// Home — photo open·fold is the side-photo-fold motion part. Here with original values: scroll text 1.2s, title lines 1.6s · .18 stagger power4.out,
// On desktop, scroll is locked until the title finishes rising (max(2.8, 1.6 + .18 × (lines − 1)) + .15s, max 8s), and the head is pinned while the photo folds.
(() => {
  const { reduce } = X;
  const heading = document.querySelector(".h-intro-heading"), scrollTag = document.querySelector(".h-intro-scroll");
  const desk = () => matchMedia("(min-width: 1024px)").matches;

  let locked = false, release = 0;
  const hold = () => scrollY !== 0 && scrollTo(0, 0);
  const block = (e) => { e.preventDefault(); hold(); };
  const lock = () => { if (locked || reduce) return; locked = true; X.lenis?.stop(); scrollTo(0, 0); addEventListener("scroll", hold, { passive: true }); addEventListener("wheel", block, { passive: false }); addEventListener("touchmove", block, { passive: false }); };
  const unlock = () => { if (!locked) return; locked = false; removeEventListener("scroll", hold); removeEventListener("wheel", block); removeEventListener("touchmove", block); scrollTo(0, 0); X.lenis?.start(); ScrollTrigger.refresh(); };
  if (desk()) { lock(); setTimeout(unlock, 8000); }

  const go = () => {
    if (reduce) { gsap.set(scrollTag, { opacity: 1 }); heading.classList.add("is-split"); return; }
    gsap.to(scrollTag, { opacity: 1, duration: 1.2, ease: "power2.out" });
    let lines = 3;
    SplitText.create(heading, { type: "lines", mask: "lines", autoSplit: true, linesClass: "line", onSplit(s) {
      heading.classList.add("is-split");
      lines = s.lines.length;
      return gsap.from(s.lines, { yPercent: 110, duration: 1.6, stagger: 0.18, ease: "power4.out", autoRound: false, force3D: true });
    } });
    if (desk()) { clearTimeout(release); release = setTimeout(unlock, (Math.max(2.8, 1.6 + 0.18 * Math.max(0, lines - 1)) + 0.15) * 1000); }
  };
  addEventListener("x:ready", () => document.fonts.ready.then(go), { once: true });

  gsap.matchMedia().add({ desk: "(min-width: 1024px)", ok: "(prefers-reduced-motion: no-preference)" }, (c) => {
    if (!c.conditions.desk || !c.conditions.ok) return;
    const pin = ScrollTrigger.create({ trigger: ".h-intro", start: "top top", endTrigger: heading, end: "center center", pin: ".x-header", pinSpacing: false, invalidateOnRefresh: true });
    // The fold share that parts emit to the photo slot is applied to the header too — the header nav stays offset as much as the photo and unfolds together
    const intro = document.querySelector(".h-intro"), inner = document.querySelector(".x-header-inner");
    const copy = () => inner.style.setProperty("--fold", intro.style.getPropertyValue("--fx-fold") || "0");
    gsap.ticker.add(copy);
    return () => { pin.kill(); gsap.ticker.remove(copy); inner.style.removeProperty("--fold"); };
  });
})();
