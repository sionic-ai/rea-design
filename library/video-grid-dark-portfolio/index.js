// Studio first page — opening a card with no link (from the card’s spot to a centered 754 width in .75s, cubic-bezier(.16,1,.3,1)) ·
// Browse mode entered via the bar display (after the grid captions clear and the background is covered, one row of work, move with ←·→·wheel) · L for list view. Close via the bottom Close·Esc·backdrop
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(0.16, 1, 0.3, 1)", OPEN = 750;
  const grid = document.querySelector(".wp-grid");
  const stage = document.querySelector(".wp-stage");
  const closeBar = document.querySelector(".wp-close");
  if (!grid || !stage) return;
  let opened = null, explore = null;

  const showClose = (on) => closeBar?.classList.toggle("is-hidden", !on);

  // Card open — the original moves the pressed card from the same spot to a large center cell and grows it (.63 → 1, exponential decel)
  const open = (card) => {
    if (opened || explore) return;
    const a = card.getBoundingClientRect();
    const box = document.createElement("div");
    box.className = "wp-stage__card";
    box.append(card.querySelector(".wp-card__media").cloneNode(true), card.querySelector(".wp-card__cap").cloneNode(true));
    box.querySelectorAll("video").forEach((v) => { v.classList.add("is-ready"); v.play().catch(() => {}); });
    stage.append(box);
    stage.hidden = false;
    card.classList.add("is-lifted");
    opened = { card, box };
    const b = box.getBoundingClientRect();
    // Move and scale from the center — as in the original, center-row cards move only vertically
    const fromCard = (r, q) => `translate(${r.left + r.width / 2 - (q.left + q.width / 2)}px, ${r.top + r.height / 2 - (q.top + q.height / 2)}px) scale(${r.width / q.width})`;
    opened.fromCard = fromCard;
    if (!reduce) box.animate([{ transform: fromCard(a, b) }, { transform: "none" }], { duration: OPEN, easing: EASE });
    requestAnimationFrame(() => stage.classList.add("is-in"));
    showClose(true);
    window.wpLenis?.stop();
  };
  const shut = () => {
    if (!opened) return;
    const { card, box, fromCard } = opened;
    opened = null;
    stage.classList.remove("is-in");
    showClose(false);
    window.wpLenis?.start();
    const a = card.getBoundingClientRect(), b = box.getBoundingClientRect();
    const done = () => { box.remove(); stage.hidden = true; card.classList.remove("is-lifted"); };
    if (reduce) return done();
    box.animate([{ transform: "none" }, { transform: fromCard(a, b) }], { duration: OPEN, easing: EASE, fill: "forwards" }).finished.then(done);
  };

  // Browse — line up the works in one center row, only the current one large
  const cards = [...grid.querySelectorAll(".wp-card")];
  const enter = () => {
    if (opened || explore) return;
    grid.setAttribute("data-exploring", "");
    const wrap = document.createElement("div");
    wrap.className = "wp-explore";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Browse work");
    const row = document.createElement("div");
    row.className = "wp-explore__row";
    cards.forEach((c, i) => {
      const it = document.createElement("div");
      it.className = "wp-explore__it";
      it.append(c.querySelector(".wp-card__media").cloneNode(true), c.querySelector(".wp-card__cap").cloneNode(true));
      it.querySelectorAll("video").forEach((v) => v.play().catch(() => {}));
      it.addEventListener("click", () => go(i));
      row.append(it);
    });
    wrap.append(row);
    explore = { wrap, row, at: 0 };
    go(0);
    document.body.append(wrap);
    // Original: while the background is covered in .6s, the video unblurs from 16px as it loads (.25s sequence), and .6s later the cards fly from grid positions to row positions in 2s
    [...row.children].forEach((it, i) => {
      const ready = () => it.querySelectorAll("video").forEach((v) => v.classList.add("is-ready"));
      if (reduce) return ready();
      setTimeout(ready, 70 + i * 250);
      const a = cards[i].getBoundingClientRect(), b = it.getBoundingClientRect();
      it.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width})`, transformOrigin: "0 0" }, { transform: "none", transformOrigin: "0 0" }],
        { duration: 2000, delay: 600 + i * 18, easing: "cubic-bezier(0.65, 0, 0.15, 1)", fill: "backwards" });
    });
    showClose(true);
    window.wpLenis?.stop();
  };
  const go = (i) => {
    if (!explore) return;
    const its = [...explore.row.children];
    explore.at = Math.max(0, Math.min(its.length - 1, i));
    its.forEach((n, k) => n.classList.toggle("is-now", k === explore.at));
    // Push the row so the current item sits at screen center — measured by the width after it widens
    const now = 420, small = 175, gap = 12;
    const left = explore.at * (small + gap) + now / 2;
    explore.row.style.transform = `translateX(${(its.length * (small + gap) - gap + (now - small)) / 2 - left}px)`;
  };
  const leave = () => {
    if (!explore) return;
    explore.wrap.remove();
    explore = null;
    grid.removeAttribute("data-exploring");
    showClose(false);
    window.wpLenis?.start();
  };

  grid.addEventListener("click", (e) => {
    if (e.target.closest(".wp-pause")) return;
    const c = e.target.closest("[data-expand]");
    if (c) open(c);
  });
  grid.addEventListener("keydown", (e) => {
    const c = (e.key === "Enter" || e.key === " ") && e.target.closest("[data-expand]");
    if (c) { e.preventDefault(); open(c); }
  });
  document.querySelector("[data-explore]")?.addEventListener("click", enter);
  document.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) { shut(); leave(); } });
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.("input, textarea")) return;
    if (e.key === "Escape") { shut(); leave(); }
    else if (explore && e.key === "ArrowRight") go(explore.at + 1);
    else if (explore && e.key === "ArrowLeft") go(explore.at - 1);
  });
  addEventListener("wheel", (e) => { if (explore && Math.abs(e.deltaY) > 20) go(explore.at + Math.sign(e.deltaY)); }, { passive: true });

  if (window.wpAct) {
    window.wpAct.e = () => (explore ? leave() : enter());
    window.wpAct.l = () => grid.setAttribute("data-view", grid.dataset.view === "list" ? "grid" : "list");
  }
})();
