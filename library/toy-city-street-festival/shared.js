// Page-wide motion such as the opening screen, drawing cursor, in-view, header language drawer, phone menu, card modal, favorites and hero pupils.
(() => {
  const root = document.documentElement;
  const body = document.body;
  const lg = matchMedia("(min-width: 1001px)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.gsap && window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);

  // The original attaches the in-view watcher only after the page is shown (page-show) — so entrance motions don’t finish early behind the opening screen
  const startInview = () => {
    const once = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("js-inview--enter"); once.unobserve(e.target); } });
    }, { rootMargin: "0% 50% -18%" });
    document.querySelectorAll(".js-inview").forEach((el) => once.observe(el));
    const loop = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle("js-inview--enter", e.isIntersecting));
    }, { rootMargin: "0%" });
    document.querySelectorAll(".js-inview-infinite").forEach((el) => loop.observe(el));
  };

  const showPage = () => {
    if (body.classList.contains("is-contents-show")) return;
    body.classList.remove("is-loading");
    body.classList.add("is-contents-show");
    startInview();
  };

  // Opening screen: visible for at least 4.5s (original minDisplayDurationMs), on close it is pressed down and slides up, then the backdrop lifts .8s later
  // Original shouldDisplayOpening: ?opening=Skipped if skip, or if arrived via back/forward (otherwise shown every time)
  const opening = document.querySelector(".l-opening");
  const navType = performance.getEntriesByType?.("navigation")[0]?.type;
  const skipOpening = new URLSearchParams(location.search).get("opening") === "skip" || window.navigation?.activation?.navigationType === "traverse" || navType === "back_forward";
  if (opening) {
    addEventListener("pageshow", (e) => { if (e.persisted) { opening.classList.add("is-gone"); showPage(); } });
    if (reduce || skipOpening) { opening.classList.add("is-gone"); showPage(); }
    else {
      const t0 = performance.now();
      requestAnimationFrame(() => opening.classList.add("is-show"));
      let done = false;
      const hide = () => {
        if (done) return;
        done = true;
        opening.classList.add("is-hidden");
        showPage();
        setTimeout(() => opening.classList.add("is-gone"), 1400);
      };
      addEventListener("load", () => setTimeout(hide, Math.max(0, 4500 - (performance.now() - t0))));
      setTimeout(hide, 10000);
      opening.querySelector(".p-opening__center-visual")?.addEventListener("click", hide);
    }
  } else showPage();

  // The five hover background colors shift the start color by one step on each hover
  const colors = ["art", "animation", "music", "event", "cosplay"].map((k) => `var(--site-cat-${k})`);
  let start = 0;
  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest(".c-mo-colorful");
    if (!el || el.contains(e.relatedTarget)) return;
    colors.forEach((_, i) => root.style.setProperty(`--hc${i}`, colors[(start + i) % 5]));
    start = (start + 1) % 5;
  });

  // Image cursor: arrow ↔ finger
  const cursor = document.querySelector(".c-cursor");
  if (cursor && fine.matches) {
    body.classList.add("has-custom-cursor");
    // In the original, over the map (gmp-map) the custom cursor is hidden and the default cursor shows
    const sel = 'a, button, [role="button"], input[type="button"], input[type="submit"], .c-map-pin';
    addEventListener("pointermove", (e) => {
      const overMap = !!e.target.closest?.(".p-map__embed");
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      cursor.classList.toggle("is-active", !overMap);
      body.classList.toggle("has-custom-cursor", !overMap);
      cursor.classList.toggle("is-hover", !!e.target.closest?.(sel));
    }, { passive: true });
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
  } else cursor?.remove();

  // In-page movement is .6s power3.out (original fScroll)
  const scrollToEl = (el) => {
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const y = el.getBoundingClientRect().top + scrollY - margin;
    if (window.gsap && !reduce) gsap.to(window, { duration: .6, scrollTo: { y, autoKill: true }, ease: "power3.out" });
    else scrollTo(0, y);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a.js-scroll, a.js-filter");
    if (!a) return;
    const el = document.querySelector(a.getAttribute("href"));
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToEl(el);
  });

  // Header category pill: moves the current marker and notifies the list (filtering is in index.js)
  document.querySelectorAll("[data-filter]").forEach((btn) => btn.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("is-current", b === btn));
    dispatchEvent(new CustomEvent("program:filter", { detail: btn.dataset.filter }));
  }));

  // Language drawer: on mouse, just hovering opens it. On touch, tap the current language and the rest bounce down at 25ms intervals
  const langs = document.querySelector(".p-header__languages");
  let langTimer = 0;
  if (langs && fine.matches) {
    langs.addEventListener("mouseenter", () => { clearTimeout(langTimer); langs.classList.add("is-open"); });
    langs.addEventListener("mouseleave", () => { langTimer = setTimeout(() => langs.classList.remove("is-open"), 20); });
  }
  langs?.addEventListener("click", (e) => {
    const li = e.target.closest(".p-header__language");
    if (!li) return;
    if (li.classList.contains("is-current")) { if (!fine.matches) langs.classList.toggle("is-open"); return; }
    langs.querySelectorAll(".p-header__language").forEach((x) => x.classList.toggle("is-current", x === li));
    langs.classList.remove("is-open");
  });
  document.addEventListener("click", (e) => { if (langs && !langs.contains(e.target)) langs.classList.remove("is-open"); });

  // Bottom bar: once past the hero it narrows to the width of the menu cell (original rootMargin -90%)
  const fv = document.querySelector(".p-fv");
  const bar = document.querySelector(".l-fixed_bottom");
  if (fv && bar) {
    new IntersectionObserver(([e]) => bar.classList.toggle("is-narrow", !e.isIntersecting), { rootMargin: "-90% 0% 0%", threshold: 0 }).observe(fv);
  }

  // Phone menu: full screen opened by the green button on the bottom strip
  const menu = document.querySelector(".l-menu");
  function closeMenu() { if (!menu?.classList.contains("is-open")) return; menu.classList.remove("is-open"); body.style.overflow = ""; }
  document.querySelector(".p-fixed_bottom__button")?.addEventListener("click", () => { menu.classList.add("is-open"); body.style.overflow = "hidden"; });
  document.querySelector(".p-menu_close")?.addEventListener("click", closeMenu);

  // Favorites: attach data-fav to a card and stack small cards in the left menu
  const favList = document.querySelector(".p-menu__fav-list");
  const favNum = document.querySelector(".p-menu__fav-header-title-num");
  const syncFav = () => {
    const items = [...document.querySelectorAll(".p-program__item[data-fav]")];
    favList.innerHTML = "";
    items.forEach((li) => {
      const mini = document.createElement("li");
      mini.className = "c-program-item";
      mini.dataset.category = li.dataset.category;
      mini.dataset.status = li.dataset.status;
      mini.innerHTML = `<a class="c-program-item__link" href="#${li.dataset.id}" data-modal-open><div class="c-program-item__image"><div class="wf-img wf-r-1x1" data-label="Poster shrink"></div></div><div class="c-program-item__content"><div class="c-program-item__period"><p class="c-program-item__period-date u-font-en">${li.querySelector(".p-program__item-period-date").textContent}</p><p class="c-program-status"></p></div><h3 class="c-program-item__title">${li.querySelector(".p-program__item-title").textContent}</h3></div></a>`;
      favList.append(mini);
    });
    favNum.textContent = items.length;
    menu.classList.toggle("is-no-fav", !items.length);
  };
  const toggleFav = (li) => { li.toggleAttribute("data-fav"); syncFav(); };
  document.addEventListener("click", (e) => {
    const fav = e.target.closest(".c-program-fav");
    if (!fav) return;
    e.preventDefault();
    const li = fav.closest(".p-program__item") || document.querySelector(`.p-program__item[data-id="${modal.dataset.id}"]`);
    if (!li) return;
    toggleFav(li);
    modalItem.toggleAttribute("data-fav", li.hasAttribute("data-fav"));
  });
  document.querySelector(".p-menu__fav-header-clear")?.addEventListener("click", () => {
    document.querySelectorAll(".p-program__item[data-fav]").forEach((li) => li.removeAttribute("data-fav"));
    syncFav();
  });

  // Card modal: moves the clicked card’s text in and opens
  const modal = document.querySelector(".l-program_modal");
  const modalItem = modal?.querySelector(".p-program_modal__item");
  const openModal = (id) => {
    const li = document.querySelector(`.p-program__item[data-id="${id}"]`);
    if (!li || !modal) return;
    modal.dataset.id = id;
    modalItem.dataset.category = li.dataset.category;
    modalItem.dataset.status = li.dataset.status;
    modalItem.toggleAttribute("data-fav", li.hasAttribute("data-fav"));
    modalItem.querySelector(".p-program_modal__item-title").firstChild.textContent = li.querySelector(".p-program__item-title").textContent;
    modalItem.querySelector(".c-program-tag").innerHTML = li.querySelector(".c-program-tag").innerHTML;
    modalItem.querySelector(".p-program_modal__item-image .wf-img").dataset.label = li.querySelector(".wf-img").dataset.label.replace("Square 1:1", "Large");
    modal.hidden = false;
    modal.scrollTop = 0;
    modal.classList.add("is-open");
    body.style.overflow = "hidden";
  };
  const closeModal = () => { if (!modal || modal.hidden) return; modal.hidden = true; modal.classList.remove("is-open"); body.style.overflow = ""; };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-modal-open]");
    if (!a) return;
    e.preventDefault();
    closeMenu();
    openModal(a.getAttribute("href").slice(1));
  });
  modal?.querySelector(".p-program_modal__close").addEventListener("click", closeModal);
  addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); closeMenu(); } });

  // Hero clock — like the original, the local time of the event city (data-tz, default Asia/Tokyo), updated each time the minute changes.
  const hh = document.querySelector(".p-fv__date-time-hour"), mm = document.querySelector(".p-fv__date-time-minute");
  const clock = hh?.closest("[data-tz]");
  const fmt = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: clock?.dataset.tz || "Asia/Tokyo" });
  const tick = () => {
    const d = new Date(), parts = fmt.formatToParts(d), part = (t) => parts.find((p) => p.type === t)?.value ?? "00";
    if (hh) { hh.textContent = part("hour"); mm.textContent = part("minute"); clock?.setAttribute("datetime", `${part("hour")}:${part("minute")}`); }
    setTimeout(tick, (60 - d.getSeconds()) * 1000);
  };
  tick();

  // Menu UFO: every 7s (5s on phone) it swaps between a UFO carrying a random character and an empty UFO (original setupUfoSwap). The swap happens at the middle of the 1s uncovering.
  const ufo = document.querySelector(".js-menu-ufo-image");
  const riderTpl = document.querySelector(".js-menu-ufo-riders");
  if (ufo && riderTpl && !reduce) {
    const slot = ufo.querySelector("[data-ufo-rider]");
    const riders = [...riderTpl.content.querySelectorAll("svg > g")];
    let timer = 0, swap = 0, plain = true;
    const set = (i) => slot.replaceChildren(...(riders[i] ? [riders[i].cloneNode(true)] : []));
    const change = (i) => {
      ufo.classList.remove("is-changing");
      void ufo.getBoundingClientRect();
      ufo.classList.add("is-changing");
      clearTimeout(swap);
      swap = setTimeout(() => set(i), 500);
    };
    const tick = () => { if (plain) { change(Math.floor(Math.random() * riders.length)); plain = false; } else { change(-1); plain = true; } };
    ufo.addEventListener("animationend", (e) => { if (e.animationName === "p-menu__header-image-mask-animation") ufo.classList.remove("is-changing"); });
    new IntersectionObserver(([e]) => {
      clearInterval(timer); timer = 0;
      if (e.isIntersecting) timer = setInterval(tick, lg.matches ? 7000 : 5000);
      else { clearTimeout(swap); ufo.classList.remove("is-changing"); }
    }).observe(ufo.closest(".p-menu__header-image"));
  }

  // Hero pupils: follow the mouse with spring (.03), damping (.93) and max speed 2.4. On touch devices they follow scroll position
  const mv = document.querySelector(".p-fv__mv");
  if (mv && !reduce) {
    const max = fine.matches ? 48 : 100;
    const eyes = [...mv.querySelectorAll(".p-fv__mv-character-eye")];
    let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, raf = 0, inview = true;
    new IntersectionObserver(([e]) => { inview = e.isIntersecting; }, { rootMargin: "20% 0%" }).observe(mv);
    const step = () => {
      vx = Math.max(-2.4, Math.min(2.4, (vx + (tx - x) * .03) * .93));
      vy = Math.max(-2.4, Math.min(2.4, (vy + (ty - y) * .03) * .93));
      x += vx; y += vy;
      eyes.forEach((el) => { el.style.transform = `translate3d(${x}%, ${y}%, 0)`; });
      raf = Math.abs(tx - x) < .05 && Math.abs(ty - y) < .05 && Math.abs(vx) < .02 && Math.abs(vy) < .02 ? 0 : requestAnimationFrame(step);
    };
    const aim = (nx, ny) => { tx = nx * max; ty = ny * max; if (!raf) raf = requestAnimationFrame(step); };
    if (fine.matches) {
      addEventListener("pointermove", (e) => {
        if (!inview) return;
        const r = mv.getBoundingClientRect();
        aim(Math.max(-.5, Math.min(.5, (e.clientX - r.left) / r.width - .5)), Math.max(-.5, Math.min(.5, (e.clientY - r.top) / r.height - .5)));
      }, { passive: true });
    } else {
      addEventListener("scroll", () => {
        if (!inview) return;
        const r = mv.getBoundingClientRect();
        aim(0, Math.max(-1, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height) * 2 - 1)));
      }, { passive: true });
    }
  }
})();
