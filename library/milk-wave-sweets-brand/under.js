// Subpage motion: FAQ accordion (closes other questions and opens in 300ms — the swing curve of the original jQuery slideToggle is the same formula as sine.inOut) and the left table of contents that follows the scroll position
(() => {
  const qs = [...document.querySelectorAll(".faq__q")];
  const slide = (el, open) => {
    if (open === (el.style.display === "block")) return;
    gsap.killTweensOf(el);
    if (open) gsap.fromTo(el, { display: "block", height: 0 }, { height: "auto", duration: 0.3, ease: "sine.inOut", onComplete: () => ScrollTrigger.refresh() });
    else gsap.to(el, { height: 0, duration: 0.3, ease: "sine.inOut", onComplete: () => { el.style.display = "none"; ScrollTrigger.refresh(); } });
  };
  qs.forEach((q) => q.addEventListener("click", () => {
    qs.forEach((o) => { if (o !== q) { o.classList.remove("is-open"); slide(o.nextElementSibling, false); } });
    const open = q.classList.toggle("is-open");
    slide(q.nextElementSibling, open);
  }));

  // Table of contents: using 150px above each group’s position as the reference, moves the dot to the current group. Returning to the top selects the first item
  const menu = document.querySelector("[data-faq-menu]");
  if (!menu) return;
  const links = [...menu.querySelectorAll("a")];
  const secs = links.map((a) => document.querySelector(a.getAttribute("href")));
  const OFFSET = 150;
  const spy = () => {
    const y = scrollY;
    let at = links.findIndex((a) => a.classList.contains("is-active"));
    secs.forEach((s, i) => {
      const top = s.getBoundingClientRect().top + y - OFFSET;
      if (y >= top && y < top + s.offsetHeight) at = i;
    });
    if (y < secs[0].getBoundingClientRect().top + y - OFFSET) at = 0;
    links.forEach((a, i) => a.classList.toggle("is-active", i === at));
  };
  addEventListener("scroll", spy, { passive: true });
  spy();
})();
