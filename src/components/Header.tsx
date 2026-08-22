import React from 'react';
import { Sparkles, Users, Coffee, Share2, MessageSquareHeart, UserCheck, ShieldCheck } from 'lucide-react';
import { TeacherProfile } from '../types';

interface HeaderProps {
  currentTeacher: TeacherProfile | null;
  onOpenAuth: () => void;
  onOpenStats: () => void;
  onOpenDonation: () => void;
  onOpenShare: () => void;
  onOpenFeedback: () => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTeacher,
  onOpenAuth,
  onOpenStats,
  onOpenDonation,
  onOpenShare,
  onOpenFeedback,
  activeStep,
  setActiveStep,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Notification / Branding Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600/80 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider text-[10px]">
              GDPT 2018
            </span>
            <span className="hidden sm:inline text-slate-200">
              Phần mềm hỗ trợ xây dựng Ma trận, Bản đặc tả & Đề kiểm tra định kì chuẩn Bộ GD&ĐT
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-xs">
            <button
              onClick={onOpenStats}
              className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-blue-300" />
              <span>Bảng Thống Kê Giáo Viên</span>
            </button>
            <button
              onClick={onOpenShare}
              className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Chia sẻ QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                  EduMatrix AI
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-medium px-2 py-0.5 rounded-full">
                  Bộ GD&ĐT 2025
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-0.5 hidden sm:block">
                Ma trận • Đặc tả • Sinh đề 4 dạng • Trộn 4 mã đề • Xuất Word
              </p>
            </div>
          </div>

          {/* Workflow Step Indicators */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveStep(1)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeStep === 1
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <span>Cấu hình & YC cần đạt</span>
            </button>
            <button
              onClick={() => setActiveStep(2)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeStep === 2
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span>Ma trận & Bản đặc tả</span>
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeStep === 3
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                3
              </span>
              <span>Đề thi & Trộn 4 mã đề</span>
            </button>
          </nav>

          {/* Action Buttons & Teacher Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Donation Coffee Button (Requested: hidden by default, visible button) */}
            <button
              id="coffee-donation-btn"
              onClick={onOpenDonation}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
              title="Ủng hộ tác giả 5.000đ phát triển ứng dụng"
            >
              <Coffee className="w-4 h-4 text-amber-700" />
              <span className="hidden md:inline">Mời cà phê</span>
              <span className="bg-amber-200/70 text-amber-900 px-1.5 py-0.2 rounded text-[11px] font-bold">
                5.000đ
              </span>
            </button>

            {/* Feedback Button */}
            <button
              onClick={onOpenFeedback}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="Đánh giá và gửi góp ý"
            >
              <MessageSquareHeart className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline">Góp ý</span>
            </button>

            {/* User Profile / Login */}
            {currentTeacher ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <div
                  className={`w-5 h-5 rounded-full ${currentTeacher.avatarColor || 'bg-blue-600'} text-white flex items-center justify-center text-[10px] font-bold`}
                >
                  {currentTeacher.fullName.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="font-semibold leading-tight line-clamp-1">{currentTeacher.fullName}</p>
                  <p className="text-[10px] text-blue-600">{currentTeacher.subject}</p>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
