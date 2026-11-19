// Motion spanning several pages: curve registration, line splitting, side strip (wide screens expand on hover · phone expands on tap), setting up the page when the loader clears
(() => {
  gsap.registerPlugin(CustomEase, SplitText, Flip);
  CustomEase.create("ag-smooth", "0.5,0,0,1");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = () => innerWidth < 768;

  const ag = (window.ag = {
    reduce,
    phone,
    // Each line is split with a masking box — lines start out pushed down and hidden
    splitLines(targets, yPercent = 110) {
      const s = SplitText.create(targets, { type: "lines", mask: "lines", linesClass: "ag-line", aria: "none", smartWrap: true });
      s.masks?.forEach((m) => m.classList.add("ag-line-mask"));
      if (!reduce) gsap.set(s.lines, { yPercent, willChange: "transform" });
      return s;
    },
  });

  const side = document.querySelector(".ag-side");
  if (side) {
    const chars = side.querySelectorAll(".ag-side__mask:not(:first-child) .ag-side__char");
    let lines = [], tl = null, hasOpen = false;
    const backdrop = document.createElement("div");
    backdrop.className = "ag-side-backdrop";
    if (!reduce) gsap.set(chars, { yPercent: 50, opacity: 0 });
    document.fonts.ready.then(() => {
      lines = ag.splitLines(side.querySelectorAll("[data-split]")).lines;
      const link = side.querySelector(".ag-side__link .ag-line-pad");
      if (link) lines.push(link);
      if (link && !reduce) gsap.set(link, { yPercent: 110 });
    });
    const show = () => {
      if (phone() && hasOpen) return;
      tl?.kill();
      if (reduce) { gsap.set([chars, lines], { yPercent: 0, opacity: 1 }); return; }
      tl = gsap.timeline()
        .fromTo(chars, { yPercent: 50 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "expo", stagger: 0.02 }, 0)
        .to(lines, { yPercent: 0, duration: 0.7, ease: "expo", stagger: 0.065 }, 0.1);
    };
    const hide = () => {
      tl?.kill();
      if (reduce) { gsap.set(chars, { opacity: 0 }); gsap.set(lines, { yPercent: 110 }); return; }
      tl = gsap.timeline()
        .to(chars, { opacity: 0, duration: 0.4, ease: "expo" }, 0)
        .to(lines, { yPercent: 110, duration: 0.5, ease: "expo" }, 0);
    };
    const expand = (on) => {
      side.classList.toggle("is-expanded", on);
      if (on) document.body.append(backdrop); else backdrop.remove();
      on ? show() : hide();
    };
    side.addEventListener("mouseenter", () => { if (!phone()) show(); });
    side.addEventListener("mouseleave", () => { if (!phone()) hide(); });
    side.addEventListener("click", () => { if (phone() && !hasOpen) expand(!side.classList.contains("is-expanded")); });
    backdrop.addEventListener("click", () => expand(false));
    side.querySelector(".ag-side__close")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (phone() && hasOpen) { document.querySelector(".ag-reel")?.dispatchEvent(new CustomEvent("fx:close")); return; }
      expand(false);
    });
    side.querySelectorAll("a").forEach((a) => a.addEventListener("click", (e) => e.stopPropagation()));
    document.addEventListener("ag:open", (e) => {
      hasOpen = e.detail.open;
      side.classList.toggle("has-open", hasOpen);
      if (hasOpen && side.classList.contains("is-expanded")) expand(false);
    });
  }

  // When the loader starts to lift, page text turns on in 1s and .65s later the side bands come in from the left (the phone from the top) in 1.2s
  const inner = document.querySelector(".ag-page__inner");
  const loader = document.querySelector("[data-fx~='swell-title-loader']");
  if (loader && !reduce) {
    document.body.classList.add("is-loading");
    gsap.set(inner, { opacity: 0 });
  }
  document.addEventListener("fx:lift", () => {
    if (reduce) { side?.classList.add("is-visible"); return; }
    gsap.to(inner, { opacity: 1, duration: 1, ease: "ag-smooth", onStart: () => gsap.delayedCall(0.65, () => side?.classList.add("is-visible")) });
  });
  document.addEventListener("fx:done", () => document.body.classList.remove("is-loading"));
  if (!loader) side?.classList.add("is-visible");
})();
