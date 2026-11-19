// Work list — pressing a By-something pill drops down a picker list, and only cards with the chosen value remain (reset to All)
(() => {
  const tabs = document.querySelector(".nk-tabs");
  if (!tabs) return;
  const cards = [...document.querySelectorAll(".nk-browse .nk-card")];
  const close = () => tabs.querySelectorAll(".nk-tab-drop.is-open").forEach((d) => { d.classList.remove("is-open"); d.querySelector(".nk-tab").setAttribute("aria-expanded", "false"); });
  const pick = (btn, filter) => {
    if (btn.classList.contains("is-on") && filter === "*") return;
    tabs.querySelectorAll(".nk-tab").forEach((t) => { t.classList.remove("is-on"); t.setAttribute("aria-selected", "false"); });
    btn.classList.add("is-on");
    btn.setAttribute("aria-selected", "true");
    cards.forEach((c) => c.classList.toggle("is-out", filter !== "*" && !(c.dataset.tags || "").split(" ").includes(filter)));
    if (window.gsap) gsap.fromTo(cards.filter((c) => !c.classList.contains("is-out")), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: window.nkEase || "expo.out" });
    window.ScrollTrigger?.refresh();
  };
  tabs.addEventListener("click", (e) => {
    const opt = e.target.closest("[data-filter]");
    if (opt) {
      const tab = opt.classList.contains("nk-tab") ? opt : opt.closest(".nk-tab-drop").querySelector(".nk-tab");
      pick(tab, opt.dataset.filter);
      close();
      return;
    }
    const drop = e.target.closest(".nk-tab-drop");
    if (drop) {
      const open = !drop.classList.contains("is-open");
      close();
      drop.classList.toggle("is-open", open);
      drop.querySelector(".nk-tab").setAttribute("aria-expanded", String(open));
    }
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".nk-tabs")) close(); });
  // The active All cell, on first hover, fills with a faint glow over .77s and stays that way (no change on leaving after hover in the original).
  tabs.querySelectorAll(".nk-tab.is-on").forEach((t) => t.addEventListener("pointerenter", () => t.classList.add("was-hover"), { once: true }));

  // Card chip — on hover, the chip text rolls up one line in .6s, one character at a time (.04s) (original work card chip). The roll is :hover in works.css
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".nk-cards--dim > .nk-card").forEach((card) => {
    const chip = card.querySelector(".nk-chip");
    if (!chip) return;
    const text = chip.textContent;
    chip.setAttribute("aria-label", text);
    chip.innerHTML = [...text].map((c) => `<span class="nk-ch" aria-hidden="true"><span><span>${c}</span><span>${c}</span></span></span>`).join("");
    chip.querySelectorAll(".nk-ch > span").forEach((s, i) => s.style.setProperty("--d", `${i * 0.04}s`));
    card.addEventListener("pointerenter", () => card.classList.add("was-hover"));
  });
})();
