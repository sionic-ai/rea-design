/* Service: six service rows stacked section by section, the next row’s text rises from below the screen to cover and the photo peels away from the bottom to reveal (scrub, desktop only) */
(() => {
  const ROWS = [
    ["Styling the space", "Service Name 01", "One floor of a large office · long table and chairs · window light · 3:2 landscape"],
    ["Interior Design", "Service Name 02", "High-ceiling lounge · Row of black bar stools · Checkered floor · Landscape 3:2"],
    ["Rebuild", "Service Name 03", "Old building staircase · brick and glass · daylight · landscape 3:2"],
    ["Furniture and decor", "Service Name 04<br>Second Line", "Blurry furniture exhibition · warm brown tone · landscape 3:2"],
    ["Architecture", "Service Name 05<br>Second Line", "Brick building facade · clear sky · landscape 3:2"],
    ["Management", "Service Name 06<br>Second Line", "Two meeting rooms with arched doors · pink walls · landscape 3:2"],
  ];
  const box = document.querySelector("[data-service-rows]");
  box.innerHTML = ROWS.map(([label, title, img], i) => `
    <article class="tw-srow">
      <div class="tw-srow__line tw-srow__slide"></div>
      <div class="tw-srow__in">
        <p class="tw-srow__label tw-srow__slide"><span class="tw-pill">0${i + 1}</span>${label}</p>
        <div class="tw-srow__img"><div class="wf-img tw-ph" data-label="${img}"></div></div>
        <div class="tw-srow__txt tw-srow__slide"><h3 class="tw-h5" data-label="Your service name in English here">${title}</h3><p class="tw-body-s">Your body text describing this service goes here in about six lines. Cover who handles it, the process, awards received, and what the client gains. Include the line that no two projects are ever the same.</p></div>
      </div>
    </article>`).join("");

  const sec = document.querySelector(".tw-services");
  const rows = [...box.querySelectorAll(".tw-srow")];
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    const n = rows.length;
    const parts = rows.map((r) => ({ img: r.querySelector(".tw-srow__img"), slides: [...r.querySelectorAll(".tw-srow__slide")], line: r.querySelector(".tw-srow__line") }));
    box.classList.add("is-pinned");
    rows.forEach((r, i) => gsap.set(r, { zIndex: i + 1 }));
    gsap.set(sec, { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-start" });
    let o = 0, c = 0, d = innerHeight;
    const measure = () => {
      box.style.height = "";
      o = rows[0].offsetHeight;
      c = parts[0].img.offsetHeight || o;
      box.style.height = `${o}px`;
      const l = box.getBoundingClientRect().top - sec.getBoundingClientRect().top;
      d = Math.max(o, innerHeight - l);
    };
    const render = (p) => parts.forEach((t, i) => {
      const a = gsap.utils.clamp(0, 1, i - p) * d;
      const s = c > 0 ? gsap.utils.clamp(0, 1, (o - a) / c) : 1;
      t.img.style.clipPath = `inset(${(1 - s) * 100}% 0% 0% 0%)`;
      t.slides.forEach((el) => (el.style.transform = `translateY(${a}px)`));
      t.line.style.opacity = i < n - 1 && p >= i + 1 ? "0" : "";
    });
    measure(); render(0);
    const st = ScrollTrigger.create({
      trigger: sec, start: "top top", pin: sec, scrub: true, invalidateOnRefresh: true,
      end: () => { measure(); return `+=${(n - 1) * d}`; },
      onRefresh: (self) => { measure(); render(self.progress * (n - 1)); },
      onUpdate: (self) => render(self.progress * (n - 1)),
    });
    return () => {
      st.kill();
      box.classList.remove("is-pinned");
      box.style.height = "";
      gsap.set(sec, { clearProps: "display,flexDirection,justifyContent,minHeight" });
      parts.forEach((t) => { t.img.style.clipPath = ""; t.slides.forEach((el) => (el.style.transform = "")); t.line.style.opacity = ""; });
    };
  });
})();
