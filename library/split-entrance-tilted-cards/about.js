(() => {
  const body = document.body;

  // The original plays the hero entrance only on the first visit too — remembered separately from the loader (orbit-icon-loader once)
  try {
    if (localStorage.getItem("o-hero-played") === "true") body.classList.add("is-skip");
    else localStorage.setItem("o-hero-played", "true");
  } catch {}

  // On every open, the two characters’ positions and sizes swap 50/50 (original Math.random() < .5)
  if (Math.random() < 0.5) document.querySelector(".b-hero")?.classList.add("is-pattern2");

  // Original .ani — turns on once when scroll position passes element top − screen height + screen height/6
  const close = document.querySelector(".b-close");
  if (close) {
    const check = () => {
      if (close.getBoundingClientRect().top < innerHeight * (5 / 6)) {
        close.classList.add("is-in");
        removeEventListener("scroll", check);
      }
    };
    addEventListener("scroll", check, { passive: true });
    check();
  }

  const slider = document.querySelector("#b-topic-slider");
  if (slider && window.Splide) {
    new Splide(slider, {
      type: "slide", perPage: 5, perMove: 1, gap: "1.8vw",
      padding: { right: "0px", left: "6vw" },
      arrows: true, pagination: false, autoplay: false,
      breakpoints: {
        1024: { perPage: 4 },
        767: { type: "loop", perPage: 1, gap: "6.5vw", padding: { right: "30vw", left: "6.5vw" } },
      },
    }).mount();
  }

  // TV wall video is loaded and played only when it comes within 200px of the screen, then keeps running (original lazy-video)
  const vids = document.querySelectorAll(".b-lazy");
  const io = new IntersectionObserver((entries, obs) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const v = e.target;
      if (v.dataset.src) { v.src = v.dataset.src; v.load(); v.play().catch(() => {}); }
      obs.unobserve(v);
    }
  }, { rootMargin: "200px 0px", threshold: 0.01 });
  vids.forEach((v) => io.observe(v));
})();
