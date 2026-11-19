// Work detail — URL ?w= Swaps the title, number and next work by number, so a single section can keep showing the ”Next work” flip in a continuous chain.
// Photo cells: full cells open from the bottom, half cells alternate from the top-left and top-right corners over 1.4s power4.inOut (when reaching 88%).
(() => {
  const COUNT = 7;
  const pad = (n) => String(n).padStart(2, "0");
  NT.page("detail", (view) => {
    const n = Math.min(COUNT, Math.max(1, parseInt(new URLSearchParams(location.search).get("w"), 10) || 1));
    const next = (n % COUNT) + 1;
    const set = (sel, text) => { const el = view.querySelector(sel); if (el && !el.querySelector(".nt-char")) el.textContent = text; };
    set("[data-case-title]", `Work name ${n}`);
    set("[data-case-nbr]", `W’${pad(n)}`);
    set("[data-case-next]", `Work name ${next}`);
    set("[data-case-next-nbr]", `W’${pad(next)}`);
    view.querySelector("[data-next-link]")?.setAttribute("href", `detail.html?w=${next}`);
    if (NT.reduce) return;
    view.querySelectorAll("[data-case-imgs] > .dt-img").forEach((el, i) => {
      const from = el.classList.contains("is-full") ? "inset(100% 0% 0% 0%)" : i % 2 === 0 ? "inset(100% 100% 0% 0%)" : "inset(100% 0% 0% 100%)";
      gsap.set(el, { clipPath: from });
      gsap.to(el, { clipPath: "inset(0% 0% 0% 0%)", ease: "power4.inOut", duration: 1.4, scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" } });
    });
  });
})();
