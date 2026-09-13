import { escapeHTML } from "../utils/format-utils.js";

export function renderQuestions(container, quiz) {
  container.innerHTML = quiz.questions.map((question, index) => {
    const multiSelect = Array.isArray(question.correctAnswers);

    return `
      <article class="question-card" data-qid="${escapeHTML(question.id)}">
        <div class="question-topline">
          <span class="question-number">Question ${index + 1} of ${quiz.questions.length}</span>
          <span class="category">${escapeHTML(question.category)}</span>
        </div>
        <h2>${escapeHTML(question.question)}</h2>
        <div class="options">
          ${question.options.map((option) => `
            <div class="option" data-opt="${escapeHTML(option.id)}">
              <input
                type="${multiSelect ? "checkbox" : "radio"}"
                id="${escapeHTML(question.id)}-${escapeHTML(option.id)}"
                name="${escapeHTML(question.id)}"
                value="${escapeHTML(option.id)}"
              >
              <label for="${escapeHTML(question.id)}-${escapeHTML(option.id)}">
                <strong>${escapeHTML(option.id)}.</strong>
                <span>${escapeHTML(option.text)}</span>
              </label>
            </div>
          `).join("")}
        </div>
        <div class="explanation hidden"></div>
      </article>
    `;
  }).join("");
}

export function clearQuestions(container) {
  container.innerHTML = "";
}
