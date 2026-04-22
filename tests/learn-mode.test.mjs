import test from "node:test";
import assert from "node:assert/strict";

import {
  applyLearnAnswer,
  buildLearnQuestion,
  createLearnSession,
  ensureProgressMap,
  getLearnSummary,
  getMasteryBucket,
  normalizeTypedAnswer,
  registerQuestionShown,
  selectNextItem,
  shouldCompleteSession,
  transformQuestionBankToLearnItems,
} from "../src/learn/learn-engine.js";
import { createLearnStorage } from "../src/learn/learn-storage.js";
import {
  LEARN_ANSWER_DIRECTIONS,
  LEARN_BUCKETS,
  LEARN_GOAL_TYPES,
  LEARN_OUTCOMES,
  LEARN_QUESTION_TYPES,
} from "../src/learn/learn-types.js";

const QUESTION_BANK = [
  {
    id: 1,
    stem: "Which authority binds the Government?",
    choices: {
      A: "COR",
      B: "Program manager",
      C: "Warranted contracting officer",
      D: "Contract specialist",
    },
    correctAnswer: "C",
    bucket: 7,
    concept: "Authority",
    teachingNote: "Only a warranted contracting officer can bind the Government.",
    source: {
      sourceLabel: "Test",
      sessionLabel: "Session 1",
      topicLabel: "Authority",
    },
  },
  {
    id: 2,
    stem: "Which form is used for amendments and modifications?",
    choices: {
      A: "SF 30",
      B: "SF 44",
      C: "DD 254",
      D: "DD 1155",
    },
    correctAnswer: "A",
    bucket: 6,
    concept: "Forms",
    teachingNote: "SF 30 is used for amendments and modifications.",
    source: {
      sourceLabel: "Test",
      sessionLabel: "Session 1",
      topicLabel: "Forms",
    },
  },
  {
    id: 3,
    stem: "What type of analysis compares proposed prices without evaluating cost elements?",
    choices: {
      A: "Cost analysis",
      B: "Price analysis",
      C: "Cost realism",
      D: "Technical leveling",
    },
    correctAnswer: "B",
    bucket: 1,
    concept: "Pricing",
    teachingNote: "Price analysis compares prices.",
    source: {
      sourceLabel: "Test",
      sessionLabel: "Session 1",
      topicLabel: "Pricing",
    },
  },
];

function buildHarness(config = {}) {
  const items = transformQuestionBankToLearnItems(QUESTION_BANK);
  const session = createLearnSession(config);
  const progressMap = ensureProgressMap(items, [], session);
  return { items, session, progressMap };
}

test("typed answer normalization trims, lowercases, removes punctuation, and collapses spacing", () => {
  const normalized = normalizeTypedAnswer("  Warranted--Contracting Officer!!  ");
  assert.equal(normalized, "warrantedcontracting officer");
});

test("mastery bucket transitions require stability before mastered", () => {
  assert.equal(getMasteryBucket({ masteryScore: 0.05 }), LEARN_BUCKETS.unseen);
  assert.equal(getMasteryBucket({ masteryScore: 0.2 }), LEARN_BUCKETS.struggling);
  assert.equal(getMasteryBucket({ masteryScore: 0.35 }), LEARN_BUCKETS.weak);
  assert.equal(getMasteryBucket({ masteryScore: 0.55 }), LEARN_BUCKETS.improving);
  assert.equal(
    getMasteryBucket({ masteryScore: 0.92, consecutiveCorrect: 1, timesCorrect: 2 }),
    LEARN_BUCKETS.nearlyMastered,
  );
  assert.equal(
    getMasteryBucket({ masteryScore: 0.92, consecutiveCorrect: 2, timesCorrect: 3 }),
    LEARN_BUCKETS.mastered,
  );
});

test("multiple choice correct answer updates mastery and counters", () => {
  const { items, session, progressMap } = buildHarness({
    allowedQuestionTypes: [LEARN_QUESTION_TYPES.multipleChoice],
  });
  const question = buildLearnQuestion({
    item: items[0],
    items,
    progressMap,
    session,
    random: () => 0.1,
  });
  const shown = registerQuestionShown({ session, progressMap, question, now: 100 });
  const result = applyLearnAnswer({
    session: shown.session,
    progressMap: shown.progressMap,
    question,
    answer: { kind: "answer", value: "C" },
    items,
    now: 200,
  });
  const updated = result.progressMap.get("1");
  assert.equal(updated.masteryScore, 0.12);
  assert.equal(updated.timesCorrect, 1);
  assert.equal(updated.consecutiveCorrect, 1);
  assert.equal(updated.masteryBucket, LEARN_BUCKETS.struggling);
  assert.equal(result.session.correctCount, 1);
});

