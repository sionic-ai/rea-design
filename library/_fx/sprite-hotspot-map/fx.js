(() => {
  // The magnifier cursor is baked on the spot from the Skin color — the original is an image-file cursor (at the 16 16 spot)
  const cursorOf = (el) => {
    const cs = getComputedStyle(el);
    const ring = cs.getPropertyValue("--kf-accent").trim() || "currentColor";
    const fill = cs.getPropertyValue("--kf-surface").trim() || "transparent";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="13" cy="13" r="10" fill="${fill}" stroke="${ring}" stroke-width="3"/><path d="M20.5 20.5 29 29M13 8v10M8 13h10" stroke="${ring}" stroke-width="3" stroke-linecap="round"/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 16 16, pointer`;
  };

  // The original lays the strip image as the slot’s background and steps background-position with steps — to advance the same way
  // Bakes the band svg’s fill into the current skin color as a background image (data URL). Changing skin re-bakes it when re-attached
  const bake = (spot) => {
    const strip = spot.querySelector("[data-fx-part='strip']");
    const svg = strip?.querySelector("svg");
    if (!svg) return null;
    const copy = svg.cloneNode(true);
    const src = svg.querySelectorAll("*"), dst = copy.querySelectorAll("*");
    src.forEach((n, i) => {
      if (!(n instanceof SVGGeometryElement)) return;
      const cs = getComputedStyle(n);
      dst[i].setAttribute("style", `fill:${cs.fill};stroke:${cs.stroke};stroke-width:${cs.strokeWidth};opacity:${cs.opacity}`);
    });
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const url = `url("data:image/svg+xml,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}")`;
    const frames = Math.max(1, Math.round(+getComputedStyle(spot).getPropertyValue("--fx-frames") || 1));
    spot.style.backgroundImage = url;
    spot.style.backgroundSize = `${frames * 100}% 100%`;
    spot.classList.add("is-baked");
    return () => { spot.style.removeProperty("background-image"); spot.style.removeProperty("background-size"); spot.classList.remove("is-baked"); };
  };

  kfFx.register("sprite-hotspot-map", (el, { options, reduce, hover }) => {
    const spots = [...el.querySelectorAll("[data-fx-part='spot']")];
    const unbake = options.paint === "transform" ? [] : spots.map(bake).filter(Boolean);
    const modal = el.querySelector("[data-fx-part='modal']");
    const track = el.querySelector("[data-fx-part='track']");
    const pan = el.querySelector("[data-fx-part='pan']");
    const panPrev = el.querySelector("[data-fx-part='pan-prev']");
    const panNext = el.querySelector("[data-fx-part='pan-next']");
    const offs = [];
    const on = (t, type, fn, o) => { if (!t) return; t.addEventListener(type, fn, o); offs.push(() => t.removeEventListener(type, fn, o)); };
    if (reduce) el.classList.add("is-still");

    if (hover && options.cursor !== "none") {
      const c = cursorOf(el);
      spots.forEach((s) => (s.style.cursor = c));
      offs.push(() => spots.forEach((s) => s.style.removeProperty("cursor")));
    }

    let swiper = null, open = false, index = 0;
    const slides = track ? [...track.children] : [];
    const goPlain = (i) => {
      if (!track || swiper) return;
      track.style.transform = `translateX(${-100 * i}%)`;
      slides.forEach((s, k) => s.toggleAttribute("inert", k !== i));
    };
    if (modal && track && window.Swiper && options.swiper !== "off") {
      const box = track.parentElement;
      box.classList.add("swiper");
      track.classList.add("swiper-wrapper");
      slides.forEach((s) => s.classList.add("swiper-slide"));
      swiper = new Swiper(box, {
        slidesPerView: 1,
        speed: +(options.speed ?? 0.5) * 1000,
        spaceBetween: 20,
        loop: slides.length > 1,
        navigation: { prevEl: modal.querySelector("[data-fx-part='prev']"), nextEl: modal.querySelector("[data-fx-part='next']") },
      });
    } else if (modal) {
      on(modal.querySelector("[data-fx-part='prev']"), "click", () => { index = (index - 1 + slides.length) % slides.length; goPlain(index); });
      on(modal.querySelector("[data-fx-part='next']"), "click", () => { index = (index + 1) % slides.length; goPlain(index); });
    }

    const setOpen = (v, i) => {
      open = v;
      spots.forEach((s) => s.setAttribute("aria-expanded", String(v)));
      if (!modal) return;
      modal.setAttribute("aria-hidden", String(!v));
      document.documentElement.classList.toggle("fx-lock", v);
      if (v) {
        index = i;
        if (swiper) swiper.slideToLoop(i, 0); else goPlain(i);
      }
      el.dispatchEvent(new CustomEvent(v ? "fx:open" : "fx:close", { bubbles: true, detail: { index: i } }));
    };
    spots.forEach((s, i) => {
      s.setAttribute("aria-expanded", "false");
      on(s, "click", (e) => { e.stopPropagation(); setOpen(!open, i); });
    });
    if (modal) {
      modal.setAttribute("aria-hidden", "true");
      modal.querySelectorAll("[data-fx-part='close']").forEach((b) => on(b, "click", (e) => { e.stopPropagation(); setOpen(false, index); }));
      on(modal, "click", (e) => { if (e.target === modal || !e.target.closest("[data-fx-part='card']")) setOpen(false, index); });
      on(document, "keydown", (e) => { if (open && e.key === "Escape") setOpen(false, index); });
    }

    // On phones the map is wider than the screen — the arrow moves between left, center and right positions, and at first nudges once from center to right
    if (pan) {
      const spots3 = () => { const w = pan.scrollWidth - pan.clientWidth; return [0, Math.ceil(w / 2), w]; };
      const go = (dir) => {
        const [l, c, r] = spots3(), x = pan.scrollLeft;
        const to = dir > 0 ? (c > x ? c : r) : (c >= x ? l : c);
        pan.scrollTo({ left: to, behavior: reduce ? "auto" : "smooth" });
      };
      on(panPrev, "click", () => go(-1));
      on(panNext, "click", () => go(1));
      if (options.start !== "left") requestAnimationFrame(() => go(1));
    }

    return () => {
      offs.forEach((f) => f());
      unbake.forEach((f) => f());
      if (open) document.documentElement.classList.remove("fx-lock");
      swiper?.destroy(true, true);
      if (track) { track.style.removeProperty("transform"); slides.forEach((s) => s.removeAttribute("inert")); }
      spots.forEach((s) => s.removeAttribute("aria-expanded"));
      el.classList.remove("is-still");
    };
  });
})();
