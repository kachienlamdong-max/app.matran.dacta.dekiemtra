import React, { useState, useEffect } from 'react';
import { X, Coffee, Copy, Check, Heart, ShieldCheck, Settings, Save, RotateCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName?: string;
}

interface BankConfig {
  bankId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
}

const POPULAR_BANKS = [
  { id: 'agribank', name: 'Agribank (Ngân hàng Nông nghiệp & PTNT)' },
  { id: 'vietcombank', name: 'Vietcombank (VCB)' },
  { id: 'mbbank', name: 'MBBank (Ngân hàng Quân Đội)' },
  { id: 'bidv', name: 'BIDV (Đầu tư & Phát triển VN)' },
  { id: 'vietinbank', name: 'VietinBank (Công Thương VN)' },
  { id: 'techcombank', name: 'Techcombank' },
  { id: 'vpbank', name: 'VPBank' },
  { id: 'acb', name: 'ACB (Á Châu)' },
  { id: 'tpbank', name: 'TPBank (Tiên Phong)' },
  { id: 'sacombank', name: 'Sacombank' },
  { id: 'hdbank', name: 'HDBank' },
  { id: 'vib', name: 'VIB (Quốc Tế)' },
  { id: 'shb', name: 'SHB (Sài Gòn - Hà Nội)' },
  { id: 'lpbank', name: 'LPBank (Lộc Phát VN)' },
  { id: 'msb', name: 'MSB (Hàng Hải)' },
  { id: 'ocb', name: 'OCB (Phương Đông)' },
];

const DEFAULT_CONFIG: BankConfig = {
  bankId: 'agribank',
  bankName: 'Agribank (Ngân hàng Nông nghiệp & PTNT)',
  accountNumber: '5495215016444',
  accountName: 'TRAN THI KIM ANH',
  amount: 5000,
};

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, teacherName }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bankConfig, setBankConfig] = useState<BankConfig>(DEFAULT_CONFIG);
  const [editForm, setEditForm] = useState<BankConfig>(DEFAULT_CONFIG);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load saved bank config from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('edumatrix_bank_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setBankConfig(parsed);
        setEditForm(parsed);
      }
    } catch (e) {
      console.error('Error loading bank config', e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const transferContent = `Ung ho EduMatrix AI ${teacherName ? teacherName.replace(/[^a-zA-Z0-9 ]/g, '') : ''}`.trim();

  // VietQR URL
  const vietQrUrl = `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNumber}-compact2.png?amount=${bankConfig.amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankConfig.accountName)}`;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...editForm,
      accountNumber: editForm.accountNumber.trim().replace(/\s+/g, ''),
      accountName: editForm.accountName.trim().toUpperCase(),
    };
    setBankConfig(updated);
    localStorage.setItem('edumatrix_bank_config', JSON.stringify(updated));
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefault = () => {
    setBankConfig(DEFAULT_CONFIG);
    setEditForm(DEFAULT_CONFIG);
    localStorage.removeItem('edumatrix_bank_config');
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-amber-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-6 text-white text-center relative">
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer text-xs flex items-center gap-1 px-2"
              title="Chỉnh sửa thông tin tài khoản nhận ủng hộ"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">
                {isEditing ? 'Hủy sửa' : 'Đổi STK'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/30">
            <Coffee className="w-7 h-7 text-white" />
          </div>

          <h3 className="text-xl font-black tracking-tight">Mời Tác Giả Ly Cà Phê</h3>
          <p className="text-xs text-amber-100 mt-1 max-w-xs mx-auto">
            Sự ủng hộ <strong>{bankConfig.amount.toLocaleString('vi-VN')}đ</strong> của Thầy/Cô là động lực to lớn giúp duy trì máy chủ và phát triển thêm nhiều tính năng AI phục vụ giáo dục!
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã cập nhật thông tin tài khoản nhận ủng hộ thành công!</span>
            </div>
          )}

          {isEditing ? (
            /* Edit Form */
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-sm font-bold text-slate-800">Cấu hình Tài khoản của Bạn</h4>
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Khôi phục mặc định</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn Ngân hàng:
                </label>
                <select
                  value={editForm.bankId}
                  onChange={(e) => {
                    const selected = POPULAR_BANKS.find((b) => b.id === e.target.value);
                    setEditForm({
                      ...editForm,
                      bankId: e.target.value,
                      bankName: selected?.name || e.target.value,
                    });
                  }}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {POPULAR_BANKS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số tài khoản nhận tiền:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập số tài khoản ngân hàng"
                  value={editForm.accountNumber}
                  onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên chủ tài khoản (In hoa không dấu):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: NGUYEN VAN A"
                  value={editForm.accountName}
                  onChange={(e) => setEditForm({ ...editForm, accountName: e.target.value.toUpperCase() })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số tiền gợi ý (VNĐ):
                </label>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) || 5000 })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 text-xs py-2 px-3 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs cursor-pointer font-bold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu thông tin</span>
                </button>
              </div>
            </form>
          ) : (
            /* View QR & Info */
            <>
              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center bg-amber-50/60 border-2 border-dashed border-amber-200 rounded-2xl p-4 text-center">
                <div className="bg-white p-2.5 rounded-xl shadow-md border border-slate-100 mb-2">
                  <img
                    src={vietQrUrl}
                    alt={`Mã QR Chuyển khoản ${bankConfig.bankName}`}
                    className="w-48 h-auto object-contain mx-auto min-h-[190px]"
                    onError={(e) => {
                      // Fallback to client SVG QR if external image fails
                      e.currentTarget.style.display = 'none';
                      const fallbackDiv = document.getElementById('qr-svg-fallback');
                      if (fallbackDiv) fallbackDiv.style.display = 'block';
                    }}
                  />
                  <div id="qr-svg-fallback" style={{ display: 'none' }} className="p-2">
                    <QRCodeSVG
                      value={`2|99||${bankConfig.accountName}|${bankConfig.bankName}|${bankConfig.accountNumber}|${bankConfig.amount}|${transferContent}`}
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
                  <span className="font-bold text-slate-900 text-right truncate max-w-[220px]">
                    {bankConfig.bankName}
                  </span>
                </div>

                {/* Account Holder Name */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <span className="font-mono font-bold text-slate-900 uppercase">
                    {bankConfig.accountName}
                  </span>
                </div>

                {/* Account Number */}
                <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Số tài khoản:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {bankConfig.accountNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(bankConfig.accountNumber, 'acc')}
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
                  <span className="font-bold text-emerald-700 text-sm">
                    {bankConfig.amount.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>

                {/* Transfer Note */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nội dung:</span>
                  <span className="font-mono text-slate-800 text-[11px] truncate max-w-[200px]">
                    {transferContent}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60">
                <span>Thầy/Cô muốn đổi sang STK của mình?</span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-amber-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  <span>Đổi STK ngay</span>
                </button>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

