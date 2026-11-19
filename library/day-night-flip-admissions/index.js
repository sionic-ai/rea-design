// Home page motion — values from the original mv.js (logo·copy)·slider.js·main.js (js-animate)·accordion.js as is (DAY/NIGHT cards are tap-flip-balloon parts)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Mosaic: logo and copy float up (photo flipping is the relay-flip-tiles part).
  //    The original code runs 1s after load, but in the original load finishes before the Hero, so measured, it rises .3s after the Hero is painted — we follow the measured timing ──
  const mv = document.getElementById("mv");
  setTimeout(() => mv?.classList.add("is-in"), reduce ? 0 : 300);

  // ── Splide: flowing strip (loop · autoWidth · drag free · pauses on hover — interactive=false means no drag or pause), lead slider (loop · centered · 12% each side · 20px) ──
  const AutoScroll = window.splide?.Extensions?.AutoScroll;
  document.querySelectorAll(".js-autoScroll").forEach((el) => {
    const speed = Number(el.dataset.scrollSpeed) || 1;
    const live = el.dataset.scrollInteractive !== "false";
    new Splide(el, {
      type: "loop", drag: live ? "free" : false, autoWidth: true, arrows: false, pagination: false,
      autoScroll: { speed: reduce ? 0 : speed, pauseOnHover: live, pauseOnFocus: live },
    }).mount(AutoScroll ? { AutoScroll } : {});
  });
  document.querySelectorAll(".js-leadSlider").forEach((el) => {
    new Splide(el, { type: "loop", perPage: 1, focus: "center", padding: "12%", gap: "20px", arrows: true, pagination: true, speed: reduce ? 0 : 400 }).mount();
  });

  // ── When visible, add is-in (leaving 100px at the bottom, at 20% visible) — once only ──
  const io = new IntersectionObserver((list) => list.forEach((en) => {
    if (en.intersectionRatio > 0) { en.target.classList.add("is-in"); io.unobserve(en.target); }
  }), { root: null, rootMargin: "0px 0px -100px 0px", threshold: [0.2, 1] });
  document.querySelectorAll(".js-animate").forEach((el) => io.observe(el));

  // ── FAQ accordion: details animated via WAAPI height·opacity .4s ease-out, can’t be pressed again while running ──
  const opt = { duration: reduce ? 0 : 400, easing: "ease-out" };
  document.querySelectorAll(".js-details").forEach((d) => {
    const sum = d.querySelector(".js-summary"), body = d.querySelector(".js-content");
    if (!sum || !body) return;
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.dataset.anim === "running") return;
      if (d.open) {
        d.classList.remove("is-opened");
        const a = body.animate([{ height: `${body.offsetHeight}px`, opacity: 1 }, { height: 0, opacity: 0 }], opt);
        d.dataset.anim = "running";
        a.onfinish = () => { d.removeAttribute("open"); d.dataset.anim = ""; };
        return;
      }
      d.setAttribute("open", "true");
      d.classList.add("is-opened");
      const a = body.animate([{ height: 0, opacity: 0 }, { height: `${body.offsetHeight}px`, opacity: 1 }], opt);
      d.dataset.anim = "running";
      a.onfinish = () => { d.dataset.anim = ""; };
    });
  });

  // ── Set the panel text to the name of the clicked cell ──
  document.querySelectorAll('[data-modal="tour01"]').forEach((a) => a.addEventListener("click", () => {
    const t = document.querySelector("[data-tour-title]");
    if (t) t.textContent = a.querySelector("span")?.textContent || "";
  }));
  document.querySelectorAll('[data-modal="story01"]').forEach((a) => a.addEventListener("click", () => {
    const s = a.querySelectorAll("span");
    document.querySelector("[data-story-who]").textContent = s[0]?.textContent || "";
    document.querySelector("[data-story-what]").textContent = a.querySelector("strong")?.textContent || "";
  }));
})();
