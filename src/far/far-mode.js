import { createFarEngine } from "./far-engine.js";
import { FAR_PARTS } from "./far-question-bank.js";

export function createFarMode({ root }) {
  const engine = createFarEngine();
  let currentQuestion = null;

  function handleRoute() {
    if (!currentQuestion) {
      currentQuestion = engine.nextQuestion();
    }
    render();
  }

  function render() {
    const totals = engine.totals();

    root.innerHTML = `
      <section class="far-room">
        <header class="learn-progress-header">
          <div>
            <p class="learn-eyebrow">FAR Parts Testing Room</p>
            <h2>Question ${currentQuestion.questionNumber} (${currentQuestion.marker})</h2>
            <p class="learn-copy">One FAR-part recognition question at a time, rotating across ${FAR_PARTS.length} emphasized parts.</p>
          </div>
          <div class="learn-progress-stats">
            <div class="learn-progress-metrics">
              <span>Answered ${totals.answered}</span>
              <span>Correct ${totals.correct}</span>
              <span>Accuracy ${totals.accuracy}%</span>
            </div>
          </div>
        </header>

        <section class="far-layout">
          <article class="question-panel panel">
            <div class="question-badge-row">
              <span class="question-badge">${escapeHtml(currentQuestion.sourceLabel)}</span>
              <span class="question-badge">Rotation marker only: ${currentQuestion.marker}</span>
            </div>
            <p class="question-stem">${escapeHtml(currentQuestion.stem)}</p>
            <div class="choice-list">
              ${["A", "B", "C", "D"]
                .map(
                  (letter) => `
                    <button class="choice-card far-choice" type="button" data-far-answer="${letter}">
                      <span class="choice-letter">${letter}</span>
                      <span>${escapeHtml(currentQuestion.choices[letter])}</span>
                    </button>
                  `,
                )
                .join("")}
            </div>
          </article>

          <aside class="feedback-panel panel far-feedback-panel">
            <div class="panel-heading">
              <h2>Feedback</h2>
              <p>After you answer, the next question appears immediately and the explanation stays here.</p>
            </div>
            <div class="feedback-stream">
              ${
                engine.state.history.length === 0
                  ? `<article class="feedback-card"><p class="feedback-paragraph">Answer the current question to start the feedback stream.</p></article>`
                  : engine.state.history.map((entry) => renderFeedback(entry.feedback)).join("")
              }
            </div>
          </aside>
        </section>

        <div class="learn-inline-actions">
          <button class="ghost-button" type="button" data-far-action="reset">Reset FAR room</button>
        </div>
      </section>
    `;

    root.querySelectorAll("[data-far-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        submitAnswer(button.dataset.farAnswer);
      });
    });

    root.querySelector('[data-far-action="reset"]').addEventListener("click", () => {
      engine.reset();
      currentQuestion = engine.nextQuestion();
      render();
    });
  }

  function submitAnswer(letter) {
    engine.answerCurrent(letter);
    currentQuestion = engine.nextQuestion();
    render();
  }

  function renderFeedback(feedback) {
    return `
      <article class="feedback-card ${feedback.status}">
        <p class="feedback-kicker ${feedback.status}">${escapeHtml(feedback.heading)}</p>
        <h3 class="feedback-section-title">Correct answer</h3>
        <p class="feedback-paragraph">${escapeHtml(feedback.correctAnswer)}</p>
        <h3 class="feedback-section-title">Why the correct answer is right</h3>
        <p class="feedback-paragraph">${escapeHtml(feedback.whyCorrect)}</p>
        <h3 class="feedback-section-title">Why the other options are wrong</h3>
        ${feedback.whyWrong
          .map(
            (item) => `
              <p class="choice-rationale">
                ${item.letter}${item.isCorrect ? " (correct)" : ""}: ${escapeHtml(item.rationale)}
              </p>
            `,
          )
          .join("")}
        <h3 class="feedback-section-title">Exam-level distinction</h3>
        <p class="feedback-paragraph">${escapeHtml(feedback.distinction)}</p>
        <h3 class="feedback-section-title">Recognition trigger</h3>
        <p class="feedback-paragraph">${escapeHtml(feedback.trigger)}</p>
        <h3 class="feedback-section-title">Specific FAR concept</h3>
        <p class="feedback-paragraph">${escapeHtml(feedback.concept)}</p>
      </article>
    `;
  }

  return {
    handleRoute,
  };
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
