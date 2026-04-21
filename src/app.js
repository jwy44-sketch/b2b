import { createEngine, TOPIC_BUCKETS } from "./engine.js";
import { QUESTION_BANK } from "./question-bank.js";

const engine = createEngine(QUESTION_BANK);

const questionTitle = document.querySelector("#question-title");
const questionSubtitle = document.querySelector("#question-subtitle");
const questionCard = document.querySelector("#question-card");
const feedbackStream = document.querySelector("#feedback-stream");
const bucketGrid = document.querySelector("#bucket-grid");
const scoreboard = document.querySelector("#scoreboard");
const answerButtons = [...document.querySelectorAll(".answer-button")];
const showTopicTracking = document.querySelector("#show-topic-tracking");
const autoNext = document.querySelector("#auto-next");
const resetSessionButton = document.querySelector("#reset-session");

let pendingNextButton = null;

function boot() {
  renderScoreboard();
  renderBucketGrid();
  loadNextQuestion();
  wireEvents();
}

function wireEvents() {
  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      submitAnswer(button.dataset.answer);
    });
  });

  showTopicTracking.addEventListener("change", () => {
    renderCurrentQuestion();
  });

  resetSessionButton.addEventListener("click", () => {
    engine.reset();
    feedbackStream.innerHTML = "";
    pendingNextButton = null;
    enableAnswerButtons();
    renderScoreboard();
    renderBucketGrid();
    loadNextQuestion();
  });

  document.addEventListener("keydown", (event) => {
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
  enableAnswerButtons();
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
      ${["A", "B", "C", "D"]
        .map(
          (letter) => `
            <article class="choice-card">
              <span class="choice-letter">${letter}</span>
              <div>${escapeHtml(question.choices[letter])}</div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function submitAnswer(letter) {
  try {
    const feedback = engine.answerCurrent(letter);
    disableAnswerButtons();
    prependFeedbackCard(engine.state.history[0], feedback);
    renderScoreboard();
    renderBucketGrid();

    if (autoNext.checked) {
      window.setTimeout(() => {
        loadNextQuestion();
      }, 700);
    } else {
      injectNextButton();
    }
  } catch (error) {
    console.error(error);
  }
}

function prependFeedbackCard(entry, feedback) {
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
              ${item.isCorrect ? `${item.letter} (correct)` : item.letter}: ${escapeHtml(item.rationale)}
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

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

boot();
