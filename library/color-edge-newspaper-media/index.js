// Home interaction·auto motion — the same Splide 4 as the original runs featured (loop · 600ms) and new posts (vertical loop · 4 cells · 600ms), and the slideshow advances every 5.5s.
(() => {
  const root = document.documentElement;
  const moving = () => root.dataset.motionEnabled !== "false" && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const speed = (ms) => (moving() ? ms : 0);

  // The feature auto-advances at the Splide default interval (5000ms), and the new-posts vertical list follows one step at the same time via sync (original topFeatureSyncState)
  if (window.Splide) {
    const featEl = document.querySelector(".hm-feat__splide"), latestEl = document.querySelector(".hm-latest__splide");
    if (featEl) {
      const feat = new Splide(featEl, { type: "loop", perPage: 1, arrows: false, pagination: false, pauseOnHover: true, pauseOnFocus: true, autoplay: true, speed: speed(600) });
      const fills = document.querySelectorAll(".hm-feat__prog i");
      const paint = (rate) => fills.forEach((f, n) => { const r = n === feat.index ? rate : 0; f.style.translate = `${(r - 1) * 100}% 0`; f.style.visibility = r > 0 ? "visible" : "hidden"; });
      feat.on("autoplay:playing", paint);
      feat.on("moved", () => paint(0));
      const holds = new Set();
      const sync = () => { const a = feat.Components.Autoplay; holds.size || !moving() ? a.pause() : a.play(); };
      if (latestEl) {
        const latest = new Splide(latestEl, { direction: "ttb", type: "loop", height: "100%", perPage: 4, arrows: false, pagination: false, drag: false, autoplay: false, speed: speed(600) });
        feat.sync(latest);
        feat.on("mounted", () => latest.mount());
        document.addEventListener("kr:motion", () => { latest.options = { speed: speed(600) }; });
        ["mouseenter", "focusin"].forEach((ev) => latestEl.addEventListener(ev, () => { holds.add("latest"); sync(); }));
        ["mouseleave", "focusout"].forEach((ev) => latestEl.addEventListener(ev, () => { holds.delete("latest"); sync(); }));
      }
      feat.on("mounted", sync);
      feat.mount();
      document.querySelector(".js-feat-prev")?.addEventListener("click", () => feat.go("<"));
      document.querySelector(".js-feat-next")?.addEventListener("click", () => feat.go(">"));
      document.addEventListener("kr:motion", () => { sync(); feat.options = { speed: speed(600) }; });
    }
  }

  // Phone series deck — a 68% width card sits in the center, the next cards recede by 0.9^t each (translateZ) and are pulled left to stack overlapping, tilting 2° per slot.
  // 5s auto · 800ms transition · when dragged it moves freely then snaps to a slot. After the fourth and for passed cards they become transparent
  const grid = document.querySelector(".hm-series__grid");
  if (window.Splide && grid && matchMedia("(max-width: 639px)").matches) {
    const host = document.createElement("div");
    host.className = "splide hm-deck";
    host.innerHTML = `<div class="splide__track"><ul class="splide__list">${[...grid.children].map((li) => `<li class="splide__slide">${li.innerHTML}</li>`).join("")}</ul></div>`;
    grid.after(host);
    grid.hidden = true;
    const deck = new Splide(host, { type: "loop", perPage: 1, perMove: 1, fixedWidth: "68%", focus: "center", gap: 0, clones: 4, arrows: false, pagination: false, autoplay: true, interval: 5000, pauseOnHover: true, pauseOnFocus: true, drag: "free", snap: true, flickPower: 200, speed: speed(800) });
    const D = 0.9, sum = (t) => (0.2 * (1 - D ** t)) / (1 - D);
    const fade = (t) => (t < 0 ? Math.max(0, 1 + t) : t > 3 ? Math.max(0, 4 - t) : 1);
    const paint = () => {
      const { Move, Layout, Direction, Slides } = deck.Components, size = Layout.slideSize(0);
      if (size > 0) {
        const p = Direction.orient(Move.getPosition() - Move.toPosition(0, true)) / size;
        Slides.get().forEach(({ slide, index }) => {
          const t = index - p, n = D ** t;
          slide.style.transform = `translateX(${(sum(t) / n - t) * 100}%) translateZ(${-1000 * (1 / n - 1)}px) rotate(${t * 2}deg)`;
          slide.style.opacity = String(fade(t));
          slide.style.zIndex = String(100 - Math.round(t * 10));
        });
      }
      requestAnimationFrame(paint);
    };
    deck.on("mounted", () => { requestAnimationFrame(paint); if (!moving()) deck.Components.Autoplay.pause(); });
    deck.mount();
    document.addEventListener("kr:motion", () => { const a = deck.Components.Autoplay; moving() ? a.play() : a.pause(); deck.options = { speed: speed(800) }; });
  }

  // Slideshow panel — the visible slide goes 1.2 → 1.05× (5.5s), and fades away going 1.05 → 1× (1.5s) once it advances
  const slides = [...document.querySelectorAll(".hm-show__slide")];
  if (slides.length > 1) {
    let at = 0;
    setInterval(() => {
      if (!moving()) return;
      slides[at].classList.remove("is-active");
      at = (at + 1) % slides.length;
      slides[at].classList.add("is-active");
    }, 5500);
  }
})();
