import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-20 border-t border-slate-200 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="group">
            <span className="text-xl font-syne font-light tracking-[0.2em] text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">
              Jun's Blog
            </span>
          </Link>
        </div>
        <p className="text-slate-500 text-sm mb-8">
          &copy; 2026 Jun's Blog. 끄적이는 공간.
        </p>

        {/* Navigation Links */}
        <div className="flex justify-center space-x-10 mb-10">
          <Link href="/" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
            글 목록
          </Link>
        </div>

        <div className="flex justify-center space-x-6 text-slate-400">
          <a href="#" className="hover:text-slate-600 transition-colors font-medium">Twitter</a>
          <a href="#" className="hover:text-slate-600 transition-colors font-medium">GitHub</a>
          <a href="#" className="hover:text-slate-600 transition-colors font-medium">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
