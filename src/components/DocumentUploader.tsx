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
  Eye,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Compass,
  FileCode,
  Layers,
  HelpCircle,
} from 'lucide-react';
import mammoth from 'mammoth';
import { extractTextFromPdf } from '../utils/pdfReader';
import { SUBJECT_PRESETS, SubjectPreset } from '../utils/curriculumSamples';

interface ExtractedTopic {
  id?: string;
  topicName: string;
  units?: string[];
  learningOutcomes?: {
    nhanBiet?: string;
    thongHieu?: string;
    vanDung?: string;
    vanDungCao?: string;
  };
}

interface DocumentUploaderProps {
  requirementsText: string;
  setRequirementsText: (text: string) => void;
  sourceFileName?: string;
  setSourceFileName: (name: string) => void;
  selectedSubject: string;
  setSelectedSubject?: (subject: string) => void;
  selectedGrade: string;
  setSelectedGrade?: (grade: string) => void;
  onApplyPreset: (preset: SubjectPreset) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  requirementsText,
  setRequirementsText,
  sourceFileName,
  setSourceFileName,
  selectedSubject,
  setSelectedSubject,
  selectedGrade,
  setSelectedGrade,
  onApplyPreset,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileStats, setFileStats] = useState<{ sizeStr: string; charCount: number } | null>(null);
  const [extractedTopics, setExtractedTopics] = useState<ExtractedTopic[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [showTopicsDetail, setShowTopicsDetail] = useState(false);
  const [expandedTopicIndex, setExpandedTopicIndex] = useState<number | null>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // remove data:*/*;base64, prefix
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Call AI to extract structured learning outcomes
  const analyzeWithAi = async (params: {
    rawText?: string;
    fileBase64?: string;
    mimeType?: string;
    fileName: string;
  }) => {
    setIsAiAnalyzing(true);
    setUploadError(null);

    try {
      const response = await fetch('/api/ai-extract-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: params.rawText || '',
          fileBase64: params.fileBase64,
          mimeType: params.mimeType,
          fileName: params.fileName,
          subject: selectedSubject,
          grade: selectedGrade,
        }),
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        const { detectedSubject, detectedGrade, summary, topics, formattedRequirements } =
          resData.data;

        if (formattedRequirements && formattedRequirements.trim().length > 0) {
          setRequirementsText(formattedRequirements);
        }

        if (summary) {
          setAiSummary(summary);
        }

        if (topics && Array.isArray(topics) && topics.length > 0) {
          setExtractedTopics(topics);
          setShowTopicsDetail(true);
        }

        // Auto update detected subject/grade if relevant
        if (detectedSubject && setSelectedSubject && detectedSubject.toLowerCase().includes('địa')) {
          setSelectedSubject('Địa lí');
        } else if (detectedSubject && setSelectedSubject) {
          setSelectedSubject(detectedSubject);
        }

        if (detectedGrade && setSelectedGrade) {
          setSelectedGrade(detectedGrade);
        }
      }
    } catch (err: any) {
      console.warn('AI analysis notice:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Process uploaded file
  const handleFileProcess = async (file: File) => {
    setIsLoadingFile(true);
    setUploadError(null);
    setAiSummary(null);
    setExtractedTopics([]);

    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    const sizeStr = formatFileSize(file.size);

    let extractedText = '';
    let pdfBase64: string | undefined = undefined;

    try {
      if (fileExt === 'docx') {
        // Parse docx using mammoth
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          extractedText = result.value || '';
        } catch (docxErr) {
          console.warn('Mammoth client parse failed, fallback to text/AI:', docxErr);
        }
      } else if (fileExt === 'pdf') {
        // Read PDF with pdfjs-dist
        try {
          extractedText = await extractTextFromPdf(file);
        } catch (pdfErr) {
          console.warn('pdfjs-dist parse fallback to base64 AI:', pdfErr);
        }
        // Also get base64 for direct Gemini multimodal reading
        try {
          pdfBase64 = await fileToBase64(file);
        } catch (b64Err) {
          console.warn('Base64 encode error:', b64Err);
        }
      } else if (['txt', 'md', 'json', 'csv', 'rtf'].includes(fileExt)) {
        extractedText = await file.text();
      } else {
        // Fallback file reader
        try {
          extractedText = await file.text();
        } catch {
          extractedText = '';
        }
      }

      const trimmed = (extractedText || '').trim();
      setSourceFileName(fileName);
      setFileStats({
        sizeStr,
        charCount: trimmed.length,
      });

      if (trimmed.length > 0) {
        setRequirementsText(trimmed);
      } else {
        // Fallback message
        const fallbackNotice = `CHỦ ĐỀ MÔN ${selectedSubject.toUpperCase()} (${selectedGrade.toUpperCase()}) - CĂN CỨ TỆP: ${fileName}\n- Đã nạp thành công tài liệu. Hệ thống AI tự động phân tích và áp dụng chuẩn Yêu cầu cần đạt Chương trình GDPT 2018.`;
        setRequirementsText(fallbackNotice);
      }

      // Automatically trigger AI extraction for intelligent breakdown
      await analyzeWithAi({
        rawText: trimmed,
        fileBase64: pdfBase64,
        mimeType: fileExt === 'pdf' ? 'application/pdf' : undefined,
        fileName,
      });
    } catch (err: any) {
      console.error('File process error:', err);
      setUploadError(
        `Lỗi khi đọc tệp (${err.message || 'Lỗi định dạng'}). Bạn có thể chọn file khác hoặc dán trực tiếp nội dung vào khung bên dưới.`
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
    setExtractedTopics([]);
    setAiSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualTriggerAi = () => {
    if (!requirementsText || requirementsText.trim().length === 0) {
      setUploadError('Vui lòng nhập hoặc tải nội dung tài liệu trước khi phân tích');
      return;
    }
    analyzeWithAi({
      rawText: requirementsText,
      fileName: sourceFileName || `Tài liệu_${selectedSubject}_${selectedGrade}`,
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Upload Box */}
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

        <div className="max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-xs">
            {isLoadingFile || isAiAnalyzing ? (
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <UploadCloud className="w-6 h-6 text-blue-600" />
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-800">
              {isLoadingFile
                ? 'Đang đọc và giải nén tệp tin...'
                : isAiAnalyzing
                ? 'AI đang đọc tài liệu & bóc tách Yêu cầu cần đạt chuẩn GDPT 2018...'
                : `Tải lên file Yêu cầu cần đạt / Khung chương trình (Môn ${selectedSubject} ${selectedGrade})`}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Hỗ trợ đầy đủ định dạng: Word (<strong>.docx</strong>, <strong>.doc</strong>), <strong>PDF</strong>, Văn bản (<strong>.txt</strong>, <strong>.md</strong>)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              disabled={isLoadingFile || isAiAnalyzing}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              {isLoadingFile || isAiAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xử lý tài liệu...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Chọn tệp Word / PDF từ máy tính</span>
                </>
              )}
            </button>
            <span className="text-xs text-slate-400">hoặc kéo thả tệp vào đây</span>
          </div>

          {sourceFileName && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-xl font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Đã tải tệp: <strong>{sourceFileName}</strong> {fileStats?.sizeStr ? `(${fileStats.sizeStr})` : ''}
                </span>
              </div>

              <button
                type="button"
                disabled={isAiAnalyzing}
                onClick={handleManualTriggerAi}
                className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Đọc & Bóc tách lại</span>
              </button>
            </div>
          )}

          {uploadError && (
            <div className="flex items-start gap-1.5 text-left text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200 mt-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Thông báo xử lý:</span>
                <span>{uploadError}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. AI Document Analysis Results (If extracted) */}
      {extractedTopics.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/60 to-white border border-indigo-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-2">
                  Kết quả AI Đọc & Bóc tách Yêu cầu cần đạt ({extractedTopics.length} chủ đề)
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    Chuẩn GDPT 2018
                  </span>
                </h4>
                {aiSummary && <p className="text-[11px] text-indigo-700">{aiSummary}</p>}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTopicsDetail(!showTopicsDetail)}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-indigo-200"
            >
              {showTopicsDetail ? (
                <>
                  <span>Thu gọn</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Xem chi tiết các mức độ ({extractedTopics.length})</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Topics List Detail */}
          {showTopicsDetail && (
            <div className="space-y-2.5 pt-2 border-t border-indigo-100">
              {extractedTopics.map((topic, idx) => {
                const isExpanded = expandedTopicIndex === idx;
                return (
                  <div
                    key={topic.id || `t-${idx}`}
                    className="bg-white rounded-xl border border-indigo-100 p-3 shadow-2xs space-y-2"
                  >
                    <div
                      onClick={() => setExpandedTopicIndex(isExpanded ? null : idx)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-slate-800">
                          {topic.topicName}
                        </h5>
                      </div>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {topic.units && topic.units.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-7">
                        {topic.units.map((unit, uIdx) => (
                          <span
                            key={uIdx}
                            className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium"
                          >
                            {unit}
                          </span>
                        ))}
                      </div>
                    )}

                    {isExpanded && topic.learningOutcomes && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 pl-7">
                        {topic.learningOutcomes.nhanBiet && (
                          <div className="p-2 bg-blue-50/70 border border-blue-100 rounded-lg">
                            <span className="font-bold text-blue-800 block mb-0.5">
                              • Nhận biết:
                            </span>
                            <span className="text-slate-700 leading-relaxed">
                              {topic.learningOutcomes.nhanBiet}
                            </span>
                          </div>
                        )}
                        {topic.learningOutcomes.thongHieu && (
                          <div className="p-2 bg-emerald-50/70 border border-emerald-100 rounded-lg">
                            <span className="font-bold text-emerald-800 block mb-0.5">
                              • Thông hiểu:
                            </span>
                            <span className="text-slate-700 leading-relaxed">
                              {topic.learningOutcomes.thongHieu}
                            </span>
                          </div>
                        )}
                        {topic.learningOutcomes.vanDung && (
                          <div className="p-2 bg-amber-50/70 border border-amber-100 rounded-lg">
                            <span className="font-bold text-amber-800 block mb-0.5">
                              • Vận dụng:
                            </span>
                            <span className="text-slate-700 leading-relaxed">
                              {topic.learningOutcomes.vanDung}
                            </span>
                          </div>
                        )}
                        {topic.learningOutcomes.vanDungCao && (
                          <div className="p-2 bg-purple-50/70 border border-purple-100 rounded-lg">
                            <span className="font-bold text-purple-800 block mb-0.5">
                              • Vận dụng cao:
                            </span>
                            <span className="text-slate-700 leading-relaxed">
                              {topic.learningOutcomes.vanDungCao}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Quick Load Sample Presets (Including Geography / Địa lí) */}
      <div className="bg-gradient-to-r from-blue-50 via-teal-50 to-slate-50 border border-blue-100 rounded-2xl p-4">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">
              Mẫu chuẩn GDPT 2018 có sẵn (Nạp nhanh 1 chạm):
            </span>
          </div>
          <span className="text-[11px] text-teal-700 font-semibold hidden sm:inline">
            Đã tích hợp đầy đủ Địa lí 10, 11, 12, KHTN, Toán, Lý, Hóa, Văn...
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUBJECT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer border ${
                preset.subject.includes('Địa lí')
                  ? 'bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-900 border-teal-200'
                  : 'bg-white hover:bg-blue-600 hover:text-white text-slate-700 border-slate-200 hover:border-blue-600'
              }`}
            >
              {preset.subject.includes('Địa lí') ? (
                <Compass className="w-3.5 h-3.5 text-teal-600 group-hover:text-white" />
              ) : (
                <BookOpen className="w-3.5 h-3.5 opacity-70" />
              )}
              <span>
                {preset.subject} {preset.grade}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Requirements Textarea Preview */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Văn bản Yêu cầu cần đạt chi tiết dùng làm căn cứ đối chiếu:
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
          rows={7}
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
