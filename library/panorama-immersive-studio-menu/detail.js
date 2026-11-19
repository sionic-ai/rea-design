// Work detail — the header photo (.cs-fly) flies from full screen to the top spot of the right story column (.cs-story__cover) over 95vh of scroll and settles,
// Title, one-liner and meta that floated large on the left shrink as they move into the fixed left column. Once they arrive, swap in the same text in the fixed column (original cb-intro · cb-fly)
(() => {
  const TITLE = "Client Name";
  const body = document.body;
  const copy = document.querySelector(".cs-copy");
  const title = copy.querySelector(".cs-copy__title");
  const lead = copy.querySelector(".cs-copy__lead");
  const meta = copy.querySelector(".cs-copy__meta");
  title.style.setProperty("--len", TITLE.length);
  let n = 0;
  TITLE.split(" ").forEach((w, wi, all) => {
    const word = document.createElement("span");
    word.className = "w";
    [...w].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = ch;
      s.style.animationDelay = `${(0.1 + (n + i) * 0.05).toFixed(2)}s`;
      word.append(s);
    });
    n += w.length + 1;
    title.append(word);
    if (wi < all.length - 1) title.append(" ");
  });

  const slotTitle = document.querySelector(".cs-side__slot--title");
  const slotLead = document.querySelector(".cs-side__slot--lead");
  const docked = [title, lead].map((el) => el.cloneNode(true));
  slotTitle.append(docked[0]);
  slotLead.append(docked[1]);
  docked[0].removeAttribute("data-label");
  const passport = document.querySelector(".cs-passport");
  const fly = document.querySelector(".cs-fly");
  const cover = document.querySelector(".cs-story__cover");

  requestAnimationFrame(() => cs.enter(false));

  const pen = document.querySelector(".cs-pen");
  new IntersectionObserver(([e], io) => { if (e.isIntersecting) { pen.classList.add("is-drawn"); io.disconnect(); } }, { threshold: 0.4 }).observe(pen);

  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
    const span = () => innerHeight * 0.95;
    const stickTop = () => parseFloat(getComputedStyle(document.querySelector(".cs-side")).top) || 0;
    const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);
    let from = [], to = [], box = null;
    const measure = () => {
      body.classList.remove("is-docked");
      copy.classList.remove("is-docked");
      [title, lead, meta].forEach((el) => { el.style.transform = ""; });
      const y = scrollY;
      from = [title, lead].map((el) => el.getBoundingClientRect());
      to = docked.map((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, top: Math.max(stickTop(), r.top + y - span()), width: r.width };
      });
      const c = cover.getBoundingClientRect();
      box = { left: c.left, top: c.top + y - span(), width: c.width, height: c.height };
    };
    const draw = (p) => {
      const e = ease(p);
      fly.style.left = `${box.left * e}px`;
      fly.style.top = `${box.top * e}px`;
      fly.style.width = `${innerWidth + (box.width - innerWidth) * e}px`;
      fly.style.height = `${innerHeight + (box.height - innerHeight) * e}px`;
      [title, lead].forEach((el, i) => {
        const f = from[i], t = to[i], s = 1 + (t.width / f.width - 1) * e;
        el.style.transform = `translate(${(t.left - f.left) * e}px, ${(t.top - f.top) * e}px) scale(${s})`;
      });
      meta.style.transform = `translateY(${-40 * e}px)`;
      meta.style.filter = `opacity(${Math.max(0, 1 - e * 1.6)})`;
      const done = p >= 0.999;
      copy.classList.toggle("is-docked", done);
      body.classList.toggle("is-docked", done);
      passport.classList.toggle("is-on", p > 0.85);
    };
    measure();
    const st = ScrollTrigger.create({
      trigger: ".cs-intro",
      start: "top top",
      end: () => `+=${span()}`,
      scrub: true,
      invalidateOnRefresh: true,
      onRefreshInit: measure,
      onUpdate: (self) => draw(self.progress),
    });
    draw(st.progress);
    return () => {
      ["left", "top", "width", "height"].forEach((k) => { fly.style[k] = ""; });
      [title, lead, meta].forEach((el) => { el.style.transform = ""; });
      meta.style.filter = "";
      copy.classList.remove("is-docked");
      body.classList.remove("is-docked");
    };
  });
  mm.add("(max-width: 900px), (prefers-reduced-motion: reduce)", () => {
    passport.classList.add("is-on");
    copy.classList.add("is-docked");
    body.classList.add("is-docked");
  });
})();
