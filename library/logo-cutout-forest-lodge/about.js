// Original Qc() — picks one of three photo layout types each time it opens
(() => {
  const m = document.getElementById("message");
  if (m) m.classList.add(["type1", "type2", "type3"][Math.floor(Math.random() * 3)]);
})();
