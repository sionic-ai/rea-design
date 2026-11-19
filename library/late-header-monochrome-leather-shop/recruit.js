// Recruiting tab: original values as-is — outgoing content .5s fade, box height .4s, incoming content .5s (-.2s overlap), underline bar .4s.
// Application: pressing send shows red guidance on each empty field and scrolls 1.2s up to the form. Editing a field clears its guidance. Nothing is actually sent.
(() => {
  const { reduced } = window.MT;
  const box = document.querySelector(".recruit__tab-content");
  const buttons = document.querySelectorAll(".tab-button");
  const bar = document.querySelector(".tab-indicator");
  const padTop = parseFloat(getComputedStyle(box).paddingTop);

  const moveBar = (btn) => {
    const r = btn.getBoundingClientRect();
    const p = btn.parentElement.parentElement.getBoundingClientRect();
    bar.style.width = r.width + "px";
    bar.style.transform = `translateX(${r.left - p.left}px)`;
  };
  const show = (btn) => {
    const next = document.getElementById(btn.getAttribute("aria-controls"));
    const prev = box.querySelector('.tab-content[aria-hidden="false"]');
    if (!next || next === prev) return;
    buttons.forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
    box.style.height = box.offsetHeight + "px";
    gsap.set(next, { opacity: 0 });
    prev.setAttribute("aria-hidden", "true");
    next.setAttribute("aria-hidden", "false");
    const h = next.offsetHeight + padTop;
    gsap
      .timeline({ onComplete: () => { gsap.set([prev, next], { clearProps: "all" }); box.style.height = ""; } })
      .to(prev, { opacity: 0, duration: reduced ? 0 : 0.5 })
      .to(box, { height: h, duration: reduced ? 0 : 0.4 }, "<")
      .to(next, { opacity: 1, duration: reduced ? 0 : 0.5 }, reduced ? ">" : "-=0.2");
  };
  const first = document.querySelector('.tab-button[aria-selected="true"]');
  first && moveBar(first);
  addEventListener("resize", () => moveBar(document.querySelector('.tab-button[aria-selected="true"]')));
  buttons.forEach((b) => b.addEventListener("click", () => { show(b); moveBar(b); }));

  const form = document.getElementById("recruit-form");
  const fields = form.querySelectorAll("input, select, textarea");
  const mark = (el, bad) => {
    const row = el.closest(".recruit-form__row");
    const msg = row && row.querySelector(".error-message");
    if (!msg) return;
    row.classList.toggle("is-error", bad);
    msg.classList.toggle("is-show", bad);
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    fields.forEach((f) => mark(f, !f.checkValidity()));
    if (!form.checkValidity()) window.MT.scrollTo(".recruit__form", { duration: 1.2 });
  });
  fields.forEach((f) => ["input", "change"].forEach((ev) => f.addEventListener(ev, () => f.checkValidity() && mark(f, false))));
})();
