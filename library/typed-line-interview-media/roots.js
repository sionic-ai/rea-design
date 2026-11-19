// People — sorting (newest, alphabetical, pressing the same button again reverses): rebuilds the rows and brings them in from 20px to the left at .1s intervals over .4s circ.out,
// Collapsing rows (original WAAPI height · opacity 300ms ease-out, opening one closes the row that was open), and when the page settles the leaf drawings sprout in sequence.
LD.page("roots", (root, { reduce }) => {
  const ac = new AbortController(), signal = ac.signal;
  const items = [...root.querySelectorAll("[data-sort-item]")];
  const byTime = items.slice().sort((a, b) => b.dataset.time - a.dataset.time);
  const byAz = items.slice().sort((a, b) => a.dataset.az - b.dataset.az);
  const buttons = [...root.querySelectorAll("[data-sort-btn]")];
  let busy = false;

  const show = (list) => {
    if (reduce) { gsap.set(list, { opacity: 1, x: 0 }); busy = false; return; }
    gsap.fromTo(list, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "circ.out", onComplete: () => (busy = false) });
  };
  buttons.forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    if (busy) return;
    busy = true;
    const active = b.dataset.active, down = b.dataset.down;
    const isDown = down !== active;
    const by = b.dataset.sortby;
    buttons.forEach((x) => (x.dataset.active = 0));
    buttons.filter((x) => x.dataset.sortby === by).forEach((x) => { x.dataset.active = 1; x.dataset.down = down === active ? 0 : 1; });
    const src = by === "time" ? byTime : byAz;
    const out = [];
    src.forEach((el, n) => {
      el.style.opacity = 0;
      if (isDown) { el.style.order = n; out.push(el); } else { el.style.order = src.length - 1 - n; out.unshift(el); }
    });
    show(out);
  }, { signal }));

  const opts = { duration: reduce ? 0 : 300, easing: "ease-out" };
  const close = (d) => {
    const t = d.querySelector(".ld-roots__toggle");
    d.classList.remove("is-open");
    t.animate([{ height: `${t.offsetHeight}px`, opacity: 1 }, { height: 0, opacity: 0 }], opts).onfinish = () => d.removeAttribute("open");
  };
  const open = (d) => {
    const t = d.querySelector(".ld-roots__toggle");
    d.classList.add("is-open");
    d.setAttribute("open", "");
    t.animate([{ height: 0, opacity: 0 }, { height: `${t.offsetHeight}px`, opacity: 1 }], opts);
  };
  root.querySelectorAll(".ld-roots__details").forEach((d) => d.querySelector("summary").addEventListener("click", (e) => {
    e.preventDefault();
    if (d.hasAttribute("open")) return close(d);
    const prev = root.querySelector(".ld-roots__details.is-open");
    if (prev) close(prev);
    open(d);
  }, { signal }));

  // When arriving after pressing a post card’s face (roots.html?=number) After 1.5s, opens that person’s row and scrolls down aligned half the header row height above (original jumpToRoots)
  const jump = location.search.match(/^\?=(\d+)/);
  const call = jump && gsap.delayedCall(1.5, () => {
    const item = root.querySelector(`.ld-roots__item[data-id="${jump[1]}"]`);
    if (!item) return;
    item.querySelector("details").setAttribute("open", "");
    item.querySelector("details").classList.add("is-open");
    const off = -0.5 * (document.querySelector(".ld-header")?.clientHeight || 0);
    if (LD.lenis) LD.lenis.scrollTo(item, { offset: off });
    else scrollTo(0, item.getBoundingClientRect().top + scrollY + off);
  });

  return {
    start() { root.querySelector(".ld-roots__visual")?.classList.add("is-visible"); },
    destroy() { ac.abort(); call?.kill(); },
  };
});
