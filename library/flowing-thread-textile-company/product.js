// Business detail: table-of-contents pill. While the hero text is visible, all items are expanded (kv), and once past it, it folds to the current section name + ＋ (closed),
// On press it expands (open). Width uses .5s cubic-bezier(.22,1,.36,1), and the section name rolls up and down to change. Hides when it reaches the footer.
(() => {
  const { reduced } = window.ST;
  const nav = document.querySelector(".anchor");
  const panel = nav.querySelector(".anchor__panel");
  const items = [...nav.querySelectorAll(".anchor__item")];
  const trigger = nav.querySelector(".anchor__trigger");
  const summary = nav.querySelector(".anchor__summary");
  const sections = items.map((a) => document.getElementById(a.dataset.target));
  const lead = document.querySelector(".lead");
  const leadTitle = lead.querySelector(".lead__title");
  const footer = document.querySelector('[data-slot="footer"]');
  const EASE = "cubic-bezier(.22,1,.36,1)";
  let state = "kv", current = 0, userOpen = false;

  // When the state changes, stretch and shrink the pill width from the old width to the new one
  const setState = (next) => {
    if (next === state) return;
    const w0 = panel.offsetWidth;
    nav.dataset.state = state = next;
    trigger.setAttribute("aria-expanded", String(next === "open"));
    if (reduced) return;
    const w1 = panel.offsetWidth;
    panel.animate([{ width: w0 + "px" }, { width: w1 + "px" }], { duration: 500, easing: EASE });
  };

  // Current section name: scrolling down rolls the new name in from below, scrolling up rolls it in from above
  const roll = (label, down) => {
    const old = summary.querySelector(".anchor__summary-line");
    if (old.textContent === label) return;
    const line = document.createElement("span");
    line.className = "anchor__summary-line";
    line.textContent = label;
    if (reduced || state !== "closed") { old.replaceWith(line); return; }
    const w0 = panel.offsetWidth;
    Object.assign(old.style, { position: "absolute", right: 0, top: 0 });
    summary.append(line);
    const w1 = panel.offsetWidth;
    const opts = { duration: 500, easing: EASE };
    panel.animate([{ width: w0 + "px" }, { width: w1 + "px" }], opts);
    old.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: `translateY(${down ? -100 : 100}%)`, opacity: 0 }], opts).onfinish = () => old.remove();
    line.animate([{ transform: `translateY(${down ? 100 : -100}%)`, opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], opts);
  };

  let lastY = scrollY;
  const update = () => {
    const vh = innerHeight;
    const down = scrollY >= lastY;
    lastY = scrollY;
    // The last section past the 40% line from the top of the screen is the current section
    let idx = 0;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top < vh * 0.4) idx = i; });
    if (idx !== current) { current = idx; roll(items[idx].querySelector(".anchor__label").textContent, down); }
    items.forEach((a, i) => a.classList.toggle("is-current", i === current));
    // Hero text title appears only once it leaves the top of the screen, and stays expanded while the hero photo sits below half the screen (kv)
    const before = leadTitle.getBoundingClientRect().bottom > 0;
    const inKv = lead.getBoundingClientRect().bottom > vh * 0.5;
    if (inKv) { userOpen = false; setState("kv"); }
    else if (!userOpen) setState("closed");
    nav.classList.toggle("is-hidden", before || footer.getBoundingClientRect().top < vh);
  };
  addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
  update();

  panel.addEventListener("click", (e) => {
    if (state === "closed") { e.preventDefault(); userOpen = true; setState("open"); return; }
    if (state === "open" && e.target.closest(".anchor__trigger")) { userOpen = false; setState("closed"); }
  });
  items.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.getElementById(a.dataset.target);
    if (ST.lenis) ST.lenis.scrollTo(target, { offset: -80 });
    else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    if (state === "open") { userOpen = false; setState("closed"); }
  }));
})();
