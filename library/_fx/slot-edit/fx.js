(() => {
  kfFx.register("slot-edit", (el, { options }) => {
    const ac = new AbortController(), was = el.innerHTML;
    const ph = options.placeholder || "Name", max = +(options.max || 14);
    const idle = () => { el.innerHTML = `{{ ${ph}<i class="fx-caret"></i> }}`; el.classList.remove("is-filled"); };
    if (!el.textContent.trim()) idle();
    el.addEventListener("click", () => {
      if (el.querySelector("input")) return;
      el.innerHTML = `{{ <input aria-label="${ph}" maxlength="${max}"> }}`;
      const input = el.querySelector("input");
      input.focus();
      input.addEventListener("input", () => input.style.setProperty("--len", Math.max(2, input.value.length)));
      input.addEventListener("keydown", (e) => e.key === "Enter" && input.blur());
      input.addEventListener("blur", () => {
        const v = input.value.trim();
        if (v) { el.textContent = v; el.classList.add("is-filled"); } else idle();
        el.dispatchEvent(new CustomEvent("fx:change", { bubbles: true, detail: { value: v } }));
      }, { once: true });
    }, { signal: ac.signal });
    return () => { ac.abort(); el.innerHTML = was; el.classList.remove("is-filled"); };
  });
})();
