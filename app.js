(() => {
  const els = {
    dateSelect: document.getElementById("quiz-date"),
    displayDate: document.getElementById("display-date"),
    questionCount: document.getElementById("question-count"),
    quizStatus: document.getElementById("quiz-status"),
    questions: document.getElementById("questions"),
    quizForm: document.getElementById("quiz-form"),
    formMessage: document.getElementById("form-message"),
    submitBtn: document.getElementById("submit-btn"),
    resultCard: document.getElementById("result-card"),
    score: document.getElementById("score"),
    scoreMessage: document.getElementById("score-message"),
    retryBtn: document.getElementById("retry-btn")
  };

  let currentDate = null, currentQuiz = null, submitted = false;

  const fmt = (d) => new Date(d.split("-")).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  async function loadManifest() {
    const r = await fetch("./data/manifest.json?t=" + Date.now());
    if (!r.ok) throw new Error(`Manifest request failed with status ${r.status}`);
    const manifest = await r.json();
    if (!Array.isArray(manifest.dates)) throw new Error("Manifest does not contain a dates array");
    return manifest.dates.sort().reverse();
  }

  async function loadQuiz(date) {
    const [y, m, d] = date.split("-");
    const r = await fetch(`./data/${y}/${m}/${d}.json?t=${Date.now()}`);
    return r.ok ? await r.json() : null;
  }

  async function renderQuiz(date) {
    const quiz = await loadQuiz(date);
    if (!quiz) {
      els.questions.innerHTML = `<p>No quiz available for ${fmt(date)}</p>`;
      return;
    }
    currentDate = date;
    currentQuiz = quiz;
    submitted = false;
    els.displayDate.textContent = fmt(date);
    els.questionCount.textContent = quiz.questions.length;
    els.quizStatus.textContent = "Not submitted";
    els.submitBtn.disabled = false;
    els.formMessage.textContent = "";
    els.resultCard.classList.add("hidden");
    els.questions.innerHTML = quiz.questions.map((q, i) => `
      <article class="question-card" data-qid="${q.id}">
        <div class="question-topline"><span class="question-number">Question ${i + 1}</span><span class="category">${q.category}</span></div>
        <h2>${q.question}</h2>
        <div class="options">${q.options.map(o => `
          <div class="option" data-opt="${o.id}">
            <input type="${q.correctAnswers ? "checkbox" : "radio"}" id="${q.id}-${o.id}" name="${q.id}" value="${o.id}">
            <label for="${q.id}-${o.id}"><strong>${o.id}.</strong> ${o.text}</label>
          </div>
        `).join("")}</div>
        <div class="explanation hidden"></div>
      </article>
    `).join("");
  }

  async function init() {
    try {
      const dates = await loadManifest();
      if (!dates.length) {
        els.questions.innerHTML = "<p>No quizzes available</p>";
        return;
      }
      els.dateSelect.innerHTML = dates.map(d => `<option value="${d}">${fmt(d)}</option>`).join("");
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const date = dates.includes(today) ? today : dates[0];
      els.dateSelect.value = date;
      await renderQuiz(date);
    } catch (error) {
      console.error("Unable to load quiz manifest:", error);
      els.quizStatus.textContent = "Unavailable";
      els.submitBtn.disabled = true;
      els.questions.innerHTML = "<p>Unable to load the quiz. Check that the data files are published, then refresh the page.</p>";
    }
  }

  els.dateSelect.addEventListener("change", e => renderQuiz(e.target.value));
  els.quizForm.addEventListener("submit", e => {
    e.preventDefault();
    if (submitted || !currentQuiz) return;
    let score = 0;
    currentQuiz.questions.forEach(q => {
      const answers = [...els.quizForm.querySelectorAll(`input[name="${q.id}"]:checked`)].map(input => input.value);
      const correctAnswers = q.correctAnswers || [q.correctAnswer];
      const isCorrect = answers.length === correctAnswers.length && answers.every(answer => correctAnswers.includes(answer));
      const card = els.questions.querySelector(`[data-qid="${q.id}"]`);
      card.querySelectorAll(".option").forEach(opt => {
        if (correctAnswers.includes(opt.dataset.opt)) opt.classList.add("correct");
        if (answers.includes(opt.dataset.opt) && !correctAnswers.includes(opt.dataset.opt)) opt.classList.add("incorrect");
      });
      if (isCorrect) score++;
      const exp = card.querySelector(".explanation");
      exp.innerHTML = `<strong>Answer: ${correctAnswers.join(", ")}</strong> ${q.explanation}`;
      exp.classList.remove("hidden");
      card.querySelectorAll("input").forEach(i => i.disabled = true);
    });
    submitted = true;
    els.submitBtn.disabled = true;
    els.submitBtn.textContent = "Quiz Submitted";
    els.quizStatus.textContent = "Completed";
    els.score.textContent = `${score} / ${currentQuiz.questions.length}`;
    const r = score / currentQuiz.questions.length;
    els.scoreMessage.textContent = r === 1 ? "Perfect score — excellent work." : r >= 0.67 ? "Good job — review the explanation you missed." : r >= 0.34 ? "Nice attempt — the explanations will help." : "Keep practicing — review all three explanations.";
    els.resultCard.classList.remove("hidden");
  });
  els.retryBtn.addEventListener("click", () => renderQuiz(currentDate));

  init();
})();
