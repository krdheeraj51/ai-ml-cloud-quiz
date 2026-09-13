import { toggleHidden } from "../utils/dom-utils.js";

export function createNotification(elements) {
  function showError(message) {
    elements.error.textContent = message;
    toggleHidden(elements.error, false);
  }

  function showInfo(message) {
    elements.info.textContent = message;
    toggleHidden(elements.info, false);
  }

  function clear() {
    elements.error.textContent = "";
    elements.info.textContent = "";
    toggleHidden(elements.error, true);
    toggleHidden(elements.info, true);
  }

  return { showError, showInfo, clear };
}
