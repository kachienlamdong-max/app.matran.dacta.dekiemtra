import React, { useState } from 'react';
import {
  Table as TableIcon,
  FileSpreadsheet,
  FileDown,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  RefreshCw,
  Award,
} from 'lucide-react';
import { ExamGeneralInfo, MatrixData, SpecItem } from '../types';
import { MathRenderer } from '../utils/mathRenderer';

interface MatrixSpecViewProps {
  info: ExamGeneralInfo;
  matrix: MatrixData;
  specification: SpecItem[];
  onGenerateExam: () => void;
  isGeneratingExam: boolean;
  onBackToConfig: () => void;
  onExportWord: () => void;
  isExportingWord: boolean;
}

export const MatrixSpecView: React.FC<MatrixSpecViewProps> = ({
  info,
  matrix,
  specification,
  onGenerateExam,
  isGeneratingExam,
  onBackToConfig,
  onExportWord,
  isExportingWord,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'spec'>('matrix');

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToConfig}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Quay lại điều chỉnh cấu hình"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Ma Trận & Bản Đặc Tả Đề Kiểm Tra
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã chuẩn hóa GDPT 2018
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
            onClick={onExportWord}
            disabled={isExportingWord}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-blue-600" />
            <span>Xuất File Word (.docx)</span>
          </button>

          <button
            type="button"
            disabled={isGeneratingExam}
            onClick={onGenerateExam}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-60"
          >
            {isGeneratingExam ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>AI đang sinh đề & lời giải...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Sinh Đề Kiểm Tra & Đáp Án (AI)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Selector: Ma Trận / Bản Đặc Tả */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          <span>1. Khung Ma Trận Đề Kiểm Tra ({matrix.topics?.length || 0} chủ đề)</span>
        </button>

        <button
          onClick={() => setActiveTab('spec')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'spec'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>2. Bản Đặc Tả Ma Trận Đề ({specification?.length || 0} mục tiêu đánh giá)</span>
        </button>
      </div>

      {/* TAB 1: MA TRẬN ĐỀ KIỂM TRA */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="text-center space-y-1 pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 uppercase">
              MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ
            </h3>
            <p className="text-xs text-slate-600 italic">
              MÔN: {info.subject.toUpperCase()} - {info.grade.toUpperCase()} ({info.examType} - Thời gian: {info.durationMinutes} phút)
            </p>
          </div>

          {/* Matrix Table with Standard MOET Layout */}
          <div className="overflow-x-auto border border-slate-300 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center">
                  <th rowSpan={2} className="p-2.5 border-r border-slate-300 w-10">
                    TT
                  </th>
                  <th rowSpan={2} className="p-2.5 border-r border-slate-300 min-w-[200px] text-left">
                    Chủ đề / Đơn vị kiến thức
                  </th>
                  <th colSpan={4} className="p-2 border-r border-slate-300 bg-blue-50 text-blue-900">
                    Phần I: TN 4 Lựa chọn (Số câu)
                  </th>
                  <th colSpan={4} className="p-2 border-r border-slate-300 bg-indigo-50 text-indigo-900">
                    Phần II: TN Đúng/Sai (Số lệnh)
                  </th>
                  <th colSpan={3} className="p-2 border-r border-slate-300 bg-emerald-50 text-emerald-900">
                    Phần III & IV (TLN / Tự luận)
                  </th>
                  <th rowSpan={2} className="p-2 border-r border-slate-300 w-16 bg-amber-50 text-amber-900">
                    Tổng điểm
                  </th>
                  <th rowSpan={2} className="p-2 w-14 bg-amber-50 text-amber-900">
                    Tỉ lệ %
                  </th>
                </tr>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-300 text-center text-[11px]">
                  {/* Part 1 */}
                  <th className="p-1.5 border-r border-slate-200">NB</th>
                  <th className="p-1.5 border-r border-slate-200">TH</th>
                  <th className="p-1.5 border-r border-slate-200">VD</th>
                  <th className="p-1.5 border-r border-slate-300">VDC</th>
                  {/* Part 2 */}
                  <th className="p-1.5 border-r border-slate-200">NB</th>
                  <th className="p-1.5 border-r border-slate-200">TH</th>
                  <th className="p-1.5 border-r border-slate-200">VD</th>
                  <th className="p-1.5 border-r border-slate-300">VDC</th>
                  {/* Part 3 & 4 */}
                  <th className="p-1.5 border-r border-slate-200">TH</th>
                  <th className="p-1.5 border-r border-slate-200">VD</th>
                  <th className="p-1.5 border-r border-slate-300">VDC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {matrix.topics?.map((topic, idx) => (
                  <tr key={topic.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 text-center font-bold border-r border-slate-200 bg-slate-50/50">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <div className="font-bold text-slate-900">{topic.topicName}</div>
                      {topic.contentUnits && topic.contentUnits.length > 0 && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {topic.contentUnits.join(' • ')}
                        </div>
                      )}
                    </td>
                    {/* Part 1 */}
                    <td className="p-2 text-center border-r border-slate-200">{topic.part1?.nhanBiet || '-'}</td>
                    <td className="p-2 text-center border-r border-slate-200">{topic.part1?.thongHieu || '-'}</td>
                    <td className="p-2 text-center border-r border-slate-200">{topic.part1?.vanDung || '-'}</td>
                    <td className="p-2 text-center border-r border-slate-300 font-medium">{topic.part1?.vanDungCao || '-'}</td>
                    {/* Part 2 */}
                    <td className="p-2 text-center border-r border-slate-200">{topic.part2?.nhanBiet || '-'}</td>
                    <td className="p-2 text-center border-r border-slate-200">{topic.part2?.thongHieu || '-'}</td>
                    <td className="p-2 text-center border-r border-slate-200">{topic.part2?.vanDung || '-'}</td>
                    <td className="p-2 text-center border-r border-slate-300 font-medium">{topic.part2?.vanDungCao || '-'}</td>
                    {/* Part 3 & 4 */}
                    <td className="p-2 text-center border-r border-slate-200">
                      {(topic.part3?.thongHieu || 0) + (topic.part4?.thongHieu || 0) || '-'}
                    </td>
                    <td className="p-2 text-center border-r border-slate-200">
                      {(topic.part3?.vanDung || 0) + (topic.part4?.vanDung || 0) || '-'}
                    </td>
                    <td className="p-2 text-center border-r border-slate-300 font-medium">
                      {(topic.part3?.vanDungCao || 0) + (topic.part4?.vanDungCao || 0) || '-'}
                    </td>
                    {/* Points & Ratio */}
                    <td className="p-2 text-center font-bold text-blue-900 bg-amber-50/30 border-r border-slate-200">
                      {topic.totalPoints || 0}đ
                    </td>
                    <td className="p-2 text-center font-semibold text-slate-700 bg-amber-50/30">
                      {topic.ratioPercent || 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Summary Footer */}
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-center">
                  <td colSpan={2} className="p-2.5 border-r border-slate-300 text-right pr-4 uppercase">
                    Tổng điểm từng phần:
                  </td>
                  <td colSpan={4} className="p-2 border-r border-slate-300 bg-blue-100/60 text-blue-900">
                    {matrix.summary?.part1TotalPoints || 3.0} điểm
                  </td>
                  <td colSpan={4} className="p-2 border-r border-slate-300 bg-indigo-100/60 text-indigo-900">
                    {matrix.summary?.part2TotalPoints || 4.0} điểm
                  </td>
                  <td colSpan={3} className="p-2 border-r border-slate-300 bg-emerald-100/60 text-emerald-900">
                    {(matrix.summary?.part3TotalPoints || 0) + (matrix.summary?.part4TotalPoints || 0)} điểm
                  </td>
                  <td className="p-2.5 border-r border-slate-300 bg-amber-100 text-amber-950 font-black text-sm">
                    {matrix.summary?.totalPoints || 10}đ
                  </td>
                  <td className="p-2.5 bg-amber-100 text-amber-950 font-black text-sm">
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Cognitive Level Breakdown Chart/Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-blue-700 block">1. Nhận biết (NB)</span>
              <span className="text-lg font-black text-blue-950">
                {matrix.summary?.nhanBietPoints || 3.0}đ ({matrix.summary?.nhanBietPercent || 30}%)
              </span>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-indigo-700 block">2. Thông hiểu (TH)</span>
              <span className="text-lg font-black text-indigo-950">
                {matrix.summary?.thongHieuPoints || 4.0}đ ({matrix.summary?.thongHieuPercent || 40}%)
              </span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-emerald-700 block">3. Vận dụng (VD)</span>
              <span className="text-lg font-black text-emerald-950">
                {matrix.summary?.vanDungPoints || 2.0}đ ({matrix.summary?.vanDungPercent || 20}%)
              </span>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
              <span className="text-[11px] font-semibold text-rose-700 block">4. Vận dụng cao (VDC)</span>
              <span className="text-lg font-black text-rose-950">
                {matrix.summary?.vanDungCaoPoints || 1.0}đ ({matrix.summary?.vanDungCaoPercent || 10}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BẢN ĐẶC TẢ MA TRẬN ĐỀ */}
      {activeTab === 'spec' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="text-center space-y-1 pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 uppercase">
              BẢN ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ
            </h3>
            <p className="text-xs text-slate-600 italic">
              MÔN: {info.subject.toUpperCase()} - {info.grade.toUpperCase()} ({info.examType} - Thời gian: {info.durationMinutes} phút)
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center">
                  <th className="p-2.5 border-r border-slate-300 w-10">TT</th>
                  <th className="p-2.5 border-r border-slate-300 w-44 text-left">Chủ đề / Đơn vị KT</th>
                  <th className="p-2.5 border-r border-slate-300 text-left">Mức độ đánh giá / Yêu cầu cần đạt</th>
                  <th className="p-2.5 border-r border-slate-300 w-36">Dạng câu hỏi</th>
                  <th className="p-2.5 w-28">Số câu (Câu số)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {specification?.map((spec, sIdx) => (
                  <tr key={spec.id || sIdx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center font-bold border-r border-slate-200 bg-slate-50/50">
                      {sIdx + 1}
                    </td>
                    <td className="p-3 border-r border-slate-200">
                      <div className="font-bold text-slate-900">{spec.topic}</div>
                      {spec.unit && (
                        <div className="text-[11px] text-slate-500 italic mt-0.5">{spec.unit}</div>
                      )}
                    </td>
                    <td className="p-3 border-r border-slate-200 leading-relaxed">
                      <span className="font-semibold text-blue-800 mr-1.5">
                        * Mức độ {spec.cognitiveLevel}:
                      </span>
                      <MathRenderer content={spec.learningOutcomes} className="inline" />
                    </td>
                    <td className="p-3 text-center border-r border-slate-200">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium block">
                        {spec.partTypeName || spec.partType}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-indigo-900">
                      {spec.questionNumberStr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
