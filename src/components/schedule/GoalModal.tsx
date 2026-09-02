"use client";

import { GoalCategory, GoalStatus, ItemKind, ScheduleItem } from "@/types/schedule";
import { useState, useEffect } from "react";
import { X, Mic, MicOff, Sparkles } from "lucide-react";
import { refineVoiceInputWithAI } from "@/app/actions/ai";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "yearly" | "monthly" | "weekly";
  initialData?: ScheduleItem | null;
  selectedYear: number;
  selectedMonth: number;
  selectedWeek: number;
  onSave: (data: any) => void;
}

const CATEGORIES: { value: GoalCategory; label: string }[] = [
  { value: "growth", label: "자아성장" },
  { value: "career", label: "커리어" },
  { value: "health", label: "건강" },
  { value: "finance", label: "재정" },
  { value: "lifestyle", label: "라이프스타일" },
];

const STATUSES: { value: GoalStatus; label: string }[] = [
  { value: "todo", label: "시작 전" },
  { value: "in_progress", label: "진행 중" },
  { value: "completed", label: "달성 완료" },
  { value: "on_hold", label: "보류" },
];

export default function GoalModal({
  isOpen,
  onClose,
  type,
  initialData,
  selectedYear,
  selectedMonth,
  selectedWeek,
  onSave,
}: GoalModalProps) {
  const [itemKind, setItemKind] = useState<ItemKind>("goal");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory>("growth");
  const [status, setStatus] = useState<GoalStatus>("todo");
  const [progress, setProgress] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setItemKind((initialData as any).itemKind || "goal");
      setTitle(initialData.title || "");
      setDescription((initialData as any).description || "");
      setCategory((initialData as any).category || "growth");
      setStatus((initialData as any).status || "todo");
      setProgress((initialData as any).progress || 0);
    } else {
      setItemKind("goal");
      setTitle("");
      setDescription("");
      setCategory("growth");
      setStatus("todo");
      setProgress(0);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const typeLabels = {
    yearly: `${selectedYear}년 연간`,
    monthly: `${selectedMonth}월 월간`,
    weekly: `${selectedMonth}월 ${selectedWeek}주차`,
  };

  const handleVoiceInput = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저나 기기에서는 음성 입력을 지원하지 않습니다.");
      return;
    }

    // 모바일 기기 및 PC 마이크 권한/장치 확인
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        console.warn("MediaDevices getUserMedia notice:", err);
        if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          alert("컴퓨터에 연결된 마이크 장치를 찾을 수 없습니다. 마이크/이어폰 연결 상태를 확인해 주세요.");
          return;
        } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          alert("마이크 사용 권한이 차단되어 있습니다. 브라우저 주소창 마이크 권한을 허용해 주세요!");
          return;
        }
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "ko-KR";
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setIsListening(false);
          setIsAiProcessing(true);
          try {
            const res = await refineVoiceInputWithAI(transcript);
            if (res && res.result) {
              setTitle((prev) => (prev ? `${prev} ${res.result}` : res.result));
            } else {
              setTitle((prev) => (prev ? `${prev} ${transcript}` : transcript));
            }
          } catch (err) {
            console.error("AI 다듬기 실패:", err);
            setTitle((prev) => (prev ? `${prev} ${transcript}` : transcript));
          } finally {
            setIsAiProcessing(false);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("음성 인식 오류:", event.error);
        setIsListening(false);
        setIsAiProcessing(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error("음성 인식 시작 실패:", error);
      setIsListening(false);
      setIsAiProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: any = {
      ...(initialData ? { id: initialData.id } : {}),
      itemKind,
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      type,
      year: selectedYear,
      month: selectedMonth,
      weekNumber: selectedWeek,
    };

    if (type === "yearly") {
      payload.progress = Number(progress);
    }

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 border border-slate-100 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 sm:pb-4 mb-5 sm:mb-6 sticky top-0 bg-white z-10">
          <h3 className="text-lg sm:text-xl font-black text-slate-900">
            {initialData ? "목표·일정 수정" : `${typeLabels[type]} 목표·일정 등록`}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item Kind Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">구분</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setItemKind("goal")}
                className={`py-2.5 text-xs font-extrabold rounded-2xl border transition-all ${
                  itemKind === "goal"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                🎯 목표 (Goal)
              </button>
              <button
                type="button"
                onClick={() => setItemKind("event")}
                className={`py-2.5 text-xs font-extrabold rounded-2xl border transition-all ${
                  itemKind === "event"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                📅 일정 / 이벤트 (Schedule)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {itemKind === "goal" ? "목표 제목 *" : "일정 제목 *"}
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                placeholder={itemKind === "goal" ? "이루고 싶은 목표를 적어보세요" : "진행할 일정이나 이벤트 명칭을 입력하세요"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isAiProcessing}
                className={`absolute right-2 p-2 rounded-xl transition-all flex items-center justify-center ${
                  isAiProcessing
                    ? "bg-indigo-100 text-indigo-600 animate-spin"
                    : isListening
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                title={isAiProcessing ? "AI가 문장을 정돈하는 중..." : "음성으로 입력하기 (AI 다듬기)"}
              >
                {isAiProcessing ? (
                  <Sparkles size={16} />
                ) : isListening ? (
                  <MicOff size={16} />
                ) : (
                  <Mic size={16} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">카테고리</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    category === cat.value
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {type === "yearly" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">진행률 ({progress}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer mt-2"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">세부 설명 / 액션 플랜</label>
            <textarea
              rows={3}
              placeholder="구체적인 실행 방법이나 메모를 기록해보세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
