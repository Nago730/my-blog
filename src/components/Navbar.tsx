import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">내 블로그</span>
          </Link>
          <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">홈</Link>
            <Link href="/articles" className="hover:text-indigo-600 transition-colors">글 목록</Link>
            <Link href="/projects" className="hover:text-indigo-600 transition-colors">프로젝트</Link>
            <Link href="/about" className="hover:text-indigo-600 transition-colors">소개</Link>
          </div>
          <div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-indigo-200">
              구독하기
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
