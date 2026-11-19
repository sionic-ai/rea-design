// Work detail: left rail (rolls the current work to the center, and opens the whole rail when a hand comes to a thumbnail), right ruler (48 ticks grow around 5 cells near the scroll position and
// Attach the section marker [data-mark] at that section’s position — pressing it goes to that section), photo row reveal (at 25% in view, grayscale · blur clears over 1.1s)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const rail = document.querySelector("[data-rail]");
  const cur = rail?.querySelector("[aria-current]");
  if (rail && cur) rail.scrollTop = cur.offsetTop - rail.clientHeight / 2 + cur.offsetHeight / 2;
  rail?.addEventListener("pointerover", (e) => { if (e.target.closest("a")) rail.classList.add("open"); });
  rail?.addEventListener("pointerout", (e) => { if (!e.relatedTarget?.closest?.("[data-rail] a")) rail.classList.remove("open"); });

  const ruler = document.querySelector("[data-ruler]");
  if (ruler) {
    const ticksBox = ruler.querySelector(".bk-ticks"), marksBox = ruler.querySelector(".bk-marks");
    const ticks = Array.from({ length: 48 }, () => ticksBox.appendChild(document.createElement("i")));
    const max = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const frac = (el) => Math.min(1, Math.max(0, (el.getBoundingClientRect().top + scrollY - innerHeight / 3) / max()));
    let marks = [], queued = 0;
    const go = (f) => scrollTo({ top: f * max(), behavior: reduce.matches ? "auto" : "smooth" });
    function build() {
      const els = [...document.querySelectorAll("[data-mark]")].filter((e) => e.offsetParent !== null);
      ruler.hidden = els.length < 2 || max() < innerHeight;
      if (ruler.hidden) return;
      marksBox.textContent = "";
      ticks.forEach((t) => t.classList.remove("lm"));
      const h = ticksBox.clientHeight;
      marks = els.map((el) => {
        const f = frac(el), li = document.createElement("li"), b = document.createElement("button");
        b.type = "button";
        b.textContent = el.dataset.mark;
        b.addEventListener("click", (e) => { e.stopPropagation(); go(f); el.querySelector("a, button, h2")?.focus?.({ preventScroll: true }); });
        li.append(b);
        marksBox.append(li);
        ticks[Math.round(f * 47)].classList.add("lm");
        return { f, li, y: f * h };
      });
      for (let i = 1; i < marks.length; i++) marks[i].y = Math.max(marks[i].y, marks[i - 1].y + 22);
      if (marks.length) marks[marks.length - 1].y = Math.min(marks[marks.length - 1].y, h);
      for (let i = marks.length - 2; i >= 0; i--) marks[i].y = Math.min(marks[i].y, marks[i + 1].y - 22);
      marks.forEach((m) => (m.li.style.top = `${m.y}px`));
      update();
    }
    function update() {
      queued = 0;
      if (ruler.hidden) return;
      const t = Math.min(1, scrollY / max()), at = t * 47;
      ticks.forEach((tk, i) => {
        const r = Math.abs(i - at), k = Math.max(0, 1 - r / 5);
        tk.style.setProperty("--k", (k * k).toFixed(3));
        tk.classList.toggle("on", r < 0.5);
        tk.classList.toggle("near", r >= 0.5 && r < 2);
      });
      let now = marks[0];
      for (const m of marks) if (m.f <= t + 0.002) now = m;
      marks.forEach((m) => m.li.classList.toggle("cur", m === now));
    }
    addEventListener("scroll", () => { if (!queued) queued = requestAnimationFrame(update); }, { passive: true });
    // Drag the ruler to scroll by that height
    let drag = false;
    const seek = (e) => { const b = ticksBox.getBoundingClientRect(); scrollTo({ top: Math.min(1, Math.max(0, (e.clientY - b.top) / b.height)) * max() }); };
    ruler.addEventListener("pointerdown", (e) => { if (e.target.closest("button")) return; drag = true; ruler.setPointerCapture(e.pointerId); seek(e); });
    ruler.addEventListener("pointermove", (e) => drag && seek(e));
    ruler.addEventListener("pointerup", () => (drag = false));
    let rt = 0;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 150); });
    (document.fonts?.ready ?? Promise.resolve()).then(build);
  }

  const shots = [...document.querySelectorAll(".bk-shot")];
  if (shots.length && !reduce.matches && "IntersectionObserver" in window) {
    const seen = (el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
    shots.forEach((s) => seen(s) && s.classList.add("dev"));
    document.documentElement.classList.add("bk-develop");
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      requestAnimationFrame(() => e.target.classList.add("dev"));
    }), { threshold: 0.25 });
    shots.filter((s) => !s.classList.contains("dev")).forEach((s) => io.observe(s));
  }
})();
