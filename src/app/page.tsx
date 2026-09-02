import { Metadata } from "next";
import Link from "next/link";
import { Calendar, BookOpen, CheckSquare, Image as ImageIcon, Scale, BookMarked, ArrowRight } from "lucide-react";

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
      href: "/schedule",
      icon: Calendar,
      gradient: "from-blue-500 to-indigo-600",
      status: "이용 가능",
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
    <div className="min-h-screen bg-slate-50 pt-24 sm:pt-32 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 px-2">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-snug sm:leading-tight">
            &quot;나 자신을 구원할 수 있는 건 나 자신 뿐이다&quot;
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {modules.map((mod, idx) => {
            const IconComponent = mod.icon;
            const isAvailable = Boolean(mod.href);

            const CardContent = (
              <div
                className={`bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border transition-all flex flex-col justify-between relative overflow-hidden group h-full ${
                  isAvailable
                    ? "border-indigo-200 shadow-md hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer ring-1 ring-indigo-100 active:scale-[0.99]"
                    : "border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1"
                }`}
              >
                <div>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center text-white shadow-md mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">{mod.title}</h3>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        isAvailable
                          ? "bg-indigo-100 text-indigo-700 font-extrabold"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {mod.status}
                    </span>
                  </div>
                </div>

                <div className="pt-3.5 sm:pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className={isAvailable ? "text-indigo-600 font-bold" : "text-slate-400"}>
                    {isAvailable ? "바로가기" : "기능 추가 예정"}
                  </span>
                  {isAvailable && <ArrowRight size={14} className="text-indigo-600 group-hover:translate-x-1 transition-transform" />}
                </div>
              </div>
            );

            if (mod.href) {
              return (
                <Link key={idx} href={mod.href} className="block h-full">
                  {CardContent}
                </Link>
              );
            }

            return <div key={idx} className="h-full">{CardContent}</div>;
          })}
        </div>
      </div>
    </div>
  );
}

