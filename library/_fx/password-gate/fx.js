// State lives in a single data-state (error · open) — CSS paints by that value, and consumers only need to listen to the fx:open and fx:error events.
// Judged right here without sending anything to a server. The original redrew the page on a wrong answer to give the same look.
(() => {
  kfFx.register("password-gate", (el, { options }) => {
    const field = el.querySelector('[data-fx-part="field"]');
    if (!field) return;
    const submitBtn = el.querySelector('[data-fx-part="submit"]');
    const ac = new AbortController();
    const hint = field.getAttribute("placeholder") || "";
    const wrong = options.wrong || field.getAttribute("data-wrong") || hint;
    const answer = options.answer ?? "";
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.focus !== "off") field.focus({ preventScroll: true });

    const check = (e) => {
      e?.preventDefault();
      if (answer && field.value === answer) {
        el.dataset.state = "open";
        field.placeholder = hint;
        el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
        return;
      }
      el.dataset.state = "error";
      field.value = "";
      field.placeholder = wrong;
      field.focus({ preventScroll: true });
      el.dispatchEvent(new CustomEvent("fx:error", { bubbles: true }));
    };

    if (el.tagName === "FORM") el.addEventListener("submit", check, { signal: ac.signal });
    else {
      submitBtn?.addEventListener("click", check, { signal: ac.signal });
      field.addEventListener("keydown", (e) => e.key === "Enter" && check(e), { signal: ac.signal });
    }
    // In the original, the wrong mark stayed until the next submit — to clear it while typing use reset: input
    if (options.reset === "input") {
      field.addEventListener("input", () => {
        if (el.dataset.state !== "error") return;
        delete el.dataset.state;
        field.placeholder = hint;
      }, { signal: ac.signal });
    }

    return () => {
      ac.abort();
      delete el.dataset.state;
      field.placeholder = hint;
      el.style.removeProperty("--fx-dur");
    };
  });
})();
