// Card interaction — registration form confirmation (name and email check → loading 1s → locks into thank-you text, shakes if wrong), sound wave toggle on and off.
// Nothing is sent to the real site
(() => {
  const ui = document.querySelector(".d-ui");
  if (!ui) return;
  const form = ui.querySelector(".d-pane--form form");
  const cta = ui.querySelector(".d-cta");
  const ok = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const confirm = () => {
    const name = form.elements.name.value.trim(), email = form.elements.email.value.trim();
    if (!name || !ok(email)) { ui.dispatchEvent(new CustomEvent("fx:shake")); return; }
    ui.dispatchEvent(new CustomEvent("fx:go", { detail: { state: "wait" } }));
    cta.querySelector(".d-cta__label").textContent = "Thanks for joining!";
    cta.disabled = true;
    cta.querySelector("svg").innerHTML = '<path d="M20 6L9 17l-5-5"/>';
  };
  ui.addEventListener("fx:confirm", confirm);
  form.addEventListener("submit", (e) => { e.preventDefault(); confirm(); });
  form.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); confirm(); } });
  ui.addEventListener("fx:state", (e) => { if (e.detail.state === "form") setTimeout(() => form.elements.name.focus({ preventScroll: true }), 250); });

  // Sound ripple — once the sound is ready on the first press the ripple moves, and pressing the ripple mutes or unmutes it (index.js fires d:audio)
  const wave = ui.querySelector(".d-wave");
  // A press only counts .1 second after the sound is ready — so the very press that woke the sound doesn’t turn it off right away (same as the original)
  let ready = false, armed = false, muted = false;
  const sync = () => wave.classList.toggle("is-playing", ready && !muted);
  document.addEventListener("d:audio", () => { ready = true; sync(); setTimeout(() => (armed = true), 100); });
  const flip = () => { if (!armed) return; muted = !muted; sync(); document.dispatchEvent(new CustomEvent("d:mute", { detail: { muted } })); };
  wave.addEventListener("click", flip);
  wave.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
})();
