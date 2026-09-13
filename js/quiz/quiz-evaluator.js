export function evaluateQuiz(quiz, form, questionsContainer) {
  let score = 0;

  quiz.questions.forEach((question) => {
    const answers = [...form.querySelectorAll(`input[name="${question.id}"]:checked`)]
      .map((input) => input.value);

    const correctAnswers = question.correctAnswers || [question.correctAnswer];
    const isCorrect = answers.length === correctAnswers.length &&
      answers.every((answer) => correctAnswers.includes(answer));

    const card = questionsContainer.querySelector(`[data-qid="${question.id}"]`);
    card.querySelectorAll(".option").forEach((option) => {
      const optionId = option.dataset.opt;
      if (correctAnswers.includes(optionId)) option.classList.add("correct");
      if (answers.includes(optionId) && !correctAnswers.includes(optionId)) {
        option.classList.add("incorrect");
      }
    });

    const explanation = card.querySelector(".explanation");
    explanation.innerHTML = `<strong>Answer: ${correctAnswers.join(", ")}</strong> ${question.explanation}`;
    explanation.classList.remove("hidden");

    card.querySelectorAll("input").forEach((input) => {
      input.disabled = true;
    });

    if (isCorrect) score += 1;
  });

  return {
    score,
    total: quiz.questions.length,
    ratio: quiz.questions.length ? score / quiz.questions.length : 0
  };
}
