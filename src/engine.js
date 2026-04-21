export const TOPIC_BUCKETS = [
  { id: 1, title: "Contract pricing and analysis" },
  { id: 2, title: "Pricing problem distinctions" },
  { id: 3, title: "Pre-award exchanges and source selection" },
  { id: 4, title: "Disagreements and dispute paths" },
  { id: 5, title: "Terminations and performance notices" },
  { id: 6, title: "Solicitation and contract change instruments" },
  { id: 7, title: "Authority concepts" },
  { id: 8, title: "Requirement planning and market research" },
  { id: 9, title: "Describing agency needs" },
  { id: 10, title: "Competition and contracting methods" },
  { id: 11, title: "Small business topics" },
  { id: 12, title: "Uniform Contract Format and solicitation structure" },
  { id: 13, title: "Forms" },
  { id: 14, title: "Government property" },
  { id: 15, title: "Post-award administration and quality" },
  { id: 16, title: "Subcontracts and closeout" },
  { id: 17, title: "Threshold-sensitive topics" },
  { id: 18, title: "RFO-specific shifts" },
  { id: 19, title: "Standards of conduct / procurement integrity / conflict controls" },
  { id: 20, title: "Contract principles add-ons / lifecycle and documentation concepts" },
];

const GLOSSARY_RATIONALES = {
  "SF 26": "SF 26 is the Award/Contract form tied to certain awards, not the general amendment or commercial-item instrument.",
  "SF 30": "SF 30 is used for solicitation amendments and contract modifications, not as a substitute for every acquisition form.",
  "SF 33": "SF 33 is a solicitation/offer/award form commonly associated with sealed bidding or negotiated awards, not commercial-item awards above the SAT by default.",
  "SF 44": "SF 44 is the purchase order-invoice-voucher associated with certain low-dollar or over-the-counter situations, not a broad-source-selection tool.",
  "SF 1409": "SF 1409 is the abstract of offers form, not a commercial-item or pricing-analysis form.",
  "SF 1442": "SF 1442 is used for construction, alteration, repair, or similar construction acquisitions.",
  "SF 1449": "SF 1449 is the solicitation/contract/order form for commercial products and services, especially above the SAT.",
  "DD 1155": "DD 1155 is used for orders of supplies or services, not for amendments, security classification guidance, or weighted-guidelines profit analysis.",
  "DD 1547": "DD 1547 is the record of weighted guidelines application used in DoD profit/fee analysis.",
  "DD 1861": "DD 1861 supports facilities capital cost of money rather than sealed bidding, amendments, or commercial award formatting.",
  "DD 254": "DD 254 provides security classification guidance to contractors and subcontractors.",
  "COR": "A COR may perform delegated technical or administrative functions, but cannot bind the Government contractually.",
  "Contracting Officer": "Only a warranted contracting officer acting within delegated authority can bind the Government.",
  "program manager": "Mission need and program ownership do not create contractual authority.",
  "contract specialist": "Assignment to the file does not itself create warrant authority.",
  "SSA": "The Source Selection Authority makes the source-selection decision; other team members support but do not replace that role.",
  "SSDD": "The SSDD records the source-selection decision; it is not the team itself or the evaluation standard.",
  "DCMA": "DCMA is tied to contract administration support, not auditing or public opportunity posting.",
  "DCAA": "DCAA provides audit and financial advisory support, not award posting or contract file distribution.",
  "SAM.gov": "SAM.gov is the Governmentwide Point of Entry for publicizing opportunities, not the audit or administration agency.",
  "EDA": "EDA is the electronic document/data distribution environment, not the point of entry for public opportunities.",
  "CBAR": "CBAR is the repository for certain business-clearance records, not a public opportunity site or audit office.",
  "LPTA": "LPTA is appropriate when minimum technical acceptability is the threshold and tradeoffs are not used.",
  "Tradeoff": "Tradeoff supports comparing price with non-cost advantages when the solicitation allows that balancing.",
  "Highest technically rated with a fair and reasonable price": "This RFO-era approach is not the same thing as LPTA or a classic tradeoff.",
  "clarifications": "Clarifications are limited exchanges and do not permit proposal revisions.",
  "competitive negotiations": "Under the updated framing, competitive negotiations replace the older discussions label in the source set.",
  "Section L": "Section L contains proposal preparation instructions and notices to offerors.",
  "Section M": "Section M contains evaluation factors and significant subfactors.",
  "Section J": "Section J is where attachments and exhibits are typically listed or organized.",
  "Section I": "Section I contains contract clauses in the UCF structure.",
  "Section H": "Section H holds special contract requirements rather than evaluation factors or proposal instructions.",
  "Rent-free": "Government-furnished property is normally provided on a rent-free basis when properly authorized.",
  "The Government": "Title to Government-furnished property remains with the Government until properly disposed of.",
  "The Contractor": "The contractor generally bears responsibility for performing to contract requirements and for contractor quality control.",
};

