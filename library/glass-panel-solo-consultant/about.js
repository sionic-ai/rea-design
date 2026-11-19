// Motion unique to the About page — awards section (pinned to a 250vh panel, the section changes by scroll share, opacity .4s is CSS)
document.addEventListener("va:ready", ({ detail: { mm } }) => {
  const recog = document.querySelector(".va-recog");
  if (!recog) return;
  const items = [...recog.querySelectorAll(".va-recog__item")];
  mm.add("(min-width: 480px)", () => {
    const st = ScrollTrigger.create({
      trigger: recog, start: "top top", end: "bottom bottom",
      onUpdate: (self) => {
        const k = Math.min(items.length - 1, Math.floor(self.progress * items.length));
        items.forEach((it, j) => it.classList.toggle("is-active", j === k));
      },
    });
    return () => st.kill();
  });
});
