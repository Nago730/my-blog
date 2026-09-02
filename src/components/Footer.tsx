export default function Footer() {
  return (
    <footer className="py-12 border-t border-slate-200 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-slate-500 text-sm mb-4">
          &copy; 2026 My Space. All rights reserved.
        </p>

        <div className="flex justify-center space-x-6 text-slate-400">
          <a href="https://github.com/Nago730" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors font-medium">GitHub</a>
        </div>
      </div>
    </footer>
  );
}

