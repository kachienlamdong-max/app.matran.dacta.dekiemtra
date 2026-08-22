import React, { useState } from 'react';
import { X, Coffee, Copy, Check, Heart, ShieldCheck, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName?: string;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, teacherName }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const bankName = 'Agribank (Ngân hàng Nông nghiệp & PTNT Việt Nam)';
  const accountNumber = '5495215016444';
  const amount = '5.000 VNĐ';
  const transferContent = `Ung ho EduMatrix AI ${teacherName ? teacherName.replace(/[^a-zA-Z0-9 ]/g, '') : ''}`.trim();

  // Standard VietQR QuickLink format
  const vietQrUrl = `https://img.vietqr.io/image/agribank-${accountNumber}-compact2.png?amount=5000&addInfo=${encodeURIComponent(transferContent)}&accountName=TRAN%20THI%20KIM%20ANH`;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-amber-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/30">
            <Coffee className="w-7 h-7 text-white" />
          </div>

          <h3 className="text-xl font-black tracking-tight">Mời Tác Giả Ly Cà Phê</h3>
          <p className="text-xs text-amber-100 mt-1 max-w-xs mx-auto">
            Sự ủng hộ <strong>5.000đ</strong> của Thầy/Cô là động lực to lớn giúp duy trì máy chủ và phát triển thêm nhiều tính năng AI phục vụ ngành giáo dục!
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center bg-amber-50/60 border-2 border-dashed border-amber-200 rounded-2xl p-4 text-center">
            <div className="bg-white p-2.5 rounded-xl shadow-md border border-slate-100 mb-2">
              <img
                src={vietQrUrl}
                alt="Mã QR Chuyển khoản Agribank"
                className="w-48 h-auto object-contain mx-auto"
                onError={(e) => {
                  // Fallback to client SVG QR if external image fails
                  e.currentTarget.style.display = 'none';
                  const fallbackDiv = document.getElementById('qr-svg-fallback');
                  if (fallbackDiv) fallbackDiv.style.display = 'block';
                }}
              />
              <div id="qr-svg-fallback" style={{ display: 'none' }} className="p-2">
                <QRCodeSVG
                  value={`2|99|0978000000|TRAN THI KIM ANH|Agribank|5495215016444|5000|${transferContent}`}
                  size={180}
                  level="H"
                />
              </div>
            </div>
            <p className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Mở App Ngân hàng bất kỳ để quét mã VietQR tự động
            </p>
          </div>

          {/* Account Details */}
          <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {/* Bank Name */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Ngân hàng:</span>
              <span className="font-bold text-slate-900">Agribank</span>
            </div>

            {/* Account Number */}
            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 block">Số tài khoản:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{accountNumber}</span>
              </div>
              <button
                onClick={() => handleCopy(accountNumber, 'acc')}
                className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-amber-200 transition-colors cursor-pointer"
              >
                {copiedField === 'acc' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>

            {/* Suggested Amount */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số tiền gợi ý:</span>
              <span className="font-bold text-emerald-700 text-sm">5.000 VNĐ</span>
            </div>

            {/* Transfer Note */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Nội dung:</span>
              <span className="font-mono text-slate-800 text-[11px] truncate max-w-[200px]">
                {transferContent}
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[11px] text-slate-400 italic">
              * Tùy chọn chuyển khoản là hoàn toàn tự nguyện. Chúc Thầy/Cô có những tiết dạy thật thành công!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={onClose}
              className="w-full text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Đóng / Rời đi
            </button>
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Đã ủng hộ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
