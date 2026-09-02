"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { IeltsFeedback, IeltsPracticeLog } from "@/types/english";
import {
  generateIeltsQuestion,
  analyzeIeltsResponse,
  getIeltsLogs,
  saveIeltsLog,
  deleteIeltsLog,
} from "@/app/actions/english";
import {
  Mic,
  MicOff,
  Sparkles,
  RefreshCw,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Trash2,
  ChevronRight,
  Volume2,
  Copy,
  Check,
  Zap,
} from "lucide-react";

type PartType = "Part 1" | "Part 2" | "Part 3";

const MOCK_INITIAL_LOGS: IeltsPracticeLog[] = [
  {
    id: "log_demo_1",
    userId: "demo",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    part: "Part 1",
    topic: "Work & Studies",
    question: "Do you work or are you a student? Tell me about what you do.",
    questionKo: "일하고 계신가요, 아니면 학생이신가요? 당신이 하는 일에 대해 이야기해 주세요.",
    userAnswer:
      "I am currently working as a web developer. I build websites and application interfaces for users. I really enjoy my job because I can create something useful every day.",
    feedback: {
      estimatedBand: 6.0,
      fluencySummary: "자연스러운 속도로 끊김 없이 문장을 이어 나갔습니다.",
      vocabularySummary: "web developer, application interface 등 업무 관련 어휘가 정확합니다.",
      grammarSummary: "현재진행형과 관계대명사(because) 구문이 명확히 전달되었습니다.",
      overallSummary:
        "전반적인 의사 전달력이 뛰어나며 목표 점수 Band 6.0 기준에 완벽하게 도합합니다. 더 구체적인 연결어(In addition, Specifically)를 더하면 6.5 이상도 가능합니다.",
      improvedAnswer:
        "Currently, I work as a full-stack software engineer. My main responsibility involves developing user-centric web applications and optimizing system performance. What I find most rewarding about my career is the opportunity to solve complex problems daily.",
      keyVocabulary: [
        { word: "user-centric", meaning: "사용자 중심의" },
        { word: "optimize performance", meaning: "성능을 최적화하다" },
        { word: "rewarding", meaning: "보람이 있는" },
      ],
    },
  },
];