const BUCKET_GUIDANCE = {
  1: {
    concept: "Cost analysis, price analysis, cost realism, profit/fee, and negotiation documentation.",
    fast: "Separate the analysis method first: price analysis compares prices; cost analysis digs into cost elements; cost realism tests whether proposed costs are realistic for performance.",
    explanation: "Pricing questions usually turn on what data you have, whether certified cost or pricing data are required, and whether the Government is testing price reasonableness or performance realism.",
  },
  2: {
    concept: "Buying-in, unbalanced pricing, defective pricing, and certified cost or pricing data distinctions.",
    fast: "If the issue is a distorted pricing posture or bad data, stay in the pricing-problem bucket instead of the general pricing-analysis bucket.",
    explanation: "These questions are about recognizing a particular pricing defect or data trigger, not simply choosing a generic analysis technique.",
  },
  3: {
    concept: "Clarifications, negotiations, proposal revisions, selection roles, and source-selection approaches.",
    fast: "Ask whether the exchange allows revisions, who makes the decision, and whether the solicitation is using LPTA, tradeoff, or another stated approach.",
    explanation: "Source-selection questions separate limited exchanges from negotiation-stage exchanges and then tie the process back to disclosed evaluation structures.",
  },
  4: {
    concept: "Protests, claims, REAs, ADR, timeliness, and dispute routing.",
    fast: "Protests attack solicitation or award actions; claims arise under or relate to the contract and run through the contracting officer dispute path.",
    explanation: "The key move is identifying which legal path the issue is in and then applying the right party, timing, and certification logic.",
  },
  5: {
    concept: "Termination for convenience, default, cause, cure notices, and show-cause notices.",
    fast: "Match the performance failure posture to the termination type, then ask whether the Government should first issue a cure or show-cause style notice.",
    explanation: "Termination questions test whether the contract posture justifies default/cause treatment or whether the Government is simply electing convenience.",
  },
  6: {
    concept: "Amendments, modifications, administrative changes, change orders, and SF 30 use.",
    fast: "Before award, think amendment. After award, think modification. Then ask whether the action is unilateral or bilateral.",
    explanation: "These questions usually hinge on the timing of the change and whether the instrument changes the solicitation or the contract itself.",
  },
  7: {
    concept: "Actual authority, warranted CO authority, and unauthorized commitments.",
    fast: "Ask one clean question: who can legally bind the Government here? If the person is not acting with actual contracting authority, eliminate it.",
    explanation: "Authority questions punish confusing mission influence or technical oversight with contractual binding authority.",
  },
  8: {
    concept: "Acquisition planning, market research, and pre-solicitation industry engagement.",
    fast: "Planning starts when the need is identified, and market research remains appropriate to the circumstances instead of stopping after one early step.",
    explanation: "The materials treat planning and market research as living acquisition activities, not one-time paperwork events.",
  },
  9: {
    concept: "Functions, performance, essential physical characteristics, and restrictive requirement control.",
    fast: "If the requirement is written like a brand lock or vendor preference, pivot back to function, performance, or essential characteristics.",
    explanation: "Requirement questions usually test whether the Government described what it truly needs without unnecessary restriction.",
  },
  10: {
    concept: "Competition policy, sealed bidding, contracting by negotiation, simplified procedures, and publicizing basics.",
    fast: "Pick the contracting method that matches the acquisition posture instead of forcing every problem into the same method.",
    explanation: "This bucket is about choosing the right competitive framework and understanding what that framework allows.",
  },
  11: {
    concept: "Small business encouragement, lotting, schedules, and subcontracting encouragement.",
    fast: "Look for actions that expand practical participation: smaller lots, realistic schedules, and subcontracting encouragement where appropriate.",
    explanation: "These questions reward practical competition-friendly steps, not symbolic references to small business policy.",
  },
  12: {
    concept: "UCF structure, Sections A-M, and where information belongs in the solicitation.",
    fast: "If the question asks where something goes, map it to the UCF: L for instructions, M for evaluation, I for clauses, J for attachments, H for special requirements.",
    explanation: "UCF questions are mostly placement and structure discipline under the solicitation framework.",
  },
  13: {
    concept: "Core contracting forms and what each one is for.",
    fast: "Do not memorize by shape; memorize by use case. Forms separate commercial awards, amendments, construction, abstracts, profit analysis, and security guidance.",
    explanation: "The exam tends to ask forms in applied context, so the winner is the form that fits the action, not the one that merely sounds official.",
  },
  14: {
    concept: "Government-furnished property policy, title, basis of use, and preference for contractor-furnished property.",
    fast: "Start with the policy preference: contractors furnish property unless Government property is justified in the Government's best interest.",
    explanation: "Government property questions usually pivot on policy preference, retained title, and the conditions for furnishing GFP.",
  },
  15: {
    concept: "Post-award orientation, contract administration roles, quality assurance, acceptance, and CPARS.",
    fast: "Separate contractor performance responsibility from Government inspection and acceptance authority.",
    explanation: "Post-award questions blend roles, oversight, and acceptance logic, so identify who owns technical performance and who holds formal contractual authority.",
  },
  16: {
    concept: "Privity, subcontract relationships, physical completion, and closeout blockers.",
    fast: "Privity stops at the prime contract line, and closeout cannot finish cleanly while major unresolved actions are still open.",
    explanation: "This bucket focuses on who is legally connected to whom and what prevents a file from truly closing.",
  },
  17: {
    concept: "Threshold-sensitive reasoning using the uploaded material's current framing, especially where threshold changes do not drive the exam result.",
    fast: "If a question is trying to bait you into stale dollar memorization, fall back to the governing threshold concept or to the RFO FAQ's warning that recent updates did not change the current exam structure.",
    explanation: "Threshold questions in this build are kept concept-first because the uploaded material itself flags transition pressure around threshold updates.",
  },
  18: {
    concept: "RFO terminology shifts, lifecycle framing, simplified procedures wording, and updated Part 15 language.",
    fast: "When old and new labels conflict, choose the current RFO-first framing used in the uploaded materials.",
    explanation: "These questions are less about changing the underlying competency and more about recognizing the updated language and structure.",
  },
  19: {
    concept: "Ethics, gratuities, procurement integrity, source-selection protection, OCI, and conflict controls.",
    fast: "If the action risks unfair advantage, protected information disclosure, or public-trust damage, the safer ethics answer usually wins.",
    explanation: "These questions test discipline under pressure: the attractive shortcut is usually the integrity failure.",
  },
  20: {
    concept: "Lifecycle phases, documentation logic, D&Fs, J&As, warranties, prompt payment, and core contract principles.",
    fast: "Tie the issue back to the contract lifecycle and ask what the file must show to support the action.",
    explanation: "This bucket tests whether the acquisition record and contract fundamentals still make sense when the scenario gets messy.",
  },
};

