/** Scrolls the first invalid field into view after validation errors render. */
export function scrollToFirstError() {
  requestAnimationFrame(() =>
    document.querySelector("[aria-invalid=true]")?.scrollIntoView({ behavior: "smooth", block: "center" }),
  );
}
