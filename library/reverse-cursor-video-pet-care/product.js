// Product search — the original app.js collapse (class B: open height 0 → auto .25s · close .2s, GSAP default curve) and filtering.
// On wide screens it filters immediately on each check, on phones you must press ”View with these filters” in the filter window, and then the window closes in .4s after filtering
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pc = matchMedia("(min-width: 768px)");

  document.querySelectorAll(".vl-acc").forEach((d) => {
    const trigger = d.querySelector(".vl-acc__trigger"), content = d.querySelector(".vl-acc__content");
    let open = d.open;
    d.classList.toggle("is-opened", open);
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      open = !open;
      d.classList.toggle("is-opened", open);
      gsap.killTweensOf(content);
      content.style.overflow = "hidden";
      if (open) {
        d.open = true;
        gsap.fromTo(content, { height: 0 }, { height: "auto", duration: reduce ? 0 : 0.25, onComplete: () => gsap.set(content, { clearProps: "height,overflow" }) });
      } else {
        gsap.to(content, { height: 0, duration: reduce ? 0 : 0.2, onComplete: () => { gsap.set(content, { clearProps: "height,overflow" }); d.open = false; } });
      }
    });
  });

  const root = document.getElementById("filter");
  if (!root) return;
  const boxes = [...root.querySelectorAll(".vl-check input")];
  const items = [...root.querySelectorAll(".pl-list > li")];
  const result = root.querySelector("[data-filter-result]");
  const box = root.querySelector("[data-filter-box]");
  const keys = ["producttype", "purpose", "conditions", "brand"];
  const apply = () => {
    const want = Object.fromEntries(keys.map((k) => [k, boxes.filter((b) => b.checked && b.dataset.type === k).map((b) => b.value)]));
    let shown = 0;
    items.forEach((li) => {
      const ok = keys.every((k) => !want[k].length || want[k].some((v) => (li.dataset[`filter${k[0].toUpperCase()}${k.slice(1)}`] || "").split(",").includes(v)));
      li.style.display = ok ? "" : "none";
      shown += ok ? 1 : 0;
    });
    root.classList.toggle("is-filter-none", shown === 0);
    result.textContent = boxes.filter((b) => b.checked).map((b) => b.dataset.name).join(" / ");
  };
  root.querySelector(".pl-nav__lists").addEventListener("change", () => { root.classList.add("is-filter-on"); if (pc.matches) apply(); });
  const closeBox = () => gsap.to(box, { autoAlpha: 0, duration: reduce ? 0 : 0.4, ease: "power2.out", onComplete: () => gsap.set(box, { display: "none" }) });
  root.querySelector("[data-filter-open]").addEventListener("click", () => { gsap.set(box, { display: "block", autoAlpha: 0 }); gsap.to(box, { autoAlpha: 1, duration: reduce ? 0 : 0.4, ease: "power2.out" }); });
  root.querySelector("[data-filter-close]").addEventListener("click", closeBox);
  root.querySelector("[data-filter-submit]").addEventListener("click", () => { root.classList.add("is-filter-on"); apply(); closeBox(); });
  root.querySelector("[data-filter-clear]").addEventListener("click", () => { boxes.forEach((b) => (b.checked = false)); root.classList.remove("is-filter-on"); apply(); });
})();
