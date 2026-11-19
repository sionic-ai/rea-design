// Subpage interaction — evidence-finding prototype in service detail: pressing a question turns it into an ink-colored panel, the score bars of four sources shrink and grow to new values over .8s, and the answer forms again.
(() => {
  const PG = (window.PG = window.PG || {});
  PG.pages = PG.pages || {};
  const SETS = [[0.92, 0.75, 0.58, 0.41], [0.88, 0.81, 0.33, 0.2], [0.71, 0.52, 0.47, 0.12]];
  PG.pages["service-detail"] = {
    mount(scope) {
      const lab = scope.querySelector(".rlab");
      if (!lab) return () => {};
      const qs = [...lab.querySelectorAll("[data-rlab-q]")], fills = [...lab.querySelectorAll(".src__fill")], vals = [...lab.querySelectorAll(".src__val")], ans = lab.querySelector(".rlab__answer");
      const pick = (e) => {
        const b = e.target.closest("[data-rlab-q]");
        if (!b) return;
        const set = SETS[+b.dataset.rlabQ % SETS.length];
        qs.forEach((q) => q.classList.toggle("is-on", q === b));
        fills.forEach((f, i) => f.style.setProperty("--v", String(set[i])));
        vals.forEach((v, i) => { v.textContent = set[i].toFixed(2); });
        if (ans) gsap.fromTo(ans, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" });
      };
      lab.addEventListener("click", pick);
      return () => lab.removeEventListener("click", pick);
    },
  };
})();