function bucketStatsTemplate() {
  return TOPIC_BUCKETS.reduce((accumulator, bucket) => {
    accumulator[bucket.id] = {
      asked: 0,
      correct: 0,
      incorrect: 0,
    };
    return accumulator;
  }, {});
}

export function createEngine(questionBank) {
  const questionsByBucket = groupByBucket(questionBank);

  return {
    state: {
      questionNumber: 0,
      currentQuestion: null,
      answeredCurrent: false,
      askedQuestionIds: new Set(),
      bucketStats: bucketStatsTemplate(),
      cycleIndex: 0,
      bucketSequence: TOPIC_BUCKETS.map((bucket) => bucket.id),
      history: [],
    },
    nextQuestion() {
      if (this.state.currentQuestion && !this.state.answeredCurrent) {
        return this.state.currentQuestion;
      }

      const nextBucket = this.state.bucketSequence[this.state.cycleIndex];
      const bucketQuestions = questionsByBucket.get(nextBucket) ?? [];
      const unseenQuestions = bucketQuestions.filter(
        (question) => !this.state.askedQuestionIds.has(question.id),
      );
      const questionPool = unseenQuestions.length > 0 ? unseenQuestions : bucketQuestions;

      if (questionPool.length === 0) {
        throw new Error(`No question available for bucket ${nextBucket}`);
      }

      const rankedPool = rankQuestionsForBucket(questionPool, this.state.bucketStats[nextBucket]);
      const question = rankedPool[0];

      this.state.questionNumber += 1;
      this.state.currentQuestion = question;
      this.state.answeredCurrent = false;
      this.state.cycleIndex = (this.state.cycleIndex + 1) % this.state.bucketSequence.length;
      this.state.bucketStats[nextBucket].asked += 1;
      this.state.askedQuestionIds.add(question.id);

      return question;
    },
    answerCurrent(letter) {
      const question = this.state.currentQuestion;

      if (!question) {
        throw new Error("No current question loaded.");
      }

      if (this.state.answeredCurrent) {
        throw new Error("Current question already answered.");
      }

      const normalizedLetter = String(letter ?? "").trim().toUpperCase();

      if (!["A", "B", "C", "D"].includes(normalizedLetter)) {
        throw new Error("Answer must be one of A, B, C, or D.");
      }

      const bucketStat = this.state.bucketStats[question.bucket];
      const wasCorrect = normalizedLetter === question.correctAnswer;

      if (wasCorrect) {
        bucketStat.correct += 1;
      } else {
        bucketStat.incorrect += 1;
      }

      this.state.answeredCurrent = true;

      const feedback = buildFeedback(question, normalizedLetter, wasCorrect);
      this.state.history.unshift({
        question,
        chosenAnswer: normalizedLetter,
        wasCorrect,
        feedback,
      });

      return feedback;
    },
    getCoverage() {
      const cycleProgress = this.state.questionNumber % TOPIC_BUCKETS.length;
      const covered = new Set(
        this.state.history.slice(0, cycleProgress || TOPIC_BUCKETS.length).map((entry) => entry.question.bucket),
      );

      return TOPIC_BUCKETS.map((bucket) => ({
        ...bucket,
        covered: covered.has(bucket.id),
        stats: this.state.bucketStats[bucket.id],
      }));
    },
    getTotals() {
      const totalCorrect = Object.values(this.state.bucketStats).reduce(
        (sum, item) => sum + item.correct,
        0,
      );
      const totalIncorrect = Object.values(this.state.bucketStats).reduce(
        (sum, item) => sum + item.incorrect,
        0,
      );
      const totalAnswered = totalCorrect + totalIncorrect;

      return {
        totalAnswered,
        totalCorrect,
        totalIncorrect,
        accuracy: totalAnswered === 0 ? 0 : Math.round((totalCorrect / totalAnswered) * 100),
      };
    },
    reset() {
      this.state.questionNumber = 0;
      this.state.currentQuestion = null;
      this.state.answeredCurrent = false;
      this.state.askedQuestionIds = new Set();
      this.state.bucketStats = bucketStatsTemplate();
      this.state.cycleIndex = 0;
      this.state.history = [];
    },
  };
}

