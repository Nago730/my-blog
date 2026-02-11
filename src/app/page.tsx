export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lc:\Users\jqk17\OneDrive\바탕 화면\ssakda\next.config.tsg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold tracking-tight">MyBlog</span>
            </div>
            <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
              <a href="#" className="hover:text-indigo-600 transition-colors">Home</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Articles</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Projects</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">About</a>
            </div>
            <div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-indigo-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6">
            Welcome to my digital space
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Sharing stories, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">code</span> & life.
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            A place where I explore the boundaries of web development and share my journey through the world of technology.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 transition-all transform hover:-translate-y-1">
              Read Latest
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-semibold hover:bg-slate-50 transition-all">
              View Projects
            </button>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Articles</h2>
              <p className="text-slate-500">Selected writings on design and development.</p>
            </div>
            <a href="#" className="text-indigo-600 font-semibold hover:underline decoration-2 underline-offset-4">
              View all articles →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-slate-100 mb-6 transition-transform transform group-hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-full">
                      Development
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium mb-3">
                  <span>Feb 11, 2026</span>
                  <span>•</span>
                  <span>10 min read</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                  Exploring the Future of Web Development with AI Agents
                </h3>
                <p className="text-slate-600 line-clamp-2">
                  How AI agents like Antigravity are changing the way we build and maintain code...
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="text-lg font-bold tracking-tight">MyBlog</span>
          </div>
          <p className="text-slate-500 text-sm mb-8">
            &copy; 2026 MyBlog by Nago730. Built with Next.js and Tailwind CSS.
          </p>
          <div className="flex justify-center space-x-6 text-slate-400">
            <a href="#" className="hover:text-slate-600 transition-colors font-medium">Twitter</a>
            <a href="#" className="hover:text-slate-600 transition-colors font-medium">GitHub</a>
            <a href="#" className="hover:text-slate-600 transition-colors font-medium">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
