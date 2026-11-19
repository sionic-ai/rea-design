// Careers first page — vertical bar on the right fills as you scroll (original progress bar)
(() => {
  const bar = document.createElement("div");
  bar.className = "rc-progress";
  bar.setAttribute("aria-hidden", "true");
  bar.innerHTML = "<i></i>";
  document.body.appendChild(bar);
  gsap.to(bar.firstChild, { scaleY: 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: true } });

  // Product popup — original popup: loads the pressed pill’s name into the box, the box height breaks twice (69% and 91%) then expands immediately and the box floats up
  const modal = document.querySelector(".rc-modal");
  if (!modal) return;
  const box = modal.querySelector(".rc-modal__box");
  const reduce = window.mk.reduce;
  const close = () => { modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); window.mk.lenis.start(); };
  document.querySelectorAll(".rc-pills a").forEach((a, i) => a.addEventListener("click", (e) => {
    e.preventDefault();
    modal.querySelector(".rc-modal__n").textContent = String(i + 1).padStart(2, "0");
    modal.querySelector(".rc-modal__hd").textContent = a.lastChild.previousSibling.textContent;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    window.mk.lenis.stop();
    if (reduce) return;
    box.style.height = "";
    const full = box.offsetHeight, at = (k) => `${60 + (full - 60) * k}px`;
    box.style.height = "60px";
    [[60, at(0.69)], [120, at(0.91)], [135, ""]].forEach(([ms, h]) => setTimeout(() => (box.style.height = h), ms));
    // The original shows the box for one frame, then it drops to 0 and floats up — the initial value isn’t pre-painted
    gsap.fromTo(box, { opacity: 0 }, { opacity: 1, duration: 0.62, delay: 0.01, ease: "sine.inOut", immediateRender: false, overwrite: true });
  }));
  modal.querySelector(".rc-modal__close").addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("is-open")) close(); });
})();
