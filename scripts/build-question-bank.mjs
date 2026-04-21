import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const extractPath = path.join(
  rootDir,
  "_absorb_extract",
  "con3990v_scenario_bank_harder_distractors.txt",
);
const outputPath = path.join(rootDir, "src", "question-bank.js");

const text = fs.readFileSync(extractPath, "utf8");
const keyMarker = "Correct answers are unchanged from the source bank.";
const [questionSection, answerSection] = text.split(keyMarker);

const answerKey = parseAnswerKey(answerSection);
const parsedQuestions = parseQuestions(questionSection).map((question) => {
  const correctAnswer = answerKey.get(question.id);

  if (!correctAnswer) {
    throw new Error(`Missing answer key for question ${question.id}`);
  }

  const enriched = enrichQuestion({
    ...question,
    correctAnswer,
  });

  return enriched;
});

const supplementedQuestions = [...parsedQuestions, ...supplementalQuestions()];

const fileContents = `export const QUESTION_BANK = ${JSON.stringify(supplementedQuestions, null, 2)};\n`;
fs.writeFileSync(outputPath, fileContents, "utf8");

console.log(`Wrote ${supplementedQuestions.length} questions to ${outputPath}`);

function parseAnswerKey(section) {
  const answers = new Map();
  const lines = section.split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^Q(\d{3}).*?([A-D])\./);

    if (match) {
      answers.set(Number(match[1]), match[2]);
    }
  }

  return answers;
}

function parseQuestions(section) {
  const cleaned = section
    .replace(/\u0000/g, " ")
    .replace(/\u007f/g, " ")
    .replace(/^Page \d+\s*$/gm, "")
    .replace(/\r/g, "");
  const lines = cleaned.split("\n");

  const questions = [];
  let current = null;
  let mode = "stem";

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (line === keyMarker || line.startsWith("Correct answers")) {
      break;
    }

    const questionMatch = line.match(/^Q(\d{3}).*?Session\s+(\d).*?([A-Za-z/& ]+)$/);

    if (questionMatch) {
      if (current) {
        questions.push(finalizeQuestion(current));
      }

      current = {
        id: Number(questionMatch[1]),
        sessionNumber: Number(questionMatch[2]),
        topicLabel: questionMatch[3].trim().replace(/\s+/g, " "),
        stemLines: [],
        choices: { A: [], B: [], C: [], D: [] },
      };
      mode = "stem";
      continue;
    }

    if (!current) {
      continue;
    }

    const choiceMatch = line.match(/^([A-D])\.\s*(.*)$/);

    if (choiceMatch) {
      mode = choiceMatch[1];

      if (choiceMatch[2]) {
        current.choices[mode].push(choiceMatch[2]);
      }

      continue;
    }

    if (mode === "stem") {
      current.stemLines.push(line);
      continue;
    }

    current.choices[mode].push(line);
  }

  if (current) {
    questions.push(finalizeQuestion(current));
  }

  return questions;
}

function finalizeQuestion(question) {
  return {
    id: question.id,
    stem: normalizeSpacing(question.stemLines.join(" ")),
    choices: {
      A: normalizeSpacing(question.choices.A.join(" ")),
      B: normalizeSpacing(question.choices.B.join(" ")),
      C: normalizeSpacing(question.choices.C.join(" ")),
      D: normalizeSpacing(question.choices.D.join(" ")),
    },
    source: {
      sourceLabel: "Scenario Bank",
      sessionLabel: `Session ${question.sessionNumber}`,
      topicLabel: question.topicLabel,
    },
  };
}

function enrichQuestion(question) {
  const combined = [
    question.stem,
    question.choices.A,
    question.choices.B,
    question.choices.C,
    question.choices.D,
    question.source.topicLabel,
  ]
    .join(" ")
    .toLowerCase();

  const bucket = inferBucket(combined);
  const concept = inferConcept(combined, bucket);
  const teachingNote = inferTeachingNote(combined, bucket);
  const difficulty = inferDifficulty(combined, bucket);

  return {
    ...question,
    bucket,
    concept,
    teachingNote,
    difficulty,
  };
}

