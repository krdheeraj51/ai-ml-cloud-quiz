export function validateQuizSelection(quiz, form) {
  if (!quiz?.questions?.length) {
    return { valid: false, message: "No questions are available for this quiz." };
  }

  const unanswered = quiz.questions.filter((question) => {
    return form.querySelectorAll(`input[name="${question.id}"]:checked`).length === 0;
  });

  if (unanswered.length) {
    return {
      valid: false,
      message: `Please answer all ${quiz.questions.length} questions before submitting.`
    };
  }

  return { valid: true, message: "" };
}
