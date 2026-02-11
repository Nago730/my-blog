import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="relative">
        <h1 className="text-[12rem] font-black text-slate-50 leading-none select-none">
          404
        </h1>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">길을 잃으셨나요?</h2>
          <p className="text-slate-500 max-w-xs mx-auto mb-8 leading-relaxed">
            요청하신 페이지를 찾을 수 없거나, 접근할 수 있는 권한이 없습니다. 상실감을 뒤로하고 다시 돌아가 볼까요?
          </p>
          <Link
            href="/"
            className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
          >
            🏠 홈으로 돌아가기
          </Link>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="mt-12 flex items-center space-x-2 text-slate-300">
        <div className="w-12 h-px bg-slate-100"></div>
        <span className="text-[10px] font-mono tracking-widest uppercase">My Blog Security System</span>
        <div className="w-12 h-px bg-slate-100"></div>
      </div>
    </main>
  );
}
