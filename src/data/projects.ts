export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  github?: string;
  image?: string;
  featured: boolean;
}

export const mockProjects: Project[] = [
  {
    id: "1",
    title: "AI 블로그 에디터",
    description: "AI를 사용하여 글의 초안을 작성하고 최적화해주는 지능형 웹 에디터입니다.",
    tags: ["Next.js", "OpenAI", "Tailwind CSS"],
    link: "#",
    github: "https://github.com",
    featured: true,
  },
  {
    id: "2",
    title: "3D 포트폴리오 쇼케이스",
    description: "Three.js를 활용하여 개발자의 결과물을 입체적으로 보여주는 대화형 포트폴리오 사이트입니다.",
    tags: ["React", "Three.js", "Framer Motion"],
    link: "#",
    github: "https://github.com",
    featured: true,
  },
  {
    id: "3",
    title: "실시간 협업 도구",
    description: "여러 사용자가 동시에 문서를 편집하고 소통할 수 있는 실시간 생산성 플랫폼입니다.",
    tags: ["TypeScript", "Socket.io", "Express"],
    link: "#",
    featured: false,
  },
  {
    id: "4",
    title: "스마트 가계부 앱",
    description: "지출 내역을 자동으로 분류하고 시각화하여 개인의 소비 습관을 분석해주는 애플리케이션입니다.",
    tags: ["React Native", "Firebase", "D3.js"],
    link: "#",
    featured: false,
  },
];
