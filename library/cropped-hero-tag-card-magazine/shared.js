// Header pin, menu drawer, to-top button, accordion — as in the original, state is set as body attributes and css handles look and motion
(() => {
  const body = document.body;
  const BP = 769;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let scTop = 0, fixed = false, menuOpen = false, lockPos = 0, shown = false, stuck = false;
  const totop = document.querySelector(".kk-totop");
  const footer = document.querySelector(".kk-footer");
  const drawer = document.querySelector(".kk-drawer");

  const headerCheck = () => {
    if (!fixed && scTop >= 100) { body.dataset.headerFixed = "true"; fixed = true; }
    else if (fixed && scTop < 100) { body.dataset.headerFixed = "false"; fixed = false; }
  };

  // When the to-top button touches the footer’s top edge (−35px) it sticks there, and drops off again when the screen bottom rises back above the footer.
  const totopCheck = () => {
    if (!totop || !footer) return;
    if (!shown && scTop >= 300) { totop.dataset.show = ""; shown = true; }
    if (!shown) return;
    if (scTop < 300) { delete totop.dataset.show; shown = false; return; }
    const footTop = footer.getBoundingClientRect().top + scrollY;
    if (stuck) {
      if (scTop + innerHeight < footTop + 38 + 35 || innerWidth < BP) { delete totop.dataset.stuck; stuck = false; }
    } else if (innerWidth >= BP && totop.getBoundingClientRect().top + scrollY > footTop - 35) {
      totop.dataset.stuck = ""; stuck = true;
    }
  };

  // Pin the drawer’s bottom group (search·mail·links) to the screen bottom — if the content is short, increase the top margin, if long, keep the default margin
  const menuAdjust = () => {
    const foot = document.querySelector(".kk-drawer__foot-box"), flex = document.querySelector(".kk-drawer__flex");
    if (!foot || !flex) return;
    const wide = innerWidth >= BP;
    const pad = wide ? 170 : 228, min = wide ? 152 : 0;
    foot.style.marginTop = Math.max(innerHeight - (pad + flex.offsetHeight + foot.offsetHeight), min) + "px";
  };

  const setMenu = (open) => {
    if (open === menuOpen) return;
    menuOpen = open;
    if (open) {
      lockPos = scTop;
      if (drawer) drawer.scrollTop = 0;
      body.dataset.overlay = "true";
      body.dataset.menuOpen = "true";
      body.style.top = -lockPos + "px";
    } else {
      body.dataset.overlay = "false";
      body.dataset.menuOpen = "false";
      body.style.top = "0px";
      scrollTo(0, lockPos);
    }
  };
  document.querySelectorAll(".js-menu").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); setMenu(!menuOpen); }));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen) setMenu(false); });

  // Original jQuery animate 500ms 'swing'(0.5 − cos(πp)/2)
  const swingTo = (y) => {
    const from = scrollY, t0 = performance.now(), dur = reduce ? 0 : 500;
    const step = (now) => {
      const p = dur ? Math.min(1, (now - t0) / dur) : 1;
      scrollTo(0, from + (y - from) * (0.5 - Math.cos(p * Math.PI) / 2));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  totop?.addEventListener("click", (e) => { e.preventDefault(); swingTo(0); });

  // Accordion — on press the answer opens to height auto and fades in over .2s (delayed .1s)
  document.querySelectorAll(".js-acc").forEach((btn) => btn.addEventListener("click", (e) => {
    e.preventDefault();
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    btn.nextElementSibling?.setAttribute("aria-hidden", String(open));
  }));

  const onScroll = () => {
    if (menuOpen) return;
    scTop = scrollY;
    headerCheck();
    totopCheck();
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", menuAdjust);
  const start = () => { scTop = scrollY; headerCheck(); menuAdjust(); totopCheck(); body.dataset.loaded = "true"; };
  if (document.readyState === "complete") start(); else addEventListener("load", start);
})();
