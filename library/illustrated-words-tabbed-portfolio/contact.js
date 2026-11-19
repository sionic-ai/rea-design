// The chat box asks three set questions in turn and then ends — it’s a placeholder, so nothing is sent anywhere
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".g-chat__bar");
  const input = form.querySelector("input");
  const log = document.querySelector(".g-chat__log");
  const steps = [
    { ask: (v) => `Nice to meet you, ${v}Name, please enter the email address where you’d like to receive our reply.`, next: "Email address" },
    { ask: () => "Your question asking what they would like to do together here.", next: "The story you want to tell" },
    { ask: () => "Thank you. A confirmation line here — this field is not actually sent.", next: "" },
  ];
  let step = 0;
  const face = () => document.querySelector("[data-avatar-mini]")?.innerHTML ?? "";
  const add = (cls, text) => {
    const m = document.createElement("div");
    m.className = `g-msg ${cls}`;
    m.innerHTML = cls.includes("is-me") ? '<span class="g-msg__bubble"></span>' : `<span class="g-msg__face">${face()}</span><span class="g-msg__bubble"></span>`;
    m.querySelector(".g-msg__bubble").textContent = text;
    log.append(m);
    return m;
  };
  // When empty, disable send — like the original, a disabled button does not change on hover
  const send = form.querySelector(".g-chat__send");
  const sync = () => { send.disabled = !input.value.trim() || input.disabled; };
  input.addEventListener("input", sync);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v || step >= steps.length) return;
    add("is-me", v);
    input.value = "";
    const s = steps[step++];
    input.placeholder = s.next;
    input.disabled = !s.next;
    const typing = add("is-typing", "···");
    sync();
    setTimeout(() => { typing.remove(); add("", s.ask(v)); }, 700);
  });
  // Only when copied, green for 1.6 seconds — the notice text is read aloud while hidden from view
  const copy = document.querySelector(".g-copy"), said = copy.nextElementSibling;
  let timer = 0;
  copy.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(copy.previousElementSibling.textContent); } catch { return; }
    copy.classList.add("done");
    said.textContent = "Email address copied";
    clearTimeout(timer);
    timer = setTimeout(() => { copy.classList.remove("done"); said.textContent = ""; }, 1600);
  });
});
