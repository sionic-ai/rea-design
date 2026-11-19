// Shopping center common frame — order and values from the original common.js: attach icon menu, language list (.3s), phone business hours panel, lock the body when a drawer opens, back to top (800ms easeOutQuad) and footer catch
(() => {
  const header = document.querySelector(".ot-header");
  const gnav = header?.querySelector(".ot-gnav");
  const pc = matchMedia("(min-width: 768px)");

  // Icon menu — once scrolling passes its in-place position inside the header (height measured from the header top), it sticks below the white header line
  if (header && gnav) {
    let at = 0;
    const measure = () => {
      gnav.classList.remove("is-fix");
      at = gnav.offsetTop;
      onScroll();
    };
    const onScroll = () => gnav.classList.toggle("is-fix", pc.matches && scrollY > at);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", measure);
    pc.addEventListener("change", measure);
    new ResizeObserver(measure).observe(header);
    measure();
  }

  // Language list — original slide-toggle: min-height to the list height in .3s, pressing outside closes it
  const lang = document.querySelector(".ot-lang");
  if (lang) {
    const btn = lang.querySelector(".ot-lang__btn"), list = lang.querySelector(".ot-lang__list");
    const set = (open) => {
      lang.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      list.style.minHeight = open ? `${list.scrollHeight}px` : "";
    };
    btn.addEventListener("click", (e) => { e.stopPropagation(); set(!lang.classList.contains("is-open")); });
    document.addEventListener("click", (e) => { if (!lang.contains(e.target)) set(false); });
  }

  // Phone business hours — tapping the Business Hours row drops a panel from the top in .4s
  const info = document.querySelector(".ot-info");
  const infoSwitch = document.querySelector(".ot-infoswitch");
  if (info && infoSwitch) {
    const toggle = () => info.classList.toggle("is-open");
    infoSwitch.addEventListener("click", toggle);
    info.querySelector(".ot-info__close")?.addEventListener("click", toggle);
  }

  // Drawer (side-drawer part) — also closes via the inner close button and links, and pins the body at top −scroll while open
  if (header) {
    const toggle = header.querySelector('[data-fx-part="toggle"]');
    const panel = header.querySelector('[data-fx-part="panel"]');
    panel?.querySelector(".ot-menu__close")?.addEventListener("click", () => toggle?.click());
    panel?.addEventListener("click", (e) => { if (e.target.closest("a") && header.classList.contains("is-open")) toggle?.click(); });
    let kept = 0, locked = false;
    new MutationObserver(() => {
      const open = header.classList.contains("is-open");
      if (open === locked) return;
      locked = open;
      if (open) {
        kept = scrollY;
        document.body.style.top = `${-kept}px`;
        document.body.classList.add("is-fixed");
      } else {
        document.body.classList.remove("is-fixed");
        document.body.style.top = "";
        scrollTo(0, kept);
      }
    }).observe(header, { attributes: true, attributeFilter: ["class"] });
  }

  // Back to top — press it and it rises in 800ms swing (what jquery.easing changed to easeOutQuad), and it stops when a wheel or touch comes in
  const top = document.querySelector(".ot-pagetop");
  if (top) {
    let raf = 0;
    const stop = () => cancelAnimationFrame(raf);
    top.addEventListener("click", () => {
      const from = scrollY, t0 = performance.now();
      const dur = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 800;
      stop();
      const step = (now) => {
        const p = dur ? Math.min(1, (now - t0) / dur) : 1;
        scrollTo(0, from * (1 - p * (2 - p)));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    ["wheel", "touchstart", "mousedown"].forEach((t) => addEventListener(t, (e) => { if (e.target !== top) stop(); }, { passive: true }));

    // On reaching the footer, raise bottom so the button’s center sits on the footer’s top line (PC only)
    const footer = document.querySelector(".ot-footer");
    const lock = () => {
      top.style.bottom = "";
      if (!footer || !pc.matches) return;
      const base = parseFloat(getComputedStyle(top).bottom) || 0;
      const over = footer.getBoundingClientRect().top - innerHeight + top.offsetHeight / 2;
      if (over <= -base) top.style.bottom = `${Math.abs(over)}px`;
    };
    addEventListener("scroll", lock, { passive: true });
    addEventListener("resize", lock);
    lock();
  }
})();
