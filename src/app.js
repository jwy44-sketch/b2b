import { createEngine, TOPIC_BUCKETS } from "./engine.js";
import { QUESTION_BANK } from "./question-bank.js";
import { createLearnMode } from "./learn/learn-mode.js";
import { LEARN_ROUTES } from "./learn/learn-types.js";

const engine = createEngine(QUESTION_BANK);

const questionTitle = document.querySelector("#question-title");
const questionSubtitle = document.querySelector("#question-subtitle");
const questionCard = document.querySelector("#question-card");
const feedbackStream = document.querySelector("#feedback-stream");
const feedbackPanel = document.querySelector(".feedback-panel");
const bucketGrid = document.querySelector("#bucket-grid");
const scoreboard = document.querySelector("#scoreboard");
const answerButtons = [...document.querySelectorAll(".answer-button")];
const showTopicTracking = document.querySelector("#show-topic-tracking");
const resetSessionButton = document.querySelector("#reset-session");
const testStage = document.querySelector("#test-stage");
const learnStage = document.querySelector("#learn-stage");
const learnRoot = document.querySelector("#learn-root");
const testModeButton = document.querySelector("#test-mode-button");
const learnModeButton = document.querySelector("#learn-mode-button");
const workspace = document.querySelector(".workspace");
const sidebar = document.querySelector(".sidebar");

const learnMode = createLearnMode({
  root: learnRoot,
  questionBank: QUESTION_BANK,
  onNavigateTest: () => navigateTo(LEARN_ROUTES.test),
});

let pendingNextButton = null;
let currentPresentation = null;
let correctLetterCycle = [];

function boot() {
  renderScoreboard();
  renderBucketGrid();
  hideFeedback();
  loadNextQuestion();
  wireEvents();
  syncRoute();
}

function wireEvents() {
  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      submitAnswer(button.dataset.answer);
    });
  });

  showTopicTracking.addEventListener("change", () => {
    if (isTestModeActive()) {
      renderCurrentQuestion();
    }
  });

  resetSessionButton.addEventListener("click", () => {
    engine.reset();
    feedbackStream.innerHTML = "";
    pendingNextButton = null;
    currentPresentation = null;
    correctLetterCycle = [];
    enableAnswerButtons();
    hideFeedback();
    renderScoreboard();
    renderBucketGrid();
    loadNextQuestion();
  });

  testModeButton.addEventListener("click", () => {
    navigateTo(LEARN_ROUTES.test);
  });

  learnModeButton.addEventListener("click", () => {
    navigateTo(LEARN_ROUTES.setup);
  });

  window.addEventListener("hashchange", () => {
    syncRoute();
  });

  document.addEventListener("keydown", (event) => {
    if (!isTestModeActive()) {
      return;
    }

    const key = event.key.toUpperCase();

    if (["A", "B", "C", "D"].includes(key)) {
      const isDisabled = answerButtons.every((button) => button.disabled);
      if (!isDisabled) {
        submitAnswer(key);
      }
    }

    if (key === "N" && pendingNextButton) {
      pendingNextButton.click();
    }
  });
}

function loadNextQuestion() {
  const question = engine.nextQuestion();
  pendingNextButton = null;
  currentPresentation = createQuestionPresentation(question);
  enableAnswerButtons();
  hideFeedback();
  renderCurrentQuestion(question);
  renderScoreboard();
  renderBucketGrid();
}

