// Contact: the submit button comes alive only when the consent box is checked (the original mw-wp-form privacy consent check — re-applied on every page transition).
KS.page("contact", (box) => {
  const agree = box.querySelector(".js-agree");
  const submit = box.querySelector(".js-submit");
  if (!agree || !submit) return;
  const sync = () => { submit.disabled = !agree.checked; };
  sync();
  agree.addEventListener("change", sync);
  return () => agree.removeEventListener("change", sync);
});