function inferBucket(text) {
  if (hasAny(text, ["gratuit", "gift", "procurement integrity", "source-selection information", "kickback", "conflict", "government employee", "oci", "appearance of conflict"])) {
    return 19;
  }

  if (hasAny(text, ["sf 26", "sf 30", "sf 33", "sf 44", "sf 1409", "sf 1442", "sf 1449", "dd 1155", "dd 1547", "dd 254", "dd 1861"])) {
    return 13;
  }

  if (hasAny(text, ["section l", "section m", "section h", "section i", "section j", "uniform contract format", "parts i, ii, iii"])) {
    return 12;
  }

  if (hasAny(text, ["government property", "gfp", "government-furnished", "rent-free", "title to"])) {
    return 14;
  }

  if (hasAny(text, ["dcma", "dcaa", "postaward orientation", "past performance", "cpars", "inspection", "acceptance", "proper invoice", "quality assurance"])) {
    return 15;
  }

  if (hasAny(text, ["subcontract", "privity", "closeout", "physically complete"])) {
    return 16;
  }

  if (hasAny(text, ["terminate", "termination", "cure notice", "show cause", "default", "convenience", "cause"])) {
    return 5;
  }

  if (hasAny(text, ["amend", "modification", "sf 30", "change order", "unilateral", "bilateral", "administrative change"])) {
    return 6;
  }

  if (hasAny(text, ["claim", "protest", "adr", "interested party", "adverse agency action", "issue in controversy", "rea"])) {
    return 4;
  }

  if (hasAny(text, ["clarification", "competitive negotiations", "best suited for further negotiation", "source selection", "tradeoff", "lpta", "highest technically rated", "ssa", "ssdd", "proposal revision"])) {
    return 3;
  }

  if (hasAny(text, ["buying-in", "unbalanced pricing", "defective pricing", "certified cost or pricing data", "truthful cost and pricing data"])) {
    return 2;
  }

  if (hasAny(text, ["price analysis", "cost analysis", "cost realism", "weighted guidelines", "profit", "fee", "prenegotiation", "pnm", "g&a", "overhead", "direct cost", "indirect cost", "technical analysis"])) {
    return 1;
  }

  if (hasAny(text, ["small business", "reasonably small lots", "delivery schedules", "subcontracting"])) {
    return 11;
  }

  if (hasAny(text, ["full and open", "sealed bidding", "contracting by negotiation", "simplified procedures", "publicizing", "rfp", "ifb", "rfq", "sam.gov"])) {
    return 10;
  }

  if (hasAny(text, ["function", "performance terms", "essential physical characteristics", "brand-name-or-equal", "restrictive"])) {
    return 9;
  }

  if (hasAny(text, ["acquisition planning", "market research", "industry day", "sources sought", "planning begins", "commercial preference"])) {
    return 8;
  }

  if (hasAny(text, ["bind the government", "warranted", "contracting officer remains", "cor", "actual authority", "unauthorized commitment"])) {
    return 7;
  }

  if (hasAny(text, ["threshold", "micro-purchase", "simplified acquisition threshold", "$100,000"])) {
    return 17;
  }

  if (hasAny(text, ["rfo", "lifecycle-based", "competitive negotiations", "best suited for further negotiation", "simplified procedures"])) {
    return 18;
  }

  return 20;
}

