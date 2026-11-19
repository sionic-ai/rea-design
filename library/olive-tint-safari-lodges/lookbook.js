// Album — group picker bar: sticks to the bottom center while inside the photo section, and picking a group closes the spread. Prev / next buttons move between groups.
(() => {
  const chap = document.querySelector(".t-chap"), gal = document.querySelector(".t-gal");
  if (!chap || !gal) return;
  ScrollTrigger.create({ trigger: gal, start: "top bottom", end: "bottom bottom", onToggle: (st) => chap.classList.toggle("is-fixed", st.isActive) });
  const pick = chap.querySelector(".t-chap__pick"), cur = chap.querySelector(".t-chap__cur span"), opts = [...chap.querySelectorAll(".t-chap__opt")];
  let at = 0;
  const set = (i) => {
    at = (i + opts.length) % opts.length;
    opts.forEach((o, k) => o.classList.toggle("is-on", k === at));
    cur.textContent = opts[at].textContent;
    pick.classList.remove("is-open");
    chap.querySelector(".t-chap__cur").setAttribute("aria-expanded", "false");
  };
  chap.querySelector(".t-chap__cur").addEventListener("click", (e) => { const o = pick.classList.toggle("is-open"); e.currentTarget.setAttribute("aria-expanded", o); });
  opts.forEach((o, k) => o.addEventListener("click", () => set(k)));
  const arrows = chap.querySelectorAll(".t-chap__arrow");
  // At the first/last group the prev/next buttons do nothing (original)
  arrows[0].addEventListener("click", () => { if (at > 0) set(at - 1); });
  arrows[1].addEventListener("click", () => { if (at < opts.length - 1) set(at + 1); });
  document.addEventListener("click", (e) => { if (!pick.contains(e.target)) pick.classList.remove("is-open"); });
})();
