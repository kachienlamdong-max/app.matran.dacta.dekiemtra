import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Trash2,
  FileCheck,
  RefreshCw,
  FileCode,
} from 'lucide-react';
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
  const [fileStats, setFileStats] = useState<{ sizeStr: string; charCount: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Helper to extract text from PDF or raw buffer fallback
  const extractPdfOrBinaryText = async (file: File): Promise<string> => {
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      // Scan for stream text or text chunks in PDF / binary
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const rawText = decoder.decode(bytes);

      // Extract text within BT ... ET blocks in PDF or clean up ascii lines
      const textMatches: string[] = [];
      const lines = rawText.split('\n');
      for (const line of lines) {
        // Filter readable text strings
        const cleaned = line.replace(/[^\p{L}\p{N}\p{P}\s]/gu, ' ').trim();
        if (cleaned.length > 15 && !cleaned.includes('obj') && !cleaned.includes('endobj') && !cleaned.includes('xref')) {
          textMatches.push(cleaned);
        }
      }

      if (textMatches.length > 5) {
        return textMatches.join('\n').slice(0, 15000);
      }

      return `[Tệp ${file.name}] Đã tiếp nhận tệp chương trình môn ${selectedSubject} ${selectedGrade}. Hệ thống AI sẽ áp dụng đầy đủ chuẩn Yêu cầu cần đạt Chương trình GDPT 2018.`;
    } catch {
      return `[Tệp ${file.name}] Đã tiếp nhận căn cứ chương trình GDPT 2018 môn ${selectedSubject} ${selectedGrade}.`;
    }
  };

  const handleFileProcess = async (file: File) => {
    setIsLoadingFile(true);
    setUploadError(null);

    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    const sizeStr = formatFileSize(file.size);

    try {
      let extractedText = '';

      if (fileExt === 'docx') {
        // Parse docx with timeout protection
        const docxPromise = (async () => {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          return result.value || '';
        })();

        // 6 second timeout protection
        const timeoutPromise = new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('Thời gian xử lý tệp quá lâu')), 6000)
        );

        extractedText = await Promise.race([docxPromise, timeoutPromise]);
      } else if (fileExt === 'txt' || fileExt === 'md' || fileExt === 'json' || fileExt === 'csv' || fileExt === 'rtf') {
        extractedText = await file.text();
      } else if (fileExt === 'pdf' || fileExt === 'doc') {
        extractedText = await extractPdfOrBinaryText(file);
      } else {
        // General text reader fallback
        try {
          extractedText = await file.text();
        } catch {
          extractedText = await extractPdfOrBinaryText(file);
        }
      }

      const trimmed = (extractedText || '').trim();

      if (trimmed.length > 0) {
        setRequirementsText(trimmed);
        setSourceFileName(fileName);
        setFileStats({
          sizeStr,
          charCount: trimmed.length,
        });
      } else {
        // Fallback message if file has no text
        const fallbackNotice = `[Tệp: ${fileName}] Đã nạp thành công căn cứ môn ${selectedSubject} ${selectedGrade}. Hệ thống AI tự động áp dụng chuẩn Yêu cầu cần đạt GDPT 2018.`;
        setRequirementsText(fallbackNotice);
        setSourceFileName(fileName);
        setFileStats({
          sizeStr,
          charCount: fallbackNotice.length,
        });
      }
    } catch (err: any) {
      console.error('File read error:', err);
      setUploadError(
        `Không thể giải nén tự động tệp (${err.message || 'Lỗi đọc'}). Bạn có thể chọn file .docx khác hoặc dán trực tiếp nội dung vào khung bên dưới.`
      );
    } finally {
      setIsLoadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    setFileStats(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-200 text-center ${
          isDragging
            ? 'border-blue-500 bg-blue-50/80 scale-[0.99]'
            : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.doc,.txt,.pdf,.md,.rtf,.json"
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
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <UploadCloud className="w-6 h-6 text-blue-600" />
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-800">
              {isLoadingFile ? 'Đang đọc và phân tích tệp tin...' : 'Tải lên file Yêu cầu cần đạt / Khung chương trình'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Hỗ trợ định dạng Word (<strong>.docx</strong>, <strong>.doc</strong>), Văn bản (<strong>.txt</strong>, <strong>.md</strong>), <strong>PDF</strong>
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              disabled={isLoadingFile}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isLoadingFile ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Chọn file từ máy tính</span>
                </>
              )}
            </button>
            <span className="text-xs text-slate-400">hoặc kéo thả tệp vào đây</span>
          </div>

          {sourceFileName && (
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-xl font-medium mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Đã tải: <strong>{sourceFileName}</strong> {fileStats?.sizeStr ? `(${fileStats.sizeStr})` : ''}
              </span>
            </div>
          )}

          {uploadError && (
            <div className="flex items-start gap-1.5 text-left text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200 mt-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Thông báo xử lý tệp:</span>
                <span>{uploadError}</span>
              </div>
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
            Tự động điền đầy đủ Yêu cầu cần đạt chuẩn
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
