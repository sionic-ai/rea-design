// First page: draw the split title letters, the clinic hours table and the flow line art, then hook up the Hero reveal after opening, the video parallax and the photo strip.
// Original values: video panel opacity 0→1 · scale 1.1→1 3.2s power2.out · title letters after .2s, .05s apart, 1.6s back.out(2) y 20→0
// · Notice·Scroll 1.6s later 1.2s power2.out · video margin-top = Scroll/5 · photo strip Swiper loop speed 20000 autoplay delay 0
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Keep words as chunks and split only the letters — so Korean line breaks never cut in the middle of a word
  document.querySelectorAll("[data-hero-title] .row").forEach((row) => {
    row.innerHTML = row.textContent
      .split(" ")
      .map((w) => `<span class="w" style="display:inline-block">${[...w].map((c) => `<span class="ch">${c}</span>`).join("")}</span>`)
      .join(" ");
  });

  const box = document.querySelector("[data-hours]");
  if (box) {
    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const paw = '<svg viewBox="0 0 75 64" fill="currentColor" aria-hidden="true"><ellipse cx="37.5" cy="44" rx="17" ry="15"/><ellipse cx="14" cy="26" rx="7" ry="9"/><ellipse cx="27" cy="12" rx="7" ry="9"/><ellipse cx="48" cy="12" rx="7" ry="9"/><ellipse cx="61" cy="26" rx="7" ry="9"/></svg>';
    const group = (name, rows) =>
      `<thead><tr><th class="first">${name}</th>${days.map((d) => `<th>${d}</th>`).join("")}</tr></thead><tbody>${rows
        .map(([t, open]) => `<tr><th>${t}</th>${open.map((o) => `<td>${o ? paw : "<i></i>"}</td>`).join("")}</tr>`)
        .join("")}</tbody>`;
    box.innerHTML = `<table>${group("Dental clinic", [["Morning<br>0:00-00:00", [1, 1, 0, 1, 1, 1, 1]], ["Afternoon<br>00:00-00:00", [1, 1, 0, 1, 1, 0, 0]]])}${group("Internal medicine", [["Morning<br>0:00-00:00", [1, 0, 1, 1, 0, 1, 1]], ["Afternoon<br>00:00-00:00", [1, 0, 1, 1, 0, 1, 0]]])}</table>`;
  }

  // Flow line drawing — a line illustration of the same size in place of the original hand-drawn illustration
  const lines = {
    desk: '<path class="fl" d="M40 150h120v40H40z"/><path class="ln" d="M40 150h120v40H40zM70 150v-12h40v12"/><circle class="ln" cx="132" cy="70" r="14"/><path class="ln" d="M112 150c0-30 8-56 20-62s20 30 20 62"/><path class="ln" d="M60 116c8-6 20-6 26 2l-4 18H62z"/><path class="ln" d="M58 112l-6-10m30 8 4-10"/>',
    exam: '<path class="fl" d="M30 140h140v8H30z"/><path class="ln" d="M30 140h140M50 148v40m100-40v40"/><circle class="ln" cx="120" cy="56" r="14"/><path class="ln" d="M104 140c0-30 6-60 16-68s22 24 22 68"/><path class="ln" d="M62 136c-2-14 10-24 24-22 10 2 14 10 12 22zM66 116l-4-12 10 6m18-6 6-10-1 12"/><path class="ln" d="M104 96 84 112"/>',
    follow: '<circle class="ln" cx="88" cy="58" r="14"/><path class="ln" d="M64 188c0-50 8-96 24-104s26 54 26 104"/><path class="fl" d="M110 104h26v44h-26z"/><path class="ln" d="M110 104h26v44h-26zM118 140h10"/><path class="ln" d="M104 112c4 6 6 14 6 22"/><path class="ln" d="M40 188c4-16 16-24 30-22"/>',
  };
  document.querySelectorAll("[data-line]").forEach((el) => (el.innerHTML = `<svg viewBox="0 0 200 200" aria-hidden="true">${lines[el.dataset.line] || ""}</svg>`));

  const hero = document.querySelector("#hero");
  const video = hero && hero.querySelector("[data-hero-video]");
  const parallax = () => video && gsap.set(video, { marginTop: scrollY / 5 });

  document.addEventListener("kw:opened", () => {
    if (hero && !reduce) {
      gsap.to("[data-hero-image]", { duration: 3.2, ease: "power2.out", opacity: 1, scale: 1 });
      gsap.to("[data-hero-title] .ch", { delay: 0.2, stagger: 0.05, duration: 1.6, ease: "back.out(2)", opacity: 1, y: 0 });
      gsap.to("[data-hero-news]", { delay: 1.6, duration: 1.2, ease: "power2.out", opacity: 1 });
      gsap.to("[data-hero-scroll]", { delay: 1.6, duration: 1.2, ease: "power2.out", opacity: 1 });
      addEventListener("scroll", parallax, { passive: true });
      parallax();
    }
    document.querySelectorAll("[data-loop-slider]").forEach((el) => {
      const sw = new Swiper(el, { loop: true, slidesPerView: "auto", speed: reduce ? 0 : 20000, autoplay: reduce ? false : { delay: 0, disableOnInteraction: false } });
      // Paused while off screen — while visible it flows at the same 20s as the original, off screen it doesn’t draw needlessly
      if (!reduce) new IntersectionObserver(([e]) => (e.isIntersecting ? sw.autoplay.start() : sw.autoplay.stop())).observe(el);
    });
  });
})();
