import {
  LEARN_ANSWER_DIRECTIONS,
  LEARN_BUCKETS,
  LEARN_DEFAULT_CONFIG,
  LEARN_GOAL_TYPES,
  LEARN_MASTERY_DELTAS,
  LEARN_OUTCOMES,
  LEARN_PRIORITY_WEIGHTS,
  LEARN_QUESTION_TYPES,
  LEARN_SET_ID,
  LEARN_STATUS,
  LEARN_USER_ID,
} from "./learn-types.js";

const TOP_CANDIDATE_COUNT = 5;

export function transformQuestionBankToLearnItems(questionBank) {
  return questionBank.map((question) => ({
    itemId: String(question.id),
    prompt: question.stem,
    canonicalAnswer: question.choices[question.correctAnswer],
    alternateAnswers: [question.correctAnswer, question.choices[question.correctAnswer]],
    explanation: question.teachingNote || question.concept || "",
    concept: question.concept || "",
    metadata: {
      bucket: question.bucket,
      source: question.source,
      difficulty: question.difficulty ?? 2,
      starred: Boolean(question.metadata?.starred),
      flagged: Boolean(question.metadata?.flagged),
    },
    choices: question.choices,
    correctAnswerKey: question.correctAnswer,
  }));
}

export function createLearnSession(config = {}, options = {}) {
  const now = options.now ?? Date.now();
  const mergedConfig = {
    ...LEARN_DEFAULT_CONFIG,
    ...config,
    filters: {
      ...LEARN_DEFAULT_CONFIG.filters,
      ...(config.filters ?? {}),
    },
  };

  return {
    id: createId("learn-session", now),
    userId: options.userId ?? LEARN_USER_ID,
    setId: options.setId ?? LEARN_SET_ID,
    status: LEARN_STATUS.active,
    goalType: mergedConfig.goalType,
    goalValue: mergedConfig.goalValue,
    allowedQuestionTypes: [...mergedConfig.allowedQuestionTypes],
    answerDirection: mergedConfig.answerDirection,
    filters: { ...mergedConfig.filters },
    questionsAnswered: 0,
    correctCount: 0,
    incorrectCount: 0,
    dontKnowCount: 0,
    startedAt: now,
    updatedAt: now,
    completedAt: null,
    recentItemIds: [],
    retryQueue: [],
    currentQuestion: null,
    lastUsedSettings: mergedConfig,
  };
}

