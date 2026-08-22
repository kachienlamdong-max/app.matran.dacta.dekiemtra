import React from 'react';
import {
  Settings,
  BookOpen,
  GraduationCap,
  Clock,
  School,
  Sliders,
  CheckCircle,
  Sparkles,
  Layers,
  FileCheck,
} from 'lucide-react';
import { ExamGeneralInfo, StructureOption, CustomStructureConfig } from '../types';
import { SUBJECT_LIST, GRADE_LIST, EXAM_TYPE_LIST, SubjectPreset } from '../utils/curriculumSamples';
import { DocumentUploader } from './DocumentUploader';

interface MatrixConfigFormProps {
  info: ExamGeneralInfo;
  setInfo: React.Dispatch<React.SetStateAction<ExamGeneralInfo>>;
  onGenerateMatrix: () => void;
  isGenerating: boolean;
}

export const MatrixConfigForm: React.FC<MatrixConfigFormProps> = ({
  info,
  setInfo,
  onGenerateMatrix,
  isGenerating,
}) => {
  const handleStructureChange = (option: StructureOption) => {
    let custom: CustomStructureConfig = { ...info.customConfig };

    if (option === 'option1') {
      // 4 parts: 12 TN 4 options (3đ), 4 TN Đúng/Sai (4đ), 4 Trả lời ngắn (2đ), 1 Tự luận (1đ) = 10đ
      custom = {
        part1Count: 12,
        part1Points: 3.0,
        part2Count: 4,
        part2Points: 4.0,
        part3Count: 4,
        part3Points: 2.0,
        part4Count: 1,
        part4Points: 1.0,
        totalPoints: 10.0,
      };
    } else if (option === 'option2') {
      // 3 parts: 16 TN 4 options (4đ), 4 TN Đúng/Sai (4đ), 2 Tự luận (2đ) = 10đ
      custom = {
        part1Count: 16,
        part1Points: 4.0,
        part2Count: 4,
        part2Points: 4.0,
        part3Count: 0,
        part3Points: 0.0,
        part4Count: 2,
        part4Points: 2.0,
        totalPoints: 10.0,
      };
    } else if (option === 'option3') {
      // Không tự luận: 24 TN 4 options (6đ), 8 Trả lời ngắn (4đ) = 10đ
      custom = {
        part1Count: 24,
        part1Points: 6.0,
        part2Count: 0,
        part2Points: 0.0,
        part3Count: 8,
        part3Points: 4.0,
        part4Count: 0,
        part4Points: 0.0,
        totalPoints: 10.0,
      };
    }

    setInfo((prev) => ({
      ...prev,
      structureOption: option,
      customConfig: custom,
    }));
  };

  const handleCustomPartChange = (field: keyof CustomStructureConfig, value: number) => {
    setInfo((prev) => {
      const updated = {
        ...prev.customConfig,
        [field]: Number(value) || 0,
      };
      // calculate total
      updated.totalPoints =
        (updated.part1Points || 0) +
        (updated.part2Points || 0) +
        (updated.part3Points || 0) +
        (updated.part4Points || 0);

      return {
        ...prev,
        customConfig: updated,
      };
    });
  };

  const handleApplyPreset = (preset: SubjectPreset) => {
    setInfo((prev) => ({
      ...prev,
      subject: preset.subject,
      grade: preset.grade,
      examType: preset.examType,
      durationMinutes: preset.durationMinutes,
      requirementsText: preset.sampleRequirements,
      sourceFileName: `Mẫu chuẩn GDPT 2018 - ${preset.subject} ${preset.grade}`,
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. General Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                1. Thông tin chung về đề kiểm tra
              </h3>
              <p className="text-xs text-slate-500">
                Thiết lập bộ môn, cấp học và thời lượng chuẩn bị kiểm tra
              </p>
            </div>
          </div>
          <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full font-semibold">
            Thang điểm: 10,0
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Subject */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              Môn học:
            </label>
            <select
              value={info.subject}
              onChange={(e) => setInfo((prev) => ({ ...prev, subject: e.target.value }))}
              className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden"
            >
              {SUBJECT_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Grade */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              Khối lớp:
            </label>
            <select
              value={info.grade}
              onChange={(e) => setInfo((prev) => ({ ...prev, grade: e.target.value }))}
              className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden"
            >
              {GRADE_LIST.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Type */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              Đợt kiểm tra:
            </label>
            <select
              value={info.examType}
              onChange={(e) => setInfo((prev) => ({ ...prev, examType: e.target.value }))}
              className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden"
            >
              {EXAM_TYPE_LIST.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Thời gian làm bài:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={15}
                max={180}
                step={5}
                value={info.durationMinutes}
                onChange={(e) =>
                  setInfo((prev) => ({ ...prev, durationMinutes: Number(e.target.value) || 45 }))
                }
                className="w-full text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden"
              />
              <span className="text-xs font-medium text-slate-500 shrink-0">phút</span>
            </div>
          </div>
        </div>

        {/* Department & School Name */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Sở / Phòng GD&ĐT:
            </label>
            <input
              type="text"
              placeholder="VD: SỞ GIÁO DỤC VÀ ĐÀO TẠO HÀ NỘI"
              value={info.departmentName}
              onChange={(e) => setInfo((prev) => ({ ...prev, departmentName: e.target.value }))}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Trường học / Đơn vị:
            </label>
            <input
              type="text"
              placeholder="VD: TRƯỜNG THPT CHUYÊN HÀ NỘI - AMSTERDAM"
              value={info.schoolName}
              onChange={(e) => setInfo((prev) => ({ ...prev, schoolName: e.target.value }))}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Năm học:
            </label>
            <input
              type="text"
              placeholder="VD: 2024 - 2025"
              value={info.academicYear}
              onChange={(e) => setInfo((prev) => ({ ...prev, academicYear: e.target.value }))}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 2. Flexible Structure Option Selection (Requirement 3) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                2. Cấu hình cấu trúc đề thi (4 Tùy chọn linh hoạt)
              </h3>
              <p className="text-xs text-slate-500">
                Lựa chọn định dạng đề phù hợp với đặc thù môn học và đợt kiểm tra
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Option 1: 4 forms */}
          <div
            onClick={() => handleStructureChange('option1')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
              info.structureOption === 'option1'
                ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                : 'border-slate-200 hover:border-blue-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Tùy chọn 1 (Chuẩn BGD 2025)
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">Đầy đủ 4 dạng câu hỏi</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  • <strong>Phần I:</strong> TNKQ 4 lựa chọn (12 câu - 3.0đ)<br />
                  • <strong>Phần II:</strong> TN Đúng/Sai 4 ý (4 câu - 4.0đ)<br />
                  • <strong>Phần III:</strong> Trả lời ngắn (4 câu - 2.0đ)<br />
                  • <strong>Phần IV:</strong> Tự luận (1 câu - 1.0đ)
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  info.structureOption === 'option1'
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300'
                }`}
              >
                {info.structureOption === 'option1' && <CheckCircle className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>

          {/* Option 2: 3 forms */}
          <div
            onClick={() => handleStructureChange('option2')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
              info.structureOption === 'option2'
                ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                : 'border-slate-200 hover:border-blue-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Tùy chọn 2
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">3 dạng câu hỏi (Có Tự luận)</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  • <strong>Phần I:</strong> TNKQ 4 lựa chọn (16 câu - 4.0đ)<br />
                  • <strong>Phần II:</strong> TN Đúng/Sai 4 ý (4 câu - 4.0đ)<br />
                  • <strong>Phần IV:</strong> Tự luận (2 câu - 2.0đ)
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  info.structureOption === 'option2'
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300'
                }`}
              >
                {info.structureOption === 'option2' && <CheckCircle className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>

          {/* Option 3: TN + Trả lời ngắn (Không tự luận) */}
          <div
            onClick={() => handleStructureChange('option3')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
              info.structureOption === 'option3'
                ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                : 'border-slate-200 hover:border-blue-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Tùy chọn 3
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">Trắc nghiệm + Trả lời ngắn (Không Tự luận)</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  • <strong>Phần I:</strong> TNKQ 4 lựa chọn (24 câu - 6.0đ)<br />
                  • <strong>Phần III:</strong> Trả lời ngắn (8 câu - 4.0đ)<br />
                  • Phù hợp với bài thi 100% trắc nghiệm khách quan
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  info.structureOption === 'option3'
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300'
                }`}
              >
                {info.structureOption === 'option3' && <CheckCircle className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>

          {/* Option 4: Custom */}
          <div
            onClick={() => handleStructureChange('option4')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
              info.structureOption === 'option4'
                ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                : 'border-slate-200 hover:border-blue-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Tùy chọn 4
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">Tùy chỉnh số lượng câu & điểm số</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  • Giáo viên chủ động quy định số lượng câu và điểm cho từng phần.<br />
                  • Tổng điểm tự động cộng dồn ({info.customConfig.totalPoints.toFixed(1)}đ).
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  info.structureOption === 'option4'
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300'
                }`}
              >
                {info.structureOption === 'option4' && <CheckCircle className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Configuration Panel (When Option 4 is active) */}
        {info.structureOption === 'option4' && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mt-2 space-y-3">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-700" />
              Chi tiết cấu hình tùy chỉnh từng phần:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Part 1 */}
              <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                <span className="font-bold text-slate-800 block">Phần I: TN 4 Lựa chọn</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] text-slate-500">Số câu:</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={info.customConfig.part1Count}
                    onChange={(e) => handleCustomPartChange('part1Count', Number(e.target.value))}
                    className="w-16 text-xs font-bold border border-slate-300 rounded px-2 py-1 text-center"
                  />
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] text-slate-500">Điểm:</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.25}
                    value={info.customConfig.part1Points}
                    onChange={(e) => handleCustomPartChange('part1Points', Number(e.target.value))}
                    className="w-16 text-xs font-bold border border-slate-300 rounded px-2 py-1 text-center"
                  />
                </div>
              </div>

              {/* Part 2 */}
              <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                <span className="font-bold text-slate-800 block">Phần II: TN Đúng / Sai</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] text-slate-500">Số câu:</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={info.customConfig.part2Count}
                    onChange={(e) => handleCustomPartChange('part2Count', Number(e.target.value))}
                    className="w-16 text-xs font-bold border border-slate-300 rounded px-2 py-1 text-center"
                  />
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] text-slate-500">Điểm:</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.25}
                    value={info.customConfig.part2Points}
                    onChange={(e) => handleCustomPartChange('part2Points', Number(e.target.value))}
                    className="w-16 text-xs font-bold border border-slate-300 rounded px-2 py-1 text-center"
                  />
                </div>
              </div>

              {/* Part 3 */}
              <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                <span className="font-bold text-slate-800 block">Phần III: Trả lời ngắn</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] text-slate-500">Số câu:</span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={info.customConfig.part3Count}
                    onChange={(e) => handleCustomPartChange('part3Count', Number(e.target.value))}
                    className="w-16 text-xs font-bold border border-slate-300 rounded px-2 py-1 text-center"
                  />
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] text-slate-500">Điểm:</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.25}
                    value={info.customConfig.part3Points}
                    onChange={(e) => handleCustomPartChange('part3Points', Number(e.target.value))}
                    className="w-16 text-xs font-bold border border-slate-300 rounded px-2 py-1 text-center"
                  />
                </div>
              </div>

              {/* Part 4 */}
              <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                <span className="font-bold text-slate-800 block">Phần IV: Tự luận</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] text-slate-500">Số câu:</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={info.customConfig.part4Count}
                    onChange={(e) => handleCustomPartChange('part4Count', Number(e.target.value))}
                    className="w-16 text-xs font-bold border border-slate-300 rounded px-2 py-1 text-center"
                  />
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] text-slate-500">Điểm:</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.25}
                    value={info.customConfig.part4Points}
                    onChange={(e) => handleCustomPartChange('part4Points', Number(e.target.value))}
                    className="w-16 text-xs font-bold border border-slate-300 rounded px-2 py-1 text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Input Requirements File & Text (Requirement 2) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                3. Tải file & Căn cứ Yêu cầu cần đạt (Chương trình GDPT 2018)
              </h3>
              <p className="text-xs text-slate-500">
                Hệ thống AI sẽ đối chiếu chính xác 100% nội dung này để sinh Ma trận & Đặc tả
              </p>
            </div>
          </div>
        </div>

        <DocumentUploader
          requirementsText={info.requirementsText}
          setRequirementsText={(text) => setInfo((prev) => ({ ...prev, requirementsText: text }))}
          sourceFileName={info.sourceFileName}
          setSourceFileName={(name) => setInfo((prev) => ({ ...prev, sourceFileName: name }))}
          selectedSubject={info.subject}
          setSelectedSubject={(subject) => setInfo((prev) => ({ ...prev, subject }))}
          selectedGrade={info.grade}
          setSelectedGrade={(grade) => setInfo((prev) => ({ ...prev, grade }))}
          onApplyPreset={handleApplyPreset}
        />
      </div>

      {/* Generate Action Trigger Button */}
      <div className="flex items-center justify-center pt-2">
        <button
          type="button"
          disabled={isGenerating}
          onClick={onGenerateMatrix}
          className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>AI đang phân tích Yêu cầu cần đạt & Xây dựng Ma trận...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>Tạo Ma Trận & Bản Đặc Tả Chuẩn Bộ GD&ĐT (AI)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
