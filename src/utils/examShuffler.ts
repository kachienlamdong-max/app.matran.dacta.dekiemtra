import { ExamPackage, QuestionPart1, QuestionPart2, QuestionPart3, QuestionPart4, ShuffledExamCode, Part2Statement } from '../types';

// Deterministic pseudo-random number generator for consistent shuffling based on seed
function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffleArray<T>(array: T[], rng: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generate4ShuffledCodes(examPkg: ExamPackage): ShuffledExamCode[] {
  const codes = ['101', '102', '103', '104'];
  const results: ShuffledExamCode[] = [];

  codes.forEach((code, index) => {
    // Seed based on code and exam title length
    const seed = parseInt(code, 10) * 17 + (index + 1) * 31 + (examPkg.info.subject.length * 7);
    const rng = createSeededRandom(seed);

    let part1List: QuestionPart1[] = [];
    let part2List: QuestionPart2[] = [];
    let part3List: QuestionPart3[] = [];
    let part4List: QuestionPart4[] = [];

    // --- PART 1 SHUFFLE ---
    if (code === '101') {
      // Code 101 keeps original order or light touch
      part1List = examPkg.questions.part1.map((q, qIdx) => ({
        ...q,
        number: qIdx + 1,
      }));
    } else {
      // Shuffle Part 1 questions and options
      const shuffledQ = shuffleArray(examPkg.questions.part1, rng);
      part1List = shuffledQ.map((origQ, qIdx) => {
        // Option keys
        const optionKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
        // Shuffle the text values
        const origOptionsList = optionKeys.map(k => ({
          originalKey: k,
          text: origQ.options[k],
          isCorrect: origQ.answer === k
        }));

        const shuffledOptions = shuffleArray(origOptionsList, rng);

        const newOptions = {
          A: shuffledOptions[0].text,
          B: shuffledOptions[1].text,
          C: shuffledOptions[2].text,
          D: shuffledOptions[3].text,
        };

        const correctIdx = shuffledOptions.findIndex(o => o.isCorrect);
        const newAnswer = optionKeys[correctIdx >= 0 ? correctIdx : 0];

        return {
          ...origQ,
          number: qIdx + 1,
          options: newOptions,
          answer: newAnswer,
        };
      });
    }

    // --- PART 2 SHUFFLE ---
    if (code === '101') {
      part2List = examPkg.questions.part2.map((q, qIdx) => ({
        ...q,
        number: qIdx + 1,
      }));
    } else {
      const shuffledQ2 = shuffleArray(examPkg.questions.part2, rng);
      part2List = shuffledQ2.map((origQ, qIdx) => {
        const shuffledStmts = shuffleArray(origQ.statements, rng);
        const subIds: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];
        const newStatements: Part2Statement[] = shuffledStmts.map((stmt, sIdx) => ({
          ...stmt,
          id: subIds[sIdx],
        }));

        return {
          ...origQ,
          number: qIdx + 1,
          statements: newStatements,
        };
      });
    }

    // --- PART 3 SHUFFLE ---
    if (code === '101') {
      part3List = examPkg.questions.part3.map((q, qIdx) => ({
        ...q,
        number: qIdx + 1,
      }));
    } else {
      const shuffledQ3 = shuffleArray(examPkg.questions.part3, rng);
      part3List = shuffledQ3.map((origQ, qIdx) => ({
        ...origQ,
        number: qIdx + 1,
      }));
    }

    // --- PART 4 (ESSAY) ---
    // Keep essay questions orderly or sequentially formatted
    part4List = examPkg.questions.part4.map((q, qIdx) => ({
      ...q,
      number: qIdx + 1,
    }));

    // Build answer key
    const part1Answers: { [qNum: number]: string } = {};
    part1List.forEach(q => {
      part1Answers[q.number] = q.answer;
    });

    const part2Answers: { [qNum: number]: { [subId: string]: boolean } } = {};
    part2List.forEach(q => {
      part2Answers[q.number] = {
        a: q.statements.find(s => s.id === 'a')?.isCorrect ?? false,
        b: q.statements.find(s => s.id === 'b')?.isCorrect ?? false,
        c: q.statements.find(s => s.id === 'c')?.isCorrect ?? false,
        d: q.statements.find(s => s.id === 'd')?.isCorrect ?? false,
      };
    });

    const part3Answers: { [qNum: number]: string } = {};
    part3List.forEach(q => {
      part3Answers[q.number] = q.answer;
    });

    const part4Guides: { [qNum: number]: { points: number; steps: { step: string; points: number }[] } } = {};
    part4List.forEach(q => {
      part4Guides[q.number] = {
        points: q.maxPoints,
        steps: q.gradingGuide,
      };
    });

    results.push({
      code,
      questions: {
        part1: part1List,
        part2: part2List,
        part3: part3List,
        part4: part4List,
      },
      answerKey: {
        part1Answers,
        part2Answers,
        part3Answers,
        part4Guides,
      },
    });
  });

  return results;
}

export const shuffle4Codes = generate4ShuffledCodes;
