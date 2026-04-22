export const LEARN_USER_ID = "local-user";
export const LEARN_SET_ID = "con-3990v-default-set";

export const LEARN_ROUTES = {
  setup: "#learn/setup",
  session: "#learn/session",
  summary: "#learn/summary",
  test: "#test",
};

export const LEARN_STATUS = {
  active: "active",
  completed: "completed",
  abandoned: "abandoned",
};

export const LEARN_GOAL_TYPES = {
  masterAll: "master_all",
  questionCount: "question_count",
  masteryTarget: "mastery_target",
  weakReview: "weak_review",
};

export const LEARN_QUESTION_TYPES = {
  multipleChoice: "multiple_choice",
  typedResponse: "typed_response",
};

export const LEARN_ANSWER_DIRECTIONS = {
  forward: "forward",
  reverse: "reverse",
  mixed: "mixed",
};

export const LEARN_OUTCOMES = {
  correct: "correct",
  incorrect: "incorrect",
  dontKnow: "dont_know",
  overrideCorrect: "override_correct",
};

export const LEARN_BUCKETS = {
  unseen: "unseen",
  struggling: "struggling",
  weak: "weak",
  improving: "improving",
  nearlyMastered: "nearly_mastered",
  mastered: "mastered",
};

export const LEARN_DEFAULT_CONFIG = {
  goalType: LEARN_GOAL_TYPES.masterAll,
  goalValue: null,
  allowedQuestionTypes: [
    LEARN_QUESTION_TYPES.multipleChoice,
    LEARN_QUESTION_TYPES.typedResponse,
  ],
  answerDirection: LEARN_ANSWER_DIRECTIONS.forward,
  filters: {
    onlyWeakItems: false,
    onlyStarredItems: false,
  },
};

export const LEARN_PRIORITY_WEIGHTS = {
  recentIncorrectWeight: 4.0,
  dontKnowWeight: 4.5,
  unseenWeight: 3.0,
  lowMasteryWeight: 2.5,
  recencyWeight: 1.5,
  streakBreakWeight: 2.0,
  masteredPenaltyWeight: 2.5,
  retryBoostWeight: 3.75,
};

export const LEARN_MASTERY_DELTAS = {
  [LEARN_QUESTION_TYPES.multipleChoice]: {
    [LEARN_OUTCOMES.correct]: 0.12,
    [LEARN_OUTCOMES.incorrect]: -0.15,
    [LEARN_OUTCOMES.dontKnow]: -0.18,
    [LEARN_OUTCOMES.overrideCorrect]: 0.12,
  },
  [LEARN_QUESTION_TYPES.typedResponse]: {
    [LEARN_OUTCOMES.correct]: 0.18,
    [LEARN_OUTCOMES.incorrect]: -0.2,
    [LEARN_OUTCOMES.dontKnow]: -0.18,
    [LEARN_OUTCOMES.overrideCorrect]: 0.18,
  },
};
