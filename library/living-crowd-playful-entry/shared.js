// Cookie question — asked right away on first open (fades in on the next frame). After an answer it is removed .3s later, and the answer is remembered so it is not asked again.
(() => {
  const card = document.querySelector(".dl-consent");
  if (!card) return;
  const KEY = "dl.consent";
  let seen = null;
  try { seen = localStorage.getItem(KEY); } catch {}
  if (seen) return;
  document.body.classList.add("is-asking");
  card.hidden = false;
  requestAnimationFrame(() => card.classList.add("is-on"));
  const answer = (v) => {
    try { localStorage.setItem(KEY, v); } catch {}
    card.classList.remove("is-on");
    document.body.classList.remove("is-asking");
    setTimeout(() => { card.hidden = true; }, 300);
  };
  for (const b of card.querySelectorAll("[data-act]")) b.addEventListener("click", () => answer(b.dataset.act), { once: true });
})();