export default function EnglishPage() {
  const { user } = useAuth();
  const [selectedPart, setSelectedPart] = useState<PartType>("Part 1");

  // Question state
  const [currentTopic, setCurrentTopic] = useState("Work & Studies");
  const [currentQuestion, setCurrentQuestion] = useState(
    "Do you work or are you a student? Tell me about what you do."
  );
  const [currentQuestionKo, setCurrentQuestionKo] = useState(
    "일하고 계신가요, 아니면 학생이신가요? 당신이 하는 일에 대해 이야기해 주세요."
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Mic & Answer state
  const [userAnswer, setUserAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micErrorMsg, setMicErrorMsg] = useState<string | null>(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<IeltsFeedback | null>(null);

  // Model Answer Shadowing Practice state
  const [isShadowingListening, setIsShadowingListening] = useState(false);
  const [shadowingSpokenText, setShadowingSpokenText] = useState("");
  const [shadowingAccuracy, setShadowingAccuracy] = useState(0);
  const [shadowingMatchedWords, setShadowingMatchedWords] = useState<{ word: string; isMatched: boolean }[]>([]);

  // Logs & History state
  const [logs, setLogs] = useState<IeltsPracticeLog[]>(MOCK_INITIAL_LOGS);
  const [selectedLog, setSelectedLog] = useState<IeltsPracticeLog | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Recording timer
  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Load saved logs
  useEffect(() => {
    const localData = localStorage.getItem("my_workspace_english_logs");
    if (localData) {
      try {
        setLogs(JSON.parse(localData));
      } catch {}
    }

    if (user?.uid) {
      getIeltsLogs(user.uid).then((res) => {
        if (res && res.length > 0) {
          setLogs(res);
        }
      });
    }
  }, [user]);

  const updateLogsState = (newLogs: IeltsPracticeLog[]) => {
    setLogs(newLogs);
    localStorage.setItem("my_workspace_english_logs", JSON.stringify(newLogs));
  };

  // Generate Question
  const handleGenerateQuestion = async (part = selectedPart) => {
    setIsGenerating(true);
    setCurrentFeedback(null);
    setUserAnswer("");
    setMicErrorMsg(null);
    try {
      const res = await generateIeltsQuestion(part);
      setCurrentQuestion(res.question);
      setCurrentQuestionKo(res.questionKo);
      setCurrentTopic(res.topic);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Speech Recognition
  const handleToggleVoice = () => {
    setMicErrorMsg(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저나 모바일 기기에서는 음성 인식을 지원하지 않습니다. 최신 Chrome 또는 Safari를 이용해 주세요.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onstart = () => {
        setIsListening(true);
        setMicErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setUserAnswer(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setMicErrorMsg(
            "마이크 접근 권한이 차단되었습니다. 브라우저 주소창 왼쪽의 마이크/자물쇠 아이콘(🔒 또는 🎙️)을 누른 후 '마이크 허용'으로 변경해 주세요!"
          );
        } else if (event.error === "no-speech") {
          setMicErrorMsg("음성이 감지되지 않았습니다. 마이크에 가까이 대고 다시 말씀해 주세요.");
        } else {
          setMicErrorMsg(`음성 인식 오류 (${event.error}). 텍스트로 직접 입력하실 수도 있습니다.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error("Speech start error:", error);
      setIsListening(false);
      setMicErrorMsg("마이크 시작 중 오류가 발생했습니다. 권한 설정을 확인해 주세요.");
    }
  };

  // Model Answer Shadowing Speech Recognition & Accuracy Match
  const handleToggleShadowingVoice = () => {
    if (!currentFeedback?.improvedAnswer) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저나 모바일 기기에서는 음성 인식을 지원하지 않습니다.");
      return;
    }

    if (isShadowingListening) {
      setIsShadowingListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onstart = () => {
        setIsShadowingListening(true);
        setShadowingSpokenText("");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        if (transcript && currentFeedback.improvedAnswer) {
          setShadowingSpokenText(transcript);

          // Calculate Accuracy vs Improved Answer
          const cleanTarget = currentFeedback.improvedAnswer
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .split(/\s+/)
            .filter(Boolean);

          const cleanSpoken = transcript
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .split(/\s+/)
            .filter(Boolean);

          const spokenSet = new Set(cleanSpoken);
          let matchedCount = 0;

          const words = cleanTarget.map((word) => {
            const isMatched = spokenSet.has(word);
            if (isMatched) matchedCount++;
            return { word, isMatched };
          });

          const accuracy = cleanTarget.length > 0
            ? Math.min(100, Math.round((matchedCount / cleanTarget.length) * 100))
            : 0;

          setShadowingAccuracy(accuracy);
          setShadowingMatchedWords(words);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Shadowing Speech Error:", event.error);
        setIsShadowingListening(false);
      };

      recognition.onend = () => {
        setIsShadowingListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error("Shadowing speech start error:", error);
      setIsShadowingListening(false);
    }
  };

  // Submit Answer for Gemini Evaluation
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert("마이크로 대답을 녹음하시거나 답변을 입력해 주세요!");
      return;
    }

    setIsAnalyzing(true);
    try {
      const feedback = await analyzeIeltsResponse(currentQuestion, userAnswer.trim());
      setCurrentFeedback(feedback);

      // Save Log Automatically
      const newLog: IeltsPracticeLog = {
        id: `ielts_${Date.now()}`,
        userId: user?.uid || "demo",
        createdAt: new Date().toISOString(),
        part: selectedPart,
        topic: currentTopic,
        question: currentQuestion,
        questionKo: currentQuestionKo,
        userAnswer: userAnswer.trim(),
        feedback,
      };

      const updated = [newLog, ...logs];
      updateLogsState(updated);

      if (user?.uid) {
        saveIeltsLog(newLog);
      }
    } catch (err) {
      console.error("Evaluation Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm("이 연습 기록을 삭제하시겠습니까?")) return;
    const updated = logs.filter((l) => l.id !== id);
    updateLogsState(updated);
    if (selectedLog?.id === id) setSelectedLog(null);

    if (user?.uid) {
      deleteIeltsLog(id);
    }
  };

  // TTS Read Aloud Question
  const handleSpeakQuestion = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyModelAnswer = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 sm:pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-3">
              <Award size={16} />
              <span>IELTS Speaking Practice · Goal Band 6.0</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              아이엘츠 스피킹 실전 연습
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-2 max-w-xl">
              목표 점수 6.0에 맞춘 질문을 생성하고, 마이크로 대답하면 Gemini AI가 유창성·어휘·문법 총괄 피드백 및 모범 답안을 실시간으로 분석해 드립니다.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shrink-0 text-center w-full md:w-auto">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-200 block mb-1">
              목표 밴드 점수
            </span>
            <div className="text-3xl font-black text-amber-300 flex items-center justify-center space-x-1">
              <span>Band 6.0</span>
              <Zap size={20} className="fill-amber-300 text-amber-300" />
            </div>
          </div>
        </div>

        {/* Part Tabs Selector */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          {(["Part 1", "Part 2", "Part 3"] as PartType[]).map((part) => (
            <button
              key={part}
              onClick={() => {
                setSelectedPart(part);
                handleGenerateQuestion(part);
              }}
              className={`flex-1 min-w-[100px] py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                selectedPart === part
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {part} {part === "Part 1" ? "(일상)" : part === "Part 2" ? "(발표)" : "(심층토론)"}
            </button>
          ))}
        </div>

        {/* Main Practice Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Center 2 Columns: Question & Voice Practice & Feedback */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg">
                  {selectedPart} · {currentTopic}
                </span>
                <button
                  onClick={() => handleGenerateQuestion()}
                  disabled={isGenerating}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
                  <span>새 질문 생성</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    {currentQuestion}
                  </h2>
                  <button
                    onClick={() => handleSpeakQuestion(currentQuestion)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shrink-0"
                    title="원어민 발음 듣기"
                  >
                    <Volume2 size={20} />
                  </button>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">{currentQuestionKo}</p>
              </div>
            </div>

            {/* Voice Input & Recording Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <Mic className="text-indigo-600" size={20} />
                  <span>마이크 대답 녹음</span>
                </h3>
                {isListening && (
                  <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-extrabold rounded-full animate-pulse flex items-center space-x-1">
                    <span className="w-2 h-2 bg-rose-600 rounded-full animate-ping mr-1" />
                    녹음 중 ({recordingSeconds}초)
                  </span>
                )}
              </div>

              {micErrorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl leading-relaxed flex items-start space-x-2">
                  <span className="text-base">⚠️</span>
                  <span>{micErrorMsg}</span>
                </div>
              )}

              {/* Textarea for spoken answer */}
              <div className="relative">
                <textarea
                  rows={4}
                  placeholder="마이크 버튼을 누르고 영어로 대답하세요. (말씀하신 내용이 실시간 텍스트로 전환됩니다)"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  onClick={handleToggleVoice}
                  className={`flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-md ${
                    isListening
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 animate-pulse"
                      : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200"
                  }`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  <span>{isListening ? "녹음 정지하기" : "마이크 녹음 시작"}</span>
                </button>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={isAnalyzing || !userAnswer.trim()}
                  className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles size={18} className="animate-spin" />
                      <span>Gemini AI 피드백 분석 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>AI 종합 피드백 요청</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Gemini Feedback Display Section */}
            {currentFeedback && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-xl space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <Award size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Gemini AI 총괄 피드백</h3>
                      <p className="text-slate-500 text-xs">Band 6.0 목표 기준 종합 채점 보고서</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">추정 점수</span>
                    <span className="text-2xl font-black text-indigo-600">
                      Band {currentFeedback.estimatedBand}
                    </span>
                  </div>
                </div>

                {/* Summary Alert Box */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 text-slate-800 leading-relaxed text-sm font-medium">
                  <strong className="block text-indigo-900 font-bold mb-1">🎯 총괄 평가</strong>
                  {currentFeedback.overallSummary}
                </div>

                {/* Score Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-xs font-bold text-indigo-600 block">🗣️ 유창성 및 일관성</span>
                    <p className="text-xs text-slate-600 leading-normal">{currentFeedback.fluencySummary}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-xs font-bold text-indigo-600 block">📚 어휘 사용력</span>
                    <p className="text-xs text-slate-600 leading-normal">{currentFeedback.vocabularySummary}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-xs font-bold text-indigo-600 block">✍️ 문법 정확도</span>
                    <p className="text-xs text-slate-600 leading-normal">{currentFeedback.grammarSummary}</p>
                  </div>
                </div>

                {/* Recommended Model Answer & Interactive Shadowing Practice */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
                      <Sparkles size={16} className="text-amber-500" />
                      <span>Band 6.5+ 모범 답안 섀도잉 (따라 읽기)</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSpeakQuestion(currentFeedback.improvedAnswer)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
                        title="원어민 느린 발음으로 모범 답안 듣기"
                      >
                        <Volume2 size={14} />
                        <span>듣기 (TTS)</span>
                      </button>
                      <button
                        onClick={() => handleCopyModelAnswer(currentFeedback.improvedAnswer)}
                        className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 font-bold"
                      >
                        {copiedText ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedText ? "복사됨" : "복사"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Model Answer Box */}
                  <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-sm font-mono leading-relaxed shadow-inner">
                    {currentFeedback.improvedAnswer}
                  </div>

                  {/* Shadowing Practice Widget */}
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-indigo-950 flex items-center space-x-1.5">
                          <Mic size={14} className="text-indigo-600" />
                          <span>모범 답안 소리 내어 읽기 연습</span>
                        </h4>
                        <p className="text-[11px] text-indigo-600 mt-0.5">
                          마이크를 켜고 위 모범 답안을 읽으면 단어별 발음 일치도를 분석해 드립니다.
                        </p>
                      </div>

                      <button
                        onClick={handleToggleShadowingVoice}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center space-x-1.5 shrink-0 ${
                          isShadowingListening
                            ? "bg-rose-600 text-white animate-pulse shadow-md"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                        }`}
                      >
                        {isShadowingListening ? <MicOff size={14} /> : <Mic size={14} />}
                        <span>{isShadowingListening ? "녹음 정지" : "따라 읽기 시작"}</span>
                      </button>
                    </div>

                    {/* Shadowing Results & Accuracy Display */}
                    {shadowingSpokenText && (
                      <div className="bg-white rounded-xl p-4 border border-indigo-100 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-xs font-bold text-slate-700">인식된 나의 발음</span>
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full">
                            발음 일치율: {shadowingAccuracy}% 🎯
                          </span>
                        </div>

                        {/* Spoken Text Display */}
                        <p className="text-xs text-slate-700 font-medium italic">
                          &quot;{shadowingSpokenText}&quot;
                        </p>

                        {/* Word Match Checklist */}
                        {shadowingMatchedWords.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[10px] font-extrabold text-slate-400 block mb-1.5 uppercase">
                              단어별 정확도 체크
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {shadowingMatchedWords.map((item, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                    item.isMatched
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {item.word} {item.isMatched ? "✓" : ""}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Key Vocabulary */}
                {currentFeedback.keyVocabulary && currentFeedback.keyVocabulary.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold text-slate-700">💡 핵심 추천 표현</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentFeedback.keyVocabulary.map((vocab, i) => (
                        <div key={i} className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-xs">
                          <span className="font-bold text-slate-900">{vocab.word}</span>
                          <span className="text-slate-500">{vocab.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Saved Practice Log History */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen size={18} className="text-indigo-600" />
                  <h3 className="font-black text-slate-900 text-base">연습 기록 ({logs.length})</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400">자동 저장됨</span>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  아직 저장된 스피킹 연습 기록이 없습니다.
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => {
                        setSelectedLog(log);
                        setCurrentQuestion(log.question);
                        setCurrentQuestionKo(log.questionKo);
                        setUserAnswer(log.userAnswer);
                        setCurrentFeedback(log.feedback);
                      }}
                      className="p-4 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-200 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md">
                          {log.part}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-indigo-600">
                            Band {log.feedback.estimatedBand}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLog(log.id);
                            }}
                            className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {log.question}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>{new Date(log.createdAt).toLocaleDateString("ko-KR")}</span>
                        <span className="text-indigo-600 font-bold group-hover:underline flex items-center">
                          상세보기 <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
