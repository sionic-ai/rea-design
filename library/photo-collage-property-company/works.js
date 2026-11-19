// Managed results fold — original Accordion: height 0 → auto on open, → 0 on close (both .3s expo.out), remove open after closing and re-measure scroll positions
(() => {
  document.querySelectorAll("[data-acc]").forEach((group) => {
    const rows = [...group.querySelectorAll("[data-acc-item]")];
    rows.forEach((row, i) => {
      const sum = row.querySelector("[data-acc-summary]");
      const body = row.querySelector("[data-acc-content]");
      if (!sum || !body) return;
      sum.addEventListener("click", (e) => {
        e.preventDefault();
        if (row.hasAttribute("open")) {
          gsap.to(body, { height: 0, duration: 0.3, ease: "expo.out", onComplete: () => { row.removeAttribute("open"); ScrollTrigger.refresh(); } });
        } else {
          row.setAttribute("open", "");
          gsap.fromTo(body, { height: 0 }, { height: "auto", duration: 0.3, ease: "expo.out" });
        }
      });
      sum.addEventListener("keydown", (e) => {
        const step = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key];
        const next = step && rows[i + step]?.querySelector("[data-acc-summary]");
        if (next) { e.preventDefault(); next.focus(); }
      });
    });
  });
})();
