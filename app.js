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
    return r.ok ? (await r.json()).dates.sort().reverse() : [];
  }

  async function loadQuiz(date) {
    const [y, m, d] = date.split("-");
    const r = await fetch(`./data/${y}/${m}/${d}.json`);
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
            <input type="radio" id="${q.id}-${o.id}" name="${q.id}" value="${o.id}">
            <label for="${q.id}-${o.id}"><strong>${o.id}.</strong> ${o.text}</label>
          </div>
        `).join("")}</div>
        <div class="explanation hidden"></div>
      </article>
    `).join("");
  }

  async function init() {
    const dates = await loadManifest();
    if (!dates.length) {
      els.questions.innerHTML = "<p>No quizzes available</p>";
      return;
    }
    els.dateSelect.innerHTML = dates.map(d => `<option value="${d}">${fmt(d)}</option>`).join("");
    const today = new Date().toISOString().split("T")[0];
    const date = dates.includes(today) ? today : dates[0];
    els.dateSelect.value = date;
    await renderQuiz(date);
  }

  els.dateSelect.addEventListener("change", e => renderQuiz(e.target.value));
  els.quizForm.addEventListener("submit", e => {
    e.preventDefault();
    if (submitted || !currentQuiz) return;
    let score = 0;
    currentQuiz.questions.forEach(q => {
      const ans = els.quizForm.querySelector(`input[name="${q.id}"]:checked`)?.value;
      const card = els.questions.querySelector(`[data-qid="${q.id}"]`);
      card.querySelectorAll(".option").forEach(opt => {
        if (opt.dataset.opt === q.correctAnswer) opt.classList.add("correct");
        if (opt.dataset.opt === ans && ans !== q.correctAnswer) opt.classList.add("incorrect");
      });
      if (ans === q.correctAnswer) score++;
      const exp = card.querySelector(".explanation");
      exp.innerHTML = `<strong>Answer: ${q.correctAnswer}</strong> ${q.explanation}`;
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
