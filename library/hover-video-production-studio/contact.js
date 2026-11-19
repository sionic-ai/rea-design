// Contact: choosing from the hidden select changes the visible label, and send doesn’t really send, it only shows a missing-field notice or a sent notice (the original POSTs to ./send/).
MR.page("contact", (box) => {
  const form = box.querySelector(".mr-cform__body");
  const drop = form.querySelector(".mr-cform__drop");
  drop.querySelector("select").addEventListener("change", (e) => (drop.querySelector(".mr-cform__droplabel").textContent = e.target.value));

  const invalid = form.querySelector("#invalid");
  const success = form.querySelector("#success");
  const btn = form.querySelector(".mr-cform__btn");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const miss = { name: !form.querySelector("#c-name").value.trim(), mail: !/.+@.+/.test(form.querySelector("#c-mail").value), body: !form.querySelector("#c-body").value.trim() };
    invalid.querySelectorAll("li").forEach((li) => li.classList.toggle("is-show", miss[li.dataset.k]));
    const bad = Object.values(miss).some(Boolean);
    invalid.classList.toggle("is-show", bad);
    success.classList.toggle("is-show", !bad);
    if (!bad) { btn.classList.add("is-done"); btn.querySelectorAll(".mr-roll__t > span").forEach((s) => (s.textContent = "Sent")); }
  });
});
