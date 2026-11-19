(() => {
  // The menu sits behind the page. Opening shrinks the page by the ratio of the menu column width and lowers it by the menu column height to reveal the menu (corners become rounded).
  // If there is a hand piece, it grabs the top edge of the settled page from above. On narrow screens it doesn’t shrink but slides aside, leaving only peek showing.
  kfFx.register("page-drop-menu", (el, { options, reduce }) => {
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const toggle = part("toggle"), page = part("page"), menu = part("menu");
    if (!toggle || !page || !menu) return;
    const nav = part("nav") || menu;
    const hands = [...el.querySelectorAll('[data-fx-part="hand"]')];
    const dur = reduce ? 0 : +(options.dur ?? 0.6);
    const side = +(options.side || 960);
    const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const len = (v, d) => { const t = String(v ?? d).trim(); return /rem$/.test(t) ? parseFloat(t) * rem() : parseFloat(t); };
    const ease = kfFx.ease(options.ease || "0.34,1.56,0.64,1", "back.out(1.0)");
    const easeClose = kfFx.ease(options["close-ease"] || "0.36,0,0.66,-0.56", "back.in(1.0)");
    let open = false;
    const set = (v) => {
      open = v;
      toggle.setAttribute("aria-expanded", String(v));
      el.classList.toggle("is-fx-open", v);
      if (v) gsap.set(menu, { display: "block", pointerEvents: "auto" });
      const narrow = matchMedia(`(max-width: ${side}px)`).matches;
      const r = nav.getBoundingClientRect();
      const scale = narrow ? 1 : r.width / innerWidth, top = narrow ? 0 : r.height;
      const scroller = page.scrollHeight > page.clientHeight + 1 && getComputedStyle(page).overflowY !== "visible";
      gsap.set(page, { transformOrigin: `50% ${scroller ? page.scrollTop : -page.getBoundingClientRect().top}px` }); // Use the top edge of the currently visible screen as the reference point
      gsap.to(page, {
        scale: v ? scale : 1, y: v ? top : 0, x: v && narrow ? -(innerWidth - len(options.peek, "10rem")) : 0,
        ease: v ? ease : easeClose, duration: dur, overwrite: "auto",
        onComplete: () => { if (!open) { gsap.set(menu, { display: "none", pointerEvents: "none" }); gsap.set(page, { clearProps: "transform" }); } },
      });
      gsap.to(page, { borderRadius: v ? len(options.radius, "20rem") : 0, duration: dur, ease: "expo.inOut" });
      if (!hands.length || narrow) return;
      const w = innerWidth * scale, left = (innerWidth - w) / 2, inset = len(options["hand-inset"], "16rem");
      hands.forEach((h, i) => gsap.set(h, { position: "fixed", top: top - h.offsetHeight / 2, left: i % 2 ? left + w - inset - h.offsetWidth : left + inset }));
      v ? gsap.fromTo(hands, { y: "-100%", opacity: 0 }, { y: 0, opacity: 1, duration: reduce ? 0 : 0.3, ease: "expo.out" })
        : gsap.to(hands, { y: "-100%", opacity: 0, duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.3, ease: "expo.in" });
    };
    gsap.set(menu, { display: "none", pointerEvents: "none" });
    if (hands.length) gsap.set(hands, { opacity: 0 });
    const onToggle = (e) => { e.preventDefault(); set(!open); };
    const onPage = (e) => { if (!open) return; e.preventDefault(); e.stopPropagation(); set(false); };
    const onKey = (e) => { if (open && e.key === "Escape") set(false); };
    toggle.addEventListener("click", onToggle);
    page.addEventListener("click", onPage, true);
    addEventListener("keydown", onKey);
    return () => {
      toggle.removeEventListener("click", onToggle);
      page.removeEventListener("click", onPage, true);
      removeEventListener("keydown", onKey);
      gsap.killTweensOf([page, ...hands]);
      gsap.set(page, { clearProps: "transform,borderRadius,transformOrigin" });
      gsap.set(menu, { clearProps: "display,pointerEvents" });
      if (hands.length) gsap.set(hands, { clearProps: "all" });
      el.classList.remove("is-fx-open");
    };
  });
})();
