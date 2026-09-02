"use client";

import { DailyItem } from "@/types/schedule";
import { useState } from "react";
import { Plus, Calendar as CalendarIcon, CheckCircle2, Circle, Trash2, ChevronLeft, ChevronRight, Mic, MicOff, Sparkles, Loader2 } from "lucide-react";
import { refineVoiceInputWithAI } from "@/app/actions/ai";

interface DailyScheduleProps {
  items: DailyItem[];
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  onAddItem: (title: string, timeSlot?: string) => void;
  onToggleItem: (id: string, currentCompleted: boolean) => void;
  onDeleteItem: (id: string) => void;
}

export default function DailySchedule({
  items,
  selectedDate,
  onDateChange,
  onAddItem,
  onToggleItem,
  onDeleteItem,
}: DailyScheduleProps) {
  const [newTitle, setNewTitle] = useState("");
  const [timeSlot, setTimeSlot] = useState("오전");
  const [isListening, setIsListening] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const currentItems = items.filter((item) => item.date === selectedDate);
  const completedCount = currentItems.filter((item) => item.completed).length;

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split("T")[0]);
  };

  const handleVoiceInput = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저나 기기에서는 음성 입력을 지원하지 않습니다.");
      return;
    }

    // 모바일 기기 마이크 허용 팝업 강제 요청
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        console.error("마이크 권한 거부됨:", err);
        alert("마이크 사용 권한이 차단되어 있습니다. 브라우저 주소창 마이크 권한을 허용해 주세요!");
        return;
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
              setNewTitle((prev) => (prev ? `${prev} ${res.result}` : res.result));
            } else {
              setNewTitle((prev) => (prev ? `${prev} ${transcript}` : transcript));
            }
          } catch (err) {
            console.error("AI 다듬기 실패:", err);
            setNewTitle((prev) => (prev ? `${prev} ${transcript}` : transcript));
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
    if (!newTitle.trim()) return;
    onAddItem(newTitle.trim(), timeSlot);
    setNewTitle("");
  };

  return (
    <div className="space-y-8">
      {/* Date Header Picker */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center justify-between w-full sm:w-auto space-x-3">
          <button
            onClick={handlePrevDay}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl sm:rounded-2xl transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900">{selectedDate}</h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="px-2 sm:px-3 py-1 bg-slate-100 text-slate-700 text-[11px] sm:text-xs font-bold rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              오늘의 시간을 계획하고 실천 결과를 체크하세요. ({completedCount}/{currentItems.length}개 완료)
            </p>
          </div>
          <button
            onClick={handleNextDay}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl sm:rounded-2xl transition-colors shrink-0"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <button
          onClick={() => onDateChange(new Date().toISOString().split("T")[0])}
          className="w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-100 transition-colors shrink-0 text-center"
        >
          오늘로 이동
        </button>
      </div>

      {/* Add New Daily Todo Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        <div className="flex items-center space-x-2 flex-1">
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="px-3 py-2 sm:py-2.5 bg-slate-50 text-slate-700 font-bold text-xs rounded-xl sm:rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
          >
            <option value="오전">오전</option>
            <option value="오후">오후</option>
            <option value="저녁">저녁</option>
            <option value="종일">종일</option>
          </select>
          <input
            type="text"
            placeholder="오늘 수행할 일정을 입력하세요..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 bg-transparent text-slate-900 font-medium text-xs sm:text-sm placeholder-slate-400 outline-none px-1 sm:px-2"
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isAiProcessing}
            className={`p-2 rounded-xl transition-all flex items-center justify-center ${
              isAiProcessing
                ? "bg-indigo-100 text-indigo-600 animate-spin"
                : isListening
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title={isAiProcessing ? "AI가 문장을 정돈하는 중..." : "음성으로 입력하기 (AI 다듬기)"}
          >
            {isAiProcessing ? (
              <Sparkles size={18} />
            ) : isListening ? (
              <MicOff size={18} />
            ) : (
              <Mic size={18} />
            )}
          </button>
        </div>
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md transition-all active:scale-95 shrink-0 w-full sm:w-auto text-center"
        >
          등록
        </button>
      </form>

      {/* Todo Items List */}
      {currentItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <CalendarIcon className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-slate-700 font-bold mb-1">등록된 일일 일정이 없습니다.</h3>
          <p className="text-slate-400 text-sm">위 입력란에서 오늘 할 일을 추가해 보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-4 border transition-all flex items-center justify-between gap-4 ${
                item.completed ? "border-slate-200 bg-slate-50/50 opacity-75" : "border-slate-200 shadow-sm"
              }`}
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onToggleItem(item.id, item.completed)}
                  className="text-slate-300 hover:text-blue-600 transition-colors shrink-0"
                >
                  {item.completed ? (
                    <CheckCircle2 size={22} className="text-blue-600 fill-blue-50" />
                  ) : (
                    <Circle size={22} />
                  )}
                </button>

                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-extrabold rounded-lg shrink-0">
                  {item.timeSlot || "종일"}
                </span>

                <span
                  className={`text-sm font-bold text-slate-900 ${
                    item.completed ? "line-through text-slate-400" : ""
                  }`}
                >
                  {item.title}
                </span>
              </div>

              <button
                onClick={() => onDeleteItem(item.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
