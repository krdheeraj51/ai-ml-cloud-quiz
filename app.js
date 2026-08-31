(() => {
  const quizData = window.QUIZZES || {};
  const dates = Object.keys(quizData).sort().reverse();

  const dateSelect = document.getElementById("quiz-date");
  const displayDate = document.getElementById("display-date");
  const questionCount = document.getElementById("question-count");
  const quizStatus = document.getElementById("quiz-status");
  const questionsContainer = document.getElementById("questions");
  const quizForm = document.getElementById("quiz-form");
  const formMessage = document.getElementById("form-message");
  const submitBtn = document.getElementById("submit-btn");
  const resultCard = document.getElementById("result-card");
  const scoreEl = document.getElementById("score");
  const scoreMessage = document.getElementById("score-message");
  const retryBtn = document.getElementById("retry-btn");

  let currentDate = dates[0];
  let submitted = false;

  function formatDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(Date.UTC(year, month - 1, day)));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function populateDateSelect() {
    dateSelect.innerHTML = dates
      .map(date => `<option value="${date}">${formatDate(date)}</option>`)
      .join("");
  }

  function renderQuiz(date) {
    currentDate = date;
    submitted = false;
    formMessage.textContent = "";
    resultCard.classList.add("hidden");
    quizStatus.textContent = "Not submitted";
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Quiz";

    const quiz = quizData[date];
    displayDate.textContent = formatDate(date);
    questionCount.textContent = quiz.questions.length;

    questionsContainer.innerHTML = quiz.questions.map((q, index) => `
      <article class="question-card" data-question-id="${escapeHtml(q.id)}">
        <div class="question-topline">
          <span class="question-number">Question ${index + 1}</span>
          <span class="category">${escapeHtml(q.category)}</span>
        </div>
        <h2>${escapeHtml(q.question)}</h2>

        <div class="options">
          ${q.options.map(option => `
            <div class="option" data-option="${escapeHtml(option.id)}">
              <input
                type="radio"
                id="${escapeHtml(q.id)}-${escapeHtml(option.id)}"
                name="${escapeHtml(q.id)}"
                value="${escapeHtml(option.id)}"
              />
              <label for="${escapeHtml(q.id)}-${escapeHtml(option.id)}">
                <strong>${escapeHtml(option.id)}.</strong>
                <span>${escapeHtml(option.text)}</span>
              </label>
            </div>
          `).join("")}
        </div>

        <div class="explanation hidden"></div>
      </article>
    `).join("");
  }

  function getSelectedAnswer(questionId) {
    const selected = quizForm.querySelector(`input[name="${questionId}"]:checked`);
    return selected ? selected.value : null;
  }

  function getScoreMessage(score, total) {
    const ratio = score / total;
    if (ratio === 1) return "Perfect score — excellent work.";
    if (ratio >= 0.67) return "Good job — review the explanation you missed.";
    if (ratio >= 0.34) return "Nice attempt — the explanations will help.";
    return "Keep practicing — review all three explanations.";
  }

  quizForm.addEventListener("submit", event => {
    event.preventDefault();
    if (submitted) return;

    const quiz = quizData[currentDate];
    const unanswered = quiz.questions.filter(q => !getSelectedAnswer(q.id));

    if (unanswered.length > 0) {
      formMessage.textContent = `Please answer all ${quiz.questions.length} questions before submitting.`;
      const firstMissing = questionsContainer.querySelector(
        `[data-question-id="${unanswered[0].id}"]`
      );
      firstMissing?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    let score = 0;

    quiz.questions.forEach(q => {
      const selected = getSelectedAnswer(q.id);
      const card = questionsContainer.querySelector(`[data-question-id="${q.id}"]`);
      const optionNodes = card.querySelectorAll(".option");
      const explanation = card.querySelector(".explanation");

      optionNodes.forEach(node => {
        const optionId = node.dataset.option;
        if (optionId === q.correctAnswer) {
          node.classList.add("correct");
        }
        if (optionId === selected && selected !== q.correctAnswer) {
          node.classList.add("incorrect");
        }
      });

      if (selected === q.correctAnswer) score += 1;

      explanation.innerHTML = `
        <strong>Answer: ${escapeHtml(q.correctAnswer)}</strong>
        ${escapeHtml(q.explanation)}
      `;
      explanation.classList.remove("hidden");

      card.querySelectorAll("input").forEach(input => {
        input.disabled = true;
      });
    });

    submitted = true;
    formMessage.textContent = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Quiz Submitted";
    quizStatus.textContent = "Completed";

    scoreEl.textContent = `${score} / ${quiz.questions.length}`;
    scoreMessage.textContent = getScoreMessage(score, quiz.questions.length);
    resultCard.classList.remove("hidden");
    resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  retryBtn.addEventListener("click", () => {
    renderQuiz(currentDate);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  dateSelect.addEventListener("change", event => {
    renderQuiz(event.target.value);
  });

  if (dates.length === 0) {
    questionsContainer.innerHTML = "<p>No quizzes have been added yet.</p>";
    submitBtn.disabled = true;
    return;
  }

  populateDateSelect();
  dateSelect.value = currentDate;
  renderQuiz(currentDate);
})();
