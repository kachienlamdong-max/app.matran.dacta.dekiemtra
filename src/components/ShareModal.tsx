import React, { useState } from 'react';
import { X, Share2, Copy, Check, QrCode, Smartphone, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://edumatrix.ai';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-2.5 border border-white/30">
            <Share2 className="w-6 h-6 text-white" />
          </div>

          <h3 className="text-xl font-bold tracking-tight">Chia Sẻ Ứng Dụng</h3>
          <p className="text-xs text-emerald-100 mt-1">
            Gửi tới các Thầy/Cô đồng nghiệp cùng tổ bộ môn hoặc nhóm Zalo chuyên môn
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* QR Code */}
          <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
            <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 mb-3">
              <QRCodeSVG
                value={currentUrl}
                size={180}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Dùng máy ảnh hoặc Zalo quét mã QR để mở nhanh trên điện thoại
            </p>
          </div>

          {/* Link Copy */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Đường link liên kết trực tiếp:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full text-xs font-mono bg-slate-100 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-700 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="shrink-0 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Benefits Info */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              Tiện ích cho tổ chuyên môn nhà trường:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-800">
              <li>Đồng bộ hóa khung ma trận và bản đặc tả giữa các giáo viên trong tổ.</li>
              <li>Trộn nhanh 4 mã đề kiểm tra định kì không lo nhầm lẫn đáp án.</li>
              <li>Xuất file Word chuẩn nộp cho Ban Giám Hiệu duyệt nhanh chóng.</li>
            </ul>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full text-xs font-semibold py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