test("typed incorrect and dont know answers lower mastery and schedule retries", () => {
  const { items, session, progressMap } = buildHarness({
    allowedQuestionTypes: [LEARN_QUESTION_TYPES.typedResponse],
    answerDirection: LEARN_ANSWER_DIRECTIONS.forward,
  });
  const question = buildLearnQuestion({
    item: items[0],
    items,
    progressMap,
    session,
    random: () => 0.9,
  });
  const shown = registerQuestionShown({ session, progressMap, question, now: 100 });
  const incorrect = applyLearnAnswer({
    session: shown.session,
    progressMap: shown.progressMap,
    question,
    answer: { kind: "answer", value: "cor" },
    items,
    now: 200,
  });
  assert.equal(incorrect.progressMap.get("1").masteryScore, 0);
  assert.equal(incorrect.progressMap.get("1").timesIncorrect, 1);
  assert.equal(incorrect.session.retryQueue.length, 1);

  const nextQuestion = buildLearnQuestion({
    item: items[1],
    items,
    progressMap: incorrect.progressMap,
    session: incorrect.session,
    random: () => 0.9,
  });
  const nextShown = registerQuestionShown({
    session: incorrect.session,
    progressMap: incorrect.progressMap,
    question: nextQuestion,
    now: 300,
  });
  const dontKnow = applyLearnAnswer({
    session: nextShown.session,
    progressMap: nextShown.progressMap,
    question: nextQuestion,
    answer: { kind: LEARN_OUTCOMES.dontKnow },
    items,
    now: 400,
  });
  assert.equal(dontKnow.progressMap.get("2").timesDontKnow, 1);
  assert.equal(dontKnow.session.dontKnowCount, 1);
});

test("next item selection prioritizes weak and recently missed items", () => {
  const { items, session, progressMap } = buildHarness();
  progressMap.get("1").masteryScore = 0.9;
  progressMap.get("1").timesSeen = 4;
  progressMap.get("1").consecutiveCorrect = 3;
  progressMap.get("1").timesCorrect = 4;
  progressMap.get("1").masteryBucket = LEARN_BUCKETS.mastered;

  progressMap.get("2").masteryScore = 0.1;
  progressMap.get("2").timesSeen = 2;
  progressMap.get("2").lastOutcome = LEARN_OUTCOMES.incorrect;
  progressMap.get("2").consecutiveCorrect = 0;

  const selected = selectNextItem({
    items,
    progressMap,
    session,
    random: () => 0.01,
  });

  assert.equal(selected.itemId, "2");
});

test("completion conditions work for all supported goal types", () => {
  const { items, session, progressMap } = buildHarness();
  const ids = items.map((item) => item.itemId);
  ids.forEach((id) => {
    progressMap.get(id).masteryScore = 0.75;
  });

  assert.equal(
    shouldCompleteSession({
      session: { ...session, goalType: LEARN_GOAL_TYPES.masterAll },
      progressMap,
      eligibleItemIds: ids,
    }),
    true,
  );
  assert.equal(
    shouldCompleteSession({
      session: {
        ...session,
        goalType: LEARN_GOAL_TYPES.questionCount,
        goalValue: 3,
        questionsAnswered: 3,
      },
      progressMap,
      eligibleItemIds: ids,
    }),
    true,
  );
  assert.equal(
    shouldCompleteSession({
      session: {
        ...session,
        goalType: LEARN_GOAL_TYPES.masteryTarget,
        goalValue: 0.7,
      },
      progressMap,
      eligibleItemIds: ids,
    }),
    true,
  );
});

test("summary generation reports answered counts, accuracy, and weak items remaining", () => {
  const { items, session, progressMap } = buildHarness();
  progressMap.get("1").masteryScore = 0.95;
  progressMap.get("1").timesCorrect = 3;
  progressMap.get("1").consecutiveCorrect = 2;
  progressMap.get("2").masteryScore = 0.2;
  progressMap.get("3").masteryScore = 0.5;
  const summary = getLearnSummary({
    session: {
      ...session,
      questionsAnswered: 4,
      correctCount: 3,
      incorrectCount: 1,
      dontKnowCount: 0,
    },
    progressMap,
    items,
  });
  assert.equal(summary.questionsAnswered, 4);
  assert.equal(summary.accuracy, 75);
  assert.equal(summary.weakItemsRemaining, 1);
});

test("storage can resume active sessions and reset progress cleanly", () => {
  const memory = createMemoryStorage();
  const storage = createLearnStorage(memory);
  const { items, session, progressMap } = buildHarness();
  storage.saveSession(session);
  storage.saveProgress([...progressMap.values()]);
  storage.saveSettings({
    settings: {
      goalType: LEARN_GOAL_TYPES.questionCount,
      goalValue: 12,
      allowedQuestionTypes: [LEARN_QUESTION_TYPES.multipleChoice],
      answerDirection: LEARN_ANSWER_DIRECTIONS.forward,
      filters: { onlyWeakItems: false, onlyStarredItems: false },
    },
  });

  assert.equal(storage.getActiveSession({}).id, session.id);
  assert.equal(storage.getProgress({}).length, items.length);
  assert.equal(storage.getSettings({}).goalValue, 12);

  storage.restartSessionOnly({});
  assert.equal(storage.getActiveSession({}), null);

  storage.saveSession(session);
  storage.resetProgress({});
  assert.equal(storage.getProgress({}).length, 0);
  assert.equal(storage.getActiveSession({}), null);
});

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}
