import React, { useState } from 'react';
import {
  FileText,
  Shuffle,
  Download,
  Eye,
  EyeOff,
  CheckCircle,
  FileCheck2,
  HelpCircle,
  Printer,
  Sparkles,
  ArrowLeft,
  Check,
  X,
  GraduationCap,
} from 'lucide-react';
import { ExamGeneralInfo, ShuffledExamCode, ExamPackage } from '../types';
import { MathRenderer } from '../utils/mathRenderer';

interface ExamShuffleViewProps {
  examPkg: ExamPackage;
  shuffledCodes: ShuffledExamCode[];
  onBackToMatrix: () => void;
  onExportWord: (all4Codes: boolean) => void;
  isExportingWord: boolean;
  onOpenFeedback: () => void;
}

export const ExamShuffleView: React.FC<ExamShuffleViewProps> = ({
  examPkg,
  shuffledCodes,
  onBackToMatrix,
  onExportWord,
  isExportingWord,
  onOpenFeedback,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>('101');
  const [showAnswerKeys, setShowAnswerKeys] = useState<boolean>(true);
  const [showShuffleSummary, setShowShuffleSummary] = useState<boolean>(false);

  const activeExam = shuffledCodes.find((c) => c.code === selectedCode) || shuffledCodes[0];
  const { info } = examPkg;

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMatrix}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Quay lại xem Ma trận"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Bộ Đề Kiểm Tra Chuẩn & 4 Mã Đề Đã Trộn
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Shuffle className="w-3.5 h-3.5" />
                Mã 101, 102, 103, 104
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Môn: <strong>{info.subject}</strong> • Khối: <strong>{info.grade}</strong> ({info.examType} - {info.durationMinutes} phút)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => setShowAnswerKeys(!showAnswerKeys)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              showAnswerKeys
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {showAnswerKeys ? <Eye className="w-4 h-4 text-amber-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            <span>{showAnswerKeys ? 'Đang hiện Đáp án' : 'Đang ẩn Đáp án'}</span>
          </button>

          <button
            type="button"
            disabled={isExportingWord}
            onClick={() => {
              onExportWord(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Trọn Bộ 4 Mã Đề (.docx)</span>
          </button>
        </div>
      </div>

      {/* 4 Code Switcher Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {shuffledCodes.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCode(c.code)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCode === c.code
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Mã đề {c.code}</span>
              {c.code === '101' && (
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-normal">
                  Gốc
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowShuffleSummary(!showShuffleSummary)}
          className="text-xs text-indigo-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>{showShuffleSummary ? 'Ẩn bảng ma trận đáp án' : 'Xem bảng ma trận đáp án 4 mã'}</span>
        </button>
      </div>

      {/* Answer Key Comparison Matrix (All 4 codes side-by-side) */}
      {showShuffleSummary && (
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-150 text-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              Bảng ma trận đối chiếu đáp án 4 mã đề (101, 102, 103, 104)
            </h3>
            <span className="text-[11px] text-indigo-700 font-medium">
              Tự động hoán vị phương án và cập nhật đáp án chuẩn xác
            </span>
          </div>

          {/* Part 1 Answers Comparison Table */}
          {examPkg.questions.part1.length > 0 && (
            <div className="bg-white rounded-xl border border-indigo-200 p-3 overflow-x-auto">
              <p className="text-xs font-bold text-slate-800 mb-2">Phần I: TNKQ 4 lựa chọn</p>
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-indigo-100/60 font-bold text-indigo-900 border-b border-indigo-200">
                    <th className="p-1.5 border-r border-indigo-200">Mã Đề</th>
                    {examPkg.questions.part1.map((q) => (
                      <th key={q.number} className="p-1.5 border-r border-indigo-200 min-w-[28px]">
                        C.{q.number}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {shuffledCodes.map((c) => (
                    <tr key={c.code} className="hover:bg-slate-50">
                      <td className="p-1.5 font-bold border-r border-slate-200 bg-slate-50 text-blue-900">
                        {c.code}
                      </td>
                      {examPkg.questions.part1.map((q) => (
                        <td key={q.number} className="p-1.5 font-black text-blue-700 border-r border-slate-200">
                          {c.answerKey.part1Answers[q.number] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Part 2 Answers Comparison Table */}
          {examPkg.questions.part2.length > 0 && (
            <div className="bg-white rounded-xl border border-indigo-200 p-3 overflow-x-auto">
              <p className="text-xs font-bold text-slate-800 mb-2">Phần II: TN Đúng / Sai</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {shuffledCodes.map((c) => (
                  <div key={c.code} className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                    <span className="font-bold text-blue-900 block border-b border-slate-200 pb-1 mb-1.5">
                      Mã đề {c.code}
                    </span>
                    <div className="space-y-1 text-[11px]">
                      {c.questions.part2.map((q) => {
                        const ans = c.answerKey.part2Answers[q.number] || {};
                        return (
                          <div key={q.number} className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700">Câu {q.number}:</span>
                            <span className="font-mono">
                              a-{ans.a ? 'Đ' : 'S'} | b-{ans.b ? 'Đ' : 'S'} | c-{ans.c ? 'Đ' : 'S'} | d-{ans.d ? 'Đ' : 'S'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Exam Code Paper Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-800">
        {/* Official Header Banner */}
        <div className="grid grid-cols-2 border-b-2 border-slate-800 pb-4 text-xs gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <p className="font-bold uppercase text-slate-900">
              {info.departmentName || 'SỞ GIÁO DỤC VÀ ĐÀO TẠO'}
            </p>
            <p className="font-bold uppercase text-slate-800">
              {info.schoolName || 'TRƯỜNG THPT CHUYÊN'}
            </p>
            <p className="text-[11px] text-slate-500">ĐỀ KIỂM TRA CHÍNH THỨC</p>
          </div>
          <div className="space-y-0.5 text-center sm:text-right">
            <p className="font-black text-sm uppercase text-blue-900">
              {info.examTitle || `KIỂM TRA ${info.examType.toUpperCase()}`}
            </p>
            <p className="font-semibold text-slate-800">
              MÔN: {info.subject.toUpperCase()} - {info.grade.toUpperCase()}
            </p>
            <p className="text-[11px] text-slate-600 italic">
              Thời gian: {info.durationMinutes} phút | <strong>MÃ ĐỀ: {activeExam.code}</strong>
            </p>
          </div>
        </div>

        {/* Student Name and ID */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 gap-2">
          <span>Họ và tên thí sinh: ............................................................................</span>
          <span>Số báo danh: ..........................</span>
        </div>

        {/* ========================================== */}
        {/* PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN */}
        {/* ========================================== */}
        {activeExam.questions.part1.length > 0 && (
          <div className="space-y-4">
            <div className="bg-slate-100 p-2.5 rounded-xl text-xs">
              <span className="font-bold text-slate-900 uppercase">
                PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn.
              </span>{' '}
              <span className="text-slate-600 italic">
                Thí sinh trả lời từ câu 1 đến câu {activeExam.questions.part1.length}. Mỗi câu hỏi chỉ chọn một phương án.
              </span>
            </div>

            <div className="space-y-4">
              {activeExam.questions.part1.map((q) => (
                <div key={q.id || q.number} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-950 text-xs shrink-0 bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Câu {q.number}:
                    </span>
                    <div className="text-xs text-slate-800 font-medium leading-relaxed flex-1">
                      <MathRenderer content={q.prompt} />
                    </div>
                  </div>

                  {/* 4 Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pl-2">
                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const isCorrect = q.answer === optKey;
                      return (
                        <div
                          key={optKey}
                          className={`p-2 rounded-lg border text-xs flex items-start gap-2 transition-colors ${
                            showAnswerKeys && isCorrect
                              ? 'border-emerald-500 bg-emerald-50/80 font-bold text-emerald-950 shadow-2xs'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <span
                            className={`font-bold w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 ${
                              showAnswerKeys && isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {optKey}
                          </span>
                          <div className="flex-1">
                            <MathRenderer content={q.options[optKey]} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Toggle */}
                  {showAnswerKeys && q.explanation && (
                    <div className="bg-emerald-50/60 border-l-2 border-emerald-500 p-2.5 rounded-r-lg text-xs text-emerald-950">
                      <span className="font-bold text-emerald-800 block mb-0.5">
                        * Đáp án đúng: {q.answer} • Lời giải chi tiết:
                      </span>
                      <MathRenderer content={q.explanation} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI */}
        {/* ========================================== */}
        {activeExam.questions.part2.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="bg-slate-100 p-2.5 rounded-xl text-xs">
              <span className="font-bold text-slate-900 uppercase">
                PHẦN II. Câu trắc nghiệm đúng sai.
              </span>{' '}
              <span className="text-slate-600 italic">
                Thí sinh trả lời từ câu 1 đến câu {activeExam.questions.part2.length}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.
              </span>
            </div>

            <div className="space-y-4">
              {activeExam.questions.part2.map((q) => (
                <div key={q.id || q.number} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-indigo-950 text-xs shrink-0 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                      Câu {q.number}:
                    </span>
                    <div className="text-xs text-slate-800 font-medium leading-relaxed flex-1">
                      <MathRenderer content={q.prompt} />
                    </div>
                  </div>

                  {/* 4 Statements */}
                  <div className="space-y-2 pl-2">
                    {q.statements.map((stmt) => (
                      <div
                        key={stmt.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                          showAnswerKeys
                            ? stmt.isCorrect
                              ? 'border-emerald-300 bg-emerald-50/60'
                              : 'border-rose-200 bg-rose-50/50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-2 flex-1">
                          <span className="font-bold text-slate-900 uppercase shrink-0">
                            {stmt.id})
                          </span>
                          <div className="text-slate-700">
                            <MathRenderer content={stmt.text} />
                          </div>
                        </div>

                        {showAnswerKeys && (
                          <div className="shrink-0 flex items-center gap-1.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                                stmt.isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-rose-600 text-white'
                              }`}
                            >
                              {stmt.isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              {stmt.isCorrect ? 'ĐÚNG' : 'SAI'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* PHẦN III: TRẢ LỜI NGẮN */}
        {/* ========================================== */}
        {activeExam.questions.part3.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="bg-slate-100 p-2.5 rounded-xl text-xs">
              <span className="font-bold text-slate-900 uppercase">
                PHẦN III. Câu trắc nghiệm trả lời ngắn.
              </span>{' '}
              <span className="text-slate-600 italic">
                Thí sinh trả lời từ câu 1 đến câu {activeExam.questions.part3.length}. Điền kết quả / đáp số ngắn gọn vào phiếu trả lời.
              </span>
            </div>

            <div className="space-y-4">
              {activeExam.questions.part3.map((q) => (
                <div key={q.id || q.number} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-950 text-xs shrink-0 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Câu {q.number}:
                    </span>
                    <div className="text-xs text-slate-800 font-medium leading-relaxed flex-1">
                      <MathRenderer content={q.prompt} />
                    </div>
                  </div>

                  {showAnswerKeys && (
                    <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-900">Đáp số chuẩn:</span>
                        <span className="bg-emerald-600 text-white font-mono font-bold px-2.5 py-0.5 rounded text-xs">
                          {q.answer}
                        </span>
                      </div>
                      {q.explanation && (
                        <div className="text-slate-700 text-xs pt-1">
                          <span className="font-semibold text-emerald-800">Hướng dẫn giải: </span>
                          <MathRenderer content={q.explanation} className="inline" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* PHẦN IV: TỰ LUẬN */}
        {/* ========================================== */}
        {activeExam.questions.part4.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="bg-slate-100 p-2.5 rounded-xl text-xs">
              <span className="font-bold text-slate-900 uppercase">
                PHẦN IV. Tự luận.
              </span>{' '}
              <span className="text-slate-600 italic">
                Thí sinh trình bày chi tiết lời giải hoặc bài văn vào giấy thi.
              </span>
            </div>

            <div className="space-y-4">
              {activeExam.questions.part4.map((q) => (
                <div key={q.id || q.number} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-rose-950 text-xs shrink-0 bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                      Câu {q.number} ({q.maxPoints} điểm):
                    </span>
                    <div className="text-xs text-slate-800 font-medium leading-relaxed flex-1">
                      <MathRenderer content={q.prompt} />
                    </div>
                  </div>

                  {showAnswerKeys && q.gradingGuide && q.gradingGuide.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
                      <span className="font-bold text-slate-900 block">Hướng dẫn chấm tự luận & thang điểm:</span>
                      <div className="divide-y divide-slate-100">
                        {q.gradingGuide.map((g, gIdx) => (
                          <div key={gIdx} className="py-1.5 flex items-center justify-between gap-2">
                            <span className="text-slate-700">
                              <MathRenderer content={g.step} className="inline" />
                            </span>
                            <span className="font-bold text-indigo-700 shrink-0 bg-indigo-50 px-2 py-0.5 rounded">
                              {g.points} điểm
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Marker */}
        <div className="text-center py-4 border-t border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            ---------- HẾT (MÃ ĐỀ {activeExam.code}) ----------
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Cán bộ coi thi không giải thích gì thêm
          </p>
        </div>
      </div>
    </div>
  );
};
