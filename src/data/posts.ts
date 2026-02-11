export interface Post {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readTime: string;
  image?: string;
}

export const mockPosts: Post[] = [
  {
    id: "1",
    title: "AI 에이전트와 함께하는 웹 개발의 미래 탐색",
    description: "Antigravity와 같은 AI 에이전트가 우리가 코드를 작성하고 유지보수하는 방식을 어떻게 바꾸고 있는지 깊이 있게 살펴봅니다.",
    date: "2026-02-11",
    category: "개발",
    readTime: "10분 읽기",
  },
  {
    id: "2",
    title: "Next.js 15와 Tailwind CSS로 만드는 프리미엄 블로그",
    description: "최신 프레임워크와 스타일링 도구를 활용하여 수준 높은 사용자 경험을 제공하는 웹사이트를 구축하는 단계별 가이드입니다.",
    date: "2026-02-10",
    category: "디자인",
    readTime: "8분 읽기",
  },
  {
    id: "3",
    title: "현대적인 웹 디자인의 트렌드: 글래스모피즘과 애니메이션",
    description: "시각적으로 매력적이고 인터랙티브한 인터페이스를 만들기 위한 최신 디자인 패턴과 구현 기법들을 소개합니다.",
    date: "2026-02-09",
    category: "디자인",
    readTime: "12분 읽기",
  },
  {
    id: "4",
    title: "효율적인 상태 관리를 위한 React Query 활용법",
    description: "서버 상태를 관리하고 캐싱하여 성능을 최적화하는 최선의 방법들을 예제와 함께 알아봅니다.",
    date: "2026-02-08",
    category: "개발",
    readTime: "15분 읽기",
  },
  {
    id: "5",
    title: "개발자를 위한 커리어 성장 가이드",
    description: "단순한 코딩 실력을 넘어, 팀 내에서의 영향력을 키우고 지속 가능한 성장을 이루는 방법에 대해 이야기합니다.",
    date: "2026-02-07",
    category: "커리어",
    readTime: "7분 읽기",
  },
];
