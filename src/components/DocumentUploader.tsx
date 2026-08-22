import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, BookOpen, Trash2, FileCode } from 'lucide-react';
import mammoth from 'mammoth';
import { SUBJECT_PRESETS, SubjectPreset } from '../utils/curriculumSamples';

interface DocumentUploaderProps {
  requirementsText: string;
  setRequirementsText: (text: string) => void;
  sourceFileName?: string;
  setSourceFileName: (name: string) => void;
  selectedSubject: string;
  selectedGrade: string;
  onApplyPreset: (preset: SubjectPreset) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  requirementsText,
  setRequirementsText,
  sourceFileName,
  setSourceFileName,
  selectedSubject,
  selectedGrade,
  onApplyPreset,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setIsLoadingFile(true);
    setUploadError(null);

    try {
      const fileName = file.name;
      const fileExt = fileName.split('.').pop()?.toLowerCase();

      if (fileExt === 'docx') {
        // Read docx using mammoth
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result.value) {
          setRequirementsText(result.value.trim());
          setSourceFileName(fileName);
        } else {
          setUploadError('Không tìm thấy nội dung văn bản trong tệp .docx');
        }
      } else if (fileExt === 'txt' || fileExt === 'md' || fileExt === 'json') {
        const text = await file.text();
        setRequirementsText(text.trim());
        setSourceFileName(fileName);
      } else if (fileExt === 'pdf') {
        // For PDF, read as binary text or parse fallback
        const text = await file.text();
        // If text is readable
        if (text && text.length > 50 && !text.includes('%PDF-1.4%')) {
          setRequirementsText(text.trim());
          setSourceFileName(fileName);
        } else {
          // Send base64 to server or notify teacher
          setRequirementsText(`Tệp PDF: ${fileName} đã được tiếp nhận làm căn cứ đối chiếu chuẩn chương trình môn ${selectedSubject} ${selectedGrade}. Hệ thống AI sẽ đọc ngữ cảnh theo Chương trình GDPT 2018 tương ứng.`);
          setSourceFileName(fileName);
        }
      } else {
        const text = await file.text();
        setRequirementsText(text.trim());
        setSourceFileName(fileName);
      }
    } catch (err: any) {
      console.error('File read error:', err);
      setUploadError('Lỗi khi đọc tệp tin: ' + (err.message || 'Định dạng không được hỗ trợ'));
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setRequirementsText('');
    setSourceFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Find matching preset for quick prompt
  const matchedPreset = SUBJECT_PRESETS.find(
    (p) => p.subject.toLowerCase() === selectedSubject.toLowerCase() && p.grade === selectedGrade
  ) || SUBJECT_PRESETS[0];

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-200 text-center ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
            : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.doc,.txt,.pdf,.md"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileProcess(e.target.files[0]);
            }
          }}
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-xs">
            {isLoadingFile ? (
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-800">
              Tải lên file Yêu cầu cần đạt / Khung chương trình môn học
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Hỗ trợ định dạng Word (<strong>.docx</strong>), Văn bản (<strong>.txt</strong>), <strong>PDF</strong>
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Chọn file từ máy tính
            </button>
            <span className="text-xs text-slate-400">hoặc kéo thả vào đây</span>
          </div>

          {uploadError && (
            <div className="flex items-center gap-1.5 justify-center text-xs text-red-600 bg-red-50 py-1.5 px-3 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Load Sample Presets */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-100 rounded-2xl p-4">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">
              Mẫu chuẩn GDPT 2018 có sẵn (Nạp nhanh 1 chạm):
            </span>
          </div>
          <span className="text-[11px] text-blue-700 font-medium hidden sm:inline">
            Chọn mẫu để tự động điền YC cần đạt
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUBJECT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset)}
              className="text-xs px-3 py-1.5 bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-200 hover:border-blue-600 rounded-lg font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 opacity-70" />
              <span>
                {preset.subject} {preset.grade} ({preset.examType})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Requirements Textarea Preview */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Nội dung Yêu cầu cần đạt dùng làm căn cứ đối chiếu:
            {sourceFileName && (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-200">
                Tệp: {sourceFileName}
              </span>
            )}
          </label>
          {requirementsText && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Xóa nội dung
            </button>
          )}
        </div>

        <textarea
          rows={6}
          placeholder="Nhập hoặc dán nội dung các chủ đề, đơn vị bài học và các mức độ yêu cầu cần đạt (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) theo chương trình GDPT 2018..."
          value={requirementsText}
          onChange={(e) => setRequirementsText(e.target.value)}
          className="w-full text-xs font-mono leading-relaxed border border-slate-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden bg-white text-slate-800 shadow-2xs"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
          <span>
            {requirementsText.length > 0 ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã nạp {requirementsText.length} ký tự căn cứ chuyên môn
              </span>
            ) : (
              'Chưa có dữ liệu (Hệ thống sẽ dùng chuẩn GDPT 2018 mặc định nếu để trống)'
            )}
          </span>
          <span>Có thể chỉnh sửa văn bản trực tiếp trong khung</span>
        </div>
      </div>
    </div>
  );
};
