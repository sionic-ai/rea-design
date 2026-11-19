// About only: scattered photos appear in .8s when the declaration section reaches 60% of the screen (original css() → js-is-inview).
(window.SBP ||= {}).about = (root, SB) => {
  const sec = root.querySelector(".ab-statement");
  if (!sec) return;
  if (SB.reduced) sec.classList.add("is-in");
  else ScrollTrigger.create({ trigger: sec, start: "top 60%", once: true, onEnter: () => sec.classList.add("is-in") });
};
