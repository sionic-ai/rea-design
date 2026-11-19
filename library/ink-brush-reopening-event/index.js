// First page: opening notice curtain → 4 brush strokes → logo and vertical copy on, then the weekly calendar.
(() => {
  const intro = document.querySelector(".c-intro");
  const note = intro?.querySelector(".c-intro__note");
  const hero = document.querySelector(".c-fv");
  const marks = [".c-fv__mark", ".c-fv__copy"].map((s) => document.querySelector(s)).filter(Boolean);

  // The intro curtain shows once an hour — reopening in between skips the curtain, waits the same 1.8s, then draws only the brushstroke
  const KEY = "site-brand-intro";
  let fresh = true;
  try {
    const last = Number(localStorage.getItem(KEY));
    fresh = !(last && Date.now() - last < 36e5);
    if (fresh) localStorage.setItem(KEY, String(Date.now()));
  } catch { fresh = true; }

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(intro, { autoAlpha: 0 });
    gsap.set(marks, { opacity: 1 });
    requestAnimationFrame(() => hero?.dispatchEvent(new CustomEvent("fx:play")));
  });
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const showMarks = () => gsap.fromTo(marks, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: "power3.out", delay: 2 });
    hero?.addEventListener("fx:near", showMarks, { once: true });
    // The original code holds 1.8s, but while the large bundle loads the curtain stays longer — as measured by capturing the screen every .5s, it starts fading in at .2s and holds for 3.55s
    const HOLD = 3.55;
    const tl = gsap.timeline({ defaults: { ease: "power1.inOut" } });
    if (fresh) {
      tl.set(intro, { autoAlpha: 1 })
        .fromTo(note, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power1.in", delay: 0.2 })
        .to(intro, { autoAlpha: 0, duration: 1, ease: "circ.in" }, `+=${HOLD}`);
    } else {
      tl.set(intro, { autoAlpha: 0 }).to(intro, { autoAlpha: 0, duration: 0, ease: "circ.in" }, `+=${HOLD}`);
    }
    tl.add(() => setTimeout(() => hero?.dispatchEvent(new CustomEvent("fx:play"))));
    return () => { tl.kill(); hero?.removeEventListener("fx:near", showMarks); };
  });

  const cal = document.querySelector("[data-cal]");
  if (!cal) return;
  const daysEl = cal.querySelector("[data-cal-days]");
  const monthEl = cal.querySelector("[data-cal-month]");
  const yearEl = cal.querySelector("[data-cal-year]");
  const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const narrow = matchMedia("(max-width: 760px)");
  const day = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const same = (a, b) => a.toDateString() === b.toDateString();
  const pad = (n) => String(n).padStart(2, "0");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let start = day(today, -1), picked = today;

  function render() {
    const n = narrow.matches ? 3 : 8;
    monthEl.textContent = String(start.getMonth() + 1);
    yearEl.textContent = String(start.getFullYear());
    daysEl.replaceChildren(...Array.from({ length: n }, (_, i) => {
      const d = day(start, i);
      const b = document.createElement("button");
      b.type = "button";
      b.className = `c-cal__day${same(d, picked) ? " is-on" : ""}`;
      b.setAttribute("aria-pressed", String(same(d, picked)));
      b.innerHTML = `<span class="c-cal__date">${pad(d.getMonth() + 1)}/${pad(d.getDate())}</span><span class="c-cal__wd">${WD[d.getDay()]}</span>`;
      // Only the pressed cell changes its fill in place — redrawing the row would turn the pressed cell into a different element
      b.addEventListener("click", () => {
        picked = d;
        daysEl.querySelectorAll(".c-cal__day").forEach((x) => { const on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", String(on)); });
      });
      return b;
    }));
  }
  cal.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => { start = day(start, Number(b.dataset.step)); render(); }));
  cal.querySelectorAll("[data-month]").forEach((b) => b.addEventListener("click", () => {
    start = new Date(start.getFullYear(), start.getMonth() + Number(b.dataset.month), 1);
    render();
  }));
  narrow.addEventListener("change", render);
  render();
})();
