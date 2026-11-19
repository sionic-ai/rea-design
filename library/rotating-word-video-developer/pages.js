// Sub-page tag — kind is the original transition branch: about (About · Careers: head photo 1.1→1 + title 14%) · plain (title 25%)
(() => {
  if (!window.RH) return;
  // Toggle pill (work grid / map): moves the background piece with --toggle-active and turns on only the panel with the same name. Arrow keys also move it
  const toggles = (root) => {
    const offs = [];
    root.querySelectorAll("[data-toggle-init]").forEach((wrap) => {
      const btns = [...wrap.querySelectorAll("[data-toggle-btn]")];
      if (btns.length < 2) return;
      const panels = [...root.querySelectorAll(`[data-toggle-panel]`)];
      wrap.style.setProperty("--toggle-count", btns.length);
      let cur = Math.max(0, btns.findIndex((b) => b.hasAttribute("data-toggle-active")));
      const set = (i) => {
        cur = i; wrap.style.setProperty("--toggle-active", i);
        const key = btns[i].dataset.toggleBtn;
        btns.forEach((b, j) => { b.setAttribute("aria-pressed", String(j === i)); b.toggleAttribute("data-toggle-active", j === i); b.tabIndex = j === i ? 0 : -1; });
        panels.forEach((p) => p.classList.toggle("is-active", p.dataset.togglePanel === key));
        ScrollTrigger.refresh();
      };
      const click = (e) => { const i = btns.indexOf(e.currentTarget); if (i !== cur) set(i); };
      const key = (e) => { const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return; e.preventDefault(); const n = (cur + d + btns.length) % btns.length; set(n); btns[n].focus(); };
      btns.forEach((b) => { b.addEventListener("click", click); b.addEventListener("keydown", key); });
      set(cur);
      offs.push(() => btns.forEach((b) => { b.removeEventListener("click", click); b.removeEventListener("keydown", key); }));
    });
    return () => offs.forEach((f) => f());
  };
  // Team shortcuts: Lenis glides in 1.2s to a name tag within the same section
  const jumps = (root) => root.querySelectorAll(".rh-team__jump a").forEach((a) => a.addEventListener("click", (e) => {
    const t = root.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    RH.lenis ? RH.lenis.scrollTo(t, { duration: 1.2 }) : t.scrollIntoView({ behavior: RH.reduced ? "auto" : "smooth" });
  }));
  RH.page("about", { kind: "about", init: jumps });
  RH.page("recruit", { kind: "about" });
  RH.page("works", { kind: "plain", init: toggles });
  RH.page("news", { kind: "plain" });
  RH.page("article", { kind: "plain" });
})();
