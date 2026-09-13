export function markQuestionContainerDisabled(container) {
  container.querySelectorAll("input").forEach((input) => {
    input.disabled = true;
  });
}