function groupByBucket(questionBank) {
  const map = new Map();

  questionBank.forEach((question) => {
    if (!map.has(question.bucket)) {
      map.set(question.bucket, []);
    }

    map.get(question.bucket).push(question);
  });

  return map;
}

function rankQuestionsForBucket(questionPool, bucketStats) {
  const weaknessWeight = bucketStats.incorrect - bucketStats.correct;

  return [...questionPool].sort((left, right) => {
    const leftScore = (left.difficulty ?? 2) + weaknessWeight + left.id / 1000;
    const rightScore = (right.difficulty ?? 2) + weaknessWeight + right.id / 1000;

    return rightScore - leftScore;
  });
}

function buildFeedback(question, chosenAnswer, wasCorrect) {
  const bucketHelp = BUCKET_GUIDANCE[question.bucket];
  const correctChoiceText = question.choices[question.correctAnswer];
  const choiceRationales = ["A", "B", "C", "D"].map((letter) => {
    const choiceText = question.choices[letter];
    const isCorrect = letter === question.correctAnswer;

    return {
      letter,
      text: choiceText,
      rationale: isCorrect
        ? buildCorrectChoiceExplanation(question, choiceText, bucketHelp)
        : buildIncorrectChoiceExplanation(question, choiceText, letter, chosenAnswer, bucketHelp),
      isCorrect,
    };
  });

  return {
    heading: wasCorrect ? `Correct — ${question.correctAnswer}` : "Incorrect.",
    status: wasCorrect ? "correct" : "incorrect",
    correctAnswer: question.correctAnswer,
    whyCorrect: buildWhyCorrect(question, correctChoiceText, bucketHelp),
    whyOthersWrong: choiceRationales,
    fastSeparation: question.fastSeparation || bucketHelp.fast,
    concept: question.concept || bucketHelp.concept,
  };
}

