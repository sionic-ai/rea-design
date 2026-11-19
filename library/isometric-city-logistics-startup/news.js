// News list: pressing Load more appends rows of the same type, eight at a time (the original fetches the next CMS page). Press twice and it ends.
(() => {
  const list = document.querySelector(".nl__list");
  const more = document.querySelector(".nl__more");
  let left = 2;
  more.addEventListener("click", () => {
    const rows = [...list.children].slice(0, 8).map((li) => li.cloneNode(true));
    rows.forEach((li) => { li.style.opacity = 0; list.append(li); });
    gsap.to(rows, { opacity: 1, duration: 0.5, stagger: 0.04, ease: "power2.out" });
    if (--left === 0) more.hidden = true;
    ScrollTrigger.refresh();
  });
})();
