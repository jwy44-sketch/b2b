import {
  applyLearnAnswer,
  buildLearnQuestion,
  createLearnSession,
  ensureProgressMap,
  getGoalProgress,
  getLearnSummary,
  overrideLearnAnswer,
  registerQuestionShown,
  selectNextItem,
  transformQuestionBankToLearnItems,
} from "./learn-engine.js";
import { createLearnStorage } from "./learn-storage.js";
import {
  LEARN_ANSWER_DIRECTIONS,
  LEARN_DEFAULT_CONFIG,
  LEARN_GOAL_TYPES,
  LEARN_OUTCOMES,
  LEARN_QUESTION_TYPES,
  LEARN_ROUTES,
  LEARN_SET_ID,
  LEARN_USER_ID,
} from "./learn-types.js";

export function createLearnMode({
  root,
  questionBank,
  onNavigateTest,
  navigate = setHashRoute,
}) {
  const items = transformQuestionBankToLearnItems(questionBank);
  const storage = createLearnStorage();
  const state = {
    userId: LEARN_USER_ID,
    setId: LEARN_SET_ID,
    session: null,
    progressMap: new Map(),
    currentFeedback: null,
    pendingAttempt: null,
  };

  function handleRoute(hash) {
    const route = hash || LEARN_ROUTES.setup;

    if (!route.startsWith("#learn")) {
      return;
    }

    hydrateState(route);

    if (route === LEARN_ROUTES.summary && state.session) {
      renderSummary();
      return;
    }

    if (route === LEARN_ROUTES.session) {
      if (!state.session) {
        navigate(LEARN_ROUTES.setup);
        return;
      }

      ensureCurrentQuestion();
      renderSession();
      return;
    }

    renderSetup();
  }

  function hydrateState(route = LEARN_ROUTES.setup) {
    state.session = storage.getActiveSession({
      userId: state.userId,
      setId: state.setId,
    });
    if (!state.session && route === LEARN_ROUTES.summary) {
      state.session = storage.getLatestSession({
        userId: state.userId,
        setId: state.setId,
      });
    }
    state.progressMap = ensureProgressMap(
      items,
      storage.getProgress({ userId: state.userId, setId: state.setId }),
      state.session ??
        createLearnSession({}, {
          userId: state.userId,
          setId: state.setId,
        }),
    );
  }

  function renderSetup() {
    const activeSession = storage.getActiveSession({
      userId: state.userId,
      setId: state.setId,
    });
    const savedSettings = storage.getSettings({
      userId: state.userId,
      setId: state.setId,
    });
    const weakItemCount = [...state.progressMap.values()].filter(
      (progress) => progress.masteryScore < 0.45,
    ).length;

    root.innerHTML = `
      <section class="learn-view">
        <div class="learn-panel-heading">
          <div>
            <p class="learn-eyebrow">Learn Mode</p>
            <h2>Adaptive study setup</h2>
            <p class="learn-copy">Choose a goal, question style, and whether to resume or restart your Learn session.</p>
          </div>
          <button class="ghost-button" type="button" data-learn-action="back-to-test">Back to Test Room</button>
        </div>

        ${
          activeSession
            ? `
              <section class="learn-callout">
                <h3>Resume available</h3>
                <p>You have an active Learn session for this set.</p>
                <div class="learn-inline-actions">
                  <button class="ghost-button" type="button" data-learn-action="resume-session">Resume Learn</button>
                  <button class="ghost-button" type="button" data-learn-action="restart-session-only">Restart session only</button>
                </div>
              </section>
            `
            : ""
        }

        <form id="learn-setup-form" class="learn-form">
          <section class="learn-card-grid">
            <article class="learn-card">
              <h3>Study goal</h3>
              <label class="learn-option">
                <input type="radio" name="goalType" value="${LEARN_GOAL_TYPES.masterAll}" ${
                  savedSettings.goalType === LEARN_GOAL_TYPES.masterAll ? "checked" : ""
                }>
                <span>Master all items</span>
              </label>
              <label class="learn-option">
                <input type="radio" name="goalType" value="${LEARN_GOAL_TYPES.questionCount}" ${
                  savedSettings.goalType === LEARN_GOAL_TYPES.questionCount ? "checked" : ""
                }>
                <span>Answer N questions</span>
              </label>
              <label class="learn-option">
                <input type="radio" name="goalType" value="${LEARN_GOAL_TYPES.masteryTarget}" ${
                  savedSettings.goalType === LEARN_GOAL_TYPES.masteryTarget ? "checked" : ""
                }>
                <span>Reach X% mastery</span>
              </label>
              <label class="learn-option">
                <input type="radio" name="goalType" value="${LEARN_GOAL_TYPES.weakReview}" ${
                  savedSettings.goalType === LEARN_GOAL_TYPES.weakReview ? "checked" : ""
                }>
                <span>Review weak items only</span>
              </label>
              <label class="learn-field">
                <span>Goal value</span>
                <input id="learn-goal-value" name="goalValue" type="number" min="1" step="1" value="${formatGoalValue(savedSettings)}">
              </label>
            </article>

            <article class="learn-card">
              <h3>Question types</h3>
              <label class="learn-option">
                <input type="checkbox" name="questionTypes" value="${LEARN_QUESTION_TYPES.multipleChoice}" ${
                  savedSettings.allowedQuestionTypes.includes(LEARN_QUESTION_TYPES.multipleChoice)
                    ? "checked"
                    : ""
                }>
                <span>Multiple choice</span>
              </label>
              <label class="learn-option">
                <input type="checkbox" name="questionTypes" value="${LEARN_QUESTION_TYPES.typedResponse}" ${
                  savedSettings.allowedQuestionTypes.includes(LEARN_QUESTION_TYPES.typedResponse)
                    ? "checked"
                    : ""
                }>
                <span>Typed response</span>
              </label>

              <h3>Answer direction</h3>
              <label class="learn-option">
                <input type="radio" name="answerDirection" value="${LEARN_ANSWER_DIRECTIONS.forward}" ${
                  savedSettings.answerDirection === LEARN_ANSWER_DIRECTIONS.forward ? "checked" : ""
                }>
                <span>Forward</span>
              </label>
              <label class="learn-option">
                <input type="radio" name="answerDirection" value="${LEARN_ANSWER_DIRECTIONS.reverse}" ${
                  savedSettings.answerDirection === LEARN_ANSWER_DIRECTIONS.reverse ? "checked" : ""
                }>
                <span>Reverse</span>
              </label>
              <label class="learn-option">
                <input type="radio" name="answerDirection" value="${LEARN_ANSWER_DIRECTIONS.mixed}" ${
                  savedSettings.answerDirection === LEARN_ANSWER_DIRECTIONS.mixed ? "checked" : ""
                }>
                <span>Mixed</span>
              </label>
            </article>

            <article class="learn-card">
              <h3>Filters</h3>
              <label class="learn-option">
                <input type="checkbox" name="onlyWeakItems" ${
                  savedSettings.filters.onlyWeakItems ? "checked" : ""
                }>
                <span>Only weak items (${weakItemCount} available)</span>
              </label>
              <label class="learn-option disabled">
                <input type="checkbox" disabled>
                <span>Only starred or flagged items (not available in this set)</span>
              </label>

              <div class="learn-reset-block">
                <button class="ghost-button" type="button" data-learn-action="reset-progress">Reset all Learn progress for this set</button>
              </div>
            </article>
          </section>

          <div class="learn-inline-actions">
            <button class="next-button" type="submit">Start Learn</button>
            <button class="ghost-button" type="button" data-learn-action="restart-session-preserve">Restart current session only</button>
          </div>
        </form>
      </section>
    `;

    root.querySelector("#learn-setup-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const settings = readSetupForm(event.currentTarget);
      startLearnSession({ settings, preserveProgress: true });
    });

    root.querySelectorAll("[data-learn-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        handleAction(event.currentTarget.dataset.learnAction);
      });
    });

    focusFirst(root.querySelector("#learn-setup-form input"));
  }

  function renderSession() {
    const goalProgress = getGoalProgress({
      session: state.session,
      progressMap: state.progressMap,
      items,
    });
    const question = state.session.currentQuestion ?? state.pendingAttempt?.question;
    const showTyped = question.questionType === LEARN_QUESTION_TYPES.typedResponse;
    const feedback = state.currentFeedback;

    root.innerHTML = `
      <section class="learn-view">
        <header class="learn-progress-header">
          <div class="learn-progress-copy">
            <p class="learn-eyebrow">Learn Session</p>
            <h2>One item at a time</h2>
            <p class="learn-copy">${goalProgress.label}</p>
          </div>
          <div class="learn-progress-stats">
            <div class="learn-progress-bar" aria-label="Goal progress">
              <span style="width: ${Math.round(goalProgress.ratio * 100)}%"></span>
            </div>
            <div class="learn-progress-metrics">
              <span>Mastered ${goalProgress.masteredCount}</span>
              <span>Weak ${goalProgress.weakCount}</span>
              <span>Accuracy ${state.session.questionsAnswered === 0 ? 0 : Math.round((state.session.correctCount / state.session.questionsAnswered) * 100)}%</span>
            </div>
          </div>
        </header>

        <article class="learn-question-shell">
          <div class="learn-question-card">
            <div class="learn-question-meta">
              <span class="question-badge">${question.questionType === LEARN_QUESTION_TYPES.multipleChoice ? "Multiple choice" : "Typed response"}</span>
              <span class="question-badge">${question.promptDirection}</span>
            </div>
            <h3>${escapeHtml(question.prompt)}</h3>
            ${question.promptContext ? `<p class="learn-prompt-context">${escapeHtml(question.promptContext)}</p>` : ""}

            <form id="learn-answer-form" class="learn-answer-form">
              ${
                showTyped
                  ? `
                    <label class="learn-field">
                      <span>Your answer</span>
                      <input id="learn-typed-answer" name="typedAnswer" type="text" autocomplete="off" ${
                        feedback ? "disabled" : ""
                      }>
                    </label>
                  `
                  : `
                    <div class="learn-option-list" role="radiogroup" aria-label="Answer choices">
                      ${question.options
                        .map(
                          (option) => `
                            <label class="learn-choice">
                              <input type="radio" name="selectedOption" value="${escapeHtml(option.id)}" ${
                                feedback ? "disabled" : ""
                              }>
                              <span>${escapeHtml(option.text)}</span>
                            </label>
                          `,
                        )
                        .join("")}
                    </div>
                  `
              }

              <div class="learn-inline-actions">
                <button class="next-button" type="submit" ${feedback ? "disabled" : ""}>Submit</button>
                <button class="ghost-button" type="button" data-learn-action="dont-know" ${
                  feedback ? "disabled" : ""
                }>I don’t know</button>
                <button class="ghost-button" type="button" data-learn-action="exit-session">Exit session</button>
              </div>
            </form>
          </div>

          <aside class="learn-feedback-panel ${feedback ? "visible" : ""}">
            ${
              feedback
                ? `
                  <p class="feedback-kicker ${feedback.status === "correct" ? "correct" : feedback.status === "dont_know" ? "incorrect" : "incorrect"}">
                    ${feedback.status === "correct" ? "Correct" : feedback.status === "dont_know" ? "I don’t know" : "Incorrect"}
                  </p>
                  <h3>Correct answer</h3>
                  <p>${escapeHtml(feedback.correctAnswer)}</p>
                  ${
                    feedback.explanation
                      ? `<h3>Explanation</h3><p>${escapeHtml(feedback.explanation)}</p>`
                      : ""
                  }
                  <h3>Mastery</h3>
                  <p>${escapeHtml(feedback.masteryMessage)}</p>
                  <div class="learn-inline-actions">
                    ${
                      feedback.canOverride
                        ? `<button class="ghost-button" type="button" data-learn-action="override-correct">Override as correct</button>`
                        : ""
                    }
                    <button class="next-button" type="button" data-learn-action="next-question">Next question</button>
                  </div>
                `
                : `
                  <h3>Feedback</h3>
                  <p>Submit your answer to see immediate feedback.</p>
                `
            }
          </aside>
        </article>
      </section>
    `;

    root.querySelector("#learn-answer-form").addEventListener("submit", (event) => {
      event.preventDefault();
      submitLearnAnswer();
    });

    root.querySelectorAll("[data-learn-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        handleAction(event.currentTarget.dataset.learnAction);
      });
    });

    focusFirst(
      showTyped
        ? root.querySelector("#learn-typed-answer")
        : root.querySelector('input[name="selectedOption"]'),
    );
  }

  function renderSummary() {
    const summary = getLearnSummary({
      session: state.session,
      progressMap: state.progressMap,
      items,
    });

    root.innerHTML = `
      <section class="learn-view">
        <div class="learn-panel-heading">
          <div>
            <p class="learn-eyebrow">Session Summary</p>
            <h2>Learn round complete</h2>
            <p class="learn-copy">Your Learn session summary is ready.</p>
          </div>
        </div>

        <section class="learn-card-grid summary">
          <article class="learn-card">
            <h3>Results</h3>
            <p>Questions answered: ${summary.questionsAnswered}</p>
            <p>Correct: ${summary.correctCount}</p>
            <p>Incorrect: ${summary.incorrectCount}</p>
            <p>Don’t know: ${summary.dontKnowCount}</p>
            <p>Session accuracy: ${summary.accuracy}%</p>
          </article>
          <article class="learn-card">
            <h3>Mastery</h3>
            <p>Mastered items: ${summary.masteredItemsCount}</p>
            <p>Weak items remaining: ${summary.weakItemsRemaining}</p>
            <p>Average mastery: ${summary.averageMastery}%</p>
          </article>
        </section>

        <div class="learn-inline-actions">
          <button class="next-button" type="button" data-learn-action="continue-learn">Continue Learn</button>
          <button class="ghost-button" type="button" data-learn-action="weak-review">Review weak items only</button>
          <button class="ghost-button" type="button" data-learn-action="restart-session-preserve">Restart Learn</button>
          <button class="ghost-button" type="button" data-learn-action="back-to-test">Switch to Test Room</button>
        </div>
      </section>
    `;

    root.querySelectorAll("[data-learn-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        handleAction(event.currentTarget.dataset.learnAction);
      });
    });

    focusFirst(root.querySelector('[data-learn-action="continue-learn"]'));
  }

  function handleAction(action) {
    if (action === "back-to-test") {
      onNavigateTest();
      return;
    }

    if (action === "resume-session") {
      hydrateState();
      ensureCurrentQuestion();
      state.currentFeedback = null;
      navigate(LEARN_ROUTES.session);
      return;
    }

    if (action === "restart-session-only" || action === "restart-session-preserve") {
      startLearnSession({
        settings:
          state.session?.lastUsedSettings ??
          storage.getSettings({ userId: state.userId, setId: state.setId }),
        preserveProgress: true,
      });
      return;
    }

    if (action === "reset-progress") {
      storage.resetProgress({ userId: state.userId, setId: state.setId });
      hydrateState();
      state.currentFeedback = null;
      renderSetup();
      return;
    }

    if (action === "dont-know") {
      submitLearnAnswer({ dontKnow: true });
      return;
    }

    if (action === "next-question") {
      state.currentFeedback = null;
      state.pendingAttempt = null;
      ensureCurrentQuestion(true);
      navigate(LEARN_ROUTES.session);
      return;
    }

    if (action === "override-correct") {
      if (!state.pendingAttempt) {
        return;
      }

      const result = overrideLearnAnswer({
        session: state.session,
        progressMap: state.progressMap,
        question: state.pendingAttempt.question,
        originalAnswer: state.pendingAttempt.answerValue,
        previousAttempt: state.pendingAttempt.attempt,
        items,
      });
      finalizeLearnUpdate(result, {
        replaceAttempt: true,
      });
      return;
    }

    if (action === "exit-session") {
      storage.saveSession(state.session);
      navigate(LEARN_ROUTES.setup);
      return;
    }

    if (action === "continue-learn") {
      if (state.session?.status === "completed") {
        startLearnSession({
          settings: state.session.lastUsedSettings,
          preserveProgress: true,
        });
      } else {
        ensureCurrentQuestion(true);
        navigate(LEARN_ROUTES.session);
      }
      return;
    }

    if (action === "weak-review") {
      startLearnSession({
        settings: {
          ...LEARN_DEFAULT_CONFIG,
          goalType: LEARN_GOAL_TYPES.weakReview,
          allowedQuestionTypes:
            state.session?.lastUsedSettings.allowedQuestionTypes ??
            LEARN_DEFAULT_CONFIG.allowedQuestionTypes,
          answerDirection:
            state.session?.lastUsedSettings.answerDirection ??
            LEARN_DEFAULT_CONFIG.answerDirection,
          filters: {
            onlyWeakItems: true,
            onlyStarredItems: false,
          },
        },
        preserveProgress: true,
      });
    }
  }

  function startLearnSession({ settings, preserveProgress }) {
    if (!preserveProgress) {
      storage.resetProgress({ userId: state.userId, setId: state.setId });
    } else {
      storage.restartSessionOnly({ userId: state.userId, setId: state.setId });
    }

    const session = createLearnSession(settings, {
      userId: state.userId,
      setId: state.setId,
    });
    const progressMap = ensureProgressMap(
      items,
      preserveProgress
        ? storage.getProgress({ userId: state.userId, setId: state.setId })
        : [],
      session,
    );

    state.session = session;
    state.progressMap = progressMap;
    state.currentFeedback = null;
    state.pendingAttempt = null;

    storage.saveSettings({
      userId: state.userId,
      setId: state.setId,
      settings,
    });

    persistSessionState();
    ensureCurrentQuestion(true);
    navigate(LEARN_ROUTES.session);
  }

  function ensureCurrentQuestion(forceNew = false) {
    if (state.session.currentQuestion && !forceNew) {
      return;
    }

    state.currentFeedback = null;
    state.pendingAttempt = null;

    const item = selectNextItem({
      items,
      progressMap: state.progressMap,
      session: state.session,
    });

    if (!item) {
      state.session.status = "completed";
      persistSessionState();
      navigate(LEARN_ROUTES.summary);
      return;
    }

    const question = buildLearnQuestion({
      item,
      items,
      progressMap: state.progressMap,
      session: state.session,
    });
    const nextState = registerQuestionShown({
      session: state.session,
      progressMap: state.progressMap,
      question,
    });

    state.session = nextState.session;
    state.progressMap = nextState.progressMap;
    persistSessionState();
  }

  function submitLearnAnswer({ dontKnow = false } = {}) {
    const question = state.session.currentQuestion;

    if (!question) {
      return;
    }

    let answerValue = "";

    if (!dontKnow) {
      if (question.questionType === LEARN_QUESTION_TYPES.typedResponse) {
        answerValue = root.querySelector("#learn-typed-answer")?.value ?? "";
      } else {
        answerValue = root.querySelector('input[name="selectedOption"]:checked')?.value ?? "";
      }
    }

    if (!dontKnow && !answerValue) {
      return;
    }

    const result = applyLearnAnswer({
      session: state.session,
      progressMap: state.progressMap,
      question,
      answer: dontKnow
        ? { kind: LEARN_OUTCOMES.dontKnow }
        : { kind: "answer", value: answerValue },
      items,
    });

    finalizeLearnUpdate(result, {
      submittedQuestion: question,
      answerValue,
    });
  }

  function finalizeLearnUpdate(result, options = {}) {
    state.session = result.session;
    state.progressMap = result.progressMap;
    state.currentFeedback = {
      ...result.feedback,
      canOverride:
        !options.replaceAttempt &&
        result.feedback.status === "incorrect" &&
        options.submittedQuestion?.questionType === LEARN_QUESTION_TYPES.typedResponse,
    };
    state.pendingAttempt = {
      question: options.submittedQuestion ?? state.pendingAttempt?.question ?? null,
      answerValue: options.replaceAttempt ? null : options.answerValue ?? result.attempt.userAnswer,
      attempt: result.attempt,
    };
    if (options.replaceAttempt) {
      state.pendingAttempt = null;
    }

    persistSessionState({ attempts: [result.attempt] });

    if (result.completed) {
      navigate(LEARN_ROUTES.summary);
      return;
    }

    renderSession();
  }

  function persistSessionState({ attempts = [] } = {}) {
    storage.saveSession(state.session);
    storage.saveProgress([...state.progressMap.values()]);
    storage.saveAttempts(attempts);
  }

  function readSetupForm(form) {
    const formData = new FormData(form);
    const questionTypes = formData.getAll("questionTypes");
    return {
      goalType: formData.get("goalType") || LEARN_DEFAULT_CONFIG.goalType,
      goalValue: parseGoalValue(formData.get("goalType"), formData.get("goalValue")),
      allowedQuestionTypes:
        questionTypes.length > 0
          ? questionTypes
          : LEARN_DEFAULT_CONFIG.allowedQuestionTypes,
      answerDirection: formData.get("answerDirection") || LEARN_DEFAULT_CONFIG.answerDirection,
      filters: {
        onlyWeakItems: formData.get("onlyWeakItems") === "on",
        onlyStarredItems: false,
      },
    };
  }

  return {
    handleRoute,
  };
}

function parseGoalValue(goalType, rawValue) {
  const numeric = Number(rawValue);

  if (goalType === LEARN_GOAL_TYPES.questionCount) {
    return numeric > 0 ? numeric : 20;
  }

  if (goalType === LEARN_GOAL_TYPES.masteryTarget) {
    return numeric > 0 ? Math.min(numeric / 100, 1) : 0.8;
  }

  return null;
}

function formatGoalValue(settings) {
  if (settings.goalType === LEARN_GOAL_TYPES.masteryTarget) {
    return Math.round((settings.goalValue ?? 0.8) * 100);
  }

  if (settings.goalType === LEARN_GOAL_TYPES.questionCount) {
    return settings.goalValue ?? 20;
  }

  return "";
}

function focusFirst(node) {
  if (!node) {
    return;
  }

  requestAnimationFrame(() => {
    node.focus();
  });
}

function setHashRoute(route) {
  window.location.hash = route;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
