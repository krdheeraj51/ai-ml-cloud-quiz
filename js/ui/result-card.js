import { getScoreMessage } from "../utils/format-utils.js";
import { setText, toggleHidden } from "../utils/dom-utils.js";

export function createResultCard(elements) {
  function render(score, total) {
    setText(elements.score, `${score} / ${total}`);
    setText(elements.message, getScoreMessage(total ? score / total : 0));
    toggleHidden(elements.card, false);
  }

  function hide() {
    toggleHidden(elements.card, true);
  }

  return { render, hide };
}
