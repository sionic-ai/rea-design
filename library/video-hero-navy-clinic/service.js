// Treatment guide — a stacked list (only the branch of the photo within the central 40% band of the screen unfolds with 1s expo.out, and tapping goes to that photo),
// Bottom-left shortcuts (dot on the current section, light text over photos), two photos grow .9→1.1 and rise 20px
(() => {
  const list = document.querySelector("[data-svc-list]");
  const shots = [...document.querySelectorAll("[data-svc-item]")];
  const wide = matchMedia("(min-width: 1024px)");
  const rows = shots.map((shot, i) => {
    const src = shot.querySelector(".od-svc__item");
    const inner = src.innerHTML;
    const make = (on) => {
      const row = document.createElement("div");
      row.className = "od-tr" + (on ? "" : " is-off");
      row.innerHTML = `<div class="od-tr__n" aria-hidden="true">(${i + 1}).</div><div><button class="od-tr__btn" type="button"><h3 class="od-h4">${src.dataset.title}</h3></button><div class="od-tr__body"><div class="od-tr__rt od-rt">${inner}</div><div class="od-tr__fade"></div></div></div>`;
      return row;
    };
    src.replaceChildren(make(true));
    const row = make(i === 0);
    list.append(row);
    const body = row.querySelector(".od-tr__body");
    if (i !== 0) gsap.set(body, { height: 0, opacity: 0 });
    row.querySelector(".od-tr__btn").addEventListener("click", () => {
      if (!row.classList.contains("is-off") || !wide.matches) return;
      OD.lenis.scrollTo(shot, { offset: 0 });
    });
    return { row, body };
  });
  let cur = 0;
  const pick = (i) => {
    if (i === cur) return;
    cur = i;
    rows.forEach(({ row, body }, k) => {
      const on = k === i;
      row.classList.toggle("is-off", !on);
      row.querySelector(".od-tr__btn").toggleAttribute("aria-current", on);
      if (wide.matches) gsap.to(body, { height: on ? "auto" : 0, opacity: on ? 1 : 0, duration: 1, ease: "expo.out", overwrite: true });
    });
  };
  shots.forEach((shot, i) => new IntersectionObserver(([e]) => e.isIntersecting && pick(i), { rootMargin: "-30% 0px -30% 0px", threshold: 0 }).observe(shot));

  const jump = document.querySelector(".od-jump");
  const slices = [...document.querySelectorAll("[data-jump-slice]")];
  if (jump && slices.length > 1) {
    const links = [...jump.querySelectorAll("[data-jump]")];
    links.forEach((a) => a.classList.add("od-dothover"));
    const place = () => {
      const first = slices[0], last = slices[slices.length - 1];
      const top = first.offsetTop;
      jump.style.top = `${top}px`;
      jump.style.height = `${last.offsetTop + last.offsetHeight - 40 - top}px`;
      jump.classList.add("is-ready");
    };
    new ResizeObserver(place).observe(document.body);
    const mark = () => {
      const vh = innerHeight;
      const now = [...slices].reverse().find((s) => {
        const r = s.getBoundingClientRect();
        return r.bottom > 0 && r.top < vh && vh - Math.max(r.top, 0) > 32;
      });
      if (!now) return;
      const key = now.dataset.jumpSlice;
      links.forEach((a) => a.classList.toggle("is-on", a.dataset.jump === key));
      jump.classList.toggle("is-photo", now.hasAttribute("data-jump-photo"));
    };
    OD.lenis.on("scroll", mark);
    addEventListener("resize", mark);
    mark();
    links.forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      OD.lenis.scrollTo(document.getElementById(a.dataset.jump));
    }));
  }

  gsap.matchMedia().add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-od-grow]").forEach((el) => {
      gsap.set(el, { scale: 0.9, y: 0 });
      gsap.to(el, { scale: 1.1, y: -20, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
})();
