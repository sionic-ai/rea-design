// Application form: like the original <select> Turns it into a list of blurred panels, validates when leaving each field, and the send button turns on only when everything is filled in.
// Placeholder, so it sends nowhere — pressing send only shows a notice message.
(() => {
  const form = document.querySelector("[data-form]");
  if (!form) return;
  const inputs = [...form.querySelectorAll("[data-input]")];
  const selects = [...form.querySelectorAll("[data-select]")];
  const checks = [...form.querySelectorAll("[data-check]")];
  const submit = form.querySelector("[data-submit]");
  const RULES = {
    email: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "The email format is invalid."],
    tel: [/^0\d{9,10}$/, "Enter 10–11 digits starting with 0."],
  };
  const errOf = (el) => el.closest(".or-form__item")?.querySelector(".or-form__error");
  const show = (el, msg) => { const e = errOf(el); if (!e) return; e.querySelector("p").textContent = msg; e.classList.add("is-show"); };
  const hide = (el) => errOf(el)?.classList.remove("is-show");

  const validate = (el) => {
    const v = el.value.trim(), kind = el.dataset.validate;
    if (!v) return show(el, "This field is required.");
    if (kind && RULES[kind] && !RULES[kind][0].test(v)) return show(el, RULES[kind][1]);
    if (kind === "email-confirm") {
      const other = form.querySelector(`#${el.dataset.confirm}`);
      if (other && v !== other.value.trim()) return show(el, "The emails do not match.");
    }
    hide(el);
  };
  const filled = () => inputs.every((i) => i.value.trim()) && selects.every((s) => s.value) && checks.every((c) => c.checked);
  const update = () => (submit.disabled = !filled());

  selects.forEach((sel) => {
    const ui = document.createElement("div");
    ui.className = "c-select";
    ui.setAttribute("role", "listbox");
    ui.setAttribute("aria-expanded", "false");
    const trigger = document.createElement("div");
    trigger.className = "c-select__trigger or-field";
    trigger.tabIndex = 0;
    trigger.textContent = sel.querySelector("option[disabled]")?.textContent || "Please choose";
    const list = document.createElement("ul");
    list.className = "c-select__list or-field";
    sel.querySelectorAll("option:not([disabled])").forEach((o) => {
      const li = document.createElement("li");
      li.className = "c-select__item";
      li.setAttribute("role", "option");
      li.dataset.value = o.value;
      li.textContent = o.textContent;
      list.append(li);
    });
    ui.append(trigger, list);
    sel.after(ui);
    const setOpen = (open) => { ui.classList.toggle("is-open", open); ui.setAttribute("aria-expanded", String(open)); };
    trigger.addEventListener("click", () => setOpen(!ui.classList.contains("is-open")));
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(!ui.classList.contains("is-open")); }
      if (e.key === "Escape") setOpen(false);
    });
    list.addEventListener("click", (e) => {
      const li = e.target.closest(".c-select__item");
      if (!li) return;
      trigger.textContent = li.textContent;
      list.querySelectorAll(".c-select__item").forEach((x) => x.classList.toggle("is-checked", x === li));
      sel.value = li.dataset.value;
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      setOpen(false);
    });
    document.addEventListener("click", (e) => { if (!ui.contains(e.target)) setOpen(false); });
    sel.addEventListener("change", () => { sel.value ? hide(sel) : show(sel, "This field is required."); update(); });
  });

  inputs.forEach((el) => {
    el.addEventListener("blur", () => validate(el));
    el.addEventListener("input", () => { if (el.value.trim()) hide(el); update(); });
  });
  checks.forEach((c) => c.addEventListener("change", update));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    inputs.forEach(validate);
    if (form.querySelector(".or-form__error.is-show")) return;
    form.querySelector(".or-form__done").hidden = false;
    submit.disabled = true;
  });
})();