export function createEmptyItemProgress({ userId = LEARN_USER_ID, setId = LEARN_SET_ID, itemId }) {
  return {
    id: createId(`learn-progress-${itemId}`),
    userId,
    setId,
    itemId,
    masteryScore: 0,
    masteryBucket: LEARN_BUCKETS.unseen,
    timesSeen: 0,
    timesCorrect: 0,
    timesIncorrect: 0,
    timesDontKnow: 0,
    consecutiveCorrect: 0,
    lastSeenAt: null,
    lastAnsweredAt: null,
    lastOutcome: null,
    questionTypeHistory: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function ensureProgressMap(items, persistedProgress = [], session) {
  const map = new Map();

  persistedProgress.forEach((progress) => {
    map.set(String(progress.itemId), normalizeProgress(progress));
  });

  items.forEach((item) => {
    if (!map.has(String(item.itemId))) {
      map.set(
        String(item.itemId),
        createEmptyItemProgress({
          userId: session.userId,
          setId: session.setId,
          itemId: String(item.itemId),
        }),
      );
    }
  });

  return map;
}

export function normalizeProgress(progress) {
  const normalized = {
    ...progress,
    masteryScore: clamp(progress.masteryScore ?? 0, 0, 1),
  };
  normalized.masteryBucket = getMasteryBucket(normalized);
  normalized.questionTypeHistory = [...(progress.questionTypeHistory ?? [])];
  return normalized;
}

export function getMasteryBucket(progress) {
  const score = typeof progress === "number" ? progress : progress.masteryScore ?? 0;

  if (score <= 0.09) {
    return LEARN_BUCKETS.unseen;
  }
  if (score <= 0.24) {
    return LEARN_BUCKETS.struggling;
  }
  if (score <= 0.44) {
    return LEARN_BUCKETS.weak;
  }
  if (score <= 0.69) {
    return LEARN_BUCKETS.improving;
  }
  if (score <= 0.89) {
    return LEARN_BUCKETS.nearlyMastered;
  }

  if (typeof progress === "object" && !isProgressStableMastered(progress)) {
    return LEARN_BUCKETS.nearlyMastered;
  }

  return LEARN_BUCKETS.mastered;
}

export function isProgressStableMastered(progress) {
  return (
    progress.masteryScore >= 0.9 &&
    progress.consecutiveCorrect >= 2 &&
    progress.timesCorrect >= 3
  );
}

export function normalizeTypedAnswer(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/['’`-]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getEligibleItems(items, progressMap, session) {
  return items.filter((item) => {
    const progress = progressMap.get(String(item.itemId));

    if (session.filters.onlyStarredItems && !item.metadata?.starred) {
      return false;
    }

    if (session.goalType === LEARN_GOAL_TYPES.weakReview || session.filters.onlyWeakItems) {
      return progress.masteryScore < 0.45;
    }

    return true;
  });
}

export function chooseQuestionType(progress, allowedQuestionTypes, random = Math.random) {
  const allowed = allowedQuestionTypes.filter((type) =>
    [LEARN_QUESTION_TYPES.multipleChoice, LEARN_QUESTION_TYPES.typedResponse].includes(type),
  );

  if (allowed.length === 0) {
    return LEARN_QUESTION_TYPES.multipleChoice;
  }

  if (allowed.length === 1) {
    return allowed[0];
  }

  const score = progress.masteryScore ?? 0;
  let typedProbability = 0.2;

  if (score >= 0.25 && score < 0.6) {
    typedProbability = 0.5;
  } else if (score >= 0.6) {
    typedProbability = 0.75;
  }

  return random() < typedProbability
    ? LEARN_QUESTION_TYPES.typedResponse
    : LEARN_QUESTION_TYPES.multipleChoice;
}

export function choosePromptDirection(session, questionType, random = Math.random) {
  if (questionType === LEARN_QUESTION_TYPES.typedResponse) {
    return LEARN_ANSWER_DIRECTIONS.forward;
  }

  if (session.answerDirection === LEARN_ANSWER_DIRECTIONS.mixed) {
    return random() < 0.5
      ? LEARN_ANSWER_DIRECTIONS.forward
      : LEARN_ANSWER_DIRECTIONS.reverse;
  }

  return session.answerDirection;
}

export function computePriorityScore({
  progress,
  session,
  itemId,
  currentQuestionNumber,
  weights = LEARN_PRIORITY_WEIGHTS,
}) {
  const recentIncorrectFlag = progress.lastOutcome === LEARN_OUTCOMES.incorrect ? 1 : 0;
  const recentDontKnowFlag = progress.lastOutcome === LEARN_OUTCOMES.dontKnow ? 1 : 0;
  const isUnseenFlag = progress.timesSeen === 0 ? 1 : 0;
  const questionsSinceSeen =
    progress.lastSeenQuestionNumber == null
      ? 10
      : Math.max(currentQuestionNumber - progress.lastSeenQuestionNumber, 0);
  const recencyValue = clamp(questionsSinceSeen / 10, 0, 1);
  const needsReinforcementFlag =
    progress.timesCorrect > 0 && progress.consecutiveCorrect < 2 && progress.masteryScore < 0.9
      ? 1
      : 0;
  const retryEntry = session.retryQueue.find((entry) => String(entry.itemId) === String(itemId));
  const retryBoost =
    retryEntry && currentQuestionNumber >= retryEntry.dueAt ? retryEntry.priorityBoost : 0;

  return (
    weights.recentIncorrectWeight * recentIncorrectFlag +
    weights.dontKnowWeight * recentDontKnowFlag +
    weights.unseenWeight * isUnseenFlag +
    weights.lowMasteryWeight * (1 - progress.masteryScore) +
    weights.recencyWeight * recencyValue +
    weights.streakBreakWeight * needsReinforcementFlag +
    weights.retryBoostWeight * retryBoost -
    weights.masteredPenaltyWeight * progress.masteryScore
  );
}

export function selectNextItem({ items, progressMap, session, random = Math.random }) {
  const eligibleItems = getEligibleItems(items, progressMap, session);

  if (eligibleItems.length === 0) {
    return null;
  }

  const filteredItems =
    eligibleItems.length > 1
      ? eligibleItems.filter((item) => String(item.itemId) !== String(session.recentItemIds.at(-1)))
      : eligibleItems;
  const pool = filteredItems.length > 0 ? filteredItems : eligibleItems;

  const ranked = pool
    .map((item) => ({
      item,
      score: computePriorityScore({
        progress: progressMap.get(String(item.itemId)),
        session,
        itemId: item.itemId,
        currentQuestionNumber: session.questionsAnswered,
      }),
    }))
    .sort((left, right) => right.score - left.score);

  return weightedPick(ranked.slice(0, TOP_CANDIDATE_COUNT), random)?.item ?? ranked[0].item;
}

export function buildLearnQuestion({ item, items, progressMap, session, random = Math.random }) {
  const progress = progressMap.get(String(item.itemId));
  const questionType = chooseQuestionType(progress, session.allowedQuestionTypes, random);
  const promptDirection = choosePromptDirection(session, questionType, random);
  const shownAt = Date.now();

  if (promptDirection === LEARN_ANSWER_DIRECTIONS.reverse) {
    return buildReverseQuestion({
      item,
      items,
      questionType,
      shownAt,
      random,
    });
  }

  return buildForwardQuestion({
    item,
    questionType,
    shownAt,
    random,
  });
}

function buildForwardQuestion({ item, questionType, shownAt, random }) {
  if (questionType === LEARN_QUESTION_TYPES.typedResponse) {
    return {
      itemId: String(item.itemId),
      questionType,
      promptDirection: LEARN_ANSWER_DIRECTIONS.forward,
      prompt: item.prompt,
      promptContext: null,
      correctAnswer: item.canonicalAnswer,
      acceptedAnswers: buildAcceptedAnswers(item),
      options: [],
      shownAt,
      explanation: item.explanation,
      concept: item.concept,
    };
  }

  const options = shuffle(
    Object.entries(item.choices).map(([choiceKey, text]) => ({
      id: choiceKey,
      text,
      isCorrect: choiceKey === item.correctAnswerKey,
    })),
    random,
  );

  return {
    itemId: String(item.itemId),
    questionType,
    promptDirection: LEARN_ANSWER_DIRECTIONS.forward,
    prompt: item.prompt,
    promptContext: null,
    correctAnswer: item.canonicalAnswer,
    acceptedAnswers: buildAcceptedAnswers(item),
    options,
    shownAt,
    explanation: item.explanation,
    concept: item.concept,
  };
}

function buildReverseQuestion({ item, items, shownAt, random }) {
  const distractors = shuffle(
    items.filter((candidate) => String(candidate.itemId) !== String(item.itemId)),
    random,
  ).slice(0, 3);
  const options = shuffle(
    [
      { id: String(item.itemId), text: item.prompt, isCorrect: true },
      ...distractors.map((candidate) => ({
        id: String(candidate.itemId),
        text: candidate.prompt,
        isCorrect: false,
      })),
    ],
    random,
  );

  return {
    itemId: String(item.itemId),
    questionType: LEARN_QUESTION_TYPES.multipleChoice,
    promptDirection: LEARN_ANSWER_DIRECTIONS.reverse,
    prompt: "Which scenario best matches this answer?",
    promptContext: item.canonicalAnswer,
    correctAnswer: item.prompt,
    acceptedAnswers: [normalizeTypedAnswer(item.prompt)],
    options,
    shownAt,
    explanation: item.explanation,
    concept: item.concept,
  };
}

export function registerQuestionShown({ session, progressMap, question, now = Date.now() }) {
  const nextSession = {
    ...session,
    currentQuestion: {
      ...question,
      shownAt: question.shownAt ?? now,
    },
    updatedAt: now,
    recentItemIds: [...session.recentItemIds, String(question.itemId)].slice(-15),
  };
  const nextProgressMap = cloneProgressMap(progressMap);
  const progress = { ...nextProgressMap.get(String(question.itemId)) };
  progress.timesSeen += 1;
  progress.lastSeenAt = now;
  progress.lastSeenQuestionNumber = session.questionsAnswered;
  progress.updatedAt = now;
  nextProgressMap.set(String(question.itemId), progress);

  return {
    session: nextSession,
    progressMap: nextProgressMap,
  };
}

export function evaluateLearnAnswer({ question, answer, override = false }) {
  if (override) {
    return {
      outcome: LEARN_OUTCOMES.overrideCorrect,
      isCorrect: true,
      normalizedUserAnswer: normalizeTypedAnswer(answer),
    };
  }

  if (answer?.kind === LEARN_OUTCOMES.dontKnow) {
    return {
      outcome: LEARN_OUTCOMES.dontKnow,
      isCorrect: false,
      normalizedUserAnswer: "",
    };
  }

  if (question.questionType === LEARN_QUESTION_TYPES.multipleChoice) {
    const selectedOptionId = String(answer.value);
    const correctOption = question.options.find((option) => option.isCorrect);
    return {
      outcome:
        selectedOptionId === String(correctOption.id)
          ? LEARN_OUTCOMES.correct
          : LEARN_OUTCOMES.incorrect,
      isCorrect: selectedOptionId === String(correctOption.id),
      normalizedUserAnswer: selectedOptionId,
    };
  }

  const normalized = normalizeTypedAnswer(answer.value);
  const acceptedAnswers = question.acceptedAnswers.map((item) => normalizeTypedAnswer(item));
  const isCorrect = acceptedAnswers.includes(normalized);

  return {
    outcome: isCorrect ? LEARN_OUTCOMES.correct : LEARN_OUTCOMES.incorrect,
    isCorrect,
    normalizedUserAnswer: normalized,
  };
}

export function applyLearnAnswer({
  session,
  progressMap,
  question,
  answer,
  items = [],
  now = Date.now(),
}) {
  const evaluation = evaluateLearnAnswer({ question, answer });
  return applyOutcome({
    session,
    progressMap,
    question,
    answer,
    items,
    evaluation,
    now,
  });
}

export function overrideLearnAnswer({
  session,
  progressMap,
  question,
  originalAnswer,
  previousAttempt,
  items = [],
  now = Date.now(),
}) {
  const previousOutcome = previousAttempt?.outcome ?? LEARN_OUTCOMES.incorrect;
  const evaluation = evaluateLearnAnswer({
    question,
    answer: { value: originalAnswer, kind: "answer" },
    override: true,
  });

  const nextSession = {
    ...session,
    correctCount: session.correctCount + 1,
    incorrectCount:
      session.incorrectCount - (previousOutcome === LEARN_OUTCOMES.incorrect ? 1 : 0),
    dontKnowCount:
      session.dontKnowCount - (previousOutcome === LEARN_OUTCOMES.dontKnow ? 1 : 0),
    updatedAt: now,
  };
  const nextProgressMap = cloneProgressMap(progressMap);
  const progress = { ...nextProgressMap.get(String(question.itemId)) };
  const scoreDelta =
    LEARN_MASTERY_DELTAS[question.questionType][LEARN_OUTCOMES.overrideCorrect] -
    LEARN_MASTERY_DELTAS[question.questionType][previousOutcome];

  progress.masteryScore = clamp(progress.masteryScore + scoreDelta, 0, 1);
  progress.lastAnsweredAt = now;
  progress.lastOutcome = LEARN_OUTCOMES.overrideCorrect;
  progress.updatedAt = now;
  progress.timesCorrect += 1;
  progress.consecutiveCorrect = Math.max(progress.consecutiveCorrect, 1);
  if (previousOutcome === LEARN_OUTCOMES.incorrect) {
    progress.timesIncorrect = Math.max(progress.timesIncorrect - 1, 0);
  }
  if (previousOutcome === LEARN_OUTCOMES.dontKnow) {
    progress.timesDontKnow = Math.max(progress.timesDontKnow - 1, 0);
  }
  progress.masteryBucket = getMasteryBucket(progress);
  nextProgressMap.set(String(question.itemId), progress);
  updateRetryQueue(nextSession, progress, question.itemId, LEARN_OUTCOMES.overrideCorrect);

  const attempt = createAttemptLog({
    session: nextSession,
    question,
    answer: { value: originalAnswer, kind: "override" },
    evaluation,
    scoreDelta,
    now,
  });

  const completed = shouldCompleteSession({
    session: nextSession,
    progressMap: nextProgressMap,
    eligibleItemIds: getEligibleItemIds({
      items,
      progressMap: nextProgressMap,
      session: nextSession,
    }),
  });

  if (completed) {
    nextSession.status = LEARN_STATUS.completed;
    nextSession.completedAt = now;
  }

  return {
    session: nextSession,
    progressMap: nextProgressMap,
    attempt,
    feedback: buildLearnFeedback({ question, progress, evaluation }),
    completed,
  };
}

function applyOutcome({ session, progressMap, question, answer, items, evaluation, now }) {
  const nextSession = {
    ...session,
    questionsAnswered: session.questionsAnswered + 1,
    correctCount:
      session.correctCount +
      (evaluation.outcome === LEARN_OUTCOMES.correct ||
      evaluation.outcome === LEARN_OUTCOMES.overrideCorrect
        ? 1
        : 0),
    incorrectCount:
      session.incorrectCount +
      (evaluation.outcome === LEARN_OUTCOMES.incorrect ? 1 : 0),
    dontKnowCount:
      session.dontKnowCount + (evaluation.outcome === LEARN_OUTCOMES.dontKnow ? 1 : 0),
    updatedAt: now,
    currentQuestion: null,
  };
  const nextProgressMap = cloneProgressMap(progressMap);
  const progress = { ...nextProgressMap.get(String(question.itemId)) };
  const scoreDelta = LEARN_MASTERY_DELTAS[question.questionType][evaluation.outcome];

  progress.masteryScore = clamp(progress.masteryScore + scoreDelta, 0, 1);
  progress.lastAnsweredAt = now;
  progress.lastOutcome = evaluation.outcome;
  progress.questionTypeHistory = [...progress.questionTypeHistory, question.questionType].slice(-20);
  progress.updatedAt = now;

  if (evaluation.outcome === LEARN_OUTCOMES.correct || evaluation.outcome === LEARN_OUTCOMES.overrideCorrect) {
    progress.timesCorrect += 1;
    progress.consecutiveCorrect += 1;
  } else {
    progress.consecutiveCorrect = 0;
    if (evaluation.outcome === LEARN_OUTCOMES.dontKnow) {
      progress.timesDontKnow += 1;
    } else {
      progress.timesIncorrect += 1;
    }
  }

  progress.masteryBucket = getMasteryBucket(progress);
  nextProgressMap.set(String(question.itemId), progress);
  updateRetryQueue(nextSession, progress, question.itemId, evaluation.outcome);

  const attempt = createAttemptLog({
    session: nextSession,
    question,
    answer,
    evaluation,
    scoreDelta,
    now,
  });

  const completed = shouldCompleteSession({
    session: nextSession,
    progressMap: nextProgressMap,
    eligibleItemIds: getEligibleItemIds({
      items,
      progressMap: nextProgressMap,
      session: nextSession,
    }),
  });

  if (completed) {
    nextSession.status = LEARN_STATUS.completed;
    nextSession.completedAt = now;
  }

  return {
    session: nextSession,
    progressMap: nextProgressMap,
    attempt,
    feedback: buildLearnFeedback({ question, progress, evaluation }),
    completed,
  };
}

function createAttemptLog({ session, question, answer, evaluation, scoreDelta, now }) {
  return {
    id: createId("learn-attempt", now),
    sessionId: session.id,
    userId: session.userId,
    setId: session.setId,
    itemId: question.itemId,
    questionType: question.questionType,
    promptDirection: question.promptDirection,
    userAnswer: answer?.value ?? null,
    normalizedUserAnswer: evaluation.normalizedUserAnswer,
    correctAnswerSnapshot: question.correctAnswer,
    outcome: evaluation.outcome,
    scoreDelta,
    shownAt: question.shownAt,
    answeredAt: now,
  };
}

export function getGoalProgress({ session, progressMap, items }) {
  const eligibleItems = getEligibleItems(items, progressMap, session);
  const masteredCount = eligibleItems.filter((item) => {
    const progress = progressMap.get(String(item.itemId));
    return isProgressStableMastered(progress);
  }).length;
  const weakCount = eligibleItems.filter((item) => {
    const progress = progressMap.get(String(item.itemId));
    return progress.masteryScore < 0.45;
  }).length;
  const nearlyCount = eligibleItems.filter((item) => {
    const progress = progressMap.get(String(item.itemId));
    return progress.masteryScore >= 0.7;
  }).length;
  const averageMastery =
    eligibleItems.reduce(
      (sum, item) => sum + progressMap.get(String(item.itemId)).masteryScore,
      0,
    ) / Math.max(eligibleItems.length, 1);

  let ratio = 0;
  let label = "";

  switch (session.goalType) {
    case LEARN_GOAL_TYPES.questionCount:
      ratio = session.questionsAnswered / Math.max(Number(session.goalValue) || 1, 1);
      label = `${session.questionsAnswered} / ${Number(session.goalValue) || 0} answered`;
      break;
    case LEARN_GOAL_TYPES.masteryTarget:
      ratio = averageMastery / Math.max(Number(session.goalValue) || 0.8, 0.01);
      label = `${Math.round(averageMastery * 100)}% / ${Math.round((Number(session.goalValue) || 0.8) * 100)}% mastery`;
      break;
    case LEARN_GOAL_TYPES.weakReview:
      ratio = eligibleItems.length === 0 ? 1 : (eligibleItems.length - weakCount) / eligibleItems.length;
      label = `${Math.max(eligibleItems.length - weakCount, 0)} cleared • ${weakCount} weak left`;
      break;
    case LEARN_GOAL_TYPES.masterAll:
    default:
      ratio = nearlyCount / Math.max(eligibleItems.length, 1);
      label = `${nearlyCount} / ${eligibleItems.length} nearly mastered`;
      break;
  }

  return {
    ratio: clamp(ratio, 0, 1),
    label,
    masteredCount,
    weakCount,
    averageMastery,
    eligibleCount: eligibleItems.length,
  };
}

export function shouldCompleteSession({ session, progressMap, eligibleItemIds }) {
  const eligibleProgress = eligibleItemIds.map((itemId) => progressMap.get(String(itemId)));

  switch (session.goalType) {
    case LEARN_GOAL_TYPES.questionCount:
      return session.questionsAnswered >= Number(session.goalValue || 0);
    case LEARN_GOAL_TYPES.masteryTarget: {
      const average =
        eligibleProgress.reduce((sum, progress) => sum + progress.masteryScore, 0) /
        Math.max(eligibleProgress.length, 1);
      return average >= Number(session.goalValue || 0.8);
    }
    case LEARN_GOAL_TYPES.weakReview:
      return eligibleProgress.every((progress) => progress.masteryScore >= 0.45);
    case LEARN_GOAL_TYPES.masterAll:
    default:
      return eligibleProgress.every((progress) => progress.masteryScore >= 0.7);
  }
}

export function getLearnSummary({ session, progressMap, items }) {
  const goalProgress = getGoalProgress({ session, progressMap, items });
  return {
    questionsAnswered: session.questionsAnswered,
    correctCount: session.correctCount,
    incorrectCount: session.incorrectCount,
    dontKnowCount: session.dontKnowCount,
    accuracy:
      session.questionsAnswered === 0
        ? 0
        : Math.round((session.correctCount / session.questionsAnswered) * 100),
    masteredItemsCount: goalProgress.masteredCount,
    weakItemsRemaining: goalProgress.weakCount,
    averageMastery: Math.round(goalProgress.averageMastery * 100),
    completed: session.status === LEARN_STATUS.completed,
  };
}

function buildLearnFeedback({ question, progress, evaluation }) {
  return {
    status:
      evaluation.outcome === LEARN_OUTCOMES.dontKnow
        ? "dont_know"
        : evaluation.isCorrect
          ? "correct"
          : "incorrect",
    correctAnswer: question.correctAnswer,
    explanation: question.explanation || question.concept || "",
    concept: question.concept || "",
    masteryMessage:
      progress.masteryScore >= 0.9
        ? "Mastered check passed."
        : progress.masteryScore >= 0.7
          ? "Almost mastered."
          : progress.masteryScore >= 0.45
            ? "This one is improving."
            : "We’ll bring this back again soon.",
  };
}

function updateRetryQueue(session, progress, itemId, outcome) {
  session.retryQueue = session.retryQueue.filter((entry) => String(entry.itemId) !== String(itemId));

  if (outcome === LEARN_OUTCOMES.correct || outcome === LEARN_OUTCOMES.overrideCorrect) {
    return;
  }

  const minOffset = outcome === LEARN_OUTCOMES.dontKnow ? 2 : 3;
  const maxOffset = outcome === LEARN_OUTCOMES.dontKnow ? 5 : 7;
  const offset = randomInteger(minOffset, maxOffset);

  session.retryQueue.push({
    itemId: String(itemId),
    dueAt: session.questionsAnswered + offset,
    priorityBoost: outcome === LEARN_OUTCOMES.dontKnow ? 1.25 : 1,
  });
}

function buildAcceptedAnswers(item) {
  return [...new Set([item.canonicalAnswer, ...(item.alternateAnswers ?? [])])];
}

function getEligibleItemIds({ items, progressMap, session }) {
  if (!items || items.length === 0) {
    return [...progressMap.keys()];
  }

  return getEligibleItems(items, progressMap, session).map((item) => String(item.itemId));
}

function weightedPick(entries, random) {
  if (entries.length === 0) {
    return null;
  }

  const total = entries.reduce((sum, entry) => sum + Math.max(entry.score, 0.01), 0);
  let threshold = random() * total;

  for (const entry of entries) {
    threshold -= Math.max(entry.score, 0.01);
    if (threshold <= 0) {
      return entry;
    }
  }

  return entries[0];
}

function shuffle(items, random = Math.random) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function cloneProgressMap(progressMap) {
  const nextMap = new Map();
  progressMap.forEach((value, key) => {
    nextMap.set(key, { ...value, questionTypeHistory: [...value.questionTypeHistory] });
  });
  return nextMap;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createId(prefix, now = Date.now()) {
  return `${prefix}-${now}-${Math.random().toString(36).slice(2, 10)}`;
}
