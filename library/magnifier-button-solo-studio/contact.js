/* Contact — the form draws itself and stands when visible, and the draft on the right fills as you type (cell fill share = Draft %) */
(() => {
  const form = document.querySelector("[data-brief]");
  if (!form) return;
  const io = new IntersectionObserver((l) => l.forEach((e) => { if (e.isIntersecting) { form.classList.add("is-go"); io.disconnect(); setTimeout(() => form.classList.add("is-done"), 2400); } }), { threshold: 0.05 });
  io.observe(form);
  const $ = (s) => form.querySelector(s);
  const out = { count: $("[data-draft-count]"), name: $("[data-draft-name]"), title: $("[data-draft-title]"), url: $("[data-draft-url]"), budget: $("[data-draft-budget]"), timing: $("[data-draft-timing]"), words: $("[data-draft-words]") };
  const parts = () => [
    !!$("#f-name").value.trim(), !!$("#f-email").value.trim(), !!$("#f-company").value.trim(), !!$("#f-phone").value.trim(),
    !!form.querySelector("[data-kind] input:checked"), !!$("#f-site").value.trim(), $("#f-msg").value.trim().length > 10,
    !!form.querySelector("[data-budget] input:checked"), !!form.querySelector("[data-timing] input:checked"),
  ];
  let shown = 0, target = 0, raf = 0;
  const roll = () => { raf = 0; shown += (target - shown) * 0.18; if (Math.abs(target - shown) < 0.5) shown = target; out.count.textContent = String(Math.round(shown)).padStart(3, "0"); if (shown !== target) raf = requestAnimationFrame(roll); };
  const update = () => {
    const p = parts();
    target = Math.round((p.filter(Boolean).length / p.length) * 100);
    if (!raf) raf = requestAnimationFrame(roll);
    const company = $("#f-company").value.trim(), name = $("#f-name").value.trim();
    out.name.textContent = (company || name || "Name") + ".";
    const kind = form.querySelector("[data-kind] input:checked");
    out.title.textContent = kind ? kind.value : "Your Site";
    out.url.textContent = $("#f-site").value.trim().replace(/^https?:\/\//, "") || "your-company.com";
    const b = form.querySelector("[data-budget] input:checked"), t = form.querySelector("[data-timing] input:checked");
    out.budget.textContent = b ? b.value : "—";
    out.timing.textContent = t ? t.value : "—";
    const words = $("#f-msg").value.trim().split(/\s+/).filter(Boolean).length;
    out.words.textContent = String(words);
  };
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  update();
})();
