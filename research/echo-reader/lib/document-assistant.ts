import type { DocumentPassage, LocalDocument, SearchResult } from "./document-search";
import { normalizeSearchText, searchLocalDocument } from "./document-search";

export type DocumentAnswer = {
  request: string;
  answer: string;
  source: DocumentPassage | null;
  searchResult: SearchResult | null;
  status: "grounded" | "not_found";
};

export type StudyQuestion = {
  id: string;
  type: "definition" | "detail" | "sequence" | "reflection";
  question: string;
  answer: string;
  sourcePassageId: string;
  page: number;
};

const LEADING_REQUESTS = /^(?:please\s+)?(?:can you\s+)?(?:tell me about|what is|what are|look up|find|search(?: for)?|explain|read|show me|where is|where are)\s+/i;
const QUESTION_STOP_WORDS = new Set(["a", "an", "and", "are", "for", "in", "is", "of", "on", "the", "to", "what", "where", "with"]);

function firstCompleteSentences(text: string, maximum = 2): string {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  return sentences
    .slice(0, maximum)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .join(" ");
}

function requestKeywords(request: string): string {
  const withoutLead = request.replace(LEADING_REQUESTS, "").trim();
  return normalizeSearchText(withoutLead.replace(/[?]+$/g, ""))
    .split(" ")
    .filter((term) => term.length >= 2 && !QUESTION_STOP_WORDS.has(term))
    .join(" ");
}

export function answerFromLocalDocument(document: LocalDocument, request: string): DocumentAnswer {
  const lookup = requestKeywords(request);
  const results = searchLocalDocument(document, lookup || request);
  const best = results[0];

  if (!best) {
    return {
      request,
      answer: "I could not find that in the documents loaded on this device.",
      source: null,
      searchResult: null,
      status: "not_found",
    };
  }

  return {
    request,
    answer: firstCompleteSentences(best.passage.text),
    source: best.passage,
    searchResult: best,
    status: "grounded",
  };
}

function sentenceSubject(sentence: string): string {
  const normalized = sentence.replace(/\s+/g, " ").trim();
  const subjectMatch = normalized.match(/^(.{3,65}?)\s+(?:is|are|was|were|means|refers to|includes|contains|provides|describes|explains)\s+/i);
  if (subjectMatch?.[1]) return subjectMatch[1].replace(/^(the|a|an)\s+/i, "").trim();

  const words = normalized.split(" ").filter(Boolean);
  return words.slice(0, Math.min(6, words.length)).join(" ");
}

function meaningfulSentences(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [])
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter((sentence) => sentence.length >= 24);
}

export function generateStudyQuestions(passage: DocumentPassage, maximum = 4): StudyQuestion[] {
  const sentences = meaningfulSentences(passage.text);
  const sourceTerms = normalizeSearchText(passage.text)
    .split(" ")
    .filter((term) => term.length >= 6)
    .slice(0, 3);

  const questions = sentences.slice(0, maximum).map((sentence, index) => {
    const subject = sentenceSubject(sentence);
    const questionType: StudyQuestion["type"] =
      /first|then|before|after|next|step/i.test(sentence)
        ? "sequence"
        : /is|are|means|refers to/i.test(sentence)
          ? "definition"
          : index === maximum - 1
            ? "reflection"
            : "detail";

    const prompt =
      questionType === "definition"
        ? `What does the document say about ${subject}?`
        : questionType === "sequence"
          ? `What step or order does the document describe for ${subject}?`
          : questionType === "reflection"
            ? `Why is ${subject || sourceTerms.join(" ")} important in this passage?`
            : `According to the document, what should you remember about ${subject}?`;

    return {
      id: `${passage.id}-question-${index + 1}`,
      type: questionType,
      question: prompt,
      answer: sentence,
      sourcePassageId: passage.id,
      page: passage.page,
    };
  });

  if (questions.length > 0) return questions;

  return [
    {
      id: `${passage.id}-question-1`,
      type: "detail",
      question: "What is the main point of this passage?",
      answer: passage.text,
      sourcePassageId: passage.id,
      page: passage.page,
    },
  ];
}
