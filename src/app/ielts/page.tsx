'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  PenTool, 
  Sparkles, 
  Award, 
  History, 
  Settings, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  ArrowRight, 
  Copy, 
  Check, 
  ChevronRight, 
  Trash2, 
  Download, 
  Upload, 
  FileText, 
  BarChart2, 
  TrendingUp, 
  Brain, 
  Lightbulb, 
  ExternalLink, 
  Layers, 
  Sparkle,
  Sun,
  Moon,
  Cloud,
  CloudOff,
  RefreshCw,
  Database,
  User,
  Laptop
} from 'lucide-react';

import { IELTSTopic, PRESET_TOPICS } from '@/data/ielts-topics';
import { EvaluationResult } from '@/app/api/ielts/evaluate/route';
import { ModelAnswerResult } from '@/app/api/ielts/model-answer/route';

export interface PracticeSession {
  id: string;
  createdAt: string;
  topic: IELTSTopic;
  essay: string;
  wordCount: number;
  timeSpentSeconds: number;
  evaluation?: EvaluationResult | null;
  modelAnswer?: ModelAnswerResult | null;
}

const STORAGE_KEY_SESSIONS = 'ielts_practice_sessions_v1';
const STORAGE_KEY_SETTINGS = 'ielts_practice_settings_v1';
const STORAGE_KEY_DRAFT = 'ielts_current_draft_v1';
const STORAGE_KEY_THEME = 'ielts_theme_mode';
const STORAGE_KEY_USER_ID = 'ielts_sync_user_id_v1';

