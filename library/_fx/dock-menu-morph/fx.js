// The glass dock at bottom center collapses into a 5rem square when the menu opens (title moves up, icon and burger slide out to the sides) and a close button rises from below.
// The menu panel above the dock unfolds 0 → 1 around its bottom axis and the links rise from 150% below at .02 intervals. It opens by itself when scroll reaches the end, with a to-top button instead of close.
(() => {
  kfFx.register("dock-menu-morph", (el, { options, reduce, scroller }) => {
    const q = (p) => el.querySelector(`[data-fx-part="${p}"]`);
    const qa = (p) => el.querySelectorAll(`[data-fx-part="${p}"]`);
    const dock = q("dock"), bg = q("bg"), panel = q("panel");
    if (!dock || !bg || !panel) return;
    const title = q("title"), mark = q("mark"), openB = q("open"), closeB = q("close"), topB = q("top");
    const pBg = q("panel-bg"), pHead = q("panel-head"), cta = q("cta"), links = qa("link");
    const dur = reduce ? 0 : +(options.dur ?? 0.6);
    const wide = options.width || "27.6rem", narrow = options.collapsed || "5rem", slide = options.slide || "10rem";
    const stagger = +(options.stagger ?? 0.02), linkDur = reduce ? 0 : +(options.linkdur ?? 0.8);
    const ease = kfFx.ease(options.ease || "0.65,0,0.35,1", "power3.inOut");
    const opt = (a) => a.filter(Boolean);
    let open = false;
    const ups = opt([closeB, topB]);
    if (ups.length) gsap.set(ups, { yPercent: 100 });
    gsap.set(panel, { autoAlpha: 0 });
    const D = { duration: dur, ease };
    const set = (v, viaEnd) => {
      if (v === open) return;
      open = v;
      el.classList.toggle("is-open", v);
      const tl = gsap.timeline({ defaults: D });
      if (v) {
        tl.to(bg, { width: narrow, autoRound: false }, 0);
        if (title) tl.to(title, { yPercent: -100 }, 0);
        if (mark) tl.to(mark, { autoAlpha: 0, duration: dur / 2 }, 0).to(mark, { x: slide }, 0);
        if (openB) tl.to(openB, { autoAlpha: 0, duration: dur / 2 }, 0).to(openB, { x: `-${slide}` }, 0);
        const up = viaEnd && topB ? topB : closeB;
        if (up) tl.fromTo(up, { autoAlpha: 1, yPercent: 100 }, { yPercent: 0 }, 0);
        gsap.set(panel, { autoAlpha: 1 });
        if (pHead) gsap.fromTo(pHead, { autoAlpha: 0 }, { delay: dur / 2, autoAlpha: 1, duration: dur, ease });
        if (links.length) gsap.fromTo(links, { yPercent: 150 }, { yPercent: 0, stagger, duration: linkDur, ease });
        if (cta) gsap.fromTo(cta, { autoAlpha: 0 }, { delay: dur / 2, autoAlpha: 1, duration: dur, ease });
        if (pBg) gsap.fromTo(pBg, { scale: 0 }, { scale: 1, duration: dur, ease });
      } else {
        tl.to(bg, { width: wide, autoRound: false }, 0);
        if (title) tl.to(title, { yPercent: 0 }, 0);
        if (mark) tl.to(mark, { x: 0, autoAlpha: 1 }, 0);
        if (openB) tl.to(openB, { x: 0, autoAlpha: 1 }, 0);
        const downs = opt([closeB, topB]);
        if (downs.length) tl.to(downs, { yPercent: 100 }, 0);
        if (links.length) gsap.to(links, { yPercent: 150, overwrite: true, ease: "power3.out", duration: dur });
        const fades = opt([pHead, cta]);
        if (fades.length) gsap.to(fades, { autoAlpha: 0, overwrite: true, ease: "power3.out", duration: dur });
        if (pBg) gsap.to(pBg, { scale: 0, overwrite: true, duration: dur, ease, onComplete: () => { if (!open) gsap.set(panel, { autoAlpha: 0 }); } });
        else gsap.set(panel, { autoAlpha: 0 });
      }
      el.dispatchEvent(new CustomEvent(v ? "fx:open" : "fx:close", { bubbles: true }));
    };
    const onOpen = () => set(true), onClose = () => set(false);
    const toTop = () => (scroller || window).scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    const outside = (e) => { if (open && !el.contains(e.target)) set(false); };
    openB?.addEventListener("click", onOpen);
    title?.addEventListener("click", onOpen);
    closeB?.addEventListener("click", onClose);
    topB?.addEventListener("click", toTop);
    document.addEventListener("click", outside);
    // Opens by itself at the scroll end (progress 1), closes when leaving the end
    const src = scroller || window;
    let atEnd = false;
    const onScroll = () => {
      if (options.end === "0") return;
      const s = scroller || document.scrollingElement;
      const max = s.scrollHeight - s.clientHeight;
      const p = max > 0 ? Math.round(((scroller ? s.scrollTop : scrollY) / max) * 1000) / 1000 : 0;
      if (!atEnd && p >= 1) { atEnd = true; set(true, true); } else if (atEnd && p < 1) { atEnd = false; set(false); }
    };
    src.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      openB?.removeEventListener("click", onOpen);
      title?.removeEventListener("click", onOpen);
      closeB?.removeEventListener("click", onClose);
      topB?.removeEventListener("click", toTop);
      document.removeEventListener("click", outside);
      src.removeEventListener("scroll", onScroll);
      gsap.killTweensOf(opt([bg, title, mark, openB, closeB, topB, panel, pBg, pHead, cta, ...links]));
      gsap.set(opt([bg, title, mark, openB, closeB, topB, panel, pBg, pHead, cta, ...links]), { clearProps: "all" });
      el.classList.remove("is-open");
    };
  });
})();
