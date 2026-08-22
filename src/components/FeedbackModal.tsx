import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquareHeart, Send, CheckCircle2, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TeacherFeedback, TeacherProfile } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTeacher: TeacherProfile | null;
  initialRating?: number;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentTeacher,
  initialRating = 5,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [teacherName, setTeacherName] = useState(currentTeacher?.fullName || '');
  const [schoolName, setSchoolName] = useState(currentTeacher?.schoolName || '');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedbacks, setFeedbacks] = useState<TeacherFeedback[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (currentTeacher?.fullName) setTeacherName(currentTeacher.fullName);
      if (currentTeacher?.schoolName) setSchoolName(currentTeacher.schoolName);

      fetch('/api/feedback')
        .then((res) => res.json())
        .then((data) => setFeedbacks(data))
        .catch(() => {});
    }
  }, [isOpen, currentTeacher]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherName: teacherName || 'Thầy/Cô giáo',
          schoolName: schoolName || 'Trường THPT',
          subject: currentTeacher?.subject || 'Toán học',
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          setIsSuccess(false);
          setComment('');
          onClose();
        }, 1800);
      }
    } catch (err) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-indigo-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/20">
              <MessageSquareHeart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Đánh Giá & Đóng Góp Ý Kiến</h3>
              <p className="text-xs text-rose-100 mt-0.5">
                Cảm nhận của Thầy/Cô sau khi trải nghiệm xuất ma trận và đề thi
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Cảm ơn Thầy/Cô rất nhiều!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Ý kiến đóng góp quý báu đã được chuyển trực tiếp đến ban phát triển để tiếp tục hoàn thiện ứng dụng.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating selector */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  Thầy/Cô đánh giá độ hài lòng về chất lượng đề và định dạng file Word:
                </p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || rating);
                    return (
                      <button
                        type="button"
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-125 cursor-pointer"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs font-bold text-amber-600 mt-1">
                  {rating === 5 && 'Tuyệt vời, ma trận và đề thi chuẩn 100% (5 sao)'}
                  {rating === 4 && 'Rất tốt, đáp ứng tốt nhu cầu giảng dạy (4 sao)'}
                  {rating === 3 && 'Tương đối ổn, cần cải tiến thêm (3 sao)'}
                  {rating <= 2 && 'Cần bổ sung nhiều tính năng hơn (1-2 sao)'}
                </p>
              </div>

              {/* Teacher Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Thầy Nguyễn Văn An"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trường / Đơn vị:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: THPT Chuyên Hà Nội"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Góp ý chi tiết / Đề xuất tính năng mới: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Chia sẻ trải nghiệm của Thầy/Cô khi sinh đề hoặc góp ý thêm về công thức toán, định dạng ma trận..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden text-slate-800"
                />
              </div>

              {/* Submit button */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className="flex items-center gap-1.5 text-xs font-bold px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          )}

          {/* Community Reviews */}
          {feedbacks.length > 0 && (
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Đánh giá từ các đồng nghiệp khác ({feedbacks.length})
              </h4>
              <div className="space-y-3">
                {feedbacks.slice(0, 3).map((fb) => (
                  <div key={fb.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                          {fb.teacherName.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{fb.teacherName}</span>
                        <span className="text-[10px] text-slate-400">• {fb.schoolName}</span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: fb.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{fb.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
