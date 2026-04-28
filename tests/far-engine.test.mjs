import assert from "node:assert/strict";
import { test } from "node:test";
import { createFarEngine } from "../src/far/far-engine.js";
import { FAR_PARTS } from "../src/far/far-question-bank.js";

test("FAR engine starts with a fresh marker and rotates by emphasized FAR part", () => {
  const engine = createFarEngine();
  const first = engine.nextQuestion();
  const second = engine.nextQuestion();

  assert.equal(first.marker, "fresh");
  assert.equal(second.marker, "fresh");
  assert.equal(first.farPart, FAR_PARTS[0]);
  assert.equal(second.farPart, FAR_PARTS[1]);
});

test("FAR answer feedback identifies correctness and explanations", () => {
  const engine = createFarEngine();
  const question = engine.nextQuestion();
  const wrongLetter = ["A", "B", "C", "D"].find((letter) => letter !== question.correctAnswer);
  const feedback = engine.answerCurrent(wrongLetter);

  assert.equal(feedback.status, "incorrect");
  assert.match(feedback.correctAnswer, new RegExp(`^${question.correctAnswer}\\. FAR Part`));
  assert.ok(feedback.whyCorrect.length > 20);
  assert.equal(feedback.whyWrong.length, 4);
  assert.ok(feedback.distinction.length > 20);
  assert.ok(feedback.trigger.length > 5);
});

test("FAR engine marks repeats after a full cycle", () => {
  const engine = createFarEngine();

  for (let index = 0; index < FAR_PARTS.length; index += 1) {
    assert.equal(engine.nextQuestion().marker, "fresh");
  }

  assert.equal(engine.nextQuestion().marker, "fresh");
});

test("FAR reset clears totals and starts over", () => {
  const engine = createFarEngine();
  const question = engine.nextQuestion();
  engine.answerCurrent(question.correctAnswer);

  assert.equal(engine.totals().answered, 1);

  engine.reset();

  assert.equal(engine.totals().answered, 0);
  assert.equal(engine.nextQuestion().questionNumber, 1);
});
