// Used by every page — header panel swap, ”Menu 5” dropdown list, phone drawer, list filtering, reveal-in
(() => {
  const head = document.querySelector(".py-head");
  const blue = document.querySelector("[data-py-blue]");

  // Blue panel only while the blue hero (head panel) is under the header bar — once it is away, a white panel and black text (.4s)
  const paint = () => {
    if (!head) return;
    const under = blue ? blue.getBoundingClientRect().bottom > head.offsetHeight : false;
    head.classList.toggle("is-solid", !under || head.classList.contains("is-menu"));
  };
  addEventListener("scroll", paint, { passive: true });
  addEventListener("resize", paint);
  paint();

  // Menu 5 — on hover a list drops in from 20px above in .2s, click toggles it open and closed
  document.querySelectorAll("[data-py-drop]").forEach((btn) => {
    const li = btn.parentElement;
    let t = 0;
    const open = (on) => { clearTimeout(t); li.classList.toggle("is-open", on); btn.setAttribute("aria-expanded", on ? "true" : "false"); };
    if (matchMedia("(hover: hover)").matches) {
      li.addEventListener("pointerenter", () => open(true));
      li.addEventListener("pointerleave", () => { t = setTimeout(() => open(false), 120); });
    }
    btn.addEventListener("click", () => open(!li.classList.contains("is-open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") open(false); });
  });

  // Phone drawer — the hamburger folds into an ×, and the panel opens from top to bottom
  const burger = document.querySelector(".py-burger");
  const sheet = document.getElementById("py-sheet");
  if (burger && sheet) {
    const set = (on) => {
      sheet.classList.toggle("is-open", on);
      head.classList.toggle("is-menu", on);
      burger.setAttribute("aria-expanded", on ? "true" : "false");
      burger.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
      document.documentElement.style.overflow = on ? "hidden" : "";
      paint();
    };
    burger.addEventListener("click", () => set(!sheet.classList.contains("is-open")));
    sheet.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  // List filtering — pressing a pill category shows only that category’s rows (the original uses a different URL per category · same list type)
  document.querySelectorAll("[data-py-filter]").forEach((box) => {
    const chips = [...box.querySelectorAll("[data-py-chip]")];
    const rows = [...box.querySelectorAll("[data-py-cat]")];
    chips.forEach((c) => c.addEventListener("click", () => {
      chips.forEach((x) => x.classList.toggle("is-on", x === c));
      rows.forEach((r) => { r.hidden = c.dataset.pyChip !== "all" && r.dataset.pyCat !== c.dataset.pyChip; });
    }));
  });

  // Show after fonts are ready — visible by 1.2s at the latest. The reveal starts on the frame after it becomes visible
  const shown = new Promise((res) => {
    const show = () => { document.documentElement.classList.remove("py-wait"); requestAnimationFrame(() => res()); };
    if (!document.documentElement.classList.contains("py-wait")) return res();
    Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1200))]).then(show);
  });

  // Appear — Framer appear: from 20px below over .3s (curve .44,0,.56,1), photo panels from .8x over .5s, both delayed by .2s
  if (typeof gsap !== "undefined") {
    if (typeof CustomEase !== "undefined") { gsap.registerPlugin(CustomEase); CustomEase.create("pyFramer", "M0,0 C0.44,0 0.56,1 1,1"); }
    const ease = typeof CustomEase !== "undefined" ? "pyFramer" : "sine.inOut";
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => shown.then(() => {
      // List cells (CMS rows) turn on in sequence from transparent over .5s (.1s apart)
      document.querySelectorAll("[data-py-fade]").forEach((el) => {
        gsap.fromTo(el, { opacity: 0.001 }, { opacity: 1, duration: +(el.dataset.pyDur ?? 0.5), delay: Math.min(+el.dataset.pyFade || 0, 1), ease, clearProps: "opacity" });
      });
      document.querySelectorAll("[data-py-in]").forEach((el) => {
        const kv = el.dataset.pyIn === "kv";
        gsap.fromTo(el, kv ? { opacity: 0, scale: 0.8 } : { opacity: 0, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: kv ? 0.5 : 0.3, delay: 0.2, ease, clearProps: "transform,opacity" });
      });
    }));
  }
})();
