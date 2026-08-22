import React, { useState } from 'react';
import { X, User, Mail, BookOpen, GraduationCap, School, Check, LogOut } from 'lucide-react';
import { TeacherProfile } from '../types';
import { SUBJECT_LIST, GRADE_LIST } from '../utils/curriculumSamples';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTeacher: TeacherProfile | null;
  onSaveTeacher: (teacher: TeacherProfile) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentTeacher,
  onSaveTeacher,
  onLogout,
}) => {
  const [fullName, setFullName] = useState(currentTeacher?.fullName || '');
  const [email, setEmail] = useState(currentTeacher?.email || '');
  const [subject, setSubject] = useState(currentTeacher?.subject || 'Toán học');
  const [gradeLevel, setGradeLevel] = useState(currentTeacher?.gradeLevel || 'Lớp 12');
  const [schoolName, setSchoolName] = useState(currentTeacher?.schoolName || 'THPT Chuyên Hà Nội - Amsterdam');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Họ và tên cùng Email / Tên đăng nhập.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/teachers/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          subject,
          gradeLevel,
          schoolName,
        }),
      });

      const data = await res.json();
      if (data.success && data.teacher) {
        onSaveTeacher(data.teacher);
        onClose();
      } else {
        // Fallback local creation
        const localTeacher: TeacherProfile = {
          id: `t-${Date.now()}`,
          fullName,
          email,
          subject,
          gradeLevel,
          schoolName,
          createdAt: new Date().toISOString(),
          avatarColor: 'bg-blue-600',
        };
        onSaveTeacher(localTeacher);
        onClose();
      }
    } catch (err) {
      const localTeacher: TeacherProfile = {
        id: `t-${Date.now()}`,
        fullName,
        email,
        subject,
        gradeLevel,
        schoolName,
        createdAt: new Date().toISOString(),
        avatarColor: 'bg-blue-600',
      };
      onSaveTeacher(localTeacher);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">
              {currentTeacher ? 'Hồ Sơ Giáo Viên' : 'Đăng Nhập / Đăng Ký'}
            </h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Lưu thông tin để tự động điền vào tiêu đề Ma trận và Đề thi
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Họ và tên giáo viên: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Thầy Nguyễn Văn An"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              Email / Tên tài khoản: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: nguyenvanan.toan@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Môn giảng dạy:
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
              >
                {SUBJECT_LIST.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                Cấp học / Khối lớp:
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
              >
                {GRADE_LIST.map((gr) => (
                  <option key={gr} value={gr}>
                    {gr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-blue-600" />
              Đơn vị / Trường công tác:
            </label>
            <input
              type="text"
              placeholder="VD: THPT Chuyên Hà Nội - Amsterdam"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {currentTeacher ? (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-600 hover:text-slate-800 font-medium px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
