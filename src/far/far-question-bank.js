export const FAR_PARTS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "19",
  "31",
  "32",
  "33",
  "42",
  "44",
  "46",
  "49",
];

export const FAR_PART_TITLES = {
  1: "Federal Acquisition Regulations System",
  2: "Definitions of Words and Terms",
  3: "Improper Business Practices and Personal Conflicts of Interest",
  4: "Administrative and Information Matters",
  5: "Publicizing Contract Actions",
  6: "Competition Requirements",
  7: "Acquisition Planning",
  8: "Required Sources of Supplies and Services",
  9: "Contractor Qualifications",
  10: "Market Research",
  11: "Describing Agency Needs",
  12: "Acquisition of Commercial Items",
  13: "Simplified Acquisition Procedures",
  14: "Sealed Bidding",
  15: "Contracting by Negotiation",
  16: "Types of Contracts",
  19: "Small Business Programs",
  31: "Contract Cost Principles and Procedures",
  32: "Contract Financing",
  33: "Protests, Disputes, and Appeals",
  42: "Contract Administration and Audit Services",
  44: "Subcontracting Policies and Procedures",
  46: "Quality Assurance",
  49: "Termination of Contracts",
};

export const FAR_QUESTION_BANK = [
  makeQuestion({
    id: "far-001",
    farPart: "1",
    stem:
      "A team lead asks where to look for the acquisition team concept, guiding principles, deviations, and the basic role of the contracting officer. Which FAR part should come to mind first?",
    correct: "FAR Part 1",
    distractors: ["FAR Part 4", "FAR Part 7", "FAR Part 15"],
    why:
      "Part 1 is the front door for the FAR system. The uploaded session notes tie Part 1 to guiding principles, determinations and findings, deviations, and the role of the acquisition team.",
    wrong:
      "Part 4 is administrative files and information matters; Part 7 is acquisition planning; Part 15 is negotiated acquisition. Those may appear later in a scenario, but they are not the first place for the FAR system and guiding-principle frame.",
    distinction:
      "This tests whether you separate the FAR system and authority framework from planning, filing, and negotiated source-selection rules.",
    trigger: "Guiding principles, FAR system, D&F, deviations, acquisition team role.",
  }),
  makeQuestion({
    id: "far-002",
    farPart: "2",
    stem:
      "During review, two people disagree about what 'commercial product' means in the scenario. Before arguing about the acquisition method, which FAR part should they check first?",
    correct: "FAR Part 2",
    distractors: ["FAR Part 12", "FAR Part 13", "FAR Part 16"],
    why:
      "Part 2 is the definitions part. The FAR parts handout lists Part 2 as Definitions of Words and Terms, so a definition dispute should start there.",
    wrong:
      "Part 12 applies once commercial acquisition treatment is being used; Part 13 is simplified acquisition procedures; Part 16 is contract types. They rely on definitions, but they are not the definitions part.",
    distinction:
      "Definition first, procedure second. If the stem is asking what a term means, Part 2 should light up before the method parts.",
    trigger: "Meaning of a FAR term, definitions, words and terms.",
  }),
  makeQuestion({
    id: "far-003",
    farPart: "3",
    stem:
      "A contractor offers tickets to a contracting specialist while a source selection is underway, and the office is worried about procurement integrity and public trust. Which FAR part is the best recognition target?",
    correct: "FAR Part 3",
    distractors: ["FAR Part 9", "FAR Part 15", "FAR Part 33"],
    why:
      "Part 3 covers improper business practices and personal conflicts of interest. The CON materials repeatedly connect gratuities, procurement integrity, and conflict controls to standards of conduct.",
    wrong:
      "Part 9 may matter for contractor responsibility or OCI, Part 15 may govern negotiated source selection, and Part 33 covers protests and disputes. The ethics/conduct trigger points first to Part 3.",
    distinction:
      "Do not jump to source-selection mechanics just because the event happens during a source selection. The issue is improper conduct.",
    trigger: "Gratuities, procurement integrity, conflicts, improper business practices.",
  }),
  makeQuestion({
    id: "far-004",
    farPart: "4",
    stem:
      "The award is complete, but the file lacks the market research notes, price rationale, and key decision records. Which FAR part should come to mind for the basic contract-file and administrative record issue?",
    correct: "FAR Part 4",
    distractors: ["FAR Part 5", "FAR Part 7", "FAR Part 42"],
    why:
      "Part 4 is Administrative and Information Matters. The session materials tie Part 4 to contract files and documenting the history of the acquisition.",
    wrong:
      "Part 5 is publicizing, Part 7 is planning, and Part 42 is post-award administration. The question is about the administrative file record itself.",
    distinction:
      "Planning and pricing records may be created under other parts, but the file as the acquisition history is a Part 4 recognition trigger.",
    trigger: "Contract file, acquisition record, administrative documentation.",
  }),
  makeQuestion({
    id: "far-005",
    farPart: "5",
    stem:
      "A specialist asks what governs posting a proposed contract action so potential sources can see the opportunity. Which FAR part should come to mind first?",
    correct: "FAR Part 5",
    distractors: ["FAR Part 6", "FAR Part 8", "FAR Part 10"],
    why:
      "Part 5 covers publicizing contract actions. The session notes identify publicizing in the Governmentwide point of entry as a Part 5 concept.",
    wrong:
      "Part 6 is competition requirements, Part 8 is required sources, and Part 10 is market research. Those can affect strategy, but public notice is Part 5.",
    distinction:
      "Competition policy and publicizing are connected but not identical. Posting/synopsizing points to Part 5.",
    trigger: "Publicizing, synopsis, proposed contract action, opportunity posting.",
  }),
  makeQuestion({
    id: "far-006",
    farPart: "6",
    stem:
      "The team is deciding whether the action must be full and open, full and open after exclusion, or other than full and open. Which FAR part owns that decision space?",
    correct: "FAR Part 6",
    distractors: ["FAR Part 10", "FAR Part 13", "FAR Part 19"],
    why:
      "Part 6 is Competition Requirements. The attached study note says Part 6 includes full and open, full and open after exclusion, other than full and open, J&A contents and approvals, and that it does not apply to simplified acquisition procedures.",
    wrong:
      "Part 10 informs competition through market research, Part 13 has its own simplified procedures competition logic, and Part 19 covers small business programs. The full-and-open framework is Part 6.",
    distinction:
      "A common trap is confusing Part 6 competition requirements with Part 13 simplified acquisition competition. The handout expressly flags that Part 6 does not apply to SAP.",
    trigger: "Full and open, exclusions, other than full and open, J&A.",
  }),
  makeQuestion({
    id: "far-007",
    farPart: "7",
    stem:
      "A requiring activity identifies a new need and asks when the acquisition strategy work should start. Which FAR part should come to mind first?",
    correct: "FAR Part 7",
    distractors: ["FAR Part 4", "FAR Part 10", "FAR Part 11"],
    why:
      "Part 7 is Acquisition Planning. The RFO session notes emphasize that acquisition planning begins when the need is identified.",
    wrong:
      "Part 10 is market research and supports planning, Part 11 describes needs, and Part 4 is administrative records. The planning trigger is Part 7.",
    distinction:
      "Planning, market research, and describing needs travel together, but the question asks when strategy work begins.",
    trigger: "Acquisition planning, strategy, need identified.",
  }),
  makeQuestion({
    id: "far-008",
    farPart: "8",
    stem:
      "Before writing a new open-market solicitation, a buyer checks mandatory sources and required supply channels. Which FAR part should come to mind?",
    correct: "FAR Part 8",
    distractors: ["FAR Part 5", "FAR Part 6", "FAR Part 12"],
    why:
      "Part 8 is Required Sources of Supplies and Services. The FAR parts list places required sources before the open-market method parts.",
    wrong:
      "Part 5 publicizes actions, Part 6 covers competition, and Part 12 covers commercial products and services. The required-source check is Part 8.",
    distinction:
      "Do not start with competition or commercial procedures if the scenario is asking whether a required source comes first.",
    trigger: "Required sources, mandatory source check, supply priority.",
  }),
  makeQuestion({
    id: "far-009",
    farPart: "9",
    stem:
      "An offeror appears technically strong, but the team is evaluating responsibility, qualifications, and a possible organizational conflict of interest. Which FAR part is most directly implicated?",
    correct: "FAR Part 9",
    distractors: ["FAR Part 3", "FAR Part 15", "FAR Part 19"],
    why:
      "Part 9 covers Contractor Qualifications. The uploaded session notes associate Part 9 with contractor responsibility and organizational conflicts of interest.",
    wrong:
      "Part 3 is conduct and personal conflicts, Part 15 is the negotiated source-selection process, and Part 19 is small business. Responsibility and OCI point first to Part 9.",
    distinction:
      "Personal ethics concerns often point to Part 3; contractor qualification and OCI concerns point to Part 9.",
    trigger: "Responsibility, contractor qualifications, OCI.",
  }),
  makeQuestion({
    id: "far-010",
    farPart: "10",
    stem:
      "The team wants to learn what commercial solutions exist, how industry sells them, and whether the requirement can be shaped around available market capability. Which FAR part is the recognition trigger?",
    correct: "FAR Part 10",
    distractors: ["FAR Part 7", "FAR Part 11", "FAR Part 12"],
    why:
      "Part 10 is Market Research. The session materials frame market research as continuous and appropriate to the circumstances, especially for understanding commercial solutions.",
    wrong:
      "Part 7 is broader planning, Part 11 is describing the agency need, and Part 12 is the commercial acquisition policy/procedure area. The information-gathering market trigger is Part 10.",
    distinction:
      "Market research can support commercial acquisition, but market research itself is not Part 12.",
    trigger: "Market research, industry capability, commercial solutions, sources sought.",
  }),
  makeQuestion({
    id: "far-011",
    farPart: "11",
    stem:
      "A draft requirement names a specific brand even though performance characteristics would describe the need. The review comment says to reduce unnecessary restrictiveness. Which FAR part should come to mind?",
    correct: "FAR Part 11",
    distractors: ["FAR Part 6", "FAR Part 10", "FAR Part 12"],
    why:
      "Part 11 is Describing Agency Needs. The CON materials emphasize function, performance, essential physical characteristics, and minimizing restrictive provisions.",
    wrong:
      "Part 6 is competition policy, Part 10 is market research, and Part 12 is commercial acquisition. The wording of the requirement points to Part 11.",
    distinction:
      "Competition may be affected by a restrictive description, but the first FAR-part trigger is how the need is described.",
    trigger: "Function, performance, essential characteristics, brand-name restriction.",
  }),
  makeQuestion({
    id: "far-012",
    farPart: "12",
    stem:
      "Market research shows the needed service is sold in the commercial marketplace, and the team is considering the current RFO-aware commercial acquisition framework. Which FAR part should come to mind first?",
    correct: "FAR Part 12",
    distractors: ["FAR Part 10", "FAR Part 13", "FAR Part 15"],
    why:
      "Part 12 covers acquisition of commercial items in the older handout wording and commercial products/services in the RFO-aware materials. It is the commercial acquisition part.",
    wrong:
      "Part 10 helped establish what the market sells, Part 13 may apply if simplified procedures are used, and Part 15 may apply for negotiated acquisition. The commercial acquisition trigger is Part 12.",
    distinction:
      "Part 10 discovers commercial availability; Part 12 is the commercial acquisition policy/procedure frame.",
    trigger: "Commercial product or service acquisition, RFO commercial terminology.",
  }),
  makeQuestion({
    id: "far-013",
    farPart: "13",
    stem:
      "A buyer is using simplified procedures, considering quotations, purchase orders, GPC, and the legal effect of quotes. Which FAR part is the study-list target?",
    correct: "FAR Part 13",
    distractors: ["FAR Part 6", "FAR Part 12", "FAR Part 14"],
    why:
      "Part 13 is Simplified Acquisition Procedures. The attached study note specifically ties Part 13 to SAP, DD 1155, SF 1449, GPC, purchase orders, SF 44, quotations, and simplified competition logic.",
    wrong:
      "Part 6 does not apply to SAP according to the handout, Part 12 is commercial acquisition, and Part 14 is sealed bidding.",
    distinction:
      "This is one of the key handout traps: simplified acquisition has its own Part 13 competition/procedure logic rather than defaulting to Part 6.",
    trigger: "Simplified procedures, quotations, purchase orders, GPC, SF 44.",
  }),
  makeQuestion({
    id: "far-014",
    farPart: "14",
    stem:
      "The office expects award to the responsible bidder whose bid conforms to the invitation and is most advantageous considering only price and price-related factors. Which FAR part should come to mind?",
    correct: "FAR Part 14",
    distractors: ["FAR Part 13", "FAR Part 15", "FAR Part 16"],
    why:
      "Part 14 is Sealed Bidding. The scenario uses sealed-bid logic: bids, conformity to the invitation, and award based on price-related factors.",
    wrong:
      "Part 13 is simplified procedures, Part 15 is negotiation/source selection, and Part 16 is contract types. The bid/invitation frame points to Part 14.",
    distinction:
      "Bids and IFB-style award logic are Part 14; proposals, exchanges, and tradeoffs usually move you toward Part 15.",
    trigger: "Sealed bids, IFB, responsible bidder, price-related factors.",
  }),
  makeQuestion({
    id: "far-015",
    farPart: "15",
    stem:
      "A source-selection team is evaluating proposals, planning competitive negotiations under current terminology, and preparing the award decision. Which FAR part should come to mind first?",
    correct: "FAR Part 15",
    distractors: ["FAR Part 12", "FAR Part 14", "FAR Part 33"],
    why:
      "Part 15 is Contracting by Negotiation. The RFO-aware session notes highlight updated Part 15 lifecycle language, including evaluation, competitive negotiations, award, and debriefing concepts.",
    wrong:
      "Part 12 covers commercial acquisition, Part 14 covers sealed bidding, and Part 33 covers protests/disputes. Proposal evaluation and competitive negotiation point to Part 15.",
    distinction:
      "If the stem says proposals, exchanges/negotiations, source selection, tradeoff, or LPTA, Part 15 should be in the front of your mind.",
    trigger: "Proposals, source selection, competitive negotiations, tradeoff, LPTA.",
  }),
  makeQuestion({
    id: "far-016",
    farPart: "16",
    stem:
      "The decision is whether the contract should be firm-fixed-price, cost-reimbursement, time-and-materials, or another arrangement that allocates risk differently. Which FAR part applies?",
    correct: "FAR Part 16",
    distractors: ["FAR Part 12", "FAR Part 15", "FAR Part 31"],
    why:
      "Part 16 is Types of Contracts. The issue is contract type selection and risk allocation.",
    wrong:
      "Part 12 is commercial acquisition, Part 15 is negotiated acquisition procedure, and Part 31 is cost principles. None is the contract-type catalog.",
    distinction:
      "Negotiation may lead to a contract type, but the type itself is a Part 16 issue.",
    trigger: "FFP, cost-reimbursement, T&M, contract type, risk allocation.",
  }),
  makeQuestion({
    id: "far-017",
    farPart: "19",
    stem:
      "The team is considering set-asides, small business participation, realistic schedules, and ways to increase small business opportunity. Which FAR part should come to mind?",
    correct: "FAR Part 19",
    distractors: ["FAR Part 6", "FAR Part 8", "FAR Part 44"],
    why:
      "Part 19 is Small Business Programs. The session notes connect small business encouragement and participation concepts to Part 19.",
    wrong:
      "Part 6 is the broader competition framework, Part 8 is required sources, and Part 44 is subcontracting policies and procedures. Small business program treatment points to Part 19.",
    distinction:
      "Set-aside logic may affect competition, but the small business program home is Part 19.",
    trigger: "Small business, set-aside, participation, realistic schedules.",
  }),
  makeQuestion({
    id: "far-018",
    farPart: "31",
    stem:
      "A pricing analyst asks whether a proposed cost is reasonable, allocable, allowable, and limited by cost principles. Which FAR part should come to mind first?",
    correct: "FAR Part 31",
    distractors: ["FAR Part 15", "FAR Part 30", "FAR Part 32"],
    why:
      "Part 31 is Contract Cost Principles and Procedures. The exam trigger is allowable, allocable, reasonable, and cost-principle limitations.",
    wrong:
      "Part 15 includes proposal analysis and negotiations, Part 30 is cost accounting standards administration, and Part 32 is contract financing. Cost allowability points to Part 31.",
    distinction:
      "Part 15 can tell you when/how to analyze costs; Part 31 tells you whether costs are allowable under cost principles.",
    trigger: "Allowable, allocable, reasonable, cost principles.",
  }),
  makeQuestion({
    id: "far-019",
    farPart: "32",
    stem:
      "The issue is whether progress payments, performance-based payments, or another financing approach is appropriate before final delivery. Which FAR part is the first recognition target?",
    correct: "FAR Part 32",
    distractors: ["FAR Part 31", "FAR Part 42", "FAR Part 46"],
    why:
      "Part 32 is Contract Financing. The FAR parts handout places contract financing in Part 32.",
    wrong:
      "Part 31 is cost principles, Part 42 is administration, and Part 46 is quality assurance. Payment financing before final completion is Part 32.",
    distinction:
      "Do not confuse whether a cost is allowable with how the contract is financed.",
    trigger: "Contract financing, progress payments, performance-based payments.",
  }),
  makeQuestion({
    id: "far-020",
    farPart: "33",
    stem:
      "A disappointed offeror files a written objection to the solicitation before award. Which FAR part should come to mind first?",
    correct: "FAR Part 33",
    distractors: ["FAR Part 15", "FAR Part 31", "FAR Part 49"],
    why:
      "Part 33 covers Protests, Disputes, and Appeals. A written objection to a solicitation or award action is protest territory.",
    wrong:
      "Part 15 may govern the source selection being protested, Part 31 covers cost principles, and Part 49 covers terminations. The objection path is Part 33.",
    distinction:
      "Part 15 may explain the process; Part 33 explains the protest/dispute path challenging it.",
    trigger: "Protest, written objection, claim, dispute, appeal.",
  }),
  makeQuestion({
    id: "far-021",
    farPart: "42",
    stem:
      "After award, the team is assigning administration responsibilities, coordinating with administration support, and monitoring contractor performance. Which FAR part applies most directly?",
    correct: "FAR Part 42",
    distractors: ["FAR Part 4", "FAR Part 46", "FAR Part 49"],
    why:
      "Part 42 is Contract Administration and Audit Services. The session materials connect post-award administration, DCMA/DCAA support, and administration roles to Part 42.",
    wrong:
      "Part 4 is administrative records, Part 46 is quality assurance, and Part 49 is termination. Overall contract administration after award is Part 42.",
    distinction:
      "Quality and termination are post-award issues, but general contract administration is Part 42.",
    trigger: "Post-award administration, DCMA, DCAA, ACO, administration support.",
  }),
  makeQuestion({
    id: "far-022",
    farPart: "44",
    stem:
      "A prime contractor asks about subcontract consent and the Government's review of the contractor's purchasing system. Which FAR part should come to mind first?",
    correct: "FAR Part 44",
    distractors: ["FAR Part 19", "FAR Part 42", "FAR Part 46"],
    why:
      "Part 44 is Subcontracting Policies and Procedures. The FAR parts list places subcontracting policy in Part 44.",
    wrong:
      "Part 19 is small business programs, Part 42 is administration, and Part 46 is quality assurance. Subcontract consent and purchasing-system review point to Part 44.",
    distinction:
      "Small business subcontracting goals can involve Part 19, but subcontracting procedures and consent are Part 44.",
    trigger: "Subcontracts, consent to subcontract, contractor purchasing system.",
  }),
  makeQuestion({
    id: "far-023",
    farPart: "46",
    stem:
      "The question is whether the Government can inspect supplies, determine conformity, reject nonconforming work, and accept the deliverable. Which FAR part applies?",
    correct: "FAR Part 46",
    distractors: ["FAR Part 42", "FAR Part 45", "FAR Part 49"],
    why:
      "Part 46 is Quality Assurance. The uploaded Session 4 material emphasizes quality, inspection, acceptance, and nonconforming supplies as post-award quality topics.",
    wrong:
      "Part 42 is broader administration, Part 45 is Government property, and Part 49 is termination. Inspection and acceptance are Part 46 triggers.",
    distinction:
      "Part 42 administers; Part 46 tests quality, conformity, inspection, rejection, and acceptance.",
    trigger: "Inspection, acceptance, quality assurance, nonconforming supplies.",
  }),
  makeQuestion({
    id: "far-024",
    farPart: "49",
    stem:
      "Performance has gone badly, and the contracting officer is deciding between termination for convenience, default, or cause. Which FAR part should come to mind first?",
    correct: "FAR Part 49",
    distractors: ["FAR Part 33", "FAR Part 42", "FAR Part 46"],
    why:
      "Part 49 is Termination of Contracts. The study materials treat termination for convenience/default/cause and performance notices as termination-management concepts.",
    wrong:
      "Part 33 is protests/disputes/appeals, Part 42 is administration, and Part 46 is quality assurance. The termination decision points to Part 49.",
    distinction:
      "A performance problem may begin in administration or quality, but the termination remedy is Part 49.",
    trigger: "Termination for convenience, default, cause, cure notice, show-cause posture.",
  }),
];

function makeQuestion({ id, farPart, stem, correct, distractors, why, wrong, distinction, trigger }) {
  const labels = ["A", "B", "C", "D"];
  const options = [correct, ...distractors];
  const rotation = Number(farPart) % labels.length;
  const rotated = [...options.slice(rotation), ...options.slice(0, rotation)];
  const choices = labels.reduce((accumulator, label, index) => {
    accumulator[label] = rotated[index];
    return accumulator;
  }, {});
  const correctAnswer = labels.find((label) => choices[label] === correct);

  return {
    id,
    farPart,
    stem,
    choices,
    correctAnswer,
    whyCorrect: why,
    whyWrong: labels.reduce((accumulator, label) => {
      accumulator[label] =
        label === correctAnswer
          ? why
          : `${choices[label]} is not the best first FAR-part trigger here. ${wrong}`;
      return accumulator;
    }, {}),
    distinction,
    trigger,
    sourceLabel: "FAR Parts handouts + CON 3990V RFO prep",
  };
}
