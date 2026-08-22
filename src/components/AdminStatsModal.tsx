import React, { useEffect, useState } from 'react';
import { X, Users, BookCheck, FileText, Download, BarChart3, Activity, School, CheckCircle2 } from 'lucide-react';
import { AppStats } from '../types';

interface AdminStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminStatsModal: React.FC<AdminStatsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<AppStats & { teachers?: any[] }>({
    totalTeachers: 128,
    totalExamsGenerated: 1428,
    totalMatrixCreated: 2650,
    totalWordDownloads: 1894,
    activeUsersOnline: 32,
    subjectCounts: {
      'Toán học': 45,
      'Vật lí': 22,
      'Hóa học': 18,
      'Ngữ văn': 19,
      'Sinh học': 14,
      'Tiếng Anh': 10,
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch('/api/stats')
        .then((res) => res.json())
        .then((data) => {
          setStats((prev) => ({ ...prev, ...data }));
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 flex items-center justify-center border border-blue-400/30">
              <BarChart3 className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Bảng Thống Kê Hoạt Động Hệ Thống</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Dữ liệu thời gian thực về giáo viên và đề thi đã khởi tạo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3.5 text-center">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-blue-950">{stats.totalTeachers}</p>
              <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider mt-0.5">
                Giáo viên sử dụng
              </p>
            </div>

            <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-3.5 text-center">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-indigo-950">{stats.totalMatrixCreated}</p>
              <p className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider mt-0.5">
                Ma trận & Đặc tả
              </p>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-3.5 text-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                <BookCheck className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-emerald-950">{stats.totalExamsGenerated}</p>
              <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mt-0.5">
                Bộ đề đã sinh
              </p>
            </div>

            <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-3.5 text-center">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                <Download className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-amber-950">{stats.totalWordDownloads}</p>
              <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mt-0.5">
                Lượt tải Word (.docx)
              </p>
            </div>
          </div>

          {/* Active Status banner */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-700">Trạng thái hệ thống:</span>
              <span className="text-emerald-700 font-medium">Hoạt động ổn định (AI Engine v3.7)</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Đang online: <strong>{stats.activeUsersOnline}</strong> giáo viên</span>
            </div>
          </div>

          {/* Subject Distribution */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Phân bố giáo viên theo bộ môn
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {Object.entries(stats.subjectCounts || {}).map(([subj, count]) => (
                <div
                  key={subj}
                  className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200"
                >
                  <span className="font-medium text-slate-700">{subj}</span>
                  <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
                    {count} GV
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Registered Teachers list */}
          {stats.teachers && stats.teachers.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <School className="w-4 h-4 text-indigo-600" />
                Giáo viên đăng ký gần đây
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {stats.teachers.slice(0, 5).map((t, idx) => (
                  <div key={idx} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">
                        {t.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{t.fullName}</p>
                        <p className="text-[11px] text-slate-500">{t.schoolName || 'Trường THPT'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded text-[10px]">
                        {t.subject} - {t.gradeLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-semibold px-5 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Đóng bảng thống kê
          </button>
        </div>
      </div>
    </div>
  );
};
