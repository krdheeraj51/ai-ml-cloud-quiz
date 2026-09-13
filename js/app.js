import { APP_CONFIG } from "./config/config.js";
import { loadManifest } from "./services/manifest-service.js";
import { loadQuiz } from "./services/quiz-service.js";
import { createQuizState } from "./quiz/quiz-state.js";
import { getDefaultWeekIndex, getWeekNavigation, getPreferredDateForWeek } from "./quiz/quiz-navigation.js";
import { renderQuestions, clearQuestions } from "./quiz/quiz-renderer.js";
import { validateQuizSelection } from "./quiz/quiz-validator.js";
import { evaluateQuiz } from "./quiz/quiz-evaluator.js";
import { createWeekSelector } from "./ui/week-selector.js";
import { createDateSelector } from "./ui/date-selector.js";
import { createResultCard } from "./ui/result-card.js";
import { createNotification } from "./ui/notification.js";
import { setDisabled, setText } from "./utils/dom-utils.js";
import { formatDate } from "./utils/date-utils.js";

const els = {
  dateSelect: document.getElementById("quiz-date"),
  weekRange: document.getElementById("week-range"),
  weekAvailability: document.getElementById("week-availability"),
  previousWeek: document.getElementById("previous-week-btn"),
  nextWeek: document.getElementById("next-week-btn"),
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
  retryBtn: document.getElementById("retry-btn"),
  errorBanner: document.getElementById("error-banner"),
  infoBanner: document.getElementById("info-banner"),
  websiteLinks: [document.getElementById("website-link"), document.getElementById("footer-website-link")],
  linkedinLinks: [document.getElementById("linkedin-link"), document.getElementById("footer-linkedin-link")],
  githubLinks: [document.getElementById("github-link"), document.getElementById("footer-github-link")]
};

const state = createQuizState();
const weekSelector = createWeekSelector({ range: els.weekRange, availability: els.weekAvailability, previous: els.previousWeek, next: els.nextWeek });
const dateSelector = createDateSelector(els.dateSelect);
const resultCard = createResultCard({ card: els.resultCard, score: els.score, message: els.scoreMessage });
const notification = createNotification({ error: els.errorBanner, info: els.infoBanner });

function setupProfileLinks() {
  const linkGroups = [
    [els.websiteLinks, APP_CONFIG.profile.website],
    [els.linkedinLinks, APP_CONFIG.profile.linkedin],
    [els.githubLinks, APP_CONFIG.profile.github]
  ];

  linkGroups.forEach(([links, url]) => links.forEach((link) => {
    if (link) link.href = url;
  }));
}

function renderNavigation() {
  const navigation = getWeekNavigation(state.manifest.weeks, state.currentWeekIndex);
  weekSelector.render(navigation);
  dateSelector.render(navigation.current?.dates ?? [], state.currentDate);

  const hasDates = Boolean(navigation.current?.dates?.length);
  setDisabled(els.submitBtn, !hasDates || !state.currentQuiz || state.submitted);
  return navigation;
}

async function selectWeek(index) {
  state.currentWeekIndex = index;
  state.currentDate = null;
  state.currentQuiz = null;
  state.submitted = false;
  notification.clear();
  resultCard.hide();

  const navigation = renderNavigation();
  const preferredDate = getPreferredDateForWeek(navigation.current);

  if (!preferredDate) {
    setText(els.displayDate, "—");
    setText(els.questionCount, "0");
    setText(els.quizStatus, "No quizzes");
    clearQuestions(els.questions);
    setText(els.formMessage, "");
    notification.showInfo("No quiz dates are available for this week yet.");
    setDisabled(els.submitBtn, true);
    return;
  }

  await selectDate(preferredDate);
}

async function selectDate(date) {
  if (!date) return;

  state.currentDate = date;
  state.currentQuiz = null;
  state.submitted = false;
  els.quizStatus.textContent = "Loading";
  els.formMessage.textContent = "";
  resultCard.hide();
  notification.clear();
  setDisabled(els.submitBtn, true);

  renderNavigation();
  els.dateSelect.value = date;
  setText(els.displayDate, formatDate(date));
  clearQuestions(els.questions);

  try {
    const quiz = await loadQuiz(date);
    if (!quiz) {
      setText(els.quizStatus, "Unavailable");
      setText(els.questionCount, "0");
      notification.showInfo(`No quiz file is available for ${formatDate(date)}.`);
      return;
    }

    state.currentQuiz = quiz;
    state.submitted = false;
    setText(els.questionCount, String(quiz.questions?.length ?? 0));
    setText(els.quizStatus, "Not submitted");
    renderQuestions(els.questions, quiz);
    setDisabled(els.submitBtn, false);
  } catch (error) {
    console.error("Unable to load quiz:", error);
    setText(els.quizStatus, "Unavailable");
    setText(els.questionCount, "0");
    notification.showError("Unable to load this quiz. Please check the quiz data file and try again.");
  }
}

function moveWeek(direction) {
  const targetIndex = state.currentWeekIndex + direction;
  if (targetIndex < 0 || targetIndex >= state.manifest.weeks.length) return;
  selectWeek(targetIndex);
}

async function submitQuiz(event) {
  event.preventDefault();
  if (state.submitted || !state.currentQuiz) return;

  const validation = validateQuizSelection(state.currentQuiz, els.quizForm);
  els.formMessage.textContent = validation.message;
  if (!validation.valid) return;

  const result = evaluateQuiz(state.currentQuiz, els.quizForm, els.questions);
  state.submitted = true;
  setDisabled(els.submitBtn, true);
  els.submitBtn.textContent = "Quiz Submitted";
  setText(els.quizStatus, "Completed");
  resultCard.render(result.score, result.total);
}

function retryQuiz() {
  if (!state.currentDate) return;
  selectDate(state.currentDate);
  els.submitBtn.textContent = "Submit Quiz";
}

async function init() {
  setupProfileLinks();
  notification.clear();

  // Opening index.html directly with file:// blocks fetch() in most browsers.
  // The inline manifest fallback still allows week/date navigation to render.
  if (window.location.protocol === "file:") {
    notification.showInfo(
      "Local file preview detected. Week/date navigation is available, but quiz JSON files require a local HTTP server. " +
      "Run start-local-server.bat or: py -m http.server 5500"
    );
  }

  try {
    state.manifest = await loadManifest();

    if (!state.manifest.weeks.length) {
      setText(els.quizStatus, "Unavailable");
      notification.showInfo("No quiz dates have been added to manifest.json yet.");
      setDisabled(els.submitBtn, true);
      setDisabled(els.previousWeek, true);
      setDisabled(els.nextWeek, true);
      return;
    }

    state.currentWeekIndex = getDefaultWeekIndex(state.manifest.weeks);
    await selectWeek(state.currentWeekIndex);

    if (window.location.protocol !== "file:") {
      notification.clear();
    }
  } catch (error) {
    console.error("Unable to initialize quiz:", error);
    setText(els.quizStatus, "Unavailable");
    setDisabled(els.submitBtn, true);
    setDisabled(els.dateSelect, true);
    setDisabled(els.previousWeek, true);
    setDisabled(els.nextWeek, true);
    notification.showError("Unable to load the quiz manifest. Please refresh the page or verify that data/manifest.json is published.");
  }
}

els.previousWeek.addEventListener("click", () => moveWeek(-1));
els.nextWeek.addEventListener("click", () => moveWeek(1));
els.dateSelect.addEventListener("change", (event) => selectDate(event.target.value));
els.quizForm.addEventListener("submit", submitQuiz);
els.retryBtn.addEventListener("click", retryQuiz);

init();
