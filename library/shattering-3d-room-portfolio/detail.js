// Case detail: when a chunk (.rv) enters the screen it settles from 22px below over .9s (delayed by --d), and the right vertical index lights the dot of the section crossing the screen center
(() => {
  const items = [...document.querySelectorAll(".case .rv")];
  if (RI.reduced) { items.forEach((el) => el.classList.add("is-in")); }
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    RI.afterCurtain = () => items.forEach((el) => io.observe(el));
  }
  const links = [...document.querySelectorAll(".snav a")], secs = links.map((a) => document.querySelector(a.getAttribute("href")));
  const spy = () => {
    const mid = innerHeight / 2;
    let on = -1;
    secs.forEach((s, i) => { const r = s.getBoundingClientRect(); if (r.top < mid && r.bottom > mid) on = i; });
    links.forEach((a, i) => a.classList.toggle("is-on", i === on));
  };
  addEventListener("scroll", spy, { passive: true });
  spy();
})();
