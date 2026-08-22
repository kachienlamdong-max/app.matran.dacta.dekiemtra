import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  FileSpreadsheet,
  BookCheck,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Heart,
  Share2,
  Users,
  MessageSquareHeart,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

import {
  TeacherProfile,
  ExamGeneralInfo,
  MatrixData,
  SpecItem,
  ExamPackage,
  ShuffledExamCode,
} from './types';
import { SUBJECT_PRESETS } from './utils/curriculumSamples';
import { shuffle4Codes } from './utils/examShuffler';
import { exportMatrixToDocx, exportExamToDocx } from './utils/docxExport';

import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { AdminStatsModal } from './components/AdminStatsModal';
import { DonationModal } from './components/DonationModal';
import { ShareModal } from './components/ShareModal';
import { FeedbackModal } from './components/FeedbackModal';
import { MatrixConfigForm } from './components/MatrixConfigForm';
import { MatrixSpecView } from './components/MatrixSpecView';
import { ExamShuffleView } from './components/ExamShuffleView';

export default function App() {
  // 1. Teacher State
  const [currentTeacher, setCurrentTeacher] = useState<TeacherProfile | null>(() => {
    try {
      const saved = localStorage.getItem('edumatrix_teacher');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 2. Modals Visibility State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // 3. Workflow Steps (1: Config -> 2: Matrix & Spec -> 3: Exam & 4 Codes)
  const [activeStep, setActiveStep] = useState<number>(1);

  // 4. General Exam Info State
  const defaultPreset = SUBJECT_PRESETS[0];
  const [info, setInfo] = useState<ExamGeneralInfo>({
    subject: 'Toán học',
    grade: 'Lớp 12',
    examType: 'Kiểm tra Giữa Học kì 1',
    durationMinutes: 45,
    departmentName: 'SỞ GIÁO DỤC VÀ ĐÀO TẠO HÀ NỘI',
    schoolName: 'TRƯỜNG THPT CHUYÊN HÀ NỘI - AMSTERDAM',
    academicYear: '2024 - 2025',
    examTitle: 'ĐỀ KIỂM TRA ĐỊNH KÌ GIỮA HỌC KÌ 1',
    structureOption: 'option1',
    customConfig: {
      part1Count: 12,
      part1Points: 3.0,
      part2Count: 4,
      part2Points: 4.0,
      part3Count: 4,
      part3Points: 2.0,
      part4Count: 1,
      part4Points: 1.0,
      totalPoints: 10.0,
    },
    requirementsText: defaultPreset.sampleRequirements,
    sourceFileName: `Mẫu chuẩn GDPT 2018 - ${defaultPreset.subject} ${defaultPreset.grade}`,
  });

  // 5. Generated Data State
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [specItems, setSpecItems] = useState<SpecItem[]>([]);
  const [examPkg, setExamPkg] = useState<ExamPackage | null>(null);
  const [shuffledCodes, setShuffledCodes] = useState<ShuffledExamCode[]>([]);

  // 6. Loading & Notification States
  const [isGeneratingMatrix, setIsGeneratingMatrix] = useState(false);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync Teacher Profile from LocalStorage & apply default names
  useEffect(() => {
    if (currentTeacher) {
      localStorage.setItem('edumatrix_teacher', JSON.stringify(currentTeacher));
      if (currentTeacher.schoolName) {
        setInfo((prev) => ({
          ...prev,
          schoolName: currentTeacher.schoolName || prev.schoolName,
          subject: currentTeacher.subject || prev.subject,
          grade: currentTeacher.gradeLevel || prev.grade,
        }));
      }
    }
  }, [currentTeacher]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('edumatrix_teacher');
    setCurrentTeacher(null);
    showToast('Đã đăng xuất tài khoản', 'info');
  };

  // Step 1 -> Step 2: Generate Matrix & Specification via Server-Side Gemini API
  const handleGenerateMatrix = async () => {
    setIsGeneratingMatrix(true);
    try {
      const res = await fetch('/api/matrix/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ info }),
      });

      const data = await res.json();
      if (data.success && data.matrix) {
        setMatrixData(data.matrix);
        setSpecItems(data.specification || []);
        setActiveStep(2);
        showToast('Đã xây dựng thành công Ma trận & Bản đặc tả chuẩn Bộ GD&ĐT!', 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(data.message || 'Không thể tạo ma trận');
      }
    } catch (err: any) {
      console.error('Matrix generation error:', err);
      showToast(err.message || 'Có lỗi xảy ra khi tạo ma trận. Vui lòng thử lại!', 'error');
    } finally {
      setIsGeneratingMatrix(false);
    }
  };

  // Step 2 -> Step 3: Generate Exam & Shuffle 4 Codes
  const handleGenerateExam = async () => {
    if (!matrixData || specItems.length === 0) {
      showToast('Vui lòng tạo Ma trận trước khi sinh đề thi.', 'error');
      return;
    }

    setIsGeneratingExam(true);
    try {
      const res = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          info,
          matrix: matrixData,
          specification: specItems,
        }),
      });

      const data = await res.json();
      if (data.success && data.examPackage) {
        const pkg: ExamPackage = data.examPackage;
        setExamPkg(pkg);

        // Perform deterministic 4-code shuffling (101, 102, 103, 104)
        const codes = shuffle4Codes(pkg);
        setShuffledCodes(codes);

        setActiveStep(3);
        showToast('Đã sinh đề thi chuẩn & hoàn tất trộn 4 mã đề (101, 102, 103, 104)!', 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(data.message || 'Không thể sinh đề thi');
      }
    } catch (err: any) {
      console.error('Exam generation error:', err);
      showToast(err.message || 'Có lỗi xảy ra khi sinh đề thi. Vui lòng thử lại!', 'error');
    } finally {
      setIsGeneratingExam(false);
    }
  };

  // Export Matrix Word (.docx)
  const handleExportMatrixWord = async () => {
    if (!matrixData || specItems.length === 0) return;
    setIsExportingWord(true);
    try {
      await exportMatrixToDocx(matrixData, specItems, info);
      showToast('Đã tải xuống file Word (.docx) Ma trận & Bản đặc tả thành công!', 'success');
      // Increment download stats
      fetch('/api/stats/download', { method: 'POST' }).catch(() => {});
    } catch (err: any) {
      console.error('Export error:', err);
      showToast('Lỗi khi xuất file Word: ' + err.message, 'error');
    } finally {
      setIsExportingWord(false);
    }
  };

  // Export Exam Word (.docx)
  const handleExportExamWord = async (all4Codes: boolean = true) => {
    if (shuffledCodes.length === 0) return;
    setIsExportingWord(true);
    try {
      await exportExamToDocx(shuffledCodes, info, all4Codes);
      showToast('Đã tải xuống file Word (.docx) trọn bộ 4 mã đề kèm đáp án!', 'success');
      // Increment download stats
      fetch('/api/stats/download', { method: 'POST' }).catch(() => {});
    } catch (err: any) {
      console.error('Export error:', err);
      showToast('Lỗi khi xuất file Word: ' + err.message, 'error');
    } finally {
      setIsExportingWord(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* Global Header */}
      <Header
        currentTeacher={currentTeacher}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenDonation={() => setIsDonationOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        activeStep={activeStep}
        setActiveStep={(step) => {
          if (step === 2 && !matrixData) {
            showToast('Vui lòng tạo Ma trận ở Bước 1 trước.', 'info');
            return;
          }
          if (step === 3 && shuffledCodes.length === 0) {
            showToast('Vui lòng sinh Đề thi ở Bước 2 trước.', 'info');
            return;
          }
          setActiveStep(step);
        }}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Step 1: Configuration & Upload Requirements */}
        {activeStep === 1 && (
          <div className="animate-in fade-in duration-200">
            <MatrixConfigForm
              info={info}
              setInfo={setInfo}
              onGenerateMatrix={handleGenerateMatrix}
              isGenerating={isGeneratingMatrix}
            />
          </div>
        )}

        {/* Step 2: Matrix & Specification View */}
        {activeStep === 2 && matrixData && (
          <div className="animate-in fade-in duration-200">
            <MatrixSpecView
              info={info}
              matrix={matrixData}
              specification={specItems}
              onGenerateExam={handleGenerateExam}
              isGeneratingExam={isGeneratingExam}
              onBackToConfig={() => setActiveStep(1)}
              onExportWord={handleExportMatrixWord}
              isExportingWord={isExportingWord}
            />
          </div>
        )}

        {/* Step 3: Exam Shuffled Codes View */}
        {activeStep === 3 && examPkg && shuffledCodes.length > 0 && (
          <div className="animate-in fade-in duration-200">
            <ExamShuffleView
              examPkg={examPkg}
              shuffledCodes={shuffledCodes}
              onBackToMatrix={() => setActiveStep(2)}
              onExportWord={handleExportExamWord}
              isExportingWord={isExportingWord}
              onOpenFeedback={() => setIsFeedbackOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              E
            </div>
            <span className="font-semibold text-slate-800">EduMatrix AI 2025</span>
            <span>• Hệ thống hỗ trợ xây dựng Ma trận & Đề kiểm tra định kì chuẩn Bộ GD&ĐT</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <button
              onClick={() => setIsDonationOpen(true)}
              className="flex items-center gap-1 text-amber-700 hover:text-amber-800 font-semibold cursor-pointer"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Ủng hộ 5.000đ (Agribank)</span>
            </button>
            <button
              onClick={() => setIsShareOpen(true)}
              className="hover:text-blue-600 flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia sẻ ứng dụng</span>
            </button>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="hover:text-rose-600 flex items-center gap-1 cursor-pointer"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-rose-500" />
              <span>Góp ý & Đánh giá</span>
            </button>
          </div>
        </div>
      </footer>

      {/* All Modal Dialogs */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentTeacher={currentTeacher}
        onSaveTeacher={(teacher) => {
          setCurrentTeacher(teacher);
          showToast(`Chào mừng Thầy/Cô ${teacher.fullName}!`, 'success');
        }}
        onLogout={handleLogout}
      />

      <AdminStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />

      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
        teacherName={currentTeacher?.fullName}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentTeacher={currentTeacher}
      />
    </div>
  );
}
