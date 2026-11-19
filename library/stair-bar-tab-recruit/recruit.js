// Careers — fills job cards (pressing the head opens the shared.js accordion), the button turns on once all required application fields are filled (including the original 0.5s and 1s re-check).
(() => {
  const JOBS = [
    ["Role name 1", ["Department 1", "Business 1", "Job group 1", "Job group 2"]],
    ["Role name 2", ["Department 1", "Business 1", "Job group 2"]],
    ["Role name 3 (abbreviated)", ["Department 2", "Business 1", "Job group 1", "Job group 2"]],
    ["Role name 4 (abbreviated)", ["Department 3", "Business 2", "Job group 1", "Job group 2"]],
    ["Job title 5 and job title 6 (short name)", ["Department 3", "Business 3", "Job group 1", "Job group 2"]],
    ["Role name 7", ["Department 4", "Job group 3"]],
    ["Job title 8 (Qualification 1 · Qualification 2)", ["Department 5", "Job group 3"]],
    ["Job title 9 / Job title 10", ["Department 3", "Business 4", "Job group 3"]]
  ];
  document.querySelector(".r-jobs").innerHTML = JOBS.map(([title, tags]) => `
    <div class="r-job">
      <div class="r-job__read" data-acc>
        <h3>${title}</h3>
        <p>Your job introduction goes here in about four lines: who you meet and what you do,<br>Describe what is analyzed and proposed, and what continues after the contract.</p>
        <ul class="r-tags">${tags.map((t, i) => `<li class="${i === 0 ? "is-dept" : t.startsWith("Business") ? "is-biz" : ""}">${t}</li>`).join("")}</ul>
        <div class="r-cross"><span></span></div>
      </div>
      <div class="r-job__text"><div class="r-job__text-in">
        <dl class="r-dl">
          <div><dt>Task Details</dt><dd><b>Your task one here</b><p>- Your task description here<br>- Your task description here<br>- Your task description here</p></dd></div>
          <div><dt>Requirements</dt><dd><p>· Your requirement here<br>· Your requirement here</p></dd></div>
          <div><dt>Preferred requirements</dt><dd><p>· Your requirement here<br>· Your requirement here<br>· Your requirement here</p></dd></div>
        </dl>
        <div class="r-job__btn"><small>※ Your note here</small><div class="c-btn"><a href="#entry">Apply for this role</a></div></div>
      </div></div>
    </div>`).join("");

  const form = document.querySelector(".r-form__form");
  const submit = form.querySelector(".r-submit");
  const check = () => {
    const ok = [...form.querySelectorAll("[required]")].every((el) => (el.type === "file" ? el.files.length > 0 : el.value.trim() !== ""));
    submit.classList.toggle("is-ready", ok);
  };
  form.addEventListener("input", check);
  form.addEventListener("change", (e) => {
    const el = e.target;
    if (el.tagName === "SELECT") el.classList.toggle("is-filled", el.value !== "");
    if (el.type === "file") el.closest(".r-file").querySelector("em").textContent = el.files[0]?.name || "Please choose";
    check();
  });
  setTimeout(check, 500);
  setTimeout(check, 1000);
})();
