export function setText(element, value) {
  if (element) element.textContent = value;
}

export function toggleHidden(element, hidden) {
  element?.classList.toggle("hidden", hidden);
}

export function setDisabled(element, disabled) {
  if (element) element.disabled = disabled;
}
