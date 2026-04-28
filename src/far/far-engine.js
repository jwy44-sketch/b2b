import { FAR_PARTS, FAR_PART_TITLES, FAR_QUESTION_BANK } from "./far-question-bank.js";

export const FAR_ROUTES = {
  session: "#far/session",
};

export function createFarEngine(questionBank = FAR_QUESTION_BANK) {
  const questionsByPart = groupByPart(questionBank);

  return {
    state: initialState(),
    nextQuestion() {
      const farPart = FAR_PARTS[this.state.cycleIndex];

      if (this.state.cycleIndex === 0 && this.state.questionNumber > 0) {
        this.state.partsSeenInCycle = new Set();
      }

      const marker = this.state.partsSeenInCycle.has(farPart) ? "repeat" : "fresh";
      const pool = questionsByPart.get(farPart) ?? [];
      const nextIndex = this.state.questionIndexesByPart[farPart] ?? 0;
      const question = pool[nextIndex % pool.length];

      if (!question) {
        throw new Error(`No FAR question available for Part ${farPart}`);
      }

      this.state.questionIndexesByPart[farPart] = nextIndex + 1;
      this.state.partsSeenInCycle.add(farPart);
      this.state.cycleIndex = (this.state.cycleIndex + 1) % FAR_PARTS.length;
      this.state.questionNumber += 1;
      this.state.currentQuestion = {
        ...question,
        marker,
        questionNumber: this.state.questionNumber,
      };
      this.state.answeredCurrent = false;
      return this.state.currentQuestion;
    },
    answerCurrent(letter) {
      const question = this.state.currentQuestion;
      const normalized = String(letter ?? "").trim().toUpperCase();

      if (!question) {
        throw new Error("No FAR question is loaded.");
      }

      if (!["A", "B", "C", "D"].includes(normalized)) {
        throw new Error("Answer must be A, B, C, or D.");
      }

      const wasCorrect = normalized === question.correctAnswer;
      const feedback = buildFarFeedback(question, normalized, wasCorrect);
      this.state.answeredCurrent = true;
      this.state.history.unshift({
        question,
        chosenAnswer: normalized,
        wasCorrect,
        feedback,
      });
      return feedback;
    },
    reset() {
      this.state = initialState();
    },
    totals() {
      const answered = this.state.history.length;
      const correct = this.state.history.filter((entry) => entry.wasCorrect).length;
      return {
        answered,
        correct,
        incorrect: answered - correct,
        accuracy: answered === 0 ? 0 : Math.round((correct / answered) * 100),
      };
    },
  };
}

function initialState() {
  return {
    questionNumber: 0,
    cycleIndex: 0,
    currentQuestion: null,
    answeredCurrent: false,
    partsSeenInCycle: new Set(),
    questionIndexesByPart: {},
    history: [],
  };
}

function groupByPart(questionBank) {
  return questionBank.reduce((map, question) => {
    if (!map.has(question.farPart)) {
      map.set(question.farPart, []);
    }
    map.get(question.farPart).push(question);
    return map;
  }, new Map());
}

function buildFarFeedback(question, chosenAnswer, wasCorrect) {
  const correctText = question.choices[question.correctAnswer];

  return {
    status: wasCorrect ? "correct" : "incorrect",
    heading: wasCorrect ? `Correct - ${question.correctAnswer}` : `Incorrect. Correct answer: ${question.correctAnswer}`,
    correctAnswer: `${question.correctAnswer}. ${correctText}`,
    whyCorrect: question.whyCorrect,
    whyWrong: ["A", "B", "C", "D"].map((letter) => ({
      letter,
      text: question.choices[letter],
      isCorrect: letter === question.correctAnswer,
      rationale:
        letter === question.correctAnswer
          ? question.whyCorrect
          : question.whyWrong[letter],
    })),
    distinction: question.distinction,
    trigger: question.trigger,
    concept: `${correctText}: ${FAR_PART_TITLES[question.farPart]}`,
    chosenAnswer,
  };
}
