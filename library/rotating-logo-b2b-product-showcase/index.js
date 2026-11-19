// First page — chip shuffle (every 4.5s, 1.4s), three-product pinned board (every 1/3 of progress), role chip swaps the product text
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  // ---------- Chip mane ----------
  $$("[data-chip-cycle]").forEach((box) => {
    const wrap = $(".zn-chips__wrap", box), chips = $$(".zn-chip", box);
    if (!chips.length) return;
    const fitH = () => (wrap.style.height = `${Math.max(...chips.map((c) => c.offsetHeight)) + 32}px`);
    chips.forEach((c, i) => { c.classList.add("no-transition"); c.classList.toggle("is-active", i === 0); });
    fitH();
    addEventListener("resize", fitH);
    requestAnimationFrame(() => chips.forEach((c) => c.classList.remove("no-transition")));
    if (reduce || chips.length < 2) return;
    let cur = 0;
    const cycle = () => {
      const a = chips[cur], next = (cur + 1) % chips.length, b = chips[next];
      a.classList.remove("is-active"); a.classList.add("is-exit"); b.classList.add("is-active");
      setTimeout(() => {
        a.classList.add("no-transition"); a.classList.remove("is-exit");
        void a.offsetWidth;
        requestAnimationFrame(() => a.classList.remove("no-transition"));
      }, 1400);
      cur = next;
    };
    let id = setInterval(cycle, 4500);
    document.addEventListener("visibilitychange", () => { clearInterval(id); if (!document.hidden) id = setInterval(cycle, 4500); });
  });

  // ---------- Role chips ----------
  const tags = $$("[data-role-tags] .zn-filter");
  tags.forEach((t) => t.addEventListener("click", () => {
    const was = t.classList.contains("is-active");
    tags.forEach((x) => x.classList.remove("is-active"));
    if (!was) t.classList.add("is-active");
    document.dispatchEvent(new CustomEvent("zn:role", { detail: was ? null : [t.dataset.p1, t.dataset.p2, t.dataset.p3] }));
  }));

  // ---------- Three-product pinned panel ----------
  $$("[data-product-sticky]").forEach((wrap) => {
    const bullets = $$(".zn-bullet", wrap), panes = $$(".zn-prod__pane", wrap);
    const p = $(".zn-sticky__p", wrap), btn = $(".zn-sticky__btn", wrap);
    if (!bullets.length) return;
    let cur = null, media = null, role = null;
    const swap = (i) => {
      cur = i;
      p.textContent = (role && role[i]) || bullets[i].dataset.paragraph || "";
      btn.textContent = bullets[i].dataset.buttonText || "";
      btn.setAttribute("href", bullets[i].dataset.buttonLink || "#");
    };
    const animSwap = (i) => {
      p.classList.add("is-swapping"); btn.classList.add("is-swapping");
      setTimeout(() => { swap(i); p.classList.remove("is-swapping"); btn.classList.remove("is-swapping"); }, 300);
    };
    const setActive = (i) => {
      bullets.forEach((b, k) => b.classList.toggle("is-active", k === i));
      if (i !== media) { media = i; panes.forEach((pn) => pn.classList.toggle("is-active", pn.dataset.id === String(i + 1))); }
      if (cur === null) return swap(i);
      if (i !== cur) animSwap(i);
    };
    document.addEventListener("zn:role", (e) => { role = e.detail; if (cur !== null) animSwap(cur); });
    setActive(0);
    const st = ScrollTrigger.create({
      trigger: wrap, start: "top top", end: "bottom bottom",
      onUpdate: (self) => setActive(Math.min(bullets.length - 1, Math.floor(self.progress * bullets.length))),
    });
    bullets.forEach((b, i) => b.addEventListener("click", () => {
      const seg = (st.end - st.start) / bullets.length, y = st.start + seg * i + seg / 2;
      if (window.lenis) window.lenis.scrollTo(y, { duration: 1 }); else scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    }));
  });
})();