function renderCurrentQuestion(question = engine.state.currentQuestion) {
  const bucket = TOPIC_BUCKETS.find((item) => item.id === question.bucket);
  const showBucket = showTopicTracking.checked;
  const headingSuffix = showBucket ? ` (${question.bucket})` : "";

  questionTitle.textContent = `Question ${engine.state.questionNumber}${headingSuffix}`;
  questionSubtitle.textContent = `${bucket.title} • ${question.source.sessionLabel} • ${question.source.topicLabel}`;

  questionCard.innerHTML = `
    <div class="question-badge-row">
      <span class="question-badge">${question.source.sourceLabel}</span>
      <span class="question-badge">${question.source.sessionLabel}</span>
      <span class="question-badge">${question.source.topicLabel}</span>
    </div>
    <p class="question-stem">${escapeHtml(question.stem)}</p>
    <div class="choice-list">
      ${currentPresentation.displayLetters
        .map(
          (letter) => `
            <article class="choice-card">
              <span class="choice-letter">${letter}</span>
              <div>${escapeHtml(currentPresentation.displayChoices[letter])}</div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function submitAnswer(letter) {
  try {
    const canonicalLetter = currentPresentation.answerMap[letter];
    const feedback = engine.answerCurrent(canonicalLetter);
    disableAnswerButtons();
    prependFeedbackCard(remapFeedbackForDisplay(feedback, currentPresentation));
    showFeedback();
    renderScoreboard();
    renderBucketGrid();

    injectNextButton();
  } catch (error) {
    console.error(error);
  }
}

function prependFeedbackCard(feedback) {
  const wrapper = document.createElement("article");
  wrapper.className = `feedback-card ${feedback.status}`;

  wrapper.innerHTML = `
    <p class="feedback-kicker ${feedback.status}">${feedback.heading}</p>
    <h3 class="feedback-section-title">Why the correct answer is correct</h3>
    <p class="feedback-paragraph">${escapeHtml(feedback.whyCorrect)}</p>
    <h3 class="feedback-section-title">Why the others are wrong</h3>
    <div>
      ${feedback.whyOthersWrong
        .map(
          (item) => `
            <p class="choice-rationale">
              ${item.isCorrect ? `${item.displayLetter} (correct)` : item.displayLetter}: ${escapeHtml(item.rationale)}
            </p>
          `,
        )
        .join("")}
    </div>
    <h3 class="feedback-section-title">Fast separation</h3>
    <p class="feedback-paragraph">${escapeHtml(feedback.fastSeparation)}</p>
    <h3 class="feedback-section-title">Specific FAR concept this is testing</h3>
    <p class="feedback-paragraph">${escapeHtml(feedback.concept)}</p>
  `;

  feedbackStream.prepend(wrapper);
}

function injectNextButton() {
  const footer = document.createElement("div");
  footer.className = "followup-row";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "next-button";
  button.textContent = "Next question";
  button.addEventListener("click", () => {
    footer.remove();
    loadNextQuestion();
  });

  footer.append(button);
  questionCard.append(footer);
  pendingNextButton = button;
}

function renderScoreboard() {
  const totals = engine.getTotals();

  scoreboard.innerHTML = `
    <div class="score-chip">
      <span class="score-chip-label">Answered</span>
      <span class="score-chip-value">${totals.totalAnswered}</span>
    </div>
    <div class="score-chip">
      <span class="score-chip-label">Accuracy</span>
      <span class="score-chip-value">${totals.accuracy}%</span>
    </div>
    <div class="score-chip">
      <span class="score-chip-label">Correct</span>
      <span class="score-chip-value">${totals.totalCorrect}</span>
    </div>
    <div class="score-chip">
      <span class="score-chip-label">Misses</span>
      <span class="score-chip-value">${totals.totalIncorrect}</span>
    </div>
  `;
}

function renderBucketGrid() {
  const currentBucket = engine.state.currentQuestion?.bucket;

  bucketGrid.innerHTML = engine.getCoverage()
    .map((bucket) => {
      const stats = bucket.stats;
      const classes = [
        "bucket-card",
        bucket.covered ? "complete" : "",
        currentBucket === bucket.id ? "active" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return `
        <article class="${classes}">
          <span class="bucket-number">${bucket.id}</span>
          <h3 class="bucket-title">${bucket.title}</h3>
          <p class="bucket-meta">
            Asked ${stats.asked} • ${stats.correct} right • ${stats.incorrect} miss
          </p>
        </article>
      `;
    })
    .join("");
}

function disableAnswerButtons() {
  answerButtons.forEach((button) => {
    button.disabled = true;
  });
}

function enableAnswerButtons() {
  answerButtons.forEach((button) => {
    button.disabled = false;
  });
}

function createQuestionPresentation(question) {
  const displayLetters = ["A", "B", "C", "D"];
  const correctDisplayLetter = nextCorrectDisplayLetter();
  const remainingDisplayLetters = displayLetters.filter((letter) => letter !== correctDisplayLetter);
  const incorrectCanonicalLetters = shuffle(
    displayLetters.filter((letter) => letter !== question.correctAnswer),
  );
  const displayChoices = {};
  const answerMap = {};
  const reverseAnswerMap = {};

  displayChoices[correctDisplayLetter] = question.choices[question.correctAnswer];
  answerMap[correctDisplayLetter] = question.correctAnswer;
  reverseAnswerMap[question.correctAnswer] = correctDisplayLetter;

  remainingDisplayLetters.forEach((displayLetter, index) => {
    const canonicalLetter = incorrectCanonicalLetters[index];
    displayChoices[displayLetter] = question.choices[canonicalLetter];
    answerMap[displayLetter] = canonicalLetter;
    reverseAnswerMap[canonicalLetter] = displayLetter;
  });

  return {
    displayLetters,
    displayChoices,
    answerMap,
    reverseAnswerMap,
  };
}

function remapFeedbackForDisplay(feedback, presentation) {
  return {
    ...feedback,
    heading:
      feedback.status === "correct"
        ? `Correct — ${presentation.reverseAnswerMap[feedback.correctAnswer]}`
        : feedback.heading,
    whyOthersWrong: feedback.whyOthersWrong
      .map((item) => ({
        ...item,
        displayLetter: presentation.reverseAnswerMap[item.letter],
      }))
      .sort((left, right) => left.displayLetter.localeCompare(right.displayLetter)),
  };
}

function hideFeedback() {
  feedbackPanel.hidden = true;
}

function showFeedback() {
  feedbackPanel.hidden = false;
}

function syncRoute() {
  const route = window.location.hash || LEARN_ROUTES.test;
  const learnActive = route.startsWith("#learn");

  testStage.hidden = learnActive;
  learnStage.hidden = !learnActive;
  sidebar.hidden = learnActive;
  workspace.classList.toggle("learn-active", learnActive);
  testModeButton.classList.toggle("active", !learnActive);
  testModeButton.setAttribute("aria-selected", String(!learnActive));
  learnModeButton.classList.toggle("active", learnActive);
  learnModeButton.setAttribute("aria-selected", String(learnActive));

  if (learnActive) {
    learnMode.handleRoute(route);
  }
}

function navigateTo(route) {
  if (route === LEARN_ROUTES.test) {
    if (window.location.hash) {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
    syncRoute();
    return;
  }

  window.location.hash = route;
}

function isTestModeActive() {
  return !window.location.hash.startsWith("#learn");
}

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function nextCorrectDisplayLetter() {
  if (correctLetterCycle.length === 0) {
    correctLetterCycle = shuffle(["A", "B", "C", "D"]);
  }

  return correctLetterCycle.shift();
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

boot();
