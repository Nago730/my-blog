"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Lock, X, CheckCircle2, KeyRound } from "lucide-react";

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasscodeModal({ isOpen, onClose }: PasscodeModalProps) {
  const { verifyPasscode, isOwner, ownerSignOut } = useAuth();
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await verifyPasscode(passcode);
      if (res.success) {
        setPasscode("");
        onClose();
      } else {
        setErrorMsg(res.message || "비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      setErrorMsg("인증 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await ownerSignOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-slate-900 text-white rounded-xl">
              <Lock size={18} />
            </div>
            <h3 className="text-lg font-black text-slate-900">본인 확인 (관리자)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isOwner ? (
          <div className="text-center py-4 space-y-4">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
            <div>
              <p className="text-slate-900 font-bold text-base">본인 인증이 완료되었습니다!</p>
              <p className="text-slate-500 text-xs mt-1">수정 및 관리자 권한이 활성화되어 있습니다.</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-bold text-sm rounded-2xl transition-colors"
            >
              인증 해제 (로그아웃)
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-slate-500 text-xs leading-relaxed">
              설정하신 본인 확인 비밀번호를 입력하면 일정 수정 및 모든 관리 권한이 활성화됩니다.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <KeyRound size={14} />
                <span>비밀번호 입력</span>
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="비밀번호를 입력하세요..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-500 font-bold bg-rose-50 px-3 py-2 rounded-xl">
                {errorMsg}
              </p>
            )}

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading || !passcode.trim()}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-lg transition-all active:scale-95"
              >
                {loading ? "확인 중..." : "인증하기"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
