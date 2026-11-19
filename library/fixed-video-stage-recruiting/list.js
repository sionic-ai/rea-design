(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const all = window.TY_INTERVIEWS;
  const grid = document.querySelector("[data-grid]");
  const more = document.querySelector("[data-more]");
  const buttons = document.querySelectorAll("[data-filter]");
  const FIRST = 9;
  let data = all, shown = 0, busy = false;

  window.tySplitTitles();

  const card = (it) => `
    <li class="ty-card"><a class="ty-card__link" href="article.html">
      <div class="ty-card__img"><div class="wf-img" data-label="${it.photo}"></div></div>
      <p class="ty-card__title">${it.title}</p>
      ${window.tyPeople(it.people, "ty-who")}
    </a></li>`;

  const updateMore = () => {
    const hide = data.length <= FIRST || shown >= data.length;
    more.style.display = hide ? "none" : "";
    more.disabled = hide;
  };
  // Cards enter from transparent at .1s offsets over .5s power4.out — new cards have size 1 from the start, so only opacity changes even in the original inAnimation
  const add = (count) => {
    busy = true;
    if (!data.length) { grid.innerHTML = `<li class="ty-ilist__empty">No resources available</li>`; busy = false; updateMore(); return; }
    const slice = data.slice(shown, Math.min(shown + count, data.length));
    slice.forEach((it, i) => {
      grid.insertAdjacentHTML("beforeend", card(it));
      const li = grid.lastElementChild;
      if (reduce) { li.style.opacity = "1"; if (i === slice.length - 1) busy = false; return; }
      gsap.to(li, { scale: 1, opacity: 1, delay: 0.1 * i, duration: 0.5, ease: "power4.out", onComplete: () => { if (i === slice.length - 1) busy = false; } });
    });
    shown += slice.length;
    updateMore();
  };
  // On exit, same order and curve, .8x and transparent
  const out = (done) => {
    const cards = grid.querySelectorAll(".ty-card");
    if (!cards.length || reduce) { done(); return; }
    busy = true;
    cards.forEach((c, i) => gsap.to(c, { scale: 0.8, opacity: 0, duration: 0.5, delay: 0.1 * i, ease: "power4.out", onComplete: () => { if (i === cards.length - 1) { busy = false; done(); } } }));
  };
  const setActive = (key) => buttons.forEach((b) => {
    const on = b.dataset.filter === key;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-current", String(on));
  });
  buttons.forEach((b) => b.addEventListener("click", () => {
    if (busy) return;
    const key = b.dataset.filter;
    out(() => {
      grid.innerHTML = ""; shown = 0;
      data = key === "all" ? all : all.filter((it) => it.position === key);
      add(FIRST);
      setActive(key);
    });
  }));
  more.addEventListener("click", () => { if (!busy) add(9); });
  add(FIRST);
})();
