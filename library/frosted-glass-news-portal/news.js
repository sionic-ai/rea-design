// News list — open and close the topic·year picker panel, attach the next batch when reaching the list end (unfold motion is the grow-feed-in part).
// Original (/common/dist/news/list): the panel sits flush with the bottom edge of the pressed button (1px inside) and blocks document scroll while open. Clicking outside the panel or resizing the window closes it
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let open = null;

  const place = (pop, btn) => {
    const box = pop.querySelector(".nl-pop__box");
    const r = btn.getBoundingClientRect(), b = box.getBoundingClientRect();
    let top = r.bottom, left = r.right - b.width - 1;
    if (top + b.height > innerHeight) top = Math.max(innerHeight - b.height, 0);
    if (left < 1) left = 1;
    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
  };
  const show = (key, btn) => {
    const pop = document.querySelector(`[data-pop-panel="${key}"]`);
    if (!pop) return;
    close();
    pop.hidden = false;
    pop.dataset.state = "closed";
    place(pop, btn);
    root.style.overflow = "hidden";
    root.style.scrollbarGutter = "stable";
    btn.setAttribute("aria-expanded", "true");
    open = { pop, btn };
    const r = btn.getBoundingClientRect(), twin = btn.cloneNode(true);
    twin.className += " nl-pop__twin";
    twin.removeAttribute("data-pop");
    Object.assign(twin.style, { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px`, backgroundColor: getComputedStyle(btn).backgroundColor, transition: "none" });
    pop.prepend(twin);
    // Original only hides the in-place button — freezes it to the current color so the background doesn’t change when the cover blocks hover
    Object.assign(btn.style, { opacity: "0", transition: "none", backgroundColor: getComputedStyle(btn).backgroundColor });
    requestAnimationFrame(() => { pop.getBoundingClientRect(); pop.dataset.state = "open"; });
  };
  function close() {
    if (!open) return;
    const { pop, btn } = open;
    open = null;
    pop.dataset.state = "closed";
    btn.setAttribute("aria-expanded", "false");
    root.style.overflow = "";
    root.style.scrollbarGutter = "";
    const box = pop.querySelector(".nl-pop__box");
    pop.querySelector(".nl-pop__twin")?.remove();
    Object.assign(btn.style, { opacity: "", transition: "", backgroundColor: "" });
    const done = () => { if (pop.dataset.state === "closed") pop.hidden = true; };
    if (reduce.matches) return done();
    box.addEventListener("transitionend", (e) => { if (e.propertyName === "transform") done(); }, { once: true });
  }

  document.querySelectorAll("[data-pop]").forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => (open?.btn === btn ? close() : show(btn.dataset.pop, btn)));
  });
  document.querySelectorAll(".nl-pop").forEach((pop) => {
    pop.addEventListener("click", (e) => {
      const opt = e.target.closest("button");
      if (opt) {
        pop.querySelectorAll("button.is-on").forEach((b) => b.classList.remove("is-on"));
        opt.classList.add("is-on");
        const label = pop.dataset.popPanel === "year" && opt.textContent !== "Entire" ? opt.textContent : null;
        if (pop.dataset.popPanel === "year") document.querySelectorAll('.nl-year span').forEach((s) => (s.textContent = label || "Release Year"));
        close();
      } else if (e.target === pop) close();
    });
  });
  addEventListener("resize", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  // ── Reaching the end loads the next batch — the original appends fetched articles as a batch. As a placeholder, it appends the first batch twice with only the dates shifted and removes the end marker ──
  const feed = document.querySelector(".nl-feed");
  const first = feed?.querySelector('[data-fx-part="batch"]');
  let loaded = 0;
  feed?.addEventListener("fx:more", () => {
    const more = feed.querySelector('[data-fx-part="more"]');
    if (!more || !first) return;
    if (loaded >= 2) return more.remove();
    loaded += 1;
    const b = first.cloneNode(true);
    b.querySelectorAll("time").forEach((t, i) => (t.textContent = `2026. ${9 - loaded}. ${String(28 - i * 2).padStart(2, "0")}.`));
    more.before(b);
  });
})();
