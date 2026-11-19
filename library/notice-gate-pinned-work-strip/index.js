// Home-page-only motion — hooked immediately without waiting for the entrance gate like the original (offscreen, so it only becomes visible after entry).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const works = document.querySelector(".ft-works");
  const biz = document.querySelector(".ft-biz");
  const contact = document.querySelector(".ft-contact");
  const inView = (el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
  // The work strip drops (hides behind) when the business section enters the screen, and reattaches when the Contact strip shows
  const check = () => {
    if (!works || !biz) return;
    if (contact && inView(contact)) works.classList.remove("is-unfixed");
    else if (biz.getBoundingClientRect().top < innerHeight) works.classList.add("is-unfixed");
    else works.classList.remove("is-unfixed");
  };
  addEventListener("scroll", check, { passive: true });
  addEventListener("resize", check);
  check();

  // Count award cards and news rows as one line and delay each by .1s (as in the original — the first news row is .9s late). No delay on phones
  const mobile = matchMedia("(max-width: 768px)").matches;
  const items = document.querySelectorAll(".ft-press__list li, .ft-news__list li");
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    if (mobile) e.target.style.transitionDelay = "0s";
    e.target.classList.add("is-show");
    io.unobserve(e.target);
  }), { threshold: 0 });
  items.forEach((li, i) => {
    if (reduce) return li.classList.add("is-show");
    if (!mobile) li.style.transitionDelay = `${i * 0.1}s`;
    io.observe(li);
  });

  // People text panel — visible at 20%, turns on over 1.5s after .5s
  const txt = document.querySelector(".ft-people__txt");
  if (txt) {
    const tio = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      setTimeout(() => txt.classList.add("is-show"), reduce ? 0 : 500);
      tio.unobserve(txt);
    }), { threshold: 0.2 });
    tio.observe(txt);
  }

  // Story title — when 10% visible, at .5s intervals
  const delays = document.querySelectorAll(".ft-delay");
  if (delays.length) {
    const dio = new IntersectionObserver((entries, obs) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      delays.forEach((el, i) => setTimeout(() => el.classList.add("is-show"), reduce ? 0 : i * 500));
    }), { threshold: 0.1 });
    dio.observe(delays[0]);
  }
})();
