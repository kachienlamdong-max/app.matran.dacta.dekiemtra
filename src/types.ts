export type StructureOption = 'option1' | 'option2' | 'option3' | 'option4';

export interface TeacherProfile {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  gradeLevel: string;
  schoolName: string;
  province?: string;
  createdAt: string;
  avatarColor?: string;
}

export interface CustomStructureConfig {
  part1Count: number; // TNKQ 1 lựa chọn
  part1Points: number;
  part2Count: number; // TN Đúng/Sai
  part2Points: number;
  part3Count: number; // Trả lời ngắn
  part3Points: number;
  part4Count: number; // Tự luận
  part4Points: number;
  totalPoints: number;
}

export interface ExamGeneralInfo {
  subject: string;
  grade: string;
  examType: string; // 'Giữa kì 1' | 'Cuối kì 1' | 'Giữa kì 2' | 'Cuối kì 2' | '15 phút' | '1 tiết' | 'Khảo sát / Đề thi thử THPT'
  durationMinutes: number;
  schoolName: string;
  departmentName: string; // Sở GD&ĐT / Phòng GD&ĐT
  academicYear: string;
  examTitle: string;
  structureOption: StructureOption;
  customConfig: CustomStructureConfig;
  requirementsText: string;
  sourceFileName?: string;
}

export interface MatrixTopicRow {
  id: string;
  topicName: string;
  contentUnits: string[];
  part1: { nhanBiet: number; thongHieu: number; vanDung: number; vanDungCao: number };
  part2: { nhanBiet: number; thongHieu: number; vanDung: number; vanDungCao: number };
  part3: { nhanBiet: number; thongHieu: number; vanDung: number; vanDungCao: number };
  part4: { nhanBiet: number; thongHieu: number; vanDung: number; vanDungCao: number };
  totalQuestions: number;
  totalPoints: number;
  ratioPercent: number;
}

export interface MatrixData {
  topics: MatrixTopicRow[];
  summary: {
    nhanBietPoints: number;
    thongHieuPoints: number;
    vanDungPoints: number;
    vanDungCaoPoints: number;
    totalPoints: number;
    nhanBietPercent: number;
    thongHieuPercent: number;
    vanDungPercent: number;
    vanDungCaoPercent: number;
    part1TotalPoints: number;
    part2TotalPoints: number;
    part3TotalPoints: number;
    part4TotalPoints: number;
  };
}

export interface SpecItem {
  id: string;
  order: number;
  topic: string;
  unit: string;
  learningOutcomes: string;
  partType: 'part1' | 'part2' | 'part3' | 'part4';
  partTypeName: string;
  cognitiveLevel: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  questionNumberStr: string;
  pointValue: number;
}

export interface QuestionPart1 {
  id: string;
  number: number;
  prompt: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  topic: string;
  level: string;
}

export interface Part2Statement {
  id: 'a' | 'b' | 'c' | 'd';
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuestionPart2 {
  id: string;
  number: number;
  prompt: string;
  statements: Part2Statement[];
  topic: string;
  level: string;
}

export interface QuestionPart3 {
  id: string;
  number: number;
  prompt: string;
  answer: string;
  explanation: string;
  topic: string;
  level: string;
}

export interface QuestionPart4 {
  id: string;
  number: number;
  prompt: string;
  maxPoints: number;
  gradingGuide: {
    step: string;
    points: number;
  }[];
  topic: string;
  level: string;
}

export interface ExamPackage {
  info: ExamGeneralInfo;
  matrix: MatrixData;
  specification: SpecItem[];
  questions: {
    part1: QuestionPart1[];
    part2: QuestionPart2[];
    part3: QuestionPart3[];
    part4: QuestionPart4[];
  };
}

export interface ShuffledExamCode {
  code: string; // '101' | '102' | '103' | '104'
  questions: {
    part1: QuestionPart1[];
    part2: QuestionPart2[];
    part3: QuestionPart3[];
    part4: QuestionPart4[];
  };
  answerKey: {
    part1Answers: { [qNum: number]: string };
    part2Answers: { [qNum: number]: { [subId: string]: boolean } };
    part3Answers: { [qNum: number]: string };
    part4Guides: { [qNum: number]: { points: number; steps: { step: string; points: number }[] } };
  };
}

export interface AppStats {
  totalTeachers: number;
  totalExamsGenerated: number;
  totalMatrixCreated: number;
  totalWordDownloads: number;
  subjectCounts: { [subject: string]: number };
  activeUsersOnline: number;
}

export interface TeacherFeedback {
  id: string;
  teacherName: string;
  schoolName: string;
  subject: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}
