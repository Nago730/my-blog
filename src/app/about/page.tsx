import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100">

      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">안녕하세요, <br /><span className="text-indigo-600">성장하는 개발자</span>입니다.</h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              복잡한 문제를 단순하고 아름다운 코드로 해결하는 것을 즐깁니다. <br />
              사용자 경험을 최우선으로 생각하며, 최신 기술을 활용해 가치를 창출합니다.
            </p>
          </div>

          {/* Profile Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-indigo-100 to-violet-100 overflow-hidden shadow-2xl shadow-indigo-100/50">
              <div className="absolute inset-0 flex items-center justify-center text-8xl">
                👨‍💻
              </div>
              {/* 여기에 나중에 실제 이미지를 넣을 수 있습니다 */}
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-6">저의 이야기</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  어릴 적부터 무언가를 만드는 것을 좋아했습니다. 레고에서 시작된 창작의 즐거움은 이제 코드를 통한 논리적인 설계로 이어졌습니다.
                </p>
                <p>
                  단순히 기능이 작동하는 것을 넘어, 코드가 얼마나 견고하고 유지보수하기 쉬운지, 그리고 사용자에게 얼마나 직관적인 경험을 주는지를 고민합니다.
                </p>
                <p>
                  현재는 프론트엔드 기술을 중심으로 풀스택 개발 역량을 쌓아가고 있으며, AI와 웹 기술의 융합에 깊은 관심을 가지고 연구하고 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-10 text-center">보유 기술</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "TypeScript"] },
                { name: "Backend", items: ["Node.js", "Express", "PostgreSQL", "Firebase"] },
                { name: "Tools", items: ["Git", "Docker", "Figma", "VS Code"] },
                { name: "Interests", items: ["AI Agents", "WebXR", "Performance", "UI/UX"] }
              ].map((category) => (
                <div key={category.name} className="p-6 bg-white rounded-3xl border border-slate-200">
                  <h3 className="font-bold text-indigo-600 mb-4">{category.name}</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {category.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-center text-white">
            <h2 className="text-3xl font-bold mb-6">함께 성장하고 싶으신가요?</h2>
            <p className="text-slate-400 mb-10 max-w-xl mx-auto italic">
              "혼자 가면 빨리 가지만, 함께 가면 멀리 간다"는 말을 믿습니다.
              협업 제안이나 질문은 언제든 환영입니다.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:example@email.com" className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-colors">
                이메일 보내기
              </a>
              <a href="#" className="px-8 py-3 bg-slate-800 text-white border border-slate-700 rounded-2xl font-bold hover:bg-slate-700 transition-colors">
                링크드인 방문
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            &copy; 2026 MyBlog by Nago730. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
