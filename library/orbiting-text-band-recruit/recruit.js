(() => {
  // Question tab: keeps only the chosen branch (everything if ”All”), with ?content in the address= Leave it so the same tab opens when you come back
  const block = document.querySelector("[data-tabs]");
  const inputs = block.querySelectorAll("input[type=radio]");
  const targets = block.querySelectorAll(".ns-tabs__target");
  const show = (v) => targets.forEach((t) => t.classList.toggle("is-hide", v !== "all" && t.dataset.category !== v));
  inputs.forEach((i) => i.addEventListener("change", () => {
    show(i.value);
    const url = new URL(location);
    url.searchParams.set("content", i.value);
    history.replaceState(null, "", url);
  }));
  const want = new URLSearchParams(location.search).get("content");
  const pre = [...inputs].find((i) => i.value === want);
  if (pre) pre.checked = true;
  show(([...inputs].find((i) => i.checked) || inputs[0]).value);
})();