function inferConcept(text, bucket) {
  if (text.includes("bind the government")) {
    return "Authority concepts; warranted contracting officer actual authority.";
  }

  if (text.includes("clarification")) {
    return "RFO Part 15 clarifications versus negotiations.";
  }

  if (text.includes("best suited for further negotiation")) {
    return "RFO Part 15 competitive-range shift to proposals best suited for further negotiation.";
  }

  if (text.includes("sf 30")) {
    return "Form usage; SF 30 for solicitation amendments and contract modifications.";
  }

  if (text.includes("government property")) {
    return "Government property policy; contractor-furnished property preference and GFP conditions.";
  }

  if (text.includes("claim")) {
    return "FAR Part 33 claim and protest distinctions.";
  }

  if (text.includes("cpars")) {
    return "Post-award administration; CPARS and past performance reporting basics.";
  }

  return {
    1: "FAR Part 15.4 pricing analysis logic and negotiation documentation.",
    2: "Pricing problem recognition under negotiated acquisition rules.",
    3: "Part 15 pre-award exchange and source-selection structure.",
    4: "Protest, claim, and dispute-path concepts.",
    5: "Termination posture and performance notice logic.",
    6: "Amendment versus modification discipline.",
    7: "Actual authority and unauthorized commitment concepts.",
    8: "Acquisition planning and market research principles.",
    9: "Describing agency needs in performance or essential-characteristics terms.",
    10: "Competition framework and contracting-method selection.",
    11: "Small business participation encouragement concepts.",
    12: "Uniform Contract Format section placement.",
    13: "Core Government contracting form recognition.",
    14: "Government-furnished property policy.",
    15: "Post-award administration, quality, and acceptance roles.",
    16: "Subcontract and closeout concepts.",
    17: "Threshold-sensitive reasoning using the uploaded current framing.",
    18: "RFO-first terminology and lifecycle updates.",
    19: "Standards of conduct and procurement-integrity controls.",
    20: "Lifecycle and documentation principles.",
  }[bucket];
}

function inferTeachingNote(text, bucket) {
  if (text.includes("warranted contracting officer")) {
    return "The course material treats this as a clean authority question: only a warranted contracting officer acting within delegated authority can bind the Government.";
  }

  if (text.includes("market research")) {
    return "The uploaded Session 2 material treats market research as continuous and appropriate to the circumstances, not a one-time event.";
  }

  if (text.includes("section m")) {
    return "The UCF structure is being tested by placement: evaluation factors belong in Section M, not in proposal instructions or attachments.";
  }

  if (text.includes("weighted guidelines")) {
    return "The pricing deck and study materials tie weighted guidelines directly to structured DoD profit or fee analysis.";
  }

  if (text.includes("competitive negotiations")) {
    return "The RFO-focused Session 3 material explicitly replaces older discussions wording with competitive negotiations in its updated framing.";
  }

  return {
    1: "The pricing materials emphasize matching the analysis technique to the data posture and the question being answered.",
    2: "This scenario is testing whether you can recognize a specific pricing defect or trigger rather than just naming a generic pricing tool.",
    3: "The source-selection material separates limited clarifying exchanges from negotiation-stage exchanges and ties each one to what revisions are allowed.",
    4: "The uploaded materials keep protest and claim paths distinct, especially on who can bring them and how they are routed.",
    5: "Termination choices depend on contract posture and contractor performance, not just the Government's frustration level.",
    6: "The change instrument follows the acquisition stage first, then the type of contract action taken.",
    7: "Authority questions turn on actual contracting authority, not influence, urgency, or technical ownership.",
    8: "Planning and market research are shown as active acquisition disciplines that continue shaping the strategy.",
    9: "Requirement questions usually reward performance-based, defensible descriptions over vendor-locking language.",
    10: "The correct answer is the method or competition posture that fits the facts of the buy.",
    11: "Small business questions favor practical participation steps over cosmetic compliance language.",
    12: "This is a solicitation-structure placement question under the Uniform Contract Format.",
    13: "The forms questions are context questions: the right answer is the form that fits the action described.",
    14: "Government property is the exception path, not the default performance posture.",
    15: "Post-award questions divide contractor performance responsibility from Government administration and acceptance authority.",
    16: "Subcontract and closeout questions turn on legal relationships and whether the file is truly ready to close.",
    17: "This question is written to keep the threshold issue conceptual because the uploaded FAQ flags current threshold updates as non-dispositive for the exam bank.",
    18: "The updated materials favor current RFO terminology when old and new labels conflict.",
    19: "Integrity questions are usually testing whether someone is trying to shortcut fairness or protected information controls.",
    20: "The answer should support the contract file and lifecycle logic, not just the immediate convenience of the team.",
  }[bucket];
}

function inferDifficulty(text, bucket) {
  let difficulty = 2;

  if (bucket === 3 || bucket === 4 || bucket === 18) {
    difficulty += 1;
  }

  if (hasAny(text, ["tradeoff", "highest technically rated", "competitive negotiations", "certified cost or pricing data", "interested party", "unauthorized commitment"])) {
    difficulty += 1;
  }

  return difficulty;
}

