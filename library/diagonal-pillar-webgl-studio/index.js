// Hero — the showreel video stays pinned in the section and shrinks from a large panel (1300×731, radius 30) by .164× to plug into the slot between the titles (bound to scroll).
// Over a pinned video the glass cursor unfolds into a Play strip (glass-blob-cursor), and pressing expands it to fill the screen. The testimonials below advance every 6 seconds as a ring fills.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = window.nkEase || "expo.out";
  const dock = document.querySelector(".nk-dock");
  const video = dock?.querySelector(".nk-dock__video");
  const slot = dock?.querySelector(".nk-dock__slot");
  if (dock && video && slot && window.gsap && !reduce) {
    const stage = dock.querySelector(".nk-dock__stage");
    // Buttons stand from the start like the original (none of the three widths move on scroll) — only headings and paragraphs float up
    const title = dock.querySelector(".nk-dock__title"), lede = dock.querySelector(".nk-dock__lede");
    const big = () => {
      const s = stage.getBoundingClientRect(), w = video.offsetWidth, h = video.offsetHeight;
      return { x: (s.width - w) / 2, y: Math.max(96, (s.height - h) / 2), scale: 1 };
    };
    const small = () => {
      const s = stage.getBoundingClientRect(), r = slot.getBoundingClientRect(), w = video.offsetWidth;
      return { x: r.left - s.left, y: r.top - s.top, scale: r.width / w };
    };
    // So it stays right even if the font loads late and cell positions shift, re-measure the big panel and cell positions on every update and connect them with a curve
    const ease = gsap.parseEase(EASE);
    const place = (p) => {
      const a = big(), b = small(), k = ease(Math.min(1, p / 0.7));
      gsap.set(video, { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, scale: 1 + (b.scale - 1) * k, borderRadius: 30 });
      const t = Math.min(1, Math.max(0, (p - 0.45) / 0.3)), te = ease(t);
      [title, lede].forEach((el, i) => { const ti = ease(Math.min(1, Math.max(0, (p - 0.45 - i * 0.05) / 0.3))); gsap.set(el, { opacity: ti, y: 48 * (1 - ti) }); });
      return te;
    };
    ScrollTrigger.create({ trigger: dock, start: "top top", end: "bottom bottom", onUpdate: (self) => place(self.progress), onRefresh: (self) => place(self.progress) });
    place(0);
    document.fonts?.ready.then(() => place(ScrollTrigger.getAll().find((st) => st.trigger === dock)?.progress || 0));

    const modal = document.createElement("div");
    modal.className = "nk-dock-modal";
    modal.setAttribute("data-slot", "video-modal");
    modal.innerHTML = '<div class="wf-img" data-label="Studio showreel video · plays from the start with sound on · landscape 16:9"></div><button type="button">Close</button>';
    document.body.append(modal);
    const open = (on) => { modal.classList.toggle("is-open", on); on ? window.nkLenis?.stop() : window.nkLenis?.start(); };
    video.addEventListener("click", () => open(true));
    video.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(true); } });
    modal.addEventListener("click", () => open(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape") open(false); });
  }

  // Testimonials — next person every 6 seconds, a ring around the center face fills meanwhile. The ring runs only while the section is on screen (so client logos don’t change while passing by)
  const people = [...document.querySelectorAll("[data-voices] .nk-voices__person")];
  const quote = document.querySelector("[data-voice-quote]");
  const logos = [...document.querySelectorAll(".nk-voices__logos .nk-logo-chip")];
  if (people.length && window.gsap) {
    const ring = document.querySelector(".nk-voices__ring");
    let i = people.findIndex((p) => p.classList.contains("is-on")), tw = null;
    const go = (n) => {
      i = (n + people.length) % people.length;
      people.forEach((p, k) => p.classList.toggle("is-on", k === i));
      people[i].append(ring);
      logos.forEach((l, k) => l.classList.toggle("is-on", k === i + 1));
      if (quote && !reduce) gsap.fromTo(quote, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: EASE });
      tw?.kill();
      if (reduce) return;
      tw = gsap.fromTo(ring.querySelector("circle"), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 6, ease: "none", onComplete: () => go(i + 1) });
    };
    people.forEach((p, k) => p.addEventListener("click", () => go(k)));
    go(i);
    tw?.pause();
    const section = people[0].closest("[data-slot]");
    if (section && tw) new IntersectionObserver(([e]) => (e.isIntersecting ? tw?.resume() : tw?.pause()), { threshold: 0.35 }).observe(section);
  }
})();