export default function IELTSWritingPage() {
  // Theme state ('light' by default for 화이트모드)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Cloud Sync & Multi-device / Multi-user states
  const [userId, setUserId] = useState('jun');
  const [tempUserId, setTempUserId] = useState('jun');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<{
    firebaseConnected: boolean;
    geminiConfigured: boolean;
    error?: string;
  } | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'editor' | 'feedback' | 'model' | 'history' | 'settings'>('editor');

  // Topic selection & states
  const [selectedTaskType, setSelectedTaskType] = useState<'task1' | 'task2'>('task2');
  const [currentTopic, setCurrentTopic] = useState<IELTSTopic>(PRESET_TOPICS[0]);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [isCustomTopicModalOpen, setIsCustomTopicModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  // Essay editor states
  const [essayText, setEssayText] = useState('');
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Timer states
  const [timerSeconds, setTimerSeconds] = useState(40 * 60); // 40 minutes default
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [timeSpent, setTimeSpent] = useState(0);

  // Evaluation & Model answer states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isGeneratingModel, setIsGeneratingModel] = useState(false);
  const [modelAnswerResult, setModelAnswerResult] = useState<ModelAnswerResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Practice History & Sessions
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Settings
  const [apiKey, setApiKey] = useState('');
  const [preferredModel, setPreferredModel] = useState('gemini-3.5-flash-lite');
  const [targetBand, setTargetBand] = useState('7.0');

  // UI helpers
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Cloud Sync Functions
  const loadCloudSessions = async (targetUid: string) => {
    setSyncStatus('syncing');
    try {
      const res = await fetch(`/api/ielts/sessions?userId=${encodeURIComponent(targetUid)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.sessions)) {
        setSessions(prev => {
          const map = new Map<string, PracticeSession>();
          // 로컬 먼저 등록
          prev.forEach(s => map.set(s.id, s));
          // 클라우드 세션으로 덮어쓰기/병합
          data.sessions.forEach((s: PracticeSession) => map.set(s.id, s));
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          try {
            localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(merged));
          } catch {}
          return merged;
        });
        setSyncStatus('synced');
        setSyncMessage(`클라우드에서 ${data.sessions.length}개의 기록을 동기화했습니다.`);
      } else {
        setSyncStatus('idle');
      }
    } catch {
      setSyncStatus('idle');
    }
  };

  const uploadSessionToCloud = async (session: PracticeSession, targetUid: string) => {
    try {
      setSyncStatus('syncing');
      await fetch('/api/ielts/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUid, session }),
      });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('idle');
    }
  };

  const syncAllLocalToCloud = async (targetUid: string) => {
    if (sessions.length === 0) {
      alert('동기화할 연습 기록이 없습니다.');
      return;
    }
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/ielts/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUid, sessions }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus('synced');
        alert(`성공! 총 ${sessions.length}편의 에세이가 클라우드 DB에 안전하게 백업되었습니다.`);
      } else {
        throw new Error(data.error || '클라우드 저장 실패');
      }
    } catch (err: unknown) {
      setSyncStatus('error');
      const msg = err instanceof Error ? err.message : '동기화 오류';
      alert(`클라우드 동기화 실패: ${msg}\n(API 키 또는 Firebase 설정을 확인해주세요)`);
    }
  };

  const deleteSessionFromCloud = async (sessionId: string, targetUid: string) => {
    try {
      await fetch(`/api/ielts/sessions?userId=${encodeURIComponent(targetUid)}&sessionId=${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Cloud delete failed:', err);
    }
  };

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('/api/ielts/health');
      const data = await res.json();
      setHealthStatus({
        firebaseConnected: !!data.status?.firebase?.connected,
        geminiConfigured: !!data.status?.gemini?.configured,
        error: data.status?.firebase?.error,
      });
    } catch (err: unknown) {
      setHealthStatus({
        firebaseConnected: false,
        geminiConfigured: false,
        error: '헬스체크 요청 실패',
      });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  // Load stored data on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as 'light' | 'dark' | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      } else {
        setTheme('light');
      }

      const savedUid = localStorage.getItem(STORAGE_KEY_USER_ID) || 'jun';
      setUserId(savedUid);
      setTempUserId(savedUid);

      const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (savedSessions) {
        setSessions(JSON.parse(savedSessions));
      }

      // 초기 클라우드 동기화 시도
      loadCloudSessions(savedUid);

      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        const s = JSON.parse(savedSettings);
        if (s.apiKey) setApiKey(s.apiKey);
        if (s.model) setPreferredModel(s.model);
        if (s.targetBand) setTargetBand(s.targetBand);
      }

      const savedDraft = localStorage.getItem(STORAGE_KEY_DRAFT);
      if (savedDraft) {
        const d = JSON.parse(savedDraft);
        if (d.essay) setEssayText(d.essay);
        if (d.topic) setCurrentTopic(d.topic);
        if (d.taskType) setSelectedTaskType(d.taskType);
        if (d.timeSpent) setTimeSpent(d.timeSpent);
      }
    } catch (e) {
      console.error('Error loading localStorage:', e);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
    } catch {}
  };

  const isLight = theme === 'light';

  // Timer Tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
        if (timerMode === 'countdown') {
          setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
        } else {
          setTimerSeconds(prev => prev + 1);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerMode]);

  // Auto-save draft every 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (essayText) {
        try {
          const draftData = {
            essay: essayText,
            topic: currentTopic,
            taskType: selectedTaskType,
            timeSpent,
          };
          localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draftData));
          
          const now = new Date();
          setLastSavedTime(
            `${now.getHours().toString().padStart(2, '0')}:${now
              .getMinutes()
              .toString()
              .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
          );

          // 클라우드 임시저장 백그라운드 전송 (비동기)
          fetch('/api/ielts/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, draft: draftData }),
          }).catch(() => {});
        } catch (e) {
          console.error(e);
        }
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [essayText, currentTopic, selectedTaskType, timeSpent, userId]);

  // Save settings when changed
  const saveSettings = (newKey: string, newModel: string, newTarget: string) => {
    setApiKey(newKey);
    setPreferredModel(newModel);
    setTargetBand(newTarget);
    localStorage.setItem(
      STORAGE_KEY_SETTINGS,
      JSON.stringify({ apiKey: newKey, model: newModel, targetBand: newTarget })
    );
  };

  // Switch or Update User Code
  const handleApplyUserId = (newId: string) => {
    const cleanId = newId.trim() || 'jun';
    setUserId(cleanId);
    setTempUserId(cleanId);
    try {
      localStorage.setItem(STORAGE_KEY_USER_ID, cleanId);
    } catch {}
    loadCloudSessions(cleanId);
    setIsSyncModalOpen(false);
  };

  // Word count & stats
  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).filter(Boolean).length : 0;
  const paragraphCount = essayText.trim() ? essayText.trim().split(/\n\s*\n/).filter(Boolean).length : 0;
  const minRequiredWords = currentTopic.minWords || (selectedTaskType === 'task1' ? 150 : 250);
  const wordProgressPercent = Math.min(100, Math.round((wordCount / minRequiredWords) * 100));

  // Change Task Type
  const handleTaskTypeChange = (type: 'task1' | 'task2') => {
    setSelectedTaskType(type);
    const presets = PRESET_TOPICS.filter(t => t.taskType === type);
    if (presets.length > 0) {
      setCurrentTopic(presets[0]);
    }
    const defaultSec = type === 'task1' ? 20 * 60 : 40 * 60;
    setTimerSeconds(defaultSec);
    setIsTimerRunning(false);
  };

  // Format Timer Display
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // AI Topic Generation
  const handleGenerateNewTopic = async () => {
    setIsGeneratingTopic(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/ielts/topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: selectedTaskType,
          apiKey,
          model: preferredModel,
        }),
      });
      const data = await res.json();
      if (data.success && data.topic) {
        setCurrentTopic(data.topic);
        setEssayText('');
        setTimeSpent(0);
        setTimerSeconds(selectedTaskType === 'task1' ? 20 * 60 : 40 * 60);
        setIsTimerRunning(false);
        setEvaluationResult(null);
        setModelAnswerResult(null);
        setActiveSessionId(null);
      } else {
        throw new Error(data.error || '주제 생성에 실패했습니다.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '주제 생성 실패';
      setErrorMessage(msg);
    } finally {
      setIsGeneratingTopic(false);
    }
  };

  // Select Preset Topic
  const handleSelectPreset = (topicId: string) => {
    const found = PRESET_TOPICS.find(t => t.id === topicId);
    if (found) {
      setCurrentTopic(found);
      setSelectedTaskType(found.taskType);
      setTimerSeconds(found.taskType === 'task1' ? 20 * 60 : 40 * 60);
      setIsTimerRunning(false);
      setEssayText('');
      setTimeSpent(0);
      setEvaluationResult(null);
      setModelAnswerResult(null);
      setActiveSessionId(null);
    }
  };

  // Submit Custom Topic
  const handleSaveCustomTopic = () => {
    if (!customPrompt.trim()) return;
    const newTopic: IELTSTopic = {
      id: `custom-${Date.now()}`,
      taskType: selectedTaskType,
      subType: 'Custom Practice',
      category: 'General',
      title: customTitle.trim() || 'Custom IELTS Prompt',
      prompt: customPrompt.trim(),
      instructions: [
        `Write at least ${selectedTaskType === 'task1' ? '150' : '250'} words.`,
        'Support your ideas with relevant examples.'
      ],
      recommendedMinutes: selectedTaskType === 'task1' ? 20 : 40,
      minWords: selectedTaskType === 'task1' ? 150 : 250,
    };
    setCurrentTopic(newTopic);
    setIsCustomTopicModalOpen(false);
    setCustomTitle('');
    setCustomPrompt('');
    setEssayText('');
    setTimeSpent(0);
  };

  // AI Evaluation (Submit for feedback)
  const handleEvaluateEssay = async () => {
    if (wordCount < 20) {
      alert('최소 20단어 이상 작성한 후 채점을 요청해주세요.');
      return;
    }
    setIsEvaluating(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/ielts/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic,
          essay: essayText,
          taskType: selectedTaskType,
          apiKey,
          model: preferredModel,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || '채점 도중 오류가 발생했습니다.');
      }

      const evalData: EvaluationResult = data.evaluation;
      setEvaluationResult(evalData);
      setIsTimerRunning(false);

      // Save to sessions history
      const newSession: PracticeSession = {
        id: activeSessionId || `session-${Date.now()}`,
        createdAt: new Date().toISOString(),
        topic: currentTopic,
        essay: essayText,
        wordCount,
        timeSpentSeconds: timeSpent,
        evaluation: evalData,
        modelAnswer: modelAnswerResult,
      };

      const updatedSessions = [newSession, ...sessions.filter(s => s.id !== newSession.id)];
      setSessions(updatedSessions);
      setActiveSessionId(newSession.id);
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updatedSessions));

      // 클라우드 Firestore에 동기화
      uploadSessionToCloud(newSession, userId);

      // Switch to feedback tab automatically
      setActiveTab('feedback');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '채점 요청에 실패했습니다.';
      setErrorMessage(msg);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Generate Model Answer
  const handleGenerateModelAnswer = async () => {
    setIsGeneratingModel(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/ielts/model-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic,
          taskType: selectedTaskType,
          apiKey,
          model: preferredModel,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || '모범 답안 생성 실패');
      }

      const modelData: ModelAnswerResult = data.modelAnswer;
      setModelAnswerResult(modelData);

      // Update current session if exists
      if (activeSessionId) {
        let updatedSessionToSync: PracticeSession | null = null;
        const updated = sessions.map(s => {
          if (s.id === activeSessionId) {
            const mod = { ...s, modelAnswer: modelData };
            updatedSessionToSync = mod;
            return mod;
          }
          return s;
        });
        setSessions(updated);
        localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
        if (updatedSessionToSync) {
          uploadSessionToCloud(updatedSessionToSync, userId);
        }
      }

      setActiveTab('model');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '모범 답안 생성 실패';
      setErrorMessage(msg);
    } finally {
      setIsGeneratingModel(false);
    }
  };

  // Load a past session from History
  const handleLoadSession = (session: PracticeSession) => {
    setActiveSessionId(session.id);
    setCurrentTopic(session.topic);
    setSelectedTaskType(session.topic.taskType);
    setEssayText(session.essay);
    setTimeSpent(session.timeSpentSeconds || 0);
    setEvaluationResult(session.evaluation || null);
    setModelAnswerResult(session.modelAnswer || null);
    if (session.evaluation) {
      setActiveTab('feedback');
    } else {
      setActiveTab('editor');
    }
  };

  // Delete a session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('이 연습 기록을 삭제하시겠습니까?')) return;
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(filtered));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
    // 클라우드에서도 삭제
    deleteSessionFromCloud(id, userId);
  };

  // Export history as JSON
  const handleExportHistory = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ielts_writing_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Calculate Average Band Score
  const evaluatedSessions = sessions.filter(s => s.evaluation?.overallScore);
  const avgBand = evaluatedSessions.length > 0
    ? (evaluatedSessions.reduce((acc, s) => acc + (s.evaluation?.overallScore || 0), 0) / evaluatedSessions.length).toFixed(1)
    : '0.0';

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 ${
      isLight ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Navigation Bar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
        isLight ? 'bg-white/90 border-slate-200/90 shadow-xs' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className={`flex items-center gap-2 group transition-colors ${
                isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-lg tracking-tight ${
                isLight ? 'text-slate-900' : 'bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent'
              }`}>
                IELTS AI Studio
              </span>
            </Link>

            <span className={`hidden md:inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
              isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }`}>
              Writing Coach
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Tab Selector */}
            <nav className={`flex items-center gap-1 p-1 rounded-xl border shadow-inner ${
              isLight ? 'bg-slate-100/90 border-slate-200/90' : 'bg-slate-800/80 border-slate-700/60'
            }`}>
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'editor'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>연습실</span>
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'feedback'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>첨삭·피드백</span>
                {evaluationResult && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('model')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'model'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>모범 답안</span>
                {modelAnswerResult && (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">기록</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                  isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-700 text-slate-300'
                }`}>
                  {sessions.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-indigo-600 text-white' 
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
                title="설정"
              >
                <Settings className="w-4 h-4" />
              </button>
            </nav>

            {/* Cloud Sync Button */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className={`p-2 rounded-xl transition-colors border flex items-center gap-1.5 text-xs font-semibold ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="어느 컴퓨터에서나 동기화 (클라우드 DB)"
            >
              <Cloud className={`w-4 h-4 ${syncStatus === 'syncing' ? 'text-indigo-500 animate-spin' : 'text-indigo-600'}`} />
              <span className="hidden md:inline font-mono">{userId}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-colors border flex items-center gap-1.5 text-xs font-semibold ${
                isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title={isLight ? '다크 모드로 전환' : '화이트 모드로 전환'}
            >
              {isLight ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="hidden md:inline">화이트</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="hidden md:inline">다크</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3 text-rose-600 dark:text-rose-300 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <div className="flex-1 text-sm">
              <span className="font-semibold">오류 발생: </span>
              {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-500 hover:text-rose-700 underline"
            >
              닫기
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: WRITING STUDIO (에디터 & 실시간 작성) */}
        {/* ======================================================== */}
        {activeTab === 'editor' && (
          <div className="flex flex-col gap-6">
            {/* Top Controls: Task Toggle, Presets, AI Generate, Timer */}
            <div className={`rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 transition-colors ${
              isLight
                ? 'bg-white border border-slate-200/90 shadow-sm'
                : 'bg-slate-900/70 border border-slate-800 shadow-sm backdrop-blur-sm'
            }`}>
              {/* Task Type Switch */}
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-xl flex items-center border ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
                }`}>
                  <button
                    onClick={() => handleTaskTypeChange('task2')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      selectedTaskType === 'task2'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Task 2 (Essay · 40분)
                  </button>
                  <button
                    onClick={() => handleTaskTypeChange('task1')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      selectedTaskType === 'task1'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Task 1 (Report · 20분)
                  </button>
                </div>

                {/* AI New Topic Button */}
                <button
                  onClick={handleGenerateNewTopic}
                  disabled={isGeneratingTopic}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-medium shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                  title="Gemini AI로 새로운 IELTS 주제 생성"
                >
                  <Sparkle className={`w-3.5 h-3.5 ${isGeneratingTopic ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingTopic ? '주제 생성 중...' : 'AI 새 주제 받기'}</span>
                </button>
              </div>

              {/* Presets & Custom buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={currentTopic.id}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className={`text-xs sm:text-sm rounded-xl px-3 py-1.5 border focus:outline-none focus:border-indigo-500 transition-colors ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                >
                  <option value="" disabled>기출 주제 선택</option>
                  {PRESET_TOPICS.filter(t => t.taskType === selectedTaskType).map(t => (
                    <option key={t.id} value={t.id}>
                      [{t.subType}] {t.title}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsCustomTopicModalOpen(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm border transition-colors ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  직접 입력
                </button>

                {/* Timer Control Box */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                  isLight
                    ? 'bg-slate-100/90 border-slate-200 text-slate-800'
                    : 'bg-slate-800/90 border-slate-700 text-slate-100'
                }`}>
                  <Timer className={`w-4 h-4 ${isTimerRunning ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
                  <span className={`font-mono font-bold text-sm sm:text-base ${
                    timerSeconds < 300 && timerMode === 'countdown'
                      ? 'text-rose-500'
                      : isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}>
                    {formatTime(timerSeconds)}
                  </span>
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`p-1 rounded-lg transition-colors ${
                      isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    title={isTimerRunning ? '일시정지' : '시작'}
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(selectedTaskType === 'task1' ? 20 * 60 : 40 * 60);
                      setTimeSpent(0);
                    }}
                    className={`p-1 rounded-lg transition-colors ${
                      isLight
                        ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                    title="타이머 리셋"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Topic Prompt Card */}
            <div className={`rounded-2xl p-5 sm:p-6 relative overflow-hidden transition-colors ${
              isLight
                ? 'bg-white border border-slate-200/90 shadow-sm'
                : 'bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 shadow-md'
            }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md border ${
                  isLight
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  {currentTopic.subType}
                </span>
                <span className={`px-2.5 py-0.5 text-[11px] rounded-md border ${
                  isLight
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {currentTopic.category}
                </span>
                <span className="text-xs text-slate-400 ml-auto">
                  권장 시간: {currentTopic.recommendedMinutes}분 · 최소 {currentTopic.minWords}단어
                </span>
              </div>

              <h2 className={`text-lg sm:text-xl font-bold mb-2 tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {currentTopic.title}
              </h2>

              <p className={`leading-relaxed font-serif text-base sm:text-lg p-4 rounded-xl border mb-3 select-text ${
                isLight
                  ? 'bg-slate-50 text-slate-800 border-slate-200'
                  : 'bg-slate-900/60 text-slate-200 border-slate-800/80'
              }`}>
                {currentTopic.prompt}
              </p>

              {currentTopic.dataDescription && (
                <div className={`mt-2 p-3.5 rounded-xl text-xs sm:text-sm border space-y-1 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                }`}>
                  <div className={`font-semibold flex items-center gap-1.5 ${
                    isLight ? 'text-indigo-700' : 'text-indigo-300'
                  }`}>
                    <BarChart2 className="w-4 h-4" /> 차트 / 데이터 가이드 요약:
                  </div>
                  <pre className={`whitespace-pre-wrap font-sans text-xs leading-relaxed ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    {currentTopic.dataDescription}
                  </pre>
                </div>
              )}

              {currentTopic.instructions && currentTopic.instructions.length > 0 && (
                <div className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {currentTopic.instructions.map((inst, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      {inst}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Real-time Essay Editor Section */}
            <div className={`rounded-2xl p-5 shadow-sm flex flex-col gap-4 transition-colors ${
              isLight
                ? 'bg-white border border-slate-200/90'
                : 'bg-slate-900/90 border border-slate-800 shadow-lg'
            }`}>
              {/* Editor Header Bar (Stats & Options) */}
              <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${
                isLight ? 'border-slate-200' : 'border-slate-800'
              }`}>
                {/* Word Count Indicator */}
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-black ${
                      wordCount >= minRequiredWords 
                        ? (isLight ? 'text-emerald-600' : 'text-emerald-400')
                        : (isLight ? 'text-amber-600' : 'text-amber-400')
                    }`}>
                      {wordCount}
                    </span>
                    <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      / {minRequiredWords} words
                    </span>
                  </div>

                  {/* Word Progress Bar */}
                  <div className={`w-24 sm:w-36 h-2.5 rounded-full overflow-hidden border ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700/50'
                  }`}>
                    <div 
                      className={`h-full transition-all duration-300 ${
                        wordCount >= minRequiredWords 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                          : 'bg-gradient-to-r from-amber-500 to-orange-400'
                      }`}
                      style={{ width: `${wordProgressPercent}%` }}
                    />
                  </div>

                  <span className={`hidden sm:inline text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    문단: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{paragraphCount}</strong>개
                  </span>
                </div>

                {/* Editor Tools */}
                <div className="flex items-center gap-3">
                  <label className={`flex items-center gap-1.5 text-xs cursor-pointer select-none ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={spellCheckEnabled}
                      onChange={(e) => setSpellCheckEnabled(e.target.checked)}
                      className={`rounded text-indigo-600 focus:ring-0 ${
                        isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'
                      }`}
                    />
                    <span>스펠체크</span>
                    <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                      (실제 CBT는 Off)
                    </span>
                  </label>

                  {lastSavedTime && (
                    <span className={`text-[11px] hidden md:inline ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                      자동저장: {lastSavedTime}
                    </span>
                  )}
                </div>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  ref={editorRef}
                  value={essayText}
                  onChange={(e) => {
                    setEssayText(e.target.value);
                    if (!isTimerRunning && timeSpent === 0) {
                      setIsTimerRunning(true);
                    }
                  }}
                  spellCheck={spellCheckEnabled}
                  placeholder={`Write your ${selectedTaskType === 'task1' ? 'Task 1 report' : 'Task 2 essay'} here...\n\nStart typing to automatically start the timer.\nParagraphs will be cleanly formatted with double line-breaks.`}
                  rows={16}
                  className={`w-full rounded-xl p-4 sm:p-5 text-base leading-relaxed font-sans focus:outline-none transition-colors resize-y ${
                    isLight
                      ? 'bg-slate-50/60 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
                      : 'bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-600 focus:border-indigo-500/80 shadow-inner'
                  }`}
                />

                {wordCount < minRequiredWords && wordCount > 0 && (
                  <div className={`absolute bottom-4 right-4 text-xs px-3 py-1 rounded-lg backdrop-blur-sm pointer-events-none border ${
                    isLight
                      ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-xs'
                      : 'bg-slate-900/90 text-amber-400 border-amber-500/30'
                  }`}>
                    ⚠️ {minRequiredWords - wordCount}단어 더 작성해야 감점을 피할 수 있습니다
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm('작성 중인 내용을 초기화할까요?')) {
                        setEssayText('');
                        setTimeSpent(0);
                        setTimerSeconds(selectedTaskType === 'task1' ? 20 * 60 : 40 * 60);
                        setIsTimerRunning(false);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-xs transition-colors ${
                      isLight
                        ? 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                    }`}
                  >
                    글 비우기
                  </button>
                  <button
                    onClick={() => copyToClipboard(essayText, 'essay')}
                    disabled={!essayText}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-colors disabled:opacity-30 ${
                      isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {copiedText === 'essay' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText === 'essay' ? '복사됨!' : '내 글 복사'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Model Answer Button */}
                  <button
                    onClick={handleGenerateModelAnswer}
                    disabled={isGeneratingModel}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                    }`}
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>{isGeneratingModel ? '모범 답안 작성 중...' : 'Band 9.0 답안 보기'}</span>
                  </button>

                  {/* Submit for AI Evaluation */}
                  <button
                    onClick={handleEvaluateEssay}
                    disabled={isEvaluating || wordCount < 20}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    <Sparkles className={`w-4 h-4 ${isEvaluating ? 'animate-spin' : ''}`} />
                    <span>{isEvaluating ? 'AI 정밀 채점 중 (약 10초)...' : 'AI 채점 & 피드백 받기'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: FEEDBACK & BAND SCORE (채점 및 문장별 교정) */}
        {/* ======================================================== */}
        {activeTab === 'feedback' && (
          <div className="flex flex-col gap-6">
            {!evaluationResult ? (
              <div className={`rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 border transition-colors ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
              }`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
                  isLight ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                }`}>
                  <PenTool className="w-8 h-8" />
                </div>
                <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>아직 채점 결과가 없습니다</h3>
                <p className={`text-sm max-w-md ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  [연습실] 탭에서 에세이를 작성한 후 <strong>[AI 채점 & 피드백 받기]</strong> 버튼을 누르면
                  공식 4대 평가 기준에 맞춘 밴드 스코어와 문장별 정밀 교정 리포트를 제공합니다.
                </p>
                <button
                  onClick={() => setActiveTab('editor')}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-md shadow-indigo-600/20"
                >
                  에세이 작성하러 가기
                </button>
              </div>
            ) : (
              <>
                {/* Overall Score Header Card */}
                <div className={`rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-colors ${
                  isLight
                    ? 'bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/80 border border-indigo-200 shadow-sm'
                    : 'bg-gradient-to-r from-indigo-950/80 via-slate-900 to-violet-950/80 border border-indigo-500/30 shadow-xl'
                }`}>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="space-y-2 text-center md:text-left z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      isLight
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}>
                      Cambridge IELTS Standard Evaluation
                    </span>
                    <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      예상 Band Score 분석 리포트
                    </h2>
                    <p className={`text-sm max-w-xl leading-relaxed ${
                      isLight ? 'text-slate-600' : 'text-slate-300'
                    }`}>
                      {evaluationResult.summary}
                    </p>
                    <div className={`text-xs flex items-center gap-3 pt-1 justify-center md:justify-start ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      <span>단어 수: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{evaluationResult.wordCount} words</strong></span>
                      <span>•</span>
                      <span>작성 시간: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{Math.round(timeSpent / 60)}분</strong></span>
                    </div>
                  </div>

                  {/* Big Band Score Badge */}
                  <div className={`flex flex-col items-center justify-center p-6 rounded-2xl min-w-[160px] z-10 transition-colors ${
                    isLight
                      ? 'bg-white border-2 border-indigo-500/40 shadow-xl'
                      : 'bg-slate-900/90 border-2 border-indigo-500/50 shadow-2xl'
                  }`}>
                    <span className={`text-xs font-semibold uppercase tracking-widest ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      OVERALL
                    </span>
                    <span className="text-5xl font-black bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                      {evaluationResult.overallScore.toFixed(1)}
                    </span>
                    <span className={`text-[11px] font-semibold mt-1 ${
                      isLight ? 'text-indigo-600' : 'text-indigo-300'
                    }`}>
                      Band Score
                    </span>
                  </div>
                </div>

                {/* 4 Official Criteria Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1. Task Response / Achievement */}
                  <div className={`rounded-2xl p-5 flex flex-col gap-3 transition-colors ${
                    isLight
                      ? 'bg-white border border-slate-200/90 shadow-sm hover:border-slate-300'
                      : 'bg-slate-900/80 border border-slate-800 shadow-md hover:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold text-xs">
                          TR
                        </div>
                        <h4 className={`font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {selectedTaskType === 'task1' ? 'Task Achievement' : 'Task Response'}
                        </h4>
                      </div>
                      <span className="text-xl font-black text-blue-500">
                        {evaluationResult.criteria.taskResponse.score.toFixed(1)}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {evaluationResult.criteria.taskResponse.comment}
                    </p>
                    <div className={`mt-auto pt-2 border-t text-xs flex items-start gap-1.5 ${
                      isLight ? 'border-slate-100 text-blue-700' : 'border-slate-800/80 text-blue-300/90'
                    }`}>
                      <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" />
                      <span><strong>조언:</strong> {evaluationResult.criteria.taskResponse.advice}</span>
                    </div>
                  </div>

                  {/* 2. Coherence and Cohesion */}
                  <div className={`rounded-2xl p-5 flex flex-col gap-3 transition-colors ${
                    isLight
                      ? 'bg-white border border-slate-200/90 shadow-sm hover:border-slate-300'
                      : 'bg-slate-900/80 border border-slate-800 shadow-md hover:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold text-xs">
                          CC
                        </div>
                        <h4 className={`font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          Coherence & Cohesion
                        </h4>
                      </div>
                      <span className="text-xl font-black text-emerald-500">
                        {evaluationResult.criteria.coherenceCohesion.score.toFixed(1)}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {evaluationResult.criteria.coherenceCohesion.comment}
                    </p>
                    <div className={`mt-auto pt-2 border-t text-xs flex items-start gap-1.5 ${
                      isLight ? 'border-slate-100 text-emerald-700' : 'border-slate-800/80 text-emerald-300/90'
                    }`}>
                      <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                      <span><strong>조언:</strong> {evaluationResult.criteria.coherenceCohesion.advice}</span>
                    </div>
                  </div>

                  {/* 3. Lexical Resource */}
                  <div className={`rounded-2xl p-5 flex flex-col gap-3 transition-colors ${
                    isLight
                      ? 'bg-white border border-slate-200/90 shadow-sm hover:border-slate-300'
                      : 'bg-slate-900/80 border border-slate-800 shadow-md hover:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold text-xs">
                          LR
                        </div>
                        <h4 className={`font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          Lexical Resource (어휘 다양성)
                        </h4>
                      </div>
                      <span className="text-xl font-black text-amber-500">
                        {evaluationResult.criteria.lexicalResource.score.toFixed(1)}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {evaluationResult.criteria.lexicalResource.comment}
                    </p>
                    <div className={`mt-auto pt-2 border-t text-xs flex items-start gap-1.5 ${
                      isLight ? 'border-slate-100 text-amber-700' : 'border-slate-800/80 text-amber-300/90'
                    }`}>
                      <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                      <span><strong>조언:</strong> {evaluationResult.criteria.lexicalResource.advice}</span>
                    </div>
                  </div>

                  {/* 4. Grammatical Range and Accuracy */}
                  <div className={`rounded-2xl p-5 flex flex-col gap-3 transition-colors ${
                    isLight
                      ? 'bg-white border border-slate-200/90 shadow-sm hover:border-slate-300'
                      : 'bg-slate-900/80 border border-slate-800 shadow-md hover:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 font-bold text-xs">
                          GRA
                        </div>
                        <h4 className={`font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          Grammatical Range & Accuracy
                        </h4>
                      </div>
                      <span className="text-xl font-black text-purple-500">
                        {evaluationResult.criteria.grammaticalRange.score.toFixed(1)}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {evaluationResult.criteria.grammaticalRange.comment}
                    </p>
                    <div className={`mt-auto pt-2 border-t text-xs flex items-start gap-1.5 ${
                      isLight ? 'border-slate-100 text-purple-700' : 'border-slate-800/80 text-purple-300/90'
                    }`}>
                      <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-500" />
                      <span><strong>조언:</strong> {evaluationResult.criteria.grammaticalRange.advice}</span>
                    </div>
                  </div>
                </div>

                {/* Strengths & Key Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className={`rounded-2xl p-5 flex flex-col gap-3 border transition-colors ${
                    isLight
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm sm:text-base">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>돋보인 강점 (Strengths)</span>
                    </div>
                    <ul className={`space-y-2 text-xs sm:text-sm ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                      {evaluationResult.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Improvements */}
                  <div className={`rounded-2xl p-5 flex flex-col gap-3 border transition-colors ${
                    isLight
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : 'bg-rose-950/20 border-rose-500/30 text-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-sm sm:text-base">
                      <AlertCircle className="w-5 h-5" />
                      <span>우선 개선 과제 (Key Improvements)</span>
                    </div>
                    <ul className={`space-y-2 text-xs sm:text-sm ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                      {evaluationResult.keyImprovements.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Sentence-by-sentence Correction */}
                <div className={`rounded-2xl p-5 sm:p-6 flex flex-col gap-4 border transition-colors ${
                  isLight
                    ? 'bg-white border-slate-200/90 shadow-sm'
                    : 'bg-slate-900 border-slate-800 shadow-lg'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-lg font-bold flex items-center gap-2 ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        <PenTool className="w-5 h-5 text-indigo-500" />
                        <span>문장별 정밀 교정 (Sentence-by-Sentence)</span>
                      </h3>
                      <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        어색하거나 오류가 있는 문장을 고득점 표현으로 교정한 내역입니다.
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs rounded-lg font-medium border ${
                      isLight
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {evaluationResult.corrections.length}개 수정 제안
                    </span>
                  </div>

                  <div className="space-y-4 mt-2">
                    {evaluationResult.corrections.map((corr, idx) => (
                      <div
                        key={idx}
                        className={`rounded-xl p-4 flex flex-col gap-2.5 border transition-colors ${
                          isLight
                            ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                            isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
                            corr.category === 'grammar' 
                              ? (isLight ? 'bg-rose-100 text-rose-700' : 'bg-rose-500/20 text-rose-300')
                              : corr.category === 'vocabulary'
                              ? (isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-300')
                              : (isLight ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-300')
                          }`}>
                            {corr.category}
                          </span>
                        </div>

                        {/* Original sentence */}
                        <div className={`rounded-lg p-2.5 text-xs sm:text-sm font-serif line-through border ${
                          isLight
                            ? 'bg-rose-50 border-rose-200 text-rose-900 decoration-rose-500'
                            : 'bg-rose-950/20 border-rose-500/20 text-rose-200/90 decoration-rose-500/60'
                        }`}>
                          {corr.original}
                        </div>

                        {/* Corrected sentence */}
                        <div className={`rounded-lg p-2.5 text-xs sm:text-sm font-serif font-medium border ${
                          isLight
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        }`}>
                          ✨ {corr.corrected}
                        </div>

                        {/* Explanation */}
                        <p className={`text-xs leading-relaxed pl-1 pt-1 ${
                          isLight ? 'text-slate-600' : 'text-slate-300'
                        }`}>
                          💡 <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>설명:</strong> {corr.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vocabulary Upgrades */}
                {evaluationResult.vocabularyUpgrades && evaluationResult.vocabularyUpgrades.length > 0 && (
                  <div className={`rounded-2xl p-5 sm:p-6 flex flex-col gap-4 border transition-colors ${
                    isLight
                      ? 'bg-white border-slate-200/90 shadow-sm'
                      : 'bg-slate-900 border-slate-800 shadow-lg'
                  }`}>
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <span>고급 어휘 업그레이드 제안 (Band 8+ Vocabulary)</span>
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      평이한 단어를 더 풍부하고 학술적인 연어(Collocation) 및 고급 어휘로 변경해보세요.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {evaluationResult.vocabularyUpgrades.map((vocab, idx) => (
                        <div key={idx} className={`rounded-xl p-4 flex flex-col gap-2 border ${
                          isLight
                            ? 'bg-slate-50/70 border-slate-200'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}>
                          <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            기존 표현: <span className="font-mono text-rose-500 font-semibold line-through">{vocab.originalWordOrPhrase}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>추천 대안:</span>
                            {vocab.advancedAlternatives.map((alt, aidx) => (
                              <span key={aidx} className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${
                                isLight
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              }`}>
                                {alt}
                              </span>
                            ))}
                          </div>
                          <div className={`text-xs font-serif italic p-2 rounded border mt-1 ${
                            isLight
                              ? 'bg-white text-slate-700 border-slate-200'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}>
                            &quot;{vocab.exampleSentence}&quot;
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MODEL ANSWER (Band 9.0 완벽 모범 답안) */}
        {/* ======================================================== */}
        {activeTab === 'model' && (
          <div className="flex flex-col gap-6">
            {!modelAnswerResult ? (
              <div className={`rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 border transition-colors ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
              }`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
                  isLight ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}>
                  <Award className="w-8 h-8" />
                </div>
                <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>아직 모범 답안이 생성되지 않았습니다</h3>
                <p className={`text-sm max-w-md ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  현재 연습 중인 주제에 맞춰 <strong>Band 8.5 ~ 9.0 수준의 모범 에세이</strong>와 단락별 구조 해설,
                  고급 어휘 사전을 AI로 즉시 생성할 수 있습니다.
                </p>
                <button
                  onClick={handleGenerateModelAnswer}
                  disabled={isGeneratingModel}
                  className="mt-2 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm font-bold shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingModel ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingModel ? '모범 답안 생성 중...' : '지금 모범 답안 생성하기'}</span>
                </button>
              </div>
            ) : (
              <>
                {/* Header info */}
                <div className={`rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 border transition-colors ${
                  isLight
                    ? 'bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 border-amber-200 shadow-sm'
                    : 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border-amber-500/30'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                        isLight
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        Band {modelAnswerResult.estimatedBand.toFixed(1)} Benchmark
                      </span>
                      <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {modelAnswerResult.wordCount} words
                      </span>
                    </div>
                    <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {currentTopic.title} 모범 답안
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                        showComparison 
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs' 
                          : isLight
                          ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {showComparison ? '단일 뷰로 보기' : '내 에세이와 비교 보기 (2단)'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(modelAnswerResult.fullEssay, 'model')}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm border transition-colors ${
                        isLight
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                    >
                      {copiedText === 'model' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'model' ? '복사됨!' : '에세이 복사'}</span>
                    </button>
                  </div>
                </div>

                {/* Essay View (Side-by-side or Single) */}
                <div className={`grid gap-6 ${showComparison ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                  {/* Left: User's essay (if comparison mode) */}
                  {showComparison && (
                    <div className={`rounded-2xl p-5 flex flex-col gap-3 border transition-colors ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-slate-900 border-slate-800'
                    }`}>
                      <div className={`flex items-center justify-between border-b pb-2.5 ${
                        isLight ? 'border-slate-200' : 'border-slate-800'
                      }`}>
                        <h4 className={`font-bold text-sm flex items-center gap-2 ${
                          isLight ? 'text-slate-800' : 'text-slate-200'
                        }`}>
                          <PenTool className="w-4 h-4 text-indigo-500" />
                          <span>내가 작성한 에세이 ({wordCount} words)</span>
                        </h4>
                      </div>
                      <div className={`whitespace-pre-wrap font-serif text-sm leading-relaxed p-3 rounded-xl border min-h-[300px] ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-800'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                      }`}>
                        {essayText || '(작성된 내용이 없습니다)'}
                      </div>
                    </div>
                  )}

                  {/* Right: Model Essay */}
                  <div className={`rounded-2xl p-6 flex flex-col gap-4 border transition-colors ${
                    isLight
                      ? 'bg-white border-amber-200/80 shadow-sm'
                      : 'bg-slate-900 border-slate-800 shadow-lg'
                  }`}>
                    <div className={`flex items-center justify-between border-b pb-2.5 ${
                      isLight ? 'border-slate-200' : 'border-slate-800'
                    }`}>
                      <h4 className={`font-bold text-sm sm:text-base flex items-center gap-2 ${
                        isLight ? 'text-amber-800' : 'text-amber-300'
                      }`}>
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Band 9.0 Model Essay</span>
                      </h4>
                    </div>

                    <div className={`whitespace-pre-wrap font-serif text-base leading-relaxed p-4 rounded-xl border select-text ${
                      isLight
                        ? 'bg-amber-50/30 border-amber-200/70 text-slate-900'
                        : 'bg-slate-950/80 border-amber-500/20 text-slate-100'
                    }`}>
                      {modelAnswerResult.fullEssay}
                    </div>
                  </div>
                </div>

                {/* Paragraph Breakdown */}
                {modelAnswerResult.paragraphs && modelAnswerResult.paragraphs.length > 0 && (
                  <div className={`rounded-2xl p-6 flex flex-col gap-4 border transition-colors ${
                    isLight
                      ? 'bg-white border-slate-200/90 shadow-sm'
                      : 'bg-slate-900 border-slate-800'
                  }`}>
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      <Layers className="w-5 h-5 text-indigo-500" />
                      <span>문단별 구조 분석 & 고득점 전략 (Paragraph Breakdown)</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                      {modelAnswerResult.paragraphs.map((p, idx) => (
                        <div key={idx} className={`rounded-xl p-4 flex flex-col gap-2 border ${
                          isLight
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                              isLight
                                ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                                : 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20'
                            }`}>
                              {p.title}
                            </span>
                          </div>
                          <p className={`text-xs sm:text-sm font-serif italic p-2.5 rounded border ${
                            isLight
                              ? 'text-slate-700 bg-white border-slate-200'
                              : 'text-slate-300 bg-slate-900/80 border-slate-800/60'
                          }`}>
                            &quot;{p.content}&quot;
                          </p>
                          <div className={`text-xs pt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                            🎯 <strong>전략:</strong> {p.purpose}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Vocabulary Notebook */}
                {modelAnswerResult.keyVocabularies && modelAnswerResult.keyVocabularies.length > 0 && (
                  <div className={`rounded-2xl p-6 flex flex-col gap-4 border transition-colors ${
                    isLight
                      ? 'bg-white border-slate-200/90 shadow-sm'
                      : 'bg-slate-900 border-slate-800'
                  }`}>
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      <BookOpen className="w-5 h-5 text-amber-500" />
                      <span>모범 답안 핵심 고득점 어휘 & 표현 (Band 8+ Lexical Resource)</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-1">
                      {modelAnswerResult.keyVocabularies.map((item, idx) => (
                        <div key={idx} className={`rounded-xl p-3.5 flex flex-col gap-1 border transition-colors ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 hover:border-amber-400'
                            : 'bg-slate-950/60 border-slate-800 hover:border-amber-500/40'
                        }`}>
                          <div className="flex items-baseline justify-between">
                            <span className={`font-bold text-sm ${
                              isLight ? 'text-amber-800' : 'text-amber-300'
                            }`}>
                              {item.word}
                            </span>
                            <span className={`text-[10px] font-mono italic ${
                              isLight ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              {item.partOfSpeech}
                            </span>
                          </div>
                          <div className={`text-xs font-medium ${
                            isLight ? 'text-slate-800' : 'text-slate-200'
                          }`}>
                            {item.meaningKo}
                          </div>
                          <div className={`text-[11px] font-serif italic mt-1 p-1.5 rounded ${
                            isLight
                              ? 'bg-white border border-slate-200 text-slate-600'
                              : 'bg-slate-900/60 text-slate-400'
                          }`}>
                            {item.inContext}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Examiner Commentary */}
                {modelAnswerResult.examinerCommentary && (
                  <div className={`rounded-2xl p-6 flex flex-col gap-2 border transition-colors ${
                    isLight
                      ? 'bg-indigo-50/70 border-indigo-200 text-slate-800'
                      : 'bg-gradient-to-r from-slate-900 to-indigo-950/30 border-indigo-500/20 text-slate-300'
                  }`}>
                    <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                      isLight ? 'text-indigo-800' : 'text-indigo-300'
                    }`}>
                      <Brain className="w-4 h-4" />
                      <span>채점관의 시선: 왜 이 글이 Band 9.0인가?</span>
                    </h3>
                    <p className={`text-xs sm:text-sm leading-relaxed ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      {modelAnswerResult.examinerCommentary}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: HISTORY & RECORDS (연습 기록함) */}
        {/* ======================================================== */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-6">
            {/* History Stats Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className={`rounded-2xl p-4 flex flex-col gap-1 border transition-colors ${
                isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900 border-slate-800'
              }`}>
                <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>총 작성 에세이</span>
                <span className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{sessions.length}편</span>
              </div>
              <div className={`rounded-2xl p-4 flex flex-col gap-1 border transition-colors ${
                isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900 border-slate-800'
              }`}>
                <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>평균 Band Score</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{avgBand}</span>
              </div>
              <div className={`rounded-2xl p-4 flex flex-col gap-1 border transition-colors ${
                isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900 border-slate-800'
              }`}>
                <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Task 2 에세이</span>
                <span className="text-2xl font-black text-violet-600 dark:text-violet-400">
                  {sessions.filter(s => s.topic.taskType === 'task2').length}편
                </span>
              </div>
              <div className={`rounded-2xl p-4 flex flex-col gap-1 border transition-colors ${
                isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900 border-slate-800'
              }`}>
                <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Task 1 리포트</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {sessions.filter(s => s.topic.taskType === 'task1').length}편
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <History className="w-5 h-5 text-indigo-500" />
                <span>나의 연습 기록 및 복습 ({sessions.length})</span>
                <span className={`text-xs font-normal ml-1 font-mono px-2 py-0.5 rounded-full border ${
                  isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}>
                  사용자: {userId}
                </span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => syncAllLocalToCloud(userId)}
                  disabled={syncStatus === 'syncing' || sessions.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs disabled:opacity-40"
                  title="현재 기기의 모든 기록을 클라우드에 백업"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>클라우드 전체 백업</span>
                </button>
                <button
                  onClick={handleExportHistory}
                  disabled={sessions.length === 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-colors disabled:opacity-40 ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="기록 JSON 백업 다운로드"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON 저장</span>
                </button>
              </div>
            </div>

            {/* Session Cards List */}
            {sessions.length === 0 ? (
              <div className={`rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 border transition-colors ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
              }`}>
                <FileText className={`w-12 h-12 ${isLight ? 'text-slate-400' : 'text-slate-600'}`} />
                <h4 className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>저장된 연습 기록이 없습니다</h4>
                <p className={`text-xs max-w-sm ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  에세이를 작성하고 AI 채점을 완료하면 날짜별로 모든 에세이, 피드백, 모범 답안이 클라우드 DB와 로컬에 안전하게 자동 보관됩니다.
                </p>
                <button
                  onClick={() => setActiveTab('editor')}
                  className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  첫 에세이 작성 시작
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {sessions.map((sess) => {
                  const dateStr = new Date(sess.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={sess.id}
                      onClick={() => handleLoadSession(sess)}
                      className={`rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all border ${
                        activeSessionId === sess.id 
                          ? (isLight ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40' : 'border-indigo-500 ring-1 ring-indigo-500/40 bg-slate-800/40')
                          : (isLight ? 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 shadow-xs' : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60')
                      }`}
                    >
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            sess.topic.taskType === 'task2' 
                              ? (isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-300')
                              : (isLight ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-300')
                          }`}>
                            {sess.topic.taskType.toUpperCase()}
                          </span>
                          <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                            {sess.topic.subType}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-400">{dateStr}</span>
                        </div>

                        <h4 className={`text-sm sm:text-base font-bold transition-colors ${
                          isLight ? 'text-slate-900 hover:text-indigo-600' : 'text-white hover:text-indigo-300'
                        }`}>
                          {sess.topic.title}
                        </h4>

                        <p className={`text-xs line-clamp-1 font-serif ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          &quot;{sess.essay.slice(0, 120)}...&quot;
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                          <span>{sess.wordCount} words</span>
                          <span>•</span>
                          <span>{Math.round(sess.timeSpentSeconds / 60)}분 소요</span>
                        </div>
                      </div>

                      {/* Right: Score Badge & Actions */}
                      <div className={`flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 ${
                        isLight ? 'border-slate-200' : 'border-slate-800'
                      }`}>
                        {sess.evaluation ? (
                          <div className="text-right">
                            <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>BAND SCORE</span>
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                              {sess.evaluation.overallScore.toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">채점 전</span>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleDeleteSession(sess.id, e)}
                            className={`p-2 rounded-xl transition-colors ${
                              isLight
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                                : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                            }`}
                            title="기록 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: SETTINGS (Gemini API 키 및 모델, 클라우드 DB 연동) */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
            {/* Cloud & Multi-device Sync Box */}
            <div className={`rounded-2xl p-6 shadow-sm flex flex-col gap-5 border transition-colors ${
              isLight
                ? 'bg-white border-slate-200/90'
                : 'bg-slate-900 border-slate-800 shadow-lg'
            }`}>
              <div>
                <h3 className={`text-xl font-bold flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <Database className="w-5 h-5 text-indigo-500" />
                  <span>클라우드 DB 연동 & 다중 기기 설정</span>
                </h3>
                <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  어느 컴퓨터나 노트북에서든 동일한 코드로 접속하면 에세이 히스토리와 채점 결과가 그대로 동기화됩니다.
                </p>
              </div>

              {/* User ID / Code Input */}
              <div className="space-y-2">
                <label className={`block text-xs sm:text-sm font-semibold ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}>
                  동기화 사용자 식별 코드 (User ID)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempUserId}
                    onChange={(e) => setTempUserId(e.target.value)}
                    placeholder="예: jun, my-laptop, student1"
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none transition-colors border ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500'
                        : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    onClick={() => handleApplyUserId(tempUserId)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-xs whitespace-nowrap"
                  >
                    코드 적용 & 불러오기
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  * 회원가입 없이 원하는 식별자(영문/숫자)를 입력하시면 다른 기기에서도 동일한 코드로 즉시 접근할 수 있습니다.
                </p>
              </div>

              {/* Health Check Button & Status */}
              <div className={`p-4 rounded-xl border flex flex-col gap-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Firebase & AI Studio 연동 상태
                  </span>
                  <button
                    onClick={checkHealth}
                    disabled={isCheckingHealth}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                    <span>{isCheckingHealth ? '점검 중...' : '연동 상태 확인'}</span>
                  </button>
                </div>

                {healthStatus ? (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Firebase Firestore:</span>
                      {healthStatus.firebaseConnected ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 정상 연결됨 (클라우드 DB 활성)
                        </span>
                      ) : (
                        <span className="text-amber-500 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> 인증 대기 (가져오실 키 입력 대기 중)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Gemini AI Studio:</span>
                      {healthStatus.geminiConfigured ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> API Key 활성화됨
                        </span>
                      ) : (
                        <span className="text-rose-500 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> 키 필요
                        </span>
                      )}
                    </div>
                    {healthStatus.error && !healthStatus.firebaseConnected && (
                      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px]">
                        ℹ️ 현재 로컬 DB(LocalStorage)로 안전하게 저장 중입니다. 보내주시는 파이어베이스 키를 넣으면 즉시 클라우드로 동기화됩니다.
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    [연동 상태 확인] 버튼을 누르면 서버의 Firebase DB 및 Gemini 연결 상태를 진단합니다.
                  </p>
                )}
              </div>
            </div>

            {/* AI Studio & Model Settings */}
            <div className={`rounded-2xl p-6 shadow-sm flex flex-col gap-6 border transition-colors ${
              isLight
                ? 'bg-white border-slate-200/90'
                : 'bg-slate-900 border-slate-800 shadow-lg'
            }`}>
              <div>
                <h3 className={`text-xl font-bold flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <Settings className="w-5 h-5 text-indigo-500" />
                  <span>Gemini AI 학습 모델 구성</span>
                </h3>
                <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  구글 AI 스튜디오 API 및 맞춤형 채점 설정을 구성합니다.
                </p>
              </div>

              {/* API Key Input */}
              <div className="space-y-2">
                <label className={`block text-xs sm:text-sm font-semibold ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}>
                  개인 Gemini API Key (선택사항)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => saveSettings(e.target.value, preferredModel, targetBand)}
                  placeholder="미입력 시 서버에 기본 탑재된 GEMINI_API_KEY를 자동 사용합니다"
                  className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-indigo-500'
                  }`}
                />
                <p className="text-[11px] text-slate-500">
                  * 키를 입력하시면 브라우저 로컬 스토리지에만 안전하게 보관되며, 본인의 Google AI Studio 할당량을 직접 사용합니다.
                </p>
              </div>

              {/* Model Choice */}
              <div className="space-y-2">
                <label className={`block text-xs sm:text-sm font-semibold ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}>
                  Gemini 모델 선택
                </label>
                <select
                  value={preferredModel}
                  onChange={(e) => saveSettings(apiKey, e.target.value, targetBand)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500'
                  }`}
                >
                  <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (가장 빠름 · 최신 권장)</option>
                  <option value="gemini-flash-latest">gemini-flash-latest (최신 플래시)</option>
                  <option value="gemini-3.8-flash">gemini-3.8-flash (고성능 플래시)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (최고 추론 품질)</option>
                </select>
              </div>

              {/* Target Band Score */}
              <div className="space-y-2">
                <label className={`block text-xs sm:text-sm font-semibold ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}>
                  목표 Band Score
                </label>
                <select
                  value={targetBand}
                  onChange={(e) => saveSettings(apiKey, preferredModel, e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500'
                  }`}
                >
                  <option value="6.5">Band 6.5 (해외 대학 입학 기준)</option>
                  <option value="7.0">Band 7.0 (명문대 / 이민 기준)</option>
                  <option value="7.5">Band 7.5 (의약학 / 로스쿨 기준)</option>
                  <option value="8.0">Band 8.0+ (최상위권 전문가)</option>
                </select>
              </div>

              <div className={`pt-4 border-t flex justify-end ${
                isLight ? 'border-slate-200' : 'border-slate-800'
              }`}>
                <button
                  onClick={() => alert('설정이 안전하게 저장되었습니다.')}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20"
                >
                  저장 완료
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Cloud Sync Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 border ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  어느 기기에서나 이어 연습하기
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  회원가입 없이 고유 식별 코드로 데이터를 동기화합니다.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  내 동기화 코드 (User Code)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempUserId}
                    onChange={(e) => setTempUserId(e.target.value)}
                    placeholder="예: jun"
                    className={`flex-1 rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none border ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500'
                        : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    onClick={() => handleApplyUserId(tempUserId)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    불러오기
                  </button>
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}>
                <div className="font-semibold text-indigo-500 flex items-center gap-1">
                  💡 사용 팁
                </div>
                <div>1. 다른 PC나 노트북에서 이 사이트를 켭니다.</div>
                <div>2. 이 모달에서 동일한 코드(예: <strong>{userId}</strong>)를 입력하고 불러오기를 누르면 끝!</div>
                <div>3. 친구나 다른 사람이 쓸 땐 다른 이름(예: <strong>alex</strong>)을 쓰면 서로의 기록이 분리됩니다.</div>
              </div>

              {syncMessage && (
                <div className="text-xs text-emerald-600 font-medium">
                  ✓ {syncMessage}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => syncAllLocalToCloud(userId)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>내 기기 기록 올리기</span>
              </button>
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Topic Modal */}
      {isCustomTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-lg w-full p-6 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 border ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>직접 주제(Prompt) 입력하기</h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              풀고 싶은 학원 교재나 인터넷 기출문제를 그대로 붙여넣어 연습해보세요.
            </p>

            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  제목 (선택)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="예: Education and Technology"
                  className={`w-full rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-500 border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  지문 / 프롬프트 전문 (필수)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Some people think that... To what extent do you agree or disagree?"
                  rows={4}
                  className={`w-full rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 resize-none font-serif border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCustomTopicModalOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs transition-colors ${
                  isLight
                    ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                취소
              </button>
              <button
                onClick={handleSaveCustomTopic}
                disabled={!customPrompt.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-40 shadow-md shadow-indigo-600/20"
              >
                이 주제로 연습 시작
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
