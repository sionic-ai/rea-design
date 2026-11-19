// FAQ: open and close questions (only one per group) · the pill strip at the bottom of the screen follows the group being read · press a pill to jump to that group · ticket card below
(() => {
  PP.page("faq", (root) => {
    const offs = [];
    root.querySelectorAll(".pp-faq__list").forEach((list) => {
      list.addEventListener("click", (e) => {
        const t = e.target.closest("[data-acc-toggle]");
        if (!t) return;
        const item = t.closest("[data-acc]"), open = !item.hasAttribute("data-open");
        list.querySelectorAll("[data-acc]").forEach((a) => {
          const on = a === item ? open : false;
          a.toggleAttribute("data-open", on);
          a.querySelector("[data-acc-toggle]").setAttribute("aria-expanded", String(on));
        });
        setTimeout(() => ScrollTrigger.refresh(), 650);
      });
    });
    const bar = root.querySelector("[data-faq-bar] [data-pills]");
    if (bar && PP.pills) {
      const pills = PP.pills(bar);
      offs.push(pills.off);
      const byId = new Map([...bar.querySelectorAll("[data-anchor]")].map((p) => [p.dataset.anchor, p]));
      root.querySelectorAll("[data-faq-group]").forEach((g) => {
        const st = ScrollTrigger.create({ trigger: g, start: "top 50%", end: "bottom 50%", onToggle: (s) => {
          if (!s.isActive) return;
          const p = byId.get(g.id);
          pills.place(p);
          bar.scrollTo({ left: p.offsetLeft - bar.clientWidth / 2 + p.offsetWidth / 2, behavior: PP.reduced ? "auto" : "smooth" });
        } });
        offs.push(() => st.kill());
      });
      bar.addEventListener("click", (e) => {
        const p = e.target.closest("[data-anchor]");
        if (!p) return;
        e.preventDefault();
        const g = root.querySelector(`#${p.dataset.anchor}`);
        const y = g.getBoundingClientRect().top + scrollY - 112;
        PP.lenis ? PP.lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y, behavior: "smooth" });
      });
    }
    // Anchor groups for header buttons and category cards also roll smoothly in 1.2s like the pill band (jumping straight would cancel the button hover in place)
    root.querySelectorAll('.pp-faq__head a[href^="#g"], .pp-faq__cats a[href^="#g"]').forEach((a) => a.addEventListener("click", (e) => {
      const g = root.querySelector(a.getAttribute("href"));
      if (!g) return;
      e.preventDefault();
      const y = g.getBoundingClientRect().top + scrollY - 112;
      // Like the original ”Open chat” — after the press, the button bounces back toward hover for a beat (.11s), then the screen advances
      setTimeout(() => (PP.lenis ? PP.lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y, behavior: "smooth" })), PP.reduced ? 0 : 110);
    }));
    const tickets = root.querySelector("[data-tickets]");
    if (tickets) tickets.innerHTML = Array.from({ length: 4 }, (_, i) => `<div class="pp-tickets__item">${PPC.ticket(i)}</div>`).join("");
    return () => offs.forEach((f) => f());
  });
})();