function supplementalQuestions() {
  const source = {
    sourceLabel: "Supplemental Build",
    sessionLabel: "Custom",
    topicLabel: "Gap Coverage",
  };

  return [
    {
      id: 1001,
      bucket: 5,
      difficulty: 4,
      stem: "A contractor on a noncommercial supply contract misses a key delivery milestone and still has enough time remaining on the schedule to correct the failure. The CO wants to preserve the Government's rights before deciding whether default is appropriate. What is the best next step?",
      choices: {
        A: "Issue a cure notice that identifies the failure and gives the contractor a chance to remedy it.",
        B: "Terminate for convenience immediately because the Government should avoid documenting performance failures.",
        C: "Issue a postaward orientation memorandum and treat that as a substitute for formal notice.",
        D: "Wait until final delivery is missed, then retroactively characterize the earlier failure as excusable delay.",
      },
      correctAnswer: "A",
      source,
      concept: "Termination management; cure notice before default when time remains to cure.",
      teachingNote: "This fills a scenario gap in the source bank using the same termination concepts the study set emphasizes: match the notice posture to the performance posture before jumping to termination.",
      wrongAnswerNotes: {
        B: "Convenience is the wrong tool when the issue is a potentially remediable contractor performance failure.",
        C: "A postaward orientation is not a substitute for preserving the Government's contractual rights through the correct notice instrument.",
        D: "Delay analysis does not erase the need to address the current performance failure through the correct notice path.",
      },
      fastSeparation: "If performance is deficient but there is still time to fix it, think cure notice before you leap to default logic.",
    },
    {
      id: 1002,
      bucket: 5,
      difficulty: 4,
      stem: "A contractor is already past the delivery date on a service contract, and the Government is considering default-style action. The CO wants one more written opportunity for the contractor to explain why termination should not occur. Which notice best fits that posture?",
      choices: {
        A: "A sources sought notice",
        B: "A show-cause notice",
        C: "An abstract of offers",
        D: "A unilateral administrative change",
      },
      correctAnswer: "B",
      source,
      concept: "Termination management; show-cause notice after delinquency when the Government seeks the contractor's explanation.",
      teachingNote: "This is the classic distinction between cure notice and show-cause posture: once delinquency has already matured, the Government asks the contractor to show cause why termination should not follow.",
      wrongAnswerNotes: {
        A: "A sources sought notice is a market-research instrument, not a performance notice.",
        C: "An abstract of offers is unrelated to contract performance failures.",
        D: "An administrative change does not replace a performance notice tied to possible termination.",
      },
      fastSeparation: "Late performance plus a Government request for an explanation points to show-cause logic, not market research or modification paperwork.",
    },
    {
      id: 1003,
      bucket: 17,
      difficulty: 4,
      stem: "A trainee says the best way to survive threshold questions is to memorize every legacy dollar value from older flashcards. Based on the uploaded materials, what is the stronger exam approach?",
      choices: {
        A: "Use the older values because exam banks never lag threshold changes.",
        B: "Rely on the RFO FAQ's guidance that recent threshold updates did not drive the current question outcomes, and answer from the governing concept when the scenario is not truly about the number.",
        C: "Ignore threshold concepts altogether because they never matter on the exam.",
        D: "Treat all publicizing, SAT, and claim-threshold questions as equivalent because they all test contract administration.",
      },
      correctAnswer: "B",
      source,
      concept: "Threshold-sensitive reasoning using the uploaded FAQ's transition guidance.",
      teachingNote: "The uploaded FAQ explicitly says recent threshold updates did not affect the current exam because of how the questions are structured, so the safer study move is concept-first reasoning instead of stale-number dependence.",
      wrongAnswerNotes: {
        A: "The uploaded material itself warns against assuming threshold updates changed the bank in a way that rewards stale-number memorization.",
        C: "Threshold concepts still matter; the point is to use them correctly instead of chasing every legacy number.",
        D: "Different thresholds control different legal questions and should not be collapsed into one rule.",
      },
      fastSeparation: "When the uploaded materials warn that threshold updates are not the real discriminator, answer from the governing concept before trusting an old flashcard number.",
    },
    {
      id: 1004,
      bucket: 17,
      difficulty: 3,
      stem: "A contractor dispute question asks whether certification is required once the claim crosses the relevant threshold. Which threshold-sensitive point is actually stable across the uploaded materials?",
      choices: {
        A: "The publicizing threshold for all proposed actions",
        B: "The claim certification trigger at $100,000",
        C: "The exact current SAT dollar amount",
        D: "The exact current micro-purchase threshold in every contingency posture",
      },
      correctAnswer: "B",
      source,
      concept: "Claim certification threshold recognition under the uploaded study materials.",
      teachingNote: "Multiple uploaded items converge on the claim certification threshold at $100,000, unlike other threshold areas where the materials show transition pressure.",
      wrongAnswerNotes: {
        A: "Publicizing values appear in older prep materials and are less reliable for current-number memorization in this source set.",
        C: "The uploaded materials do not provide a clean single current SAT number to memorize for this build.",
        D: "The source set does not present one fully current number structure across all threshold contexts.",
      },
      fastSeparation: "If the threshold question is a claim-certification question, the uploaded materials consistently point to $100,000.",
    },
    {
      id: 1005,
      bucket: 18,
      difficulty: 4,
      stem: "A study partner keeps saying 'SAP' and 'discussions' as if the terminology has not changed. Under the uploaded RFO-focused materials, which pairing best reflects the current framing to prefer?",
      choices: {
        A: "Simplified acquisition procedures and discussions",
        B: "Simplified procedures and competitive negotiations",
        C: "Commercial items and communications",
        D: "Sealed bidding and factfinding",
      },
      correctAnswer: "B",
      source,
      concept: "RFO terminology shifts; simplified procedures and competitive negotiations.",
      teachingNote: "The Session 3 RFO material explicitly notes the simplified-procedures wording and the replacement of discussions with competitive negotiations in the updated framing.",
      wrongAnswerNotes: {
        A: "That is the older framing the updated materials are trying to move beyond.",
        C: "Communications is specifically flagged as eliminated as a standalone category in the updated Part 15 framing.",
        D: "Those terms do not describe the paired RFO wording shift being tested here.",
      },
      fastSeparation: "If the question is about updated labels, prefer the RFO wording the uploaded materials call out directly.",
    },
    {
      id: 1006,
      bucket: 18,
      difficulty: 4,
      stem: "A contracting team is comparing old notes to the updated course deck and sees two competitive-range formulations. Which wording should win when the site teaches from the uploaded current materials?",
      choices: {
        A: "The older competitive-range phrasing based on the most highly rated proposals, because legacy wording is safer on the exam.",
        B: "The updated phrasing focused on proposals best suited for further negotiation.",
        C: "The phrase communications range, because communications replaced clarifications.",
        D: "Any wording is acceptable because the RFO deck says Part 15 structure did not change.",
      },
      correctAnswer: "B",
      source,
      concept: "RFO Part 15 updated competitive-range wording.",
      teachingNote: "The uploaded RFO deck specifically highlights the revised standard as proposals best suited for further negotiation.",
      wrongAnswerNotes: {
        A: "Your build rule is RFO-first when old and new terminology conflict.",
        C: "The updated materials do not create a communications range; they move away from communications as a standalone exchange label.",
        D: "The deck says the structure changed materially into a lifecycle-oriented format.",
      },
      fastSeparation: "When the current deck gives the new phrase verbatim, use that phrase.",
    },
    {
      id: 1007,
      bucket: 2,
      difficulty: 4,
      stem: "During review of a negotiated proposal, the CO notices one CLIN is intentionally underpriced while another is heavily overpriced so the total looks attractive in source selection but performance cash flow is distorted. What pricing problem is the team most directly spotting?",
      choices: {
        A: "Cost realism",
        B: "Unbalanced pricing",
        C: "Weighted guidelines",
        D: "Prompt payment",
      },
      correctAnswer: "B",
      source,
      concept: "Pricing problem distinctions; unbalanced pricing.",
      teachingNote: "This is a classic pricing-distortion scenario: the problem is not merely whether the total is fair, but whether line-item pricing is materially skewed.",
      wrongAnswerNotes: {
        A: "Cost realism tests whether proposed costs are realistic for performance, not whether CLIN pricing is strategically distorted across line items.",
        C: "Weighted guidelines are a profit-analysis tool, not the label for distorted CLIN pricing.",
        D: "Prompt payment concerns invoice payment timing, not proposal price structure.",
      },
      fastSeparation: "When some line items are obviously loaded and others are intentionally low, think unbalanced pricing.",
    },
    {
      id: 1008,
      bucket: 2,
      difficulty: 4,
      stem: "A contractor negotiated a sole-source action above the applicable threshold and later the Government learns the contractor's certified submission omitted accurate vendor quotes that would have lowered the price. Which pricing problem is most directly in play?",
      choices: {
        A: "Buying-in",
        B: "Defective pricing tied to certified cost or pricing data",
        C: "Adequate price competition",
        D: "Technical leveling",
      },
      correctAnswer: "B",
      source,
      concept: "Pricing problem distinctions; defective pricing and certified cost or pricing data.",
      teachingNote: "Once certified cost or pricing data are required, omission of accurate, relevant data can trigger defective-pricing concerns.",
      wrongAnswerNotes: {
        A: "Buying-in is strategic low pricing, not the failure to disclose accurate certified data.",
        C: "Adequate price competition is an exception concept, not the defect described here.",
        D: "Technical leveling is not the pricing issue being tested.",
      },
      fastSeparation: "Bad or incomplete certified data points to defective pricing, not just aggressive pricing.",
    },
    {
      id: 1009,
      bucket: 7,
      difficulty: 4,
      stem: "A program office directed a contractor to start extra work before the CO signed anything, and the contractor now wants payment. Which authority concept should the team analyze first?",
      choices: {
        A: "Unauthorized commitment",
        B: "Adequate price competition",
        C: "Sealed bidding",
        D: "Contract closeout",
      },
      correctAnswer: "A",
      source,
      concept: "Authority concepts; unauthorized commitment analysis.",
      teachingNote: "When someone without contracting authority causes the Government to appear bound, the first authority issue is unauthorized commitment.",
      wrongAnswerNotes: {
        B: "Competition posture does not answer whether the Government was properly bound.",
        C: "The contracting method is not the immediate legal problem in the scenario.",
        D: "Closeout is far downstream from the authority problem described.",
      },
      fastSeparation: "Unauthorized work direction by a non-CO is an authority problem before it is anything else.",
    },
    {
      id: 1010,
      bucket: 20,
      difficulty: 3,
      stem: "A reviewer sees that the file contains the award document but almost no explanation tying the mission need, market research, competition approach, and pricing rationale together. What contract-principles lesson is the site supposed to reinforce?",
      choices: {
        A: "A valid contract file can rely on oral team memory if the final price looks fair.",
        B: "Documentation should show the logic of the acquisition across the lifecycle, not just the final signed instrument.",
        C: "Documentation matters only if a protest is filed.",
        D: "The contract file is mainly for contractor invoicing and does not need acquisition strategy support.",
      },
      correctAnswer: "B",
      source,
      concept: "Lifecycle and documentation concepts; contract file rationale support.",
      teachingNote: "The uploaded foundational materials repeatedly stress that the file should show how the Government got to the action, not merely preserve the end document.",
      wrongAnswerNotes: {
        A: "The source material rejects verbal-only logic when the file must support legality and rationale.",
        C: "Documentation is not a protest-only exercise.",
        D: "Invoices are only one small downstream use of the file.",
      },
      fastSeparation: "If the answer treats documentation as optional or protest-only, it is almost certainly wrong.",
    },
  ];
}

function hasAny(text, terms) {
  return terms.some((term) => {
    const escaped = escapeRegExp(term).replaceAll("\\ ", "\\s+");
    const startsWord = /[A-Za-z0-9]/.test(term[0]);
    const endsWord = /[A-Za-z0-9]/.test(term[term.length - 1]);
    const pattern = `${startsWord ? "\\b" : ""}${escaped}${endsWord ? "\\b" : ""}`;

    return new RegExp(pattern, "i").test(text);
  });
}

function normalizeSpacing(text) {
  return text.replace(/\s+/g, " ").trim();
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
