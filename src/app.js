import { createEngine, TOPIC_BUCKETS } from "./engine.js";
import { QUESTION_BANK } from "./question-bank.js";
import { SCENARIO_QUESTION_BANK_200 } from "./scenario-question-bank-200.js";
import { createLearnMode } from "./learn/learn-mode.js";
import { LEARN_ROUTES } from "./learn/learn-types.js";
import { createFarMode } from "./far/far-mode.js";
import { FAR_ROUTES } from "./far/far-engine.js";

const HOME_ROUTE = "/";
const SCENARIO_ROUTE = "/scenario";
const engine = createEngine(SCENARIO_QUESTION_BANK_200);

const appEyebrow = document.querySelector("#app-eyebrow");
const appTitle = document.querySelector("#app-title");
const appSubtitle = document.querySelector("#app-subtitle");
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
const homeStage = document.querySelector("#home-stage");
const testStage = document.querySelector("#test-stage");
const learnStage = document.querySelector("#learn-stage");
const learnRoot = document.querySelector("#learn-root");
const farStage = document.querySelector("#far-stage");
const farRoot = document.querySelector("#far-root");
const testModeButton = document.querySelector("#test-mode-button");
const learnModeButton = document.querySelector("#learn-mode-button");
const farModeButton = document.querySelector("#far-mode-button");
const homeButton = document.querySelector("#home-button");
const roomHomeButtons = [...document.querySelectorAll("[data-home-link]")];
const workspace = document.querySelector(".workspace");
const sidebar = document.querySelector(".sidebar");

const learnMode = createLearnMode({
  root: learnRoot,
  questionBank: QUESTION_BANK,
  onNavigateTest: () => navigateTo(SCENARIO_ROUTE),
});
const farMode = createFarMode({
  root: farRoot,
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
  normalizeLegacyUrl();
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
    navigateTo(SCENARIO_ROUTE);
  });

  learnModeButton.addEventListener("click", () => {
    navigateTo(LEARN_ROUTES.setup);
  });

  farModeButton.addEventListener("click", () => {
    navigateTo(FAR_ROUTES.session);
  });

  homeButton.addEventListener("click", () => {
    navigateTo(HOME_ROUTE);
  });

  roomHomeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      navigateTo(HOME_ROUTE);
    });
  });

  window.addEventListener("popstate", () => {
    syncRoute();
  });

  window.addEventListener("hashchange", () => {
    normalizeLegacyUrl();
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
  clearSelectedAnswer();
  clearFeedback();
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

  updateAnswerButtonLabels();
}

function submitAnswer(letter) {
  try {
    const canonicalLetter = currentPresentation.answerMap[letter];
    const feedback = engine.answerCurrent(canonicalLetter);
    markSelectedAnswer(letter);
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

  clearFeedback();
  feedbackStream.append(wrapper);
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

function markSelectedAnswer(letter) {
  answerButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.answer === letter);
    button.setAttribute("aria-pressed", button.dataset.answer === letter ? "true" : "false");
  });
}

function clearSelectedAnswer() {
  answerButtons.forEach((button) => {
    button.classList.remove("selected");
    button.setAttribute("aria-pressed", "false");
  });
}

function updateAnswerButtonLabels() {
  answerButtons.forEach((button) => {
    const letter = button.dataset.answer;
    const choiceText = currentPresentation?.displayChoices?.[letter];

    if (choiceText) {
      button.setAttribute("aria-label", `${letter}. ${choiceText}`);
    } else {
      button.setAttribute("aria-label", letter);
    }
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

function clearFeedback() {
  feedbackStream.innerHTML = "";
}

function syncRoute() {
  const route = getCurrentRoute();
  const homeActive = route === HOME_ROUTE;
  const testActive = route === SCENARIO_ROUTE;
  const learnActive = route.startsWith("/learn");
  const farActive = route.startsWith("/far");

  homeStage.hidden = !homeActive;
  testStage.hidden = !testActive;
  learnStage.hidden = !learnActive;
  farStage.hidden = !farActive;
  sidebar.hidden = !testActive;
  workspace.classList.toggle("learn-active", !testActive);
  workspace.classList.toggle("room-active", !homeActive);
  homeButton.hidden = homeActive;
  updatePageHeader({ homeActive, testActive, learnActive, farActive });

  if (learnActive) {
    learnMode.handleRoute(route);
  }

  if (farActive) {
    farMode.handleRoute(route);
  }

  document.body.classList.add("is-ready");
}

function navigateTo(route) {
  if (getCurrentRoute() === route && !window.location.hash) {
    syncRoute();
    return;
  }

  history.pushState(null, "", route);
  syncRoute();
}

function isTestModeActive() {
  return getCurrentRoute() === SCENARIO_ROUTE;
}

function getCurrentRoute() {
  if (window.location.hash) {
    return normalizeLegacyHash(window.location.hash);
  }

  const path = window.location.pathname.replace(/\/$/, "") || HOME_ROUTE;

  if (path.endsWith("/index.html")) {
    return HOME_ROUTE;
  }

  if (path === "/learn/setup") {
    return LEARN_ROUTES.setup;
  }

  if (path === "/far/session") {
    return FAR_ROUTES.session;
  }

  return path;
}

function normalizeLegacyUrl() {
  if (!window.location.hash) {
    return;
  }

  const route = normalizeLegacyHash(window.location.hash);
  history.replaceState(null, "", route);
}

function normalizeLegacyHash(hash) {
  const legacyRouteMap = {
    "#home": HOME_ROUTE,
    "#test": SCENARIO_ROUTE,
    "#scenario": SCENARIO_ROUTE,
    "#learn": LEARN_ROUTES.setup,
    "#learn/setup": LEARN_ROUTES.setup,
    "#learn/session": LEARN_ROUTES.session,
    "#learn/summary": LEARN_ROUTES.summary,
    "#far": FAR_ROUTES.session,
    "#far/session": FAR_ROUTES.session,
  };

  return legacyRouteMap[hash] ?? HOME_ROUTE;
}

function updatePageHeader({ homeActive, testActive, learnActive, farActive }) {
  if (testActive) {
    appEyebrow.textContent = "Scenario-Based Testing";
    appTitle.textContent = "CON 3990V Scenario-Based Testing";
    appSubtitle.textContent = "One scenario at a time with bucket rotation and immediate feedback.";
    return;
  }

  if (learnActive) {
    appEyebrow.textContent = "Adaptive Review";
    appTitle.textContent = "CON 3990V Learn";
    appSubtitle.textContent = "Build mastery through repeated exposure and targeted review.";
    return;
  }

  if (farActive) {
    appEyebrow.textContent = "FAR Recognition";
    appTitle.textContent = "CON 3990V FAR Part Testing";
    appSubtitle.textContent = "Practice identifying which FAR part applies to contracting scenarios.";
    return;
  }

  if (homeActive) {
    appEyebrow.textContent = "RFO-first exam engine";
    appTitle.textContent = "CON 3990V Scenario Room";
    appSubtitle.textContent = "Choose a focused room for certification practice.";
  }
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
