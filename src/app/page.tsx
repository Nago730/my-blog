import { Metadata } from "next";
import { Calendar, BookOpen, CheckSquare, Image as ImageIcon, Scale, BookMarked } from "lucide-react";

export const metadata: Metadata = {
  title: "My Space | 개인 워크스페이스",
  description: "일정 관리, 영어 공부, 버킷리스트, 추억 저장, 영향력 관리, 독서감상문 등 다양한 기능을 담은 개인 웹사이트입니다.",
  alternates: {
    canonical: `/`,
  },
};

export default function Home() {
  const modules = [
    {
      title: "일정 관리",
      icon: Calendar,
      gradient: "from-blue-500 to-indigo-600",
      status: "준비 중",
    },
    {
      title: "영어 공부",
      icon: BookOpen,
      gradient: "from-emerald-500 to-teal-600",
      status: "준비 중",
    },
    {
      title: "버킷리스트",
      icon: CheckSquare,
      gradient: "from-purple-500 to-pink-600",
      status: "준비 중",
    },
    {
      title: "추억 저장소",
      icon: ImageIcon,
      gradient: "from-amber-500 to-orange-600",
      status: "준비 중",
    },
    {
      title: "영향력 관리",
      icon: Scale,
      gradient: "from-rose-500 to-pink-600",
      status: "준비 중",
    },
    {
      title: "독서감상문",
      icon: BookMarked,
      gradient: "from-violet-500 to-purple-600",
      status: "준비 중",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            &quot;나 자신을 구원할 수 있는 건 나 자신 뿐이다&quot;
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, idx) => {
            const IconComponent = mod.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden group"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center text-white shadow-md mb-6 group-hover:scale-110 transition-transform`}>
                    <IconComponent size={28} />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{mod.title}</h3>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 rounded-full">
                      {mod.status}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center text-slate-400 text-xs font-semibold">
                  <span>기능 추가 예정</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

