// Motion shared by several pages — header text color switching, menu overlay (photos cycle every 4s · swap on name hover), booking search drawer (calendar · tags), map window.
(() => {
  const header = document.querySelector(".eb-header");
  const mm = gsap.matchMedia();

  /* Pick the text color from the brightness of the background at the center point right under the header. Photo areas are seen as transparent, as in the original, and the background beneath is used */
  const lightness = (rgb) => {
    const m = (rgb || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return 1;
    const c = [m[1], m[2], m[3]].map((v) => v / 255);
    return (Math.max(...c) + Math.min(...c)) / 2;
  };
  const toneUnder = (el) => {
    const marked = el.closest("[data-tone]");
    if (marked) return marked.dataset.tone;
    for (let cur = el; cur && cur !== document.documentElement; cur = cur.parentElement) {
      if (cur.classList.contains("eb-ph")) continue;
      const bg = getComputedStyle(cur).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return lightness(bg) >= 0.5 ? "light" : "dark"; // Not skin: string to check whether the computed background is transparent
    }
    return "light";
  };
  let ticking = false;
  const paintHeader = () => {
    ticking = false;
    if (!header) return;
    const y = header.offsetHeight + 4;
    const hit = document.elementsFromPoint(innerWidth / 2, y).find((el) => !header.contains(el) && el !== document.body && el !== document.documentElement);
    header.classList.toggle("is-dark", !hit || toneUnder(hit) === "light");
  };
  const queueHeader = () => { if (!ticking) { ticking = true; requestAnimationFrame(paintHeader); } };
  addEventListener("scroll", queueHeader, { passive: true });
  addEventListener("resize", queueHeader, { passive: true });
  addEventListener("load", paintHeader);
  paintHeader();

  /* When the cover opens, pin the page behind it in place */
  let savedY = 0;
  let locks = 0;
  const lock = () => {
    if (locks++) return;
    savedY = scrollY;
    document.body.style.top = `-${savedY}px`;
    document.body.classList.add("is-locked");
  };
  const unlock = () => {
    if (--locks > 0) return;
    locks = 0;
    document.body.classList.remove("is-locked");
    document.body.style.top = "";
    scrollTo(0, savedY);
  };

  const layers = {};
  const open = (id) => {
    const el = layers[id];
    if (!el || el.classList.contains("is-open")) return;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    // The original pins the body in place only for the menu, while the booking drawer and map window only block scroll — so the hover on the covered button is released at the moment of opening
    if (id === "menu") { lock(); menuPhoto.start(); } else document.body.style.overflow = "hidden";
  };
  const close = (id) => {
    const el = layers[id];
    if (!el || !el.classList.contains("is-open")) return;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    if (id === "menu") { unlock(); menuPhoto.stop(); } else document.body.style.overflow = "";
  };
  ["menu", "find", "map"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    layers[id] = el;
    el.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => close(id)));
    if (el.classList.contains("eb-modal")) el.addEventListener("click", (e) => { if (e.target === el) close(id); });
  });
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open]");
    if (opener) {
      e.preventDefault();
      // View on Map inside the menu closes the menu and opens the map
      if (opener.closest("#menu")) close("menu");
      open(opener.dataset.open);
      return;
    }
    const link = e.target.closest("#menu a[href^='#']");
    if (link) close("menu");
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    Object.keys(layers).forEach(close);
  });

  /* Menu left photo: every 4 seconds to the next lodging, or on hovering a name to that lodging — the new photo fades in overlapping over 1.2 seconds, then swaps with the section below */
  const menuPhoto = (() => {
    const frame = document.querySelector(".eb-menu__frame");
    const links = [...document.querySelectorAll(".eb-menu__loc")];
    const area = document.querySelector(".eb-menu__caption-area");
    const name = document.querySelector(".eb-menu__caption-name");
    if (!frame || !links.length) return { start() {}, stop() {} };
    const [base, next] = frame.querySelectorAll(".eb-ph");
    const toneOf = (el) => [...el.classList].find((c) => c.startsWith("tone-"));
    let index = 0;
    let shown = null;
    let cycle = 0;
    let swap = 0;
    let hovering = false;
    const label = (a) => `${a.dataset.name} Exterior · forest and waterside cabin · clear day · landscape 3:2 · next stay every 4 seconds`;
    const show = (a, animate) => {
      if (a === shown) return;
      shown = a;
      clearTimeout(swap);
      next.classList.remove(toneOf(next));
      next.classList.add(a.dataset.tonePh);
      next.dataset.label = label(a);
      area.textContent = a.dataset.area;
      name.textContent = a.dataset.name;
      if (!animate) { base.className = next.className.replace(" is-next", ""); base.dataset.label = next.dataset.label; return; }
      next.style.transition = "none";
      next.style.opacity = "0";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        next.style.transition = "opacity 1.2s ease";
        next.style.opacity = "1";
        swap = setTimeout(() => {
          base.classList.remove(toneOf(base));
          base.classList.add(a.dataset.tonePh);
          base.dataset.label = next.dataset.label;
          next.style.transition = "none";
          next.style.opacity = "0";
        }, 1250);
      }));
    };
    show(links[0], false);
    let motion = true;
    mm.add({ reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => { motion = !ctx.conditions.reduce; });
    links.forEach((a) => {
      a.addEventListener("mouseenter", () => { hovering = true; show(a, motion); });
      a.addEventListener("mouseleave", () => { hovering = false; });
    });
    return {
      start() {
        clearInterval(cycle);
        if (!motion) return;
        cycle = setInterval(() => {
          if (hovering) return;
          index = (index + 1) % links.length;
          show(links[index], true);
        }, 4000);
      },
      stop() { clearInterval(cycle); clearTimeout(swap); },
    };
  })();

  /* Reservation search: this month and next month calendars (one month on phone), click a cell twice to pick a range */
  const cal = document.querySelector("[data-cal]");
  if (cal) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let first = new Date(today.getFullYear(), today.getMonth(), 1);
    let pick = [];
    const prevIcon = '<svg viewBox="0 0 12 12"><path d="M7.5 2.5 4 6l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>';
    const nextIcon = '<svg viewBox="0 0 12 12"><path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>';
    const month = (d) => {
      const y = d.getFullYear();
      const m = d.getMonth();
      const lead = new Date(y, m, 1).getDay();
      const days = new Date(y, m + 1, 0).getDate();
      const cells = [];
      for (let i = 0; i < lead; i++) cells.push('<span class="eb-cal__cell"></span>');
      for (let n = 1; n <= days; n++) {
        const t = new Date(y, m, n).getTime();
        const isOpen = t >= today.getTime();
        const inPick = pick.length && t >= pick[0] && t <= (pick[1] ?? pick[0]);
        cells.push(`<span class="eb-cal__cell${isOpen ? " is-open" : ""}${inPick ? " is-pick" : ""}" data-t="${t}"><b>${n}</b>${isOpen ? "<i>00,000</i>" : ""}</span>`);
      }
      while (cells.length % 7) cells.push('<span class="eb-cal__cell"></span>');
      const rows = [];
      for (let i = 0; i < cells.length; i += 7) rows.push(`<div class="eb-cal__row">${cells.slice(i, i + 7).join("")}</div>`);
      return `<div class="eb-cal__month">
        <div class="eb-cal__top"><button class="eb-cal__nav eb-cal__nav--prev" type="button" data-step="-1" aria-label="Previous month">${prevIcon}</button><span class="eb-cal__title">${y}/${String(m + 1).padStart(2, "0")}</span><button class="eb-cal__nav eb-cal__nav--next" type="button" data-step="1" aria-label="Next month">${nextIcon}</button></div>
        <div class="eb-cal__days"><span>Day</span><span>Month</span><span>Fire</span><span>Number</span><span>Neck</span><span>Gold</span><span>Earth</span></div>
        <div class="eb-cal__grid">${rows.join("")}</div>
      </div>`;
    };
    const draw = () => { cal.innerHTML = month(first) + month(new Date(first.getFullYear(), first.getMonth() + 1, 1)); };
    cal.addEventListener("click", (e) => {
      const nav = e.target.closest("[data-step]");
      if (nav) {
        const step = Number(nav.dataset.step);
        const min = new Date(today.getFullYear(), today.getMonth(), 1);
        const to = new Date(first.getFullYear(), first.getMonth() + step, 1);
        if (to >= min) first = to;
        draw();
        return;
      }
      const cell = e.target.closest(".eb-cal__cell.is-open");
      if (!cell) return;
      const t = Number(cell.dataset.t);
      pick = pick.length === 1 && t > pick[0] ? [pick[0], t] : [t];
      clear.classList.remove("is-active");
      draw();
    });
    const clear = document.querySelector(".eb-find__clear");
    clear.addEventListener("click", () => { pick = []; clear.classList.toggle("is-active"); draw(); });
    document.querySelectorAll(".eb-find .eb-tag").forEach((t) => t.addEventListener("click", () => t.classList.toggle("is-active")));
    document.querySelector("[data-reset]").addEventListener("click", () => {
      pick = [];
      clear.classList.remove("is-active");
      document.querySelectorAll(".eb-find .eb-tag.is-active").forEach((t) => t.classList.remove("is-active"));
      draw();
    });
    draw();
  }

  document.querySelectorAll("[data-totop]").forEach((b) => b.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" })));
})();
