// Masked text: redraws eight ▓▒░ characters every .5 seconds. On click it opens the speech bubble set and
// Typing dots 1s → first message .5s → second bubble (typing dots) 1.5s → second message 2s → close, and .5s after closing it returns to the start (original steps [1000, 500, 1500, 2000]).
// Like the original (React), the inside of the bubble is replaced anew at each step — dots removed and text attached, and the second bubble is newly attached then and rises from below
(() => {
  const btn = document.querySelector(".ll-redact");
  if (!btn) return;
  const glyphs = btn.querySelector(".ll-redact__glyphs");
  const chat = btn.querySelector(".ll-chat");
  const replies = (chat.dataset.replies || "").split("|");
  const SET = ["▓", "▒", "░"];
  const roll = () => Array.from({ length: 8 }, () => SET[Math.floor(Math.random() * SET.length)]).join("");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) setInterval(() => { glyphs.textContent = roll(); }, 500);

  const STEPS = [1000, 500, 1500, 2000];
  let open = false, n = 0, timer = 0;
  const dots = () => { const s = document.createElement("span"); s.className = "ll-dots"; s.innerHTML = "<i></i><i></i><i></i>"; return s; };
  const text = (t) => { const s = document.createElement("span"); s.textContent = t; return s; };
  const bubble = () => { const b = document.createElement("span"); b.className = "ll-bubble ll-reveal ll-reveal--xs"; return b; };
  // Balloon i attaches at step 2i (typing dots) and speaks from 2i+1
  const render = () => {
    replies.forEach((t, i) => {
      let b = chat.children[i];
      if (n < 2 * i && i > 0) { b?.remove(); return; }
      if (!b) { b = bubble(); chat.append(b); }
      const typing = n <= 2 * i;
      if (b.dataset.typing === String(typing)) return;
      b.dataset.typing = String(typing);
      b.replaceChildren(typing ? dots() : text(t));
    });
  };
  const tick = () => {
    if (n < 2 * replies.length) {
      timer = setTimeout(() => { n++; render(); tick(); }, STEPS[n] ?? 2500);
      return;
    }
    open = false;
    btn.classList.remove("is-open");
    timer = setTimeout(() => { n = 0; render(); }, 500);
  };
  render();
  btn.addEventListener("click", () => {
    if (open) return;
    clearTimeout(timer);
    open = true;
    n = 0;
    render();
    btn.classList.add("is-open");
    tick();
  });
})();
