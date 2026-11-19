/* Vision and values: a nine-value grid builds up, and three numbers count up from 0 when they enter the screen */
(() => {
  const V = [["Your value 1 here", "Four smiling coworkers · bright office · landscape"], ["Your value 2 here", "Red-lit event venue · blurred people · landscape"], ["Your value 3 here<br>Second row", "People gathered in a large hall · from above · landscape"], ["Your value 4 here<br>Second row", "Group photo in park · tree shade · landscape"], ["Your value 5 here<br>Second row", "Person walking in front of a lettering mural · landscape"], ["Your value 6 here", "Presenter · meeting room · landscape"], ["Your value 7 here", "Cheering team · outdoors · landscape"], ["Your value 8 here", "Person in front of dark stage · landscape"], ["Your value 9 here", "Blurred person in front and smiling coworker · landscape"]];
  document.querySelector("[data-values]").innerHTML = V.map(([t, img], i) => `<article class="tw-value tw-fade"><span class="tw-pill">0${i + 1}</span><p class="tw-value__t">${t}</p><div class="tw-value__img"><div class="wf-img tw-ph is-dark" data-label="${img}"></div><p>A sentence unpacking this value, in two or three lines.</p></div></article>`).join("");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-count]").forEach((el) => {
    const to = +el.dataset.count, comma = el.dataset.format === "comma", suf = el.dataset.suffix || "";
    const fmt = (v) => (comma ? Math.round(v).toLocaleString("en-US") : Math.round(v)) + suf;
    if (reduce) { el.textContent = fmt(to); return; }
    const o = { v: 0 };
    el.textContent = fmt(0);
    gsap.to(o, { v: to, duration: 2, ease: "power2.out", onUpdate: () => (el.textContent = fmt(o.v)), scrollTrigger: { trigger: el, start: "top 85%", once: true } });
  });
})();