function buildWhyCorrect(question, choiceText, bucketHelp) {
  const questionNote = question.teachingNote?.trim();
  const glossary = lookupGlossaryRationale(choiceText);

  return [
    questionNote || bucketHelp.explanation,
    glossary ? `That lines up here because ${glossary.charAt(0).toLowerCase()}${glossary.slice(1)}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildCorrectChoiceExplanation(question, choiceText, bucketHelp) {
  const glossary = lookupGlossaryRationale(choiceText);

  if (glossary) {
    return `This is the right answer because ${glossary.charAt(0).toLowerCase()}${glossary.slice(1)}`;
  }

  return `This fits the governing rule in this scenario. ${question.teachingNote || bucketHelp.explanation}`;
}

function buildIncorrectChoiceExplanation(question, choiceText, letter, chosenAnswer, bucketHelp) {
  const glossary = lookupGlossaryRationale(choiceText);

  if (glossary) {
    return `${letter} is wrong here because ${glossary.charAt(0).toLowerCase()}${glossary.slice(1)}`;
  }

  if (question.wrongAnswerNotes?.[letter]) {
    return question.wrongAnswerNotes[letter];
  }

  if (letter === chosenAnswer) {
    return `This is the trap choice because it sounds plausible but conflicts with the controlling rule. ${bucketHelp.fast}`;
  }

  return `This does not match the controlling principle for the scenario. ${bucketHelp.fast}`;
}

function lookupGlossaryRationale(choiceText) {
  return Object.entries(GLOSSARY_RATIONALES).find(([key]) => choiceText.includes(key))?.[1] ?? "";
}
